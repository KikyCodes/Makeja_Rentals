"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Home, Users, Star, MapPin } from "lucide-react";

function useCountUp(target: number, duration = 2000, started = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      setCount(Math.round(eased * target));
      if (elapsed < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, started]);
  return count;
}

const STATS = [
  { icon: Home,   value: 500,   suffix: "+", label: "Active Listings",    desc: "Updated daily" },
  { icon: Users,  value: 1200,  suffix: "+", label: "Happy Tenants",      desc: "Found their home here" },
  { icon: Star,   value: 150,   suffix: "+", label: "Verified Landlords", desc: "ID-checked hosts" },
  { icon: MapPin, value: 12,    suffix: "",  label: "Areas Covered",      desc: "Across Machakos County" },
];

export default function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const c0 = useCountUp(STATS[0].value, 1800, inView);
  const c1 = useCountUp(STATS[1].value, 1800, inView);
  const c2 = useCountUp(STATS[2].value, 1800, inView);
  const c3 = useCountUp(STATS[3].value, 1800, inView);
  const counts = [c0, c1, c2, c3];

  return (
    <section
      ref={ref}
      className="relative py-20 overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0a2010 0%, #0d2d16 40%, #0a1a0f 100%)" }}
    >
      {/* Dot mesh */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Glow blobs */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-green-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative container-site">
        <div className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-overline text-green-400 mb-3"
          >
            By the Numbers
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-display-md text-white"
          >
            Machakos Trusts Makeja
          </motion.h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-green-500/15 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-4xl sm:text-5xl font-black text-white tabular-nums">
                {counts[i].toLocaleString()}{stat.suffix}
              </p>
              <p className="text-sm font-semibold text-green-300 mt-1">{stat.label}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{stat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
