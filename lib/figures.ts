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

export function resolveFigureId(id: string): string {
  return Object.keys(FIGURES).find((k) => k.toLowerCase() === id.toLowerCase()) || 'Nvidia';
}

// which figure's prior choice this figure reacts to (continuity across the journey)
export const PRIOR: Record<string, string> = { TSMC: 'Nvidia', ASML: 'TSMC', Power: 'Copper', OpenAI: 'Nvidia', Microsoft: 'OpenAI' };

