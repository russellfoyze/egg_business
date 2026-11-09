# -*- coding: utf-8 -*-
"""
SVG Diagram Generator for YolkFlow Architecture and Logic Specification.
Generates 10 high-fidelity vector diagrams.
"""

def get_svg_defs():
    return """
    <defs>
      <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8" />
        <stop offset="100%" stop-color="#0284c7" />
      </linearGradient>
      <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#a855f7" />
        <stop offset="100%" stop-color="#6366f1" />
      </linearGradient>
      <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#34d399" />
        <stop offset="100%" stop-color="#059669" />
      </linearGradient>
      <linearGradient id="amberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fbbf24" />
        <stop offset="100%" stop-color="#d97706" />
      </linearGradient>
      <linearGradient id="roseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fb7185" />
        <stop offset="100%" stop-color="#e11d48" />
      </linearGradient>
      <linearGradient id="slateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#64748b" />
        <stop offset="100%" stop-color="#334155" />
      </linearGradient>
      <filter id="cardShadow" x="-5%" y="-5%" width="110%" height="115%" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0f172a" flood-opacity="0.08" />
      </filter>
      <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
      </marker>
      <marker id="arrowBlue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#0284c7" />
      </marker>
      <marker id="arrowPurple" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#6366f1" />
      </marker>
      <marker id="arrowGreen" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#059669" />
      </marker>
      <marker id="arrowAmber" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#d97706" />
      </marker>
    </defs>
    """

def diagram_1_architecture():
    return f"""
    <svg viewBox="0 0 960 560" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      {get_svg_defs()}
      <!-- Background Container -->
      <rect width="960" height="560" rx="16" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>

      <!-- TIER 1: CLIENT TIER -->
      <rect x="25" y="25" width="200" height="510" rx="12" fill="#f0f9ff" stroke="#bae6fd" stroke-width="1.5" />
      <rect x="25" y="25" width="200" height="42" rx="12" fill="url(#blueGrad)" />
      <text x="125" y="52" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">CLIENT TIER (BROWSER)</text>
      
      <!-- Client Components -->
      <g transform="translate(40, 85)">
        <rect width="170" height="48" rx="8" fill="#ffffff" stroke="#7dd3fc" filter="url(#cardShadow)"/>
        <text x="85" y="22" font-size="12" font-weight="700" fill="#0369a1" text-anchor="middle">YolkFlowClient.tsx</text>
        <text x="85" y="38" font-size="10" fill="#64748b" text-anchor="middle">Master React Controller</text>
      </g>
      <g transform="translate(40, 145)">
        <rect width="170" height="42" rx="8" fill="#ffffff" stroke="#cbd5e1" filter="url(#cardShadow)"/>
        <text x="85" y="19" font-size="11" font-weight="600" fill="#1e293b" text-anchor="middle">LoginScreen.tsx</text>
        <text x="85" y="33" font-size="9" fill="#64748b" text-anchor="middle">RBAC Gate &amp; Demo Logins</text>
      </g>
      <g transform="translate(40, 200)">
        <rect width="170" height="42" rx="8" fill="#ffffff" stroke="#cbd5e1" filter="url(#cardShadow)"/>
        <text x="85" y="19" font-size="11" font-weight="600" fill="#1e293b" text-anchor="middle">OverheadExpensesView.tsx</text>
        <text x="85" y="33" font-size="9" fill="#64748b" text-anchor="middle">11 Fund Categories &amp; Bills</text>
      </g>
      <g transform="translate(40, 255)">
        <rect width="170" height="42" rx="8" fill="#ffffff" stroke="#cbd5e1" filter="url(#cardShadow)"/>
        <text x="85" y="19" font-size="11" font-weight="600" fill="#1e293b" text-anchor="middle">SavingsTrackerView.tsx</text>
        <text x="85" y="33" font-size="9" fill="#64748b" text-anchor="middle">Reserve, Crates &amp; Extra Inc.</text>
      </g>
      <g transform="translate(40, 310)">
        <rect width="170" height="42" rx="8" fill="#ffffff" stroke="#cbd5e1" filter="url(#cardShadow)"/>
        <text x="85" y="19" font-size="11" font-weight="600" fill="#1e293b" text-anchor="middle">ImageToJsonModal.tsx</text>
        <text x="85" y="33" font-size="9" fill="#64748b" text-anchor="middle">Gemini Vision OCR Ingestion</text>
      </g>
      <g transform="translate(40, 365)">
        <rect width="170" height="42" rx="8" fill="#ffffff" stroke="#cbd5e1" filter="url(#cardShadow)"/>
        <text x="85" y="19" font-size="11" font-weight="600" fill="#1e293b" text-anchor="middle">DateTimePicker.tsx</text>
        <text x="85" y="33" font-size="9" fill="#64748b" text-anchor="middle">Bengali Calendar &amp; Range</text>
      </g>
      <g transform="translate(40, 420)">
        <rect width="170" height="48" rx="8" fill="#e0f2fe" stroke="#38bdf8" />
        <text x="85" y="20" font-size="11" font-weight="700" fill="#0284c7" text-anchor="middle">Browser LocalStorage</text>
        <text x="85" y="36" font-size="9" fill="#0369a1" text-anchor="middle">User Auth, Overhead, Keys</text>
      </g>

      <!-- TIER 2: SERVER & API TIER -->
      <rect x="265" y="25" width="220" height="510" rx="12" fill="#faf5ff" stroke="#e9d5ff" stroke-width="1.5" />
      <rect x="265" y="25" width="220" height="42" rx="12" fill="url(#purpleGrad)" />
      <text x="375" y="52" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">NEXT.JS SERVER / API</text>

      <!-- Server Actions -->
      <g transform="translate(280, 85)">
        <rect width="190" height="65" rx="8" fill="#ffffff" stroke="#c084fc" filter="url(#cardShadow)"/>
        <text x="95" y="20" font-size="12" font-weight="700" fill="#7e22ce" text-anchor="middle">Server Actions (actions.ts)</text>
        <text x="95" y="37" font-size="10" fill="#475569" text-anchor="middle">fetchLedgerDataAction()</text>
        <text x="95" y="52" font-size="10" fill="#475569" text-anchor="middle">saveLedgerEntryAction() + revalidate</text>
      </g>

      <!-- Route Handlers -->
      <g transform="translate(280, 165)">
        <rect width="190" height="52" rx="8" fill="#ffffff" stroke="#cbd5e1" filter="url(#cardShadow)"/>
        <text x="95" y="20" font-size="11" font-weight="700" fill="#1e293b" text-anchor="middle">GET /api/data</text>
        <text x="95" y="38" font-size="10" fill="#64748b" text-anchor="middle">Stream Live Hal-Khata Data</text>
      </g>
      <g transform="translate(280, 230)">
        <rect width="190" height="60" rx="8" fill="#ffffff" stroke="#cbd5e1" filter="url(#cardShadow)"/>
        <text x="95" y="19" font-size="11" font-weight="700" fill="#1e293b" text-anchor="middle">/api/overhead</text>
        <text x="95" y="35" font-size="9" fill="#64748b" text-anchor="middle">GET (Items, Latest Cash)</text>
        <text x="95" y="49" font-size="9" fill="#64748b" text-anchor="middle">POST (Add Expense) | DELETE</text>
      </g>
      <g transform="translate(280, 305)">
        <rect width="190" height="60" rx="8" fill="#ffffff" stroke="#cbd5e1" filter="url(#cardShadow)"/>
        <text x="95" y="19" font-size="11" font-weight="700" fill="#1e293b" text-anchor="middle">/api/savings</text>
        <text x="95" y="35" font-size="9" fill="#64748b" text-anchor="middle">GET (Deposits, Extra, Withdraw)</text>
        <text x="95" y="49" font-size="9" fill="#64748b" text-anchor="middle">POST (Add Record) | DELETE</text>
      </g>
      <g transform="translate(280, 380)">
        <rect width="190" height="65" rx="8" fill="#ffffff" stroke="#f59e0b" filter="url(#cardShadow)"/>
        <text x="95" y="19" font-size="11" font-weight="700" fill="#b45309" text-anchor="middle">POST /api/ocr-to-json</text>
        <text x="95" y="35" font-size="9" fill="#475569" text-anchor="middle">Bengali Hal-Khata Prompt</text>
        <text x="95" y="50" font-size="9" fill="#b45309" text-anchor="middle">Model Cascade Fallback</text>
      </g>

      <!-- TIER 3: BUSINESS LOGIC & SERVICES -->
      <rect x="525" y="25" width="200" height="510" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" />
      <rect x="525" y="25" width="200" height="42" rx="12" fill="url(#slateGrad)" />
      <text x="625" y="52" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">CORE LOGIC &amp; SERVICES</text>

      <g transform="translate(540, 85)">
        <rect width="170" height="90" rx="8" fill="#ffffff" stroke="#64748b" filter="url(#cardShadow)"/>
        <text x="85" y="20" font-size="12" font-weight="700" fill="#0f172a" text-anchor="middle">ledger.ts</text>
        <text x="85" y="38" font-size="10" fill="#475569" text-anchor="middle">Stock Sold Math &amp; Valuation</text>
        <text x="85" y="53" font-size="10" fill="#475569" text-anchor="middle">B25, E24, B43, B44 Formulas</text>
        <text x="85" y="68" font-size="10" fill="#059669" font-weight="600" text-anchor="middle">Profit Margin (G5) Calculation</text>
        <text x="85" y="83" font-size="9" fill="#64748b" text-anchor="middle">Daily Sales Derivation</text>
      </g>
      <g transform="translate(540, 190)">
        <rect width="170" height="75" rx="8" fill="#ffffff" stroke="#64748b" filter="url(#cardShadow)"/>
        <text x="85" y="20" font-size="12" font-weight="700" fill="#0f172a" text-anchor="middle">auth.ts</text>
        <text x="85" y="38" font-size="10" fill="#475569" text-anchor="middle">Role-Based Access Control</text>
        <text x="85" y="53" font-size="9" fill="#64748b" text-anchor="middle">Admin, Manager, Viewer</text>
        <text x="85" y="68" font-size="9" fill="#64748b" text-anchor="middle">Allowed Tabs &amp; Action Rights</text>
      </g>
      <g transform="translate(540, 280)">
        <rect width="170" height="75" rx="8" fill="#ffffff" stroke="#64748b" filter="url(#cardShadow)"/>
        <text x="85" y="20" font-size="12" font-weight="700" fill="#0f172a" text-anchor="middle">db.ts</text>
        <text x="85" y="38" font-size="10" fill="#475569" text-anchor="middle">Hybrid DB Abstraction Layer</text>
        <text x="85" y="53" font-size="9" fill="#64748b" text-anchor="middle">Config Check &amp; Fallback</text>
        <text x="85" y="68" font-size="9" fill="#64748b" text-anchor="middle">Atomic Local Cache Sync</text>
      </g>
      <g transform="translate(540, 370)">
        <rect width="170" height="95" rx="8" fill="#ffffff" stroke="#059669" filter="url(#cardShadow)"/>
        <text x="85" y="20" font-size="12" font-weight="700" fill="#065f46" text-anchor="middle">googleSheets.ts</text>
        <text x="85" y="38" font-size="10" fill="#475569" text-anchor="middle">Google Sheets API v4</text>
        <text x="85" y="53" font-size="9" fill="#475569" text-anchor="middle">Service Account OAuth2</text>
        <text x="85" y="68" font-size="9" fill="#475569" text-anchor="middle">Daily Tab Duplication (DD/MM/YY)</text>
        <text x="85" y="83" font-size="9" fill="#059669" font-weight="600" text-anchor="middle">Native Formula Injection</text>
      </g>

      <!-- TIER 4: PERSISTENCE & EXTERNAL SERVICES -->
      <rect x="765" y="25" width="170" height="510" rx="12" fill="#ecfdf5" stroke="#a7f3d0" stroke-width="1.5" />
      <rect x="765" y="25" width="170" height="42" rx="12" fill="url(#greenGrad)" />
      <text x="850" y="52" fill="#ffffff" font-size="13" font-weight="700" text-anchor="middle">PERSISTENCE &amp; CLOUD</text>

      <g transform="translate(780, 85)">
        <rect width="140" height="110" rx="8" fill="#ffffff" stroke="#10b981" filter="url(#cardShadow)"/>
        <text x="70" y="20" font-size="11" font-weight="700" fill="#065f46" text-anchor="middle">Google Spreadsheet</text>
        <text x="70" y="36" font-size="9" fill="#047857" text-anchor="middle">• DailyStock</text>
        <text x="70" y="50" font-size="9" fill="#047857" text-anchor="middle">• Financials</text>
        <text x="70" y="64" font-size="9" fill="#047857" text-anchor="middle">• Expenses</text>
        <text x="70" y="78" font-size="9" fill="#047857" text-anchor="middle">• OverheadExpenses</text>
        <text x="70" y="92" font-size="9" fill="#047857" text-anchor="middle">• SavingsAndExtras</text>
        <text x="70" y="104" font-size="9" fill="#059669" font-weight="700" text-anchor="middle">• DD/MM/YY Tabs</text>
      </g>

      <g transform="translate(780, 215)">
        <rect width="140" height="85" rx="8" fill="#ffffff" stroke="#64748b" filter="url(#cardShadow)"/>
        <text x="70" y="20" font-size="11" font-weight="700" fill="#334155" text-anchor="middle">Local Mock Database</text>
        <text x="70" y="38" font-size="10" font-weight="600" fill="#0f172a" text-anchor="middle">mock_db.json</text>
        <text x="70" y="54" font-size="9" fill="#64748b" text-anchor="middle">Instant Local Fallback</text>
        <text x="70" y="68" font-size="9" fill="#64748b" text-anchor="middle">Zero Cloud Dependency</text>
      </g>

      <g transform="translate(780, 325)">
        <rect width="140" height="95" rx="8" fill="#ffffff" stroke="#f59e0b" filter="url(#cardShadow)"/>
        <text x="70" y="20" font-size="11" font-weight="700" fill="#b45309" text-anchor="middle">Google Gemini API</text>
        <text x="70" y="38" font-size="9" fill="#78350f" text-anchor="middle">gemini-3.6-flash</text>
        <text x="70" y="52" font-size="9" fill="#78350f" text-anchor="middle">gemini-3.5-flash</text>
        <text x="70" y="66" font-size="9" fill="#78350f" text-anchor="middle">gemini-flash-latest</text>
        <text x="70" y="80" font-size="9" fill="#78350f" text-anchor="middle">gemini-3.1-flash-lite</text>
      </g>

      <!-- Connecting Flow Lines -->
      <path d="M 225 110 L 280 110" stroke="#0284c7" stroke-width="2" marker-end="url(#arrowBlue)" />
      <path d="M 225 190 L 280 190" stroke="#6366f1" stroke-width="2" marker-end="url(#arrowPurple)" />
      <path d="M 225 255 L 280 255" stroke="#6366f1" stroke-width="2" marker-end="url(#arrowPurple)" />
      <path d="M 225 335 L 280 335" stroke="#6366f1" stroke-width="2" marker-end="url(#arrowPurple)" />
      <path d="M 225 410 L 280 410" stroke="#d97706" stroke-width="2" marker-end="url(#arrowAmber)" />

      <path d="M 470 120 L 540 120" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)" />
      <path d="M 470 255 L 540 400" stroke="#059669" stroke-width="2" marker-end="url(#arrowGreen)" />
      <path d="M 470 410 L 780 370" stroke="#d97706" stroke-width="2" marker-end="url(#arrowAmber)" />

      <path d="M 710 320 L 780 260" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)" />
      <path d="M 710 410 L 780 140" stroke="#059669" stroke-width="2" marker-end="url(#arrowGreen)" />
    </svg>
    """

