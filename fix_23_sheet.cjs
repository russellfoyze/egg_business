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

async function fixTab23() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: CLIENT_EMAIL,
        private_key: rawKey,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // Restore exact formula grid for 23/08/26
    const updates = [
      { range: "'23/08/26'!B1", values: [["তারিখ: 23/08/2026"]] },
      { range: "'23/08/26'!C1", values: [["রোজ: SUNDAY"]] },
      { range: "'23/08/26'!D1", values: [["পৃষ্ঠা: 96"]] },

      // Egg Stock: Inputs in B & C, Formulas in D
      { range: "'23/08/26'!B6:D6", values: [[1665, 10.9, "=B6*C6"]] },
      { range: "'23/08/26'!B7:D7", values: [[10241, 11.25, "=B7*C7"]] },
      { range: "'23/08/26'!B8:D8", values: [[25, 17, "=B8*C8"]] },
      { range: "'23/08/26'!B9:D9", values: [[73, 15, "=B9*C9"]] },
      { range: "'23/08/26'!B10:D10", values: [[90, 3, "=B10*C10"]] },
      { range: "'23/08/26'!B11:D11", values: [["", 8.5, "=B11*C11"]] },
      { range: "'23/08/26'!B12", values: [["=SUM(B6:B11)"]] },
      { range: "'23/08/26'!D12", values: [["=SUM(D6:D11)"]] },

      // Summary Box (Formulas)
      { range: "'23/08/26'!G5", values: [["=B44-E24"]] },
      { range: "'23/08/26'!G6", values: [["=B43"]] },
      { range: "'23/08/26'!G7", values: [["=B18"]] },
      { range: "'23/08/26'!G8", values: [["=D12"]] },
      { range: "'23/08/26'!G9", values: [["=G7+G8"]] },

      // Collection & Due
      { range: "'23/08/26'!A16:B21", values: [
        ["বাকি", 649391],
        ["", 350],
        ["নগদ (Cash)", 40260],
        ["", 250],
        ["", 1500],
        ["", 1200]
      ]},
      { range: "'23/08/26'!B22:B24", values: [[""], [""], [""]] },
      { range: "'23/08/26'!E16", values: [[859669]] },
      { range: "'23/08/26'!E24", values: [["=SUM(E16:E23)"]] },
      { range: "'23/08/26'!B25", values: [["=SUM(B16:B24)+D12"]] },

      // Expenses
      { range: "'23/08/26'!A29:B34", values: [
        ["নাস্তা-চা", 550],
        ["ট্রে-ফের", 120],
        ["রিকসা+ফকির", 120],
        ["ভাঙ্গা(20)", 430],
        ["MD ALI", 33000],
        ["koyel", 1500]
      ]},
      { range: "'23/08/26'!A35:B42", values: [
        ["", ""],
        ["", ""],
        ["", ""],
        ["", ""],
        ["", ""],
        ["", ""],
        ["", ""],
        ["", ""]
      ]},
      { range: "'23/08/26'!B43", values: [["=SUM(B29:B42)"]] },
      { range: "'23/08/26'!B44", values: [["=B43+B25"]] },
    ];

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: "USER_ENTERED",
        data: updates,
      },
    });

    console.log("SUCCESS! Restored formulas and values to tab '23/08/26'!");
  } catch (err) {
    console.error(err);
  }
}

fixTab23();
