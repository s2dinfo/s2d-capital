// app/research/clarity-act/page.tsx
import { Metadata } from "next";
import ClarityActArticle from "./ClarityActArticle";

export const metadata: Metadata = {
  title: "The CLARITY Act – S2D Capital Insights",
  description:
    "How US regulation ushers in the next era of institutional crypto adoption. Investor briefing, March 2026.",
  openGraph: {
    title: "The CLARITY Act | S2D Capital Insights",
    description:
      "Investor briefing: How US regulation ushers in the next era of institutional crypto adoption.",
    type: "article",
    publishedTime: "2026-03-10",
    authors: ["Sami Samii"],
    siteName: "S2D Capital Insights",
  },
};

export default function ClarityActPage() {
  return <ClarityActArticle />;
}
