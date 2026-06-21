// Per-figure visual config for the 3D encounter scene: the Grok-generated
// stylized portrait + an accent color that themes the whole scene (hologram tint,
// lights, stage, atmosphere). Keyed by ENCOUNTERS id.
export const FIGURES: Record<string, { image: string; accent: string; env?: string }> = {
  Nvidia: { image: '/characters/jensen-figure.png', accent: '#1affa0', env: 'datacenter' }, // nvidia green
  TSMC: { image: '/characters/cc-wei-figure.png', accent: '#3aa0ff' },   // silicon blue
  ASML: { image: '/characters/fouquet-figure.png', accent: '#ff9a3a' },  // lithography amber
  Copper: { image: '/characters/andres-figure.png', accent: '#e8843a' }, // copper
  Power: { image: '/characters/nadia-figure.png', accent: '#ffd23a' },   // grid yellow
};

export function resolveFigureId(id: string): string {
  return Object.keys(FIGURES).find((k) => k.toLowerCase() === id.toLowerCase()) || 'Nvidia';
}

// which figure's prior choice this figure reacts to (continuity across the journey)
export const PRIOR: Record<string, string> = { TSMC: 'Nvidia', ASML: 'TSMC', Power: 'Copper' };

