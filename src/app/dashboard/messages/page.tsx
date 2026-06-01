import type { Metadata } from "next";
import MessagesClient from "@/components/dashboard/MessagesClient";

export const metadata: Metadata = { title: "Messages" };

export default function MessagesPage() {
  return <MessagesClient />;
}
