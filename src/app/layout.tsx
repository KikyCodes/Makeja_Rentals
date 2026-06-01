import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import SkipToContent from "@/components/ui/SkipToContent";
import { organisationJsonLd } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)",  color: "#0a0f0d" },
  ],
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://makeja.co.ke";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Makeja Rentals — Find Your Space in Machakos",
    template: "%s — Makeja Rentals",
  },
  description:
    "The #1 rental marketplace for students and young professionals in Machakos, Kenya. Browse verified hostels, bedsitters, studios and apartments. Real photos, real prices.",
  keywords: [
    "rentals Machakos", "hostels near Machakos University", "bedsitters Machakos",
    "student accommodation Kenya", "apartments Machakos Town", "Makeja Rentals",
    "affordable housing Machakos", "roommate finder Kenya",
  ],
  authors: [{ name: "Makeja Rentals", url: APP_URL }],
  creator: "Makeja Rentals",
  publisher: "Makeja Rentals",
  alternates: { canonical: APP_URL },
  openGraph: {
    title: "Makeja Rentals — Find Your Space",
    description: "Browse verified rentals near Machakos University. Affordable, student-friendly.",
    type: "website",
    locale: "en_KE",
    siteName: "Makeja Rentals",
    url: APP_URL,
    images: [{ url: `${APP_URL}/og-image.png`, width: 1200, height: 630, alt: "Makeja Rentals" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@makejarentals",
    images: [`${APP_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${plusJakarta.variable}`}
    >
      <body className="min-h-screen antialiased">
        {/* JSON-LD structured data for search engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organisationJsonLd) }}
        />
        <ThemeProvider>
          <AuthProvider>
          <SkipToContent />
          {children}
          </AuthProvider>
          <Toaster
            position="top-right"
            gutter={8}
            toastOptions={{
              duration: 4000,
              style: {
                background: "var(--background)",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                fontSize: "0.875rem",
                fontWeight: 500,
                boxShadow: "var(--shadow-float)",
                padding: "12px 16px",
              },
              success: { iconTheme: { primary: "#16a34a", secondary: "#fff" } },
              error:   { iconTheme: { primary: "#dc2626", secondary: "#fff" } },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
