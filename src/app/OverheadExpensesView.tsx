"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Building2,
  Zap,
  Shield,
  Truck,
  FileSpreadsheet,
  Coins,
  Store,
  Landmark,
  PiggyBank,
  Wallet,
  Plus,
  Trash2,
  Search,
  Filter,
  Calendar,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowUpDown,
  Download,
  Info,
  Receipt,
  ArrowDownRight,
  UserCheck,
  Eye,
  X,
} from "lucide-react";
import { OverheadExpenseItem } from "@/lib/googleSheets";
import { ComputedDayData } from "./actions";
import DateTimePicker, { formatToDayMonthYear } from "./DateTimePicker";

const CATEGORIES = [
  { id: "savings_shop", label: "🏪 সমিতি / দোকানে সঞ্চয় (In-Shop)", icon: Store, color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/60", border: "border-emerald-200 dark:border-emerald-800" },
  { id: "savings_bank", label: "🏦 ব্যাংকে সঞ্চয় (In-Bank / DPS)", icon: Landmark, color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/60", border: "border-blue-200 dark:border-blue-800" },
  { id: "bill_from_savings_shop", label: "💸 দোকানে সঞ্চয় হতে বিল পরিশোধ", icon: Receipt, color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/60", border: "border-amber-200 dark:border-amber-800" },
  { id: "bill_from_savings_bank", label: "💳 ব্যাংকে সঞ্চয় হতে বিল পরিশোধ", icon: CreditCard, color: "text-purple-700 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/60", border: "border-purple-200 dark:border-purple-800" },
  { id: "employee", label: "কর্মচারী বেতন ও মজুরি", icon: Users, color: "text-sky-700 dark:text-sky-400", bg: "bg-sky-50 dark:bg-sky-950/60", border: "border-sky-200 dark:border-sky-800" },
  { id: "rent", label: "দোকান ও গোডাউন ভাড়া", icon: Building2, color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/60", border: "border-amber-200 dark:border-amber-800" },
  { id: "utilities", label: "বিদ্যুৎ ও গ্যাস বিল", icon: Zap, color: "text-yellow-700 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-950/60", border: "border-yellow-200 dark:border-yellow-800" },
  { id: "security", label: "মার্কেট সমিতি ও নাইটগার্ড", icon: Shield, color: "text-teal-700 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-950/60", border: "border-teal-200 dark:border-teal-800" },
  { id: "transport", label: "গাড়ি/ভ্যান মেরামত ও ফুয়েল", icon: Truck, color: "text-purple-700 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/60", border: "border-purple-200 dark:border-purple-800" },
  { id: "tax", label: "ট্রেড লাইসেন্স ও ট্যাক্স", icon: FileSpreadsheet, color: "text-indigo-700 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/60", border: "border-indigo-200 dark:border-indigo-800" },
  { id: "extra", label: "অন্যান্য বিবিধ অতিরিক্ত খরচ", icon: Coins, color: "text-rose-700 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/60", border: "border-rose-200 dark:border-rose-800" },
];

interface OverheadExpensesViewProps {
  ledgerData?: ComputedDayData[];
}

export default function OverheadExpensesView({ ledgerData }: OverheadExpensesViewProps = {}) {
  const [internalLedgerData, setInternalLedgerData] = useState<ComputedDayData[]>([]);
  const [isPersonalListOpen, setIsPersonalListOpen] = useState<boolean>(false);
  const [savingsTab, setSavingsTab] = useState<"both" | "shop" | "bank">("both");

  const [expenses, setExpenses] = useState<OverheadExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState(true);

  const [latestShopCash, setLatestShopCash] = useState<number>(0);
  const [latestShopCashDate, setLatestShopCashDate] = useState<string>("");

  // Form State
  const [formDate, setFormDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [formCategory, setFormCategory] = useState<OverheadExpenseItem["category"]>("savings_shop");
  const [formTitle, setFormTitle] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formPaymentMode, setFormPaymentMode] = useState<OverheadExpenseItem["paymentMode"]>("cash");
  const [formNotes, setFormNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch from API with local cache - removing any demo items
  const fetchExpenses = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/overhead");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const cleanData = json.data.filter((item: OverheadExpenseItem) => item && item.id && !item.id.startsWith("demo-"));
        setExpenses(cleanData);
        if (json.latestShopCash !== undefined) {
          setLatestShopCash(Number(json.latestShopCash) || 0);
        }
        if (json.latestShopCashDate) {
          setLatestShopCashDate(json.latestShopCashDate);
        }
        try {
          localStorage.setItem("yolkflow_overhead_expenses", JSON.stringify(cleanData));
          if (json.latestShopCash !== undefined) {
            localStorage.setItem("yolkflow_latest_shop_cash", String(json.latestShopCash));
          }
        } catch (e) {}
      }
    } catch (err) {
      console.error("Failed to load overhead expenses:", err);
      // Try local cache without demo items
      try {
        const cached = localStorage.getItem("yolkflow_overhead_expenses");
        if (cached) {
          const cleanData = JSON.parse(cached).filter((item: OverheadExpenseItem) => item && item.id && !item.id.startsWith("demo-"));
          setExpenses(cleanData);
        }
        const cachedCash = localStorage.getItem("yolkflow_latest_shop_cash");
        if (cachedCash) setLatestShopCash(Number(cachedCash) || 0);
      } catch (e) {}
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Immediate load from localStorage first, filtering out any demo items
    try {
      const cached = localStorage.getItem("yolkflow_overhead_expenses");
      if (cached) {
        const cleanData = JSON.parse(cached).filter((item: OverheadExpenseItem) => item && item.id && !item.id.startsWith("demo-"));
        setExpenses(cleanData);
        setLoading(false);
      }
      const cachedCash = localStorage.getItem("yolkflow_latest_shop_cash");
      if (cachedCash) setLatestShopCash(Number(cachedCash) || 0);
    } catch (e) {}
    fetchExpenses();
  }, []);

  // Sync ledger data if not provided via props
  useEffect(() => {
    if (!ledgerData || ledgerData.length === 0) {
      fetch("/api/data")
        .then((res) => res.json())
        .then((json) => {
          if (json && Array.isArray(json.data)) {
            setInternalLedgerData(json.data);
          }
        })
        .catch(() => {});
    }
  }, [ledgerData]);

  const activeLedgerData = (ledgerData && ledgerData.length > 0) ? ledgerData : internalLedgerData;

  // Compute personal expenses ("নিজ") from 4. দৈনিক খরচের খাত across all ledger entries
  const personalExpensesList = useMemo(() => {
    const list: {
      date: string;
      pageNo: string;
      day: string;
      amount: number;
      type: string;
    }[] = [];

    activeLedgerData.forEach((dayData) => {
      const expList = dayData.expenses?.list || [];
      expList.forEach((exp) => {
        const t = (exp.type || "").trim().toLowerCase();
        if (t === "নিজ" || t.includes("নিজ") || t.includes("ব্যক্তিগত") || t === "personal") {
          const amt = Number(exp.amount) || 0;
          if (amt > 0) {
            list.push({
              date: dayData.date,
              pageNo: dayData.pageNo,
              day: dayData.day,
              amount: amt,
              type: exp.type,
            });
          }
        }
      });
    });

    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return list;
  }, [activeLedgerData]);

  const personalExpenseTotals = useMemo(() => {
    let allTimeTotal = 0;
    let filteredMonthTotal = 0;
    let filteredCount = 0;

    personalExpensesList.forEach((item) => {
      allTimeTotal += item.amount;
      const itemMonth = item.date.slice(0, 7);
      if (selectedMonth === "all" || itemMonth === selectedMonth) {
        filteredMonthTotal += item.amount;
        filteredCount++;
      }
    });

    return {
      allTimeTotal,
      filteredMonthTotal,
      displayTotal: selectedMonth === "all" ? allTimeTotal : filteredMonthTotal,
      count: selectedMonth === "all" ? personalExpensesList.length : filteredCount,
      allTimeCount: personalExpensesList.length,
    };
  }, [personalExpensesList, selectedMonth]);

  // Available unique months
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    expenses.forEach((item) => {
      if (item.month) monthsSet.add(item.month);
      else if (item.date) monthsSet.add(item.date.slice(0, 7));
    });
    return Array.from(monthsSet).sort().reverse();
  }, [expenses]);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      const itemMonth = item.month || item.date.slice(0, 7);
      if (selectedMonth !== "all" && itemMonth !== selectedMonth) return false;
      if (selectedCategory !== "all" && item.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchNotes = (item.notes || "").toLowerCase().includes(q);
        const matchAmount = item.amount.toString().includes(q);
        if (!matchTitle && !matchNotes && !matchAmount) return false;
      }
      return true;
    });
  }, [expenses, selectedMonth, selectedCategory, searchQuery]);

  // Aggregated Counters & Totals (including 2-part savings & bill payments from savings)
  const totals = useMemo(() => {
    let employeeTotal = 0;
    let rentTotal = 0;
    let utilitiesTotal = 0;
    let extraTotal = 0;
    let transportTotal = 0;
    let taxTotal = 0;
    let savingsShopTotal = 0;
    let savingsShopBillTotal = 0;
    let savingsBankTotal = 0;
    let savingsBankBillTotal = 0;
    let grandTotal = 0;

    filteredExpenses.forEach((item) => {
      const amt = Number(item.amount) || 0;
      grandTotal += amt;

      // Check if this expense cuts from shop savings or bank savings
      const isPaidFromShopSavings =
        (item.paymentMode === "savings_shop" && item.category !== "savings_shop") ||
        item.category === "bill_from_savings_shop";

      const isPaidFromBankSavings =
        (item.paymentMode === "savings_bank" && item.category !== "savings_bank") ||
        item.category === "bill_from_savings_bank";

      if (isPaidFromShopSavings) {
        savingsShopBillTotal += amt;
      }
      if (isPaidFromBankSavings) {
        savingsBankBillTotal += amt;
      }

      if (item.category === "savings_shop") {
        savingsShopTotal += amt;
      } else if (item.category === "savings_bank") {
        savingsBankTotal += amt;
      } else if (item.category === "bill_from_savings_shop" || item.category === "bill_from_savings_bank") {
        // Handled above via isPaidFromShopSavings / isPaidFromBankSavings
      } else if (item.category === "employee") {
        employeeTotal += amt;
      } else if (item.category === "rent") {
        rentTotal += amt;
      } else if (item.category === "utilities" || item.category === "security") {
        utilitiesTotal += amt;
      } else if (item.category === "transport") {
        transportTotal += amt;
      } else if (item.category === "tax") {
        taxTotal += amt;
      } else {
        extraTotal += amt;
      }
    });

    const netShopSavings = savingsShopTotal - savingsShopBillTotal;
    const netBankSavings = savingsBankTotal - savingsBankBillTotal;
    const totalSavingsDeposited = savingsShopTotal + savingsBankTotal;
    const totalSavingsWithdrawn = savingsShopBillTotal + savingsBankBillTotal;
    const netTotalSavings = netShopSavings + netBankSavings;
    const pureExpenseTotal = Math.max(0, grandTotal - (savingsShopTotal + savingsBankTotal));

    return {
      employeeTotal,
      rentTotal,
      utilitiesTotal,
      transportTotal,
      taxTotal,
      extraTotal,
      savingsShopTotal,
      savingsShopBillTotal,
      netShopSavings,
      savingsBankTotal,
      savingsBankBillTotal,
      netBankSavings,
      totalSavingsDeposited,
      totalSavingsWithdrawn,
      netTotalSavings,
      pureExpenseTotal,
      grandTotal,
      count: filteredExpenses.length,
    };
  }, [filteredExpenses]);

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDate || !formTitle.trim() || !formAmount || Number(formAmount) <= 0) {
      setFeedback({ type: "error", text: "সঠিক তারিখ, বিবরণ ও টাকার পরিমাণ দিন।" });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    const payload = {
      date: formDate,
      category: formCategory,
      title: formTitle.trim(),
      amount: Number(formAmount),
      paymentMode: formPaymentMode,
      notes: formNotes.trim(),
    };

    try {
      const res = await fetch("/api/overhead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.success && json.data) {
        let updated: OverheadExpenseItem[];
        if (json.data.category === "savings_shop") {
          const filtered = expenses.filter(
            (it) => !(it.category === "savings_shop" && it.date === json.data.date)
          );
          updated = [json.data, ...filtered];
        } else {
          updated = [json.data, ...expenses];
        }
        setExpenses(updated);
        try {
          localStorage.setItem("yolkflow_overhead_expenses", JSON.stringify(updated));
        } catch (e) {}
        fetchExpenses();

        setFeedback({ type: "success", text: "খরচ সফলভাবে এন্ট্রি ও গুগল শিটে সেভ হয়েছে!" });
        setFormTitle("");
        setFormAmount("");
        setFormNotes("");
      } else {
        setFeedback({ type: "error", text: json.error || "সংরক্ষণ করতে সমস্যা হয়েছে।" });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "সার্ভার এরর হয়েছে।" });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Handler
  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে "${title}" খরচটি মুছে ফেলতে চান?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/overhead?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        const updated = expenses.filter((item) => item.id !== id);
        setExpenses(updated);
        try {
          localStorage.setItem("yolkflow_overhead_expenses", JSON.stringify(updated));
        } catch (e) {}
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const getCategoryMeta = (catId: string) => {
    return (
      CATEGORIES.find((c) => c.id === catId) || {
        label: "অন্যান্য খরচ",
        icon: Coins,
        color: "text-slate-700 dark:text-slate-300",
        bg: "bg-slate-100 dark:bg-slate-800",
        border: "border-slate-300 dark:border-slate-700",
      }
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn pb-16">
      {/* 1. Top Summary Fund & Cash Cards (Modern Frosted Glass) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
        {/* Card 1: সর্বমোট নিট তহবিল (দোকান + ব্যাংক) */}
        <div className="glass-panel-emerald rounded-3xl p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between space-y-3 transition-all group hover:scale-[1.01] hover:shadow-[0_16px_40px_rgba(16,185,129,0.2)]">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] sm:text-xs font-black tracking-wider text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-2.5 py-1 rounded-full uppercase backdrop-blur-md inline-block">
                #দোকান + ব্যাংক তহবিল
              </span>
              <p className="text-[11px] font-bold text-slate-400 block mt-2">সর্বমোট নিট তহবিল (দোকান + ব্যাংক)</p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400 drop-shadow-[0_0_16px_rgba(16,185,129,0.45)] mt-0.5 tracking-tight">
                ৳ {totals.netTotalSavings.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)] shrink-0">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>

          <div className="pt-2.5 border-t border-white/10 text-[11px] space-y-1">
            <div className="flex justify-between items-center font-bold text-slate-300">
              <span>জমা: <strong className="text-emerald-300">৳{totals.totalSavingsDeposited.toLocaleString()}</strong></span>
              <span className="text-emerald-500/40">|</span>
              <span>পরিশোধিত বিল: <strong className="text-amber-400">৳{totals.totalSavingsWithdrawn.toLocaleString()}</strong></span>
            </div>
            <p className="text-[10px] font-medium text-slate-400">
              দোকানে নিট ৳{totals.netShopSavings.toLocaleString()} &bull; ব্যাংকে নিট ৳{totals.netBankSavings.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Card 2: দোকানের নগদ ক্যাশ (Cash in the Shop) */}
        <div className="glass-panel-amber rounded-3xl p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between space-y-3 transition-all group hover:scale-[1.01] hover:shadow-[0_16px_40px_rgba(245,158,11,0.2)]">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] sm:text-xs font-black tracking-wider text-amber-400 bg-amber-950/70 border border-amber-500/40 px-2.5 py-1 rounded-full uppercase backdrop-blur-md inline-block">
                #{latestShopCashDate ? `${latestShopCashDate.slice(5)} তারিখের ক্যাশ` : "নগদ ক্যাশ ড্রয়ার"}
              </span>
              <p className="text-[11px] font-bold text-slate-400 block mt-2">দোকানের নগদ ক্যাশ (Cash in Shop)</p>
              <p className="text-2xl sm:text-3xl font-black text-amber-300 drop-shadow-[0_0_16px_rgba(245,158,11,0.45)] mt-0.5 tracking-tight">
                ৳ {(latestShopCash > 0 ? latestShopCash : totals.netShopSavings).toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)] shrink-0">
              <Store className="w-5 h-5" />
            </div>
          </div>

          {/* User Requested Exact Breakdown: অবশিষ্ট নিট ফান্ড, অবশিষ্ট নিট ব্যাংক ফান্ড, সর্বমোট মাসিক খরচ */}
          <div className="pt-2.5 border-t border-white/10 space-y-1 text-[11px]">
            <div className="flex justify-between items-center text-slate-300 font-medium">
              <span>অবশিষ্ট নিট ফান্ড:</span>
              <span className="font-black text-amber-300">৳ {totals.netShopSavings.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300 font-medium">
              <span>+ অবশিষ্ট নিট ব্যাংক ফান্ড:</span>
              <span className="font-black text-cyan-300">৳ {totals.netBankSavings.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300 font-medium">
              <span>সর্বমোট মাসিক খরচ:</span>
              <span className="font-black text-rose-400">৳ {totals.pureExpenseTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 3. Unified Expense Section (Modern Frosted Glass) */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3.5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(0,200,255,0.25)]">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm sm:text-base font-black text-slate-100">
                  ব্যবসায়িক ও ব্যক্তিগত খরচের সার্বিক হিসাব (Expenses & Payroll)
                </h3>
                <span className="text-[10px] font-black bg-white/10 text-cyan-300 px-2.5 py-0.5 rounded-full border border-white/15">
                  ৩টি খাত
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                কর্মচারী বেতন, মাসিক পরিচালন খরচ এবং খাতার ব্যক্তিগত খরচ এক নজরে
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-slate-900/80 px-4 py-2 rounded-full border border-white/15 self-start sm:self-auto backdrop-blur-md">
            <span className="text-[11px] font-bold text-slate-400">
              মোট ব্যয়:
            </span>
            <span className="text-sm sm:text-base font-black text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]">
              ৳ {(totals.pureExpenseTotal + personalExpenseTotals.displayTotal).toLocaleString()}
            </span>
          </div>
        </div>

        {/* 3 Columns for the 3 Expense Categories inside this 1 Component */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
          {/* Sub-card 1: কর্মচারী মোট বেতন (Salary) */}
          <div className="glass-panel-cyan rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3 transition-all group hover:scale-[1.01]">
            <div className="flex justify-between items-center">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_10px_rgba(0,200,255,0.3)]">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black text-cyan-300 bg-cyan-950/70 px-2.5 py-0.5 rounded-full border border-cyan-500/40">
                বেতন ও মজুরি
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400">কর্মচারী মোট বেতন (Salary)</p>
              <p className="text-xl sm:text-2xl font-black text-cyan-300 drop-shadow-[0_0_12px_rgba(0,200,255,0.4)] mt-0.5">
                ৳ {totals.employeeTotal.toLocaleString()}
              </p>
              <p className="text-[10px] font-medium text-slate-400 mt-1">
                হাজিরা ও নিয়মিত কর্মচারী খরচ
              </p>
            </div>
          </div>

          {/* Sub-card 2: সর্বমোট মাসিক খরচ (Monthly Cost) */}
          <div className="glass-panel-amber rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3 transition-all group hover:scale-[1.01]">
            <div className="flex justify-between items-center">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 border border-amber-400/40 flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                <Receipt className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black text-amber-300 bg-amber-950/70 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                {totals.count} টি এন্ট্রি
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400">সর্বমোট মাসিক খরচ (Monthly Cost)</p>
              <p className="text-xl sm:text-2xl font-black text-amber-300 drop-shadow-[0_0_12px_rgba(245,158,11,0.4)] mt-0.5">
                ৳ {totals.pureExpenseTotal.toLocaleString()}
              </p>
              <p className="text-[10px] font-medium text-slate-400 mt-1">
                বেতন, ভাড়া, বিল ও অতিরিক্ত খরচ সহ
              </p>
            </div>
          </div>

          {/* Sub-card 3: ব্যক্তিগত মোট খরচ (Personal Cost) */}
          <div className="glass-panel-purple rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3 transition-all group hover:scale-[1.01]">
            <div className="flex justify-between items-center">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 border border-purple-400/40 flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                <UserCheck className="w-4 h-4" />
              </div>
              <button
                type="button"
                onClick={() => setIsPersonalListOpen(true)}
                className="text-[10px] font-black text-cyan-300 bg-slate-900/90 hover:bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-500/60 hover:border-cyan-400 shadow-[0_0_10px_rgba(0,200,255,0.25)] flex items-center space-x-1 cursor-pointer transition-all active:scale-95"
                title="সকল ব্যক্তিগত খরচের তালিকা দেখুন"
              >
                <span>তালিকা</span>
                <Eye className="w-3 h-3" />
              </button>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400">ব্যক্তিগত মোট খরচ (Personal Cost)</p>
              <p className="text-xl sm:text-2xl font-black text-purple-300 drop-shadow-[0_0_12px_rgba(168,85,247,0.4)] mt-0.5">
                ৳ {personalExpenseTotals.displayTotal.toLocaleString()}
              </p>
              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                <span>৪. দৈনিক খরচের খাত (নিজ)</span>
                <span className="font-semibold text-purple-400">({personalExpenseTotals.count} দিনে এন্ট্রি)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 3. Dedicated Savings Section with 2 Parts (Modern Frosted Glass) */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 space-y-4 border border-emerald-500/30 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3.5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-500/15 border border-emerald-400/30 rounded-2xl flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
              <PiggyBank className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-100">
                  ব্যবসায়িক সঞ্চয় ও তহবিল (Business Savings)
                </h3>
                <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  ২টি সংরক্ষিত ফান্ড
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                দোকানের ক্যাশ ড্রয়ার (সমিতি) ও ব্যাংক অ্যাকাউন্টে সংরক্ষিত সঞ্চয় এবং বিল পরিশোধের সার্বিক খতিয়ান
              </p>
            </div>
          </div>

          {/* Combined Net Savings Badge */}
          <div className="flex items-center space-x-2.5 bg-slate-900/80 border border-emerald-500/40 px-4 py-2 rounded-full backdrop-blur-md">
            <Wallet className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-semibold leading-tight">
                সর্বমোট নিট তহবিল (দোকান + ব্যাংক)
              </span>
              <span className="text-base sm:text-lg font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.35)] leading-none">
                ৳ {totals.netTotalSavings.toLocaleString()}
              </span>
              <span className="text-[9px] text-slate-400 block font-medium mt-0.5">
                জমা ৳{totals.totalSavingsDeposited.toLocaleString()} | বিল ৳{totals.totalSavingsWithdrawn.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* 2 Buttons to Open 2 Components for Saving */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 p-1.5 bg-slate-950/90 rounded-full border border-cyan-500/30 shadow-inner">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Button 1: দোকানে সঞ্চয় Component */}
            <button
              type="button"
              onClick={() => setSavingsTab("shop")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                savingsTab === "shop"
                  ? "bg-gradient-to-r from-cyan-400 to-sky-400 text-slate-950 border-cyan-300 font-black shadow-[0_0_14px_rgba(0,200,255,0.4)]"
                  : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-700/80 hover:border-cyan-400/60"
              }`}
            >
              <Store className="w-4 h-4" />
              <span>১. সমিতি / দোকানে সঞ্চয় (In-Shop)</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                savingsTab === "shop" ? "bg-slate-950/25 text-slate-950" : "bg-slate-800 text-cyan-400 border border-cyan-500/30"
              }`}>
                ৳ {totals.netShopSavings.toLocaleString()}
              </span>
            </button>

            {/* Button 2: ব্যাংকে সঞ্চয় Component */}
            <button
              type="button"
              onClick={() => setSavingsTab("bank")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                savingsTab === "bank"
                  ? "bg-gradient-to-r from-cyan-400 to-sky-400 text-slate-950 border-cyan-300 font-black shadow-[0_0_14px_rgba(0,200,255,0.4)]"
                  : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-700/80 hover:border-cyan-400/60"
              }`}
            >
              <Landmark className="w-4 h-4" />
              <span>২. ব্যাংকে সঞ্চয় (In-Bank / DPS)</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                savingsTab === "bank" ? "bg-slate-950/25 text-slate-950" : "bg-slate-800 text-cyan-400 border border-cyan-500/30"
              }`}>
                ৳ {totals.netBankSavings.toLocaleString()}
              </span>
            </button>

            {/* Button 3: উভয় ফান্ড (Both) */}
            <button
              type="button"
              onClick={() => setSavingsTab("both")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                savingsTab === "both"
                  ? "bg-slate-800 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(0,200,255,0.3)] font-black"
                  : "bg-slate-900/40 hover:bg-slate-800/60 text-slate-400 border-transparent hover:text-slate-200"
              }`}
            >
              উভয় ফান্ড (Both)
            </button>
          </div>

          <span className="text-[11px] text-slate-400 font-medium px-3 hidden sm:inline">
            {savingsTab === "shop" && "দোকানের ক্যাশ ড্রয়ার বা আড়তে রক্ষিত নগদ সঞ্চয় খতিয়ান"}
            {savingsTab === "bank" && "ব্যাংক অ্যাকাউন্ট, ডিপিএস বা এফডিআর সঞ্চয় খতিয়ান"}
            {savingsTab === "both" && "উভয় সঞ্চয় তহবিল এক সাথে প্রদর্শন"}
          </span>
        </div>

        {/* 2 Saving Components - Modern Frosted Glass */}
        <div className={`grid gap-3.5 sm:gap-4 ${savingsTab === "both" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
          {/* Component 1: সমিতি / দোকানে সঞ্চয় (In-Shop Savings) */}
          {(savingsTab === "both" || savingsTab === "shop") && (
            <div className="glass-panel-emerald rounded-3xl p-5 sm:p-6 flex flex-col justify-between space-y-3.5 transition-all group hover:scale-[1.01]">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-100 flex items-center gap-1.5">
                      <span>সমিতি / দোকানে সঞ্চয়</span>
                      <span className="text-[10px] font-black text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40">
                        In-Shop
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium">দোকানের ক্যাশ ড্রয়ার বা আড়তে রক্ষিত নগদ সঞ্চয়</p>
                  </div>
                </div>
                {savingsTab === "shop" && (
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-900/60 px-2.5 py-1 rounded-full border border-emerald-500/40">
                    সক্রিয় কম্পোনেন্ট
                  </span>
                )}
              </div>

              {/* In-Shop Financials breakdown */}
              <div className="pt-2 space-y-1.5 border-t border-white/10 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>মোট সঞ্চয় জমা:</span>
                  <span className="font-bold text-emerald-300">৳ {totals.savingsShopTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>সঞ্চয় হতে বিল পরিশোধ:</span>
                  <span className="font-bold text-amber-400">- ৳ {totals.savingsShopBillTotal.toLocaleString()}</span>
                </div>
                <div className="flex items-baseline justify-between pt-1 border-t border-white/10">
                  <span className="text-xs font-black text-slate-200">অবশিষ্ট নিট ফান্ড:</span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.4)] tracking-tight">
                    ৳ {totals.netShopSavings.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setFormCategory("savings_shop");
                    setFormPaymentMode("cash");
                    setFormTitle("দোকানে নগদ সঞ্চয় জমা");
                    setIsFormOpen(true);
                  }}
                  className="py-2.5 px-3 bg-slate-900/90 hover:bg-emerald-950/60 text-emerald-300 border border-emerald-500/60 hover:border-emerald-400 rounded-full text-xs font-black transition-all flex items-center justify-center space-x-1 cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.2)] active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>+ সঞ্চয় জমা</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormCategory("bill_from_savings_shop");
                    setFormPaymentMode("savings_shop");
                    setFormTitle("দোকানের সঞ্চয় হতে বিল পরিশোধ");
                    setIsFormOpen(true);
                  }}
                  className="py-2.5 px-3 bg-slate-900/90 hover:bg-amber-950/60 text-amber-300 border border-amber-500/60 hover:border-amber-400 rounded-full text-xs font-black transition-all flex items-center justify-center space-x-1 cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.2)] active:scale-95"
                >
                  <Receipt className="w-3.5 h-3.5 text-amber-400" />
                  <span>- বিল পরিশোধ</span>
                </button>
              </div>
            </div>
          )}

          {/* Component 2: ব্যাংকে সঞ্চয় (In-Bank Savings / DPS) */}
          {(savingsTab === "both" || savingsTab === "bank") && (
            <div className="glass-panel-cyan rounded-3xl p-5 sm:p-6 flex flex-col justify-between space-y-3.5 transition-all group hover:scale-[1.01]">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_12px_rgba(0,200,255,0.3)]">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-100 flex items-center gap-1.5">
                      <span>ব্যাংকে সঞ্চয়</span>
                      <span className="text-[10px] font-black text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/40">
                        In-Bank / DPS
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium">ব্যাংক অ্যাকাউন্ট, ডিপিএস বা এফডিআর-এ সঞ্চয়</p>
                  </div>
                </div>
                {savingsTab === "bank" && (
                  <span className="text-[10px] font-bold text-cyan-300 bg-cyan-900/60 px-2.5 py-1 rounded-full border border-cyan-500/40">
                    সক্রিয় কম্পোনেন্ট
                  </span>
                )}
              </div>

              {/* Bank Financials breakdown */}
              <div className="pt-2 space-y-1.5 border-t border-white/10 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>মোট ব্যাংক জমা:</span>
                  <span className="font-bold text-cyan-300">৳ {totals.savingsBankTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>ব্যাংক হতে বিল পরিশোধ:</span>
                  <span className="font-bold text-purple-300">- ৳ {totals.savingsBankBillTotal.toLocaleString()}</span>
                </div>
                <div className="flex items-baseline justify-between pt-1 border-t border-white/10">
                  <span className="text-xs font-black text-slate-200">অবশিষ্ট নিট ব্যাংক ফান্ড:</span>
                  <span className="text-xl sm:text-2xl font-black text-cyan-300 drop-shadow-[0_0_12px_rgba(0,200,255,0.4)] tracking-tight">
                    ৳ {totals.netBankSavings.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setFormCategory("savings_bank");
                    setFormPaymentMode("bank");
                    setFormTitle("ব্যাংক অ্যাকাউন্টে সঞ্চয় / DPS কিস্তি জমা");
                    setIsFormOpen(true);
                  }}
                  className="py-2.5 px-3 bg-slate-900/90 hover:bg-cyan-950/60 text-cyan-300 border border-cyan-500/60 hover:border-cyan-400 rounded-full text-xs font-black transition-all flex items-center justify-center space-x-1 cursor-pointer shadow-[0_0_10px_rgba(0,200,255,0.2)] active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>+ সঞ্চয় জমা</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormCategory("bill_from_savings_bank");
                    setFormPaymentMode("savings_bank");
                    setFormTitle("ব্যাংকের সঞ্চয় হতে বিল পরিশোধ");
                    setIsFormOpen(true);
                  }}
                  className="py-2.5 px-3 bg-slate-900/90 hover:bg-purple-950/60 text-purple-300 border border-purple-500/60 hover:border-purple-400 rounded-full text-xs font-black transition-all flex items-center justify-center space-x-1 cursor-pointer shadow-[0_0_10px_rgba(168,85,247,0.2)] active:scale-95"
                >
                  <CreditCard className="w-3.5 h-3.5 text-purple-400" />
                  <span>- বিল পরিশোধ</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Expense Entry Form (ইনপুট ফরম - Modern Frosted Glass) */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="glass-panel rounded-3xl p-5 sm:p-6 shadow-2xl border border-white/15 space-y-4"
        >
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <h3 className="text-sm sm:text-base font-black text-slate-100 flex items-center space-x-2">
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>নতুন খরচ ও সঞ্চয় এন্ট্রি ফরম (Input Form)</span>
            </h3>
            <span className="text-xs text-slate-400">
              * গুগল শিটে স্বয়ংক্রিয় সিঙ্ক হবে
            </span>
          </div>

          {feedback && (
            <div
              className={`p-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 ${
                feedback.type === "success"
                  ? "bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                  : "bg-rose-950/70 border border-rose-500/50 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.2)]"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Date */}
            <div>
              <DateTimePicker
                label="তারিখ (দিন/মাস/বছর - DD/MM/YYYY) *"
                value={formDate}
                onChange={(newDate) => setFormDate(newDate)}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                খাত / ক্যাটাগরি (Category) *
              </label>
              <select
                value={formCategory}
                onChange={(e) => {
                  const cat = e.target.value as any;
                  setFormCategory(cat);
                  if (cat === "savings_shop") {
                    setFormPaymentMode("cash");
                    if (!formTitle) setFormTitle("দোকানে নগদ সঞ্চয় জমা");
                  } else if (cat === "savings_bank") {
                    setFormPaymentMode("bank");
                    if (!formTitle) setFormTitle("ব্যাংক অ্যাকাউন্টে সঞ্চয় / DPS কিস্তি জমা");
                  } else if (cat === "bill_from_savings_shop") {
                    setFormPaymentMode("savings_shop");
                    if (!formTitle) setFormTitle("দোকানের সঞ্চয় হতে বিল পরিশোধ");
                  } else if (cat === "bill_from_savings_bank") {
                    setFormPaymentMode("savings_bank");
                    if (!formTitle) setFormTitle("ব্যাংকের সঞ্চয় হতে বিল পরিশোধ");
                  }
                }}
                className="w-full border border-slate-700/80 rounded-2xl px-3.5 py-2.5 bg-slate-900/80 text-sm font-bold text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-slate-100">
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Title / Description */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                বিবরণ / কর্মচারীর নাম (Description) *
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="যেমন: রহিম (ভ্যানচালক বেতন), দোকান ভাড়া..."
                required
                className="w-full border border-slate-700/80 rounded-2xl px-3.5 py-2.5 bg-slate-900/80 text-sm font-bold text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 placeholder-slate-500"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                টাকার পরিমাণ (Amount ৳) *
              </label>
              <input
                type="number"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                placeholder="0.00"
                min="1"
                step="any"
                required
                className="w-full border border-cyan-500/50 rounded-2xl px-3.5 py-2.5 bg-slate-900/90 text-sm font-black text-cyan-300 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/40"
              />
            </div>

            {/* Payment Mode */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                পেমেন্ট মাধ্যম (Payment Mode)
              </label>
              <select
                value={formPaymentMode}
                onChange={(e) => setFormPaymentMode(e.target.value as any)}
                className="w-full border border-slate-700/80 rounded-2xl px-3.5 py-2.5 bg-slate-900/80 text-sm font-bold text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50"
              >
                <optgroup label="সাধারণ পেমেন্ট মাধ্যম (Regular Payment)" className="bg-slate-900 text-slate-300">
                  <option value="cash" className="bg-slate-900">💵 নগদ (Cash)</option>
                  <option value="mfs" className="bg-slate-900">📱 বিকাশ / নগদ (MFS)</option>
                  <option value="bank" className="bg-slate-900">🏦 সাধারণ ব্যাংক চেক / ট্রান্সফার</option>
                </optgroup>
                <optgroup label="সঞ্চয় ফান্ড হতে কর্তন (Cut / Deduct from Savings)" className="bg-slate-900 text-slate-300">
                  <option value="savings_shop" className="bg-slate-900">🏪 দোকানে সঞ্চয় হতে পরিশোধ (Cut from Shop Savings)</option>
                  <option value="savings_bank" className="bg-slate-900">🏦 ব্যাংকে সঞ্চয় হতে পরিশোধ (Cut from Bank Savings)</option>
                </optgroup>
              </select>
              {formPaymentMode === "savings_shop" && (
                <p className="text-[11px] font-bold text-emerald-400 mt-1 flex items-center gap-1">
                  <span>✂️ এই খরচের টাকা সরাসরি <strong>দোকানে সঞ্চয় ফান্ড</strong> হতে স্বয়ংক্রিয় কর্তন হবে।</span>
                </p>
              )}
              {formPaymentMode === "savings_bank" && (
                <p className="text-[11px] font-bold text-cyan-400 mt-1 flex items-center gap-1">
                  <span>✂️ এই খরচের টাকা সরাসরি <strong>ব্যাংকে সঞ্চয় ফান্ড</strong> হতে স্বয়ংক্রিয় কর্তন হবে।</span>
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                মন্তব্য / রসিদ নং (Optional Notes)
              </label>
              <input
                type="text"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="রসিদ নং, ভাউচার বা বিশেষ তথ্য..."
                className="w-full border border-slate-700/80 rounded-2xl px-3.5 py-2.5 bg-slate-900/80 text-sm font-medium text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 placeholder-slate-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-slate-950 rounded-full text-xs sm:text-sm font-black transition-all shadow-[0_0_20px_rgba(0,200,255,0.45)] border border-cyan-300/50 active:scale-95 disabled:opacity-50 flex items-center space-x-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>সংরক্ষণ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>খরচ সংরক্ষণ করুন (Save Expense)</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* 4. Filters & Search Toolbar - Modern Frosted Glass */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="flex items-center space-x-2 w-full md:w-auto flex-wrap gap-y-2">
          {/* Month Selector */}
          <div className="flex items-center space-x-1.5 bg-slate-900/90 rounded-full px-3.5 py-1.5 border border-slate-700/80 shadow-inner">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs font-bold bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-slate-200">সব মাস (All Months)</option>
              {availableMonths.map((m) => (
                <option key={m} value={m} className="bg-slate-900 text-slate-200">
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Category Selector */}
          <div className="flex items-center space-x-1.5 bg-slate-900/90 rounded-full px-3.5 py-1.5 border border-slate-700/80 shadow-inner">
            <Filter className="w-4 h-4 text-cyan-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs font-bold bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-slate-200">সকল খাত (All Categories)</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-slate-200">
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="flex items-center space-x-1 px-3.5 py-1.5 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-slate-950 rounded-full text-xs font-black transition-all shadow-[0_0_10px_rgba(0,200,255,0.3)] active:scale-95 cursor-pointer border border-cyan-300/50 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isFormOpen ? "ফর্ম লুকান" : "+ খরচ এন্ট্রি"}</span>
          </button>

          <button
            type="button"
            onClick={fetchExpenses}
            disabled={refreshing}
            className="w-8 h-8 flex items-center justify-center bg-slate-900/90 hover:bg-cyan-950/40 text-cyan-400 hover:text-cyan-300 rounded-full border border-cyan-500/60 hover:border-cyan-400 shadow-xs transition-all cursor-pointer active:scale-95 shrink-0"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-cyan-300" : ""}`} />
          </button>
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নাম বা বিবরণ দিয়ে খুঁজুন..."
            className="w-full pl-10 pr-3.5 py-2 bg-slate-900/90 border border-slate-700/80 rounded-full text-xs font-medium text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 placeholder-slate-500 shadow-inner"
          />
        </div>
      </div>

      {/* 5. Itemized Expense Ledger Table & List - Modern Frosted Glass */}
      <div className="glass-panel rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
          <span className="text-xs sm:text-sm font-black text-slate-100 flex items-center space-x-2">
            <Coins className="w-4 h-4 text-cyan-400" />
            <span>খরচের তালিকা (আইটেম অনুযায়ী খাতা)</span>
          </span>
          <span className="text-xs font-bold text-slate-400">
            মোট ফিল্টারকৃত খরচ: <strong className="text-cyan-300 drop-shadow-[0_0_8px_rgba(0,200,255,0.35)]">৳ {totals.grandTotal.toLocaleString()}</strong>
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-cyan-400" />
            <p className="text-xs font-bold">খরচের হিসাব লোড হচ্ছে...</p>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Info className="w-8 h-8 mx-auto text-slate-500" />
            <p className="text-sm font-bold text-slate-300">কোনো খরচের রেকর্ড পাওয়া যায়নি।</p>
            <p className="text-xs text-slate-500">উপরে "+ নতুন খরচ এন্ট্রি" বোতাম চেপে প্রথম খরচটি যোগ করুন।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-white/10 text-slate-300 font-black uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">তারিখ</th>
                  <th className="py-3.5 px-4">খাত (Category)</th>
                  <th className="py-3.5 px-4">বিবরণ / নাম</th>
                  <th className="py-3.5 px-4">পেমেন্ট মাধ্যম</th>
                  <th className="py-3.5 px-4 text-right">পরিমাণ (৳)</th>
                  <th className="py-3.5 px-4">মন্তব্য</th>
                  <th className="py-3.5 px-4 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium text-slate-200">
                {filteredExpenses.map((item) => {
                  const meta = getCategoryMeta(item.category);
                  const Icon = meta.icon;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-cyan-500/10 transition-colors group"
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-300">
                        {formatToDayMonthYear(item.date)}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-black border ${meta.bg} ${meta.color} ${meta.border} backdrop-blur-md shadow-xs`}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span>{meta.label}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-black text-slate-100">
                        {item.title}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {item.paymentMode === "savings_shop" ? (
                          <span className="inline-flex items-center space-x-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                            <span>🏪 দোকানে সঞ্চয় কর্তন</span>
                          </span>
                        ) : item.paymentMode === "savings_bank" ? (
                          <span className="inline-flex items-center space-x-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-blue-950/80 text-cyan-300 border border-blue-500/40">
                            <span>🏦 ব্যাংকে সঞ্চয় কর্তন</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-900/90 text-slate-300 border border-slate-700/80">
                            {item.paymentMode === "cash"
                              ? "💵 নগদ"
                              : item.paymentMode === "mfs"
                              ? "📱 বিকাশ/নগদ"
                              : "🏦 ব্যাংক"}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-black text-cyan-300 text-sm drop-shadow-[0_0_8px_rgba(0,200,255,0.3)]">
                        ৳ {item.amount.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {item.notes || "—"}
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.title)}
                          className="w-8 h-8 mx-auto rounded-full flex items-center justify-center bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500 hover:shadow-[0_0_8px_rgba(244,63,94,0.3)] transition-all cursor-pointer active:scale-95"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-950/90 font-black text-xs border-t border-white/10">
                  <td colSpan={4} className="py-3.5 px-4 text-slate-300">
                    ফিল্টারকৃত মোট খরচের যোগফল ({filteredExpenses.length} টি রেকর্ড):
                  </td>
                  <td className="py-3.5 px-4 text-right text-cyan-300 text-sm font-black drop-shadow-[0_0_8px_rgba(0,200,255,0.3)]">
                    ৳ {totals.grandTotal.toLocaleString()}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Modal: ৪. দৈনিক খরচের খাত (নিজ) তালিকা - Modern Frosted Glass */}
      {isPersonalListOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel-purple rounded-3xl p-5 sm:p-6 w-full max-w-lg shadow-2xl border border-purple-400/40 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/40 flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-100">
                    ব্যক্তিগত খরচ (নিজ) বিস্তারিত তালিকা
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    ৪. দৈনিক খরচের খাত (হালখাতা এন্ট্রি) হতে সংগৃহীত
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPersonalListOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-slate-100 hover:border-slate-500 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-between items-center p-3.5 rounded-2xl bg-slate-900/80 border border-purple-500/40 text-xs shadow-inner">
              <span className="font-bold text-slate-300">মোট ব্যক্তিগত খরচ:</span>
              <span className="text-base font-black text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">
                ৳ {personalExpenseTotals.allTimeTotal.toLocaleString()} ({personalExpensesList.length} টি এন্ট্রি)
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-white/5 text-xs pr-1">
              {personalExpensesList.length === 0 ? (
                <p className="text-center text-slate-400 py-8">কোনো ব্যক্তিগত খরচ (নিজ) পাওয়া যায়নি</p>
              ) : (
                personalExpensesList.map((item, idx) => (
                  <div key={`personal-${item.date}-${idx}`} className="py-2.5 flex justify-between items-center hover:bg-white/5 px-2.5 rounded-xl transition-colors">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-200">{item.date}</span>
                        {item.pageNo && (
                          <span className="text-[10px] bg-purple-950/70 border border-purple-500/40 px-2 py-0.2 rounded-full font-black text-purple-300">
                            পৃষ্ঠা #{item.pageNo}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">খাত: {item.type} ({item.day})</p>
                    </div>
                    <span className="text-sm font-black text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.3)]">
                      ৳ {item.amount.toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
