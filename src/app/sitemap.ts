import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://makeja.co.ke";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // ── Static marketing pages ──────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: APP_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${APP_URL}/listings`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${APP_URL}/roommates`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${APP_URL}/auth/login`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${APP_URL}/auth/signup`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // ── Area landing pages (high-value SEO targets) ─────────────────────────────
  const areas = [
    "machakos-town",
    "kahawa-west",
    "ruiru",
    "roysambu",
    "kahawa-sukari",
    "athi-river",
    "mlolongo",
    "syokimau",
  ];

  const areaPages: MetadataRoute.Sitemap = areas.map((area) => ({
    url: `${APP_URL}/listings?area=${area}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  // ── Property type pages ─────────────────────────────────────────────────────
  const types = ["hostel", "bedsitter", "studio", "one_bedroom", "two_bedroom", "shared_room"];

  const typePages: MetadataRoute.Sitemap = types.map((type) => ({
    url: `${APP_URL}/listings?type=${type}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.75,
  }));

  // ── Dynamic listing pages would be fetched here in production ───────────────
  // const { data: listings } = await supabase
  //   .from("properties")
  //   .select("id, updated_at")
  //   .eq("is_published", true)
  //   .eq("approval_status", "approved");
  //
  // const listingPages: MetadataRoute.Sitemap = (listings ?? []).map((l) => ({
  //   url: `${APP_URL}/listings/${l.id}`,
  //   lastModified: new Date(l.updated_at),
  //   changeFrequency: "weekly",
  //   priority: 0.7,
  // }));

  return [...staticPages, ...areaPages, ...typePages];
}
