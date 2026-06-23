"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import MessageModal from "./MessageModal";
import type { RoommatePost } from "@/types";

interface Props {
  post: RoommatePost;
  variant?: "icon" | "full";
}

export default function RoommateDetailConnectButton({ post, variant = "icon" }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (!user) {
      router.push(`/auth/login?next=/roommates/${post.id}`);
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={
          variant === "full"
            ? "w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-colors"
            : "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-colors"
        }
      >
        <MessageCircle className="w-4 h-4" />
        {user ? "Send Message" : "Sign in to Connect"}
      </button>
      <MessageModal post={open ? post : null} onClose={() => setOpen(false)} />
    </>
  );
}
