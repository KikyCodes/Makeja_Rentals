import type { Metadata } from "next";
import PropertyManagementClient from "@/components/admin/PropertyManagementClient";

export const metadata: Metadata = { title: "Admin — Properties" };

export default function AdminPropertiesPage() {
  return <PropertyManagementClient />;
}
