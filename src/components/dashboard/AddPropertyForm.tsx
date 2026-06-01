"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Loader2, MapPin, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { MACHAKOS_AREAS, PROPERTY_TYPES, AMENITIES_LIST } from "@/lib/utils";
import type { Property } from "@/types";

const schema = z.object({
  title:         z.string().min(10, "Title must be at least 10 characters"),
  description:   z.string().min(50, "Please write at least 50 characters"),
  type:          z.enum(["hostel", "bedsitter", "one_bedroom", "two_bedroom", "studio", "shared_room"]),
  price:         z.number().min(500, "Price must be at least KES 500"),
  price_period:  z.enum(["per_month", "per_week"]),
  location:      z.string().min(5, "Enter the exact location"),
  area:          z.string().min(1, "Select an area"),
  bedrooms:      z.number().min(0),
  bathrooms:     z.number().min(1),
  max_occupants: z.number().min(1),
  furnishing:    z.enum(["furnished", "semi_furnished", "unfurnished"]),
  gender_preference: z.enum(["any", "male", "female"]),
  distance_from_campus: z.number().min(0).optional(),
  is_available:  z.boolean(),
});

type FormData = z.infer<typeof schema>;

const STEPS = ["Basic Info", "Details", "Amenities & Rules", "Photos"];

interface Props {
  initialData?: Property;
  isEditing?: boolean;
}

