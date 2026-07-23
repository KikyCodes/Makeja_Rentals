"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Edit2, Trash2, Eye, EyeOff, Loader2, CheckCircle2,
  AlertCircle, X, Upload, ImageIcon, ChevronLeft, ChevronRight,
  ExternalLink, ChevronDown, SlidersHorizontal, ArrowUpDown,
  MapPin, Calendar, Tag, Home,
} from "lucide-react";
import Image from "next/image";
import { MACHAKOS_AREAS, PROPERTY_TYPES, AMENITIES_LIST, formatPrice, formatPropertyType } from "@/lib/utils";
import type { Property, PropertyImage } from "@/types";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PropertyWithImages extends Property {
  images: PropertyImage[];
}

// ─── Toast System ─────────────────────────────────────────────────────────────

type ToastType = "success" | "error";
interface Toast { id: number; type: ToastType; message: string }

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.95 }}
            className={cn(
              "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium max-w-sm",
              t.type === "success"
                ? "bg-emerald-600 text-white"
                : "bg-red-600 text-white"
            )}
          >
            {t.type === "success"
              ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <span className="flex-1">{t.message}</span>
            <button onClick={() => onDismiss(t.id)} className="opacity-70 hover:opacity-100 transition-opacity">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const push = useCallback((type: ToastType, message: string) => {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, toast: push, dismiss };
}

// ─── Image Uploader ───────────────────────────────────────────────────────────

function ImageUploader({
  existingUrls,
  onChange,
}: {
  existingUrls: string[];
  onChange: (urls: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [urls, setUrls] = useState<string[]>(existingUrls);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync to parent whenever urls changes
  useEffect(() => { onChange(urls); }, [urls]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError(null);
    const newUrls: string[] = [];

    for (const file of Array.from(files)) {
      // Show an immediate local preview so the user sees something right away
      const localPreview = URL.createObjectURL(file);
      setUrls((prev) => [...prev, localPreview].slice(0, 10));

      const fd = new FormData();
      fd.append("file", file);

      try {
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          // Remove the local preview we added optimistically
          setUrls((prev) => prev.filter((u) => u !== localPreview));
          setUploadError(json.error ?? `Upload failed (${res.status})`);
          break;
        }

        // Replace the local blob URL with the permanent storage URL
        setUrls((prev) => prev.map((u) => (u === localPreview ? json.url : u)));
        newUrls.push(json.url);
      } catch (e) {
        setUrls((prev) => prev.filter((u) => u !== localPreview));
        setUploadError(e instanceof Error ? e.message : "Network error during upload");
        break;
      }
    }

    // Reset the file input so the same file can be selected again
    if (inputRef.current) inputRef.current.value = "";
    setUploading(false);
  };

  const removeUrl = (url: string) => {
    URL.revokeObjectURL(url); // clean up any blob URLs
    setUrls((prev) => prev.filter((u) => u !== url));
  };

  const moveFirst = (url: string) =>
    setUrls((prev) => [url, ...prev.filter((u) => u !== url)]);

  return (
    <div className="space-y-3">
      {/* Upload error banner */}
      {uploadError && (
        <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2.5">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-red-700 dark:text-red-300">Upload failed</p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5 break-words">{uploadError}</p>
          </div>
          <button type="button" onClick={() => setUploadError(null)} className="text-red-400 hover:text-red-600 flex-shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Image grid */}
      {urls.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {urls.map((url, i) => (
            <div key={url} className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 group">
              <Image src={url} alt="" fill className="object-cover" unoptimized />
              {i === 0 && (
                <span className="absolute top-1 left-1 text-[9px] font-bold bg-indigo-500 text-white px-1.5 py-0.5 rounded">
                  Primary
                </span>
              )}
              {/* Show spinner on blob URLs (still uploading) */}
              {url.startsWith("blob:") && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                {i !== 0 && (
                  <button
                    type="button"
                    onClick={() => moveFirst(url)}
                    title="Set as primary"
                    className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-bold"
                  >
                    ★
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeUrl(url)}
                  className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}

          {urls.length < 10 && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="aspect-video rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors disabled:opacity-50"
            >
              {uploading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <><Upload className="w-4 h-4" /><span className="text-[10px] font-medium">Add</span></>}
            </button>
          )}
        </div>
      )}

      {/* Empty state drop zone */}
      {urls.length === 0 && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl py-10 flex flex-col items-center gap-2 text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors disabled:opacity-50"
        >
          {uploading
            ? <Loader2 className="w-6 h-6 animate-spin" />
            : <ImageIcon className="w-7 h-7" />}
          <p className="text-sm font-medium">{uploading ? "Uploading…" : "Click to upload photos"}</p>
          <p className="text-xs">JPG, PNG, WebP · up to 10 MB each · max 10 photos</p>
          <p className="text-xs text-slate-300 dark:text-slate-600">Hover a photo to remove it or set it as the primary image</p>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}

// ─── Landlord Photo Uploader ──────────────────────────────────────────────────

function LandlordPhotoUploader({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) { setError(json.error ?? "Upload failed"); return; }
      onChange(json.url);
    } catch {
      setError("Network error during upload");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 shrink-0">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition-colors flex items-center justify-center bg-slate-50 dark:bg-slate-800 disabled:opacity-50"
        title="Upload landlord photo"
      >
        {value ? (
          <Image src={value} alt="Landlord" fill className="object-cover" unoptimized />
        ) : uploading ? (
          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
        ) : (
          <Upload className="w-5 h-5 text-slate-400" />
        )}
      </button>
      <span className="text-[10px] text-slate-400 text-center leading-tight">
        {value ? "Click to change" : "Photo\n(optional)"}
      </span>
      {error && <p className="text-[10px] text-red-500 text-center">{error}</p>}
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="text-[10px] text-red-400 hover:text-red-600"
        >
          Remove
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}

// ─── Property Form ─────────────────────────────────────────────────────────────

interface FormState {
  title: string; description: string; type: string; price: string;
  price_period: string; location: string; area: string;
  bedrooms: string; bathrooms: string; max_occupants: string;
  furnishing: string; gender_preference: string; distance_from_campus: string;
  is_available: boolean; is_featured: boolean;
  amenities: string[]; rules: string[];
  landlord_name: string; landlord_phone: string; landlord_whatsapp: string;
  landlord_email: string; landlord_photo: string;
  landlord_agency: string; landlord_is_verified: boolean;
}

const BLANK_FORM: FormState = {
  title: "", description: "", type: "bedsitter", price: "",
  price_period: "per_month", location: "", area: "",
  bedrooms: "0", bathrooms: "1", max_occupants: "2",
  furnishing: "semi_furnished", gender_preference: "any",
  distance_from_campus: "", is_available: true, is_featured: false,
  amenities: [], rules: [],
  landlord_name: "", landlord_phone: "", landlord_whatsapp: "",
  landlord_email: "", landlord_photo: "", landlord_agency: "",
  landlord_is_verified: false,
};

function fromProperty(p: PropertyWithImages): FormState {
  return {
    title: p.title, description: p.description, type: p.type,
    price: String(p.price), price_period: p.price_period,
    location: p.location, area: p.area,
    bedrooms: String(p.bedrooms), bathrooms: String(p.bathrooms),
    max_occupants: String(p.max_occupants), furnishing: p.furnishing,
    gender_preference: p.gender_preference,
    distance_from_campus: p.distance_from_campus ? String(p.distance_from_campus) : "",
    is_available: p.is_available, is_featured: p.is_featured,
    amenities: p.amenities ?? [], rules: p.rules ?? [],
    landlord_name: p.landlord_name ?? "",
    landlord_phone: p.landlord_phone ?? "",
    landlord_whatsapp: p.landlord_whatsapp ?? "",
    landlord_email: p.landlord_email ?? "",
    landlord_photo: p.landlord_photo ?? "",
    landlord_agency: p.landlord_agency ?? "",
    landlord_is_verified: p.landlord_is_verified ?? false,
  };
}

function PropertyForm({
  initial, initialImages, onClose, onSaved, onToast,
}: {
  initial?: PropertyWithImages;
  initialImages?: string[];
  onClose: () => void;
  onSaved: () => void;
  onToast: (type: "success" | "error", msg: string) => void;
}) {
  const [form, setForm] = useState<FormState>(initial ? fromProperty(initial) : BLANK_FORM);
  const [imageUrls, setImageUrls] = useState<string[]>(initialImages ?? []);
  const [newRule, setNewRule] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditing = !!initial;

  const set = (field: keyof FormState, value: unknown) =>
    setForm((f) => ({ ...f, [field]: value }));

  const toggleAmenity = (a: string) =>
    set("amenities", form.amenities.includes(a)
      ? form.amenities.filter((x) => x !== a)
      : [...form.amenities, a]);

  const addRule = () => {
    if (newRule.trim()) { set("rules", [...form.rules, newRule.trim()]); setNewRule(""); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.price || !form.area || !form.location) {
      setError("Please fill in all required fields."); return;
    }
    if (form.title.length < 10) {
      setError("Title must be at least 10 characters."); return;
    }
    if (form.description.length < 30) {
      setError("Description must be at least 30 characters."); return;
    }
    setSaving(true); setError(null);

    const body = {
      ...form,
      id: initial?.id,
      price: Number(form.price),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      max_occupants: Number(form.max_occupants),
      distance_from_campus: form.distance_from_campus ? Number(form.distance_from_campus) : null,
      landlord_name: form.landlord_name.trim() || null,
      landlord_phone: form.landlord_phone.trim() || null,
      landlord_whatsapp: form.landlord_whatsapp.trim() || null,
      landlord_email: form.landlord_email.trim() || null,
      landlord_photo: form.landlord_photo.trim() || null,
      landlord_agency: form.landlord_agency.trim() || null,
      landlord_is_verified: form.landlord_is_verified,
      image_urls: imageUrls,
    };

    try {
      const res = await fetch("/api/admin/properties/manage", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        const msg = d.error ?? `Server error (${res.status})`;
        setError(msg);
        onToast("error", msg);
        return;
      }
      onToast("success", isEditing ? "Property updated successfully." : "Property created successfully.");
      onSaved();
      onClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Network error.";
      setError(msg);
      onToast("error", msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-start gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Section: Basic Info */}
      <fieldset>
        <legend className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Basic Info</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Title *</label>
            <input className="input" value={form.title} onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Modern Bedsitter Near KU Gate" required />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Description *</label>
            <textarea className="input min-h-[90px] resize-none" value={form.description}
              onChange={(e) => set("description", e.target.value)} placeholder="Describe the property…" required />
          </div>
          <div>
            <label className="label">Property Type *</label>
            <select className="input" value={form.type} onChange={(e) => set("type", e.target.value)}>
              {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Area / Town *</label>
            <select className="input" value={form.area} onChange={(e) => set("area", e.target.value)}>
              <option value="">Select area</option>
              {MACHAKOS_AREAS.map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Exact Location *</label>
            <input className="input" value={form.location} onChange={(e) => set("location", e.target.value)}
              placeholder="e.g. Thika Road, 200m from KU main gate" required />
          </div>
        </div>
      </fieldset>

      {/* Section: Pricing */}
      <fieldset>
        <legend className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Pricing</legend>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Rent (KES) *</label>
            <input className="input" type="number" min="0" value={form.price}
              onChange={(e) => set("price", e.target.value)} placeholder="12000" required />
          </div>
          <div>
            <label className="label">Period</label>
            <select className="input" value={form.price_period} onChange={(e) => set("price_period", e.target.value)}>
              <option value="per_month">Per Month</option>
              <option value="per_week">Per Week</option>
            </select>
          </div>
        </div>
      </fieldset>

      {/* Section: Details */}
      <fieldset>
        <legend className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Details</legend>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Bedrooms</label>
            <input className="input" type="number" min="0" value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} />
          </div>
          <div>
            <label className="label">Bathrooms</label>
            <input className="input" type="number" min="1" value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} />
          </div>
          <div>
            <label className="label">Max Occupants</label>
            <input className="input" type="number" min="1" value={form.max_occupants} onChange={(e) => set("max_occupants", e.target.value)} />
          </div>
          <div>
            <label className="label">Furnishing</label>
            <select className="input" value={form.furnishing} onChange={(e) => set("furnishing", e.target.value)}>
              <option value="furnished">Furnished</option>
              <option value="semi_furnished">Semi-furnished</option>
              <option value="unfurnished">Unfurnished</option>
            </select>
          </div>
          <div>
            <label className="label">Gender Preference</label>
            <select className="input" value={form.gender_preference} onChange={(e) => set("gender_preference", e.target.value)}>
              <option value="any">Any</option>
              <option value="male">Male only</option>
              <option value="female">Female only</option>
            </select>
          </div>
          <div>
            <label className="label">Distance from Campus (km)</label>
            <input className="input" type="number" min="0" step="0.1" value={form.distance_from_campus}
              onChange={(e) => set("distance_from_campus", e.target.value)} placeholder="0.5" />
          </div>
        </div>
      </fieldset>

      {/* Section: Status */}
      <fieldset>
        <legend className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Listing Status</legend>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_available} onChange={(e) => set("is_available", e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 accent-indigo-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Available to rent</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_featured} onChange={(e) => set("is_featured", e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 accent-indigo-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Featured listing</span>
          </label>
        </div>
      </fieldset>

      {/* Section: Amenities */}
      <fieldset>
        <legend className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Amenities</legend>
        <div className="flex flex-wrap gap-2">
          {AMENITIES_LIST.map((a) => (
            <button key={a} type="button" onClick={() => toggleAmenity(a)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-full border font-medium transition-colors",
                form.amenities.includes(a)
                  ? "bg-indigo-500 border-indigo-500 text-white"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400"
              )}
            >
              {a}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Section: Rules */}
      <fieldset>
        <legend className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">House Rules</legend>
        <div className="flex gap-2">
          <input className="input flex-1" value={newRule} onChange={(e) => setNewRule(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRule())}
            placeholder="e.g. No smoking · press Enter to add" />
          <button type="button" onClick={addRule}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            Add
          </button>
        </div>
        {form.rules.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {form.rules.map((r) => (
              <span key={r} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full">
                {r}
                <button type="button" onClick={() => set("rules", form.rules.filter((x) => x !== r))}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </fieldset>

      {/* Section: Landlord Contact */}
      <fieldset>
        <legend className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Landlord / Contact Info</legend>

        {/* Photo + Name row */}
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar upload */}
          <LandlordPhotoUploader
            value={form.landlord_photo}
            onChange={(url) => set("landlord_photo", url)}
          />
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Full Name</label>
              <input className="input" value={form.landlord_name}
                onChange={(e) => set("landlord_name", e.target.value)}
                placeholder="e.g. John Kamau" />
            </div>
            <div>
              <label className="label">Agency / Company Name <span className="text-slate-400 font-normal">(optional)</span></label>
              <input className="input" value={form.landlord_agency}
                onChange={(e) => set("landlord_agency", e.target.value)}
                placeholder="e.g. Kamau Properties" />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="landlord_is_verified"
                checked={form.landlord_is_verified}
                onChange={(e) => set("landlord_is_verified", e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 accent-indigo-500"
              />
              <label htmlFor="landlord_is_verified" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                Verified Landlord
              </label>
            </div>
          </div>
        </div>

        {/* Contact fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Phone Number</label>
            <input className="input" type="tel" value={form.landlord_phone}
              onChange={(e) => set("landlord_phone", e.target.value)}
              placeholder="0712 345 678" />
          </div>
          <div>
            <label className="label">WhatsApp <span className="text-slate-400 font-normal">(if different)</span></label>
            <input className="input" type="tel" value={form.landlord_whatsapp}
              onChange={(e) => set("landlord_whatsapp", e.target.value)}
              placeholder="0712 345 678" />
          </div>
          <div>
            <label className="label">Email Address <span className="text-slate-400 font-normal">(optional)</span></label>
            <input className="input" type="email" value={form.landlord_email}
              onChange={(e) => set("landlord_email", e.target.value)}
              placeholder="landlord@example.com" />
          </div>
        </div>
      </fieldset>

      {/* Section: Photos */}
      <fieldset>
        <legend className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Photos</legend>
        <ImageUploader existingUrls={imageUrls} onChange={setImageUrls} />
      </fieldset>

      {/* Actions */}
      <div className="flex gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button type="button" onClick={onClose}
          className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:border-slate-300 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={saving}
          className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          {saving
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
            : isEditing ? "Save Changes" : "Create Property"}
        </button>
      </div>
    </form>
  );
}

// ─── View Modal ───────────────────────────────────────────────────────────────

function ViewModal({ property, onClose, onEdit }: {
  property: PropertyWithImages;
  onClose: () => void;
  onEdit: () => void;
}) {
  const [imgIdx, setImgIdx] = useState(0);
  const imgs = property.images ?? [];
  const sorted = [...imgs].sort((a, b) => (a.is_primary ? -1 : b.is_primary ? 1 : 0));
  const current = sorted[imgIdx];

  return (
    <div className="space-y-5">
      {/* Image gallery */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
        {current ? (
          <Image src={current.url} alt={property.title} fill className="object-cover" unoptimized />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-slate-300 dark:text-slate-600" />
          </div>
        )}
        {sorted.length > 1 && (
          <>
            <button onClick={() => setImgIdx((i) => (i - 1 + sorted.length) % sorted.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setImgIdx((i) => (i + 1) % sorted.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {sorted.map((_, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  className={cn("w-1.5 h-1.5 rounded-full transition-colors",
                    i === imgIdx ? "bg-white" : "bg-white/40")} />
              ))}
            </div>
            <span className="absolute top-2 right-2 text-xs bg-black/50 text-white px-2 py-0.5 rounded-full">
              {imgIdx + 1} / {sorted.length}
            </span>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sorted.map((img, i) => (
            <button key={img.id} onClick={() => setImgIdx(i)}
              className={cn("relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors",
                i === imgIdx ? "border-indigo-500" : "border-transparent"
              )}>
              <Image src={img.url} alt="" fill className="object-cover" unoptimized />
            </button>
          ))}
        </div>
      )}

      {/* Details */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">{property.title}</h2>
          <span className={cn(
            "text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 mt-0.5",
            property.is_available
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
              : "bg-slate-100 text-slate-500 dark:bg-slate-800"
          )}>
            {property.is_available ? "Available" : "Unavailable"}
          </span>
        </div>
        <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
          {formatPrice(property.price)}
          <span className="text-sm font-medium text-slate-400 ml-1">/{property.price_period === "per_month" ? "mo" : "wk"}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: MapPin, label: "Location", value: `${property.area} · ${property.location}` },
          { icon: Tag, label: "Type", value: formatPropertyType(property.type) },
          { icon: Home, label: "Size", value: `${property.bedrooms} bed · ${property.bathrooms} bath · max ${property.max_occupants}` },
          { icon: Calendar, label: "Added", value: new Date(property.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Icon className="w-3.5 h-3.5" />
              {label}
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{value}</p>
          </div>
        ))}
      </div>

      {property.description && (
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Description</p>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{property.description}</p>
        </div>
      )}

      {(property.amenities?.length ?? 0) > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Amenities</p>
          <div className="flex flex-wrap gap-1.5">
            {property.amenities.map((a) => (
              <span key={a} className="text-xs px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-300 rounded-full font-medium">
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

      {(property.rules?.length ?? 0) > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">House Rules</p>
          <ul className="space-y-1">
            {property.rules.map((r) => (
              <li key={r} className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button onClick={onClose}
          className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:border-slate-300 transition-colors">
          Close
        </button>
        <button onClick={onEdit}
          className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2">
          <Edit2 className="w-4 h-4" /> Edit Property
        </button>
        <a
          href={`/listings`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:border-slate-300 transition-colors flex items-center gap-1.5"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

// ─── Property Row ─────────────────────────────────────────────────────────────

function PropertyRow({
  property, onView, onEdit, onDelete, onToggle,
}: {
  property: PropertyWithImages;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const primaryImg = property.images?.find((i) => i.is_primary)?.url ?? property.images?.[0]?.url;

  return (
    <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
      {/* Thumbnail */}
      <td className="py-3 pl-4 pr-2 w-14">
        <div className="w-11 h-11 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
          {primaryImg
            ? <Image src={primaryImg} alt="" width={44} height={44} className="object-cover w-full h-full" unoptimized />
            : <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon className="w-4 h-4" /></div>
          }
        </div>
      </td>
      {/* Title + Area */}
      <td className="py-3 px-2 min-w-0 max-w-[200px]">
        <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">{property.title}</p>
        <p className="text-xs text-slate-400 truncate mt-0.5 flex items-center gap-1">
          <MapPin className="w-3 h-3 flex-shrink-0" />{property.area}
        </p>
      </td>
      {/* Type */}
      <td className="py-3 px-2 hidden sm:table-cell">
        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
          {formatPropertyType(property.type)}
        </span>
      </td>
      {/* Price */}
      <td className="py-3 px-2 text-sm font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
        {formatPrice(property.price)}
        <span className="text-[10px] text-slate-400 ml-0.5">/mo</span>
      </td>
      {/* Status */}
      <td className="py-3 px-2">
        <button onClick={onToggle}
          className={cn(
            "inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors",
            property.is_available
              ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200"
              : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200"
          )}
        >
          {property.is_available ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          {property.is_available ? "Available" : "Hidden"}
        </button>
      </td>
      {/* Date */}
      <td className="py-3 px-2 text-xs text-slate-400 whitespace-nowrap hidden lg:table-cell">
        {new Date(property.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
      </td>
      {/* Actions */}
      <td className="py-3 pl-2 pr-4 text-right">
        <div className="flex items-center justify-end gap-0.5">
          <button onClick={onView} title="View"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition-colors">
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button onClick={onEdit} title="Edit"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600 transition-colors">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete} title="Delete"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({ property, onCancel, onConfirm, onToast }: {
  property: PropertyWithImages;
  onCancel: () => void;
  onConfirm: () => void;
  onToast: (type: "success" | "error", msg: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const doDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/properties/manage?id=${property.id}`, { method: "DELETE" });
      if (res.ok) {
        onToast("success", `"${property.title}" deleted.`);
        onConfirm();
      } else {
        const d = await res.json().catch(() => ({}));
        onToast("error", d.error ?? "Failed to delete property.");
      }
    } catch {
      onToast("error", "Network error while deleting.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 text-center">
      <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center mx-auto mb-4">
        <Trash2 className="w-7 h-7 text-red-500" />
      </div>
      <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Delete Property?</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
        <span className="font-semibold text-slate-700 dark:text-slate-300">&ldquo;{property.title}&rdquo;</span> will be permanently removed from the platform along with all its photos.
      </p>
      <p className="text-xs text-red-500 mb-6">This cannot be undone.</p>
      <div className="flex gap-3">
        <button onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:border-slate-300 transition-colors">
          Cancel
        </button>
        <button onClick={doDelete} disabled={deleting}
          className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          {deleting ? <><Loader2 className="w-4 h-4 animate-spin" />Deleting…</> : "Yes, Delete"}
        </button>
      </div>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({ open, onClose, title, wide, children }: {
  open: boolean; onClose: () => void; title?: string; wide?: boolean; children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
            className={cn(
              "bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-h-[92vh] flex flex-col overflow-hidden",
              wide ? "max-w-2xl" : "max-w-lg"
            )}
          >
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
                <h2 className="font-black text-slate-900 dark:text-white text-lg">{title}</h2>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            <div className="overflow-y-auto flex-1 p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "price_asc", label: "Price: low → high" },
  { value: "price_desc", label: "Price: high → low" },
];

type ModalMode = "add" | "edit" | "delete" | "view" | null;

export default function PropertyManagementClient() {
  const { toasts, toast, dismiss } = useToast();

  const [properties, setProperties] = useState<PropertyWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  // Filters
  const [search, setSearch] = useState("");
  const [availFilter, setAvailFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sort, setSort] = useState("newest");

  // Modal state
  const [modal, setModal] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<PropertyWithImages | null>(null);

  const fetchProperties = useCallback(async () => {
    setLoading(true); setError(null);
    const params = new URLSearchParams({ page: String(page), sort });
    if (search) params.set("search", search);
    if (availFilter) params.set("available", availFilter);
    if (typeFilter) params.set("type", typeFilter);

    try {
      const res = await fetch(`/api/admin/properties/manage?${params}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? `Server error (${res.status})`);
        return;
      }
      const json = await res.json();
      setProperties(json.data ?? []);
      setTotal(json.total ?? 0);
      setTotalPages(json.total_pages ?? 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error — could not reach server.");
    } finally {
      setLoading(false);
    }
  }, [page, search, availFilter, typeFilter, sort]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  const toggleAvailability = async (property: PropertyWithImages) => {
    // Optimistic update
    const next = !property.is_available;
    setProperties((prev) => prev.map((p) => p.id === property.id ? { ...p, is_available: next } : p));
    try {
      const res = await fetch("/api/admin/properties/manage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: property.id, is_available: next }),
      });
      if (!res.ok) {
        // Revert on failure
        setProperties((prev) => prev.map((p) => p.id === property.id ? { ...p, is_available: !next } : p));
        toast("error", "Failed to update availability.");
      } else {
        toast("success", `Marked as ${next ? "available" : "unavailable"}.`);
      }
    } catch {
      setProperties((prev) => prev.map((p) => p.id === property.id ? { ...p, is_available: !next } : p));
      toast("error", "Network error.");
    }
  };

  const openView = (p: PropertyWithImages) => { setSelected(p); setModal("view"); };
  const openEdit = (p: PropertyWithImages) => { setSelected(p); setModal("edit"); };
  const openDelete = (p: PropertyWithImages) => { setSelected(p); setModal("delete"); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const activeFilters = [search, availFilter, typeFilter].filter(Boolean).length;

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Properties</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-sm">
              {loading ? "Loading…" : `${total} listing${total !== 1 ? "s" : ""} · manage all properties`}
            </p>
          </div>
          <button
            onClick={() => setModal("add")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Property
          </button>
        </div>

        {/* Filter bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-3 flex flex-col sm:flex-row gap-2.5">
          {/* Search */}
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              className="flex-1 bg-transparent text-slate-800 dark:text-white placeholder-slate-400 outline-none text-sm"
              placeholder="Search by title or location…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
            {search && (
              <button onClick={() => { setSearch(""); setPage(1); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Type filter */}
          <div className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300">
            <Tag className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="bg-transparent outline-none cursor-pointer appearance-none pr-5 text-sm"
            >
              <option value="">All types</option>
              {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
          </div>

          {/* Availability filter */}
          <div className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <select
              value={availFilter}
              onChange={(e) => { setAvailFilter(e.target.value); setPage(1); }}
              className="bg-transparent outline-none cursor-pointer appearance-none pr-5 text-sm"
            >
              <option value="">All statuses</option>
              <option value="true">Available</option>
              <option value="false">Unavailable</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
          </div>

          {/* Sort */}
          <div className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="bg-transparent outline-none cursor-pointer appearance-none pr-5 text-sm"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
          </div>

          {/* Clear filters */}
          {activeFilters > 0 && (
            <button
              onClick={() => { setSearch(""); setAvailFilter(""); setTypeFilter(""); setSort("newest"); setPage(1); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors whitespace-nowrap"
            >
              <X className="w-3.5 h-3.5" />
              Clear ({activeFilters})
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-16 px-4">
              <AlertCircle className="w-9 h-9 text-red-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Failed to load properties</p>
              <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">{error}</p>
              <button onClick={fetchProperties}
                className="text-sm text-indigo-600 font-semibold hover:underline">
                Retry
              </button>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-16">
              <ImageIcon className="w-9 h-9 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                {activeFilters > 0 ? "No properties match your filters." : "No properties yet."}
              </p>
              {activeFilters > 0 ? (
                <button onClick={() => { setSearch(""); setAvailFilter(""); setTypeFilter(""); }}
                  className="mt-2 text-sm text-indigo-600 hover:underline font-semibold">
                  Clear filters
                </button>
              ) : (
                <button onClick={() => setModal("add")}
                  className="mt-2 text-sm text-indigo-600 hover:underline font-semibold">
                  Add your first property
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    <th className="py-3 pl-4 pr-2 w-14" />
                    <th className="py-3 px-2 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Property</th>
                    <th className="py-3 px-2 text-left text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Type</th>
                    <th className="py-3 px-2 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Price</th>
                    <th className="py-3 px-2 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="py-3 px-2 text-left text-xs font-bold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Date Added</th>
                    <th className="py-3 pl-2 pr-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((p) => (
                    <PropertyRow
                      key={p.id}
                      property={p}
                      onView={() => openView(p)}
                      onEdit={() => openEdit(p)}
                      onDelete={() => openDelete(p)}
                      onToggle={() => toggleAvailability(p)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Page {page} of {totalPages} · {total} total
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 text-sm hover:border-indigo-400 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 text-sm hover:border-indigo-400 disabled:opacity-40 transition-colors"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal open={modal === "add"} onClose={closeModal} title="Add New Property" wide>
        <PropertyForm onClose={closeModal} onSaved={fetchProperties} onToast={toast} />
      </Modal>

      <Modal open={modal === "edit" && !!selected} onClose={closeModal} title="Edit Property" wide>
        {selected && (
          <PropertyForm
            initial={selected}
            initialImages={selected.images?.map((i) => i.url) ?? []}
            onClose={closeModal}
            onSaved={fetchProperties}
            onToast={toast}
          />
        )}
      </Modal>

      <Modal open={modal === "view" && !!selected} onClose={closeModal} wide>
        {selected && (
          <ViewModal
            property={selected}
            onClose={closeModal}
            onEdit={() => { setModal("edit"); }}
          />
        )}
      </Modal>

      <Modal open={modal === "delete" && !!selected} onClose={closeModal}>
        {selected && (
          <DeleteConfirm
            property={selected}
            onCancel={closeModal}
            onConfirm={() => { closeModal(); fetchProperties(); }}
            onToast={toast}
          />
        )}
      </Modal>
    </>
  );
}
