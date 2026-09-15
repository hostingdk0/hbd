"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { loveStory } from "@/config/loveStory";
import { MagicalButton } from "@/components/ui/MagicalButton";
import { HeartSvg } from "@/components/ui/HeartSvg";
import { haptic } from "@/lib/haptics";
import { sound } from "@/lib/sound";

const EMOJIS = ["🥰", "😍", "😘", "💕", "✨", "🥹", "🫶", "🎀", "💗"];

type Props = {
  onNext: () => void;
  burstAt: (x: number, y: number) => void;
  onRapidTaps: () => void;
  onLongPress: () => void;
};

export function SceneLoveMeter({ onNext, burstAt, onRapidTaps, onLongPress }: Props) {
  const copy = loveStory.loveMeter;
  const [level, setLevel] = useState(0);
  const [draining, setDraining] = useState(false);
  const [reactions, setReactions] = useState<{ id: number; emoji: string; x: number }[]>([]);
  const [broken, setBroken] = useState(false);
  const recent = useRef<number[]>([]);
  const hold = useRef<number | null>(null);
  const idRef = useRef(0);
  const levelRef = useRef(0);
  const lastTapRef = useRef(0);
  const brokenRef = useRef(false);

  useEffect(() => {
    let frame = 0;
    let prev = performance.now();

    const tick = (time: number) => {
      const dt = Math.min(40, time - prev);
      prev = time;

      if (!brokenRef.current && levelRef.current > 0) {
        const idle = Date.now() - lastTapRef.current;
        const requiredPace = 400 - levelRef.current * 2.5;
        const drainAfter = Math.max(130, requiredPace);

        if (lastTapRef.current > 0 && idle > drainAfter) {
          const drainPerSec = 16 + levelRef.current * 0.48;
          levelRef.current = Math.max(0, levelRef.current - drainPerSec * (dt / 1000));
          setLevel(levelRef.current);
          setDraining(true);
        } else {
          setDraining(false);
        }
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const love = broken ? 9999999 : Math.round((level / 100) ** 1.35 * 4096);
  const scale = broken ? 1.35 : 1 + (level / 100) * 0.42;
  const fill = broken ? 100 : Math.max(0, Math.min(100, level));

  const hint =
    broken
      ? ""
      : draining && level > 8
        ? copy.dontStop
        : level > 78
          ? copy.keepGoing
          : level > 42
            ? copy.faster
            : copy.hint;

  const tapHeart = (event: { clientX: number; clientY: number }) => {
    if (brokenRef.current) return;
    haptic(8);
    sound.play("heartbeat");
    burstAt(event.clientX, event.clientY);

    const now = Date.now();
    recent.current = [...recent.current.filter((t) => now - t < 1600), now];
    if (recent.current.length >= 8) onRapidTaps();

    const gap = lastTapRef.current ? now - lastTapRef.current : 0;
    const requiredPace = 400 - levelRef.current * 2.5;
    let add = 7.2 - levelRef.current * 0.028;
    if (gap && gap > requiredPace * 1.35) add *= 0.32;
    else if (gap && gap < requiredPace * 0.7) add *= 1.28;

    levelRef.current = Math.min(100, levelRef.current + add);
    lastTapRef.current = now;
    setLevel(levelRef.current);
    setDraining(false);

    const id = ++idRef.current;
    setReactions((r) => [...r.slice(-5), { id, emoji: EMOJIS[id % EMOJIS.length], x: -40 + Math.random() * 80 }]);
    window.setTimeout(() => setReactions((r) => r.filter((x) => x.id !== id)), 700);

    if (levelRef.current >= 100) {
      brokenRef.current = true;
      sound.play("celebrate");
      setBroken(true);
      setLevel(100);
    }
  };

  return (
    <div className="scene-root items-center text-center text-ink">
      <p className="font-display text-[24px] leading-snug text-cream">{copy.title}</p>
      <p className="mt-2 text-sm text-cream/75">{copy.subtitle}</p>

      <div className="relative mt-8 flex h-[250px] w-full items-center justify-center">
        <motion.button
          type="button"
          aria-label="Tap the heart"
          className="relative flex h-44 w-44 items-center justify-center rounded-full"
          onPointerDown={() => {
            hold.current = window.setTimeout(() => onLongPress(), 520);
          }}
          onClick={(e) => {
            if (hold.current) window.clearTimeout(hold.current);
            tapHeart(e);
          }}
          onPointerUp={() => {
            if (hold.current) window.clearTimeout(hold.current);
          }}
          animate={{ scale: draining ? scale * 0.94 : [scale, scale * 1.06, scale] }}
          transition={{ duration: draining ? 0.2 : 0.28 }}
        >
          <HeartSvg className="h-40 w-40 text-[#e45a6a] drop-shadow-[0_12px_24px_rgba(196,40,70,0.45)]" />
          <span className="absolute text-4xl">❤️</span>
        </motion.button>
        {reactions.map((r) => (
          <motion.span
            key={r.id}
            className="pointer-events-none absolute text-2xl"
            initial={{ opacity: 1, y: 10, x: r.x }}
            animate={{ opacity: 0, y: -70 }}
            transition={{ duration: 0.7 }}
          >
            {r.emoji}
          </motion.span>
        ))}
      </div>

      <p className="text-[11px] tracking-[0.22em] text-cream/60">LOVE LEVEL</p>
      <div className="mt-2 h-3 w-full max-w-[240px] overflow-hidden rounded-full bg-white/15">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-blush via-rosepink to-[#ff8aa0]"
          animate={{ width: `${fill}%` }}
          transition={{ type: "tween", duration: 0.12, ease: "linear" }}
        />
      </div>
      <p className="mt-2 font-display text-[28px] text-cream">{love.toLocaleString()}%</p>
      <p className="mt-1 min-h-[20px] text-xs text-cream/70">{hint}</p>

      <AnimatePresence>
        {broken && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex flex-col items-center gap-4"
          >
            <p className="text-[16px] text-cream">{copy.broken}</p>
            <p className="font-hand text-[24px] text-blush">{copy.tooMuch}</p>
            <MagicalButton onClick={onNext}>{copy.cta}</MagicalButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
