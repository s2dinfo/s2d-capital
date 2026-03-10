// app/research/clarity-act/page.tsx
import { Metadata } from "next";
import ClarityActArticle from "./ClarityActArticle";

export const metadata: Metadata = {
  title: "Der CLARITY Act – S2D Capital Insights",
  description:
    "Wie US-Regulierung die nächste Ära institutioneller Krypto-Adoption einläutet. Investoren-Briefing März 2026.",
  openGraph: {
    title: "Der CLARITY Act | S2D Capital Insights",
    description:
      "Investoren-Briefing: Wie US-Regulierung die nächste Ära institutioneller Krypto-Adoption einläutet.",
    type: "article",
    publishedTime: "2026-03-10",
    authors: ["Sami Samii"],
    siteName: "S2D Capital Insights",
  },
};

export default function ClarityActPage() {
  return <ClarityActArticle />;
}
