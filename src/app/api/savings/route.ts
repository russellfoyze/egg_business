import { NextRequest, NextResponse } from "next/server";
import {
  getSavingsFromSheets,
  addSavingToSheets,
  deleteSavingFromSheets,
  SavingsItem,
} from "@/lib/googleSheets";

export const dynamic = "force-dynamic";

// Fallback in-memory/demo storage
let localSavingsMemory: SavingsItem[] = [
  {
    id: "demo-save-1",
    date: "2026-08-05",
    month: "2026-08",
    type: "deposit",
    category: "ব্যাংক সঞ্চয়ী / DPS",
    title: "ইসলামী ব্যাংক মাসিক ডিপিএস (DPS)",
    amount: 10000,
    paymentMode: "bank",
    notes: "অ্যাকাউন্ট নং: 2050...102",
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo-extra-1",
    date: "2026-08-12",
    month: "2026-08",
    type: "extra",
    category: "খাঁচা / ট্রে বিক্রয়",
    title: "৮০০ পিস প্লাস্টিক ডিমের ট্রে বিক্রয়",
    amount: 5600,
    paymentMode: "cash",
    notes: "প্রতি ট্রে ৭ টাকা দরে ক্যাশ বিক্রয়",
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo-save-2",
    date: "2026-08-18",
    month: "2026-08",
    type: "deposit",
    category: "জরুরি ব্যবসা তহবিল",
    title: "মুনাফা থেকে আপদকালীন তহবিল জমা",
    amount: 15000,
    paymentMode: "cash",
    notes: "নতুন লট ক্রয়ের ব্যাকআপ ফান্ড",
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo-extra-2",
    date: "2026-08-22",
    month: "2026-08",
    type: "extra",
    category: "কার্টন ও বস্তা বিক্রয়",
    title: "খালি কাগজের কার্টন ও ডিমের খোসা বিক্রয়",
    amount: 1850,
    paymentMode: "cash",
    notes: "ভাঙ্গা ডিমের ট্রে ও কার্টন",
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo-with-1",
    date: "2026-08-25",
    month: "2026-08",
    type: "withdraw",
    category: "সঞ্চয় থেকে উত্তোলন",
    title: "জরুরি কাভার্ডভ্যান মেরামত বাবদ উত্তোলন",
    amount: 4000,
    paymentMode: "cash",
    notes: "ইমার্জেন্সি ফান্ড থেকে সমন্বয়",
    createdAt: new Date().toISOString(),
  },
];

export async function GET() {
  try {
    const sheetData = await getSavingsFromSheets();
    if (sheetData && sheetData.length > 0) {
      return NextResponse.json({
        success: true,
        source: "google_sheets",
        data: sheetData,
      });
    }

    return NextResponse.json({
      success: true,
      source: "local_cache",
      data: localSavingsMemory,
    });
  } catch (err: any) {
    console.error("GET /api/savings Error:", err);
    return NextResponse.json({
      success: true,
      source: "local_fallback",
      data: localSavingsMemory,
      error: err.message,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { date, type, category, title, amount, paymentMode, notes } = body;

    if (!title || !amount || Number(amount) <= 0) {
      return NextResponse.json(
        { success: false, error: "শিরোনাম এবং বৈধ টাকার পরিমাণ আবশ্যক।" },
        { status: 400 }
      );
    }

    const newDate = date || new Date().toISOString().split("T")[0];
    const newItem: SavingsItem = {
      id: `save-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      date: newDate,
      month: newDate.slice(0, 7),
      type: (type as "deposit" | "extra" | "withdraw") || "deposit",
      category: category || "অন্যান্য সঞ্চয়",
      title: String(title).trim(),
      amount: Number(amount) || 0,
      paymentMode: paymentMode || "cash",
      notes: notes ? String(notes).trim() : "",
      createdAt: new Date().toISOString(),
    };

    // Update in-memory fallback first
    localSavingsMemory.unshift(newItem);

    // Save to Google Sheets
    const syncedToSheets = await addSavingToSheets(newItem);

    return NextResponse.json({
      success: true,
      data: newItem,
      syncedToSheets,
      message: "সঞ্চয়/অতিরিক্ত আয়ের তথ্য সফলভাবে সংরক্ষিত হয়েছে।",
    });
  } catch (err: any) {
    console.error("POST /api/savings Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to save record." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "রেকর্ড আইডি প্রদান করা হয়নি।" },
        { status: 400 }
      );
    }

    // Remove from in-memory fallback
    localSavingsMemory = localSavingsMemory.filter((item) => item.id !== id);

    // Remove from Google Sheets
    const deletedFromSheets = await deleteSavingFromSheets(id);

    return NextResponse.json({
      success: true,
      deletedId: id,
      deletedFromSheets,
      message: "রেকর্ড সফলভাবে মুছে ফেলা হয়েছে।",
    });
  } catch (err: any) {
    console.error("DELETE /api/savings Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete record." },
      { status: 500 }
    );
  }
}
