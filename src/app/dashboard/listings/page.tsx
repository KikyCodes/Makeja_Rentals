import type { Metadata } from "next";
import ListingsManager from "@/components/dashboard/ListingsManager";

export const metadata: Metadata = { title: "My Listings" };

export default function ListingsPage() {
  return <ListingsManager />;
}
