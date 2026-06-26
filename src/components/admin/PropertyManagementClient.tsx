"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Edit2, Trash2, Eye, EyeOff, Loader2, CheckCircle2,
  AlertCircle, X, Upload, ImageIcon, ChevronLeft, ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { MACHAKOS_AREAS, PROPERTY_TYPES, AMENITIES_LIST } from "@/lib/utils";
import type { Property } from "@/types";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

import type { PropertyImage } from "@/types";

interface PropertyWithImages extends Property {
  images: PropertyImage[];
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
  const [urls, setUrls] = useState<string[]>(existingUrls);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { onChange(urls); }, [urls, onChange]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const supabase = createClient();
    const newUrls: string[] = [];

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `properties/admin-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("property-images").upload(path, file, { upsert: false });
      if (!error) {
        const { data } = supabase.storage.from("property-images").getPublicUrl(path);
        newUrls.push(data.publicUrl);
      }
    }

    setUrls((prev) => [...prev, ...newUrls].slice(0, 10));
    setUploading(false);
  };

  const removeUrl = (url: string) => setUrls((prev) => prev.filter((u) => u !== url));

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {urls.map((url, i) => (
          <div key={url} className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 group">
            <Image src={url} alt="" fill className="object-cover" unoptimized />
            {i === 0 && (
              <span className="absolute top-1 left-1 text-[9px] font-bold bg-indigo-500 text-white px-1.5 py-0.5 rounded">
                Primary
              </span>
            )}
            <button
              type="button"
              onClick={() => removeUrl(url)}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {urls.length < 10 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="aspect-video rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span className="text-[10px] font-medium">Add Photo</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {urls.length === 0 && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl py-8 flex flex-col items-center gap-2 text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ImageIcon className="w-6 h-6" />}
          <p className="text-sm font-medium">{uploading ? "Uploading…" : "Click to upload photos"}</p>
          <p className="text-xs">JPG, PNG, WebP · Max 10 photos</p>
        </button>
      )}
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
}

const BLANK_FORM: FormState = {
  title: "", description: "", type: "bedsitter", price: "",
  price_period: "per_month", location: "", area: "",
  bedrooms: "0", bathrooms: "1", max_occupants: "2",
  furnishing: "semi_furnished", gender_preference: "any",
  distance_from_campus: "", is_available: true, is_featured: false,
  amenities: [], rules: [],
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
  };
}

function PropertyForm({
  initial,
  initialImages,
  onClose,
  onSaved,
}: {
  initial?: PropertyWithImages;
  initialImages?: string[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormState>(initial ? fromProperty(initial) : BLANK_FORM);
  const [imageUrls, setImageUrls] = useState<string[]>(initialImages ?? []);
  const [newRule, setNewRule] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
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
    setSaving(true); setError(null);

    const body = {
      ...form,
      id: initial?.id,
      price: Number(form.price),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      max_occupants: Number(form.max_occupants),
      distance_from_campus: form.distance_from_campus ? Number(form.distance_from_campus) : null,
      image_urls: imageUrls,
    };

    try {
      const res = await fetch(
        "/api/admin/properties/manage",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Failed to save property.");
        return;
      }
      setSuccess(true);
      setTimeout(() => { onSaved(); onClose(); }, 1200);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-green-600" />
        </div>
        <p className="font-bold text-slate-900 dark:text-white text-lg">
          {isEditing ? "Property updated!" : "Property created!"}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-start gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Basic info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="label">Title *</label>
          <input className="input" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Modern Bedsitter Near KU Gate" required />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Description *</label>
          <textarea className="input min-h-[80px] resize-none" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe the property…" required />
        </div>
        <div>
          <label className="label">Type *</label>
          <select className="input" value={form.type} onChange={(e) => set("type", e.target.value)}>
            {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Area *</label>
          <select className="input" value={form.area} onChange={(e) => set("area", e.target.value)}>
            <option value="">Select area</option>
            {MACHAKOS_AREAS.map((a) => <option key={a}>{a}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label">Exact Location *</label>
          <input className="input" value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Thika Road, 200m from KU main gate" required />
        </div>
        <div>
          <label className="label">Price (KES) *</label>
          <input className="input" type="number" min="0" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="12000" required />
        </div>
        <div>
          <label className="label">Period</label>
          <select className="input" value={form.price_period} onChange={(e) => set("price_period", e.target.value)}>
            <option value="per_month">Per Month</option>
            <option value="per_week">Per Week</option>
          </select>
        </div>
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
          <label className="label">Distance from Campus (km)</label>
          <input className="input" type="number" min="0" step="0.1" value={form.distance_from_campus} onChange={(e) => set("distance_from_campus", e.target.value)} placeholder="0.5" />
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
      </div>

      {/* Toggles */}
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_available} onChange={(e) => set("is_available", e.target.checked)} className="rounded border-slate-300" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Available</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_featured} onChange={(e) => set("is_featured", e.target.checked)} className="rounded border-slate-300" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Featured listing</span>
        </label>
      </div>

      {/* Amenities */}
      <div>
        <label className="label">Amenities</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {AMENITIES_LIST.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => toggleAmenity(a)}
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
      </div>

      {/* Rules */}
      <div>
        <label className="label">Rules</label>
        <div className="flex gap-2 mt-1">
          <input
            className="input flex-1"
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRule())}
            placeholder="e.g. No smoking"
          />
          <button type="button" onClick={addRule} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
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
      </div>

      {/* Photos */}
      <div>
        <label className="label">Photos</label>
        <ImageUploader
          existingUrls={imageUrls}
          onChange={setImageUrls}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:border-slate-300 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : isEditing ? "Save Changes" : "Create Property"}
        </button>
      </div>
    </form>
  );
}

// ─── Property Row ─────────────────────────────────────────────────────────────

function PropertyRow({
  property,
  onEdit,
  onDelete,
  onToggle,
}: {
  property: PropertyWithImages;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const img = property.images?.find((i) => i.is_primary)?.url ?? property.images?.[0]?.url;

  return (
    <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <td className="py-3 pl-4 pr-2 w-12">
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
          {img ? (
            <Image src={img} alt="" width={40} height={40} className="object-cover w-full h-full" unoptimized />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <ImageIcon className="w-4 h-4" />
            </div>
          )}
        </div>
      </td>
      <td className="py-3 px-2 min-w-0">
        <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">{property.title}</p>
        <p className="text-xs text-slate-400 truncate">{property.area} · {property.type.replace("_", " ")}</p>
      </td>
      <td className="py-3 px-2 text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
        KES {property.price.toLocaleString()}
      </td>
      <td className="py-3 px-2">
        <button
          onClick={onToggle}
          className={cn(
            "inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors",
            property.is_available
              ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200"
              : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200"
          )}
        >
          {property.is_available ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          {property.is_available ? "Available" : "Unavailable"}
        </button>
      </td>
      <td className="py-3 px-2 text-xs text-slate-400 whitespace-nowrap hidden md:table-cell">
        {property.images?.length ?? 0} photo{property.images?.length !== 1 ? "s" : ""}
      </td>
      <td className="py-3 pl-2 pr-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={onEdit}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600 transition-colors"
            title="Edit"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({ property, onCancel, onConfirm }: {
  property: PropertyWithImages; onCancel: () => void; onConfirm: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const doDelete = async () => {
    setDeleting(true);
    const res = await fetch(`/api/admin/properties/manage?id=${property.id}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) onConfirm();
  };

  return (
    <div className="p-6 text-center">
      <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center mx-auto mb-4">
        <Trash2 className="w-6 h-6 text-red-500" />
      </div>
      <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Delete Property?</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        &ldquo;{property.title}&rdquo; will be permanently deleted along with all its photos. This cannot be undone.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:border-slate-300 transition-colors">
          Cancel
        </button>
        <button onClick={doDelete} disabled={deleting} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          {deleting ? <><Loader2 className="w-4 h-4 animate-spin" />Deleting…</> : "Yes, Delete"}
        </button>
      </div>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title?: string; children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
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

export default function PropertyManagementClient() {
  const [properties, setProperties] = useState<PropertyWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [availFilter, setAvailFilter] = useState("");
  const [modal, setModal] = useState<"add" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<PropertyWithImages | null>(null);

  const fetchProperties = useCallback(async () => {
    setLoading(true); setError(null);
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set("search", search);
    if (availFilter) params.set("available", availFilter);

    const res = await fetch(`/api/admin/properties/manage?${params}`);
    if (!res.ok) { setError("Failed to load properties."); setLoading(false); return; }
    const json = await res.json();
    setProperties(json.data ?? []);
    setTotal(json.total ?? 0);
    setTotalPages(json.total_pages ?? 1);
    setLoading(false);
  }, [page, search, availFilter]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  const toggleAvailability = async (property: PropertyWithImages) => {
    await fetch("/api/admin/properties/manage", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: property.id, is_available: !property.is_available }),
    });
    fetchProperties();
  };

  const openEdit = (p: PropertyWithImages) => { setSelected(p); setModal("edit"); };
  const openDelete = (p: PropertyWithImages) => { setSelected(p); setModal("delete"); };
  const closeModal = () => { setModal(null); setSelected(null); };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Properties</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            {total} total · Add, edit, delete and toggle availability
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            className="flex-1 bg-transparent text-slate-800 dark:text-white placeholder-slate-400 outline-none text-sm"
            placeholder="Search properties…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          {search && (
            <button onClick={() => { setSearch(""); setPage(1); }} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <select
          value={availFilter}
          onChange={(e) => { setAvailFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm outline-none"
        >
          <option value="">All statuses</option>
          <option value="true">Available</option>
          <option value="false">Unavailable</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-slate-500">{error}</p>
            <button onClick={fetchProperties} className="mt-3 text-sm text-indigo-600 hover:underline">Retry</button>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-16">
            <ImageIcon className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No properties found</p>
            <button onClick={() => setModal("add")} className="mt-3 text-sm text-indigo-600 hover:underline font-semibold">
              Add your first property
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="py-3 pl-4 pr-2 w-12" />
                  <th className="py-3 px-2 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Property</th>
                  <th className="py-3 px-2 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Price</th>
                  <th className="py-3 px-2 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-2 text-left text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">Photos</th>
                  <th className="py-3 pl-2 pr-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((p) => (
                  <PropertyRow
                    key={p.id}
                    property={p}
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
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:border-indigo-400 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:border-indigo-400 disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Add modal */}
      <Modal open={modal === "add"} onClose={closeModal} title="Add New Property">
        <PropertyForm onClose={closeModal} onSaved={fetchProperties} />
      </Modal>

      {/* Edit modal */}
      <Modal open={modal === "edit" && !!selected} onClose={closeModal} title="Edit Property">
        {selected && (
          <PropertyForm
            initial={selected}
            initialImages={selected.images?.map((i) => i.url) ?? []}
            onClose={closeModal}
            onSaved={fetchProperties}
          />
        )}
      </Modal>

      {/* Delete modal */}
      <Modal open={modal === "delete" && !!selected} onClose={closeModal}>
        {selected && (
          <DeleteConfirm
            property={selected}
            onCancel={closeModal}
            onConfirm={() => { closeModal(); fetchProperties(); }}
          />
        )}
      </Modal>
    </div>
  );
}
