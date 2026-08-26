import { getDatabaseData, DailyStockEntry, FinancialsEntry, ExpenseEntry } from "./db";

export interface ComputedDayData {
  date: string;
  day: string;
  pageNo: string;
  stock: {
    [eggType: string]: {
      currentStock: number;
      hasPurchase: boolean;
      purchaseRate: number;
      purchaseQty: number;
      soldQty: number;
      soldValue: number;
      stockValue: number;
    };
  };
  sales: {
    totalSoldQty: number;
    soldStockCost: number;
    dailySalesAmount: number;
  };
  financials: {
    totalDue: number;
    extraDue: number;
    totalCash: number;
    prevDayBalance: number;
    providerName: string;
    providerPhone: string;
    providerEggType: string;
    providerDueMoney: number;
    providerUnitPrice: number;
    totalDues: number;
    totalStockValue: number;
    totalBusinessValue: number;
    totalBusinessWithDue: number;
    cashPlusStock: number;
    profitMargin: number;
    extraCollections?: { label: string; amount: number }[];
    extraDues?: { label: string; qty?: number; unitPrice?: number; amount: number }[];
  };
  expenses: {
    list: {
      type: string;
      amount: number;
      wastedEggQty: number;
      wastedEggCost: number;
    }[];
    totalExpenses: number;
    totalBusinessWithExpenses: number;
  };
}

export const DEFAULT_RATES: { [key: string]: number } = {
  "সাদা (White Egg)": 10,
  "লাল (Red Egg)": 11,
  "হাঁস (Duck Egg)": 15,
  "মুরগী (Chicken Egg)": 13,
  "কোয়েল (Quail Egg)": 3,
  "L.M": 8.5,
};

