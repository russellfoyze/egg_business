import { CONFIG } from "./config";

let cachedAccessToken: string | null = null;
let tokenExpiryTime: number = 0;

// Base64URL encoder
function base64UrlEncode(str: string): string {
  let base64 = "";
  if (typeof Buffer !== "undefined") {
    base64 = Buffer.from(str, "utf8").toString("base64");
  } else if (typeof btoa !== "undefined") {
    base64 = btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))));
  }
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Generate Google Service Account Access Token directly via JWT
export async function getDirectAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedAccessToken && tokenExpiryTime > now + 60) {
    return cachedAccessToken;
  }

  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const claimSet = {
    iss: CONFIG.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedClaimSet = base64UrlEncode(JSON.stringify(claimSet));
  const unsignedToken = `${encodedHeader}.${encodedClaimSet}`;

  // Sign using crypto (supported natively in Node and React Native polyfills)
  let signature = "";
  try {
    const crypto = require("crypto");
    const sign = crypto.createSign("RSA-SHA256");
    sign.update(unsignedToken);
    const signBuffer = sign.sign(CONFIG.GOOGLE_PRIVATE_KEY);
    signature = signBuffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  } catch (err) {
    console.error("Crypto signing error:", err);
    throw new Error("Cannot sign JWT for Google Sheets without crypto module.");
  }

  const jwt = `${unsignedToken}.${signature}`;

  // Exchange JWT for OAuth2 Access Token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error(`Failed to obtain Google Sheets access token: ${JSON.stringify(tokenData)}`);
  }

  cachedAccessToken = tokenData.access_token;
  tokenExpiryTime = now + (tokenData.expires_in || 3600);
  return cachedAccessToken;
}

// Low-level Sheets API fetcher
export async function sheetsApiGet(range: string): Promise<any[][]> {
  const token = await getDirectAccessToken();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.GOOGLE_SHEET_ID}/values/${encodeURIComponent(range)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.values || [];
}

export async function sheetsApiAppend(range: string, values: any[][]): Promise<boolean> {
  const token = await getDirectAccessToken();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.GOOGLE_SHEET_ID}/values/${encodeURIComponent(range)}:append?valueInputOption=RAW`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values }),
  });
  const data = await res.json();
  return !!data.updates;
}

export async function sheetsApiUpdate(range: string, values: any[][]): Promise<boolean> {
  const token = await getDirectAccessToken();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.GOOGLE_SHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=RAW`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values }),
  });
  const data = await res.json();
  return !!data.updatedCells;
}

// -------------------------------------------------------------
// High-Level Business Services matching the Web App
// -------------------------------------------------------------

export interface MobileOverheadItem {
  id: string;
  date: string;
  month: string;
  category: string;
  title: string;
  amount: number;
  paymentMode: "cash" | "mfs" | "bank" | "savings_shop" | "savings_bank";
  notes?: string;
  createdAt?: string;
}

export interface MobileFinancials {
  date: string;
  day: string;
  pageNo: string;
  totalDue: number;
  extraDue: number;
  totalCash: number;
  prevDayBalance: number;
  providerDueMoney: number;
}

export interface MobileStockItem {
  name: string;
  rate: number;
  piece: number;
  amount: number;
  soldPiece?: number;
}

