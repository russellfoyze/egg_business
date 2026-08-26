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
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-tr from-amber-500 via-amber-600 to-amber-700 rounded-3xl text-white shadow-lg shadow-amber-500/20">
            <Egg className="w-9 h-9" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center justify-center gap-1.5">
              <span>YolkFlow</span>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-700/60">
                হালখাতা
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              ডিম ব্যবসার আধুনিক দৈনিক খতিয়ান ও স্মার্ট হিসাবরক্ষণ
            </p>
          </div>
        </div>

        {/* Login Box */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-200/80 dark:border-slate-800 space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 text-center">
            <h2 className="text-base font-black text-slate-800 dark:text-slate-200">
              অ্যাকাউন্টে লগইন করুন
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              আপনার ইউজারনেম ও পাসওয়ার্ড দিয়ে প্রবেশ করুন
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center space-x-2 text-rose-800 dark:text-rose-300 text-xs font-bold animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={(e) => handleLogin(e)} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                ইউজারনেম (Username)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="যেমন: russellfoyze, billal, juel"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/70 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-slate-400 dark:placeholder-slate-500"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                পাসওয়ার্ড (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="পাসওয়ার্ড লিখুন"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50/70 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-slate-400 dark:placeholder-slate-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              <span>{isSubmitting ? "যাচাই করা হচ্ছে..." : "প্রবেশ করুন (Login)"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* 1-Click Fast Login Shortcuts */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 text-center flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>১-ক্লিকে দ্রুত লগইন করুন (ডেমো একাউন্টস)</span>
            </p>

            <div className="grid grid-cols-1 gap-2">
              {/* Admin Card */}
              <button
                type="button"
                onClick={() => handleQuickLogin("russellfoyze")}
                className="flex items-center justify-between p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/40 hover:bg-amber-100/70 dark:hover:bg-amber-900/50 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="text-lg">👑</span>
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-slate-100 group-hover:text-amber-800 dark:group-hover:text-amber-300">
                      russellfoyze <span className="font-semibold text-slate-500">(অ্যাডমিন)</span>
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">ড্যাশবোর্ড, হালখাতা ও মাসিক খরচ সব অ্যাক্সেস</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-900/80 px-2 py-0.5 rounded-lg">
                  লগইন ↗
                </span>
              </button>

              {/* Manager Card */}
              <button
                type="button"
                onClick={() => handleQuickLogin("billal")}
                className="flex items-center justify-between p-2.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/40 hover:bg-blue-100/70 dark:hover:bg-blue-900/50 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="text-lg">👔</span>
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-slate-100 group-hover:text-blue-800 dark:group-hover:text-blue-300">
                      billal <span className="font-semibold text-slate-500">(ম্যানেজার)</span>
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">হালখাতা এন্ট্রি ও কর্মচারী ও মাসিক খরচ অ্যাক্সেস</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 bg-blue-100/90 dark:bg-blue-900/80 px-2 py-0.5 rounded-lg">
                  লগইন ↗
                </span>
              </button>

              {/* Viewer Card */}
              <button
                type="button"
                onClick={() => handleQuickLogin("juel")}
                className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/40 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/50 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="text-lg">👁️</span>
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-slate-100 group-hover:text-emerald-800 dark:group-hover:text-emerald-300">
                      juel <span className="font-semibold text-slate-500">(ভিউয়ার)</span>
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">শুধুমাত্র ড্যাশবোর্ড ও রিপোর্ট দেখার সুবিধা</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-900/80 px-2 py-0.5 rounded-lg">
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
