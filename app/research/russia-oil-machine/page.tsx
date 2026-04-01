import { Metadata } from "next";
import RussiaOilArticle from "./RussiaOilArticle";
import ArticleJsonLd from "@/components/ArticleJsonLd";

export const metadata: Metadata = {
  title: "Russia's Oil Machine, Exposed – S2D Capital Insights",
  description:
    "From the wellhead to the yuan trap: how sanctions, shadow fleets, and a 44% overnight rate reveal the true architecture of global power. A complete guide for investors.",
  openGraph: {
    title: "Russia's Oil Machine, Exposed | S2D Capital Insights",
    description:
      "How sanctions, shadow fleets, and a 44% overnight rate reveal the true architecture of global power.",
    type: "article",
    publishedTime: "2026-03-31",
    authors: ["Sami Samii"],
    siteName: "S2D Capital Insights",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

export default function RussiaOilPage() {
  return (
    <>
      <ArticleJsonLd
        title="Russia's Oil Machine, Exposed"
        description="From the wellhead to the yuan trap: how sanctions, shadow fleets, and a 44% overnight rate reveal the true architecture of global power."
        publishDate="2026-03-31"
        author="Sami Samii"
        url="https://s2d.info/research/russia-oil-machine"
      />
      <RussiaOilArticle />
    </>
  );
}
