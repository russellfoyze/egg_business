import { google } from "googleapis";

// Unescape the private key if it has escaped newlines
const getPrivateKey = () => {
  const key = process.env.GOOGLE_PRIVATE_KEY;
  if (!key) return undefined;
  // If it contains escaped newlines, replace them
  return key.replace(/\\n/g, "\n");
};

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const CLIENT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = getPrivateKey();

const REQUIRED_SHEETS = [
  {
    name: "DailyStock",
    headers: [
      "Date",
      "Day",
      "PageNo",
      "EggType",
      "CurrentStock",
      "HasPurchase",
      "PurchaseRate",
      "PurchaseQty",
    ],
  },
  {
    name: "Financials",
    headers: [
      "Date",
      "Day",
      "PageNo",
      "TotalDue",
      "ExtraDue",
      "TotalCash",
      "PrevDayBalance",
      "ProviderName",
      "ProviderPhone",
      "ProviderEggType",
      "ProviderDueMoney",
      "ProviderUnitPrice",
    ],
  },
  {
    name: "Expenses",
    headers: [
      "Date",
      "Day",
      "PageNo",
      "ExpenseType",
      "Amount",
      "WastedEggQty",
      "WastedEggCost",
    ],
  },
  {
    name: "ProviderDues",
    headers: [
      "Date",
      "Day",
      "PageNo",
      "ProviderName",
      "Phone",
      "EggType",
      "UnitPrice",
      "DueMoney",
    ],
  },
  {
    name: "OverheadExpenses",
    headers: [
      "Id",
      "Date",
      "Month",
      "Category",
      "Title",
      "Amount",
      "PaymentMode",
      "Notes",
      "CreatedAt",
    ],
  },
];

let sheetsClient: any = null;

async function getSheetsClient() {
  if (sheetsClient) return sheetsClient;

  if (!SHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
    throw new Error("Google Sheets credentials are not fully configured.");
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: CLIENT_EMAIL,
      private_key: PRIVATE_KEY,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  sheetsClient = google.sheets({ version: "v4", auth });
  return sheetsClient;
}

export async function isGoogleSheetsConfigured(): Promise<boolean> {
  return !!(SHEET_ID && CLIENT_EMAIL && PRIVATE_KEY);
}

export async function initializeSpreadsheet() {
  try {
    const sheets = await getSheetsClient();

    // Get spreadsheet metadata to check existing sheets
    const response = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
    });

    const existingSheetNames =
      response.data.sheets?.map((s: any) => s.properties.title) || [];

    const requests: any[] = [];

    // Check which sheets are missing
    for (const reqSheet of REQUIRED_SHEETS) {
      if (!existingSheetNames.includes(reqSheet.name)) {
        requests.push({
          addSheet: {
            properties: {
              title: reqSheet.name,
            },
          },
        });
      }
    }

    // Execute batch update to create missing sheets
    if (requests.length > 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: { requests },
      });

      // Write headers for newly created sheets
      for (const reqSheet of REQUIRED_SHEETS) {
        if (!existingSheetNames.includes(reqSheet.name)) {
          await sheets.spreadsheets.values.update({
            spreadsheetId: SHEET_ID,
            range: `${reqSheet.name}!A1`,
            valueInputOption: "RAW",
            requestBody: {
              values: [reqSheet.headers],
            },
          });
        }
      }
    }
  } catch (error: any) {
    if (error.message?.includes("does not have permission") || error.code === 403) {
      console.warn("⚠️ Google Sheet permission pending: Please share your spreadsheet with " + CLIENT_EMAIL + " as Editor.");
    } else {
      console.error("Failed to initialize Google Sheets:", error.message || error);
    }
    throw error;
  }
}

