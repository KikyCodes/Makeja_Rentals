import type { Metadata } from "next";
import FraudClient from "@/components/admin/FraudClient";

export const metadata: Metadata = { title: "Admin — Fraud Detection" };

export default function AdminFraudPage() {
  return <FraudClient />;
}