def diagram_2_components():
    return f"""
    <svg viewBox="0 0 960 520" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      {get_svg_defs()}
      <rect width="960" height="520" rx="16" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>

      <!-- Root App Node -->
      <g transform="translate(380, 20)">
        <rect width="200" height="50" rx="10" fill="url(#purpleGrad)" filter="url(#cardShadow)"/>
        <text x="100" y="24" font-size="13" font-weight="700" fill="#ffffff" text-anchor="middle">Root: layout.tsx &amp; page.tsx</text>
        <text x="100" y="40" font-size="10" fill="#e0e7ff" text-anchor="middle">SSR Initial Data Fetch</text>
      </g>

      <!-- Main Client Container -->
      <g transform="translate(350, 95)">
        <rect width="260" height="65" rx="12" fill="url(#blueGrad)" filter="url(#cardShadow)"/>
        <text x="130" y="26" font-size="15" font-weight="800" fill="#ffffff" text-anchor="middle">YolkFlowClient.tsx</text>
        <text x="130" y="44" font-size="11" fill="#e0f2fe" text-anchor="middle">State: activeTab, user, ledgerData, date</text>
        <text x="130" y="58" font-size="9" fill="#bae6fd" text-anchor="middle">Context: theme, syncStatus, permissions</text>
      </g>

      <!-- Branching lines from Root to Main -->
      <path d="M 480 70 L 480 95" stroke="#6366f1" stroke-width="2" marker-end="url(#arrowPurple)" />

      <!-- Supporting Global Modals & Controls -->
      <g transform="translate(50, 110)">
        <rect width="180" height="42" rx="8" fill="#ffffff" stroke="#cbd5e1" filter="url(#cardShadow)"/>
        <text x="90" y="18" font-size="11" font-weight="700" fill="#1e293b" text-anchor="middle">LoginScreen.tsx</text>
        <text x="90" y="32" font-size="9" fill="#64748b" text-anchor="middle">Auth Guard &amp; Session Init</text>
      </g>
      <path d="M 350 125 L 230 125" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4,4" marker-end="url(#arrow)" />

      <g transform="translate(730, 100)">
        <rect width="180" height="42" rx="8" fill="#ffffff" stroke="#cbd5e1" filter="url(#cardShadow)"/>
        <text x="90" y="18" font-size="11" font-weight="700" fill="#1e293b" text-anchor="middle">ImageToJsonModal.tsx</text>
        <text x="90" y="32" font-size="9" fill="#64748b" text-anchor="middle">AI Vision OCR Modal / Scanner</text>
      </g>
      <path d="M 610 125 L 730 121" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4,4" marker-end="url(#arrow)" />

      <g transform="translate(730, 155)">
        <rect width="180" height="42" rx="8" fill="#ffffff" stroke="#cbd5e1" filter="url(#cardShadow)"/>
        <text x="90" y="18" font-size="11" font-weight="700" fill="#1e293b" text-anchor="middle">DateTimePicker.tsx</text>
        <text x="90" y="32" font-size="9" fill="#64748b" text-anchor="middle">Bangla Presets &amp; Date Range</text>
      </g>
      <path d="M 610 145 L 730 170" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4,4" marker-end="url(#arrow)" />

      <!-- THREE PRIMARY VIEWS (TABS) -->
      <!-- TAB 1: DASHBOARD -->
      <g transform="translate(30, 205)">
        <rect width="280" height="295" rx="12" fill="#ffffff" stroke="#38bdf8" stroke-width="2" filter="url(#cardShadow)"/>
        <rect width="280" height="34" rx="10" fill="#e0f2fe" />
        <text x="140" y="22" font-size="13" font-weight="800" fill="#0369a1" text-anchor="middle">TAB 1: DASHBOARD VIEW</text>
        
        <g transform="translate(15, 45)">
          <rect width="250" height="32" rx="6" fill="#f8fafc" stroke="#e2e8f0"/>
          <text x="125" y="20" font-size="10" font-weight="600" fill="#334155" text-anchor="middle">KPI Cards: Sales, Margin, Stock, Cash, Dues</text>
        </g>
        <g transform="translate(15, 85)">
          <rect width="250" height="32" rx="6" fill="#f8fafc" stroke="#e2e8f0"/>
          <text x="125" y="20" font-size="10" font-weight="600" fill="#334155" text-anchor="middle">Sales vs Margin Dual-Axis Spline Chart</text>
        </g>
        <g transform="translate(15, 125)">
          <rect width="250" height="32" rx="6" fill="#f8fafc" stroke="#e2e8f0"/>
          <text x="125" y="20" font-size="10" font-weight="600" fill="#334155" text-anchor="middle">Per-Item Egg Sales Donut/Pie Visualizer</text>
        </g>
        <g transform="translate(15, 165)">
          <rect width="250" height="32" rx="6" fill="#f8fafc" stroke="#e2e8f0"/>
          <text x="125" y="20" font-size="10" font-weight="600" fill="#334155" text-anchor="middle">Egg Purchase Rate Trends (0.5 Step Grid)</text>
        </g>
        <g transform="translate(15, 205)">
          <rect width="250" height="32" rx="6" fill="#f8fafc" stroke="#e2e8f0"/>
          <text x="125" y="20" font-size="10" font-weight="600" fill="#334155" text-anchor="middle">Breakage &amp; Waste Analytics (Day/Wk/Mo)</text>
        </g>
        <g transform="translate(15, 245)">
          <rect width="250" height="36" rx="6" fill="#f8fafc" stroke="#e2e8f0"/>
          <text x="125" y="17" font-size="10" font-weight="600" fill="#334155" text-anchor="middle">Historical Hal-Khata Ledger Table</text>
          <text x="125" y="30" font-size="8" fill="#64748b" text-anchor="middle">Sort, Filter, Auto-scroll to Latest</text>
        </g>
      </g>

      <!-- TAB 2: DAILY ENTRY -->
      <g transform="translate(340, 205)">
        <rect width="280" height="295" rx="12" fill="#ffffff" stroke="#a855f7" stroke-width="2" filter="url(#cardShadow)"/>
        <rect width="280" height="34" rx="10" fill="#f3e8ff" />
        <text x="140" y="22" font-size="13" font-weight="800" fill="#6b21a8" text-anchor="middle">TAB 2: DAILY ENTRY (হালখাতা)</text>
        
        <g transform="translate(15, 45)">
          <rect width="250" height="38" rx="6" fill="#faf5ff" stroke="#e9d5ff"/>
          <text x="125" y="16" font-size="10" font-weight="700" fill="#7e22ce" text-anchor="middle">Section 1: মজুদ ডিমের হিসাব</text>
          <text x="125" y="30" font-size="8" fill="#64748b" text-anchor="middle">6 Egg Types, Rates, Purchases (Cell D12)</text>
        </g>
        <g transform="translate(15, 90)">
          <rect width="250" height="38" rx="6" fill="#faf5ff" stroke="#e9d5ff"/>
          <text x="125" y="16" font-size="10" font-weight="700" fill="#7e22ce" text-anchor="middle">Section 2: খাত / পাওনা আদায়</text>
          <text x="125" y="30" font-size="8" fill="#64748b" text-anchor="middle">বাকি, নগদ ক্যাশ, ডায়নামিক অতিরিক্ত আদায়</text>
        </g>
        <g transform="translate(15, 135)">
          <rect width="250" height="38" rx="6" fill="#faf5ff" stroke="#e9d5ff"/>
          <text x="125" y="16" font-size="10" font-weight="700" fill="#7e22ce" text-anchor="middle">Section 3: দেনা ও সাবেক হিসাব</text>
          <text x="125" y="30" font-size="8" fill="#64748b" text-anchor="middle">সাবেক ব্যালেন্স, মহাজন বাকি, বিবিধ দেনা</text>
        </g>
        <g transform="translate(15, 180)">
          <rect width="250" height="38" rx="6" fill="#faf5ff" stroke="#e9d5ff"/>
          <text x="125" y="16" font-size="10" font-weight="700" fill="#7e22ce" text-anchor="middle">Section 4: দৈনিক খরচের খাত</text>
          <text x="125" y="30" font-size="8" fill="#64748b" text-anchor="middle">14 Rows: নাস্তা, গাড়ি, সমিতি, ভাঙ্গা, নিজ</text>
        </g>
        <g transform="translate(15, 225)">
          <rect width="250" height="56" rx="6" fill="#ecfdf5" stroke="#10b981"/>
          <text x="125" y="18" font-size="10" font-weight="700" fill="#065f46" text-anchor="middle">Live Verification Card</text>
          <text x="125" y="33" font-size="9" fill="#047857" text-anchor="middle">B25 (পাওনা) | E24 (জমা) | B44 (মোট)</text>
          <text x="125" y="47" font-size="9" font-weight="700" fill="#059669" text-anchor="middle">G5 নিট মার্জিন &amp; G9 ক্যাশ+মজুদ</text>
        </g>
      </g>

      <!-- TAB 3: OVERHEAD & SAVINGS -->
      <g transform="translate(650, 205)">
        <rect width="280" height="295" rx="12" fill="#ffffff" stroke="#10b981" stroke-width="2" filter="url(#cardShadow)"/>
        <rect width="280" height="34" rx="10" fill="#d1fae5" />
        <text x="140" y="22" font-size="13" font-weight="800" fill="#065f46" text-anchor="middle">TAB 3: OVERHEAD &amp; SAVINGS</text>
        
        <g transform="translate(15, 45)">
          <rect width="250" height="35" rx="6" fill="#f0fdf4" stroke="#bbf7d0"/>
          <text x="125" y="16" font-size="10" font-weight="700" fill="#065f46" text-anchor="middle">11 Overhead Categories</text>
          <text x="125" y="29" font-size="8" fill="#64748b" text-anchor="middle">Rent, Salary, Utilities, Tax, Guard, Fuel</text>
        </g>
        <g transform="translate(15, 87)">
          <rect width="250" height="38" rx="6" fill="#f0fdf4" stroke="#bbf7d0"/>
          <text x="125" y="16" font-size="10" font-weight="700" fill="#065f46" text-anchor="middle">Fund Systems &amp; Deductions</text>
          <text x="125" y="30" font-size="8" fill="#64748b" text-anchor="middle">🏪 দোকানে সঞ্চয় &amp; 🏦 ব্যাংক সঞ্চয়</text>
        </g>
        <g transform="translate(15, 132)">
          <rect width="250" height="38" rx="6" fill="#f0fdf4" stroke="#bbf7d0"/>
          <text x="125" y="16" font-size="10" font-weight="700" fill="#065f46" text-anchor="middle">Auto-Sync from Daily Ledger</text>
          <text x="125" y="30" font-size="8" fill="#64748b" text-anchor="middle">Auto-fetches "সমিতি" from Daily Expenses</text>
        </g>
        <g transform="translate(15, 177)">
          <rect width="250" height="38" rx="6" fill="#f0fdf4" stroke="#bbf7d0"/>
          <text x="125" y="16" font-size="10" font-weight="700" fill="#065f46" text-anchor="middle">Personal Expenses ("নিজ")</text>
          <text x="125" y="30" font-size="8" fill="#64748b" text-anchor="middle">Owner Personal Drawings Summary</text>
        </g>
        <g transform="translate(15, 222)">
          <rect width="250" height="58" rx="6" fill="#fef3c7" stroke="#f59e0b"/>
          <text x="125" y="18" font-size="10" font-weight="700" fill="#92400e" text-anchor="middle">Cash-in-Hand Reconciliation</text>
          <text x="125" y="34" font-size="9" fill="#78350f" text-anchor="middle">Latest Shop Cash (Financials)</text>
          <text x="125" y="48" font-size="9" font-weight="700" fill="#b45309" text-anchor="middle">Net Liquidity Calculation</text>
        </g>
      </g>

      <!-- Routing connectors from YolkFlowClient to 3 tabs -->
      <path d="M 400 160 L 170 205" stroke="#0284c7" stroke-width="2" marker-end="url(#arrowBlue)" />
      <path d="M 480 160 L 480 205" stroke="#7e22ce" stroke-width="2" marker-end="url(#arrowPurple)" />
      <path d="M 560 160 L 790 205" stroke="#059669" stroke-width="2" marker-end="url(#arrowGreen)" />
    </svg>
    """

