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
} from "lucide-react";
import { OverheadExpenseItem } from "@/lib/googleSheets";

const CATEGORIES = [
  { id: "employee", label: "কর্মচারী বেতন ও মজুরি", icon: Users, color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/60", border: "border-blue-200 dark:border-blue-800" },
  { id: "rent", label: "দোকান ও গোডাউন ভাড়া", icon: Building2, color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/60", border: "border-amber-200 dark:border-amber-800" },
  { id: "utilities", label: "বিদ্যুৎ ও গ্যাস বিল", icon: Zap, color: "text-yellow-700 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-950/60", border: "border-yellow-200 dark:border-yellow-800" },
  { id: "security", label: "মার্কেট সমিতি ও নাইটগার্ড", icon: Shield, color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/60", border: "border-emerald-200 dark:border-emerald-800" },
  { id: "transport", label: "গাড়ি/ভ্যান মেরামত ও ফুয়েল", icon: Truck, color: "text-purple-700 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/60", border: "border-purple-200 dark:border-purple-800" },
  { id: "tax", label: "ট্রেড লাইসেন্স ও ট্যাক্স", icon: FileSpreadsheet, color: "text-indigo-700 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/60", border: "border-indigo-200 dark:border-indigo-800" },
  { id: "extra", label: "অন্যান্য বিবিধ অতিরিক্ত খরচ", icon: Coins, color: "text-rose-700 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/60", border: "border-rose-200 dark:border-rose-800" },
];

export default function OverheadExpensesView() {
  const [expenses, setExpenses] = useState<OverheadExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState(true);

  // Form State
  const [formDate, setFormDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [formCategory, setFormCategory] = useState<OverheadExpenseItem["category"]>("employee");
  const [formTitle, setFormTitle] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formPaymentMode, setFormPaymentMode] = useState<OverheadExpenseItem["paymentMode"]>("cash");
  const [formNotes, setFormNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch from API with local cache
  const fetchExpenses = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/overhead");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setExpenses(json.data);
        try {
          localStorage.setItem("yolkflow_overhead_expenses", JSON.stringify(json.data));
        } catch (e) {}
      }
    } catch (err) {
      console.error("Failed to load overhead expenses:", err);
      // Try local cache
      try {
        const cached = localStorage.getItem("yolkflow_overhead_expenses");
        if (cached) setExpenses(JSON.parse(cached));
      } catch (e) {}
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Immediate load from localStorage first
    try {
      const cached = localStorage.getItem("yolkflow_overhead_expenses");
      if (cached) {
        setExpenses(JSON.parse(cached));
        setLoading(false);
      }
    } catch (e) {}
    fetchExpenses();
  }, []);

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

  // Aggregated Counters & Totals
  const totals = useMemo(() => {
    let employeeTotal = 0;
    let rentTotal = 0;
    let utilitiesTotal = 0;
    let extraTotal = 0;
    let grandTotal = 0;

    filteredExpenses.forEach((item) => {
      const amt = Number(item.amount) || 0;
      grandTotal += amt;
      if (item.category === "employee") {
        employeeTotal += amt;
      } else if (item.category === "rent") {
        rentTotal += amt;
      } else if (item.category === "utilities" || item.category === "security") {
        utilitiesTotal += amt;
      } else {
        extraTotal += amt;
      }
    });

    return {
      employeeTotal,
      rentTotal,
      utilitiesTotal,
      extraTotal,
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
        const updated = [json.data, ...expenses];
        setExpenses(updated);
        try {
          localStorage.setItem("yolkflow_overhead_expenses", JSON.stringify(updated));
        } catch (e) {}

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
      {/* 1. Header Banner & Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-2xl text-white shadow-sm">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
              কর্মচারী, দোকান ভাড়া ও অতিরিক্ত পরিচালন খরচ
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              বেতন, দোকান/গোডাউন ভাড়া, বিদ্যুৎ বিল ও মাসিক পরিচালন ব্যয়ের নির্ভুল খাতা
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isFormOpen ? "ফর্ম লুকান" : "+ নতুন খরচ এন্ট্রি"}</span>
          </button>

          <button
            onClick={fetchExpenses}
            disabled={refreshing}
            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-amber-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* 2. Top Summary Metric Cards (স্বয়ংক্রিয় যোগফল ও কাউন্টার) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: কর্মচারী ব্যয় */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex justify-between items-center">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-200 dark:border-blue-800">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
              বেতন ও হাজিরা
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">মোট কর্মচারী খরচ</p>
            <p className="text-xl sm:text-2xl font-black text-blue-900 dark:text-blue-300 mt-0.5">
              ৳ {totals.employeeTotal.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Card 2: দোকান ও গোডাউন ভাড়া */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex justify-between items-center">
            <div className="p-2 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-200 dark:border-amber-800">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
              দোকান/আড়ত
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">দোকান ও গোডাউন ভাড়া</p>
            <p className="text-xl sm:text-2xl font-black text-amber-800 dark:text-amber-300 mt-0.5">
              ৳ {totals.rentTotal.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Card 3: ইউটিলিটি ও বিল */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex justify-between items-center">
            <div className="p-2 bg-yellow-50 dark:bg-yellow-950/60 text-yellow-600 dark:text-yellow-400 rounded-xl border border-yellow-200 dark:border-yellow-800">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-950/80 px-2 py-0.5 rounded-full border border-yellow-200 dark:border-yellow-800">
              বিদ্যুৎ ও গার্ড
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">বিদ্যুৎ বিল ও নাইটগার্ড</p>
            <p className="text-xl sm:text-2xl font-black text-yellow-800 dark:text-yellow-400 mt-0.5">
              ৳ {totals.utilitiesTotal.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Card 4: সর্বমোট পরিচালন খরচ */}
        <div className="bg-gradient-to-br from-amber-600 to-amber-700 text-white rounded-2xl p-4 sm:p-5 shadow-md space-y-2">
          <div className="flex justify-between items-center">
            <div className="p-2 bg-white/20 rounded-xl">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <span className="text-[11px] font-bold bg-white/20 text-white px-2.5 py-0.5 rounded-full">
              {totals.count} টি এন্ট্রি
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-100">সর্বমোট পরিচালন খরচ</p>
            <p className="text-2xl sm:text-3xl font-black text-white mt-0.5">
              ৳ {totals.grandTotal.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Expense Entry Form (ইনপুট ফরম) */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4"
        >
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Plus className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>নতুন খরচ এন্ট্রি ফরম (Expense Input)</span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              * গুগল শিটে স্বয়ংক্রিয় সিঙ্ক হবে
            </span>
          </div>

          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 ${
                feedback.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200"
                  : "bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                তারিখ (Date) *
              </label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                required
                className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50/50 dark:bg-slate-800/60 text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                খরচের খাত (Category) *
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as any)}
                className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50/50 dark:bg-slate-800/60 text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Title / Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                বিবরণ / কর্মচারীর নাম (Description) *
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="যেমন: রহিম (ভ্যানচালক বেতন), দোকান ভাড়া..."
                required
                className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50/50 dark:bg-slate-800/60 text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
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
                className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50/50 dark:bg-slate-800/60 text-sm font-black text-amber-900 dark:text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Payment Mode */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                পেমেন্ট মাধ্যম (Payment Mode)
              </label>
              <select
                value={formPaymentMode}
                onChange={(e) => setFormPaymentMode(e.target.value as any)}
                className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50/50 dark:bg-slate-800/60 text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="cash">💵 নগদ (Cash)</option>
                <option value="mfs">📱 বিকাশ / নগদ (MFS)</option>
                <option value="bank">🏦 ব্যাংক চেক / ট্রান্সফার</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                মন্তব্য / রসিদ নং (Optional Notes)
              </label>
              <input
                type="text"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="রসিদ নং, ভাউচার বা বিশেষ তথ্য..."
                className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50/50 dark:bg-slate-800/60 text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center space-x-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>সংরক্ষণ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>খরচ সংরক্ষণ করুন (Save Expense)</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* 4. Filters & Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="flex items-center space-x-2 w-full md:w-auto flex-wrap gap-y-2">
          {/* Month Selector */}
          <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-1.5 border border-slate-300 dark:border-slate-700">
            <Calendar className="w-4 h-4 text-amber-600" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs font-bold bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
            >
              <option value="all">সব মাস (All Months)</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Category Selector */}
          <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-1.5 border border-slate-300 dark:border-slate-700">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs font-bold bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
            >
              <option value="all">সকল খাত (All Categories)</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নাম বা বিবরণ দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* 5. Itemized Expense Ledger Table & List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Coins className="w-4 h-4 text-amber-600" />
            <span>খরচের তালিকা (আইটেম অনুযায়ী খাতা)</span>
          </span>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            মোট ফিল্টারকৃত খরচ: <strong className="text-amber-800 dark:text-amber-300">৳ {totals.grandTotal.toLocaleString()}</strong>
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-600" />
            <p className="text-xs font-bold">খরচের হিসাব লোড হচ্ছে...</p>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 space-y-2">
            <Info className="w-8 h-8 mx-auto text-slate-400" />
            <p className="text-sm font-bold">কোনো খরচের রেকর্ড পাওয়া যায়নি।</p>
            <p className="text-xs">উপরে "+ নতুন খরচ এন্ট্রি" বোতাম চেপে প্রথম খরচটি যোগ করুন।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">তারিখ</th>
                  <th className="py-3 px-4">খাত (Category)</th>
                  <th className="py-3 px-4">বিবরণ / নাম</th>
                  <th className="py-3 px-4">পেমেন্ট মাধ্যম</th>
                  <th className="py-3 px-4 text-right">পরিমাণ (৳)</th>
                  <th className="py-3 px-4">মন্তব্য</th>
                  <th className="py-3 px-4 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                {filteredExpenses.map((item) => {
                  const meta = getCategoryMeta(item.category);
                  const Icon = meta.icon;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-amber-50/40 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3 px-4 whitespace-nowrap font-bold text-slate-700 dark:text-slate-300">
                        {item.date}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${meta.bg} ${meta.color} ${meta.border}`}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span>{meta.label}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                        {item.title}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {item.paymentMode === "cash"
                            ? "💵 নগদ"
                            : item.paymentMode === "mfs"
                            ? "📱 বিকাশ/নগদ"
                            : "🏦 ব্যাংক"}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap font-black text-amber-900 dark:text-amber-300 text-sm">
                        ৳ {item.amount.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                        {item.notes || "—"}
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.title)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50/90 dark:bg-slate-800/90 font-black text-xs border-t border-slate-200 dark:border-slate-800">
                  <td colSpan={4} className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    ফিল্টারকৃত মোট খরচের যোগফল ({filteredExpenses.length} টি রেকর্ড):
                  </td>
                  <td className="py-3 px-4 text-right text-amber-900 dark:text-amber-300 text-sm font-black">
                    ৳ {totals.grandTotal.toLocaleString()}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
