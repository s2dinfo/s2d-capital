// Config-driven interactive globe journeys. One config = one /journey/[slug] page.
// Stats and figures are sourced from the corresponding research articles.

export interface JourneyChapter {
  num: string;
  place: string;
  country: string;
  geoName: string | null; // Natural Earth country name for globe highlight
  stage: string;
  location: [number, number]; // [lat, lng]
  title: string;
  accent: string; // trailing part of title rendered in italic gold
  body: string;
  ticker: { label: string; symbol: string; currency: string };
  stat?: { v: string; l: string };
}

export interface JourneyChokepoint {
  label: string;
  location: [number, number];
  activeChapters: string[]; // chapter nums during which this lights up red
}

export interface JourneyConfig {
  slug: string;
  name: string; // "THE SILICON JOURNEY"
  pageTitle: string;
  description: string;
  publishDate: string; // ISO — thesis-tracker baseline date (article publish)
  articleSlug: string;
  chapters: JourneyChapter[];
  chokepoints: JourneyChokepoint[];
  orbitFinale?: boolean; // last chapter zooms out to space
}

const SILICON: JourneyConfig = {
  slug: 'silicon',
  name: 'THE SILICON JOURNEY',
  pageTitle: 'The Silicon Journey — Interactive Briefing | S2D Capital Insights',
  description:
    'Travel the semiconductor supply chain in eight chapters — from chip design in Santa Clara to EUV lithography in Veldhoven, fabrication in Taiwan, and data centers in orbit.',
  publishDate: '2026-05-13',
  articleSlug: 'silicon-the-strategic-commodity',
  orbitFinale: true,
  chokepoints: [
    { label: 'TAIWAN STRAIT', location: [24.4, 119.4], activeChapters: ['05'] },
    { label: 'STRAIT OF MALACCA', location: [1.8, 101.3], activeChapters: ['06'] },
  ],
  chapters: [
    {
      num: '01', place: 'SANTA CLARA', country: 'USA', geoName: 'United States of America', stage: 'DESIGN', location: [37.35, -121.95],
      title: 'Where Chips Are Imagined', accent: 'Imagined',
      body: 'NVIDIA and AMD design the most complex objects humans have ever made — processors with tens of billions of transistors — yet they manufacture nothing. The fabless model concentrated America’s edge in pure design and pushed everything physical across the Pacific. Every chapter that follows exists because of that trade.',
      ticker: { label: 'NVIDIA', symbol: 'NVDA', currency: '$' },
      stat: { v: '~25', l: 'COUNTRIES TOUCHED BY ONE SMARTPHONE SOC' },
    },
    {
      num: '02', place: 'VELDHOVEN', country: 'NETHERLANDS', geoName: 'Netherlands', stage: 'LITHOGRAPHY', location: [51.42, 5.4],
      title: 'The Machine That Prints Reality', accent: 'Prints Reality',
      body: 'One company in a Dutch town builds the only machines on Earth that can print the most advanced chips. Inside each EUV system a tin droplet is hit by a laser 50,000 times per second, making plasma glow at 13.5 nanometres. No EUV, no NVIDIA — this is the narrowest chokepoint in the entire supply chain.',
      ticker: { label: 'ASML', symbol: 'ASML', currency: '$' },
      stat: { v: '$380M', l: 'PRICE OF A SINGLE HIGH-NA EUV TOOL' },
    },
    {
      num: '03', place: 'TOKYO', country: 'JAPAN', geoName: 'Japan', stage: 'PHOTORESIST', location: [35.68, 139.69],
      title: 'The Invisible Chemistry', accent: 'Chemistry',
      body: 'Lithography is nothing without the light-sensitive chemicals it exposes. Japan dominates advanced photoresists and specialty materials — JSR, Tokyo Ohka, Shin-Etsu — a quiet oligopoly refined over decades. When a single resist plant has an accident, the ripple reaches every fab on the planet within weeks.',
      ticker: { label: 'SHIN-ETSU', symbol: '4063.T', currency: '¥' },
    },
    {
      num: '04', place: 'SEOUL', country: 'SOUTH KOREA', geoName: 'South Korea', stage: 'MEMORY', location: [37.56, 126.97],
      title: 'The Memory Duopoly', accent: 'Duopoly',
      body: 'AI accelerators are only as fast as the memory feeding them. Samsung and SK Hynix control the high-bandwidth memory that sits millimetres from every AI GPU — and HBM capacity has been effectively sold out since the boom began. Korea turned commodity DRAM into a strategic chokepoint of its own.',
      ticker: { label: 'SK HYNIX', symbol: '000660.KS', currency: '₩' },
    },
    {
      num: '05', place: 'HSINCHU', country: 'TAIWAN', geoName: 'Taiwan', stage: 'FABRICATION', location: [24.81, 120.97],
      title: 'The Foundry at the Center of the World', accent: 'Center of the World',
      body: 'TSMC manufactures roughly 60% of the world’s foundry output and nearly all of its leading-edge chips. Everything funnels here: Californian designs, Dutch machines, Japanese chemistry, Korean memory. One science park in Taiwan is the single point of failure for the digital economy — the “silicon shield.”',
      ticker: { label: 'TSMC', symbol: 'TSM', currency: '$' },
      stat: { v: '~60%', l: 'GLOBAL FOUNDRY REVENUE — TSMC' },
    },
    {
      num: '06', place: 'PENANG', country: 'MALAYSIA', geoName: 'Malaysia', stage: 'PACKAGING', location: [5.41, 100.33],
      title: 'The Quiet Middle', accent: 'Quiet Middle',
      body: 'A finished wafer is not a product. Chips are cut, stacked, bonded and tested across Southeast Asia — and advanced packaging has quietly become the new bottleneck, because gluing chiplets together now matters as much as shrinking them. The unglamorous middle of the chain is where delays are born.',
      ticker: { label: 'AMKOR', symbol: 'AMKR', currency: '$' },
    },
    {
      num: '07', place: 'ASHBURN', country: 'USA', geoName: 'United States of America', stage: 'DEPLOYMENT', location: [39.04, -77.49],
      title: 'Where Silicon Goes to Work', accent: 'Work',
      body: 'The journey ends where it began — in America, in windowless halls along Data Center Alley. Hyperscalers are committing over a trillion dollars of cumulative AI capex through 2027, and the binding constraint is no longer chips but megawatts. Power, not silicon, is becoming the new scarcity.',
      ticker: { label: 'MICROSOFT', symbol: 'MSFT', currency: '$' },
      stat: { v: '$1T+', l: 'CUMULATIVE AI DATA CENTER CAPEX 2024–27E' },
    },
    {
      num: '08', place: 'ORBIT', country: 'LOW EARTH ORBIT', geoName: null, stage: 'WHAT’S NEXT', location: [0, -150],
      title: 'The Next Frontier Is Up', accent: 'Up',
      body: 'If power is the constraint, the next data centers may not be built on Earth at all. SpaceX, NVIDIA and Google are exploring solar-powered compute in orbit — chips above the atmosphere, fed by uninterrupted sunlight. The supply chain that spans the planet is starting to leave it.',
      ticker: { label: 'ALPHABET', symbol: 'GOOGL', currency: '$' },
    },
  ],
};

