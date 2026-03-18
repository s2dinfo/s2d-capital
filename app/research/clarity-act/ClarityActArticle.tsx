"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import React from "react";

// Dynamic import to avoid SSR issues with lightweight-charts
const LiveChart = dynamic(() => import("@/components/LiveChart"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: 300,
        border: "1px solid var(--border, #E8E6E0)",
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "28px 0",
        color: "var(--text-muted, #9C9CAF)",
        fontFamily: "var(--mono)",
        fontSize: "0.72rem",
      }}
    >
      Loading chart...
    </div>
  ),
});

/* ── Style helpers ── */
const S = {
  article: {
    maxWidth: 780,
    margin: "0 auto",
    padding: "0 24px 80px",
    fontFamily: "var(--sans, 'Outfit', sans-serif)",
    color: "var(--text-body, #3a3a4a)",
    lineHeight: 1.85,
    fontSize: "1.02rem",
  } as React.CSSProperties,
  hero: {
    textAlign: "center" as const,
    padding: "72px 24px 48px",
    background:
      "linear-gradient(180deg, var(--gold-tint, #faf6ee) 0%, var(--bg-primary, #fff) 100%)",
    borderBottom: "1px solid var(--border, #E8E6E0)",
  } as React.CSSProperties,
  eyebrow: {
    fontFamily: "var(--mono, 'JetBrains Mono', monospace)",
    fontSize: "0.62rem",
    letterSpacing: "0.3em",
    textTransform: "uppercase" as const,
    color: "var(--gold, #b8860b)",
    marginBottom: 18,
  } as React.CSSProperties,
  h1: {
    fontFamily: "var(--serif, 'Playfair Display', serif)",
    fontSize: "clamp(2rem, 4.5vw, 3rem)",
    fontWeight: 400,
    lineHeight: 1.15,
    color: "var(--navy, #0f0f23)",
    marginBottom: 18,
    maxWidth: 720,
    marginLeft: "auto",
    marginRight: "auto",
  } as React.CSSProperties,
  subtitle: {
    fontSize: "1.05rem",
    color: "var(--text-secondary, #6B6B82)",
    maxWidth: 560,
    margin: "0 auto 24px",
    lineHeight: 1.7,
    fontWeight: 300,
  } as React.CSSProperties,
  meta: {
    fontFamily: "var(--mono, 'JetBrains Mono', monospace)",
    fontSize: "0.62rem",
    letterSpacing: "0.12em",
    color: "var(--text-muted, #9C9CAF)",
    display: "flex" as const,
    justifyContent: "center" as const,
    gap: 20,
    flexWrap: "wrap" as const,
  } as React.CSSProperties,
  h2: {
    fontFamily: "var(--serif, 'Playfair Display', serif)",
    fontSize: "1.6rem",
    fontWeight: 400,
    color: "var(--navy, #0f0f23)",
    marginTop: 56,
    marginBottom: 20,
    lineHeight: 1.25,
  } as React.CSSProperties,
  h3: {
    fontFamily: "var(--serif, 'Playfair Display', serif)",
    fontSize: "1.2rem",
    fontWeight: 500,
    color: "var(--navy, #0f0f23)",
    marginTop: 36,
    marginBottom: 14,
    lineHeight: 1.3,
  } as React.CSSProperties,
  callout: {
    background: "var(--gold-tint, #faf6ee)",
    borderLeft: "3px solid var(--gold, #b8860b)",
    padding: "20px 24px",
    margin: "28px 0",
    borderRadius: "0 6px 6px 0",
    fontSize: "0.95rem",
    lineHeight: 1.8,
  } as React.CSSProperties,
  calloutLabel: {
    fontFamily: "var(--mono, 'JetBrains Mono', monospace)",
    fontSize: "0.58rem",
    letterSpacing: "0.2em",
    textTransform: "uppercase" as const,
    color: "var(--gold, #b8860b)",
    marginBottom: 8,
    fontWeight: 600,
  } as React.CSSProperties,
  keyFigure: {
    background: "var(--navy, #0f0f23)",
    color: "#fff",
    borderRadius: 8,
    padding: "24px 28px",
    margin: "28px 0",
    display: "flex" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    flexWrap: "wrap" as const,
    gap: 16,
  } as React.CSSProperties,
  keyFigureNum: {
    fontFamily: "var(--serif, 'Playfair Display', serif)",
    fontSize: "2rem",
    fontWeight: 400,
    color: "var(--gold-light, #d4a843)",
  } as React.CSSProperties,
  keyFigureLabel: {
    fontFamily: "var(--mono, 'JetBrains Mono', monospace)",
    fontSize: "0.62rem",
    letterSpacing: "0.12em",
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase" as const,
  } as React.CSSProperties,
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    margin: "24px 0",
    fontSize: "0.88rem",
    fontFamily: "var(--sans, 'Outfit', sans-serif)",
  } as React.CSSProperties,
  th: {
    fontFamily: "var(--mono, 'JetBrains Mono', monospace)",
    fontSize: "0.6rem",
    letterSpacing: "0.2em",
    textTransform: "uppercase" as const,
    color: "var(--text-muted, #9C9CAF)",
    borderBottom: "2px solid var(--border, #E8E6E0)",
    padding: "10px 12px",
    textAlign: "left" as const,
    fontWeight: 600,
  } as React.CSSProperties,
  td: {
    padding: "12px 12px",
    borderBottom: "1px solid var(--border, #E8E6E0)",
    verticalAlign: "top" as const,
  } as React.CSSProperties,
  disclaimer: {
    marginTop: 48,
    padding: "24px 0",
    borderTop: "1px solid var(--border, #E8E6E0)",
    fontSize: "0.72rem",
    color: "var(--text-muted, #9C9CAF)",
    lineHeight: 1.7,
  } as React.CSSProperties,
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

