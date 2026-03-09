import Image from 'next/image';
import Link from 'next/link';
import { getCryptoPrices, formatPrice, formatPct, pctColor } from '@/lib/api';
import { VERTICALS } from '@/lib/verticals';
import { articles } from '@/lib/articles';
import styles from './page.module.css';

export const revalidate = 300;

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
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <Image
            src="/logo-hero.png"
            alt="S2D Capital Insights"
            width={500}
            height={333}
            className={styles.heroLogo}
            priority
          />
          <p className={styles.heroEyebrow}>FINANCIAL INTELLIGENCE</p>
          <h1 className={styles.heroTitle}>
            Where Markets Meet <em>Clarity</em>
          </h1>
          <p className={styles.heroSub}>
            Institutional analysis across crypto, macro, commodities, FX, and geopolitics.
            We connect the dots others miss.
          </p>
          <div className={styles.heroActions}>
            <Link href="/research" className={styles.btnGold}>Explore Research</Link>
            <Link href="/newsletter" className={styles.btnOutline}>Subscribe</Link>
          </div>
        </div>
        <div className={styles.heroBottom} />
      </section>

      {/* STATS BAR */}
      <section className={styles.statsBar}>
        {coins.map((coin) => {
          const d = prices?.[coin.key];
          const isUp = d?.usd_24h_change > 0;
          return (
            <div key={coin.key} className={styles.statItem}>
              <div className={styles.statValue}>
                {formatPrice(d?.usd)}
              </div>
              <div className={styles.statLabel}>
                {coin.name}{' '}
                <span className={isUp ? styles.statUp : styles.statDown}>
                  {formatPct(d?.usd_24h_change)}
                </span>
              </div>
            </div>
          );
        })}
      </section>

      <div className={styles.goldDiv} />

      {/* VERTICALS */}
      <section className={styles.verticals}>
        <div className={styles.sectionCenter}>
          <p className={styles.eyebrow}>Our Coverage</p>
          <h2 className={styles.sectionTitle}>
            Six Perspectives. <em>One Picture.</em>
          </h2>
          <p className={styles.sectionDesc}>
            Markets are interconnected. We analyze each vertical independently
            and show how everything connects.
          </p>
        </div>
        <div className={styles.vertGrid}>
          {Object.entries(VERTICALS).map(([key, v]) => (
            <Link key={key} href={`/research?v=${key}`} className={styles.vertCard}>
              <div className={styles.vertAccent} style={{ background: v.hex }} />
              <div className={styles.vertIconWrap} style={{ color: v.hex }}>
                {v.icon}
              </div>
              <div className={styles.vertLabel}>{v.label}</div>
              <div className={styles.vertDesc}>{v.description}</div>
              <div className={styles.vertTagRow}>
                {v.tags.map((t) => (
                  <span key={t} className={styles.vertTag} style={{ color: v.hex, borderColor: `${v.hex}30` }}>{t}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>

        <div className={styles.crossBanner}>
          <p>
            <strong>Fed rate decision</strong> &#8594; Dollar &#8594; Gold &amp; Oil
            &#8594; EM Currencies &#8594; Crypto allocation.{' '}
            <strong>We connect these dots.</strong>
          </p>
        </div>
      </section>

      <div className={styles.goldDiv} />

      {/* RESEARCH */}
      <section className={styles.research}>
        <div className={styles.researchTop}>
          <div>
            <p className={styles.eyebrow}>Research &amp; Opinions</p>
            <h2 className={styles.sectionTitle}>Latest <em>Publications</em></h2>
          </div>
          <Link href="/research" className={styles.btnOutline} style={{ padding: '10px 24px', fontSize: '0.7rem' }}>
            View All
          </Link>
        </div>
        <div className={styles.articleGrid}>
          {featured && (
            <Link href={`/research/${featured.slug}`} className={`${styles.card} ${styles.cardFeat}`}>
              <div className={styles.cardTags}>
                {featured.tags.map((t) => (
                  <span key={t} className={styles.cardTag} style={{ background: `${VERTICALS[t].hex}18`, color: VERTICALS[t].hex }}>
                    {VERTICALS[t].labelShort}
                  </span>
                ))}
              </div>
              <h3 className={styles.cardTitle}>{featured.title}</h3>
              <p className={styles.cardExcerpt}>{featured.excerpt}</p>
              <div className={styles.cardMeta}>
                <span>{featured.date} &middot; {featured.readTime}</span>
                <span className={styles.cardArrow}>&#8594;</span>
              </div>
            </Link>
          )}
          {recent.map((a) => (
            <Link key={a.slug} href={`/research/${a.slug}`} className={styles.card}>
              <div className={styles.cardTags}>
                {a.tags.map((t) => (
                  <span key={t} className={styles.cardTag} style={{ background: `${VERTICALS[t].hex}18`, color: VERTICALS[t].hex }}>
                    {VERTICALS[t].labelShort}
                  </span>
                ))}
              </div>
              <h3 className={styles.cardTitle}>{a.title}</h3>
              <p className={styles.cardExcerpt}>{a.excerpt}</p>
              <div className={styles.cardMeta}>
                <span>{a.date} &middot; {a.readTime}</span>
                <span className={styles.cardArrow}>&#8594;</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className={styles.goldDiv} />

      {/* NEWSLETTER */}
      <section className={styles.nlSection}>
        <div className={styles.nlGlow} />
        <p className={styles.eyebrow}>Newsletter</p>
        <h2 className={styles.sectionTitle}>Stay <em>Informed</em></h2>
        <p className={styles.nlDesc}>
          Investor briefings directly to your inbox. Choose your topics. No spam, only substance.
        </p>
        <Link href="/newsletter" className={styles.btnGold} style={{ padding: '16px 48px' }}>
          Subscribe to Newsletter
        </Link>
      </section>
    </>
  );
}
