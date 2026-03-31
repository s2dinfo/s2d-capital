import { getGlobal, getDefiTvl, getChains } from '@/lib/api';
import StructureClient from './client';

export const metadata = { title: 'DeFi & On-Chain Structure | S2D Capital Insights' };
export const dynamic = "force-dynamic";

export default async function StructurePage() {
  const [global, defi, chains] = await Promise.all([
    getGlobal().catch(() => null),
    getDefiTvl().catch(() => null),
    getChains().catch(() => null),
  ]);
  return <StructureClient global={global} defi={defi} chains={chains} />;
}
