import Link from "next/link";
import { Home, Mail, Phone, MapPin, Facebook, Twitter, Instagram, ArrowUpRight } from "lucide-react";

const FOOTER_LINKS = {
  Platform: [
    { href: "/listings",      label: "Browse Listings" },
    { href: "/roommates",     label: "Find Roommates" },
    { href: "/dashboard/add", label: "List a Property" },
    { href: "/saved",         label: "Saved Properties" },
  ],
  Company: [
    { href: "/about",   label: "About Us" },
    { href: "/contact", label: "Contact" },
    { href: "/blog",    label: "Blog" },
    { href: "/careers", label: "Careers" },
  ],
  Support: [
    { href: "/faq",    label: "FAQ" },
    { href: "/safety", label: "Safety Tips" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms",  label: "Terms of Service" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#080f0a] text-slate-400">
      {/* Top divider glow */}
      <div className="h-px bg-gradient-to-r from-transparent via-green-600/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8">

          {/* Brand col */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5 group">
              <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                <Home className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="font-display font-bold text-[17px] text-white">
                Makeja<span className="text-green-500"> Rentals</span>
              </span>
            </Link>

            <p className="text-sm text-slate-500 leading-relaxed mb-6 max-w-xs">
              Machakos&apos; trusted rental marketplace for students and young professionals. Find verified listings, connect with landlords, meet roommates.
            </p>

            <div className="space-y-2.5 text-sm">
              <a href="mailto:hello@makejarentals.co.ke" className="flex items-center gap-2.5 text-slate-500 hover:text-green-400 transition-colors">
                <Mail className="w-4 h-4 shrink-0" /> hello@makejarentals.co.ke
              </a>
              <a href="tel:+254700000000" className="flex items-center gap-2.5 text-slate-500 hover:text-green-400 transition-colors">
                <Phone className="w-4 h-4 shrink-0" /> +254 700 000 000
              </a>
              <span className="flex items-center gap-2.5 text-slate-500">
                <MapPin className="w-4 h-4 shrink-0" /> Machakos Town, Kenya
              </span>
            </div>

            <div className="flex gap-2.5 mt-7">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-slate-500 hover:bg-green-600 hover:text-white hover:border-green-600 transition-all duration-150"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link cols */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/60 mb-5">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 hover:text-green-400 transition-colors inline-flex items-center gap-1 group"
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-7 border-t border-white/8 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} Makeja Rentals. All rights reserved.
          </p>
          <p className="text-xs text-slate-600">
            Built with ♥ for the people of Machakos, Kenya
          </p>
        </div>
      </div>
    </footer>
  );
}