def diagram_3_persistence():
    return f"""
    <svg viewBox="0 0 960 520" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      {get_svg_defs()}
      <rect width="960" height="520" rx="16" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>

      <!-- Title / Header Box -->
      <rect x="25" y="20" width="910" height="42" rx="10" fill="url(#purpleGrad)" />
      <text x="480" y="47" fill="#ffffff" font-size="15" font-weight="800" text-anchor="middle">DUAL-LAYER PERSISTENCE &amp; CLOUD SYNCHRONIZATION PIPELINE</text>

      <!-- READ PATH (LEFT COLUMN) -->
      <rect x="30" y="80" width="430" height="415" rx="12" fill="#ffffff" stroke="#38bdf8" stroke-width="1.5" filter="url(#cardShadow)"/>
      <rect x="30" y="80" width="430" height="34" rx="10" fill="#e0f2fe" />
      <text x="245" y="103" font-size="13" font-weight="700" fill="#0369a1" text-anchor="middle">DATA READ PIPELINE (getDatabaseData / fetchLedgerData)</text>

      <g transform="translate(50, 130)">
        <rect width="390" height="45" rx="8" fill="#f0f9ff" stroke="#7dd3fc"/>
        <text x="195" y="22" font-size="11" font-weight="700" fill="#0369a1" text-anchor="middle">1. Environment Credentials Check</text>
        <text x="195" y="37" font-size="10" fill="#64748b" text-anchor="middle">isGoogleSheetsConfigured() -> Checks ID, Email &amp; Private Key</text>
      </g>

      <!-- Decision Diamond (Simulated with Path) -->
      <g transform="translate(185, 195)">
        <polygon points="60,0 120,30 60,60 0,30" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5" />
        <text x="60" y="34" font-size="10" font-weight="700" fill="#854d0e" text-anchor="middle">Sheets Configured?</text>
      </g>

      <path d="M 245 175 L 245 195" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrow)" />

      <!-- Branch: YES -> Read Google Sheets -->
      <g transform="translate(50, 280)">
        <rect width="180" height="85" rx="8" fill="#ecfdf5" stroke="#34d399"/>
        <text x="90" y="20" font-size="11" font-weight="700" fill="#065f46" text-anchor="middle">YES: Read Cloud Sheets</text>
        <text x="90" y="38" font-size="9" fill="#047857" text-anchor="middle">Promise.all([</text>
        <text x="90" y="52" font-size="9" fill="#047857" text-anchor="middle">readSheetValues("DailyStock"),</text>
        <text x="90" y="66" font-size="9" fill="#047857" text-anchor="middle">readSheetValues("Financials"),</text>
        <text x="90" y="80" font-size="9" fill="#047857" text-anchor="middle">readSheetValues("Expenses")])</text>
      </g>
      <path d="M 205 240 L 140 280" stroke="#059669" stroke-width="1.5" marker-end="url(#arrowGreen)" />
      <text x="155" y="250" font-size="10" font-weight="700" fill="#059669">YES</text>

      <!-- Branch: NO -> Read Local Mock DB -->
      <g transform="translate(260, 280)">
        <rect width="180" height="85" rx="8" fill="#fef2f2" stroke="#f87171"/>
        <text x="90" y="20" font-size="11" font-weight="700" fill="#991b1b" text-anchor="middle">NO / ERROR: Local Mock</text>
        <text x="90" y="38" font-size="9" fill="#7f1d1d" text-anchor="middle">readLocalMockDb()</text>
        <text x="90" y="54" font-size="9" fill="#7f1d1d" text-anchor="middle">Reads mock_db.json</text>
        <text x="90" y="70" font-size="9" fill="#7f1d1d" text-anchor="middle">Zero Latency / Offline</text>
      </g>
      <path d="M 285 240 L 350 280" stroke="#dc2626" stroke-width="1.5" marker-end="url(#arrow)" />
      <text x="310" y="250" font-size="10" font-weight="700" fill="#dc2626">NO / FAIL</text>

      <!-- Merge / Hydrate Box -->
      <g transform="translate(50, 390)">
        <rect width="390" height="75" rx="8" fill="#f8fafc" stroke="#64748b"/>
        <text x="195" y="20" font-size="11" font-weight="700" fill="#0f172a" text-anchor="middle">2. Data Merging &amp; Computation (ledger.ts)</text>
        <text x="195" y="36" font-size="9" fill="#475569" text-anchor="middle">• Merges ExtraCollections &amp; ExtraDues rich JSON from local DB cache</text>
        <text x="195" y="50" font-size="9" fill="#475569" text-anchor="middle">• Computes Sold Quantities, COGS, Daily Margin, Sales Turnover</text>
        <text x="195" y="65" font-size="9" font-weight="700" fill="#0284c7" text-anchor="middle">-> Returns ComputedDayData[] to Client</text>
      </g>
      <path d="M 140 365 L 140 390" stroke="#059669" stroke-width="1.5" marker-end="url(#arrowGreen)" />
      <path d="M 350 365 L 350 390" stroke="#dc2626" stroke-width="1.5" marker-end="url(#arrow)" />

      <!-- WRITE PATH (RIGHT COLUMN) -->
      <rect x="500" y="80" width="430" height="415" rx="12" fill="#ffffff" stroke="#10b981" stroke-width="1.5" filter="url(#cardShadow)"/>
      <rect x="500" y="80" width="430" height="34" rx="10" fill="#d1fae5" />
      <text x="715" y="103" font-size="13" font-weight="700" fill="#065f46" text-anchor="middle">DATA WRITE &amp; COMMIT PIPELINE (saveLedgerEntry)</text>

      <g transform="translate(520, 130)">
        <rect width="390" height="45" rx="8" fill="#ecfdf5" stroke="#34d399"/>
        <text x="195" y="20" font-size="11" font-weight="700" fill="#065f46" text-anchor="middle">1. Payload Preparation &amp; Local Cache Sync</text>
        <text x="195" y="35" font-size="9" fill="#047857" text-anchor="middle">writeLocalMockDb() updates mock_db.json first (Fault Tolerance)</text>
      </g>

      <g transform="translate(520, 195)">
        <rect width="390" height="135" rx="8" fill="#f0fdf4" stroke="#10b981"/>
        <text x="195" y="20" font-size="11" font-weight="700" fill="#065f46" text-anchor="middle">2. Parallel Google Sheets Cloud Master Sync</text>
        <text x="195" y="38" font-size="9" fill="#047857" text-anchor="middle">Promise.all([</text>
        <text x="195" y="53" font-size="9" fill="#047857" text-anchor="middle">updateSheetValues("DailyStock", stockSheetData),</text>
        <text x="195" y="68" font-size="9" fill="#047857" text-anchor="middle">updateSheetValues("Financials", financialsSheetData),</text>
        <text x="195" y="83" font-size="9" fill="#047857" text-anchor="middle">updateSheetValues("Expenses", expensesSheetData),</text>
        <text x="195" y="98" font-size="9" font-weight="700" fill="#059669" text-anchor="middle">createOrUpdateDayTab(date, day, pageNo, ...)</text>
        <text x="195" y="113" font-size="9" fill="#047857" text-anchor="middle">])</text>
        <text x="195" y="128" font-size="8" fill="#0f766e" text-anchor="middle">Atomic Clear &amp; Rewrite from A1 with Updated Rows</text>
      </g>
      <path d="M 715 175 L 715 195" stroke="#059669" stroke-width="1.5" marker-end="url(#arrowGreen)" />

      <g transform="translate(520, 350)">
        <rect width="390" height="115" rx="8" fill="#f8fafc" stroke="#0284c7"/>
        <text x="195" y="20" font-size="11" font-weight="700" fill="#0369a1" text-anchor="middle">3. Day Tab Cloner &amp; Native Formulas (DD/MM/YY)</text>
        <text x="195" y="38" font-size="9" fill="#334155" text-anchor="middle">• Checks if tab "DD/MM/YY" exists; If not, copies "Original" template</text>
        <text x="195" y="53" font-size="9" fill="#334155" text-anchor="middle">• Injects Header (B1, C1, D1) with Bengali Date, Day &amp; Page No</text>
        <text x="195" y="68" font-size="9" fill="#334155" text-anchor="middle">• Writes native formulas: =B6*C6, =SUM(B6:B11), =B44-E24 (Margin)</text>
        <text x="195" y="83" font-size="9" fill="#334155" text-anchor="middle">• Injects Collection (A16:B24), Dues (D16:E23), Expenses (A29:B42)</text>
        <text x="195" y="100" font-size="9" font-weight="700" fill="#059669" text-anchor="middle">-> Next.js revalidatePath("/") Triggers Client Update</text>
      </g>
      <path d="M 715 330 L 715 350" stroke="#059669" stroke-width="1.5" marker-end="url(#arrowGreen)" />
    </svg>
    """

def diagram_4_erd():
    return f"""
    <svg viewBox="0 0 960 540" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      {get_svg_defs()}
      <rect width="960" height="540" rx="16" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>

      <rect x="25" y="15" width="910" height="38" rx="8" fill="url(#slateGrad)" />
      <text x="480" y="40" fill="#ffffff" font-size="14" font-weight="800" text-anchor="middle">ENTITY RELATIONSHIP DIAGRAM (ERD) &amp; DATABASE SCHEMA</text>

      <!-- ENTITY 1: DailyStockEntry -->
      <g transform="translate(30, 70)">
        <rect width="210" height="180" rx="8" fill="#ffffff" stroke="#38bdf8" stroke-width="1.5" filter="url(#cardShadow)"/>
        <rect width="210" height="28" rx="7" fill="#0284c7" />
        <text x="105" y="19" font-size="11" font-weight="700" fill="#ffffff" text-anchor="middle">DailyStockEntry</text>
        <text x="15" y="46" font-size="10" font-weight="700" fill="#0284c7">PK date: string (ISO)</text>
        <text x="15" y="62" font-size="10" font-weight="700" fill="#0284c7">PK eggType: string</text>
        <text x="15" y="78" font-size="9" fill="#475569">day: string (Bengali)</text>
        <text x="15" y="94" font-size="9" fill="#475569">pageNo: string</text>
        <text x="15" y="110" font-size="9" fill="#475569">currentStock: number</text>
        <text x="15" y="126" font-size="9" fill="#475569">hasPurchase: boolean</text>
        <text x="15" y="142" font-size="9" fill="#475569">purchaseRate: number</text>
        <text x="15" y="158" font-size="9" fill="#475569">purchaseQty: number</text>
      </g>

      <!-- ENTITY 2: FinancialsEntry (CENTER HUB) -->
      <g transform="translate(270, 70)">
        <rect width="230" height="260" rx="8" fill="#ffffff" stroke="#a855f7" stroke-width="2" filter="url(#cardShadow)"/>
        <rect width="230" height="28" rx="7" fill="#7e22ce" />
        <text x="115" y="19" font-size="11" font-weight="700" fill="#ffffff" text-anchor="middle">FinancialsEntry (Master)</text>
        <text x="15" y="46" font-size="10" font-weight="700" fill="#7e22ce">PK date: string (ISO)</text>
        <text x="15" y="62" font-size="9" fill="#475569">day: string | pageNo: string</text>
        <text x="15" y="78" font-size="9" fill="#475569">totalDue: number (বাকি)</text>
        <text x="15" y="94" font-size="9" fill="#475569">extraDue: number (অতিরিক্ত আদায়)</text>
        <text x="15" y="110" font-size="9" fill="#475569">totalCash: number (নগদ ক্যাশ)</text>
        <text x="15" y="126" font-size="9" fill="#475569">prevDayBalance: number (সাবেক)</text>
        <text x="15" y="142" font-size="9" fill="#475569">providerName: string (মহাজন)</text>
        <text x="15" y="158" font-size="9" fill="#475569">providerPhone: string</text>
        <text x="15" y="174" font-size="9" fill="#475569">providerDueMoney: number</text>
        <text x="15" y="190" font-size="9" fill="#475569">providerUnitPrice: number</text>
        <text x="15" y="206" font-size="9" font-weight="600" fill="#6b21a8">extraCollections: JSON[]</text>
        <text x="15" y="222" font-size="8" fill="#64748b">  [label, amount]</text>
        <text x="15" y="238" font-size="9" font-weight="600" fill="#6b21a8">extraDues: JSON[]</text>
        <text x="15" y="252" font-size="8" fill="#64748b">  [label, qty, unitPrice, amount]</text>
      </g>

      <!-- ENTITY 3: ExpenseEntry -->
      <g transform="translate(530, 70)">
        <rect width="200" height="180" rx="8" fill="#ffffff" stroke="#f43f5e" stroke-width="1.5" filter="url(#cardShadow)"/>
        <rect width="200" height="28" rx="7" fill="#e11d48" />
        <text x="100" y="19" font-size="11" font-weight="700" fill="#ffffff" text-anchor="middle">ExpenseEntry</text>
        <text x="15" y="46" font-size="10" font-weight="700" fill="#e11d48">FK date: string (ISO)</text>
        <text x="15" y="62" font-size="9" fill="#475569">day: string | pageNo: string</text>
        <text x="15" y="78" font-size="10" font-weight="600" fill="#0f172a">expenseType: string</text>
        <text x="15" y="94" font-size="9" fill="#475569">amount: number</text>
        <text x="15" y="110" font-size="9" fill="#475569">wastedEggQty: number</text>
        <text x="15" y="126" font-size="9" fill="#475569">wastedEggCost: number</text>
        <text x="15" y="148" font-size="8" fill="#e11d48">Presets: নাস্তা, গাড়ি, সমিতি,</text>
        <text x="15" y="162" font-size="8" fill="#e11d48">ভাঙ্গা ডিম, ট্রে-ফের, নিজ</text>
      </g>

      <!-- ENTITY 4: UserAccount (RBAC) -->
      <g transform="translate(755, 70)">
        <rect width="180" height="180" rx="8" fill="#ffffff" stroke="#64748b" stroke-width="1.5" filter="url(#cardShadow)"/>
        <rect width="180" height="28" rx="7" fill="#334155" />
        <text x="90" y="19" font-size="11" font-weight="700" fill="#ffffff" text-anchor="middle">UserAccount (RBAC)</text>
        <text x="15" y="46" font-size="10" font-weight="700" fill="#0f172a">PK username: string</text>
        <text x="15" y="62" font-size="9" fill="#475569">passwordHash: string</text>
        <text x="15" y="78" font-size="9" fill="#475569">name: string</text>
        <text x="15" y="94" font-size="10" font-weight="700" fill="#0284c7">role: admin|manager|viewer</text>
        <text x="15" y="110" font-size="9" fill="#475569">roleLabel: string</text>
        <text x="15" y="126" font-size="9" fill="#475569">allowedTabs: string[]</text>
        <text x="15" y="142" font-size="9" fill="#475569">canEdit: boolean</text>
        <text x="15" y="158" font-size="9" fill="#475569">canDelete: boolean</text>
        <text x="15" y="172" font-size="9" fill="#475569">avatarEmoji: string</text>
      </g>

      <!-- ENTITY 5: OverheadExpenseItem -->
      <g transform="translate(100, 350)">
        <rect width="250" height="160" rx="8" fill="#ffffff" stroke="#10b981" stroke-width="1.5" filter="url(#cardShadow)"/>
        <rect width="250" height="28" rx="7" fill="#059669" />
        <text x="125" y="19" font-size="11" font-weight="700" fill="#ffffff" text-anchor="middle">OverheadExpenseItem</text>
        <text x="15" y="46" font-size="10" font-weight="700" fill="#059669">PK id: string (UUID / exp-*)</text>
        <text x="15" y="62" font-size="10" font-weight="600" fill="#0f172a">date: string (ISO) | month: YYYY-MM</text>
        <text x="15" y="78" font-size="9" font-weight="700" fill="#047857">category: 11 fund categories</text>
        <text x="15" y="94" font-size="9" fill="#475569">title: string</text>
        <text x="15" y="110" font-size="9" fill="#475569">amount: number</text>
        <text x="15" y="126" font-size="9" fill="#475569">paymentMode: cash|bank|mfs|savings_*</text>
        <text x="15" y="142" font-size="9" fill="#475569">notes?: string | createdAt: string</text>
      </g>

      <!-- ENTITY 6: SavingsItem -->
      <g transform="translate(420, 350)">
        <rect width="250" height="160" rx="8" fill="#ffffff" stroke="#f59e0b" stroke-width="1.5" filter="url(#cardShadow)"/>
        <rect width="250" height="28" rx="7" fill="#d97706" />
        <text x="125" y="19" font-size="11" font-weight="700" fill="#ffffff" text-anchor="middle">SavingsItem (Extras &amp; Reserves)</text>
        <text x="15" y="46" font-size="10" font-weight="700" fill="#d97706">PK id: string (UUID / save-*)</text>
        <text x="15" y="62" font-size="9" fill="#475569">date: string (ISO) | month: YYYY-MM</text>
        <text x="15" y="78" font-size="10" font-weight="700" fill="#b45309">type: deposit | extra | withdraw</text>
        <text x="15" y="94" font-size="9" fill="#475569">category: খাঁচা/ট্রে, ব্যাংক, কার্টন, ইত্যাদি</text>
        <text x="15" y="110" font-size="9" fill="#475569">title: string | amount: number</text>
        <text x="15" y="126" font-size="9" fill="#475569">paymentMode: string</text>
        <text x="15" y="142" font-size="9" fill="#475569">notes?: string | createdAt: string</text>
      </g>

      <!-- ENTITY 7: ComputedDayData (IN-MEMORY AGGREGATE) -->
      <g transform="translate(710, 350)">
        <rect width="220" height="160" rx="8" fill="#ffffff" stroke="#6366f1" stroke-width="1.5" filter="url(#cardShadow)"/>
        <rect width="220" height="28" rx="7" fill="#4f46e5" />
        <text x="110" y="19" font-size="11" font-weight="700" fill="#ffffff" text-anchor="middle">ComputedDayData (DTO)</text>
        <text x="15" y="46" font-size="9" fill="#475569">date | day | pageNo</text>
        <text x="15" y="62" font-size="9" fill="#4338ca">stock: Map&lt;EggType, StockMetrics&gt;</text>
        <text x="15" y="78" font-size="9" fill="#4338ca">sales: totalSoldQty, soldCost, salesAmt</text>
        <text x="15" y="94" font-size="9" fill="#4338ca">financials: dues, stockVal, bizVal</text>
        <text x="15" y="110" font-size="9" font-weight="700" fill="#059669">profitMargin: number (Cell G5)</text>
        <text x="15" y="126" font-size="9" fill="#4338ca">expenses: list, totalExp, totalWithExp</text>
        <text x="15" y="142" font-size="9" fill="#475569">extraCollections[], extraDues[]</text>
      </g>

      <!-- RELATIONSHIP LINES -->
      <!-- Financials to DailyStock (1 to Many by date) -->
      <path d="M 270 140 L 240 140" stroke="#7e22ce" stroke-width="2" marker-end="url(#arrowPurple)" />
      <text x="250" y="132" font-size="10" font-weight="700" fill="#7e22ce">1:6</text>

      <!-- Financials to ExpenseEntry (1 to Many by date) -->
      <path d="M 500 140 L 530 140" stroke="#7e22ce" stroke-width="2" marker-end="url(#arrowPurple)" />
      <text x="508" y="132" font-size="10" font-weight="700" fill="#7e22ce">1:N</text>

      <!-- ExpenseEntry to OverheadExpenseItem (সমিতি Auto-Sync) -->
      <path d="M 600 250 L 300 350" stroke="#059669" stroke-width="1.5" stroke-dasharray="4,4" marker-end="url(#arrowGreen)" />
      <text x="470" y="295" font-size="9" font-weight="700" fill="#059669">Auto-Sync "সমিতি"</text>

      <!-- DTO aggregation from Financials -->
      <path d="M 500 240 L 710 370" stroke="#4f46e5" stroke-width="1.5" stroke-dasharray="3,3" marker-end="url(#arrowPurple)" />
      <text x="590" y="320" font-size="9" font-weight="600" fill="#4f46e5">Computes DTO</text>
    </svg>
    """