// Price targets table data
const priceTargets = [
  { institution: "JPMorgan Chase", target: "$266,000", basis: "Volatility-adjusted gold comparison (long-term)" },
  { institution: "JPMorgan Chase", target: "$170,000", basis: "Fair value model (6–12 months)" },
  { institution: "Standard Chartered", target: "$150,000", basis: "ETF inflows & miner profitability" },
  { institution: "Bernstein", target: "$150,000", basis: "Tokenization supercycle 2026; $200K in 2027" },
  { institution: "VanEck", target: "$180,000", basis: "Penetration of global asset markets" },
  { institution: "Fundstrat (Tom Lee)", target: "$200–250K", basis: "Institutional flows & expanded allocation" },
  { institution: "Maple Finance", target: "$175,000", basis: "Rate cuts & growing institutional use cases" },
  { institution: "ARK Invest (2030)", target: "$710K Base", basis: "Scaling of institutional allocations" },
];

export default function ClarityActArticle() {
  return (
    <article>
      {/* ═══ HERO ═══ */}
      <motion.div style={S.hero} {...fadeUp}>
        <div style={S.eyebrow}>Investor Briefing · March 2026</div>
        <h1 style={S.h1}>
          The <em style={{ fontStyle: "italic", color: "var(--gold, #b8860b)" }}>CLARITY Act</em>
        </h1>
        <p style={S.subtitle}>
          How US regulation ushers in the next era of institutional crypto adoption
        </p>
        <div style={S.meta}>
          <span>By Sami Samii</span>
          <span>·</span>
          <span>S2D Capital Insights</span>
          <span>·</span>
          <span>25 min read</span>
        </div>
      </motion.div>

      {/* ═══ BODY ═══ */}
      <div style={S.article}>
        {/* Key figures bar */}
        <motion.div
          style={S.keyFigure}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div>
            <div style={S.keyFigureNum}>$266K</div>
            <div style={S.keyFigureLabel}>JPMorgan BTC Long-Term Target</div>
          </div>
          <div>
            <div style={S.keyFigureNum}>$180–220B</div>
            <div style={S.keyFigureLabel}>BTC ETF AuM by End of 2026</div>
          </div>
          <div>
            <div style={S.keyFigureNum}>&gt;$1.8T</div>
            <div style={S.keyFigureLabel}>Market Value Lost in 2022</div>
          </div>
        </motion.div>

        {/* ── Executive Summary ── */}
        <h2 style={S.h2}>Executive Summary</h2>

        <p>
          The crypto market is at a turning point. After years in a regulatory gray zone — an environment
          that enabled catastrophic collapses like FTX, Terra/Luna, and Celsius — the United States is on
          the verge of passing the first comprehensive crypto market structure law in history: the{" "}
          <strong>Digital Asset Market Clarity Act</strong> (the &ldquo;CLARITY Act&rdquo;).
        </p>

        <p>
          Put simply: until now, there were no clear rules for cryptocurrencies. Companies could do whatever
          they wanted with customer funds without effective regulatory oversight. This led to billions in
          fraud and collapses. The CLARITY Act aims to change exactly that — paving the way for institutional
          capital on an unprecedented scale.
        </p>

        <div style={S.callout}>
          <div style={S.calloutLabel}>JPMorgan Chase Research · Feb. 2026</div>
          JPMorgan Chase identified the passage of this law as the &ldquo;most important catalyst for the
          crypto market&rdquo; this year. The bank wrote: if the law is passed, it will fundamentally
          transform market structure — through regulatory clarity, the end of regulation by enforcement,
          the promotion of tokenization, and stronger institutional participation.
        </div>

        {/* Inline BTC chart — relevant after discussing market impact */}
        <LiveChart symbol="BTC-USD" label="Bitcoin (BTC/USD)" range="6mo" height={280} />

        <p>
          What does this mean for you as an investor? The crypto industry is facing a structural shift.
          The question is no longer whether major financial institutions will enter crypto — but how much
          capital they will allocate. And this shift is being accelerated by the CLARITY Act.
        </p>

        {/* ── Section 1: CLARITY Act ── */}
        <h2 style={S.h2}>1. The CLARITY Act: What It Is and Why It Matters</h2>

        <h3 style={S.h3}>What is the CLARITY Act?</h3>
        <p>
          The &ldquo;Digital Asset Market Clarity Act&rdquo; is the most important piece of crypto
          legislation ever considered by the US Congress. It was passed with bipartisan support in the
          House of Representatives in July 2025 and is currently being debated in the Senate.
        </p>
        <p>
          To put it in perspective: imagine opening a restaurant where there are no food safety regulations,
          no hygiene inspections, and no clear assignment of which agency is responsible for what. That is
          essentially how the crypto market has operated until now. The CLARITY Act creates a clear
          regulatory framework for the first time.
        </p>

        <h3 style={S.h3}>1.1 The Core Problem: Jurisdictional Chaos</h3>
        <p>
          For years, two US agencies have fought over jurisdiction for crypto: the Securities and Exchange
          Commission (SEC) and the Commodity Futures Trading Commission (CFTC). There were no clear rules
          governing which cryptocurrency falls under which regulator. The result: companies often only
          learned the rules when they were already being sued — so-called &ldquo;regulation by enforcement.&rdquo;
        </p>
        <p>
          The CLARITY Act solves this problem at its root: it classifies crypto tokens as either
          &ldquo;digital commodities&rdquo; (CFTC oversight) or &ldquo;digital securities&rdquo; (SEC
          oversight), based on their nature and use.
        </p>

        <h3 style={S.h3}>1.2 The Eight Key Provisions</h3>
        <p>JPMorgan identified eight concrete catalysts in the legislation:</p>

        <div style={{ margin: "20px 0 20px 20px" }}>
          <p><strong>1. Clear CFTC/SEC Jurisdiction:</strong> Major tokens like Bitcoin and Ethereum would
          fall under CFTC oversight, significantly reducing the regulatory burden. A &ldquo;grandfather
          clause&rdquo; allows tokens that were tied to spot ETFs before January 1, 2026 — including XRP,
          Solana, Litecoin, Hedera, Dogecoin, and Chainlink — to be treated as commodities.</p>

          <p><strong>2. Capital Raising Without Full SEC Registration:</strong> New crypto projects could
          raise up to $75 million annually without going through the full SEC registration process. JPMorgan
          says this could bring startup activity and venture capital investment back to the US.</p>

          <p><strong>3. Institutional Custody Standards:</strong> Clearer registration and custody requirements
          would allow major financial institutions like BNY Mellon and State Street to directly custody digital
          assets. For you as an investor, this means: your crypto assets will be held by the same type of
          institution that holds your stocks and bonds.</p>

          <p><strong>4. Real-World Asset Tokenization:</strong> The law clarifies that tokenized traditional
          securities remain subject to existing securities laws. Imagine a $100 million building divided into
          10 million digital &ldquo;shares&rdquo; that can be traded on the blockchain — 24/7, globally, with
          instant settlement.</p>

          <p><strong>5. Developer Protections:</strong> Miners, validators, and software developers would be
          exempt from broker reporting requirements as long as they are in the development phase.</p>

          <p><strong>6. Tax Clarity:</strong> Tax exemptions for small everyday crypto payments and clear rules
          for taxing staking income.</p>

          <p><strong>7. Stablecoin Framework:</strong> Complementing the already-passed GENIUS Act, the CLARITY
          Act creates comprehensive rules for the issuance and reserve management of stablecoins. Going forward,
          they must be provably backed 1:1 by short-term US Treasury bonds or cash.</p>

          <p><strong>8. End of &ldquo;Regulation by Enforcement&rdquo;:</strong> The era in which companies were
          sued first and informed of the rules later would formally end.</p>
        </div>

        <h3 style={S.h3}>1.3 Current Status in the Legislative Process</h3>
        <p>As of early March 2026, two contentious issues remain in the Senate:</p>
        <div style={{ margin: "16px 0 16px 20px" }}>
          <p>
            <strong>Stablecoin Yields:</strong> Crypto companies like Coinbase want to pay users interest for
            holding stablecoins. Banks warn that this could draw deposits away from the traditional banking system.
          </p>
          <p>
            <strong>Conflicts of Interest:</strong> Democratic senators are pushing to prohibit senior government
            officials and their families from engaging in certain crypto financial transactions.
          </p>
        </div>
        <p>
          JPMorgan&apos;s base case: passage by mid-2026, before the legislative window closes due to congressional
          elections in August.
        </p>

        {/* ── Section 2: 2022 Crashes ── */}
        <h2 style={S.h2}>2. The Consequences of Missing Regulation: What Happened in 2022</h2>

        <p>
          The crypto crashes of 2022 destroyed over $1.8 trillion in market value. These were not normal market
          movements — they were cascading collapses directly caused by the absence of oversight, transparency
          requirements, and customer protections.
        </p>

        <div style={S.callout}>
          <div style={S.calloutLabel}>Key Takeaway</div>
          Every major crypto crash in 2022 was caused by fraud, mismanagement, or flawed designs that proper
          regulation would have prevented. The CLARITY Act addresses each of these vulnerabilities.
        </div>

        <h3 style={S.h3}>2.1 Terra/Luna: The $48 Billion Collapse (May 2022)</h3>
        <p>
          Terra was a so-called &ldquo;algorithmic stablecoin&rdquo; — a cryptocurrency designed to always be
          worth exactly $1. But unlike traditional stablecoins, Terra&apos;s dollar peg was maintained purely
          through a computer mechanism involving a sister coin called LUNA. There were no real reserves.
        </p>
        <p>
          When confidence faltered, a classic bank run ensued: everyone wanted out at the same time. Within just
          three days, the LUNA supply exploded from 1 billion to 6 trillion tokens, and its price fell from $80
          to virtually zero. Over $48 billion in value was destroyed.
        </p>

        <h3 style={S.h3}>2.2 FTX: The $8 Billion Fraud (November 2022)</h3>
        <p>
          FTX was one of the largest crypto exchanges in the world, founded by Sam Bankman-Fried. Behind the
          polished facade, however, something unthinkable in the regulated financial world was happening: FTX
          secretly lent billions of dollars in customer funds to its own trading firm, Alameda Research.
        </p>
        <p>
          When this was exposed by a CoinDesk report, customers withdrew over $5 billion within a single day.
          FTX could not pay and went bankrupt.
        </p>

        <h3 style={S.h3}>2.3 The Domino Effect: Celsius, Three Arrows Capital, and More</h3>
        <p>
          Terra&apos;s collapse triggered a chain reaction: Celsius Network froze customer withdrawals and went
          bankrupt. Three Arrows Capital (3AC) became insolvent and dragged other firms down with it. These
          collapses were the predictable consequence of an unregulated market.
        </p>

        {/* ── Section 3: Institutional Wave ── */}
        <h2 style={S.h2}>3. The Institutional Wave Is Already Building</h2>

        <p>
          While the market waits for legislative clarity, Wall Street is not standing still. The infrastructure
          for institutional crypto participation is being built at a rapid pace.
        </p>

        <h3 style={S.h3}>3.1 Morgan Stanley: $8 Trillion Meets Crypto</h3>
        <p>
          On February 18, 2026, Morgan Stanley filed an application with the Office of the Comptroller of the
          Currency (OCC) for a National Trust Bank Charter to establish the &ldquo;Morgan Stanley Digital
          Trust.&rdquo; Morgan Stanley — one of the largest investment banks in the world, with approximately
          $8–9 trillion in client assets under management — wants to create its own federally supervised crypto bank.
        </p>
        <p>
          ETF analyst Eric Balchunas summarized the significance: Morgan Stanley has 16,000 financial advisors
          managing $7 trillion for 18 million clients — a massive capital network that is now being connected
          to the crypto market.
        </p>

        <h3 style={S.h3}>3.2 ETF Inflows: The Institutional On-Ramp</h3>
        <p>
          Since the launch of spot Bitcoin ETFs in the US in January 2024, $87 billion has flowed into crypto
          ETPs globally. But here is the critical number: Grayscale estimates that less than 0.5% of advised
          assets in the US are currently allocated to crypto.
        </p>

        <div style={S.callout}>
          <div style={S.calloutLabel}>The Math</div>
          An estimated $30 trillion is managed by financial advisors in the US. If just 1% flows into crypto,
          that would be $300 billion in additional capital — more than the current total Bitcoin ETF market
          capitalization.
        </div>

        {/* ── Section 4: Market Outlook ── */}
        <h2 style={S.h2}>4. Market Outlook and Price Forecasts</h2>

        <p>
          Bitcoin is trading at around $65,000 in early March 2026, roughly 50% below its all-time high of
          over $126,000 from October 2025. Ethereum is at approximately $2,000. Analysts largely attribute
          this weakness to regulatory uncertainty — precisely the factor that the CLARITY Act would eliminate.
        </p>

        {/* Inline ETH chart — relevant in market outlook section */}
        <LiveChart symbol="ETH-USD" label="Ethereum (ETH/USD)" range="6mo" height={280} />

        <h3 style={S.h3}>4.1 Institutional Price Targets for Bitcoin</h3>

        <div style={{ overflowX: "auto", margin: "24px 0" }}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Institution</th>
                <th style={S.th}>BTC Price Target</th>
                <th style={S.th}>Rationale</th>
              </tr>
            </thead>
            <tbody>
              {priceTargets.map((row, i) => (
                <tr key={i}>
                  <td style={{ ...S.td, fontWeight: 500, color: "var(--navy, #0f0f23)" }}>
                    {row.institution}
                  </td>
                  <td
                    style={{
                      ...S.td,
                      fontFamily: "var(--mono)",
                      fontWeight: 600,
                      color: "var(--gold, #b8860b)",
                    }}
                  >
                    {row.target}
                  </td>
                  <td style={{ ...S.td, color: "var(--text-secondary, #6B6B82)", fontSize: "0.88rem" }}>
                    {row.basis}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 style={S.h3}>4.2 What the Passage of the CLARITY Act Would Trigger</h3>
        <p>
          <strong>Immediate Effect (Weeks 1–4):</strong> A sentiment shift. The market&apos;s biggest
          hurdle — regulatory uncertainty — would be removed. Institutional capital that has been sitting
          on the sidelines would begin positioning.
        </p>
        <p>
          <strong>Medium-Term (Months 3–6):</strong> New ETF filings (Solana, XRP, multi-asset products),
          expanded custody services, revival of US venture funding. Galaxy Research projects over 100 new
          crypto ETF products in 2026.
        </p>
        <p>
          <strong>Long-Term (12–24 Months):</strong> A &ldquo;tokenization supercycle&rdquo; in which
          traditional securities and real-world assets are brought onto the blockchain. Nine major
          international banks are already exploring the launch of their own stablecoins.
        </p>

        {/* Second BTC chart showing longer timeframe */}
        <LiveChart symbol="BTC-USD" label="Bitcoin (BTC/USD) — 1 Year" range="1y" height={280} />

        {/* ── Section 5 ── */}
        <h2 style={S.h2}>5. Why This Cycle Is Structurally Different</h2>

        <p>
          Investors who lived through the pain of 2022 rightly ask: &ldquo;Why should this time be
          different?&rdquo; The answer lies in five structural changes:
        </p>

        <div style={{ margin: "20px 0 20px 20px" }}>
          <p><strong>1. Regulated access channels now exist.</strong> Spot Bitcoin and Ethereum ETFs,
          federally licensed crypto custodians, and bank-supervised trading platforms create a fundamentally
          different infrastructure than the unregulated exchanges of 2022.</p>

          <p><strong>2. Institutional capital has arrived.</strong> BlackRock, Morgan Stanley, Fidelity,
          and sovereign wealth funds (Mubadala, Abu Dhabi) are active market participants. These investors
          do not trade based on panic or euphoria.</p>

          <p><strong>3. Supply dynamics have shifted.</strong> The 2024 Bitcoin halving cut daily issuance
          in half. ETF purchases exceed new production by a factor of two. Approximately 12% of total
          Bitcoin supply is now held in ETFs and institutional vehicles.</p>

          <p><strong>4. The stablecoin framework is in place.</strong> The GENIUS Act requires 1:1 backing
          by short-term Treasury bonds, monthly reserve disclosure, and full KYC/AML compliance.</p>

          <p><strong>5. Comprehensive regulation is imminent.</strong> The CLARITY Act would complete the
          regulatory architecture. For the first time, the rules of the game would be known before
          companies build.</p>
        </div>

        {/* ── Section 6: Risks ── */}
        <h2 style={S.h2}>6. Risk Factors</h2>
        <p>Despite the constructive outlook, investors should be aware of the following risks:</p>

        <div style={{ margin: "16px 0 16px 20px" }}>
          <p><strong>Legislative Delay:</strong> The CLARITY Act could stall in the Senate beyond the
          mid-2026 window. 2026 is a midterm election year, and the legislative window effectively closes
          after August.</p>

          <p><strong>Macroeconomic Conditions:</strong> Bitcoin remains correlated with risk assets. A
          global recession, persistently high interest rates, or a major geopolitical shock could weigh
          on prices.</p>

          <p><strong>Short-Term Volatility:</strong> Bitcoin is currently about 50% below its all-time
          high. Some credible analysts warn of scenarios down to $40,000–$56,000.</p>

          <p><strong>Regulatory Overreach:</strong> Excessively restrictive provisions could stifle
          innovation or push activity offshore.</p>

          <p><strong>Technology Risks:</strong> Blockchain technology, smart contracts, and DeFi protocols
          can contain bugs or security vulnerabilities. Crypto investments can result in the total loss of
          invested capital.</p>
        </div>

        {/* ── Section 7: Conclusion ── */}
        <h2 style={S.h2}>7. Conclusion: A Generational Turning Point</h2>

        <p>
          The crypto market stands at a crossroads. Behind us lies a period defined by the absence of
          regulation — a period that enabled fraud, systemic collapses, and over $1.8 trillion in
          destroyed value.
        </p>
        <p>
          Ahead lies a market underpinned by federal law, equipped with institutional infrastructure, and
          featuring participation from the world&apos;s largest financial institutions.
        </p>

        <div style={S.callout}>
          <div style={S.calloutLabel}>Grayscale 2026 Digital Asset Outlook</div>
          &ldquo;2026 marks the dawn of the institutional era — the market is shifting from fast,
          retail-driven cycles to a steadier upward trend driven by institutional capital flows.&rdquo;
        </div>

        <p>
          The passage of the CLARITY Act would not merely lift sentiment — it would structurally transform
          the market. For patient, conviction-driven investors, the current phase of regulatory uncertainty
          and price consolidation may represent one of the most compelling entry points of this cycle.
        </p>

        <div style={{ textAlign: "center", margin: "48px 0 0" }}>
          <p style={{ fontWeight: 500, color: "var(--navy, #0f0f23)" }}>Sami Samii</p>
          <p style={{
            fontFamily: "var(--mono)",
            fontSize: "0.68rem",
            letterSpacing: "0.15em",
            color: "var(--gold, #b8860b)",
          }}>
            S2D CAPITAL INSIGHTS
          </p>
          <p style={{ color: "var(--text-muted, #9C9CAF)", fontSize: "0.85rem" }}>March 2026</p>
        </div>

        {/* ── Disclaimer ── */}
        <div style={S.disclaimer}>
          <strong>Disclaimer:</strong> This document is for informational purposes only and does not
          constitute financial, legal, or investment advice. Investments in cryptocurrencies involve
          significant risks, including the possible total loss of invested capital. Past performance is
          not a reliable indicator of future results. All cited forecasts originate from third-party
          institutions and may not materialize. Investors should conduct their own due diligence and
          consult qualified financial advisors before making investment decisions.
          <br /><br />
          <strong>Sources:</strong> JPMorgan Chase Research (Feb. 2026), Bloomberg, CoinDesk, The Block,
          Grayscale 2026 Digital Asset Outlook, MIT Sloan School of Management, BIS Bulletin No. 69,
          Bloomberg Intelligence, Standard Chartered, Bernstein, VanEck, ARK Invest, Galaxy Digital,
          Coinbase, KPMG, Morgan Stanley OCC Filing.
        </div>
      </div>
    </article>
  );
}
