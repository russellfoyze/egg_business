"use server";

import { saveLedgerEntry, DailyStockEntry, FinancialsEntry, ExpenseEntry } from "@/lib/db";
import { fetchLedgerData, ComputedDayData } from "@/lib/ledger";
import { revalidatePath } from "next/cache";

export type { ComputedDayData };

export async function fetchLedgerDataAction() {
  return fetchLedgerData();
}

export async function saveLedgerEntryAction(
  date: string,
  day: string,
  pageNo: string,
  stockEntries: Omit<DailyStockEntry, "date" | "day" | "pageNo">[],
  financialEntry: Omit<FinancialsEntry, "date" | "day" | "pageNo">,
  expensesList: Omit<ExpenseEntry, "date" | "day" | "pageNo">[],
  extraCollectionList: { label: string; amount: number }[] = [],
  extraDueList: { label: string; amount: number }[] = []
) {
  try {
    const success = await saveLedgerEntry(
      date,
      day,
      pageNo,
      stockEntries,
      financialEntry,
      expensesList,
      extraCollectionList,
      extraDueList
    );

    if (success) {
      revalidatePath("/");
      return { success: true };
    } else {
      return { success: false, error: "Failed to save to database" };
    }
  } catch (error: any) {
    console.error("Error in saveLedgerEntryAction:", error);
    return { success: false, error: error.message || "Internal server error" };
  }
}
