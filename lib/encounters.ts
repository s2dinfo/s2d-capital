// ── Encounter scripts: the data behind each "meet a real figure" scene. ──
// Adding a new figure to the world = writing one of these objects. No code.
// Every fact is real and public; dialogue is dramatized from public statements.

export type Line = { who: 'narration' | 'speaker'; text: string };

export type EncounterOption = { id: string; label: string; sub: string };

export type EncounterScript = {
  id: string;        // matches a globe node's `place`
  locationTag: string;
  name: string;
  role: string;
  tag: string;       // short speaker label, e.g. 'JENSEN'
  portrait?: string; // URL to a STYLISED character image (e.g. '/characters/jensen.png'); placeholder shows until set
  voiceId?: string;  // ElevenLabs voice id — `npm run gen:voices` pre-renders this character's lines
  imagePrompt?: string; // subject for the visuals pipeline (Grok / Flux) — how this character's face was made
  face?: { closed: string; open: string }; // two-frame talking head (mouth closed/open), swapped by the clip's volume — preferred over a looping video
  expressions?: { informative: string; questioning: string; serious: string; resolved: string }; // context-driven STILLS (mouth closed), cross-faded by encounter beat — no lip-sync needed
  // an extra opening line that reacts to the choice made at the PREVIOUS stop
  priorReactions?: Record<string, string>;
  intro: Line[];
  decision: { prompt: string; options: EncounterOption[] };
  outcomes: Record<string, { verdict: string; text: string }>;
  // the factual "what really happened" reveal — concrete, public-record outcome
  // shown after the player commits. Keyed by option id. This is the learn-payload.
  reality?: Record<string, string>;
  outro: Line[];
  done: { verdict: string; text: string };
  article?: string;
  next?: { node: string; label: string }; // continue the quest to another node
};

