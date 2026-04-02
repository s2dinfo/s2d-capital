import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Themed gradient backgrounds based on keywords
const THEMES: Record<string, { bg: string; accent: string }> = {
  oil: { bg: 'linear-gradient(135deg, #1a1208 0%, #2d1f0e 50%, #1a1a2e 100%)', accent: '#8B5E3C' },
  crude: { bg: 'linear-gradient(135deg, #1a1208 0%, #2d1f0e 50%, #1a1a2e 100%)', accent: '#8B5E3C' },
  brent: { bg: 'linear-gradient(135deg, #1a1208 0%, #2d1f0e 50%, #1a1a2e 100%)', accent: '#8B5E3C' },
  hormuz: { bg: 'linear-gradient(135deg, #1a0808 0%, #2d0e0e 50%, #1a1a2e 100%)', accent: '#C0392B' },
  iran: { bg: 'linear-gradient(135deg, #1a0808 0%, #2d0e0e 50%, #1a1a2e 100%)', accent: '#C0392B' },
  gold: { bg: 'linear-gradient(135deg, #1a1508 0%, #2d250e 50%, #1a1a2e 100%)', accent: '#B8860B' },
  bitcoin: { bg: 'linear-gradient(135deg, #1a1508 0%, #2d250e 50%, #1a1a2e 100%)', accent: '#B8860B' },
  btc: { bg: 'linear-gradient(135deg, #1a1508 0%, #2d250e 50%, #1a1a2e 100%)', accent: '#B8860B' },
  crypto: { bg: 'linear-gradient(135deg, #1a1508 0%, #2d250e 50%, #1a1a2e 100%)', accent: '#B8860B' },
  etf: { bg: 'linear-gradient(135deg, #1a1508 0%, #2d250e 50%, #1a1a2e 100%)', accent: '#B8860B' },
  fed: { bg: 'linear-gradient(135deg, #081a1a 0%, #0e2d2d 50%, #1a1a2e 100%)', accent: '#3B6CB4' },
  rate: { bg: 'linear-gradient(135deg, #081a1a 0%, #0e2d2d 50%, #1a1a2e 100%)', accent: '#3B6CB4' },
  macro: { bg: 'linear-gradient(135deg, #081a1a 0%, #0e2d2d 50%, #1a1a2e 100%)', accent: '#3B6CB4' },
  dollar: { bg: 'linear-gradient(135deg, #081a10 0%, #0e2d1a 50%, #1a1a2e 100%)', accent: '#2D8F5E' },
  forex: { bg: 'linear-gradient(135deg, #081a10 0%, #0e2d1a 50%, #1a1a2e 100%)', accent: '#2D8F5E' },
  yuan: { bg: 'linear-gradient(135deg, #081a10 0%, #0e2d1a 50%, #1a1a2e 100%)', accent: '#2D8F5E' },
  russia: { bg: 'linear-gradient(135deg, #1a0808 0%, #2d1010 50%, #1a1a2e 100%)', accent: '#C0392B' },
  sanctions: { bg: 'linear-gradient(135deg, #1a0814 0%, #2d0e20 50%, #1a1a2e 100%)', accent: '#8B2252' },
  geopolitics: { bg: 'linear-gradient(135deg, #1a0814 0%, #2d0e20 50%, #1a1a2e 100%)', accent: '#8B2252' },
  trump: { bg: 'linear-gradient(135deg, #1a0814 0%, #2d0e20 50%, #1a1a2e 100%)', accent: '#8B2252' },
  europe: { bg: 'linear-gradient(135deg, #0e0e2d 0%, #1a1a4a 50%, #1a1a2e 100%)', accent: '#5B4FA0' },
  energy: { bg: 'linear-gradient(135deg, #1a1208 0%, #2d1f0e 50%, #1a1a2e 100%)', accent: '#D4A843' },
  carbon: { bg: 'linear-gradient(135deg, #081a10 0%, #0e2d1a 50%, #1a1a2e 100%)', accent: '#2D8F5E' },
};

