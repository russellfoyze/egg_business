# 🥚 YolkFlow - ডিম ব্যবসার আধুনিক ডিজিটাল হালখাতা ও স্মার্ট খতিয়ান (Egg Business Management System)

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Google Sheets API](https://img.shields.io/badge/Google_Sheets_API-v4-34A853?style=for-the-badge&logo=google-sheets)
![Google Gemini](https://img.shields.io/badge/Gemini_Vision-AI_OCR-4285F4?style=for-the-badge&logo=google-gemini)

**YolkFlow** হলো পাইকারি ও খুচরা ডিম ব্যবসার জন্য একটি স্বয়ংক্রিয়, আধুনিক এবং ক্লাউড-সংযুক্ত ডিজিটাল লেজার সিস্টেম। এটি হাতে লেখা বাংলা হালখাতা বা কাগজের হিসাবের জটিলতাকে পুরোপুরি দূর করে রিয়েল-টাইম গুগল শিট সিঙ্ক্রোনাইজেশন, স্বয়ংক্রিয় আর্থিক লাভ-ক্ষতি ক্যালকুলেশন এবং জেমিনাই এআই ভিশন OCR ইন্টিগ্রেশনের মাধ্যমে ব্যবসাকে শতভাগ স্বচ্ছ ও ঝামেলামুক্ত রাখে।

</div>

---

## ✨ মূল ফিচারসমূহ (Key Features)

### 📊 ১. ইন্টারেক্টিভ ড্যাশবোর্ড ও আর্থিক অ্যানালিটিক্স (Live Business Intelligence)
- **দৈনিক বিক্রয় ও স্টক মূল্য**: ডিমের ক্যাটাগরিভিত্তিক স্টক কাউন্ট এবং বর্তমান ক্রয়মূল্যের রিয়েল-টাইম মূল্যায়ন।
- **নিট লাভ মার্জিন হিসাব**: মাস্টার এক্সেল ফর্মুলা `G5 = B44 - E24` অনুসারে খরচ বাদ দিয়ে প্রকৃত লাভ-ক্ষতি।
- **ভাঙ্গা ডিম ও অপচয় হার**: ডিমের ভাঙ্গার সংখ্যা, আর্থিক ক্ষতি ও মোট খরচের সাথে অপচয়ের শতকরা হার।
- **ডিম প্রতি গড় নিট লাভ (Unit Economics)**: প্রতি ডিমে নিট মার্জিন ও গড় পরিচালন ব্যয়ের অনুপাত।
- **৭-দিনের রোলিং ট্রেন্ড ও প্রাইস গ্রাফ**: ডিমের দর ওঠানামার লাইভ চার্ট ও বিশ্লেষণ।

### ✍️ ২. ডিজিটাল হালখাতা এন্ট্রি (Daily Ledger & Live Google Sheets Sync)
- **৬ ধরনের ডিমের স্টক ও দর হিসাব**: সাদা, লাল, হাঁস, মুরগী, কোয়েল এবং L.M ডিমের ইনপুট।
- **দায় ও পাওনা খতিয়ান**: কাস্টমার বাকি, নগদ ক্যাশ, অন্যান্য পাওনা/আদায় এবং মহাজন দেনার তালিকা।
- **আইটেমাইজড খরচ খাতা**: নাস্তা-চা, গাড়ি ভাড়া, লেবার, ভাঙ্গা ডিম ও বিবিধ ব্যয়ের হিসাব।
- **গুগল শিটে লাইভ ট্যাব তৈরি**: সেভ করার সাথে সাথে গুগল স্প্রেডশিটে সেদিনের নতুন ট্যাব (যেমন: `24/08/26`) তৈরি ও ফর্মুলা সিঙ্ক।

### 🏢 ৩. কর্মচারী, দোকান ভাড়া ও অতিরিক্ত পরিচালন খরচ খাতা (Overhead Expenses Ledger)
- **কর্মচারী ব্যয়**: বেতন, দৈনিক মজুরি ও দাদনের সার্বিক হিসাব।
- **দোকান ও গোডাউন ভাড়া**: দোকান/আড়ত ভাড়া এবং বিদ্যুৎ বিল ও নাইটগার্ড চার্জ।
- **বিবিধ পরিচালন ব্যয়**: পরিবহন, ফুয়েল, ট্রেড লাইসেন্স ও ট্যাক্স।
- **স্বয়ংক্রিয় সামারি ও ফিল্টার**: মাস অনুযায়ী ফিল্টার, ক্যাটাগরি ফিল্টার এবং গুগল শিটের `OverheadExpenses` ট্যাবে সিঙ্ক।

### 📸 ৪. জেমিনাই এআই ভিশন (Gemini Vision Image-to-JSON OCR)
- হাতে লেখা কাগজের বাংলা হালখাতার ছবি আপলোড করলেই **Google Gemini 3.6 Flash Vision AI** স্বয়ংক্রিয়ভাবে ডিমের সংখ্যা, কাস্টমার বাকি, ক্যাশ ও খরচ সনাক্ত করে ডিজিটাল ফর্মে রূপান্তর করে।

### 👥 ৫. রোল-ভিত্তিক অথেনটিকেশন ও পারমিশন সিস্টেম (RBAC Security)
- **👑 russellfoyze (অ্যাডমিন)**: সম্পূর্ণ অ্যাক্সেস (ড্যাশবোর্ড, হালখাতা, মাসিক খরচ, ডাটা এডিট ও ডিলিট)।
- **👔 billal (ম্যানেজার)**: হালখাতা এন্ট্রি এবং কর্মচারী ও মাসিক খরচ এন্ট্রি ও পরিচালনা।
- **👁️ juel (ভিউয়ার)**: ড্যাশবোর্ড ও আর্থিক হিসাব পর্যবেক্ষণ (Read-Only Mode)।

---

## 🛠️ প্রযুক্তি স্ট্যাক (Tech Stack)

- **Frontend / Framework**: Next.js 16 (Turbopack, App Router, Server Components)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, Dark/Light Mode Theme Toggle
- **Icons**: Lucide React
- **Backend Database**: Google Sheets API v4 (Service Account JWT Authentication)
- **AI / OCR**: Google Generative AI (Gemini 3.6 Flash Vision)
- **Testing**: End-to-End Automated SQA Test Suite (`sqa_deep_full_test.cjs`)

---

## 🚀 ইনস্টলেশন ও লোকাল সেটআপ (Setup Guide)

### ১. ক্লোন ও ডিপেন্ডেন্সি ইনস্টল:
```bash
git clone https://github.com/russellfoyze/egg_business.git
cd egg_business
npm install
```

### ২. এনভায়রনমেন্ট ভ্যারিয়েবল কনফিগারেশন:
`.env.example` ফাইলটিকে রিনেম করে `.env.local` তৈরি করুন এবং আপনার ক্রেডেনশিয়াল দিন:
```env
GOOGLE_SHEET_ID="your_google_sheet_id"
GOOGLE_SERVICE_ACCOUNT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GEMINI_API_KEY="your_gemini_api_key"
```

### ৩. ডেভেলপমেন্ট সার্ভার চালু:
```bash
npm run dev
```
ব্রাউজারে **`http://localhost:3000`** ওপেন করুন।

---

## 🧪 SQA অটোমেশন টেস্ট রান করা
```bash
node sqa_deep_full_test.cjs
```
*(৯৩/৯৩ টি টেস্ট ১০০% পাস রেট সহ নিশ্চিত করা হয়েছে)*

---

## 📄 লাইসেন্স
এই প্রজেক্টটি **MIT License** এর অধীনে মুক্ত।
<br />
Developed with ❤️ by **Russell Foyze**.
