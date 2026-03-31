import { Metadata } from 'next';
export const metadata: Metadata = { title: 'About – S2D Capital Insights', description: 'Independent financial intelligence across six interconnected market verticals.' };
export default function AboutPage() {
  return (
    <main style={{ minHeight: '100vh', padding: '48px 24px 80px', maxWidth: 680, margin: '0 auto' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.25em', color: '#D4B85C', marginBottom: 16 }}>ABOUT</p>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 400, color: '#ffffff', marginBottom: 24, lineHeight: 1.2 }}>S2D Capital <em style={{ fontStyle: 'italic', color: '#D4B85C' }}>Insights</em></h1>
      <div style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.85 }}>
        <p style={{ marginBottom: 16 }}>S2D Capital Insights is an independent financial intelligence platform covering six interconnected verticals: Crypto, Macro, Commodities, FX, Geopolitics, and Market Structure.</p>
        <p style={{ marginBottom: 16 }}>We combine live market data with original, long-form research to show how events in one market ripple across all others. A Fed rate decision moves the dollar, which moves gold and oil, which reprices EM currencies, which shifts crypto allocation. We connect these dots.</p>
        <p style={{ marginBottom: 16 }}>Founded by <strong style={{ color: '#ffffff' }}>Sami Samii</strong> — Business Studies (EBS Universit&#228;t, GPA 3.8/4.0) and Mathematics (Goethe-Universit&#228;t Frankfurt). Professional experience spans UHNWI and Family Office advisory at Commerzbank, environmental commodities sales trading at OTC Flow Germany, M and A at Bertelsmann SE, and consulting at CT Group London.</p>
        <p style={{ marginBottom: 24 }}>S2D also leads <strong style={{ color: '#ffffff' }}>EBS Invest</strong> — weekly macro and capital markets sessions for 200+ members at EBS Universit&#228;t.</p>
        <div style={{ background: 'rgba(184,134,11,0.06)', border: '1px solid rgba(184,134,11,0.12)', borderRadius: 6, padding: '20px 24px', marginBottom: 24 }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', letterSpacing: '0.2em', color: '#D4B85C', marginBottom: 10, fontWeight: 600 }}>TECH STACK</p>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>Next.js 14 · Vercel · CoinGecko API · FRED API · Yahoo Finance · Open Exchange Rates · DefiLlama · Alternative.me · TradingView · Beehiiv Newsletter</p>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24 }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)' }}>Contact: <a href="mailto:sami@s2d.info" style={{ color: '#D4B85C', textDecoration: 'none' }}>sami@s2d.info</a></p>
        </div>
      </div>
    </main>
  );
}
