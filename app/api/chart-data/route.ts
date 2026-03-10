// app/api/chart-data/route.ts
// Server-side proxy for Yahoo Finance chart data — avoids CORS blocking
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") || "BTC-USD";
  const range = searchParams.get("range") || "3mo";
  const interval = searchParams.get("interval") || "1d";

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Yahoo API error" }, { status: 502 });
    }

    const json = await res.json();
    return NextResponse.json(json, {
      headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Fetch failed" }, { status: 500 });
  }
}
