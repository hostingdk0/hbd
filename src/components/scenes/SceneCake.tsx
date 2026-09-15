"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { loveStory } from "@/config/loveStory";
import { MagicalButton } from "@/components/ui/MagicalButton";
import { FloatingHearts, Sparkles } from "@/components/fx/Ambient";
import { haptic } from "@/lib/haptics";
import { sound } from "@/lib/sound";

type Props = {
  onNext: () => void;
  burstAt: (x: number, y: number) => void;
  onWished: () => void;
};

const CANDLES = [
  { x: -54, y: 10, color: "#f4c9d0", delay: 0 },
  { x: -27, y: 4, color: "#f7e0c4", delay: 0.12 },
  { x: 0, y: 0, color: "#f4c9d0", delay: 0.05 },
  { x: 27, y: 4, color: "#e8d4f0", delay: 0.2 },
  { x: 54, y: 10, color: "#f7e0c4", delay: 0.08 },
];

const SPRINKLES = [
  { x: 18, y: 22, r: 38, c: "#fff" },
  { x: 46, y: 18, r: -20, c: "#c45c6a" },
  { x: 72, y: 28, r: 12, c: "#c9a87c" },
  { x: 108, y: 16, r: 50, c: "#fff" },
  { x: 140, y: 24, r: -30, c: "#d478c3" },
  { x: 28, y: 78, r: 18, c: "#c9a87c" },
  { x: 168, y: 86, r: -12, c: "#fff" },
  { x: 62, y: 124, r: 40, c: "#c45c6a" },
  { x: 124, y: 118, r: -24, c: "#fff" },
  { x: 188, y: 42, r: 8, c: "#e8d4f0" },
];

function Flame({ dying }: { dying: boolean }) {
  return (
    <motion.div
      className="relative h-7 w-4"
      initial={false}
      animate={dying ? { scale: [1, 1.25, 0.4, 0], opacity: [1, 1, 0.5, 0], x: [0, 3, -4, 0] } : { scale: 1, opacity: 1 }}
      transition={dying ? { duration: 0.42 } : undefined}
    >
      <span className="flame-glow absolute left-1/2 top-2 h-6 w-6 -translate-x-1/2 rounded-full bg-[#ffb347]/50 blur-[5px]" />
      <span
        className="flame absolute left-1/2 bottom-0 h-[22px] w-[13px] -translate-x-1/2"
        style={{
          borderRadius: "50% 50% 50% 50% / 55% 55% 45% 45%",
          background: "radial-gradient(circle at 50% 78%, #fff6d0 0%, #ffd36a 34%, #ff8a3d 68%, #ff5a2a 100%)",
          boxShadow: "0 0 10px 3px rgba(255, 170, 60, 0.55)",
        }}
      />
      <span
        className="flame absolute left-1/2 bottom-[3px] h-[12px] w-[7px] -translate-x-1/2"
        style={{
          borderRadius: "50%",
          background: "radial-gradient(circle at 50% 70%, #fff 0%, #ffe08a 70%)",
          animationDuration: "0.55s",
        }}
      />
    </motion.div>
  );
}

function Smoke() {
  return (
    <div className="pointer-events-none absolute -top-3 left-1/2 h-10 w-6 -translate-x-1/2">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute left-1/2 h-2 w-2 rounded-full bg-white/35"
          initial={{ opacity: 0.5, y: 0, x: -4 + i * 3, scale: 0.5 }}
          animate={{ opacity: 0, y: -22 - i * 6, x: -8 + i * 8, scale: 1.3 }}
          transition={{ duration: 0.9, delay: i * 0.08 }}
        />
      ))}
    </div>
  );
}

