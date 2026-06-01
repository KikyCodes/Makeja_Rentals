import type { Metadata } from "next";
import AddPropertyForm from "@/components/dashboard/AddPropertyForm";

export const metadata: Metadata = { title: "Add Property" };

export default function AddListingPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">List Your Property</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
          Reach thousands of students and young professionals in Machakos for free.
        </p>
      </div>
      <AddPropertyForm />
    </div>
  );
}
