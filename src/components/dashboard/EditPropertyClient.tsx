"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import AddPropertyForm from "./AddPropertyForm";
import type { Property } from "@/types";

export default function EditPropertyClient({ id }: { id: string }) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/listings/${id}`)
      .then((r) => r.json())
      .then(({ data, error: err }) => {
        if (err || !data) { setError("Property not found."); }
        else { setProperty(data); }
        setLoading(false);
      })
      .catch(() => { setError("Failed to load property."); setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading property…</span>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center text-red-600 dark:text-red-400">
        <p className="font-bold mb-1">Error</p>
        <p className="text-sm">{error ?? "Property not found."}</p>
      </div>
    );
  }

  return <AddPropertyForm initialData={property} isEditing />;
}
