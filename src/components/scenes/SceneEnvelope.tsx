"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { loveStory } from "@/config/loveStory";
import { MagicalButton } from "@/components/ui/MagicalButton";
import { FloatingHearts, Sparkles } from "@/components/fx/Ambient";
import { sound } from "@/lib/sound";

type Props = {
  onNext: () => void;
  burstAt: (x: number, y: number) => void;
};

type Phase = "closed" | "unsealing" | "flapping" | "rising" | "revealed";

const ENV_W = 260;
const ENV_H = 168;
const LETTER_OUT = 146;
const LETTER_TUCK = 10;

export function SceneEnvelope({ onNext, burstAt }: Props) {
  const copy = loveStory.envelope;
  const [phase, setPhase] = useState<Phase>("closed");
  const envRef = useRef<HTMLDivElement>(null);
  const didCelebrate = useRef(false);

  const letterOut = phase === "rising" || phase === "revealed";
  const flapBehind = phase === "rising" || phase === "revealed";
  const flapOpen = phase === "flapping" || flapBehind;
  const revealed = phase === "revealed";

  useEffect(() => {
    if (phase !== "revealed" || didCelebrate.current) return;
    didCelebrate.current = true;
    sound.play("celebrate");
    const node = envRef.current;
    if (!node) return;
    const r = node.getBoundingClientRect();
    burstAt(r.left + r.width / 2, r.top + 36);
  }, [phase, burstAt]);

  const open = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (phase !== "closed") return;
    sound.play("envelope");
    burstAt(event.clientX, event.clientY);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("revealed");
      return;
    }
    setPhase("unsealing");
  };

  return (
    <div className="scene-root items-center text-center text-cream">
      <FloatingHearts count={revealed ? 12 : 6} dark />
      {(flapOpen || revealed) && <Sparkles count={revealed ? 12 : 6} />}
      <p className="relative z-10 shrink-0 font-display text-[24px] leading-snug">{copy.tease}</p>

      <div className="relative z-10 mx-auto mt-3 flex w-full max-w-[300px] flex-1 items-end justify-center pb-1">
        <div
          ref={envRef}
          className="env-root relative"
          style={{ width: ENV_W, height: ENV_H + LETTER_OUT }}
        >
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 rounded-[14px]"
            style={{
              zIndex: 0,
              height: ENV_H,
              background: "linear-gradient(180deg, #d97886 0%, #b84555 100%)",
              boxShadow: "0 16px 28px rgba(70,18,36,0.3)",
            }}
          />

          <div
            className="absolute inset-x-0 bottom-0 overflow-hidden"
            style={{
              zIndex: 2,
              height: letterOut ? ENV_H + LETTER_OUT : ENV_H,
            }}
          >
            <motion.div
              className="paper absolute left-[7%] right-[7%] rounded-[6px] px-4 pt-4 pb-6 text-center"
              style={{ bottom: LETTER_TUCK }}
              initial={false}
              animate={{ y: letterOut ? -LETTER_OUT : 0 }}
              transition={{
                duration: 0.9,
                ease: [0.22, 1, 0.36, 1],
              }}
              onAnimationComplete={() => {
                setPhase((current) => (current === "rising" ? "revealed" : current));
              }}
            >
              <motion.div
                initial={false}
                animate={revealed ? { y: [0, -7, 0] } : { y: 0 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
              >
                <div className="mx-auto mb-2 h-px w-12 bg-[#e8a4ad]" />
                <p className="font-hand text-[20px] leading-snug text-ink">{copy.inside}</p>
                <p className="mt-2 font-hand text-[16px] text-rosepink">— {loveStory.husbandName}</p>
              </motion.div>
            </motion.div>
          </div>

          <div
            className="env-pocket pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden rounded-[14px]"
            style={{ zIndex: 3, height: ENV_H }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(180deg, #f4c8ce 0%, #e08996 46%, #c45c6a 100%)",
                boxShadow: "inset 0 14px 18px rgba(90, 20, 40, 0.14)",
              }}
            />
            <div
              className="absolute inset-x-0 top-0 h-[3px]"
              style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.35), rgba(90,20,40,0.12))" }}
            />
            <div
              className="absolute inset-x-0 top-0 h-[78px] opacity-30"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.08) 70%, transparent 100%)",
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              }}
            />
          </div>

          <div
            className="absolute inset-x-0"
            style={{
              top: LETTER_OUT,
              zIndex: flapBehind ? 1 : 5,
              height: 100,
              perspective: 1200,
              perspectiveOrigin: "50% 0%",
            }}
          >
            <motion.div
              className="absolute inset-x-0 top-0 h-[100px] origin-top [transform-style:preserve-3d]"
              initial={false}
              animate={{ rotateX: flapOpen ? 180 : 0 }}
              transition={{ duration: 0.82, ease: [0.45, 0.05, 0.2, 1] }}
              onAnimationComplete={() => {
                setPhase((current) => (current === "flapping" ? "rising" : current));
              }}
            >
              <div
                className="env-face absolute inset-0"
                style={{
                  clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                  background: "linear-gradient(180deg, #fff0f2 0%, #f0b4bc 55%, #d47886 100%)",
                  filter: "drop-shadow(0 8px 10px rgba(80,20,40,0.16))",
                }}
              />
              <div
                className="env-face absolute inset-0"
                style={{
                  clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                  transform: "rotateX(180deg)",
                  background: "linear-gradient(180deg, #fff8f9 0%, #f6d0d6 100%)",
                }}
              />
            </motion.div>
          </div>

          <AnimatePresence onExitComplete={() => setPhase((current) => (current === "unsealing" ? "flapping" : current))}>
            {phase === "closed" && (
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.2, y: -16, opacity: 0 }}
                transition={{ duration: 0.36 }}
                className="absolute left-1/2 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-br from-[#e56b76] to-[#8f2a38] text-[18px] shadow-[0_8px_14px_rgba(90,16,32,0.4)] ring-[3px] ring-[#f8d5da]"
                style={{ top: LETTER_OUT + 72, zIndex: 6 }}
              >
                ❤️
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {revealed &&
              ["💕", "✨", "💗", "✨", "❤️"].map((emoji, i) => (
                <motion.span
                  key={emoji + i}
                  className="pointer-events-none absolute text-lg"
                  style={{ left: 28 + i * 48, top: 18 }}
                  initial={{ opacity: 0, y: 12, scale: 0.6 }}
                  animate={{ opacity: [0, 1, 0], y: -46, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.1, delay: i * 0.08, ease: "easeOut" }}
                >
                  {emoji}
                </motion.span>
              ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="relative z-10 mt-3 min-h-[96px] shrink-0">
        <AnimatePresence mode="wait">
          {phase === "closed" ? (
            <motion.div key="open" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <MagicalButton pulse ariaLabel={copy.openCta} onClick={open}>
                {copy.openCta}
              </MagicalButton>
            </motion.div>
          ) : revealed ? (
            <motion.div
              key="go"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <p className="font-hand text-[26px] text-blush">{copy.ready}</p>
              <MagicalButton ariaLabel={copy.cta} onClick={onNext}>
                {copy.cta}
              </MagicalButton>
            </motion.div>
          ) : (
            <motion.div key="wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-14" />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
