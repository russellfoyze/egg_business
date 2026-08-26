const fs = require("fs");
const path = require("path");

const db = JSON.parse(fs.readFileSync(path.join(__dirname, "mock_db.json"), "utf-8"));
console.log("2026-08-23 expenses:");
console.log(db.expenses.filter(e => e.date === "2026-08-23"));

console.log("\n2026-08-19 expenses:");
console.log(db.expenses.filter(e => e.date === "2026-08-19"));
