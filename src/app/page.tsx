import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import TrustBar from "@/components/home/TrustBar";
import CategoriesSection from "@/components/home/CategoriesSection";
import FeaturedProperties from "@/components/home/FeaturedProperties";
import PopularLocations from "@/components/home/PopularLocations";
import HowItWorks from "@/components/home/HowItWorks";
import StatsSection from "@/components/home/StatsSection";
import RoommateTeaser from "@/components/home/RoommateTeaser";
import Testimonials from "@/components/home/Testimonials";
import CTASection from "@/components/home/CTASection";
import NewsletterSection from "@/components/home/NewsletterSection";

export const metadata: Metadata = {
  title: "Makeja Rentals — Find Rentals in Machakos",
  description:
    "Machakos' #1 rental marketplace. Find verified hostels, bedsitters, and apartments for students and young professionals. No agent fees.",
  keywords: ["Machakos rentals", "hostels Machakos", "bedsitters Machakos", "Makeja Rentals", "student housing Kenya"],
  openGraph: {
    title: "Makeja Rentals — Find Rentals in Machakos",
    description: "Browse 500+ verified listings across Machakos County.",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <TrustBar />
        <CategoriesSection />
        <FeaturedProperties />
        <PopularLocations />
        <HowItWorks />
        <StatsSection />
        <RoommateTeaser />
        <Testimonials />
        <CTASection />
        <NewsletterSection />
      </main>
      <Footer />
    </>
  );
}
