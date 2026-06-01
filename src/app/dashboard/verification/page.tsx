import type { Metadata } from "next";
import VerificationClient from "@/components/dashboard/VerificationClient";

export const metadata: Metadata = { title: "Verification" };

export default function VerificationPage() {
  return <VerificationClient />;
}