export async function fetchLedgerData(): Promise<{ success: boolean; data: ComputedDayData[]; error?: string }> {
  try {
    const rawData = await getDatabaseData();
    const { dailyStock = [], financials = [], expenses = [] } = rawData;

    // Group all data by date
    const dateSet = new Set<string>();
    dailyStock.forEach((s) => s?.date && dateSet.add(s.date));
    financials.forEach((f) => f?.date && dateSet.add(f.date));
    expenses.forEach((e) => e?.date && dateSet.add(e.date));

    const dates = Array.from(dateSet).sort((a, b) => a.localeCompare(b));

    const prevStockQty: { [eggType: string]: number } = {};
    const lastKnownRates: { [eggType: string]: number } = { ...DEFAULT_RATES };

    const computedData: ComputedDayData[] = [];

    for (const date of dates) {
      const stockEntriesForDate = dailyStock.filter((s) => s?.date === date);
      const financialsEntryForDate = financials.find((f) => f?.date === date);
      const expensesForDate = expenses.filter((e) => e?.date === date);

      const day = stockEntriesForDate[0]?.day || financialsEntryForDate?.day || expensesForDate[0]?.day || "";
      const pageNo = stockEntriesForDate[0]?.pageNo || financialsEntryForDate?.pageNo || expensesForDate[0]?.pageNo || "";

      const stockMap: ComputedDayData["stock"] = {};
      const eggTypes = [
        "সাদা (White Egg)",
        "লাল (Red Egg)",
        "হাঁস (Duck Egg)",
        "মুরগী (Chicken Egg)",
        "কোয়েল (Quail Egg)",
        "L.M",
      ];

      let totalStockValueForDate = 0;
      let totalSoldQtyForDate = 0;
      let totalSoldStockCostForDate = 0;

      for (const type of eggTypes) {
        const entry = stockEntriesForDate.find((s) => s.eggType === type);

        const currentStock = entry ? entry.currentStock : 0;
        const hasPurchase = entry ? entry.hasPurchase : false;
        const purchaseRate = entry ? entry.purchaseRate : 0;
        const purchaseQty = entry ? entry.purchaseQty : 0;

        if (purchaseRate > 0) {
          lastKnownRates[type] = purchaseRate;
        }

        const prevStock = prevStockQty[type] !== undefined ? prevStockQty[type] : 0;
        const addedQty = hasPurchase ? purchaseQty : 0;
        const soldQty = Math.max(0, prevStock + addedQty - currentStock);

        prevStockQty[type] = currentStock;

        const activeRate = purchaseRate > 0 ? purchaseRate : (lastKnownRates[type] || DEFAULT_RATES[type] || 0);
        const stockValue = currentStock * activeRate;
        const soldValue = soldQty * activeRate;

        totalStockValueForDate += stockValue;
        totalSoldQtyForDate += soldQty;
        totalSoldStockCostForDate += soldValue;

        stockMap[type] = {
          currentStock,
          hasPurchase,
          purchaseRate: purchaseRate || activeRate,
          purchaseQty,
          soldQty,
          soldValue,
          stockValue,
        };
      }

      const fin: FinancialsEntry = financialsEntryForDate || {
        date,
        day,
        pageNo,
        totalDue: 0,
        extraDue: 0,
        totalCash: 0,
        prevDayBalance: 0,
        providerName: "",
        providerPhone: "",
        providerEggType: "",
        providerDueMoney: 0,
        providerUnitPrice: 0,
      };

      const extraDuesSum = Array.isArray(fin.extraDues)
        ? fin.extraDues.reduce((sum: number, item: any) => sum + (Number(item?.amount) || 0), 0)
        : 0;

      const totalDues = fin.totalDue + fin.extraDue;
      // সর্বমোট পাওনা/হিসাব = বাকি + অতিরিক্ত বাকি + নগদ ক্যাশ + মজুদ ডিমের মূল্য (Matches Google Sheet cell B25)
      const totalBusinessValue = totalDues + fin.totalCash + totalStockValueForDate;
      // মোট জমা / দেনা দায় = সাবেক ব্যালেন্স + মহাজন বাকি + অন্যান্য দেনা (Matches Google Sheet cell E24)
      const totalBusinessWithDue = fin.prevDayBalance + fin.providerDueMoney + extraDuesSum;
      const cashPlusStock = fin.totalCash + totalStockValueForDate; // Cash + মজুদ

      const expenseList = expensesForDate.map((e) => ({
        type: e.expenseType,
        amount: e.amount,
        wastedEggQty: e.wastedEggQty,
        wastedEggCost: e.wastedEggCost,
      }));

      const totalExpenses = expenseList.reduce((sum, item) => sum + item.amount, 0);
      // Total (Table 3 Total) = সর্বমোট পাওনা/হিসাব + মোট খরচ (Matches Google Sheet cell B44)
      const totalBusinessWithExpenses = totalBusinessValue + totalExpenses;
      // Margin = Total - মোট জমা (Matches Google Sheet cell G5 = B44 - E24)
      const profitMargin = Number((totalBusinessWithExpenses - totalBusinessWithDue).toFixed(2));

      // Daily Sales in Amount = Cost of Goods Sold + Profit Margin
      const dailySalesAmount = totalSoldStockCostForDate + Math.max(0, profitMargin);

      computedData.push({
        date,
        day,
        pageNo,
        stock: stockMap,
        sales: {
          totalSoldQty: totalSoldQtyForDate,
          soldStockCost: totalSoldStockCostForDate,
          dailySalesAmount: Number(dailySalesAmount.toFixed(2)),
        },
        financials: {
          totalDue: fin.totalDue,
          extraDue: fin.extraDue,
          totalCash: fin.totalCash,
          prevDayBalance: fin.prevDayBalance,
          providerName: fin.providerName,
          providerPhone: fin.providerPhone,
          providerEggType: fin.providerEggType,
          providerDueMoney: fin.providerDueMoney,
          providerUnitPrice: fin.providerUnitPrice,
          totalDues,
          totalStockValue: totalStockValueForDate,
          totalBusinessValue,
          totalBusinessWithDue,
          cashPlusStock,
          profitMargin,
          extraCollections: (fin as any).extraCollections || [],
          extraDues: (fin as any).extraDues || [],
        },
        expenses: {
          list: expenseList,
          totalExpenses,
          totalBusinessWithExpenses,
        },
      });
    }

    return {
      success: true,
      data: computedData,
    };
  } catch (error: any) {
    console.error("Error in fetchLedgerData:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch ledger data",
      data: [],
    };
  }
}
