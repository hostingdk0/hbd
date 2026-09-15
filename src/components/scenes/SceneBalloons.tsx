"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { loveStory } from "@/config/loveStory";
import { MagicalButton } from "@/components/ui/MagicalButton";
import { haptic } from "@/lib/haptics";
import { sound } from "@/lib/sound";

type Props = {
  onNext: () => void;
  burstAt: (x: number, y: number) => void;
  onPoppedAll: () => void;
};

const COLORS = ["#e56b7a", "#f0a3b0", "#d478c3", "#f2b28c", "#c45c6a", "#e89bb0", "#c9a87c", "#d98aa5"];

export function SceneBalloons({ onNext, burstAt, onPoppedAll }: Props) {
  const items = loveStory.balloons.items;
  const [popped, setPopped] = useState<number[]>([]);
  const [done, setDone] = useState(false);

  const pop = (i: number, event: { clientX: number; clientY: number }) => {
    if (popped.includes(i)) return;
    haptic(14);
    sound.play("pop");
    burstAt(event.clientX, event.clientY);
    const next = [...popped, i];
    setPopped(next);
    if (next.length === items.length) {
      sound.play("celebrate");
      onPoppedAll();
      window.setTimeout(() => setDone(true), 400);
    }
  };

  return (
    <div className="scene-root items-center text-center text-ink">
      <p className="font-display text-[23px] leading-snug text-cream">{loveStory.balloons.title}</p>
      <p className="mt-2 text-sm text-cream/70">{loveStory.balloons.hint}</p>

      <div className="relative mt-6 grid w-full max-w-[320px] grid-cols-4 gap-x-2 gap-y-6">
        {items.map((item, i) => {
          const isPopped = popped.includes(i);
          return (
            <motion.button
              key={i}
              type="button"
              aria-label={isPopped ? item.word : `Pop balloon ${i + 1}`}
              disabled={isPopped}
              onClick={(e) => pop(i, e)}
              className="flex min-h-[108px] flex-col items-center justify-start"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 }}
            >
              {isPopped ? (
                <motion.span
                  initial={{ scale: 0.4, opacity: 0, y: 8 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  className="mt-5 font-hand text-[26px] leading-none text-blush"
                >
                  {item.word}
                </motion.span>
              ) : (
                <motion.span
                  className="flex flex-col items-center"
                  animate={{ y: [0, -7, 0] }}
                  transition={{ duration: 3.2 + (i % 3) * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.12 }}
                >
                  <span
                    className="relative flex h-[64px] w-[56px] items-center justify-center text-[22px] shadow-[0_10px_16px_rgba(80,20,40,0.22)]"
                    style={{
                      background: COLORS[i % COLORS.length],
                      borderRadius: "50% 50% 50% 50% / 42% 42% 58% 58%",
                      fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
                    }}
                  >
                    {item.emoji}
                    <span className="absolute left-[18%] top-[18%] h-2 w-2 rounded-full bg-white/50" />
                  </span>
                  <span className="h-7 w-[2px] bg-white/40" />
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>

      {done && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 flex flex-col items-center gap-3">
          <p className="text-cream">{loveStory.balloons.doneTitle}</p>
          <p className="font-hand text-[24px] leading-snug text-blush">{loveStory.balloons.doneSubtitle}</p>
          <MagicalButton onClick={onNext}>{loveStory.balloons.cta}</MagicalButton>
        </motion.div>
      )}
    </div>
  );
}
