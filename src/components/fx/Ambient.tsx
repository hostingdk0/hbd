"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Burst = {
  id: number;
  x: number;
  y: number;
  count: number;
  emojis: string[];
};

let burstId = 1;

export function useBursts() {
  const [bursts, setBursts] = useState<Burst[]>([]);

  const spawn = (x: number, y: number, count = 12, emojis = ["❤️", "💕", "💗", "✨"]) => {
    const id = burstId++;
    setBursts((prev) => [...prev.slice(-4), { id, x, y, count, emojis }]);
    window.setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== id));
    }, 900);
  };

  return { bursts, spawn };
}

export function HeartBurst({ burst }: { burst: Burst }) {
  const bits = useMemo(
    () =>
      Array.from({ length: burst.count }, (_, i) => {
        const angle = (i / burst.count) * Math.PI * 2 + Math.random() * 0.4;
        const dist = 46 + Math.random() * 70;
        return {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          emoji: burst.emojis[i % burst.emojis.length],
          size: 12 + (i % 4) * 4,
          rotate: -30 + Math.random() * 60,
        };
      }),
    [burst],
  );

  return (
    <div className="pointer-events-none absolute z-40" style={{ left: burst.x, top: burst.y }}>
      {bits.map((bit, i) => (
        <motion.span
          key={i}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          initial={{ opacity: 1, x: 0, y: 0, scale: 0.4 }}
          animate={{ opacity: 0, x: bit.x, y: bit.y, scale: 1, rotate: bit.rotate }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          style={{ fontSize: bit.size }}
        >
          {bit.emoji}
        </motion.span>
      ))}
    </div>
  );
}

export function ConfettiRain({ show }: { show: boolean }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        left: `${(i * 7.1) % 100}%`,
        delay: (i % 8) * 0.08,
        emoji: ["❤️", "💕", "✨", "🌸", "🎀", "💗"][i % 6],
        duration: 1.8 + (i % 5) * 0.2,
      })),
    [],
  );

  return (
    <AnimatePresence>
      {show && (
        <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
          {pieces.map((p, i) => (
            <motion.span
              key={i}
              className="absolute top-[-8%]"
              style={{ left: p.left, fontSize: 16 }}
              initial={{ y: 0, opacity: 0, rotate: 0 }}
              animate={{ y: "120vh", opacity: [0, 1, 1, 0], rotate: 180 }}
              exit={{ opacity: 0 }}
              transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
            >
              {p.emoji}
            </motion.span>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

export function FloatingHearts({ count = 10, dark = false }: { count?: number; dark?: boolean }) {
  const hearts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: `${8 + ((i * 17) % 84)}%`,
        delay: `${i * 1.1}s`,
        duration: `${10 + (i % 5) * 1.4}s`,
        size: 10 + (i % 4) * 5,
        emoji: ["❤️", "💕", "💗", "✨"][i % 4],
        opacity: dark ? 0.28 : 0.42,
      })),
    [count, dark],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {hearts.map((h, i) => (
        <span
          key={i}
          className="drift absolute bottom-[-8%]"
          style={{
            left: h.left,
            animationDelay: h.delay,
            animationDuration: h.duration,
            fontSize: h.size,
            opacity: h.opacity,
          }}
        >
          {h.emoji}
        </span>
      ))}
    </div>
  );
}

export function FallingPetals({ count = 8 }: { count?: number }) {
  const petals = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: `${(i * 13) % 100}%`,
        delay: `${i * 1.4}s`,
        duration: `${12 + (i % 4) * 2}s`,
        size: 12 + (i % 3) * 4,
      })),
    [count],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {petals.map((p, i) => (
        <span
          key={i}
          className="petal absolute top-[-8%]"
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            fontSize: p.size,
            opacity: 0.55,
          }}
        >
          🌸
        </span>
      ))}
    </div>
  );
}

export function Sparkles({ count = 12 }: { count?: number }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const dots = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: `${10 + ((i * 23) % 80)}%`,
        top: `${12 + ((i * 17) % 76)}%`,
        delay: i * 0.35,
      })),
    [count],
  );

  if (!ready) return null;

  return (
    <div className="pointer-events-none absolute inset-0">
      {dots.map((d, i) => (
        <motion.span
          key={i}
          className="absolute text-[10px]"
          style={{ left: d.left, top: d.top }}
          animate={{ opacity: [0.15, 0.9, 0.15], scale: [0.7, 1.15, 0.7] }}
          transition={{ duration: 2.4, delay: d.delay, repeat: Infinity }}
        >
          ✨
        </motion.span>
      ))}
    </div>
  );
}

export function Toast({ text }: { text: string | null }) {
  return (
    <AnimatePresence>
      {text && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10 }}
          className="pointer-events-none absolute bottom-24 left-1/2 z-50 w-[min(86%,320px)] -translate-x-1/2 rounded-2xl bg-[#3b2430]/90 px-4 py-3 text-center text-sm text-cream shadow-lg backdrop-blur"
        >
          {text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