def diagram_5_ledger_math():
    return f"""
    <svg viewBox="0 0 960 540" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      {get_svg_defs()}
      <rect width="960" height="540" rx="16" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>

      <rect x="25" y="15" width="910" height="38" rx="8" fill="url(#amberGrad)" />
      <text x="480" y="40" fill="#ffffff" font-size="14" font-weight="800" text-anchor="middle">HAL-KHATA MATHEMATICAL ACCOUNTING ENGINE &amp; LEDGER EQUATIONS</text>

      <!-- INPUT TABLES (TOP ROW) -->
      <!-- Table 1: Stock Valuation -->
      <g transform="translate(30, 65)">
        <rect width="210" height="150" rx="8" fill="#ffffff" stroke="#38bdf8" filter="url(#cardShadow)"/>
        <rect width="210" height="26" rx="7" fill="#0284c7" />
        <text x="105" y="18" font-size="10" font-weight="700" fill="#ffffff" text-anchor="middle">১. মজুদ ডিমের মূল্য (Table 1)</text>
        <text x="10" y="44" font-size="9" fill="#0f172a">সাদা: Qty × Rate = Val</text>
        <text x="10" y="60" font-size="9" fill="#0f172a">লাল: Qty × Rate = Val</text>
        <text x="10" y="76" font-size="9" fill="#0f172a">হাঁস, মুরগী, কোয়েল, L.M</text>
        <line x1="10" y1="88" x2="200" y2="88" stroke="#cbd5e1" />
        <text x="10" y="104" font-size="9" font-weight="700" fill="#0369a1">Cell B12: Total Qty = ∑ B6:B11</text>
        <text x="10" y="122" font-size="10" font-weight="800" fill="#0284c7">Cell D12: Total Stock Value</text>
        <text x="10" y="138" font-size="9" fill="#64748b">Formula: =SUM(D6:D11)</text>
      </g>

      <!-- Table 2: Collections & Receivables -->
      <g transform="translate(260, 65)">
        <rect width="210" height="150" rx="8" fill="#ffffff" stroke="#a855f7" filter="url(#cardShadow)"/>
        <rect width="210" height="26" rx="7" fill="#7e22ce" />
        <text x="105" y="18" font-size="10" font-weight="700" fill="#ffffff" text-anchor="middle">২. পাওনা / আদায় (Table 2)</text>
        <text x="10" y="44" font-size="9" fill="#0f172a">বাকি (Customer Due): B16</text>
        <text x="10" y="60" font-size="9" fill="#0f172a">নগদ ক্যাশ (Cash): B18</text>
        <text x="10" y="76" font-size="9" fill="#0f172a">অন্যান্য আদায়: B17, B19:B24</text>
        <text x="10" y="92" font-size="9" fill="#475569">+ মজুদ ডিমের মূল্য (Cell D12)</text>
        <line x1="10" y1="100" x2="200" y2="100" stroke="#cbd5e1" />
        <text x="10" y="118" font-size="10" font-weight="800" fill="#7e22ce">Cell B25: সর্বমোট পাওনা</text>
        <text x="10" y="136" font-size="9" fill="#64748b">Formula: =SUM(B16:B24)+D12</text>
      </g>

      <!-- Table 3: Daily Expenses -->
      <g transform="translate(490, 65)">
        <rect width="210" height="150" rx="8" fill="#ffffff" stroke="#f43f5e" filter="url(#cardShadow)"/>
        <rect width="210" height="26" rx="7" fill="#e11d48" />
        <text x="105" y="18" font-size="10" font-weight="700" fill="#ffffff" text-anchor="middle">৩. দৈনিক খরচ (Table 3)</text>
        <text x="10" y="44" font-size="9" fill="#0f172a">Rows 29 to 42: B29:B42</text>
        <text x="10" y="60" font-size="9" fill="#0f172a">• নাস্তা-চা, তেল, রং, ট্রে</text>
        <text x="10" y="76" font-size="9" fill="#0f172a">• ভাঙ্গা ডিম (Qty × Cost)</text>
        <text x="10" y="92" font-size="9" fill="#0f172a">• সমিতি, মহাজন, নিজ খরচ</text>
        <line x1="10" y1="100" x2="200" y2="100" stroke="#cbd5e1" />
        <text x="10" y="118" font-size="10" font-weight="800" fill="#e11d48">Cell B43: মোট খরচ</text>
        <text x="10" y="136" font-size="9" fill="#64748b">Formula: =SUM(B29:B42)</text>
      </g>

      <!-- Table 4: Dues & Opening Balance -->
      <g transform="translate(720, 65)">
        <rect width="210" height="150" rx="8" fill="#ffffff" stroke="#64748b" filter="url(#cardShadow)"/>
        <rect width="210" height="26" rx="7" fill="#334155" />
        <text x="105" y="18" font-size="10" font-weight="700" fill="#ffffff" text-anchor="middle">৪. দেনা দায় / জমা (Table 4)</text>
        <text x="10" y="44" font-size="9" fill="#0f172a">সাবেক ব্যালেন্স (Opening): E16</text>
        <text x="10" y="60" font-size="9" fill="#0f172a">মহাজন দেনা (Supplier Due): E17</text>
        <text x="10" y="76" font-size="9" fill="#0f172a">বিবিধ দেনা (Extra Dues): E18:E23</text>
        <text x="10" y="92" font-size="9" fill="#64748b">(Qty × UnitPrice)</text>
        <line x1="10" y1="100" x2="200" y2="100" stroke="#cbd5e1" />
        <text x="10" y="118" font-size="10" font-weight="800" fill="#0f172a">Cell E24: মোট দেনা / জমা</text>
        <text x="10" y="136" font-size="9" fill="#64748b">Formula: =SUM(E16:E23)</text>
      </g>

      <!-- Connector Lines to Grand Totals -->
      <path d="M 135 215 L 340 270" stroke="#0284c7" stroke-width="1.5" marker-end="url(#arrowBlue)" />
      <path d="M 365 215 L 365 270" stroke="#7e22ce" stroke-width="2" marker-end="url(#arrowPurple)" />
      <path d="M 595 215 L 430 270" stroke="#e11d48" stroke-width="2" marker-end="url(#arrow)" />

      <!-- GRAND TOTAL BOX (CELL B44) -->
      <g transform="translate(260, 275)">
        <rect width="240" height="90" rx="10" fill="#eff6ff" stroke="#3b82f6" stroke-width="2" filter="url(#cardShadow)"/>
        <text x="120" y="24" font-size="12" font-weight="800" fill="#1d4ed8" text-anchor="middle">Cell B44: হালখাতা সর্বমোট সমীকরণ</text>
        <text x="120" y="44" font-size="11" font-weight="700" fill="#0f172a" text-anchor="middle">Total = সর্বমোট পাওনা + মোট খরচ</text>
        <text x="120" y="62" font-size="12" font-weight="800" fill="#2563eb" text-anchor="middle">= B44 = B25 + B43</text>
        <text x="120" y="78" font-size="9" fill="#64748b" text-anchor="middle">(Matches Bengali Physical Ledger Total)</text>
      </g>

      <path d="M 825 215 L 680 275" stroke="#334155" stroke-width="2" marker-end="url(#arrow)" />

      <!-- TOTAL LIABILITIES RECAP BOX (CELL E24) -->
      <g transform="translate(600, 275)">
        <rect width="210" height="90" rx="10" fill="#f8fafc" stroke="#64748b" stroke-width="2" filter="url(#cardShadow)"/>
        <text x="105" y="24" font-size="12" font-weight="800" fill="#334155" text-anchor="middle">Cell E24: দেনা ও জমার মোট</text>
        <text x="105" y="44" font-size="11" font-weight="700" fill="#0f172a" text-anchor="middle">সাবেক + মহাজন + অতিরিক্ত দেনা</text>
        <text x="105" y="62" font-size="12" font-weight="800" fill="#1e293b" text-anchor="middle">= E24 = SUM(E16:E23)</text>
        <text x="105" y="78" font-size="9" fill="#64748b" text-anchor="middle">(Total Liabilities / Opening Fund)</text>
      </g>

      <!-- Connectors to Bottom Profit & Margin Outputs -->
      <path d="M 380 365 L 380 405" stroke="#3b82f6" stroke-width="2" marker-end="url(#arrowBlue)" />
      <path d="M 705 365 L 530 405" stroke="#334155" stroke-width="2" marker-end="url(#arrow)" />

      <!-- PROFIT MARGIN BOX (CELL G5) - STAR OF THE SYSTEM -->
      <g transform="translate(230, 410)">
        <rect width="320" height="110" rx="12" fill="#ecfdf5" stroke="#10b981" stroke-width="2.5" filter="url(#cardShadow)"/>
        <rect width="320" height="28" rx="10" fill="#059669" />
        <text x="160" y="19" font-size="12" font-weight="800" fill="#ffffff" text-anchor="middle">👑 Cell G5: দৈনিক নিট লাভ / মার্জিন (PROFIT MARGIN)</text>
        <text x="160" y="48" font-size="13" font-weight="800" fill="#065f46" text-anchor="middle">Formula: = B44 - E24</text>
        <text x="160" y="66" font-size="10" font-weight="600" fill="#047857" text-anchor="middle">Profit Margin = (সর্বমোট সমীকরণ) - (মোট জমা ও দেনা)</text>
        <text x="160" y="82" font-size="9" fill="#047857" text-anchor="middle">If Margin &gt; 0: Business made net trading profit</text>
        <text x="160" y="98" font-size="9" fill="#b91c1c" text-anchor="middle">If Margin &lt; 0: Business operated at a deficit</text>
      </g>

      <!-- CASH + STOCK (CELL G9) & SALES -->
      <g transform="translate(580, 410)">
        <rect width="350" height="110" rx="12" fill="#fefce8" stroke="#eab308" stroke-width="2" filter="url(#cardShadow)"/>
        <rect width="350" height="28" rx="10" fill="#ca8a04" />
        <text x="175" y="19" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">LIQUIDITY &amp; DAILY SALES VOLUME EQUATIONS</text>
        <text x="15" y="48" font-size="10" font-weight="700" fill="#854d0e">Cell G9: Cash + Stock = B18 + D12</text>
        <text x="15" y="64" font-size="9" fill="#713f12">SoldQty = Max(0, PrevStock + AddedQty - CurrentStock)</text>
        <text x="15" y="80" font-size="9" fill="#713f12">SoldStockCost = ∑ (SoldQty × ActiveRate)</text>
        <text x="15" y="98" font-size="10" font-weight="700" fill="#a16207">Daily Sales Amount = SoldStockCost + Max(0, ProfitMargin)</text>
      </g>
    </svg>
    """

