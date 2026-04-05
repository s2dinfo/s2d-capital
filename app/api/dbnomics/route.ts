import { NextResponse } from 'next/server';

// DBnomics — free, no key, aggregates 80+ data providers
// ECB, BIS, Eurostat, OECD, IMF in one API

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const series = searchParams.get('series') || 'ECB/EXR/M.USD.EUR.SP00.A'; // Default: EUR/USD monthly

  try {
    const res = await fetch(`https://api.db.nomics.world/v22/series/${series}?observations=1&format=json`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }

    const data = await res.json();
    const seriesData = data?.series?.docs?.[0];

    return NextResponse.json({
      name: seriesData?.series_name,
      provider: seriesData?.provider_code,
      dataset: seriesData?.dataset_code,
      lastValue: seriesData?.observations?.value?.slice(-1)?.[0],
      lastDate: seriesData?.observations?.period?.slice(-1)?.[0],
    }, {
      headers: { 'Cache-Control': 'public, max-age=3600' },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
