import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RoommatesClient from "@/components/roommates/RoommatesClient";

export const metadata: Metadata = {
  title: "Find Roommates — Makeja Rentals",
  description: "Find compatible roommates in Machakos, Kenya. Post your profile and connect with students and young professionals.",
};

export default function RoommatesPage() {
  return (
    <>
      <Navbar />
      <RoommatesClient />
      <Footer />
    </>
  );
}
