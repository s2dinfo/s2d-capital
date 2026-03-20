'use client';
import { useState, useRef, useEffect } from 'react';

const GLOSSARY: Record<string, string> = {
  // Macro
  'DXY': 'The US Dollar Index — measures the dollar against a basket of 6 major currencies (EUR, JPY, GBP, CHF, CAD, SEK).',
  'CPI': 'Consumer Price Index — measures inflation by tracking the average change in prices paid by consumers.',
  'Fed': 'The Federal Reserve — the central bank of the United States, which sets interest rates and monetary policy.',
  'Fed Rate': 'The Federal Funds Rate — the interest rate at which banks lend to each other overnight, set by the Fed.',
  'ECB': 'European Central Bank — the central bank for the eurozone, responsible for monetary policy in the euro area.',
  'BOJ': 'Bank of Japan — Japan\'s central bank.',
  '10Y Yield': 'The yield on 10-year US Treasury bonds — a key benchmark for global interest rates and risk appetite.',
  'VIX': 'The CBOE Volatility Index — measures expected S&P 500 volatility over 30 days. Often called the "fear gauge".',
  'M2': 'M2 Money Supply — a measure of the total amount of money in circulation, including cash, checking deposits, and near-money.',
  'Yield Curve': 'A graph showing interest rates across different bond maturities. An inverted curve (short > long) often signals recession.',

  // Crypto
  'BTC': 'Bitcoin — the first and largest cryptocurrency by market cap, created in 2009 by Satoshi Nakamoto.',
  'ETH': 'Ethereum — the second-largest cryptocurrency and a platform for smart contracts and decentralized applications.',
  'DeFi': 'Decentralized Finance — financial services built on blockchain without traditional intermediaries like banks.',
  'ETF': 'Exchange-Traded Fund — a fund that trades on stock exchanges like a stock. Spot Bitcoin ETFs hold actual BTC.',
  'BTC Dominance': 'Bitcoin\'s share of the total cryptocurrency market capitalization. Higher = money flowing to BTC over altcoins.',
  'Fear & Greed Index': 'A composite indicator (0-100) measuring crypto market sentiment. 0 = extreme fear, 100 = extreme greed.',
  'TVL': 'Total Value Locked — the total amount of crypto assets deposited in DeFi protocols.',
  'Stablecoin': 'A cryptocurrency pegged to a stable asset (usually USD). Examples: USDT, USDC, DAI.',
  'CLARITY Act': 'The Digital Asset Market Clarity Act — proposed US law creating clear regulatory framework for crypto.',
  'GENIUS Act': 'Guiding and Establishing National Innovation for US Stablecoins Act — US stablecoin regulation passed in 2025.',

  // Commodities & Energy
  'WTI': 'West Texas Intermediate — the US benchmark for crude oil prices.',
  'Brent': 'Brent Crude — the international benchmark for oil prices, priced in London.',
  'EU ETS': 'EU Emissions Trading System — Europe\'s carbon market where companies buy/sell allowances to emit CO2.',
  'CBAM': 'Carbon Border Adjustment Mechanism — EU tariff on imports based on their carbon footprint.',
  'TTF': 'Title Transfer Facility — the main European natural gas benchmark, traded in the Netherlands.',
  'THE': 'Trading Hub Europe — Germany\'s virtual gas trading point, the largest national hub in Europe.',
  'SAF': 'Sustainable Aviation Fuel — renewable jet fuel mandated by EU regulations.',
  'Merit Order': 'The order in which power plants are dispatched, from cheapest to most expensive marginal cost.',
  'GoO': 'Guarantees of Origin — EU certificates proving electricity was generated from renewable sources.',
  'THG-Quote': 'Treibhausgasminderungsquote — Germany\'s GHG reduction quota system for transport fuels.',
  'Nat Gas': 'Natural Gas — a fossil fuel used for heating, electricity, and industrial processes.',

  // FX
  'EUR/USD': 'Euro vs US Dollar exchange rate — the most traded currency pair in the world.',
  'GBP/USD': 'British Pound vs US Dollar — also called "Cable".',
  'USD/JPY': 'US Dollar vs Japanese Yen — heavily influenced by Bank of Japan policy.',
  'EM': 'Emerging Markets — developing economies like Brazil, India, Turkey, South Africa.',
  'Carry Trade': 'Borrowing in a low-interest currency to invest in a higher-yielding one.',

  // Market Structure
  'OCC': 'Office of the Comptroller of the Currency — US regulator for national banks.',
  'SEC': 'Securities and Exchange Commission — US regulator for securities markets.',
  'CFTC': 'Commodity Futures Trading Commission — US regulator for derivatives and commodity markets.',
  'OTC': 'Over-the-Counter — trades conducted directly between parties, not on a public exchange.',
  'S&P 500': 'Standard & Poor\'s 500 — an index of the 500 largest US publicly traded companies.',
  'NASDAQ': 'National Association of Securities Dealers Automated Quotations — US tech-heavy stock index.',
  'DOW': 'Dow Jones Industrial Average — an index of 30 major US companies.',

  // Geopolitics
  'OPEC+': 'Organization of the Petroleum Exporting Countries and allies — controls ~40% of global oil supply.',
  'Strait of Hormuz': 'A narrow waterway between Iran and Oman. ~20% of global oil passes through it daily.',
  'BRICS': 'Brazil, Russia, India, China, South Africa (+ new members) — a bloc of major emerging economies.',
  'Sanctions': 'Government-imposed trade restrictions on countries, entities, or individuals to achieve foreign policy goals.',
};

interface GlossaryTermProps {
  term: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export default function GlossaryTerm({ term, children, style }: GlossaryTermProps) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState<'above' | 'below'>('below');
  const ref = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  const definition = GLOSSARY[term];
  if (!definition) return <span style={style}>{children || term}</span>;

  useEffect(() => {
    if (show && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPos(rect.top > 200 ? 'above' : 'below');
    }
  }, [show]);

  return (
    <span
      ref={ref}
      onClick={() => setShow(!show)}
      style={{
        ...style,
        cursor: 'help',
        borderBottom: '1px dashed rgba(184,134,11,0.4)',
        position: 'relative',
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderBottomColor = 'rgba(184,134,11,0.8)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderBottomColor = 'rgba(184,134,11,0.4)'; setShow(false); }}
    >
      {children || term}
      {show && (
        <div
          ref={tipRef}
          style={{
            position: 'absolute',
            [pos === 'above' ? 'bottom' : 'top']: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: pos === 'below' ? 8 : 0,
            marginBottom: pos === 'above' ? 8 : 0,
            background: 'rgba(15,15,35,0.95)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(184,134,11,0.25)',
            borderRadius: 8,
            padding: '12px 16px',
            width: 280,
            zIndex: 100,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            animation: 'glossaryIn 0.15s ease',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.55rem',
            letterSpacing: '0.12em',
            color: 'var(--gold-light, #D4B85C)',
            marginBottom: 6,
            fontWeight: 600,
          }}>
            {term}
          </div>
          <div style={{
            fontSize: '0.78rem',
            color: 'rgba(255,255,255,0.75)',
            lineHeight: 1.6,
            fontFamily: 'var(--font-sans)',
          }}>
            {definition}
          </div>
        </div>
      )}
      <style>{`@keyframes glossaryIn{from{opacity:0;transform:translateX(-50%) translateY(4px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </span>
  );
}

// Export the glossary so other components can use it
export { GLOSSARY };
