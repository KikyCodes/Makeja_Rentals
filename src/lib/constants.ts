export const SITE_NAME = "Makeja Rentals";
export const SITE_TAGLINE = "Find Your Perfect Space in Machakos";
export const SITE_DESCRIPTION =
  "The #1 rental marketplace for students and young professionals in Machakos, Kenya. Find affordable hostels, bedsitters, apartments, and roommates.";

export const MACHAKOS_CENTER: [number, number] = [-1.5177, 37.2634];

export const PRICE_RANGES = [
  { label: "Under KES 3,000", min: 0, max: 3000 },
  { label: "KES 3,000 – 6,000", min: 3000, max: 6000 },
  { label: "KES 6,000 – 10,000", min: 6000, max: 10000 },
  { label: "KES 10,000 – 20,000", min: 10000, max: 20000 },
  { label: "Above KES 20,000", min: 20000, max: Infinity },
];

export const NAV_LINKS = [
  { href: "/listings", label: "Browse Listings" },
  { href: "/roommates", label: "Find Roommates" },
  { href: "/dashboard", label: "List Property" },
];
