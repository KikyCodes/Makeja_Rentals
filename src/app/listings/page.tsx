import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ListingsClient from "@/components/listings/ListingsClient";
import { ListingPageSkeleton } from "@/components/ui/Skeleton";

export const metadata: Metadata = {
  title: "Browse Rentals — Makeja Rentals",
  description:
    "Browse 500+ verified rental listings in Machakos, Kenya. Filter by price, location, room type, amenities, gender preference, and distance from campus.",
  keywords: ["Machakos rentals", "bedsitters Machakos", "hostels near MKU", "cheap rentals Kenya"],
  openGraph: {
    title: "Browse Rentals — Makeja Rentals",
    description: "Filter 500+ listings by price, area, type, and distance from campus.",
    type: "website",
  },
};

export default function ListingsPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <div className="container-site py-8 mt-16">
          <ListingPageSkeleton />
        </div>
      }>
        <main className="pt-16">
          <ListingsClient />
        </main>
      </Suspense>
      <Footer />
    </>
  );
}
