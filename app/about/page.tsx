import { VERTICALS } from '@/lib/verticals';

export const metadata = {
  title: 'About | S2D Capital Insights',
  description: 'Institutional-grade financial intelligence across six verticals.',
};

export default function AboutPage() {
  return (
    <section style={{ padding: '48px', maxWidth: 720, margin: '0 auto', minHeight: '80vh' }}>
      <p className="eyebrow" style={{ marginBottom: 12 }}>About S2D Capital Insights</p>
      <h1 className="section-title" style={{ marginBottom: 24 }}>
        Creating clarity where markets see <em>complexity</em>
      </h1>
      <div style={{ fontSize: '1rem', color: 'var(--text-body)', lineHeight: 1.9, fontWeight: 300 }}>
        <p style={{ marginBottom: 20 }}>
          S2D Capital Insights is a financial intelligence platform that combines institutional-grade
          analysis with deep expertise in digital assets, macroeconomics, commodities, foreign exchange,
          geopolitics, and market structure.
        </p>
        <p style={{ marginBottom: 20 }}>
          We translate the complexity of legislation, central bank policy, and market dynamics into
          clear, actionable insights. Our analyses draw on top-tier sources: JPMorgan, Bloomberg Intelligence,
          Grayscale, Standard Chartered, Bernstein, Morgan Stanley, and other leading institutions.
        </p>
        <p style={{ marginBottom: 40 }}>
          What makes us different: we connect the dots across verticals. A Fed rate decision moves the dollar,
          which moves gold and oil, which impacts emerging market currencies, which affects institutional
          crypto allocation. Most analysts see one piece. We show the full picture.
        </p>
      </div>

      <p className="eyebrow" style={{ marginBottom: 16 }}>Our Six Verticals</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {Object.entries(VERTICALS).map(([key, v]) => (
          <div key={key} style={{
            padding: '20px', background: 'var(--bg-warm)', border: '1px solid var(--border-lt)',
            borderLeft: `3px solid ${v.hex}`,
          }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 600, color: 'var(--navy)', marginBottom: 4 }}>
              {v.label}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-sec)', lineHeight: 1.6 }}>
              {v.description}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
