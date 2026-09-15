"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { loveStory } from "@/config/loveStory";
import { MagicalButton } from "@/components/ui/MagicalButton";
import { HeartSvg } from "@/components/ui/HeartSvg";
import { FloatingHearts } from "@/components/fx/Ambient";
import { haptic } from "@/lib/haptics";
import { sound } from "@/lib/sound";

type Props = {
  onNext: () => void;
  burstAt: (x: number, y: number) => void;
  onCelebrate?: () => void;
};

type GameState = "READY" | "DRAGGING" | "FLYING" | "MISSED" | "HIT" | "COMPLETE";

const GRAVITY = 620;
const MIN_PULL = 16;
const MAX_PULL = 102;
const SPEED_MIN = 420;
const SPEED_MAX = 980;
const HEART_R = 32;
const ARROW_R = 11;
const TRAJ_STEPS = 9;

type Pt = { x: number; y: number };

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by);
}

function angleFromUp(vx: number, vy: number) {
  return (Math.atan2(vx, -vy) * 180) / Math.PI;
}

function sampleTrajectory(x: number, y: number, vx: number, vy: number): Pt[] {
  const pts: Pt[] = [];
  let px = x;
  let py = y;
  let pvx = vx;
  let pvy = vy;
  const dt = 0.055;
  for (let i = 0; i < TRAJ_STEPS; i++) {
    px += pvx * dt;
    py += pvy * dt;
    pvy += GRAVITY * dt;
    pts.push({ x: px, y: py });
  }
  return pts;
}

