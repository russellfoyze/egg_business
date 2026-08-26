import { NextRequest, NextResponse } from "next/server";
import {
  getOverheadExpensesFromSheets,
  addOverheadExpenseToSheets,
  deleteOverheadExpenseFromSheets,
  OverheadExpenseItem,
} from "@/lib/googleSheets";

export const dynamic = "force-dynamic";

// Fallback in-memory/file storage if Sheets is temporarily unavailable
let localOverheadMemory: OverheadExpenseItem[] = [
  {
    id: "demo-rent-1",
    date: "2026-08-01",
    month: "2026-08",
    category: "rent",
    title: "দোকান ও আড়ত ভাড়া (আগস্ট)",
    amount: 18000,
    paymentMode: "bank",
    notes: "মালিক: হাজি সাহেব",
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo-emp-1",
    date: "2026-08-15",
    month: "2026-08",
    category: "employee",
    title: "মো: রহিম (ডেলিভারি ভ্যানচালক বেতন)",
    amount: 12000,
    paymentMode: "cash",
    notes: "মাসিক বেতন পরিশোধ",
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo-emp-2",
    date: "2026-08-20",
    month: "2026-08",
    category: "employee",
    title: "করিম (লেবার ও লোড-আনলোড মজুরি)",
    amount: 8500,
    paymentMode: "cash",
    notes: "হাজিরা মজুরি",
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo-util-1",
    date: "2026-08-10",
    month: "2026-08",
    category: "utilities",
    title: "পল্লী বিদ্যুৎ বিল (ফ্যান, লাইট ও কুলার)",
    amount: 3200,
    paymentMode: "mfs",
    notes: "বিকাশ পে বিল",
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo-sec-1",
    date: "2026-08-05",
    month: "2026-08",
    category: "security",
    title: "বাজার সমিতি ও নাইটগার্ড চার্জ",
    amount: 1200,
    paymentMode: "cash",
    notes: "রসিদ নং #441",
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo-trans-1",
    date: "2026-08-22",
    month: "2026-08",
    category: "transport",
    title: "পিকআপ ভ্যান চাকা ও সার্ভিসিং",
    amount: 2500,
    paymentMode: "cash",
    notes: "টায়ার রিপেয়ার",
    createdAt: new Date().toISOString(),
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const category = searchParams.get("category");

    let items = await getOverheadExpensesFromSheets();

    // If sheets returned empty, use fallback memory
    if (items.length === 0) {
      items = localOverheadMemory;
    }

    if (month && month !== "all") {
      items = items.filter((item) => item.month === month || item.date.startsWith(month));
    }

    if (category && category !== "all") {
      items = items.filter((item) => item.category === category);
    }

    // Sort by date descending
    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      success: true,
      data: items,
      count: items.length,
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

    // Save to local memory
    localOverheadMemory.unshift(newItem);

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
