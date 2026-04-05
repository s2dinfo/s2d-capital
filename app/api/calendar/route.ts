import { NextResponse } from 'next/server';

// Finnhub free tier: 60 calls/min — economic calendar + earnings
// Sign up at https://finnhub.io for free API key
const FINNHUB_KEY = process.env.FINNHUB_API_KEY || '';

export async function GET() {
  try {
    const today = new Date();
    const from = today.toISOString().split('T')[0];
    const to = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [calRes, earningsRes] = await Promise.all([
      // Economic calendar
      fetch(`https://finnhub.io/api/v1/calendar/economic?from=${from}&to=${to}&token=${FINNHUB_KEY}`, {
        next: { revalidate: 3600 }, // Cache 1 hour
      }).catch(() => null),
      // Earnings calendar
      fetch(`https://finnhub.io/api/v1/calendar/earnings?from=${from}&to=${to}&token=${FINNHUB_KEY}`, {
        next: { revalidate: 3600 },
      }).catch(() => null),
    ]);

    const calendar = calRes?.ok ? await calRes.json() : { economicCalendar: [] };
    const earnings = earningsRes?.ok ? await earningsRes.json() : { earningsCalendar: [] };

    // Filter to high-impact events only
    const events = (calendar.economicCalendar || [])
      .filter((e: any) => e.impact === 'high' || e.impact === 3)
      .slice(0, 20)
      .map((e: any) => ({
        date: e.time || e.date,
        country: e.country,
        event: e.event,
        impact: e.impact,
        actual: e.actual,
        estimate: e.estimate,
        prev: e.prev,
        unit: e.unit,
      }));

    const earningsList = (earnings.earningsCalendar || [])
      .slice(0, 10)
      .map((e: any) => ({
        date: e.date,
        symbol: e.symbol,
        epsEstimate: e.epsEstimate,
        epsActual: e.epsActual,
        revenueEstimate: e.revenueEstimate,
        revenueActual: e.revenueActual,
        hour: e.hour,
      }));

    return NextResponse.json({ events, earnings: earningsList }, {
      headers: { 'Cache-Control': 'public, max-age=3600' },
    });
  } catch (err: any) {
    return NextResponse.json({ events: [], earnings: [], error: err.message }, { status: 500 });
  }
}
