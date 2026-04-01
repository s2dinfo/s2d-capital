import { Metadata } from "next";
import RussiaOilArticle from "./RussiaOilArticle";

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
  },
};

export default function RussiaOilPage() {
  return <RussiaOilArticle />;
}
