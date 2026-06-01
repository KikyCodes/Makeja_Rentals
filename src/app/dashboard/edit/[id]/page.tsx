import type { Metadata } from "next";
import EditPropertyClient from "@/components/dashboard/EditPropertyClient";

export const metadata: Metadata = { title: "Edit Property" };

export default function EditPropertyPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Edit Listing</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
          Update your property details. Changes will be reviewed and go live within 2 hours.
        </p>
      </div>
      <EditPropertyClient id={params.id} />
    </div>
  );
}
