import { getCryptoPrices, getMacro, getCommodities, getFx, getFearGreed, getGlobal, getIndices } from '@/lib/api';
import HomeClient from './home-client';

export const revalidate = 300;

export default async function Home() {
  const [prices, macro, commod, fx, fg, global, indices] = await Promise.all([
    getCryptoPrices(), getMacro(), getCommodities(), getFx(), getFearGreed(), getGlobal(), getIndices(),
  ]);
  return <HomeClient prices={prices} macro={macro} commod={commod} fx={fx} fg={fg} global={global} indices={indices} />;
}
