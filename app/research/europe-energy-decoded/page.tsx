import { Metadata } from "next";
import EnergyArticle from "./EnergyArticle";

export const metadata: Metadata = {
  title: "Europe's Energy System, Decoded – S2D Capital Insights",
  description:
    "From the grid to the trading floor — how renewables, regulation, and geopolitics are reshaping Europe's energy future. A complete guide for investors.",
  openGraph: {
    title: "Europe's Energy System, Decoded | S2D Capital Insights",
    description:
      "How renewables, regulation, and geopolitics are reshaping Europe's energy future. The definitive guide.",
    type: "article",
    publishedTime: "2026-03-18",
    authors: ["Sami Samii"],
    siteName: "S2D Capital Insights",
  },
};

export default function EnergyPage() {
  return <EnergyArticle />;
}
