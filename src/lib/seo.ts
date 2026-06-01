import type { Metadata } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://makeja.co.ke";
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Makeja Rentals";

// ─── Base site metadata ───────────────────────────────────────────────────────
export const siteConfig = {
  name: APP_NAME,
  url: APP_URL,
  tagline: "Find Your Space in Machakos",
  description:
    "The #1 rental marketplace for students and young professionals in Machakos, Kenya. Browse affordable hostels, bedsitters, studios and apartments. Verified landlords, real photos.",
  keywords: [
    "rentals Machakos",
    "hostels near Machakos University",
    "bedsitters Machakos",
    "student accommodation Kenya",
    "apartments Machakos Town",
    "Makeja Rentals",
    "affordable housing Machakos",
    "roommate finder Kenya",
  ],
  ogImage: `${APP_URL}/og-image.png`,
  twitterHandle: "@makejarentals",
  locale: "en_KE",
};

// ─── Factory: generate page-specific metadata ─────────────────────────────────
export function buildMetadata({
  title,
  description,
  image,
  path = "/",
  noIndex = false,
}: {
  title: string;
  description?: string;
  image?: string;
  path?: string;
  noIndex?: boolean;
}): Metadata {
  const url = `${APP_URL}${path}`;
  const desc = description ?? siteConfig.description;
  const img = image ?? siteConfig.ogImage;

  return {
    title,
    description: desc,
    metadataBase: new URL(APP_URL),
    alternates: { canonical: url },
    openGraph: {
      title: `${title} — ${APP_NAME}`,
      description: desc,
      url,
      siteName: APP_NAME,
      type: "website",
      locale: siteConfig.locale,
      images: [{ url: img, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — ${APP_NAME}`,
      description: desc,
      images: [img],
      site: siteConfig.twitterHandle,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
  };
}

// ─── Listing-specific JSON-LD structured data ─────────────────────────────────
export function propertyJsonLd(property: {
  id: string;
  title: string;
  description: string;
  price: number;
  area: string;
  type: string;
  imageUrl?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description,
    url: `${APP_URL}/listings/${property.id}`,
    image: property.imageUrl,
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "KES",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: property.price,
        priceCurrency: "KES",
        referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitText: "month" },
      },
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: property.area,
      addressRegion: "Machakos",
      addressCountry: "KE",
    },
  };
}

// ─── Organisation JSON-LD (goes in root layout) ───────────────────────────────
export const organisationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: APP_NAME,
  url: APP_URL,
  logo: `${APP_URL}/logo.png`,
  sameAs: [
    "https://twitter.com/makejarentals",
    "https://facebook.com/makejarentals",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "support@makeja.co.ke",
    availableLanguage: ["en", "sw"],
  },
};

// ─── Breadcrumb JSON-LD ────────────────────────────────────────────────────────
export function breadcrumbJsonLd(
  crumbs: { name: string; href: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: `${APP_URL}${crumb.href}`,
    })),
  };
}
