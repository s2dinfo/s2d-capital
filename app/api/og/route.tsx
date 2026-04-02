import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Map keywords to local photos in /public/og-photos/
const PHOTO_MAP: Record<string, string> = {
  oil: 'oil-rig.jpg', crude: 'oil-rig.jpg', brent: 'oil-rig.jpg', wti: 'oil-rig.jpg', opec: 'oil-rig.jpg',
  tanker: 'tanker.jpg', hormuz: 'tanker.jpg', shadow: 'tanker.jpg', ship: 'tanker.jpg', pipeline: 'tanker.jpg',
  gold: 'gold.jpg', silver: 'gold.jpg', commodity: 'gold.jpg', copper: 'gold.jpg',
  bitcoin: 'crypto.jpg', btc: 'crypto.jpg', crypto: 'crypto.jpg', ethereum: 'crypto.jpg', defi: 'crypto.jpg', etf: 'crypto.jpg', stablecoin: 'crypto.jpg',
  fed: 'skyscraper.jpg', rate: 'trading.jpg', macro: 'trading.jpg', inflation: 'trading.jpg', treasury: 'trading.jpg', recession: 'trading.jpg',
  trump: 'white-house.jpg', sanction: 'world-map.jpg', geopolitics: 'world-map.jpg', war: 'war.jpg', iran: 'war.jpg', ukraine: 'war.jpg', nato: 'war.jpg',
  russia: 'world-map.jpg', china: 'world-map.jpg', dollar: 'trading.jpg', yuan: 'world-map.jpg', forex: 'data-matrix.jpg', swift: 'data-matrix.jpg',
  europe: 'power-lines.jpg', energy: 'power-lines.jpg', carbon: 'power-lines.jpg', renewable: 'power-lines.jpg', electricity: 'power-lines.jpg',
  market: 'trading.jpg', stock: 'trading.jpg', structure: 'data-matrix.jpg', institutional: 'skyscraper.jpg', blackrock: 'skyscraper.jpg',
};

function pickPhoto(text: string): string {
  const lower = text.toLowerCase();
  for (const [kw, file] of Object.entries(PHOTO_MAP)) {
    if (lower.includes(kw)) return file;
  }
  return 'trading.jpg';
}

const BASE = 'https://www.s2d.info/og-photos';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const type = searchParams.get('type') || 'stat';
  try {
    if (type === 'snapshot') return generateSnapshot(searchParams);
    if (type === 'article') return generateArticleCard(searchParams);
    if (type === 'news') return generateNewsCard(searchParams);
    return generateStatCard(searchParams);
  } catch {
    return new Response('Image generation failed', { status: 500 });
  }
}

