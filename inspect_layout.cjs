const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");

const SHEET_ID = "1PuCwVSdU5VaoUfbr6gFGZp29YQl4NP_mkyoEbX2Icf0";
const CLIENT_EMAIL = "eggapp@egg-shop-506416.iam.gserviceaccount.com";

const keyMatch = envContent.match(/GOOGLE_PRIVATE_KEY="([\s\S]+?)"/);
let rawKey = keyMatch ? keyMatch[1] : "";
rawKey = rawKey.replace(/\\n/g, "\n");

async function inspectLayout() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: CLIENT_EMAIL,
        private_key: rawKey,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "'23/08/26'!A1:H45",
    });

    console.log("CELL VALUES FOR '23/08/26':");
    const rows = res.data.values || [];
    rows.forEach((row, i) => {
      console.log(`Row ${i + 1}:`, JSON.stringify(row));
    });
  } catch (err) {
    console.error("Inspect Error:", err.message);
  }
}

inspectLayout();
