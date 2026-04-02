import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const type = searchParams.get('type') || 'stat';

  if (type === 'snapshot') {
    return generateSnapshot(searchParams);
  } else if (type === 'article') {
    return generateArticleCard(searchParams);
  } else {
    return generateStatCard(searchParams);
  }
}

function generateSnapshot(params: URLSearchParams) {
  const brent = params.get('brent') || '—';
  const gold = params.get('gold') || '—';
  const btc = params.get('btc') || '—';
  const sp = params.get('sp') || '—';
  const vix = params.get('vix') || '—';
  const dxy = params.get('dxy') || '—';

  const items = [
    { emoji: '🛢️', label: 'Brent Crude', value: `$${brent}`, color: '#8B5E3C' },
    { emoji: '🥇', label: 'Gold', value: `$${gold}`, color: '#B8860B' },
    { emoji: '₿', label: 'Bitcoin', value: `$${btc}`, color: '#B8860B' },
    { emoji: '📈', label: 'S&P 500', value: sp, color: '#3B6CB4' },
    { emoji: '😱', label: 'VIX', value: vix, color: '#C0392B' },
    { emoji: '💵', label: 'DXY', value: dxy, color: '#2D8F5E' },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '675px',
          background: 'linear-gradient(135deg, #1A1A2E 0%, #0f0f23 100%)',
          display: 'flex',
          flexDirection: 'column',
          padding: '48px 56px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '8px',
                height: '32px',
                background: '#B8860B',
                borderRadius: '4px',
              }}
            />
            <span
              style={{
                color: '#D4B85C',
                fontSize: '28px',
                fontWeight: 700,
                letterSpacing: '0.05em',
              }}
            >
              S2D CAPITAL INSIGHTS
            </span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '20px' }}>
            Markets Today
          </span>
        </div>

        {/* Grid */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            flex: 1,
          }}
        >
          {items.map((item) => (
            <div
              key={item.label}
              style={{
                width: '370px',
                padding: '24px 28px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderLeft: `4px solid ${item.color}`,
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <span
                style={{
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.45)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                {item.label}
              </span>
              <span
                style={{
                  fontSize: '36px',
                  fontWeight: 700,
                  color: '#ffffff',
                }}
              >
                {item.emoji} {item.value}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '24px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: '16px',
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '16px' }}>
            s2d.info/markets
          </span>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '16px' }}>
            {new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 675 },
  );
}

function generateStatCard(params: URLSearchParams) {
  const label = params.get('label') || 'Metric';
  const value = params.get('value') || '—';
  const subtitle = params.get('subtitle') || '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '675px',
          background: 'linear-gradient(135deg, #1A1A2E 0%, #0f0f23 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '6px',
              height: '24px',
              background: '#B8860B',
              borderRadius: '3px',
            }}
          />
          <span
            style={{
              color: '#D4B85C',
              fontSize: '18px',
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}
          >
            S2D Capital Insights
          </span>
        </div>
        <span
          style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '24px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}
        >
          {label}
        </span>
        <span
          style={{
            color: '#D4B85C',
            fontSize: '96px',
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          {value}
        </span>
        {subtitle && (
          <span
            style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: '22px',
              marginTop: '16px',
            }}
          >
            {subtitle}
          </span>
        )}
        <span
          style={{
            color: 'rgba(255,255,255,0.2)',
            fontSize: '16px',
            marginTop: '48px',
          }}
        >
          s2d.info
        </span>
      </div>
    ),
    { width: 1200, height: 675 },
  );
}

function generateArticleCard(params: URLSearchParams) {
  const title = params.get('title') || 'Research Article';
  const subtitle = params.get('subtitle') || '';
  const vertical = params.get('vertical') || 'research';

  const colors: Record<string, string> = {
    crypto: '#B8860B',
    macro: '#3B6CB4',
    commodities: '#8B5E3C',
    fx: '#2D8F5E',
    geopolitics: '#8B2252',
    structure: '#5B4FA0',
    research: '#B8860B',
  };
  const color = colors[vertical] || '#B8860B';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '675px',
          background: 'linear-gradient(135deg, #1A1A2E 0%, #0f0f23 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '64px 72px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              width: '6px',
              height: '24px',
              background: '#B8860B',
              borderRadius: '3px',
            }}
          />
          <span
            style={{
              color: '#D4B85C',
              fontSize: '18px',
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}
          >
            S2D Capital Insights
          </span>
          <span
            style={{
              color: color,
              fontSize: '14px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginLeft: '16px',
              padding: '4px 12px',
              background: color + '20',
              borderRadius: '4px',
            }}
          >
            {vertical}
          </span>
        </div>
        <span
          style={{
            color: '#ffffff',
            fontSize: '52px',
            fontWeight: 400,
            lineHeight: 1.2,
            maxWidth: '900px',
          }}
        >
          {title}
        </span>
        {subtitle && (
          <span
            style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '24px',
              marginTop: '24px',
              maxWidth: '800px',
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </span>
        )}
        <div
          style={{
            display: 'flex',
            marginTop: '48px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: '24px',
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '18px' }}>
            s2d.info
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 675 },
  );
}
