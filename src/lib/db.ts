import fs from "fs";
import path from "path";
import {
  isGoogleSheetsConfigured,
  initializeSpreadsheet,
  readSheetValues,
  updateSheetValues,
  clearSheet,
  createOrUpdateDayTab,
} from "./googleSheets";

const MOCK_DB_PATH = path.join(process.cwd(), "mock_db.json");

export interface DailyStockEntry {
  date: string;
  day: string;
  pageNo: string;
  eggType: string;
  currentStock: number;
  hasPurchase: boolean;
  purchaseRate: number;
  purchaseQty: number;
}

export interface FinancialsEntry {
  date: string;
  day: string;
  pageNo: string;
  totalDue: number;
  extraDue: number;
  totalCash: number;
  prevDayBalance: number;
  providerName: string;
  providerPhone: string;
  providerEggType: string;
  providerDueMoney: number;
  providerUnitPrice: number;
  extraCollections?: { label: string; amount: number }[];
  extraDues?: { label: string; qty?: number; unitPrice?: number; amount: number }[];
}

export interface ExpenseEntry {
  date: string;
  day: string;
  pageNo: string;
  expenseType: string;
  amount: number;
  wastedEggQty: number;
  wastedEggCost: number;
}

export interface DatabaseData {
  dailyStock: DailyStockEntry[];
  financials: FinancialsEntry[];
  expenses: ExpenseEntry[];
}

// Read from mock_db.json
function readLocalMockDb(): DatabaseData {
  try {
    if (!fs.existsSync(MOCK_DB_PATH)) {
      return { dailyStock: [], financials: [], expenses: [] };
    }
    const rawData = fs.readFileSync(MOCK_DB_PATH, "utf-8");
    return JSON.parse(rawData);
  } catch (error) {
    console.error("Error reading local mock DB:", error);
    return { dailyStock: [], financials: [], expenses: [] };
  }
}

// Write to mock_db.json
function writeLocalMockDb(data: DatabaseData) {
  try {
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing to local mock DB:", error);
  }
}

// Map spreadsheet values to objects
function parseStockRows(rows: any[][]): DailyStockEntry[] {
  if (rows.length <= 1) return [];
  const headers = rows[0];
  return rows.slice(1).map((row) => ({
    date: row[0] || "",
    day: row[1] || "",
    pageNo: row[2] || "",
    eggType: row[3] || "",
    currentStock: Number(row[4]) || 0,
    hasPurchase: row[5] === "TRUE" || row[5] === "true" || row[5] === true,
    purchaseRate: Number(row[6]) || 0,
    purchaseQty: Number(row[7]) || 0,
  }));
}

function parseFinancialsRows(rows: any[][]): FinancialsEntry[] {
  if (rows.length <= 1) return [];
  return rows.slice(1).map((row) => {
    let extraCollections: any[] = [];
    let extraDues: any[] = [];
    try {
      if (row[12]) extraCollections = JSON.parse(row[12]);
    } catch {}
    try {
      if (row[13]) extraDues = JSON.parse(row[13]);
    } catch {}

    return {
      date: row[0] || "",
      day: row[1] || "",
      pageNo: row[2] || "",
      totalDue: Number(row[3]) || 0,
      extraDue: Number(row[4]) || 0,
      totalCash: Number(row[5]) || 0,
      prevDayBalance: Number(row[6]) || 0,
      providerName: row[7] || "",
      providerPhone: row[8] || "",
      providerEggType: row[9] || "",
      providerDueMoney: Number(row[10]) || 0,
      providerUnitPrice: Number(row[11]) || 0,
      extraCollections,
      extraDues,
    };
  });
}

function parseExpensesRows(rows: any[][]): ExpenseEntry[] {
  if (rows.length <= 1) return [];
  return rows.slice(1).map((row) => ({
    date: row[0] || "",
    day: row[1] || "",
    pageNo: row[2] || "",
    expenseType: row[3] || "",
    amount: Number(row[4]) || 0,
    wastedEggQty: Number(row[5]) || 0,
    wastedEggCost: Number(row[6]) || 0,
  }));
}

export async function getDatabaseData(): Promise<DatabaseData> {
  const useSheets = await isGoogleSheetsConfigured();

  if (!useSheets) {
    console.log("Using local mock database...");
    return readLocalMockDb();
  }

  try {
    await initializeSpreadsheet();

    const [stockRows, financialsRows, expensesRows] = await Promise.all([
      readSheetValues("DailyStock"),
      readSheetValues("Financials"),
      readSheetValues("Expenses"),
    ]);

    const localDb = readLocalMockDb();
    const sheetFin = parseFinancialsRows(financialsRows);
    const mergedFinancials = sheetFin.map((f) => {
      const local = localDb.financials.find((lf) => lf.date === f.date);
      return {
        ...f,
        extraCollections: (f.extraCollections && f.extraCollections.length > 0) ? f.extraCollections : (local?.extraCollections || []),
        extraDues: (f.extraDues && f.extraDues.length > 0) ? f.extraDues : (local?.extraDues || []),
      };
    });

    return {
      dailyStock: parseStockRows(stockRows),
      financials: mergedFinancials,
      expenses: parseExpensesRows(expensesRows),
    };
  } catch (error) {
    console.error("Failed to read from Google Sheets, falling back to mock database:", error);
    return readLocalMockDb();
  }
}

