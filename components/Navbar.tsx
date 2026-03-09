'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close menu when route changes
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
        <Link href="/" className={styles.logo} onClick={closeMenu}>
          <Image src="/logo-hero.png" alt="S2D Capital Insights" width={220} height={147} priority />
        </Link>

        {/* Desktop links */}
        <ul className={styles.links}>
          <li><Link href="/research">Research</Link></li>
          <li><Link href="/markets">Markets</Link></li>
          <li><Link href="/newsletter">Newsletter</Link></li>
          <li><Link href="/about">About</Link></li>
        </ul>

        <div className={styles.right}>
          <Link href="/newsletter" className={styles.subBtn}>
            Subscribe
          </Link>

          {/* Hamburger button - mobile only */}
          <button
            className={styles.hamburger}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`${styles.hamLine} ${menuOpen ? styles.hamOpen1 : ''}`} />
            <span className={`${styles.hamLine} ${menuOpen ? styles.hamOpen2 : ''}`} />
            <span className={`${styles.hamLine} ${menuOpen ? styles.hamOpen3 : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className={styles.mobileOverlay} onClick={closeMenu}>
          <div className={styles.mobileMenu} onClick={(e) => e.stopPropagation()}>
            <Link href="/research" className={styles.mobileLink} onClick={closeMenu}>
              Research
            </Link>
            <Link href="/markets" className={styles.mobileLink} onClick={closeMenu}>
              Markets
            </Link>
            <Link href="/newsletter" className={styles.mobileLink} onClick={closeMenu}>
              Newsletter
            </Link>
            <Link href="/about" className={styles.mobileLink} onClick={closeMenu}>
              About
            </Link>
            <Link href="/impressum" className={styles.mobileLinkSmall} onClick={closeMenu}>
              Impressum
            </Link>
            <Link href="/datenschutz" className={styles.mobileLinkSmall} onClick={closeMenu}>
              Datenschutz
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
