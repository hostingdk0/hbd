"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { loveStory } from "@/config/loveStory";
import { MagicalButton } from "@/components/ui/MagicalButton";
import { FallingPetals } from "@/components/fx/Ambient";
import { sound } from "@/lib/sound";

type Props = {
  onNext: () => void;
  burstAt: (x: number, y: number) => void;
  onOpenedAll: () => void;
};

export function SceneWishes({ onNext, burstAt, onOpenedAll }: Props) {
  const copy = loveStory.wishes;
  const [open, setOpen] = useState<number[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const allOpen = open.length === copy.cards.length;

  const openCard = (i: number, event: { clientX: number; clientY: number }) => {
    sound.play("envelope");
    burstAt(event.clientX, event.clientY);
    setActive(i);
    if (!open.includes(i)) {
      const next = [...open, i];
      setOpen(next);
      if (next.length === copy.cards.length) onOpenedAll();
    }
  };

  return (
    <div className="scene-root items-center text-center text-cream">
      <FallingPetals count={7} />
      <p className="relative z-10 font-display text-[23px] leading-snug">{copy.title}</p>
      <p className="relative z-10 mt-2 text-sm text-cream/70">{copy.hint}</p>

      <div className="relative z-10 mt-6 flex w-full flex-col gap-3">
        {copy.cards.map((card, i) => {
          const isOpen = open.includes(i);
          return (
            <motion.button
              key={card.number}
              type="button"
              aria-label={`Open wish ${card.number}: ${card.title}`}
              onClick={(e) => openCard(i, e)}
              whileTap={{ scale: 0.985 }}
              className="rounded-3xl border border-white/15 bg-white/12 px-4 py-4 text-left backdrop-blur-md"
            >
              <div className="flex items-center gap-3">
                <span className="font-display text-gold">{card.number}</span>
                <span className="font-display text-[18px]">{card.title}</span>
                <span className="ml-auto text-lg">{isOpen ? "🌸" : "💌"}</span>
              </div>
              <AnimatePresence>
                {active === i && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="mt-3 font-hand text-[20px] leading-snug text-blush"
                  >
                    {card.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {allOpen && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 mt-6 flex flex-col items-center gap-3">
          <p>{copy.afterTitle}</p>
          <p className="font-hand text-[24px] text-blush">{copy.afterSubtitle}</p>
          <MagicalButton onClick={onNext}>{copy.cta}</MagicalButton>
        </motion.div>
      )}
    </div>
  );
}
