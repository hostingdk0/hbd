"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { loveStory } from "@/config/loveStory";
import { MagicalButton } from "@/components/ui/MagicalButton";
import { FloatingHearts, Sparkles } from "@/components/fx/Ambient";
import { ScenePhotoBg } from "@/components/fx/ScenePhotoBg";
import { HeartSvg } from "@/components/ui/HeartSvg";
import { sound } from "@/lib/sound";

type Props = {
  onReplay: () => void;
  onSecretOpened: () => void;
  showAchievement: boolean;
};

export function SceneFinale({ onReplay, onSecretOpened, showAchievement }: Props) {
  const copy = loveStory.finale;
  const [ps, setPs] = useState(false);

  return (
    <div className="scene-root items-center text-center text-ink">
      <ScenePhotoBg src={loveStory.extras.finaleBg} opacity={0.34} />
      <FloatingHearts count={12} />
      <Sparkles count={12} />
      <div className="relative z-10 mt-2 flex flex-1 flex-col items-center justify-center">
        <p className="font-display text-[30px] leading-tight text-cream">{copy.title}</p>
        <p className="mt-4 text-[16px] text-cream/80">{copy.thankYou}</p>
        <p className="mt-5 max-w-[320px] font-hand text-[24px] leading-snug text-blush">{copy.message}</p>
        <p className="mt-8 text-sm tracking-[0.18em] text-cream/60">{copy.signOff}</p>
        <p className="mt-2 font-display text-[22px] text-cream">
          {loveStory.husbandName} <span className="inline-block animate-pulse">❤️</span>
        </p>
        <motion.div
          className="mt-2 text-rosepink"
          animate={{ y: [0, -6, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          <HeartSvg className="h-6 w-6" />
        </motion.div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-3 pb-2">
        <button
          type="button"
          aria-label={copy.psLabel}
          onClick={() => {
            sound.play("sparkle");
            setPs(true);
            onSecretOpened();
          }}
          className="min-h-12 px-4 text-sm text-cream/80"
        >
          {copy.psLabel}
        </button>
        <button type="button" onClick={onReplay} className="min-h-11 text-xs text-cream/50">
          {copy.replay}
        </button>
      </div>

      <AnimatePresence>
        {ps && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-end bg-[#1a0c12]/55 p-5"
            onClick={() => setPs(false)}
          >
            <motion.div
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              className="paper w-full rounded-[24px] p-5 text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="font-display text-[22px]">{copy.psTitle}</p>
              <p className="mt-3 whitespace-pre-line font-hand text-[22px] leading-snug text-ink">{copy.psBody}</p>
              <div className="photo-print mt-4 overflow-hidden rounded-2xl p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={copy.psImage} alt="Secret surprise" className="h-40 w-full rounded-xl object-cover" />
              </div>
              <div className="mt-4 flex justify-center">
                <MagicalButton onClick={() => setPs(false)}>I love you too 💕</MagicalButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAchievement && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute left-1/2 top-24 z-30 w-[min(86%,300px)] -translate-x-1/2 rounded-2xl bg-[#3b2430]/92 px-4 py-3 text-cream shadow-xl"
          >
            <p className="text-xs tracking-[0.16em] text-blush">{loveStory.easterEggs.achievementTitle}</p>
            <p className="mt-1 font-display text-[18px]">{loveStory.easterEggs.achievement}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