def diagram_6_entry_workflow():
    return f"""
    <svg viewBox="0 0 960 520" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      {get_svg_defs()}
      <rect width="960" height="520" rx="16" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>

      <rect x="25" y="15" width="910" height="38" rx="8" fill="url(#purpleGrad)" />
      <text x="480" y="40" fill="#ffffff" font-size="14" font-weight="800" text-anchor="middle">DAILY HAL-KHATA LEDGER ENTRY &amp; DATA LIFECYCLE WORKFLOW</text>

      <!-- STEP 1: Date & Day Selection -->
      <g transform="translate(35, 75)">
        <rect width="165" height="120" rx="10" fill="#ffffff" stroke="#38bdf8" stroke-width="1.5" filter="url(#cardShadow)"/>
        <rect width="165" height="26" rx="8" fill="#0284c7" />
        <text x="82" y="18" font-size="10" font-weight="700" fill="#ffffff" text-anchor="middle">1. Date &amp; Day Init</text>
        <text x="10" y="44" font-size="9" fill="#0f172a">• User selects Date</text>
        <text x="10" y="58" font-size="9" fill="#0f172a">• Auto-converts to Bangla Day</text>
        <text x="10" y="72" font-size="9" fill="#64748b">  (মঙ্গলবার, বুধবার...)</text>
        <text x="10" y="88" font-size="9" fill="#0f172a">• Sets Hal-Khata Page No</text>
        <text x="10" y="104" font-size="9" font-weight="600" fill="#0284c7">Auto-scans existing DB</text>
      </g>

      <!-- Decision Diamond: Existing Entry? -->
      <g transform="translate(230, 105)">
        <polygon points="50,0 100,30 50,60 0,30" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5" />
        <text x="50" y="34" font-size="9" font-weight="700" fill="#854d0e" text-anchor="middle">Exists in DB?</text>
      </g>
      <path d="M 200 135 L 230 135" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrow)" />

      <!-- Branch A: EDIT MODE -->
      <g transform="translate(360, 65)">
        <rect width="180" height="65" rx="8" fill="#eff6ff" stroke="#3b82f6"/>
        <text x="90" y="18" font-size="10" font-weight="700" fill="#1d4ed8" text-anchor="middle">EDIT MODE</text>
        <text x="10" y="34" font-size="8" fill="#1e40af">• Hydrates all 6 egg stocks</text>
        <text x="10" y="46" font-size="8" fill="#1e40af">• Loads Collections &amp; Extra Dues</text>
        <text x="10" y="58" font-size="8" fill="#1e40af">• Populates all 14 expense rows</text>
      </g>
      <path d="M 280 115 L 360 95" stroke="#1d4ed8" stroke-width="1.5" marker-end="url(#arrowBlue)" />
      <text x="300" y="95" font-size="9" font-weight="700" fill="#1d4ed8">YES</text>

      <!-- Branch B: NEW DAY MODE -->
      <g transform="translate(360, 145)">
        <rect width="180" height="65" rx="8" fill="#f0fdf4" stroke="#10b981"/>
        <text x="90" y="18" font-size="10" font-weight="700" fill="#065f46" text-anchor="middle">NEW DAY MODE</text>
        <text x="10" y="34" font-size="8" fill="#047857">• Inherits closing stock of prev day</text>
        <text x="10" y="46" font-size="8" fill="#047857">• Pre-populates prevailing egg rates</text>
        <text x="10" y="58" font-size="8" fill="#047857">• Defaults opening balance (সাবেক)</text>
      </g>
      <path d="M 280 155 L 360 175" stroke="#059669" stroke-width="1.5" marker-end="url(#arrowGreen)" />
      <text x="300" y="175" font-size="9" font-weight="700" fill="#059669">NO</text>

      <!-- STEP 2: Interactive Form Sections -->
      <g transform="translate(570, 75)">
        <rect width="355" height="135" rx="10" fill="#ffffff" stroke="#a855f7" stroke-width="1.5" filter="url(#cardShadow)"/>
        <rect width="355" height="26" rx="8" fill="#7e22ce" />
        <text x="177" y="18" font-size="11" font-weight="700" fill="#ffffff" text-anchor="middle">2. User Edits / Fills 4 Physical Ledger Sections</text>
        <text x="15" y="44" font-size="9" fill="#0f172a"><tspan font-weight="700">Sec 1 (Stock):</tspan> Enter Current Stock, Toggle Purchases, Enter Rate &amp; Qty</text>
        <text x="15" y="62" font-size="9" fill="#0f172a"><tspan font-weight="700">Sec 2 (Collections):</tspan> বাকি, নগদ, Dynamic (+ Add Item) Extra Collections</text>
        <text x="15" y="80" font-size="9" fill="#0f172a"><tspan font-weight="700">Sec 3 (Liabilities):</tspan> সাবেক, মহাজন বাকি, Dynamic (+ Add Item) Extra Dues</text>
        <text x="15" y="98" font-size="9" fill="#0f172a"><tspan font-weight="700">Sec 4 (Expenses):</tspan> 14 Rows (নাস্তা, তেল, রং, ট্রে, সমিতি, ভাঙ্গা, নিজ)</text>
        <text x="15" y="116" font-size="9" fill="#047857" font-weight="700">Auto-Link: সমিতি -> In-shop savings; ভাঙ্গা -> Auto Qty &amp; Cost</text>
      </g>
      <path d="M 540 100 L 570 100" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrow)" />
      <path d="M 540 175 L 570 175" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrow)" />

      <!-- STEP 3: Real-time Ledger Balancing Engine -->
      <g transform="translate(35, 235)">
        <rect width="890" height="110" rx="10" fill="#fffbeb" stroke="#f59e0b" stroke-width="2" filter="url(#cardShadow)"/>
        <rect width="890" height="28" rx="8" fill="#d97706" />
        <text x="445" y="19" font-size="12" font-weight="800" fill="#ffffff" text-anchor="middle">3. REAL-TIME FORM RECONCILIATION &amp; VALIDATION ENGINE (REACT LIVE STATE)</text>
        
        <g transform="translate(20, 38)">
          <rect width="160" height="60" rx="6" fill="#ffffff" stroke="#fcd34d"/>
          <text x="80" y="18" font-size="10" font-weight="700" fill="#92400e" text-anchor="middle">Cell D12: Stock Value</text>
          <text x="80" y="34" font-size="9" fill="#78350f" text-anchor="middle">∑ (Stock × Rate)</text>
          <text x="80" y="50" font-size="8" fill="#b45309" text-anchor="middle">Total Qty = ∑ Qty</text>
        </g>
        <g transform="translate(195, 38)">
          <rect width="160" height="60" rx="6" fill="#ffffff" stroke="#fcd34d"/>
          <text x="80" y="18" font-size="10" font-weight="700" fill="#92400e" text-anchor="middle">Cell B25: সর্বমোট পাওনা</text>
          <text x="80" y="34" font-size="9" fill="#78350f" text-anchor="middle">Due + Cash + ExtraColls</text>
          <text x="80" y="50" font-size="9" font-weight="600" fill="#b45309" text-anchor="middle">+ Cell D12</text>
        </g>
        <g transform="translate(370, 38)">
          <rect width="160" height="60" rx="6" fill="#ffffff" stroke="#fcd34d"/>
          <text x="80" y="18" font-size="10" font-weight="700" fill="#92400e" text-anchor="middle">Cell E24: মোট দেনা</text>
          <text x="80" y="34" font-size="9" fill="#78350f" text-anchor="middle">সাবেক + মহাজন</text>
          <text x="80" y="50" font-size="9" fill="#b45309" text-anchor="middle">+ ∑ Extra Dues</text>
        </g>
        <g transform="translate(545, 38)">
          <rect width="160" height="60" rx="6" fill="#ffffff" stroke="#fcd34d"/>
          <text x="80" y="18" font-size="10" font-weight="700" fill="#92400e" text-anchor="middle">Cell B44: সর্বমোট</text>
          <text x="80" y="34" font-size="9" fill="#78350f" text-anchor="middle">B25 (পাওনা) + B43 (খরচ)</text>
          <text x="80" y="50" font-size="9" font-weight="600" fill="#b45309" text-anchor="middle">Ledger Master Sum</text>
        </g>
        <g transform="translate(720, 38)">
          <rect width="150" height="60" rx="6" fill="#ecfdf5" stroke="#10b981"/>
          <text x="75" y="18" font-size="11" font-weight="800" fill="#065f46" text-anchor="middle">Cell G5: নিট মার্জিন</text>
          <text x="75" y="34" font-size="10" font-weight="700" fill="#047857" text-anchor="middle">= B44 - E24</text>
          <text x="75" y="50" font-size="8" fill="#059669" text-anchor="middle">Real-time Margin Preview</text>
        </g>
      </g>
      <path d="M 747 210 L 747 235" stroke="#f59e0b" stroke-width="2" marker-end="url(#arrowAmber)" />

      <!-- STEP 4: Submit & Commit Pipeline -->
      <g transform="translate(35, 370)">
        <rect width="890" height="130" rx="10" fill="#ffffff" stroke="#10b981" stroke-width="2" filter="url(#cardShadow)"/>
        <rect width="890" height="28" rx="8" fill="#059669" />
        <text x="445" y="19" font-size="12" font-weight="800" fill="#ffffff" text-anchor="middle">4. COMMIT &amp; MULTI-TARGET PERSISTENCE EXECUTION</text>

        <g transform="translate(20, 40)">
          <rect width="260" height="75" rx="6" fill="#f0fdf4" stroke="#86efac"/>
          <text x="130" y="18" font-size="10" font-weight="700" fill="#166534" text-anchor="middle">Target 1: Local Mock Database</text>
          <text x="10" y="34" font-size="8" fill="#14532d">• Filters out matching date records</text>
          <text x="10" y="46" font-size="8" fill="#14532d">• Pushes updated Stock, Fin, Exp records</text>
          <text x="10" y="58" font-size="8" fill="#14532d">• Writes mock_db.json atomically</text>
          <text x="10" y="70" font-size="8" font-weight="700" fill="#15803d">Guarantees offline resilience</text>
        </g>

        <g transform="translate(315, 40)">
          <rect width="260" height="75" rx="6" fill="#f0fdf4" stroke="#86efac"/>
          <text x="130" y="18" font-size="10" font-weight="700" fill="#166534" text-anchor="middle">Target 2: Google Sheets Master</text>
          <text x="10" y="34" font-size="8" fill="#14532d">• Reads DailyStock, Financials, Expenses</text>
          <text x="10" y="46" font-size="8" fill="#14532d">• Replaces existing date rows &amp; sorts</text>
          <text x="10" y="58" font-size="8" fill="#14532d">• updateSheetValues() batch update</text>
          <text x="10" y="70" font-size="8" font-weight="700" fill="#15803d">Keeps cloud database in exact sync</text>
        </g>

        <g transform="translate(610, 40)">
          <rect width="260" height="75" rx="6" fill="#f0fdf4" stroke="#86efac"/>
          <text x="130" y="18" font-size="10" font-weight="700" fill="#166534" text-anchor="middle">Target 3: Day Tab Cloner (DD/MM/YY)</text>
          <text x="10" y="34" font-size="8" fill="#14532d">• Clones "Original" tab if new day</text>
          <text x="10" y="46" font-size="8" fill="#14532d">• Injects native spreadsheet formulas</text>
          <text x="10" y="58" font-size="8" fill="#14532d">• Calls revalidatePath("/") on Next.js</text>
          <text x="10" y="70" font-size="8" font-weight="700" fill="#15803d">Full human audit in Google Sheets</text>
        </g>
      </g>
      <path d="M 480 345 L 480 370" stroke="#059669" stroke-width="2" marker-end="url(#arrowGreen)" />
    </svg>
    """

