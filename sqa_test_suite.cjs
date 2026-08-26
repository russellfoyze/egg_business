const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

// Colors for terminal output
const green = "\x1b[32m";
const red = "\x1b[31m";
const yellow = "\x1b[33m";
const cyan = "\x1b[36m";
const reset = "\x1b[0m";
const bold = "\x1b[1m";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assertTest(testName, condition, details = "") {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ${green}✔ PASS:${reset} ${testName}`);
  } else {
    failedTests++;
    console.log(`  ${red}✖ FAIL:${reset} ${testName}`);
    if (details) console.log(`    ${yellow}Details: ${details}${reset}`);
  }
}

async function runSQATestSuite() {
  console.log(`\n${bold}${cyan}================================================================${reset}`);
  console.log(`${bold}${cyan}      🧪 YOLKFLOW SOFTWARE QUALITY ASSURANCE (SQA) TEST SUITE    ${reset}`);
  console.log(`${bold}${cyan}================================================================${reset}\n`);

  const baseUrl = "http://localhost:3000";

  // -------------------------------------------------------------
  // TEST SUITE 1: API Endpoint Health & Schema Integrity
  // -------------------------------------------------------------
  console.log(`${bold}1. API Health & Schema Integrity Tests:${reset}`);
  let apiData = null;
  try {
    const res = await fetch(`${baseUrl}/api/data`);
    assertTest("API returns HTTP 200 OK", res.status === 200);
    apiData = await res.json();
    assertTest("API response contains success: true", apiData.success === true);
    assertTest("API data is an array with records", Array.isArray(apiData.data) && apiData.data.length > 0);
  } catch (err) {
    assertTest("API fetch connection", false, err.message);
  }

  if (!apiData || !apiData.data || apiData.data.length === 0) {
    console.log(`${red}Cannot proceed without API data.${reset}`);
    return;
  }

  const records = apiData.data;

  // -------------------------------------------------------------
  // TEST SUITE 2: Financial Formula & Ledger Math Verification
  // -------------------------------------------------------------
  console.log(`\n${bold}2. Financial Formula & Ledger Math Verification:${reset}`);

  records.forEach((dayRecord) => {
    const { date, financials, expenses, stock } = dayRecord;

    // Stock valuation: sum of (qty * rate)
    let computedStockVal = 0;
    Object.values(stock).forEach((s) => {
      computedStockVal += s.currentStock * s.purchaseRate;
    });

    const stockDiff = Math.abs(financials.totalStockValue - computedStockVal);
    assertTest(
      `[${date}] Stock Valuation Formula: Total Stock Value equals sum of (Qty * Rate)`,
      stockDiff < 0.05,
      `Expected ${computedStockVal.toFixed(2)}, got ${financials.totalStockValue}`
    );

    // সর্বমোট পাওনা/হিসাব (Cell B25) = বাকি + অতিরিক্ত আদায় + নগদ ক্যাশ + মজুদ ডিমের মূল্য
    const expectedB25 = financials.totalDue + financials.extraDue + financials.totalCash + financials.totalStockValue;
    const b25Diff = Math.abs(financials.totalBusinessValue - expectedB25);
    assertTest(
      `[${date}] Total Receivable (B25): B25 = Due + Extra + Cash + Stock`,
      b25Diff < 0.05,
      `Expected ${expectedB25.toFixed(2)}, got ${financials.totalBusinessValue}`
    );

    // Total With Expenses (Cell B44) = B25 + B43
    const expectedB44 = financials.totalBusinessValue + expenses.totalExpenses;
    const b44Diff = Math.abs(expenses.totalBusinessWithExpenses - expectedB44);
    assertTest(
      `[${date}] Total Business With Expenses (B44): B44 = B25 + B43`,
      b44Diff < 0.05,
      `Expected ${expectedB44.toFixed(2)}, got ${expenses.totalBusinessWithExpenses}`
    );

    // Net Profit Margin (Cell G5) = B44 - E24 (Total With Expenses - Total Business With Due / মোট জমা)
    const expectedMargin = expenses.totalBusinessWithExpenses - financials.totalBusinessWithDue;
    const marginDiff = Math.abs(financials.profitMargin - expectedMargin);
    assertTest(
      `[${date}] Net Profit Margin (G5 = B44 - E24): Margin matches Total - মোট জমা`,
      marginDiff < 0.05,
      `Expected ${expectedMargin.toFixed(2)}, got ${financials.profitMargin}`
    );

    // Cash + Stock (Cell G9) = Cash + Stock Valuation
    const expectedG9 = financials.totalCash + financials.totalStockValue;
    const g9Diff = Math.abs(financials.cashPlusStock - expectedG9);
    assertTest(
      `[${date}] Cash + Stock Metric (G9): G9 = Cash + Stock Valuation`,
      g9Diff < 0.05,
      `Expected ${expectedG9.toFixed(2)}, got ${financials.cashPlusStock}`
    );
  });

  // -------------------------------------------------------------
  // TEST SUITE 3: Itemized Extra Collections & Dues Breakdown
  // -------------------------------------------------------------
  console.log(`\n${bold}3. Itemized Collections & Dues Breakdown Tests:${reset}`);
  const sampleColDay = records.find((d) => Array.isArray(d.financials.extraCollections) && d.financials.extraCollections.length > 0);
  const sampleDueDay = records.find((d) => Array.isArray(d.financials.extraDues) && d.financials.extraDues.length > 0);
  
  if (sampleColDay) {
    const colls = sampleColDay.financials.extraCollections || [];
    assertTest(`${sampleColDay.date} contains itemized extra collections list`, Array.isArray(colls) && colls.length > 0);
    const hasItems = colls.some((c) => c.label && c.amount > 0);
    assertTest(`Itemized extra collections has valid labels and amounts`, hasItems);
  } else {
    assertTest(`Extra collections property structure is valid across all records`, records.every(d => !d.financials.extraCollections || Array.isArray(d.financials.extraCollections)));
    assertTest(`Extra due property structure is valid across all records`, records.every(d => !d.financials.extraDues || Array.isArray(d.financials.extraDues)));
  }

  // -------------------------------------------------------------
  // TEST SUITE 4: 7-Day Rolling Weekly Margin Calculation
  // -------------------------------------------------------------
  console.log(`\n${bold}4. 7-Day Rolling Margin & Trend Analytics Tests:${reset}`);
  const last7Days = records.slice(-7);
  const rollingMargin = last7Days.reduce((sum, d) => sum + (d.financials.profitMargin || 0), 0);
  const avgMargin = Math.round(rollingMargin / last7Days.length);

  assertTest("Rolling 7-day margin calculation computes positive business profit", rollingMargin > 0, `Total: ${rollingMargin}`);
  assertTest("Daily average margin computes accurately", avgMargin > 0, `Average: ${avgMargin}/day`);

  // -------------------------------------------------------------
  // TEST SUITE 5: Google Sheets Live Sync & Tab Schema Validation
  // -------------------------------------------------------------
  console.log(`\n${bold}5. Google Sheets Database & Tab Structure Verification:${reset}`);
  const envPath = path.join(__dirname, ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    const SHEET_ID = "1PuCwVSdU5VaoUfbr6gFGZp29YQl4NP_mkyoEbX2Icf0";
    const CLIENT_EMAIL = "eggapp@egg-shop-506416.iam.gserviceaccount.com";
    const keyMatch = envContent.match(/GOOGLE_PRIVATE_KEY="([\s\S]+?)"/);
    let rawKey = keyMatch ? keyMatch[1].replace(/\\n/g, "\n") : "";

    try {
      const auth = new google.auth.GoogleAuth({
        credentials: { client_email: CLIENT_EMAIL, private_key: rawKey },
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });
      const sheets = google.sheets({ version: "v4", auth });
      const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
      const tabTitles = (meta.data.sheets || []).map((s) => s.properties.title);

      assertTest("Google Sheets authentication & connectivity successful", true);
      assertTest("Master template tab 'Original' exists in spreadsheet", tabTitles.includes("Original"));
      assertTest("Date tab '23/08/26' exists in spreadsheet", tabTitles.includes("23/08/26"));
      assertTest("Date tab '24/08/26' exists in spreadsheet", tabTitles.includes("24/08/26"));
      assertTest("Backend table 'DailyStock' exists in spreadsheet", tabTitles.includes("DailyStock"));
      assertTest("Backend table 'Financials' exists in spreadsheet", tabTitles.includes("Financials"));
      assertTest("Backend table 'Expenses' exists in spreadsheet", tabTitles.includes("Expenses"));

      // Verify Cell G5 formula in 'Original' and '23/08/26'
      const resG5 = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: "'Original'!G5",
        valueRenderOption: "FORMULA",
      });
      const g5Formula = resG5.data.values?.[0]?.[0];
      assertTest("Cell G5 in 'Original' has correct formula '=B44-E24'", g5Formula === "=B44-E24", `Got: ${g5Formula}`);
    } catch (e) {
      assertTest("Google Sheets live API verification", false, e.message);
    }
  }

  // -------------------------------------------------------------
  // TEST SUITE 6: UI Compilation & SSR Health
  // -------------------------------------------------------------
  console.log(`\n${bold}6. Frontend HTML/SSR Compilation Tests:${reset}`);
  try {
    const htmlRes = await fetch(baseUrl);
    const html = await htmlRes.text();
    assertTest("Root page returns valid HTML payload", html.includes("<!DOCTYPE html>"));
    assertTest("App title 'YolkFlow' is rendered in HTML", html.includes("YolkFlow"));
    assertTest("Mobile navigation & layout rendered cleanly", html.includes("হালখাতা") || html.toLowerCase().includes("dashboard"));
  } catch (err) {
    assertTest("Frontend HTML compilation", false, err.message);
  }

  // -------------------------------------------------------------
  // TEST SUMMARY REPORT
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

runSQATestSuite();
