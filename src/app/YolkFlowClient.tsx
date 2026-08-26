"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Trash2,
  Calendar,
  FileText,
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  Loader2,
  Calculator,
  RefreshCw,
  Edit3,
  Layers,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Zap,
  Coins,
  PieChart,
  Activity,
  ShieldAlert,
  Scale,
  Gauge,
  AlertTriangle,
  ArrowUpRight,
  Wallet,
  Percent,
  CheckCircle2,
  Building2,
  LogOut,
  UserCheck,
} from "lucide-react";
import { ComputedDayData, saveLedgerEntryAction } from "./actions";
import OverheadExpensesView from "./OverheadExpensesView";
import LoginScreen from "./LoginScreen";
import { UserAccount } from "@/lib/auth";

interface YolkFlowClientProps {
  initialData: ComputedDayData[];
}

const DEFAULT_RATES: { [key: string]: number } = {
  "সাদা (White Egg)": 10.9,
  "লাল (Red Egg)": 11.25,
  "হাঁস (Duck Egg)": 17.0,
  "মুরগী (Chicken Egg)": 15.0,
  "কোয়েল (Quail Egg)": 3.0,
  "L.M": 8.5,
};

const EXPENSE_PRESETS = [
  "নাস্তা-চা",
  "ট্রে-ফের",
  "নিজ",
  "সমিতি",
  "বাড়ি",
  "রিকসা+ফকির",
  "ভাঙ্গা",
  "Other",
];

const EGG_TYPES = [
  "সাদা (White Egg)",
  "লাল (Red Egg)",
  "হাঁস (Duck Egg)",
  "মুরগী (Chicken Egg)",
  "কোয়েল (Quail Egg)",
  "L.M",
];

const EGG_COLORS: { [key: string]: { stroke: string; fill: string; dot: string; label: string } } = {
  "সাদা (White Egg)": { stroke: "#64748b", fill: "rgba(226, 232, 240, 0.25)", dot: "#475569", label: "সাদা ডিম" },
  "লাল (Red Egg)": { stroke: "#e05666", fill: "rgba(224, 86, 102, 0.12)", dot: "#be123c", label: "লাল ডিম" },
  "হাঁস (Duck Egg)": { stroke: "#10b981", fill: "rgba(16, 185, 129, 0.12)", dot: "#059669", label: "হাঁসের ডিম" },
  "মুরগী (Chicken Egg)": { stroke: "#3b82f6", fill: "rgba(59, 130, 246, 0.12)", dot: "#2563eb", label: "মুরগীর ডিম" },
  "কোয়েল (Quail Egg)": { stroke: "#8b5cf6", fill: "rgba(139, 92, 246, 0.12)", dot: "#7c3aed", label: "কোয়েলের ডিম" },
  "L.M": { stroke: "#9a5b28", fill: "rgba(154, 91, 40, 0.12)", dot: "#78350f", label: "L.M" },
};

export const BANGLA_DAYS_MAP: { [key: string]: string } = {
  sunday: "রবিবার",
  monday: "সোমবার",
  tuesday: "মঙ্গলবার",
  wednesday: "বুধবার",
  thursday: "বৃহস্পতিবার",
  friday: "শুক্রবার",
  saturday: "শনিবার",
  sun: "রবিবার",
  mon: "সোমবার",
  tue: "মঙ্গলবার",
  wed: "বুধবার",
  thu: "বৃহস্পতিবার",
  fri: "শুক্রবার",
  sat: "শনিবার",
  "রবি": "রবিবার",
  "সোম": "সোমবার",
  "মঙ্গল": "মঙ্গলবার",
  "বুধ": "বুধবার",
  "বৃহস্পতি": "বৃহস্পতিবার",
  "শুক্র": "শুক্রবার",
  "শনি": "শনিবার",
  "রবিবার": "রবিবার",
  "সোমবার": "সোমবার",
  "মঙ্গলবার": "মঙ্গলবার",
  "বুধবার": "বুধবার",
  "বৃহস্পতিবার": "বৃহস্পতিবার",
  "শুক্রবার": "শুক্রবার",
  "শনিবার": "শনিবার",
};

export const getBanglaDay = (dayStr?: string): string => {
  if (!dayStr) return "";
  const cleaned = dayStr.trim().toLowerCase();
  return BANGLA_DAYS_MAP[cleaned] || BANGLA_DAYS_MAP[dayStr.trim()] || dayStr.trim();
};

