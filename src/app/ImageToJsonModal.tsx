"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Camera,
  UploadCloud,
  FileCode,
  Copy,
  Check,
  Download,
  Sparkles,
  RefreshCw,
  X,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Eye,
  Edit3,
  Layers,
} from "lucide-react";
import { saveLedgerEntryAction } from "./actions";

interface StockItem {
  eggType: string;
  currentStock: number;
  purchaseRate: number;
  hasPurchase: boolean;
  purchaseQty: number;
}

interface ExtraItem {
  label: string;
  amount: number;
  qty?: number;
  unitPrice?: number;
}

interface ExpenseItem {
  expenseType: string;
  amount: number;
  wastedEggQty: number;
  wastedEggCost: number;
}

const DEFAULT_STOCKS: StockItem[] = [
  { eggType: "সাদা (White Egg)", currentStock: 2092, purchaseRate: 10.8, hasPurchase: false, purchaseQty: 0 },
  { eggType: "লাল (Red Egg)", currentStock: 4438, purchaseRate: 11.25, hasPurchase: false, purchaseQty: 0 },
  { eggType: "হাঁস (Duck Egg)", currentStock: 164, purchaseRate: 17.0, hasPurchase: false, purchaseQty: 0 },
  { eggType: "মুরগী (Chicken Egg)", currentStock: 0, purchaseRate: 15.0, hasPurchase: false, purchaseQty: 0 },
  { eggType: "কোয়েল (Quail Egg)", currentStock: 350, purchaseRate: 3.0, hasPurchase: false, purchaseQty: 0 },
  { eggType: "L.M", currentStock: 0, purchaseRate: 8.5, hasPurchase: false, purchaseQty: 0 },
];

