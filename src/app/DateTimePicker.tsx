"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Check,
  RotateCcw,
  X,
} from "lucide-react";

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  label?: string;
  className?: string;
  placeholder?: string;
  compact?: boolean;
}

const MONTH_NAMES_BN = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
];

const MONTH_NAMES_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEK_DAYS = [
  { bn: "শনি", en: "Sa" },
  { bn: "রবি", en: "Su" },
  { bn: "সোম", en: "Mo" },
  { bn: "মঙ্গল", en: "Tu" },
  { bn: "বুধ", en: "We" },
  { bn: "বৃহঃ", en: "Th" },
  { bn: "শুক্র", en: "Fr" },
];

/**
 * Format YYYY-MM-DD to DD/MM/YYYY (Day/Month/Year)
 */
export const formatToDayMonthYear = (dateStr: string): string => {
  if (!dateStr) return "DD/MM/YYYY";
  if (dateStr.includes("-")) {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const year = parts[0];
      const month = parts[1].padStart(2, "0");
      const day = parts[2].padStart(2, "0");
      return `${day}/${month}/${year}`;
    }
  }
  return dateStr;
};

// Backwards compatibility alias
export const formatToDayMonthYearTime = (dateStr: string): string => {
  return formatToDayMonthYear(dateStr);
};

export const getCurrentTimeFormatted = (): string => "";

export default function DateTimePicker({
  value,
  onChange,
  label,
  className = "",
  placeholder = "DD/MM/YYYY (দিন/মাস/বছর)",
  compact = false,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current selected date (YYYY-MM-DD)
  const parseDate = (dStr: string) => {
    if (!dStr) {
      const now = new Date();
      return {
        year: now.getFullYear(),
        month: now.getMonth(),
        day: now.getDate(),
      };
    }
    const parts = dStr.split("-").map(Number);
    if (parts.length === 3 && !isNaN(parts[0])) {
      return { year: parts[0], month: parts[1] - 1, day: parts[2] };
    }
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
  };

  const parsed = parseDate(value);
  const [viewYear, setViewYear] = useState(parsed.year);
  const [viewMonth, setViewMonth] = useState(parsed.month);
  const [selectedDay, setSelectedDay] = useState(parsed.day);

  // Update view when value prop changes
  useEffect(() => {
    const p = parseDate(value);
    setViewYear(p.year);
    setViewMonth(p.month);
    setSelectedDay(p.day);
  }, [value]);

  // Outside click to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Month navigation
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Calendar calculations (starting from Saturday = 0 in Bangladeshi standard or standard grid)
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  // Saturday is index 0 in WEEK_DAYS:
  // JS Date.getDay(): 0 = Sun, 1 = Mon, ..., 6 = Sat
  // To map to Saturday = 0: (getDay() + 1) % 7
  const jsFirstDay = new Date(viewYear, viewMonth, 1).getDay();
  const firstDayIndex = (jsFirstDay + 1) % 7;

  const handleSelectDate = (d: number) => {
    setSelectedDay(d);
    const mStr = String(viewMonth + 1).padStart(2, "0");
    const dStr = String(d).padStart(2, "0");
    const newDateStr = `${viewYear}-${mStr}-${dStr}`;
    onChange(newDateStr);
    setIsOpen(false);
  };

  const handleSetToday = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const d = now.getDate();
    setViewYear(y);
    setViewMonth(m);
    setSelectedDay(d);

    const mStr = String(m + 1).padStart(2, "0");
    const dStr = String(d).padStart(2, "0");
    const dateStr = `${y}-${mStr}-${dStr}`;

    onChange(dateStr);
    setIsOpen(false);
  };

  const displayFormatted = formatToDayMonthYear(value);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
          {label}
        </label>
      )}

      {/* Visual Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between border rounded-xl transition-all cursor-pointer select-none ${
          compact
            ? "px-2 py-1 bg-transparent border-slate-700/80 text-white hover:bg-white/10 text-xs"
            : "px-3 py-2 bg-slate-50/70 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:border-amber-500 text-sm font-bold shadow-xs focus:ring-2 focus:ring-amber-500"
        }`}
      >
        <div className="flex items-center space-x-2 truncate">
          <CalendarIcon className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="truncate">{displayFormatted || placeholder}</span>
        </div>
      </button>

      {/* Popover Calendar */}
      {isOpen && (
        <div
          className={`absolute z-[60] mt-2 ${
            compact ? "left-1/2 -translate-x-1/2" : "left-0 sm:left-auto right-0 sm:right-auto"
          } min-w-[285px] sm:min-w-[320px] bg-slate-950/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl p-3.5 sm:p-4 text-slate-100 animate-fadeIn`}
        >
          {/* Header with Month / Year navigation */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="পূর্ববর্তী মাস"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="text-center">
              <span className="text-sm font-black text-slate-900 dark:text-slate-100">
                {MONTH_NAMES_BN[viewMonth]} {viewYear}
              </span>
              <span className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                {MONTH_NAMES_EN[viewMonth]} (DD/MM/YYYY)
              </span>
            </div>

            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="পরবর্তী মাস"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday headers: শনি, রবি, সোম, মঙ্গল, বুধ, বৃহঃ, শুক্র */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
            {WEEK_DAYS.map((w, idx) => (
              <div
                key={idx}
                className={`text-[11px] font-bold py-1 ${
                  idx === 6
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {w.bn}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Empty slots for start of month */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-8" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const isSelected =
                selectedDay === dayNum &&
                viewMonth === parsed.month &&
                viewYear === parsed.year;
              const isToday =
                dayNum === new Date().getDate() &&
                viewMonth === new Date().getMonth() &&
                viewYear === new Date().getFullYear();

              return (
                <button
                  key={`day-${dayNum}`}
                  type="button"
                  onClick={() => handleSelectDate(dayNum)}
                  className={`h-8 w-8 mx-auto rounded-xl flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-amber-600 text-white shadow-md shadow-amber-600/30 scale-105"
                      : isToday
                      ? "bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-400 dark:border-amber-700"
                      : "text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Footer: Quick Today & Format Badge */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleSetToday}
              className="text-[11px] font-bold text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>আজকের দিন (Today)</span>
            </button>

            <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300 truncate">
              ফরম্যাট:{" "}
              <span className="text-amber-600 dark:text-amber-400 font-mono">
                {String(selectedDay).padStart(2, "0")}/
                {String(viewMonth + 1).padStart(2, "0")}/{viewYear}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
