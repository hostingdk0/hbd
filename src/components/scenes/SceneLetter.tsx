"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { fillTemplate, loveStory } from "@/config/loveStory";
import { MagicalButton } from "@/components/ui/MagicalButton";

type Props = {
  onNext: () => void;
};

export function SceneLetter({ onNext }: Props) {
  const copy = loveStory.letter;
  const lines = useMemo(
    () => fillTemplate(copy.body).split("\n"),
    [copy.body],
  );

  return (
    <div className="scene-root items-center text-center">
      <p className="font-display text-[22px] text-cream">{copy.title}</p>
      <p className="mt-1 text-xs text-cream/65">{copy.hint}</p>

      <div className="relative mt-5 w-full max-w-[340px]">
        <div className="absolute -right-1 top-3 h-14 w-14 rotate-12 rounded-sm bg-[#c45c6a] opacity-90 shadow-md">
          <div className="flex h-full items-center justify-center font-hand text-[22px] text-cream">❤️</div>
        </div>
        <div className="paper no-scrollbar relative max-h-[58dvh] overflow-y-auto rounded-[4px] px-5 py-6 text-left shadow-[0_18px_40px_rgba(80,30,40,0.22)]">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[10px] tracking-[0.2em] text-ink-soft/70">FROM MY HEART</p>
            <p className="font-hand text-[15px] text-ink-soft">for {loveStory.wifeName}</p>
          </div>
          <div className="mb-3 h-px bg-[#e8a4ad]/50" />
          {lines.map((line, i) => (
            <motion.p
              key={`${i}-${line}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 + i * 0.2, duration: 0.35 }}
              className="font-hand text-[22px] leading-[1.45] text-ink"
            >
              {line === "" ? "\u00A0" : line}
            </motion.p>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: Math.min(4.2, 0.3 + lines.length * 0.2) }}
        className="mt-5"
      >
        <MagicalButton onClick={onNext}>{copy.cta}</MagicalButton>
      </motion.div>
    </div>
  );
}
