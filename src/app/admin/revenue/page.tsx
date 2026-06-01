import type { Metadata } from "next";
import RevenueClient from "@/components/admin/RevenueClient";

export const metadata: Metadata = { title: "Admin — Revenue" };

export default function AdminRevenuePage() {
  return <RevenueClient />;
}