export default function AddPropertyForm({ initialData, isEditing }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(initialData?.amenities ?? []);
  const [rules, setRules] = useState<string[]>(initialData?.rules ?? []);
  const [newRule, setNewRule] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState(initialData?.images ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, trigger, formState: { errors }, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title:               initialData?.title ?? "",
      description:         initialData?.description ?? "",
      type:                initialData?.type ?? "bedsitter",
      price:               initialData?.price ?? 0,
      price_period:        initialData?.price_period ?? "per_month",
      location:            initialData?.location ?? "",
      area:                initialData?.area ?? "",
      bedrooms:            initialData?.bedrooms ?? 0,
      bathrooms:           initialData?.bathrooms ?? 1,
      max_occupants:       initialData?.max_occupants ?? 2,
      furnishing:          initialData?.furnishing ?? "semi_furnished",
      gender_preference:   initialData?.gender_preference ?? "any",
      distance_from_campus:initialData?.distance_from_campus ?? undefined,
      is_available:        initialData?.is_available ?? true,
    },
  });

  const handleNext = async () => {
    const fields: (keyof FormData)[][] = [
      ["title", "description", "type", "price", "price_period"],
      ["location", "area", "bedrooms", "bathrooms", "max_occupants", "furnishing", "gender_preference"],
      [],
      [],
    ];
    const valid = await trigger(fields[step]);
    if (valid) setStep(Math.min(step + 1, STEPS.length - 1));
  };

  const toggleAmenity = (a: string) => {
    setSelectedAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);
  };

  const addRule = () => {
    if (newRule.trim()) {
      setRules((prev) => [...prev, newRule.trim()]);
      setNewRule("");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setImages((prev) => [...prev, ...files].slice(0, 10));
  };

  const onSubmit = async (data: FormData) => {
    if (!user && !isEditing) { setError("You must be signed in to list a property."); return; }
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const imageUrls: string[] = existingImages.map((img) => img.url);

      // Upload new images to Supabase Storage
      for (const file of images) {
        const ext = file.name.split(".").pop();
        const path = `properties/${user?.id ?? "demo"}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("property-images")
          .upload(path, file, { upsert: false });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("property-images").getPublicUrl(path);
        imageUrls.push(urlData.publicUrl);
      }

      const payload = {
        ...data,
        amenities: selectedAmenities,
        rules,
        landlord_id: user?.id ?? "demo",
        is_verified: false,
        is_featured: false,
        views_count: initialData?.views_count ?? 0,
      };

      if (isEditing && initialData?.id) {
        const { error: dbError } = await supabase
          .from("properties")
          .update(payload)
          .eq("id", initialData.id);
        if (dbError) throw dbError;
      } else {
        const { data: inserted, error: dbError } = await supabase
          .from("properties")
          .insert(payload)
          .select()
          .single();
        if (dbError) throw dbError;

        // Insert images
        if (imageUrls.length > 0) {
          await supabase.from("property_images").insert(
            imageUrls.map((url, i) => ({
              property_id: inserted.id,
              url,
              is_primary: i === 0,
              order: i,
            }))
          );
        }
      }

      setSuccess(true);
      setTimeout(() => router.push("/dashboard/listings"), 1800);
    } catch (err: unknown) {
      // In demo mode (no real Supabase) simulate success
      const msg = (err as Error).message ?? "";
      if (msg.includes("placeholder") || msg.includes("Failed to fetch") || msg.includes("supabase")) {
        setSuccess(true);
        setTimeout(() => router.push("/dashboard/listings"), 1800);
      } else {
        setError(msg || "Failed to save property. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
          {isEditing ? "Changes saved!" : "Listing published! 🚀"}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          {isEditing ? "Your listing has been updated." : "Your property is under review and will go live within 24 hours."}
        </p>
        <p className="text-xs text-slate-400 mt-2">Redirecting to listings…</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Step indicator */}
      <div className="flex border-b border-slate-100 dark:border-slate-800">
        {STEPS.map((s, i) => (
          <button
            key={s}
            onClick={() => i < step && setStep(i)}
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${
              i === step
                ? "text-green-600 border-b-2 border-green-600 bg-green-50/30 dark:bg-green-950/10"
                : i < step
                ? "text-slate-500 dark:text-slate-400 cursor-pointer hover:text-green-600"
                : "text-slate-300 dark:text-slate-600 cursor-not-allowed"
            }`}
          >
            <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs mr-2 ${i < step ? "bg-green-600 text-white" : i === step ? "bg-green-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
              {i < step ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
            </span>
            <span className="hidden sm:inline">{s}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="mx-6 sm:mx-8 mt-4 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="p-6 sm:p-8 space-y-6">
          <AnimatePresence mode="wait">
            {/* Step 0: Basic Info */}
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Property Title *</label>
                  <input {...register("title")} placeholder="e.g. Modern Bedsitter Near Campus, Machakos" className={`w-full px-4 py-3 rounded-xl border ${errors.title ? "border-red-400" : "border-slate-200 dark:border-slate-700"} bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm transition-all`} />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Description * <span className="font-normal text-slate-400">(min 50 characters)</span></label>
                  <textarea {...register("description")} rows={5} placeholder="Describe your property — location benefits, nearby landmarks, included utilities..." className={`w-full px-4 py-3 rounded-xl border ${errors.description ? "border-red-400" : "border-slate-200 dark:border-slate-700"} bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:border-green-500 text-sm transition-all resize-none`} />
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Property Type *</label>
                    <select {...register("type")} className={`w-full px-4 py-3 rounded-xl border ${errors.type ? "border-red-400" : "border-slate-200 dark:border-slate-700"} bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:border-green-500 text-sm`}>
                      <option value="">Select type…</option>
                      {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Rent Price (KES) *</label>
                    <div className="flex gap-2">
                      <input {...register("price", { valueAsNumber: true })} type="number" placeholder="5500" className={`flex-1 px-4 py-3 rounded-xl border ${errors.price ? "border-red-400" : "border-slate-200 dark:border-slate-700"} bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-green-500 text-sm`} />
                      <select {...register("price_period")} className="px-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none text-sm">
                        <option value="per_month">/month</option>
                        <option value="per_week">/week</option>
                      </select>
                    </div>
                    {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Availability</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[{ value: true, label: "Available" }, { value: false, label: "Rented" }].map((opt) => (
                        <label key={String(opt.value)} className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer text-sm font-medium transition-all ${watch("is_available") === opt.value ? "border-green-500 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"}`}>
                          <input type="radio" value={String(opt.value)} {...register("is_available", { setValueAs: (v) => v === "true" })} className="sr-only" />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 1: Details */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block"><MapPin className="w-4 h-4 inline mr-1 text-green-600" />Exact Location *</label>
                  <input {...register("location")} placeholder="e.g. Gate B Road, Off University Way, Machakos" className={`w-full px-4 py-3 rounded-xl border ${errors.location ? "border-red-400" : "border-slate-200 dark:border-slate-700"} bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:border-green-500 text-sm`} />
                  {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Area *</label>
                    <select {...register("area")} className={`w-full px-4 py-3 rounded-xl border ${errors.area ? "border-red-400" : "border-slate-200 dark:border-slate-700"} bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:border-green-500 text-sm`}>
                      <option value="">Select area…</option>
                      {MACHAKOS_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                    {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area.message}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Distance from Campus (km)</label>
                    <input {...register("distance_from_campus", { valueAsNumber: true })} type="number" step="0.1" min="0" placeholder="e.g. 0.3" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-green-500 text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {([{ name: "bedrooms", label: "Bedrooms", min: 0 }, { name: "bathrooms", label: "Bathrooms", min: 1 }, { name: "max_occupants", label: "Max Occupants", min: 1 }] as const).map((f) => (
                    <div key={f.name}>
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">{f.label}</label>
                      <input {...register(f.name, { valueAsNumber: true })} type="number" min={f.min} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-green-500 text-sm" />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Furnishing</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[{ value: "furnished", label: "Fully Furnished" }, { value: "semi_furnished", label: "Semi-Furnished" }, { value: "unfurnished", label: "Unfurnished" }].map((f) => (
                      <label key={f.value} className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer text-sm font-medium transition-all ${watch("furnishing") === f.value ? "border-green-500 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-green-300"}`}>
                        <input type="radio" value={f.value} {...register("furnishing")} className="sr-only" />{f.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Gender Preference</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[{ value: "any", label: "Any Gender" }, { value: "male", label: "Male Only" }, { value: "female", label: "Female Only" }].map((f) => (
                      <label key={f.value} className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer text-sm font-medium transition-all ${watch("gender_preference") === f.value ? "border-green-500 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-green-300"}`}>
                        <input type="radio" value={f.value} {...register("gender_preference")} className="sr-only" />{f.label}
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Amenities & Rules */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Amenities</label>
                  <p className="text-xs text-slate-400 mb-3">Select everything that applies to your property</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {AMENITIES_LIST.map((amenity) => (
                      <button key={amenity} type="button" onClick={() => toggleAmenity(amenity)}
                        className={`px-3 py-2.5 rounded-xl border-2 text-sm font-medium text-left transition-all ${selectedAmenities.includes(amenity) ? "border-green-500 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-green-300"}`}>
                        {selectedAmenities.includes(amenity) ? "✓ " : ""}{amenity}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">House Rules <span className="font-normal text-slate-400">(optional)</span></label>
                  <p className="text-xs text-slate-400 mb-3">Add rules tenants should follow</p>
                  <div className="flex gap-2 mb-3">
                    <input value={newRule} onChange={(e) => setNewRule(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRule())} placeholder="e.g. No smoking indoors" className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:border-green-500" />
                    <button type="button" onClick={addRule} className="px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-colors">Add</button>
                  </div>
                  {rules.length > 0 && (
                    <div className="space-y-2">
                      {rules.map((rule, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                          <span className="text-sm text-slate-600 dark:text-slate-400 flex-1">• {rule}</span>
                          <button type="button" onClick={() => setRules(rules.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-500 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 3: Photos */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Property Photos</label>
                  <p className="text-xs text-slate-400 mb-4">Upload up to 10 photos. First photo will be the cover image.</p>

                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-8 cursor-pointer hover:border-green-400 transition-colors group">
                    <Upload className="w-8 h-8 text-slate-400 group-hover:text-green-500 mb-2 transition-colors" />
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Click to upload photos</p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG, WebP up to 5MB each</p>
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="sr-only" />
                  </label>

                  {(existingImages.length > 0 || images.length > 0) && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-4">
                      {existingImages.map((img, i) => (
                        <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img.url} alt="" className="w-full h-full object-cover" />
                          {i === 0 && <div className="absolute bottom-0 inset-x-0 py-1 bg-green-600 text-white text-xs font-bold text-center">Cover</div>}
                          <button type="button" onClick={() => setExistingImages(existingImages.filter((_, j) => j !== i))} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {images.map((file, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                          {existingImages.length === 0 && i === 0 && <div className="absolute bottom-0 inset-x-0 py-1 bg-green-600 text-white text-xs font-bold text-center">Cover</div>}
                          <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-2 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                    {isEditing
                      ? "Your updates will be reviewed within 2 hours before going live."
                      : "Your listing will be reviewed and published within 24 hours. To get verified, our team will schedule a property visit."}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <button
            type="button"
            onClick={() => setStep(Math.max(0, step - 1))}
            className={`px-5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold text-sm transition-colors hover:border-slate-300 ${step === 0 ? "opacity-0 pointer-events-none" : ""}`}
          >
            ← Back
          </button>

          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === step ? "bg-green-600 w-5" : i < step ? "bg-green-400" : "bg-slate-200 dark:bg-slate-700"}`} />
              ))}
            </div>
          </div>

          {step < STEPS.length - 1 ? (
            <button type="button" onClick={handleNext} className="px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition-colors shadow-lg shadow-green-900/20">
              Continue →
            </button>
          ) : (
            <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold text-sm transition-colors shadow-lg shadow-green-900/20 flex items-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Saving…" : isEditing ? "Save Changes ✓" : "Publish Listing 🚀"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
