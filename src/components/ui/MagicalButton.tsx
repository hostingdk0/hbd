"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { haptic } from "@/lib/haptics";
import { sound } from "@/lib/sound";

type Props = {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  pulse?: boolean;
  ariaLabel?: string;
  disabled?: boolean;
  variant?: "primary" | "ghost" | "cream";
};

export function MagicalButton({
  children,
  onClick,
  className,
  pulse,
  ariaLabel,
  disabled,
  variant = "primary",
}: Props) {
  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={{ type: "spring", stiffness: 520, damping: 24 }}
      onClick={(event) => {
        if (disabled) return;
        void sound.unlock();
        haptic();
        sound.play("click");
        onClick?.(event);
      }}
      className={cn(
        "relative inline-flex min-h-14 min-w-[44px] items-center justify-center rounded-full px-7 text-[16px] font-medium tracking-wide",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-300",
        "disabled:opacity-50",
        variant === "primary" &&
          "bg-gradient-to-br from-[#e08996] via-[#c45c6a] to-[#a84555] text-white shadow-[0_12px_28px_rgba(196,92,106,0.38)]",
        variant === "ghost" &&
          "border border-white/30 bg-white/10 text-white backdrop-blur-md",
        variant === "cream" &&
          "bg-[#fff7f0] text-rosepink shadow-[0_10px_24px_rgba(80,30,40,0.12)]",
        pulse && "btn-pulse",
        className,
      )}
    >
      {children}
    </motion.button>
  );
}
