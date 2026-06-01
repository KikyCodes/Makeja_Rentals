import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://makeja.co.ke";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/listings", "/listings/", "/roommates"],
        disallow: [
          "/dashboard/",
          "/admin/",
          "/saved/",
          "/profile/",
          "/auth/",
          "/api/",
          "/_next/",
          "/design-system/",
        ],
      },
      // Block AI training crawlers
      {
        userAgent: ["GPTBot", "ChatGPT-User", "CCBot", "anthropic-ai"],
        disallow: ["/"],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
    host: APP_URL,
  };
}