def diagram_7_ai_ocr():
    return f"""
    <svg viewBox="0 0 960 520" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      {get_svg_defs()}
      <rect width="960" height="520" rx="16" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>

      <rect x="25" y="15" width="910" height="38" rx="8" fill="url(#amberGrad)" />
      <text x="480" y="40" fill="#ffffff" font-size="14" font-weight="800" text-anchor="middle">AI VISION OCR INGESTION PIPELINE (BENGALI HAL-KHATA NOTEBOOK EXTRACTION)</text>

      <!-- Step 1: Ingestion Channels -->
      <g transform="translate(30, 75)">
        <rect width="180" height="200" rx="10" fill="#ffffff" stroke="#f59e0b" stroke-width="1.5" filter="url(#cardShadow)"/>
        <rect width="180" height="26" rx="8" fill="#d97706" />
        <text x="90" y="18" font-size="10" font-weight="700" fill="#ffffff" text-anchor="middle">1. Image Ingestion</text>
        <text x="12" y="46" font-size="9" font-weight="700" fill="#92400e">Three Capture Modes:</text>
        <text x="12" y="64" font-size="9" fill="#0f172a">• 📷 Smartphone Camera</text>
        <text x="12" y="80" font-size="9" fill="#0f172a">• 📁 File Upload (.jpg, .png)</text>
        <text x="12" y="96" font-size="9" fill="#0f172a">• 📋 Clipboard Paste (Ctrl+V)</text>
        <line x1="12" y1="110" x2="168" y2="110" stroke="#fed7aa" />
        <text x="12" y="128" font-size="9" fill="#475569">FileReader -> Base64</text>
        <text x="12" y="144" font-size="9" fill="#475569">MimeType Detection</text>
        <text x="12" y="160" font-size="9" fill="#475569">Dual Mode Switcher:</text>
        <text x="12" y="174" font-size="8" fill="#b45309">  - Direct API Ingestion</text>
        <text x="12" y="188" font-size="8" fill="#b45309">  - 1-Click Prompt Copy</text>
      </g>

      <!-- Connector 1 -->
      <path d="M 210 175 L 245 175" stroke="#f59e0b" stroke-width="2" marker-end="url(#arrowAmber)" />

      <!-- Step 2: OCR Route Handler -->
      <g transform="translate(245, 75)">
        <rect width="210" height="200" rx="10" fill="#ffffff" stroke="#f59e0b" stroke-width="1.5" filter="url(#cardShadow)"/>
        <rect width="210" height="26" rx="8" fill="#d97706" />
        <text x="105" y="18" font-size="10" font-weight="700" fill="#ffffff" text-anchor="middle">2. /api/ocr-to-json Handler</text>
        <text x="12" y="46" font-size="9" font-weight="700" fill="#92400e">API Key Resolution:</text>
        <text x="12" y="62" font-size="8" fill="#0f172a">1. User Provided in Modal</text>
        <text x="12" y="74" font-size="8" fill="#0f172a">2. process.env.GEMINI_API_KEY</text>
        <text x="12" y="86" font-size="8" fill="#0f172a">3. process.env.GOOGLE_AI_API_KEY</text>
        <line x1="12" y1="98" x2="198" y2="98" stroke="#fed7aa" />
        <text x="12" y="114" font-size="9" font-weight="700" fill="#92400e">Model Cascade Fallback:</text>
        <text x="12" y="130" font-size="8" fill="#0f172a">1. gemini-3.6-flash</text>
        <text x="12" y="144" font-size="8" fill="#0f172a">2. gemini-3.5-flash</text>
        <text x="12" y="158" font-size="8" fill="#0f172a">3. gemini-flash-latest</text>
        <text x="12" y="172" font-size="8" fill="#0f172a">4. gemini-3.1-flash-lite</text>
        <text x="12" y="190" font-size="8" font-weight="600" fill="#059669">Payload: temperature 0.1, JSON</text>
      </g>

      <!-- Connector 2 -->
      <path d="M 455 175 L 490 175" stroke="#f59e0b" stroke-width="2" marker-end="url(#arrowAmber)" />

      <!-- Step 3: Domain Specialized Prompt -->
      <g transform="translate(490, 75)">
        <rect width="210" height="200" rx="10" fill="#ffffff" stroke="#f59e0b" stroke-width="1.5" filter="url(#cardShadow)"/>
        <rect width="210" height="26" rx="8" fill="#d97706" />
        <text x="105" y="18" font-size="10" font-weight="700" fill="#ffffff" text-anchor="middle">3. Domain Prompt Spec</text>
        <text x="12" y="46" font-size="8" font-weight="700" fill="#92400e">Bengali Hal-Khata Prompt Rules:</text>
        <text x="12" y="62" font-size="8" fill="#0f172a">• Top Header: Date, Day, Page</text>
        <text x="12" y="74" font-size="8" fill="#0f172a">• Table 1: 6 Egg Categories</text>
        <text x="12" y="86" font-size="8" fill="#64748b">  (সাদা, লাল, হাঁস, মুরগী, কোয়েল, LM)</text>
        <text x="12" y="98" font-size="8" fill="#0f172a">• Table 2: বাকি, নগদ, অতিরিক্ত আদায়</text>
        <text x="12" y="110" font-size="8" fill="#0f172a">• Table 3: সাবেক, মহাজন, দেনা খাত</text>
        <text x="12" y="122" font-size="8" fill="#64748b">  Extract (Qty × Unit Price)</text>
        <text x="12" y="134" font-size="8" fill="#0f172a">• Table 4: 14 Expense Rows</text>
        <text x="12" y="146" font-size="8" fill="#b91c1c">  "ভাঙ্গা" -> wastedEggQty &amp; cost</text>
        <text x="12" y="162" font-size="8" font-weight="700" fill="#059669">Output: Strict JSON Schema</text>
        <text x="12" y="176" font-size="8" fill="#64748b">No markdown backticks allowed</text>
        <text x="12" y="190" font-size="8" fill="#64748b">Direct JSON object parse</text>
      </g>

      <!-- Connector 3 -->
      <path d="M 700 175 L 735 175" stroke="#f59e0b" stroke-width="2" marker-end="url(#arrowAmber)" />

      <!-- Step 4: Sanitization & Verification Engine -->
      <g transform="translate(735, 75)">
        <rect width="195" height="200" rx="10" fill="#ffffff" stroke="#f59e0b" stroke-width="1.5" filter="url(#cardShadow)"/>
        <rect width="195" height="26" rx="8" fill="#d97706" />
        <text x="97" y="18" font-size="10" font-weight="700" fill="#ffffff" text-anchor="middle">4. Sanitizer &amp; Normalizer</text>
        <text x="10" y="46" font-size="8" font-weight="700" fill="#92400e">sanitizeAndVerifyLedgerData:</text>
        <text x="10" y="62" font-size="8" fill="#0f172a">1. Date Normalization</text>
        <text x="10" y="74" font-size="8" fill="#64748b">   DD/MM/YY -> YYYY-MM-DD</text>
        <text x="10" y="88" font-size="8" fill="#0f172a">2. Stock Fallback Rates</text>
        <text x="10" y="100" font-size="8" fill="#64748b">   Inject default if missing</text>
        <text x="10" y="114" font-size="8" fill="#0f172a">3. Financial Balancing</text>
        <text x="10" y="126" font-size="8" fill="#64748b">   extraDue = sum(collections)</text>
        <text x="10" y="140" font-size="8" fill="#0f172a">4. Extra Dues Arithmetic</text>
        <text x="10" y="152" font-size="8" fill="#64748b">   amount = qty × unitPrice</text>
        <text x="10" y="166" font-size="8" fill="#0f172a">5. Waste Eggs Extraction</text>
        <text x="10" y="178" font-size="8" fill="#64748b">   wastedEggCost = amount</text>
        <text x="10" y="192" font-size="8" font-weight="700" fill="#059669">Returns Typed JSON DTO</text>
      </g>

      <!-- STEP 5: Interactive Visual Verification Modal (BOTTOM SECTION) -->
      <g transform="translate(30, 300)">
        <rect width="900" height="200" rx="10" fill="#ffffff" stroke="#059669" stroke-width="2" filter="url(#cardShadow)"/>
        <rect width="900" height="28" rx="8" fill="#059669" />
        <text x="450" y="19" font-size="12" font-weight="800" fill="#ffffff" text-anchor="middle">5. INTERACTIVE TWO-PANEL REVIEW &amp; 1-CLICK PERSISTENCE</text>

        <!-- Left Preview: Side-by-Side Image vs Form -->
        <g transform="translate(20, 40)">
          <rect width="410" height="145" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
          <text x="205" y="20" font-size="11" font-weight="700" fill="#0f172a" text-anchor="middle">Side-by-Side Verification Screen (ImageToJsonModal)</text>
          <text x="15" y="44" font-size="9" fill="#334155"><tspan font-weight="700">Left Panel (Original Image):</tspan> Zoomable high-res view of notebook page</text>
          <text x="15" y="62" font-size="9" fill="#334155"><tspan font-weight="700">Right Panel (Parsed Form):</tspan> Editable fields for every single number &amp; text</text>
          <text x="15" y="80" font-size="9" fill="#334155"><tspan font-weight="700">Tabs:</tspan> 📷 Scan / Image | ✏️ Edit Parsed Data | 💻 Raw JSON Editor</text>
          <text x="15" y="98" font-size="9" fill="#047857"><tspan font-weight="700">Audit Proofing:</tspan> Allows human accountant to review handwriting discrepancies</text>
          <text x="15" y="116" font-size="9" fill="#b45309"><tspan font-weight="700">1-Click Fallback:</tspan> Prompt Copy button opens gemini.google.com with 1 click</text>
          <text x="15" y="132" font-size="9" fill="#64748b">Zero lock-in: Works 100% free with user personal API key or Web Chat</text>
        </g>

        <!-- Right Preview: 1-Click Save Action -->
        <g transform="translate(460, 40)">
          <rect width="420" height="145" rx="8" fill="#ecfdf5" stroke="#86efac"/>
          <text x="210" y="20" font-size="11" font-weight="700" fill="#065f46" text-anchor="middle">1-Click Save &amp; Cloud Database Ingestion</text>
          <text x="15" y="44" font-size="9" fill="#047857">• Calls saveLedgerEntryAction() directly from Modal</text>
          <text x="15" y="62" font-size="9" fill="#047857">• Commits Stock, Collections, Liabilities, and Expenses to Database</text>
          <text x="15" y="80" font-size="9" fill="#047857">• Generates / Updates Google Sheets Daily Tab (DD/MM/YY)</text>
          <text x="15" y="98" font-size="9" fill="#047857">• Refreshes Next.js App Router cache via revalidatePath("/")</text>
          <text x="15" y="116" font-size="9" font-weight="700" fill="#059669">• Closes Modal &amp; switches Dashboard view to newly scanned date</text>
          <text x="15" y="132" font-size="9" font-weight="800" fill="#065f46">Result: Paper Hal-Khata page fully digitized in under 5 seconds!</text>
        </g>
      </g>

      <path d="M 832 275 L 832 300" stroke="#059669" stroke-width="2" marker-end="url(#arrowGreen)" />
    </svg>
    """

