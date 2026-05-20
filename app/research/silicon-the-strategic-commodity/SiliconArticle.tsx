"use client";
import BackButton from "@/components/BackButton";

import ArticleProgress from "@/components/ArticleProgress";
import RelatedArticles from "@/components/RelatedArticles";
import Term from "@/components/Term";
import ThesisTracker from "@/components/ThesisTracker";
import ChartReveal from "@/components/ChartReveal";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import React from "react";

const TVChart = dynamic(() => import("@/components/TVChart"), {
  ssr: false,
  loading: () => (
    <div style={{ height: 300, border: "1px solid var(--border, rgba(255,255,255,0.1))", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", margin: "28px 0", color: "var(--text-muted, rgba(255,255,255,0.35))", fontFamily: "var(--mono)", fontSize: "0.72rem" }}>
      Loading chart...
    </div>
  ),
});

/* ── Styles (matching EnergyArticle.tsx) ── */
const S = {
  article: { maxWidth: 780, margin: "0 auto", padding: "0 24px 80px", fontFamily: "var(--sans, 'Outfit', sans-serif)", color: "var(--text-body, rgba(255,255,255,0.75))", lineHeight: 1.85, fontSize: "1.02rem" } as React.CSSProperties,
  hero: { textAlign: "center" as const, padding: "72px 24px 48px", background: "linear-gradient(180deg, var(--gold-tint, rgba(184,134,11,0.08)) 0%, var(--bg-primary, #fff) 100%)", borderBottom: "1px solid var(--border, rgba(255,255,255,0.1))" } as React.CSSProperties,
  eyebrow: { fontFamily: "var(--mono, 'JetBrains Mono', monospace)", fontSize: "0.62rem", letterSpacing: "0.3em", textTransform: "uppercase" as const, color: "var(--gold, #b8860b)", marginBottom: 18 } as React.CSSProperties,
  h1: { fontFamily: "var(--serif, 'Playfair Display', serif)", fontSize: "clamp(2rem, 4.5vw, 3rem)", fontWeight: 400, lineHeight: 1.15, color: "#ffffff", marginBottom: 18, maxWidth: 720, marginLeft: "auto", marginRight: "auto" } as React.CSSProperties,
  subtitle: { fontSize: "1.05rem", color: "var(--text-secondary, rgba(255,255,255,0.5))", maxWidth: 620, margin: "0 auto 24px", lineHeight: 1.7, fontWeight: 300 } as React.CSSProperties,
  meta: { fontFamily: "var(--mono, 'JetBrains Mono', monospace)", fontSize: "0.62rem", letterSpacing: "0.12em", color: "var(--text-muted, rgba(255,255,255,0.35))", display: "flex" as const, justifyContent: "center" as const, gap: 20, flexWrap: "wrap" as const } as React.CSSProperties,
  h2: { fontFamily: "var(--serif, 'Playfair Display', serif)", fontSize: "1.6rem", fontWeight: 400, color: "#ffffff", marginTop: 40, marginBottom: 16, lineHeight: 1.25 } as React.CSSProperties,
  h3: { fontFamily: "var(--serif, 'Playfair Display', serif)", fontSize: "1.2rem", fontWeight: 500, color: "#ffffff", marginTop: 28, marginBottom: 12, lineHeight: 1.3 } as React.CSSProperties,
  callout: { background: "var(--gold-tint, rgba(184,134,11,0.08))", borderLeft: "3px solid var(--gold, #b8860b)", padding: "20px 24px", margin: "28px 0", borderRadius: "0 6px 6px 0", fontSize: "0.95rem", lineHeight: 1.8 } as React.CSSProperties,
  calloutLabel: { fontFamily: "var(--mono, 'JetBrains Mono', monospace)", fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "var(--gold, #b8860b)", marginBottom: 8, fontWeight: 600 } as React.CSSProperties,
  defBox: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "20px 24px", margin: "24px 0" } as React.CSSProperties,
  defLabel: { fontFamily: "var(--mono, 'JetBrains Mono', monospace)", fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "var(--gold, #b8860b)", marginBottom: 6, fontWeight: 600 } as React.CSSProperties,
  keyFigure: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", borderRadius: 8, padding: "24px 28px", margin: "28px 0", display: "flex" as const, justifyContent: "space-between" as const, alignItems: "center" as const, flexWrap: "wrap" as const, gap: 16 } as React.CSSProperties,
  keyFigureNum: { fontFamily: "var(--serif, 'Playfair Display', serif)", fontSize: "2rem", fontWeight: 400, color: "var(--gold-light, #d4a843)" } as React.CSSProperties,
  keyFigureLabel: { fontFamily: "var(--mono, 'JetBrains Mono', monospace)", fontSize: "0.62rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" as const } as React.CSSProperties,
  table: { width: "100%", borderCollapse: "collapse" as const, margin: "24px 0", fontSize: "0.88rem", fontFamily: "var(--sans, 'Outfit', sans-serif)" } as React.CSSProperties,
  th: { fontFamily: "var(--mono, 'JetBrains Mono', monospace)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "var(--text-muted, rgba(255,255,255,0.35))", borderBottom: "2px solid var(--border, rgba(255,255,255,0.1))", padding: "10px 12px", textAlign: "left" as const, fontWeight: 600 } as React.CSSProperties,
  td: { padding: "12px 12px", borderBottom: "1px solid var(--border, rgba(255,255,255,0.1))", verticalAlign: "top" as const } as React.CSSProperties,
  disclaimer: { marginTop: 48, padding: "24px 0", borderTop: "1px solid var(--border, rgba(255,255,255,0.1))", fontSize: "0.72rem", color: "var(--text-muted, rgba(255,255,255,0.35))", lineHeight: 1.7 } as React.CSSProperties,
  analogy: { background: "rgba(139,94,60,0.08)", border: "1px dashed rgba(184,134,11,0.3)", borderRadius: 8, padding: "18px 22px", margin: "24px 0", fontSize: "0.95rem", lineHeight: 1.8 } as React.CSSProperties,
  analogyLabel: { fontFamily: "var(--mono, 'JetBrains Mono', monospace)", fontSize: "0.52rem", letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "#D4A843", marginBottom: 6, fontWeight: 600 } as React.CSSProperties,
  skillBox: { background: "rgba(184,134,11,0.06)", color: "#fff", borderRadius: 8, padding: "18px 22px", margin: "24px 0", fontSize: "0.9rem", lineHeight: 1.75, borderLeft: "3px solid var(--gold, #b8860b)" } as React.CSSProperties,
  skillLabel: { fontFamily: "var(--mono, 'JetBrains Mono', monospace)", fontSize: "0.52rem", letterSpacing: "0.2em", color: "var(--gold-light, #d4a843)", marginBottom: 6, fontWeight: 600 } as React.CSSProperties,
};

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

/* ── Definition Box ── */
function Def({ term, children }: { term: string; children: React.ReactNode }) {
  return <div style={S.defBox}><div style={S.defLabel}>Definition</div><p style={{ margin: 0 }}><strong style={{ color: "#ffffff" }}>{term}:</strong> {children}</p></div>;
}

/* ── Think of it like... Box ── */
function Analogy({ children }: { children: React.ReactNode }) {
  return <div style={S.analogy}><div style={S.analogyLabel}>Think of it like this</div>{children}</div>;
}

/* ── Skill Unlocked Box ── */
function Skill({ title, children }: { title: string; children: React.ReactNode }) {
  return <div style={S.skillBox}><div style={S.skillLabel}>Skill Unlocked</div><p style={{ margin: 0, color: "var(--gold-light, #d4a843)", fontWeight: 600, marginBottom: 6 }}>{title}</p><p style={{ margin: 0, color: "rgba(255,255,255,0.75)", fontSize: "0.88rem" }}>{children}</p></div>;
}

/* ── Supply chain table data ── */
const stack = [
  { layer: "Design (Fabless)", players: "NVIDIA, AMD, Apple, Qualcomm, Broadcom, MediaTek", role: "Architecture, IP, EDA-driven design. No factories.", chokepoint: "EDA tools (Synopsys, Cadence, Siemens)" },
  { layer: "EDA Tools", players: "Synopsys, Cadence, Siemens EDA", role: "Software that turns transistor logic into manufacturable layouts.", chokepoint: "US-controlled. Export-restricted to China since 2025." },
  { layer: "Lithography Equipment", players: "ASML (NL), Nikon, Canon, Applied Materials, LAM, KLA, Tokyo Electron", role: "Machines that print and etch features onto silicon.", chokepoint: "ASML is the sole supplier of EUV lithography. Single chokepoint." },
  { layer: "Foundry (Fabrication)", players: "TSMC, Samsung Foundry, Intel Foundry, SMIC, GlobalFoundries", role: "Operate fabs that turn wafers into chips for fabless customers.", chokepoint: "TSMC alone produces ~60% of all foundry revenue and >90% of leading-edge logic." },
  { layer: "IDM (Integrated)", players: "Intel, Samsung, Micron, SK Hynix, Texas Instruments", role: "Design and manufacture in-house. Mostly memory & legacy logic.", chokepoint: "Memory is a 3-player oligopoly: Samsung, SK Hynix, Micron." },
  { layer: "OSAT", players: "ASE Technology, Amkor, JCET, SPIL", role: "Outsourced assembly, test, and advanced packaging.", chokepoint: "Advanced packaging (CoWoS) capacity is the current bottleneck for AI chips." },
  { layer: "Materials & Chemicals", players: "Shin-Etsu, SUMCO (wafers), JSR, TOK (photoresist), Linde, Air Liquide (gases)", role: "300mm silicon wafers, photoresist, ultrapure gases, sputter targets.", chokepoint: "Japan supplies ~90% of high-end photoresist." },
];

export default function SiliconArticle() {
  return (<><BackButton label="Continue Reading" href="/research" />
    <ArticleProgress sections={[
      { id: "sec-1", title: "Executive Summary", number: "1" },
      { id: "sec-2", title: "Genesis: How a Chip Works", number: "2" },
      { id: "sec-3", title: "The Stack: Design, Fab, Tools, OSAT", number: "3" },
      { id: "sec-4", title: "The Global Supply Chain", number: "4" },
      { id: "sec-5", title: "Trade & Geopolitics", number: "5" },
      { id: "sec-6", title: "The Money: AI Capex Cycle", number: "6" },
      { id: "sec-7", title: "Why It Is All Interconnected", number: "7" },
      { id: "sec-8", title: "Future I: AI & Data Center Compute", number: "8" },
      { id: "sec-9", title: "Future II: Chips in Space", number: "9" },
      { id: "sec-10", title: "Investment Implications & Risks", number: "10" },
    ]} />
    <article>
      {/* ═══ HERO ═══ */}
      <motion.div style={S.hero} {...fadeUp}>
        <div style={S.eyebrow}>Investor Briefing · May 2026</div>
        <h1 style={S.h1}>
          Silicon: The World&apos;s Most <em style={{ fontStyle: "italic", color: "var(--gold, #b8860b)" }}>Strategic Commodity</em>
        </h1>
        <p style={S.subtitle}>
          How semiconductors became the new oil, from the transistor to TSMC, from export controls to orbital data centers. A complete guide for investors and the curious.
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
        <ThesisTracker
          publishDate="May 13, 2026"
          metrics={[
            { label: "NVIDIA", publishValue: "$135", symbol: "NVDA", format: "price" },
            { label: "TSMC", publishValue: "$200", symbol: "TSM", format: "price" },
            { label: "ASML", publishValue: "$780", symbol: "ASML", format: "price" },
            { label: "Semis ETF (SMH)", publishValue: "$265", symbol: "SMH", format: "price" },
          ]}
        />

        {/* Key figures */}
        <motion.div style={S.keyFigure} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
          <div><div style={S.keyFigureNum}>~60%</div><div style={S.keyFigureLabel}>Global Foundry Revenue – TSMC</div></div>
          <div><div style={S.keyFigureNum}>$380M</div><div style={S.keyFigureLabel}>Price of a Single High-NA EUV Tool</div></div>
          <div><div style={S.keyFigureNum}>~25</div><div style={S.keyFigureLabel}>Countries Touched by One Smartphone SoC</div></div>
          <div><div style={S.keyFigureNum}>$1T+</div><div style={S.keyFigureLabel}>Cumulative AI Data Center Capex 2024-2027E</div></div>
        </motion.div>

        {/* ── 1. EXECUTIVE SUMMARY ── */}
        <h2 id="sec-1" style={S.h2}>1. Executive Summary</h2>

        <p>
          For most of the 20th century, the commodity that defined geopolitical power was oil. Wars were fought over it. Currencies were pegged to it. Empires rose and fell with its price. In 2026, that role has been taken by something far smaller and far stranger: patterns of atoms etched onto thin discs of silicon.
        </p>
        <p>
          A modern smartphone contains chips with transistors smaller than a single virus particle. A high-end <Term definition="Graphics Processing Unit, originally designed for rendering 3D graphics, now the dominant compute architecture for training and running large AI models because of its massive parallel processing capability." href="https://en.wikipedia.org/wiki/Graphics_processing_unit">GPU</Term> trained on the latest manufacturing process packs more than 200 billion transistors into a piece of silicon roughly the size of a postage stamp. The single machine that makes those features possible, ASML&apos;s High-NA EUV lithography scanner, costs roughly $380 million, weighs over 200 tonnes, and requires three Boeing 747 freighters and 40 trucks to ship.
        </p>
        <p>
          One country, Taiwan, manufactures more than 90% of the world&apos;s leading-edge logic chips. One company, ASML, holds a global monopoly on the lithography tools required to make them. One company, NVIDIA, designs more than 80% of the GPUs being installed in AI data centers. Three companies, Samsung, SK Hynix, and Micron, produce essentially all of the high-bandwidth memory stacked next to those GPUs. Every single one of these chokepoints sits inside a tightening US–China geopolitical contest.
        </p>
        <p>
          This article is a complete tour of that landscape: how a chip is actually made, how the industry is organized, why the supply chain crosses ~25 countries before a single phone is sold, how US export controls and the CHIPS Act are redrawing the map, and where the trillion-dollar AI capex cycle leads, including the most underappreciated frontier of all: silicon in orbit. By the time you finish, you will understand semiconductors better than most people who own the stocks.
        </p>

        {/* ── 2. GENESIS: HOW A CHIP WORKS ── */}
        <h2 id="sec-2" style={S.h2}>2. Genesis: How a Chip Actually Works</h2>

        <p>
          Before you can think clearly about TSMC, NVIDIA, or export controls, you need a working mental model of what a chip <em>is</em>. The good news: the core idea is genuinely simple. The complexity comes from doing it 200 billion times on a piece of silicon the size of a fingernail.
        </p>

        <h3 style={S.h3}>2.1 The Transistor: A Switch the Size of a Virus</h3>
        <p>
          A modern processor is, at its heart, an enormous collection of microscopic switches called <Term definition="A semiconductor device that acts as a switch or amplifier. In digital logic, it turns the flow of electrons on (representing a 1) or off (representing a 0). Modern chips contain tens to hundreds of billions of them on a single die." href="https://en.wikipedia.org/wiki/Transistor">transistors</Term>. Each transistor has three terminals: a source, a drain, and a gate. Apply a voltage to the gate, and current flows from source to drain: the switch is &ldquo;on&rdquo; (a binary 1). Remove the voltage, no current flows: &ldquo;off&rdquo; (a 0). String billions of these switches together with copper wires and you can implement any logical operation: addition, multiplication, branching, memory.
        </p>

        <Def term="Semiconductor">
          A material whose electrical conductivity sits between that of a conductor (like copper) and an insulator (like glass). Pure silicon is a semiconductor. By deliberately adding impurities, a process called doping, engineers can control exactly where and how current flows. This controllability is what makes a transistor possible.
        </Def>

        <Analogy>
          <p style={{ margin: 0 }}>Think of a transistor like a faucet. The gate voltage is the handle. Turn the handle on, and electrons (water) flow from source to drain. Turn it off, and the flow stops. A modern CPU is a city of 100 billion faucets, each turning on and off billions of times per second, choreographed precisely enough to play 8K video, run a neural network, and route a packet halfway around the world, all at the same time.</p>
        </Analogy>

        <h3 style={S.h3}>2.2 From Sand to Wafer</h3>
        <p>
          Silicon itself starts as ordinary sand, silicon dioxide. It is purified to 99.9999999% silicon (&ldquo;nine nines&rdquo;), melted, and pulled into a single cylindrical crystal (an &ldquo;ingot&rdquo;) using the Czochralski process. That ingot is sliced into wafers, thin discs typically 300 millimetres in diameter, that are polished to a mirror finish flat to within a few atoms across their surface. These wafers are the canvas on which every chip is painted.
        </p>
        <p>
          The wafer industry itself is a chokepoint most investors never see. Two Japanese companies, Shin-Etsu Chemical and SUMCO, supply more than half of the world&apos;s 300mm wafers. A shortage of polished wafers in 2021 contributed to the auto industry chip crisis as severely as the foundry shortage did.
        </p>

        <h3 style={S.h3}>2.3 Lithography: Painting With Light</h3>
        <p>
          Once you have a polished wafer, the magic begins. Lithography is the process of projecting a circuit pattern onto the wafer, coating it in chemicals that respond to that pattern, and etching the resulting design into the silicon. This is repeated dozens of times, modern chips require 80 to 100+ separate lithography layers, each precisely aligned to the previous one.
        </p>

        <Def term="EUV (Extreme Ultraviolet Lithography)">
          A lithography technology that uses light with a wavelength of 13.5 nanometres, about 14 times shorter than visible light, to print the smallest features on modern chips. The light is generated by vaporizing tin droplets with high-powered lasers 50,000 times per second. EUV machines are made only by ASML in the Netherlands. The newer High-NA EUV systems achieve features below 2nm and cost roughly $380M per machine.
        </Def>

        <p>
          The shorter the wavelength of light, the smaller the features you can print. For decades, the industry used deep ultraviolet (DUV) light at 193nm wavelengths. To go smaller, ASML had to invent something extraordinary: extreme ultraviolet light at 13.5nm. The process to generate it is borderline absurd. Inside the EUV machine, a tin droplet 30 microns wide is shot into a vacuum chamber. A 25-kilowatt CO2 laser hits it twice (once to flatten it, once to vaporize it into plasma), and that plasma emits the EUV light. This happens 50,000 times per second. The light then bounces off a series of mirrors so flat that, if scaled up to the size of Germany, the tallest bump would be a fraction of a millimetre.
        </p>

        <Analogy>
          <p style={{ margin: 0 }}>If a sheet of paper represented the flatness of an EUV mirror, scaled to the surface of the Earth, the deepest valley on the entire planet would be about as deep as a coat of paint. There is no other manufactured surface in the world this precise.</p>
        </Analogy>

        <h3 style={S.h3}>2.4 What &ldquo;3 Nanometres&rdquo; Actually Means (And Does Not)</h3>
        <p>
          When TSMC, Samsung, or Intel announce a new &ldquo;3nm&rdquo; or &ldquo;2nm&rdquo; process, it is tempting to believe those numbers describe a physical dimension on the chip. They no longer do. Around the 22nm node, &ldquo;nanometre&rdquo; became a marketing label rather than a measurement. A modern 3nm transistor&apos;s actual smallest feature is closer to 20nm. The number now describes a generation, a performance and density tier, not a length.
        </p>
        <p>
          The reason the industry kept the naming convention is competitive. Moving from one node to the next typically delivers ~15% performance, ~30% power, or ~70% area improvement. Every node is harder, slower, and more expensive than the last. A modern leading-edge fab costs $20–30 billion to build, requires roughly 7,000 specialist engineers to operate, and consumes more electricity than a small city.
        </p>

        <Skill title="You now understand what a chip is">
          A chip is a forest of transistors, switches the size of viruses, patterned onto a polished silicon wafer by light. The industry moves forward by shrinking those transistors using ever-shorter wavelengths of light, the most extreme of which can only be produced by one machine on Earth: ASML&apos;s EUV scanner.
        </Skill>

        {/* ── 3. THE STACK ── */}
        <h2 id="sec-3" style={S.h2}>3. The Stack: Design, Fab, Tools, OSAT</h2>

        <p>
          Unlike oil, where a single major company explores, extracts, refines, and distributes, the semiconductor industry is brutally specialized. Every chip you have ever used is the product of a global division of labour so deep that no single country, and no single company, can replicate it. Understanding this stack is the key to understanding everything that follows.
        </p>

        <div style={{ overflowX: "auto", margin: "24px 0" }}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Layer</th>
                <th style={S.th}>Key Players</th>
                <th style={S.th}>Role</th>
                <th style={S.th}>Chokepoint</th>
              </tr>
            </thead>
            <tbody>
              {stack.map((row, i) => (
                <tr key={i}>
                  <td style={{ ...S.td, fontWeight: 500, color: "#ffffff" }}>{row.layer}</td>
                  <td style={{ ...S.td, color: "var(--gold, #b8860b)", fontSize: "0.85rem" }}>{row.players}</td>
                  <td style={{ ...S.td, color: "var(--text-secondary, rgba(255,255,255,0.5))", fontSize: "0.88rem" }}>{row.role}</td>
                  <td style={{ ...S.td, fontSize: "0.85rem" }}>{row.chokepoint}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 style={S.h3}>3.1 Fabless: The Designers</h3>
        <p>
          Fabless companies design chips but own no factories. NVIDIA, AMD, Apple, Qualcomm, Broadcom, and MediaTek are the giants of this layer. They employ thousands of engineers, license intellectual property (IP) from firms like Arm, and use electronic design automation (EDA) software from Synopsys and Cadence to translate transistor-level logic into a set of geometric patterns (the &ldquo;mask set&rdquo;) that a foundry can manufacture.
        </p>
        <p>
          The fabless model exploded after TSMC pioneered the pure-play foundry in 1987. Suddenly, a startup with great architecture and no capital for a factory could compete with vertically integrated giants like Intel. Today, fabless companies capture some of the highest margins in the entire technology stack. NVIDIA&apos;s gross margins have run above 70% during peak AI demand, because their cost base is essentially intellectual.
        </p>

        <h3 style={S.h3}>3.2 Foundries: The Manufacturers</h3>
        <p>
          A foundry takes a customer&apos;s mask set and turns it into wafers full of chips. TSMC is the dominant force, manufacturing roughly 60% of all foundry revenue globally and the overwhelming majority of leading-edge logic. Samsung Foundry, Intel Foundry, SMIC (China), and GlobalFoundries fill out the rest. Of those, only TSMC, Samsung, and Intel are currently capable of producing leading-edge nodes (3nm and below).
        </p>

        <Def term="Pure-play foundry">
          A semiconductor manufacturer that produces chips exclusively for fabless customers, with no competing in-house design business. TSMC&apos;s commitment to never competing with its own customers is widely credited with its dominance. Customers know that giving TSMC their most sensitive designs will not result in an internal product line copying them.
        </Def>

        <h3 style={S.h3}>3.3 IDMs: The Vertically Integrated</h3>
        <p>
          <Term definition="Integrated Device Manufacturer, a company that both designs and manufactures its own chips in its own fabs, in contrast to the fabless/foundry split. Intel was the archetype for decades. The economics of the IDM model have deteriorated as fab costs have exploded and the design winners (NVIDIA, Apple, Qualcomm) chose to remain fabless and let TSMC carry the capex burden." href="https://en.wikipedia.org/wiki/Integrated_device_manufacturer">Integrated Device Manufacturers</Term> (IDMs) design and manufacture their own chips. Intel is the iconic Western IDM. Samsung is an IDM in both logic and memory. Micron and SK Hynix are IDMs focused on memory. For most of computing history, IDMs ruled, until the fabless/foundry model began stripping them apart. Intel&apos;s ongoing struggle to compete with TSMC is the most consequential corporate story of the past decade.
        </p>

        <h3 style={S.h3}>3.4 OSAT and Advanced Packaging</h3>
        <p>
          Once chips are manufactured on a wafer, they need to be cut apart (&ldquo;diced&rdquo;), tested, and packaged into the form that gets soldered onto a circuit board. This work is done by OSAT companies (Outsourced Semiconductor Assembly and Test). The largest are ASE Technology (Taiwan), Amkor (US), JCET (China), and SPIL (now part of ASE).
        </p>
        <p>
          For years, packaging was an afterthought. In 2026, it is one of the most important chokepoints in the entire industry. The reason is something called <Term definition="Chip-on-Wafer-on-Substrate: TSMC's flagship advanced packaging technology that lets multiple chiplets (e.g., a GPU and several stacks of high-bandwidth memory) sit side by side on a silicon interposer, connected by tens of thousands of microscopic wires. CoWoS is the single biggest capacity constraint for AI GPUs in 2025-2026." href="https://www.tsmc.com/english/dedicatedFoundry/services/cowos">CoWoS</Term> (Chip-on-Wafer-on-Substrate). Advanced AI chips like NVIDIA&apos;s Blackwell are no longer single dies. They are multiple chiplets (GPU compute, stacks of <Term definition="High-Bandwidth Memory: DRAM dies stacked vertically and connected by through-silicon vias (TSVs), then placed directly next to a processor on an advanced package. HBM3E delivers more than 1.2 TB/s of bandwidth per stack, roughly 10× standard DDR5. It is essential for AI training because the GPU is fed data far faster than ordinary memory could ever supply." href="https://en.wikipedia.org/wiki/High_Bandwidth_Memory">HBM</Term>, I/O) assembled together on a silicon interposer. CoWoS capacity, not foundry capacity, has been the binding constraint for NVIDIA throughout 2024–2025.
        </p>

        <Skill title="You now understand industry structure">
          The chip industry is a sequence of specialized layers: designers (fabless), tool makers (ASML et al.), foundries (TSMC), IDMs (Intel, Samsung), and packagers (OSAT). Each layer has its own oligopoly. Each oligopoly has its own chokepoint. The whole stack only works because no part of it works alone.
        </Skill>

        {/* ── 4. THE GLOBAL SUPPLY CHAIN ── */}
        <h2 id="sec-4" style={S.h2}>4. The Global Supply Chain</h2>

        <p>
          The semiconductor supply chain is the most geographically concentrated, most interdependent system in the global economy. There is no industry (not oil, not aerospace, not pharmaceuticals) that depends on so few places for so much. Here is how it actually lays out across the map.
        </p>

        <h3 style={S.h3}>4.1 Taiwan: The Beating Heart</h3>
        <p>
          Taiwan is the world&apos;s indispensable nation for advanced logic. TSMC alone accounts for more than 90% of leading-edge logic manufacturing. Its fab clusters in Hsinchu, Tainan, and Taichung produce the silicon that powers every iPhone, every NVIDIA AI GPU, every AMD server CPU, and most of the rest of the modern compute economy. A serious disruption to Taiwan (military, seismic, or grid-based) would not be a recession event. It would be a global depression event.
        </p>
        <p>
          Taiwanese officials have referred to this concentration as a &ldquo;silicon shield&rdquo;, the idea that the world cannot afford to let Taiwan be attacked. Strategists in Beijing and Washington increasingly view it the opposite way: as a vulnerability that must be dispersed.
        </p>

        <h3 style={S.h3}>4.2 South Korea: The Memory Empire</h3>
        <p>
          South Korea&apos;s Samsung and SK Hynix dominate the memory market. <Term definition="Dynamic Random Access Memory, the fast, volatile working memory of every computer and phone. Each bit is stored as a charge on a tiny capacitor that must be refreshed thousands of times per second. The DRAM industry is one of the most cyclical in technology and is now a three-player oligopoly (Samsung, SK Hynix, Micron)." href="https://en.wikipedia.org/wiki/Dynamic_random-access_memory">DRAM</Term> (used as a computer&apos;s main working memory) and NAND (used for storage) are essentially a two-country oligopoly: South Korea and the United States (Micron, in Idaho). HBM, the stacked DRAM that sits beside every AI GPU, is currently led by SK Hynix, which became NVIDIA&apos;s preferred HBM3E supplier and one of the most important companies in the entire AI stack.
        </p>

        <h3 style={S.h3}>4.3 Japan: The Hidden Materials Power</h3>
        <p>
          Japan does not dominate any single high-profile layer of the stack, but it dominates many of the materials layers underneath it. Roughly 90% of high-end photoresist (the light-sensitive chemical used in lithography) is Japanese. Shin-Etsu and SUMCO together supply more than half of the world&apos;s 300mm wafers. Tokyo Electron is one of the four big equipment makers globally. When Japan restricted exports of three chemicals to South Korea in 2019, it caused a temporary panic that demonstrated how thin the materials margin really is.
        </p>

        <h3 style={S.h3}>4.4 The Netherlands: The ASML Singleton</h3>
        <p>
          Veldhoven, a small Dutch town near Eindhoven, hosts the headquarters and primary manufacturing campus of ASML, the only company in the world capable of producing EUV lithography systems. There is no second source. There is no plausible second source on a horizon of less than a decade. Without ASML, the leading edge of semiconductor progress does not exist. The Dutch government, under heavy US pressure, now controls who is allowed to buy ASML&apos;s most advanced machines.
        </p>

        <h3 style={S.h3}>4.5 The United States: Design, IP, and the CHIPS Revival</h3>
        <p>
          The US no longer manufactures the majority of leading-edge chips, but it dominates the layers with the highest margins: chip design (NVIDIA, AMD, Apple, Qualcomm, Broadcom), EDA software (Synopsys, Cadence, Siemens), processor IP (parts of Arm, RISC-V foundations), and some critical equipment (Applied Materials, LAM Research, KLA). The CHIPS and Science Act of 2022, with roughly $39 billion in direct manufacturing subsidies, is now funding new fabs from Intel in Arizona and Ohio, TSMC in Arizona, Samsung in Texas, and Micron in New York. These will not break Taiwan&apos;s leading-edge dominance this decade, but they begin the slow process of rebuilding domestic capacity.
        </p>

        <ChartReveal><TVChart symbol="INTC" title="INTC · Intel Corp" type="area" range="2y" height={280} /></ChartReveal>

        <h3 style={S.h3}>4.6 China: The Other Pole</h3>
        <p>
          China is the world&apos;s largest consumer of semiconductors and, simultaneously, the country furthest behind in producing the most advanced ones. SMIC, China&apos;s leading foundry, is operating roughly two to three nodes behind TSMC. Huawei&apos;s 2023 Mate 60 phone, which contained a 7nm-class chip from SMIC, was treated by US policymakers as evidence that export controls were not working as intended. The subsequent tightening of controls in 2023, 2024, and 2025 has been steadily aimed at preventing China from acquiring EUV and the most advanced DUV tools needed to push further.
        </p>

        <div style={S.callout}>
          <div style={S.calloutLabel}>The Brutal Geography</div>
          Roughly 75% of all advanced chips are manufactured within a 150-kilometre arc that includes Taiwan, South Korea, and parts of Japan, one of the most seismically active and geopolitically tense regions on Earth. There is no comparable concentration of critical infrastructure anywhere else in the global economy.
        </div>

        {/* ── 5. TRADE & GEOPOLITICS ── */}
        <h2 id="sec-5" style={S.h2}>5. Trade &amp; Geopolitics: The Silicon Cold War</h2>

        <p>
          Until 2018, semiconductors were largely treated as a commercial sector. Since then, every major economy has reclassified them as a strategic asset on the level of weapons systems. The result has been the fastest reordering of an industrial supply chain in modern history, and one of the most important investment themes of the decade.
        </p>

        <h3 style={S.h3}>5.1 The CHIPS Act and the Subsidy Race</h3>
        <p>
          The CHIPS and Science Act of August 2022 authorized roughly $52 billion in US funding to revive domestic semiconductor manufacturing, of which about $39 billion is direct manufacturing subsidy. The EU followed with its own Chips Act (€43 billion). Japan, South Korea, China, India, and Singapore have all introduced their own programs. The cumulative announced public subsidy globally now exceeds $300 billion, the largest peacetime industrial policy push since the post-war reconstruction of Europe and Japan.
        </p>

        <h3 style={S.h3}>5.2 Export Controls: The Sharper Weapon</h3>
        <p>
          The October 7, 2022 export controls, expanded in October 2023 and December 2024, are arguably the most important economic action of the decade. The US Commerce Department&apos;s Bureau of Industry and Security (BIS) effectively cut off China&apos;s access to:
        </p>
        <div style={{ margin: "16px 0 16px 20px" }}>
          <p><strong>EUV lithography tools:</strong> already restricted since 2019 under Dutch licensing.</p>
          <p><strong>Advanced DUV immersion tools:</strong> restricted in 2023, capturing the equipment China would need to push SMIC beyond 7nm.</p>
          <p><strong>AI-class GPUs:</strong> H100, H200, B100/B200, and even the China-specific H20 (further restricted in April 2025).</p>
          <p><strong>Advanced HBM:</strong> restrictions added in December 2024 covering HBM3 and HBM3E shipments to China.</p>
          <p><strong>US-person services:</strong> US citizens and green card holders are restricted from supporting Chinese advanced chip development without licenses.</p>
        </div>
        <p>
          Crucially, the rules are extraterritorial: any foreign-produced chip that contains US-origin technology can be subject to US export controls. This is why ASML, a Dutch company, must seek Dutch government licenses (which are coordinated with Washington) to ship High-NA EUV machines.
        </p>

        <Def term="FDPR (Foreign Direct Product Rule)">
          A US export control mechanism that extends US jurisdiction over any foreign product made using US technology, including software, design tools, and equipment. Used most famously to cut off Huawei from TSMC-fabricated chips in 2020, and to control advanced chip exports to China today. FDPR is what gives US export controls global reach.
        </Def>

        <h3 style={S.h3}>5.3 China&apos;s Response</h3>
        <p>
          Beijing&apos;s response has been a multi-decade industrial policy push, including the Big Fund (now totalling more than $100 billion across three tranches), aggressive subsidies to SMIC, YMTC, CXMT, and Huawei&apos;s HiSilicon. The strategic emphasis has shifted toward two areas: (a) catching up on legacy and mature nodes, where China is now adding capacity at a pace that may flood the global market with cheap 28nm and 14nm wafers, pressuring incumbents like GlobalFoundries and UMC; and (b) building a parallel, domestically controllable supply chain in everything from EDA to lithography. A genuine indigenous EUV competitor is still many years away, but DUV-based workarounds are improving.
        </p>

        <h3 style={S.h3}>5.4 Taiwan: The Tail Risk That Anchors Everything</h3>
        <p>
          There is no analysis of semiconductors in 2026 that can responsibly ignore Taiwan. Most credible analysts assign a low-but-not-negligible probability to a military scenario before 2030. The economic case for global participation in defending Taiwan (or at minimum deterring an action against it) rests almost entirely on TSMC. The CHIPS Act, Japan&apos;s Rapidus subsidies, the EU Chips Act, and the steady diversification of advanced packaging into Arizona, Japan, and Germany are all attempts to slowly reduce the asymmetric dependence on a single island.
        </p>

        <div style={S.callout}>
          <div style={S.calloutLabel}>Why This Matters For Investors</div>
          Every dollar of leading-edge semiconductor revenue is now subject to two layers of geopolitical filtering: who is allowed to buy it (export controls) and who is funding alternative supply (industrial policy). The companies that benefit most are those positioned as the supply chain disperses, but the ones with the highest absolute exposure to a Taiwan event remain the largest single-stock risks in the entire equity market.
        </div>

        {/* ── 6. THE MONEY ── */}
        <h2 id="sec-6" style={S.h2}>6. The Money: The AI Capex Cycle</h2>

        <p>
          For most of the last decade, the semiconductor industry traded on smartphone cycles, PC cycles, and the cyclicality of memory. Since the launch of ChatGPT in November 2022, all of that has been overshadowed by a single phenomenon: the AI capex super-cycle. Understanding the scale and structure of this spend is essential for understanding why NVIDIA briefly became the most valuable company on Earth in 2024, and why the bull case and bear case both rest on the same set of numbers.
        </p>

        <h3 style={S.h3}>6.1 Hyperscaler Capex</h3>
        <p>
          The four US hyperscalers (Microsoft, Alphabet, Meta, and Amazon) together guided to roughly $325 billion of capital expenditure in 2025, the majority of it directed at AI-related infrastructure: GPUs, custom AI accelerators (TPUs, Trainium, MTIA), networking, power, cooling, and buildings. That figure was approximately $230 billion in 2024 and is on track to exceed $400 billion in 2026 if current guidance holds. The cumulative four-year spend approaches a trillion dollars.
        </p>
        <p>
          Add in Oracle, CoreWeave, sovereign AI projects (UAE&apos;s G42, Saudi Arabia&apos;s HUMAIN, France&apos;s sovereign initiatives), and a second tier of large enterprises, and the global AI capex pipeline is genuinely without modern precedent, comparable in scale to the buildout of the Interstate Highway System or the early 2000s telecom fiber boom.
        </p>

        <ChartReveal><TVChart symbol="NVDA" title="NVDA · NVIDIA Corp" type="area" range="2y" height={280} /></ChartReveal>

        <h3 style={S.h3}>6.2 NVIDIA&apos;s Position and Its Mirror Risk</h3>
        <p>
          NVIDIA has captured an estimated 80–90% of the AI training GPU market and a slightly smaller but still dominant share of inference. Its data center revenue grew from roughly $15 billion in fiscal 2023 to more than $115 billion in fiscal 2025. Gross margins peaked above 75%. By any historical standard, this is one of the most extraordinary business inflections in corporate history.
        </p>
        <p>
          The mirror image of that growth is concentration risk. NVIDIA&apos;s top four customers, the hyperscalers, account for roughly half of its data center revenue. If any combination of them cuts capex sharply, the impact is immediate. The bull case is that AI demand keeps outpacing supply through at least 2027 and that NVIDIA&apos;s software moat (CUDA) prevents customers from migrating to in-house silicon at scale. The bear case is that custom silicon (Google&apos;s TPU v6/v7, Amazon&apos;s Trainium 2, Microsoft&apos;s Maia 100/200) quietly eats into the same workloads at meaningfully better unit economics.
        </p>

        <ChartReveal><TVChart symbol="TSM" title="TSM · Taiwan Semiconductor (TSMC ADR)" type="area" range="2y" height={280} /></ChartReveal>

        <h3 style={S.h3}>6.3 TSMC and ASML: The Picks-and-Shovels</h3>
        <p>
          Behind every AI GPU sold is a TSMC wafer. Behind every TSMC wafer is an ASML scanner. These two companies, together with the broader equipment ecosystem of Applied Materials, LAM Research, KLA, and Tokyo Electron, are the picks-and-shovels of the AI gold rush, and they capture economics that do not depend on any single fabless winner. Whether NVIDIA, AMD, or a Google in-house design ultimately wins the GPU war, TSMC manufactures most of them, and ASML supplies the lithography tools.
        </p>

        <ChartReveal><TVChart symbol="ASML" title="ASML · ASML Holding NV" type="area" range="2y" height={280} /></ChartReveal>

        <ChartReveal><TVChart symbol="AMAT" title="AMAT · Applied Materials" type="area" range="2y" height={280} /></ChartReveal>

        <h3 style={S.h3}>6.4 The Memory Tag-Along</h3>
        <p>
          Every NVIDIA GPU shipped sits next to multiple stacks of high-bandwidth memory. A single Blackwell B200 module uses up to 192 GB of HBM3E across eight stacks. The result has been the most dramatic transformation of the memory industry in 20 years: SK Hynix, Samsung, and Micron, historically commoditized cyclical names, are now strategic suppliers with multi-year visibility, sold-out capacity, and pricing power. Memory cyclicality has not been abolished, but the trough-to-peak amplitude of the cycle has narrowed materially.
        </p>

        <ChartReveal><TVChart symbol="MU" title="MU · Micron Technology" type="area" range="2y" height={280} /></ChartReveal>

        <Skill title="You now understand the AI capex cycle">
          The capex flow is: hyperscalers commit dollars → NVIDIA/AMD design GPUs → TSMC manufactures them → ASML supplies the lithography → SK Hynix, Samsung, Micron supply the memory → ASE, Amkor, TSMC&apos;s own CoWoS package them → hyperscalers install them. Every step is a chokepoint. Every chokepoint has a public stock.
        </Skill>

        {/* ── 7. WHY IT IS ALL INTERCONNECTED ── */}
        <h2 id="sec-7" style={S.h2}>7. Why It Is All Interconnected</h2>

        <p>
          Take any single semiconductor in your life (the application processor in your phone, the controller in your earbuds, the GPU in your laptop) and trace its supply chain. The result is almost comically global. Here is what a typical smartphone SoC actually looks like, from atoms to pocket.
        </p>

        <div style={{ margin: "16px 0 16px 20px" }}>
          <p><strong>Architecture:</strong> Licensed from Arm Holdings, headquartered in Cambridge, UK, majority-owned by Japan&apos;s SoftBank.</p>
          <p><strong>Design:</strong> Done in California (Apple, Qualcomm) or Hsinchu (MediaTek), using EDA software from US firms Synopsys and Cadence.</p>
          <p><strong>Photoresist and specialty chemicals:</strong> Mostly Japanese (JSR, TOK, Shin-Etsu).</p>
          <p><strong>Silicon wafers:</strong> Japanese (Shin-Etsu, SUMCO) or German (Siltronic).</p>
          <p><strong>Lithography:</strong> ASML scanners assembled in the Netherlands, using optics from Carl Zeiss SMT in Germany and light sources with technology from Cymer (California).</p>
          <p><strong>Other equipment:</strong> Applied Materials, LAM, KLA (US); Tokyo Electron (Japan); ASM International (Netherlands).</p>
          <p><strong>Manufacturing:</strong> Taiwan (TSMC), occasionally Korea (Samsung).</p>
          <p><strong>Packaging and test:</strong> Taiwan (ASE, TSMC CoWoS) or other parts of Asia.</p>
          <p><strong>Assembly into phone:</strong> Mostly China, increasingly India and Vietnam.</p>
          <p><strong>Logistics:</strong> Ocean shipping via Singapore, Suez, Long Beach, or Rotterdam; air freight via Memphis, Anchorage, or Hong Kong.</p>
        </div>

        <p>
          That is roughly 25 countries touched before a single phone is sold, and the count rises sharply if you include sub-suppliers (specialty gases, sputter targets, exotic dopants). There is no industrial process on the planet more globalised. The implication: a disruption in any one node (a fire at a Japanese chemical plant, an export control change in Washington, an earthquake in Taiwan, a Suez closure) propagates through the entire system within days.
        </p>

        <Analogy>
          <p style={{ margin: 0 }}>Oil moves through a relatively small number of giant pipelines and tankers. Silicon moves through a global lattice of tiny, specialized handoffs (chemicals here, masks there, wafers somewhere else), each one passing through an oligopoly of two or three suppliers. The oil supply chain is robust against small shocks and fragile against big ones. The silicon supply chain is the opposite: it absorbs big shocks (COVID, the Ukraine war) better than it absorbs small ones, because a single chemical shortage can idle billions of dollars of downstream capacity.</p>
        </Analogy>

        {/* ── 8. FUTURE I: AI & DATA CENTER ── */}
        <h2 id="sec-8" style={S.h2}>8. Future I: AI &amp; the Data Center Compute Cycle</h2>

        <p>
          To understand where chips are going, start with the constraint that increasingly dominates every conversation among hyperscaler CFOs: not GPU supply, but power. Training a frontier model in 2026 is no longer a chip problem. It is a substation problem.
        </p>

        <h3 style={S.h3}>8.1 NVIDIA&apos;s Roadmap: Blackwell, Rubin, and Beyond</h3>
        <p>
          NVIDIA&apos;s GPU roadmap moved to an annual cadence starting with the Hopper-Blackwell transition. Blackwell (B100/B200, GB200) ramped through 2024–2025. The Blackwell Ultra refresh hit volume in late 2025. Rubin, the next architecture, is scheduled for volume production through 2026 with shipments beginning to large customers by Q3, alongside the Vera CPU that complements it. Each generation roughly doubles training performance per dollar and per watt, but the absolute power draw per rack continues to climb. A Blackwell-class GB200 NVL72 rack consumes roughly 120 kW, several times more than legacy server racks.
        </p>

        <h3 style={S.h3}>8.2 Custom Silicon: The Hyperscaler Counterattack</h3>
        <p>
          Every major hyperscaler is now designing in-house AI silicon. Google&apos;s TPU has been in production for nearly a decade and now powers Gemini training and serving. Amazon&apos;s Trainium 2 reached mass production in 2025 with Trainium 3 sampling. Microsoft&apos;s Maia 100 entered production in 2024 with Maia 200 expected in 2026. Meta&apos;s MTIA chips are now used for ranking and recommendation. Apple is widely reported to be building its own AI server silicon for internal use.
        </p>
        <p>
          The economics are compelling. A hyperscaler that spends $30 billion a year on NVIDIA GPUs can justify spending $1–2 billion designing its own. Even capturing 20–30% of the workload at 50% of NVIDIA&apos;s margin saves multiple billions per year. None of this dethrones NVIDIA in the next two years, but it changes the long-run trajectory of where the value flows in AI silicon.
        </p>

        <h3 style={S.h3}>8.3 The Power Wall</h3>
        <p>
          The constraint that may matter most by 2027 is electricity. AI data centers are now expected to consume 8–12% of US electricity by 2028 (up from 4–5% in 2023). The new capacity is concentrated in regions whose grids were not built for it: Northern Virginia, Texas, Arizona, Ohio. Hyperscalers are signing power purchase agreements for nuclear (Three Mile Island restart for Microsoft, Vogtle for Amazon, SMR commitments from Google and Amazon), gas, and renewables, sometimes years ahead of their data centers being built. In some regions, the gating factor for AI buildout is no longer the chip. It is the substation.
        </p>

        <div style={S.callout}>
          <div style={S.calloutLabel}>The S2D Cross-Connection</div>
          The AI capex cycle is now directly visible in commodity, power, and FX markets. US natural gas demand for data center power has reshaped the Henry Hub forward curve. Uranium prices have re-rated. Copper demand projections for data center electrification have driven part of the structural copper bull case. And the dollars flowing from hyperscalers to TSMC and ASML have become a visible flow item in cross-border capital data. This is no longer just a chip story.
        </div>

        {/* ── 9. FUTURE II: CHIPS IN SPACE ── */}
        <h2 id="sec-9" style={S.h2}>9. Future II: Chips in Space</h2>

        <p>
          The most underappreciated frontier in semiconductors is not on the ground. It is in low Earth orbit. Three independent trends (radiation-hardened silicon, the collapsing cost of launch, and the power constraint on terrestrial AI) are now converging on a thesis that would have been treated as science fiction five years ago: <em>that some of the next decade&apos;s data centers will not be in Virginia or Texas, but in orbit.</em>
        </p>

        <h3 style={S.h3}>9.1 Why Chips In Space Are Different</h3>
        <p>
          The hostile environment of space (high-energy particles, total ionizing dose, single-event upsets, extreme thermal cycling) destroys ordinary chips. For decades, the &ldquo;rad-hard&rdquo; semiconductor industry has been a small, defense-led niche making specialized chips a generation or two behind commercial silicon. Companies like Microchip (formerly Atmel&apos;s rad-hard line), BAE Systems, Honeywell, Cobham (now part of Frontgrade), and Vorago Technologies have served military, intelligence, and deep-space customers.
        </p>
        <p>
          The new wave is different. Modern commercial constellations like Starlink ride on radiation-tolerant (not radiation-hardened) silicon, using software techniques (triple modular redundancy, error correction, scheduled reboots) to recover from upsets. This allows operators to use much closer-to-leading-edge chips, dramatically improving cost and capability. The same approach is now being applied to GPUs.
        </p>

        <Def term="Rad-Hard vs Rad-Tolerant">
          <strong>Rad-hard</strong> chips are physically engineered (special process nodes, hardened circuits) to withstand radiation directly. They are expensive, slow, and several generations behind. <strong>Rad-tolerant</strong> chips use mostly commercial silicon paired with redundancy and software resilience. They are faster, cheaper, and shorter-lived, but acceptable for many LEO missions. The economics of orbital compute live almost entirely on the rad-tolerant side.
        </Def>

        <h3 style={S.h3}>9.2 SpaceX: Starlink, Starshield, and Compute in Orbit</h3>
        <p>
          SpaceX is no longer just a launch company. It is, increasingly, the world&apos;s largest operator of orbital silicon. Starlink, with more than 6,000 active satellites in 2026 and approval to grow toward 12,000, runs custom payload silicon for inter-satellite laser links, beam-forming phased arrays, and modem stacks. Each satellite is, in effect, a small flying datacenter node.
        </p>
        <p>
          The Starshield program (the government-services variant of Starlink) is rumored to host considerably more sensitive payloads, including imaging, signals intelligence, and AI-accelerated edge processing. Reports of contracts with the US National Reconnaissance Office point to a constellation of hundreds of satellites with onboard compute for real-time imagery interpretation, exactly the workload modern AI inference excels at, and exactly the workload that until recently required downlinking data to ground stations.
        </p>
        <p>
          Combine all of this with the dramatic fall in launch costs. Starship, when operational at full cadence, could deliver mass to orbit at $100/kg or less, versus $1,500/kg for Falcon 9. The unit economics of putting compute in orbit shift from impossible to interesting.
        </p>

        <h3 style={S.h3}>9.3 NVIDIA in Orbit</h3>
        <p>
          NVIDIA itself has begun showing up in space hardware. Various Earth-observation operators (Planet, Capella, BlackSky), defense primes, and at least one startup focused on orbital inference have begun deploying versions of NVIDIA&apos;s Jetson edge platform, the same line used for autonomous vehicles and robots, into satellite payloads. The pitch: terabits of raw imagery generated in orbit, but only the small fraction that matters needs to be downlinked. The rest is processed on-orbit by a GPU.
        </p>
        <p>
          This is a meaningful inversion of the traditional satellite model. For 60 years, satellites were &ldquo;dumb&rdquo;: they captured signals and sent them home. Modern AI-capable satellites are the opposite: they capture far more than the downlink budget can carry, and use on-orbit inference to decide what is worth sending. This dramatically increases the value extracted per dollar of orbital capacity.
        </p>

        <h3 style={S.h3}>9.4 Google&apos;s Project Suncatcher: Orbital Data Centers</h3>
        <p>
          Among the &ldquo;moonshot&rdquo; programs at Google&apos;s parent Alphabet, one of the most striking is the early-stage research effort sometimes referred to as Project Suncatcher: a study of solar-powered data centers in low Earth orbit, networked by laser links, using TPUs (Google&apos;s in-house AI accelerator) as the compute substrate. The thesis is straightforward: in LEO, you can run TPUs on continuous solar power without the grid constraints, water constraints, or zoning constraints that bottleneck terrestrial buildouts. Cooling becomes a radiator problem rather than a chiller problem. Power is essentially unlimited.
        </p>
        <p>
          This remains, by all available evidence, a research program rather than a deployment plan. There are many unsolved problems (radiation, thermal management of dense compute, replacement and servicing, latency for non-AI workloads). But the conceptual leap matters. If even one hyperscaler commits to even a small-scale orbital test cluster within this decade, it changes the structural conversation about where compute is built.
        </p>

        <Analogy>
          <p style={{ margin: 0 }}>Think of orbital data centers the way energy strategists thought of offshore wind in the early 2000s: wildly expensive, technically heroic, politically complicated, and almost certainly the future of one part of the system. The bear case is &ldquo;ground-based will always be cheaper for most workloads.&rdquo; The bull case is &ldquo;most workloads, yes; but the marginal AI workload in 2030 might genuinely live above your head.&rdquo;</p>
        </Analogy>

        <h3 style={S.h3}>9.5 What Could Go Wrong</h3>
        <p>
          The orbital compute thesis has real failure modes. The Kessler syndrome (a cascading-debris scenario where collisions in LEO render certain orbits unusable) is no longer theoretical; the 2009 Iridium-Cosmos collision and growing on-orbit congestion are warning signs. International regulation of orbital spectrum, debris liability, and dual-use payloads is far behind the pace of deployment. And the fundamental question of <em>how you service or replace</em> compute in orbit remains open. Most importantly, the cooling problem at scale is genuinely hard: dumping the heat from a megawatt-class compute cluster into space requires radiators on the scale of football fields.
        </p>

        <div style={S.callout}>
          <div style={S.calloutLabel}>Why This Section Matters</div>
          Whether or not orbital data centers exist at scale by 2035, the demand drivers behind them (power, water, zoning, latency, security) are already reshaping where terrestrial chips and data centers are built. The companies that win in space will likely be the same names that win on the ground: NVIDIA, TSMC, ASML, the hyperscalers, and a handful of specialised orbital silicon and launch operators. Silicon&apos;s next decade is genuinely vertical.
        </div>

        {/* ── 10. INVESTMENT IMPLICATIONS ── */}
        <h2 id="sec-10" style={S.h2}>10. Investment Implications &amp; Risks</h2>

        <p>
          The semiconductor industry in 2026 offers the broadest opportunity set in the public equity markets, and at the same time the highest concentration of single-name geopolitical risk. Here is how to think about the landscape.
        </p>

        <h3 style={S.h3}>10.1 Picks and Shovels</h3>
        <p>
          ASML, TSMC, Applied Materials, LAM Research, KLA, and Tokyo Electron capture economics largely independent of which fabless winner emerges. They sell into every node, every architecture, every customer. They are the most direct expression of the structural thesis: more compute requires more wafers, more wafers require more equipment.
        </p>

        <h3 style={S.h3}>10.2 AI Beneficiaries</h3>
        <p>
          NVIDIA remains the dominant AI training name, though the second derivative (custom silicon penetration) is increasingly negative for its terminal margin assumptions. Broadcom has emerged as the leading designer of custom hyperscaler accelerators (Google TPU, Meta MTIA) and networking ASICs. AMD has captured a meaningful inference share with MI300/MI325/MI350. Marvell is a smaller but credible custom-silicon designer. SK Hynix, Samsung, and Micron are the leveraged plays on HBM demand.
        </p>

        <ChartReveal><TVChart symbol="AVGO" title="AVGO · Broadcom Inc" type="area" range="2y" height={280} /></ChartReveal>

        <ChartReveal><TVChart symbol="AMD" title="AMD · Advanced Micro Devices" type="area" range="2y" height={280} /></ChartReveal>

        <h3 style={S.h3}>10.3 Reshoring Beneficiaries</h3>
        <p>
          The build-out of TSMC Arizona, Intel Ohio, Samsung Texas, and TSMC Japan creates demand for a chain of US- and Japan-based suppliers: industrial gas providers (Linde, Air Products), construction primes (Bechtel, Fluor), specialty chemicals (Entegris, Versum/Merck Electronics), and US equipment names. The CHIPS Act subsidies are an unprecedented underwrite for this segment.
        </p>

        <h3 style={S.h3}>10.4 The Orbital Frontier</h3>
        <p>
          The pure-play orbital chip thesis is still mostly private (SpaceX is the dominant private name). Public expressions include defense primes with growing space portfolios (Lockheed Martin, Northrop Grumman, RTX, L3Harris), specialty satellite and ground-segment names (Iridium, Viasat, EchoStar, Rocket Lab), and the more speculative Earth-observation-with-AI names (Planet, BlackSky). NVIDIA&apos;s exposure here is real but small as a percentage of revenue.
        </p>

        <h3 style={S.h3}>10.5 The Tail Risks</h3>
        <div style={{ margin: "16px 0 16px 20px" }}>
          <p><strong>Taiwan event:</strong> A serious military, seismic, or grid-based disruption to Taiwan is the single largest non-monetary tail risk facing the global equity market. It is also, by far, the least hedgeable. Diversification into mainland-listed names is not a hedge; it is correlated downside.</p>
          <p><strong>Hyperscaler capex air-pocket:</strong> If even one of the big four meaningfully cuts capex (because of model commoditization, internal silicon ramps, or simply ROI patience), the entire AI semiconductor complex re-rates immediately. This is a higher-probability, lower-magnitude risk.</p>
          <p><strong>Export-control escalation:</strong> Each tightening of US controls cuts off a larger share of demand for affected names. The reverse (a Chinese retaliation on rare earths, gallium, germanium, or other critical inputs) could disrupt parts of the supply chain that are barely talked about.</p>
          <p><strong>Memory cycle reversion:</strong> HBM has structurally re-rated the memory cycle, but DRAM and NAND can still surprise to the downside if AI demand cools faster than commodity-memory supply.</p>
        </div>

        <div style={S.callout}>
          <div style={S.calloutLabel}>The Structural Case</div>
          Semiconductors are now what oil was for most of the 20th century: the indispensable input behind every other industrial process. Unlike oil, the global supply chain is concentrated in a few small countries and a handful of companies. The next decade will be defined by the slow, expensive, partially successful effort to disperse that concentration. The companies that sit at the dispersing chokepoints (ASML, TSMC, NVIDIA, Broadcom, SK Hynix) are the most important industrial businesses in the world.
        </div>

        <p>
          Silicon is not a sector. It is the substrate of every other sector. Every dollar of AI capex, every gram of EV battery management, every megawatt of grid intelligence, every payload in low Earth orbit: all run through it. Understanding the stack, the chokepoints, and the geopolitics is no longer optional for a serious investor. It is the foundation of understanding the modern economy.
        </p>

        {/* ── SIGN-OFF ── */}
        <div style={{ textAlign: "center", margin: "48px 0 0" }}>
          <p style={{ fontWeight: 500, color: "#ffffff" }}>Sami Samii</p>
          <p style={{ fontFamily: "var(--mono)", fontSize: "0.68rem", letterSpacing: "0.15em", color: "var(--gold, #b8860b)" }}>S2D CAPITAL INSIGHTS</p>
          <p style={{ color: "var(--text-muted, rgba(255,255,255,0.35))", fontSize: "0.85rem" }}>May 2026</p>
        </div>

        {/* ── Disclaimer ── */}
        <div style={S.disclaimer}>
          <strong>Disclaimer:</strong> This document is for informational purposes only and does not constitute financial, legal, or investment advice. Semiconductor markets involve significant risks including geopolitical disruption, cyclical demand, technology obsolescence, and concentrated single-country exposure. All cited forecasts originate from third-party institutions or company guidance and may not materialize. Investors should conduct their own due diligence and consult qualified financial advisors before making investment decisions.
          <br /><br />
          <strong>Sources:</strong> TSMC investor materials, ASML investor materials, NVIDIA quarterly filings, US Department of Commerce (BIS) export control rules (Oct 2022, Oct 2023, Dec 2024, Apr 2025), CHIPS and Science Act (2022), EU Chips Act, SEMI industry data, IEA Electricity 2026 Report, Reuters, Financial Times, Bloomberg, IEEE Spectrum, SemiAnalysis, Stratechery, Chris Miller (&ldquo;Chip War&rdquo;, 2022), publicly disclosed hyperscaler capex guidance (Microsoft, Alphabet, Meta, Amazon, Oracle), SpaceX and Starlink public disclosures, public reporting on Google &ldquo;Project Suncatcher&rdquo; orbital data center research, and S2D Capital Insights analysis.
        </div>
      </div>
    </article>
      <RelatedArticles currentSlug="silicon-the-strategic-commodity" tags={['geopolitics','commodities']} />
    </>
  );
}
