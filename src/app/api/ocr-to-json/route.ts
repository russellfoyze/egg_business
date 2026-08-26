import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `You are a high-precision OCR Data Extraction AI specializing in Bengali handwritten Wholesale Egg Ledger notebook pages ("দৈনিক হালখাতা").

Read the handwritten text, numbers, and tables from the ledger image with 100% mathematical accuracy.

### 📐 LEDGER STRUCTURE & SECTIONS IN THE NOTEBOOK:
1. **TOP HEADER**:
   - Date: e.g. "তারিখ: 25/08/26" or "25/08/2026" -> convert to ISO format "2026-08-25"
   - Day: e.g. "রোজ: মঙ্গলবার", "সোমবার", "রবিবার"
   - Page No: e.g. "# পৃষ্ঠা: 98" or "98"

2. **SECTION 1: মজুদ ডিমের মূল্য (Stock Valuation Table - Top Left)**:
   Extract each of the 6 standard egg categories with exact Quantity (পরিমাণ) and Purchase Rate (দর):
   - সাদা (White Egg)
   - লাল (Red Egg)
   - হাঁস (Duck Egg)
   - মুরগী (Chicken Egg)
   - কোয়েল (Quail Egg)
   - L.M
   Note: If a row has quantity 0 or is empty, set currentStock: 0.

3. **SECTION 2: খাত / পাওনা আদায় (Collections / Receivables - Middle Left)**:
   - বাকি (Customer Due): The main credit due balance amount (e.g. 650556)
   - নগদ (Cash in Hand): The liquid cash in hand amount (e.g. 105290)
   - Extra Collections: Any extra collection items listed under/beside বাকি or নগদ (e.g. "বাকি আদায়", "নগদ আদায়", "কাওসার: 1500", "অন্যান্য আদায়")

4. **SECTION 3: খাত / দেনা ও সাবেক হিসাব (Dues & Opening Balance - Middle Right)**:
   - সাবেক (Previous Day Balance): The opening balance amount (e.g. 872795)
   - Extra Dues: All other dues / debts listed below সাবেক, with quantity and rate if specified (e.g. "ভাঙ্গিনা: 400", "কো (490 x 3): 1470", "md ali (3600 x 10.8): 38880")

5. **SECTION 4: দৈনিক খরচ (Daily Expenses - Bottom Left)**:
   - List all expense rows (e.g. "নাস্তা-চা", "গাড়ির রং", "কো", "মোঃ আলি", "গাড়ির তেল", "ভাঙ্গা", "ট্রে-ফের", "নিজ").
   - For broken egg expenses ("ভাঙ্গা"), extract the egg quantity (e.g. 25 or 20) into wastedEggQty and the amount into wastedEggCost and amount.

### 🎯 REQUIRED JSON OUTPUT SCHEMA:
{
  "date": "YYYY-MM-DD",
  "day": "Bengali Day Name",
  "pageNo": "Page number string",
  "stockEntries": [
    { "eggType": "সাদা (White Egg)", "currentStock": 2092, "purchaseRate": 10.8, "hasPurchase": false, "purchaseQty": 0 },
    { "eggType": "লাল (Red Egg)", "currentStock": 4438, "purchaseRate": 11.25, "hasPurchase": false, "purchaseQty": 0 },
    { "eggType": "হাঁস (Duck Egg)", "currentStock": 164, "purchaseRate": 17.0, "hasPurchase": false, "purchaseQty": 0 },
    { "eggType": "মুরগী (Chicken Egg)", "currentStock": 0, "purchaseRate": 15.0, "hasPurchase": false, "purchaseQty": 0 },
    { "eggType": "কোয়েল (Quail Egg)", "currentStock": 350, "purchaseRate": 3.0, "hasPurchase": false, "purchaseQty": 0 },
    { "eggType": "L.M", "currentStock": 0, "purchaseRate": 8.5, "hasPurchase": false, "purchaseQty": 0 }
  ],
  "financialEntry": {
    "prevDayBalance": 872795,
    "totalDue": 650556,
    "totalCash": 105290,
    "extraDue": 0,
    "providerName": "",
    "providerPhone": "",
    "providerEggType": "",
    "providerDueMoney": 0,
    "providerUnitPrice": 0
  },
  "extraDueList": [
    { "label": "ভাঙ্গিনা", "amount": 400 },
    { "label": "কো (490 x 3)", "qty": 490, "unitPrice": 3.0, "amount": 1470 }
  ],
  "extraCollectionList": [
    { "label": "বাকি আদায়", "amount": 350 },
    { "label": "নগদ আদায়", "amount": 290 },
    { "label": "কাওসার", "amount": 1500 },
    { "label": "অন্যান্য আদায়", "amount": 150 }
  ],
  "expensesList": [
    { "expenseType": "নাস্তা-চা", "amount": 400, "wastedEggQty": 0, "wastedEggCost": 0 },
    { "expenseType": "ভাঙ্গা", "amount": 270, "wastedEggQty": 25, "wastedEggCost": 270 }
  ]
}

Return ONLY clean, valid JSON without backticks, markdown, or explanation text.`;

