import Link from 'next/link';
import Image from 'next/image';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div>
          <Image src="/logo.png" alt="S2D Capital Insights" width={140} height={93} className={styles.logo} />
          <p className={styles.tagline}>
            Financial Intelligence. Crypto. Macro. Commodities. FX. Geopolitics.
            <br />Frankfurt &middot; London
          </p>
        </div>
        <div className={styles.columns}>
          <div className={styles.col}>
            <h4>Research</h4>
            <Link href="/research">All Publications</Link>
            <Link href="/research?v=crypto">Crypto &amp; Digital Assets</Link>
            <Link href="/research?v=macro">Macro &amp; Central Banks</Link>
            <Link href="/research?v=commodities">Commodities &amp; Energy</Link>
            <Link href="/research?v=fx">FX &amp; Currencies</Link>
          </div>
          <div className={styles.col}>
            <h4>Company</h4>
            <Link href="/about">About</Link>
            <Link href="/newsletter">Newsletter</Link>
            <Link href="/impressum">Impressum</Link>
            <Link href="/datenschutz">Datenschutz</Link>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <span>&copy; 2026 S2D Capital Insights. All rights reserved.</span>
        <div className={styles.social}>
          <a href="https://x.com/S2DCapital" target="_blank" rel="noopener">X / Twitter</a>
          <a href="https://linkedin.com/company/s2d-capital" target="_blank" rel="noopener">LinkedIn</a>
        </div>
      </div>
    </footer>
  );
}
