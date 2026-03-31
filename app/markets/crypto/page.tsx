import { getCryptoMarkets, getGlobal, getFearGreed, getTrending, getDefiTvl } from '@/lib/api';
import CryptoClient from './client';

export const metadata = { title: 'Crypto & Digital Assets | S2D Capital Insights' };
export const dynamic = "force-dynamic";

export default async function CryptoPage() {
  const [coins, global, fg, trending, defi] = await Promise.all([
    getCryptoMarkets(), getGlobal(), getFearGreed(), getTrending(), getDefiTvl(),
  ]);
  return <CryptoClient coins={coins} global={global} fg={fg} trending={trending} defi={defi} />;
}