export async function saveLedgerEntry(
  date: string,
  day: string,
  pageNo: string,
  stockEntries: Omit<DailyStockEntry, "date" | "day" | "pageNo">[],
  financialEntry: Omit<FinancialsEntry, "date" | "day" | "pageNo">,
  expensesList: Omit<ExpenseEntry, "date" | "day" | "pageNo">[],
  extraCollectionList: { label: string; amount: number }[] = [],
  extraDueList: { label: string; amount: number }[] = []
): Promise<boolean> {
  const useSheets = await isGoogleSheetsConfigured();

  // 1. Prepare new formatted rows
  const newStockRecords: DailyStockEntry[] = stockEntries.map((entry) => ({
    date,
    day,
    pageNo,
    ...entry,
  }));

  const newFinancialsRecord: FinancialsEntry = {
    date,
    day,
    pageNo,
    ...financialEntry,
    extraCollections: extraCollectionList,
    extraDues: extraDueList,
  };

  const newExpensesRecords: ExpenseEntry[] = expensesList.map((entry) => ({
    date,
    day,
    pageNo,
    ...entry,
  }));

  // Always update local DB cache first to preserve rich extra dues and collections
  const db = readLocalMockDb();
  db.dailyStock = db.dailyStock.filter((e) => e.date !== date);
  db.financials = db.financials.filter((e) => e.date !== date);
  db.expenses = db.expenses.filter((e) => e.date !== date);

  db.dailyStock.push(...newStockRecords);
  db.financials.push(newFinancialsRecord);
  db.expenses.push(...newExpensesRecords);

  db.dailyStock.sort((a, b) => (a?.date || "").localeCompare(b?.date || ""));
  db.financials.sort((a, b) => (a?.date || "").localeCompare(b?.date || ""));
  db.expenses.sort((a, b) => (a?.date || "").localeCompare(b?.date || ""));

  writeLocalMockDb(db);

  if (!useSheets) {
    return true;
  }

  try {
    await initializeSpreadsheet();

    // Fetch existing values to filter out matching date entries
    const [stockRows, financialsRows, expensesRows] = await Promise.all([
      readSheetValues("DailyStock"),
      readSheetValues("Financials"),
      readSheetValues("Expenses"),
    ]);

    const existingStock = parseStockRows(stockRows).filter((e) => e.date !== date);
    const existingFinancials = parseFinancialsRows(financialsRows).filter((e) => e.date !== date);
    const existingExpenses = parseExpensesRows(expensesRows).filter((e) => e.date !== date);

    // Combine old + new
    const updatedStock = [...existingStock, ...newStockRecords].sort((a, b) => (a?.date || "").localeCompare(b?.date || ""));
    const updatedFinancials = [...existingFinancials, newFinancialsRecord].sort((a, b) => (a?.date || "").localeCompare(b?.date || ""));
    const updatedExpenses = [...existingExpenses, ...newExpensesRecords].sort((a, b) => (a?.date || "").localeCompare(b?.date || ""));

    // Map to 2D arrays (with headers)
    const stockSheetData = [
      ["Date", "Day", "PageNo", "EggType", "CurrentStock", "HasPurchase", "PurchaseRate", "PurchaseQty"],
      ...updatedStock.map((e) => [
        e.date,
        e.day,
        e.pageNo,
        e.eggType,
        e.currentStock,
        e.hasPurchase ? "TRUE" : "FALSE",
        e.purchaseRate,
        e.purchaseQty,
      ]),
    ];

    const financialsSheetData = [
      [
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
        "ExtraCollectionsJSON",
        "ExtraDuesJSON",
      ],
      ...updatedFinancials.map((e) => [
        e.date,
        e.day,
        e.pageNo,
        e.totalDue,
        e.extraDue,
        e.totalCash,
        e.prevDayBalance,
        e.providerName,
        e.providerPhone,
        e.providerEggType,
        e.providerDueMoney,
        e.providerUnitPrice,
        JSON.stringify(e.extraCollections || []),
        JSON.stringify(e.extraDues || []),
      ]),
    ];

    const expensesSheetData = [
      ["Date", "Day", "PageNo", "ExpenseType", "Amount", "WastedEggQty", "WastedEggCost"],
      ...updatedExpenses.map((e) => [
        e.date,
        e.day,
        e.pageNo,
        e.expenseType,
        e.amount,
        e.wastedEggQty,
        e.wastedEggCost,
      ]),
    ];

    // Atomically clear and update sheets from cell A1
    await Promise.all([
      updateSheetValues("DailyStock", stockSheetData),
      updateSheetValues("Financials", financialsSheetData),
      updateSheetValues("Expenses", expensesSheetData),
      createOrUpdateDayTab(date, day, pageNo, stockEntries, financialEntry, expensesList, extraCollectionList, extraDueList),
    ]);

    // Keep local cache simultaneously in sync
    writeLocalMockDb({
      dailyStock: updatedStock,
      financials: updatedFinancials,
      expenses: updatedExpenses,
    });

    return true;
  } catch (error) {
    console.error("Failed to write to Google Sheets, using local fallback:", error);
    // Write locally on failure
    const db = readLocalMockDb();
    db.dailyStock = db.dailyStock.filter((e) => e.date !== date);
    db.financials = db.financials.filter((e) => e.date !== date);
    db.expenses = db.expenses.filter((e) => e.date !== date);

    db.dailyStock.push(...newStockRecords);
    db.financials.push(newFinancialsRecord);
    db.expenses.push(...newExpensesRecords);

    db.dailyStock.sort((a, b) => (a?.date || "").localeCompare(b?.date || ""));
    db.financials.sort((a, b) => (a?.date || "").localeCompare(b?.date || ""));
    db.expenses.sort((a, b) => (a?.date || "").localeCompare(b?.date || ""));

    writeLocalMockDb(db);
    return true;
  }
}