// 1. Fetch Overhead Expenses with Auto-Sync for Samity (> 0)
export async function fetchMobileOverheadExpenses(): Promise<{
  items: MobileOverheadItem[];
  latestShopCash: number;
  latestShopCashDate: string;
}> {
  const rows = await sheetsApiGet("OverheadExpenses!A2:I");
  let items: MobileOverheadItem[] = rows
    .map((r: any[]) => ({
      id: r[0] || "",
      date: r[1] || "",
      month: r[2] || (r[1] ? r[1].slice(0, 7) : ""),
      category: r[3] || "extra",
      title: r[4] || "",
      amount: Number(r[5]) || 0,
      paymentMode: (r[6] as any) || "cash",
      notes: r[7] || "",
      createdAt: r[8] || "",
    }))
    .filter((it) => it.id && it.amount > 0);

  // Auto-sync samity from Expenses tab
  try {
    const expRows = await sheetsApiGet("Expenses!A2:E");
    const samityByDate = new Map<string, number>();
    expRows.forEach((r: any[]) => {
      const d = r[0];
      const type = r[3];
      const rawAmt = r[4];
      if (!rawAmt || rawAmt === "0") return;
      const amt = Number(String(rawAmt).replace(/,/g, "")) || 0;
      if (d && (type === "সমিতি" || String(type).includes("সমিতি")) && amt > 0) {
        samityByDate.set(d, amt);
      }
    });

    for (const [sDate, sAmt] of samityByDate.entries()) {
      if (sAmt <= 0) continue;
      const existingIdx = items.findIndex((it) => it.category === "savings_shop" && it.date === sDate);
      if (existingIdx >= 0) {
        items[existingIdx].amount = sAmt;
      } else {
        items.push({
          id: `exp-sheet-${sDate}`,
          date: sDate,
          month: sDate.slice(0, 7),
          category: "savings_shop",
          title: "সমিতি === দোকানে সঞ্চয়",
          amount: sAmt,
          paymentMode: "cash",
          notes: "দৈনিক হালখাতা ডাটা শিট হতে স্বয়ংক্রিয় সিঙ্ক",
          createdAt: new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    console.warn("Could not sync samity from Expenses tab:", err);
  }

  // Deduplicate and filter out non-positive entries
  const seenShopDates = new Set<string>();
  const deduplicated: MobileOverheadItem[] = [];
  for (const it of items) {
    if (!it.amount || it.amount <= 0) continue;
    if (it.category === "savings_shop") {
      if (!seenShopDates.has(it.date)) {
        seenShopDates.add(it.date);
        deduplicated.push(it);
      }
    } else {
      deduplicated.push(it);
    }
  }

  // Fetch latest cash in hand from Financials sheet
  let latestShopCash = 0;
  let latestShopCashDate = "";
  try {
    const finRows = await sheetsApiGet("Financials!A2:F");
    const validFin = finRows.filter((r) => r && r[0]);
    if (validFin.length > 0) {
      validFin.sort((a, b) => String(b[0]).localeCompare(String(a[0])));
      latestShopCashDate = validFin[0][0] || "";
      latestShopCash = Number(String(validFin[0][5]).replace(/,/g, "")) || 0;
    }
  } catch (finErr) {
    console.warn("Could not load latest shop cash from Financials:", finErr);
  }

  // Sort descending by date
  deduplicated.sort((a, b) => b.date.localeCompare(a.date));

  return {
    items: deduplicated,
    latestShopCash,
    latestShopCashDate,
  };
}

// 2. Add New Overhead Expense directly to Google Sheets
export async function addMobileOverheadExpense(item: MobileOverheadItem): Promise<boolean> {
  const row = [
    item.id || `exp-${Date.now()}`,
    item.date,
    item.month || item.date.slice(0, 7),
    item.category,
    item.title,
    item.amount,
    item.paymentMode || "cash",
    item.notes || "",
    item.createdAt || new Date().toISOString(),
  ];
  return await sheetsApiAppend("OverheadExpenses!A:I", [row]);
}

// 3. Fetch Daily Stock and Financials for Hal Khata
export async function fetchMobileHalKhataData(targetDate: string): Promise<{
  financials: MobileFinancials;
  stock: MobileStockItem[];
}> {
  let financials: MobileFinancials = {
    date: targetDate,
    day: "",
    pageNo: "",
    totalDue: 0,
    extraDue: 0,
    totalCash: 0,
    prevDayBalance: 0,
    providerDueMoney: 0,
  };
  let stock: MobileStockItem[] = [];

  try {
    const finRows = await sheetsApiGet("Financials!A2:K");
    const matchedFin = finRows.find((r) => r && r[0] === targetDate);
    if (matchedFin) {
      financials = {
        date: targetDate,
        day: matchedFin[1] || "",
        pageNo: matchedFin[2] || "",
        totalDue: Number(matchedFin[3]) || 0,
        extraDue: Number(matchedFin[4]) || 0,
        totalCash: Number(matchedFin[5]) || 0,
        prevDayBalance: Number(matchedFin[6]) || 0,
        providerDueMoney: Number(matchedFin[10]) || 0,
      };
    }

    const stockRows = await sheetsApiGet("DailyStock!A2:H");
    stock = stockRows
      .filter((r) => r && r[0] === targetDate)
      .map((r) => ({
        name: r[3] || "ডিম",
        rate: Number(r[4]) || 0,
        piece: Number(r[5]) || 0,
        amount: Number(r[6]) || 0,
        soldPiece: Number(r[7]) || 0,
      }));
  } catch (err) {
    console.warn(`Could not load Hal Khata for ${targetDate}:`, err);
  }

  return { financials, stock };
}