function getTheme(text: string): { bg: string; accent: string } {
  const lower = text.toLowerCase();
  for (const [kw, theme] of Object.entries(THEMES)) {
    if (lower.includes(kw)) return theme;
  }
  return { bg: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f23 100%)', accent: '#B8860B' };
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const type = searchParams.get('type') || 'stat';

  try {
    if (type === 'snapshot') return generateSnapshot(searchParams);
    if (type === 'article') return generateArticleCard(searchParams);
    if (type === 'news') return generateNewsCard(searchParams);
    return generateStatCard(searchParams);
  } catch (e) {
    return new Response('Image generation failed', { status: 500 });
  }
}

function generateNewsCard(params: URLSearchParams) {
  const title = params.get('title') || 'Breaking News';
  const subtitle = params.get('subtitle') || '';
  const keywords = params.get('keywords') || title;
  const theme = getTheme(`${title} ${keywords}`);

  return new ImageResponse(
    (
      <div style={{ width: '1200px', height: '675px', background: theme.bg, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '56px 64px', fontFamily: 'system-ui' }}>
        {/* Decorative accent */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: '400px', height: '400px', borderRadius: '50%', background: `radial-gradient(circle, ${theme.accent}15 0%, transparent 70%)`, display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '300px', height: '300px', borderRadius: '50%', background: `radial-gradient(circle, ${theme.accent}10 0%, transparent 70%)`, display: 'flex' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ width: '6px', height: '28px', background: theme.accent, borderRadius: '3px', display: 'flex' }} />
          <span style={{ color: '#D4B85C', fontSize: '18px', fontWeight: 700, letterSpacing: '0.15em' }}>S2D CAPITAL INSIGHTS</span>
          <span style={{ color: theme.accent, fontSize: '14px', fontWeight: 700, letterSpacing: '0.1em', marginLeft: '12px', padding: '4px 12px', background: `${theme.accent}22`, borderRadius: '4px', display: 'flex' }}>BREAKING</span>
        </div>

        <span style={{ color: '#ffffff', fontSize: '46px', fontWeight: 700, lineHeight: 1.15, maxWidth: '1000px' }}>{title}</span>
        {subtitle && <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '22px', marginTop: '16px', maxWidth: '800px', lineHeight: 1.4 }}>{subtitle}</span>}

        <div style={{ display: 'flex', marginTop: '32px', borderTop: `1px solid ${theme.accent}33`, paddingTop: '16px' }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '16px' }}>s2d.info</span>
        </div>
      </div>
    ),
    { width: 1200, height: 675 }
  );
}

