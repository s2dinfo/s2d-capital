export const metadata = {
  title: 'Datenschutz | S2D Capital Insights',
};

export default function DatenschutzPage() {
  return (
    <section style={{ padding: '48px', maxWidth: 600, margin: '0 auto', minHeight: '80vh' }}>
      <p className="eyebrow" style={{ marginBottom: 12 }}>Legal</p>
      <h1 className="section-title" style={{ marginBottom: 32 }}>Datenschutz</h1>
      <div style={{ fontSize: '0.88rem', color: 'var(--text-body)', lineHeight: 1.9 }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--navy)', margin: '24px 0 8px' }}>
          1. Data Controller
        </h2>
        <p style={{ marginBottom: 16 }}>
          S2D Capital Insights, Sami Samii, Frankfurt am Main, Germany.
          Email: sami@s2d.info
        </p>

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--navy)', margin: '24px 0 8px' }}>
          2. Data We Collect
        </h2>
        <p style={{ marginBottom: 16 }}>
          When you subscribe to our newsletter, we collect your email address and topic preferences.
          We use privacy-friendly analytics that do not use cookies or track personal data.
        </p>

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--navy)', margin: '24px 0 8px' }}>
          3. Newsletter
        </h2>
        <p style={{ marginBottom: 16 }}>
          Our newsletter is powered by Beehiiv. When you subscribe, your email address is stored
          with Beehiiv Inc. You can unsubscribe at any time via the link in each email.
        </p>

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--navy)', margin: '24px 0 8px' }}>
          4. Hosting
        </h2>
        <p style={{ marginBottom: 16 }}>
          This website is hosted on Vercel Inc. (San Francisco, USA). Vercel may process
          server logs including IP addresses for security purposes. See Vercel&apos;s privacy
          policy for details.
        </p>

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--navy)', margin: '24px 0 8px' }}>
          5. Your Rights
        </h2>
        <p style={{ marginBottom: 16 }}>
          Under GDPR, you have the right to access, rectify, delete, restrict processing of,
          and port your personal data. Contact us at sami@s2d.info to exercise these rights.
        </p>
      </div>
    </section>
  );
}