export function SceneCake({ onNext, burstAt, onWished }: Props) {
  const copy = loveStory.cake;
  const [out, setOut] = useState<boolean[]>(() => CANDLES.map(() => false));
  const [dying, setDying] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const remaining = out.filter((v) => !v).length;

  const blow = (i: number, event: { clientX: number; clientY: number }) => {
    if (out[i] || dying !== null || done) return;
    haptic(12);
    sound.play("blow");
    burstAt(event.clientX, event.clientY);
    setDying(i);
    window.setTimeout(() => {
      setOut((prev) => {
        const next = [...prev];
        next[i] = true;
        if (next.every(Boolean)) {
          window.setTimeout(() => {
            sound.play("celebrate");
            onWished();
            setDone(true);
          }, 280);
        }
        return next;
      });
      setDying(null);
    }, 420);
  };

  return (
    <div className="scene-root items-center text-center text-cream">
      <FloatingHearts count={done ? 12 : 6} dark />
      <Sparkles count={done ? 14 : 8} />
      <p className="relative z-10 font-display text-[23px] leading-snug">{copy.title}</p>
      <p className="relative z-10 mt-2 text-sm text-cream/75">
        {done ? copy.done : remaining < CANDLES.length ? copy.keepGoing : copy.hint}
      </p>

      <motion.div
        initial={{ opacity: 0, rotate: -10, y: 8 }}
        animate={{ opacity: 1, rotate: -8, y: 0 }}
        className="pointer-events-none absolute left-2 top-[78px] z-[6] w-[86px] rounded-[8px] bg-[#fff8f2] p-1 shadow-[0_10px_20px_rgba(20,8,14,0.28)]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={loveStory.extras.cakePolaroid}
          alt="Naina with her birthday cake"
          className="h-[96px] w-full rounded-[5px] object-cover"
        />
        <p className="mt-0.5 text-center font-hand text-[10px] leading-none text-ink">My birthday girl</p>
      </motion.div>

      <div className="relative z-10 mt-6 flex w-full justify-center">
        <div className="cake-breathe relative h-[280px] w-[240px]">
          <div className="absolute bottom-1 left-1/2 h-4 w-[230px] -translate-x-1/2 rounded-full bg-white/15 blur-[2px]" />
          <div className="absolute bottom-3 left-1/2 h-[18px] w-[210px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#f4e6d8] to-[#d7c0ae] shadow-[0_8px_16px_rgba(40,16,24,0.25)]" />

          <div className="absolute bottom-[22px] left-1/2 h-[62px] w-[214px] -translate-x-1/2 overflow-hidden rounded-[18px] bg-gradient-to-b from-[#f2b7c2] via-[#e56b7a] to-[#b84555] shadow-[0_10px_18px_rgba(80,20,40,0.22)]">
            <div className="absolute inset-x-0 top-0 h-4 bg-[#fff1f4]" />
            <div className="absolute left-[10%] top-2 h-5 w-5 rounded-b-full bg-[#fff1f4]" />
            <div className="absolute left-[28%] top-1 h-6 w-6 rounded-b-full bg-[#fff1f4]" />
            <div className="absolute left-[48%] top-2 h-5 w-5 rounded-b-full bg-[#fff1f4]" />
            <div className="absolute left-[66%] top-1 h-6 w-6 rounded-b-full bg-[#fff1f4]" />
            <div className="absolute left-[82%] top-2 h-5 w-5 rounded-b-full bg-[#fff1f4]" />
          </div>

          <div className="absolute bottom-[70px] left-1/2 h-[52px] w-[176px] -translate-x-1/2 overflow-hidden rounded-[16px] bg-gradient-to-b from-[#f7cdd4] via-[#ea8a97] to-[#c45c6a] shadow-[0_8px_14px_rgba(80,20,40,0.18)]">
            <div className="absolute inset-x-0 top-0 h-3.5 bg-[#fff5f7]" />
            <div className="absolute left-[12%] top-1 h-4 w-4 rounded-b-full bg-[#fff5f7]" />
            <div className="absolute left-[36%] top-0 h-5 w-5 rounded-b-full bg-[#fff5f7]" />
            <div className="absolute left-[58%] top-1 h-4 w-4 rounded-b-full bg-[#fff5f7]" />
            <div className="absolute left-[78%] top-0 h-5 w-5 rounded-b-full bg-[#fff5f7]" />
          </div>

          <div className="absolute bottom-[112px] left-1/2 h-[44px] w-[136px] -translate-x-1/2 overflow-hidden rounded-[14px] bg-gradient-to-b from-[#fbe0e5] via-[#f0a3b0] to-[#d4788a] shadow-[0_6px_12px_rgba(80,20,40,0.16)]">
            <div className="absolute inset-x-0 top-0 h-3 bg-[#fffafa]" />
            <div className="absolute left-[16%] top-0 h-4 w-4 rounded-b-full bg-[#fffafa]" />
            <div className="absolute left-[44%] top-0 h-5 w-5 rounded-b-full bg-[#fffafa]" />
            <div className="absolute left-[72%] top-0 h-4 w-4 rounded-b-full bg-[#fffafa]" />
          </div>

          {SPRINKLES.map((s, i) => (
            <span
              key={i}
              className="absolute h-[5px] w-[2px] rounded-full"
              style={{
                left: s.x,
                bottom: s.y + 22,
                background: s.c,
                transform: `rotate(${s.r}deg)`,
                opacity: 0.9,
              }}
            />
          ))}

          <span className="absolute bottom-[148px] left-[38%] text-[13px]">🍓</span>
          <span className="absolute bottom-[146px] right-[36%] text-[13px]">🍓</span>
          <span className="absolute bottom-[150px] left-1/2 -translate-x-1/2 text-[14px]">💗</span>

          {CANDLES.map((c, i) => {
            const isOut = out[i];
            const isDying = dying === i;
            return (
              <button
                key={i}
                type="button"
                aria-label={isOut ? `Candle ${i + 1} is out` : `Blow out candle ${i + 1}`}
                disabled={isOut || dying !== null}
                onClick={(e) => blow(i, e)}
                className="absolute z-10 flex w-9 -translate-x-1/2 flex-col items-center"
                style={{
                  left: `calc(50% + ${c.x}px)`,
                  bottom: 154 - c.y,
                  animationDelay: `${c.delay}s`,
                }}
              >
                {!isOut && <Flame dying={isDying} />}
                {isOut && <Smoke />}
                {!isOut && !isDying && (
                  <span
                    className="mb-[-2px] h-[3px] w-[3px] rounded-full bg-[#3b2430]"
                    aria-hidden
                  />
                )}
                <span
                  className="h-11 w-[8px] rounded-full shadow-[inset_-2px_0_0_rgba(255,255,255,0.35)]"
                  style={{
                    background: `linear-gradient(90deg, ${c.color} 0%, #fff 45%, ${c.color} 100%)`,
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 mt-2 flex flex-col items-center gap-3"
          >
            <p className="font-display text-[26px]">{copy.done}</p>
            <MagicalButton onClick={onNext}>{copy.cta}</MagicalButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
