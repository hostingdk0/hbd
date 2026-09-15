"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { loveStory } from "@/config/loveStory";
import { MagicalButton } from "@/components/ui/MagicalButton";
import { FloatingHearts, Sparkles } from "@/components/fx/Ambient";
import { haptic } from "@/lib/haptics";
import { sound } from "@/lib/sound";

type Props = {
  onNext: () => void;
  burstAt: (x: number, y: number) => void;
  onDoublePhoto: () => void;
  onCelebrate?: () => void;
};

const BRUSH = 34;
const THRESHOLD = 0.67;

function paintFoil(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, "#e9d6dc");
  grad.addColorStop(0.22, "#c9b3bb");
  grad.addColorStop(0.45, "#f3e2e6");
  grad.addColorStop(0.68, "#d4b8c0");
  grad.addColorStop(1, "#f0d4da");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.globalAlpha = 0.18;
  for (let i = 0; i < 18; i++) {
    ctx.strokeStyle = i % 2 ? "#ffffff" : "#b08994";
    ctx.lineWidth = 6 + (i % 3) * 3;
    ctx.beginPath();
    ctx.moveTo(-40, i * 22 - 20);
    ctx.lineTo(w + 40, i * 22 + 40);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.12;
  for (let i = 0; i < Math.floor((w * h) / 90); i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    ctx.fillStyle = Math.random() > 0.5 ? "#fff" : "#9a6d78";
    ctx.fillRect(x, y, 1.4, 1.4);
  }
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.font = "42px serif";
  ctx.fillStyle = "#8a5a66";
  ctx.textAlign = "center";
  for (let y = 48; y < h; y += 72) {
    for (let x = 36; x < w; x += 68) {
      ctx.fillText("♡", x, y);
    }
  }
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = "#6d4b58";
  ctx.font = "600 15px 'DM Sans', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("SCRATCH", w / 2, h / 2 - 6);
  ctx.font = "13px 'DM Sans', sans-serif";
  ctx.fillStyle = "#a84555";
  ctx.fillText("💕", w / 2, h / 2 + 18);
  ctx.restore();
}

export function ScenePhotoReveal({ onNext, burstAt, onDoublePhoto, onCelebrate }: Props) {
  const copy = loveStory.photoReveal;
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scratching = useRef(false);
  const started = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const cleared = useRef(false);
  const lastCheck = useRef(0);
  const [revealed, setRevealed] = useState(false);
  const [hintOn, setHintOn] = useState(true);
  const [lastTap, setLastTap] = useState(0);

  const setup = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || cleared.current) return;
    if (started.current && canvas.width > 4) return;
    const rect = wrap.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    paintFoil(ctx, w, h);
  }, []);

  useEffect(() => {
    setup();
    const wrap = wrapRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver(() => {
      if (!cleared.current) setup();
    });
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [setup]);

  const localPoint = (event: { clientX: number; clientY: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const scratchAt = (x: number, y: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || cleared.current) return;
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = BRUSH;
    ctx.strokeStyle = "#000";
    ctx.fillStyle = "#000";
    if (last.current) {
      ctx.beginPath();
      ctx.moveTo(last.current.x, last.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, BRUSH / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    last.current = { x, y };
  };

  const measure = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return 0;
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let clear = 0;
    let total = 0;
    for (let i = 3; i < data.length; i += 32) {
      total += 1;
      if (data[i] < 48) clear += 1;
    }
    return total ? clear / total : 0;
  };

  const finish = (clientX: number, clientY: number) => {
    if (cleared.current) return;
    cleared.current = true;
    scratching.current = false;
    last.current = null;
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.transition = "opacity 0.55s ease";
      canvas.style.opacity = "0";
    }
    haptic(18);
    sound.play("sparkle");
    sound.play("celebrate");
    burstAt(clientX, clientY);
    onCelebrate?.();
    window.setTimeout(() => setRevealed(true), 280);
  };

  const maybeFinish = (event: { clientX: number; clientY: number }) => {
    const now = performance.now();
    if (now - lastCheck.current < 90) return;
    lastCheck.current = now;
    if (measure() >= THRESHOLD) finish(event.clientX, event.clientY);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (cleared.current) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    scratching.current = true;
    started.current = true;
    setHintOn(false);
    haptic(8);
    const p = localPoint(event);
    if (p) scratchAt(p.x, p.y);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!scratching.current || cleared.current) return;
    event.preventDefault();
    const p = localPoint(event);
    if (!p) return;
    scratchAt(p.x, p.y);
    maybeFinish(event);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    scratching.current = false;
    last.current = null;
    if (!cleared.current) maybeFinish(event);
    const now = Date.now();
    if (revealed && now - lastTap < 280) {
      onDoublePhoto();
      burstAt(event.clientX, event.clientY);
    }
    setLastTap(now);
  };

  return (
    <div className="scene-root items-center text-center text-cream">
      <FloatingHearts count={8} dark />
      {revealed && <Sparkles count={10} />}
      <p className="font-display text-[24px]">{copy.line1}</p>
      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.p
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-2 font-hand text-[22px] text-blush"
          >
            {copy.hint}
          </motion.p>
        ) : (
          <motion.p
            key="line"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 font-hand text-[24px] text-blush"
          >
            {copy.line2}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="photo-print relative mt-5 h-[min(360px,46dvh)] w-[min(250px,78vw)] overflow-hidden rounded-[22px] p-3">
        <div ref={wrapRef} className="relative h-full w-full overflow-hidden rounded-[14px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={copy.image}
            alt={copy.caption}
            className="h-full w-full object-cover"
            draggable={false}
          />
          {!revealed && (
            <canvas
              ref={canvasRef}
              className="absolute inset-0 h-full w-full touch-none rounded-[14px]"
              style={{ touchAction: "none", cursor: "crosshair" }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={() => {
                scratching.current = false;
                last.current = null;
              }}
              aria-label="Scratch to reveal the photo"
            />
          )}
          {hintOn && !revealed && (
            <div className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-[12px] tracking-wide text-[#6d4b58]/80">
              {copy.hint}
            </div>
          )}
        </div>
      </div>

      {revealed && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex flex-col items-center gap-3">
          <p className="text-sm text-cream/75">{copy.caption}</p>
          <MagicalButton onClick={onNext}>{copy.continueCta}</MagicalButton>
        </motion.div>
      )}
    </div>
  );
}
