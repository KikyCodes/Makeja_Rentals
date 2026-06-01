import type { Metadata } from "next";
import BookingsClient from "@/components/dashboard/BookingsClient";

export const metadata: Metadata = { title: "Bookings" };

export default function BookingsPage() {
  return <BookingsClient />;
}
