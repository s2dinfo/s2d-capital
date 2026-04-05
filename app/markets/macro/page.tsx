import { getMacro } from '@/lib/api';
import MacroClient from './client';

export const metadata = { title: 'Monetary Policy & Central Banks | S2D Capital Insights' };
export const dynamic = "force-dynamic";

export default async function MacroPage() {
  const macro = await getMacro().catch(() => ({}));
  return <MacroClient macro={macro} />;
}
