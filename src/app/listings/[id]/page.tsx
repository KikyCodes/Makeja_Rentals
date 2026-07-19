import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PropertyDetailClient from "@/components/property/PropertyDetailClient";

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <Navbar />
      <PropertyDetailClient id={id} />
      <Footer />
    </>
  );
}
