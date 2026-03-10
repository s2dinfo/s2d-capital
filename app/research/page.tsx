import { Metadata } from "next";
import ResearchList from "@/components/ResearchList";

export const metadata: Metadata = {
  title: "Research – S2D Capital Insights",
  description: "In-depth research and analysis across crypto, macro, commodities, FX, and geopolitics.",
};

export default function ResearchPage() {
  return <ResearchList />;
}
