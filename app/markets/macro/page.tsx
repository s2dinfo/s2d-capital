import { getMacro } from '@/lib/api';
import MacroClient from './client';

export const metadata = { title: 'Macro & Central Banks | S2D Capital Insights' };
export const dynamic = "force-dynamic";

export default async function MacroPage() {
  const macro = await getMacro();
  return <MacroClient macro={macro} />;
}
