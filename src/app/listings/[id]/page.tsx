import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PropertyDetailClient from "@/components/property/PropertyDetailClient";

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  return (
    <>
      <Navbar />
      <PropertyDetailClient id={params.id} />
      <Footer />
    </>
  );
}
