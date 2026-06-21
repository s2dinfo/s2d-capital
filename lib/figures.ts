// Per-figure visual config for the 3D encounter scene: the Grok-generated
// stylized portrait + an accent color that themes the whole scene (hologram tint,
// lights, stage, atmosphere). Keyed by ENCOUNTERS id.
export const FIGURES: Record<string, { image: string; accent: string; env?: string }> = {
  Nvidia: { image: '/characters/jensen-figure.png', accent: '#1affa0', env: 'datacenter' }, // nvidia green
  TSMC: { image: '/characters/cc-wei-figure.png', accent: '#3aa0ff', env: 'cleanroom' },   // silicon blue
  ASML: { image: '/characters/fouquet-figure.png', accent: '#ff9a3a', env: 'euvhall' },  // lithography amber
  Copper: { image: '/characters/andres-figure.png', accent: '#e8843a', env: 'minepit' }, // copper
  Power: { image: '/characters/nadia-figure.png', accent: '#ffd23a', env: 'controlroom' },   // grid yellow
  OpenAI: { image: '/characters/altman-figure.png', accent: '#9d8bff', env: 'datacenter' },  // AI violet — the demand
  Microsoft: { image: '/characters/nadella-figure.png', accent: '#2bc4c4', env: 'controlroom' }, // cloud teal — the capital
  Oil: { image: '/characters/nasser-figure.png', accent: '#d4a23a', env: 'refinery' },        // oil amber — the old power
  RareEarth: { image: '/characters/rareearth-figure.png', accent: '#e0483a', env: 'minepit' }, // china red — the chokepoint
};

// Discoverable insight-orbs in each 3D scene — click to reveal, find them all.
export const FACTS: Record<string, { label: string; text: string }[]> = {
  Nvidia: [
    { label: 'Zero factories', text: 'Nvidia designs the GPU but owns no fabs — TSMC builds every single one.' },
    { label: 'Scale', text: 'One frontier AI model can be trained on tens of thousands of Nvidia GPUs at once.' },
  ],
  TSMC: [
    { label: 'One island', text: '~90% of the world’s most advanced chips are fabricated in Taiwan.' },
    { label: 'The cost', text: 'A single leading-edge fab costs $20B+ and takes years to build.' },
  ],
  ASML: [
    { label: 'Sole maker', text: 'ASML is the only company on earth that makes EUV lithography machines.' },
    { label: 'The machine', text: 'One EUV machine costs ~$200M and weighs around 180 tonnes.' },
  ],
  Copper: [
    { label: 'Thirsty', text: 'A single AI datacenter can use thousands of tonnes of copper.' },
    { label: 'Slow', text: 'A new copper mine takes 10–15 years from discovery to production.' },
  ],
  Power: [
    { label: 'A small city', text: 'One large AI datacenter can draw as much electricity as a small city.' },
    { label: 'Rising fast', text: 'Data centers could reach ~12% of US electricity by 2030, up from 3–4% today.' },
  ],
  OpenAI: [
    { label: 'Hungrier', text: 'Each new AI model tends to need far more compute than the last — often 10×+.' },
    { label: 'Stargate', text: 'OpenAI’s announced datacenter buildout was reported in the hundreds of billions.' },
  ],
  Microsoft: [
    { label: 'The capex', text: 'Big Tech AI capital spending now runs into tens of billions of dollars per quarter.' },
    { label: 'The backer', text: 'Microsoft is the largest financial backer of OpenAI.' },
  ],
  Oil: [
    { label: 'Still rising', text: 'Global oil demand keeps hitting record highs even amid the energy transition.' },
    { label: 'Gas revival', text: 'AI’s power hunger has revived natural gas as a source of electricity.' },
  ],
  RareEarth: [
    { label: 'The grip', text: 'China refines roughly 85–90% of the world’s rare earths.' },
    { label: 'Everywhere', text: 'Rare-earth magnets sit inside motors, drives, wind turbines and missiles.' },
  ],
};

export function resolveFigureId(id: string): string {
  return Object.keys(FIGURES).find((k) => k.toLowerCase() === id.toLowerCase()) || 'Nvidia';
}

// which figure's prior choice this figure reacts to (continuity across the journey)
export const PRIOR: Record<string, string> = { TSMC: 'Nvidia', ASML: 'TSMC', Power: 'Copper', OpenAI: 'Nvidia', Microsoft: 'OpenAI' };

