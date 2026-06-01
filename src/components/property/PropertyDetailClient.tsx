"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin, Bed, Bath, Users, Wifi, ShieldCheck, Heart,
  Share2, Phone, MessageCircle, ChevronLeft, ChevronRight,
  Star, Eye, Calendar, CheckCircle, XCircle, Zap
} from "lucide-react";
import { formatPrice, formatPropertyType } from "@/lib/utils";
import type { Property } from "@/types";

// Mock property — replace with Supabase fetch
const MOCK: Property = {
  id: "1", landlord_id: "l1",
  title: "Modern Bedsitter Near Machakos University",
  description: `A beautifully designed bedsitter located just 5 minutes walk from Machakos University main gate. The unit features premium finishes, large windows for natural light, and comes with essential furniture.

Perfect for students who value comfort and convenience. The compound has 24-hour security, CCTV surveillance, and a reliable borehole water supply. WiFi is included in the rent.

The neighborhood is calm, well-lit at night, and close to local shops, eateries, and public transport.`,
  type: "bedsitter", price: 5500, price_period: "per_month",
  location: "Gate B Road, Off University Way, Machakos",
  area: "Machakos Town",
  latitude: -1.5177, longitude: 37.2634,
  bedrooms: 0, bathrooms: 1, max_occupants: 2,
  furnishing: "semi_furnished",
  amenities: ["WiFi", "Water 24/7", "Security Guard", "CCTV", "Near Campus", "Public Transport"],
  rules: ["No smoking", "No loud music after 10pm", "Guests must sign in"],
  is_available: true, is_verified: true, is_featured: true, views_count: 243,
  distance_from_campus: 0.3, gender_preference: "any",
  created_at: "2025-01-15T09:00:00Z", updated_at: "2025-05-10T12:00:00Z",
  landlord: { id: "l1", email: "john@example.com", full_name: "John Mwangi", avatar_url: null, phone: "+254712345678", role: "landlord", is_verified: true, created_at: "2024-06-01T00:00:00Z" },
  images: [
    { id: "i1", property_id: "1", url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200", is_primary: true, order: 0 },
    { id: "i2", property_id: "1", url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200", is_primary: false, order: 1 },
    { id: "i3", property_id: "1", url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200", is_primary: false, order: 2 },
    { id: "i4", property_id: "1", url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200", is_primary: false, order: 3 },
  ],
};

export default function PropertyDetailClient({ id }: { id: string }) {
  const property = MOCK;
  const [currentImage, setCurrentImage] = useState(0);
  const [liked, setLiked] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const images = property.images ?? [];
  const prev = () => setCurrentImage((i) => (i - 1 + images.length) % images.length);
  const next = () => setCurrentImage((i) => (i + 1) % images.length);

  return (
    <main className="pt-16 min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/" className="hover:text-green-600">Home</Link>
          <span>/</span>
          <Link href="/listings" className="hover:text-green-600">Listings</Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white truncate">{property.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Images + Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-900 aspect-[16/10]">
              {images[currentImage] && (
                <Image
                  src={images[currentImage].url}
                  alt={`${property.title} — photo ${currentImage + 1}`}
                  fill
                  className="object-cover"
                  priority
                />
              )}

              {/* Nav buttons */}
              {images.length > 1 && (
                <>
                  <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass-dark flex items-center justify-center text-white hover:bg-black/40 transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass-dark flex items-center justify-center text-white hover:bg-black/40 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Counter */}
              <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full glass-dark text-white text-xs font-medium">
                {currentImage + 1} / {images.length}
              </div>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                {property.is_verified && (
                  <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-600 text-white text-xs font-bold">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </span>
                )}
                {property.is_featured && (
                  <span className="px-3 py-1.5 rounded-full bg-amber-500 text-white text-xs font-bold">
                    Featured
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => setLiked(!liked)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${liked ? "bg-red-500 text-white" : "glass-dark text-white hover:bg-red-500"}`}
                >
                  <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
                </button>
                <button className="w-9 h-9 rounded-full glass-dark flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setCurrentImage(i)}
                    className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${i === currentImage ? "border-green-500" : "border-transparent opacity-60 hover:opacity-100"}`}
                  >
                    <Image src={img.url} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Title + Meta */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium">
                  {formatPropertyType(property.type)}
                </span>
                <span className="flex items-center gap-1 text-slate-500 text-sm">
                  <Eye className="w-4 h-4" /> {property.views_count} views
                </span>
                <span className="flex items-center gap-1 text-slate-500 text-sm">
                  <Calendar className="w-4 h-4" />
                  Listed {new Date(property.created_at).toLocaleDateString("en-KE", { month: "long", year: "numeric" })}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-3">
                {property.title}
              </h1>

              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-6">
                <MapPin className="w-4 h-4 text-green-600 shrink-0" />
                <span>{property.location}</span>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {[
                  { icon: Bed, label: "Bedrooms", value: property.bedrooms === 0 ? "Studio/Bedsitter" : `${property.bedrooms}` },
                  { icon: Bath, label: "Bathrooms", value: `${property.bathrooms}` },
                  { icon: Users, label: "Max Occupants", value: `${property.max_occupants}` },
                  { icon: Zap, label: "Furnishing", value: property.furnishing.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()) },
                ].map((s) => (
                  <div key={s.label} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center">
                    <s.icon className="w-5 h-5 text-green-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
                    <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 capitalize">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-3">About this listing</h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line text-sm">
                  {property.description}
                </p>
              </div>

              {/* Amenities */}
              <div className="mb-8">
                <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50 text-sm text-green-800 dark:text-green-400">
                      <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>

              {/* Rules */}
              {property.rules.length > 0 && (
                <div>
                  <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-4">House Rules</h2>
                  <div className="space-y-2">
                    {property.rules.map((rule) => (
                      <div key={rule} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                        {rule}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Pricing + Contact */}
          <div className="lg:col-span-1 space-y-4">
            <div className="sticky top-24 space-y-4">
              {/* Price card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                <div className="mb-4">
                  <span className="text-3xl font-black text-green-600">{formatPrice(property.price)}</span>
                  <span className="text-slate-400 text-sm ml-1">/{property.price_period === "per_month" ? "month" : "week"}</span>
                </div>

                <div className={`flex items-center gap-2 mb-6 text-sm font-medium ${property.is_available ? "text-green-600" : "text-red-500"}`}>
                  <span className={`w-2 h-2 rounded-full ${property.is_available ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                  {property.is_available ? "Available Now" : "Not Available"}
                </div>

                {showContact ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-2">
                      Contact {property.landlord?.full_name ?? "Landlord"}
                    </p>
                    {property.landlord?.phone && (
                      <a
                        href={`tel:${property.landlord.phone}`}
                        className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        {property.landlord.phone}
                      </a>
                    )}
                    <a
                      href={`https://wa.me/${property.landlord?.phone?.replace(/[^0-9]/g, "")}?text=Hi! I'm interested in your listing: ${property.title}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold text-sm transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp Landlord
                    </a>
                  </motion.div>
                ) : (
                  <button
                    onClick={() => setShowContact(true)}
                    className="w-full py-3 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition-colors animate-pulse-green"
                  >
                    Show Contact Details
                  </button>
                )}

                <button
                  onClick={() => setLiked(!liked)}
                  className={`mt-3 w-full py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all flex items-center justify-center gap-2 ${liked ? "border-red-300 bg-red-50 dark:bg-red-950/20 text-red-500" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-red-300"}`}
                >
                  <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
                  {liked ? "Saved" : "Save Property"}
                </button>
              </div>

              {/* Landlord card */}
              {property.landlord && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">Listed by</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {property.landlord.full_name?.charAt(0) ?? "L"}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">
                        {property.landlord.full_name}
                      </p>
                      {property.landlord.is_verified && (
                        <p className="flex items-center gap-1 text-green-600 text-xs font-medium">
                          <ShieldCheck className="w-3 h-3" /> Verified Landlord
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Safety tips */}
              <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 p-4">
                <h4 className="font-semibold text-amber-800 dark:text-amber-400 text-sm mb-2">⚠️ Safety Reminder</h4>
                <p className="text-xs text-amber-700 dark:text-amber-500 leading-relaxed">
                  Always visit the property before paying. Never send money without a written agreement. Verified listings have been inspected by our team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
