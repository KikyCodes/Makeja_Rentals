"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, Bath, Wifi, ShieldCheck, Eye, Bed, Zap, School, Users, CheckCircle2, XCircle } from "lucide-react";
import { cn, formatPrice, formatPropertyType } from "@/lib/utils";
import type { Property } from "@/types";

interface Props {
  property: Property;
  onFavoriteToggle?: (id: string, newState: boolean) => void;
}

const GENDER_LABEL: Record<string, { label: string; color: string }> = {
  male:   { label: "Male only",   color: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
  female: { label: "Female only", color: "bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-800" },
  any:    { label: "All welcome", color: "bg-[var(--muted)] text-[var(--foreground-muted)] border-[var(--border)]" },
};

export default function PropertyListCard({ property, onFavoriteToggle }: Props) {
  const [liked, setLiked] = useState(property.is_favorited ?? false);
  const primaryImage = property.images?.[0];
  const imageCount = property.images?.length ?? 0;

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !liked;
    setLiked(next);
    onFavoriteToggle?.(property.id, next);
  };

  const gender = GENDER_LABEL[property.gender_preference ?? "any"];

  return (
    <Link href={`/listings/${property.id}`} className="block focus-ring rounded-2xl group">
      <div className="property-card flex flex-col sm:flex-row overflow-hidden hover:shadow-[var(--shadow-md)] transition-all duration-200">

        {/* Image */}
        <div className="relative sm:w-64 lg:w-72 shrink-0 aspect-[4/3] sm:aspect-auto bg-[var(--background-muted)] overflow-hidden">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={property.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              sizes="(max-width: 640px) 100vw, 288px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[var(--foreground-subtle)]">
              <Bed className="w-10 h-10 opacity-30" />
            </div>
          )}

          {/* Gradient */}
          <div className="absolute inset-0 gradient-card-overlay" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {property.is_verified && (
              <span className="badge badge-green shadow-sm text-[10px]">
                <ShieldCheck className="w-2.5 h-2.5" /> Verified
              </span>
            )}
            {property.is_featured && (
              <span className="badge badge-gold shadow-sm text-[10px]">✦ Featured</span>
            )}
          </div>

          {/* Image count */}
          {imageCount > 1 && (
            <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/50 text-white text-[10px]">
              +{imageCount - 1} photos
            </span>
          )}

          {/* Availability */}
          <div className={cn(
            "absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold",
            property.is_available
              ? "bg-green-500/90 text-white"
              : "bg-slate-800/80 text-slate-300"
          )}>
            {property.is_available ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
            {property.is_available ? "Available" : "Taken"}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 p-4 sm:p-5 flex flex-col gap-2.5">
          {/* Top row */}
          <div className="flex items-start gap-2 flex-wrap">
            <span className="badge badge-warm text-[10px]">{formatPropertyType(property.type)}</span>
            {property.gender_preference && property.gender_preference !== "any" && (
              <span className={cn("badge text-[10px] border", gender.color)}>{gender.label}</span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-bold text-[var(--foreground)] leading-snug line-clamp-2 group-hover:text-green-600 transition-colors">
            {property.title}
          </h3>

          {/* Location + distance */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--foreground-muted)]">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-green-500 shrink-0" />
              {property.location}
            </span>
            {property.distance_from_campus !== null && (
              <span className="flex items-center gap-1">
                <School className="w-3 h-3 text-blue-500 shrink-0" />
                {property.distance_from_campus < 1
                  ? `${Math.round(property.distance_from_campus * 1000)}m from campus`
                  : `${property.distance_from_campus} km from campus`}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-xs text-[var(--foreground-subtle)] line-clamp-2 leading-relaxed">
            {property.description}
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--foreground-subtle)]">
            {property.bedrooms > 0 && (
              <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" />{property.bedrooms} bed</span>
            )}
            <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" />{property.bathrooms} bath</span>
            <span className="flex items-center gap-1 capitalize"><Zap className="w-3.5 h-3.5" />{property.furnishing.replace("_", " ")}</span>
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />Max {property.max_occupants}</span>
            {property.amenities.includes("WiFi") && (
              <span className="flex items-center gap-1 text-green-600 font-medium"><Wifi className="w-3.5 h-3.5" />WiFi</span>
            )}
          </div>

          {/* Amenity chips */}
          <div className="flex flex-wrap gap-1">
            {property.amenities.slice(0, 4).map((a) => (
              <span key={a} className="badge badge-warm text-[10px] py-0.5">{a}</span>
            ))}
            {property.amenities.length > 4 && (
              <span className="badge badge-warm text-[10px] py-0.5">+{property.amenities.length - 4}</span>
            )}
          </div>

          {/* Bottom: price + actions */}
          <div className="mt-auto pt-3 border-t border-[var(--border)] flex items-center justify-between gap-4">
            <div>
              <span className="text-xl font-black text-green-600">{formatPrice(property.price)}</span>
              <span className="text-[11px] text-[var(--foreground-subtle)] ml-1">
                /{property.price_period === "per_month" ? "month" : "week"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] text-[var(--foreground-subtle)]">
                <Eye className="w-3 h-3" />{property.views_count.toLocaleString()}
              </span>
              <button
                onClick={handleFavorite}
                aria-label={liked ? "Remove from saved" : "Save property"}
                className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center border transition-all",
                  liked
                    ? "bg-red-500 border-red-500 text-white"
                    : "border-[var(--border)] text-[var(--foreground-muted)] hover:border-red-400 hover:text-red-500"
                )}
              >
                <Heart className={cn("w-3.5 h-3.5", liked && "fill-current")} />
              </button>
              <span className="hidden sm:inline btn btn-primary btn-xs">
                View
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
