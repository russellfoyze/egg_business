"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Wallet,
  PiggyBank,
  TrendingUp,
  Plus,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Building,
  Package,
  ShieldCheck,
  CreditCard,
  Banknote,
  DollarSign,
  Tag,
} from "lucide-react";
import { SavingsItem } from "@/lib/googleSheets";
import DateTimePicker, { formatToDayMonthYear } from "./DateTimePicker";

const SAVINGS_CATEGORIES = [
  { label: "📦 ডিমের খালি খাঁচা / ট্রে বিক্রয়", value: "খাঁচা / ট্রে বিক্রয়", defaultType: "extra" },
  { label: "🏦 ব্যাংক সঞ্চয়ী / DPS / FDR", value: "ব্যাংক সঞ্চয়ী / DPS", defaultType: "deposit" },
  { label: "🛡️ আপদকালীন জরুরি তহবিল (Emergency Fund)", value: "জরুরি ব্যবসা তহবিল", defaultType: "deposit" },
  { label: "🤝 সমিতি / সমবায় সঞ্চয় জমা", value: "সমিতি / সমবায় সঞ্চয়", defaultType: "deposit" },
  { label: "📦 কার্টন ও খালি বস্তা বিক্রয়", value: "কার্টন ও বস্তা বিক্রয়", defaultType: "extra" },
  { label: "📈 ব্যাংক মুনাফা / লভ্যাংশ", value: "ব্যাংক মুনাফা / লভ্যাংশ", defaultType: "extra" },
  { label: "🚚 পরিবহন উদ্বৃত্ত / ডেলিভারি ফি", value: "পরিবহন উদ্বৃত্ত", defaultType: "extra" },
  { label: "📤 সঞ্চয় থেকে জরুরি উত্তোলন", value: "সঞ্চয় থেকে উত্তোলন", defaultType: "withdraw" },
  { label: "☕ অন্যান্য বিবিধ অতিরিক্ত আয়", value: "অন্যান্য অতিরিক্ত আয়", defaultType: "extra" },
];

