import type { Metadata } from "next";
import AnalyticsClient from "@/components/dashboard/AnalyticsClient";

export const metadata: Metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return <AnalyticsClient />;
}
