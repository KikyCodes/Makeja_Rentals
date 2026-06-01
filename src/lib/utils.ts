import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatPropertyType(type: string): string {
  const labels: Record<string, string> = {
    hostel: "Hostel",
    bedsitter: "Bedsitter",
    one_bedroom: "1 Bedroom",
    two_bedroom: "2 Bedrooms",
    studio: "Studio",
    shared_room: "Shared Room",
  };
  return labels[type] ?? type;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
}

export const MACHAKOS_AREAS = [
  "Machakos Town",
  "Masii",
  "Mwala",
  "Matuu",
  "Kangundo",
  "Tala",
  "Kathiani",
  "Athi River",
  "Mlolongo",
  "Mavoko",
  "Syokimau",
  "Kamulu",
];

export const AMENITIES_LIST = [
  "WiFi",
  "Water 24/7",
  "Security Guard",
  "CCTV",
  "Parking",
  "Backup Power",
  "Kitchen",
  "Laundry",
  "Study Room",
  "Gym",
  "Swimming Pool",
  "Balcony",
  "Garden",
  "Pet Friendly",
  "Near Campus",
  "Public Transport",
];

export const PROPERTY_TYPES = [
  { value: "hostel", label: "Hostel" },
  { value: "bedsitter", label: "Bedsitter" },
  { value: "one_bedroom", label: "1 Bedroom" },
  { value: "two_bedroom", label: "2 Bedrooms" },
  { value: "studio", label: "Studio" },
  { value: "shared_room", label: "Shared Room" },
];
