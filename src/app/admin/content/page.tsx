import type { Metadata } from "next";
import ContentModerationClient from "@/components/admin/ContentModerationClient";

export const metadata: Metadata = { title: "Admin — Content Moderation" };

export default function AdminContentPage() {
  return <ContentModerationClient />;
}
