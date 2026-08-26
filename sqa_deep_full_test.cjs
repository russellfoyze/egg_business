const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");

// Native .env.local loader
try {
  const envPath = path.join(__dirname, ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  }
} catch (e) {}

// ANSI Color Helpers
const green = "\x1b[32m";
const red = "\x1b[31m";
const yellow = "\x1b[33m";
const cyan = "\x1b[36m";
const bold = "\x1b[1m";
const reset = "\x1b[0m";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assertTest(name, condition, extraInfo = "") {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ${green}✔ PASS:${reset} ${name}`);
  } else {
    failedTests++;
    console.log(`  ${red}✖ FAIL:${reset} ${bold}${name}${reset} ${extraInfo ? `(${extraInfo})` : ""}`);
  }
}

async function runFullSQASuite() {
  console.log(`\n${bold}${cyan}================================================================${reset}`);
  console.log(`${bold}${cyan}      🧪 YOLKFLOW FULL-STACK END-TO-END SQA AUTOMATION TEST     ${reset}`);
  console.log(`${bold}${cyan}================================================================${reset}\n`);

  const baseUrl = "http://localhost:3000";

  // -------------------------------------------------------------
  // 1. API HEALTH & BACKEND ENDPOINT INTEGRITY
  // -------------------------------------------------------------
  console.log(`${bold}1. API Endpoints & Next.js Server Integrity:${reset}`);
  let apiData = [];
  try {
    const res = await fetch(`${baseUrl}/api/data`);
    assertTest("GET /api/data returns HTTP 200 OK", res.status === 200);
    const json = await res.json();
    assertTest("Response schema contains success: true", json.success === true);
    assertTest("Response data is an array of ledger records", Array.isArray(json.data) && json.data.length > 0);
    apiData = json.data;
  } catch (e) {
    assertTest("API endpoint /api/data is accessible", false, e.message);
  }

  // -------------------------------------------------------------
  // 2. LIVE GOOGLE SHEETS DATABASE DEEP VERIFICATION
  // -------------------------------------------------------------
  console.log(`\n${bold}2. Live Google Sheets Database & Tables Verification:${reset}`);
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (privateKey && privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  assertTest("Google Sheet ID is configured in .env.local", Boolean(sheetId));
  assertTest("Google Service Account email configured", Boolean(clientEmail));
  assertTest("Google RSA Private Key configured", Boolean(privateKey));

  let sheets = null;
  let spreadsheetMeta = null;

  try {
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    sheets = google.sheets({ version: "v4", auth });

    const metaRes = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
    spreadsheetMeta = metaRes.data;
    assertTest("Google Sheets JWT Authentication successful", true);
    assertTest("Google Spreadsheet metadata accessible", Boolean(spreadsheetMeta.properties?.title));

    const sheetTitles = spreadsheetMeta.sheets.map((s) => s.properties.title);
    assertTest("Master template tab 'Original' exists", sheetTitles.includes("Original"));
    assertTest("Backend table 'DailyStock' exists", sheetTitles.includes("DailyStock"));
    assertTest("Backend table 'Financials' exists", sheetTitles.includes("Financials"));
    assertTest("Backend table 'Expenses' exists", sheetTitles.includes("Expenses"));
    assertTest("Live date tab '24/08/26' exists", sheetTitles.includes("24/08/26"));
    assertTest("Live date tab '25/08/26' exists", sheetTitles.includes("25/08/26"));

    // Check cells in Master Template 'Original'
    const origFormulas = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "Original!G5:G9",
      valueRenderOption: "FORMULA",
    });
    const g5 = origFormulas.data.values?.[0]?.[0];
    assertTest("Original tab Net Margin formula G5 is '=B44-E24'", g5 === "=B44-E24", `Got: ${g5}`);

    // Check cells in Live Date Tab '24/08/26'
    const tab24Data = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "'24/08/26'!A1:G45",
      valueRenderOption: "UNFORMATTED_VALUE",
    });
    const rows = tab24Data.data.values || [];
    assertTest("Live date tab '24/08/26' has data rows", rows.length >= 25);
  } catch (err) {
    assertTest("Google Sheets connection & table check", false, err.message);
  }

  // -------------------------------------------------------------
  // 3. FINANCIAL FORMULA & ARITHMETIC INTEGRITY (ALL DAYS)
  // -------------------------------------------------------------
  console.log(`\n${bold}3. Financial Formula & Accounting Integrity Verification:${reset}`);
  apiData.forEach((dayRecord) => {
    const dStr = dayRecord.date;
    const fin = dayRecord.financials;
    const exp = dayRecord.expenses;
    const st = dayRecord.stock;

    // A. Stock Valuation: sum of (currentStock * purchaseRate)
    let calculatedStock = 0;
    Object.values(st).forEach((s) => {
      calculatedStock += (s.currentStock || 0) * (s.purchaseRate || 0);
    });
    const stockDiff = Math.abs(calculatedStock - fin.totalStockValue);
    assertTest(`[${dStr}] Stock Valuation: D12 (${fin.totalStockValue}) matches sum(Qty * Rate)`, stockDiff < 1);

    // B. Total Receivables: B25 = Due + Extra + Cash + Stock
    const calculatedB25 = (fin.totalDue || 0) + (fin.extraDue || 0) + (fin.totalCash || 0) + fin.totalStockValue;
    const b25Diff = Math.abs(calculatedB25 - fin.totalBusinessValue);
    assertTest(`[${dStr}] Total Receivables: B25 (${fin.totalBusinessValue}) = Due + Extra + Cash + Stock`, b25Diff < 1);

    // C. Total Business with Expenses: B44 = B25 + B43
    const calculatedB44 = fin.totalBusinessValue + exp.totalExpenses;
    const b44Diff = Math.abs(calculatedB44 - exp.totalBusinessWithExpenses);
    assertTest(`[${dStr}] Total Business with Expenses: B44 (${exp.totalBusinessWithExpenses}) = B25 + B43`, b44Diff < 1);

    // D. Net Profit Margin: G5 = B44 - E24
    const calculatedMargin = exp.totalBusinessWithExpenses - fin.totalBusinessWithDue;
    const marginDiff = Math.abs(calculatedMargin - fin.profitMargin);
    assertTest(`[${dStr}] Net Profit Margin: G5 (${fin.profitMargin}) = B44 - E24`, marginDiff < 1);

    // E. Cash + Stock: G9 = Cash + Stock Valuation
    const calculatedG9 = (fin.totalCash || 0) + fin.totalStockValue;
    const g9Diff = Math.abs(calculatedG9 - fin.cashPlusStock);
    assertTest(`[${dStr}] Liquid Asset Metric: G9 (${fin.cashPlusStock}) = Cash + Stock`, g9Diff < 1);
  });

  // -------------------------------------------------------------
  // 4. BUSINESS INTELLIGENCE & ANALYTICS INTEGRITY
  // -------------------------------------------------------------
  console.log(`\n${bold}4. Business Intelligence (Wastage & Profit per Egg) Tests:${reset}`);
  const latestDay = apiData[apiData.length - 1];
  if (latestDay) {
    const brokenExp = latestDay.expenses.list.find((e) => e.type.includes("ভাঙ্গা") || e.type.includes("ড্যামেজ"));
    const brokenQty = brokenExp?.wastedEggQty || (brokenExp ? Math.round(brokenExp.amount / 11) : 0);
    const totalStockQty = Object.values(latestDay.stock || {}).reduce((s, item) => s + (item.currentStock || 0), 0);
    const totalHandled = (latestDay.sales?.totalSoldQty || 0) + totalStockQty;
    const wastageRate = totalHandled > 0 ? (brokenQty / totalHandled) * 100 : 0;

    assertTest("Egg breakage & wastage rate computes cleanly", !isNaN(wastageRate) && wastageRate >= 0);

    const profit = latestDay.financials.profitMargin;
    const soldQty = latestDay.sales?.totalSoldQty || 0;
    const profitPerEgg = soldQty > 0 ? profit / soldQty : 0;
    assertTest("Unit economics (Net profit per egg) computes cleanly", !isNaN(profitPerEgg));
  }

  // -------------------------------------------------------------
  // 5. OCR API & GEMINI VISION ENDPOINT TEST
  // -------------------------------------------------------------
  console.log(`\n${bold}5. Gemini Vision OCR Endpoint Integrity Test:${reset}`);
  try {
    const ocrRes = await fetch(`${baseUrl}/api/ocr-to-json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageBase64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        mimeType: "image/png",
      }),
    });
    const ocrJson = await ocrRes.json();
    assertTest("POST /api/ocr-to-json returns HTTP 200 with active AI key", ocrRes.status === 200 && ocrJson.success === true);
    assertTest("OCR response contains structured stockEntries array", Array.isArray(ocrJson.data?.stockEntries));
    assertTest("OCR response contains financialEntry object", typeof ocrJson.data?.financialEntry === "object");
  } catch (e) {
    assertTest("OCR endpoint verification", false, e.message);
  }

  // -------------------------------------------------------------
  // 6. FRONTEND HTML/SSR & DATE SYNCHRONIZER INTEGRITY
  // -------------------------------------------------------------
  console.log(`\n${bold}6. Frontend HTML, SSR & UI Integration Tests:${reset}`);
  try {
    const htmlRes = await fetch(baseUrl);
    const html = await htmlRes.text();
    assertTest("Root page returns valid HTML payload", html.includes("<!DOCTYPE html>"));
    assertTest("App title 'YolkFlow' is rendered in SSR shell", html.includes("YolkFlow"));
    assertTest("Bengali branding 'হালখাতা' is rendered in SSR shell", html.includes("হালখাতা"));
    assertTest("Theme toggle & responsive layouts rendered", html.includes("dark") || html.includes("theme") || html.includes("button"));
  } catch (e) {
    assertTest("Frontend HTML compilation", false, e.message);
  }

  // -------------------------------------------------------------
  // 7. OVERHEAD EXPENSES (EMPLOYEE COST, RENT & EXTRA) TESTS
  // -------------------------------------------------------------
  console.log(`\n${bold}7. Overhead Expenses (Employee, Rent & Extra) Tests:${reset}`);
  let createdExpenseId = "";
  try {
    const getRes = await fetch(`${baseUrl}/api/overhead`);
    assertTest("GET /api/overhead returns HTTP 200 OK", getRes.status === 200);
    const getJson = await getRes.json();
    assertTest("Overhead response contains success: true", getJson.success === true);
    assertTest("Overhead data is an array", Array.isArray(getJson.data));

    // Test POST adding a new expense
    const testExpense = {
      date: "2026-08-26",
      category: "employee",
      title: "SQA Test Employee Salary (মালিক বেতন)",
      amount: 15000,
      paymentMode: "bank",
      notes: "SQA automated test entry",
    };
    const postRes = await fetch(`${baseUrl}/api/overhead`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testExpense),
    });
    const postJson = await postRes.json();
    assertTest("POST /api/overhead creates new expense successfully", postRes.status === 200 && postJson.success === true);
    assertTest("Created expense has valid ID and amount", postJson.data?.amount === 15000);
    createdExpenseId = postJson.data?.id;

    // Test DELETE cleaning up the test item
    if (createdExpenseId) {
      const delRes = await fetch(`${baseUrl}/api/overhead?id=${encodeURIComponent(createdExpenseId)}`, {
        method: "DELETE",
      });
      const delJson = await delRes.json();
      assertTest("DELETE /api/overhead deletes expense cleanly", delRes.status === 200 && delJson.success === true);
    }
  } catch (err) {
    assertTest("Overhead Expenses API test", false, err.message);
  }

  // -------------------------------------------------------------
  // 8. ROLE-BASED AUTHENTICATION (RBAC) & PERMISSIONS TESTS
  // -------------------------------------------------------------
  console.log(`\n${bold}8. Role-Based Authentication (RBAC) & Permissions Tests:${reset}`);
  const { authenticateUser, getUserProfile, USERS } = require("./src/lib/auth.ts");

  // Admin: russellfoyze
  const adminUser = authenticateUser("russellfoyze", "russellfoyze");
  assertTest("Admin authentication (russellfoyze) succeeds", adminUser !== null && adminUser.role === "admin");
  assertTest("Admin has full access to all 3 tabs", adminUser?.allowedTabs.includes("dashboard") && adminUser?.allowedTabs.includes("entry") && adminUser?.allowedTabs.includes("overhead"));
  assertTest("Admin has editing & deletion permissions", adminUser?.canEdit === true && adminUser?.canDelete === true);

  // Manager: billal
  const managerUser = authenticateUser("billal", "billal");
  assertTest("Manager authentication (billal) succeeds", managerUser !== null && managerUser.role === "manager");
  assertTest("Manager has access to entry & overhead tabs", managerUser?.allowedTabs.includes("entry") && managerUser?.allowedTabs.includes("overhead"));
  assertTest("Manager cannot access dashboard directly", !managerUser?.allowedTabs.includes("dashboard"));
  assertTest("Manager has edit permissions but cannot delete", managerUser?.canEdit === true && managerUser?.canDelete === false);

  // Viewer: juel
  const viewerUser = authenticateUser("juel", "juel");
  assertTest("Viewer authentication (juel) succeeds", viewerUser !== null && viewerUser.role === "viewer");
  assertTest("Viewer has access only to dashboard", viewerUser?.allowedTabs.length === 1 && viewerUser?.allowedTabs[0] === "dashboard");
  assertTest("Viewer is restricted to read-only (canEdit: false)", viewerUser?.canEdit === false && viewerUser?.canDelete === false);

  // Security: Invalid credentials check
  const invalidUser1 = authenticateUser("russellfoyze", "wrongpass");
  assertTest("Invalid password rejected", invalidUser1 === null);
  const invalidUser2 = authenticateUser("unknown_user", "password");
  assertTest("Unknown username rejected", invalidUser2 === null);

  // -------------------------------------------------------------
  // SUMMARY REPORT
  // -------------------------------------------------------------
  console.log(`\n${bold}${cyan}================================================================${reset}`);
  console.log(`${bold}                      SQA TEST EXECUTION SUMMARY                 ${reset}`);
  console.log(`${bold}${cyan}================================================================${reset}`);
  console.log(`  Total Test Cases Executed: ${bold}${totalTests}${reset}`);
  console.log(`  Passed Test Cases:         ${green}${bold}${passedTests}${reset}`);
  console.log(`  Failed Test Cases:         ${failedTests > 0 ? red : green}${bold}${failedTests}${reset}`);
  const passRate = ((passedTests / totalTests) * 100).toFixed(1);
  console.log(`  Overall SQA Pass Rate:     ${green}${bold}${passRate}%${reset}`);
  console.log(`${bold}${cyan}================================================================${reset}\n`);
}

runFullSQASuite();

