// A commodity desk: the readable S2D research on the left, the live "talk to the desk" chatbot on
// the right (sticky). Server component — it reads + parses research/<sector>.md, then hands the same
// sector to <ExpertChat> so reading and asking sit side by side. Falls back to 404 for unknown desks.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ExpertChat from '@/components/ExpertChat';
import { loadResearch } from '@/lib/research';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { sector: string };
}): Promise<Metadata> {
  const r = await loadResearch(params.sector);
  if (!r) return { title: 'Research Desk · S2D Capital' };
  return {
    title: `${r.title} · S2D Capital`,
    description: `S2D Capital's ${r.sector} research — read it, then ask the desk anything.`,
  };
}

export default async function ExpertSectorPage({ params }: { params: { sector: string } }) {
  const r = await loadResearch(params.sector);
  if (!r) notFound();

  return (
    <main style={S.page}>
      <style>{CSS}</style>
      <div className="ed-wrap">
        <article className="ed-article" style={S.article}>
          <Link href="/expert" style={S.back}>
            ← all research desks
          </Link>
          <div style={S.kicker}>S2D CAPITAL · {r.sector.toUpperCase()} RESEARCH</div>
          <h1 style={S.h1}>{r.title}</h1>
          <div style={S.deskline}>{r.desk}</div>

          <div style={S.body}>
            {r.blocks.map((b, i) => {
              if (b.type === 'h2') return <h2 key={i} style={S.h2}>{b.text}</h2>;
              if (b.type === 'h3') return <h3 key={i} style={S.h3}>{b.text}</h3>;
              if (b.type === 'h4') return <h4 key={i} style={S.h4}>{b.text}</h4>;
              return <p key={i} style={S.p}>{b.text}</p>;
            })}
          </div>

          <div style={S.disclaimer}>
            Structural explainer for education — not investment advice.
          </div>
        </article>

        <aside className="ed-chat">
          <ExpertChat sector={r.slug} inline />
        </aside>
      </div>
    </main>
  );
}

const GOLD = '#d4af6a';
const CSS = `
.ed-wrap {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 420px;
  gap: 44px;
  max-width: 1280px;
  margin: 0 auto;
  padding: 48px 28px 96px;
  align-items: start;
}
.ed-chat { position: sticky; top: 24px; }
@media (max-width: 1000px) {
  .ed-wrap { grid-template-columns: 1fr; gap: 28px; padding: 32px 18px 72px; }
  .ed-chat { position: static; }
}
.ed-article a:hover { color: ${GOLD}; }
`;

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'radial-gradient(1200px 700px at 75% -10%, #16213b 0%, #0a0e17 55%)',
    color: '#e6ebf5',
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
  },
  article: { minWidth: 0 },
  back: { color: '#8a96ac', fontSize: 13, textDecoration: 'none', letterSpacing: 0.3 },
  kicker: { fontSize: 11, letterSpacing: 2.5, color: GOLD, fontWeight: 600, margin: '22px 0 10px' },
  h1: { fontSize: 38, fontWeight: 700, lineHeight: 1.15, letterSpacing: -0.6, margin: '0 0 10px' },
  deskline: { fontSize: 13, color: '#7c879c', marginBottom: 26, paddingBottom: 22, borderBottom: '1px solid #1c2740' },
  body: { fontSize: 16.5, lineHeight: 1.72, color: '#c4cdde', maxWidth: 760 },
  h2: { fontSize: 24, fontWeight: 700, color: '#f1f4fa', letterSpacing: -0.3, margin: '40px 0 8px' },
  h3: { fontSize: 19, fontWeight: 650, color: GOLD, margin: '30px 0 6px' },
  h4: { fontSize: 16, fontWeight: 650, color: '#aeb9cf', margin: '22px 0 4px' },
  p: { margin: '0 0 16px' },
  disclaimer: { fontSize: 12.5, color: '#5e6b80', marginTop: 40, paddingTop: 18, borderTop: '1px solid #1c2740' },
};
