import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SavedClient from "@/components/saved/SavedClient";

export const metadata: Metadata = {
  title: "Saved Properties — Makeja Rentals",
};

export default function SavedPage() {
  return (
    <>
      <Navbar />
      <SavedClient />
      <Footer />
    </>
  );
}
