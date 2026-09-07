import { CONFIG } from "./config";

const SYSTEM_INSTRUCTION = `You are a specialist Bengali accountant and handwriting document reader for M.A Khalek Sarker egg trading business.
Extract all data from the daily Hal Khata sheet image into strict, structured JSON with these sections:
1. date (YYYY-MM-DD), day, pageNo
2. stockEntries: array of eggType ("সাদা (White Egg)", "লাল (Red Egg)", "হাঁস (Duck Egg)", "মুরগী (Chicken Egg)", "কোয়েল (Quail Egg)", "L.M"), currentStock, purchaseRate
3. financialEntry: prevDayBalance, totalDue, totalCash, extraDue
4. extraDueList: array of label, amount
5. extraCollectionList: array of label, amount
6. expensesList: array of expenseType, amount, wastedEggQty, wastedEggCost

Return ONLY clean, valid JSON without backticks, markdown, or explanation text.`;

export interface ExtractedOcrResult {
  date: string;
  day: string;
  pageNo: string;
  stockEntries: Array<{
    eggType: string;
    currentStock: number;
    purchaseRate: number;
  }>;
  financialEntry: {
    prevDayBalance: number;
    totalDue: number;
    totalCash: number;
    extraDue: number;
  };
  expensesList: Array<{
    expenseType: string;
    amount: number;
    wastedEggQty?: number;
    wastedEggCost?: number;
  }>;
}

export async function scanHalKhataImageDirect(base64Image: string, mimeType: string = "image/jpeg"): Promise<ExtractedOcrResult> {
  const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

  const payload = {
    contents: [
      {
        parts: [
          { text: "Analyze this handwritten Bengali daily Hal Khata accounting page and extract all numerical data into valid JSON." },
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64,
            },
          },
        ],
      },
    ],
    systemInstruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }],
    },
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json",
    },
  };

  const candidateModels = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
  let rawText = "";
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${CONFIG.GEMINI_API_KEY}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          generationConfig: {
            temperature: 0.1,
            response_mime_type: "application/json",
          }
        }),
      });

      if (res.ok) {
        const json = await res.json();
        rawText = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (rawText) break;
      } else {
        lastError = await res.text();
      }
    } catch (e: any) {
      lastError = e.message;
    }
  }

  if (!rawText) {
    throw new Error(`Gemini Vision OCR error: ${lastError || "No response generated"}`);
  }

  let cleaned = rawText.trim();
  if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
  if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);

  const parsed = JSON.parse(cleaned.trim());
  return parsed as ExtractedOcrResult;
}
