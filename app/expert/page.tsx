// Research Desks hub at /expert — lists every live desk by scanning research/*.md (server-side),
// so adding research/<sector>.md automatically adds a desk here. No build step, no hardcoded list.
import { readdir, readFile } from 'fs/promises';
import path from 'path';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type Desk = { slug: string; title: string; teaser: string };

async function getDesks(): Promise<Desk[]> {
  const dir = path.join(process.cwd(), 'research');
  let files: string[] = [];
  try {
    files = await readdir(dir);
  } catch {
    return [];
  }
  const base = files.filter((f) => f.endsWith('.md') && !f.startsWith('_') && !f.includes('.house.'));
  const desks = await Promise.all(
    base.map(async (f): Promise<Desk> => {
      const slug = f.replace(/\.md$/, '');
      const title = slug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      let teaser = `Talk to the ${title} desk — grounded in S2D research.`;
      try {
        const txt = await readFile(path.join(dir, f), 'utf8');
        const body = txt.replace(/^---[\s\S]*?---\s*/, '');
        const line = body
          .split('\n')
          .map((l) => l.trim())
          .find((l) => l.length > 40 && !l.startsWith('#') && !/^an introduction/i.test(l));
        if (line) teaser = line.length > 150 ? `${line.slice(0, 147)}…` : line;
      } catch {
        /* fall back to default teaser */
      }
      return { slug, title, teaser };
    }),
  );
  return desks.sort((a, b) => a.title.localeCompare(b.title));
}

export const metadata = {
  title: 'Research Desks · S2D Capital',
  description: 'Talk to an AI analyst trained on S2D Capital research, one per sector.',
};

export default async function ExpertHub() {
  const desks = await getDesks();
  return (
    <main style={S.page}>
      <div style={S.shell}>
        <div style={S.kicker}>S2D CAPITAL · RESEARCH DESKS</div>
        <h1 style={S.title}>Talk to the research</h1>
        <p style={S.sub}>
          Each desk is an analyst trained on S2D&apos;s own research for one sector — read through our
          house view. Pick one and ask it anything.
        </p>

        {desks.length === 0 ? (
          <div style={S.empty}>No desks yet. Add a file to <code style={S.code}>research/&lt;sector&gt;.md</code>.</div>
        ) : (
          <div style={S.grid}>
            {desks.map((d) => (
              <Link key={d.slug} href={`/expert/${d.slug}`} style={S.card}>
                <div style={S.cardTop}>
                  <span style={S.cardTitle}>{d.title}</span>
                  <span style={S.live}>● LIVE</span>
                </div>
                <p style={S.teaser}>{d.teaser}</p>
                <span style={S.open}>Open desk →</span>
              </Link>
            ))}
          </div>
        )}

        <div style={S.foot}>{desks.length} desks live · more arrive as S2D publishes each report</div>
      </div>
    </main>
  );
}

const GOLD = '#d4af6a';
const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'radial-gradient(1200px 700px at 70% -10%, #16213b 0%, #0a0e17 55%)',
    color: '#e6ebf5',
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
    display: 'flex',
    justifyContent: 'center',
    padding: '56px 16px',
  },
  shell: { width: '100%', maxWidth: 960 },
  kicker: { fontSize: 11, letterSpacing: 2.5, color: GOLD, fontWeight: 600, marginBottom: 12 },
  title: { fontSize: 38, fontWeight: 700, margin: '0 0 10px', letterSpacing: -0.5 },
  sub: { fontSize: 15, color: '#8a96ac', maxWidth: 600, lineHeight: 1.55, margin: '0 0 32px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 },
  card: {
    display: 'block',
    background: 'rgba(12,18,33,0.7)',
    border: '1px solid #1f2c48',
    borderRadius: 14,
    padding: '18px 20px',
    textDecoration: 'none',
    color: 'inherit',
  },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 19, fontWeight: 700, color: '#f0e9d6' },
  live: { fontSize: 9, letterSpacing: 1.4, color: '#6ee7a0' },
  teaser: { fontSize: 13, color: '#9aa6bc', lineHeight: 1.5, margin: '0 0 14px', minHeight: 56 },
  open: { fontSize: 13, fontWeight: 600, color: GOLD },
  empty: { color: '#9aa6bc', fontSize: 15, padding: '20px 0' },
  code: { color: '#9aa6bc', background: '#0e1524', padding: '1px 6px', borderRadius: 5 },
  foot: { fontSize: 12, color: '#5e6b80', marginTop: 28 },
};