export function SceneArrowHeart({ onNext, burstAt, onCelebrate }: Props) {
  const copy = loveStory.arrowGame;
  const arenaRef = useRef<HTMLDivElement>(null);
  const arrowEl = useRef<HTMLDivElement>(null);
  const heartEl = useRef<HTMLDivElement>(null);
  const stateRef = useRef<GameState>("READY");
  const shotRef = useRef(0);
  const sizeRef = useRef({ w: 320, h: 340 });
  const nockRef = useRef<Pt>({ x: 160, y: 300 });
  const heartRef = useRef({ x: 160, y: 70, scale: 1 });
  const arrowRef = useRef({ x: 160, y: 300, vx: 0, vy: 0, rot: 0, visible: true });
  const pullRef = useRef<Pt>({ x: 0, y: 0 });
  const dodgeRef = useRef({ on: false, started: false, tx: 0, ty: 0 });
  const flyShotRef = useRef(0);
  const pointerIdRef = useRef<number | null>(null);

  const [state, setState] = useState<GameState>("READY");
  const [shot, setShot] = useState(0);
  const [bowPos, setBowPos] = useState({ x: 160, y: 300 });
  const [pull, setPull] = useState<Pt>({ x: 0, y: 0 });
  const [traj, setTraj] = useState<Pt[]>([]);
  const [power, setPower] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [hitStep, setHitStep] = useState(0);
  const [heartGone, setHeartGone] = useState(false);
  const [frozenArrow, setFrozenArrow] = useState<{ x: number; y: number; rot: number } | null>(null);

  const layout = useCallback(() => {
    const el = arenaRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const w = r.width;
    const h = r.height;
    sizeRef.current = { w, h };
    nockRef.current = { x: w / 2, y: h - 46 };
    setBowPos((prev) => {
      const nx = w / 2;
      const ny = h - 46;
      if (Math.abs(prev.x - nx) < 0.5 && Math.abs(prev.y - ny) < 0.5) return prev;
      return { x: nx, y: ny };
    });
    if (stateRef.current === "READY" || stateRef.current === "MISSED") {
      if (shotRef.current === 0 && !dodgeRef.current.started) {
        heartRef.current.x = w / 2;
        heartRef.current.y = Math.max(62, h * 0.2);
      } else {
        heartRef.current.x = clamp(heartRef.current.x, 40, w - 40);
        heartRef.current.y = clamp(heartRef.current.y, 48, h * 0.45);
      }
      arrowRef.current.x = nockRef.current.x;
      arrowRef.current.y = nockRef.current.y;
      arrowRef.current.rot = 0;
      paint();
    }
  }, []);

  const paint = () => {
    const a = arrowRef.current;
    const h = heartRef.current;
    if (arrowEl.current && a.visible) {
      arrowEl.current.style.transform = `translate(${a.x}px, ${a.y}px) translate(-50%, -78%) rotate(${a.rot}deg)`;
    }
    if (heartEl.current) {
      heartEl.current.style.transform = `translate(${h.x}px, ${h.y}px) translate(-50%, -50%) scale(${h.scale})`;
    }
  };

  const toLocal = (clientX: number, clientY: number): Pt => {
    const r = arenaRef.current!.getBoundingClientRect();
    return { x: clientX - r.left, y: clientY - r.top };
  };

  const applyPull = (point: Pt) => {
    const nock = nockRef.current;
    let px = point.x - nock.x;
    let py = point.y - nock.y;
    const len = Math.hypot(px, py) || 0.0001;
    const clamped = Math.min(len, MAX_PULL);
    px = (px / len) * clamped;
    py = (py / len) * clamped;
    pullRef.current = { x: px, y: py };
    const pwr = clamped / MAX_PULL;
    setPull({ x: px, y: py });
    setPower(pwr);

    const aimX = -px;
    const aimY = -py;
    const rot = angleFromUp(aimX, aimY);
    arrowRef.current.x = nock.x + px;
    arrowRef.current.y = nock.y + py;
    arrowRef.current.rot = rot;
    arrowRef.current.visible = true;
    paint();

    if (clamped >= MIN_PULL) {
      const speed = SPEED_MIN + pwr * (SPEED_MAX - SPEED_MIN);
      const vx = (aimX / clamped) * speed;
      const vy = (aimY / clamped) * speed;
      setTraj(sampleTrajectory(nock.x + px, nock.y + py, vx, vy));
    } else {
      setTraj([]);
    }
  };

  const resetArrow = () => {
    const nock = nockRef.current;
    pullRef.current = { x: 0, y: 0 };
    arrowRef.current = { x: nock.x, y: nock.y, vx: 0, vy: 0, rot: 0, visible: true };
    setPull({ x: 0, y: 0 });
    setPower(0);
    setTraj([]);
    setFrozenArrow(null);
    paint();
  };

  const finishMiss = (text: string) => {
    stateRef.current = "MISSED";
    setState("MISSED");
    setMessage(text);
    sound.play("soft");
    window.setTimeout(() => {
      if (stateRef.current !== "MISSED") return;
      resetArrow();
      dodgeRef.current.on = false;
      dodgeRef.current.started = false;
      stateRef.current = "READY";
      setState("READY");
      setMessage(null);
    }, 1100);
  };

  const triggerHit = () => {
    const a = arrowRef.current;
    const h = heartRef.current;
    const arena = arenaRef.current?.getBoundingClientRect();
    stateRef.current = "HIT";
    setState("HIT");
    setFrozenArrow({ x: a.x, y: a.y, rot: a.rot });
    arrowRef.current.visible = false;
    haptic(20);
    sound.play("celebrate");
    if (arena) burstAt(arena.left + h.x, arena.top + h.y);
    onCelebrate?.();
    setHitStep(0);
    setMessage(copy.hit);

    window.setTimeout(() => setHeartGone(true), 520);
    window.setTimeout(() => {
      setHitStep(1);
      setMessage(copy.win);
    }, 1600);
    window.setTimeout(() => {
      setHitStep(2);
      setMessage(copy.tease);
      stateRef.current = "COMPLETE";
      setState("COMPLETE");
    }, 3000);
  };

  useEffect(() => {
    layout();
    const el = arenaRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => layout());
    ro.observe(el);
    return () => ro.disconnect();
  }, [layout]);

  useEffect(() => {
    if (state !== "FLYING") return;
    let frame = 0;
    let last = performance.now();
    const { w, h } = sizeRef.current;

    const loop = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      const arrow = arrowRef.current;
      const heart = heartRef.current;

      arrow.vx = arrow.vx;
      arrow.vy += GRAVITY * dt;
      arrow.x += arrow.vx * dt;
      arrow.y += arrow.vy * dt;
      arrow.rot = angleFromUp(arrow.vx, arrow.vy);

      const speed = Math.hypot(arrow.vx, arrow.vy) || 1;
      const tipX = arrow.x + (arrow.vx / speed) * 22;
      const tipY = arrow.y + (arrow.vy / speed) * 22;

      const shotIndex = flyShotRef.current;
      if (shotIndex < 2 && !dodgeRef.current.started) {
        const approaching = dist(tipX, tipY, heart.x, heart.y) < Math.max(108, h * 0.32);
        if (approaching) {
          dodgeRef.current.started = true;
          dodgeRef.current.on = true;
          dodgeRef.current.tx = shotIndex === 0 ? w * 0.8 : w * 0.2;
          dodgeRef.current.ty = clamp(heart.y + (shotIndex === 0 ? 12 : 22), 56, h * 0.42);
          sound.play("soft");
        }
      }

      if (dodgeRef.current.on) {
        heart.x += (dodgeRef.current.tx - heart.x) * Math.min(1, 11 * dt);
        heart.y += (dodgeRef.current.ty - heart.y) * Math.min(1, 11 * dt);
        if (dist(heart.x, heart.y, dodgeRef.current.tx, dodgeRef.current.ty) < 1.5) {
          heart.x = dodgeRef.current.tx;
          heart.y = dodgeRef.current.ty;
          dodgeRef.current.on = false;
        }
      }

      paint();

      const dTip = dist(tipX, tipY, heart.x, heart.y);
      const dMid = dist(arrow.x, arrow.y, heart.x, heart.y);
      if (shotIndex >= 2 && Math.min(dTip, dMid) < HEART_R + ARROW_R) {
        triggerHit();
        return;
      }

      if (arrow.x < -28 || arrow.x > w + 28 || arrow.y < -36 || arrow.y > h + 36) {
        const text =
          shotIndex === 0 ? copy.miss1 : shotIndex === 1 ? copy.miss2 : copy.missAgain;
        finishMiss(text);
        return;
      }

      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (stateRef.current !== "READY") return;
    const local = toLocal(event.clientX, event.clientY);
    if (local.y < sizeRef.current.h * 0.5) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    pointerIdRef.current = event.pointerId;
    stateRef.current = "DRAGGING";
    setState("DRAGGING");
    setMessage(null);
    haptic(8);
    applyPull(local);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (stateRef.current !== "DRAGGING") return;
    if (pointerIdRef.current !== null && event.pointerId !== pointerIdRef.current) return;
    event.preventDefault();
    applyPull(toLocal(event.clientX, event.clientY));
  };

  const release = (event: React.PointerEvent<HTMLDivElement>) => {
    if (stateRef.current !== "DRAGGING") return;
    if (pointerIdRef.current !== null && event.pointerId !== pointerIdRef.current) return;
    pointerIdRef.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // already released
    }

    const { x: px, y: py } = pullRef.current;
    const len = Math.hypot(px, py);
    if (len < MIN_PULL) {
      stateRef.current = "READY";
      setState("READY");
      resetArrow();
      return;
    }

    const pwr = len / MAX_PULL;
    const speed = SPEED_MIN + pwr * (SPEED_MAX - SPEED_MIN);
    const vx = (-px / len) * speed;
    const vy = (-py / len) * speed;
    const nock = nockRef.current;

    flyShotRef.current = shotRef.current;
    shotRef.current += 1;
    setShot(shotRef.current);
    dodgeRef.current = { on: false, started: false, tx: 0, ty: 0 };

    arrowRef.current.x = nock.x + px;
    arrowRef.current.y = nock.y + py;
    arrowRef.current.vx = vx;
    arrowRef.current.vy = vy;
    arrowRef.current.rot = angleFromUp(vx, vy);
    arrowRef.current.visible = true;
    setTraj([]);
    setPower(0);
    setPull({ x: 0, y: 0 });
    pullRef.current = { x: 0, y: 0 };
    haptic(12);
    sound.play("whoosh");
    stateRef.current = "FLYING";
    setState("FLYING");
  };

  const onPointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    if (stateRef.current !== "DRAGGING") return;
    pointerIdRef.current = null;
    stateRef.current = "READY";
    setState("READY");
    resetArrow();
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // ignore
    }
  };

  const nock = bowPos;
  const drawing = state === "DRAGGING";
  const stringNock = drawing ? { x: nock.x + pull.x, y: nock.y + pull.y } : nock;
  const canDrag = state === "READY" || state === "DRAGGING";
  const showArrow = (state !== "HIT" && state !== "COMPLETE") || frozenArrow;

  return (
    <div className="scene-root items-center text-center text-cream">
      <FloatingHearts count={8} dark />
      <p className="relative z-10 font-display text-[24px] leading-snug">{copy.title}</p>
      <p className="relative z-10 mt-1 text-sm text-cream/70">{copy.hint}</p>
      <div className="relative z-10 mt-1 flex gap-1 text-[13px]" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span key={i} className={i < shot ? "opacity-35" : "opacity-100"}>
            🏹
          </span>
        ))}
      </div>

      <div
        ref={arenaRef}
        className="relative z-10 mt-2 w-full max-w-[360px] flex-1 overflow-hidden touch-none select-none"
        style={{ minHeight: 300, height: "min(48dvh, 380px)", touchAction: "none" }}
        onPointerDown={canDrag ? onPointerDown : undefined}
        onPointerMove={onPointerMove}
        onPointerUp={release}
        onPointerCancel={onPointerCancel}
        role="application"
        aria-label="Bow and arrow. Pull back to aim, release to shoot."
      >
        <div
          ref={heartEl}
          className="pointer-events-none absolute left-0 top-0 will-change-transform"
          style={{ transform: "translate(-999px, -999px)" }}
        >
          {!heartGone && (
            <motion.div
              className="relative flex h-[72px] w-[72px] items-center justify-center"
              animate={
                state === "HIT"
                  ? { scale: [1, 1.28, 0.84, 1.18, 0], opacity: [1, 1, 1, 1, 0] }
                  : { scale: 1 }
              }
              transition={state === "HIT" ? { duration: 0.52 } : undefined}
            >
              <span className="absolute h-[72px] w-[72px] rounded-full border border-white/20" />
              <span className="absolute h-[52px] w-[52px] rounded-full border border-blush/40" />
              <HeartSvg className="h-14 w-14 text-[#e45a6a] drop-shadow-[0_10px_18px_rgba(196,40,70,0.45)]" />
              <span className="absolute text-3xl">❤️</span>
            </motion.div>
          )}
        </div>

        {traj.map((p, i) => (
          <span
            key={i}
            className="pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-cream/55"
            style={{ left: p.x, top: p.y, transform: "translate(-50%, -50%)", opacity: 0.85 - i * 0.07 }}
          />
        ))}

        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          <path
            d={`M ${nock.x - 40} ${nock.y - 8} Q ${nock.x} ${nock.y + 18 + power * 16} ${nock.x + 40} ${nock.y - 8}`}
            fill="none"
            stroke="#e8a4ad"
            strokeWidth={3.5}
            strokeLinecap="round"
          />
          <line
            x1={nock.x - 40}
            y1={nock.y - 8}
            x2={stringNock.x}
            y2={stringNock.y}
            stroke="#f7e6d8"
            strokeWidth={1.6}
          />
          <line
            x1={nock.x + 40}
            y1={nock.y - 8}
            x2={stringNock.x}
            y2={stringNock.y}
            stroke="#f7e6d8"
            strokeWidth={1.6}
          />
        </svg>

        {showArrow && (
          <div
            ref={arrowEl}
            className="pointer-events-none absolute left-0 top-0 z-10 will-change-transform"
            style={{
              transform: frozenArrow
                ? `translate(${frozenArrow.x}px, ${frozenArrow.y}px) translate(-50%, -78%) rotate(${frozenArrow.rot}deg)`
                : "translate(-999px, -999px)",
            }}
          >
            <div className="flex flex-col items-center">
              <div className="h-0 w-0 border-x-[7px] border-b-[14px] border-x-transparent border-b-[#f7e6d8]" />
              <div className="h-11 w-[3px] rounded-full bg-gradient-to-b from-[#f7e6d8] to-[#e8a4ad]" />
            </div>
          </div>
        )}

        {state === "DRAGGING" && (
          <div className="pointer-events-none absolute bottom-2 left-1/2 w-28 -translate-x-1/2">
            <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blush to-rosepink"
                style={{ width: `${Math.round(power * 100)}%` }}
              />
            </div>
            <p className="mt-1 text-[10px] tracking-[0.14em] text-cream/55">POWER</p>
          </div>
        )}
      </div>

      <div className="relative z-10 mt-2 min-h-[92px]">
        <AnimatePresence mode="wait">
          {message && (
            <motion.div
              key={message}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <p className="font-hand text-[24px] leading-snug text-blush">{message}</p>
              {state === "COMPLETE" && hitStep >= 2 && (
                <MagicalButton onClick={onNext}>{copy.cta}</MagicalButton>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        {state === "READY" && !message && (
          <p className="text-xs text-cream/55">Drag the arrow down to pull 🏹</p>
        )}
      </div>
    </div>
  );
}