// Helper to sanitize and normalize extracted data
function sanitizeAndVerifyLedgerData(data: any): any {
  if (!data || typeof data !== "object") return data;

  // 1. Normalize Date format (DD/MM/YYYY or DD-MM-YY -> YYYY-MM-DD)
  let normDate = String(data.date || "").trim();
  if (normDate.includes("/") || (normDate.includes("-") && normDate.split("-")[0].length < 4)) {
    const parts = normDate.split(/[/.-]/);
    if (parts.length === 3) {
      let d = parts[0].padStart(2, "0");
      let m = parts[1].padStart(2, "0");
      let y = parts[2];
      if (y.length === 2) y = "20" + y;
      normDate = `${y}-${m}-${d}`;
    }
  }

  // 2. Ensure all standard egg types are represented
  const STANDARD_TYPES = [
    "সাদা (White Egg)",
    "লাল (Red Egg)",
    "হাঁস (Duck Egg)",
    "মুরগী (Chicken Egg)",
    "কোয়েল (Quail Egg)",
    "L.M",
  ];

  const stockEntries = STANDARD_TYPES.map((type) => {
    const found = Array.isArray(data.stockEntries)
      ? data.stockEntries.find((s: any) => s.eggType && (s.eggType.includes(type.split(" ")[0]) || type.includes(s.eggType)))
      : null;

    return {
      eggType: type,
      currentStock: Number(found?.currentStock) || 0,
      purchaseRate: Number(found?.purchaseRate) || (type.includes("সাদা") ? 10.8 : type.includes("লাল") ? 11.25 : type.includes("হাঁস") ? 17 : type.includes("মুরগী") ? 15 : type.includes("কোয়েল") ? 3 : 8.5),
      hasPurchase: Boolean(found?.hasPurchase),
      purchaseQty: Number(found?.purchaseQty) || 0,
    };
  });

  // 3. Sanitize Financial Entry
  const fin = data.financialEntry || {};
  const prevDayBalance = Number(fin.prevDayBalance) || 0;
  const totalDue = Number(fin.totalDue) || 0;
  const totalCash = Number(fin.totalCash) || 0;

  // 4. Sanitize Extra Dues
  const extraDueList = Array.isArray(data.extraDueList)
    ? data.extraDueList
        .filter((d: any) => d && (d.label || d.amount > 0 || d.qty > 0))
        .map((d: any) => {
          const qty = Number(d.qty) || 0;
          const unitPrice = Number(d.unitPrice) || 0;
          let amount = Number(d.amount) || 0;
          if (amount === 0 && qty > 0 && unitPrice > 0) {
            amount = Number((qty * unitPrice).toFixed(2));
          }
          return {
            label: String(d.label || "").trim(),
            qty,
            unitPrice,
            amount,
          };
        })
    : [];

  // 5. Sanitize Extra Collections
  const extraCollectionList = Array.isArray(data.extraCollectionList)
    ? data.extraCollectionList
        .filter((c: any) => c && (c.label || c.amount > 0))
        .map((c: any) => ({
          label: String(c.label || "").trim(),
          amount: Number(c.amount) || 0,
        }))
    : [];

  // 6. Sanitize Expenses
  const expensesList = Array.isArray(data.expensesList)
    ? data.expensesList
        .filter((e: any) => e && (e.expenseType || e.amount > 0))
        .map((e: any) => {
          const amount = Number(e.amount) || 0;
          const wastedEggQty = Number(e.wastedEggQty) || 0;
          const wastedEggCost = Number(e.wastedEggCost) || (wastedEggQty > 0 ? amount : 0);
          return {
            expenseType: String(e.expenseType || "অন্যান্য").trim(),
            amount,
            wastedEggQty,
            wastedEggCost,
          };
        })
    : [];

  return {
    date: normDate,
    day: String(data.day || "").trim(),
    pageNo: String(data.pageNo || "").trim(),
    stockEntries,
    financialEntry: {
      prevDayBalance,
      totalDue,
      totalCash,
      extraDue: extraCollectionList.reduce((s: number, c: { label: string; amount: number }) => s + (c.amount || 0), 0),
      providerName: fin.providerName || "",
      providerPhone: fin.providerPhone || "",
      providerEggType: fin.providerEggType || "",
      providerDueMoney: Number(fin.providerDueMoney) || 0,
      providerUnitPrice: Number(fin.providerUnitPrice) || 0,
    },
    extraDueList,
    extraCollectionList,
    expensesList,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType, apiKey } = await req.json();

    const geminiKey = apiKey?.trim() || process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

    if (!imageBase64) {
      return NextResponse.json({ success: false, error: "কোনো ছবি পাওয়া যায়নি।" }, { status: 400 });
    }

    if (!geminiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Gemini API Key পাওয়া যায়নি। অনুগ্রহ করে আপনার ফ্রি Gemini API Key প্রদান করুন।",
          requiresApiKey: true,
        },
        { status: 400 }
      );
    }

    const cleanBase64 = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
    const finalMimeType = mimeType || "image/jpeg";

    const body = {
      contents: [
        {
          parts: [
            { text: SYSTEM_PROMPT },
            {
              inline_data: {
                mime_type: finalMimeType,
                data: cleanBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        response_mime_type: "application/json",
      },
    };

    // Modern Gemini Vision models with fallback
    const candidateModels = [
      "gemini-3.6-flash",
      "gemini-3.5-flash",
      "gemini-flash-latest",
      "gemini-3.1-flash-lite",
    ];

    let lastError: any = null;
    let resJson: any = null;

    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (response.ok) {
          resJson = await response.json();
          break;
        } else {
          const errData = await response.json().catch(() => ({}));
          lastError = errData.error?.message || `HTTP ${response.status}`;
        }
      } catch (err: any) {
        lastError = err.message;
      }
    }

    if (!resJson) {
      return NextResponse.json(
        {
          success: false,
          error: `Gemini API ত্রুটি: ${lastError}। আপনি "প্রম্পট কপি & Gemini খুলুন ↗" বাটনে ক্লিক করে gemini.google.com এ ছবি দিয়েও সরাসরি ১ ক্লিকে JSON বের করতে পারেন।`,
        },
        { status: 400 }
      );
    }

    const rawText = resJson.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let cleaned = rawText.trim();
    if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
    if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
    if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();

    const rawParsed = JSON.parse(cleaned);
    const validatedData = sanitizeAndVerifyLedgerData(rawParsed);

    return NextResponse.json({
      success: true,
      data: validatedData,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to process image OCR" }, { status: 500 });
  }
}
