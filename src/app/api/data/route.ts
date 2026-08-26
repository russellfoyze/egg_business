import { fetchLedgerData } from "@/lib/ledger";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await fetchLedgerData();
  return NextResponse.json(result);
}
