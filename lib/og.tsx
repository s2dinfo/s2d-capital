// Shared branded Open Graph card. Used by opengraph-image.tsx files across
// the site — navy/gold, Cormorant Garamond headline, JetBrains Mono accents.
// Satori constraints apply: flexbox only, no CSS vars, woff fonts.
import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const OG_SIZE = { width: 1200, height: 630 };

export async function brandOg({
  title,
  kicker = 'INVESTOR BRIEFING',
  tags = [],
  footer = 's2d.info',
}: {
  title: string;
  kicker?: string;
  tags?: string[];
  footer?: string;
}) {
  const [serif, mono] = await Promise.all([
    readFile(path.join(process.cwd(), 'assets/fonts/cormorant-600.woff')),
    readFile(path.join(process.cwd(), 'assets/fonts/jetbrains-400.woff')),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0D1322',
          backgroundImage: 'radial-gradient(circle at 80% 10%, rgba(184,134,11,0.13), transparent 55%)',
          padding: '56px 72px 48px',
          position: 'relative',
        }}
      >
        {/* gold hairline */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: 1200, height: 5, display: 'flex', background: 'linear-gradient(90deg, #8B6914, #D4B85C, #8B6914)' }} />

        {/* header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
            <span style={{ fontFamily: 'Cormorant', fontSize: 40, color: '#D4B85C' }}>S2D</span>
            <span style={{ fontFamily: 'JetBrains', fontSize: 17, letterSpacing: 4, color: 'rgba(255,255,255,0.5)' }}>CAPITAL INSIGHTS</span>
          </div>
          <span style={{ fontFamily: 'JetBrains', fontSize: 15, letterSpacing: 4, color: '#D4B85C' }}>{kicker}</span>
        </div>

        {/* title */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontFamily: 'Cormorant',
              fontSize: title.length > 60 ? 58 : 70,
              lineHeight: 1.12,
              color: '#FFFFFF',
              maxWidth: 1020,
            }}
          >
            {title}
          </div>
        </div>

        {/* footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            {tags.slice(0, 3).map((t) => (
              <span
                key={t}
                style={{
                  fontFamily: 'JetBrains',
                  fontSize: 15,
                  letterSpacing: 2,
                  color: '#D4B85C',
                  border: '1px solid rgba(184,134,11,0.45)',
                  borderRadius: 5,
                  padding: '7px 16px',
                  backgroundColor: 'rgba(184,134,11,0.08)',
                }}
              >
                {t.toUpperCase()}
              </span>
            ))}
          </div>
          <span style={{ fontFamily: 'JetBrains', fontSize: 16, letterSpacing: 3, color: 'rgba(255,255,255,0.4)' }}>{footer}</span>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: 'Cormorant', data: serif, style: 'normal', weight: 600 },
        { name: 'JetBrains', data: mono, style: 'normal', weight: 400 },
      ],
    }
  );
}