def diagram_8_overhead_flow():
    return f"""
    <svg viewBox="0 0 960 520" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      {get_svg_defs()}
      <rect width="960" height="520" rx="16" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>

      <rect x="25" y="15" width="910" height="38" rx="8" fill="url(#greenGrad)" />
      <text x="480" y="40" fill="#ffffff" font-size="14" font-weight="800" text-anchor="middle">OVERHEAD EXPENSES, FUND SETTLEMENTS &amp; LIQUIDITY RECONCILIATION</text>

      <!-- 4 CORE OVERHEAD & FUND CHANNELS -->
      <!-- Channel 1: In-Shop Savings (দোকানে সঞ্চয়) -->
      <g transform="translate(30, 70)">
        <rect width="210" height="180" rx="10" fill="#ffffff" stroke="#10b981" stroke-width="2" filter="url(#cardShadow)"/>
        <rect width="210" height="26" rx="8" fill="#059669" />
        <text x="105" y="18" font-size="11" font-weight="700" fill="#ffffff" text-anchor="middle">🏪 দোকানে সঞ্চয় (Shop Fund)</text>
        <text x="10" y="44" font-size="9" font-weight="700" fill="#065f46">Daily In-Shop Cash Allocations</text>
        <text x="10" y="60" font-size="9" fill="#0f172a">• Auto-synced from "সমিতি" in Daily Exp</text>
        <text x="10" y="76" font-size="9" fill="#0f172a">• Manual entries tagged savings_shop</text>
        <text x="10" y="92" font-size="9" fill="#0f172a">• Deduplication: 1 record per date</text>
        <line x1="10" y1="104" x2="200" y2="104" stroke="#bbf7d0" />
        <text x="10" y="122" font-size="9" font-weight="700" fill="#047857">Bill Deductions:</text>
        <text x="10" y="138" font-size="9" fill="#0f172a">💸 bill_from_savings_shop</text>
        <text x="10" y="154" font-size="9" fill="#64748b">Pays bills directly from shop fund</text>
        <text x="10" y="170" font-size="9" font-weight="700" fill="#059669">Net Shop Fund = Dep - Bills</text>
      </g>

      <!-- Channel 2: Bank Savings (ব্যাংক সঞ্চয়) -->
      <g transform="translate(260, 70)">
        <rect width="210" height="180" rx="10" fill="#ffffff" stroke="#3b82f6" stroke-width="2" filter="url(#cardShadow)"/>
        <rect width="210" height="26" rx="8" fill="#2563eb" />
        <text x="105" y="18" font-size="11" font-weight="700" fill="#ffffff" text-anchor="middle">🏦 ব্যাংক সঞ্চয় (Bank Fund)</text>
        <text x="10" y="44" font-size="9" font-weight="700" fill="#1e40af">Bank Accounts / DPS / FDR</text>
        <text x="10" y="60" font-size="9" fill="#0f172a">• Category: savings_bank</text>
        <text x="10" y="76" font-size="9" fill="#0f172a">• Monthly DPS installments</text>
        <text x="10" y="92" font-size="9" fill="#0f172a">• Tracked with Bank Account Notes</text>
        <line x1="10" y1="104" x2="200" y2="104" stroke="#bfdbfe" />
        <text x="10" y="122" font-size="9" font-weight="700" fill="#1d4ed8">Bill Deductions:</text>
        <text x="10" y="138" font-size="9" fill="#0f172a">💳 bill_from_savings_bank</text>
        <text x="10" y="154" font-size="9" fill="#64748b">Bank transfer for major liabilities</text>
        <text x="10" y="170" font-size="9" font-weight="700" fill="#2563eb">Net Bank Fund = Dep - Bills</text>
      </g>

      <!-- Channel 3: Operational Overheads -->
      <g transform="translate(490, 70)">
        <rect width="210" height="180" rx="10" fill="#ffffff" stroke="#a855f7" stroke-width="2" filter="url(#cardShadow)"/>
        <rect width="210" height="26" rx="8" fill="#7e22ce" />
        <text x="105" y="18" font-size="11" font-weight="700" fill="#ffffff" text-anchor="middle">🏢 ব্যবসায়িক পরিচালন খরচ</text>
        <text x="10" y="44" font-size="9" font-weight="700" fill="#6b21a8">Fixed &amp; Recurring Overhead</text>
        <text x="10" y="60" font-size="9" fill="#0f172a">👨‍💼 employee (কর্মচারী বেতন)</text>
        <text x="10" y="76" font-size="9" fill="#0f172a">🏢 rent (দোকান ও গোডাউন ভাড়া)</text>
        <text x="10" y="92" font-size="9" fill="#0f172a">⚡ utilities (বিদ্যুৎ ও গ্যাস বিল)</text>
        <text x="10" y="108" font-size="9" fill="#0f172a">🛡️ security (নাইটগার্ড ও সমিতি)</text>
        <text x="10" y="124" font-size="9" fill="#0f172a">🚚 transport (কাভার্ডভ্যান ও জ্বালানি)</text>
        <text x="10" y="140" font-size="9" fill="#0f172a">📜 tax (ট্রেড লাইসেন্স ও ট্যাক্স)</text>
        <text x="10" y="156" font-size="9" fill="#0f172a">🪙 extra (বিবিধ পরিচালন খরচ)</text>
        <text x="10" y="170" font-size="9" font-weight="700" fill="#7e22ce">Paid via Cash, MFS or Bank</text>
      </g>

      <!-- Channel 4: Personal Expenses ("নিজ") -->
      <g transform="translate(720, 70)">
        <rect width="210" height="180" rx="10" fill="#ffffff" stroke="#f43f5e" stroke-width="2" filter="url(#cardShadow)"/>
        <rect width="210" height="26" rx="8" fill="#e11d48" />
        <text x="105" y="18" font-size="11" font-weight="700" fill="#ffffff" text-anchor="middle">👤 ব্যক্তিগত খরচ ("নিজ")</text>
        <text x="10" y="44" font-size="9" font-weight="700" fill="#9f1239">Owner Drawings Tracking</text>
        <text x="10" y="60" font-size="9" fill="#0f172a">• Auto-extracted from Table 4 Expense</text>
        <text x="10" y="76" font-size="9" fill="#0f172a">  rows containing type "নিজ"</text>
        <text x="10" y="92" font-size="9" fill="#0f172a">• Tracks owner personal pocket cash</text>
        <text x="10" y="108" font-size="9" fill="#0f172a">• Displays dedicated modal breakdown</text>
        <line x1="10" y1="120" x2="200" y2="120" stroke="#fecdd3" />
        <text x="10" y="138" font-size="9" font-weight="700" fill="#9f1239">Impact on Liquidity:</text>
        <text x="10" y="154" font-size="9" fill="#0f172a">Deducted from gross cash</text>
        <text x="10" y="170" font-size="9" font-weight="700" fill="#e11d48">Separates business from personal</text>
      </g>

      <!-- Connectors to Liquidity Settlement Engine -->
      <path d="M 135 250 L 300 290" stroke="#059669" stroke-width="2" marker-end="url(#arrowGreen)" />
      <path d="M 365 250 L 400 290" stroke="#2563eb" stroke-width="2" marker-end="url(#arrowBlue)" />
      <path d="M 595 250 L 520 290" stroke="#7e22ce" stroke-width="2" marker-end="url(#arrowPurple)" />
      <path d="M 825 250 L 650 290" stroke="#e11d48" stroke-width="2" marker-end="url(#arrow)" />

      <!-- BOTTOM PANEL: LIQUIDITY RECONCILIATION ENGINE -->
      <g transform="translate(30, 295)">
        <rect width="900" height="205" rx="12" fill="#ffffff" stroke="#f59e0b" stroke-width="2" filter="url(#cardShadow)"/>
        <rect width="900" height="28" rx="10" fill="#d97706" />
        <text x="450" y="19" font-size="12" font-weight="800" fill="#ffffff" text-anchor="middle">LIVE CASH-IN-HAND &amp; NET LIQUIDITY RECONCILIATION EQUATIONS</text>

        <g transform="translate(20, 42)">
          <rect width="260" height="145" rx="8" fill="#fefce8" stroke="#fde047"/>
          <text x="130" y="22" font-size="11" font-weight="800" fill="#854d0e" text-anchor="middle">1. Latest Shop Cash (Financials)</text>
          <text x="10" y="46" font-size="9" fill="#713f12">• Fetched via getLatestShopCash()</text>
          <text x="10" y="62" font-size="9" fill="#713f12">• Reads latest date row in Financials sheet</text>
          <text x="10" y="78" font-size="9" fill="#713f12">• Cell B18 in physical daily ledger</text>
          <text x="10" y="94" font-size="9" font-weight="700" fill="#a16207">• Current physical cash in register drawer</text>
          <text x="10" y="112" font-size="8" fill="#854d0e">Formula: Cash_In_Hand (Latest Date)</text>
          <text x="10" y="130" font-size="8" fill="#64748b">Verified by cashier / accountant nightly</text>
        </g>

        <g transform="translate(310, 42)">
          <rect width="280" height="145" rx="8" fill="#f0fdf4" stroke="#86efac"/>
          <text x="140" y="22" font-size="11" font-weight="800" fill="#166534" text-anchor="middle">2. Total Fund Reserves</text>
          <text x="10" y="46" font-size="9" fill="#14532d">• In-Shop Fund = ∑ savings_shop - ∑ bill_shop</text>
          <text x="10" y="64" font-size="9" fill="#14532d">• Bank Fund = ∑ savings_bank - ∑ bill_bank</text>
          <text x="10" y="82" font-size="9" fill="#14532d">• Savings &amp; Extras Net = Deposits - Withdrawals</text>
          <text x="10" y="100" font-size="9" font-weight="700" fill="#15803d">• Total Reserve Wealth =</text>
          <text x="10" y="118" font-size="9" font-weight="800" fill="#047857">  Net Shop Fund + Net Bank Fund + Extras</text>
          <text x="10" y="134" font-size="8" fill="#15803d">Provides emergency solvency protection</text>
        </g>

        <g transform="translate(620, 42)">
          <rect width="260" height="145" rx="8" fill="#eff6ff" stroke="#93c5fd"/>
          <text x="130" y="22" font-size="11" font-weight="800" fill="#1e40af" text-anchor="middle">3. Net Business Solvency &amp; Cash</text>
          <text x="10" y="46" font-size="9" fill="#1e3a8a"><tspan font-weight="700">Net Operational Cash:</tspan></text>
          <text x="10" y="62" font-size="9" fill="#1d4ed8">= Latest Cash - Unsettled Expenses</text>
          <text x="10" y="80" font-size="9" fill="#1e3a8a"><tspan font-weight="700">Gross Enterprise Worth:</tspan></text>
          <text x="10" y="98" font-size="9" font-weight="700" fill="#1e40af">= Cash + StockValue + Receivables</text>
          <text x="10" y="116" font-size="9" font-weight="700" fill="#2563eb">+ Total Reserves - Total Dues</text>
          <text x="10" y="134" font-size="8" fill="#1d4ed8">Provides 100% financial transparency</text>
        </g>
      </g>
    </svg>
    """

def diagram_9_rbac():
    return f"""
    <svg viewBox="0 0 960 520" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      {get_svg_defs()}
      <rect width="960" height="520" rx="16" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>

      <rect x="25" y="15" width="910" height="38" rx="8" fill="url(#slateGrad)" />
      <text x="480" y="40" fill="#ffffff" font-size="14" font-weight="800" text-anchor="middle">ROLE-BASED ACCESS CONTROL (RBAC) &amp; AUTHENTICATION SECURITY ARCHITECTURE</text>

      <!-- STEP 1: LOGIN FLOW -->
      <g transform="translate(35, 70)">
        <rect width="250" height="195" rx="10" fill="#ffffff" stroke="#64748b" stroke-width="1.5" filter="url(#cardShadow)"/>
        <rect width="250" height="26" rx="8" fill="#334155" />
        <text x="125" y="18" font-size="11" font-weight="700" fill="#ffffff" text-anchor="middle">1. Authentication Gateway</text>
        <text x="15" y="46" font-size="9" font-weight="700" fill="#0f172a">LoginScreen.tsx Component</text>
        <text x="15" y="64" font-size="9" fill="#334155">• Username &amp; Password inputs</text>
        <text x="15" y="80" font-size="9" fill="#334155">• authenticateUser() in auth.ts</text>
        <text x="15" y="96" font-size="9" fill="#334155">• Cleans username &amp; trims whitespace</text>
        <text x="15" y="112" font-size="9" fill="#334155">• Verifies password credentials</text>
        <line x1="15" y1="124" x2="235" y2="124" stroke="#e2e8f0" />
        <text x="15" y="142" font-size="9" font-weight="700" fill="#0284c7">1-Click Quick Demo Login Cards:</text>
        <text x="15" y="158" font-size="8" fill="#475569">👑 russellfoyze | 👔 billal | 💼 kayes | 👁️ juel</text>
        <text x="15" y="174" font-size="9" font-weight="700" fill="#059669">Session Stored in LocalStorage</text>
        <text x="15" y="188" font-size="8" fill="#64748b">Key: yolkflow_auth_user</text>
      </g>

      <path d="M 285 165 L 330 165" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)" />

      <!-- STEP 2: USER PROFILES & ROLES -->
      <g transform="translate(330, 70)">
        <rect width="290" height="195" rx="10" fill="#ffffff" stroke="#6366f1" stroke-width="1.5" filter="url(#cardShadow)"/>
        <rect width="290" height="26" rx="8" fill="#4f46e5" />
        <text x="145" y="18" font-size="11" font-weight="700" fill="#ffffff" text-anchor="middle">2. User Role Matrix (USERS Dict in auth.ts)</text>
        
        <g transform="translate(15, 38)">
          <rect width="260" height="34" rx="6" fill="#f5f3ff" stroke="#ddd6fe"/>
          <text x="10" y="14" font-size="9" font-weight="700" fill="#6d28d9">👑 Russell Foyze (admin)</text>
          <text x="10" y="27" font-size="8" fill="#5b21b6">Tabs: [dashboard, entry, overhead] | Edit: ✓ | Delete: ✓</text>
        </g>
        <g transform="translate(15, 78)">
          <rect width="260" height="34" rx="6" fill="#f0f9ff" stroke="#bae6fd"/>
          <text x="10" y="14" font-size="9" font-weight="700" fill="#0369a1">👔 Billal Hossain (manager)</text>
          <text x="10" y="27" font-size="8" fill="#0284c7">Tabs: [entry, overhead] | Edit: ✓ | Delete: ✗</text>
        </g>
        <g transform="translate(15, 118)">
          <rect width="260" height="34" rx="6" fill="#f0fdf4" stroke="#bbf7d0"/>
          <text x="10" y="14" font-size="9" font-weight="700" fill="#15803d">💼 Kayes (manager)</text>
          <text x="10" y="27" font-size="8" fill="#166534">Tabs: [dashboard, entry, overhead] | Edit: ✓ | Delete: ✓</text>
        </g>
        <g transform="translate(15, 158)">
          <rect width="260" height="32" rx="6" fill="#fef2f2" stroke="#fecaca"/>
          <text x="10" y="13" font-size="9" font-weight="700" fill="#b91c1c">👁️ Juel Ahmed (viewer)</text>
          <text x="10" y="26" font-size="8" fill="#991b1b">Tabs: [dashboard] | Edit: ✗ | Delete: ✗ (Read-Only)</text>
        </g>
      </g>

      <path d="M 620 165 L 665 165" stroke="#6366f1" stroke-width="2" marker-end="url(#arrowPurple)" />

      <!-- STEP 3: CLIENT & SERVER GUARDS -->
      <g transform="translate(665, 70)">
        <rect width="260" height="195" rx="10" fill="#ffffff" stroke="#10b981" stroke-width="1.5" filter="url(#cardShadow)"/>
        <rect width="260" height="26" rx="8" fill="#059669" />
        <text x="130" y="18" font-size="11" font-weight="700" fill="#ffffff" text-anchor="middle">3. UI Permissions &amp; Route Guard</text>
        <text x="15" y="46" font-size="9" font-weight="700" fill="#065f46">Client Enforcements:</text>
        <text x="15" y="64" font-size="9" fill="#0f172a">• Tab visibility filtered by allowedTabs</text>
        <text x="15" y="80" font-size="9" fill="#0f172a">• If role cannot view Dashboard, defaults</text>
        <text x="15" y="94" font-size="9" fill="#0f172a">  automatically to allowedTabs[0]</text>
        <text x="15" y="110" font-size="9" fill="#0f172a">• Save / Commit button locked if !canEdit</text>
        <text x="15" y="126" font-size="9" fill="#0f172a">• Trash / Delete button hidden if !canDelete</text>
        <line x1="15" y1="138" x2="245" y2="138" stroke="#e2e8f0" />
        <text x="15" y="156" font-size="9" font-weight="700" fill="#047857">Active Profile Switcher:</text>
        <text x="15" y="172" font-size="8" fill="#64748b">Allows owner to quickly test role views</text>
        <text x="15" y="186" font-size="8" fill="#64748b">Logout clears LocalStorage session</text>
      </g>

      <!-- BOTTOM PANEL: PERMISSIONS COMPARISON TABLE -->
      <g transform="translate(35, 290)">
        <rect width="890" height="210" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" filter="url(#cardShadow)"/>
        <rect width="890" height="30" rx="10" fill="#f1f5f9" />
        <text x="445" y="20" font-size="12" font-weight="800" fill="#1e293b" text-anchor="middle">DETAILED ROLE PERMISSION CAPABILITY MATRIX</text>

        <!-- Table Headers -->
        <g transform="translate(20, 42)">
          <rect width="850" height="26" fill="#e2e8f0" rx="4"/>
          <text x="120" y="17" font-size="10" font-weight="700" fill="#334155" text-anchor="middle">Capability / Action</text>
          <text x="320" y="17" font-size="10" font-weight="700" fill="#6d28d9" text-anchor="middle">Admin (Owner)</text>
          <text x="520" y="17" font-size="10" font-weight="700" fill="#0369a1" text-anchor="middle">Manager (Accountant)</text>
          <text x="720" y="17" font-size="10" font-weight="700" fill="#b91c1c" text-anchor="middle">Viewer (Auditor/Guest)</text>
        </g>

        <!-- Row 1 -->
        <g transform="translate(20, 72)">
          <text x="120" y="16" font-size="9" fill="#0f172a" text-anchor="middle">View Financial Dashboard &amp; Analytics</text>
          <text x="320" y="16" font-size="11" fill="#059669" text-anchor="middle" font-weight="800">✓ Full Access</text>
          <text x="520" y="16" font-size="9" fill="#475569" text-anchor="middle">Optional (Kayes: ✓, Billal: ✗)</text>
          <text x="720" y="16" font-size="11" fill="#059669" text-anchor="middle" font-weight="800">✓ Full Access</text>
        </g>
        <line x1="20" y1="94" x2="870" y2="94" stroke="#f1f5f9" />

        <!-- Row 2 -->
        <g transform="translate(20, 100)">
          <text x="120" y="16" font-size="9" fill="#0f172a" text-anchor="middle">Enter Daily Hal-Khata (Daily Entry)</text>
          <text x="320" y="16" font-size="11" fill="#059669" text-anchor="middle" font-weight="800">✓ Create &amp; Edit</text>
          <text x="520" y="16" font-size="11" fill="#059669" text-anchor="middle" font-weight="800">✓ Create &amp; Edit</text>
          <text x="720" y="16" font-size="11" fill="#dc2626" text-anchor="middle" font-weight="800">✗ Hidden</text>
        </g>
        <line x1="20" y1="122" x2="870" y2="122" stroke="#f1f5f9" />

        <!-- Row 3 -->
        <g transform="translate(20, 128)">
          <text x="120" y="16" font-size="9" fill="#0f172a" text-anchor="middle">Manage Overhead Expenses &amp; Funds</text>
          <text x="320" y="16" font-size="11" fill="#059669" text-anchor="middle" font-weight="800">✓ Full Control</text>
          <text x="520" y="16" font-size="11" fill="#059669" text-anchor="middle" font-weight="800">✓ Add &amp; View Bills</text>
          <text x="720" y="16" font-size="11" fill="#dc2626" text-anchor="middle" font-weight="800">✗ Hidden</text>
        </g>
        <line x1="20" y1="150" x2="870" y2="150" stroke="#f1f5f9" />

        <!-- Row 4 -->
        <g transform="translate(20, 156)">
          <text x="120" y="16" font-size="9" fill="#0f172a" text-anchor="middle">Delete Historical Transactions</text>
          <text x="320" y="16" font-size="11" fill="#059669" text-anchor="middle" font-weight="800">✓ Enabled</text>
          <text x="520" y="16" font-size="9" fill="#dc2626" text-anchor="middle">✗ Disabled (Billal) / ✓ (Kayes)</text>
          <text x="720" y="16" font-size="11" fill="#dc2626" text-anchor="middle" font-weight="800">✗ Disabled</text>
        </g>
        <line x1="20" y1="178" x2="870" y2="178" stroke="#f1f5f9" />

        <!-- Row 5 -->
        <g transform="translate(20, 184)">
          <text x="120" y="16" font-size="9" fill="#0f172a" text-anchor="middle">AI Vision OCR Scanner Usage</text>
          <text x="320" y="16" font-size="11" fill="#059669" text-anchor="middle" font-weight="800">✓ Unlimited</text>
          <text x="520" y="16" font-size="11" fill="#059669" text-anchor="middle" font-weight="800">✓ Unlimited</text>
          <text x="720" y="16" font-size="11" fill="#dc2626" text-anchor="middle" font-weight="800">✗ Disabled</text>
        </g>
      </g>
    </svg>
    """

