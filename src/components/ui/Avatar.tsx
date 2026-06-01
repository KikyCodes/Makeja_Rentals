import Image from "next/image";
import { cn } from "@/lib/utils";

const GRADIENTS = [
  "from-green-400 to-emerald-600",
  "from-blue-400 to-indigo-600",
  "from-purple-400 to-pink-600",
  "from-amber-400 to-orange-600",
  "from-cyan-400 to-teal-600",
  "from-rose-400 to-red-600",
];

function getGradient(name: string) {
  const code = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return GRADIENTS[code % GRADIENTS.length];
}

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const sizeMap: Record<AvatarSize, { div: string; text: string; img: number }> = {
  xs:  { div: "w-6  h-6",  text: "text-[10px]", img: 24  },
  sm:  { div: "w-8  h-8",  text: "text-xs",     img: 32  },
  md:  { div: "w-10 h-10", text: "text-sm",      img: 40  },
  lg:  { div: "w-12 h-12", text: "text-base",    img: 48  },
  xl:  { div: "w-16 h-16", text: "text-lg",      img: 64  },
  "2xl": { div: "w-20 h-20", text: "text-2xl",   img: 80  },
};

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: AvatarSize;
  shape?: "circle" | "rounded";
  className?: string;
}

export function Avatar({ name, src, size = "md", shape = "circle", className }: AvatarProps) {
  const s = sizeMap[size];
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const gradient = getGradient(name);

  return (
    <div className={cn(
      "relative shrink-0 flex items-center justify-center overflow-hidden bg-gradient-to-br",
      gradient,
      s.div,
      shape === "circle" ? "rounded-full" : "rounded-xl",
      className
    )}>
      {src ? (
        <Image src={src} alt={name} width={s.img} height={s.img} className="object-cover w-full h-full absolute inset-0" />
      ) : (
        <span className={cn("font-bold text-white select-none", s.text)}>{initials}</span>
      )}
    </div>
  );
}
