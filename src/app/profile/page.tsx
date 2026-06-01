import Navbar from "@/components/layout/Navbar";
import ProfileClient from "@/components/profile/ProfileClient";

export const metadata = { title: "My Profile — Makeja Rentals" };

export default function ProfilePage() {
  return (
    <>
      <Navbar />
      <ProfileClient />
    </>
  );
}