export default function YolkFlowClient({ initialData }: YolkFlowClientProps) {
  const [data, setData] = useState<ComputedDayData[]>(initialData);
  const [activeTab, setActiveTab] = useState<"dashboard" | "entry" | "overhead">("dashboard");
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [authLoaded, setAuthLoaded] = useState<boolean>(false);

  // Load auth session on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("yolkflow_auth_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        setCurrentUser(parsed);
        if (parsed.allowedTabs && parsed.allowedTabs.length > 0 && !parsed.allowedTabs.includes("dashboard")) {
          setActiveTab(parsed.allowedTabs[0]);
        }
      }
    } catch (e) {}
    setAuthLoaded(true);
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem("yolkflow_auth_user");
    } catch (e) {}
    setCurrentUser(null);
  };

  // Keep data in sync with initialData from server
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setData(initialData);
    }
  }, [initialData]);

  // Dashboard state: specific day selection & live refresh
  const [selectedDashboardDate, setSelectedDashboardDate] = useState<string>("");
  const [selectedDateRange, setSelectedDateRange] = useState<string>("all");
  const [selectedProfitDateRange, setSelectedProfitDateRange] = useState<string>("weekly");
  const [selectedEggPriceFilter, setSelectedEggPriceFilter] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleRefreshData = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch("/api/data");
      const json = await res.json();
      if (json && json.data) {
        setData(json.data);
      }
    } catch (e) {
      console.error("Error refreshing data:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Form State
  const [formDate, setFormDate] = useState<string>("");
  const [formDay, setFormDay] = useState<string>("");
  const [formPageNo, setFormPageNo] = useState<string>("");

  const [stockEntries, setStockEntries] = useState(
    EGG_TYPES.map((type) => ({
      eggType: type,
      currentStock: 0,
      hasPurchase: false,
      purchaseRate: DEFAULT_RATES[type] || 0,
      purchaseQty: 0,
    }))
  );

  const [totalDue, setTotalDue] = useState<number>(0);
  const [extraDue, setExtraDue] = useState<number>(0);
  const [extraCollectionItems, setExtraCollectionItems] = useState<{ label: string; amount: number }[]>([]);
  const [totalCash, setTotalCash] = useState<number>(0);
  const [prevDayBalance, setPrevDayBalance] = useState<number>(0);

  const [providerName, setProviderName] = useState<string>("");
  const [providerPhone, setProviderPhone] = useState<string>("");
  const [providerEggType, setProviderEggType] = useState<string>(EGG_TYPES[0]);
  const [providerDueMoney, setProviderDueMoney] = useState<number>(0);
  const [providerUnitPrice, setProviderUnitPrice] = useState<number>(0);

  const [extraDueItems, setExtraDueItems] = useState<
    { label: string; qty: number; unitPrice: number; amount: number }[]
  >([]);

  const [expenses, setExpenses] = useState<
    {
      expenseType: string;
      customName?: string;
      amount: number;
      wastedEggQty: number;
      wastedEggCost: number;
    }[]
  >([{ expenseType: "নাস্তা-চা", customName: "", amount: 0, wastedEggQty: 0, wastedEggCost: 0 }]);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Set today's date and day as default
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setFormDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  // Auto-compute day when date changes
  useEffect(() => {
    if (!formDate) return;
    const dateObj = new Date(formDate);
    const options: Intl.DateTimeFormatOptions = { weekday: "long" };
    const dayName = new Intl.DateTimeFormat("en-US", options).format(dateObj);
    setFormDay(getBanglaDay(dayName));

    // Auto-populate if existing entry found (Edit Mode)
    const existingEntry = data.find((e) => e.date === formDate);
    if (existingEntry) {
      setFormPageNo(existingEntry.pageNo);
      setTotalDue(existingEntry.financials.totalDue || 0);
      setExtraDue(existingEntry.financials.extraDue || 0);
      setTotalCash(existingEntry.financials.totalCash || 0);
      setPrevDayBalance(existingEntry.financials.prevDayBalance || 0);

      setProviderName(existingEntry.financials.providerName || "");
      setProviderPhone(existingEntry.financials.providerPhone || "");
      setProviderEggType(existingEntry.financials.providerEggType || EGG_TYPES[0]);
      setProviderDueMoney(existingEntry.financials.providerDueMoney || 0);
      setProviderUnitPrice(existingEntry.financials.providerUnitPrice || 0);

      // Load extra collection items if present
      if (existingEntry.financials.extraCollections && existingEntry.financials.extraCollections.length > 0) {
        setExtraCollectionItems(
          existingEntry.financials.extraCollections.map((c) => ({
            label: c.label || "অন্যান্য আদায়",
            amount: c.amount || 0,
          }))
        );
      } else if (existingEntry.financials.extraDue > 0) {
        setExtraCollectionItems([{ label: "অন্যান্য পাওনা / আদায়", amount: existingEntry.financials.extraDue }]);
      } else {
        setExtraCollectionItems([]);
      }

      // Load extra due items if present
      if (existingEntry.financials.extraDues && existingEntry.financials.extraDues.length > 0) {
        setExtraDueItems(
          existingEntry.financials.extraDues.map((d) => ({
            label: d.label || "অন্যান্য দেনা",
            qty: d.qty || 0,
            unitPrice: d.unitPrice || 0,
            amount: d.amount || 0,
          }))
        );
      } else if (existingEntry.financials.providerDueMoney > 0) {
        setExtraDueItems([
          {
            label: existingEntry.financials.providerName || "মহাজন দেনা",
            qty: 0,
            unitPrice: 0,
            amount: existingEntry.financials.providerDueMoney,
          },
        ]);
      } else {
        setExtraDueItems([]);
      }

      setStockEntries(
        EGG_TYPES.map((type) => {
          const item = existingEntry.stock[type];
          return {
            eggType: type,
            currentStock: item ? item.currentStock : 0,
            hasPurchase: item ? item.hasPurchase : false,
            purchaseRate: item ? item.purchaseRate : DEFAULT_RATES[type] || 0,
            purchaseQty: item ? item.purchaseQty : 0,
          };
        })
      );

      if (existingEntry.expenses.list.length > 0) {
        setExpenses(
          existingEntry.expenses.list.map((exp) => ({
            expenseType: exp.type,
            amount: exp.amount,
            wastedEggQty: exp.wastedEggQty,
            wastedEggCost: exp.wastedEggCost,
          }))
        );
      } else {
        setExpenses([{ expenseType: "নাস্তা-চা", customName: "", amount: 0, wastedEggQty: 0, wastedEggCost: 0 }]);
      }
    } else {
      setFormPageNo("");
      setTotalDue(0);
      setExtraDue(0);
      setExtraCollectionItems([]);
      setTotalCash(0);
      setPrevDayBalance(0);
      setProviderName("");
      setProviderPhone("");
      setProviderEggType(EGG_TYPES[0]);
      setProviderDueMoney(0);
      setProviderUnitPrice(0);
      setExtraDueItems([]);
      setStockEntries(
        EGG_TYPES.map((type) => ({
          eggType: type,
          currentStock: 0,
          hasPurchase: false,
          purchaseRate: DEFAULT_RATES[type] || 0,
          purchaseQty: 0,
        }))
      );
      setExpenses([{ expenseType: "নাস্তা-চা", customName: "", amount: 0, wastedEggQty: 0, wastedEggCost: 0 }]);
    }
  }, [formDate, data]);

  // Set today shortcut
  const handleSetToday = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setFormDate(`${yyyy}-${mm}-${dd}`);
  };

  // Create New Day helper
  const handleCreateNewDay = () => {
    const lastEntry = data[data.length - 1];
    let nextDateStr = "2026-08-24";
    let nextPageNoStr = "97";
    let nextPrevBalance = 0;

    if (lastEntry) {
      const lastDate = new Date(lastEntry.date);
      lastDate.setDate(lastDate.getDate() + 1);
      const yyyy = lastDate.getFullYear();
      const mm = String(lastDate.getMonth() + 1).padStart(2, "0");
      const dd = String(lastDate.getDate()).padStart(2, "0");
      nextDateStr = `${yyyy}-${mm}-${dd}`;
      nextPageNoStr = String(Number(lastEntry.pageNo) + 1 || 97);
      nextPrevBalance = lastEntry.financials.prevDayBalance || 0;
    }

    setFormDate(nextDateStr);
    setFormPageNo(nextPageNoStr);
    setPrevDayBalance(nextPrevBalance);
    setTotalDue(0);
    setExtraDue(0);
    setExtraCollectionItems([]);
    setTotalCash(0);
    setExtraDueItems([]);

    if (lastEntry) {
      setStockEntries(
        EGG_TYPES.map((type) => {
          const item = lastEntry.stock[type];
          return {
            eggType: type,
            currentStock: item ? item.currentStock : 0,
            hasPurchase: false,
            purchaseRate: item ? item.purchaseRate : DEFAULT_RATES[type] || 0,
            purchaseQty: 0,
          };
        })
      );
    }

    setExpenses([
      { expenseType: "নাস্তা-চা", customName: "", amount: 0, wastedEggQty: 0, wastedEggCost: 0 },
      { expenseType: "ট্রে-ফের", customName: "", amount: 0, wastedEggQty: 0, wastedEggCost: 0 },
    ]);

    setActiveTab("entry");
    setSubmitMessage({
      type: "success",
      text: `নতুন পাতা (পৃষ্ঠা #${nextPageNoStr}) তৈরি হচ্ছে — আজকের তথ্য বসিয়ে সেভ করুন।`,
    });
  };

  // Dynamic Collection Items Handlers
  const addCollectionItem = () => {
    setExtraCollectionItems((prev) => [...prev, { label: "", amount: 0 }]);
  };

  const removeCollectionItem = (index: number) => {
    setExtraCollectionItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCollectionItemChange = (index: number, field: "label" | "amount", value: any) => {
    setExtraCollectionItems((prev) => {
      const updated = [...prev];
      if (field === "amount") {
        updated[index] = { ...updated[index], amount: Number(value) || 0 };
      } else {
        updated[index] = { ...updated[index], label: value };
      }
      return updated;
    });
  };

  // Dynamic Due Items Handlers
  const addDueItem = () => {
    setExtraDueItems((prev) => [...prev, { label: "", qty: 0, unitPrice: 0, amount: 0 }]);
  };

  const removeDueItem = (index: number) => {
    setExtraDueItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDueItemChange = (index: number, field: "label" | "qty" | "unitPrice" | "amount", value: any) => {
    setExtraDueItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };

      if (field === "qty") {
        const qty = Number(value) || 0;
        item.qty = qty;
        if (item.unitPrice > 0) {
          item.amount = Number((qty * item.unitPrice).toFixed(2));
        }
      } else if (field === "unitPrice") {
        const unitPrice = Number(value) || 0;
        item.unitPrice = unitPrice;
        if (item.qty > 0) {
          item.amount = Number((item.qty * unitPrice).toFixed(2));
        }
      } else if (field === "amount") {
        item.amount = Number(value) || 0;
      } else {
        item.label = value;
      }

      updated[index] = item;
      return updated;
    });
  };

  // Handle stock field changes
  const handleStockChange = (index: number, field: string, value: any) => {
    const updated = [...stockEntries];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setStockEntries(updated);
  };

  // Handle expense rows (adds new row at the top)
  const addExpenseRow = () => {
    setExpenses([
      { expenseType: "নাস্তা-চা", customName: "", amount: 0, wastedEggQty: 0, wastedEggCost: 0 },
      ...expenses,
    ]);
  };

  const removeExpenseRow = (index: number) => {
    if (expenses.length > 1) {
      setExpenses(expenses.filter((_, i) => i !== index));
    }
  };

  const handleExpenseChange = (index: number, field: string, value: any) => {
    const updated = [...expenses];
    const current = { ...updated[index], [field]: value };

    // Auto-calculate wasted egg cost
    if (current.expenseType === "ভাঙ্গা" && field === "wastedEggQty") {
      const avgRate = DEFAULT_RATES["সাদা (White Egg)"] || 10.9;
      current.wastedEggCost = Number((Number(value) * avgRate).toFixed(2));
      current.amount = current.wastedEggCost;
    }

    updated[index] = current;
    setExpenses(updated);
  };

  // LIVE FORM CALCULATIONS
  // 1. Stock Valuation (Table 1 Total): B6*C6 + ... + B11*C11 (Cell D12)
  const formLiveStockValuation = useMemo(() => {
    return stockEntries.reduce((total, entry) => {
      const rate = entry.purchaseRate > 0 ? entry.purchaseRate : DEFAULT_RATES[entry.eggType] || 0;
      return total + entry.currentStock * rate;
    }, 0);
  }, [stockEntries]);

  // Total Stock Quantity (Cell B12)
  const formLiveTotalStockQty = useMemo(() => {
    return stockEntries.reduce((total, entry) => total + (Number(entry.currentStock) || 0), 0);
  }, [stockEntries]);

  // 2. Expenses Total (Table 3 Total Expenses): Sum of B29:B42 (Cell B43)
  const formLiveTotalExpenses = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  }, [expenses]);

  // 3. Customer Due & Cash
  const formLiveCustomerDues = Number(totalDue) || 0;
  const formLiveCash = Number(totalCash) || 0;

  // Additional Collection & Due item sums
  const formLiveExtraCollectionSum = useMemo(() => {
    return extraCollectionItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [extraCollectionItems]);

  const formLiveExtraDueSum = useMemo(() => {
    return extraDueItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [extraDueItems]);

  // Collection Subtotal: Customer Due + Cash + All extra collection items
  const formLiveCollectionSubtotal = formLiveCustomerDues + formLiveCash + formLiveExtraCollectionSum;

  // সর্বমোট পাওনা/হিসাব = Collection Subtotal + Stock Valuation (Cell B25)
  const formLiveTotalCollection = formLiveCollectionSubtotal + formLiveStockValuation;

  // মোট জমা / সাবেক দেনা দায় = সাবেক ব্যালেন্স + মহাজন বাকি + অন্যান্য দেনা (Cell E24)
  const formLiveBusinessWithDue = (Number(prevDayBalance) || 0) + formLiveExtraDueSum;

  // Total (Table 3 Total) = সর্বমোট পাওনা/হিসাব + মোট খরচ (Cell B44)
  const formLiveTotalWithExpenses = formLiveTotalCollection + formLiveTotalExpenses;

  // Margin = Total - মোট জমা (Cell G5: =B44-E24)
  const formLiveMargin = formLiveTotalWithExpenses - formLiveBusinessWithDue;

  // Cash + মজুদ (Cell G9)
  const formLiveCashPlusStock = formLiveCash + formLiveStockValuation;

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDate || !formDay || !formPageNo) {
      setSubmitMessage({ type: "error", text: "তারিখ, বার এবং পৃষ্ঠা নাম্বার পূরণ করুন।" });
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    const formattedStock = stockEntries.map((se) => ({
      eggType: se.eggType,
      currentStock: Number(se.currentStock) || 0,
      hasPurchase: se.hasPurchase,
      purchaseRate: Number(se.purchaseRate) || 0,
      purchaseQty: Number(se.purchaseQty) || 0,
    }));

    const formattedFinancial = {
      totalDue: Number(totalDue) || 0,
      extraDue: formLiveExtraCollectionSum,
      totalCash: Number(totalCash) || 0,
      prevDayBalance: Number(prevDayBalance) || 0,
      providerName,
      providerPhone,
      providerEggType,
      providerDueMoney: Number(providerDueMoney) || 0,
      providerUnitPrice: Number(providerUnitPrice) || 0,
    };

    const formattedExpenses = expenses
      .filter((exp) => exp.amount > 0 || exp.wastedEggQty > 0)
      .map((exp) => {
        const finalType =
          exp.expenseType === "Other" && exp.customName ? exp.customName.trim() : exp.expenseType;
        return {
          expenseType: finalType,
          amount: Number(exp.amount) || 0,
          wastedEggQty: exp.expenseType === "ভাঙ্গা" ? Number(exp.wastedEggQty) || 0 : 0,
          wastedEggCost: exp.expenseType === "ভাঙ্গা" ? Number(exp.wastedEggCost) || 0 : 0,
        };
      });

    try {
      const response = await saveLedgerEntryAction(
        formDate,
        formDay,
        formPageNo,
        formattedStock,
        formattedFinancial,
        formattedExpenses,
        extraCollectionItems,
        extraDueItems
      );

      if (response.success) {
        setSubmitMessage({ type: "success", text: `${formDate} তারিখের পেজ গুগল শিটে সফলভাবে সেভ ও সিঙ্ক হয়েছে!` });
        const updatedRaw = await fetch("/api/data").then((res) => res.json());
        if (updatedRaw && updatedRaw.data) {
          setData(updatedRaw.data);
        }
        setTimeout(() => {
          setActiveTab("dashboard");
          setSubmitMessage(null);
        }, 1200);
      } else {
        setSubmitMessage({ type: "error", text: response.error || "সংরক্ষণ করতে সমস্যা হয়েছে।" });
      }
    } catch (err: any) {
      setSubmitMessage({ type: "error", text: err.message || "সার্ভার এরর হয়েছে।" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // DASHBOARD VIEW LOGIC: Default to latest date (data[data.length - 1])
  const currentViewDay = useMemo(() => {
    if (!data || data.length === 0) return null;
    if (selectedDashboardDate) {
      return (
        data.find((d) => d.date === selectedDashboardDate) ||
        data[data.length - 1]
      );
    }
    // Default to the latest date
    return data[data.length - 1];
  }, [data, selectedDashboardDate]);

  const viewStock = currentViewDay ? currentViewDay.financials.totalStockValue : 0;
  const viewDues = currentViewDay
    ? (currentViewDay.financials.totalDue || 0) + (currentViewDay.financials.extraDue || 0)
    : 0;
  const viewBusinessValue = currentViewDay ? currentViewDay.financials.totalBusinessValue : 0;
  const viewExpenses = currentViewDay ? currentViewDay.expenses.totalExpenses : 0;
  const viewTotalBusinessWithExpenses = currentViewDay ? currentViewDay.expenses.totalBusinessWithExpenses : 0;
  const viewTotalBusinessWithDue = currentViewDay ? currentViewDay.financials.totalBusinessWithDue : 0;
  const viewProfit = currentViewDay ? currentViewDay.financials.profitMargin : 0;
  const viewCash = currentViewDay ? currentViewDay.financials.totalCash : 0;
  const viewCashPlusStock = currentViewDay ? currentViewDay.financials.cashPlusStock : 0;

  // Daily Sales calculations
  const viewDailySalesAmount = currentViewDay?.sales?.dailySalesAmount ?? 0;
  const viewSoldStockCost = currentViewDay?.sales?.soldStockCost ?? 0;
  const viewTotalSoldQty = currentViewDay?.sales?.totalSoldQty ?? 0;

  // 7-Day Rolling Margin calculation
  const currentDayIndex = useMemo(() => {
    if (!currentViewDay) return -1;
    return data.findIndex((d) => d.date === currentViewDay.date);
  }, [data, currentViewDay]);

  const sevenDaysList = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.slice(-7);
  }, [data]);

  const sevenDayMargin = useMemo(() => {
    return sevenDaysList.reduce((sum, d) => sum + (d.financials.profitMargin || 0), 0);
  }, [sevenDaysList]);

  const sevenDayAvgMargin = useMemo(() => {
    return sevenDaysList.length > 0 ? Math.round(sevenDayMargin / sevenDaysList.length) : 0;
  }, [sevenDayMargin, sevenDaysList]);

  // Profit & Margin Trend Chart Data
  const profitFilteredData: ComputedDayData[] = useMemo(() => {
    if (!data || data.length === 0) return [];
    if (selectedProfitDateRange === "all") return data;
    if (selectedProfitDateRange === "weekly" || selectedProfitDateRange === "7") return data.slice(-7);
    if (selectedProfitDateRange === "monthly" || selectedProfitDateRange === "30") return data.slice(-30);
    if (selectedProfitDateRange === "yearly" || selectedProfitDateRange === "365") return data.slice(-365);
    const count = parseInt(selectedProfitDateRange, 10);
    if (!isNaN(count)) return data.slice(-count);
    return data;
  }, [data, selectedProfitDateRange]);

  const profitGraphStats = useMemo(() => {
    if (!profitFilteredData || profitFilteredData.length === 0) {
      return {
        totalProfit: 0,
        avgProfit: 0,
        maxProfit: 0,
        minProfit: 0,
        peakDay: null as { date: string; day: string; profit: number; index: number } | null,
        lowestDay: null as { date: string; day: string; profit: number; index: number } | null,
        positiveDays: 0,
        yMin: 0,
        yMax: 5000,
        yTicks: [0, 1000, 2000, 3000, 4000, 5000],
      };
    }

    const profits = profitFilteredData.map((d) => d.financials.profitMargin || 0);
    const totalProfit = profits.reduce((a, b) => a + b, 0);
    const avgProfit = Math.round(totalProfit / profitFilteredData.length);
    const rawMax = Math.max(...profits);
    const rawMin = Math.min(...profits);
    const positiveDays = profits.filter((p) => p > 0).length;

    let peakDay: { date: string; day: string; profit: number; index: number } | null = null;
    let lowestDay: { date: string; day: string; profit: number; index: number } | null = null;

    profitFilteredData.forEach((d, idx) => {
      const p = d.financials.profitMargin || 0;
      if (p === rawMax && !peakDay) {
        peakDay = { date: d.date, day: d.day, profit: p, index: idx };
      }
      if (p === rawMin && !lowestDay) {
        lowestDay = { date: d.date, day: d.day, profit: p, index: idx };
      }
    });

    let yMin = rawMin < 0 ? Math.floor(rawMin * 1.15) : 0;
    let yMax = rawMax > 0 ? Math.ceil(rawMax * 1.18) : 2000;

    if (yMax - yMin < 1000) {
      yMax = yMin + 1000;
    }

    const span = yMax - yMin;
    let step = 1000;
    if (span <= 1500) step = 250;
    else if (span <= 3000) step = 500;
    else if (span <= 8000) step = 1000;
    else if (span <= 20000) step = 2500;
    else if (span <= 50000) step = 5000;
    else step = 10000;

    yMax = Math.ceil(yMax / step) * step;
    if (yMin < 0) {
      yMin = Math.floor(yMin / step) * step;
    } else {
      yMin = 0;
    }

    const yTicks: number[] = [];
    for (let tick = yMin; tick <= yMax + 0.001; tick += step) {
      yTicks.push(tick);
    }

    return {
      totalProfit,
      avgProfit,
      maxProfit: rawMax,
      minProfit: rawMin,
      peakDay,
      lowestDay,
      positiveDays,
      yMin,
      yMax,
      yTicks,
    };
  }, [profitFilteredData]);

  // Chart data
  const filteredData: ComputedDayData[] = useMemo(() => {
    if (selectedDateRange === "all") return data;
    if (selectedDateRange === "weekly" || selectedDateRange === "7") return data.slice(-7);
    if (selectedDateRange === "monthly" || selectedDateRange === "30") return data.slice(-30);
    if (selectedDateRange === "yearly" || selectedDateRange === "365") return data.slice(-365);
    const count = parseInt(selectedDateRange, 10);
    if (!isNaN(count)) return data.slice(-count);
    return data;
  }, [data, selectedDateRange]);

  const chartDates = filteredData.map((d) => d.date.slice(5));
  const chartSoldTotal = filteredData.map((d) =>
    Object.values(d.stock).reduce((s, item) => s + (item.soldQty || 0), 0)
  );
  const maxSold = Math.max(...chartSoldTotal, 100);

  // Egg Price Trend Data Computation with 0.5 Intervals
  const eggPriceStats: {
    pricesByEgg: { [eggName: string]: number[] };
    maxPrice: number;
    minPrice: number;
    avgPrice: number;
    peakPoint: { date: string; day: string; eggType: string; price: number; index: number } | null;
    lowestPoint: { date: string; day: string; eggType: string; price: number; index: number } | null;
    yMin: number;
    yMax: number;
    yTicks: number[];
    ySubTicks: number[];
  } = useMemo(() => {
    const pricesByEgg: { [eggName: string]: number[] } = {};
    EGG_TYPES.forEach((t) => (pricesByEgg[t] = []));

    filteredData.forEach((dayItem) => {
      EGG_TYPES.forEach((t) => {
        const item = dayItem.stock[t];
        const rate = item && item.purchaseRate > 0 ? item.purchaseRate : DEFAULT_RATES[t] || 0;
        pricesByEgg[t].push(rate);
      });
    });

    const activeEggList = selectedEggPriceFilter === "all" ? EGG_TYPES : [selectedEggPriceFilter];
    let allRelevantPrices: number[] = [];
    activeEggList.forEach((t) => {
      allRelevantPrices = allRelevantPrices.concat(pricesByEgg[t] || []);
    });

    const validPrices = allRelevantPrices.filter((p) => p > 0);
    const rawMax = validPrices.length > 0 ? Math.max(...validPrices) : 18;
    const rawMin = validPrices.length > 0 ? Math.min(...validPrices) : 3;
    const avgPrice = validPrices.length > 0 ? validPrices.reduce((a, b) => a + b, 0) / validPrices.length : 0;

    // Find peak item and lowest item for annotations
    let peakPoint: { date: string; day: string; eggType: string; price: number; index: number } | null = null;
    let lowestPoint: { date: string; day: string; eggType: string; price: number; index: number } | null = null;

    filteredData.forEach((d: ComputedDayData, idx: number) => {
      activeEggList.forEach((t) => {
        const p = d.stock[t]?.purchaseRate || DEFAULT_RATES[t] || 0;
        if (p === rawMax && !peakPoint) {
          peakPoint = { date: d.date, day: d.day, eggType: t, price: p, index: idx };
        }
        if (p === rawMin && !lowestPoint) {
          lowestPoint = { date: d.date, day: d.day, eggType: t, price: p, index: idx };
        }
      });
    });

    // Compute yMin starting from 2 and yMax keeping +2 above average/peak
    let yMin = 2;
    let yMax = Math.ceil((Math.max(rawMax, avgPrice + 2) + 0.5) * 2) / 2;

    if (yMax < 18 && selectedEggPriceFilter === "all") {
      yMax = 18;
    }
    if (yMax - yMin < 2.5) {
      yMax = yMin + 2.5;
    }

    // Generate tick values (0.5 or 1.0 step based on span)
    const yTicks: number[] = [];
    const step = (yMax - yMin) <= 6 ? 0.5 : (yMax - yMin) <= 12 ? 1.0 : 2.0;
    for (let tick = yMin; tick <= yMax + 0.001; tick += step) {
      yTicks.push(Number(tick.toFixed(1)));
    }

    // Sub-ticks at every 0.5 step starting from 2
    const ySubTicks: number[] = [];
    for (let sub = yMin; sub <= yMax + 0.001; sub += 0.5) {
      ySubTicks.push(Number(sub.toFixed(1)));
    }

    return {
      pricesByEgg,
      maxPrice: rawMax,
      minPrice: rawMin,
      avgPrice: Number(avgPrice.toFixed(2)),
      peakPoint,
      lowestPoint,
      yMin,
      yMax,
      yTicks,
      ySubTicks,
    };
  }, [filteredData, selectedEggPriceFilter]);

  // Unified Date Synchronization & Navigation
  const currentViewDateStr =
    selectedDashboardDate || (data.length > 0 ? data[data.length - 1].date : formDate || "");

  const handleUnifiedDateChange = (newDate: string) => {
    if (!newDate) return;
    setSelectedDashboardDate(newDate);
    setFormDate(newDate);
  };

  const handleUnifiedDateStep = (direction: number) => {
    const activeDate = activeTab === "dashboard" ? (selectedDashboardDate || currentViewDay?.date || "") : (formDate || currentViewDateStr);
    const dayIdx = data.findIndex((d) => d.date === activeDate);
    if (dayIdx >= 0) {
      const targetIdx = dayIdx + direction;
      if (targetIdx >= 0 && targetIdx < data.length) {
        handleUnifiedDateChange(data[targetIdx].date);
        return;
      }
    }
    const dObj = new Date((activeDate || formDate) + "T00:00:00");
    if (!isNaN(dObj.getTime())) {
      dObj.setDate(dObj.getDate() + direction);
      const nextDateStr = dObj.toISOString().split("T")[0];
      handleUnifiedDateChange(nextDateStr);
    }
  };

  const handleSwitchTab = (tab: "dashboard" | "entry" | "overhead") => {
    if (tab === "entry") {
      const targetDate = selectedDashboardDate || currentViewDay?.date || (data.length > 0 ? data[data.length - 1].date : "");
      if (targetDate) {
        setFormDate(targetDate);
      }
    } else if (tab === "dashboard") {
      if (formDate) {
        setSelectedDashboardDate(formDate);
      }
    }
    setActiveTab(tab);
  };

  // Date Formatting Helper (YYYY-MM-DD -> MM/DD/YYYY)
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "MM/DD/YYYY";
    if (dateStr.includes("-")) {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        return `${parts[1]}/${parts[2]}/${parts[0]}`;
      }
    }
    return dateStr;
  };

  // Reusable Date Navigator Pill matching user design
  const renderDateNavigatorPill = (
    currentDateStr: string,
    currentDayName: string,
    onDateChange: (newDate: string) => void,
    onPrev?: () => void,
    onNext?: () => void,
    canPrev: boolean = true,
    canNext: boolean = true,
    className: string = ""
  ) => {
    const formatted = formatDisplayDate(currentDateStr);

    return (
      <div className={`flex items-center justify-between bg-slate-900 dark:bg-slate-900 border border-slate-700/80 rounded-2xl px-2.5 sm:px-3 py-1.5 shadow-md shrink-0 select-none ${className}`}>
        <button
          type="button"
          title="পূর্ববর্তী দিন"
          onClick={onPrev}
          disabled={!canPrev}
          className="p-1 text-slate-400 hover:text-white disabled:opacity-20 transition-colors cursor-pointer shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="relative flex items-center space-x-2 px-1.5 sm:px-2 cursor-pointer group">
          <Calendar className="w-4 h-4 text-amber-500 shrink-0 pointer-events-none" />
          <span className="text-xs sm:text-sm font-black text-white tracking-wide">
            {formatted}
          </span>
          <Calendar className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 shrink-0 pointer-events-none transition-colors" />

          {/* Hidden native Date Picker Input covering the entire pill */}
          <input
            type="date"
            value={currentDateStr || ""}
            onChange={(e) => {
              if (e.target.value) onDateChange(e.target.value);
            }}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full [color-scheme:dark]"
          />

          {/* Bengali Day Badge */}
          {currentDayName && (
            <span className="text-[11px] sm:text-xs font-black text-amber-200 bg-amber-950/90 group-hover:bg-amber-900/90 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-xl border border-amber-600/60 shadow-inner shrink-0 block transition-colors">
              {getBanglaDay(currentDayName)}
            </span>
          )}
        </div>

        <button
          type="button"
          title="পরবর্তী দিন"
          onClick={onNext}
          disabled={!canNext}
          className="p-1 text-slate-400 hover:text-white disabled:opacity-20 transition-colors cursor-pointer shrink-0"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const activeDisplayDate = activeTab === "dashboard" ? (selectedDashboardDate || currentViewDay?.date || "") : (formDate || currentViewDateStr);
  const activeDisplayDay = activeTab === "dashboard" ? (currentViewDay?.day || "") : (formDay || currentViewDay?.day || "");
  const activeDateIdx = data.findIndex((d) => d.date === activeDisplayDate);

  // Authentication Guard Screen
  if (authLoaded && !currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={(u) => {
          setCurrentUser(u);
          if (u.allowedTabs && u.allowedTabs.length > 0) {
            setActiveTab(u.allowedTabs[0]);
          }
        }}
      />
    );
  }

  const isAllowed = (tab: "dashboard" | "entry" | "overhead") => {
    if (!currentUser) return true;
    return currentUser.allowedTabs.includes(tab);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Sticky Top Navigation Controls (Desktop & Tablet Web View) */}
      <div className="hidden sm:flex sticky top-[56px] sm:top-[64px] z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-2 sm:p-2.5 rounded-2xl shadow-md border border-slate-200/90 dark:border-slate-800/90 transition-all justify-between items-center gap-3">
        {/* Tab Switcher (RBAC Filtered) */}
        <div className="flex items-center p-1 bg-slate-100/90 dark:bg-slate-800/90 rounded-xl shrink-0">
          {isAllowed("dashboard") && (
            <button
              onClick={() => handleSwitchTab("dashboard")}
              className={`flex items-center justify-center space-x-1.5 sm:space-x-2 px-3 sm:px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-white dark:bg-slate-700 text-amber-800 dark:text-amber-300 shadow-sm font-black"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>ড্যাশবোর্ড</span>
            </button>
          )}

          {isAllowed("entry") && (
            <button
              onClick={() => handleSwitchTab("entry")}
              className={`flex items-center justify-center space-x-1.5 sm:space-x-2 px-3 sm:px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "entry"
                  ? "bg-white dark:bg-slate-700 text-amber-800 dark:text-amber-300 shadow-sm font-black"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>হালখাতা এন্ট্রি</span>
            </button>
          )}

          {isAllowed("overhead") && (
            <button
              onClick={() => handleSwitchTab("overhead")}
              className={`flex items-center justify-center space-x-1.5 sm:space-x-2 px-3 sm:px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "overhead"
                  ? "bg-white dark:bg-slate-700 text-amber-800 dark:text-amber-300 shadow-sm font-black"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>কর্মচারী ও মাসিক খরচ</span>
            </button>
          )}
        </div>

        {/* Unified Date Navigator Pill in Header (Web View) */}
        {activeTab !== "overhead" &&
          renderDateNavigatorPill(
            activeDisplayDate,
            activeDisplayDay,
            handleUnifiedDateChange,
            () => handleUnifiedDateStep(-1),
            () => handleUnifiedDateStep(1),
            activeDateIdx > 0,
            activeDateIdx < data.length - 1
          )}

        {/* Quick Action Buttons & User Profile Badge */}
        <div className="flex items-center space-x-2 shrink-0">
          {activeTab === "dashboard" && currentViewDay && currentUser?.canEdit && (
            <button
              onClick={() => handleSwitchTab("entry")}
              className="flex items-center space-x-1.5 px-3 py-2 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>সম্পাদনা</span>
            </button>
          )}

          {currentUser?.canEdit && (
            <button
              onClick={handleCreateNewDay}
              className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ নতুন দিন</span>
            </button>
          )}

          <button
            onClick={handleRefreshData}
            disabled={isRefreshing}
            className="flex items-center justify-center space-x-1.5 px-2.5 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-amber-600" : ""}`} />
            <span className="hidden md:inline">{isRefreshing ? "..." : "রিফ্রেশ"}</span>
          </button>

          {/* Logged in User Profile Pill */}
          {currentUser && (
            <div className="flex items-center space-x-2 bg-slate-100/90 dark:bg-slate-800/90 border border-slate-300/80 dark:border-slate-700/80 px-2.5 py-1.5 rounded-xl text-xs font-bold shadow-2xs">
              <span className="text-sm">{currentUser.avatarEmoji}</span>
              <div className="hidden lg:flex flex-col text-left leading-tight">
                <span className="text-slate-900 dark:text-slate-100 font-black">{currentUser.username}</span>
                <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">{currentUser.roleLabel.split(" ")[1]}</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title="লগআউট করুন"
                className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Mobile Sub-Header (Date Navigator & Actions for Mobile Phone View) */}
      <div className="sm:hidden sticky top-[54px] z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-2 rounded-2xl shadow-md border border-slate-200/90 dark:border-slate-800/90 flex items-center justify-between gap-2">
        {/* Unified Date Navigator Pill in Mobile Sub-Header */}
        {renderDateNavigatorPill(
          activeDisplayDate,
          activeDisplayDay,
          handleUnifiedDateChange,
          () => handleUnifiedDateStep(-1),
          () => handleUnifiedDateStep(1),
          activeDateIdx > 0,
          activeDateIdx < data.length - 1,
          "w-full"
        )}

        {/* Quick New Day Button on Mobile Header */}
        <button
          onClick={handleCreateNewDay}
          className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm active:scale-95 shrink-0"
          title="নতুন দিনের পাতা"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {activeTab === "dashboard" ? (
        /* ================= DASHBOARD TAB ================= */
        <div className="space-y-4 sm:space-y-6">
          {/* Dashboard Title Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 flex justify-between items-center transition-colors">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">হিসাব বিবরণী ও ব্যবসার অবস্থা</h2>
                {currentViewDay && (
                  <span className="bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-black border border-amber-300 dark:border-amber-700/60">
                    পৃষ্ঠা #{currentViewDay.pageNo}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {currentViewDay ? `নির্বাচিত তারিখ: ${currentViewDay.date} (${getBanglaDay(currentViewDay.day)})` : "তথ্য নেই"}
              </p>
            </div>
          </div>

          {/* Top Summary Cards (Upper Section) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Cash + Stock */}
            <div className="bg-gradient-to-br from-amber-600 to-amber-700 dark:from-amber-600/90 dark:to-amber-800/90 text-white rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden flex flex-col justify-between border border-amber-500/20">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] sm:text-xs font-bold text-amber-100 uppercase tracking-wider block">
                    ক্যাশ + মজুদ ডিম
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black mt-1">৳ {viewCashPlusStock.toLocaleString()}</h3>
                </div>
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm hidden xs:block">
                  <Coins className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-white/20 text-[11px] text-amber-100 font-medium truncate">
                ক্যাশ: ৳{viewCash.toLocaleString()} | মজুদ: ৳{viewStock.toLocaleString()}
              </div>
            </div>

            {/* Total Dues */}
            <div className="bg-gradient-to-br from-rose-500 to-rose-600 dark:from-rose-600/90 dark:to-rose-800/90 text-white rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden flex flex-col justify-between border border-rose-500/20">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] sm:text-xs font-bold text-rose-100 uppercase tracking-wider block">
                    বাকি খাতা (Dues)
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black mt-1">৳ {viewDues.toLocaleString()}</h3>
                </div>
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm hidden xs:block">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-white/20 text-[11px] text-rose-100 font-medium truncate">
                নগদ: ৳ {viewCash.toLocaleString()}
              </div>
            </div>

            {/* Total Business Value */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 dark:from-emerald-600/90 dark:to-teal-800/90 text-white rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden flex flex-col justify-between border border-emerald-500/20">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] sm:text-xs font-bold text-emerald-100 uppercase tracking-wider block">
                    সর্বমোট পাওনা
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black mt-1">৳ {viewBusinessValue.toLocaleString()}</h3>
                </div>
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm hidden xs:block">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-white/20 text-[11px] text-emerald-100 font-medium truncate">
                বাকি + নগদ + মজুদ ডিম
              </div>
            </div>

            {/* Total Expenses */}
            <div className="bg-gradient-to-br from-slate-700 to-slate-800 dark:from-slate-800 dark:to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden flex flex-col justify-between border border-slate-700/40">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    মোট খরচ
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black mt-1">৳ {viewExpenses.toLocaleString()}</h3>
                </div>
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm hidden xs:block">
                  <Trash2 className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-white/20 text-[11px] text-slate-300 font-medium truncate">
                খরচসহ মোট: ৳ {viewTotalBusinessWithExpenses.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Secondary Summary Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
            <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-xl border border-blue-200/90 dark:border-blue-900/60 shadow-sm bg-gradient-to-br from-blue-50/60 to-white dark:from-blue-950/30 dark:to-slate-900 transition-colors">
              <span className="text-[11px] font-bold text-blue-800 dark:text-blue-400 block">দৈনিক মোট বিক্রি (Sales)</span>
              <span className="text-base sm:text-lg font-black text-blue-900 dark:text-blue-200 mt-0.5 block">
                ৳ {viewDailySalesAmount.toLocaleString()}
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold block mt-0.5">
                বিক্রি: {viewTotalSoldQty.toLocaleString()} টি
              </span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">নগদ ক্যাশ (Cash)</span>
              <span className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 mt-0.5 block">৳ {viewCash.toLocaleString()}</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-950/30 dark:to-slate-900 transition-colors">
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 block">মজুদ ডিমের মূল্য (Stock)</span>
              <span className="text-base sm:text-lg font-black text-amber-700 dark:text-amber-300 mt-0.5 block">৳ {viewStock.toLocaleString()}</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-xl border border-indigo-200/80 dark:border-indigo-900/60 shadow-sm bg-gradient-to-br from-indigo-50/60 to-white dark:from-indigo-950/30 dark:to-slate-900 transition-colors">
              <span className="text-[11px] font-bold text-indigo-800 dark:text-indigo-400 block">সাপ্তাহিক মার্জিন (7-Day)</span>
              <span className={`text-base sm:text-lg font-black mt-0.5 block ${sevenDayMargin >= 0 ? "text-indigo-700 dark:text-indigo-300" : "text-rose-600 dark:text-rose-400"}`}>
                ৳ {sevenDayMargin.toLocaleString()}
              </span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/30 dark:to-slate-900 col-span-2 sm:col-span-1 transition-colors">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 block">নিট মার্জিন (Margin)</span>
              <span className={`text-base sm:text-lg font-black mt-0.5 block ${viewProfit >= 0 ? "text-emerald-700 dark:text-emerald-300" : "text-rose-600 dark:text-rose-400"}`}>
                ৳ {viewProfit.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Stock Details */}
          {currentViewDay && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-3 sm:space-y-4 transition-colors">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                  <Package className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>মজুদ ডিমের বিস্তারিত তালিকা</span>
                </h3>
                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800/60">
                  মোট: ৳ {viewStock.toLocaleString()}
                </span>
              </div>

              {/* Desktop Table View (Stock Only) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 uppercase font-bold text-[11px]">
                      <th className="py-3 px-4">ডিমের ধরন</th>
                      <th className="py-3 px-4 text-right">মজুদ (Qty)</th>
                      <th className="py-3 px-4 text-right">দর (Rate)</th>
                      <th className="py-3 px-4 text-right">মোট মজুদ মূল্য (Valuation)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-800 dark:text-slate-200">
                    {Object.entries(currentViewDay.stock).map(([eggName, item]) => {
                      const rate = item.purchaseRate > 0 ? item.purchaseRate : DEFAULT_RATES[eggName] || 0;
                      const totalVal = item.stockValue || item.currentStock * rate;
                      return (
                        <tr key={eggName} className="hover:bg-amber-50/30 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">{eggName}</td>
                          <td className="py-3 px-4 text-right font-black text-slate-800 dark:text-slate-200">{item.currentStock.toLocaleString()} টি</td>
                          <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400">৳ {rate}</td>
                          <td className="py-3 px-4 text-right font-black text-amber-800 dark:text-amber-400">৳ {totalVal.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-amber-50/70 dark:bg-amber-950/40 border-t-2 border-amber-300 dark:border-amber-800/70 font-black text-xs text-slate-900 dark:text-slate-100">
                      <td className="py-3 px-4 text-amber-950 dark:text-amber-300">সর্বমোট মজুদ ডিম (B12 & D12)</td>
                      <td className="py-3 px-4 text-right text-slate-900 dark:text-slate-100 font-black">
                        {Object.values(currentViewDay.stock).reduce((sum, item) => sum + (item.currentStock || 0), 0).toLocaleString()} টি
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400">—</td>
                      <td className="py-3 px-4 text-right text-amber-900 dark:text-amber-300 text-sm font-black">৳ {viewStock.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Mobile Card Grid View (Stock Only) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:hidden gap-2.5">
                {Object.entries(currentViewDay.stock).map(([eggName, item]) => {
                  const rate = item.purchaseRate > 0 ? item.purchaseRate : DEFAULT_RATES[eggName] || 0;
                  const totalVal = item.stockValue || item.currentStock * rate;
                  return (
                    <div key={eggName} className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/90 dark:border-slate-700/60 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-slate-100">{eggName}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          মজুদ: {item.currentStock.toLocaleString()} টি × ৳{rate}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-xs text-amber-900 dark:text-amber-300">৳ {totalVal.toLocaleString()}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= SECTION 1: PROFIT & MARGIN ANALYTICS GRID ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
            {/* 70% SECTION: Profit & Margin Trend Graph */}
            <div className="lg:col-span-8 xl:col-span-8 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4 flex flex-col justify-between transition-colors">
              {/* Header Title & Subtitle */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>দৈনিক মুনাফা ও মার্জিন বিশ্লেষণ গ্রাফ (Profit & Margin Trend)</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    দৈনিক নিট লাভ, বার গ্রাফ ও মার্জিনের ওঠানামা বিশ্লেষণ
                  </p>
                </div>
                <span className="text-xs font-black text-emerald-900 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                  মোট লাভ: ৳ {profitGraphStats.totalProfit.toLocaleString()}
                </span>
              </div>

              {/* Timeframe Selector Bar */}
              <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/90 dark:bg-slate-800/90 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setSelectedProfitDateRange("weekly")}
                  className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer text-center flex items-center justify-center space-x-1.5 ${
                    selectedProfitDateRange === "weekly" || selectedProfitDateRange === "7"
                      ? "bg-white dark:bg-slate-700 text-emerald-900 dark:text-emerald-300 shadow-md ring-1 ring-slate-200/60 dark:ring-slate-600 font-black"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/60 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <span>📅</span>
                  <span>সাপ্তাহিক (7D)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProfitDateRange("monthly")}
                  className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer text-center flex items-center justify-center space-x-1.5 ${
                    selectedProfitDateRange === "monthly" || selectedProfitDateRange === "30"
                      ? "bg-white dark:bg-slate-700 text-emerald-900 dark:text-emerald-300 shadow-md ring-1 ring-slate-200/60 dark:ring-slate-600 font-black"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/60 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <span>🗓️</span>
                  <span>মাসিক (30D)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProfitDateRange("yearly")}
                  className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer text-center flex items-center justify-center space-x-1.5 ${
                    selectedProfitDateRange === "yearly" || selectedProfitDateRange === "365"
                      ? "bg-white dark:bg-slate-700 text-emerald-900 dark:text-emerald-300 shadow-md ring-1 ring-slate-200/60 dark:ring-slate-600 font-black"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/60 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <span>📊</span>
                  <span>বাৎসরিক (1Y)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProfitDateRange("all")}
                  className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer text-center flex items-center justify-center space-x-1.5 ${
                    selectedProfitDateRange === "all"
                      ? "bg-white dark:bg-slate-700 text-emerald-900 dark:text-emerald-300 shadow-md ring-1 ring-slate-200/60 dark:ring-slate-600 font-black"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/60 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <span>📋</span>
                  <span>সম্পূর্ণ (All)</span>
                </button>
              </div>

              {/* Key Profit Summary Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-1">
                <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/50 rounded-xl p-3">
                  <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 block">মোট নিট লাভ (Total)</span>
                  <span className="text-base font-black text-emerald-950 dark:text-emerald-200 mt-0.5 block">
                    ৳ {profitGraphStats.totalProfit.toLocaleString()}
                  </span>
                </div>
                <div className="bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/50 rounded-xl p-3">
                  <span className="text-[11px] font-bold text-indigo-800 dark:text-indigo-400 block">দৈনিক গড় লাভ (Avg)</span>
                  <span className="text-base font-black text-indigo-950 dark:text-indigo-200 mt-0.5 block">
                    ৳ {profitGraphStats.avgProfit.toLocaleString()}
                  </span>
                </div>
                <div className="bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 rounded-xl p-3">
                  <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 block">সর্বোচ্চ লাভ (Peak)</span>
                  <span className="text-base font-black text-amber-950 dark:text-amber-200 mt-0.5 block">
                    ৳ {profitGraphStats.maxProfit.toLocaleString()}
                    {profitGraphStats.peakDay && (
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold ml-1 block">
                        ({profitGraphStats.peakDay.date.slice(5)})
                      </span>
                    )}
                  </span>
                </div>
                <div className="bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/50 rounded-xl p-3">
                  <span className="text-[11px] font-bold text-rose-800 dark:text-rose-400 block">সর্বনিম্ন লাভ (Lowest)</span>
                  <span className="text-base font-black text-rose-950 dark:text-rose-200 mt-0.5 block">
                    ৳ {profitGraphStats.minProfit.toLocaleString()}
                    {profitGraphStats.lowestDay && (
                      <span className="text-[10px] text-rose-700 dark:text-rose-400 font-semibold ml-1 block">
                        ({profitGraphStats.lowestDay.date.slice(5)})
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Interactive SVG Profit Bar + Curve Graph */}
              <div className="pt-2">
                <div className="w-full overflow-x-auto bg-slate-50/80 dark:bg-slate-950/60 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-2 sm:p-4">
                  <svg viewBox="0 0 840 330" className="w-full min-w-[580px] h-64 sm:h-76 select-none">
                    <defs>
                      <linearGradient id="profitBarGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#047857" />
                      </linearGradient>
                      <linearGradient id="lossBarGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f43f5e" />
                        <stop offset="100%" stopColor="#be123c" />
                      </linearGradient>
                      <linearGradient id="profitAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.30" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {(() => {
                      const yMin = profitGraphStats.yMin;
                      const yMax = profitGraphStats.yMax;
                      const plotTop = 38;
                      const plotHeight = 220;
                      const leftMargin = 72;
                      const rightMargin = 805;
                      const plotWidth = rightMargin - leftMargin;

                      const getY = (v: number) => {
                        const clamped = Math.max(yMin, Math.min(yMax, v));
                        return plotTop + plotHeight - ((clamped - yMin) / Math.max(1, yMax - yMin)) * plotHeight;
                      };

                      const getX = (index: number, total: number) => {
                        if (total <= 1) return leftMargin + plotWidth / 2;
                        return leftMargin + (index / (total - 1)) * plotWidth;
                      };

                      const zeroY = getY(0);
                      const avgY = getY(profitGraphStats.avgProfit);
                      const totalDays = profitFilteredData.length;
                      const barWidth = Math.min(38, Math.max(16, (plotWidth / Math.max(1, totalDays)) * 0.48));

                      const pts = profitFilteredData.map((d, i) => {
                        const margin = d.financials.profitMargin || 0;
                        const x = getX(i, totalDays);
                        const y = getY(margin);
                        return { x, y, margin, date: d.date, day: d.day, isPositive: margin >= 0 };
                      });

                      const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
                      const areaD =
                        pts.length > 0
                          ? `${pathD} L ${pts[pts.length - 1].x} ${zeroY} L ${pts[0].x} ${zeroY} Z`
                          : "";

                      return (
                        <g>
                          {/* Y-Axis Grid Lines & Labels */}
                          {profitGraphStats.yTicks.map((tickVal) => {
                            const yP = getY(tickVal);
                            return (
                              <g key={`profit-tick-${tickVal}`}>
                                <line
                                  x1={leftMargin}
                                  y1={yP}
                                  x2={rightMargin}
                                  y2={yP}
                                  className={tickVal === 0 ? "stroke-slate-400 dark:stroke-slate-500" : "stroke-slate-200 dark:border-slate-800"}
                                  strokeWidth={tickVal === 0 ? "1.5" : "1"}
                                  strokeDasharray={tickVal === 0 ? undefined : "4 4"}
                                />
                                <text
                                  x={leftMargin - 8}
                                  y={yP + 4}
                                  textAnchor="end"
                                  className="text-[10px] sm:text-[11px] font-bold fill-slate-500 dark:fill-slate-400"
                                >
                                  ৳{tickVal >= 1000 ? `${(tickVal / 1000).toFixed(tickVal % 1000 === 0 ? 0 : 1)}k` : tickVal}
                                </text>
                              </g>
                            );
                          })}

                          {/* Left Y-Axis Solid Line */}
                          <line x1={leftMargin} y1="30" x2={leftMargin} y2="260" className="stroke-slate-600 dark:stroke-slate-400" strokeWidth="1.5" />

                          {/* Y-Axis Title */}
                          <text x={leftMargin} y="18" textAnchor="start" className="text-[10px] font-black fill-slate-600 dark:fill-slate-400 uppercase tracking-wider">
                            Y: নিট লাভ / মার্জিন (৳) ↑
                          </text>

                          {/* X-Axis Title */}
                          <text x={rightMargin} y="18" textAnchor="end" className="text-[10px] font-black fill-slate-600 dark:fill-slate-400 uppercase tracking-wider">
                            X: সময়কাল (তারিখ) →
                          </text>

                          {/* Average Profit Reference Line */}
                          {profitGraphStats.avgProfit >= yMin && profitGraphStats.avgProfit <= yMax && (
                            <g>
                              <line
                                x1={leftMargin}
                                y1={avgY}
                                x2={rightMargin}
                                y2={avgY}
                                className="stroke-indigo-400 dark:stroke-indigo-500"
                                strokeWidth="1.5"
                                strokeDasharray="4 4"
                              />
                              <rect
                                x={leftMargin + 10}
                                y={avgY - 9}
                                width="96"
                                height="18"
                                rx="5"
                                className="fill-indigo-50 dark:fill-slate-800 stroke-indigo-400 dark:stroke-indigo-600"
                                strokeWidth="1"
                              />
                              <text
                                x={leftMargin + 58}
                                y={avgY + 3.5}
                                textAnchor="middle"
                                className="text-[9px] font-black fill-indigo-700 dark:fill-indigo-300 pointer-events-none"
                              >
                                গড় লাভ: ৳{profitGraphStats.avgProfit.toLocaleString()}
                              </text>
                            </g>
                          )}

                          {/* Area Under Curve Fill */}
                          {areaD && <path d={areaD} fill="url(#profitAreaGrad)" />}

                          {/* Trend Line Curve */}
                          <path
                            d={pathD}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="drop-shadow-sm"
                          />

                          {/* X-Axis Ticks, Guidelines, and Bars */}
                          {profitFilteredData.map((d, i) => {
                            const xP = getX(i, totalDays);
                            const isCurrentDay = currentViewDay && currentViewDay.date === d.date;
                            const margin = d.financials.profitMargin || 0;
                            const yP = getY(margin);
                            const isPositive = margin >= 0;
                            const barH = Math.max(4, Math.abs(zeroY - yP));
                            const barY = isPositive ? yP : zeroY;

                            return (
                              <g
                                key={`profit-col-${d.date}`}
                                className="cursor-pointer group"
                                onClick={() => setSelectedDashboardDate(d.date)}
                              >
                                {/* Guideline line */}
                                <line
                                  x1={xP}
                                  y1="30"
                                  x2={xP}
                                  y2="260"
                                  stroke={isCurrentDay ? "rgba(16, 185, 129, 0.35)" : undefined}
                                  className={isCurrentDay ? undefined : "stroke-slate-200/40 dark:stroke-slate-800/30"}
                                  strokeWidth={isCurrentDay ? "2" : "1"}
                                  strokeDasharray={isCurrentDay ? "2 2" : undefined}
                                />

                                {/* Selected day background glow */}
                                {isCurrentDay && (
                                  <rect
                                    x={xP - barWidth / 2 - 4}
                                    y="30"
                                    width={barWidth + 8}
                                    height="230"
                                    rx="6"
                                    fill="rgba(16, 185, 129, 0.08)"
                                    className="dark:fill-emerald-400/10"
                                  />
                                )}

                                {/* Profit Bar */}
                                <rect
                                  x={xP - barWidth / 2}
                                  y={barY}
                                  width={barWidth}
                                  height={barH}
                                  rx="5"
                                  fill={isPositive ? "url(#profitBarGrad)" : "url(#lossBarGrad)"}
                                  className={`transition-all ${isCurrentDay ? "stroke-2 stroke-emerald-600 dark:stroke-emerald-300" : "group-hover:opacity-90"}`}
                                />

                                {/* Bottom Tick Mark */}
                                <line x1={xP} y1="260" x2={xP} y2="266" className="stroke-slate-600 dark:stroke-slate-400" strokeWidth="1.5" />

                                {/* Date Label */}
                                <text
                                  x={xP}
                                  y="280"
                                  textAnchor="middle"
                                  className={`text-[10px] font-bold ${
                                    isCurrentDay ? "fill-emerald-600 dark:fill-emerald-400 font-black text-xs" : "fill-slate-700 dark:fill-slate-300"
                                  }`}
                                >
                                  {d.date.slice(8)}/{d.date.slice(5, 7)}
                                </text>

                                {/* Day of Week Label */}
                                <text
                                  x={xP}
                                  y="294"
                                  textAnchor="middle"
                                  className={`text-[9px] font-semibold ${
                                    isCurrentDay ? "fill-emerald-600 dark:fill-emerald-400 font-bold" : "fill-slate-400 dark:fill-slate-500"
                                  }`}
                                >
                                  {getBanglaDay(d.day).replace("বার", "")}
                                </text>
                              </g>
                            );
                          })}

                          {/* Data Point Dots & Exact Margin Labels */}
                          {pts.map((p) => {
                            const isCurrent = currentViewDay && currentViewDay.date === p.date;
                            return (
                              <g
                                key={`profit-pt-${p.date}`}
                                onClick={() => setSelectedDashboardDate(p.date)}
                                className="cursor-pointer group"
                              >
                                {isCurrent && (
                                  <circle
                                    cx={p.x}
                                    cy={p.y}
                                    r="9"
                                    fill="#10b981"
                                    opacity="0.3"
                                    className="animate-ping"
                                  />
                                )}
                                <circle
                                  cx={p.x}
                                  cy={p.y}
                                  r={isCurrent ? "6" : "4.5"}
                                  fill="white"
                                  stroke={p.isPositive ? "#059669" : "#e11d48"}
                                  strokeWidth={isCurrent ? "3" : "2"}
                                />
                                <text
                                  x={p.x}
                                  y={p.isPositive ? p.y - 8 : p.y + 16}
                                  textAnchor="middle"
                                  className={`text-[10px] font-black pointer-events-none ${
                                    p.isPositive ? "fill-emerald-800 dark:fill-emerald-300" : "fill-rose-700 dark:fill-rose-300"
                                  }`}
                                >
                                  ৳{Math.round(p.margin).toLocaleString()}
                                </text>
                              </g>
                            );
                          })}

                          {/* Peak Profit Callout Annotation */}
                          {profitGraphStats.peakDay && (
                            (() => {
                              const peak = profitGraphStats.peakDay;
                              const peakX = getX(peak.index, totalDays);
                              const peakY = getY(peak.profit);
                              const calloutY = Math.max(8, peakY - 32);
                              return (
                                <g>
                                  <line
                                    x1={peakX}
                                    y1={peakY}
                                    x2={peakX}
                                    y2={calloutY + 18}
                                    stroke="#059669"
                                    strokeWidth="1.5"
                                    strokeDasharray="2 2"
                                  />
                                  <rect
                                    x={peakX - 45}
                                    y={calloutY}
                                    width="90"
                                    height="18"
                                    rx="5"
                                    fill="#064e3b"
                                    stroke="#34d399"
                                    strokeWidth="1"
                                  />
                                  <text
                                    x={peakX}
                                    y={calloutY + 12}
                                    textAnchor="middle"
                                    className="text-[9px] font-black fill-emerald-200 pointer-events-none"
                                  >
                                    সর্বোচ্চ: ৳{peak.profit.toLocaleString()}
                                  </text>
                                </g>
                              );
                            })()
                          )}
                        </g>
                      );
                    })()}
                  </svg>
                </div>
              </div>
            </div>

            {/* 30% SECTION: 7-Day Weekly Margin Widget */}
            <div className="lg:col-span-4 xl:col-span-4 flex flex-col justify-between gap-3 sm:gap-4 h-full">
              {/* 7-Day Weekly Margin Card */}
              <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3 transition-colors">
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2.5">
                    <div className="flex items-center space-x-2">
                      <div className="bg-indigo-50 dark:bg-indigo-950/70 p-1.5 rounded-xl border border-indigo-100 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-400">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100">
                          ৭ দিনের মার্জিন
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">সাপ্তাহিক মোট ও গড় লাভ</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-black text-indigo-900 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800/60">
                      ৳ {sevenDayMargin.toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center py-0.5">
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200 dark:border-slate-700/60">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">মোট ৭ দিনের লাভ</span>
                      <span className="text-xs sm:text-sm font-black text-indigo-900 dark:text-indigo-300 mt-0.5 block">৳ {sevenDayMargin.toLocaleString()}</span>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                      <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-bold block">দৈনিক গড় লাভ</span>
                      <span className="text-xs sm:text-sm font-black text-emerald-900 dark:text-emerald-300 mt-0.5 block">৳ {sevenDayAvgMargin.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* 7-Day compact day list */}
                  <div className="space-y-1 divide-y divide-slate-100 dark:divide-slate-800">
                    {sevenDaysList.map((dayItem) => {
                      const isSelected = currentViewDay && currentViewDay.date === dayItem.date;
                      const marginVal = dayItem.financials.profitMargin || 0;
                      return (
                        <div
                          key={dayItem.date}
                          onClick={() => setSelectedDashboardDate(dayItem.date)}
                          className={`flex justify-between items-center py-1 px-2 rounded-lg cursor-pointer transition-all ${
                            isSelected ? "bg-indigo-100/70 dark:bg-indigo-950/80 font-black border border-indigo-300 dark:border-indigo-700" : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{dayItem.date.slice(5)}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">({getBanglaDay(dayItem.day).slice(0, 4)})</span>
                          </div>
                          <span className={`text-xs font-black ${marginVal >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                            ৳ {marginVal.toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Selected Day Margin Summary */}
                  <div className="pt-2.5 mt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
                    <div className="flex justify-between items-center pb-0.5">
                      <span className="text-[11px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center space-x-1.5">
                        <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>নির্বাচিত দিনের লাভ বিবরণ</span>
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                        {currentViewDay ? currentViewDay.date.slice(5) : ""}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">মোট বিক্রি:</span>
                        <span className="font-bold text-slate-900 dark:text-slate-200">৳ {viewDailySalesAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">ডিমের ক্রয়মূল্য:</span>
                        <span className="font-bold text-slate-900 dark:text-slate-200">৳ {viewSoldStockCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="font-bold text-slate-700 dark:text-slate-300">নিট মার্জিন:</span>
                        <span className={`font-black text-sm ${viewProfit >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                          ৳ {viewProfit.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= SECTION 2: EGG PRICE TRENDS & ITEM SALES GRID ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
            {/* 70% SECTION: X-Y Egg Price Trend Graph */}
            <div className="lg:col-span-8 xl:col-span-8 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4 flex flex-col justify-between transition-colors">
              {/* Header Title & Subtitle */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>X-Y ডিমের দরের পরিবর্তন ও ট্রেন্ড গ্রাফ (Price Trend)</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    সাপ্তাহিক, মাসিক ও বাৎসরিক দরের ওঠানামা (০.৫ ব্যবধানে নির্ভুল Y-অক্ষ ও X-অক্ষ বিশ্লেষণ)
                  </p>
                </div>
              </div>

              {/* Timeframe Selector Bar (Weekly, Monthly, Yearly, All) */}
              <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/90 dark:bg-slate-800/90 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setSelectedDateRange("weekly")}
                  className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer text-center flex items-center justify-center space-x-1.5 ${
                    selectedDateRange === "weekly" || selectedDateRange === "7"
                      ? "bg-white dark:bg-slate-700 text-amber-900 dark:text-amber-300 shadow-md ring-1 ring-slate-200/60 dark:ring-slate-600 font-black"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/60 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <span>📅</span>
                  <span>সাপ্তাহিক (7D)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDateRange("monthly")}
                  className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer text-center flex items-center justify-center space-x-1.5 ${
                    selectedDateRange === "monthly" || selectedDateRange === "30"
                      ? "bg-white dark:bg-slate-700 text-amber-900 dark:text-amber-300 shadow-md ring-1 ring-slate-200/60 dark:ring-slate-600 font-black"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/60 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <span>🗓️</span>
                  <span>মাসিক (30D)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDateRange("yearly")}
                  className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer text-center flex items-center justify-center space-x-1.5 ${
                    selectedDateRange === "yearly" || selectedDateRange === "365"
                      ? "bg-white dark:bg-slate-700 text-amber-900 dark:text-amber-300 shadow-md ring-1 ring-slate-200/60 dark:ring-slate-600 font-black"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/60 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <span>📊</span>
                  <span>বাৎসরিক (1Y)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDateRange("all")}
                  className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer text-center flex items-center justify-center space-x-1.5 ${
                    selectedDateRange === "all"
                      ? "bg-white dark:bg-slate-700 text-amber-900 dark:text-amber-300 shadow-md ring-1 ring-slate-200/60 dark:ring-slate-600 font-black"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/60 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <span>📋</span>
                  <span>সম্পূর্ণ (All)</span>
                </button>
              </div>

              {/* Key Price Summary Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-1">
                <div className="bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 rounded-xl p-3">
                  <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 block">সর্বোচ্চ দর (Peak Price)</span>
                  <span className="text-base font-black text-amber-950 dark:text-amber-200 mt-0.5 block">
                    ৳ {eggPriceStats.maxPrice}
                    {eggPriceStats.peakPoint && (
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold ml-1 block">
                        ({eggPriceStats.peakPoint.date.slice(5)})
                      </span>
                    )}
                  </span>
                </div>
                <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/50 rounded-xl p-3">
                  <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 block">সর্বনিম্ন দর (Lowest Price)</span>
                  <span className="text-base font-black text-emerald-950 dark:text-emerald-200 mt-0.5 block">
                    ৳ {eggPriceStats.minPrice}
                    {eggPriceStats.lowestPoint && (
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold ml-1 block">
                        ({eggPriceStats.lowestPoint.date.slice(5)})
                      </span>
                    )}
                  </span>
                </div>
                <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50 rounded-xl p-3">
                  <span className="text-[11px] font-bold text-blue-800 dark:text-blue-400 block">গড় বাজার দর (Avg Price)</span>
                  <span className="text-base font-black text-blue-950 dark:text-blue-200 mt-0.5 block">৳ {eggPriceStats.avgPrice}</span>
                </div>
                <div className="bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-900/50 rounded-xl p-3">
                  <span className="text-[11px] font-bold text-purple-800 dark:text-purple-400 block">মোট ডাটা পয়েন্ট</span>
                  <span className="text-base font-black text-purple-950 dark:text-purple-200 mt-0.5 block">{filteredData.length} দিন</span>
                </div>
              </div>

              {/* Interactive SVG X-Y Coordinate Graph with 0.5 Intervals */}
              <div className="pt-2">
                <div className="w-full overflow-x-auto bg-slate-50/80 dark:bg-slate-950/60 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-2 sm:p-4">
                  <svg viewBox="0 0 840 330" className="w-full min-w-[580px] h-64 sm:h-76 select-none">
                    <defs>
                      {/* Linear gradients for area fill */}
                      {Object.entries(EGG_COLORS).map(([eggName, color]) => (
                        <linearGradient key={`grad-${eggName}`} id={`grad-${eggName.replace(/[^a-zA-Z0-9]/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={color.stroke} stopOpacity="0.25" />
                          <stop offset="100%" stopColor={color.stroke} stopOpacity="0.0" />
                        </linearGradient>
                      ))}
                    </defs>

                    {/* Y-Axis Coordinate Helpers */}
                    {(() => {
                      const yMin = eggPriceStats.yMin;
                      const yMax = eggPriceStats.yMax;
                      const plotTop = 38;
                      const plotHeight = 220;

                      const getY = (v: number) => {
                        const clamped = Math.max(yMin, Math.min(yMax, v));
                        return plotTop + plotHeight - ((clamped - yMin) / Math.max(1, yMax - yMin)) * plotHeight;
                      };

                      const getX = (index: number, total: number) => {
                        if (total <= 1) return 430;
                        return 65 + (index / (total - 1)) * 730;
                      };

                      const avgY = getY(eggPriceStats.avgPrice);

                      return (
                        <g>
                          {/* Y-Axis 0.5 Sub-Tick Background Lines */}
                          {eggPriceStats.ySubTicks.map((subVal) => {
                            const yP = getY(subVal);
                            return (
                              <line
                                key={`sub-${subVal}`}
                                x1="65"
                                y1={yP}
                                x2="805"
                                y2={yP}
                                className="stroke-slate-100 dark:stroke-slate-800/80"
                                strokeWidth="0.8"
                                strokeDasharray="2 2"
                              />
                            );
                          })}

                          {/* Y-Axis Main Ticks & Labels */}
                          {eggPriceStats.yTicks.map((tickVal) => {
                            const yP = getY(tickVal);
                            return (
                              <g key={`tick-${tickVal}`}>
                                <line
                                  x1="65"
                                  y1={yP}
                                  x2="805"
                                  y2={yP}
                                  className={tickVal === yMin ? "stroke-slate-600 dark:stroke-slate-500" : "stroke-slate-200 dark:stroke-slate-800"}
                                  strokeWidth={tickVal === yMin ? "1.5" : "1"}
                                  strokeDasharray={tickVal === yMin ? undefined : "4 4"}
                                />
                                <text
                                  x="56"
                                  y={yP + 4}
                                  textAnchor="end"
                                  className="text-[10px] sm:text-[11px] font-bold fill-slate-500 dark:fill-slate-400"
                                >
                                  ৳{tickVal % 1 === 0 ? tickVal.toFixed(0) : tickVal.toFixed(1)}
                                </text>
                              </g>
                            );
                          })}

                          {/* Left Y-Axis Solid Line */}
                          <line x1="65" y1="30" x2="65" y2="260" className="stroke-slate-600 dark:stroke-slate-400" strokeWidth="1.5" />

                          {/* Y-Axis Title (Left) */}
                          <text x="65" y="18" textAnchor="start" className="text-[10px] font-black fill-slate-600 dark:fill-slate-400 uppercase tracking-wider">
                            Y: ডিমের দর (৳ প্রতি পিস) ↑
                          </text>

                          {/* X-Axis Title (Cleanly at Top Right - No Overlapping) */}
                          <text x="800" y="18" textAnchor="end" className="text-[10px] font-black fill-slate-600 dark:fill-slate-400 uppercase tracking-wider">
                            X: সময়কাল (তারিখ) →
                          </text>

                          {/* Average Price Dotted Reference Line */}
                          {eggPriceStats.avgPrice >= yMin && eggPriceStats.avgPrice <= yMax && (
                            <g>
                              <line
                                x1="65"
                                y1={avgY}
                                x2="805"
                                y2={avgY}
                                className="stroke-slate-400 dark:stroke-slate-500"
                                strokeWidth="1.5"
                                strokeDasharray="4 4"
                              />
                              {/* Dotted Average Label on Left Side */}
                              <rect x="75" y={avgY - 9} width="85" height="17" rx="4" className="fill-slate-50 dark:fill-slate-800 stroke-slate-400 dark:stroke-slate-600" strokeWidth="1" />
                              <text
                                x="117"
                                y={avgY + 3}
                                textAnchor="middle"
                                className="text-[9px] font-black fill-slate-700 dark:fill-slate-200 pointer-events-none"
                              >
                                গড় দর: ৳{eggPriceStats.avgPrice}
                              </text>
                            </g>
                          )}

                          {/* X-Axis Vertical Day Ticks & Labels */}
                          {filteredData.map((d, i) => {
                            const xP = getX(i, filteredData.length);
                            const isCurrentDay = currentViewDay && currentViewDay.date === d.date;
                            return (
                              <g
                                key={`x-axis-${d.date}`}
                                className="cursor-pointer"
                                onClick={() => setSelectedDashboardDate(d.date)}
                              >
                                <line
                                  x1={xP}
                                  y1="30"
                                  x2={xP}
                                  y2="260"
                                  stroke={isCurrentDay ? "rgba(245, 158, 11, 0.4)" : undefined}
                                  className={isCurrentDay ? undefined : "stroke-slate-200/50 dark:stroke-slate-800/40"}
                                  strokeWidth={isCurrentDay ? "2" : "1"}
                                  strokeDasharray={isCurrentDay ? "2 2" : undefined}
                                />
                                <line x1={xP} y1="260" x2={xP} y2="266" className="stroke-slate-600 dark:stroke-slate-400" strokeWidth="1.5" />
                                <text
                                  x={xP}
                                  y="280"
                                  textAnchor="middle"
                                  className={`text-[10px] font-bold ${
                                    isCurrentDay ? "fill-amber-600 dark:fill-amber-400 font-black text-xs" : "fill-slate-700 dark:fill-slate-300"
                                  }`}
                                >
                                  {d.date.slice(8)}/{d.date.slice(5, 7)}
                                </text>
                                <text
                                  x={xP}
                                  y="294"
                                  textAnchor="middle"
                                  className={`text-[9px] font-semibold ${
                                    isCurrentDay ? "fill-amber-600 dark:fill-amber-400 font-bold" : "fill-slate-400 dark:fill-slate-500"
                                  }`}
                                >
                                  {getBanglaDay(d.day).replace("বার", "")}
                                </text>
                              </g>
                            );
                          })}

                          {/* Multi-Color Series Curves */}
                          {(selectedEggPriceFilter === "all" ? EGG_TYPES : [selectedEggPriceFilter]).map((eggType) => {
                            const color =
                              EGG_COLORS[eggType] || { stroke: "#d97706", fill: "rgba(217, 119, 6, 0.12)", label: eggType };
                            const totalDays = filteredData.length;
                            const pts = filteredData.map((d, i) => {
                              const rate = d.stock[eggType]?.purchaseRate || DEFAULT_RATES[eggType] || 0;
                              const x = getX(i, totalDays);
                              const y = getY(rate);
                              return { x, y, rate, date: d.date, day: d.day };
                            });

                            const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
                            const areaD =
                              pts.length > 0
                                ? `${pathD} L ${pts[pts.length - 1].x} 260 L ${pts[0].x} 260 Z`
                                : "";

                            return (
                              <g key={`series-${eggType}`}>
                                {/* Area Fill Gradient for single egg */}
                                {selectedEggPriceFilter !== "all" && (
                                  <path d={areaD} fill={`url(#grad-${eggType.replace(/[^a-zA-Z0-9]/g, "")})`} />
                                )}

                                {/* Multi-Color Line */}
                                <path
                                  d={pathD}
                                  fill="none"
                                  stroke={color.stroke}
                                  strokeWidth={selectedEggPriceFilter === eggType ? "3.5" : "2.5"}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />

                                {/* Data Point Dots */}
                                {pts.map((p) => {
                                  const isCurrent = currentViewDay && currentViewDay.date === p.date;
                                  return (
                                    <g
                                      key={`pt-${eggType}-${p.date}`}
                                      onClick={() => setSelectedDashboardDate(p.date)}
                                      className="cursor-pointer group"
                                    >
                                      {isCurrent && (
                                        <circle
                                          cx={p.x}
                                          cy={p.y}
                                          r="8"
                                          fill={color.stroke}
                                          opacity="0.25"
                                          className="animate-ping"
                                        />
                                      )}
                                      <circle
                                        cx={p.x}
                                        cy={p.y}
                                        r={isCurrent ? "5.5" : "4"}
                                        fill="white"
                                        stroke={color.stroke}
                                        strokeWidth={isCurrent ? "3" : "2"}
                                      />
                                      {/* Exact Price on dot */}
                                      {(selectedEggPriceFilter !== "all" || isCurrent) && (
                                        <text
                                          x={p.x}
                                          y={p.y - 8}
                                          textAnchor="middle"
                                          className="text-[10px] font-black fill-slate-800 dark:fill-slate-100 pointer-events-none"
                                        >
                                          ৳{p.rate}
                                        </text>
                                      )}
                                    </g>
                                  );
                                })}
                              </g>
                            );
                          })}

                          {/* Peak Price Callout Annotation */}
                          {eggPriceStats.peakPoint && (
                            (() => {
                              const peak = eggPriceStats.peakPoint;
                              const peakX = getX(peak.index, filteredData.length);
                              const peakY = getY(peak.price);
                              const calloutY = Math.max(8, peakY - 32);
                              return (
                                <g>
                                  <line
                                    x1={peakX}
                                    y1={peakY}
                                    x2={peakX}
                                    y2={calloutY + 18}
                                    stroke="#e11d48"
                                    strokeWidth="1.5"
                                    strokeDasharray="2 2"
                                  />
                                  <rect
                                    x={peakX - 42}
                                    y={calloutY}
                                    width="84"
                                    height="18"
                                    rx="5"
                                    fill="#0f172a"
                                    stroke="#e11d48"
                                    strokeWidth="1"
                                  />
                                  <text
                                    x={peakX}
                                    y={calloutY + 12}
                                    textAnchor="middle"
                                    className="text-[9px] font-black fill-amber-300 pointer-events-none"
                                  >
                                    সর্বোচ্চ: ৳{peak.price}
                                  </text>
                                </g>
                              );
                            })()
                          )}
                        </g>
                      );
                    })()}
                  </svg>
                </div>

                {/* Multi-Color Legend with All Eggs + Individual Egg Toggles */}
                <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mt-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                  {/* ALL EGGS BUTTON */}
                  <button
                    type="button"
                    onClick={() => setSelectedEggPriceFilter("all")}
                    className={`flex items-center space-x-1.5 cursor-pointer hover:opacity-90 transition-all px-3 py-1.5 rounded-xl border shadow-2xs ${
                      selectedEggPriceFilter === "all"
                        ? "bg-amber-600 dark:bg-amber-500 text-white border-amber-600 dark:border-amber-500 ring-2 ring-amber-300"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                    }`}
                  >
                    <span>🌈</span>
                    <span>সবগুলো ডিম (All Eggs)</span>
                  </button>

                  {/* Individual Egg Color Toggles */}
                  {EGG_TYPES.map((eggType) => {
                    const color = EGG_COLORS[eggType] || { stroke: "#d97706", label: eggType };
                    const isSelected = selectedEggPriceFilter === eggType;
                    return (
                      <button
                        key={eggType}
                        type="button"
                        onClick={() =>
                          setSelectedEggPriceFilter(selectedEggPriceFilter === eggType ? "all" : eggType)
                        }
                        className={`flex items-center space-x-1.5 cursor-pointer hover:opacity-90 transition-all px-2.5 py-1.5 rounded-xl border shadow-2xs ${
                          isSelected
                            ? "bg-slate-900 dark:bg-slate-700 text-white border-slate-900 dark:border-slate-600 ring-2 ring-amber-400"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                        }`}
                      >
                        {eggType === "সাদা (White Egg)" ? (
                          <span className="w-3.5 h-1.5 rounded-full inline-block bg-white border border-slate-400 shadow-2xs" />
                        ) : (
                          <span className="w-3.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: color.stroke }} />
                        )}
                        <span>{color.label || eggType.split(" (")[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 30% SECTION: Per Item Sell & Daily Egg Sales Widget Sidebar */}
            <div className="lg:col-span-4 xl:col-span-4 flex flex-col justify-between gap-3 sm:gap-4 h-full">
              {/* Item-wise Sell Card */}
              <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3 transition-colors">
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2.5">
                    <div className="flex items-center space-x-2">
                      <div className="bg-amber-50 dark:bg-amber-950/70 p-1.5 rounded-xl border border-amber-100 dark:border-amber-800/60 text-amber-700 dark:text-amber-400">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100">
                          ডিম অনুযায়ী বিক্রি
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Per Item Sell Breakdown</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                      {currentViewDay ? currentViewDay.date.slice(5) : ""}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-1 divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                    {EGG_TYPES.map((eggType) => {
                      const stockInfo = currentViewDay?.stock[eggType];
                      const soldQty = stockInfo?.soldQty || 0;
                      const rate = stockInfo?.purchaseRate || DEFAULT_RATES[eggType] || 0;
                      const soldVal = stockInfo?.soldValue !== undefined ? stockInfo.soldValue : (soldQty * rate);
                      const color = EGG_COLORS[eggType] || { stroke: "#d97706" };

                      return (
                        <div key={`sell-${eggType}`} className="flex justify-between items-center py-1 px-1 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-md transition-colors">
                          <div className="flex items-center space-x-1.5">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color.stroke }} />
                            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                              {eggType.split(" (")[0]}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-[11px]">
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              {soldQty > 0 ? `${soldQty.toLocaleString()} টি` : "০ টি"}
                            </span>
                            <span className="text-slate-400 dark:text-slate-500 font-medium">@ ৳{rate}</span>
                            <span className="font-black text-amber-800 dark:text-amber-300 w-16 text-right">
                              {soldVal > 0 ? `৳ ${soldVal.toLocaleString()}` : "৳ ০"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Today's Total Egg Sales Widget */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-2.5 transition-colors">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                  <div className="flex items-center space-x-1.5">
                    <ShoppingCart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h4 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100">আজকের মোট ডিম বিক্রি</h4>
                  </div>
                  <span className="text-[11px] font-black text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800/60">
                    সর্বমোট {viewTotalSoldQty.toLocaleString()} টি
                  </span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">ডিম বিক্রির ক্রয়মূল্য:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-200">৳ {viewSoldStockCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">দিনের মোট লাভ (মার্জিন):</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">৳ {viewProfit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 text-slate-900 dark:text-slate-100 font-black">
                    <span className="text-xs sm:text-sm">মোট বিক্রি (Sales):</span>
                    <span className="text-blue-900 dark:text-blue-300 text-sm sm:text-base font-black">৳ {viewDailySalesAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Financial Breakdowns with Name & Amount (Placed at the bottom) */}
          {currentViewDay && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* 1. Collection Breakdown */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-3 flex flex-col justify-between transition-colors">
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center space-x-1.5">
                      <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>পাওনা ও আদায় বিবরণী</span>
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                      মোট: ৳ {viewBusinessValue.toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">বাকি খাতা (Customer Due):</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">৳ {(currentViewDay.financials.totalDue || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">নগদ ক্যাশ (Cash in Hand):</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">৳ {(currentViewDay.financials.totalCash || 0).toLocaleString()}</span>
                    </div>
                    {currentViewDay.financials.extraCollections && currentViewDay.financials.extraCollections.length > 0 ? (
                      currentViewDay.financials.extraCollections.map((colItem, cIdx) => (
                        <div key={cIdx} className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800 bg-amber-50/50 dark:bg-amber-950/40 px-2 rounded-lg">
                          <span className="text-amber-800 dark:text-amber-300 font-bold">{colItem.label || "অন্যান্য আদায়"}:</span>
                          <span className="font-bold text-amber-900 dark:text-amber-200">৳ {(colItem.amount || 0).toLocaleString()}</span>
                        </div>
                      ))
                    ) : currentViewDay.financials.extraDue > 0 ? (
                      <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800 bg-amber-50/50 dark:bg-amber-950/40 px-2 rounded-lg">
                        <span className="text-amber-800 dark:text-amber-300 font-bold">অন্যান্য আদায় / বাটা:</span>
                        <span className="font-bold text-amber-900 dark:text-amber-200">৳ {currentViewDay.financials.extraDue.toLocaleString()}</span>
                      </div>
                    ) : null}
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">মজুদ ডিমের মূল্য (Stock Valuation):</span>
                      <span className="font-bold text-amber-800 dark:text-amber-400">৳ {viewStock.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs font-black text-slate-900 dark:text-slate-100">
                  <span>সর্বমোট পাওনা (B25):</span>
                  <span className="text-emerald-700 dark:text-emerald-400 text-sm">৳ {viewBusinessValue.toLocaleString()}</span>
                </div>
              </div>

              {/* 2. Dues & Liabilities Breakdown */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-3 flex flex-col justify-between transition-colors">
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center space-x-1.5">
                      <Package className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      <span>দেনা ও সাবেক বিবরণী</span>
                    </span>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                      মোট: ৳ {viewTotalBusinessWithDue.toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">সাবেক ব্যালেন্স (Opening):</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">৳ {(currentViewDay.financials.prevDayBalance || 0).toLocaleString()}</span>
                    </div>
                    {currentViewDay.financials.extraDues && currentViewDay.financials.extraDues.length > 0 ? (
                      currentViewDay.financials.extraDues.map((dueItem, dIdx) => (
                        <div key={dIdx} className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800 bg-rose-50/50 dark:bg-rose-950/40 px-2 rounded-lg">
                          <span className="text-rose-800 dark:text-rose-300 font-bold">{dueItem.label || "অন্যান্য দেনা"}:</span>
                          <span className="font-bold text-rose-900 dark:text-rose-200">৳ {(dueItem.amount || 0).toLocaleString()}</span>
                        </div>
                      ))
                    ) : currentViewDay.financials.providerDueMoney > 0 ? (
                      <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800 bg-rose-50/50 dark:bg-rose-950/40 px-2 rounded-lg">
                        <span className="text-rose-800 dark:text-rose-300 font-bold">
                          {currentViewDay.financials.providerName ? `${currentViewDay.financials.providerName} (মহাজন)` : "মহাজন দেনা"}:
                        </span>
                        <span className="font-bold text-rose-900 dark:text-rose-200">৳ {currentViewDay.financials.providerDueMoney.toLocaleString()}</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs font-black text-slate-900 dark:text-slate-100">
                  <span>মোট জমা / দেনা (E24):</span>
                  <span className="text-slate-800 dark:text-slate-200 text-sm">৳ {viewTotalBusinessWithDue.toLocaleString()}</span>
                </div>
              </div>

              {/* 3. Expenses Breakdown */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-3 flex flex-col justify-between transition-colors">
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center space-x-1.5">
                      <Trash2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>দৈনিক খরচ তালিকা ({currentViewDay.expenses.list.length} টি)</span>
                    </span>
                    <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/70 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800/60">
                      মোট: ৳ {viewExpenses.toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs max-h-44 overflow-y-auto pr-1 divide-y divide-slate-100 dark:divide-slate-800">
                    {currentViewDay.expenses.list.map((exp, eIdx) => (
                      <div key={eIdx} className="flex justify-between items-center py-1">
                        <span className="text-slate-700 dark:text-slate-300 font-semibold">{exp.type}</span>
                        <span className="font-bold text-rose-700 dark:text-rose-400">৳ {exp.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span>মোট খরচ / Total Expense (B43):</span>
                    <span className="text-rose-700 dark:text-rose-400 font-bold">৳ {viewExpenses.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100">
                    <span>Total (খরচসহ সর্বমোট - B44):</span>
                    <span className="text-amber-900 dark:text-amber-300 font-black">৳ {viewTotalBusinessWithExpenses.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= 🧠 BUSINESS INTELLIGENCE (ভাঙ্গা ডিম ও ডিম প্রতি নিট লাভ) ================= */}
          {currentViewDay && (() => {
            const brokenEggExpense = currentViewDay.expenses.list.find(
              (e) => e.type.includes("ভাঙ্গা") || e.type.includes("ড্যামেজ")
            );
            const brokenQty =
              brokenEggExpense?.wastedEggQty ||
              (brokenEggExpense ? Math.round(brokenEggExpense.amount / 11) : 0);
            const brokenCost = brokenEggExpense?.amount || 0;
            const totalStockQty = Object.values(currentViewDay.stock || {}).reduce(
              (sum, s) => sum + (s.currentStock || 0),
              0
            );
            const totalHandledQty = viewTotalSoldQty + totalStockQty;
            const breakagePercent =
              totalHandledQty > 0 ? (brokenQty / totalHandledQty) * 100 : 0;
            const breakageLossRatio =
              viewExpenses > 0 ? (brokenCost / viewExpenses) * 100 : 0;

            const marginPerEgg =
              viewTotalSoldQty > 0 ? viewProfit / viewTotalSoldQty : 0;
            const operatingExpensePerEgg =
              viewTotalSoldQty > 0 ? viewExpenses / viewTotalSoldQty : 0;
            const netMarginPercentage =
              viewDailySalesAmount > 0
                ? (viewProfit / viewDailySalesAmount) * 100
                : 0;

            return (
              <div className="space-y-3 pt-1">
                {/* 2 Core Business Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                  {/* Card 1: ভাঙ্গা ডিম ও অপচয় হার */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-3 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-200 dark:border-rose-800/60">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100">ভাঙ্গা ডিম ও অপচয় হার</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">ডিমের মোট অপচয় ও ক্ষতির শতকরা অনুপাত</p>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                          breakagePercent < 0.5
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700"
                            : breakagePercent <= 1.5
                            ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700"
                            : "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-700"
                        }`}
                      >
                        {breakagePercent < 0.5 ? "🟢 চমৎকার নিয়ন্ত্রণ" : breakagePercent <= 1.5 ? "🟡 স্বাভাবিক" : "🔴 অপচয় বেশি"}
                      </span>
                    </div>

                    <div className="bg-rose-50/40 dark:bg-rose-950/30 p-3 rounded-xl border border-rose-100 dark:border-rose-900/40 flex justify-between items-center">
                      <div>
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">মোট অপচয় হার:</span>
                        <p className="text-xl sm:text-2xl font-black text-rose-700 dark:text-rose-400">
                          {breakagePercent.toFixed(2)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">ভাঙ্গা ডিমের সংখ্যা:</span>
                        <p className="text-lg font-black text-slate-900 dark:text-slate-100">
                          {brokenQty} টি ডিম
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <div className="flex justify-between py-1 px-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                        <span className="text-slate-600 dark:text-slate-400">ভাঙ্গায় আর্থিক ক্ষতি:</span>
                        <span className="font-bold text-rose-700 dark:text-rose-400">৳ {brokenCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-1 px-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                        <span className="text-slate-600 dark:text-slate-400">মোট খরচের অংশ:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{breakageLossRatio.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: ডিম প্রতি গড় নিট লাভ */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-3 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-200 dark:border-amber-800/60">
                          <Coins className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100">ডিম প্রতি গড় নিট লাভ</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">প্রতিটি ডিম বিক্রিতে খরচ বাদে প্রকৃত লাভ</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700">
                        মার্জিন {netMarginPercentage.toFixed(1)}%
                      </span>
                    </div>

                    <div className="bg-amber-50/40 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-100 dark:border-amber-900/40 flex justify-between items-center">
                      <div>
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">প্রতি ডিমে নিট মার্জিন:</span>
                        <p className="text-xl sm:text-2xl font-black text-amber-700 dark:text-amber-400">
                          ৳ {marginPerEgg.toFixed(2)}
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">
                            / ডিম
                          </span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">মোট ডিম বিক্রি:</span>
                        <p className="text-lg font-black text-slate-900 dark:text-slate-100">
                          {viewTotalSoldQty.toLocaleString()} টি
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <div className="flex justify-between py-1 px-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                        <span className="text-slate-600 dark:text-slate-400">প্রতি ডিমে খরচ:</span>
                        <span className="font-bold text-rose-700 dark:text-rose-400">৳ {operatingExpensePerEgg.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between py-1 px-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                        <span className="text-slate-600 dark:text-slate-400">দিনের মোট লাভ:</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">৳ {viewProfit.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      ) : activeTab === "entry" ? (
        /* ================= DAILY TALLY ENTRY FORM ================= */
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Top Feedback Banner */}
          {submitMessage && (
            <div
              className={`p-3.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2.5 shadow-sm ${
                submitMessage.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200"
                  : "bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200"
              }`}
            >
              <Zap className="w-4 h-4 shrink-0" />
              <span>{submitMessage.text}</span>
            </div>
          )}

          {/* 1. Date, Day, Page Number */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 transition-colors">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h3 className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100">
                  ১. তারিখ ও খাতার পৃষ্ঠা (Date & Page Info)
                </h3>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Date Navigator Pill matching user design */}
                {renderDateNavigatorPill(
                  formDate,
                  formDay,
                  handleUnifiedDateChange,
                  () => handleUnifiedDateStep(-1),
                  () => handleUnifiedDateStep(1),
                  true,
                  true
                )}

                <button
                  type="button"
                  onClick={handleSetToday}
                  className="text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 hover:bg-amber-100 dark:hover:bg-amber-900/50 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800/60 transition-colors cursor-pointer shrink-0"
                >
                  আজকের দিন
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">তারিখ (Date)</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50/50 dark:bg-slate-800/60 text-sm font-bold text-slate-900 dark:text-slate-100 [color-scheme:light] dark:[color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">রোজ / বার (Day)</label>
                <input
                  type="text"
                  value={formDay}
                  onChange={(e) => setFormDay(e.target.value)}
                  placeholder="যেমন: সোমবার, রবিবার, ইত্যাদি"
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50/50 dark:bg-slate-800/60 text-sm font-bold text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">পৃষ্ঠা নাম্বার (Page No)</label>
                <input
                  type="text"
                  value={formPageNo}
                  onChange={(e) => setFormPageNo(e.target.value)}
                  placeholder="যেমন: 98 বা 89"
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50/50 dark:bg-slate-800/60 text-sm font-bold text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-slate-800"
                  required
                />
              </div>
            </div>
          </div>

          {/* 2. Stock Valuation Section (মজুদ ডিমের হিসাব) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 space-y-4 transition-colors">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                  <Package className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>২. মজুদ ডিমের মূল্য (Stock Valuation)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">ডিমের বর্তমান স্টক ও ক্রয় দর ইনপুট দিন</p>
              </div>
              <span className="text-xs font-black text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800/60">
                মোট মূল্য: ৳ {formLiveStockValuation.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 uppercase font-bold text-[11px]">
                    <th className="py-2.5 px-3">ডিমের ধরন</th>
                    <th className="py-2.5 px-3">বর্তমান স্টক (Qty)</th>
                    <th className="py-2.5 px-3">দর (Rate ৳)</th>
                    <th className="py-2.5 px-3 text-right">মোট টাকা (Total ৳)</th>
                    <th className="py-2.5 px-3 text-center">আজকের ক্রয়?</th>
                    <th className="py-2.5 px-3">ক্রয় সংখ্যা (টি)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-800 dark:text-slate-200">
                  {stockEntries.map((entry, index) => {
                    const rowRate = entry.purchaseRate > 0 ? entry.purchaseRate : DEFAULT_RATES[entry.eggType] || 0;
                    const rowTotal = (entry.currentStock || 0) * rowRate;

                    return (
                      <tr key={entry.eggType} className="hover:bg-amber-50/20 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">{entry.eggType}</td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            value={entry.currentStock || ""}
                            onChange={(e) => handleStockChange(index, "currentStock", Number(e.target.value))}
                            placeholder="0"
                            className="w-28 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            min="0"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            step="0.01"
                            value={entry.purchaseRate || ""}
                            onChange={(e) => handleStockChange(index, "purchaseRate", Number(e.target.value))}
                            className="w-24 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            min="0"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-amber-900 dark:text-amber-300 text-sm">
                          ৳ {rowTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <label className="inline-flex items-center cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={entry.hasPurchase}
                              onChange={(e) => handleStockChange(index, "hasPurchase", e.target.checked)}
                              className="w-4 h-4 text-amber-600 rounded border-slate-300 dark:border-slate-600 focus:ring-amber-500 cursor-pointer"
                            />
                            <span className="ml-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                              {entry.hasPurchase ? "হ্যাঁ" : "না"}
                            </span>
                          </label>
                        </td>
                        <td className="py-2.5 px-3">
                          {entry.hasPurchase ? (
                            <input
                              type="number"
                              value={entry.purchaseQty || ""}
                              onChange={(e) => handleStockChange(index, "purchaseQty", Number(e.target.value))}
                              placeholder="সংখ্যা"
                              className="w-24 border border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/60 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                              min="0"
                            />
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 italic">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Touch Cards View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:hidden gap-3">
              {stockEntries.map((entry, index) => {
                const rowRate = entry.purchaseRate > 0 ? entry.purchaseRate : DEFAULT_RATES[entry.eggType] || 0;
                const rowTotal = (entry.currentStock || 0) * rowRate;

                return (
                  <div key={entry.eggType} className="bg-slate-50/80 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{entry.eggType}</span>
                      <span className="text-xs font-black text-amber-800 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/80 px-2 py-0.5 rounded-md">
                        ৳ {rowTotal.toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">বর্তমান স্টক (Qty)</label>
                        <input
                          type="number"
                          value={entry.currentStock || ""}
                          onChange={(e) => handleStockChange(index, "currentStock", Number(e.target.value))}
                          placeholder="0"
                          className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">দর (Rate ৳)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={entry.purchaseRate || ""}
                          onChange={(e) => handleStockChange(index, "purchaseRate", Number(e.target.value))}
                          className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    {/* Purchase info toggle */}
                    <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                      <label className="inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={entry.hasPurchase}
                          onChange={(e) => handleStockChange(index, "hasPurchase", e.target.checked)}
                          className="w-4 h-4 text-amber-600 rounded border-slate-300 dark:border-slate-600 cursor-pointer"
                        />
                        <span className="ml-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-400">আজকের ক্রয়</span>
                      </label>
                      {entry.hasPurchase && (
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">সংখ্যা:</span>
                          <input
                            type="number"
                            value={entry.purchaseQty || ""}
                            onChange={(e) => handleStockChange(index, "purchaseQty", Number(e.target.value))}
                            placeholder="0"
                            className="w-20 border border-amber-300 dark:border-amber-700 bg-amber-50/60 dark:bg-amber-950/60 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 dark:text-slate-100"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stock Summary Footer Bar */}
            <div className="bg-amber-50/60 dark:bg-amber-950/40 p-3 sm:p-4 rounded-xl border border-amber-200 dark:border-amber-800/60 flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200">
              <span>মোট ডিমের সংখ্যা: <strong className="text-slate-900 dark:text-slate-100">{formLiveTotalStockQty.toLocaleString()} টি</strong></span>
              <span>মোট মজুদ মূল্য: <strong className="text-amber-900 dark:text-amber-300 text-sm">৳ {formLiveStockValuation.toLocaleString()}</strong></span>
            </div>
          </div>

          {/* 3. Dues & Collection Section (দায় ও পাওনা হিসাব) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 transition-colors">
            <h3 className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-3 mb-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>৩. দেনা, দায় ও পাওনা হিসাব (Due & Collection)</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full hidden sm:inline border border-slate-200 dark:border-slate-700">
                বাম: দেনা ও সাবেক | ডান: পাওনা ও নগদ
              </span>
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* LEFT BOX: খাত / দায় ও সাবেক হিসাব (Due & Balance) */}
              <div className="bg-slate-50/90 dark:bg-slate-800/60 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-4 flex flex-col justify-between">
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                      খাত / দায় ও সাবেক হিসাব (Due & Balance)
                    </span>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-200/80 dark:bg-slate-700 px-2.5 py-0.5 rounded-full">
                      মোট জমা: ৳ {formLiveBusinessWithDue.toLocaleString()}
                    </span>
                  </div>

                  {/* Previous Balance */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      সাবেক ব্যালেন্স (Previous Day Balance / সাবেক)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-sm">৳</span>
                      <input
                        type="number"
                        value={prevDayBalance || ""}
                        onChange={(e) => setPrevDayBalance(Number(e.target.value))}
                        placeholder="0"
                        className="w-full border border-slate-300 dark:border-slate-700 rounded-xl pl-8 pr-3 py-2 bg-white dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* Dynamic Due Items */}
                  {extraDueItems.length > 0 && (
                    <div className="space-y-3 pt-2 border-t border-dashed border-slate-300 dark:border-slate-700">
                      <div className="flex justify-between items-center">
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          অন্যান্য দেনা / দায় খাতসমূহ ({extraDueItems.length} টি)
                        </label>
                        <span className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/60">
                          পরিমাণ × দর = মোট
                        </span>
                      </div>

                      {extraDueItems.map((item, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
                          <div className="flex items-center justify-between">
                            <input
                              type="text"
                              value={item.label}
                              onChange={(e) => handleDueItemChange(idx, "label", e.target.value)}
                              placeholder="মহাজন / দেনা খাতের নাম (যেমন: MD ALI)"
                              className="flex-1 border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 bg-slate-50/50 dark:bg-slate-900/60 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 mr-2"
                            />
                            <button
                              type="button"
                              onClick={() => removeDueItem(idx)}
                              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">পরিমাণ (Qty)</label>
                              <input
                                type="number"
                                value={item.qty || ""}
                                onChange={(e) => handleDueItemChange(idx, "qty", e.target.value)}
                                placeholder="0"
                                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                min="0"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">দর (Rate ৳)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={item.unitPrice || ""}
                                onChange={(e) => handleDueItemChange(idx, "unitPrice", e.target.value)}
                                placeholder="0.00"
                                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                min="0"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">মোট দেনা (৳)</label>
                              <input
                                type="number"
                                value={item.amount || ""}
                                onChange={(e) => handleDueItemChange(idx, "amount", e.target.value)}
                                placeholder="0"
                                className="w-full border border-amber-300 dark:border-amber-700 bg-amber-50/60 dark:bg-amber-950/60 rounded-lg px-2 py-1.5 text-xs font-black text-amber-900 dark:text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Due Button */}
                  <button
                    type="button"
                    onClick={addDueItem}
                    className="w-full border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-400 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>অন্যান্য দেনা / মহাজন খাত যোগ করুন</span>
                  </button>
                </div>

                {/* Left Subtotal Box */}
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>সাবেক ব্যালেন্স (Opening):</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">৳ {Number(prevDayBalance || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>মহাজন ও অন্যান্য দেনা:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">+ ৳ {formLiveExtraDueSum.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 pt-1 border-t border-slate-300 dark:border-slate-700">
                    <span>মোট জমা / Business with Due:</span>
                    <span className="text-amber-800 dark:text-amber-300">৳ {formLiveBusinessWithDue.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* RIGHT BOX: খাত / পাওনা আদায় (Collection) */}
              <div className="bg-slate-50/90 dark:bg-slate-800/60 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-4 flex flex-col justify-between">
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                      খাত / পাওনা আদায় (Collection)
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                      আদায় সাব-টোটাল: ৳ {formLiveCollectionSubtotal.toLocaleString()}
                    </span>
                  </div>

                  {/* Customer Due */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      বাকি খাতা (Customer Due / বাকি)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-sm">৳</span>
                      <input
                        type="number"
                        value={totalDue || ""}
                        onChange={(e) => setTotalDue(Number(e.target.value))}
                        placeholder="0"
                        className="w-full border border-slate-300 dark:border-slate-700 rounded-xl pl-8 pr-3 py-2 bg-white dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* Cash in Hand */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      নগদ ক্যাশ (Cash in Hand / নগদ)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-sm">৳</span>
                      <input
                        type="number"
                        value={totalCash || ""}
                        onChange={(e) => setTotalCash(Number(e.target.value))}
                        placeholder="0"
                        className="w-full border border-slate-300 dark:border-slate-700 rounded-xl pl-8 pr-3 py-2 bg-white dark:bg-slate-800 text-sm font-bold text-emerald-700 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Dynamic Collection Items */}
                  {extraCollectionItems.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-dashed border-slate-300 dark:border-slate-700">
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        অন্যান্য পাওনা / আদায় খাতসমূহ ({extraCollectionItems.length} টি)
                      </label>
                      {extraCollectionItems.map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) => handleCollectionItemChange(idx, "label", e.target.value)}
                            placeholder="খাতের নাম (যেমন: বাটা, শিপন)"
                            className="flex-1 border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                          <div className="relative w-32">
                            <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-slate-400 text-xs font-bold">৳</span>
                            <input
                              type="number"
                              value={item.amount || ""}
                              onChange={(e) => handleCollectionItemChange(idx, "amount", e.target.value)}
                              placeholder="0"
                              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg pl-6 pr-2 py-1.5 bg-white dark:bg-slate-800 text-xs font-black text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCollectionItem(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Collection Button */}
                  <button
                    type="button"
                    onClick={addCollectionItem}
                    className="w-full border-2 border-dashed border-amber-300 dark:border-amber-700 hover:border-amber-500 bg-amber-50/60 dark:bg-amber-950/40 hover:bg-amber-100/80 text-amber-900 dark:text-amber-300 font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>অন্যান্য পাওনা / আদায় খাত যোগ করুন</span>
                  </button>
                </div>

                {/* Right Subtotal Box */}
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>আদায় সাব-টোটাল (বাকি + ক্যাশ + অন্যান্য):</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">৳ {formLiveCollectionSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>মজুদ ডিমের মূল্য (Stock Valuation):</span>
                    <span className="font-bold text-amber-700 dark:text-amber-300">+ ৳ {formLiveStockValuation.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 pt-1 border-t border-slate-300 dark:border-slate-700">
                    <span>সর্বমোট পাওনা / হিসাব:</span>
                    <span className="text-amber-800 dark:text-amber-300">৳ {formLiveTotalCollection.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Daily Expenses Section (দৈনিক খরচের খাত) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 transition-colors">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3 mb-4 gap-2 flex-wrap">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                  <Trash2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>৪. দৈনিক খরচের খাত (Daily Expenses)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">নাস্তা, ট্রে-ফের, ভাঙ্গা ইত্যাদি খরচ যোগ করুন</p>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
                <button
                  type="button"
                  onClick={addExpenseRow}
                  className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800/60 px-2.5 py-1.5 rounded-xl cursor-pointer hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all active:scale-95"
                  title="নতুন খরচ যোগ করুন"
                >
                  মোট খরচ: <strong className="text-rose-600 dark:text-rose-400 font-black">৳ {formLiveTotalExpenses.toLocaleString()}</strong>
                </button>
                <button
                  type="button"
                  onClick={addExpenseRow}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center space-x-1.5 transition shadow-sm active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>খরচ যোগ</span>
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {expenses.map((exp, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center gap-2.5 p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                >
                  {/* Preset Dropdown */}
                  <div className="w-full sm:w-44">
                    <select
                      value={exp.expenseType}
                      onChange={(e) => handleExpenseChange(index, "expenseType", e.target.value)}
                      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
                    >
                      {EXPENSE_PRESETS.map((preset) => (
                        <option key={preset} value={preset}>
                          {preset}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Custom Name if Other */}
                  {exp.expenseType === "Other" && (
                    <div className="flex-1">
                      <input
                        type="text"
                        value={exp.customName || ""}
                        onChange={(e) => handleExpenseChange(index, "customName", e.target.value)}
                        placeholder="খরচের বিবরণ"
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Waste Egg Calculator */}
                  {exp.expenseType === "ভাঙ্গা" && (
                    <div className="flex items-center space-x-2 flex-1">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">ভাঙ্গা ডিম:</span>
                      <input
                        type="number"
                        value={exp.wastedEggQty || ""}
                        onChange={(e) => handleExpenseChange(index, "wastedEggQty", Number(e.target.value))}
                        placeholder="সংখ্যা"
                        className="w-20 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Amount Input */}
                  <div className="relative w-full sm:w-36">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs font-bold">৳</span>
                    <input
                      type="number"
                      value={exp.amount || ""}
                      onChange={(e) => handleExpenseChange(index, "amount", Number(e.target.value))}
                      placeholder="টাকা"
                      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg pl-6 pr-2.5 py-1.5 bg-white dark:bg-slate-800 text-xs font-black text-rose-700 dark:text-rose-400 focus:outline-none"
                    />
                  </div>

                  {/* Delete Button */}
                  {expenses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExpenseRow(index)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 self-end sm:self-center transition-colors cursor-pointer"
                      title="মুছুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Section 4 Footer: মোট খরচ (B43) & Total (B44 = B25 + B43) matching spreadsheet format */}
            <div className="mt-4 pt-3.5 border-t border-slate-200 dark:border-slate-700/80 space-y-2">
              <div className="bg-slate-50/90 dark:bg-slate-800/60 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400 font-medium">
                  <span>সর্বমোট পাওনা (B25):</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">৳ {formLiveTotalCollection.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400 font-medium">
                  <span className="flex items-center space-x-1.5">
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>মোট খরচ (Total Expense - B43):</span>
                  </span>
                  <span className="font-bold text-rose-700 dark:text-rose-400">+ ৳ {formLiveTotalExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t-2 border-slate-300 dark:border-slate-700 text-sm sm:text-base font-black text-slate-900 dark:text-slate-100">
                  <div className="flex items-center space-x-2">
                    <span className="text-amber-900 dark:text-amber-300">Total (খরচসহ সর্বমোট - B44):</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold bg-slate-200/80 dark:bg-slate-700 px-2 py-0.5 rounded-full hidden sm:inline">
                      B25 + B43
                    </span>
                  </div>
                  <span className="text-amber-900 dark:text-amber-300 text-base sm:text-lg font-black tracking-tight">
                    ৳ {formLiveTotalWithExpenses.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Live Real-time Summary Card & Submit */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-700/80 space-y-4 sm:space-y-6">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-widest flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>লাইভ হালখাতা সামারি (Live Daily Balance)</span>
                </span>
                <span className="text-[11px] font-bold text-slate-300 bg-white/10 px-2.5 py-0.5 rounded-full">
                  শিট ফর্মুলা সিঙ্ক
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white/5 border border-white/10 p-3 sm:p-3.5 rounded-xl">
                <span className="text-[10px] sm:text-xs text-slate-400 block font-medium">সর্বমোট পাওনা (B25)</span>
                <span className="text-base sm:text-lg font-black text-amber-400 mt-0.5 block">৳ {formLiveTotalCollection.toLocaleString()}</span>
              </div>

              <div className="bg-white/5 border border-white/10 p-3 sm:p-3.5 rounded-xl">
                <span className="text-[10px] sm:text-xs text-slate-400 block font-medium">মোট খরচ (B43)</span>
                <span className="text-base sm:text-lg font-black text-rose-400 mt-0.5 block">৳ {formLiveTotalExpenses.toLocaleString()}</span>
              </div>

              <div className="bg-white/5 border border-white/10 p-3 sm:p-3.5 rounded-xl">
                <span className="text-[10px] sm:text-xs text-slate-400 block font-medium">মোট জমা / দায় (E24)</span>
                <span className="text-base sm:text-lg font-black text-slate-200 mt-0.5 block">৳ {formLiveBusinessWithDue.toLocaleString()}</span>
              </div>

              <div className="bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-emerald-500/40 p-3 sm:p-3.5 rounded-xl">
                <span className="text-[10px] sm:text-xs text-emerald-300 block font-bold">মার্জিন / নিট লাভ (G5)</span>
                <span className="text-base sm:text-xl font-black text-emerald-400 mt-0.5 block">
                  ৳ {formLiveMargin.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-black text-sm sm:text-base py-3.5 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2.5 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>গুগল শিটে পেজ তৈরি ও ডাটা সংরক্ষণ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>সংরক্ষণ ও গুগল শিটে পেজ তৈরি করুন (Save & Sync)</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* ================= OVERHEAD EXPENSES & EMPLOYEE COSTS TAB ================= */
        <OverheadExpensesView />
      )}

      {/* Floating Bottom Nav for Mobile Screens */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 sm:hidden px-2 py-2 flex justify-around items-center shadow-lg transition-colors">
        {isAllowed("dashboard") && (
          <button
            onClick={() => handleSwitchTab("dashboard")}
            className={`flex flex-col items-center space-y-1 py-1 px-2 rounded-xl transition-all cursor-pointer ${
              activeTab === "dashboard" ? "text-amber-600 dark:text-amber-400 font-black" : "text-slate-500 dark:text-slate-400 font-semibold"
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px]">ড্যাশবোর্ড</span>
          </button>
        )}

        {isAllowed("entry") && (
          <button
            onClick={() => handleSwitchTab("entry")}
            className={`flex flex-col items-center space-y-1 py-1 px-2 rounded-xl transition-all cursor-pointer ${
              activeTab === "entry" ? "text-amber-600 dark:text-amber-400 font-black" : "text-slate-500 dark:text-slate-400 font-semibold"
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-[10px]">হালখাতা</span>
          </button>
        )}

        {isAllowed("overhead") && (
          <button
            onClick={() => handleSwitchTab("overhead")}
            className={`flex flex-col items-center space-y-1 py-1 px-2 rounded-xl transition-all cursor-pointer ${
              activeTab === "overhead" ? "text-amber-600 dark:text-amber-400 font-black" : "text-slate-500 dark:text-slate-400 font-semibold"
            }`}
          >
            <Building2 className="w-5 h-5" />
            <span className="text-[10px]">মাসিক খরচ</span>
          </button>
        )}

        <button
          onClick={handleRefreshData}
          disabled={isRefreshing}
          className="flex flex-col items-center space-y-1 py-1 px-1.5 text-slate-500 dark:text-slate-400 font-semibold active:scale-95 cursor-pointer"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin text-amber-600 dark:text-amber-400" : ""}`} />
          <span className="text-[10px]">রিফ্রেশ</span>
        </button>

        <button
          onClick={handleLogout}
          title="লগআউট"
          className="flex flex-col items-center space-y-1 py-1 px-1.5 text-rose-500 dark:text-rose-400 font-semibold active:scale-95 cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px]">লগআউট</span>
        </button>
      </div>
    </div>
  );
}
