# YolkFlow - Google Sheets Database Setup Guide

YolkFlow is configured to use a Google Sheet as a lightweight, real-time database. If credentials are not set up, it automatically falls back to a local mock database (`mock_db.json`) so you can test the application offline immediately.

To connect YolkFlow to your Google Sheets database, follow these steps:

---

## 1. Create a Google Sheet
1. Open [Google Sheets](https://sheets.google.com) and create a new blank spreadsheet.
2. Copy the **Spreadsheet ID** from the URL.
   * *URL format*: `https://docs.google.com/spreadsheets/d/`**`SPREADSHEET_ID`**`/edit`
   * Keep this ID ready; you will paste it into your `.env.local` file as `GOOGLE_SHEET_ID`.

---

## 2. Obtain Google Cloud Credentials (Service Account)
To allow the Next.js backend to securely read and write data to your Google Sheet, you need a Google Service Account.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., `YolkFlow-Database`).
3. Enable the **Google Sheets API**:
   * Search for "Google Sheets API" in the top search bar.
   * Click **Enable**.
4. Create credentials for a **Service Account**:
   * Go to **APIs & Services** > **Credentials**.
   * Click **+ CREATE CREDENTIALS** at the top, select **Service Account**.
   * Fill out the name (e.g., `yolkflow-db-connector`) and click **Create and Continue**.
   * (Optional) Grant the role **Editor** to the service account, then click **Done**.
5. Generate a **JSON Key**:
   * Click on the newly created service account email under the **Service Accounts** list.
   * Navigate to the **Keys** tab.
   * Click **ADD KEY** > **Create new key**.
   * Choose **JSON** as the key type and click **Create**.
   * A JSON file containing your service account credentials will download automatically. Keep this file secure.

---

## 3. Share Your Google Sheet with the Service Account
Your service account has its own unique email address, which looks like:
`yolkflow-db-connector@<project-id>.iam.gserviceaccount.com`

1. Open the JSON file you just downloaded and look for the `"client_email"` property. Copy it.
2. Open your Google Sheet, click **Share** in the top right corner.
3. Paste the service account email, make sure its permissions are set to **Editor**, and click **Share** (uncheck "Notify people" since it is a bot email).

---

## 4. Configure Your Environment Variables
1. Create a copy of `.env.local.template` in your project root directory and rename it to `.env.local`.
2. Open `.env.local` and populate it with your credentials:
   ```env
   GOOGLE_SHEET_ID=your_spreadsheet_id_here
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account-email@your-project-id.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBg...[entire key]...\n-----END PRIVATE KEY-----\n"
   ```
   * **Note on Private Key**: Make sure to paste the full private key from your downloaded JSON file, replacing the actual newlines with the string `\n` to keep it on a single line, and wrapping the entire string in quotes.

---

## 5. First Run & Auto-Initialization
When YolkFlow connects to your sheet for the first time, it will automatically:
1. Verify if worksheets exist.
2. Create `Inventory`, `Orders`, and `Customers` worksheets if they are missing.
3. Inject the header rows automatically.

You are all set! The app will now read and write directly to your Google Sheet in real-time.
