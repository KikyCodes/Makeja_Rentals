import type { Metadata } from "next";
import AdminOverviewClient from "@/components/admin/AdminOverviewClient";

export const metadata: Metadata = { title: "Admin — Dashboard" };

export default function AdminDashboardPage() {
  return <AdminOverviewClient />;
}
