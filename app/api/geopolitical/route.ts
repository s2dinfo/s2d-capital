import { NextResponse } from 'next/server';

// GDELT — free, no API key needed, 15-minute update cycles
// Returns recent high-impact geopolitical events

export async function GET() {
  try {
    // GDELT DOC 2.0 API — search for high-impact geopolitical events
    const queries = [
      'sanctions OR "trade war" OR tariff',
      'military OR conflict OR "ceasefire"',
      '"central bank" OR "interest rate" OR "monetary policy"',
      'oil OR energy OR "crude oil" OR OPEC',
    ];

    const events: any[] = [];

    for (const q of queries) {
      try {
        const res = await fetch(
          `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(q)}&mode=ArtList&maxrecords=5&format=json&sort=DateDesc`,
          { next: { revalidate: 900 } } // Cache 15 min (matches GDELT update cycle)
        );
        if (!res.ok) continue;
        const data = await res.json();
        if (data.articles) {
          events.push(...data.articles.map((a: any) => ({
            title: a.title,
            url: a.url,
            source: a.domain,
            date: a.seendate,
            language: a.language,
            sourcecountry: a.sourcecountry,
          })));
        }
      } catch {}
    }

    // Deduplicate by title similarity and sort by date
    const unique = events
      .filter((e, i, arr) => arr.findIndex(a => a.title === e.title) === i)
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
      .slice(0, 20);

    return NextResponse.json({ events: unique }, {
      headers: { 'Cache-Control': 'public, max-age=900' },
    });
  } catch (err: any) {
    return NextResponse.json({ events: [], error: err.message }, { status: 500 });
  }
}
