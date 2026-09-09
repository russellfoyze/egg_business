import type { Metadata } from "next";
import { Hind_Siliguri } from "next/font/google";
import "./globals.css";

const hindSiliguri = Hind_Siliguri({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["bengali", "latin"],
  display: "swap",
  variable: "--font-hind-siliguri",
});

export const metadata: Metadata = {
  title: "M.A Khalek Sarker - ডিম ব্যবসার হালখাতা (YolkFlow)",
  description: "M.A Khalek Sarker (এম. এ. খালেক সরকার) - Wholesale Egg Merchant & Real-time Digital Ledger System.",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className={hindSiliguri.variable} suppressHydrationWarning>
      <body className={`${hindSiliguri.className} bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen antialiased selection:bg-cyan-500 selection:text-slate-950 pb-16 sm:pb-8 transition-colors duration-200`}>
        {children}
      </body>
    </html>
  );
}
