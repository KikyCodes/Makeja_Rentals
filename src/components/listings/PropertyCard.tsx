"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Heart, MapPin, Bath, Wifi, ShieldCheck, Eye, Bed, Zap, School,
  CheckCircle2, XCircle,
} from "lucide-react";
import { cn, formatPrice, formatPropertyType } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import type { Property } from "@/types";

interface PropertyCardProps {
  property: Property;
  compact?: boolean;
  index?: number;
  onFavoriteToggle?: (id: string, newState: boolean) => void;
}

export default function PropertyCard({
  property,
  compact = false,
  index = 0,
  onFavoriteToggle,
}: PropertyCardProps) {
  const [liked, setLiked] = useState(property.is_favorited ?? false);
  const primaryImage = property.images?.[0];

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !liked;
    setLiked(next);
    onFavoriteToggle?.(property.id, next);
    fetch(`/api/favorites/${property.id}`, { method: next ? "POST" : "DELETE" }).catch(() => {});
  };

  const distanceLabel =
    property.distance_from_campus !== null && property.distance_from_campus !== undefined
      ? property.distance_from_campus < 1
        ? `${Math.round(property.distance_from_campus * 1000)}m from campus`
        : `${property.distance_from_campus} km from campus`
      : null;

  /* ─── Compact (list) mode ─────────────────────────────── */
  if (compact) {
    return (
      <Link href={`/listings/${property.id}`} className="block focus-ring rounded-xl">
        <div className="property-card flex gap-0 overflow-hidden">
          <div className="relative w-32 shrink-0 bg-[var(--background-muted)]">
            {primaryImage ? (
              <Image src={primaryImage.url} alt={property.title} fill className="object-cover" sizes="128px" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-[var(--foreground-subtle)]">
                <Bed className="w-8 h-8" />
              </div>
            )}
            <span className={cn(
              "absolute top-2 left-2 w-2 h-2 rounded-full",
              property.is_available ? "bg-green-500" : "bg-slate-400"
            )} />
          </div>
          <div className="flex-1 min-w-0 p-4">
            <div className="flex items-start gap-2 mb-1 flex-wrap">
              <Badge variant="warm" className="shrink-0">{formatPropertyType(property.type)}</Badge>
              {property.is_verified && <Badge variant="green" dot>Verified</Badge>}
            </div>
            <h3 className="font-bold text-sm text-[var(--foreground)] line-clamp-1 mt-1.5">{property.title}</h3>
            <p className="flex items-center gap-1 text-xs text-[var(--foreground-muted)] mt-1">
              <MapPin className="w-3 h-3 shrink-0" /> {property.location}
            </p>
            {distanceLabel && (
              <p className="flex items-center gap-1 text-xs text-blue-500 mt-0.5">
                <School className="w-3 h-3 shrink-0" /> {distanceLabel}
              </p>
            )}
            <div className="flex items-center justify-between mt-3">
              <span className="text-base font-black text-green-600">
                {formatPrice(property.price)}<span className="text-xs font-normal text-[var(--foreground-subtle)]">/mo</span>
              </span>
              <span className="flex items-center gap-1 text-[10px] text-[var(--foreground-subtle)]">
                <Eye className="w-3 h-3" />{property.views_count}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  /* ─── Full card mode ─────────────────────────────────── */
  return (
    <Link href={`/listings/${property.id}`} className="block focus-ring rounded-2xl group">
      <article className="property-card h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-[var(--background-muted)] overflow-hidden">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={property.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[var(--foreground-subtle)]">
              <Bed className="w-12 h-12 opacity-30" />
              <span className="text-xs opacity-50">No photo</span>
            </div>
          )}

          <div className="absolute inset-0 gradient-card-overlay" />

          {/* Top-left: verified + featured */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {property.is_verified && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.05 + 0.1 }}
                className="badge badge-green shadow-sm"
              >
                <ShieldCheck className="w-3 h-3" /> Verified
              </motion.span>
            )}
            {property.is_featured && (
              <span className="badge badge-gold shadow-sm">✦ Featured</span>
            )}
          </div>

          {/* Bottom-left: type + gender */}
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
            <span className="badge bg-black/40 backdrop-blur-sm text-white border-none text-[10px]">
              {formatPropertyType(property.type)}
            </span>
            {property.gender_preference === "female" && (
              <span className="badge bg-pink-500/80 text-white border-none text-[10px]">♀ Female only</span>
            )}
            {property.gender_preference === "male" && (
              <span className="badge bg-blue-500/80 text-white border-none text-[10px]">♂ Male only</span>
            )}
          </div>

          {/* Availability */}
          <div className={cn(
            "absolute top-3 right-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold",
            property.is_available ? "bg-green-500/90 text-white" : "bg-slate-800/70 text-slate-300"
          )}>
            {property.is_available
              ? <><CheckCircle2 className="w-2.5 h-2.5" /> Available</>
              : <><XCircle className="w-2.5 h-2.5" /> Taken</>}
          </div>

          {/* Favorite */}
          <button
            onClick={handleFavorite}
            aria-label={liked ? "Remove from saved" : "Save property"}
            className={cn(
              "absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 focus-ring",
              liked ? "bg-red-500 text-white shadow-md scale-110" : "glass text-white hover:bg-red-500 hover:scale-110"
            )}
          >
            <Heart className={cn("w-3.5 h-3.5 transition-all", liked && "fill-current")} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-4 gap-2">
          <h3 className="font-bold text-[var(--foreground)] text-sm leading-snug line-clamp-2 group-hover:text-green-600 transition-colors duration-150">
            {property.title}
          </h3>

          <p className="flex items-center gap-1.5 text-[var(--foreground-muted)] text-xs">
            <MapPin className="w-3 h-3 text-green-500 shrink-0" />
            <span className="truncate">{property.location}</span>
          </p>

          {distanceLabel && (
            <p className="flex items-center gap-1.5 text-xs text-blue-500 font-medium">
              <School className="w-3 h-3 shrink-0" />
              {distanceLabel}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-[var(--foreground-subtle)]">
            {property.bedrooms > 0 && (
              <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" />{property.bedrooms} bed</span>
            )}
            <span className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5" />{property.bathrooms} bath
            </span>
            {property.amenities.includes("WiFi") && (
              <span className="flex items-center gap-1 text-green-600 font-medium">
                <Wifi className="w-3.5 h-3.5" />WiFi
              </span>
            )}
            <span className="flex items-center gap-1 capitalize">
              <Zap className="w-3.5 h-3.5" />{property.furnishing.replace("_", " ")}
            </span>
          </div>

          <div className="flex flex-wrap gap-1">
            {property.amenities.slice(0, 3).map((a) => (
              <span key={a} className="badge badge-warm text-[10px] py-0.5">{a}</span>
            ))}
            {property.amenities.length > 3 && (
              <span className="badge badge-warm text-[10px] py-0.5">+{property.amenities.length - 3}</span>
            )}
          </div>

          <div className="mt-auto pt-3 border-t border-[var(--border)] flex items-center justify-between">
            <div>
              <span className="text-lg font-black text-green-600">{formatPrice(property.price)}</span>
              <span className="text-[11px] text-[var(--foreground-subtle)] ml-1">
                /{property.price_period === "per_month" ? "month" : "week"}
              </span>
            </div>
            <span className="flex items-center gap-1 text-[11px] text-[var(--foreground-subtle)]">
              <Eye className="w-3 h-3" />{property.views_count.toLocaleString()}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
