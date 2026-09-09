"use client";

import React, { useState } from "react";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  Egg,
  ArrowRight,
  Sparkles,
  Users,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { UserAccount, authenticateUser } from "@/lib/auth";

interface LoginScreenProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (e?: React.FormEvent, directUsername?: string, directPassword?: string) => {
    if (e) e.preventDefault();
    setError(null);

    const userToTry = directUsername || username;
    const passToTry = directPassword || password;

    if (!userToTry.trim()) {
      setError("অনুগ্রহ করে আপনার ইউজারনেম লিখুন।");
      return;
    }

    if (!passToTry.trim()) {
      setError("অনুগ্রহ করে আপনার পাসওয়ার্ড লিখুন।");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const user = authenticateUser(userToTry, passToTry);
      if (user) {
        try {
          localStorage.setItem("yolkflow_auth_user", JSON.stringify(user));
        } catch (err) {}
        onLoginSuccess(user);
      } else {
        setError("ইউজারনেম বা পাসওয়ার্ড সঠিক নয়। আবার চেষ্টা করুন।");
      }
      setIsSubmitting(false);
    }, 200);
  };

  const handleQuickLogin = (uname: string) => {
    setUsername(uname);
    setPassword(uname);
    handleLogin(undefined, uname, uname);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="w-full max-w-md space-y-6">
        {/* Branding & Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-1 bg-gradient-to-tr from-amber-500 via-amber-600 to-amber-700 rounded-3xl text-white shadow-xl shadow-amber-500/25 ring-4 ring-amber-500/20">
            <img
              src="/logo.png"
              alt="M.A Khalek Sarker Logo"
              className="w-20 h-20 rounded-2xl object-cover shadow-inner"
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center justify-center gap-2">
              <span>M.A Khalek Sarker</span>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-700/60">
                হালখাতা
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-semibold mt-1">
              এম. এ. খালেক সরকার — ডিমের আড়ত ও পাইকারি খতিয়ান
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              Wholesale Egg Merchant & Real-time Financial Ledger
            </p>
          </div>
        </div>

        {/* Login Box */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
          <div className="border-b border-white/10 pb-3 text-center">
            <h2 className="text-base sm:text-lg font-black text-slate-100">
              অ্যাকাউন্টে লগইন করুন
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              আপনার ইউজারনেম ও পাসওয়ার্ড দিয়ে প্রবেশ করুন
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/70 border border-rose-500/50 rounded-2xl flex items-center space-x-2 text-rose-300 text-xs font-bold animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={(e) => handleLogin(e)} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                ইউজারনেম (Username)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="যেমন: russellfoyze, billal, kayes, juel"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm font-bold text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 placeholder-slate-500"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                পাসওয়ার্ড (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="পাসওয়ার্ড লিখুন"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm font-bold text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 placeholder-slate-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-300 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-400 via-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-slate-950 font-black text-sm rounded-full shadow-[0_0_24px_rgba(0,200,255,0.45)] border border-cyan-300/60 transition-all flex items-center justify-center space-x-2 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              <span>{isSubmitting ? "যাচাই করা হচ্ছে..." : "প্রবেশ করুন (Login)"}</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </form>

          {/* 1-Click Fast Login Shortcuts */}
          <div className="pt-3 border-t border-white/10 space-y-2">
            <p className="text-[11px] font-bold text-slate-400 text-center flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>১-ক্লিকে দ্রুত লগইন করুন (ডেমো একাউন্টস)</span>
            </p>

            <div className="grid grid-cols-1 gap-2">
              {/* Admin Card */}
              <button
                type="button"
                onClick={() => handleQuickLogin("russellfoyze")}
                className="flex items-center justify-between p-3 rounded-2xl border border-white/10 bg-slate-950/60 hover:border-cyan-500/50 hover:bg-slate-900/60 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="text-lg">👑</span>
                  <div>
                    <p className="text-xs font-black text-slate-100 group-hover:text-cyan-400">
                      russellfoyze <span className="font-semibold text-slate-400">(অ্যাডমিন)</span>
                    </p>
                    <p className="text-[10px] text-slate-400">ড্যাশবোর্ড, হালখাতা ও মাসিক খরচ সব অ্যাক্সেস</p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-cyan-300 bg-slate-900 border border-cyan-500/60 px-3 py-1 rounded-full shadow-[0_0_8px_rgba(0,200,255,0.2)] group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-sky-400 group-hover:text-slate-950 transition-all">
                  লগইন ↗
                </span>
              </button>

              {/* Manager Card - Billal */}
              <button
                type="button"
                onClick={() => handleQuickLogin("billal")}
                className="flex items-center justify-between p-3 rounded-2xl border border-white/10 bg-slate-950/60 hover:border-cyan-500/50 hover:bg-slate-900/60 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="text-lg">👔</span>
                  <div>
                    <p className="text-xs font-black text-slate-100 group-hover:text-cyan-400">
                      billal <span className="font-semibold text-slate-400">(ম্যানেজার)</span>
                    </p>
                    <p className="text-[10px] text-slate-400">হালখাতা এন্ট্রি ও কর্মচারী ও মাসিক খরচ অ্যাক্সেস</p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-cyan-300 bg-slate-900 border border-cyan-500/60 px-3 py-1 rounded-full shadow-[0_0_8px_rgba(0,200,255,0.2)] group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-sky-400 group-hover:text-slate-950 transition-all">
                  লগইন ↗
                </span>
              </button>

              {/* Manager Card - Kayes */}
              <button
                type="button"
                onClick={() => handleQuickLogin("kayes")}
                className="flex items-center justify-between p-3 rounded-2xl border border-white/10 bg-slate-950/60 hover:border-cyan-500/50 hover:bg-slate-900/60 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="text-lg">💼</span>
                  <div>
                    <p className="text-xs font-black text-slate-100 group-hover:text-cyan-400">
                      kayes <span className="font-semibold text-slate-400">(ম্যানেজার)</span>
                    </p>
                    <p className="text-[10px] text-slate-400">ড্যাশবোর্ড, হালখাতা ও মাসিক খরচ অ্যাক্সেস</p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-cyan-300 bg-slate-900 border border-cyan-500/60 px-3 py-1 rounded-full shadow-[0_0_8px_rgba(0,200,255,0.2)] group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-sky-400 group-hover:text-slate-950 transition-all">
                  লগইন ↗
                </span>
              </button>

              {/* Viewer Card */}
              <button
                type="button"
                onClick={() => handleQuickLogin("juel")}
                className="flex items-center justify-between p-3 rounded-2xl border border-white/10 bg-slate-950/60 hover:border-cyan-500/50 hover:bg-slate-900/60 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="text-lg">👁️</span>
                  <div>
                    <p className="text-xs font-black text-slate-100 group-hover:text-cyan-400">
                      juel <span className="font-semibold text-slate-400">(ভিউয়ার)</span>
                    </p>
                    <p className="text-[10px] text-slate-400">শুধুমাত্র ড্যাশবোর্ড ও রিপোর্ট দেখার সুবিধা</p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-cyan-300 bg-slate-900 border border-cyan-500/60 px-3 py-1 rounded-full shadow-[0_0_8px_rgba(0,200,255,0.2)] group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-sky-400 group-hover:text-slate-950 transition-all">
                  লগইন ↗
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Security Note */}
        <div className="flex items-center justify-center space-x-1.5 text-slate-400 dark:text-slate-500 text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>রোল-ভিত্তিক নিরাপদ এনক্রিপ্টেড সেশন ও গুগল শিট সিঙ্ক</span>
        </div>
      </div>
    </div>
  );
}