export const ENCOUNTERS: Record<string, EncounterScript> = {
  Nvidia: {
    id: 'Nvidia',
    locationTag: 'NVIDIA HQ · SANTA CLARA',
    name: 'Jensen Huang',
    role: 'Founder & CEO, Nvidia',
    tag: 'JENSEN',
    portrait: '/characters/jensen-still.jpg',
    voiceId: 'cjVigY5qzO86Huf0OWal', // Eric — smooth, confident
    intro: [
      { who: 'narration', text: 'Santa Clara, California. Inside Nvidia, a man in a black leather jacket looks up from a silicon wafer.' },
      { who: 'speaker', text: 'Everyone thinks Nvidia makes chips. We don’t make a single one.' },
      { who: 'speaker', text: 'We design them. TSMC builds them — in Taiwan, on machines from one company in the Netherlands. We are a link in a chain we don’t control.' },
      { who: 'speaker', text: 'Which brings me to the decision that built this company. I have limited wafer slots at TSMC. Not enough for everything the market wants. So — where do they go?' },
    ],
    decision: {
      prompt: 'You’re me for a moment. Allocate the wafers.',
      options: [
        { id: 'gaming', label: 'Gaming GPUs', sub: 'Proven demand. Safe revenue this quarter.' },
        { id: 'ai', label: 'AI data-center GPUs', sub: 'The bet on a future nobody’s sure of yet.' },
      ],
    },
    outcomes: {
      gaming: { verdict: 'A safe quarter.', text: 'You book the revenue gamers always deliver. But the AI buyers waiting on data-center GPUs don’t wait — they go elsewhere. You protected this quarter and handed away the decade. Safe was the trap.' },
      ai: { verdict: 'That’s the call Nvidia actually made.', text: 'Data-center went from a side bet to the vast majority of Nvidia’s revenue. It became one of the most valuable companies on earth. The catch: it all still rides on TSMC — 110 miles from mainland China.' },
    },
    reality: {
      ai: 'Nvidia’s data-center revenue went from ~$3B for all of 2020 to over $30B in a single quarter by late 2024 — roughly 10× the old annual figure, every quarter. In June 2024 it briefly became the world’s most valuable company at ~$3 trillion. The AI bet defined the decade.',
      gaming: 'Gaming was Nvidia’s core business for two decades — yet by 2024 it was a small fraction of revenue beside data-center AI. The firms that hesitated on AI are the ones that lost the most ground.',
    },
    outro: [
      { who: 'speaker', text: 'Now you understand my half of it. The most important chips on earth — designed by a company that can’t build them.' },
      { who: 'speaker', text: 'So go and meet the company that does. Go to Taiwan.' },
    ],
    done: { verdict: 'You made Nvidia’s call.', text: 'You felt the bet that built a trillion-dollar company. But it only matters if someone can actually build the chips. Follow the chain.' },
    article: '/research/silicon-the-strategic-commodity',
    next: { node: 'TSMC', label: 'Follow the chips to Taiwan →' },
  },

  TSMC: {
    id: 'TSMC',
    locationTag: 'TSMC · HSINCHU, TAIWAN',
    name: 'C.C. Wei',
    role: 'Chairman & CEO, TSMC',
    tag: 'C.C. WEI',
    portrait: '/characters/cc-wei-still.jpg',
    voiceId: 'pqHfZKP75CvOlQylNhV4', // Bill — wise, mature, older
    priorReactions: {
      ai: 'So — you bet everything on AI chips. Bold. Now you must understand the company that actually has to build them.',
      gaming: 'You played it safe at Nvidia. Understandable. But the real game is here, in the fabs — let me show you.',
    },
    intro: [
      { who: 'narration', text: 'Hsinchu, Taiwan. The chief executive of the company that builds almost every advanced chip on earth meets your eye — calm, direct, an engineer to the core.' },
      { who: 'speaker', text: 'Nvidia designs. We build. Nearly every advanced chip on earth is made here, by us, on this island.' },
      { who: 'speaker', text: 'The Americans are nervous. They want me to build fabs in Arizona — to spread the risk away from Taiwan. But a fab there costs far more to run than one here.' },
      { who: 'speaker', text: 'And there is something they don’t say aloud: as long as the world’s chips are made in Taiwan, the world will defend Taiwan. We call it the silicon shield.' },
    ],
    decision: {
      prompt: 'You run TSMC. Where do you build the next great fab?',
      options: [
        { id: 'taiwan', label: 'Keep it in Taiwan', sub: 'Cheaper, faster — and the silicon shield stays strong.' },
        { id: 'spread', label: 'Spread to Arizona & Japan', sub: 'Costlier, slower — but the world stops betting on one island.' },
      ],
    },
    outcomes: {
      taiwan: { verdict: 'The shield holds — for now.', text: 'You keep costs low and concentration high. The world keeps protecting Taiwan because it has no choice. But you’ve placed the entire AI economy on one fault line, 110 miles from China. One blockade freezes everything.' },
      spread: { verdict: 'That’s the path TSMC is actually walking.', text: 'Arizona and Japan fabs are rising — at a reported ~50% higher cost. You de-risk geography but bleed margin, and you quietly weaken the very shield that kept Taiwan safe. There is no free choice here.' },
    },
    reality: {
      taiwan: 'Taiwan still makes roughly 90% of the world’s most advanced (sub-7nm) chips. That single-island concentration is why a Taiwan Strait conflict is modeled as a multi-trillion-dollar shock to the global economy — the “silicon shield.”',
      spread: 'TSMC’s Arizona fab slipped years past its first target and reportedly costs far more to run than a Taiwan fab. Onshoring leading-edge chips turned out far harder and pricier than policymakers assumed.',
    },
    outro: [
      { who: 'speaker', text: 'Now you see it. Everyone wants these chips. Almost no one on earth can make them.' },
      { who: 'speaker', text: 'And the few who can sit in the most dangerous place on the map.' },
    ],
    done: { verdict: 'You’ve walked the spine of the AI era.', text: 'Designer → maker → an island the whole world is holding its breath over. Two choices, two continents, one fragile chain — and you made both calls.' },
    article: '/research/silicon-the-strategic-commodity',
    next: { node: 'ASML', label: 'Trace it back to the machine →' },
  },

  ASML: {
    id: 'ASML',
    locationTag: 'ASML · VELDHOVEN, NETHERLANDS',
    name: 'Christophe Fouquet',
    role: 'CEO, ASML',
    tag: 'FOUQUET',
    portrait: '/characters/fouquet-still.jpg',
    voiceId: 'onwK4e9ZLuTAKqWW03F9', // Daniel — steady broadcaster
    priorReactions: {
      taiwan: 'So Taiwan keeps everything. Then you’d better pray nothing happens to it — because the machines that make those chips possible all come from here.',
      spread: 'Spreading the fabs — sensible. But every new fab, wherever you build it, still needs a machine only we can make. Let me show you the real bottleneck.',
    },
    intro: [
      { who: 'narration', text: 'Veldhoven, a quiet Dutch town. Inside a vast cleanroom stands a machine the size of a bus, worth more than €200 million.' },
      { who: 'speaker', text: 'This is EUV lithography. It prints features smaller than a virus, using light from exploding tin droplets focused by the flattest mirrors ever made. We are the only company on earth that builds it.' },
      { who: 'speaker', text: 'Which makes me a target. Washington wants me to cut China off from our most advanced machines. China is one of my biggest customers.' },
    ],
    decision: {
      prompt: 'You run ASML. The US demands you stop selling advanced machines to China.',
      options: [
        { id: 'sell', label: 'Keep selling to China', sub: 'Protect revenue and your independence as a Dutch company.' },
        { id: 'comply', label: 'Comply with export controls', sub: 'Align with the US-led bloc — and lose a vast market.' },
      ],
    },
    outcomes: {
      sell: { verdict: 'You keep the revenue — and the heat.', text: 'China stays a top customer, but you’re now the front line of a tech cold war. And every advanced machine you ship helps China build the very capability meant to replace you.' },
      comply: { verdict: 'That’s the path that actually unfolded.', text: 'The Dutch government, pressed by Washington, restricted ASML’s most advanced exports to China. You align with the West — and hand China a national mission to build its own EUV from scratch. The bottleneck becomes a battleground.' },
    },
    reality: {
      sell: 'In reality the choice wasn’t fully ASML’s. The Netherlands, under US pressure, barred exports of its most advanced EUV machines to China and later moved to curb some older DUV tools too — and China was about a third of ASML’s sales in 2025, one of its largest markets.',
      comply: 'Export controls held. China responded by pouring tens of billions into a domestic chip-tool industry and stockpiling older machines — accelerating the exact capability the controls were meant to deny.',
    },
    outro: [
      { who: 'speaker', text: 'One company. One machine. Without it, there are no advanced chips — no AI, anywhere on earth.' },
      { who: 'speaker', text: 'That is the most concentrated point of power in the modern economy. And it sits right here, in a Dutch field.' },
    ],
    done: { verdict: 'You’ve walked the entire triangle.', text: 'Design (Nvidia) → fabrication (TSMC) → the machine (ASML). Three companies, three continents, one chain — and now you’ve made every call that holds it together.' },
    article: '/research/silicon-the-strategic-commodity',
  },

  Copper: {
    id: 'Copper',
    locationTag: 'ESCONDIDA · ATACAMA DESERT, CHILE',
    name: 'Andrés Vidal',
    role: 'Veteran Mine Director',
    tag: 'ANDRÉS',
    portrait: '/characters/copper-stylized.png', // plain neutral still
    voiceId: 'nPczCjzI2devNBz1zQrb', // Brian — deep, resonant
    imagePrompt: 'a veteran Chilean copper-mine director in his early 60s, weathered tanned face, short grey hair, trimmed grey stubble, slight confident smile, wearing a high-visibility orange jacket over a dark work shirt, an open-pit copper mine softly blurred behind him',
    intro: [
      { who: 'narration', text: 'The Atacama Desert, Chile — the driest place on earth. At the rim of a pit two miles wide, a man who has spent thirty years pulling copper from the rock turns to face you.' },
      { who: 'speaker', text: 'Everyone obsesses over chips. But a chip is useless without power and wiring — and that means copper. One AI datacenter swallows thousands of tonnes of it. An electric car needs four times what a normal one does. The grid that feeds it all? Copper, copper, copper.' },
      { who: 'speaker', text: 'Here is my problem. The world wants more copper than ever — and the easy copper is gone. Every year the rock gives up less. We dig more, crush more, burn more diesel, drink more water, for thinner and thinner ore. And here, in the desert, water is everything.' },
      { who: 'speaker', text: 'So I face the choice every great mine on earth now faces.' },
    ],
    decision: {
      prompt: 'You run the mine. The world is begging for copper. How do you answer?',
      options: [
        { id: 'ramp', label: 'Ramp hard, now', sub: 'Mine the lower grades, fast. Feed the boom — and strain the water and the towns around you.' },
        { id: 'restraint', label: 'Hold the line', sub: 'Mine carefully and sustainably. Protect the desert — and let the shortfall bite.' },
      ],
    },
    outcomes: {
      ramp: { verdict: 'You feed the machine.', text: 'Copper flows; the datacenters and the car lines keep humming. But you draw down aquifers in the driest desert on earth, the towns around you fight you in court, and your own costs climb as the ore keeps thinning. You bought the world a few years — and a reckoning.' },
      restraint: { verdict: 'The honest answer — and the painful one.', text: 'You protect the desert and your people. But the copper the world needs simply isn’t there. Prices spike, the green transition and the AI buildout both slow, and the shortfall becomes everyone’s problem. There was never a clean choice — only who pays.' },
    },
    reality: {
      ramp: 'Copper is now treated as a binding constraint on AI and electrification. Chile produces ~¼ of the world’s copper but faces declining ore grades and water disputes in the Atacama — every extra tonne carries a real local cost.',
      restraint: 'Analysts project a structural copper deficit — BHP sees a ~10-million-tonne shortfall by 2035 — as demand outpaces supply, and a new mine takes 10–15 years to permit and build. Restraint anywhere tightens a shortage everywhere.',
    },
    outro: [
      { who: 'speaker', text: 'Now you understand the part no one puts on a slide. The AI revolution is not just silicon. It is dug out of the ground, in places like this, by people like us — and the ground is not infinite.' },
      { who: 'speaker', text: 'They call copper the metal of electrification. I call it the real bottleneck. You can design a chip in a year. You cannot conjure a copper mine in less than a decade.' },
    ],
    done: { verdict: 'You’ve found the hidden floor of the AI era.', text: 'Beneath the chips and the datacenters lies the physical world — copper, water, rock, and the people who move them. No copper, no grid. No grid, no AI. That is the story under the story.' },
    next: { node: 'Power', label: 'Follow the copper to the grid →' },
  },

  Power: {
    id: 'Power',
    locationTag: 'DATA CENTER ALLEY · LOUDOUN COUNTY, VIRGINIA',
    name: 'Nadia Brandt',
    role: 'Grid Operations Director',
    tag: 'NADIA',
    portrait: '/characters/power-still.png',
    voiceId: 'EXAVITQu4vr4xnSDxMaL', // Sarah — clear, measured
    imagePrompt: 'a female grid operations director in her early 50s, calm authoritative face, shoulder-length dark hair with a few greys, wearing a charcoal blazer over a high-visibility safety vest, a softly blurred electrical substation and control-room screens behind her',
    priorReactions: {
      ramp: 'So you tore the copper out of the ground to feed the boom. Good — because all that metal ends up here, as wire and busbar, trying to move power we may not have.',
      restraint: 'You held the copper back. Honest — but it leaves me short of the very wire and transformers I need to carry the load they’re demanding.',
    },
    intro: [
      { who: 'narration', text: 'Loudoun County, Virginia — “Data Center Alley,” where more of the world’s internet passes through than anywhere on earth. Beside a humming substation, a grid director pulls up a load forecast that bends almost vertical.' },
      { who: 'speaker', text: 'Everyone talks about chips and copper. Almost no one asks the obvious question: what powers all of it? A single AI datacenter can draw as much electricity as a small city. And they want to build dozens — here, now.' },
      { who: 'speaker', text: 'My grid was built for homes and offices, not for this. To connect the AI buildout at the speed they want, I’d have to fire up every source I have — including gas — and pass the cost straight to households.' },
      { who: 'speaker', text: 'Or I make them wait. So here is the choice nobody in the AI story wants to own.' },
    ],
    decision: {
      prompt: 'You run the grid. The AI companies want gigawatts connected — now.',
      options: [
        { id: 'rush', label: 'Energize them now', sub: 'Fire up every source, fast-track the hookups. Feed the boom — strain the grid and the bills.' },
        { id: 'pace', label: 'Pace it to the grid', sub: 'Queue the datacenters to real capacity. Protect ratepayers — and slow the AI timeline.' },
      ],
    },
    outcomes: {
      rush: { verdict: 'The lights stay on — for the datacenters.', text: 'You energize the buildout. The AI keeps scaling, but you lean on gas, delay your coal retirements, and household bills climb to subsidize server halls. You bought the boom its power — and someone else pays the meter.' },
      pace: { verdict: 'The honest brake — and the unpopular one.', text: 'You protect the grid and the people on it. But the datacenters sit in a years-long queue, the AI timeline slips, and the buildout simply moves to whoever will say yes faster. The constraint was never the chip. It was the wire.' },
    },
    reality: {
      rush: 'AI datacenters are straining grids worldwide. In Northern Virginia — the planet’s largest datacenter hub — utilities plan up to 15 GW of new gas by 2030 and have slowed coal-plant retirements to keep up. Data centers could draw ~12% of US electricity by 2030, up from 3–4% today.',
      pace: 'Interconnection queues for new power now stretch years, and some grid operators have begun pacing or pausing datacenter hookups. The binding constraint on AI has quietly shifted from chips to electricity.',
    },
    outro: [
      { who: 'speaker', text: 'Now you’ve seen the floor beneath the floor. Silicon, copper — and under both of them, raw power, by the gigawatt.' },
      { who: 'speaker', text: 'You can design a chip in a year and dig a mine in a decade. But rebuilding a grid? That is the slowest clock of all. And the AI era is racing it.' },
    ],
    done: { verdict: 'You’ve reached the bottom of the stack.', text: 'Design, fabrication, the machine, the metal — and finally the power that moves through all of it. The whole AI era, traced from a wafer to a wire. You made every call along the chain.' },
  },

  OpenAI: {
    id: 'OpenAI',
    locationTag: 'OPENAI · SAN FRANCISCO',
    name: 'Sam Altman',
    role: 'CEO, OpenAI',
    tag: 'SAM',
    portrait: '/characters/altman-figure.png',
    voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam — measured, even
    priorReactions: {
      ai: 'So you watched Nvidia bet the company on AI chips. Good — because I’m the one who has to buy them all. Every last one.',
      gaming: 'You saw Nvidia hesitate. I can’t afford to. The chips, the power, the capital — I need all of it, faster than the world can make it.',
    },
    intro: [
      { who: 'narration', text: 'San Francisco. In a plain office above the fog, the man racing to build artificial intelligence looks up from a power-purchase agreement the size of a small country’s grid.' },
      { who: 'speaker', text: 'You’ve walked the whole chain — the machine in the Netherlands, the fab in Taiwan, the chips, the copper, the grid. Now meet the reason it’s all on fire. Me.' },
      { who: 'speaker', text: 'I need compute. More than exists. More than the world currently knows how to build. Every model is hungrier than the last, and the only thing between us and the next one is silicon, power, and money — at a scale nobody has ever attempted.' },
      { who: 'speaker', text: 'So here is the decision that defines this era. How hard do I push?' },
    ],
    decision: {
      prompt: 'You run OpenAI. The race for compute is the race for everything. How far do you go?',
      options: [
        { id: 'scale', label: 'Build it all — at any cost', sub: 'Raise hundreds of billions, build the largest datacenters in history. Win the race outright.' },
        { id: 'pace', label: 'Pace it to what’s sustainable', sub: 'Build only what the grid, the supply chain, and the world can bear. Stay disciplined.' },
      ],
    },
    outcomes: {
      scale: { verdict: 'That’s the path the AI labs are actually on.', text: 'You become the demand that bends the entire chain — pulling every wafer, every gigawatt, every dollar toward compute. You might reach the future first. You also concentrate unimaginable cost and risk on a bet that has to pay off, fast, or it breaks you.' },
      pace: { verdict: 'Discipline — and the gamble that it’s enough.', text: 'You build only what the world can sustain — kinder to the grid, the climate, your balance sheet. But the race is winner-take-most, and somewhere a rival is spending like there’s no tomorrow. Restraint is wise right up until you lose.' },
    },
    reality: {
      scale: 'In reality, OpenAI and its partners announced “Stargate” — an AI-datacenter buildout reported in the hundreds of billions of dollars — and hyperscaler AI capital spending hit record highs, making the AI labs the single force pulling the entire chip-and-power supply chain.',
      pace: 'In reality, the compute race has rewarded scale: the labs that locked up the most chips, power, and capital have led. The binding limit has shifted from ambition to electricity and money — exactly the constraints you met along the chain.',
    },
    outro: [
      { who: 'speaker', text: 'Now you see why the whole world you just walked is on fire. Every fab, every mine, every substation — they’re all racing to feed this one appetite.' },
      { who: 'speaker', text: 'The chip, the machine, the metal, the power — they were never the story. They’re the runway. This is the plane.' },
    ],
    done: { verdict: 'You’ve found the keystone.', text: 'Supply meets demand. Everything you traced — design, fab, machine, metal, power — exists to feed one race. You’ve seen the whole world now: who makes it, and who it’s all for.' },
  },
};

// ── Voice helpers (shared by the app player and scripts/gen-voices.ts) ──

// Deterministic id for a spoken line → its audio is /audio/<id>.mp3.
// cyrb53 hash; MUST stay byte-identical between generator and player.
export function lineAudioId(voiceId: string, text: string): string {
  const s = voiceId + '|' + text;
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < s.length; i++) {
    const ch = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

// Every spoken string in an encounter, EXACTLY as the app renders it (so hashes
// line up). The generator uses this to know what audio to produce.
export function collectSpeakable(s: EncounterScript): string[] {
  const out: string[] = [];
  for (const l of s.intro) out.push(l.text);
  if (s.priorReactions) for (const k of Object.keys(s.priorReactions)) out.push(s.priorReactions[k]);
  out.push(s.decision.prompt);
  for (const k of Object.keys(s.outcomes)) out.push(`${s.outcomes[k].verdict}. ${s.outcomes[k].text}`);
  out.push(`${s.done.verdict}. ${s.done.text}`);
  for (const l of s.outro) out.push(l.text);
  return out;
}
