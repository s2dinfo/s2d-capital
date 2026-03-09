'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <Link href="/" className={styles.logo}>
        <Image src="/logo-hero.png" alt="S2D Capital Insights" width={220} height={147} priority />
      </Link>
      <ul className={styles.links}>
        <li><Link href="/research">Research</Link></li>
        <li><Link href="/markets">Markets</Link></li>
        <li><Link href="/newsletter">Newsletter</Link></li>
        <li><Link href="/about">About</Link></li>
      </ul>
      <div className={styles.right}>
        <Link href="/newsletter" className="btn-gold" style={{ padding: '10px 24px', fontSize: '0.7rem' }}>
          Subscribe
        </Link>
      </div>
    </nav>
  );
}