export default function SavingsTrackerView() {
  const [items, setItems] = useState<SavingsItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Filters state
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("all");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Form State
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [formType, setFormType] = useState<"deposit" | "extra" | "withdraw">("extra");
  const [formCategory, setFormCategory] = useState<string>("খাঁচা / ট্রে বিক্রয়");
  const [formTitle, setFormTitle] = useState<string>("");
  const [formAmount, setFormAmount] = useState<string>("");
  const [formPaymentMode, setFormPaymentMode] = useState<string>("cash");
  const [formNotes, setFormNotes] = useState<string>("");

  const fetchSavings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/savings");
      const json = await res.json();
      if (json && json.data) {
        setItems(json.data);
      }
    } catch (err) {
      console.error("Error fetching savings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSavings();
  }, []);

  // When category changes, auto-select standard transaction type
  const handleCategoryChange = (catVal: string) => {
    setFormCategory(catVal);
    const matched = SAVINGS_CATEGORIES.find((c) => c.value === catVal);
    if (matched && matched.defaultType) {
      setFormType(matched.defaultType as "deposit" | "extra" | "withdraw");
    }
  };

  // Distinct Months in data
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    items.forEach((item) => {
      const m = item.month || (item.date ? item.date.slice(0, 7) : "");
      if (m) months.add(m);
    });
    return Array.from(months).sort().reverse();
  }, [items]);

  // Filtered List
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const m = item.month || (item.date ? item.date.slice(0, 7) : "");
      if (selectedMonth !== "all" && m !== selectedMonth) return false;
      if (selectedTypeFilter !== "all" && item.type !== selectedTypeFilter) return false;
      if (selectedCategoryFilter !== "all" && item.category !== selectedCategoryFilter) return false;
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesCat = item.category.toLowerCase().includes(q);
        const matchesNotes = (item.notes || "").toLowerCase().includes(q);
        const matchesAmt = item.amount.toString().includes(q);
        if (!matchesTitle && !matchesCat && !matchesNotes && !matchesAmt) return false;
      }
      return true;
    });
  }, [items, selectedMonth, selectedTypeFilter, selectedCategoryFilter, searchQuery]);

  // Live Summary Calculations
  const stats = useMemo(() => {
    let totalDeposits = 0;
    let totalExtras = 0;
    let totalWithdrawals = 0;

    filteredItems.forEach((item) => {
      const amt = Number(item.amount) || 0;
      if (item.type === "deposit") {
        totalDeposits += amt;
      } else if (item.type === "extra") {
        totalExtras += amt;
      } else if (item.type === "withdraw") {
        totalWithdrawals += amt;
      }
    });

    const netSavings = (totalDeposits + totalExtras) - totalWithdrawals;

    return {
      netSavings,
      totalDeposits,
      totalExtras,
      totalWithdrawals,
      totalCount: filteredItems.length,
    };
  }, [filteredItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFeedback({ type: "error", message: "অনুগ্রহ করে শিরোনাম বা বিবরণ লিখুন।" });
      return;
    }
    const amt = parseFloat(formAmount);
    if (isNaN(amt) || amt <= 0) {
      setFeedback({ type: "error", message: "অনুগ্রহ করে একটি বৈধ টাকার পরিমাণ লিখুন।" });
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedback(null);

      const res = await fetch("/api/savings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: formDate,
          type: formType,
          category: formCategory,
          title: formTitle,
          amount: amt,
          paymentMode: formPaymentMode,
          notes: formNotes,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setFeedback({ type: "success", message: "সঞ্চয় / অতিরিক্ত আয়ের ডাটা গুগল শিটে সফলভাবে সংরক্ষিত হয়েছে!" });
        setFormTitle("");
        setFormAmount("");
        setFormNotes("");
        fetchSavings();
      } else {
        setFeedback({ type: "error", message: json.error || "সংরক্ষণ করতে সমস্যা হয়েছে।" });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "নেটওয়ার্ক ত্রুটি।" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`আপনি কি "${title}" এর রেকর্ডটি নিশ্চিতভাবে মুছে ফেলতে চান?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/savings?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: "success", message: `"${title}" সফলভাবে মুছে ফেলা হয়েছে।` });
        fetchSavings();
      } else {
        alert("মুছে ফেলতে সমস্যা হয়েছে: " + json.error);
      }
    } catch (err: any) {
      alert("ত্রুটি: " + err.message);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn">
      {/* 1. Header Banner */}
      <div className="glass-panel rounded-3xl p-5 sm:p-7 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-3.5 py-1 rounded-full text-xs font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              <PiggyBank className="w-3.5 h-3.5 text-emerald-400" />
              <span>ব্যবসায়িক সঞ্চয় ও অতিরিক্ত তহবিল খতিয়ান</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-100 flex items-center gap-2">
              <span>সঞ্চয়, ট্রে বিক্রয় ও রিজার্ভ খাতা</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium leading-relaxed">
              ডিমের খালি খাঁচা/ট্রে বিক্রয়, কার্টন/বস্তা বিক্রয়, ব্যাংক ডিপিএস এবং আপদকালীন জরুরি তহবিলের স্বয়ংক্রিয় হিসাবরক্ষণ
            </p>
          </div>

          <button
            onClick={fetchSavings}
            disabled={isLoading}
            className="self-start md:self-auto flex items-center space-x-2 px-5 py-2.5 bg-slate-900/90 hover:bg-slate-800 text-cyan-300 active:scale-95 rounded-full text-xs sm:text-sm font-bold border border-cyan-500/60 hover:border-cyan-400 shadow-[0_0_12px_rgba(0,200,255,0.25)] transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-cyan-400" : "text-cyan-400"}`} />
            <span>{isLoading ? "সিঙ্ক হচ্ছে..." : "রিফ্রেশ ও শিট সিঙ্ক"}</span>
          </button>
        </div>
      </div>

      {/* 2. Live Summary Analytics Cards (স্বয়ংক্রিয় হিসাব ও কাউন্টার) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Net Savings Reserve */}
        <div className="glass-panel-emerald rounded-3xl p-4 sm:p-5 space-y-1 relative overflow-hidden group shadow-lg">
          <div className="flex justify-between items-center text-emerald-300 text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>মোট নিট সঞ্চয় স্থিতি</span>
            </span>
            <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-black">
              নেট ফান্ড
            </span>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-300 tracking-tight pt-1">
            ৳ {stats.netSavings.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-400/90 font-medium">
            (জমা + অতিরিক্ত আয়) - উত্তোলন
          </p>
        </div>

        {/* Card 2: Total Savings Deposit */}
        <div className="glass-panel-cyan rounded-3xl p-4 sm:p-5 space-y-1 relative overflow-hidden group shadow-lg">
          <div className="flex justify-between items-center text-cyan-300 text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <PiggyBank className="w-4 h-4 text-cyan-400" />
              <span>মোট সঞ্চয় জমা</span>
            </span>
            <span className="text-[10px] bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full font-black">
              DPS / সমিতি
            </span>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-black text-cyan-300 tracking-tight pt-1">
            ৳ {stats.totalDeposits.toLocaleString()}
          </div>
          <p className="text-[11px] text-cyan-400/90 font-medium">
            ব্যাংক ডিপিএস ও জরুরি রিজার্ভ ফান্ড
          </p>
        </div>

        {/* Card 3: Total Extra Inflows & Tray Sales */}
        <div className="glass-panel-amber rounded-3xl p-4 sm:p-5 space-y-1 relative overflow-hidden group shadow-lg">
          <div className="flex justify-between items-center text-amber-300 text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>ট্রে বিক্রয় ও অতিরিক্ত আয়</span>
            </span>
            <span className="text-[10px] bg-amber-950/80 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-black">
              অতিরিক্ত জমা
            </span>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-black text-amber-300 tracking-tight pt-1">
            ৳ {stats.totalExtras.toLocaleString()}
          </div>
          <p className="text-[11px] text-amber-400/90 font-medium">
            খাঁচা/ট্রে, কার্টন ও খোসা বিক্রয় আয়
          </p>
        </div>

        {/* Card 4: Total Withdrawals */}
        <div className="glass-panel-rose rounded-3xl p-4 sm:p-5 space-y-1 relative overflow-hidden group shadow-lg">
          <div className="flex justify-between items-center text-rose-300 text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <ArrowDownLeft className="w-4 h-4 text-rose-400" />
              <span>মোট তহবিল উত্তোলন</span>
            </span>
            <span className="text-[10px] bg-rose-950/80 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full font-black">
              উত্তোলন
            </span>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-black text-rose-400 tracking-tight pt-1">
            ৳ {stats.totalWithdrawals.toLocaleString()}
          </div>
          <p className="text-[11px] text-rose-400/90 font-medium">
            জরুরি স্টক ক্রয় বা তহবিল সমন্বয়
          </p>
        </div>
      </div>

      {/* 3. Smart Entry Form */}
      <div className="glass-panel rounded-3xl p-5 sm:p-7 shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <h3 className="text-base font-black text-slate-100 flex items-center space-x-2">
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>নতুন সঞ্চয় / অতিরিক্ত আয় / উত্তোলন এন্ট্রি</span>
          </h3>
          <span className="text-[11px] font-bold text-cyan-300 bg-slate-900/90 border border-cyan-500/50 px-3 py-1 rounded-full">
            গুগল শিটে স্বয়ংক্রিয় সিঙ্ক
          </span>
        </div>

        {feedback && (
          <div
            className={`p-3.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2.5 shadow-sm animate-fadeIn ${
              feedback.type === "success"
                ? "bg-emerald-950/70 border border-emerald-500/50 text-emerald-200"
                : "bg-rose-950/70 border border-rose-500/50 text-rose-200"
            }`}
          >
            {feedback.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />}
            <span>{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Top Row: Date, Transaction Type & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Date */}
            <div>
              <DateTimePicker
                label="তারিখ (দিন/মাস/বছর - DD/MM/YYYY) *"
                value={formDate}
                onChange={(newDate) => setFormDate(newDate)}
              />
            </div>

            {/* Transaction Type */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                লেনদেনের ধরন (Type)
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as "deposit" | "extra" | "withdraw")}
                className="w-full px-3 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs sm:text-sm font-bold text-slate-100 focus:border-cyan-400 focus:outline-none"
              >
                <option value="extra">✨ অতিরিক্ত আয় / ট্রে বিক্রয় (+ Extra Inflow)</option>
                <option value="deposit">📥 সঞ্চয় জমা (+ Savings Deposit)</option>
                <option value="withdraw">📤 সঞ্চয় থেকে উত্তোলন (- Withdrawal)</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                খাত / ক্যাটাগরি (Category)
              </label>
              <select
                value={formCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs sm:text-sm font-bold text-slate-100 focus:border-cyan-400 focus:outline-none"
              >
                {SAVINGS_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Middle Row: Title, Amount, Payment Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Title / Description */}
            <div className="sm:col-span-6">
              <label className="block text-xs font-bold text-slate-300 mb-1">
                বিবরণ / শিরোনাম (Description)
              </label>
              <input
                type="text"
                placeholder="যেমন: ৫০০ পিস ট্রে বিক্রয়, ডিপিএস কিস্তি জমা, আপদকালীন ফান্ড"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs sm:text-sm font-bold text-slate-100 focus:border-cyan-400 focus:outline-none placeholder-slate-500"
                required
              />
            </div>

            {/* Amount */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-300 mb-1">
                টাকার পরিমাণ (Amount ৳)
              </label>
              <input
                type="number"
                step="any"
                placeholder="৳ ০"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs sm:text-sm font-black text-slate-100 focus:border-cyan-400 focus:outline-none placeholder-slate-500"
                required
              />
            </div>

            {/* Payment Mode */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-300 mb-1">
                পেমেন্ট মাধ্যম (Payment Mode)
              </label>
              <select
                value={formPaymentMode}
                onChange={(e) => setFormPaymentMode(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs sm:text-sm font-bold text-slate-100 focus:border-cyan-400 focus:outline-none"
              >
                <option value="cash">💵 নগদ (Cash)</option>
                <option value="mfs">📱 বিকাশ / নগদ (MFS)</option>
                <option value="bank">🏦 ব্যাংক অ্যাকাউন্ট / চেক</option>
              </select>
            </div>
          </div>

          {/* Bottom Row: Notes & Submit Button */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-9">
              <label className="block text-xs font-bold text-slate-300 mb-1">
                মন্তব্য / রসিদ নং / অতিরিক্ত তথ্য (Notes - Optional)
              </label>
              <input
                type="text"
                placeholder="যেমন: রসিদ নং-৮৯২, ক্রেতা: মদিনা পোলট্রি, একাউন্ট নং ইত্যাদি"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs sm:text-sm font-medium text-slate-100 focus:border-cyan-400 focus:outline-none placeholder-slate-500"
              />
            </div>

            <div className="sm:col-span-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-cyan-400 via-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-slate-950 font-black text-xs sm:text-sm rounded-full shadow-[0_0_20px_rgba(0,200,255,0.4)] border border-cyan-300/60 transition-all flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>সিঙ্ক হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 text-slate-950" />
                    <span>সংরক্ষণ করুন (Save)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 4. Filters & Search Bar */}
      <div className="glass-panel rounded-2xl p-3 sm:p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="খাত, বিবরণ বা টাকার অঙ্ক খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs font-bold text-slate-100 focus:border-cyan-400 focus:outline-none"
          />
        </div>

        {/* Month Filter */}
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs font-bold text-slate-200 focus:outline-none"
          >
            <option value="all">সব মাস (All Months)</option>
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-cyan-400 shrink-0" />
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs font-bold text-slate-200 focus:outline-none"
          >
            <option value="all">সব লেনদেন (All Types)</option>
            <option value="deposit">📥 সঞ্চয় জমা</option>
            <option value="extra">✨ অতিরিক্ত আয় / ট্রে বিক্রয়</option>
            <option value="withdraw">📤 তহবিল উত্তোলন</option>
          </select>
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategoryFilter}
          onChange={(e) => setSelectedCategoryFilter(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs font-bold text-slate-200 focus:outline-none"
        >
          <option value="all">সব খাত (All Categories)</option>
          {SAVINGS_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.value}
            </option>
          ))}
        </select>
      </div>

      {/* 5. Itemized Ledger Table */}
      <div className="glass-panel rounded-3xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm sm:text-base font-black text-slate-100">
              সঞ্চয় ও অতিরিক্ত আয়ের তালিকা ({filteredItems.length} টি রেকর্ড)
            </h3>
          </div>
          <span className="text-xs font-black text-emerald-300 bg-emerald-950/80 px-3.5 py-1 rounded-full border border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
            নিট স্থিতি: ৳ {stats.netSavings.toLocaleString()}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-900/90 border-b border-white/10 text-cyan-300 font-black uppercase text-[11px] tracking-wider">
                <th className="py-3 px-3.5">তারিখ</th>
                <th className="py-3 px-3">ধরন</th>
                <th className="py-3 px-3">খাত</th>
                <th className="py-3 px-4">বিবরণ / শিরোনাম</th>
                <th className="py-3 px-3">মাধ্যম</th>
                <th className="py-3 px-4 text-right">টাকার পরিমাণ (৳)</th>
                <th className="py-3 px-3 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    <PiggyBank className="w-8 h-8 mx-auto mb-2 opacity-40 text-cyan-400" />
                    <p className="font-bold text-xs">কোনো সঞ্চয় বা অতিরিক্ত আয়ের রেকর্ড পাওয়া যায়নি</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isDeposit = item.type === "deposit";
                  const isExtra = item.type === "extra";
                  const isWithdraw = item.type === "withdraw";

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Date */}
                      <td className="py-3 px-3.5 font-bold text-slate-200 whitespace-nowrap">
                        {formatToDayMonthYear(item.date)}
                      </td>

                      {/* Type Badge */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {isDeposit && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-cyan-950/80 text-cyan-300 border border-cyan-500/50">
                            <ArrowUpRight className="w-3 h-3" />
                            <span>সঞ্চয় জমা</span>
                          </span>
                        )}
                        {isExtra && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-950/80 text-amber-300 border border-amber-500/50">
                            <Sparkles className="w-3 h-3" />
                            <span>ট্রে/অতিরিক্ত আয়</span>
                          </span>
                        )}
                        {isWithdraw && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-950/80 text-rose-300 border border-rose-500/50">
                            <ArrowDownLeft className="w-3 h-3" />
                            <span>উত্তোলন</span>
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 font-semibold text-slate-300 whitespace-nowrap">
                        {item.category}
                      </td>

                      {/* Title & Notes */}
                      <td className="py-3 px-4 font-bold text-slate-100">
                        <div>{item.title}</div>
                        {item.notes && (
                          <div className="text-[11px] text-slate-400 font-normal mt-0.5">{item.notes}</div>
                        )}
                      </td>

                      {/* Payment Mode */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="text-xs font-semibold text-slate-300 bg-slate-800/90 px-2 py-0.5 rounded-md border border-white/10">
                          {item.paymentMode === "cash" ? "💵 নগদ" : item.paymentMode === "mfs" ? "📱 MFS" : "🏦 ব্যাংক"}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 text-right whitespace-nowrap font-black text-sm">
                        {isWithdraw ? (
                          <span className="text-rose-400">- ৳ {item.amount.toLocaleString()}</span>
                        ) : isExtra ? (
                          <span className="text-amber-300">+ ৳ {item.amount.toLocaleString()}</span>
                        ) : (
                          <span className="text-emerald-300">+ ৳ {item.amount.toLocaleString()}</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.title)}
                          title="রেকর্ড মুছুন"
                          className="w-7 h-7 mx-auto rounded-full flex items-center justify-center bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500 hover:shadow-[0_0_8px_rgba(244,63,94,0.3)] transition-all cursor-pointer active:scale-95"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {filteredItems.length > 0 && (
              <tfoot>
                <tr className="bg-slate-900/90 font-black border-t border-white/10">
                  <td colSpan={5} className="py-3.5 px-4 text-right text-slate-300">
                    সর্বমোট নিট তহবিল ব্যালেন্স:
                  </td>
                  <td className="py-3.5 px-4 text-right text-emerald-300 text-base">
                    ৳ {stats.netSavings.toLocaleString()}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
