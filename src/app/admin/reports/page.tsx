import type { Metadata } from "next";
import ReportsClient from "@/components/admin/ReportsClient";

export const metadata: Metadata = { title: "Admin — Reports" };

export default function AdminReportsPage() {
  return <ReportsClient />;
}
