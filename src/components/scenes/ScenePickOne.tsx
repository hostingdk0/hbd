"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { loveStory } from "@/config/loveStory";
import { MagicalButton } from "@/components/ui/MagicalButton";
import { sound } from "@/lib/sound";

type Props = {
  onNext: () => void;
  burstAt: (x: number, y: number) => void;
};

export function ScenePickOne({ onNext, burstAt }: Props) {
  const copy = loveStory.pickOne;
  const [picked, setPicked] = useState<(typeof copy.options)[number] | null>(null);

  return (
    <div className="scene-root items-center text-center text-cream">
      <p className="font-display text-[26px]">{copy.title}</p>
      <p className="mt-2 text-sm text-cream/75">{copy.subtitle}</p>

      <div className="mt-7 grid w-full grid-cols-2 gap-3">
        {copy.options.map((option) => {
          const active = picked?.id === option.id;
          return (
            <motion.button
              key={option.id}
              type="button"
              aria-label={option.label}
              whileTap={{ scale: 0.96 }}
              onClick={(e) => {
                sound.play("sparkle");
                burstAt(e.clientX, e.clientY);
                setPicked(option);
              }}
              className={`min-h-[112px] rounded-3xl border px-3 py-4 ${
                active ? "border-blush bg-white/20" : "border-white/15 bg-white/10"
              }`}
            >
              <span className="block text-[28px]">{option.emoji}</span>
              <span className="mt-2 block font-display text-[16px]">{option.label}</span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {picked && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex w-full flex-col items-center gap-4"
          >
            <p className="font-hand text-[24px] leading-snug text-blush">{picked.reaction}</p>
            <p className="text-sm text-cream/75">{copy.followUp}</p>
            <MagicalButton onClick={onNext}>{copy.cta}</MagicalButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
