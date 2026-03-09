import Link from 'next/link';
import { articles } from '@/lib/articles';
import { VERTICALS, VerticalKey } from '@/lib/verticals';

export const metadata = {
  title: 'Research | S2D Capital Insights',
  description: 'In-depth analysis across crypto, macro, commodities, FX, geopolitics, and market structure.',
};

export default function ResearchPage({
  searchParams,
}: {
  searchParams: { v?: string };
}) {
  const filter = searchParams.v as VerticalKey | undefined;
  const shown = filter
    ? articles.filter((a) => a.tags.includes(filter))
    : articles;

  return (
    <section style={{ padding: '48px', minHeight: '80vh' }}>
      <div style={{ marginBottom: 32 }}>
        <p className="eyebrow" style={{ marginBottom: 8 }}>Research &amp; Opinions</p>
        <h1 className="section-title" style={{ marginBottom: 20 }}>
          All <em>Publications</em>
        </h1>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Link
            href="/research"
            style={{
              fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.08em',
              textTransform: 'uppercase' as const, padding: '6px 16px',
              border: `1px solid ${!filter ? 'var(--navy)' : 'var(--border)'}`,
              background: !filter ? 'var(--navy)' : 'transparent',
              color: !filter ? '#fff' : 'var(--text-sec)',
              borderRadius: 2,
            }}
          >
            All
          </Link>
          {Object.entries(VERTICALS).map(([key, v]) => (
            <Link
              key={key}
              href={`/research?v=${key}`}
              style={{
                fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.08em',
                textTransform: 'uppercase' as const, padding: '6px 16px',
                border: `1px solid ${filter === key ? v.hex : 'var(--border)'}`,
                background: filter === key ? v.hex : 'transparent',
                color: filter === key ? '#fff' : 'var(--text-sec)',
                borderRadius: 2,
              }}
            >
              {v.labelShort}
            </Link>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {shown.map((a) => (
          <Link
            key={a.slug}
            href={`/research/${a.slug}`}
            style={{
              padding: '24px',
              background: a.featured ? 'linear-gradient(170deg, #fff 0%, var(--gold-tint) 100%)' : 'var(--bg-warm)',
              border: `1px solid ${a.featured ? 'var(--gold-wash)' : 'var(--border-lt)'}`,
              borderLeft: `3px solid ${VERTICALS[a.tags[0]].hex}`,
              display: 'block',
              transition: 'transform 0.3s, box-shadow 0.3s',
            }}
          >
            <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' as const }}>
              {a.tags.map((t) => (
                <span
                  key={t}
                  style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.55rem',
                    letterSpacing: '0.12em', textTransform: 'uppercase' as const,
                    padding: '2px 8px', borderRadius: 2,
                    background: `${VERTICALS[t].hex}15`, color: VERTICALS[t].hex,
                    fontWeight: 500,
                  }}
                >
                  {VERTICALS[t].labelShort}
                </span>
              ))}
            </div>
            <h2 style={{
              fontFamily: 'var(--font-serif)', fontSize: a.featured ? '1.4rem' : '1.1rem',
              fontWeight: 500, color: 'var(--navy)', lineHeight: 1.35, marginBottom: 8,
            }}>
              {a.title}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-sec)', lineHeight: 1.7, fontWeight: 300 }}>
              {a.excerpt}
            </p>
            <div style={{
              display: 'flex', justifyContent: 'space-between', marginTop: 16,
              paddingTop: 12, borderTop: '1px solid var(--border-lt)',
              fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)',
            }}>
              <span>{a.date} &middot; {a.readTime}</span>
              <span style={{ color: 'var(--gold)' }}>&rarr;</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
