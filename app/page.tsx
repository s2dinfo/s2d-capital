import Image from 'next/image';
import Link from 'next/link';
import { getCryptoPrices, formatPrice, formatPct, pctColor } from '@/lib/api';
import { VERTICALS } from '@/lib/verticals';
import { articles } from '@/lib/articles';
import styles from './page.module.css';

export const revalidate = 300; // Revalidate every 5 minutes

export default async function Home() {
  const prices = await getCryptoPrices();

  const coins = [
    { name: 'Bitcoin', key: 'bitcoin', sym: 'BTC' },
    { name: 'Ethereum', key: 'ethereum', sym: 'ETH' },
    { name: 'Solana', key: 'solana', sym: 'SOL' },
    { name: 'XRP', key: 'ripple', sym: 'XRP' },
  ];

  const featured = articles.find((a) => a.featured);
  const recent = articles.filter((a) => !a.featured).slice(0, 3);

  return (
    <>
      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <Image
          src="/logo-icon.png"
          alt="S2D"
          width={80}
          height={49}
          className={styles.heroLogo}
        />
        <p className={`eyebrow ${styles.heroEyebrow}`}>Financial Intelligence &middot; Since 2026</p>
        <h1 className={styles.heroTitle}>
          Where Markets Meet <em>Clarity</em>
        </h1>
        <p className={styles.heroSub}>
          Institutional analysis across crypto, macro, commodities, FX, and geopolitics.
          We connect the dots others miss.
        </p>
        <div className={styles.heroActions}>
          <Link href="/research" className="btn-gold">Explore Research</Link>
          <Link href="/newsletter" className="btn-outline">Subscribe</Link>
        </div>
      </section>

      {/* ── CRYPTO SNAPSHOT ── */}
      <section className={styles.snapshot}>
        <div className={styles.snapshotHeader}>
          <span className="eyebrow">Live Market Data</span>
          <Link href="/markets" className={styles.snapshotLink}>
            Full Dashboard &rarr;
          </Link>
        </div>
        <div className={styles.coinGrid}>
          {coins.map((coin) => {
            const d = prices?.[coin.key];
            return (
              <div key={coin.key} className={styles.coinCard}>
                <div className={styles.coinTop}>
                  <span className={styles.coinSym}>{coin.sym}</span>
                  <span
                    className={styles.coinChg}
                    style={{ color: pctColor(d?.usd_24h_change) }}
                  >
                    {formatPct(d?.usd_24h_change)}
                  </span>
                </div>
                <div className={styles.coinPrice}>{formatPrice(d?.usd)}</div>
                <div className={styles.coinCap}>MCap {formatPrice(d?.usd_market_cap)}</div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="gold-divider" />

      {/* ── VERTICALS ── */}
      <section className={styles.verticals}>
        <div className={styles.vertHeader}>
          <p className="eyebrow">Our Coverage</p>
          <h2 className="section-title">
            Six Perspectives. <em>One Picture.</em>
          </h2>
          <p className={styles.vertDesc}>
            Markets are interconnected. We analyze each vertical independently
            and show how everything connects.
          </p>
        </div>
        <div className={styles.vertGrid}>
          {Object.entries(VERTICALS).map(([key, v]) => (
            <Link
              key={key}
              href={`/research?v=${key}`}
              className={styles.vertCard}
              style={{ '--vc': v.hex } as any}
            >
              <span className={styles.vertIcon}>{v.icon}</span>
              <span className={styles.vertName}>{v.labelShort}</span>
              <span className={styles.vertDesc2}>{v.description}</span>
            </Link>
          ))}
        </div>
        {/* Cross-connections */}
        <div className={styles.crossBanner}>
          <p>
            <strong>Fed rate decision</strong> &rarr; Dollar &rarr; Gold &amp; Oil
            &rarr; EM Currencies &rarr; Crypto allocation.{' '}
            <strong>We connect these dots.</strong>
          </p>
        </div>
      </section>

      <div className="gold-divider" />

      {/* ── FEATURED RESEARCH ── */}
      <section className={styles.research}>
        <div className={styles.researchHeader}>
          <div>
            <p className="eyebrow">Research &amp; Opinions</p>
            <h2 className="section-title">
              Latest <em>Publications</em>
            </h2>
          </div>
          <Link href="/research" className="btn-outline" style={{ padding: '10px 24px', fontSize: '0.7rem' }}>
            View All
          </Link>
        </div>
        <div className={styles.articleGrid}>
          {featured && (
            <Link href={`/research/${featured.slug}`} className={`${styles.articleCard} ${styles.featured}`}>
              <div className={styles.articleTags}>
                {featured.tags.map((t) => (
                  <span key={t} className={styles.tag} style={{ background: `${VERTICALS[t].hex}15`, color: VERTICALS[t].hex }}>
                    {VERTICALS[t].labelShort}
                  </span>
                ))}
              </div>
              <h3 className={styles.articleTitle}>{featured.title}</h3>
              <p className={styles.articleExcerpt}>{featured.excerpt}</p>
              <div className={styles.articleMeta}>
                <span>{featured.date} &middot; {featured.readTime}</span>
                <span className={styles.arrow}>&rarr;</span>
              </div>
            </Link>
          )}
          {recent.map((a) => (
            <Link key={a.slug} href={`/research/${a.slug}`} className={styles.articleCard}>
              <div className={styles.articleTags}>
                {a.tags.map((t) => (
                  <span key={t} className={styles.tag} style={{ background: `${VERTICALS[t].hex}15`, color: VERTICALS[t].hex }}>
                    {VERTICALS[t].labelShort}
                  </span>
                ))}
              </div>
              <h3 className={styles.articleTitle}>{a.title}</h3>
              <p className={styles.articleExcerpt}>{a.excerpt}</p>
              <div className={styles.articleMeta}>
                <span>{a.date} &middot; {a.readTime}</span>
                <span className={styles.arrow}>&rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="gold-divider" />

      {/* ── NEWSLETTER CTA ── */}
      <section className={styles.nlSection}>
        <p className="eyebrow">Newsletter</p>
        <h2 className="section-title">
          Stay <em>Informed</em>
        </h2>
        <p className={styles.nlDesc}>
          Investor briefings directly to your inbox. Choose your topics. No spam, only substance.
        </p>
        <div className={styles.nlBox}>
          <Link href="/newsletter" className="btn-gold" style={{ width: '100%', textAlign: 'center' }}>
            Subscribe to Newsletter
          </Link>
        </div>
      </section>
    </>
  );
}
