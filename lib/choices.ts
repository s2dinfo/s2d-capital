'use client';
// Shared, persistent choice store so decisions made inside the 3D encounter scenes
// (separate routes) survive navigation and show up in the globe's meters + report.
import { useState, useEffect, useCallback } from 'react';

const KEY = 's2d_chip_choices';
const EVT = 's2d-choices';

export function getChoices(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
}

export function setChoiceLS(node: string, value: string) {
  if (typeof window === 'undefined') return;
  const c = getChoices();
  c[node] = value;
  localStorage.setItem(KEY, JSON.stringify(c));
  window.dispatchEvent(new Event(EVT));
}

export function useChoices(): [Record<string, string>, (node: string, value: string) => void] {
  const [choices, setChoices] = useState<Record<string, string>>({});
  useEffect(() => {
    const sync = () => setChoices(getChoices());
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener(EVT, sync); window.removeEventListener('storage', sync); };
  }, []);
  const set = useCallback((node: string, value: string) => { setChoiceLS(node, value); setChoices(getChoices()); }, []);
  return [choices, set];
}