function generateNewsCard(params: URLSearchParams) {
  const title = params.get('title') || 'Breaking News';
  const subtitle = params.get('subtitle') || '';
  const keywords = params.get('keywords') || title;
  const photo = pickPhoto(`${title} ${keywords}`);

  return new ImageResponse(
    (
      <div style={{ width: '1200px', height: '675px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative', fontFamily: 'system-ui' }}>
        <img src={`${BASE}/${photo}`} width={1200} height={675} style={{ position: 'absolute', top: 0, left: 0, width: '1200px', height: '675px', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, width: '1200px', height: '675px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.4) 35%, rgba(15,15,35,0.92) 70%, rgba(15,15,35,0.98) 100%)', display: 'flex' }} />
        <div style={{ position: 'relative', padding: '0 56px 44px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '6px', height: '28px', background: '#B8860B', borderRadius: '3px', display: 'flex' }} />
            <span style={{ color: '#D4B85C', fontSize: '18px', fontWeight: 700, letterSpacing: '0.15em' }}>S2D CAPITAL INSIGHTS</span>
            <span style={{ color: '#C0392B', fontSize: '14px', fontWeight: 700, letterSpacing: '0.1em', marginLeft: '12px', padding: '4px 12px', background: 'rgba(192,57,43,0.25)', borderRadius: '4px', display: 'flex' }}>BREAKING</span>
          </div>
          <span style={{ color: '#ffffff', fontSize: '44px', fontWeight: 700, lineHeight: 1.15, maxWidth: '1000px', textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>{title}</span>
          {subtitle && <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '20px', marginTop: '12px', maxWidth: '800px', lineHeight: 1.4 }}>{subtitle}</span>}
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginTop: '16px' }}>s2d.info</span>
        </div>
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
  const photo = pickPhoto(`${title} ${keywords}`);

  const colors: Record<string, string> = { crypto: '#B8860B', macro: '#3B6CB4', commodities: '#8B5E3C', fx: '#2D8F5E', geopolitics: '#8B2252', structure: '#5B4FA0', research: '#B8860B' };
  const color = colors[vertical] || '#B8860B';

  return new ImageResponse(
    (
      <div style={{ width: '1200px', height: '675px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative', fontFamily: 'system-ui' }}>
        <img src={`${BASE}/${photo}`} width={1200} height={675} style={{ position: 'absolute', top: 0, left: 0, width: '1200px', height: '675px', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, width: '1200px', height: '675px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.35) 35%, rgba(15,15,35,0.9) 65%, rgba(15,15,35,0.98) 100%)', display: 'flex' }} />
        <div style={{ position: 'relative', padding: '0 56px 44px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '6px', height: '28px', background: '#B8860B', borderRadius: '3px', display: 'flex' }} />
            <span style={{ color: '#D4B85C', fontSize: '18px', fontWeight: 700, letterSpacing: '0.15em' }}>S2D CAPITAL INSIGHTS</span>
            <span style={{ color, fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginLeft: '12px', padding: '4px 12px', background: `${color}33`, borderRadius: '4px', display: 'flex' }}>{vertical}</span>
          </div>
          <span style={{ color: '#ffffff', fontSize: '46px', fontWeight: 600, lineHeight: 1.15, maxWidth: '950px', textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>{title}</span>
          {subtitle && <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '20px', marginTop: '14px', maxWidth: '800px', lineHeight: 1.4 }}>{subtitle}</span>}
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px', marginTop: '16px' }}>s2d.info</span>
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
      <div style={{ width: '1200px', height: '675px', display: 'flex', flexDirection: 'column', position: 'relative', fontFamily: 'system-ui' }}>
        <img src={`${BASE}/trading.jpg`} width={1200} height={675} style={{ position: 'absolute', top: 0, left: 0, width: '1200px', height: '675px', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, width: '1200px', height: '675px', background: 'rgba(15,15,35,0.88)', display: 'flex' }} />
        <div style={{ position: 'relative', padding: '40px 48px', display: 'flex', flexDirection: 'column', flex: 1 }}>
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
              <div key={item.label} style={{ width: '355px', padding: '20px 24px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderLeft: `4px solid ${item.color}`, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '16px' }}>
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
  const photo = pickPhoto(keywords);

  return new ImageResponse(
    (
      <div style={{ width: '1200px', height: '675px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative', fontFamily: 'system-ui' }}>
        <img src={`${BASE}/${photo}`} width={1200} height={675} style={{ position: 'absolute', top: 0, left: 0, width: '1200px', height: '675px', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, width: '1200px', height: '675px', background: 'rgba(15,15,35,0.85)', display: 'flex' }} />
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
            <div style={{ width: '6px', height: '20px', background: '#B8860B', borderRadius: '3px', display: 'flex' }} />
            <span style={{ color: '#D4B85C', fontSize: '16px', fontWeight: 600, letterSpacing: '0.15em' }}>S2D CAPITAL INSIGHTS</span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '22px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>{label}</span>
          <span style={{ color: '#D4B85C', fontSize: '88px', fontWeight: 700, lineHeight: 1 }}>{value}</span>
          {subtitle && <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '20px', marginTop: '12px' }}>{subtitle}</span>}
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '14px', marginTop: '40px' }}>s2d.info</span>
        </div>
      </div>
    ),
    { width: 1200, height: 675 }
  );
}
