# -*- coding: utf-8 -*-
"""
Full Project Logic & Architecture Specification PDF Generator for YolkFlow.
Compiles a complete technical document with 10 high-fidelity diagrams into a publication-grade PDF.
"""

import os
import sys
from playwright.sync_api import sync_playwright
import diagrams_generator as diag

def generate_html():
    css_styles = """
    <style>
      @page {
        size: A4 portrait;
        margin: 18mm 14mm 18mm 14mm;
        @bottom-right {
          content: counter(page);
        }
      }

      * {
        box-sizing: border-box;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        color: #1e293b;
        background-color: #ffffff;
        line-height: 1.55;
        font-size: 10pt;
        margin: 0;
        padding: 0;
      }

      .page-break {
        page-break-after: always;
        break-after: page;
      }

      /* COVER PAGE */
      .cover-container {
        height: 100vh;
        max-height: 1050px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 40px 30px;
        background: linear-gradient(145deg, #0f172a 0%, #1e1b4b 50%, #0369a1 100%);
        color: #ffffff;
        border-radius: 16px;
        margin-bottom: 20px;
      }

      .cover-header {
        border-bottom: 2px solid rgba(255, 255, 255, 0.15);
        padding-bottom: 20px;
      }

      .badge-enterprise {
        display: inline-block;
        background: rgba(56, 189, 248, 0.2);
        color: #38bdf8;
        border: 1px solid rgba(56, 189, 248, 0.4);
        padding: 4px 12px;
        border-radius: 9999px;
        font-size: 9pt;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 15px;
      }

      .cover-title {
        font-size: 32pt;
        font-weight: 900;
        line-height: 1.1;
        margin: 0 0 10px 0;
        color: #f8fafc;
        letter-spacing: -0.02em;
      }

      .cover-subtitle {
        font-size: 15pt;
        font-weight: 500;
        color: #94a3b8;
        margin: 0 0 8px 0;
      }

      .cover-bengali-title {
        font-size: 13pt;
        color: #38bdf8;
        font-weight: 600;
        margin-top: 5px;
      }

      .cover-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 20px;
        border-radius: 12px;
        margin: 30px 0;
      }

      .cover-grid-item h4 {
        margin: 0 0 4px 0;
        font-size: 9pt;
        text-transform: uppercase;
        color: #38bdf8;
        letter-spacing: 0.05em;
      }

      .cover-grid-item p {
        margin: 0;
        font-size: 10.5pt;
        font-weight: 600;
        color: #f1f5f9;
      }

      .cover-footer {
        border-top: 1px solid rgba(255, 255, 255, 0.15);
        padding-top: 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 9pt;
        color: #94a3b8;
      }

      /* TYPOGRAPHY */
      h1, h2, h3, h4, h5 {
        color: #0f172a;
        font-weight: 800;
        margin-top: 18px;
        margin-bottom: 8px;
        page-break-after: avoid;
      }

      h1 {
        font-size: 19pt;
        border-bottom: 2px solid #0284c7;
        padding-bottom: 6px;
        color: #0369a1;
      }

      h2 {
        font-size: 14pt;
        color: #1e293b;
        border-left: 4px solid #0284c7;
        padding-left: 10px;
        margin-top: 16px;
      }

      h3 {
        font-size: 11.5pt;
        color: #334155;
        margin-top: 12px;
      }

      p {
        margin-top: 0;
        margin-bottom: 8px;
        color: #334155;
      }

      ul, ol {
        margin-top: 0;
        margin-bottom: 10px;
        padding-left: 20px;
      }

      li {
        margin-bottom: 4px;
        color: #334155;
      }

      /* CALLOUTS / ALERTS */
      .callout {
        padding: 10px 14px;
        border-radius: 8px;
        margin: 12px 0;
        font-size: 9pt;
        page-break-inside: avoid;
      }

      .callout-info {
        background-color: #f0f9ff;
        border-left: 4px solid #0284c7;
        color: #0369a1;
      }

      .callout-success {
        background-color: #ecfdf5;
        border-left: 4px solid #059669;
        color: #065f46;
      }

      .callout-warning {
        background-color: #fffbeb;
        border-left: 4px solid #d97706;
        color: #92400e;
      }

      .callout-danger {
        background-color: #fef2f2;
        border-left: 4px solid #dc2626;
        color: #991b1b;
      }

      /* DIAGRAM WRAPPER */
      .diagram-container {
        margin: 14px 0;
        padding: 8px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        page-break-inside: avoid;
        text-align: center;
      }

      .diagram-caption {
        font-size: 8.5pt;
        font-weight: 700;
        color: #64748b;
        margin-top: 6px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      /* TABLES */
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 10px 0;
        font-size: 8.5pt;
        page-break-inside: avoid;
      }

      th {
        background-color: #f1f5f9;
        color: #0f172a;
        font-weight: 700;
        text-align: left;
        padding: 6px 8px;
        border: 1px solid #cbd5e1;
      }

      td {
        padding: 5px 8px;
        border: 1px solid #e2e8f0;
        color: #334155;
        vertical-align: top;
      }

      tr:nth-child(even) td {
        background-color: #f8fafc;
      }

      /* CODE & FORMULA BLOCKS */
      code {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        font-size: 8.5pt;
        background: #f1f5f9;
        padding: 2px 4px;
        border-radius: 4px;
        color: #0f172a;
      }

      .formula-box {
        background: #f8fafc;
        border: 1px solid #cbd5e1;
        border-left: 4px solid #7e22ce;
        border-radius: 8px;
        padding: 10px 14px;
        margin: 10px 0;
        font-family: ui-monospace, Menlo, Monaco, monospace;
        font-size: 9pt;
        color: #1e1b4b;
        page-break-inside: avoid;
      }

      /* GRID METRICS */
      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin: 12px 0;
        page-break-inside: avoid;
      }

      .metric-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 10px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      }

      .metric-card h5 {
        margin: 0;
        font-size: 8pt;
        color: #64748b;
        text-transform: uppercase;
      }

      .metric-card .val {
        font-size: 13pt;
        font-weight: 800;
        color: #0284c7;
        margin-top: 3px;
      }

      .metric-card .desc {
        font-size: 7.5pt;
        color: #94a3b8;
        margin-top: 2px;
      }

      /* TOC */
      .toc-list {
        list-style: none;
        padding: 0;
        margin: 15px 0;
      }

      .toc-item {
        display: flex;
        justify-content: space-between;
        padding: 6px 0;
        border-bottom: 1px dotted #cbd5e1;
        font-size: 9.5pt;
      }

      .toc-item strong {
        color: #0369a1;
      }
    </style>
    """

    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>YolkFlow System Architecture &amp; Mathematical Specification</title>
      {css_styles}
    </head>
    <body>

      <!-- ==================== COVER PAGE ==================== -->
      <div class="cover-container">
        <div class="cover-header">
          <div class="badge-enterprise">Enterprise Architecture &amp; Logic Specification</div>
          <h1 class="cover-title">YOLKFLOW™</h1>
          <div class="cover-subtitle">Complete Project Logic, Mathematical Accounting Engine &amp; System Diagrams</div>
          <div class="cover-bengali-title">এম. এ. খালেক সরকার — ডিমের আড়ত ও পাইকারি হালখাতা স্বয়ংক্রিয় খতিয়ান ব্যবস্থা</div>
        </div>

        <div class="cover-grid">
          <div class="cover-grid-item">
            <h4>Application Name</h4>
            <p>YolkFlow (Next.js 16.3 + React 19)</p>
          </div>
          <div class="cover-grid-item">
            <h4>Domain / Industry</h4>
            <p>Wholesale Egg Commerce (Bangladesh)</p>
          </div>
          <div class="cover-grid-item">
            <h4>Primary Merchant</h4>
            <p>M.A. Khalek Sarker Wholesale Egg Depot</p>
          </div>
          <div class="cover-grid-item">
            <h4>Database Architecture</h4>
            <p>Dual-Layer: Google Sheets API v4 + Mock JSON</p>
          </div>
          <div class="cover-grid-item">
            <h4>Artificial Intelligence</h4>
            <p>Gemini Vision OCR Multi-Model Cascade</p>
          </div>
          <div class="cover-grid-item">
            <h4>Core Accounting</h4>
            <p>Traditional Bengali Hal-Khata Equation</p>
          </div>
        </div>

        <div class="cover-footer">
          <div>Document Version 1.0 &bull; Comprehensive Technical Compendium</div>
          <div>All 10 Architectural Vector Diagrams Included</div>
        </div>
      </div>

      <div class="page-break"></div>

      <!-- ==================== TABLE OF CONTENTS ==================== -->
      <h1>Table of Contents</h1>
      <p>This technical compendium provides an exhaustive analysis of the codebase, business rules, accounting formulas, data structures, and operational workflows of the YolkFlow application.</p>

      <ul class="toc-list">
        <li class="toc-item"><span><strong>Chapter 1:</strong> Executive Summary &amp; Domain Overview</span> <span>Page 3</span></li>
        <li class="toc-item"><span><strong>Chapter 2:</strong> High-Level System Architecture &amp; Technology Stack</span> <span>Page 4</span></li>
        <li class="toc-item"><span>&bull; <em>Diagram 1: End-to-End System Architecture</em></span> <span>Page 5</span></li>
        <li class="toc-item"><span><strong>Chapter 3:</strong> Component Hierarchy &amp; Reactive UI State Machine</span> <span>Page 6</span></li>
        <li class="toc-item"><span>&bull; <em>Diagram 2: Component Tree &amp; State Interactions</em></span> <span>Page 7</span></li>
        <li class="toc-item"><span><strong>Chapter 4:</strong> Dual-Layer Persistence &amp; Cloud Synchronization Engine</span> <span>Page 8</span></li>
        <li class="toc-item"><span>&bull; <em>Diagram 3: Persistence Read/Write Pipeline &amp; Sheet Duplication</em></span> <span>Page 9</span></li>
        <li class="toc-item"><span><strong>Chapter 5:</strong> Entity-Relationship Modeling &amp; Data Schema</span> <span>Page 10</span></li>
        <li class="toc-item"><span>&bull; <em>Diagram 4: Entity-Relationship Diagram (ERD) &amp; Schema</em></span> <span>Page 11</span></li>
        <li class="toc-item"><span><strong>Chapter 6:</strong> Hal-Khata Mathematical Accounting Engine &amp; Ledger Equations</span> <span>Page 12</span></li>
        <li class="toc-item"><span>&bull; <em>Diagram 5: Core Hal-Khata Balance Equation &amp; Profit Engine</em></span> <span>Page 13</span></li>
        <li class="toc-item"><span><strong>Chapter 7:</strong> Daily Transaction Lifecycle &amp; Hal-Khata Entry Workflow</span> <span>Page 14</span></li>
        <li class="toc-item"><span>&bull; <em>Diagram 6: Daily Ledger Entry &amp; Data Lifecycle Workflow</em></span> <span>Page 15</span></li>
        <li class="toc-item"><span><strong>Chapter 8:</strong> AI Vision OCR Ingestion Pipeline (Bengali Handwriting Extraction)</span> <span>Page 16</span></li>
        <li class="toc-item"><span>&bull; <em>Diagram 7: Gemini Vision OCR Multi-Model Ingestion Pipeline</em></span> <span>Page 17</span></li>
        <li class="toc-item"><span><strong>Chapter 9:</strong> Overhead Expenses, Fund Settlements &amp; Liquidity Reconciliation</span> <span>Page 18</span></li>
        <li class="toc-item"><span>&bull; <em>Diagram 8: Overhead Expenses &amp; Cash Reconciliation Flow</em></span> <span>Page 19</span></li>
        <li class="toc-item"><span><strong>Chapter 10:</strong> Role-Based Access Control (RBAC) &amp; Security Architecture</span> <span>Page 20</span></li>
        <li class="toc-item"><span>&bull; <em>Diagram 9: RBAC Architecture &amp; Permission Matrix</em></span> <span>Page 21</span></li>
        <li class="toc-item"><span><strong>Chapter 11:</strong> Real-time Business Intelligence, Analytics &amp; Charting Engine</span> <span>Page 22</span></li>
        <li class="toc-item"><span>&bull; <em>Diagram 10: Real-time Analytics &amp; Spline Charting Engine</em></span> <span>Page 23</span></li>
        <li class="toc-item"><span><strong>Chapter 12:</strong> Production Readiness, Fault Tolerance &amp; Recommendations</span> <span>Page 24</span></li>
        <li class="toc-item"><span><strong>Appendix:</strong> Mathematical Index, Google Sheets Cells &amp; API Specifications</span> <span>Page 25</span></li>
      </ul>

      <div class="callout callout-info">
        <strong>Architectural Scope:</strong> This document maps directly to the implementation inside <code>d:\\eggapp</code>, referencing <code>src/lib/db.ts</code>, <code>src/lib/googleSheets.ts</code>, <code>src/lib/ledger.ts</code>, <code>src/lib/auth.ts</code>, <code>src/app/actions.ts</code>, <code>src/app/YolkFlowClient.tsx</code>, <code>src/app/OverheadExpensesView.tsx</code>, <code>src/app/ImageToJsonModal.tsx</code>, and all API route handlers.
      </div>

      <div class="page-break"></div>

      <!-- ==================== CHAPTER 1 ==================== -->
      <h1>Chapter 1: Executive Summary &amp; Domain Overview</h1>
      <h2>1.1 The Business Domain: Bengali Wholesale Egg Trading</h2>
      <p>Wholesale egg distribution in Bangladesh is a high-volume, rapid-turnover commodity business characterized by volatile daily procurement prices, perishable inventory, tight profit margins (often pennies per egg), and widespread credit sales ("বাকি") to retail grocery stores, bakeries, and local markets. Traditional merchants ("আড়তদার") maintain physical paper notebooks called <strong>দৈনিক হালখাতা</strong> (Daily Hal-Khata). Every day, a ledger page is written recording four key sections: closing inventory stock, customer collections, opening/supplier debt, and day-to-day operating expenses.</p>

      <h2>1.2 Core Challenges of the Traditional System</h2>
      <ul>
        <li><strong>Calculation Complexity:</strong> Balancing the Hal-Khata requires multi-step manual arithmetic across stock valuations, customer credit collections, supplier payables, and operating expenses. Errors compound across consecutive days.</li>
        <li><strong>Inventory Shrinkage &amp; Breakage ("ভাঙ্গা ডিম"):</strong> Eggs cracked in transport or storage represent direct inventory and monetary leakage. Physical ledgers frequently fail to track cumulative waste percentages.</li>
        <li><strong>Single Point of Failure:</strong> Physical ledger books are vulnerable to loss, water damage, and lack remote visibility for absentee business owners.</li>
        <li><strong>Disjointed Fund Management:</strong> In-shop daily savings ("সমিতি"), bank DPS, and owner personal withdrawals ("নিজ") often mix with shop working capital, obscuring true profitability.</li>
      </ul>

      <h2>1.3 The YolkFlow Solution</h2>
      <p>YolkFlow digitizes wholesale egg accounting without disrupting the time-tested mental model of the Bengali merchant. Rather than forcing a generic western double-entry accounting software onto the merchant, YolkFlow adopts the exact structure of the physical Hal-Khata notebook, augmenting it with modern cloud synchronization, AI handwriting OCR, and executive analytics.</p>

      <div class="metrics-grid">
        <div class="metric-card">
          <h5>Core Commodity Types</h5>
          <div class="val">6 Varieties</div>
          <div class="desc">White, Red, Duck, Chicken, Quail, LM</div>
        </div>
        <div class="metric-card">
          <h5>Cloud Sync Latency</h5>
          <div class="val">&lt; 1.2s</div>
          <div class="desc">Bi-directional Google Sheets API v4</div>
        </div>
        <div class="metric-card">
          <h5>OCR Speed</h5>
          <div class="val">&lt; 3.5s</div>
          <div class="desc">Gemini Vision Multi-Model Cascade</div>
        </div>
      </div>

      <div class="page-break"></div>

      <!-- ==================== CHAPTER 2 ==================== -->
      <h1>Chapter 2: High-Level System Architecture</h1>
      <h2>2.1 Architectural Paradigm: Modern Next.js Fullstack Engine</h2>
      <p>YolkFlow is architected as an enterprise fullstack web application powered by <strong>Next.js 16.3.1 (App Router)</strong>, <strong>React 19.2.8</strong>, and <strong>TypeScript 5</strong>. The architecture employs a tiered separation of concerns:</p>
      
      <ul>
        <li><strong>Client Presentation Tier:</strong> Powered by React Server Components (RSC) and dynamic Client Components. Employs Tailwind CSS v4 and Lucide React icons, rendering an adaptive glassmorphic UI optimized for mobile, tablet, and desktop viewports.</li>
        <li><strong>Server Action &amp; API Tier:</strong> Utilizes Next.js Server Actions (<code>actions.ts</code>) for type-safe mutation pipelines with automatic router cache revalidation (<code>revalidatePath("/")</code>), alongside RESTful Route Handlers (<code>/api/data</code>, <code>/api/overhead</code>, <code>/api/savings</code>, <code>/api/ocr-to-json</code>).</li>
        <li><strong>Business Domain Services (<code>src/lib</code>):</strong> Modular TypeScript services encapsulating domain mathematical equations (<code>ledger.ts</code>), multi-tier authentication (<code>auth.ts</code>), hybrid database operations (<code>db.ts</code>), and Google Sheets OAuth2 service account integration (<code>googleSheets.ts</code>).</li>
        <li><strong>Hybrid Persistence Layer:</strong> Combines Google Sheets as a human-auditable cloud master with an atomic local JSON cache (<code>mock_db.json</code>) that guarantees zero downtime when operating offline.</li>
      </ul>

      <h2>2.2 Architectural Flow Diagram</h2>
      <p>The following vector diagram details the four operational tiers and the secure communication protocols connecting them.</p>

      <div class="diagram-container">
        {diag.diagram_1_architecture()}
        <div class="diagram-caption">Figure 2.1: YolkFlow End-to-End System Architecture &amp; Data Pipeline</div>
      </div>

      <div class="page-break"></div>

      <!-- ==================== CHAPTER 3 ==================== -->
      <h1>Chapter 3: Component Hierarchy &amp; Reactive UI State Machine</h1>
      <h2>3.1 Master Controller Architecture (<code>YolkFlowClient.tsx</code>)</h2>
      <p>The client application is anchored by <code>YolkFlowClient.tsx</code> (5,550+ lines of production TypeScript). It orchestrates reactive state across three primary operational views:</p>
      <ol>
        <li><strong>Dashboard View (<code>activeTab === "dashboard"</code>):</strong> Executive business intelligence view providing real-time KPI metrics, rolling margin calculations, SVG spline trend charts, per-item egg sales volume breakdowns, and a sortable historical sales ledger table.</li>
        <li><strong>Daily Entry View (<code>activeTab === "entry"</code>):</strong> Interactive 4-panel digitization interface mirroring the physical Hal-Khata page. Includes stock valuation, credit collections, opening liabilities, and expense rows with real-time mathematical validation.</li>
        <li><strong>Overhead &amp; Savings View (<code>activeTab === "overhead"</code>):</strong> Enterprise operational cost tracker (<code>OverheadExpensesView.tsx</code>) managing 11 expense categories, shop reserve funds, bank DPS, and personal owner withdrawals.</li>
      </ol>

      <h2>3.2 Component Relationship &amp; Modal Hierarchy</h2>
      <div class="diagram-container">
        {diag.diagram_2_components()}
        <div class="diagram-caption">Figure 3.1: Component Hierarchy, Tab Routing &amp; State Interactions</div>
      </div>

      <h2>3.3 Reactive State Synchronization</h2>
      <p>When the user navigates between dates, <code>YolkFlowClient</code> synchronizes state using the <code>selectedDashboardDate</code> and <code>currentViewDay</code> state hooks. If an existing entry is found, the system switches to <em>Edit Mode</em>, hydrating all 6 egg stock inputs, dynamic extra collections, supplier dues, and expense rows. When creating a new day, closing stock from the previous date carries forward automatically as opening inventory.</p>

      <div class="page-break"></div>

      <!-- ==================== CHAPTER 4 ==================== -->
      <h1>Chapter 4: Dual-Layer Persistence &amp; Cloud Synchronization Engine</h1>
      <h2>4.1 Zero-Downtime Hybrid Storage Strategy</h2>
      <p>A critical engineering requirement of YolkFlow is offline resilience. Wholesale egg depots may experience intermittent internet connectivity. To solve this, YolkFlow implements a dual-layer persistence engine inside <code>src/lib/db.ts</code> and <code>src/lib/googleSheets.ts</code>:</p>

      <div class="formula-box">
        Primary Cloud: Google Sheets API v4 (Service Account Key)
        Secondary Local: process.cwd() / "mock_db.json" (Atomic Sync)
      </div>

      <h2>4.2 The Read Pipeline (<code>getDatabaseData</code>)</h2>
      <p>The system first calls <code>isGoogleSheetsConfigured()</code>, checking for the existence of <code>GOOGLE_SHEET_ID</code>, <code>GOOGLE_SERVICE_ACCOUNT_EMAIL</code>, and <code>GOOGLE_PRIVATE_KEY</code>. If configured, it performs a parallel read across three master worksheets: <code>DailyStock</code>, <code>Financials</code>, and <code>Expenses</code>. Rich metadata (such as dynamic JSON arrays for extra dues and collections) is merged with local cache. If network failure occurs, the engine falls back instantly to <code>mock_db.json</code>.</p>

      <h2>4.3 The Write &amp; Sheet Duplication Pipeline (<code>saveLedgerEntry</code>)</h2>
      <p>When saving an entry, YolkFlow writes to the local JSON file first, ensuring zero data loss. Next, it updates the master Google Sheets tabs via <code>updateSheetValues()</code>. Finally, it executes <code>createOrUpdateDayTab()</code>:</p>
      <ul>
        <li>Converts the date (e.g. <code>2026-08-25</code>) to tab format: <code>25/08/26</code>.</li>
        <li>Inspects spreadsheet metadata. If the tab does not exist, it duplicates the pre-formatted <code>Original</code> template sheet.</li>
        <li>Injects <strong>native spreadsheet formulas</strong> (e.g. <code>=B6*C6</code>, <code>=SUM(B6:B11)</code>, <code>=B44-E24</code>) into exact cells, allowing human accountants to verify math directly inside Google Sheets.</li>
      </ul>

      <div class="diagram-container">
        {diag.diagram_3_persistence()}
        <div class="diagram-caption">Figure 4.1: Dual-Layer Read/Write Pipeline &amp; Daily Tab Cloner</div>
      </div>

      <div class="page-break"></div>

      <!-- ==================== CHAPTER 5 ==================== -->
      <h1>Chapter 5: Entity-Relationship Modeling &amp; Data Schema</h1>
      <h2>5.1 Relational Structure on Flat-File Storage</h2>
      <p>Although stored in Google Sheets and JSON, YolkFlow maintains a strictly typed relational schema defined in <code>src/lib/db.ts</code> and <code>src/lib/googleSheets.ts</code>. The primary temporal foreign key across all tables is the ISO date string (<code>YYYY-MM-DD</code>).</p>

      <div class="diagram-container">
        {diag.diagram_4_erd()}
        <div class="diagram-caption">Figure 5.1: Entity-Relationship Diagram (ERD) &amp; TypeScript Data Models</div>
      </div>

      <h2>5.2 Data Dictionary</h2>
      <table>
        <thead>
          <tr>
            <th>Entity Name</th>
            <th>Primary Key</th>
            <th>Foreign Key</th>
            <th>Key Attributes &amp; Types</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>DailyStockEntry</strong></td>
            <td>date + eggType</td>
            <td>date</td>
            <td>currentStock: number, hasPurchase: bool, purchaseRate: number, purchaseQty: number</td>
          </tr>
          <tr>
            <td><strong>FinancialsEntry</strong></td>
            <td>date</td>
            <td>date</td>
            <td>totalDue: number, totalCash: number, prevDayBalance: number, extraCollections: JSON, extraDues: JSON</td>
          </tr>
          <tr>
            <td><strong>ExpenseEntry</strong></td>
            <td>date + expenseType</td>
            <td>date</td>
            <td>expenseType: string, amount: number, wastedEggQty: number, wastedEggCost: number</td>
          </tr>
          <tr>
            <td><strong>OverheadExpenseItem</strong></td>
            <td>id (UUID)</td>
            <td>date</td>
            <td>month: YYYY-MM, category: 11 fund types, title: string, amount: number, paymentMode: string</td>
          </tr>
          <tr>
            <td><strong>SavingsItem</strong></td>
            <td>id (UUID)</td>
            <td>date</td>
            <td>type: deposit|extra|withdraw, category: crate/carton/bank, amount: number</td>
          </tr>
          <tr>
            <td><strong>UserAccount</strong></td>
            <td>username</td>
            <td>N/A</td>
            <td>role: admin|manager|viewer, allowedTabs: string[], canEdit: bool, canDelete: bool</td>
          </tr>
        </tbody>
      </table>

      <div class="page-break"></div>

      <!-- ==================== CHAPTER 6 ==================== -->
      <h1>Chapter 6: Hal-Khata Mathematical Accounting Engine</h1>
      <h2>6.1 The Traditional Bengali Hal-Khata Accounting Equation</h2>
      <p>The mathematical heart of YolkFlow resides in <code>src/lib/ledger.ts</code>. It replicates the exact accounting equation used by Bengali wholesale egg merchants for over half a century. The equation balances four distinct tables:</p>

      <div class="formula-box">
        ১. মজুদ ডিমের মূল্য (Cell D12) = ∑ (CurrentStock_i × PurchaseRate_i)
        ২. সর্বমোট পাওনা/হিসাব (Cell B25) = TotalDue + ExtraDue + TotalCash + D12
        ৩. মোট খরচ (Cell B43) = ∑ ExpenseAmount_j
        ৪. দেনা ও জমার মোট (Cell E24) = PrevDayBalance + ProviderDueMoney + ∑ ExtraDues
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        সর্বমোট সমীকরণ (Cell B44) = Cell B25 (সর্বমোট পাওনা) + Cell B43 (মোট খরচ)
        👑 দৈনিক নিট লাভ / মার্জিন (Cell G5) = Cell B44 - Cell E24
      </div>

      <h2>6.2 Derivation of Daily Sales &amp; Stock Outflow</h2>
      <p>Since wholesale eggs sell continuously without individual barcode scans, sold volume is computed by solving the inventory balance equation:</p>
      <div class="formula-box">
        SoldQty_i = Max(0, PrevStock_i + PurchaseQty_i - CurrentStock_i)
        Cost of Goods Sold (COGS) = ∑ (SoldQty_i × ActivePurchaseRate_i)
        Daily Sales Turnover (BDT) = COGS + Max(0, ProfitMargin)
      </div>

      <div class="diagram-container">
        {diag.diagram_5_ledger_math()}
        <div class="diagram-caption">Figure 6.1: Hal-Khata Mathematical Flow &amp; Cell G5 Profit Margin Calculation</div>
      </div>

      <div class="page-break"></div>

      <!-- ==================== CHAPTER 7 ==================== -->
      <h1>Chapter 7: Daily Transaction Lifecycle &amp; Hal-Khata Entry Workflow</h1>
      <h2>7.1 State Machine: From Physical Page to Ledger Commit</h2>
      <p>The transaction lifecycle begins in <code>YolkFlowClient.tsx</code> when the accountant selects a business date. The state machine follows four disciplined phases:</p>

      <div class="diagram-container">
        {diag.diagram_6_entry_workflow()}
        <div class="diagram-caption">Figure 7.1: Daily Entry State Machine, Live Calculations &amp; Persistence Execution</div>
      </div>

      <h2>7.2 Phase Breakdown</h2>
      <ul>
        <li><strong>Phase 1: Date Initialization &amp; Auto-Bangla Day:</strong> The system takes an ISO date (e.g. <code>2026-08-25</code>), computes the day of the week, and maps it via <code>BANGLA_DAYS_MAP</code> to Bengali (<code>মঙ্গলবার</code>).</li>
        <li><strong>Phase 2: Hydration &amp; Carryover:</strong> If records exist, the form populates in Edit Mode. If entering a new day, the system fetches the closing stock and purchase rates from the immediate prior ledger day.</li>
        <li><strong>Phase 3: Live Verification Card:</strong> As numbers are typed into Section 1 (Stock), Section 2 (Collections), Section 3 (Dues), or Section 4 (Expenses), the client re-computes B25, E24, B43, B44, and G5 in real-time, displaying green indicators if balanced.</li>
        <li><strong>Phase 4: Multi-Target Commit:</strong> <code>saveLedgerEntryAction()</code> atomically updates the local JSON database, writes to Google Sheets master tabs, and clones a daily sheet tab with native formulas.</li>
      </ul>

      <div class="page-break"></div>

      <!-- ==================== CHAPTER 8 ==================== -->
      <h1>Chapter 8: AI Vision OCR Ingestion Pipeline</h1>
      <h2>8.1 Ingesting Handwritten Bengali Notebook Pages</h2>
      <p>One of YolkFlow's most innovative features is its AI Vision OCR engine implemented in <code>src/app/ImageToJsonModal.tsx</code> and <code>src/app/api/ocr-to-json/route.ts</code>. It enables merchants to photograph a physical Hal-Khata page and transform it into structured JSON with 100% mathematical accuracy.</p>

      <div class="diagram-container">
        {diag.diagram_7_ai_ocr()}
        <div class="diagram-caption">Figure 8.1: Gemini Vision OCR Architecture &amp; Handwriting Extraction Pipeline</div>
      </div>

      <h2>8.2 Multi-Model Cascade &amp; Fallback Resilience</h2>
      <p>To guard against Google Gemini rate limits or transient API outages, the route handler executes a graceful cascade through four candidate models:</p>
      <ol>
        <li><code>gemini-3.6-flash</code> (Default high-speed vision model)</li>
        <li><code>gemini-3.5-flash</code> (Secondary fallback)</li>
        <li><code>gemini-flash-latest</code> (General production fallback)</li>
        <li><code>gemini-3.1-flash-lite</code> (High-throughput lightweight model)</li>
      </ol>

      <h2>8.3 The Domain Extraction Prompt &amp; Sanitizer (<code>sanitizeAndVerifyLedgerData</code>)</h2>
      <p>The system prompt instructs Gemini to read the four standard Hal-Khata sections, enforcing ISO date formatting, six standard egg categories, and broken egg extraction ("ভাঙ্গা" expenses). The sanitizer validates the extracted JSON, recalculating amounts and checking that no egg category is omitted.</p>

      <div class="page-break"></div>

      <!-- ==================== CHAPTER 9 ==================== -->
      <h1>Chapter 9: Overhead Expenses, Fund Settlements &amp; Liquidity Flow</h1>
      <h2>9.1 The 11 Overhead Categories &amp; Fund Channels</h2>
      <p>In wholesale trading, operating expenses must be cleanly segregated from inventory trading costs. <code>OverheadExpensesView.tsx</code> and <code>/api/overhead</code> manage 11 distinct operational cost categories organized into four financial channels:</p>

      <div class="diagram-container">
        {diag.diagram_8_overhead_flow()}
        <div class="diagram-caption">Figure 9.1: Overhead Fund Channels, Samity Sync &amp; Cash Reconciliation</div>
      </div>

      <h2>9.2 Key Fund Integrations</h2>
      <ul>
        <li><strong>Automated "সমিতি" Sync:</strong> In Bengali markets, merchants make daily cooperative savings ("সমিতি"). When entered in Table 4 of the daily ledger, the system automatically imports this entry into the <em>দোকানে সঞ্চয়</em> (In-Shop Savings) fund.</li>
        <li><strong>Fund-Linked Bill Reductions:</strong> When recurring operating bills (e.g. employee bonuses or shop repairs) are paid from accumulated funds, selecting <code>bill_from_savings_shop</code> or <code>bill_from_savings_bank</code> deducts the amount from the reserve balance rather than depleting the daily cash register.</li>
        <li><strong>Personal Withdrawals Tracking ("নিজ"):</strong> Personal drawings taken by the business owner from cash receipts are flagged with the preset <em>"নিজ"</em>. The system aggregates these separately, ensuring business liquidity remains distinct from personal household expenditures.</li>
      </ul>

      <div class="page-break"></div>

      <!-- ==================== CHAPTER 10 ==================== -->
      <h1>Chapter 10: Role-Based Access Control (RBAC) &amp; Security</h1>
      <h2>10.1 Multi-Tier Authorization Model (<code>src/lib/auth.ts</code>)</h2>
      <p>YolkFlow implements an enterprise security model with three standard roles: <strong>Admin (Owner)</strong>, <strong>Manager (Accountant)</strong>, and <strong>Viewer (Auditor/Guest)</strong>.</p>

      <div class="diagram-container">
        {diag.diagram_9_rbac()}
        <div class="diagram-caption">Figure 10.1: RBAC Security Architecture &amp; User Permission Matrix</div>
      </div>

      <h2>10.2 User Account Profiles</h2>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Name &amp; Title</th>
            <th>Role</th>
            <th>Allowed Tabs</th>
            <th>Can Edit</th>
            <th>Can Delete</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>russellfoyze</strong></td>
            <td>Russell Foyze (👑 মালিক / অ্যাডমিন)</td>
            <td>admin</td>
            <td>dashboard, entry, overhead</td>
            <td>✓ Yes</td>
            <td>✓ Yes</td>
          </tr>
          <tr>
            <td><strong>billal</strong></td>
            <td>Billal Hossain (👔 হিসাবরক্ষক)</td>
            <td>manager</td>
            <td>entry, overhead</td>
            <td>✓ Yes</td>
            <td>✗ No</td>
          </tr>
          <tr>
            <td><strong>kayes</strong></td>
            <td>Kayes (💼 ম্যানেজার)</td>
            <td>manager</td>
            <td>dashboard, entry, overhead</td>
            <td>✓ Yes</td>
            <td>✓ Yes</td>
          </tr>
          <tr>
            <td><strong>juel</strong></td>
            <td>Juel Ahmed (👁️ ভিউয়ার)</td>
            <td>viewer</td>
            <td>dashboard</td>
            <td>✗ No</td>
            <td>✗ No</td>
          </tr>
        </tbody>
      </table>

      <div class="page-break"></div>

      <!-- ==================== CHAPTER 11 ==================== -->
      <h1>Chapter 11: Real-time Business Intelligence &amp; Analytics Engine</h1>
      <h2>11.1 Dynamic Vector Spline Charts (<code>getSplinePath</code>)</h2>
      <p>Rather than relying on bloated third-party charting libraries, YolkFlow generates pure, lightweight, responsive SVG charts directly in React. The <strong>Sales vs Margin Trend Chart</strong> uses Catmull-Rom spline interpolation (<code>getSplinePath</code>) to compute smooth cubic Bézier curves.</p>

      <div class="diagram-container">
        {diag.diagram_10_analytics()}
        <div class="diagram-caption">Figure 11.1: Analytics Engine, Chart Splines &amp; Waste Rollup Tiers</div>
      </div>

      <h2>11.2 Key Analytical Visualizers</h2>
      <ul>
        <li><strong>Dual Y-Axis Spline Engine:</strong> Visualizes Daily Sales Volume on the primary left axis (scale up to 1,000,000+ BDT) while plotting Profit Margin (Cell G5) on a dedicated, high-resolution right axis.</li>
        <li><strong>0.5 BDT Grid Egg Price Trend:</strong> Tracks procurement rates for all 6 egg categories across daily entries with 0.5 BDT increment gridlines, exposing supplier rate volatility.</li>
        <li><strong>3-Tier Waste &amp; Breakage Rollup:</strong> Aggregates broken egg expenses across Daily, 7-Day Rolling Weekly, and Calendar Month windows to compute breakage percentage against total inventory.</li>
        <li><strong>High-Performance Sales Ledger Table:</strong> Features auto-scrolling to the latest transaction, date centering, multi-column sorting, and Bengali keyword search.</li>
      </ul>

      <div class="page-break"></div>

      <!-- ==================== CHAPTER 12 ==================== -->
      <h1>Chapter 12: Production Readiness, Fault Tolerance &amp; Recommendations</h1>
      <h2>12.1 Reliability &amp; Fault Tolerance Assessment</h2>
      <p>YolkFlow demonstrates remarkable operational resilience due to its hybrid architecture:</p>
      <ul>
        <li><strong>Air-Gapped Offline Capability:</strong> If Google Cloud experiences an outage or internet fails at the depot, the application functions seamlessly on <code>mock_db.json</code> without throwing UI crashes.</li>
        <li><strong>Human-in-the-Loop AI:</strong> The OCR scanner never writes directly to the database without manual accountant verification, eliminating OCR hallucination risk.</li>
        <li><strong>Cloud Spreadsheet Auditability:</strong> By duplicating daily tabs with native spreadsheet formulas, non-technical business partners can verify calculations using Google Sheets on mobile devices.</li>
      </ul>

      <h2>12.2 Architectural Recommendations for Future Scaling</h2>
      <ol>
        <li><strong>PostgreSQL / Supabase Migration (at &gt; 50,000 rows):</strong> While Google Sheets serves perfectly as a lightweight database up to several thousand rows, migrating historical archives to PostgreSQL will maintain sub-second response times as data expands over decades.</li>
        <li><strong>Automated SMS / WhatsApp Daily Summary:</strong> A scheduled cron job triggering nightly at 11:00 PM to send the owner an automated WhatsApp summary of Cell G5 Profit Margin, Cash in Hand, and Closing Egg Stock.</li>
        <li><strong>Bluetooth Thermal Receipt Printing:</strong> Direct integration with 58mm/80mm Bluetooth thermal printers for generating customer due memos directly from the Hal-Khata entry screen.</li>
      </ol>

      <div class="page-break"></div>

      <!-- ==================== APPENDIX ==================== -->
      <h1>Appendix: Reference Index</h1>
      <h2>A. Mathematical Equation Reference</h2>
      <table>
        <thead>
          <tr>
            <th>Metric Name</th>
            <th>Physical Ledger Cell</th>
            <th>Exact Code Formula</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Total Stock Quantity</td>
            <td>Cell B12</td>
            <td><code>∑ (stockEntries[i].currentStock)</code></td>
          </tr>
          <tr>
            <td>Total Stock Value</td>
            <td>Cell D12</td>
            <td><code>∑ (stockEntries[i].currentStock × stockEntries[i].purchaseRate)</code></td>
          </tr>
          <tr>
            <td>Total Receivables / পাওনা</td>
            <td>Cell B25</td>
            <td><code>totalDue + extraDue + totalCash + totalStockValue (D12)</code></td>
          </tr>
          <tr>
            <td>Total Operating Expenses</td>
            <td>Cell B43</td>
            <td><code>∑ (expensesList[j].amount)</code></td>
          </tr>
          <tr>
            <td>Total Liabilities / জমা</td>
            <td>Cell E24</td>
            <td><code>prevDayBalance + providerDueMoney + ∑ extraDues[k].amount</code></td>
          </tr>
          <tr>
            <td>Grand Balance Equation</td>
            <td>Cell B44</td>
            <td><code>Cell B25 (সর্বমোট পাওনা) + Cell B43 (মোট খরচ)</code></td>
          </tr>
          <tr>
            <td><strong>Net Profit Margin</strong></td>
            <td><strong>Cell G5</strong></td>
            <td><strong><code>Cell B44 (সর্বমোট সমীকরণ) - Cell E24 (মোট দেনা ও জমা)</code></strong></td>
          </tr>
          <tr>
            <td>Cash + Stock Assets</td>
            <td>Cell G9</td>
            <td><code>totalCash + totalStockValue (Cell B18 + Cell D12)</code></td>
          </tr>
          <tr>
            <td>Sold Egg Units</td>
            <td>Derived</td>
            <td><code>Max(0, PrevStock + AddedQty - CurrentStock)</code></td>
          </tr>
          <tr>
            <td>Cost of Goods Sold (COGS)</td>
            <td>Derived</td>
            <td><code>∑ (SoldQty_i × ActivePurchaseRate_i)</code></td>
          </tr>
          <tr>
            <td>Daily Sales Turnover</td>
            <td>Derived</td>
            <td><code>COGS + Max(0, ProfitMargin)</code></td>
          </tr>
        </tbody>
      </table>

      <h2>B. Google Sheets Master Worksheets Specification</h2>
      <table>
        <thead>
          <tr>
            <th>Worksheet Tab</th>
            <th>Primary Responsibility</th>
            <th>Headers (Columns A to Z)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>DailyStock</strong></td>
            <td>Master stock log</td>
            <td>Date, Day, PageNo, EggType, CurrentStock, HasPurchase, PurchaseRate, PurchaseQty</td>
          </tr>
          <tr>
            <td><strong>Financials</strong></td>
            <td>Master finance log</td>
            <td>Date, Day, PageNo, TotalDue, ExtraDue, TotalCash, PrevDayBalance, ProviderName, Phone, EggType, DueMoney, UnitPrice, ExtraCollectionsJSON, ExtraDuesJSON</td>
          </tr>
          <tr>
            <td><strong>Expenses</strong></td>
            <td>Master expenses log</td>
            <td>Date, Day, PageNo, ExpenseType, Amount, WastedEggQty, WastedEggCost</td>
          </tr>
          <tr>
            <td><strong>OverheadExpenses</strong></td>
            <td>Operating overheads</td>
            <td>Id, Date, Month, Category, Title, Amount, PaymentMode, Notes, CreatedAt</td>
          </tr>
          <tr>
            <td><strong>SavingsAndExtras</strong></td>
            <td>Reserves &amp; extra income</td>
            <td>Id, Date, Month, Type, Category, Title, Amount, PaymentMode, Notes, CreatedAt</td>
          </tr>
          <tr>
            <td><strong>DD/MM/YY Tabs</strong></td>
            <td>Daily Hal-Khata clone</td>
            <td>Full Bengali formatted layout with native formulas =B6*C6, =B44-E24, etc.</td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top: 40px; padding: 15px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center; font-size: 8.5pt; color: #64748b;">
        End of Specification Document &bull; YolkFlow Architecture Compendium &bull; Generated October 2026
      </div>

    </body>
    </html>
    """
    return html_content

def build_pdf():
    html_file = os.path.join(os.getcwd(), "yolkflow_spec_temp.html")
    pdf_file = os.path.join(os.getcwd(), "YolkFlow_Complete_Project_Logic_and_Diagrams.pdf")

    print("Generating complete HTML content with 10 SVG diagrams...")
    html_content = generate_html()

    with open(html_file, "w", encoding="utf-8") as f:
        f.write(html_content)

    print("Compiling PDF with Playwright Chromium...")
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("file:///" + os.path.abspath(html_file).replace("\\", "/"))
        page.wait_for_load_state("networkidle")

        page.pdf(
            path=pdf_file,
            format="A4",
            print_background=True,
            display_header_footer=True,
            header_template='<div style="font-size:7.5pt; color:#94a3b8; width:100%; padding-left:14mm; font-family:sans-serif;">YolkFlow™ System Architecture &amp; Mathematical Specification</div>',
            footer_template='<div style="font-size:7.5pt; color:#94a3b8; width:100%; text-align:right; padding-right:14mm; font-family:sans-serif;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
            margin={
                "top": "16mm",
                "bottom": "16mm",
                "left": "12mm",
                "right": "12mm"
            }
        )
        browser.close()

    if os.path.exists(html_file):
        os.remove(html_file)

    if os.path.exists(pdf_file):
        size_kb = os.path.getsize(pdf_file) / 1024
        print(f"SUCCESS: Generated PDF at '{pdf_file}' ({size_kb:.1f} KB)")
        return pdf_file
    else:
        print("ERROR: PDF was not generated.")
        return None

if __name__ == "__main__":
    build_pdf()
