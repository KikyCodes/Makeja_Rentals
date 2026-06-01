import Navbar from "@/components/layout/Navbar";
import DesignSystemClient from "@/components/design-system/DesignSystemClient";

export const metadata = { title: "Design System — Makeja Rentals" };

export default function DesignSystemPage() {
  return (
    <>
      <Navbar />
      <DesignSystemClient />
    </>
  );
}
