import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CreateRoommateProfile from "@/components/roommates/CreateRoommateProfile";
import { Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Post Roommate Profile — Makeja Rentals",
  description:
    "Create your roommate profile and connect with compatible students and professionals in Machakos.",
};

export default async function CreateRoommatePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/roommates/create");
  }

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-slate-50 dark:bg-slate-950">
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-4">
              <Users className="w-4 h-4" />
              Roommate Finder
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white mb-3">
              Post Your Roommate Profile
            </h1>
            <p className="text-purple-200 text-sm max-w-md mx-auto">
              Share your preferences and let compatible roommates discover you. Takes less than 3 minutes.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <CreateRoommateProfile />
        </div>
      </main>
      <Footer />
    </>
  );
}