export default function ImageToJsonModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"scan" | "edit" | "json">("scan");

  // Image state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>("image/jpeg");
  const [apiKey, setApiKey] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  // Form / Data state
  const [date, setDate] = useState("2026-08-25");
  const [day, setDay] = useState("মঙ্গলবার");
  const [pageNo, setPageNo] = useState("98");
  const [stockEntries, setStockEntries] = useState<StockItem[]>(DEFAULT_STOCKS);
  const [prevDayBalance, setPrevDayBalance] = useState<number>(872795);
  const [totalDue, setTotalDue] = useState<number>(650556);
  const [totalCash, setTotalCash] = useState<number>(105290);
  const [extraDueList, setExtraDueList] = useState<ExtraItem[]>([
    { label: "ভাঙ্গিনা", amount: 400 },
    { label: "কো (490 x 3)", qty: 490, unitPrice: 3.0, amount: 1470 },
  ]);
  const [extraCollectionList, setExtraCollectionList] = useState<ExtraItem[]>([
    { label: "বাকি আদায়", amount: 350 },
    { label: "নগদ আদায়", amount: 290 },
    { label: "কাওসার", amount: 1500 },
    { label: "অন্যান্য আদায়", amount: 150 },
  ]);
  const [expensesList, setExpensesList] = useState<ExpenseItem[]>([
    { expenseType: "নাস্তা-চা", amount: 400, wastedEggQty: 0, wastedEggCost: 0 },
    { expenseType: "গাড়ির রং", amount: 3000, wastedEggQty: 0, wastedEggCost: 0 },
    { expenseType: "কো", amount: 1470, wastedEggQty: 0, wastedEggCost: 0 },
    { expenseType: "মোঃ আলি", amount: 38000, wastedEggQty: 0, wastedEggCost: 0 },
    { expenseType: "গাড়ির তেল", amount: 1060, wastedEggQty: 0, wastedEggCost: 0 },
    { expenseType: "ভাঙ্গা", amount: 270, wastedEggQty: 25, wastedEggCost: 270 },
  ]);

  // Save / Sync State
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved API key from localStorage & track mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("yolkflow_gemini_api_key");
    if (saved) setApiKey(saved);
  }, []);

  const handleApiKeyChange = (val: string) => {
    setApiKey(val);
    localStorage.setItem("yolkflow_gemini_api_key", val);
  };

  // Handle Image Selection
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setScanError("অনুগ্রহ করে একটি ছবি ফাইল (.jpg, .png, .webp) নির্বাচন করুন।");
      return;
    }
    setImageMime(file.type);
    setScanError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImagePreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Paste from Clipboard
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!isOpen || activeTab !== "scan") return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleImageFile(file);
            break;
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isOpen, activeTab]);

  // Construct current JSON payload
  const currentJsonPayload = {
    date,
    day,
    pageNo,
    stockEntries,
    financialEntry: {
      prevDayBalance,
      totalDue,
      totalCash,
      extraDue: extraCollectionList.reduce((s, c) => s + (c.amount || 0), 0),
      providerName: "",
      providerPhone: "",
      providerEggType: "",
      providerDueMoney: 0,
      providerUnitPrice: 0,
    },
    extraDueList,
    extraCollectionList,
    expensesList,
  };

  const jsonString = JSON.stringify(currentJsonPayload, null, 2);

  // Gemini Direct Prompt Text
  const geminiPromptText = `You are an expert handwriting OCR AI for an Egg Wholesale Daily Ledger notebook ("দৈনিক হালখাতা").
Look at this handwritten ledger page and extract all data into this exact JSON format:

\`\`\`json
${jsonString}
\`\`\`

Return ONLY the raw valid JSON without markdown wrapping or comments.`;

  // Perform AI Scan
  const handleAiScan = async () => {
    if (!imagePreview) {
      setScanError("অনুগ্রহ করে প্রথমে খাতার একটি ছবি নির্বাচন বা পেস্ট করুন।");
      return;
    }

    setIsScanning(true);
    setScanError(null);

    try {
      const res = await fetch("/api/ocr-to-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imagePreview,
          mimeType: imageMime,
          apiKey: apiKey.trim(),
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        setScanError(result.error || "OCR স্ক্যান সম্পন্ন করা যায়নি। API Key চেক করুন।");
        return;
      }

      const extracted = result.data;
      if (extracted) {
        if (extracted.date) setDate(extracted.date);
        if (extracted.day) setDay(extracted.day);
        if (extracted.pageNo) setPageNo(String(extracted.pageNo));
        if (Array.isArray(extracted.stockEntries) && extracted.stockEntries.length > 0) {
          setStockEntries(extracted.stockEntries);
        }
        if (extracted.financialEntry) {
          setPrevDayBalance(Number(extracted.financialEntry.prevDayBalance) || 0);
          setTotalDue(Number(extracted.financialEntry.totalDue) || 0);
          setTotalCash(Number(extracted.financialEntry.totalCash) || 0);
        }
        if (Array.isArray(extracted.extraDueList)) {
          setExtraDueList(extracted.extraDueList);
        }
        if (Array.isArray(extracted.extraCollectionList)) {
          setExtraCollectionList(extracted.extraCollectionList);
        }
        if (Array.isArray(extracted.expensesList)) {
          setExpensesList(extracted.expensesList);
        }

        setActiveTab("edit");
      }
    } catch (err: any) {
      setScanError(err.message || "সার্ভার এরর হয়েছে।");
    } finally {
      setIsScanning(false);
    }
  };

  // Copy JSON
  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonString);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  // Copy Prompt
  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(geminiPromptText);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  // Download .json File
  const handleDownloadJson = () => {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ledger_${date.replace(/-/g, "_") || "page"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Direct Save & Sync to Google Sheets
  const handleDirectSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    try {
      const formattedFinancial = {
        totalDue: Number(totalDue) || 0,
        extraDue: extraCollectionList.reduce((s, c) => s + (c.amount || 0), 0),
        totalCash: Number(totalCash) || 0,
        prevDayBalance: Number(prevDayBalance) || 0,
        providerName: "",
        providerPhone: "",
        providerEggType: "",
        providerDueMoney: 0,
        providerUnitPrice: 0,
      };

      const response = await saveLedgerEntryAction(
        date,
        day,
        pageNo,
        stockEntries,
        formattedFinancial,
        expensesList,
        extraCollectionList,
        extraDueList
      );

      if (response.success) {
        setSaveStatus({
          type: "success",
          text: `🎉 ${date} তারিখের পেজ গুগল শিটে সফলভাবে সেভ ও সিঙ্ক হয়েছে!`,
        });
        setTimeout(() => {
          setIsOpen(false);
          window.location.reload();
        }, 1200);
      } else {
        setSaveStatus({ type: "error", text: response.error || "সংরক্ষণ করতে সমস্যা হয়েছে।" });
      }
    } catch (err: any) {
      setSaveStatus({ type: "error", text: err.message || "সার্ভার এরর হয়েছে।" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Top Navbar Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 dark:from-amber-600 dark:to-amber-700 text-white text-xs font-black px-3 py-1.5 rounded-full border border-amber-400/40 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
        title="খাতার ছবি থেকে সরাসরি JSON তৈরি বা গুগল শিটে সেভ করুন"
      >
        <Camera className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">ছবি থেকে JSON</span>
        <span className="sm:hidden">OCR</span>
        <span className="bg-white/20 text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase">AI</span>
      </button>

      {/* Modal Dialog */}
      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[99999] overflow-y-auto bg-black/80 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center animate-in fade-in duration-200">
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full my-auto flex flex-col shadow-2xl overflow-hidden max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-4 sm:px-5 py-3 sm:py-3.5 bg-gradient-to-r from-amber-600 via-amber-600 to-amber-700 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 border-b border-amber-500/30 dark:border-slate-800 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-white/15 dark:bg-amber-500/20 rounded-xl border border-white/20 text-white">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                    খাতার ছবি থেকে JSON মেকার & OCR
                    <span className="bg-amber-400/30 text-amber-100 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Gemini Vision
                    </span>
                  </h3>
                  <p className="text-xs text-amber-100/90 dark:text-slate-400">
                    হাতে লেখা হালখাতা খাতার ছবি আপলোড করে চোখের পলকে নিখুঁত JSON বানান বা শিটে সেভ করুন
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 px-4 py-2 gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab("scan")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "scan"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>১. ছবি আপলোড ও AI স্ক্যান</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("edit")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "edit"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>২. ডাটা রিভিউ ও এডিটর</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("json")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "json"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>৩. জেনারেটেড JSON কোড</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* TAB 1: SCAN & UPLOAD */}
              {activeTab === "scan" && (
                <div className="space-y-4">
                  {/* Upload Box */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-amber-300 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500/80 bg-amber-50/40 dark:bg-slate-800/40 rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-1.5"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
                      accept="image/*"
                      className="hidden"
                    />

                    {imagePreview ? (
                      <div className="relative group max-w-sm">
                        <img
                          src={imagePreview}
                          alt="Ledger Preview"
                          className="max-h-44 sm:max-h-52 rounded-xl border border-slate-300 dark:border-slate-700 shadow-md object-contain"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImagePreview(null);
                          }}
                          className="absolute -top-2 -right-2 bg-rose-600 text-white p-1 rounded-full shadow hover:bg-rose-700 transition"
                          title="ছবি সরান"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1.5">
                          ✓ ছবি লোড হয়েছে (পরিবর্তন করতে ক্লিক করুন)
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            হাতে লেখা হালখাতা খাতার ছবি এখানে ড্রপ বা ক্লিক করে আপলোড করুন
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            বা কীবোর্ড থেকে সরাসরি স্ক্রিনশট পেস্ট করুন (Ctrl + V)
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Gemini API Key & Scan Action */}
                  <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Google Gemini Vision API Key (Optional / Direct Scanning)
                        </span>
                      </div>
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-bold"
                      >
                        ফ্রি Gemini Key নিন ↗
                      </a>
                    </div>

                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => handleApiKeyChange(e.target.value)}
                      placeholder="AIzaSy... (আপনার ফ্রি জেমিনি কি দিন)"
                      className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 bg-white dark:bg-slate-900 text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />

                    {scanError && (
                      <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{scanError}</span>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleAiScan}
                        disabled={isScanning || !imagePreview}
                        className="w-full sm:flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-black py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow disabled:opacity-50 cursor-pointer"
                      >
                        {isScanning ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>AI স্ক্যান হচ্ছে, অপেক্ষা করুন...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>✨ AI দিয়ে ছবি স্ক্যান করে JSON বানান</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleCopyPrompt();
                          window.open("https://gemini.google.com", "_blank");
                        }}
                        className="w-full sm:w-auto bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                        title="Gemini প্রম্পট কপি করে gemini.google.com খুলুন"
                      >
                        <Copy className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>প্রম্পট কপি & Gemini খুলুন ↗</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab("edit")}
                        className="w-full sm:w-auto bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer border border-amber-300 dark:border-amber-700"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>ডাটা এডিটরে যান</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: DATA REVIEW & VISUAL BUILDER */}
              {activeTab === "edit" && (
                <div className="space-y-4 text-xs">
                  {/* Date, Day, Page */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        তারিখ (Date)
                      </label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-1.5 bg-white dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        বার (Day)
                      </label>
                      <input
                        type="text"
                        value={day}
                        onChange={(e) => setDay(e.target.value)}
                        placeholder="মঙ্গলবার"
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-1.5 bg-white dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        পৃষ্ঠা নং (Page)
                      </label>
                      <input
                        type="text"
                        value={pageNo}
                        onChange={(e) => setPageNo(e.target.value)}
                        placeholder="98"
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-1.5 bg-white dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  {/* Stock Valuation Table */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <span className="font-black text-slate-800 dark:text-slate-200 block text-xs">
                      ১. মজুদ ডিমের পরিমাণ ও ক্রয় দর (Stock Entries)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {stockEntries.map((stk, idx) => (
                        <div
                          key={idx}
                          className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col justify-between"
                        >
                          <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300 mb-1">
                            {stk.eggType}
                          </span>
                          <div className="grid grid-cols-2 gap-1.5">
                            <div>
                              <span className="text-[9px] text-slate-400 block">সংখ্যা (Qty)</span>
                              <input
                                type="number"
                                value={stk.currentStock || ""}
                                onChange={(e) => {
                                  const updated = [...stockEntries];
                                  updated[idx].currentStock = Number(e.target.value) || 0;
                                  setStockEntries(updated);
                                }}
                                className="w-full border border-slate-200 dark:border-slate-700 rounded px-1.5 py-1 text-xs font-bold"
                              />
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 block">দর (Rate ৳)</span>
                              <input
                                type="number"
                                step="0.01"
                                value={stk.purchaseRate || ""}
                                onChange={(e) => {
                                  const updated = [...stockEntries];
                                  updated[idx].purchaseRate = Number(e.target.value) || 0;
                                  setStockEntries(updated);
                                }}
                                className="w-full border border-slate-200 dark:border-slate-700 rounded px-1.5 py-1 text-xs font-bold"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financials & Balances */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        সাবেক ব্যালেন্স (Opening ৳)
                      </label>
                      <input
                        type="number"
                        value={prevDayBalance || ""}
                        onChange={(e) => setPrevDayBalance(Number(e.target.value) || 0)}
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-1.5 bg-white dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        বাকি খাতা (Customer Due ৳)
                      </label>
                      <input
                        type="number"
                        value={totalDue || ""}
                        onChange={(e) => setTotalDue(Number(e.target.value) || 0)}
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-1.5 bg-white dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        নগদ ক্যাশ (Cash in Hand ৳)
                      </label>
                      <input
                        type="number"
                        value={totalCash || ""}
                        onChange={(e) => setTotalCash(Number(e.target.value) || 0)}
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-1.5 bg-white dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  {/* Dues & Expenses Lists */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Extra Dues */}
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                          অন্যান্য দেনা / দায় খাতসমূহ ({extraDueList.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => setExtraDueList([...extraDueList, { label: "", amount: 0 }])}
                          className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded font-bold hover:bg-amber-600"
                        >
                          + যোগ
                        </button>
                      </div>
                      {extraDueList.map((d, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={d.label}
                            onChange={(e) => {
                              const up = [...extraDueList];
                              up[i].label = e.target.value;
                              setExtraDueList(up);
                            }}
                            placeholder="খাত"
                            className="flex-1 border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1 text-[11px]"
                          />
                          <input
                            type="number"
                            value={d.amount || ""}
                            onChange={(e) => {
                              const up = [...extraDueList];
                              up[i].amount = Number(e.target.value) || 0;
                              setExtraDueList(up);
                            }}
                            placeholder="টাকা"
                            className="w-20 border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1 text-[11px]"
                          />
                          <button
                            type="button"
                            onClick={() => setExtraDueList(extraDueList.filter((_, idx) => idx !== i))}
                            className="text-rose-500 hover:text-rose-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Expenses */}
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                          খরচের খাতসমূহ ({expensesList.length})
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setExpensesList([
                              ...expensesList,
                              { expenseType: "অন্যান্য", amount: 0, wastedEggQty: 0, wastedEggCost: 0 },
                            ])
                          }
                          className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded font-bold hover:bg-amber-600"
                        >
                          + যোগ
                        </button>
                      </div>
                      {expensesList.map((exp, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={exp.expenseType}
                            onChange={(e) => {
                              const up = [...expensesList];
                              up[i].expenseType = e.target.value;
                              setExpensesList(up);
                            }}
                            placeholder="খরচ"
                            className="flex-1 border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1 text-[11px]"
                          />
                          <input
                            type="number"
                            value={exp.amount || ""}
                            onChange={(e) => {
                              const up = [...expensesList];
                              up[i].amount = Number(e.target.value) || 0;
                              setExpensesList(up);
                            }}
                            placeholder="টাকা"
                            className="w-20 border border-slate-300 dark:border-slate-600 rounded px-1.5 py-1 text-[11px]"
                          />
                          <button
                            type="button"
                            onClick={() => setExpensesList(expensesList.filter((_, idx) => idx !== i))}
                            className="text-rose-500 hover:text-rose-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: GENERATED JSON CODE */}
              {activeTab === "json" && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <FileCode className="w-4 h-4 text-amber-500" />
                      লাইভ জেনারেটেড JSON কোড:
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyJson}
                        className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold py-1 px-2.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
                      >
                        {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedJson ? "কপি হয়েছে!" : "JSON কপি"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadJson}
                        className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold py-1 px-2.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>ডাউনলোড</span>
                      </button>
                    </div>
                  </div>

                  <pre className="bg-slate-950 text-amber-300 p-4 rounded-xl border border-slate-800 text-xs font-mono max-h-96 overflow-y-auto select-all leading-relaxed">
                    {jsonString}
                  </pre>
                </div>
              )}

              {/* Status Message */}
              {saveStatus && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    saveStatus.type === "success"
                      ? "bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                      : "bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300"
                  }`}
                >
                  {saveStatus.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  )}
                  <span>{saveStatus.text}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-2.5">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-full sm:w-auto px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="w-full sm:w-auto px-3.5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>JSON কপি</span>
                </button>

                <button
                  type="button"
                  onClick={handleDirectSave}
                  disabled={isSaving}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>গুগল শিটে সেভ হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>⚡ সরাসরি গুগল শিটে সেভ ও ইমপোর্ট করুন</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
