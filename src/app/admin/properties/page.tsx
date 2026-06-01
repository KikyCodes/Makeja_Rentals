import type { Metadata } from "next";
import PropertiesApprovalClient from "@/components/admin/PropertiesApprovalClient";

export const metadata: Metadata = { title: "Admin — Property Approval" };

export default function AdminPropertiesPage() {
  return <PropertiesApprovalClient />;
}
