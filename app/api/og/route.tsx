import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Keyword → Unsplash photo ID mapping for consistent, high-quality images
const PHOTO_MAP: Record<string, string> = {
  // Oil & Energy
  'oil': '1516937941',       // oil rig at sunset
  'crude': '1516937941',
  'brent': '1516937941',
  'pipeline': '1516937941',
  'tanker': '1545437842',    // cargo ship
  'hormuz': '1545437842',
  'opec': '1516937941',
  'energy': '1473341497',    // power lines
  'gas': '1473341497',
  'lng': '1473341497',

  // Gold & Commodities
  'gold': '1610375461246',   // gold bars
  'silver': '1610375461246',
  'commodity': '1610375461246',
  'copper': '1610375461246',

  // Crypto & Finance
  'bitcoin': '1639762681057', // crypto/digital
  'btc': '1639762681057',
  'crypto': '1639762681057',
  'ethereum': '1639762681057',
  'defi': '1639762681057',
  'etf': '1611974789855',    // stock exchange
  'stablecoin': '1639762681057',

  // Geopolitics
  'russia': '1547981542',    // kremlin/russia
  'china': '1508804185872',  // china skyline
  'iran': '1466442929',      // middle east
  'trump': '1580128660010',  // white house
  'sanctions': '1526304640581', // world map
  'war': '1469571486292',    // military
  'ukraine': '1469571486292',
  'nato': '1469571486292',

  // Macro & Central Banks
  'fed': '1526304640581',    // federal reserve / DC
  'interest rate': '1611974789855',
  'inflation': '1611974789855',
  'recession': '1611974789855',
  'treasury': '1611974789855',
  'dollar': '1526304640581',
  'yuan': '1508804185872',
  'forex': '1526304640581',

  // Markets
  'market': '1611974789855', // trading floor
  'stock': '1611974789855',
  'wall street': '1611974789855',
  'sp500': '1611974789855',

  // Europe
  'europe': '1467269204594', // EU parliament
  'eu': '1467269204594',
  'carbon': '1473341497',
  'renewable': '1509391366', // solar panels
  'merit order': '1473341497',
};

function findPhotoId(title: string, keywords?: string): string {
  const text = `${title} ${keywords || ''}`.toLowerCase();
  for (const [keyword, photoId] of Object.entries(PHOTO_MAP)) {
    if (text.includes(keyword)) return photoId;
  }
  return '1611974789855'; // default: trading floor
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const type = searchParams.get('type') || 'stat';

  if (type === 'snapshot') {
    return generateSnapshot(searchParams);
  } else if (type === 'article') {
    return generateArticleCard(searchParams);
  } else if (type === 'news') {
    return generateNewsCard(searchParams);
  } else {
    return generateStatCard(searchParams);
  }
}

