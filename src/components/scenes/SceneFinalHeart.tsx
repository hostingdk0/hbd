"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { fillTemplate, loveStory } from "@/config/loveStory";
import { MagicalButton } from "@/components/ui/MagicalButton";
import { HeartSvg } from "@/components/ui/HeartSvg";
import { FloatingHearts } from "@/components/fx/Ambient";
import { haptic } from "@/lib/haptics";
import { sound } from "@/lib/sound";

type Props = {
  onNext: () => void;
  burstAt: (x: number, y: number) => void;
  onLongPress: () => void;
};

export function SceneFinalHeart({ onNext, burstAt, onLongPress }: Props) {
  const copy = loveStory.finalHeart;
  const [phase, setPhase] = useState<"idle" | "beat" | "boom">("idle");
  const hold = useRef<number | null>(null);

  const tap = (event: { clientX: number; clientY: number }) => {
    if (phase === "boom") return;
    haptic(20);
    sound.play("heartbeat");
    burstAt(event.clientX, event.clientY);
    if (phase === "idle") {
      setPhase("beat");
      window.setTimeout(() => {
        sound.play("celebrate");
        setPhase("boom");
      }, 700);
    }
  };

  return (
    <div className="scene-root items-center justify-center text-center text-cream">
      <FloatingHearts count={phase === "boom" ? 16 : 6} dark />
      <p className="relative z-10 font-display text-[24px]">{copy.title}</p>
      {phase === "idle" && <p className="relative z-10 mt-2 text-sm text-cream/70">{copy.hint}</p>}

      <motion.button
        type="button"
        aria-label="Tap the heart"
        className="relative z-10 mt-8 flex h-48 w-48 items-center justify-center"
        onPointerDown={() => {
          hold.current = window.setTimeout(() => onLongPress(), 520);
        }}
        onClick={(e) => {
          if (hold.current) window.clearTimeout(hold.current);
          tap(e);
        }}
        onPointerUp={() => {
          if (hold.current) window.clearTimeout(hold.current);
        }}
        animate={
          phase === "boom"
            ? { scale: [1.2, 1.8, 0], opacity: [1, 1, 0] }
            : phase === "beat"
              ? { scale: [1, 1.18, 1] }
              : { scale: 1 }
        }
        transition={{ duration: phase === "boom" ? 0.7 : 0.35 }}
      >
        <HeartSvg className="h-40 w-40 text-[#e45a6a] drop-shadow-[0_18px_30px_rgba(196,40,70,0.5)]" />
        <span className="absolute text-5xl">❤️</span>
      </motion.button>

      <AnimatePresence>
        {phase === "boom" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 mt-4 flex flex-col items-center gap-4"
          >
            <p className="font-display text-[30px] leading-tight">{fillTemplate(copy.headline)}</p>
            <p className="max-w-[300px] text-[15px] leading-relaxed text-cream/80">{copy.after}</p>
            <MagicalButton onClick={onNext}>{copy.cta}</MagicalButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
