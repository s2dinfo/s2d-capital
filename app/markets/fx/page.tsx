import { getFx, getMacro } from '@/lib/api';
import FxClient from './client';

export const metadata = { title: 'FX & Currencies | S2D Capital Insights' };
export const dynamic = "force-dynamic";

export default async function FxPage() {
  const [fx, macro] = await Promise.all([getFx(), getMacro()]);
  return <FxClient fx={fx} macro={macro} />;
}
