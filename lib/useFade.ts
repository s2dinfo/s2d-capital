'use client';
// Trigger a fade, then navigate — paired with <Fader> for cinematic route transitions
// between the globe and the 3D scenes. `tone` colours the departure fade ('dark' default,
// or 'cloud' for the globe→world dive's atmosphere flash).
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function useFade() {
  const router = useRouter();
  const [out, setOut] = useState(false);
  const [label, setLabel] = useState('');
  const [tone, setTone] = useState<'dark' | 'cloud'>('dark');
  const go = (href: string, lbl = '', t: 'dark' | 'cloud' = 'dark') => {
    setLabel(lbl);
    setTone(t);
    setOut(true);
    setTimeout(() => router.push(href), 560);
  };
  return { go, out, label, tone };
}
