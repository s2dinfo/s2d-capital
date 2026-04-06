import { NextResponse } from "next/server";

// Hardcoded active conflicts/situations as baseline
const BASELINE_EVENTS = [
  { title: "Russia–Ukraine War", status: "ONGOING", statusColor: "#C0392B", desc: "Full-scale invasion continues. NATO arms shipments, sanctions regime, and grain corridor negotiations.", date: "Feb 2022 – present", region: "Europe" },
  { title: "Iran–US/Israel Conflict", status: "ACTIVE", statusColor: "#C0392B", desc: "Proxy war escalation across Middle East. Houthi Red Sea attacks, Iranian nuclear program tensions.", date: "2023 – present", region: "Middle East" },
  { title: "US–China Trade War", status: "ESCALATING", statusColor: "#E88A3C", desc: "Tariff escalation on tech, EVs, semiconductors. Export controls on AI chips. Taiwan Strait tensions.", date: "2018 – present", region: "Asia-Pacific" },
  { title: "India–Pakistan Border Tensions", status: "ESCALATING", statusColor: "#C0392B", desc: "Renewed military posturing along the Line of Control following the Pahalgam terror attack. India suspended the Indus Waters Treaty.", date: "Apr 2025 – present", region: "South Asia" },
  { title: "Sudan Civil War", status: "ONGOING", statusColor: "#E88A3C", desc: "RSF and SAF continue fighting. Humanitarian crisis with 10M+ displaced. International mediation stalled.", date: "Apr 2023 – present", region: "Africa" },
  { title: "EU Russian Gas Ban", status: "PHASING IN", statusColor: "#D4A843", desc: "Full embargo on Russian pipeline gas. LNG dependency rising. Energy price volatility across Europe.", date: "2022 – present", region: "Europe" },
  { title: "South China Sea Disputes", status: "ACTIVE", statusColor: "#C0392B", desc: "Increased Chinese coast guard activity near Philippine-claimed reefs. US freedom of navigation ops continue.", date: "Ongoing", region: "Asia-Pacific" },
  { title: "EU Green Deal / CBAM", status: "IN EFFECT", statusColor: "#2D8F5E", desc: "Carbon Border Adjustment Mechanism transitional phase. Affecting steel, cement, aluminum imports.", date: "Oct 2023 – present", region: "Europe" },
  { title: "OPEC+ Production Cuts", status: "EXTENDING", statusColor: "#E88A3C", desc: "Saudi-led voluntary cuts of 2.2M bpd extended through Q2 2026. Balancing market amid weak Chinese demand.", date: "Nov 2023 – present", region: "Global" },
];

// Fetch latest geopolitical headlines from GDELT (free, no API key)
async function fetchGDELTHeadlines() {
  try {
    const query = encodeURIComponent("(conflict OR sanctions OR war OR military OR tariff OR geopolitical) sourcelang:english");
    const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${query}&mode=artlist&maxrecords=10&format=json&sort=datedesc`;
    const res = await fetch(url, { next: { revalidate: 900 } });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.articles) return [];
    return data.articles.map((a: any) => ({
      title: a.title || "",
      url: a.url || "",
      date: a.seendate || "",
      source: a.domain || "",
      image: a.socialimage || undefined,
    }));
  } catch {
    return [];
  }
}

export async function GET() {
  const headlines = await fetchGDELTHeadlines();

  return NextResponse.json(
    { events: BASELINE_EVENTS, headlines, updatedAt: new Date().toISOString() },
    { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800" } }
  );
}
