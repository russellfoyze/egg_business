"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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
  PiggyBank,
  ToggleLeft,
  ToggleRight,
  Link2,
  Receipt,
  Boxes,
  BarChart3,
  ArrowUpDown,
} from "lucide-react";
import { ComputedDayData, saveLedgerEntryAction } from "./actions";
import OverheadExpensesView from "./OverheadExpensesView";
import SavingsTrackerView from "./SavingsTrackerView";
import LoginScreen from "./LoginScreen";
import { UserAccount } from "@/lib/auth";
import ThemeToggle from "./ThemeToggle";
import ImageToJsonModal from "./ImageToJsonModal";
import DateTimePicker, { formatToDayMonthYear } from "./DateTimePicker";

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
  const [activeTab, setActiveTab] = useState<"dashboard" | "entry" | "overhead" | "savings">("dashboard");
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
  const [selectedStockDateRange, setSelectedStockDateRange] = useState<string>("all");
  const [selectedStockProductFilter, setSelectedStockProductFilter] = useState<string>("total_qty");
  const [hoveredStockIndex, setHoveredStockIndex] = useState<number | null>(null);
  const [selectedSalesDateRange, setSelectedSalesDateRange] = useState<string>("all");
  const [salesGraphMetric, setSalesGraphMetric] = useState<"both" | "sales" | "margin">("both");
  const [hoveredSalesIndex, setHoveredSalesIndex] = useState<number | null>(null);
  const [salesTableSortOrder, setSalesTableSortOrder] = useState<"asc" | "desc">("asc");
  const salesTableRef = useRef<HTMLDivElement>(null);

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
      isOverheadLinked?: boolean;
      overheadCategory?: string;
    }[]
  >([{ expenseType: "নাস্তা-চা", customName: "", amount: 0, wastedEggQty: 0, wastedEggCost: 0, isOverheadLinked: false, overheadCategory: "extra" }]);

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
      {
        expenseType: "নাস্তা-চা",
        customName: "",
        amount: 0,
        wastedEggQty: 0,
        wastedEggCost: 0,
        isOverheadLinked: false,
        overheadCategory: "extra",
      },
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

    // Auto-link preset "সমিতি" to in-shop savings (সমিতি === দোকানে সঞ্চয়)
    if (field === "expenseType") {
      if (value === "সমিতি") {
        current.isOverheadLinked = true;
        current.overheadCategory = "savings_shop";
      }
    }

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

  // Live breakdown of expenses linked to Overhead & Savings
  const formLiveOverheadBreakdown = useMemo(() => {
    let overheadCount = 0;
    let overheadSum = 0;
    let savingsShopSum = 0;
    let savingsBankSum = 0;
    let billsFromShopSavingsSum = 0;
    let billsFromBankSavingsSum = 0;

    expenses.forEach((exp) => {
      if (!exp.isOverheadLinked || !exp.amount || exp.amount <= 0) return;
      const amt = Number(exp.amount) || 0;
      const cat = exp.overheadCategory || (exp.expenseType === "সমিতি" ? "savings_shop" : "extra");

      if (cat === "savings_shop") {
        savingsShopSum += amt;
      } else if (cat === "savings_bank") {
        savingsBankSum += amt;
      } else if (cat === "bill_from_savings_shop") {
        billsFromShopSavingsSum += amt;
      } else if (cat === "bill_from_savings_bank") {
        billsFromBankSavingsSum += amt;
      } else {
        overheadCount++;
        overheadSum += amt;
      }
    });

    const totalLinked =
      overheadSum +
      savingsShopSum +
      savingsBankSum +
      billsFromShopSavingsSum +
      billsFromBankSavingsSum;
    const totalLinkedCount = expenses.filter(
      (exp) => exp.isOverheadLinked && exp.amount && exp.amount > 0
    ).length;

    return {
      overheadCount,
      overheadSum,
      savingsShopSum,
      savingsBankSum,
      billsFromShopSavingsSum,
      billsFromBankSavingsSum,
      totalLinked,
      totalLinkedCount,
    };
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
        // Auto-sync any overhead & savings linked expense entries
        const linkedExpenses = expenses.filter(
          (exp) => exp.isOverheadLinked && Number(exp.amount) > 0
        );

        if (linkedExpenses.length > 0) {
          for (const exp of linkedExpenses) {
            const finalType =
              exp.expenseType === "Other" && exp.customName ? exp.customName.trim() : exp.expenseType;
            const cat =
              exp.overheadCategory ||
              (exp.expenseType === "সমিতি" ? "savings_shop" : "extra");
            const pMode =
              cat === "savings_bank" || cat === "bill_from_savings_bank"
                ? "bank"
                : "cash";

            try {
              await fetch("/api/overhead", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  date: formDate,
                  category: cat,
                  title: `${finalType}${cat === "savings_shop" && !finalType.includes("সমিতি") ? " (সমিতি)" : ""}`,
                  amount: Number(exp.amount),
                  paymentMode: pMode,
                  notes: `দৈনিক হালখাতা (পৃষ্ঠা ${formPageNo}) হতে স্বয়ংক্রিয় সিঙ্ক`,
                }),
              });
            } catch (e) {
              console.error("Failed to auto-sync linked overhead expense:", e);
            }
          }
        }

        setSubmitMessage({
          type: "success",
          text:
            linkedExpenses.length > 0
              ? `${formDate} তারিখের পেজ এবং কর্মচারী/সঞ্চয় ফান্ড সফলভাবে সেভ ও সিঙ্ক হয়েছে!`
              : `${formDate} তারিখের পেজ গুগল শিটে সফলভাবে সেভ ও সিঙ্ক হয়েছে!`,
        });
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

  // Stock Historic Trend Data Computation
  const stockFilteredData: ComputedDayData[] = useMemo(() => {
    if (!data || data.length === 0) return [];
    if (selectedStockDateRange === "all") return data;
    if (selectedStockDateRange === "7" || selectedStockDateRange === "7d") return data.slice(-7);
    if (selectedStockDateRange === "14" || selectedStockDateRange === "14d") return data.slice(-14);
    if (selectedStockDateRange === "30" || selectedStockDateRange === "30d") return data.slice(-30);
    const count = parseInt(selectedStockDateRange, 10);
    if (!isNaN(count)) return data.slice(-count);
    return data;
  }, [data, selectedStockDateRange]);

  const stockGraphStats = useMemo(() => {
    if (!stockFilteredData || stockFilteredData.length === 0) {
      return {
        points: [] as { date: string; day: string; val: number; detailQty: number; detailVal: number; index: number }[],
        maxVal: 0,
        minVal: 0,
        avgVal: 0,
        totalValSum: 0,
        peakDay: null as { date: string; day: string; val: number; detailQty: number; detailVal: number; index: number } | null,
        lowestDay: null as { date: string; day: string; val: number; detailQty: number; detailVal: number; index: number } | null,
        currentDayPoint: null as { date: string; day: string; val: number; detailQty: number; detailVal: number; index: number } | null,
        unit: "টি",
        yMin: 0,
        yMax: 1000,
        yTicks: [0, 250, 500, 750, 1000],
        activeColor: { stroke: "#f59e0b", fill: "rgba(245, 158, 11, 0.15)", dot: "#d97706", label: "মোট মজুদ সংখ্যা" },
      };
    }

    const isValuation = selectedStockProductFilter === "total_val";
    const isTotalQty = selectedStockProductFilter === "total_qty";
    const selectedEggType = !isValuation && !isTotalQty ? selectedStockProductFilter : null;

    let unit = "টি";
    let activeColor = { stroke: "#f59e0b", fill: "rgba(245, 158, 11, 0.15)", dot: "#d97706", label: "মোট মজুদ ডিম (সংখ্যা)" };

    if (isValuation) {
      unit = "৳";
      activeColor = { stroke: "#10b981", fill: "rgba(16, 185, 129, 0.15)", dot: "#059669", label: "মোট মজুদ মূল্যায়ন (টাকা)" };
    } else if (selectedEggType && EGG_COLORS[selectedEggType]) {
      activeColor = {
        stroke: EGG_COLORS[selectedEggType].stroke,
        fill: EGG_COLORS[selectedEggType].fill,
        dot: EGG_COLORS[selectedEggType].dot,
        label: EGG_COLORS[selectedEggType].label || selectedEggType,
      };
    }

    const points = stockFilteredData.map((d, index) => {
      let val = 0;
      let detailQty = 0;
      let detailVal = 0;

      const totalStockQty = Object.values(d.stock).reduce((sum, item) => sum + (item.currentStock || 0), 0);
      const totalStockVal = d.financials.totalStockValue || 0;

      if (isValuation) {
        val = totalStockVal;
        detailVal = totalStockVal;
        detailQty = totalStockQty;
      } else if (isTotalQty) {
        val = totalStockQty;
        detailQty = totalStockQty;
        detailVal = totalStockVal;
      } else if (selectedEggType && d.stock[selectedEggType]) {
        const item = d.stock[selectedEggType];
        val = item.currentStock || 0;
        detailQty = val;
        const rate = item.purchaseRate > 0 ? item.purchaseRate : DEFAULT_RATES[selectedEggType] || 0;
        detailVal = item.stockValue || val * rate;
      }

      return {
        date: d.date,
        day: getBanglaDay(d.day),
        val,
        detailQty,
        detailVal,
        index,
      };
    });

    const values = points.map((p) => p.val);
    const rawMax = values.length > 0 ? Math.max(...values) : 0;
    const totalValSum = values.reduce((a, b) => a + b, 0);
    const avgVal = Math.round(totalValSum / Math.max(1, values.length));

    // Peak day (highest value)
    const sortedPoints = [...points].sort((a, b) => a.val - b.val);
    const peakDay = sortedPoints.length > 0 ? sortedPoints[sortedPoints.length - 1] : null;

    // Lowest day: if lowest is 0, count the 2nd lowest (non-zero if available)
    let lowestDay = sortedPoints[0] || null;
    if (lowestDay && lowestDay.val === 0) {
      const nonZeroLowest = sortedPoints.find((p) => p.val > 0);
      if (nonZeroLowest) {
        lowestDay = nonZeroLowest;
      } else if (sortedPoints.length > 1) {
        lowestDay = sortedPoints[1];
      }
    }

    const minVal = lowestDay ? lowestDay.val : 0;

    // Current view day value
    const currentDayPoint = currentViewDay
      ? points.find((p) => p.date === currentViewDay.date) || points[points.length - 1]
      : points[points.length - 1];

    // Calculate nice Y scale ticks
    let yMin = 0;
    let yMax = rawMax > 0 ? Math.ceil(rawMax * 1.15) : 100;
    const span = yMax - yMin;

    let step = 50;
    if (span <= 100) step = 20;
    else if (span <= 300) step = 50;
    else if (span <= 1000) step = 200;
    else if (span <= 3000) step = 500;
    else if (span <= 8000) step = 1000;
    else if (span <= 20000) step = 2500;
    else if (span <= 50000) step = 5000;
    else if (span <= 100000) step = 15000;
    else step = 25000;

    yMax = Math.ceil(yMax / step) * step;
    if (yMax === 0) yMax = step;

    const yTicks: number[] = [];
    for (let t = yMin; t <= yMax + 0.001; t += step) {
      yTicks.push(t);
    }

    return {
      points,
      maxVal: rawMax,
      minVal,
      avgVal,
      totalValSum,
      peakDay,
      lowestDay,
      currentDayPoint,
      unit,
      yMin,
      yMax,
      yTicks,
      activeColor,
    };
  }, [stockFilteredData, selectedStockProductFilter, currentViewDay]);

  // Historical Sales vs Margin Chart Data Computation
  const salesFilteredData: ComputedDayData[] = useMemo(() => {
    if (!data || data.length === 0) return [];
    if (selectedSalesDateRange === "all") return data;
    if (selectedSalesDateRange === "7" || selectedSalesDateRange === "7d") return data.slice(-7);
    if (selectedSalesDateRange === "14" || selectedSalesDateRange === "14d") return data.slice(-14);
    if (selectedSalesDateRange === "30" || selectedSalesDateRange === "30d") return data.slice(-30);
    const count = parseInt(selectedSalesDateRange, 10);
    if (!isNaN(count)) return data.slice(-count);
    return data;
  }, [data, selectedSalesDateRange]);

  const salesVsMarginStats = useMemo(() => {
    if (!salesFilteredData || salesFilteredData.length === 0) {
      return {
        points: [] as {
          date: string;
          day: string;
          sales: number;
          cost: number;
          margin: number;
          soldQty: number;
          marginPercent: number;
          index: number;
        }[],
        totalSales: 0,
        totalMargin: 0,
        totalCost: 0,
        avgSales: 0,
        avgMargin: 0,
        avgMarginPercent: 0,
        maxSales: 0,
        maxMargin: 0,
        peakSalesDay: null as { date: string; day: string; sales: number; margin: number } | null,
        peakMarginDay: null as { date: string; day: string; sales: number; margin: number } | null,
        currentDayPoint: null as {
          date: string;
          day: string;
          sales: number;
          cost: number;
          margin: number;
          soldQty: number;
          marginPercent: number;
        } | null,
        yMin: 0,
        yMax: 10000,
        yTicks: [0, 2500, 5000, 7500, 10000],
        ySalesMax: 10000,
        ySalesTicks: [0, 2500, 5000, 7500, 10000],
        yMarginMax: 5000,
        yMarginTicks: [0, 1000, 2000, 3000, 4000, 5000],
      };
    }

    const points = salesFilteredData.map((d, index) => {
      const sales = d.sales?.dailySalesAmount || 0;
      const cost = d.sales?.soldStockCost || 0;
      const margin = d.financials?.profitMargin || 0;
      const soldQty = d.sales?.totalSoldQty || 0;
      const marginPercent = sales > 0 ? (margin / sales) * 100 : 0;

      return {
        date: d.date,
        day: d.day,
        sales,
        cost,
        margin,
        soldQty,
        marginPercent: Number(marginPercent.toFixed(1)),
        index,
      };
    });

    const totalSales = points.reduce((s, p) => s + p.sales, 0);
    const totalMargin = points.reduce((s, p) => s + p.margin, 0);
    const totalCost = points.reduce((s, p) => s + p.cost, 0);
    const avgSales = Math.round(totalSales / points.length);
    const avgMargin = Math.round(totalMargin / points.length);
    const avgMarginPercent = totalSales > 0 ? Number(((totalMargin / totalSales) * 100).toFixed(1)) : 0;

    const salesValues = points.map((p) => p.sales);
    const marginValues = points.map((p) => p.margin);
    const maxSales = Math.max(...salesValues, 0);
    const maxMargin = Math.max(...marginValues, 0);

    let peakSalesDay = points[0] || null;
    let peakMarginDay = points[0] || null;

    points.forEach((p) => {
      if (!peakSalesDay || p.sales > peakSalesDay.sales) peakSalesDay = p;
      if (!peakMarginDay || p.margin > peakMarginDay.margin) peakMarginDay = p;
    });

    const currentDayPoint = currentViewDay
      ? points.find((p) => p.date === currentViewDay.date) || points[points.length - 1]
      : points[points.length - 1];

    // Sales Y-scale
    let ySalesMax = Math.ceil(Math.max(maxSales, 1000) * 1.15);
    let stepSales = 5000;
    if (ySalesMax <= 10000) stepSales = 2000;
    else if (ySalesMax <= 25000) stepSales = 5000;
    else if (ySalesMax <= 50000) stepSales = 10000;
    else if (ySalesMax <= 100000) stepSales = 20000;
    else stepSales = 25000;

    ySalesMax = Math.ceil(ySalesMax / stepSales) * stepSales;
    if (ySalesMax === 0) ySalesMax = stepSales;

    const ySalesTicks: number[] = [];
    for (let t = 0; t <= ySalesMax + 0.001; t += stepSales) {
      ySalesTicks.push(t);
    }

    // Margin Dedicated Y-scale (High Resolution Margin Scale)
    let yMarginMax = Math.ceil(Math.max(maxMargin, 500) * 1.25);
    let stepMargin = 1000;
    if (yMarginMax <= 1000) stepMargin = 200;
    else if (yMarginMax <= 2500) stepMargin = 500;
    else if (yMarginMax <= 7000) stepMargin = 1500;
    else if (yMarginMax <= 15000) stepMargin = 2500;
    else if (yMarginMax <= 30000) stepMargin = 5000;
    else stepMargin = 10000;

    yMarginMax = Math.ceil(yMarginMax / stepMargin) * stepMargin;
    if (yMarginMax === 0) yMarginMax = stepMargin;

    const yMarginTicks: number[] = [];
    for (let t = 0; t <= yMarginMax + 0.001; t += stepMargin) {
      yMarginTicks.push(t);
    }

    const yMin = 0;
    const yMax = salesGraphMetric === "margin" ? yMarginMax : ySalesMax;
    const yTicks = salesGraphMetric === "margin" ? yMarginTicks : ySalesTicks;

    return {
      points,
      totalSales,
      totalMargin,
      totalCost,
      avgSales,
      avgMargin,
      avgMarginPercent,
      maxSales,
      maxMargin,
      peakSalesDay,
      peakMarginDay,
      currentDayPoint,
      yMin,
      yMax,
      yTicks,
      ySalesMax,
      ySalesTicks,
      yMarginMax,
      yMarginTicks,
    };
  }, [salesFilteredData, currentViewDay, salesGraphMetric]);

  // Auto-scroll sales table to the bottom on load/filter change so last/latest data is visible first
  useEffect(() => {
    if (activeTab === "dashboard" && salesTableRef.current) {
      if (salesTableSortOrder === "asc") {
        salesTableRef.current.scrollTop = salesTableRef.current.scrollHeight;
      } else {
        salesTableRef.current.scrollTop = 0;
      }
    }
  }, [activeTab, selectedSalesDateRange, salesVsMarginStats.points.length, salesTableSortOrder]);

  // Keep selected day visible in the table when selected
  useEffect(() => {
    if (activeTab === "dashboard" && currentViewDay?.date && salesTableRef.current) {
      const row = document.getElementById(`tbl-sales-row-${currentViewDay.date}`);
      if (row) {
        row.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [activeTab, currentViewDay?.date]);

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

  const handleSwitchTab = (tab: "dashboard" | "entry" | "overhead" | "savings") => {
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

  // Date Formatting Helper (YYYY-MM-DD -> DD/MM/YYYY)
  const formatDisplayDate = (dateStr: string) => {
    return formatToDayMonthYear(dateStr);
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
    return (
      <div className={`flex items-center justify-between bg-slate-900 dark:bg-slate-900 border border-slate-700/80 rounded-2xl px-1 sm:px-2 py-1 shadow-md min-w-0 select-none ${className}`}>
        <button
          type="button"
          title="পূর্ববর্তী দিন"
          onClick={onPrev}
          disabled={!canPrev}
          className="p-1 sm:p-1.5 text-slate-400 hover:text-white disabled:opacity-20 transition-colors cursor-pointer shrink-0"
        >
          <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        <div className="flex items-center space-x-1 sm:space-x-1.5 px-0.5 sm:px-1 min-w-0 justify-center">
          <DateTimePicker
            value={currentDateStr}
            onChange={(newDate) => {
              if (newDate) onDateChange(newDate);
            }}
            compact={true}
          />

          {/* Bengali Day Badge */}
          {currentDayName && (
            <span className="text-[10px] sm:text-xs font-black text-amber-200 bg-amber-950/90 hover:bg-amber-900/90 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl border border-amber-600/60 shadow-inner shrink-0 block transition-colors leading-tight">
              {getBanglaDay(currentDayName)}
            </span>
          )}
        </div>

        <button
          type="button"
          title="পরবর্তী দিন"
          onClick={onNext}
          disabled={!canNext}
          className="p-1 sm:p-1.5 text-slate-400 hover:text-white disabled:opacity-20 transition-colors cursor-pointer shrink-0"
        >
          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
      <div className="min-h-screen flex flex-col">
        {/* 🌟 Top Navigation Bar */}
        <header className="bg-gradient-to-r from-amber-600 via-amber-600 to-amber-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 text-white shadow-md sticky top-0 z-50 backdrop-blur-md border-b border-amber-700/50 dark:border-slate-800 transition-colors duration-200">
          <div className="w-full max-w-none mx-auto px-2 sm:px-6 lg:px-[100px] py-2 sm:py-3 flex justify-between items-center gap-2">
            <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
              <div>
                <span className="text-sm sm:text-lg font-black tracking-tight leading-none whitespace-nowrap block">
                  M.A Khalek Sarker
                </span>
                <p className="text-[10px] text-amber-200/90 dark:text-slate-400 font-medium hidden md:block mt-0.5">
                  এম. এ. খালেক সরকার — ডিমের পাইকারি আড়ত ও ডিজিটাল খতিয়ান
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
              <ThemeToggle />
              <span className="inline-flex items-center gap-1.5 bg-amber-500/20 dark:bg-slate-800 text-amber-100 dark:text-amber-300 text-xs font-bold px-2.5 py-1.5 rounded-xl border border-white/20">
                <UserCheck className="w-3.5 h-3.5 text-amber-300" />
                <span>লগইন পেজ</span>
              </span>
            </div>
          </div>
        </header>

        <main className="w-full max-w-none mx-auto px-2 sm:px-6 lg:px-[100px] py-4 sm:py-6 flex-1">
          <LoginScreen
            onLoginSuccess={(u) => {
              setCurrentUser(u);
              if (u.allowedTabs && u.allowedTabs.length > 0) {
                setActiveTab(u.allowedTabs[0]);
              }
            }}
          />
        </main>
      </div>
    );
  }

  const isAllowed = (tab: "dashboard" | "entry" | "overhead" | "savings") => {
    if (!currentUser) return true;
    return currentUser.allowedTabs.includes(tab);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* 🌟 Top Navigation Bar with Refresh & Login/Profile */}
      <header className="bg-gradient-to-r from-amber-600 via-amber-600 to-amber-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 text-white shadow-md sticky top-0 z-50 backdrop-blur-md border-b border-amber-700/50 dark:border-slate-800 transition-colors duration-200">
        <div className="w-full max-w-none mx-auto px-2 sm:px-6 lg:px-[100px] py-2 sm:py-3 flex justify-between items-center gap-2">
          {/* Branding */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0 min-w-0">
            <div>
              <span className="text-sm sm:text-lg font-black tracking-tight leading-none whitespace-nowrap block">
                M.A Khalek Sarker
              </span>
              <p className="text-[10px] text-amber-200/90 dark:text-slate-400 font-medium hidden md:block mt-0.5">
                এম. এ. খালেক সরকার — ডিমের পাইকারি আড়ত ও ডিজিটাল খতিয়ান
              </p>
            </div>
          </div>

          {/* Right Action Controls: Refresh, Login/Profile, OCR, ThemeToggle, Live Sync */}
          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            {/* 🔄 রিফ্রেশ বাটন (Refresh in Top Bar) */}
            <button
              onClick={handleRefreshData}
              disabled={isRefreshing}
              className="p-1.5 sm:px-3 sm:py-1.5 bg-white/15 hover:bg-white/25 active:scale-95 text-white rounded-lg sm:rounded-xl text-xs font-bold border border-white/20 shadow-xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
              title="তথ্য রিফ্রেশ করুন"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-amber-300" : ""}`} />
              <span className="hidden sm:inline">{isRefreshing ? "সিঙ্ক হচ্ছে..." : "রিফ্রেশ"}</span>
            </button>

            {/* 👤 লগইন ও ইউজার প্রোফাইল (Login / Profile in Top Bar) */}
            {currentUser && (
              <div className="flex items-center space-x-1 sm:space-x-1.5 bg-black/25 dark:bg-slate-800/90 border border-white/20 dark:border-slate-700/80 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold shadow-xs shrink-0">
                <span className="text-xs sm:text-sm">{currentUser.avatarEmoji}</span>
                <span className="text-white font-black max-w-[60px] sm:max-w-[120px] truncate">{currentUser.username}</span>
                <span className="hidden md:inline text-[10px] text-amber-200 bg-white/10 px-1.5 py-0.5 rounded-md font-semibold">
                  {currentUser.roleLabel.split(" ")[1]}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="লগআউট করুন"
                  className="p-0.5 sm:p-1 text-amber-200 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              </div>
            )}

            {/* 📸 চালান OCR বাটন */}
            <ImageToJsonModal />

            {/* 🌓 থিম টগল */}
            <ThemeToggle />

            {/* 🟢 লাইভ সিঙ্ক ব্যাজ */}
            <span className="hidden lg:inline-flex items-center gap-1.5 bg-emerald-500/20 dark:bg-emerald-950/50 text-emerald-100 dark:text-emerald-300 text-[11px] font-bold px-2.5 py-1.5 rounded-full border border-emerald-400/30 dark:border-emerald-700/50 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>লাইভ সিঙ্ক</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-none mx-auto px-2 sm:px-6 lg:px-[100px] py-4 sm:py-6 flex-1">
        <div className="space-y-4 sm:space-y-6">
          {/* Sticky Secondary Navigation (Tabs on Left, Date Navigator on Right) */}
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

              {isAllowed("savings") && (
                <button
                  onClick={() => handleSwitchTab("savings")}
                  className={`flex items-center justify-center space-x-1.5 sm:space-x-2 px-3 sm:px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === "savings"
                      ? "bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-sm font-black"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                  }`}
                >
                  <PiggyBank className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>সঞ্চয় ও অতিরিক্ত আয়</span>
                </button>
              )}
            </div>

            {/* Unified Date Navigator Pill on the Right (Web View) */}
            {activeTab !== "overhead" && activeTab !== "savings" &&
              renderDateNavigatorPill(
                activeDisplayDate,
                activeDisplayDay,
                handleUnifiedDateChange,
                () => handleUnifiedDateStep(-1),
                () => handleUnifiedDateStep(1),
                activeDateIdx > 0,
                activeDateIdx < data.length - 1
              )}
          </div>

          {/* Sticky Mobile Sub-Header (Date Navigator for Mobile Phone View) */}
          <div className="sm:hidden sticky top-[54px] z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1.5 rounded-2xl shadow-md border border-slate-200/90 dark:border-slate-800/90 flex items-center gap-1.5 w-full min-w-0">
            {activeTab !== "overhead" && activeTab !== "savings" &&
              renderDateNavigatorPill(
                activeDisplayDate,
                activeDisplayDay,
                handleUnifiedDateChange,
                () => handleUnifiedDateStep(-1),
                () => handleUnifiedDateStep(1),
                activeDateIdx > 0,
                activeDateIdx < data.length - 1,
                "flex-1 min-w-0"
              )}
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
                {currentViewDay ? `নির্বাচিত তারিখ: ${formatDisplayDate(currentViewDay.date)} (${getBanglaDay(currentViewDay.day)})` : "তথ্য নেই"}
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

          {/* Stock Historic Graph & Stock Details Section (65% / 35% Split) */}
          {currentViewDay && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
              {/* Left 65%: Historic Stock Product Graph */}
              <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-3.5 flex flex-col justify-between transition-colors">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                        <Boxes className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>ঐতিহাসিক স্টক পণ্যের গ্রাফ (Historic Stock)</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        দিনভিত্তিক মজুদ পণ্যের পরিমাণ ও মূল্যের ইতিহাস
                      </p>
                    </div>
                    <span className="text-[11px] font-black text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800/60">
                      স্টক: {stockGraphStats.currentDayPoint ? `${stockGraphStats.currentDayPoint.val.toLocaleString()} ${stockGraphStats.unit}` : "—"}
                    </span>
                  </div>

                  {/* Filter Controls: Date Range (7D, 14D, 30D, All) & Product Dropdown */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {/* Date range selector pills */}
                    <div className="inline-flex p-1 bg-slate-100/90 dark:bg-slate-800/90 rounded-xl">
                      {[
                        { id: "7d", label: "7D" },
                        { id: "14d", label: "14D" },
                        { id: "30d", label: "30D" },
                        { id: "all", label: "All" },
                      ].map((rng) => (
                        <button
                          key={rng.id}
                          type="button"
                          onClick={() => setSelectedStockDateRange(rng.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            selectedStockDateRange === rng.id
                              ? "bg-white dark:bg-slate-700 text-amber-900 dark:text-amber-300 shadow-sm font-black"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                          }`}
                        >
                          {rng.label}
                        </button>
                      ))}
                    </div>

                    {/* Stock metric selector */}
                    <div className="flex items-center space-x-1.5">
                      <select
                        value={selectedStockProductFilter}
                        onChange={(e) => setSelectedStockProductFilter(e.target.value)}
                        className="text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        <option value="total_qty">মোট সংখ্যা (Total Qty)</option>
                        <option value="total_val">মোট মূল্যায়ন (Total ৳)</option>
                        {EGG_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Egg Type Quick Filter Badges */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
                    <button
                      type="button"
                      onClick={() => setSelectedStockProductFilter("total_qty")}
                      className={`px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap transition-colors border ${
                        selectedStockProductFilter === "total_qty"
                          ? "bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700 font-black"
                          : "bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      মোট ডিম
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedStockProductFilter("total_val")}
                      className={`px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap transition-colors border ${
                        selectedStockProductFilter === "total_val"
                          ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-black"
                          : "bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      মোট মূল্য (৳)
                    </button>
                    {EGG_TYPES.map((type) => {
                      const shortName = type.split(" ")[0];
                      const isSelected = selectedStockProductFilter === type;
                      const eggCol = EGG_COLORS[type];
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setSelectedStockProductFilter(type)}
                          className={`px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap transition-colors flex items-center space-x-1 border ${
                            isSelected
                              ? "ring-1 ring-amber-500 shadow-sm font-black"
                              : "bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                          }`}
                          style={
                            isSelected && eggCol
                              ? {
                                  backgroundColor: eggCol.fill,
                                  borderColor: eggCol.stroke,
                                  color: eggCol.dot,
                                }
                              : undefined
                          }
                        >
                          <span
                            className="w-2 h-2 rounded-full inline-block"
                            style={{ backgroundColor: eggCol?.stroke || "#f59e0b" }}
                          />
                          <span>{shortName}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* 4 Summary Mini-cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
                    <div className="bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 rounded-xl p-2">
                      <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 block">সর্বোচ্চ (Peak)</span>
                      <span className="text-xs sm:text-sm font-black text-amber-950 dark:text-amber-200 block">
                        {stockGraphStats.unit === "৳" ? "৳ " : ""}{stockGraphStats.maxVal.toLocaleString()}{stockGraphStats.unit === "টি" ? " টি" : ""}
                      </span>
                      {stockGraphStats.peakDay && (
                        <span className="text-[9px] text-amber-700/80 dark:text-amber-400/80 block truncate">
                          {stockGraphStats.peakDay.date.slice(5)} ({stockGraphStats.peakDay.day})
                        </span>
                      )}
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 rounded-xl p-2">
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block">সর্বনিম্ন (Lowest)</span>
                      <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 block">
                        {stockGraphStats.unit === "৳" ? "৳ " : ""}{stockGraphStats.minVal.toLocaleString()}{stockGraphStats.unit === "টি" ? " টি" : ""}
                      </span>
                      {stockGraphStats.lowestDay && (
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 block truncate">
                          {stockGraphStats.lowestDay.date.slice(5)} ({stockGraphStats.lowestDay.day})
                        </span>
                      )}
                    </div>
                    <div className="bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-900/40 rounded-xl p-2">
                      <span className="text-[10px] font-bold text-indigo-800 dark:text-indigo-400 block">দৈনিক গড় (Avg)</span>
                      <span className="text-xs sm:text-sm font-black text-indigo-950 dark:text-indigo-200 block">
                        {stockGraphStats.unit === "৳" ? "৳ " : ""}{stockGraphStats.avgVal.toLocaleString()}{stockGraphStats.unit === "টি" ? " টি" : ""}
                      </span>
                      <span className="text-[9px] text-indigo-600/80 dark:text-indigo-400/80 block">
                        {stockFilteredData.length} দিনের গড়
                      </span>
                    </div>
                    <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/40 rounded-xl p-2">
                      <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 block">নির্বাচিত দিন (Day)</span>
                      <span className="text-xs sm:text-sm font-black text-emerald-950 dark:text-emerald-200 block">
                        {stockGraphStats.unit === "৳" ? "৳ " : ""}{stockGraphStats.currentDayPoint ? stockGraphStats.currentDayPoint.val.toLocaleString() : 0}{stockGraphStats.unit === "টি" ? " টি" : ""}
                      </span>
                      <span className="text-[9px] text-emerald-700/80 dark:text-emerald-400/80 block truncate">
                        {currentViewDay.date.slice(5)} ({currentViewDay.day})
                      </span>
                    </div>
                  </div>

                  {/* SVG Graph */}
                  <div className="overflow-hidden bg-slate-50/80 dark:bg-slate-950/60 rounded-xl border border-slate-200/90 dark:border-slate-800 p-2 sm:p-3 relative">
                    <svg viewBox="0 0 760 250" className="w-full h-auto select-none block">
                      <defs>
                        <linearGradient id="stockAreaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={stockGraphStats.activeColor.stroke} stopOpacity="0.35" />
                          <stop offset="100%" stopColor={stockGraphStats.activeColor.stroke} stopOpacity="0.01" />
                        </linearGradient>
                      </defs>

                      {(() => {
                        const yMin = stockGraphStats.yMin;
                        const yMax = stockGraphStats.yMax;
                        const plotTop = 26;
                        const plotHeight = 165;
                        const leftMargin = 55;
                        const rightMargin = 740;
                        const plotWidth = rightMargin - leftMargin;

                        const getY = (v: number) => {
                          const clamped = Math.max(yMin, Math.min(yMax, v));
                          return plotTop + plotHeight - ((clamped - yMin) / Math.max(1, yMax - yMin)) * plotHeight;
                        };

                        const getX = (index: number, total: number) => {
                          if (total <= 1) return leftMargin + plotWidth / 2;
                          return leftMargin + (index / (total - 1)) * plotWidth;
                        };

                        const totalDays = stockGraphStats.points.length;
                        const avgY = getY(stockGraphStats.avgVal);
                        const barWidth = Math.min(24, Math.max(8, (plotWidth / Math.max(1, totalDays)) * 0.42));

                        const pts = stockGraphStats.points.map((p, i) => {
                          const x = getX(i, totalDays);
                          const y = getY(p.val);
                          return { ...p, x, y };
                        });

                        const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
                        const areaD = pts.length > 0
                          ? `${pathD} L ${pts[pts.length - 1].x} ${plotTop + plotHeight} L ${pts[0].x} ${plotTop + plotHeight} Z`
                          : "";

                        return (
                          <g>
                            {/* Y-axis dashed grid lines & labels */}
                            {stockGraphStats.yTicks.map((tickVal) => {
                              const yP = getY(tickVal);
                              return (
                                <g key={`stock-tick-${tickVal}`}>
                                  <line
                                    x1={leftMargin}
                                    y1={yP}
                                    x2={rightMargin}
                                    y2={yP}
                                    className="stroke-slate-200 dark:stroke-slate-800"
                                    strokeWidth="1"
                                    strokeDasharray="3 3"
                                  />
                                  <text
                                    x={leftMargin - 6}
                                    y={yP + 3.5}
                                    textAnchor="end"
                                    className="text-[9px] font-bold fill-slate-500 dark:fill-slate-400"
                                  >
                                    {stockGraphStats.unit === "৳" ? "৳" : ""}
                                    {tickVal >= 1000 ? `${(tickVal / 1000).toFixed(tickVal % 1000 === 0 ? 0 : 1)}k` : tickVal}
                                  </text>
                                </g>
                              );
                            })}

                            {/* Left Axis Line */}
                            <line
                              x1={leftMargin}
                              y1={plotTop - 6}
                              x2={leftMargin}
                              y2={plotTop + plotHeight}
                              className="stroke-slate-500 dark:stroke-slate-400"
                              strokeWidth="1.5"
                            />

                            {/* Axis Titles */}
                            <text x={leftMargin} y="14" textAnchor="start" className="text-[9px] font-black fill-slate-500 dark:fill-slate-400 uppercase tracking-wider">
                              Y: মজুদ ({stockGraphStats.unit}) ↑
                            </text>
                            <text x={rightMargin} y="14" textAnchor="end" className="text-[9px] font-black fill-slate-500 dark:fill-slate-400 uppercase tracking-wider">
                              X: তারিখ →
                            </text>

                            {/* Average Stock Reference Line */}
                            {stockGraphStats.avgVal >= yMin && stockGraphStats.avgVal <= yMax && (
                              <g>
                                <line
                                  x1={leftMargin}
                                  y1={avgY}
                                  x2={rightMargin}
                                  y2={avgY}
                                  className="stroke-indigo-400/80 dark:stroke-indigo-500/80"
                                  strokeWidth="1"
                                  strokeDasharray="3 3"
                                />
                              </g>
                            )}

                            {/* Area Fill */}
                            {areaD && <path d={areaD} fill="url(#stockAreaGrad)" />}

                            {/* Line Path */}
                            {pathD && (
                              <path
                                d={pathD}
                                fill="none"
                                stroke={stockGraphStats.activeColor.stroke}
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            )}

                            {/* Interactive Columns & Points */}
                            {pts.map((p, i) => {
                              const isCurrent = currentViewDay && currentViewDay.date === p.date;
                              const isHovered = hoveredStockIndex === i;
                              return (
                                <g
                                  key={`stock-pt-${p.date}`}
                                  className="cursor-pointer group"
                                  onClick={() => setSelectedDashboardDate(p.date)}
                                  onMouseEnter={() => setHoveredStockIndex(i)}
                                  onMouseLeave={() => setHoveredStockIndex(null)}
                                >
                                  {/* Vertical Guideline on hover or current */}
                                  {(isHovered || isCurrent) && (
                                    <line
                                      x1={p.x}
                                      y1={plotTop}
                                      x2={p.x}
                                      y2={plotTop + plotHeight}
                                      stroke={stockGraphStats.activeColor.stroke}
                                      strokeWidth={isCurrent ? "1.5" : "1"}
                                      strokeDasharray="2 2"
                                      strokeOpacity={isCurrent ? "0.7" : "0.4"}
                                    />
                                  )}

                                  {/* Selected day highlight glow */}
                                  {isCurrent && (
                                    <rect
                                      x={p.x - barWidth / 2 - 3}
                                      y={plotTop}
                                      width={barWidth + 6}
                                      height={plotHeight}
                                      rx="4"
                                      fill={stockGraphStats.activeColor.fill}
                                      opacity="0.5"
                                    />
                                  )}

                                  {/* Data Point Dot */}
                                  <circle
                                    cx={p.x}
                                    cy={p.y}
                                    r={isCurrent || isHovered ? 5.5 : 3.5}
                                    fill={isCurrent ? stockGraphStats.activeColor.dot : "#fff"}
                                    stroke={stockGraphStats.activeColor.stroke}
                                    strokeWidth={isCurrent ? "2.5" : "2"}
                                    className="transition-all"
                                  />

                                  {/* Bottom Tick Mark */}
                                  <line
                                    x1={p.x}
                                    y1={plotTop + plotHeight}
                                    x2={p.x}
                                    y2={plotTop + plotHeight + 4}
                                    className="stroke-slate-500 dark:stroke-slate-400"
                                    strokeWidth="1"
                                  />

                                  {/* Date Label */}
                                  <text
                                    x={p.x}
                                    y={plotTop + plotHeight + 16}
                                    textAnchor="middle"
                                    className={`text-[8.5px] font-bold ${
                                      isCurrent
                                        ? "fill-amber-600 dark:fill-amber-400 font-black"
                                        : "fill-slate-600 dark:fill-slate-400"
                                    }`}
                                  >
                                    {p.date.slice(8)}
                                  </text>
                                </g>
                              );
                            })}
                          </g>
                        );
                      })()}
                    </svg>

                    {/* Active / Hovered Tooltip Overlay */}
                    {(() => {
                      const activeIndex =
                        hoveredStockIndex !== null
                          ? hoveredStockIndex
                          : stockGraphStats.points.findIndex((p) => p.date === currentViewDay?.date);
                      const activePoint = activeIndex >= 0 ? stockGraphStats.points[activeIndex] : null;

                      if (!activePoint) return null;

                      return (
                        <div className="mt-2 p-2 bg-slate-900/90 dark:bg-slate-800/90 text-white rounded-lg text-[11px] flex flex-wrap items-center justify-between gap-2 shadow-md">
                          <div className="flex items-center space-x-2">
                            <span className="font-black text-amber-300">
                              {activePoint.date} ({activePoint.day})
                            </span>
                            <span className="text-slate-400">|</span>
                            <span className="text-slate-200">
                              মজুদ: <strong className="text-amber-400">{activePoint.detailQty.toLocaleString()} টি</strong>
                            </span>
                            <span className="text-slate-400">|</span>
                            <span className="text-slate-200">
                              মূল্যায়ন: <strong className="text-emerald-400">৳ {activePoint.detailVal.toLocaleString()}</strong>
                            </span>
                          </div>
                          <span className="text-[10px] text-amber-200/80 font-medium">
                            👆 ক্লিক করে দিন নির্বাচন করুন
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Right 35%: Stock Data Table */}
              <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-3 sm:space-y-4 flex flex-col justify-between transition-colors">
                <div>
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
                  <div className="hidden md:block overflow-x-auto mt-2">
                    <table className="w-full text-left text-[11px] sm:text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 uppercase font-bold text-[10px] sm:text-[11px]">
                          <th className="py-2.5 px-2">ডিমের ধরন</th>
                          <th className="py-2.5 px-1.5 text-right whitespace-nowrap">মজুদ (Qty)</th>
                          <th className="py-2.5 px-1.5 text-right whitespace-nowrap">দর</th>
                          <th className="py-2.5 px-2 text-right whitespace-nowrap">মোট মূল্য (৳)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-800 dark:text-slate-200">
                        {Object.entries(currentViewDay.stock).map(([eggName, item]) => {
                          const rate = item.purchaseRate > 0 ? item.purchaseRate : DEFAULT_RATES[eggName] || 0;
                          const totalVal = item.stockValue || item.currentStock * rate;
                          return (
                            <tr key={eggName} className="hover:bg-amber-50/30 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="py-2.5 px-2 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">{eggName}</td>
                              <td className="py-2.5 px-1.5 text-right font-black text-slate-800 dark:text-slate-200 whitespace-nowrap">{item.currentStock.toLocaleString()}</td>
                              <td className="py-2.5 px-1.5 text-right text-slate-600 dark:text-slate-400 whitespace-nowrap">৳{rate}</td>
                              <td className="py-2.5 px-2 text-right font-black text-amber-800 dark:text-amber-400 whitespace-nowrap">৳{totalVal.toLocaleString()}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-amber-50/70 dark:bg-amber-950/40 border-t-2 border-amber-300 dark:border-amber-800/70 font-black text-[11px] sm:text-xs text-slate-900 dark:text-slate-100">
                          <td className="py-2.5 px-2 text-amber-950 dark:text-amber-300 whitespace-nowrap">সর্বমোট</td>
                          <td className="py-2.5 px-1.5 text-right text-slate-900 dark:text-slate-100 font-black whitespace-nowrap">
                            {Object.values(currentViewDay.stock).reduce((sum, item) => sum + (item.currentStock || 0), 0).toLocaleString()} টি
                          </td>
                          <td className="py-2.5 px-1.5 text-right text-slate-400">—</td>
                          <td className="py-2.5 px-2 text-right text-amber-900 dark:text-amber-300 font-black whitespace-nowrap">৳{viewStock.toLocaleString()}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Mobile Card Grid View (Stock Only) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:hidden gap-2.5 mt-2">
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
              </div>
            </div>
          )}

          {/* ================= HISTORICAL SALES VS MARGIN SECTION (35% GRAPH / 65% DATA TABLE) ================= */}
          {currentViewDay && (
            <div className="grid grid-cols-1 landscape:grid-cols-12 sm:landscape:grid-cols-12 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-5 items-stretch">
              {/* Left 35%: Minimal Sales vs Margin Comparison Graph */}
              <div className="col-span-1 landscape:col-span-4 sm:landscape:col-span-4 lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 lg:p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-2.5 flex flex-col justify-between transition-colors">
                <div className="space-y-2.5">
                  {/* Header */}
                  <div className="flex justify-between items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <ShoppingCart className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      <h3 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 truncate">
                        বিক্রি ও মার্জিন গ্রাফ
                      </h3>
                    </div>
                    <span className="text-[10px] font-black text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800/60 whitespace-nowrap shrink-0">
                      আজ: ৳{salesVsMarginStats.currentDayPoint ? salesVsMarginStats.currentDayPoint.sales.toLocaleString() : "—"}
                    </span>
                  </div>

                  {/* Filter Controls: Date Range (7D, 14D, 30D, All) & Metric Toggle */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    {/* Date range selector pills */}
                    <div className="inline-flex p-0.5 bg-slate-100/90 dark:bg-slate-800/90 rounded-lg">
                      {[
                        { id: "7d", label: "7D" },
                        { id: "14d", label: "14D" },
                        { id: "30d", label: "30D" },
                        { id: "all", label: "All" },
                      ].map((rng) => (
                        <button
                          key={rng.id}
                          type="button"
                          onClick={() => setSelectedSalesDateRange(rng.id)}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                            selectedSalesDateRange === rng.id
                              ? "bg-white dark:bg-slate-700 text-blue-900 dark:text-blue-300 shadow-xs font-black"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                          }`}
                        >
                          {rng.label}
                        </button>
                      ))}
                    </div>

                    {/* Metric Display Mode Pills */}
                    <div className="inline-flex p-0.5 bg-slate-100/90 dark:bg-slate-800/90 rounded-lg text-[10px]">
                      <button
                        type="button"
                        onClick={() => setSalesGraphMetric("both")}
                        className={`px-1.5 py-0.5 rounded-md font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                          salesGraphMetric === "both"
                            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-black"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                        }`}
                        title="উভয় বিক্রি ও মার্জিন"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                        <span>উভয়</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSalesGraphMetric("sales")}
                        className={`px-1.5 py-0.5 rounded-md font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                          salesGraphMetric === "sales"
                            ? "bg-white dark:bg-slate-700 text-blue-900 dark:text-blue-300 shadow-xs font-black"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                        }`}
                        title="শুধু মোট বিক্রি"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                        <span>বিক্রি</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSalesGraphMetric("margin")}
                        className={`px-1.5 py-0.5 rounded-md font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                          salesGraphMetric === "margin"
                            ? "bg-white dark:bg-slate-700 text-emerald-900 dark:text-emerald-300 shadow-xs font-black"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                        }`}
                        title="শুধু নিট মার্জিন"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                        <span>মার্জিন</span>
                      </button>
                    </div>
                  </div>

                  {/* Minimal Sales & Margin Summary (2 Compact Cards) */}
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2 pt-0.5">
                    {salesGraphMetric === "margin" ? (
                      <>
                        <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/50 rounded-xl p-2">
                          <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 block truncate">মোট মার্জিন</span>
                          <span className="text-xs sm:text-sm font-black text-emerald-950 dark:text-emerald-200 block truncate">
                            ৳ {salesVsMarginStats.totalMargin.toLocaleString()}
                          </span>
                          <span className="text-[9px] text-emerald-700/80 dark:text-emerald-400/80 block mt-0.5 truncate">
                            গড়: ৳{salesVsMarginStats.avgMargin.toLocaleString()}
                          </span>
                        </div>
                        <div className="bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-900/50 rounded-xl p-2">
                          <span className="text-[10px] font-bold text-teal-800 dark:text-teal-400 block truncate">সর্বোচ্চ মার্জিন</span>
                          <span className="text-xs sm:text-sm font-black text-teal-950 dark:text-teal-200 block truncate">
                            ৳ {salesVsMarginStats.maxMargin.toLocaleString()}
                          </span>
                          <span className="text-[9px] text-teal-700/80 dark:text-teal-400/80 block mt-0.5 truncate">
                            তারিখ: {salesVsMarginStats.peakMarginDay?.date ? salesVsMarginStats.peakMarginDay.date.slice(5) : "-"}
                          </span>
                        </div>
                      </>
                    ) : salesGraphMetric === "sales" ? (
                      <>
                        <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50 rounded-xl p-2">
                          <span className="text-[10px] font-bold text-blue-800 dark:text-blue-400 block truncate">মোট বিক্রি</span>
                          <span className="text-xs sm:text-sm font-black text-blue-950 dark:text-blue-200 block truncate">
                            ৳ {salesVsMarginStats.totalSales.toLocaleString()}
                          </span>
                          <span className="text-[9px] text-blue-700/80 dark:text-blue-400/80 block mt-0.5 truncate">
                            গড়: ৳{salesVsMarginStats.avgSales.toLocaleString()}
                          </span>
                        </div>
                        <div className="bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/50 rounded-xl p-2">
                          <span className="text-[10px] font-bold text-indigo-800 dark:text-indigo-400 block truncate">সর্বোচ্চ বিক্রি</span>
                          <span className="text-xs sm:text-sm font-black text-indigo-950 dark:text-indigo-200 block truncate">
                            ৳ {salesVsMarginStats.maxSales.toLocaleString()}
                          </span>
                          <span className="text-[9px] text-indigo-700/80 dark:text-indigo-400/80 block mt-0.5 truncate">
                            তারিখ: {salesVsMarginStats.peakSalesDay?.date ? salesVsMarginStats.peakSalesDay.date.slice(5) : "-"}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50 rounded-xl p-2">
                          <span className="text-[10px] font-bold text-blue-800 dark:text-blue-400 block truncate">মোট বিক্রি</span>
                          <span className="text-xs sm:text-sm font-black text-blue-950 dark:text-blue-200 block truncate">
                            ৳ {salesVsMarginStats.totalSales.toLocaleString()}
                          </span>
                          <span className="text-[9px] text-blue-700/80 dark:text-blue-400/80 block mt-0.5 truncate">
                            গড়: ৳{salesVsMarginStats.avgSales.toLocaleString()}
                          </span>
                        </div>
                        <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/50 rounded-xl p-2">
                          <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 block truncate">মোট মার্জিন</span>
                          <span className="text-xs sm:text-sm font-black text-emerald-950 dark:text-emerald-200 block truncate">
                            ৳ {salesVsMarginStats.totalMargin.toLocaleString()}
                          </span>
                          <span className="text-[9px] text-emerald-700/80 dark:text-emerald-400/80 block mt-0.5 truncate">
                            হার: {salesVsMarginStats.avgMarginPercent}%
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Interactive Compact SVG Chart */}
                  <div className="overflow-hidden bg-slate-50/80 dark:bg-slate-950/60 rounded-xl border border-slate-200/90 dark:border-slate-800 p-2 sm:p-2.5 relative">
                    <svg viewBox="0 0 420 220" className="w-full h-auto select-none block">
                      <defs>
                        <linearGradient id="salesBarGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.80" />
                          <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.95" />
                        </linearGradient>
                        <linearGradient id="marginBarGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.85" />
                          <stop offset="100%" stopColor="#047857" stopOpacity="0.95" />
                        </linearGradient>
                        <linearGradient id="salesAreaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.30" />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
                        </linearGradient>
                        <linearGradient id="marginAreaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>

                      {(() => {
                        const isMarginOnly = salesGraphMetric === "margin";
                        const isSalesOnly = salesGraphMetric === "sales";
                        const isBoth = salesGraphMetric === "both";

                        const plotTop = 22;
                        const plotHeight = 150;
                        const leftMargin = isMarginOnly ? 40 : 44;
                        const rightMargin = isBoth ? 376 : 405;
                        const plotWidth = rightMargin - leftMargin;

                        const getYSales = (v: number) => {
                          const yMax = salesVsMarginStats.ySalesMax;
                          const clamped = Math.max(0, Math.min(yMax, v));
                          return plotTop + plotHeight - (clamped / Math.max(1, yMax)) * plotHeight;
                        };

                        const getYMargin = (v: number) => {
                          const yMax = salesVsMarginStats.yMarginMax;
                          const clamped = Math.max(0, Math.min(yMax, v));
                          return plotTop + plotHeight - (clamped / Math.max(1, yMax)) * plotHeight;
                        };

                        const getX = (index: number, total: number) => {
                          if (total <= 1) return leftMargin + plotWidth / 2;
                          return leftMargin + (index / (total - 1)) * plotWidth;
                        };

                        const totalDays = salesVsMarginStats.points.length;
                        const barWidth = Math.min(18, Math.max(4, (plotWidth / Math.max(1, totalDays)) * 0.45));

                        const pts = salesVsMarginStats.points.map((p, i) => {
                          const x = getX(i, totalDays);
                          const ySales = getYSales(p.sales);
                          const yMargin = getYMargin(p.margin);
                          return { ...p, x, ySales, yMargin };
                        });

                        const pathSales = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.ySales}`).join(" ");
                        const areaSales = pts.length > 0
                          ? `${pathSales} L ${pts[pts.length - 1].x} ${plotTop + plotHeight} L ${pts[0].x} ${plotTop + plotHeight} Z`
                          : "";

                        const pathMargin = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.yMargin}`).join(" ");
                        const areaMargin = pts.length > 0
                          ? `${pathMargin} L ${pts[pts.length - 1].x} ${plotTop + plotHeight} L ${pts[0].x} ${plotTop + plotHeight} Z`
                          : "";

                        return (
                          <g>
                            {/* Y-axis dashed grid lines & left labels */}
                            {isMarginOnly ? (
                              salesVsMarginStats.yMarginTicks.map((tickVal) => {
                                const yP = getYMargin(tickVal);
                                return (
                                  <g key={`margin-tick-${tickVal}`}>
                                    <line
                                      x1={leftMargin}
                                      y1={yP}
                                      x2={rightMargin}
                                      y2={yP}
                                      className="stroke-slate-200 dark:stroke-slate-800"
                                      strokeWidth="1"
                                      strokeDasharray="3 3"
                                    />
                                    <text
                                      x={leftMargin - 4}
                                      y={yP + 3}
                                      textAnchor="end"
                                      className="text-[8px] font-bold fill-emerald-600 dark:fill-emerald-400"
                                    >
                                      ৳{tickVal >= 1000 ? `${(tickVal / 1000).toFixed(tickVal % 1000 === 0 ? 0 : 1)}k` : tickVal}
                                    </text>
                                  </g>
                                );
                              })
                            ) : (
                              salesVsMarginStats.ySalesTicks.map((tickVal) => {
                                const yP = getYSales(tickVal);
                                return (
                                  <g key={`sales-tick-${tickVal}`}>
                                    <line
                                      x1={leftMargin}
                                      y1={yP}
                                      x2={rightMargin}
                                      y2={yP}
                                      className="stroke-slate-200 dark:stroke-slate-800"
                                      strokeWidth="1"
                                      strokeDasharray="3 3"
                                    />
                                    <text
                                      x={leftMargin - 4}
                                      y={yP + 3}
                                      textAnchor="end"
                                      className="text-[8px] font-bold fill-blue-600 dark:fill-blue-400"
                                    >
                                      ৳{tickVal >= 1000 ? `${(tickVal / 1000).toFixed(tickVal % 1000 === 0 ? 0 : 1)}k` : tickVal}
                                    </text>
                                  </g>
                                );
                              })
                            )}

                            {/* Dual-axis Right Y-axis labels for Margin when Both are selected */}
                            {isBoth &&
                              salesVsMarginStats.yMarginTicks.map((tickVal) => {
                                const yP = getYMargin(tickVal);
                                return (
                                  <g key={`dual-margin-tick-${tickVal}`}>
                                    <line
                                      x1={rightMargin}
                                      y1={yP}
                                      x2={rightMargin + 3}
                                      y2={yP}
                                      className="stroke-emerald-500/60 dark:stroke-emerald-400/60"
                                      strokeWidth="1"
                                    />
                                    <text
                                      x={rightMargin + 4}
                                      y={yP + 3}
                                      textAnchor="start"
                                      className="text-[8px] font-bold fill-emerald-600 dark:fill-emerald-400"
                                    >
                                      ৳{tickVal >= 1000 ? `${(tickVal / 1000).toFixed(tickVal % 1000 === 0 ? 0 : 1)}k` : tickVal}
                                    </text>
                                  </g>
                                );
                              })}

                            {/* Left Axis Line */}
                            <line
                              x1={leftMargin}
                              y1={plotTop - 4}
                              x2={leftMargin}
                              y2={plotTop + plotHeight}
                              className={isMarginOnly ? "stroke-emerald-500" : "stroke-blue-500"}
                              strokeWidth="1.5"
                            />

                            {/* Right Axis Line when dual-axis mode */}
                            {isBoth && (
                              <line
                                x1={rightMargin}
                                y1={plotTop - 4}
                                x2={rightMargin}
                                y2={plotTop + plotHeight}
                                className="stroke-emerald-500/70"
                                strokeWidth="1.5"
                              />
                            )}

                            {/* Axis Titles */}
                            <text
                              x={leftMargin}
                              y="12"
                              textAnchor="start"
                              className={`text-[8px] font-black uppercase tracking-wider ${
                                isMarginOnly ? "fill-emerald-600 dark:fill-emerald-400" : "fill-blue-600 dark:fill-blue-400"
                              }`}
                            >
                              {isMarginOnly ? "মার্জিন (৳) ↑" : "বিক্রি (৳) ↑"}
                            </text>
                            {isBoth ? (
                              <text
                                x={rightMargin + 2}
                                y="12"
                                textAnchor="start"
                                className="text-[8px] font-black fill-emerald-600 dark:fill-emerald-400 uppercase tracking-wider"
                              >
                                মার্জিন ↑
                              </text>
                            ) : (
                              <text
                                x={rightMargin}
                                y="12"
                                textAnchor="end"
                                className="text-[8px] font-black fill-slate-500 dark:fill-slate-400 uppercase tracking-wider"
                              >
                                তারিখ →
                              </text>
                            )}

                            {/* Sales Area Fill */}
                            {(isBoth || isSalesOnly) && areaSales && (
                              <path d={areaSales} fill="url(#salesAreaGrad)" />
                            )}

                            {/* Margin Area Fill (when margin only) */}
                            {isMarginOnly && areaMargin && (
                              <path d={areaMargin} fill="url(#marginAreaGrad)" />
                            )}

                            {/* Sales Trend Line */}
                            {(isBoth || isSalesOnly) && pathSales && (
                              <path
                                d={pathSales}
                                fill="none"
                                stroke="#3b82f6"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            )}

                            {/* Margin Trend Line */}
                            {(isBoth || isMarginOnly) && pathMargin && (
                              <path
                                d={pathMargin}
                                fill="none"
                                stroke="#10b981"
                                strokeWidth={isMarginOnly ? "3" : "2.5"}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            )}

                            {/* Interactive Columns & Points */}
                            {pts.map((p, i) => {
                              const isCurrent = currentViewDay && currentViewDay.date === p.date;
                              const isHovered = hoveredSalesIndex === i;
                              const salesBarH = Math.max(3, plotTop + plotHeight - p.ySales);
                              const marginBarH = Math.max(3, plotTop + plotHeight - p.yMargin);
                              const showDateLabel =
                                totalDays <= 7 ||
                                i === 0 ||
                                i === totalDays - 1 ||
                                (totalDays <= 14 ? i % 2 === 0 : i % 3 === 0);

                              return (
                                <g
                                  key={`sales-col-${p.date}`}
                                  className="cursor-pointer group"
                                  onClick={() => setSelectedDashboardDate(p.date)}
                                  onMouseEnter={() => setHoveredSalesIndex(i)}
                                  onMouseLeave={() => setHoveredSalesIndex(null)}
                                >
                                  {/* Vertical Guideline */}
                                  {(isHovered || isCurrent) && (
                                    <line
                                      x1={p.x}
                                      y1={plotTop}
                                      x2={p.x}
                                      y2={plotTop + plotHeight}
                                      stroke={isCurrent ? (isMarginOnly ? "#10b981" : "#3b82f6") : "rgba(100, 116, 139, 0.4)"}
                                      strokeWidth={isCurrent ? "1.5" : "1"}
                                      strokeDasharray="2 2"
                                    />
                                  )}

                                  {/* Highlight Glow for selected day */}
                                  {isCurrent && (
                                    <rect
                                      x={p.x - barWidth / 2 - 2}
                                      y={plotTop}
                                      width={barWidth + 4}
                                      height={plotHeight}
                                      rx="3"
                                      fill={isMarginOnly ? "rgba(16, 185, 129, 0.12)" : "rgba(59, 130, 246, 0.12)"}
                                    />
                                  )}

                                  {/* Margin Bar Indicator when margin only */}
                                  {isMarginOnly && (
                                    <rect
                                      x={p.x - barWidth / 2}
                                      y={p.yMargin}
                                      width={barWidth}
                                      height={marginBarH}
                                      rx="2"
                                      fill="url(#marginBarGrad)"
                                      opacity={isCurrent ? "0.90" : isHovered ? "0.7" : "0.45"}
                                      className="transition-all"
                                    />
                                  )}

                                  {/* Sales Bar Indicator when both or sales only */}
                                  {(isBoth || isSalesOnly) && (
                                    <rect
                                      x={p.x - barWidth / 2}
                                      y={p.ySales}
                                      width={barWidth}
                                      height={salesBarH}
                                      rx="2"
                                      fill="url(#salesBarGrad)"
                                      opacity={isCurrent ? "0.85" : isHovered ? "0.6" : "0.35"}
                                      className="transition-all"
                                    />
                                  )}

                                  {/* Sales Point Dot */}
                                  {(isBoth || isSalesOnly) && (
                                    <circle
                                      cx={p.x}
                                      cy={p.ySales}
                                      r={isCurrent || isHovered ? 4.5 : 2.5}
                                      fill={isCurrent ? "#2563eb" : "#fff"}
                                      stroke="#3b82f6"
                                      strokeWidth={isCurrent ? "2" : "1.5"}
                                    />
                                  )}

                                  {/* Margin Point Dot */}
                                  {(isBoth || isMarginOnly) && (
                                    <circle
                                      cx={p.x}
                                      cy={p.yMargin}
                                      r={isCurrent || isHovered ? (isMarginOnly ? 5.5 : 4.5) : 3}
                                      fill={isCurrent ? "#059669" : "#fff"}
                                      stroke="#10b981"
                                      strokeWidth={isCurrent ? "2.5" : "1.5"}
                                      className="transition-all"
                                    />
                                  )}

                                  {/* Bottom Tick Mark */}
                                  <line
                                    x1={p.x}
                                    y1={plotTop + plotHeight}
                                    x2={p.x}
                                    y2={plotTop + plotHeight + 3}
                                    className="stroke-slate-500 dark:stroke-slate-400"
                                    strokeWidth="1"
                                  />

                                  {/* Date Label */}
                                  {showDateLabel && (
                                    <text
                                      x={p.x}
                                      y={plotTop + plotHeight + 14}
                                      textAnchor="middle"
                                      className={`text-[8px] font-bold ${
                                        isCurrent
                                          ? isMarginOnly
                                            ? "fill-emerald-600 dark:fill-emerald-400 font-black"
                                            : "fill-blue-600 dark:fill-blue-400 font-black"
                                          : "fill-slate-600 dark:fill-slate-400"
                                      }`}
                                    >
                                      {p.date.slice(8)}
                                    </text>
                                  )}
                                </g>
                              );
                            })}
                          </g>
                        );
                      })()}
                    </svg>

                    {/* Active / Hovered Minimal Stat Pill */}
                    {(() => {
                      const activeIndex =
                        hoveredSalesIndex !== null
                          ? hoveredSalesIndex
                          : salesVsMarginStats.points.findIndex((p) => p.date === currentViewDay?.date);
                      const activePoint = activeIndex >= 0 ? salesVsMarginStats.points[activeIndex] : null;

                      if (!activePoint) return null;

                      return (
                        <div className="mt-1.5 px-2.5 py-1.5 bg-slate-900/90 dark:bg-slate-800/90 text-white rounded-lg text-[10px] flex items-center justify-between shadow-xs">
                          <span className="font-black text-amber-300 truncate">
                            {activePoint.date.slice(5)} ({activePoint.day.slice(0, 3)})
                          </span>
                          <div className="flex items-center space-x-1.5">
                            {salesGraphMetric !== "margin" && (
                              <span className="text-blue-300 font-bold">বিক্রি: ৳{activePoint.sales.toLocaleString()}</span>
                            )}
                            {salesGraphMetric === "both" && <span className="text-slate-500">|</span>}
                            {salesGraphMetric !== "sales" && (
                              <span className="text-emerald-300 font-bold">মার্জিন: ৳{activePoint.margin.toLocaleString()}</span>
                            )}
                            <span className="text-purple-300 font-bold">({activePoint.marginPercent}%)</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Right 65%: Sales & Margin Comprehensive Data Table & Widget */}
              <div className="col-span-1 landscape:col-span-8 sm:landscape:col-span-8 lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 lg:p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-2.5 sm:space-y-3 flex flex-col justify-between transition-colors">
                <div className="space-y-2.5 sm:space-y-3">
                  {/* Card Header */}
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <ShoppingCart className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      <h3 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 truncate">
                        বিক্রি ও মার্জিন ডাটা
                      </h3>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 px-2 sm:px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800/60 whitespace-nowrap shrink-0">
                      {currentViewDay.date} ({getBanglaDay(currentViewDay.day)})
                    </span>
                  </div>

                  {/* Featured "আজকের বিক্রি" Widget */}
                  <div className="bg-slate-900 text-white rounded-xl p-2.5 sm:p-3 shadow-xs border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                      <div className="flex items-center space-x-1.5 min-w-0">
                        <ShoppingCart className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <h4 className="text-xs sm:text-sm font-black text-slate-100 truncate">আজকের বিক্রি ও লাভ</h4>
                      </div>
                      <span className="text-[10px] sm:text-xs font-black text-blue-300 bg-blue-950/90 px-2 sm:px-2.5 py-0.5 rounded-full border border-blue-800/60 shrink-0">
                        {salesVsMarginStats.currentDayPoint ? salesVsMarginStats.currentDayPoint.soldQty.toLocaleString() : 0} টি ডিম
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 text-xs">
                      <div className="bg-slate-800/70 rounded-lg p-2 border border-slate-700/60">
                        <span className="text-slate-400 text-[10px] block">ক্রয়মূল্য</span>
                        <span className="text-xs sm:text-sm font-bold text-slate-100 mt-0.5 block truncate">
                          ৳ {salesVsMarginStats.currentDayPoint ? salesVsMarginStats.currentDayPoint.cost.toLocaleString() : 0}
                        </span>
                      </div>

                      <div className="bg-slate-800/70 rounded-lg p-2 border border-blue-900/50">
                        <span className="text-blue-300 text-[10px] font-bold block">মোট বিক্রি</span>
                        <span className="text-xs sm:text-sm font-black text-blue-400 mt-0.5 block truncate">
                          ৳ {salesVsMarginStats.currentDayPoint ? salesVsMarginStats.currentDayPoint.sales.toLocaleString() : 0}
                        </span>
                      </div>

                      <div className="bg-slate-800/70 rounded-lg p-2 border border-emerald-900/50">
                        <span className="text-emerald-300 text-[10px] font-bold block">মার্জিন (লাভ)</span>
                        <span className="text-xs sm:text-sm font-black text-emerald-400 mt-0.5 block truncate">
                          ৳ {salesVsMarginStats.currentDayPoint ? salesVsMarginStats.currentDayPoint.margin.toLocaleString() : 0}
                        </span>
                      </div>

                      <div className="bg-slate-800/70 rounded-lg p-2 border border-purple-900/50">
                        <span className="text-purple-300 text-[10px] font-bold block">মার্জিন হার</span>
                        <span className="text-xs sm:text-sm font-black text-purple-300 mt-0.5 block truncate">
                          {salesVsMarginStats.currentDayPoint ? salesVsMarginStats.currentDayPoint.marginPercent : 0}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Comprehensive Historical Sales & Margin Data Table */}
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-1.5 pb-1.5 pt-0.5">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] sm:text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          খাতা ({salesFilteredData.length} দিন)
                        </span>
                        <button
                          type="button"
                          onClick={() => setSalesTableSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                          className="text-[9px] sm:text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-1.5 sm:px-2 py-0.5 rounded-md border border-slate-300/80 dark:border-slate-700 cursor-pointer flex items-center space-x-1 transition-colors"
                          title="তারিখের ক্রম পরিবর্তন করুন"
                        >
                          <ArrowUpDown className="w-2.5 h-2.5 text-slate-500" />
                          <span>{salesTableSortOrder === "asc" ? "পুরাতন→নতুন" : "নতুন→পুরাতন"}</span>
                        </button>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (salesTableRef.current) {
                              salesTableRef.current.scrollTo({ top: 0, behavior: "smooth" });
                            }
                          }}
                          className="text-[9px] sm:text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-1.5 sm:px-2 py-0.5 rounded border border-slate-300/70 dark:border-slate-700 cursor-pointer transition-colors"
                          title="এক ক্লিকে একদম শুরুতে স্ক্রোল করুন"
                        >
                          উপরে ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (salesTableRef.current) {
                              salesTableRef.current.scrollTo({ top: salesTableRef.current.scrollHeight, behavior: "smooth" });
                            }
                          }}
                          className="text-[9px] sm:text-[10px] font-bold text-blue-700 dark:text-blue-300 hover:text-blue-800 bg-blue-50 dark:bg-blue-950/70 hover:bg-blue-100 dark:hover:bg-blue-900/60 px-1.5 sm:px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800/80 cursor-pointer transition-colors"
                          title="এক ক্লিকে একদম শেষে (আজকের দিনে) স্ক্রোল করুন"
                        >
                          নিচে / আজ ↓
                        </button>
                      </div>
                    </div>

                    <div
                      ref={salesTableRef}
                      className="max-h-[220px] landscape:max-h-[175px] sm:max-h-[260px] overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl scroll-smooth"
                    >
                      <table className="w-full text-left text-[10px] sm:text-xs border-collapse">
                        <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase font-bold text-[9px] sm:text-[10px] border-b border-slate-200 dark:border-slate-700 z-10">
                          <tr>
                            <th className="py-2 px-2.5">তারিখ</th>
                            <th className="py-2 px-1.5 text-right whitespace-nowrap">ডিম</th>
                            <th className="py-2 px-1.5 text-right whitespace-nowrap">ক্রয় (৳)</th>
                            <th className="py-2 px-1.5 text-right whitespace-nowrap">বিক্রি (৳)</th>
                            <th className="py-2 px-1.5 text-right whitespace-nowrap">মার্জিন (৳)</th>
                            <th className="py-2 px-1.5 text-right whitespace-nowrap">হার</th>
                            <th className="py-2 px-2 text-center whitespace-nowrap">স্ট্যাটাস</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-800 dark:text-slate-200">
                          {(salesTableSortOrder === "desc"
                            ? [...salesVsMarginStats.points].reverse()
                            : salesVsMarginStats.points
                          ).map((p) => {
                            const isSelected = currentViewDay && currentViewDay.date === p.date;
                            return (
                              <tr
                                id={`tbl-sales-row-${p.date}`}
                                key={`tbl-sales-${p.date}`}
                                onClick={() => setSelectedDashboardDate(p.date)}
                                className={`cursor-pointer transition-colors ${
                                  isSelected
                                    ? "bg-blue-50 dark:bg-blue-950/70 font-black text-blue-950 dark:text-blue-100"
                                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                }`}
                              >
                                <td className="py-1.5 px-2.5 whitespace-nowrap">
                                  <div className="font-bold">{p.date.slice(5)}</div>
                                  <div className="text-[9px] text-slate-500 dark:text-slate-400 font-normal">
                                    {getBanglaDay(p.day)}
                                  </div>
                                </td>
                                <td className="py-1.5 px-1.5 text-right font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                  {p.soldQty.toLocaleString()} টি
                                </td>
                                <td className="py-1.5 px-1.5 text-right font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                  ৳{p.cost.toLocaleString()}
                                </td>
                                <td className="py-1.5 px-1.5 text-right font-black text-blue-700 dark:text-blue-300 whitespace-nowrap">
                                  ৳{p.sales.toLocaleString()}
                                </td>
                                <td className="py-1.5 px-1.5 text-right font-black text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                                  ৳{p.margin.toLocaleString()}
                                </td>
                                <td className="py-1.5 px-1.5 text-right font-bold text-purple-700 dark:text-purple-300 whitespace-nowrap">
                                  {p.marginPercent}%
                                </td>
                                <td className="py-1.5 px-2 text-center whitespace-nowrap">
                                  {isSelected ? (
                                    <span className="inline-block text-[9px] font-black bg-blue-600 text-white px-1.5 py-0.5 rounded-full shadow-xs">
                                      নির্বাচিত
                                    </span>
                                  ) : (
                                    <span className="inline-block text-[9px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
                                      দেখুন
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="sticky bottom-0 bg-slate-50 dark:bg-slate-800/95 font-black text-[10px] sm:text-xs border-t-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 z-10">
                          <tr>
                            <td className="py-2 px-2.5 whitespace-nowrap">মোট ({salesVsMarginStats.points.length}দিন)</td>
                            <td className="py-2 px-1.5 text-right text-slate-900 dark:text-slate-100 whitespace-nowrap">
                              {salesVsMarginStats.points.reduce((s, p) => s + (p.soldQty || 0), 0).toLocaleString()} টি
                            </td>
                            <td className="py-2 px-1.5 text-right text-slate-700 dark:text-slate-300 whitespace-nowrap">
                              ৳{salesVsMarginStats.totalCost.toLocaleString()}
                            </td>
                            <td className="py-2 px-1.5 text-right text-blue-900 dark:text-blue-300 whitespace-nowrap">
                              ৳{salesVsMarginStats.totalSales.toLocaleString()}
                            </td>
                            <td className="py-2 px-1.5 text-right text-emerald-900 dark:text-emerald-300 whitespace-nowrap">
                              ৳{salesVsMarginStats.totalMargin.toLocaleString()}
                            </td>
                            <td className="py-2 px-1.5 text-right text-purple-900 dark:text-purple-300 whitespace-nowrap">
                              {salesVsMarginStats.avgMarginPercent}%
                            </td>
                            <td className="py-2 px-2 text-center whitespace-nowrap">—</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                <div className="w-full overflow-hidden bg-slate-50/80 dark:bg-slate-950/60 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-1.5 sm:p-4">
                  <svg viewBox="0 0 840 330" className="w-full h-auto select-none block">
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
                      const leftMargin = 66;
                      const rightMargin = 808;
                      const plotWidth = rightMargin - leftMargin;

                      const getY = (v: number) => {
                        const clamped = Math.max(yMin, Math.min(yMax, v));
                        return plotTop + plotHeight - ((clamped - yMin) / Math.max(1, yMax - yMin)) * plotHeight;
                      };

                      const getX = (index: number, total: number) => {
                        if (total <= 1) return leftMargin + plotWidth / 2;
                        return leftMargin + (index / (total - 1)) * plotWidth;
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
                                x1={leftMargin}
                                y1={yP}
                                x2={rightMargin}
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
                                  x1={leftMargin}
                                  y1={yP}
                                  x2={rightMargin}
                                  y2={yP}
                                  className={tickVal === yMin ? "stroke-slate-600 dark:stroke-slate-500" : "stroke-slate-200 dark:stroke-slate-800"}
                                  strokeWidth={tickVal === yMin ? "1.5" : "1"}
                                  strokeDasharray={tickVal === yMin ? undefined : "4 4"}
                                />
                                <text
                                  x={leftMargin - 8}
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
                          <line x1={leftMargin} y1="30" x2={leftMargin} y2="260" className="stroke-slate-600 dark:stroke-slate-400" strokeWidth="1.5" />

                          {/* Y-Axis Title (Left) */}
                          <text x={leftMargin} y="16" textAnchor="start" className="text-[10px] font-black fill-slate-600 dark:fill-slate-400 uppercase tracking-wider">
                            Y: দর (৳/পিস) ↑
                          </text>

                          {/* X-Axis Title (Cleanly at Top Right) */}
                          <text x={rightMargin} y="16" textAnchor="end" className="text-[10px] font-black fill-slate-600 dark:fill-slate-400 uppercase tracking-wider">
                            X: সময়কাল (তারিখ) →
                          </text>

                          {/* Average Price Dotted Reference Line */}
                          {eggPriceStats.avgPrice >= yMin && eggPriceStats.avgPrice <= yMax && (
                            <g>
                              <line
                                x1={leftMargin}
                                y1={avgY}
                                x2={rightMargin}
                                y2={avgY}
                                className="stroke-slate-400 dark:stroke-slate-500"
                                strokeWidth="1.5"
                                strokeDasharray="4 4"
                              />
                              {/* Dotted Average Label on Left Side */}
                              <rect x={leftMargin + 6} y={avgY - 9} width="85" height="17" rx="4" className="fill-slate-900/90 dark:fill-slate-800/90 stroke-slate-500" strokeWidth="1" />
                              <text
                                x={leftMargin + 48}
                                y={avgY + 3}
                                textAnchor="middle"
                                className="text-[9px] font-black fill-slate-100 dark:fill-slate-200 pointer-events-none"
                              >
                                গড়: ৳{eggPriceStats.avgPrice}
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
                                  const isPeak =
                                    eggPriceStats.peakPoint &&
                                    eggPriceStats.peakPoint.date === p.date &&
                                    eggPriceStats.peakPoint.eggType === eggType;
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
                                      {/* Exact Price on dot (hide if peak to prevent overlap) */}
                                      {!isPeak && (selectedEggPriceFilter !== "all" || isCurrent) && (
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
                              const calloutY = Math.max(6, peakY - 32);
                              return (
                                <g>
                                  <line
                                    x1={peakX}
                                    y1={peakY - 6}
                                    x2={peakX}
                                    y2={calloutY + 18}
                                    stroke="#e11d48"
                                    strokeWidth="1.5"
                                    strokeDasharray="2 2"
                                  />
                                  <rect
                                    x={Math.max(8, Math.min(740, peakX - 44))}
                                    y={calloutY}
                                    width="88"
                                    height="19"
                                    rx="5"
                                    fill="#0f172a"
                                    stroke="#e11d48"
                                    strokeWidth="1.2"
                                  />
                                  <text
                                    x={Math.max(52, Math.min(784, peakX))}
                                    y={calloutY + 13}
                                    textAnchor="middle"
                                    className="text-[9.5px] font-black fill-amber-300 pointer-events-none"
                                  >
                                    ★ সর্বোচ্চ: ৳{peak.price}
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
                  আজকের দিন (Today)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <DateTimePicker
                  label="তারিখ (দিন/মাস/বছর - DD/MM/YYYY) *"
                  value={formDate}
                  onChange={(newDate) => {
                    if (newDate) handleUnifiedDateChange(newDate);
                  }}
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
                  className={`p-3 border rounded-xl transition-all ${
                    exp.isOverheadLinked
                      ? "bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/80 shadow-xs"
                      : "bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
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

                    {/* Overhead & Savings Toggle Button */}
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...expenses];
                          const nextState = !updated[index].isOverheadLinked;
                          updated[index].isOverheadLinked = nextState;
                          if (nextState && !updated[index].overheadCategory) {
                            if (updated[index].expenseType === "সমিতি") {
                              updated[index].overheadCategory = "savings_shop";
                            } else {
                              updated[index].overheadCategory = "extra";
                            }
                          }
                          setExpenses(updated);
                        }}
                        className={`inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                          exp.isOverheadLinked
                            ? "bg-amber-600 text-white border-amber-700 shadow-xs"
                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                        }`}
                        title="কর্মচারী, দোকান ভাড়া বা সঞ্চয় ফান্ডে যুক্ত করুন"
                      >
                        {exp.isOverheadLinked ? (
                          <>
                            <ToggleRight className="w-4 h-4 text-amber-200" />
                            <span>ফান্ড লিঙ্ক চালু</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-4 h-4 text-slate-400" />
                            <span>+ ওভারহেড/সঞ্চয়</span>
                          </>
                        )}
                      </button>

                      {/* Delete Button */}
                      {expenses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeExpenseRow(index)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                          title="মুছুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Dropdown for Overhead / Savings classification */}
                  {exp.isOverheadLinked && (
                    <div className="mt-2.5 pt-2.5 border-t border-amber-200/80 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white/70 dark:bg-slate-900/70 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800/40">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
                        <Link2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>ওভারহেড ও সঞ্চয় খতিয়ান (ফান্ড নির্বাচন):</span>
                      </div>
                      <select
                        value={exp.overheadCategory || (exp.expenseType === "সমিতি" ? "savings_shop" : "extra")}
                        onChange={(e) => handleExpenseChange(index, "overheadCategory", e.target.value)}
                        className="text-xs font-bold border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 rounded-lg px-3 py-1.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                      >
                        <optgroup label="ব্যবসায়িক সঞ্চয় ও তহবিল (২টি সংরক্ষিত ফান্ড)">
                          <option value="savings_shop">🏪 সমিতি === দোকানে সঞ্চয় (In-Shop Savings)</option>
                          <option value="savings_bank">🏦 ব্যাংকে সঞ্চয় / DPS (In-Bank Savings)</option>
                        </optgroup>
                        <optgroup label="সঞ্চয় হতে বিল পরিশোধ (Bill Paid from Savings)">
                          <option value="bill_from_savings_shop">💸 দোকানে সঞ্চয় হতে বিল পরিশোধ</option>
                          <option value="bill_from_savings_bank">💳 ব্যাংকে সঞ্চয় হতে বিল পরিশোধ</option>
                        </optgroup>
                        <optgroup label="কর্মচারী, দোকান ভাড়া ও অতিরিক্ত পরিচালন খরচ">
                          <option value="employee">👨‍💼 কর্মচারী বেতন ও মজুরি (Employee Salary)</option>
                          <option value="rent">🏢 দোকান ও গোডাউন ভাড়া (Shop Rent)</option>
                          <option value="utilities">⚡ বিদ্যুৎ ও গ্যাস বিল (Utilities)</option>
                          <option value="security">🛡️ মার্কেট সমিতি ও নাইটগার্ড (Security)</option>
                          <option value="transport">🚚 গাড়ি/ভ্যান মেরামত ও জ্বালানি (Transport)</option>
                          <option value="tax">📜 ট্রেড লাইসেন্স ও ট্যাক্স (Tax)</option>
                          <option value="extra">🪙 অন্যান্য অতিরিক্ত পরিচালন খরচ (Extra Overhead)</option>
                        </optgroup>
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Live Overhead & Savings Breakdown Badge if any linked */}
            {formLiveOverheadBreakdown.totalLinked > 0 && (
              <div className="mt-3 p-3.5 bg-emerald-50/90 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800/70 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs font-black text-emerald-900 dark:text-emerald-200">
                  <span className="flex items-center space-x-1.5">
                    <Link2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>কর্মচারী, ভাড়া ও সঞ্চয় ফান্ডে স্বয়ংক্রিয় যুক্ত হবে ({formLiveOverheadBreakdown.totalLinkedCount} টি এন্ট্রি):</span>
                  </span>
                  <span className="text-sm font-black text-emerald-700 dark:text-emerald-300">
                    ৳ {formLiveOverheadBreakdown.totalLinked.toLocaleString()}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-semibold border-t border-emerald-200/60 dark:border-emerald-800/40">
                  <div className="bg-white/70 dark:bg-slate-900/60 p-1.5 rounded-lg">
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px]">কর্মচারী ও ভাড়া:</span>
                    <strong className="text-slate-900 dark:text-slate-100">৳ {formLiveOverheadBreakdown.overheadSum.toLocaleString()}</strong>
                  </div>
                  <div className="bg-white/70 dark:bg-slate-900/60 p-1.5 rounded-lg">
                    <span className="text-emerald-600 dark:text-emerald-400 block text-[10px]">সমিতি / দোকানে সঞ্চয়:</span>
                    <strong className="text-emerald-700 dark:text-emerald-300">৳ {formLiveOverheadBreakdown.savingsShopSum.toLocaleString()}</strong>
                  </div>
                  <div className="bg-white/70 dark:bg-slate-900/60 p-1.5 rounded-lg">
                    <span className="text-blue-600 dark:text-blue-400 block text-[10px]">ব্যাংকে সঞ্চয়:</span>
                    <strong className="text-blue-700 dark:text-blue-300">৳ {formLiveOverheadBreakdown.savingsBankSum.toLocaleString()}</strong>
                  </div>
                  <div className="bg-white/70 dark:bg-slate-900/60 p-1.5 rounded-lg">
                    <span className="text-amber-600 dark:text-amber-400 block text-[10px]">সঞ্চয় হতে বিল পরিশোধ:</span>
                    <strong className="text-amber-700 dark:text-amber-300">৳ {(formLiveOverheadBreakdown.billsFromShopSavingsSum + formLiveOverheadBreakdown.billsFromBankSavingsSum).toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            )}

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
      ) : activeTab === "overhead" ? (
        /* ================= OVERHEAD EXPENSES & EMPLOYEE COSTS TAB ================= */
        <OverheadExpensesView />
      ) : (
        /* ================= BUSINESS SAVINGS & EXTRA INFLOWS TAB ================= */
        <SavingsTrackerView />
      )}

      {/* Floating Bottom Nav for Mobile Screens */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 sm:hidden px-1.5 py-2 flex justify-around items-center shadow-lg transition-colors">
        {isAllowed("dashboard") && (
          <button
            onClick={() => handleSwitchTab("dashboard")}
            className={`flex flex-col items-center space-y-1 py-1 px-1.5 rounded-xl transition-all cursor-pointer ${
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
            className={`flex flex-col items-center space-y-1 py-1 px-1.5 rounded-xl transition-all cursor-pointer ${
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
            className={`flex flex-col items-center space-y-1 py-1 px-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === "overhead" ? "text-amber-600 dark:text-amber-400 font-black" : "text-slate-500 dark:text-slate-400 font-semibold"
            }`}
          >
            <Building2 className="w-5 h-5" />
            <span className="text-[10px]">মাসিক খরচ</span>
          </button>
        )}

        {isAllowed("savings") && (
          <button
            onClick={() => handleSwitchTab("savings")}
            className={`flex flex-col items-center space-y-1 py-1 px-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === "savings" ? "text-emerald-600 dark:text-emerald-400 font-black" : "text-slate-500 dark:text-slate-400 font-semibold"
            }`}
          >
            <PiggyBank className="w-5 h-5" />
            <span className="text-[10px]">সঞ্চয়</span>
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
    </main>
    </div>
  );
}
