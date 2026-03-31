import { getMacro, getWorldGdp } from '@/lib/api';
import GeoClient from './client';

export const metadata = { title: 'Global Macro & Policy Signals | S2D Capital Insights' };
export const dynamic = "force-dynamic";

export default async function GeopoliticsPage() {
  const [macro, gdp] = await Promise.all([getMacro(), getWorldGdp()]);
  return <GeoClient macro={macro} gdp={gdp} />;
}