def diagram_10_analytics():
    return f"""
    <svg viewBox="0 0 960 520" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      {get_svg_defs()}
      <rect width="960" height="520" rx="16" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>

      <rect x="25" y="15" width="910" height="38" rx="8" fill="url(#blueGrad)" />
      <text x="480" y="40" fill="#ffffff" font-size="14" font-weight="800" text-anchor="middle">REAL-TIME BUSINESS INTELLIGENCE, ANALYTICS &amp; CHARTING ENGINE</text>

      <!-- 4 ANALYTICAL COMPUTATION TIERS -->
      <!-- Tier 1: Dual-Axis Sales vs Margin Chart -->
      <g transform="translate(30, 70)">
        <rect width="210" height="210" rx="10" fill="#ffffff" stroke="#38bdf8" stroke-width="1.5" filter="url(#cardShadow)"/>
        <rect width="210" height="26" rx="8" fill="#0284c7" />
        <text x="105" y="18" font-size="10" font-weight="700" fill="#ffffff" text-anchor="middle">1. Sales vs Margin Spline</text>
        <text x="10" y="44" font-size="9" font-weight="700" fill="#0369a1">Dual-Axis SVG Generation:</text>
        <text x="10" y="60" font-size="8" fill="#0f172a">• getSplinePath() Catmull-Rom</text>
        <text x="10" y="74" font-size="8" fill="#0f172a">• Left Y-Axis: Daily Sales (0-1M+)</text>
        <text x="10" y="88" font-size="8" fill="#0f172a">• Right Y-Axis: Margin Scale</text>
        <text x="10" y="102" font-size="8" fill="#64748b">  Dedicated high-res scale (G5)</text>
        <line x1="10" y1="112" x2="200" y2="112" stroke="#bae6fd" />
        <text x="10" y="128" font-size="8" font-weight="700" fill="#0369a1">Interactive Features:</text>
        <text x="10" y="142" font-size="8" fill="#0f172a">• Interactive hover tooltips</text>
        <text x="10" y="156" font-size="8" fill="#0f172a">• Time Ranges: 7D, 14D, 30D, All</text>
        <text x="10" y="170" font-size="8" fill="#0f172a">• Peak / Lowest annotations</text>
        <text x="10" y="186" font-size="8" font-weight="700" fill="#059669">• 7-Day Rolling Margin Avg</text>
        <text x="10" y="200" font-size="8" fill="#64748b">Smooth vector bezier curves</text>
      </g>

      <!-- Tier 2: Per-Item Sales Donut & Egg Rate Grid -->
      <g transform="translate(260, 70)">
        <rect width="210" height="210" rx="10" fill="#ffffff" stroke="#a855f7" stroke-width="1.5" filter="url(#cardShadow)"/>
        <rect width="210" height="26" rx="8" fill="#7e22ce" />
        <text x="105" y="18" font-size="10" font-weight="700" fill="#ffffff" text-anchor="middle">2. Category &amp; Rate Analysis</text>
        <text x="10" y="44" font-size="9" font-weight="700" fill="#6b21a8">Egg Sales Distribution:</text>
        <text x="10" y="60" font-size="8" fill="#0f172a">• Trigonometric SVG Pie/Donut</text>
        <text x="10" y="74" font-size="8" fill="#0f172a">• Computes SoldQty % &amp; Value %</text>
        <text x="10" y="88" font-size="8" fill="#0f172a">• Color codes for 6 egg types</text>
        <line x1="10" y1="100" x2="200" y2="100" stroke="#ddd6fe" />
        <text x="10" y="116" font-size="9" font-weight="700" fill="#6b21a8">Egg Purchase Rate Trends:</text>
        <text x="10" y="132" font-size="8" fill="#0f172a">• High-precision 0.5 BDT grid ticks</text>
        <text x="10" y="146" font-size="8" fill="#0f172a">• Starts at 2.0 BDT up to peak+2</text>
        <text x="10" y="160" font-size="8" fill="#0f172a">• Individual curves for all 6 types</text>
        <text x="10" y="174" font-size="8" fill="#0f172a">• Sub-ticks at every 0.5 interval</text>
        <text x="10" y="190" font-size="8" font-weight="700" fill="#059669">Detects supplier rate volatility</text>
      </g>

      <!-- Tier 3: Breakage & Waste Analytics -->
      <g transform="translate(490, 70)">
        <rect width="210" height="210" rx="10" fill="#ffffff" stroke="#f43f5e" stroke-width="1.5" filter="url(#cardShadow)"/>
        <rect width="210" height="26" rx="8" fill="#e11d48" />
        <text x="105" y="18" font-size="10" font-weight="700" fill="#ffffff" text-anchor="middle">3. Breakage / Waste Analytics</text>
        <text x="10" y="44" font-size="9" font-weight="700" fill="#9f1239">3-Tier Time Window Rollup:</text>
        <text x="10" y="60" font-size="8" fill="#0f172a"><tspan font-weight="700">1. Daily Waste:</tspan> Current day breakage</text>
        <text x="10" y="74" font-size="8" fill="#0f172a">   Qty, Monetary Cost &amp; % of stock</text>
        <text x="10" y="90" font-size="8" fill="#0f172a"><tspan font-weight="700">2. Weekly Rollup:</tspan> Last 7 days total</text>
        <text x="10" y="104" font-size="8" fill="#0f172a">   Total broken eggs &amp; total loss</text>
        <text x="10" y="120" font-size="8" fill="#0f172a"><tspan font-weight="700">3. Monthly Rollup:</tspan> Calendar month</text>
        <text x="10" y="134" font-size="8" fill="#0f172a">   Cumulative month breakage</text>
        <line x1="10" y1="148" x2="200" y2="148" stroke="#fecdd3" />
        <text x="10" y="164" font-size="8" font-weight="700" fill="#9f1239">Critical Wholesale Metric:</text>
        <text x="10" y="178" font-size="8" fill="#475569">Controls van transport damage &amp;</text>
        <text x="10" y="192" font-size="8" fill="#475569">warehouse crate cracking</text>
      </g>

      <!-- Tier 4: Stock Historic Trend & Peaks -->
      <g transform="translate(720, 70)">
        <rect width="210" height="210" rx="10" fill="#ffffff" stroke="#10b981" stroke-width="1.5" filter="url(#cardShadow)"/>
        <rect width="210" height="26" rx="8" fill="#059669" />
        <text x="105" y="18" font-size="10" font-weight="700" fill="#ffffff" text-anchor="middle">4. Stock Volume Analytics</text>
        <text x="10" y="44" font-size="9" font-weight="700" fill="#065f46">Historic Stock Curve Engine:</text>
        <text x="10" y="60" font-size="8" fill="#0f172a">• Total egg units across 6 types</text>
        <text x="10" y="74" font-size="8" fill="#0f172a">• Smooth area fill under curve</text>
        <line x1="10" y1="88" x2="200" y2="88" stroke="#bbf7d0" />
        <text x="10" y="104" font-size="9" font-weight="700" fill="#065f46">Automated Peak Detection:</text>
        <text x="10" y="120" font-size="8" fill="#0f172a">• Peak Day: Highest stock in history</text>
        <text x="10" y="134" font-size="8" fill="#0f172a">• Lowest Day: Lowest non-zero stock</text>
        <text x="10" y="148" font-size="8" fill="#0f172a">• Current Day marker with badge</text>
        <line x1="10" y1="160" x2="200" y2="160" stroke="#bbf7d0" />
        <text x="10" y="176" font-size="8" font-weight="700" fill="#047857">Capacity Warning System:</text>
        <text x="10" y="192" font-size="8" fill="#475569">Alerts on over-accumulation or</text>
        <text x="10" y="204" font-size="8" fill="#475569">depletion risk</text>
      </g>

      <!-- BOTTOM PANEL: HISTORICAL LEDGER DATA TABLE SPECIFICATION -->
      <g transform="translate(30, 300)">
        <rect width="900" height="200" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" filter="url(#cardShadow)"/>
        <rect width="900" height="28" rx="10" fill="#f1f5f9" />
        <text x="450" y="19" font-size="12" font-weight="800" fill="#1e293b" text-anchor="middle">5. HIGH-PERFORMANCE HISTORICAL SALES &amp; MARGIN LEDGER DATA TABLE</text>

        <g transform="translate(20, 42)">
          <rect width="415" height="142" rx="8" fill="#f8fafc" stroke="#e2e8f0"/>
          <text x="207" y="20" font-size="11" font-weight="700" fill="#0f172a" text-anchor="middle">Table UX &amp; Viewport Engineering</text>
          <text x="15" y="44" font-size="9" fill="#334155"><tspan font-weight="700">Auto-Scroll to Latest (Latest-First):</tspan> Automatically scrolls viewport to</text>
          <text x="15" y="58" font-size="8" fill="#64748b">the bottom so newest transactions are immediately in view upon page load.</text>
          <text x="15" y="76" font-size="9" fill="#334155"><tspan font-weight="700">Active Day Auto-Centering:</tspan> When user selects any date, table smoothly</text>
          <text x="15" y="90" font-size="8" fill="#64748b">scrolls that specific record into vertical center with highlight glow.</text>
          <text x="15" y="108" font-size="9" fill="#334155"><tspan font-weight="700">Multi-Column Sorting:</tspan> Sort by Date (ASC/DESC), Sales, Margin, Cash, Dues</text>
          <text x="15" y="126" font-size="9" fill="#334155"><tspan font-weight="700">Real-Time Search &amp; Filter:</tspan> Instant search by Bengali Day, Date, Page Number</text>
        </g>

        <g transform="translate(465, 42)">
          <rect width="415" height="142" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
          <text x="207" y="20" font-size="11" font-weight="700" fill="#1e40af" text-anchor="middle">Full Column Financial Ledger Data Mapping</text>
          <text x="15" y="44" font-size="9" fill="#1e3a8a"><tspan font-weight="700">Col 1-3:</tspan> Date (DD/MM/YYYY), Day (Bengali), Page No</text>
          <text x="15" y="60" font-size="9" fill="#1e3a8a"><tspan font-weight="700">Col 4-5:</tspan> Total Sold Egg Quantity &amp; Total Stock Cost</text>
          <text x="15" y="76" font-size="9" fill="#1e3a8a"><tspan font-weight="700">Col 6-7:</tspan> Daily Sales Turnover (BDT) &amp; Cell G5 Profit Margin</text>
          <text x="15" y="92" font-size="9" fill="#1e3a8a"><tspan font-weight="700">Col 8-9:</tspan> Total Due Balance (বাকি) &amp; Total Liquid Cash (নগদ)</text>
          <text x="15" y="108" font-size="9" fill="#1e3a8a"><tspan font-weight="700">Col 10-11:</tspan> Stock Valuation (Cell D12) &amp; Total Expenses (Cell B43)</text>
          <text x="15" y="124" font-size="9" fill="#1e3a8a"><tspan font-weight="700">Col 12:</tspan> Quick Action Buttons (Edit in Hal-Khata, View Daily Sheet)</text>
        </g>
      </g>
    </svg>
    """
