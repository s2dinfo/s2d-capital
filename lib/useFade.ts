'use client';
// Trigger a fade-to-black, then navigate — paired with <Fader> for cinematic
// route transitions between the globe and the 3D encounter scenes.
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function useFade() {
  const router = useRouter();
  const [out, setOut] = useState(false);
  const [label, setLabel] = useState('');
  const go = (href: string, lbl = '') => {
    setLabel(lbl);
    setOut(true);
    setTimeout(() => router.push(href), 560);
  };
  return { go, out, label };
}