const RUSSIA_OIL: JourneyConfig = {
  slug: 'russia-oil',
  name: 'THE OIL MACHINE',
  pageTitle: 'The Oil Machine — Interactive Briefing | S2D Capital Insights',
  description:
    'Follow a barrel of sanctioned Urals crude from the West Siberian wellhead through the shadow fleet to Indian refineries, Chinese teapots, and the yuan trap in Moscow.',
  publishDate: '2026-03-31',
  articleSlug: 'russia-oil-machine',
  chokepoints: [
    { label: 'BOSPHORUS', location: [41.1, 29.05], activeChapters: ['02', '03'] },
  ],
  chapters: [
    {
      num: '01', place: 'KHANTY-MANSIYSK', country: 'RUSSIA', geoName: 'Russia', stage: 'WELLHEAD', location: [61.0, 69.0],
      title: 'Where the Barrels Begin', accent: 'Begin',
      body: 'West Siberian fields still pump millions of barrels of Urals crude a day. Sanctions did not change the geology — they changed who buys it, how it travels, and what it earns. Every barrel now leaves the wellhead carrying a discount to Brent that funds the workarounds in every chapter that follows.',
      ticker: { label: 'BRENT', symbol: 'BZ=F', currency: '$' },
      stat: { v: '$6–12', l: 'URALS DISCOUNT TO BRENT' },
    },
    {
      num: '02', place: 'NOVOROSSIYSK', country: 'RUSSIA', geoName: 'Russia', stage: 'EXPORT', location: [44.72, 37.77],
      title: 'The Last Open Door', accent: 'Open Door',
      body: 'From the Black Sea terminal, every cargo must squeeze through the Bosphorus under the eyes of Western insurers and the G7 price cap. The paperwork says compliant; the attestations say under the cap. Whether either is true becomes someone else’s problem the moment the tanker clears the strait.',
      ticker: { label: 'USD/RUB', symbol: 'USDRUB=X', currency: '' },
    },
    {
      num: '03', place: 'LACONIAN GULF', country: 'GREECE', geoName: 'Greece', stage: 'SHADOW FLEET', location: [36.45, 22.75],
      title: 'The Fleet That Doesn’t Exist', accent: 'Doesn’t Exist',
      body: 'Off the Greek coast, aging tankers raft together for ship-to-ship transfers with their transponders dark. Hundreds of vessels with opaque owners and unknown insurance now move a large share of Russian crude — a parallel merchant marine assembled in two years, invisible by design.',
      ticker: { label: 'FRONTLINE', symbol: 'FRO', currency: '$' },
      stat: { v: '~600', l: 'SHADOW FLEET TANKERS' },
    },
    {
      num: '04', place: 'JAMNAGAR', country: 'INDIA', geoName: 'India', stage: 'REFINING', location: [22.47, 70.05],
      title: 'The Arbitrage Refinery', accent: 'Arbitrage',
      body: 'The world’s largest refining complex buys discounted Urals, runs it through its crackers, and sells diesel and jet fuel — much of it back to the same Western markets that sanctioned the crude. Once refined, a barrel has no nationality. Jamnagar is where sanctioned molecules become legal products.',
      ticker: { label: 'RELIANCE', symbol: 'RELIANCE.NS', currency: '₹' },
    },
    {
      num: '05', place: 'SHANDONG', country: 'CHINA', geoName: 'China', stage: 'TEAPOTS', location: [36.07, 120.38],
      title: 'The Teapot Lifeline', accent: 'Lifeline',
      body: 'China’s independent “teapot” refiners absorb the cargoes nobody else will touch, paying in yuan at discounts that keep their margins alive. The dependency now runs both ways: Russia needs the buyers, and more than half of Russia’s imports come back from China in return.',
      ticker: { label: 'SINOPEC', symbol: '0386.HK', currency: 'HK$' },
      stat: { v: '57%', l: 'RUSSIAN IMPORTS FROM CHINA' },
    },
    {
      num: '06', place: 'MOSCOW', country: 'RUSSIA', geoName: 'Russia', stage: 'SETTLEMENT', location: [55.75, 37.62],
      title: 'The Yuan Trap', accent: 'Trap',
      body: 'The journey ends in Moscow’s banking system, where oil revenue piles up in a currency Russia cannot freely spend. Yuan liquidity is rationed, overnight rates spike, and the proceeds of every chapter before this one sit captive in accounts Beijing ultimately controls. The machine works — for now, and on China’s terms.',
      ticker: { label: 'USD/CNY', symbol: 'CNY=X', currency: '' },
      stat: { v: '44%', l: 'YUAN OVERNIGHT RATE — MOSCOW, MAR 19' },
    },
  ],
};