function generateSnapshot(params: URLSearchParams) {
  const brent = params.get('brent') || '—';
  const gold = params.get('gold') || '—';
  const btc = params.get('btc') || '—';
  const sp = params.get('sp') || '—';
  const vix = params.get('vix') || '—';
  const dxy = params.get('dxy') || '—';

  return new ImageResponse(
    (
      <div style={{ width: '1200px', height: '675px', background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #0f0f23 100%)', display: 'flex', flexDirection: 'column', padding: '40px 48px', fontFamily: 'system-ui' }}>
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(184,134,11,0.08) 0%, transparent 70%)', display: 'flex' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '6px', height: '28px', background: '#B8860B', borderRadius: '4px', display: 'flex' }} />
            <span style={{ color: '#D4B85C', fontSize: '24px', fontWeight: 700, letterSpacing: '0.08em' }}>S2D CAPITAL INSIGHTS</span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '18px' }}>Markets Today</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', flex: 1 }}>
          {[
            { emoji: '🛢️', label: 'BRENT', value: `$${brent}`, color: '#8B5E3C' },
            { emoji: '🥇', label: 'GOLD', value: `$${gold}`, color: '#B8860B' },
            { emoji: '₿', label: 'BITCOIN', value: `$${btc}`, color: '#B8860B' },
            { emoji: '📈', label: 'S&P 500', value: sp, color: '#3B6CB4' },
            { emoji: '😱', label: 'VIX', value: vix, color: '#C0392B' },
            { emoji: '💵', label: 'DXY', value: dxy, color: '#2D8F5E' },
          ].map((item) => (
            <div key={item.label} style={{ width: '355px', padding: '20px 24px', background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(255,255,255,0.08)`, borderLeft: `4px solid ${item.color}`, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '28px' }}>{item.emoji}</span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em', fontWeight: 600 }}>{item.label}</span>
                <span style={{ fontSize: '26px', fontWeight: 700, color: '#ffffff' }}>{item.value}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>s2d.info/markets</span>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>
    ),
    { width: 1200, height: 675 }
  );
}

function generateStatCard(params: URLSearchParams) {
  const label = params.get('label') || 'Metric';
  const value = params.get('value') || '—';
  const subtitle = params.get('subtitle') || '';
  const keywords = params.get('keywords') || label;
  const theme = getTheme(keywords);

  return new ImageResponse(
    (
      <div style={{ width: '1200px', height: '675px', background: theme.bg, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: 'system-ui' }}>
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '500px', height: '500px', borderRadius: '50%', background: `radial-gradient(circle, ${theme.accent}12 0%, transparent 60%)`, display: 'flex' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
          <div style={{ width: '6px', height: '20px', background: theme.accent, borderRadius: '3px', display: 'flex' }} />
          <span style={{ color: '#D4B85C', fontSize: '16px', fontWeight: 600, letterSpacing: '0.15em' }}>S2D CAPITAL INSIGHTS</span>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '22px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>{label}</span>
        <span style={{ color: theme.accent, fontSize: '88px', fontWeight: 700, lineHeight: 1 }}>{value}</span>
        {subtitle && <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '20px', marginTop: '12px' }}>{subtitle}</span>}
        <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '14px', marginTop: '40px' }}>s2d.info</span>
      </div>
    ),
    { width: 1200, height: 675 }
  );
}

function generateArticleCard(params: URLSearchParams) {
  const title = params.get('title') || 'Research Article';
  const subtitle = params.get('subtitle') || '';
  const vertical = params.get('vertical') || 'research';
  const keywords = params.get('keywords') || title;
  const theme = getTheme(`${title} ${keywords}`);

  const colors: Record<string, string> = {
    crypto: '#B8860B', macro: '#3B6CB4', commodities: '#8B5E3C',
    fx: '#2D8F5E', geopolitics: '#8B2252', structure: '#5B4FA0', research: '#B8860B',
  };
  const color = colors[vertical] || theme.accent;

  return new ImageResponse(
    (
      <div style={{ width: '1200px', height: '675px', background: theme.bg, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '56px 64px', fontFamily: 'system-ui' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '500px', height: '500px', borderRadius: '50%', background: `radial-gradient(circle, ${color}12 0%, transparent 60%)`, display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: 0, left: '20%', width: '400px', height: '400px', borderRadius: '50%', background: `radial-gradient(circle, ${color}08 0%, transparent 60%)`, display: 'flex' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ width: '6px', height: '28px', background: '#B8860B', borderRadius: '3px', display: 'flex' }} />
          <span style={{ color: '#D4B85C', fontSize: '18px', fontWeight: 700, letterSpacing: '0.15em' }}>S2D CAPITAL INSIGHTS</span>
          <span style={{ color, fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginLeft: '12px', padding: '4px 12px', background: `${color}22`, borderRadius: '4px', display: 'flex' }}>{vertical}</span>
        </div>

        <span style={{ color: '#ffffff', fontSize: '48px', fontWeight: 600, lineHeight: 1.15, maxWidth: '950px' }}>{title}</span>
        {subtitle && <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '22px', marginTop: '16px', maxWidth: '800px', lineHeight: 1.4 }}>{subtitle}</span>}

        <div style={{ display: 'flex', marginTop: '32px', borderTop: `1px solid ${color}33`, paddingTop: '16px' }}>
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '16px' }}>s2d.info</span>
        </div>
      </div>
    ),
    { width: 1200, height: 675 }
  );
}
