"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("yolkflow_theme");
    if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("yolkflow_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("yolkflow_theme", "light");
    }
  };

  const isDark = theme === "dark";

  if (!mounted) {
    return (
      <div className="h-8 w-16 p-1 rounded-full bg-black/20 border border-white/20" />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "লাইট থিমে পরিবর্তন করুন" : "ডার্ক থিমে পরিবর্তন করুন"}
      title={isDark ? "লাইট মোড (Light Mode)" : "ডার্ক মোড (Dark Mode)"}
      className={`relative flex items-center h-8 w-16 p-1 rounded-full border transition-all duration-300 cursor-pointer shadow-inner select-none ${
        isDark
          ? "bg-slate-900/90 border-slate-700/80 hover:border-amber-400/40 shadow-slate-950/60"
          : "bg-amber-950/30 border-amber-300/30 hover:border-amber-200/60 shadow-amber-950/30"
      }`}
    >
      {/* Background Icons */}
      <div className="w-full flex justify-between items-center px-1 text-[11px] pointer-events-none">
        <Sun
          className={`w-3.5 h-3.5 transition-all duration-300 ${
            !isDark ? "text-amber-300 scale-100 opacity-100" : "text-slate-500 scale-75 opacity-40"
          }`}
        />
        <Moon
          className={`w-3.5 h-3.5 transition-all duration-300 ${
            isDark ? "text-indigo-300 scale-100 opacity-100" : "text-amber-200/50 scale-75 opacity-40"
          }`}
        />
      </div>

      {/* Modern Sliding Thumb Knob with Glow */}
      <div
        className={`absolute top-1 bottom-1 w-6 h-6 rounded-full shadow-md transition-all duration-300 ease-out flex items-center justify-center ${
          isDark
            ? "left-[calc(100%-1.75rem)] bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-indigo-500/40"
            : "left-1 bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 shadow-amber-500/40"
        }`}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 drop-shadow" />
        ) : (
          <Sun className="w-3.5 h-3.5 drop-shadow" />
        )}
      </div>
    </button>
  );
}
