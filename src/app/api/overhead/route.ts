import { NextRequest, NextResponse } from "next/server";
import {
  getOverheadExpensesFromSheets,
  addOverheadExpenseToSheets,
  deleteOverheadExpenseFromSheets,
  getLatestShopCash,
  OverheadExpenseItem,
} from "@/lib/googleSheets";

export const dynamic = "force-dynamic";

// Fallback in-memory storage for user-entered overhead expenses
let localOverheadMemory: OverheadExpenseItem[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const category = searchParams.get("category");

    let items = await getOverheadExpensesFromSheets();

    // Filter out any leftover demo items
    items = items.filter((item) => !item.id.startsWith("demo-"));

    if (items.length > 0) {
      localOverheadMemory = items;
    } else {
      items = localOverheadMemory.filter((item) => !item.id.startsWith("demo-"));
    }

    if (month && month !== "all") {
      items = items.filter((item) => item.month === month || item.date.startsWith(month));
    }

    if (category && category !== "all") {
      items = items.filter((item) => item.category === category);
    }

    // Sort by date descending
    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Fetch latest shop cash in hand from Financials
    const shopCashInfo = await getLatestShopCash();

    return NextResponse.json({
      success: true,
      data: items,
      count: items.length,
      latestShopCash: shopCashInfo.cash,
      latestShopCashDate: shopCashInfo.date,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch overhead expenses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, category, title, amount, paymentMode, notes } = body;

    if (!date || !title || !amount || Number(amount) <= 0) {
      return NextResponse.json(
        { success: false, error: "সঠিক তারিখ, খরচের বিবরণ ও টাকার পরিমাণ দিন।" },
        { status: 400 }
      );
    }

    const newItem: OverheadExpenseItem = {
      id: `exp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      date,
      month: date.slice(0, 7),
      category: category || "extra",
      title: title.trim(),
      amount: Number(amount),
      paymentMode: paymentMode || "cash",
      notes: (notes || "").trim(),
      createdAt: new Date().toISOString(),
    };

    // Save to Google Sheets
    await addOverheadExpenseToSheets(newItem);

    // Save to local memory (upsert for savings_shop by date)
    if (category === "savings_shop") {
      const existingIdx = localOverheadMemory.findIndex(
        (it) => it.category === "savings_shop" && it.date === date
      );
      if (existingIdx >= 0) {
        localOverheadMemory[existingIdx] = newItem;
      } else {
        localOverheadMemory.unshift(newItem);
      }
    } else {
      localOverheadMemory.unshift(newItem);
    }

    return NextResponse.json({
      success: true,
      message: "খরচ সফলভাবে সেভ হয়েছে!",
      data: newItem,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to add overhead expense" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "আইটেম আইডি প্রয়োজন।" },
        { status: 400 }
      );
    }

    // Delete from Google Sheets
    await deleteOverheadExpenseFromSheets(id);

    // Delete from local memory
    localOverheadMemory = localOverheadMemory.filter((item) => item.id !== id);

    return NextResponse.json({
      success: true,
      message: "খরচ মুছে ফেলা হয়েছে!",
      id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete overhead expense" },
      { status: 500 }
    );
  }
}