function generateNewsCard(params: URLSearchParams) {
  const title = params.get('title') || 'Breaking News';
  const subtitle = params.get('subtitle') || '';
  const keywords = params.get('keywords') || '';

  const photoId = findPhotoId(title, keywords);
  const bgUrl = `https://images.unsplash.com/photo-${photoId}?w=1200&h=675&fit=crop&auto=format&q=80`;

  return new ImageResponse(
    (
      <div style={{
        width: '1200px', height: '675px',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-end',
        position: 'relative',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        {/* Background photo */}
        <img src={bgUrl} style={{ position: 'absolute', top: 0, left: 0, width: '1200px', height: '675px', objectFit: 'cover' }} />

        {/* Dark gradient overlay */}
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '1200px', height: '675px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 40%, rgba(15,15,35,0.92) 75%, rgba(15,15,35,0.98) 100%)',
        }} />

        {/* Content */}
        <div style={{
          position: 'relative', padding: '0 56px 48px',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* S2D branding */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ width: '6px', height: '24px', background: '#B8860B', borderRadius: '3px' }} />
            <span style={{ color: '#D4B85C', fontSize: '16px', fontWeight: 700, letterSpacing: '0.15em' }}>S2D CAPITAL INSIGHTS</span>
          </div>

          {/* Title */}
          <span style={{ color: '#ffffff', fontSize: '44px', fontWeight: 700, lineHeight: 1.15, maxWidth: '900px', textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
            {title}
          </span>

          {subtitle && (
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '20px', marginTop: '12px', maxWidth: '800px', lineHeight: 1.4 }}>
              {subtitle}
            </span>
          )}

          {/* Footer */}
          <div style={{ display: 'flex', marginTop: '20px', gap: '16px', alignItems: 'center' }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>s2d.info</span>
          </div>
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

  // Use a trading floor photo as background
  const bgUrl = `https://images.unsplash.com/photo-1611974789855?w=1200&h=675&fit=crop&auto=format&q=80`;

  return new ImageResponse(
    (
      <div style={{
        width: '1200px', height: '675px',
        display: 'flex', flexDirection: 'column',
        position: 'relative',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <img src={bgUrl} style={{ position: 'absolute', top: 0, left: 0, width: '1200px', height: '675px', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, width: '1200px', height: '675px', background: 'rgba(15,15,35,0.88)' }} />

        <div style={{ position: 'relative', padding: '40px 48px', display: 'flex', flexDirection: 'column', flex: 1 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '6px', height: '28px', background: '#B8860B', borderRadius: '4px' }} />
              <span style={{ color: '#D4B85C', fontSize: '24px', fontWeight: 700, letterSpacing: '0.08em' }}>S2D CAPITAL INSIGHTS</span>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '18px' }}>Markets Today</span>
          </div>

          {/* Grid */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', flex: 1 }}>
            {[
              { emoji: '🛢️', label: 'BRENT', value: `$${brent}`, color: '#8B5E3C' },
              { emoji: '🥇', label: 'GOLD', value: `$${gold}`, color: '#B8860B' },
              { emoji: '₿', label: 'BITCOIN', value: `$${btc}`, color: '#B8860B' },
              { emoji: '📈', label: 'S&P 500', value: sp, color: '#3B6CB4' },
              { emoji: '😱', label: 'VIX', value: vix, color: '#C0392B' },
              { emoji: '💵', label: 'DXY', value: dxy, color: '#2D8F5E' },
            ].map((item) => (
              <div key={item.label} style={{
                width: '355px', padding: '20px 24px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderLeft: `4px solid ${item.color}`,
                borderRadius: '8px',
                display: 'flex', alignItems: 'center', gap: '16px',
              }}>
                <span style={{ fontSize: '32px' }}>{item.emoji}</span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em', fontWeight: 600 }}>{item.label}</span>
                  <span style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff' }}>{item.value}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
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

  const photoId = findPhotoId(keywords);
  const bgUrl = `https://images.unsplash.com/photo-${photoId}?w=1200&h=675&fit=crop&auto=format&q=80`;

  return new ImageResponse(
    (
      <div style={{
        width: '1200px', height: '675px',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        position: 'relative',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <img src={bgUrl} style={{ position: 'absolute', top: 0, left: 0, width: '1200px', height: '675px', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, width: '1200px', height: '675px', background: 'rgba(15,15,35,0.85)' }} />

        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
            <div style={{ width: '6px', height: '20px', background: '#B8860B', borderRadius: '3px' }} />
            <span style={{ color: '#D4B85C', fontSize: '16px', fontWeight: 600, letterSpacing: '0.15em' }}>S2D CAPITAL INSIGHTS</span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '22px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>{label}</span>
          <span style={{ color: '#D4B85C', fontSize: '88px', fontWeight: 700, lineHeight: 1, textShadow: '0 4px 30px rgba(184,134,11,0.3)' }}>{value}</span>
          {subtitle && <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '20px', marginTop: '12px' }}>{subtitle}</span>}
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '14px', marginTop: '40px' }}>s2d.info</span>
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

  const colors: Record<string, string> = {
    crypto: '#B8860B', macro: '#3B6CB4', commodities: '#8B5E3C',
    fx: '#2D8F5E', geopolitics: '#8B2252', structure: '#5B4FA0', research: '#B8860B',
  };
  const color = colors[vertical] || '#B8860B';

  const photoId = findPhotoId(title, keywords);
  const bgUrl = `https://images.unsplash.com/photo-${photoId}?w=1200&h=675&fit=crop&auto=format&q=80`;

  return new ImageResponse(
    (
      <div style={{
        width: '1200px', height: '675px',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-end',
        position: 'relative',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <img src={bgUrl} style={{ position: 'absolute', top: 0, left: 0, width: '1200px', height: '675px', objectFit: 'cover' }} />
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '1200px', height: '675px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 40%, rgba(15,15,35,0.9) 70%, rgba(15,15,35,0.98) 100%)',
        }} />

        <div style={{ position: 'relative', padding: '0 56px 44px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '6px', height: '24px', background: '#B8860B', borderRadius: '3px' }} />
            <span style={{ color: '#D4B85C', fontSize: '16px', fontWeight: 700, letterSpacing: '0.15em' }}>S2D CAPITAL INSIGHTS</span>
            <span style={{ color, fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginLeft: '12px', padding: '4px 10px', background: color + '33', borderRadius: '4px' }}>{vertical}</span>
          </div>
          <span style={{ color: '#ffffff', fontSize: '46px', fontWeight: 600, lineHeight: 1.15, maxWidth: '900px', textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>{title}</span>
          {subtitle && <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '20px', marginTop: '14px', maxWidth: '800px', lineHeight: 1.4 }}>{subtitle}</span>}
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px', marginTop: '20px' }}>s2d.info</span>
        </div>
      </div>
    ),
    { width: 1200, height: 675 }
  );
}
