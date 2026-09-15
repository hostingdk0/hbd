"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { loveStory } from "@/config/loveStory";
import { MagicalButton } from "@/components/ui/MagicalButton";
import { FloatingHearts, Sparkles } from "@/components/fx/Ambient";
import { ScenePhotoBg } from "@/components/fx/ScenePhotoBg";

type Props = {
  onBegin: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

export function SceneOpening({ onBegin }: Props) {
  const copy = loveStory.intro;
  const [ready, setReady] = useState(false);

  return (
    <div className="scene-root items-center justify-center text-center text-cream">
      <ScenePhotoBg src={loveStory.extras.openingBg} opacity={0.42} />
      <FloatingHearts count={11} dark />
      <Sparkles count={10} />
      <div className="relative z-10 flex w-full max-w-[340px] flex-col items-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.7 }}
          className="font-display text-[34px] leading-tight"
        >
          {copy.greeting}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 0.7 }}
          className="mt-4 text-[17px] text-cream/80"
        >
          {copy.subtitle}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.85, duration: 0.6 }}
          onAnimationComplete={() => setReady(true)}
          className="mt-7 font-hand text-[28px] text-blush"
        >
          {copy.prompt}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: ready ? 1 : 0, scale: ready ? 1 : 0.92 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="mt-10"
        >
          <MagicalButton pulse ariaLabel={copy.cta} onClick={onBegin}>
            {copy.cta}
          </MagicalButton>
        </motion.div>
      </div>
    </div>
  );
}
