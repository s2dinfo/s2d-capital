// app/research/silicon-the-strategic-commodity/page.tsx
import { Metadata } from "next";
import SiliconArticle from "./SiliconArticle";
import ArticleJsonLd from "@/components/ArticleJsonLd";

export const metadata: Metadata = {
  title: "Silicon: The World's Most Strategic Commodity – S2D Capital Insights",
  description:
    "How semiconductors became the new oil — from the transistor to TSMC, from export controls to orbital data centers. A complete investor's guide.",
  openGraph: {
    title: "Silicon: The World's Most Strategic Commodity | S2D Capital Insights",
    description:
      "Investor briefing: the genesis, supply chain, geopolitics, and future of the chips that run the world — including SpaceX, NVIDIA, and Google's orbital data center bet.",
    type: "article",
    publishedTime: "2026-05-13",
    authors: ["Sami Samii"],
    siteName: "S2D Capital Insights",
  },
};

export default function SiliconPage() {
  return (
    <>
      <ArticleJsonLd
        title="Silicon: The World's Most Strategic Commodity"
        description="How semiconductors became the new oil — from the transistor to TSMC, from export controls to orbital data centers."
        publishDate="2026-05-13"
        author="Sami Samii"
        url="https://s2d.info/research/silicon-the-strategic-commodity"
      />
      <SiliconArticle />
    </>
  );
}
