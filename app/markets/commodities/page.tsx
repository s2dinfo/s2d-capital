import { getCommodities } from '@/lib/api';
import CommClient from './client';

export const metadata = { title: 'Commodities & Energy | S2D Capital Insights' };
export const dynamic = "force-dynamic";

export default async function CommoditiesPage() {
  const commod = await getCommodities().catch(() => ({ oil: null, oilChg: null, gold: null, goldChg: null, natgas: null, natgasChg: null, silver: null, silverChg: null }));
  return <CommClient commod={commod} />;
}
