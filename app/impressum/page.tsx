export const metadata = {
  title: 'Impressum | S2D Capital Insights',
};

export default function ImpressumPage() {
  return (
    <section style={{ padding: '48px', maxWidth: 600, margin: '0 auto', minHeight: '80vh' }}>
      <p className="eyebrow" style={{ marginBottom: 12 }}>Legal</p>
      <h1 className="section-title" style={{ marginBottom: 32 }}>Impressum</h1>
      <div style={{ fontSize: '0.92rem', color: 'var(--text-body)', lineHeight: 1.9 }}>
        <p style={{ marginBottom: 20 }}>
          <strong>S2D Capital Insights</strong><br />
          Sami Samii<br />
          {/* TODO: Add your address */}
          Frankfurt am Main, Germany
        </p>
        <p style={{ marginBottom: 20 }}>
          <strong>Contact</strong><br />
          Email: sami@s2d.info
        </p>
        <p style={{ marginBottom: 20 }}>
          <strong>Responsible for content according to &sect; 55 Abs. 2 RStV</strong><br />
          Sami Samii
        </p>
        <p style={{
          padding: 20, background: 'var(--gold-tint)', border: '1px solid var(--gold-wash)',
          borderRadius: 2, fontSize: '0.82rem', marginTop: 32,
        }}>
          <strong>Disclaimer:</strong> The information provided on this website is for
          general informational and educational purposes only. It does not constitute
          financial advice, investment advice, or any other form of professional advice.
          Always consult a qualified financial advisor before making investment decisions.
        </p>
      </div>
    </section>
  );
}
