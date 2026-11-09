"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
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

export const MONTH_NAMES_BN = [
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

export const MONTH_NAMES_EN = [
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

export const WEEK_DAYS = [
  { bn: "শনি", en: "Sa" },
  { bn: "রবি", en: "Su" },
  { bn: "সোম", en: "Mo" },
  { bn: "মঙ্গল", en: "Tu" },
  { bn: "বুধ", en: "We" },
  { bn: "বৃহঃ", en: "Th" },
  { bn: "শুক্র", en: "Fr" },
];

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
  "বৃহঃ": "বৃহস্পতিবার",
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

  // Calendar calculations (starting from Saturday = 0 in Bangladeshi standard)
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
    <div ref={containerRef} className={`relative ${isOpen ? "z-[9999]" : ""} ${className}`}>
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
            ? "px-2 sm:px-2.5 py-1 bg-transparent border-slate-700/80 text-white hover:bg-white/10 hover:border-amber-500/60 text-xs font-semibold"
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
          className={`absolute z-[9999] mt-2 ${compact ? "right-0 max-sm:left-1/2 max-sm:-translate-x-1/2" : "left-0 sm:left-auto right-0 sm:right-auto"} w-[330px] sm:w-[350px] max-w-[calc(100vw-24px)] bg-[#030718] border border-[#1d293d] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-4 sm:p-5 text-slate-100 select-none animate-fadeIn`}
        >
          {/* Header with Month / Year navigation */}
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#1d293d]">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer select-none"
              title="পূর্ববর্তী মাস"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
            </button>

            <div className="text-center">
              <div className="text-base sm:text-lg font-bold text-white tracking-wide">
                {MONTH_NAMES_BN[viewMonth]} {viewYear}
              </div>
              <div className="text-xs font-normal text-slate-400 mt-0.5">
                {MONTH_NAMES_EN[viewMonth]} (DD/MM/YYYY)
              </div>
            </div>

            <button
              type="button"
              onClick={nextMonth}
              className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer select-none"
              title="পরবর্তী মাস"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.2]" />
            </button>
          </div>

          {/* Weekday headers: শনি, রবি, সোম, মঙ্গল, বুধ, বৃহঃ, শুক্র */}
          <div className="grid grid-cols-7 gap-1 text-center mb-4">
            {WEEK_DAYS.map((w, idx) => (
              <div
                key={idx}
                className={`text-xs sm:text-sm font-bold py-0.5 ${
                  idx === 6
                    ? "text-[#f43f5e]"
                    : "text-slate-200"
                }`}
              >
                {w.bn}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-y-3 sm:gap-y-3.5 gap-x-1 text-center">
            {/* Empty slots for start of month */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-9 w-9 sm:h-10 sm:w-10" />
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
                  className={`h-9 w-9 sm:h-10 sm:w-10 mx-auto rounded-2xl flex items-center justify-center text-sm sm:text-base font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#e17100] text-white font-extrabold shadow-lg shadow-orange-500/35 scale-105"
                      : isToday
                      ? "text-amber-300 font-bold border border-amber-500/70 hover:bg-slate-800/80 hover:text-white"
                      : "text-white hover:bg-slate-800/80 hover:text-white"
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Footer: Quick Today & Format Badge */}
          <div className="mt-4 sm:mt-5 pt-3 sm:pt-3.5 border-t border-[#1d293d] flex items-center justify-between text-xs sm:text-sm">
            <button
              type="button"
              onClick={handleSetToday}
              className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-bold transition-colors cursor-pointer select-none"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              <span>আজকের দিন (Today)</span>
            </button>

            <div className="font-bold flex items-center gap-1 select-none">
              <span className="text-slate-200">ফরম্যাট:</span>
              <span className="text-amber-400 font-mono">
                {String(selectedDay).padStart(2, "0")}/
                {String(viewMonth + 1).padStart(2, "0")}/{viewYear}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer p-0.5 select-none"
              title="বন্ধ করুন"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
