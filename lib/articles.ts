import { VerticalKey } from './verticals';

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  tags: VerticalKey[];
  date: string;
  readTime: string;
  featured?: boolean;
  published: boolean;
}

// Temporary static articles - will be replaced by Notion CMS
export const articles: Article[] = [
  {
    slug: 'clarity-act-institutional-crypto-adoption',
    title: 'The CLARITY Act: How US Regulation Ushers in the Next Era of Institutional Crypto Adoption',
    excerpt: 'JPMorgan calls it the most important catalyst of the year. Eight key provisions, lessons from the $1.8T crash of 2022, institutional price targets from $150K to $710K, and why this cycle is structurally different.',
    tags: ['crypto', 'structure'],
    date: 'March 2026',
    readTime: '25 min',
    featured: true,
    published: true,
  },
  {
    slug: 'fed-pivot-or-pause',
    title: 'Fed Pivot or Pause? What Powell\'s Language Means for Risk Assets',
    excerpt: 'The connection between rate decisions, dollar strength, and crypto allocation - decoded across macro, FX, and digital asset markets.',
    tags: ['macro', 'fx'],
    date: 'Coming Soon',
    readTime: '18 min',
    featured: false,
    published: false,
  },
  {
    slug: 'gold-3000-safe-haven-or-bubble',
    title: 'Gold at $3,000: Safe Haven or Bubble? BRICS, Central Banks, and De-Dollarization',
    excerpt: 'Why central banks are buying more gold than since 1967 - and what it means for Bitcoin as a competing store of value.',
    tags: ['commodities', 'geopolitics'],
    date: 'Coming Soon',
    readTime: '20 min',
    featured: false,
    published: false,
  },
  {
    slug: 'stablecoins-vs-swift',
    title: 'Stablecoins vs. SWIFT: How Digital Dollars Are Disrupting FX Markets',
    excerpt: '$180B in stablecoins is the elephant in the FX room. The GENIUS Act drives integration between traditional and digital finance.',
    tags: ['fx', 'crypto'],
    date: 'Coming Soon',
    readTime: '15 min',
    featured: false,
    published: false,
  },
  {
    slug: 'trump-tariff-escalation-2026',
    title: 'Trump\'s 2026 Tariff Escalation: Impact on EUR/USD, Commodities, and Crypto Regulation',
    excerpt: 'How the trade war influences midterms - and why the CLARITY Act window is shrinking faster than markets expect.',
    tags: ['geopolitics', 'macro'],
    date: 'Coming Soon',
    readTime: '22 min',
    featured: false,
    published: false,
  },
  {
    slug: 'morgan-stanley-digital-trust',
    title: 'Morgan Stanley Digital Trust: $8 Trillion Meets Crypto Infrastructure',
    excerpt: 'The OCC application and what it means for institutional custody, the ETF landscape, and the next wave of Wall Street adoption.',
    tags: ['structure', 'crypto'],
    date: 'Coming Soon',
    readTime: '16 min',
    featured: false,
    published: false,
  },
];
