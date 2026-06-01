import type { Metadata } from "next";
import VerificationsClient from "@/components/admin/VerificationsClient";

export const metadata: Metadata = { title: "Admin — Verifications" };

export default function AdminVerificationsPage() {
  return <VerificationsClient />;
}
