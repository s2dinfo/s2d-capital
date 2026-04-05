import { NextResponse } from 'next/server';

// Free APIs — no keys needed
// World Bank: 16,000+ indicators, 217 countries
// ECB: eurozone rates and money supply

export async function GET() {
  try {
    const [wbGrowth, ecbRates] = await Promise.all([
      // World Bank — GDP growth rates for major economies (latest year)
      fetch('https://api.worldbank.org/v2/country/USA;CHN;DEU;GBR;JPN;IND;FRA;BRA;CAN;AUS/indicator/NY.GDP.MKTP.KD.ZG?format=json&per_page=10&date=2025', {
        next: { revalidate: 86400 }, // Cache 24h — this data changes rarely
      }).then(r => r.ok ? r.json() : null).catch(() => null),

      // ECB — key interest rates
      fetch('https://data-api.ecb.europa.eu/service/data/FM/B.U2.EUR.4F.KR.MRR_FR.LEV?format=jsondata&lastNObservations=1', {
        next: { revalidate: 86400 },
      }).then(r => r.ok ? r.json() : null).catch(() => null),
    ]);

    // Parse World Bank GDP growth
    const gdpGrowth = wbGrowth?.[1]?.filter((x: any) => x.value != null).map((x: any) => ({
      country: x.country.value,
      code: x.countryiso3code,
      gdpGrowth: x.value,
      year: x.date,
    })) || [];

    // Parse ECB rate (complex SDMX format)
    let ecbRate = null;
    try {
      const series = ecbRates?.dataSets?.[0]?.series;
      if (series) {
        const firstKey = Object.keys(series)[0];
        const obs = series[firstKey]?.observations;
        if (obs) {
          const lastKey = Object.keys(obs).pop();
          ecbRate = lastKey ? obs[lastKey][0] : null;
        }
      }
    } catch {}

    return NextResponse.json({
      gdpGrowth,
      ecbRate,
      sources: ['World Bank', 'ECB Statistical Data Warehouse'],
    }, {
      headers: { 'Cache-Control': 'public, max-age=86400' },
    });
  } catch (err: any) {
    return NextResponse.json({ gdpGrowth: [], ecbRate: null, error: err.message }, { status: 500 });
  }
}
