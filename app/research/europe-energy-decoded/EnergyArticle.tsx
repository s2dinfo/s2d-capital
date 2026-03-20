"use client";
import BackButton from "@/components/BackButton";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import React from "react";

const LiveChart = dynamic(() => import("@/components/LiveChart"), {
  ssr: false,
  loading: () => (
    <div style={{ height: 300, border: "1px solid var(--border, #E8E6E0)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", margin: "28px 0", color: "var(--text-muted, #9C9CAF)", fontFamily: "var(--mono)", fontSize: "0.72rem" }}>
      Loading chart...
    </div>
  ),
});

/* ── Styles (matching ClarityActArticle.tsx) ── */
const S = {
  article: { maxWidth: 780, margin: "0 auto", padding: "0 24px 80px", fontFamily: "var(--sans, 'Outfit', sans-serif)", color: "var(--text-body, #3a3a4a)", lineHeight: 1.85, fontSize: "1.02rem" } as React.CSSProperties,
  hero: { textAlign: "center" as const, padding: "72px 24px 48px", background: "linear-gradient(180deg, var(--gold-tint, #faf6ee) 0%, var(--bg-primary, #fff) 100%)", borderBottom: "1px solid var(--border, #E8E6E0)" } as React.CSSProperties,
  eyebrow: { fontFamily: "var(--mono, 'JetBrains Mono', monospace)", fontSize: "0.62rem", letterSpacing: "0.3em", textTransform: "uppercase" as const, color: "var(--gold, #b8860b)", marginBottom: 18 } as React.CSSProperties,
  h1: { fontFamily: "var(--serif, 'Playfair Display', serif)", fontSize: "clamp(2rem, 4.5vw, 3rem)", fontWeight: 400, lineHeight: 1.15, color: "var(--navy, #0f0f23)", marginBottom: 18, maxWidth: 720, marginLeft: "auto", marginRight: "auto" } as React.CSSProperties,
  subtitle: { fontSize: "1.05rem", color: "var(--text-secondary, #6B6B82)", maxWidth: 620, margin: "0 auto 24px", lineHeight: 1.7, fontWeight: 300 } as React.CSSProperties,
  meta: { fontFamily: "var(--mono, 'JetBrains Mono', monospace)", fontSize: "0.62rem", letterSpacing: "0.12em", color: "var(--text-muted, #9C9CAF)", display: "flex" as const, justifyContent: "center" as const, gap: 20, flexWrap: "wrap" as const } as React.CSSProperties,
  h2: { fontFamily: "var(--serif, 'Playfair Display', serif)", fontSize: "1.6rem", fontWeight: 400, color: "var(--navy, #0f0f23)", marginTop: 56, marginBottom: 20, lineHeight: 1.25 } as React.CSSProperties,
  h3: { fontFamily: "var(--serif, 'Playfair Display', serif)", fontSize: "1.2rem", fontWeight: 500, color: "var(--navy, #0f0f23)", marginTop: 36, marginBottom: 14, lineHeight: 1.3 } as React.CSSProperties,
  callout: { background: "var(--gold-tint, #faf6ee)", borderLeft: "3px solid var(--gold, #b8860b)", padding: "20px 24px", margin: "28px 0", borderRadius: "0 6px 6px 0", fontSize: "0.95rem", lineHeight: 1.8 } as React.CSSProperties,
  calloutLabel: { fontFamily: "var(--mono, 'JetBrains Mono', monospace)", fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "var(--gold, #b8860b)", marginBottom: 8, fontWeight: 600 } as React.CSSProperties,
  defBox: { background: "#f8f7f4", border: "1px solid var(--border, #E8E6E0)", borderRadius: 8, padding: "20px 24px", margin: "24px 0" } as React.CSSProperties,
  defLabel: { fontFamily: "var(--mono, 'JetBrains Mono', monospace)", fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "var(--gold, #b8860b)", marginBottom: 6, fontWeight: 600 } as React.CSSProperties,
  keyFigure: { background: "var(--navy, #0f0f23)", color: "#fff", borderRadius: 8, padding: "24px 28px", margin: "28px 0", display: "flex" as const, justifyContent: "space-between" as const, alignItems: "center" as const, flexWrap: "wrap" as const, gap: 16 } as React.CSSProperties,
  keyFigureNum: { fontFamily: "var(--serif, 'Playfair Display', serif)", fontSize: "2rem", fontWeight: 400, color: "var(--gold-light, #d4a843)" } as React.CSSProperties,
  keyFigureLabel: { fontFamily: "var(--mono, 'JetBrains Mono', monospace)", fontSize: "0.62rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" as const } as React.CSSProperties,
  table: { width: "100%", borderCollapse: "collapse" as const, margin: "24px 0", fontSize: "0.88rem", fontFamily: "var(--sans, 'Outfit', sans-serif)" } as React.CSSProperties,
  th: { fontFamily: "var(--mono, 'JetBrains Mono', monospace)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "var(--text-muted, #9C9CAF)", borderBottom: "2px solid var(--border, #E8E6E0)", padding: "10px 12px", textAlign: "left" as const, fontWeight: 600 } as React.CSSProperties,
  td: { padding: "12px 12px", borderBottom: "1px solid var(--border, #E8E6E0)", verticalAlign: "top" as const } as React.CSSProperties,
  disclaimer: { marginTop: 48, padding: "24px 0", borderTop: "1px solid var(--border, #E8E6E0)", fontSize: "0.72rem", color: "var(--text-muted, #9C9CAF)", lineHeight: 1.7 } as React.CSSProperties,
  analogy: { background: "linear-gradient(135deg, #f0efe8, #faf8f3)", border: "1px dashed var(--gold, #b8860b)", borderRadius: 8, padding: "18px 22px", margin: "24px 0", fontSize: "0.95rem", lineHeight: 1.8 } as React.CSSProperties,
  analogyLabel: { fontFamily: "var(--mono, 'JetBrains Mono', monospace)", fontSize: "0.52rem", letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "#8B5E3C", marginBottom: 6, fontWeight: 600 } as React.CSSProperties,
  skillBox: { background: "var(--navy, #0f0f23)", color: "#fff", borderRadius: 8, padding: "18px 22px", margin: "24px 0", fontSize: "0.9rem", lineHeight: 1.75, borderLeft: "3px solid var(--gold, #b8860b)" } as React.CSSProperties,
  skillLabel: { fontFamily: "var(--mono, 'JetBrains Mono', monospace)", fontSize: "0.52rem", letterSpacing: "0.2em", color: "var(--gold-light, #d4a843)", marginBottom: 6, fontWeight: 600 } as React.CSSProperties,
};

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

/* ── Definition Box ── */
function Def({ term, children }: { term: string; children: React.ReactNode }) {
  return <div style={S.defBox}><div style={S.defLabel}>Definition</div><p style={{ margin: 0 }}><strong style={{ color: "var(--navy, #0f0f23)" }}>{term}:</strong> {children}</p></div>;
}

/* ── Think of it like... Box ── */
function Analogy({ children }: { children: React.ReactNode }) {
  return <div style={S.analogy}><div style={S.analogyLabel}>Think of it like this</div>{children}</div>;
}

/* ── Skill Unlocked Box ── */
function Skill({ title, children }: { title: string; children: React.ReactNode }) {
  return <div style={S.skillBox}><div style={S.skillLabel}>Skill Unlocked</div><p style={{ margin: 0, color: "var(--gold-light, #d4a843)", fontWeight: 600, marginBottom: 6 }}>{title}</p><p style={{ margin: 0, color: "rgba(255,255,255,0.75)", fontSize: "0.88rem" }}>{children}</p></div>;
}

/* ── Trading venues table ── */
const venues = [
  { venue: "EEX (Leipzig)", type: "Exchange", products: "Power futures, gas futures, EU ETS, GOs", settlement: "Cleared by ECC" },
  { venue: "ICE Endex", type: "Exchange", products: "TTF gas, Brent crude, UK power, EUAs", settlement: "ICE Clear Europe" },
  { venue: "EPEX SPOT", type: "Exchange (spot)", products: "Day-ahead & intraday power auctions, 13 countries", settlement: "Physical delivery, T+1" },
  { venue: "Nord Pool", type: "Exchange (spot)", products: "Nordic/Baltic/UK power", settlement: "Physical delivery" },
  { venue: "OTC Brokers", type: "Over-the-counter", products: "Bespoke: biomethane, GoOs, THG-Quoten, SAF, PPAs", settlement: "Bilateral, ISDA/EFET" },
];

export default function EnergyArticle() {
  return (<><BackButton label="Back to Research" href="/research" />
    <article>
      {/* ═══ HERO ═══ */}
      <motion.div style={S.hero} {...fadeUp}>
        <div style={S.eyebrow}>Investor Briefing · March 2026</div>
        <h1 style={S.h1}>
          Europe&apos;s Energy System, <em style={{ fontStyle: "italic", color: "var(--gold, #b8860b)" }}>Decoded</em>
        </h1>
        <p style={S.subtitle}>
          From the grid to the trading floor — how renewables, regulation, and geopolitics are reshaping the continent&apos;s energy future. A complete guide for investors and the curious.
        </p>
        <div style={S.meta}>
          <span>By Sami Samii</span>
          <span>·</span>
          <span>S2D Capital Insights</span>
          <span>·</span>
          <span>30 min read</span>
        </div>
      </motion.div>

      {/* ═══ BODY ═══ */}
      <div style={S.article}>

        {/* Key figures */}
        <motion.div style={S.keyFigure} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
          <div><div style={S.keyFigureNum}>2x</div><div style={S.keyFigureLabel}>EU vs. US Industrial Power Cost</div></div>
          <div><div style={S.keyFigureNum}>€651B</div><div style={S.keyFigureLabel}>EU Energy Shield Spending 2021–23</div></div>
          <div><div style={S.keyFigureNum}>46 bcm</div><div style={S.keyFigureLabel}>EU Gas Storage (Feb 2026)</div></div>
          <div><div style={S.keyFigureNum}>+57%</div><div style={S.keyFigureLabel}>TTF Gas Since Iran War Began</div></div>
        </motion.div>

        {/* ── 1. EXECUTIVE SUMMARY ── */}
        <h2 style={S.h2}>1. Executive Summary</h2>

        <p>
          On February 28, 2026, the United States and Israel launched military strikes against Iran. Within days, the Strait of Hormuz — through which 20% of the world&apos;s oil supply flows — was effectively shut down. QatarEnergy, responsible for roughly a fifth of global liquefied natural gas (LNG) production, halted all output after Iranian drone attacks on its facilities. Brent crude surged from $70 to $120 per barrel. European gas prices jumped 57%.
        </p>
        <p>
          For Europe, the timing could hardly have been worse. Gas storage levels started 2026 at just 46 billion cubic metres — compared to 60 bcm in 2025 and 77 bcm in 2024. The EU&apos;s regulation phasing out Russian gas imports formally took effect on February 3, 2026, with the stepwise ban beginning on March 18 — today.
        </p>
        <p>
          But this article is not just about the current crisis. It is a comprehensive guide to how Europe&apos;s energy system actually works — where the energy comes from, how it reaches your home and factory, how it&apos;s priced, how it&apos;s traded, what &ldquo;green energy&rdquo; really means in practice, and why these crises keep happening. By the time you finish reading, you will understand Europe&apos;s energy landscape better than most professionals working in it.
        </p>

        {/* ── 2. HOW THE SYSTEM WORKS ── */}
        <h2 style={S.h2}>2. How Europe&apos;s Energy System Actually Works</h2>

        <p>
          Before we can understand why European energy is so expensive, or why the Iran war matters, we need to understand the basics: how does electricity get from a power plant to your light switch?
        </p>

        <h3 style={S.h3}>2.1 The Grid: Europe&apos;s Invisible Highway</h3>
        <p>
          Europe&apos;s electricity grid is one of the largest synchronized systems in the world. It operates at a frequency of 50 Hz, and every power plant, every wind turbine, and every factory connected to it must stay in sync. If supply and demand fall out of balance, the frequency drops — and if it drops too far, the system collapses. This is what happened during the Iberian Peninsula blackout of April 2025.
        </p>

        <Analogy>
          <p style={{ margin: 0 }}>Think of the grid like a highway system. Power plants are the on-ramps. Factories and homes are the off-ramps. Transmission lines are the motorways. The &ldquo;traffic&rdquo; (electricity) must always flow smoothly — if there&apos;s a massive accident on one motorway, the whole system can back up. And unlike real highways, you cannot store electricity in a traffic jam. It must be consumed the instant it is produced.</p>
        </Analogy>

        <p>
          The grid is managed by Transmission System Operators (TSOs) — companies like TenneT (Germany/Netherlands), RTE (France), Red Eléctrica (Spain), and Terna (Italy). These TSOs are responsible for keeping the system balanced 24/7. When a cloud passes over a solar farm in Bavaria, someone at TenneT must instantly find replacement power — perhaps from a gas plant in the Netherlands or a hydropower dam in Austria.
        </p>

        <Def term="Transmission System Operator (TSO)">
          The entity responsible for operating a country&apos;s high-voltage electricity grid, maintaining system stability, and coordinating cross-border power flows. In Europe, ENTSO-E coordinates 39 TSOs across 35 countries.
        </Def>

        <p>
          Europe&apos;s grids are interconnected across borders, which is one of the system&apos;s great strengths — but also a source of complexity. When France has surplus nuclear power, it can export it to Germany. When Denmark has excess wind, it flows to Norway, where hydropower dams effectively &ldquo;store&rdquo; it by reducing their own output. But these cross-border connections have limited capacity. Grid bottlenecks mean that cheap Spanish solar cannot always flow northward to power German factories, even when Spain has far more than it needs.
        </p>

        <h3 style={S.h3}>2.2 The Merit Order: Why Gas Sets the Price of Everything</h3>
        <p>
          This is the single most important concept for understanding European electricity prices — and the one that causes the most confusion and political anger.
        </p>
        <p>
          In Europe&apos;s electricity market, power plants are dispatched in order of their marginal cost — the cost of producing one additional megawatt-hour. The cheapest plants run first. Wind and solar have near-zero marginal costs (the fuel — wind and sunlight — is free). Nuclear is also cheap to run once built. Then comes coal, then gas — and gas is the most expensive.
        </p>
        <p>
          Here is the critical part: <strong>the price paid to ALL generators is set by the LAST (most expensive) plant needed to meet demand.</strong> This is called the merit order system. Even if 70% of the electricity comes from cheap renewables, if the remaining 30% requires a gas plant to be switched on, the gas plant&apos;s cost sets the market price for everyone.
        </p>

        <Analogy>
          <p style={{ margin: 0 }}>Imagine an auction where a concert venue needs 1,000 seats filled. The first 700 people bid €10 each, but the last 300 people demand €100 per seat. In the merit order system, <em>everyone</em> gets paid €100 — including the 700 who would have been happy with €10. The most expensive bid needed to fill the room sets the clearing price for all. That €100 bidder is the gas plant.</p>
        </Analogy>

        <p>
          This is why gas prices have such an outsized impact on European electricity costs. In Italy, gas influenced the electricity price in 89% of all hours in 2026 so far. In Spain, which has massively expanded solar capacity, it was just 15%. The result: Spain has some of Europe&apos;s lowest electricity prices, while Italy — a country with similar sunlight — pays far more because its power system still leans heavily on gas.
        </p>

        <Skill title="You now understand marginal pricing">
          When you hear that &ldquo;gas prices are driving up electricity costs,&rdquo; you know exactly why: the merit order system means the most expensive plant needed sets the price for all generators. This is the foundation of every European energy price debate.
        </Skill>

        <h3 style={S.h3}>2.3 Day-Ahead, Intraday, and Balancing Markets</h3>
        <p>
          Electricity is not just traded once. It flows through a sequence of markets, each with a different time horizon:
        </p>
        <div style={{ margin: "16px 0 16px 20px" }}>
          <p><strong>Day-Ahead Market:</strong> Every day at noon, EPEX SPOT runs auctions for the next day&apos;s 24 hours. Generators submit bids (&ldquo;I can produce 500 MW at €45/MWh&rdquo;), and consumers submit demands. The algorithm matches supply and demand for each hour, producing a clearing price. This is where most electricity is traded — about 70% of European spot volume.</p>
          <p><strong>Intraday Market:</strong> After the day-ahead auction, participants can adjust their positions in continuous intraday trading — for example, if a wind forecast changes and a utility suddenly has more or less power than expected. Trading continues up to 5 minutes before delivery in some markets.</p>
          <p><strong>Balancing Market:</strong> In real time, TSOs must keep supply and demand perfectly matched. They procure &ldquo;balancing energy&rdquo; from generators that can ramp up or down quickly — typically gas plants, batteries, or hydropower. This is the most expensive market, and the one where system operators act as the last line of defense.</p>
        </div>

        <Def term="EPEX SPOT">
          The European Power Exchange, headquartered in Paris. It operates day-ahead and intraday electricity markets across 13 European countries, trading over 880 TWh in 2024. It is part of the EEX Group (owned by Deutsche Börse).
        </Def>

        {/* ── 3. THE RENEWABLE LANDSCAPE ── */}
        <h2 style={S.h2}>3. The Renewable Energy Landscape</h2>

        <p>
          Europe&apos;s energy system is in the middle of its most radical transformation since electrification began. Renewables now generate approximately 45% of EU electricity — a figure that was below 20% just 15 years ago. But &ldquo;renewables&rdquo; is a broad category that covers very different technologies, each with different economics, grid impacts, and policy frameworks.
        </p>

        <h3 style={S.h3}>3.1 The Big Three: Solar, Wind, and Hydro</h3>
        <p>
          <strong>Solar PV</strong> is Europe&apos;s fastest-growing power source. Spain, Germany, Italy, and France lead installation. Solar is now the cheapest form of new electricity generation in most of Europe, but it has a fundamental limitation: it only produces during daylight hours and peaks around midday — often when demand is moderate. This creates the so-called &ldquo;duck curve,&rdquo; where midday prices crash (sometimes going negative) while evening prices spike as the sun sets and gas plants fire up.
        </p>
        <p>
          <strong>Wind power</strong> — both onshore and offshore — is Europe&apos;s largest renewable source by generation. Denmark, Germany, the Netherlands, and the UK are leaders. Offshore wind farms in the North Sea are becoming massive industrial projects, with individual turbines now exceeding 15 MW capacity. Wind is more evenly distributed across the day than solar, but it is intermittent and unpredictable — a calm week can slash output across an entire region.
        </p>
        <p>
          <strong>Hydropower</strong> dominates in the Nordic countries (Norway, Sweden), the Alps (Austria, Switzerland), and Iberia (Portugal, Spain). Hydro is uniquely valuable because it is dispatchable — operators can release water and generate power on demand, effectively acting as a giant battery. Norway&apos;s hydro reservoirs function as Europe&apos;s de facto energy storage system, absorbing surplus wind from Denmark and releasing power when the continent needs it.
        </p>

        <h3 style={S.h3}>3.2 Biomethane: The Invisible Green Fuel</h3>
        <p>
          While solar and wind dominate headlines, biomethane is quietly becoming one of Europe&apos;s most strategically important renewable fuels — and it is the one most people have never heard of.
        </p>

        <Def term="Biomethane">
          Methane gas produced from biological sources — typically through anaerobic digestion of agricultural waste, food waste, sewage, or energy crops — that has been upgraded to natural gas quality (95%+ methane). Once upgraded, it is chemically identical to fossil natural gas and can be injected directly into the existing gas grid.
        </Def>

        <p>
          This is biomethane&apos;s superpower: unlike solar or wind electricity, it does not require new infrastructure. It uses the existing gas pipelines, the existing gas boilers, the existing gas-powered industrial processes. For sectors that cannot easily electrify — heavy industry, chemical production, high-temperature manufacturing, heavy-duty transport — biomethane offers a path to decarbonization without rebuilding everything from scratch.
        </p>
        <p>
          Europe currently produces around 4.2 billion cubic metres (bcm) of biomethane per year, primarily in Germany, France, Denmark, and Italy. The European Commission&apos;s REPowerEU plan targets 35 bcm by 2030 — a nearly tenfold increase. That would replace roughly 20% of Russian gas imports at their 2021 peak.
        </p>
        <p>
          The production process involves collecting organic waste — manure from farms, food scraps from restaurants, wastewater sludge — and feeding it into anaerobic digesters. Bacteria break down the organic matter in the absence of oxygen, producing biogas (roughly 60% methane, 40% CO2). This raw biogas is then &ldquo;upgraded&rdquo; by removing the CO2, hydrogen sulfide, and moisture, yielding pipeline-quality biomethane.
        </p>

        <Analogy>
          <p style={{ margin: 0 }}>Biomethane is to natural gas what recycled aluminum is to mined aluminum — chemically identical to the original product, but made from waste rather than extracted from the earth. And just like recycled aluminum, it plugs straight into the existing supply chain without anyone downstream knowing the difference.</p>
        </Analogy>

        <h3 style={S.h3}>3.3 Hydrogen: The Promise and the Reality</h3>
        <p>
          Hydrogen is the most debated energy carrier in Europe. The color-coding system tells you how it was made: <strong>grey hydrogen</strong> (from fossil gas, most common today), <strong>blue hydrogen</strong> (from fossil gas with carbon capture), and <strong>green hydrogen</strong> (from electrolysis powered by renewable electricity). The EU is betting heavily on green hydrogen for sectors like steel, ammonia production, and long-duration energy storage — but today, it remains expensive and infrastructure-scarce. Most analysts see it as a 2030+ story rather than a near-term solution.
        </p>

        <h3 style={S.h3}>3.4 Power Purchase Agreements: How Companies Buy Green Directly</h3>
        <p>
          A Power Purchase Agreement (PPA) is a long-term contract (typically 10–20 years) where a company agrees to buy electricity directly from a specific renewable energy project at a fixed or formula-based price. PPAs serve two purposes: they give the renewable developer revenue certainty to finance construction, and they give the corporate buyer price stability and verifiable green credentials.
        </p>
        <p>
          Europe is the world&apos;s second-largest corporate PPA market after the US. Companies like Amazon, Google, BASF, and Mercedes-Benz have signed PPAs for gigawatts of European wind and solar. The PPA market has grown rapidly because it offers a hedge against volatile wholesale prices while also satisfying sustainability reporting requirements.
        </p>

        <Skill title="You now understand Europe&apos;s renewable energy stack">
          Solar and wind provide cheap but intermittent electricity. Hydro provides flexible backup. Biomethane decarbonizes the gas grid without new infrastructure. Green hydrogen is a long-term bet. And PPAs let companies lock in green power prices for a decade or more. These are the building blocks of the transition.
        </Skill>

        {/* ── 4. TRACEABILITY ── */}
        <h2 style={S.h2}>4. Traceability: How Do You Prove Energy Is &ldquo;Green&rdquo;?</h2>

        <p>
          Here is a question that sounds simple but is profoundly difficult: if you are a company claiming to run on 100% renewable energy, how do you actually prove it?
        </p>
        <p>
          The answer is not as straightforward as you might think. Once electricity enters the grid, it mixes with power from every source — coal, gas, nuclear, solar, wind. Electrons do not carry labels. You cannot trace a specific electron from a specific wind turbine to a specific factory. Physically, this is impossible.
        </p>

        <h3 style={S.h3}>4.1 Guarantees of Origin: The Certificate System</h3>
        <p>
          Europe solved this problem with a financial instrument called a Guarantee of Origin (GO). For every megawatt-hour (MWh) of renewable electricity produced, the generator receives one electronic certificate — a GO — issued by a national authority and tracked through a registry managed by the Association of Issuing Bodies (AIB).
        </p>
        <p>
          GOs are issued, traded on markets, and then &ldquo;cancelled&rdquo; (retired) by the final consumer. Once cancelled, the certificate cannot be used again. This creates a one-to-one chain of custody: one MWh of renewable production → one GO issued → one GO cancelled by a consumer → one MWh of &ldquo;green&rdquo; electricity claimed.
        </p>

        <Def term="Guarantee of Origin (GO)">
          An electronic certificate proving that 1 MWh of electricity was generated from a specified renewable source. Established under the EU Renewable Energy Directive (2018/2001/EC). GOs contain metadata: energy source, plant location, commissioning date, production date. Valid for 12 months. Traded across borders via the AIB Hub.
        </Def>

        <p>
          Crucially, <strong>GOs can be traded separately from the physical electricity.</strong> A Norwegian hydropower plant can sell its GOs to a German factory, even though the physical electrons never travel from Norway to Germany. The factory&apos;s actual electricity comes from the local grid (which may include coal and gas), but by cancelling Norwegian GOs, it can legally claim that amount of its consumption as &ldquo;renewable.&rdquo;
        </p>
        <p>
          This is both the system&apos;s strength and its most criticized weakness. Critics call it &ldquo;greenwashing by certificate&rdquo; — buying cheap hydro GOs from a decades-old Norwegian plant that would have operated regardless. Proponents argue that GOs create revenue for renewable generators, increase transparency, and are the only scalable way to track energy origins across an interconnected continent.
        </p>

        <h3 style={S.h3}>4.2 The Price Collapse and What Comes Next</h3>
        <p>
          GO prices have been on a wild ride. In 2022–2023, during the energy crisis, they traded as high as €10/MWh as companies scrambled to prove green credentials. By late 2024, they collapsed to below €1/MWh — crushed by an oversupply of renewable certificates as wind, solar, and restarted French nuclear flooded the market with GOs.
        </p>
        <p>
          But a massive demand driver is approaching. The Corporate Sustainability Reporting Directive (CSRD), rolling out across 2025–2026, will require approximately 50,000 EU companies to report on the origin of the energy they consume — using GOs as the verification mechanism. This is a tenfold increase from the previous reporting regime. Many analysts expect GO demand to surge dramatically as these companies enter the market.
        </p>

        <h3 style={S.h3}>4.3 Gas Certificates: THG-Quoten and Beyond</h3>
        <p>
          The certificate concept extends beyond electricity. In Germany, the Treibhausgasminderungsquote (THG-Quote, or greenhouse gas reduction quota) requires fuel distributors to reduce the carbon intensity of the fuels they sell by a set percentage each year. If they cannot meet the target with their own operations, they must buy certificates from providers of renewable fuels — including biomethane, used cooking oil biodiesel (HVO), and even from electric vehicle owners who can monetize the &ldquo;green fuel&rdquo; they effectively consume.
        </p>
        <p>
          This creates a secondary market for environmental commodities: THG-Quoten certificates, Herkunftsnachweise für Biomethan (biomethane certificates of origin), and HBE certificates (Herkunftsbeweis für erneuerbare Energien). These are typically traded over-the-counter through specialized intermediaries — exactly the kind of market where OTC brokers and environmental commodity firms operate.
        </p>

        <Skill title="You now understand energy traceability">
          Electrons are not traceable once they enter the grid — so Europe uses certificate systems (GOs for electricity, THG-Quoten for fuels) to create a paper trail. These certificates are financial instruments that are issued, traded, and retired. They are the backbone of every corporate &ldquo;100% renewable&rdquo; claim.
        </Skill>

        {/* ── 5. TRADING ── */}
        <h2 style={S.h2}>5. How Energy Commodities Are Traded</h2>

        <p>
          Energy is not just a physical commodity — it is one of the deepest, most liquid, and most complex financial markets in the world. European energy trading spans multiple exchanges, over-the-counter markets, and a dizzying array of instruments. Let&apos;s break it down.
        </p>

        <h3 style={S.h3}>5.1 Exchange-Traded Markets</h3>
        <p>
          The major European energy exchanges are:
        </p>

        <div style={{ overflowX: "auto", margin: "24px 0" }}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Venue</th>
                <th style={S.th}>Type</th>
                <th style={S.th}>Key Products</th>
                <th style={S.th}>Settlement</th>
              </tr>
            </thead>
            <tbody>
              {venues.map((row, i) => (
                <tr key={i}>
                  <td style={{ ...S.td, fontWeight: 500, color: "var(--navy, #0f0f23)" }}>{row.venue}</td>
                  <td style={{ ...S.td, fontFamily: "var(--mono)", fontSize: "0.85rem", color: "var(--gold, #b8860b)" }}>{row.type}</td>
                  <td style={{ ...S.td, color: "var(--text-secondary, #6B6B82)", fontSize: "0.88rem" }}>{row.products}</td>
                  <td style={{ ...S.td, fontSize: "0.85rem" }}>{row.settlement}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p>
          The European Energy Exchange (EEX), based in Leipzig and owned by Deutsche Börse, is the continent&apos;s dominant exchange. In 2024, it traded 12,372 TWh of power — enough to supply the entire EU several times over. It also hosts the primary auctions for EU Emission Trading System (ETS) allowances on behalf of EU member states.
        </p>

        <h3 style={S.h3}>5.2 Spot, Futures, and Forwards</h3>
        <p>
          These are the three fundamental ways energy commodities are traded. Understanding them is essential for anyone in energy markets:
        </p>
        <div style={{ margin: "16px 0 16px 20px" }}>
          <p><strong>Spot (immediate delivery):</strong> Buying energy for delivery today or tomorrow. The day-ahead auction at EPEX SPOT is the biggest spot market. Prices reflect current supply and demand conditions — a cold snap or wind drought shows up immediately in spot prices.</p>
          <p><strong>Futures (standardized, exchange-traded):</strong> A contract to buy or sell a commodity at a fixed price for delivery at a future date. Futures are traded on exchanges (EEX, ICE), are standardized (fixed quantities, fixed delivery periods), and are <em>cleared</em> by a central counterparty (like ECC or ICE Clear), which eliminates counterparty risk. Participants post margin (a deposit) to cover potential losses. Power futures trade for weeks, months, quarters, and years ahead — up to 6 years into the future on EEX.</p>
          <p><strong>Forwards (OTC, bilateral):</strong> Similar to futures but negotiated privately between two parties. Forwards are customizable — you can specify any quantity, delivery period, or pricing formula. They are not exchange-cleared, which means they carry counterparty risk (the risk that the other party cannot pay). To manage this risk, participants use legal frameworks like ISDA Master Agreements (for financial derivatives) or EFET Master Agreements (for physical energy).</p>
        </div>

        <Def term="TTF (Title Transfer Facility)">
          The Dutch gas trading hub that serves as Europe&apos;s benchmark for natural gas pricing — the &ldquo;Brent of gas.&rdquo; TTF futures on ICE Endex are the most liquid gas contracts in Europe. When media report &ldquo;European gas prices,&rdquo; they almost always mean the TTF month-ahead contract. However, TTF is not the only gas trading hub in Europe. Each major market has its own: Germany trades at THE (Trading Hub Europe), Spain at PVB (Punto Virtual de Balance), Italy at PSV (Punto di Scambio Virtuale), and France at PEG (Point d\u2019Échange de Gaz). These national hubs generally track TTF but can diverge significantly during local supply stress, pipeline constraints, or regulatory shifts. However, TTF is not the only gas trading hub in Europe. Each major market has its own: Germany trades at THE (Trading Hub Europe), Spain at PVB (Punto Virtual de Balance), Italy at PSV (Punto di Scambio Virtuale), and France at PEG (Point d\u2019Échange de Gaz). These national hubs generally track TTF but can diverge significantly during local supply stress, pipeline constraints, or regulatory shifts.
        </Def>

        <h3 style={S.h3}>5.3 Over-the-Counter (OTC): The Hidden Market</h3>
        <p>
          While exchanges handle standardized products, the OTC market handles everything that doesn&apos;t fit neatly into a standard contract. This includes:
        </p>
        <div style={{ margin: "16px 0 16px 20px" }}>
          <p><strong>Bespoke energy contracts</strong> — a utility buying 50 MW of Spanish solar for Q3 2027 at a specific price profile that matches their industrial customer&apos;s consumption pattern.</p>
          <p><strong>Environmental commodities</strong> — Guarantees of Origin, THG-Quoten, biomethane certificates, Sustainable Aviation Fuel (SAF) credits, Carbon Emission Allowances traded bilaterally.</p>
          <p><strong>Structured products</strong> — options (the right but not the obligation to buy/sell at a given price), collars (a combined cap and floor on price), or spark spread trades (the relationship between gas and power prices).</p>
        </div>
        <p>
          OTC trades are facilitated by brokers — firms like Tradition, ICAP (now TP ICAP), GFI, and Spectron, as well as specialized environmental commodity intermediaries. These brokers connect buyers and sellers, negotiate terms, and execute trades — often still by voice over the phone, though electronic platforms are growing. The legal backbone is the ISDA Master Agreement (for financial trades) or the EFET Master Agreement (for physical energy delivery).
        </p>

        <Analogy>
          <p style={{ margin: 0 }}>If exchanges are like Amazon — standardized products, fixed prices, guaranteed delivery — then OTC markets are like a bespoke tailor. You get exactly what you need, but you negotiate the terms yourself, and you need to trust the other party (or use a legal framework to protect yourself).</p>
        </Analogy>

        <h3 style={S.h3}>5.4 The EU ETS: Trading the Right to Pollute</h3>
        <p>
          The EU Emissions Trading System is the world&apos;s largest carbon market. It works through a cap-and-trade mechanism: the EU sets a cap on total emissions, issues a fixed number of EU Allowances (EUAs) — each representing 1 tonne of CO2 — and companies must surrender enough allowances to cover their annual emissions. If they emit less, they can sell their surplus. If they emit more, they must buy.
        </p>
        <p>
          The cap is reduced by 4.3% per year (rising to 4.4% from 2028), creating engineered scarcity. The current price of a EUA is around €60–70/tonne. The system covers approximately 43% of the EU&apos;s total emissions across 11,000 industrial installations and, since 2024, maritime shipping.
        </p>
        <p>
          EUAs are traded on EEX (spot and futures) and ICE (futures). They can also be traded OTC. In 2024, EEX&apos;s emissions markets recorded 1.39 billion tonnes of CO2 traded — an 8% increase year-on-year. A new ETS2, covering buildings and road transport, is expected to launch in 2027.
        </p>

        <Skill title="You now understand energy trading">
          Energy is traded across spot (immediate), futures (standardized, exchange-cleared), and forward/OTC (bilateral, customizable) markets. The major venues are EEX, ICE, and EPEX SPOT. Environmental commodities like GOs, EUAs, and THG-Quoten add a regulatory trading layer. OTC brokers handle bespoke and non-standard products.
        </Skill>

        {/* ── 6. REGULATION ── */}
        <h2 style={S.h2}>6. The Regulations That Force the Transition</h2>

        <p>
          Europe does not leave the energy transition to the market alone. A dense web of EU directives and national laws compels companies, utilities, fuel distributors, and even homeowners to shift away from fossil fuels — whether they want to or not. Understanding these regulations is essential because they create markets, destroy margins, and redirect billions in capital flows.
        </p>

        <h3 style={S.h3}>6.1 The Renewable Energy Directive (RED III)</h3>
        <p>
          The latest revision of the Renewable Energy Directive sets a binding EU target of 42.5% renewable energy in gross final energy consumption by 2030, with a commitment to aim for 45%. It introduces strict sustainability criteria for biofuels and biomethane, mandates that member states accelerate permitting for renewable projects, and sets sub-targets for sectors like transport and industry.
        </p>

        <h3 style={S.h3}>6.2 The EU ETS and Carbon Border Adjustment</h3>
        <p>
          Beyond the ETS itself, the Carbon Border Adjustment Mechanism (CBAM) — phasing in from 2026 — will impose a carbon tariff on imports of carbon-intensive goods (steel, cement, aluminum, fertilizers, electricity) from countries without equivalent carbon pricing. This is designed to prevent &ldquo;carbon leakage&rdquo; — where EU companies move production abroad to avoid carbon costs — and to level the playing field.
        </p>

        <h3 style={S.h3}>6.3 Germany&apos;s THG-Quote and BImSchG</h3>
        <p>
          Under the Federal Immission Control Act (BImSchG), German fuel distributors must reduce the greenhouse gas intensity of the fuels they sell. The reduction target rises annually — reaching 25% by 2030. If distributors cannot meet it through their own operations, they must purchase THG-Quoten certificates from providers of renewable fuels. This creates immediate, regulation-driven demand for biomethane, hydrotreated vegetable oil (HVO), and other advanced biofuels.
        </p>
        <p>
          The German Building Energy Act (GEG, Gebäudeenergiegesetz) goes further: new heating systems installed from 2024 onward must use at least 65% renewable energy. In practice, this pushes homeowners toward heat pumps, biomethane-ready gas boilers, or district heating connected to renewable sources. The law has been politically explosive — but it creates structural demand for renewable heating fuels and electrification equipment.
        </p>

        <h3 style={S.h3}>6.4 CSRD: The Reporting Tsunami</h3>
        <p>
          The Corporate Sustainability Reporting Directive is transforming energy procurement across Europe. Starting in 2025–2026, approximately 50,000 companies — up from 11,700 previously — must report on the origin of the energy they consume, their Scope 1, 2, and 3 emissions, and their decarbonization strategy. Energy origin must be documented with Guarantees of Origin. This is not optional. Non-compliance carries financial penalties.
        </p>

        <h3 style={S.h3}>6.5 The Russian Gas Ban</h3>
        <p>
          On January 26, 2026, EU member states formally adopted a regulation phasing out all imports of Russian pipeline gas and LNG. The regulation entered into force on February 3, and the stepwise ban begins today — March 18, 2026. Existing contracts have transition periods, but the full LNG ban takes effect by end of 2026 and pipeline gas by autumn 2027. All member states must submit national diversification plans.
        </p>

        <div style={S.callout}>
          <div style={S.calloutLabel}>Why This Matters</div>

        <div style={S.callout}>
          <div style={S.calloutLabel}>Important Distinction</div>
          <strong>THE (Trading Hub Europe)</strong> is Germany{`'`}s gas trading hub — the German equivalent of TTF.
          When this article discusses {`"`}European gas prices,{`"`} it refers to TTF, the continental benchmark.
          But for German-specific gas supply, storage, and industrial pricing, THE is the relevant reference point.
          German gas storage levels, the Russian pipeline gas ban{`'`}s impact on Germany, and industrial gas costs
          are most directly reflected in THE prices — which can trade at a premium or discount to TTF depending on
          pipeline flows, storage levels, and cross-border capacity constraints.
        </div>

        <div style={S.callout}>
          <div style={S.calloutLabel}>Important Distinction</div>
          <strong>THE (Trading Hub Europe)</strong> is Germany{`'`}s gas trading hub — the German equivalent of TTF.
          When this article discusses {`"`}European gas prices,{`"`} it refers to TTF, the continental benchmark.
          But for German-specific gas supply, storage, and industrial pricing, THE is the relevant reference point.
          German gas storage levels, the Russian pipeline gas ban{`'`}s impact on Germany, and industrial gas costs
          are most directly reflected in THE prices — which can trade at a premium or discount to TTF depending on
          pipeline flows, storage levels, and cross-border capacity constraints.
        </div>
          Each of these regulations creates a market. The EU ETS creates the carbon market. The THG-Quote creates the renewable fuels certificate market. CSRD creates demand for GOs. The Russian gas ban creates demand for LNG, biomethane, and pipeline alternatives. Understanding regulation is understanding where the money flows.
        </div>

        {/* ── 7. THE IRAN SHOCK ── */}
        <h2 style={S.h2}>7. The Iran Shock: Europe&apos;s Second Energy Crisis</h2>

        <p>
          The US-Israeli strikes on Iran beginning February 28, 2026, triggered the largest supply disruption in the history of the global oil market. Here is the timeline:
        </p>

        <div style={{ margin: "16px 0 16px 20px" }}>
          <p><strong>Feb 28:</strong> Strikes begin. Iran closes the Strait of Hormuz. Brent crude surges from ~$70 to $82 per barrel within hours.</p>
          <p><strong>Mar 1:</strong> OPEC+ announces emergency output increase to calm markets.</p>
          <p><strong>Mar 2:</strong> Iranian drones attack QatarEnergy LNG facilities. QatarEnergy halts all gas production — removing ~20% of global LNG supply overnight. Dutch TTF gas prices double.</p>
          <p><strong>Mar 3–9:</strong> Brent crude climbs to $120/bbl. Diesel exceeds €2/litre in Germany, France, Italy, and the Netherlands. Spain sees the largest fuel price increase in Europe (+27%).</p>
          <p><strong>Mar 12:</strong> IEA agrees to release a record 400 million barrels from strategic reserves. Brent retreats to ~$100/bbl. TTF gas pulls back from a 3-year high of €63.77/MWh to under €50.</p>
          <p><strong>Mar 16–18:</strong> EU energy, environment, and general affairs ministers convene. The Russian gas ban&apos;s stepwise prohibition begins. EU leaders debate emergency measures including gas price caps, electricity tax cuts, and ETS suspension.</p>
        </div>

        <LiveChart symbol="BZ=F" label="Brent Crude Oil ($/bbl)" range="6mo" height={280} />

        <p>
          The EU paid an additional €2.5 billion for fossil fuel imports in just the first 10 days of the conflict. For context, EU governments spent €651 billion between September 2021 and June 2023 to shield citizens and businesses from the previous energy crisis. The prospect of another round of subsidies weighs heavily on already-strained public finances.
        </p>

        <h3 style={S.h3}>7.1 Why This Time Is (Partly) Different</h3>
        <p>
          Analysts are cautiously arguing that a 2022-scale inflation shock can be avoided. Several factors are different this time:
        </p>
        <div style={{ margin: "16px 0 16px 20px" }}>
          <p><strong>Greater supply diversification:</strong> Europe has weaned itself off Russian gas dependency, diversifying to US LNG, Norwegian pipeline gas, and North African supply.</p>
          <p><strong>More renewables:</strong> Additional wind and solar capacity installed since 2022 has saved the EU an estimated €59 billion in fossil fuel imports for power generation over the last 5 years. Countries like Spain, with high solar penetration, are significantly less exposed to gas price spikes.</p>
          <p><strong>Different macro conditions:</strong> In 2022, the energy shock hit an economy already overheated from post-COVID demand. Today, European growth is sluggish and labor markets are less tight — reducing the risk of an inflationary spiral.</p>
        </div>
        <p>
          But critical vulnerabilities remain. Gas storage is dangerously low (46 bcm vs. 77 bcm in early 2024). The Russian gas ban removes another supply source just as Qatar&apos;s LNG is offline. And if the Strait of Hormuz remains disrupted, even diversified supply chains face stress.
        </p>

        <h3 style={S.h3}>7.2 Winners and Losers Across Europe</h3>
        <p>
          The crisis exposes a widening gap between European countries that have invested heavily in renewables and those that remain gas-dependent:
        </p>
        <div style={{ margin: "16px 0 16px 20px" }}>
          <p><strong>Shielded:</strong> Spain and Portugal (high solar, decoupled from gas pricing in 85% of hours), the Nordics (hydro + wind dominance), France (nuclear baseload provides ~70% of electricity).</p>
          <p><strong>Exposed:</strong> Italy (gas sets the electricity price in 89% of hours), Germany (still transitioning from coal and nuclear phase-out), Belgium and the Netherlands (gas-heavy power fleets, high industrial demand).</p>
        </div>

        {/* ── 8. COMMODITY MARKETS ── */}
        <h2 style={S.h2}>8. What This Means for Commodity Markets</h2>

        <p>
          The Iran shock ripples across every commodity class. Here is how the major energy commodities are reacting:
        </p>

        <h3 style={S.h3}>8.1 Oil</h3>
        <p>
          Brent crude hit $120 before the IEA&apos;s record reserve release brought it back to ~$100. The EIA has raised its 2026 WTI average forecast by $20/bbl. Analysts warn that if the Strait of Hormuz disruption persists, $200 oil is not impossible — a scenario that would trigger global recession fears. OPEC+ has moved to increase output, but the market remains nervous about the loss of Iranian supply and the physical bottleneck at Hormuz.
        </p>

        <LiveChart symbol="CL=F" label="WTI Crude Oil ($/bbl)" range="3mo" height={280} />

        <h3 style={S.h3}>8.2 Natural Gas</h3>
        <p>
          The TTF benchmark — Europe&apos;s gas price — surged 57% since the conflict began, hitting a 3-year high of €63.77/MWh. The simultaneous loss of Qatari LNG and the beginning of the Russian gas ban creates a dual supply squeeze. Storage refill for winter 2026/27 — which typically begins in spring — could be significantly more expensive, with knock-on effects for industrial gas consumers and power prices across the continent.
        </p>

        <h3 style={S.h3}>8.3 Carbon (EU ETS)</h3>
        <p>
          The EU ETS carbon price is under political attack. Italy has called for a suspension. Industry lobbying groups argue that carbon costs compound the energy price burden on manufacturers already facing electricity costs 2–2.5x higher than US competitors. But weakening the ETS would destroy the investment certainty that has driven €billions into clean energy infrastructure. The European Commission faces a difficult balancing act in the upcoming ETS review (Q3 2026).
        </p>

        <h3 style={S.h3}>8.4 The Doom Loop: Energy → Inflation → Rates → Currency</h3>
        <p>
          Higher energy prices feed directly into consumer price inflation. Elevated inflation forces the ECB to hold or even raise interest rates — just as the eurozone economy needs rate cuts to support growth. Higher rates strengthen the case for a weaker euro against the dollar, but since Europe imports most of its energy in dollars, a weaker euro makes energy imports even more expensive — creating a self-reinforcing doom loop. This is the cross-market connection that S2D exists to explain.
        </p>

        {/* ── 9. DAILY BUSINESS ── */}
        <h2 style={S.h2}>9. How All of This Affects Daily Business</h2>

        <p>
          The energy system described in this article is not an abstraction. It shapes the costs, risks, and strategic decisions of every European business:
        </p>

        <div style={{ margin: "16px 0 16px 20px" }}>
          <p><strong>A German steel manufacturer</strong> pays for electricity at prices set by the merit order (Section 2.2), must surrender EU ETS allowances for its carbon emissions (Section 5.4), is now required to report energy origins under CSRD (Section 6.4), and faces import competition from Chinese steel that does not carry equivalent carbon costs — until CBAM kicks in (Section 6.2).</p>
          <p><strong>A Spanish logistics company</strong> faces diesel prices driven by the Iran war (Section 7), must comply with EU biofuel mandates by blending renewable fuels (Section 6.1), and can offset fuel emissions by purchasing THG-Quoten certificates (Section 4.3).</p>
          <p><strong>A Danish wind farm developer</strong> sells electricity on EPEX SPOT (Section 2.3), issues Guarantees of Origin for each MWh produced (Section 4.1), and may sign a PPA with a corporate buyer for long-term revenue (Section 3.4).</p>
          <p><strong>An Italian restaurant chain</strong> uses biomethane for cooking and heating (Section 3.2), procured through a gas supplier who buys biomethane certificates to prove the renewable origin (Section 4.3), and must now report this in its CSRD sustainability statement (Section 6.4).</p>
        </div>

        <p>
          Since February 2024, 101 European chemical production facilities have shut down, leading to 75,000 job losses and the disappearance of 25 million tonnes of production capacity. With EU industrial electricity prices now double those in the United States, the competitiveness gap is not theoretical — it is existential for energy-intensive industries.
        </p>

        {/* ── 10. INVESTMENT IMPLICATIONS ── */}
        <h2 style={S.h2}>10. Investment Implications &amp; Outlook</h2>

        <p>
          For investors, the European energy transition is simultaneously a risk and an opportunity of generational scale. Here is what to watch:
        </p>

        <div style={{ margin: "20px 0 20px 20px" }}>
          <p><strong>TTF gas futures (ICE Endex)</strong> — the single most important indicator of European energy stress. Sustained prices above €50/MWh signal ongoing crisis conditions and pressure on industrial margins.</p>
          <p><strong>EU ETS carbon price (EEX)</strong> — if it collapses due to political intervention, it signals a retreat from climate ambition and could trigger a sell-off in clean energy stocks. If it holds, the investment case for decarbonization remains intact.</p>
          <p><strong>European utility stocks</strong> — companies with high renewable portfolios (Ørsted, Iberdrola, EDP, Enel) are structurally shielded from gas price volatility. Gas-heavy utilities face ongoing margin pressure.</p>
          <p><strong>Grid infrastructure and battery storage</strong> — the IMF estimates the 2022 energy shock reduced euro area potential GDP by 0.8%. The policy response is accelerating grid modernization and storage deployment. Companies in this space benefit directly.</p>
          <p><strong>Environmental commodity markets</strong> — GO demand is set to surge (CSRD), THG-Quoten and biomethane certificates are growing, and EUA trading volumes continue to expand. These markets are opaque, illiquid, and offer outsized returns for specialists.</p>
          <p><strong>Iran ceasefire probability</strong> — the single biggest near-term catalyst. A ceasefire would cause oil and gas prices to fall sharply, relieving inflationary pressure and allowing the ECB to resume rate cuts — bullish for European equities and EUR/USD.</p>
        </div>

        <div style={S.callout}>
          <div style={S.calloutLabel}>The Structural Case</div>
          Europe either accelerates its energy transition — investing in renewables, grids, storage, and electrification — or it faces recurring crises every time a geopolitical shock disrupts fossil fuel supply chains. The additional wind and solar installed since 2022 has already saved €59 billion in fossil fuel imports. Every megawatt of renewable capacity deployed is a megawatt of geopolitical risk eliminated.
        </div>

        <p>
          The crisis is real. The costs are enormous. But for patient investors who understand the system — from the grid to the trading floor, from GOs to the ETS — Europe&apos;s energy transition is one of the most compelling structural investment themes of the decade.
        </p>

        {/* ── SIGN-OFF ── */}
        <div style={{ textAlign: "center", margin: "48px 0 0" }}>
          <p style={{ fontWeight: 500, color: "var(--navy, #0f0f23)" }}>Sami Samii</p>
          <p style={{ fontFamily: "var(--mono)", fontSize: "0.68rem", letterSpacing: "0.15em", color: "var(--gold, #b8860b)" }}>S2D CAPITAL INSIGHTS</p>
          <p style={{ color: "var(--text-muted, #9C9CAF)", fontSize: "0.85rem" }}>March 2026</p>
        </div>

        {/* ── Disclaimer ── */}
        <div style={S.disclaimer}>
          <strong>Disclaimer:</strong> This document is for informational purposes only and does not constitute financial, legal, or investment advice. Energy markets involve significant risks, including price volatility driven by geopolitical events, weather, and regulatory changes. All cited forecasts originate from third-party institutions and may not materialize. Investors should conduct their own due diligence and consult qualified financial advisors before making investment decisions.
          <br /><br />
          <strong>Sources:</strong> IEA Electricity 2026 Report, European Commission REPowerEU, Ember Energy, E3G, Bruegel, Euronews, CNBC, European Council, ECB Economic Bulletin (2026), IMF Working Paper 2026/003, EEX Group, ICE Endex, EPEX SPOT, Association of Issuing Bodies (AIB), European Energy Exchange, Eurostat, IRU, Clean Energy Wire, Charles Schwab Global Insights, Wikipedia (Economic impact of the 2026 Iran war).
        </div>
      </div>
    </article></>
  );
}