const EUROPE_ENERGY: JourneyConfig = {
  slug: 'europe-energy',
  name: 'THE ENERGY SYSTEM',
  pageTitle: 'The Energy System — Interactive Briefing | S2D Capital Insights',
  description:
    'How Europe keeps the lights on after Russian gas: Norwegian pipelines, LNG terminals, a strained grid, the nuclear bet, and the Amsterdam trading floor where the price is set.',
  publishDate: '2026-03-18',
  articleSlug: 'europe-energy-decoded',
  chokepoints: [
    { label: 'SUEZ / RED SEA', location: [29.9, 32.55], activeChapters: ['02'] },
  ],
  chapters: [
    {
      num: '01', place: 'TROLL FIELD', country: 'NORWAY', geoName: 'Norway', stage: 'SUPPLY', location: [60.64, 3.72],
      title: 'The Last Pipeline Standing', accent: 'Standing',
      body: 'When Russian gas vanished, Norway became the backbone of European energy almost overnight. From platforms like Troll, pipelines deliver the baseload molecules the continent can no longer take for granted — and Europe has spent on a war footing to secure everything the pipelines cannot carry.',
      ticker: { label: 'EQUINOR', symbol: 'EQNR', currency: '$' },
      stat: { v: '€651B', l: 'EU ENERGY SHIELD SPENDING 2021–23' },
    },
    {
      num: '02', place: 'ROTTERDAM', country: 'NETHERLANDS', geoName: 'Netherlands', stage: 'LNG', location: [51.95, 4.05],
      title: 'Floating Molecules', accent: 'Molecules',
      body: 'The flexible half of the system arrives by sea: American LNG in $250M tankers, rerouted around a Red Sea nobody trusts anymore. Regasification terminals built in record time turned Europe’s gas system from pipeline-bound to ocean-going — at ocean-going prices, set by whoever else wants the cargo.',
      ticker: { label: 'SHELL', symbol: 'SHEL', currency: '$' },
      stat: { v: '46 bcm', l: 'EU GAS STORAGE — FEB 2026' },
    },
    {
      num: '03', place: 'BRANDENBURG', country: 'GERMANY', geoName: 'Germany', stage: 'GRID', location: [52.5, 13.4],
      title: 'The Grid Under Strain', accent: 'Strain',
      body: 'Wind and solar now dominate capacity, but electrons still have to arrive on a windless February night. Redispatch costs, congestion, and backup capacity are the hidden bill of the transition — and European industry pays roughly twice what American competitors pay for power.',
      ticker: { label: 'RWE', symbol: 'RWE.DE', currency: '€' },
      stat: { v: '2x', l: 'EU VS US INDUSTRIAL POWER COST' },
    },
    {
      num: '04', place: 'FLAMANVILLE', country: 'FRANCE', geoName: 'France', stage: 'NUCLEAR', location: [49.54, -1.88],
      title: 'The Baseload Bet', accent: 'Bet',
      body: 'France’s reactor fleet is back, and Europe is quietly re-learning to love the atom. New EPRs, lifetime extensions, and small modular designs are the continent’s wager that decarbonization without deindustrialization needs something that runs when the wind doesn’t blow.',
      ticker: { label: 'CAMECO', symbol: 'CCJ', currency: '$' },
    },
    {
      num: '05', place: 'AMSTERDAM', country: 'NETHERLANDS', geoName: 'Netherlands', stage: 'TRADING FLOOR', location: [52.37, 4.9],
      title: 'Where Europe Sets the Price', accent: 'Price',
      body: 'Everything converges on a screen: the TTF gas benchmark in Amsterdam, the nervous system of European energy. Pipeline flows, LNG cargoes, wind forecasts and war headlines all become one number — and since the Iran war began, that number has risen by more than half.',
      ticker: { label: 'NAT GAS (US)', symbol: 'NG=F', currency: '$' },
      stat: { v: '+57%', l: 'TTF GAS SINCE IRAN WAR BEGAN' },
    },
  ],
};

export const JOURNEYS: JourneyConfig[] = [SILICON, RUSSIA_OIL, EUROPE_ENERGY];

export function getJourney(slug: string): JourneyConfig | undefined {
  return JOURNEYS.find((j) => j.slug === slug);
}
