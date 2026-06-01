import type { Metadata } from "next";
import OverviewClient from "@/components/dashboard/OverviewClient";

export const metadata: Metadata = { title: "Overview" };

export default function DashboardPage() {
  return <OverviewClient />;
}
