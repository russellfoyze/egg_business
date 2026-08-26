import type { Metadata } from "next";
import "./globals.css";
import ThemeToggle from "./ThemeToggle";
import ImageToJsonModal from "./ImageToJsonModal";

export const metadata: Metadata = {
  title: "YolkFlow - Egg Ledger & Dashboard",
  description: "Real-time Google Sheets database application for egg stocks and sales.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body className="bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen antialiased selection:bg-amber-500 selection:text-white pb-16 sm:pb-8 transition-colors duration-200">
        <header className="bg-gradient-to-r from-amber-600 via-amber-600 to-amber-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 text-white shadow-md sticky top-0 z-50 backdrop-blur-md border-b border-amber-700/50 dark:border-slate-800 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex justify-between items-center">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 bg-white/15 dark:bg-amber-500/20 rounded-xl flex items-center justify-center text-xl shadow-inner border border-white/20 dark:border-amber-400/30">
                🍳
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg sm:text-xl font-black tracking-tight leading-none">YolkFlow</span>
                  <span className="bg-amber-500/40 dark:bg-amber-500/20 text-amber-100 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                    v2.0
                  </span>
                </div>
                <p className="text-[10px] text-amber-200/90 dark:text-slate-400 font-medium hidden sm:block">ডিম ব্যবসার ডিজিটাল হালখাতা ও লাইভ শিট ডাটাবেজ</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-2.5">
              {/* Image to JSON Maker & OCR Button */}
              <ImageToJsonModal />

              {/* Modern Dark/Light Theme Toggle */}
              <ThemeToggle />

              {/* Live Sync Badge */}
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 dark:bg-emerald-950/50 text-emerald-100 dark:text-emerald-300 text-[11px] font-bold px-2.5 py-1.5 rounded-full border border-emerald-400/30 dark:border-emerald-700/50 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="hidden xs:inline">লাইভ</span> সিঙ্ক
              </span>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
