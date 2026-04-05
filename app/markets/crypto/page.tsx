import { getCryptoMarkets, getGlobal, getFearGreed, getTrending } from '@/lib/api';
import CryptoClient from './client';

export const metadata = { title: 'Crypto & Digital Assets | S2D Capital Insights' };
export const dynamic = "force-dynamic";

export default async function CryptoPage() {
  const [coins, global, fg, trending] = await Promise.all([
    getCryptoMarkets().catch(() => null),
    getGlobal().catch(() => null),
    getFearGreed().catch(() => null),
    getTrending().catch(() => null),
  ]);
  return <CryptoClient coins={coins} global={global} fg={fg} trending={trending} />;
}