export async function readSheetValues(sheetName: string): Promise<any[][]> {
  const sheets = await getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A:Z`,
  });
  return response.data.values || [];
}

export async function updateSheetValues(sheetName: string, rows: any[][]) {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A:Z`,
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A1`,
    valueInputOption: "RAW",
    requestBody: {
      values: rows,
    },
  });
}

export async function appendSheetRows(sheetName: string, rows: any[][]) {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A:A`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: rows,
    },
  });
}

// Clear a range (excluding headers) and rewrite if needed, or update rows
export async function clearSheet(sheetName: string) {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A2:Z`,
  });
}

export async function createOrUpdateDayTab(
  date: string,
  day: string,
  pageNo: string,
  stockEntries: any[],
  financialEntry: any,
  expensesList: any[],
  extraCollectionList: { label: string; amount: number }[] = [],
  extraDueList: { label: string; amount: number }[] = []
) {
  try {
    const sheets = await getSheetsClient();
    if (!sheets) return;

    // Convert date YYYY-MM-DD to DD/MM/YY
    const [yyyy, mm, dd] = date.split("-");
    const tabName = `${dd}/${mm}/${yyyy ? yyyy.slice(2) : "26"}`;

    // Get spreadsheet metadata to check if tab exists
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
    const existingSheets = meta.data.sheets || [];
    const targetSheet = existingSheets.find((s: any) => s.properties.title === tabName);

    if (!targetSheet) {
      // Find Original template sheet to duplicate
      const originalSheet =
        existingSheets.find((s: any) => s.properties.title === "Original") ||
        existingSheets.find((s: any) => s.properties.title === "Sheet2") ||
        existingSheets[0];

      if (originalSheet) {
        const copyRes = await sheets.spreadsheets.sheets.copyTo({
          spreadsheetId: SHEET_ID,
          sheetId: originalSheet.properties.sheetId,
          requestBody: {
            destinationSpreadsheetId: SHEET_ID,
          },
        });

        const newSheetId = copyRes.data.sheetId;

        // Rename the duplicate to targetTabName
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: SHEET_ID,
          requestBody: {
            requests: [
              {
                updateSheetProperties: {
                  properties: {
                    sheetId: newSheetId,
                    title: tabName,
                  },
                  fields: "title",
                },
              },
            ],
          },
        });
      }
    }

    // Prepare calculated values
    const white = stockEntries.find((s) => s.eggType?.includes("সাদা")) || { currentStock: 0, purchaseRate: 10.9 };
    const red = stockEntries.find((s) => s.eggType?.includes("লাল")) || { currentStock: 0, purchaseRate: 11.25 };
    const duck = stockEntries.find((s) => s.eggType?.includes("হাঁস")) || { currentStock: 0, purchaseRate: 17.0 };
    const chicken = stockEntries.find((s) => s.eggType?.includes("মুরগী")) || { currentStock: 0, purchaseRate: 15.0 };
    const quail = stockEntries.find((s) => s.eggType?.includes("কোয়েল")) || { currentStock: 0, purchaseRate: 3.0 };
    const lm = stockEntries.find((s) => s.eggType?.includes("L.M")) || { currentStock: 0, purchaseRate: 8.5 };

    const totalDue = Number(financialEntry.totalDue) || 0;
    const extraDue = Number(financialEntry.extraDue) || 0;
    const totalCash = Number(financialEntry.totalCash) || 0;
    const prevDayBalance = Number(financialEntry.prevDayBalance) || 0;
    const providerDueMoney = Number(financialEntry.providerDueMoney) || 0;

    // Format due labels to include Name, Qty, and Unit Price as a string
    const formatDueLabel = (item: any) => {
      if (!item) return "";
      const name = item.label ? String(item.label).trim() : "";
      const qty = Number(item.qty) || 0;
      const rate = Number(item.unitPrice) || 0;

      if (qty > 0 && rate > 0) {
        return name ? `${name} (${qty} x ${rate})` : `(${qty} x ${rate})`;
      } else if (qty > 0) {
        return name ? `${name} (${qty} টি)` : `(${qty} টি)`;
      } else if (rate > 0) {
        return name ? `${name} (@ ${rate})` : `(@ ${rate})`;
      }
      return name;
    };

    // Filter valid extra items
    const validExtraColls = extraCollectionList.filter((c) => c.label || c.amount > 0);
    const validExtraDues = extraDueList
      .filter((d) => d.label || d.amount > 0 || (d.qty && d.qty > 0))
      .map((d) => ({
        label: formatDueLabel(d),
        amount: d.amount || 0,
      }));

    // Collection (Cols A & B, Rows 16-24)
    const collRows: [string, any][] = [
      ["বাকি", totalDue || ""],
      [validExtraColls[0]?.label || (validExtraColls.length === 0 && extraDue ? "অন্যান্য আদায়" : ""), validExtraColls[0]?.amount || (validExtraColls.length === 0 && extraDue ? extraDue : "") || ""],
      ["নগদ (Cash)", totalCash || ""],
    ];
    for (let i = 1; i < 7; i++) {
      collRows.push([validExtraColls[i]?.label || "", validExtraColls[i]?.amount || ""]);
    }

    // Dues (Cols D & E, Rows 16-24)
    const allDues: { label: string; amount: any }[] = [];
    if (providerDueMoney > 0 || financialEntry.providerName) {
      allDues.push({
        label: financialEntry.providerName || "মহাজন বাকি",
        amount: providerDueMoney || "",
      });
    }
    validExtraDues.forEach((d) => allDues.push(d));

    const dueRows: [string, any][] = [
      ["সাবেক (Previous Balance)", prevDayBalance || ""],
    ];
    for (let i = 0; i < 7; i++) {
      dueRows.push([allDues[i]?.label || "", allDues[i]?.amount || ""]);
    }

    // Build batch updates for the tab using native spreadsheet formulas
    const updates: any[] = [
      { range: `'${tabName}'!B1`, values: [[`তারিখ: ${dd}/${mm}/${yyyy}`]] },
      { range: `'${tabName}'!C1`, values: [[`রোজ: ${day.toUpperCase()}`]] },
      { range: `'${tabName}'!D1`, values: [[`পৃষ্ঠা: ${pageNo}`]] },

      // Egg Stock rows: inputs in B & C, formula in D
      { range: `'${tabName}'!B6:D6`, values: [[white.currentStock || "", white.purchaseRate || "", "=B6*C6"]] },
      { range: `'${tabName}'!B7:D7`, values: [[red.currentStock || "", red.purchaseRate || "", "=B7*C7"]] },
      { range: `'${tabName}'!B8:D8`, values: [[duck.currentStock || "", duck.purchaseRate || "", "=B8*C8"]] },
      { range: `'${tabName}'!B9:D9`, values: [[chicken.currentStock || "", chicken.purchaseRate || "", "=B9*C9"]] },
      { range: `'${tabName}'!B10:D10`, values: [[quail.currentStock || "", quail.purchaseRate || "", "=B10*C10"]] },
      { range: `'${tabName}'!B11:D11`, values: [[lm.currentStock || "", lm.purchaseRate || "", "=B11*C11"]] },
      { range: `'${tabName}'!B12`, values: [["=SUM(B6:B11)"]] },
      { range: `'${tabName}'!D12`, values: [["=SUM(D6:D11)"]] },

      // Summary Box (Native Formulas)
      { range: `'${tabName}'!G5`, values: [["=B44-E24"]] },
      { range: `'${tabName}'!G6`, values: [["=B43"]] },
      { range: `'${tabName}'!G7`, values: [["=B18"]] },
      { range: `'${tabName}'!G8`, values: [["=D12"]] },
      { range: `'${tabName}'!G9`, values: [["=G7+G8"]] },

      // Collection & Dues Ranges
      { range: `'${tabName}'!A16:B24`, values: collRows },
      { range: `'${tabName}'!B25`, values: [["=SUM(B16:B24)+D12"]] },
      { range: `'${tabName}'!D16:E23`, values: dueRows },
      { range: `'${tabName}'!E24`, values: [["=SUM(E16:E23)"]] },

      // Expenses Total Formulas
      { range: `'${tabName}'!B43`, values: [["=SUM(B29:B42)"]] },
      { range: `'${tabName}'!B44`, values: [["=B43+B25"]] },
    ];

    // Clear and write expenses
    const emptyExpRows = Array(14).fill(["", ""]);
    if (expensesList.length > 0) {
      expensesList.forEach((e, idx) => {
        if (idx < 14) {
          emptyExpRows[idx] = [e.expenseType, e.amount || ""];
        }
      });
    }
    updates.push({
      range: `'${tabName}'!A29:B42`,
      values: emptyExpRows,
    });

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: "USER_ENTERED",
        data: updates,
      },
    });

    console.log(`Successfully synced day tab '${tabName}' in Google Sheets!`);
  } catch (err: any) {
    console.error("Error syncing day tab:", err.message || err);
  }
}

export interface OverheadExpenseItem {
  id: string;
  date: string;
  month: string;
  category: "employee" | "rent" | "utilities" | "security" | "transport" | "tax" | "extra";
  title: string;
  amount: number;
  paymentMode: "cash" | "mfs" | "bank";
  notes?: string;
  createdAt?: string;
}

export async function getOverheadExpensesFromSheets(): Promise<OverheadExpenseItem[]> {
  try {
    const isConfigured = await isGoogleSheetsConfigured();
    if (!isConfigured) return [];

    await initializeSpreadsheet();
    const sheets = await getSheetsClient();

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "OverheadExpenses!A2:I",
    });

    const rows = res.data.values || [];
    return rows.map((row: any[]) => ({
      id: row[0] || "",
      date: row[1] || "",
      month: row[2] || (row[1] ? row[1].slice(0, 7) : ""),
      category: (row[3] as any) || "extra",
      title: row[4] || "",
      amount: Number(row[5]) || 0,
      paymentMode: (row[6] as any) || "cash",
      notes: row[7] || "",
      createdAt: row[8] || "",
    })).filter((item: OverheadExpenseItem) => item.id && item.amount > 0);
  } catch (err: any) {
    console.error("Error fetching OverheadExpenses from Sheets:", err.message || err);
    return [];
  }
}

export async function addOverheadExpenseToSheets(item: OverheadExpenseItem): Promise<boolean> {
  try {
    const isConfigured = await isGoogleSheetsConfigured();
    if (!isConfigured) return false;

    await initializeSpreadsheet();
    const sheets = await getSheetsClient();

    const row = [
      item.id,
      item.date,
      item.month || item.date.slice(0, 7),
      item.category,
      item.title,
      item.amount,
      item.paymentMode || "cash",
      item.notes || "",
      item.createdAt || new Date().toISOString(),
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "OverheadExpenses!A2:I",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [row],
      },
    });

    return true;
  } catch (err: any) {
    console.error("Error adding OverheadExpense to Sheets:", err.message || err);
    return false;
  }
}

export async function deleteOverheadExpenseFromSheets(id: string): Promise<boolean> {
  try {
    const isConfigured = await isGoogleSheetsConfigured();
    if (!isConfigured) return false;

    await initializeSpreadsheet();
    const sheets = await getSheetsClient();

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "OverheadExpenses!A2:I",
    });

    const rows = res.data.values || [];
    const rowIndex = rows.findIndex((row: any[]) => row[0] === id);

    if (rowIndex === -1) return false;

    // Clear the specific row in Google Sheet
    const actualSheetRow = rowIndex + 2;
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SHEET_ID,
      range: `OverheadExpenses!A${actualSheetRow}:I${actualSheetRow}`,
    });

    return true;
  } catch (err: any) {
    console.error("Error deleting OverheadExpense from Sheets:", err.message || err);
    return false;
  }
}

