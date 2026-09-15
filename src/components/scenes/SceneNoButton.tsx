"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { loveStory } from "@/config/loveStory";
import { MagicalButton } from "@/components/ui/MagicalButton";
import { sound } from "@/lib/sound";

type Props = {
  onNext: () => void;
};

export function SceneNoButton({ onNext }: Props) {
  const copy = loveStory.noButton;
  const [step, setStep] = useState<1 | 2>(1);
  const [reply, setReply] = useState<string | null>(null);
  const [dodges, setDodges] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const dodge = () => {
    if (dodges >= 4) return false;
    setPos({
      x: (Math.random() - 0.5) * 150,
      y: (Math.random() - 0.5) * 90,
    });
    setDodges((d) => d + 1);
    sound.play("soft");
    return true;
  };

  return (
    <div className="scene-root items-center justify-center text-center text-cream">
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div key="q1" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex w-full flex-col items-center">
            <p className="font-display text-[26px] leading-snug">{copy.firstQuestion}</p>
            <div className="mt-10 flex w-full flex-col gap-3">
              <MagicalButton
                onClick={() => {
                  setReply(copy.yesResponse);
                  window.setTimeout(() => {
                    setReply(null);
                    setStep(2);
                  }, 1400);
                }}
              >
                YES ❤️
              </MagicalButton>
              <MagicalButton
                variant="ghost"
                onClick={() => {
                  setReply(copy.noResponse);
                  window.setTimeout(() => {
                    setReply(null);
                    setStep(2);
                  }, 1400);
                }}
              >
                NO 🙈
              </MagicalButton>
            </div>
            {reply && <p className="mt-6 font-hand text-[24px] text-blush">{reply}</p>}
          </motion.div>
        ) : (
          <motion.div key="q2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex w-full flex-col items-center">
            <p className="font-display text-[26px] leading-snug">{copy.secondQuestion}</p>
            <div className="relative mt-10 flex min-h-[180px] w-full flex-col items-center gap-4">
              <MagicalButton
                onClick={() => {
                  setReply(copy.yesDone);
                }}
              >
                YES
              </MagicalButton>
              <motion.div
                animate={{ x: pos.x, y: pos.y }}
                transition={{ type: "spring", stiffness: 380, damping: 18 }}
                onPointerDown={(event) => {
                  if (dodges < 4) {
                    event.preventDefault();
                    dodge();
                  }
                }}
              >
                <MagicalButton
                  variant="cream"
                  onClick={() => {
                    if (dodges < 4) return;
                    setReply(copy.noCaught);
                  }}
                >
                  NO
                </MagicalButton>
              </motion.div>
            </div>
            {reply && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 flex flex-col items-center gap-4">
                <p className="font-hand text-[24px] text-blush">{reply}</p>
                <MagicalButton onClick={onNext}>{copy.cta}</MagicalButton>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
