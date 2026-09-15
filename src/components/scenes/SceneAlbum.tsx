"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { loveStory } from "@/config/loveStory";
import { MagicalButton } from "@/components/ui/MagicalButton";
import { haptic } from "@/lib/haptics";
import { sound } from "@/lib/sound";

type Props = {
  onNext: () => void;
  burstAt: (x: number, y: number) => void;
  onDoublePhoto: () => void;
};

export function SceneAlbum({ onNext, burstAt, onDoublePhoto }: Props) {
  const memories = loveStory.album.memories;
  const [index, setIndex] = useState(0);
  const [lastTap, setLastTap] = useState(0);
  const last = index >= memories.length - 1;

  const go = (dir: number) => {
    const next = Math.min(memories.length - 1, Math.max(0, index + dir));
    if (next === index) return;
    haptic(8);
    sound.play("soft");
    setIndex(next);
  };

  return (
    <div className="scene-root items-center text-center text-cream">
      <p className="font-display text-[22px] leading-snug">{loveStory.album.title}</p>
      {index === 0 && <p className="mt-2 text-sm text-cream/70">{loveStory.album.swipeHint}</p>}

      <div className="relative mt-5 h-[min(360px,48dvh)] w-full max-w-[300px]">
        {memories.map((m, i) => {
          const offset = i - index;
          if (Math.abs(offset) > 2) return null;
          return (
            <motion.article
              key={m.image}
              className="photo-print absolute inset-x-0 mx-auto w-[250px] cursor-grab rounded-[18px] p-3 active:cursor-grabbing"
              style={{ zIndex: 20 - Math.abs(offset) }}
              drag={offset === 0 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.72}
              onDragEnd={(_, info) => {
                if (info.offset.x < -70 || info.velocity.x < -400) go(1);
                else if (info.offset.x > 70 || info.velocity.x > 400) go(-1);
              }}
              animate={{
                x: offset * 16,
                y: Math.abs(offset) * 14,
                rotate: offset === 0 ? -1.5 : offset * 5,
                scale: 1 - Math.abs(offset) * 0.06,
                opacity: Math.abs(offset) > 1 ? 0 : 1,
              }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              onPointerUp={(e) => {
                if (offset !== 0) return;
                const now = Date.now();
                if (now - lastTap < 280) {
                  onDoublePhoto();
                  burstAt(e.clientX, e.clientY);
                }
                setLastTap(now);
              }}
            >
              <div className="relative h-[min(230px,32dvh)] overflow-hidden rounded-[12px] bg-blush">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.image} alt={m.title} className="h-full w-full object-cover" />
              </div>
              <p className="mt-3 font-display text-[18px] text-ink">{m.title}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-ink-soft/70">{m.date}</p>
              <p className="mt-1 font-hand text-[20px] leading-tight text-rosepink">{m.caption}</p>
            </motion.article>
          );
        })}
      </div>

      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          aria-label="Previous memory"
          onClick={() => go(-1)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-cream"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          {memories.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full ${i === index ? "w-5 bg-rosepink" : "w-1.5 bg-white/30"}`} />
          ))}
        </div>
        <button
          type="button"
          aria-label="Next memory"
          onClick={() => go(1)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-cream"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      <p className="mt-2 text-xs text-cream/60">Swipe to continue →</p>

      {last && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex flex-col items-center gap-3">
          <p className="font-hand text-[24px] text-blush">{loveStory.album.afterLast}</p>
          <MagicalButton onClick={onNext}>{loveStory.album.cta}</MagicalButton>
        </motion.div>
      )}
    </div>
  );
}
