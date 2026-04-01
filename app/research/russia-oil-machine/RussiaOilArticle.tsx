"use client";
import BackButton from "@/components/BackButton";

import ArticleProgress from "@/components/ArticleProgress";
import RelatedArticles from "@/components/RelatedArticles";
import Footnote from "@/components/Footnote";
import Term from "@/components/Term";
import ThesisTracker from "@/components/ThesisTracker";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import React from "react";

const LiveChart = dynamic(() => import("@/components/LiveChart"), {
  ssr: false,
  loading: () => (
    <div style={{ height: 300, border: "1px solid var(--border, rgba(255,255,255,0.1))", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", margin: "28px 0", color: "var(--text-muted, rgba(255,255,255,0.35))", fontFamily: "var(--mono)", fontSize: "0.72rem" }}>
      Loading chart...
    </div>
  ),
});

/* ── Styles ── */
const S = {
  article: { maxWidth: 780, margin: "0 auto", padding: "0 24px 80px", fontFamily: "var(--sans, 'Outfit', sans-serif)", color: "var(--text-body, rgba(255,255,255,0.75))", lineHeight: 1.85, fontSize: "1.02rem" } as React.CSSProperties,
  hero: { textAlign: "center" as const, padding: "72px 24px 48px", background: "linear-gradient(180deg, var(--gold-tint, rgba(184,134,11,0.08)) 0%, var(--bg-primary, #fff) 100%)", borderBottom: "1px solid var(--border, rgba(255,255,255,0.1))" } as React.CSSProperties,
  eyebrow: { fontFamily: "var(--mono, 'JetBrains Mono', monospace)", fontSize: "0.62rem", letterSpacing: "0.3em", textTransform: "uppercase" as const, color: "var(--gold, #b8860b)", marginBottom: 18 } as React.CSSProperties,
  h1: { fontFamily: "var(--serif, 'Playfair Display', serif)", fontSize: "clamp(2rem, 4.5vw, 3rem)", fontWeight: 400, lineHeight: 1.15, color: "#ffffff", marginBottom: 18, maxWidth: 720, marginLeft: "auto", marginRight: "auto" } as React.CSSProperties,
  subtitle: { fontSize: "1.05rem", color: "var(--text-secondary, rgba(255,255,255,0.5))", maxWidth: 620, margin: "0 auto 24px", lineHeight: 1.7, fontWeight: 300 } as React.CSSProperties,
  meta: { fontFamily: "var(--mono, 'JetBrains Mono', monospace)", fontSize: "0.62rem", letterSpacing: "0.12em", color: "var(--text-muted, rgba(255,255,255,0.35))", display: "flex" as const, justifyContent: "center" as const, gap: 20, flexWrap: "wrap" as const } as React.CSSProperties,
  h2: { fontFamily: "var(--serif, 'Playfair Display', serif)", fontSize: "1.6rem", fontWeight: 400, color: "#ffffff", marginTop: 56, marginBottom: 20, lineHeight: 1.25 } as React.CSSProperties,
  h3: { fontFamily: "var(--serif, 'Playfair Display', serif)", fontSize: "1.2rem", fontWeight: 500, color: "#ffffff", marginTop: 36, marginBottom: 14, lineHeight: 1.3 } as React.CSSProperties,
  callout: { background: "var(--gold-tint, rgba(184,134,11,0.08))", borderLeft: "3px solid var(--gold, #b8860b)", padding: "20px 24px", margin: "28px 0", borderRadius: "0 6px 6px 0", fontSize: "0.95rem", lineHeight: 1.8 } as React.CSSProperties,
  calloutLabel: { fontFamily: "var(--mono, 'JetBrains Mono', monospace)", fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "var(--gold, #b8860b)", marginBottom: 8, fontWeight: 600 } as React.CSSProperties,
  defBox: { background: "rgba(59,108,180,0.08)", borderLeft: "3px solid #3B6CB4", padding: "20px 24px", margin: "28px 0", borderRadius: "0 6px 6px 0", fontSize: "0.95rem", lineHeight: 1.8 } as React.CSSProperties,
  defLabel: { fontFamily: "var(--mono, 'JetBrains Mono', monospace)", fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "#3B6CB4", marginBottom: 8, fontWeight: 600 } as React.CSSProperties,
  skillBox: { background: "rgba(45,143,94,0.08)", borderLeft: "3px solid #2D8F5E", padding: "20px 24px", margin: "28px 0", borderRadius: "0 6px 6px 0", fontSize: "0.95rem", lineHeight: 1.8 } as React.CSSProperties,
  skillLabel: { fontFamily: "var(--mono, 'JetBrains Mono', monospace)", fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "#2D8F5E", marginBottom: 8, fontWeight: 600 } as React.CSSProperties,
  warnBox: { background: "rgba(192,57,43,0.08)", borderLeft: "3px solid #C0392B", padding: "20px 24px", margin: "28px 0", borderRadius: "0 6px 6px 0", fontSize: "0.95rem", lineHeight: 1.8 } as React.CSSProperties,
  warnLabel: { fontFamily: "var(--mono, 'JetBrains Mono', monospace)", fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "#C0392B", marginBottom: 8, fontWeight: 600 } as React.CSSProperties,
  keyFigure: { background: "rgba(255,255,255,0.04)", color: "#fff", borderRadius: 8, padding: "24px 28px", margin: "28px 0", display: "flex" as const, justifyContent: "space-between" as const, alignItems: "center" as const, flexWrap: "wrap" as const, gap: 16 } as React.CSSProperties,
  keyFigureNum: { fontFamily: "var(--serif, 'Playfair Display', serif)", fontSize: "2rem", fontWeight: 400, color: "var(--gold-light, #d4a843)" } as React.CSSProperties,
  keyFigureLabel: { fontFamily: "var(--mono, 'JetBrains Mono', monospace)", fontSize: "0.62rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" as const } as React.CSSProperties,
  table: { width: "100%", borderCollapse: "collapse" as const, margin: "24px 0", fontSize: "0.88rem", fontFamily: "var(--sans, 'Outfit', sans-serif)" } as React.CSSProperties,
  th: { fontFamily: "var(--mono, 'JetBrains Mono', monospace)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "var(--text-muted, rgba(255,255,255,0.35))", borderBottom: "2px solid var(--border, rgba(255,255,255,0.1))", padding: "10px 12px", textAlign: "left" as const, fontWeight: 600 } as React.CSSProperties,
  td: { padding: "12px 12px", borderBottom: "1px solid var(--border, rgba(255,255,255,0.1))", verticalAlign: "top" as const } as React.CSSProperties,
  disclaimer: { marginTop: 48, padding: "24px 0", borderTop: "1px solid var(--border, rgba(255,255,255,0.1))", fontSize: "0.72rem", color: "var(--text-muted, rgba(255,255,255,0.35))", lineHeight: 1.7 } as React.CSSProperties,
};

export default function RussiaOilArticle() {
  return (
    <>
      <BackButton label="Back to Research" href="/research" />
      <ArticleProgress sections={[
        { id: "sec-1", title: "Executive Summary", number: "1" },
        { id: "sec-2", title: "The Barrel", number: "2" },
        { id: "sec-3", title: "Before the Break", number: "3" },
        { id: "sec-4", title: "The Severing", number: "4" },
        { id: "sec-5", title: "Shadow Fleet", number: "5" },
        { id: "sec-6", title: "The Customer", number: "6" },
        { id: "sec-7", title: "The Payment", number: "7" },
        { id: "sec-8", title: "44% Overnight Rate", number: "8" },
        { id: "sec-9", title: "The Spiral", number: "9" },
        { id: "sec-10", title: "The Asymmetry", number: "10" },
        { id: "sec-11", title: "Dollar System", number: "11" },
        { id: "sec-12", title: "Oil Paradox", number: "12" },
        { id: "sec-13", title: "India Route", number: "13" },
        { id: "sec-14", title: "Yuan vs Dollar", number: "14" },
        { id: "sec-15", title: "Implications", number: "15" },
      ]} />

      {/* ═══ HERO ═══ */}
      <motion.div
        style={S.hero}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div style={S.eyebrow}>Investor Briefing &middot; March 2026</div>
        <h1 style={S.h1}>
          Russia&apos;s Oil Machine: From Wellhead to the 44% Overnight Rate
        </h1>
        <p style={S.subtitle}>
          How a single barrel of Russian crude exposes the fragility of
          de-dollarization, the cost of sanctions, and why China holds all the
          leverage.
        </p>
        <div style={S.meta}>
          <span>Sami Samii</span>
          <span>|</span>
          <span>S2D Capital Insights</span>
          <span>|</span>
          <span>March 2026</span>
        </div>

        {/* KPI grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 16,
            maxWidth: 720,
            margin: "36px auto 0",
          }}
        >
          <div style={S.keyFigure}>
            <div>
              <div style={S.keyFigureNum}>44%</div>
              <div style={S.keyFigureLabel}>Yuan Overnight Rate (Moscow, Mar 19)</div>
            </div>
          </div>
          <div style={S.keyFigure}>
            <div>
              <div style={S.keyFigureNum}>$6&ndash;12</div>
              <div style={S.keyFigureLabel}>Urals Discount to Brent</div>
            </div>
          </div>
          <div style={S.keyFigure}>
            <div>
              <div style={S.keyFigureNum}>~600</div>
              <div style={S.keyFigureLabel}>Shadow Fleet Tankers</div>
            </div>
          </div>
          <div style={S.keyFigure}>
            <div>
              <div style={S.keyFigureNum}>57%</div>
              <div style={S.keyFigureLabel}>Russian Imports from China</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══ ARTICLE BODY ═══ */}
      <article style={S.article}>

        <ThesisTracker
          publishDate="March 31, 2026"
          metrics={[
            { label: "Brent Crude", publishValue: "$102", symbol: "BZ=F", format: "price" },
            { label: "Gold", publishValue: "$4,702", symbol: "GC=F", format: "price" },
            { label: "USD/RUB", publishValue: "84.5", symbol: "USDRUB=X", format: "number" },
            { label: "Bitcoin", publishValue: "$68,121", symbol: "BTC-USD", format: "price" },
          ]}
        />

        {/* ── Section 1: Executive Summary ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2 id="sec-1" style={S.h2}>1. Executive Summary</h2>
          <p>
            On March 19, 2026, the overnight yuan lending rate on the Moscow Exchange hit 44%<Footnote id={1} source="Moscow Exchange (MOEX)" detail="RUSFAR CNY overnight rate, March 19, 2026" />, up from near zero a year earlier. Russian banks were paying extraordinary premiums to borrow Chinese currency for twelve hours. At that rate, a 500-million-yuan overnight loan costs roughly $87,000 in interest. A year ago, the same loan cost $2,400.
          </p>
          <p>
            Russia is the world&apos;s second-largest oil exporter. It produces 10 million barrels per day. It earned over $100 billion from energy exports last year. And yet its banking system cannot reliably access the one foreign currency it needs to function.
          </p>
          <p>
            This is not a story about sanctions in the abstract. It is the story of what happens when a major economy attempts to rewire itself away from the dollar, only to discover that the replacement system is thinner, more fragile, and more easily weaponized than the original. It is told through a single barrel of Russian crude, tracked from the wellhead in Western Siberia to the interbank market in Moscow, through every link in the chain where Russia is now paying a price it never paid before.
          </p>
          <p>
            By the time you finish reading, you will understand how oil is priced, traded, transported, and insured; why Russia trades in yuan instead of rubles or dollars; how China exploits the dependency; and why the 44% overnight rate is the most important number in the global debate about de-dollarization.
          </p>
        </motion.div>

        {/* ── Section 2: The Barrel ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2 id="sec-2" style={S.h2}>2. The Barrel</h2>
          <p>
            Start with a single barrel of Russian crude. It comes from Western Siberia, from aging fields around Surgut and Nizhnevartovsk that have been producing since the Soviet era. It is pumped through the Druzhba pipeline system to Primorsk, a port on the Baltic Sea near St. Petersburg, where it will be loaded onto a tanker bound for China.
          </p>
          <p>
            This barrel is a grade called <strong style={{ color: "#fff" }}>Urals</strong>, Russia&apos;s main export crude. And the first thing to understand is that not all crude is created equal.
          </p>

          <h3 style={S.h3}>2.1 Why Every Barrel Is Different</h3>
          <p>
            In the oil industry, crude varies along two dimensions: density and sulfur content. These determine what a refinery can produce from it, and therefore what it is worth.
          </p>

          <div style={S.defBox}>
            <div style={S.defLabel}>Definition</div>
            <p style={{ margin: "0 0 12px" }}>
              <strong style={{ color: "#fff" }}>API Gravity:</strong> A scale developed by the American Petroleum Institute that measures crude oil density. Higher numbers mean lighter oil. Light oil (API &gt; 31&deg;) is more valuable because refineries can extract more gasoline and diesel from it with less effort. Heavy oil (API &lt; 22&deg;) requires more complex processing.
            </p>
            <p style={{ margin: 0 }}>
              <strong style={{ color: "#fff" }}>Sulfur Content:</strong> Measured as a percentage of weight. &ldquo;Sweet&rdquo; crude has less than 0.5% sulfur; &ldquo;sour&rdquo; crude has more. Sulfur must be removed during refining, an expensive process, so sweet crude commands a premium.
            </p>
          </div>

          <p>
            Russian Urals has an API gravity of approximately 31&deg;<Footnote id={2} source="S&P Global Platts" detail="Urals crude specifications" href="https://www.spglobal.com/commodityinsights/" /> and sulfur content of 1.3%. That makes it medium-density and sour. Compare that to <strong style={{ color: "#fff" }}><Term definition="The world's most important oil price benchmark. Originally a North Sea crude grade, now refers to a basket of five grades (BFOET). ~80% of global oil contracts are priced relative to Brent." href="https://www.investopedia.com/terms/b/brentblend.asp">Brent</Term></strong> (the world&apos;s most important benchmark, API ~38&deg;, sulfur ~0.37%) or <strong style={{ color: "#fff" }}><Term definition="West Texas Intermediate — the US oil benchmark. Lighter and sweeter than Brent. Trades on NYMEX with physical delivery at Cushing, Oklahoma." href="https://www.investopedia.com/terms/w/wti.asp">WTI</Term></strong>, West Texas Intermediate, the American benchmark (API ~39&deg;, sulfur ~0.24%). Both are lighter and sweeter, meaning a refinery produces more high-value products from them.
          </p>
          <p>
            Before sanctions, this quality difference meant Urals traded at a discount of $1&ndash;2 per barrel to Brent. Today, the discount sits in the range of $6&ndash;12. The extra $5&ndash;10 has nothing to do with chemistry. It has everything to do with what happened after February 2022.
          </p>

          <h3 style={S.h3}>2.2 The Benchmarks: Three Prices That Rule the World</h3>
          <p>Hundreds of crude grades need reference prices. Three benchmarks dominate global pricing:</p>
          <p>
            <strong style={{ color: "#fff" }}>Brent Crude</strong> is the most important. Roughly 80% of all oil contracts worldwide are priced relative to Brent. Originally a single North Sea field, &ldquo;Brent&rdquo; now refers to a basket of five grades (Brent, Forties, Oseberg, Ekofisk, and Troll, together called BFOET). Its futures contract trades on the ICE (Intercontinental Exchange) in London.
          </p>
          <p>
            <strong style={{ color: "#fff" }}>WTI (West Texas Intermediate)</strong> is the American benchmark. It trades on the NYMEX (New York Mercantile Exchange, part of the CME Group). Physical delivery occurs at Cushing, Oklahoma, a small town with enormous tank farms where pipelines from across North America converge.
          </p>
          <p>
            <strong style={{ color: "#fff" }}>Dubai/Oman</strong> is the benchmark for Asian and Middle Eastern markets. Heavier and more sour than Brent, it is the reference used by Saudi Aramco to set monthly prices for Asian customers.
          </p>
          <p>
            <strong style={{ color: "#fff" }}>Urals</strong> is not a benchmark in the traditional sense; there is no Urals futures contract. Instead, it is priced as a differential: &ldquo;Brent minus $X.&rdquo; Our barrel, as it loads at Primorsk, is priced at roughly Brent minus $8 to $10.
          </p>

          <div style={S.callout}>
            <div style={S.calloutLabel}>Think of it like this</div>
            <p style={{ margin: 0 }}>
              Oil benchmarks work like interest rate benchmarks in finance. Just as a corporate bond might be priced at &ldquo;US Treasury yield + 2%,&rdquo; a crude oil cargo is priced at &ldquo;Brent + or &ndash; $X.&rdquo; The benchmark provides the reference; the differential reflects credit risk (in bonds) or quality, logistics, and sanctions risk (in oil).
            </p>
          </div>

          <LiveChart symbol="BZ=F" label="Brent Crude Oil (BZ=F)" range="6mo" height={280} />
        </motion.div>

        {/* ── Section 3: Before the Break ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2 id="sec-3" style={S.h2}>3. Before the Break: How the System Used to Work</h2>
          <p>
            Before February 2022, our barrel&apos;s journey was unremarkable. It loaded at Primorsk onto a Greek-owned tanker (Greece controls the world&apos;s largest merchant fleet), insured by a club in London, classified by a Norwegian agency, and tracked by a transponder visible to the entire world. It sailed through the Danish Straits into the North Sea, south to a European refinery: Schwedt in Germany, Rotterdam in the Netherlands, or P&#322;ock in Poland. Voyage time: 5&ndash;7 days.
          </p>
          <p>
            Payment was standard. The European refinery wired US dollars through <Term definition="Society for Worldwide Interbank Financial Telecommunication — the global messaging network banks use to send payment instructions. Not a payment system itself, but the communication layer that makes cross-border transfers possible." href="https://www.investopedia.com/articles/personal-finance/050515/how-swift-system-works.asp">SWIFT</Term> to Rosneft&apos;s account at a Western bank. Rosneft converted dollars to rubles on the Moscow Exchange. The whole process, from loading to payment, took about six weeks. It worked seamlessly because it used the same infrastructure as every other oil trade on earth.
          </p>
          <p>
            Roughly half of Russia&apos;s crude exports went to the European Union. The ruble floated freely. Russian banks transacted on SWIFT. Oil was priced in dollars, paid in dollars, and hedged in dollars. Everything was connected to the system.
          </p>
          <p>
            Then Russia invaded Ukraine, and the connections were severed: systematically, deliberately, and comprehensively.
          </p>
        </motion.div>

        {/* ── Section 4: The Severing ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2 id="sec-4" style={S.h2}>4. The Severing: How Sanctions Reshaped the Supply Chain</h2>
          <p>The Western response came in layers, each targeting a different link in the chain.</p>
          <p>
            <strong style={{ color: "#fff" }}>Layer 1: Financial.</strong> Approximately $300 billion of the Central Bank of Russia&apos;s foreign reserves, held in Western institutions, were frozen. Major Russian banks were cut from SWIFT. Visa and Mastercard suspended operations.
          </p>
          <p>
            <strong style={{ color: "#fff" }}>Layer 2: Maritime.</strong> European insurers pulled coverage for Russian cargoes. Greek ship owners began refusing Russian business.
          </p>
          <p>
            <strong style={{ color: "#fff" }}>Layer 3: The Price Cap.</strong> In December 2022, the G7 and EU introduced a mechanism designed to let Russian oil flow while capturing the discount: Western companies (shippers, insurers, brokers, banks) can participate in Russian oil transactions only if the crude is priced below $60/barrel. Since Urals consistently trades well above that threshold, the cap effectively bans Western involvement in virtually all Russian oil exports.
          </p>

          <div style={S.defBox}>
            <div style={S.defLabel}>Definition</div>
            <p style={{ margin: 0 }}>
              <strong style={{ color: "#fff" }}>G7 Price Cap:</strong> A mechanism introduced in December 2022 by G7 nations, the EU, and Australia. Western services (shipping, insurance, financing) may only be used for Russian crude priced below $60/barrel. Enforced through &ldquo;attestations,&rdquo; written confirmations from buyers and sellers that the price is compliant. The cap does not ban Russian oil sales; it bans Western participation in sales above $60.
            </p>
          </div>

          <p>
            Russia faced a choice: stop exporting, or rebuild the entire supply chain outside Western infrastructure. It chose to rebuild.
          </p>
        </motion.div>

        {/* ── Section 5: The Shadow Fleet ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2 id="sec-5" style={S.h2}>5. The Shadow Fleet: Russia&apos;s Parallel Maritime System</h2>
          <p>Our barrel now loads at Primorsk onto a very different kind of ship.</p>

          <h3 style={S.h3}>5.1 The Fleet</h3>
          <p>
            The tanker is 19 years old, well past the point where most Western operators would retire it. It is owned by a limited liability company in the Marshall Islands, itself owned by another LLC in Dubai, managed by an entity in Hong Kong whose beneficial owner is unknown. It flies the flag of Gabon.
          </p>
          <p>
            Russia has assembled approximately 600 such vessels since 2022<Footnote id={3} source="Kpler & Windward AI" detail="Shadow fleet vessel tracking, March 2026" />. They are old (average age 15&ndash;18 years), owned through nested shell companies, flagged in jurisdictions with minimal oversight, and operated with frequently disabled tracking systems.
          </p>

          <h3 style={S.h3}>5.2 The Insurance Gap</h3>
          <p>This is where the shadow fleet&apos;s vulnerability becomes clear. Every ocean-going tanker needs three types of insurance to operate in mainstream global shipping:</p>
          <p>
            <strong style={{ color: "#fff" }}>Hull &amp; Machinery (H&amp;M):</strong> Covers the ship itself, including damage, sinking, and mechanical failure. Typically sourced from the London market.
          </p>
          <p>
            <strong style={{ color: "#fff" }}>Protection &amp; Indemnity (P&amp;I):</strong> Covers liability to third parties: oil spills, collisions, environmental cleanup, crew injuries. This is the critical one.
          </p>
          <p>
            <strong style={{ color: "#fff" }}>Cargo Insurance:</strong> Covers the oil itself during transit. Typically sourced from Lloyd&apos;s of London.
          </p>

          <div style={S.defBox}>
            <div style={S.defLabel}>Definition</div>
            <p style={{ margin: 0 }}>
              <strong style={{ color: "#fff" }}>P&amp;I Insurance (Protection &amp; Indemnity):</strong> Liability insurance for ship owners, covering third-party damage claims up to $8.5 billion per incident. Provided by the International Group of P&amp;I Clubs, a consortium of 12 clubs, 9 of them based in the UK or Scandinavia, collectively insuring approximately 90% of the world&apos;s ocean-going tonnage. Without P&amp;I, most ports, canals, and maritime service providers will refuse to service a vessel.
            </p>
          </div>

          <p>
            The shadow fleet replaces Western <Term definition="Protection &amp; Indemnity insurance — liability coverage for ship owners against third-party claims up to $8.5 billion per incident. Provided by 12 clubs, 9 UK/Scandinavian-based, covering ~90% of global tonnage." href="https://www.investopedia.com/terms/p/protection-and-indemnity-insurance.asp">P&amp;I</Term> with Russian alternatives, primarily Ingosstrakh and the Russian National Reinsurance Company, offering maximum coverage of approximately $50&ndash;100 million per incident. That is less than 2% of what the International Group provides.
          </p>

          <div style={S.callout}>
            <div style={S.calloutLabel}>Think of it like this</div>
            <p style={{ margin: 0 }}>
              Imagine driving a $200 million vehicle with $50 million in insurance instead of $8.5 billion. If nothing goes wrong, the difference is invisible. If a major accident occurs (an oil spill in the Baltic, a collision in the Malacca Strait) the insurance covers less than 1% of potential cleanup costs. The countries whose coastlines are at risk, primarily Denmark, Sweden, and Germany, bear the uninsured liability.
            </p>
          </div>

          <p>
            Without adequate P&amp;I, the shadow fleet cannot access the Suez Canal (which requires proof of insurance), faces increasing scrutiny at the Danish Straits, and is excluded from mainstream port services and bunkering facilities. Our barrel takes the long route: out of the Baltic, south through the Atlantic, around the Cape of Good Hope, across the Indian Ocean, through the Malacca Strait, into the South China Sea. Destination: Qingdao, China.
          </p>
          <p>Total voyage time: 5&ndash;6 weeks. Before sanctions: 5&ndash;7 days to Europe.</p>

          <h3 style={S.h3}>5.3 Ship-to-Ship Transfers and AIS Spoofing</h3>
          <p>
            During the voyage, the tanker&apos;s <strong style={{ color: "#fff" }}>AIS transponder</strong> (a GPS-like system that broadcasts position, speed, and heading) may be switched off. This is called &ldquo;going dark.&rdquo; The vessel disappears from commercial tracking platforms like MarineTraffic and Kpler for days at a time.
          </p>
          <p>
            At some point, often off the coast of southern Greece, near Ceuta in Spain, in the Malacca Strait, or off Lom&eacute; in Togo, the tanker anchors next to another vessel. For 24&ndash;48 hours, hoses connect the two ships and oil pumps from one hull to the other. This is a <strong style={{ color: "#fff" }}>ship-to-ship (STS) transfer</strong>, the point where Russian crude often changes documentation, losing its Russian origin in the process. The second tanker, with cleaner paperwork, completes the journey.
          </p>

          <h3 style={S.h3}>5.4 The Cost</h3>
          <p>
            The total logistics overhead of the shadow fleet (older ships, longer routes, STS delays, higher insurance premiums, Suez Canal avoidance) runs approximately <strong style={{ color: "#fff" }}>$3&ndash;5 per barrel</strong>. At 4&ndash;5 million barrels per day of Russian seaborne exports, that is $12&ndash;25 million daily, or <strong style={{ color: "#fff" }}>$4.5&ndash;9 billion annually</strong>, in costs that a non-sanctioned exporter does not pay.
          </p>

          <div style={S.skillBox}>
            <div style={S.skillLabel}>Skill Unlocked</div>
            <p style={{ margin: "0 0 6px", color: "#2D8F5E", fontWeight: 600 }}>You now understand Russia&apos;s maritime workaround</p>
            <p style={{ margin: 0, fontSize: "0.88rem" }}>
              Russia bypasses Western shipping infrastructure with a ~600-vessel shadow fleet: old tankers, shell-company ownership, non-Western insurance ($50M vs. $8.5B coverage), disabled tracking, and ship-to-ship transfers. It works, but at $3&ndash;5/barrel in permanent overhead, plus environmental risk that no one is insured to cover.
            </p>
          </div>

          <LiveChart symbol="CL=F" label="WTI Crude Oil (CL=F)" range="6mo" height={280} />
        </motion.div>

        {/* ── Section 6: The Customer ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2 id="sec-6" style={S.h2}>6. The Customer: How Russia Sells to China</h2>
          <p>
            Our barrel arrives in Qingdao after five weeks at sea. The buyer is a Chinese refinery: Sinopec, PetroChina, or CNOOC. But the price was not negotiated on the spot. It was set by a formula embedded in a long-term contract.
          </p>

          <h3 style={S.h3}>6.1 The Pricing Formula</h3>
          <p>
            Russian oil contracts with Chinese refineries are typically 5&ndash;10 year agreements with pricing formulas, not fixed prices:
          </p>
          <p style={{ fontStyle: "italic" }}>
            Average of Platts Dated Brent over the loading month, minus $X discount.
          </p>

          <div style={S.defBox}>
            <div style={S.defLabel}>Definition</div>
            <p style={{ margin: 0 }}>
              <strong style={{ color: "#fff" }}>Platts (S&amp;P Global Platts):</strong> A price reporting agency that publishes daily reference prices for physical commodities. Every afternoon between 4:00 and 4:30 PM London time, Platts operates the <strong style={{ color: "#fff" }}>MOC (Market on Close)</strong>, a window in which oil traders submit bids and offers for physical barrels. The resulting transactions determine the <strong style={{ color: "#fff" }}>Dated Brent</strong> assessment, the benchmark that anchors approximately 80% of global oil contracts.
            </p>
          </div>

          <p>
            The &ldquo;$X&rdquo; discount is layered: $1&ndash;2 for quality differences (Urals is heavier and more sulfurous than Brent), $2&ndash;3 for shipping distance, and $3&ndash;5 for negotiating leverage. That last component is the crucial one, and it brings us to the heart of Russia&apos;s predicament.
          </p>

          <h3 style={S.h3}>6.2 Why China Dictates the Terms</h3>
          <p>
            Russia has two major crude oil customers: China (roughly 1.8&ndash;2.0 million barrels/day) and India (roughly 1.5&ndash;1.8 million barrels/day). Europe, which took roughly half of Russian exports before 2022, is gone. The US is a competitor. Japan and South Korea buy American and Middle Eastern crude. When a seller has two buyers and no alternatives, the buyers set the terms.
          </p>
          <p>
            China knows this. India knows this. Both extract discounts that no other buyer in the world could achieve. The $6&ndash;12 per barrel discount, applied across roughly 2 million barrels per day of Chinese purchases, costs Russia $12&ndash;24 million every single day.
          </p>

          <div style={S.callout}>
            <div style={S.calloutLabel}>Think of it like this</div>
            <p style={{ margin: 0 }}>
              Imagine you own a house and need to sell it urgently. There are only two potential buyers in the entire market, both know the other exists, and both know you cannot wait. The sale price will not reflect the house&apos;s value. It will reflect your desperation. That is Russia&apos;s position in the oil market.
            </p>
          </div>
        </motion.div>

        {/* ── Section 7: The Payment ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2 id="sec-7" style={S.h2}>7. The Payment: Where Russia&apos;s Crisis Begins</h2>
          <p>
            The Chinese refinery pays for our barrel in <strong style={{ color: "#fff" }}>yuan</strong>, China&apos;s currency (officially called the renminbi). Not in dollars (Russia is cut off from the dollar system), not in rubles (China has no use for an unconvertible currency). Yuan is the only option, and it is China&apos;s currency, on China&apos;s terms.
          </p>

          <h3 style={S.h3}>7.1 Why Yuan, Not Rubles</h3>
          <p>
            This is one of the most common questions: if China is buying from Russia, why doesn&apos;t it just pay in rubles?
          </p>
          <p>
            Because the ruble is useless outside Russia. After sanctions, trading volume in ruble pairs collapsed approximately 96%. A Chinese refinery receiving rubles cannot convert them into anything else. It cannot buy semiconductors from Taiwan, pay Indonesian palm oil suppliers, or purchase Brazilian iron ore. The ruble is, in the language of currency markets, a &ldquo;dead-end currency.&rdquo; It goes in, but it cannot come out.
          </p>
          <p>
            Yuan, by contrast, circulates within China&apos;s domestic economy. For Sinopec, paying in yuan means no currency conversion at all: the money stays in its own financial system. The convenience runs entirely in one direction.
          </p>

          <h3 style={S.h3}>7.2 The Payment Chain, Step by Step</h3>
          <p>
            <strong style={{ color: "#fff" }}>Step 1:</strong> Sinopec converts the dollar-equivalent contract value into yuan at the prevailing exchange rate.
          </p>
          <p>
            <strong style={{ color: "#fff" }}>Step 2:</strong> Payment travels through <strong style={{ color: "#fff" }}><Term definition="Cross-Border Interbank Payment System — China's alternative to SWIFT for yuan-denominated international transactions. Launched in 2015, processes ~$50B daily vs SWIFT's ~$5T." href="https://en.wikipedia.org/wiki/Cross-Border_Interbank_Payment_System">CIPS</Term></strong> (Cross-Border Interbank Payment System, China&apos;s equivalent of SWIFT, built for yuan-denominated cross-border transactions) to Rosneft&apos;s account at a Chinese bank.
          </p>
          <p>
            <strong style={{ color: "#fff" }}>Step 3:</strong> Rosneft transfers the yuan to its account at a Russian bank (say, Gazprombank) through CIPS correspondent channels.
          </p>
          <p>
            <strong style={{ color: "#fff" }}>Step 4:</strong> Rosneft sells the yuan on the Moscow Exchange for rubles, because it pays taxes, wages, and domestic suppliers in rubles.
          </p>
          <p>
            <strong style={{ color: "#fff" }}>Step 5:</strong> Rosneft pays export duties and the Mineral Extraction Tax (MET) to the Russian government, typically 50&ndash;70% of revenue.
          </p>
          <p>
            <strong style={{ color: "#fff" }}>Step 4 is the critical moment.</strong> When Rosneft sells yuan on the Moscow Exchange, it adds yuan to the Russian banking system. This is the primary mechanism through which fresh yuan enters Russia. Every company that needs yuan to buy Chinese goods (and that is almost every importer, since China now supplies 57% of all Russian imports) depends on exporters like Rosneft feeding yuan into the system.
          </p>
          <p>
            When oil prices are high and exports are strong, enough yuan flows in to meet demand. When prices drop, or exports slow, or the government stops selling its own reserves, the system runs dry.
          </p>
          <p>
            In March 2026, all three happened simultaneously.
          </p>
        </motion.div>

        {/* ── Section 8: The 44% Overnight Rate ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2 id="sec-8" style={S.h2}>8. The 44% Overnight Rate: Anatomy of a Currency Crisis</h2>

          <h3 style={S.h3}>8.1 What an Overnight Rate Is</h3>
          <p>
            Every night, banks settle their accounts. Some have excess cash in a given currency; others are short. The overnight interbank lending market is where they balance. The interest rate on these loans is the most fundamental price in any financial system.
          </p>

          <div style={S.defBox}>
            <div style={S.defLabel}>Definition</div>
            <p style={{ margin: 0 }}>
              <strong style={{ color: "#fff" }}>Overnight Rate:</strong> The annualized interest rate at which banks lend to each other for a single night (typically 6 PM to 8 AM). In healthy markets, it sits near the central bank&apos;s policy rate. <strong style={{ color: "#fff" }}><Term definition="Secured Overnight Financing Rate — the primary US dollar overnight interest rate benchmark, based on ~$2 trillion in daily Treasury repo transactions. Replaced LIBOR in 2023." href="https://www.investopedia.com/secured-overnight-financing-rate-sofr-4683954">SOFR</Term></strong> (Secured Overnight Financing Rate) is the US equivalent, typically in the mid-3% range. <strong style={{ color: "#fff" }}>&euro;STR</strong> (Euro Short-Term Rate) is the eurozone equivalent, near the ECB&apos;s deposit facility rate. Russia&apos;s yuan overnight rate is measured by the <strong style={{ color: "#fff" }}>RUSFAR CNY</strong>, a reference rate based on collateralized yuan lending on the Moscow Exchange.
            </p>
          </div>

          <p>
            In a healthy system, the overnight rate hovers near the central bank&apos;s target. A 44% overnight rate<Footnote id={4} source="Central Bank of Russia" detail="Interbank lending rates, MOEX data" /> means the system is not healthy. It means more banks need yuan than have yuan, and the bidding war has become extreme.
          </p>

          <h3 style={S.h3}>8.2 Why It Happened: Three Simultaneous Shocks</h3>
          <p>
            <strong style={{ color: "#fff" }}>Shock 1: Oil revenues fell.</strong> Before the Iran war, oil prices had been subdued throughout late 2025. Russian oil export receipts, the primary source of yuan inflows, declined correspondingly. Less oil revenue means less yuan entering the system through Step 4 above.
          </p>
          <p>
            <strong style={{ color: "#fff" }}>Shock 2: The government stopped selling reserves.</strong> Russia&apos;s Finance Ministry had been selling approximately $2 billion per month in yuan from the National Welfare Fund to stabilize domestic currency markets. In March, it stopped, because the fund itself is shrinking (from $113.5 billion in 2022 to $51.6 billion in 2025).
          </p>
          <p>
            <strong style={{ color: "#fff" }}>Shock 3: The time lag.</strong> Oil prices surged after the Iran war began (February 28), but Russian tax revenues are calculated on the previous month&apos;s prices with a 1&ndash;2 month collection delay. March&apos;s budget still reflects the depressed prices of January and February. The yuan windfall from March&apos;s high oil prices will not arrive until April or May.
          </p>
          <p>
            Meanwhile, demand for yuan remained constant. Russian companies need yuan every day to pay for Chinese imports, which represent 57% of everything Russia buys. There was no mechanism to bridge the gap.
          </p>

          <h3 style={S.h3}>8.3 The Bidding War</h3>
          <p>
            On the Moscow Exchange interbank market, the scene on March 19 was straightforward: two or three banks had yuan to lend, fifteen banks needed it. The bidding war escalated through 5%, 10%, 20%, 35%, and finally 44%.
          </p>
          <p>
            A bank pays 44% because the alternative is worse. Missing a payment to a Chinese supplier means contract breach, potential loss of the supplier relationship, and cascading defaults. The $87,000 overnight interest cost is survivable. The reputational and contractual damage from a failed payment is not.
          </p>

          <h3 style={S.h3}>8.4 Why the PBOC Does Not Fix It</h3>
          <p>
            The People&apos;s Bank of China has a currency swap agreement with Russia&apos;s Central Bank totaling 150 billion yuan (roughly $21 billion). The CBR can draw yuan and distribute it to Russian banks, but the daily limit is 5 billion yuan, and it was exhausted by March 18.
          </p>
          <p>
            The PBOC could end this crisis overnight: expand the swap line, remove the daily limit, instruct Chinese state banks (ICBC, Bank of China, China Construction Bank) to flood the Moscow interbank market with liquidity.
          </p>
          <p>
            It does none of these things. The yuan shortage is China&apos;s leverage.
          </p>

          <div style={S.warnBox}>
            <div style={S.warnLabel}>Why This Matters</div>
            <p style={{ margin: 0 }}>
              The PBOC&apos;s inaction is not negligence. It is strategy. Every day that Russian banks scramble for yuan, China&apos;s negotiating position strengthens: on oil pricing ($6&ndash;12 discount per barrel), on gas pipeline terms, on raw material costs, and on political alignment. Russia will not challenge Chinese interests anywhere, not in Central Asia, not in the Arctic, not regarding Taiwan, because the yuan supply can be restricted at any moment. The shortage is the leverage.
            </p>
          </div>

          <LiveChart symbol="USDRUB=X" label="USD/RUB Exchange Rate" range="1y" height={280} />
        </motion.div>

        {/* ── Section 9: The Spiral ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2 id="sec-9" style={S.h2}>9. The Spiral: How a Yuan Shortage Becomes an Economic Crisis</h2>
          <p>The 44% rate does not stay in the interbank market. It propagates through the entire economy:</p>
          <p>
            <strong style={{ color: "#fff" }}>Link 1: The ruble falls.</strong> Everyone is selling rubles to buy scarce yuan. The yuan&apos;s price in rubles surges. Since the Moscow Exchange no longer trades dollars or euros (eliminated by June 2024 sanctions), the CBR derives dollar and euro rates from the yuan rate. The ruble weakens against everything.
          </p>
          <p>
            <strong style={{ color: "#fff" }}>Link 2: Imports become more expensive.</strong> Every Chinese good (Chery automobiles, Huawei phones, XCMG excavators, Midea air conditioners) costs significantly more in rubles. Since China supplies 57% of Russian imports, this is direct, broad-based inflation.
          </p>
          <p>
            <strong style={{ color: "#fff" }}>Link 3: The central bank is trapped.</strong> The CBR could sell yuan reserves to stabilize the ruble, but its reserves are shrinking. It could raise rates further (already at 15%), but that strangles investment and accelerates business failures. It could ask the PBOC for help, but Beijing says no.
          </p>
          <p>
            <strong style={{ color: "#fff" }}>Link 4: Businesses fail.</strong> Companies with yuan-denominated debts face higher repayment costs. Over 17,000 Russian businesses reported losses in 2025. 300 are being prepared for closure. 74 of 85 Russian regions simultaneously fell into budget deficits.
          </p>
          <p>
            <strong style={{ color: "#fff" }}>Link 5: The loop closes.</strong> Fewer businesses means less tax revenue, which means less government capacity to support the system, which means less yuan, which means the shortage worsens.
          </p>

          <div style={S.callout}>
            <div style={S.calloutLabel}>Think of it like this</div>
            <p style={{ margin: 0 }}>
              It is like a bank account where your salary (oil revenues) has been cut and arrives late, your rent and bills (Chinese imports) are due immediately, and your father (the Welfare Fund) has stopped lending you money. The overdraft rate is 44%. And the only person who could lend you money cheaply, your main client China, is deliberately choosing not to, because your desperation gives them a better price on everything they buy from you.
            </p>
          </div>
        </motion.div>

        {/* ── Section 10: The Asymmetry ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2 id="sec-10" style={S.h2}>10. The Asymmetry: Russia Needs China; China Needs Russia... Conveniently</h2>
          <p>The trade relationship between Russia and China is not a partnership of equals. The numbers make this unambiguous:</p>

          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Metric</th>
                <th style={S.th}>Russia &rarr; China</th>
                <th style={S.th}>China &rarr; Russia</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={S.td}>Importance</td>
                <td style={S.td}>China is Russia&apos;s #1 partner by far</td>
                <td style={S.td}>Russia is China&apos;s #8 partner (~4% of trade)</td>
              </tr>
              <tr>
                <td style={S.td}>Import dependency</td>
                <td style={S.td}>Moderate (exports mostly raw materials)</td>
                <td style={S.td}><strong style={{ color: "#fff" }}>57% of ALL Russian imports come from China</strong></td>
              </tr>
              <tr>
                <td style={S.td}>Export concentration</td>
                <td style={S.td}>73% of China&apos;s imports from Russia = mineral fuels</td>
                <td style={S.td}>Diversified: machinery, vehicles, electronics, textiles</td>
              </tr>
              <tr>
                <td style={S.td}>Alternatives</td>
                <td style={S.td}>Russia can sell to China and India. That&apos;s it.</td>
                <td style={S.td}>China can buy from Saudi Arabia, UAE, Iraq, Brazil, US</td>
              </tr>
              <tr>
                <td style={S.td}>Currency leverage</td>
                <td style={S.td}>Russia desperately needs yuan</td>
                <td style={S.td}>China does not need rubles</td>
              </tr>
            </tbody>
          </table>

          <p>
            Before the war, approximately half of Russia&apos;s exports went to the EU. By mid-2025, that share collapsed to 8%. On the import side, the EU&apos;s share fell from roughly one-third to 12%. China filled the vacuum, but on terms that reflect a monopoly buyer, not a partner.
          </p>

          <div style={S.warnBox}>
            <div style={S.warnLabel}>Important Distinction</div>
            <p style={{ margin: 0 }}>
              Russia maintains a nominal trade surplus with China ($129.3 billion in exports<Footnote id={5} source="MERICS China-Russia Dashboard" detail="Bilateral trade data, 2024 figures" /> vs. $115.5 billion in imports in 2024). But the surplus depends entirely on volatile commodity prices. Russia exports raw materials at discounted prices; China exports finished goods at full prices. When oil prices fall, the surplus vanishes. When they rise, the revenues arrive with a 1&ndash;2 month lag that creates the yuan shortage. The &ldquo;surplus&rdquo; masks a structural dependency.
            </p>
          </div>
        </motion.div>

        {/* ── Section 11: The Dollar System ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2 id="sec-11" style={S.h2}>11. The Dollar System: Why It Does Not Break</h2>
          <p>
            What Russia is experiencing (a 44% overnight rate, an exhausted swap line, a central bank with no effective tool) is essentially impossible in the dollar system. The architecture specifically prevents it.
          </p>

          <h3 style={S.h3}>11.1 The Fed&apos;s Five Backstops</h3>
          <p>The Federal Reserve maintains interlocking facilities that guarantee dollar liquidity:</p>
          <p>
            <strong style={{ color: "#fff" }}>The Discount Window:</strong> Any US bank can borrow dollars from the Fed against collateral, at a known rate, at any time.
          </p>
          <p>
            <strong style={{ color: "#fff" }}>The Standing Repo Facility (SRF):</strong> Created after the September 2019 crisis (when the US overnight rate briefly spiked from 2.43% to 5.25%), it provides unlimited overnight liquidity at the top of the Fed&apos;s target range. No aggregate cap.
          </p>
          <p>
            <strong style={{ color: "#fff" }}>Open Market Operations:</strong> The Fed buys and sells Treasuries to add or drain reserves from the system.
          </p>
          <p>
            <strong style={{ color: "#fff" }}>Swap Lines:</strong> Standing agreements with five central banks (ECB, Bank of Japan, Bank of England, Bank of Canada, Swiss National Bank) provide unlimited dollar liquidity globally. During COVID, peak usage reached approximately $449 billion. Dollar shortages in Frankfurt or Tokyo were resolved in hours.
          </p>
          <p>
            <strong style={{ color: "#fff" }}>The FIMA Repo Facility:</strong> Allows approximately 170 foreign central banks to convert their Treasury holdings to dollars overnight.
          </p>

          <div style={S.defBox}>
            <div style={S.defLabel}>Definition</div>
            <p style={{ margin: 0 }}>
              <strong style={{ color: "#fff" }}>SOFR (Secured Overnight Financing Rate):</strong> The primary US dollar overnight benchmark, based on approximately $2 trillion in daily Treasury-backed repo transactions. It replaced LIBOR, which was discontinued in 2023 after a manipulation scandal. SOFR is transaction-based (derived from actual trades, not estimates), making it virtually impossible to manipulate.
            </p>
          </div>

          <p>
            When the 2019 repo crisis sent the US overnight rate to 5.25%, the Fed injected $75 billion the next morning. Rates normalized in 48 hours. The crisis led to the creation of the Standing Repo Facility as a permanent backstop.
          </p>
          <p>
            In the yuan system for Russia: no equivalent discount window, no standing facility, no unlimited swap line, no automatic stabilizer. The PBOC&apos;s swap is capped and exhausted. Chinese state banks refuse to lend for fear of US secondary sanctions. The 44% rate persists until export revenues eventually trickle in, which takes weeks or months.
          </p>

          <div style={S.skillBox}>
            <div style={S.skillLabel}>Skill Unlocked</div>
            <p style={{ margin: "0 0 6px", color: "#2D8F5E", fontWeight: 600 }}>You now understand the liquidity infrastructure gap</p>
            <p style={{ margin: 0, fontSize: "0.88rem" }}>
              The dollar system has five interlocking backstops ensuring overnight rates never spiral out of control. The yuan system for Russia has one capped swap line that ran out on March 18. This is not a policy choice. It reflects the fundamental difference between a reserve currency with global infrastructure and a managed currency used as a tool of state leverage.
            </p>
          </div>
        </motion.div>

        {/* ── Section 12: The Oil Paradox ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2 id="sec-12" style={S.h2}>12. The Oil Paradox: Why Russia Cannot Cash In</h2>
          <p>Here is the cruel irony of early 2026: the Iran war should be a windfall.</p>
          <p>
            Oil prices have surged dramatically since hostilities began on February 28. The Strait of Hormuz, through which 20% of the world&apos;s oil normally flows, is effectively closed. The International Energy Agency has called it the &ldquo;greatest global energy security challenge in history.&rdquo; Gulf production has dropped by at least 10 million barrels per day. The world is desperate for non-Gulf oil.
          </p>
          <p>Russia should be collecting. Instead:</p>
          <p>
            <strong style={{ color: "#fff" }}>The discount persists</strong>, because China knows Russia has no alternative buyer.
          </p>
          <p>
            <strong style={{ color: "#fff" }}>The shadow fleet surcharge persists</strong>, because Western insurance remains off-limits.
          </p>
          <p>
            <strong style={{ color: "#fff" }}>The yuan shortage persists</strong>, because tax revenues lag oil prices by 1&ndash;2 months.
          </p>
          <p>
            <strong style={{ color: "#fff" }}>Russia has banned gasoline exports</strong> (from April 1 through July 31), citing domestic shortages caused by Ukrainian drone strikes on refineries and the global price surge that incentivizes producers to sell abroad rather than supply the domestic market.
          </p>
          <p>
            Russia is simultaneously benefiting from the highest oil prices in years and suffering a domestic fuel crisis. It is earning more per barrel than at any point since 2022 and unable to convert those earnings into stable yuan liquidity.
          </p>
          <p>
            This is what trading outside the dollar system looks like under stress. Not a clean break from Western hegemony, but a constant, grinding tax on every transaction, paid in discounts, in logistics costs, in overnight rates, and in lost bargaining power.
          </p>

          <LiveChart symbol="GC=F" label="Gold — Geopolitical Hedge (GC=F)" range="6mo" height={280} />
        </motion.div>

        {/* ── Section 13: The India Route ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2 id="sec-13" style={S.h2}>13. The India Route: The World&apos;s Largest Oil Laundry</h2>
          <p>
            A significant share of Russia&apos;s western-route crude does not go to China. It goes to India, and what happens there illuminates how sanctions reshape global trade flows without stopping them.
          </p>
          <p>
            Indian mega-refineries, particularly Reliance Industries&apos; Jamnagar complex (the world&apos;s largest at 1.4 million barrels per day), buy Russian Urals at steep discounts. They refine it into gasoline, diesel, jet fuel, and petrochemicals. Then they export the finished products to Europe and the United States at full world-market prices.
          </p>
          <p>
            Russian crude enters Jamnagar as &ldquo;sanctioned oil.&rdquo; Indian diesel leaves Jamnagar as &ldquo;Indian product.&rdquo; This is legal: the sanctions target Russian crude, not refined products from third countries. But it means European consumers are, indirectly, still running their cars on Russian energy.
          </p>
          <p>
            The <strong style={{ color: "#fff" }}><Term definition="The profit margin a refinery earns by 'cracking' crude oil into refined products like gasoline and diesel. Calculated as refined product prices minus crude input cost." href="https://www.investopedia.com/terms/c/crackspread.asp">crack spread</Term></strong>, the difference between crude input cost and refined product prices, explains why this is so profitable.
          </p>

          <div style={S.defBox}>
            <div style={S.defLabel}>Definition</div>
            <p style={{ margin: 0 }}>
              <strong style={{ color: "#fff" }}>Crack Spread:</strong> The margin a refinery earns by &ldquo;cracking&rdquo; crude oil into refined products. A common calculation is the <strong style={{ color: "#fff" }}>3-2-1 crack spread</strong>: (2 &times; gasoline price + 1 &times; diesel price) &divide; 3 &minus; crude oil price. In normal markets, this margin ranges from $10&ndash;15 per barrel. In tight markets (like the current one, with Hormuz-driven product shortages), it can reach $20&ndash;30 or higher.
            </p>
          </div>

          <p>
            A standard refinery buying Brent-priced crude earns a normal crack spread. Reliance, buying discounted Russian crude at $10&ndash;15 below Brent, earns a spread that is nearly double the norm. India has become the arbitrage intermediary of the sanctioned oil market.
          </p>
        </motion.div>

        {/* ── Section 14: Why the Yuan Cannot Replace the Dollar ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2 id="sec-14" style={S.h2}>14. Why the Yuan Cannot Replace the Dollar</h2>
          <p>
            Russia&apos;s experience is the most important data point in the global debate about de-dollarization. The verdict is in, and it is definitive.
          </p>

          <h3 style={S.h3}>14.1 What a Reserve Currency Requires</h3>
          <p>
            A reserve currency must be <strong style={{ color: "#fff" }}>freely convertible</strong>: anyone can exchange it without restrictions. China maintains capital controls limiting individual forex purchases to $50,000/year, with regulatory approval required above that.
          </p>
          <p>
            It must be backed by <strong style={{ color: "#fff" }}>deep, liquid markets</strong>. The US Treasury market ($31+ trillion) is the deepest bond market on earth. China&apos;s bond market, while large, restricts foreign access and lacks hedging instruments.
          </p>
          <p>
            It must have a <strong style={{ color: "#fff" }}>lender of last resort</strong> providing liquidity as a public good. The Fed does this. The PBOC does not, as Russia&apos;s experience demonstrates.
          </p>
          <p>
            It must enjoy <strong style={{ color: "#fff" }}>institutional credibility</strong>: trust that the rules will not change during a crisis. The PBOC answers to the Communist Party. In 2015, the PBOC surprised markets by changing the yuan&apos;s exchange rate mechanism, triggering capital outflows exceeding $1 trillion.
          </p>

          <h3 style={S.h3}>14.2 The Numbers</h3>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Metric</th>
                <th style={S.th}>US Dollar</th>
                <th style={S.th}>Chinese Yuan</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={S.td}>Share of global reserves</td>
                <td style={S.td}>~58%</td>
                <td style={S.td}>~2%</td>
              </tr>
              <tr>
                <td style={S.td}>Share of global payments (SWIFT)</td>
                <td style={S.td}>~47%</td>
                <td style={S.td}>~3% (5th place)</td>
              </tr>
              <tr>
                <td style={S.td}>Offshore deposits</td>
                <td style={S.td}>~$14 trillion (eurodollar market)</td>
                <td style={S.td}>~$200 billion</td>
              </tr>
              <tr>
                <td style={S.td}>Overnight backstop</td>
                <td style={S.td}>5 interlocking Fed facilities</td>
                <td style={S.td}>1 capped swap line</td>
              </tr>
              <tr>
                <td style={S.td}>Capital controls</td>
                <td style={S.td}>None</td>
                <td style={S.td}>$50,000/year individual limit</td>
              </tr>
            </tbody>
          </table>

          <p>
            Xi Jinping has explicitly called for the yuan to achieve reserve currency status, publishing his ambition in the Communist Party&apos;s flagship journal <em>Qiushi</em>. But achieving it would require full capital account liberalization, which would mean accepting a level of financial openness incompatible with CCP political control. This is the <strong style={{ color: "#fff" }}><Term definition="A trilemma in international economics: a country can maintain at most two of (1) free capital flows, (2) independent monetary policy, and (3) a managed exchange rate. Also called the Mundell-Fleming trilemma." href="https://www.investopedia.com/terms/i/impossible-trinity.asp">Impossible Trinity</Term></strong>: a country can maintain at most two of free capital flows, independent monetary policy, and a managed exchange rate. China has chosen the latter two, making capital controls structurally necessary.
          </p>

          <div style={S.skillBox}>
            <div style={S.skillLabel}>Skill Unlocked</div>
            <p style={{ margin: "0 0 6px", color: "#2D8F5E", fontWeight: 600 }}>You now understand why de-dollarization has not worked</p>
            <p style={{ margin: 0, fontSize: "0.88rem" }}>
              Russia went further than any major economy in history to leave the dollar. It shifted 99% of forex trading to yuan, rebuilt payments via CIPS, and constructed a shadow fleet. The result: 44% overnight rates, permanent oil discounts, a shrinking Welfare Fund, and dependency on a partner that weaponizes the currency shortage. The alternative system exists, but it is thinner, more fragile, and more easily exploited than the original.
            </p>
          </div>
        </motion.div>

        {/* ── Section 15: Investment Implications & Outlook ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2 id="sec-15" style={S.h2}>15. Investment Implications &amp; Outlook</h2>
          <p>For investors and market participants, Russia&apos;s oil machine reveals several structural dynamics:</p>
          <p>
            <strong style={{ color: "#fff" }}>Brent-Urals spread</strong>, currently in the $6&ndash;12 range. Sustained widening signals deepening Russian isolation; narrowing suggests sanctions erosion or enforcement fatigue. This spread is tradeable via ICE futures and OTC swaps.
          </p>
          <p>
            <strong style={{ color: "#fff" }}>Yuan/ruble volatility</strong> is the most direct expression of Russia&apos;s liquidity stress. Spikes in RUSFAR CNY (the yuan overnight rate) correlate with ruble weakness and rising import costs across Russia.
          </p>
          <p>
            <strong style={{ color: "#fff" }}>Crack spreads</strong> are elevated by supply disruptions and Russian product export bans. India&apos;s refinery margins are a direct beneficiary. Companies like Reliance Industries profit from the arbitrage between discounted Russian crude and world-price products.
          </p>
          <p>
            <strong style={{ color: "#fff" }}>Shadow fleet risk</strong> represents an uninsured and growing environmental liability. A major oil spill from an aging, under-insured tanker could trigger emergency regulatory responses in the Baltic or Mediterranean, disrupting Russian export flows.
          </p>
          <p>
            <strong style={{ color: "#fff" }}>Dollar dominance duration</strong>: the 44% overnight rate is evidence that the yuan is structurally unprepared to serve as a reserve currency alternative. For asset allocators, this reinforces the case for dollar-denominated assets as the global safe haven.
          </p>
          <p>
            <strong style={{ color: "#fff" }}>Hormuz resolution</strong> is the single biggest near-term catalyst across all of these dynamics. If the Strait reopens, oil prices fall sharply, Russia&apos;s yuan inflows increase (with a lag), and the overnight rate normalizes. If it stays closed, the crisis deepens across every dimension described in this article.
          </p>

          <div style={S.warnBox}>
            <div style={S.warnLabel}>The Structural Case</div>
            <p style={{ margin: 0 }}>
              Russia&apos;s oil machine works, in the sense that oil still flows and trade still happens. But it works the way a body works with a tourniquet: the patient is alive, but the limb is dying. The 44% overnight rate, the permanent discount, the shadow fleet, and China&apos;s silent leverage all point to the same conclusion: there is no functional parallel to the dollar system today. For investors, this means dollar infrastructure remains the backbone of global markets, and every attempt to build around it generates arbitrage opportunities for those who understand the architecture.
            </p>
          </div>
        </motion.div>

        {/* ── Attribution & Disclaimer ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <div style={{ ...S.meta, marginTop: 56, justifyContent: "flex-start" }}>
            <span>Sami Samii</span>
            <span>/</span>
            <span>S2D Capital Insights</span>
            <span>/</span>
            <span>March 2026</span>
          </div>

          <div style={S.disclaimer}>
            <p style={{ margin: "0 0 12px" }}>
              <strong style={{ color: "rgba(255,255,255,0.5)" }}>Disclaimer:</strong> This document is for informational purposes only and does not constitute financial, legal, or investment advice. Energy and currency markets involve significant risks, including price volatility driven by geopolitical events, sanctions policy, and regulatory changes. All cited data originates from public sources and may be subject to revision. Investors should conduct their own due diligence and consult qualified financial advisors before making investment decisions.
            </p>
            <p style={{ margin: 0 }}>
              <strong style={{ color: "rgba(255,255,255,0.5)" }}>Sources:</strong> S&amp;P Global Platts, Argus Media, ICE (Intercontinental Exchange), Moscow Exchange (MOEX), Central Bank of Russia, People&apos;s Bank of China, Federal Reserve Bank of New York, CNBC, Bloomberg, The Moscow Times, Reuters, Kpler, Windward AI, Rystad Energy, BCA Research, International Energy Agency (IEA), MERICS China-Russia Dashboard, EU ISS, Bruegel Russian Foreign Trade Tracker.
            </p>
          </div>
        </motion.div>

      </article>
      <RelatedArticles currentSlug="russia-oil-machine" tags={['commodities','geopolitics','fx']} />
    </>
  );
}
