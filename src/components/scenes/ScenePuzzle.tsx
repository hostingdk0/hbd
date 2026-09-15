"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { loveStory } from "@/config/loveStory";
import { MagicalButton } from "@/components/ui/MagicalButton";
import { haptic } from "@/lib/haptics";
import { sound } from "@/lib/sound";

type Props = {
  onNext: () => void;
  burstAt: (x: number, y: number) => void;
  onSolved: () => void;
};

function lightShuffle() {
  const tiles = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  const swaps = 5;
  for (let s = 0; s < swaps; s++) {
    const a = Math.floor(Math.random() * 9);
    const neighbors = [a - 1, a + 1, a - 3, a + 3].filter((n) => n >= 0 && n < 9 && Math.abs((n % 3) - (a % 3)) + Math.abs(Math.floor(n / 3) - Math.floor(a / 3)) === 1);
    const b = neighbors[Math.floor(Math.random() * neighbors.length)] ?? (a + 1) % 9;
    [tiles[a], tiles[b]] = [tiles[b], tiles[a]];
  }
  if (tiles.every((v, i) => v === i)) {
    [tiles[0], tiles[1]] = [tiles[1], tiles[0]];
  }
  return tiles;
}

export function ScenePuzzle({ onNext, burstAt, onSolved }: Props) {
  const copy = loveStory.puzzle;
  const [tiles, setTiles] = useState(lightShuffle);
  const [selected, setSelected] = useState<number | null>(null);
  const [complete, setComplete] = useState(false);
  const image = copy.image;

  const isSolved = useMemo(() => tiles.every((v, i) => v === i), [tiles]);

  const choose = (i: number, event: { clientX: number; clientY: number }) => {
    if (complete) return;
    haptic(8);
    sound.play("click");
    if (selected === null) {
      setSelected(i);
      return;
    }
    if (selected === i) {
      setSelected(null);
      return;
    }
    const next = [...tiles];
    [next[selected], next[i]] = [next[i], next[selected]];
    setTiles(next);
    setSelected(null);
    if (next.every((v, idx) => v === idx)) {
      setComplete(true);
      sound.play("celebrate");
      burstAt(event.clientX, event.clientY);
      onSolved();
    }
  };

  const help = () => {
    setTiles([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    setComplete(true);
    sound.play("sparkle");
    onSolved();
  };

  return (
    <div className="scene-root items-center text-center text-cream">
      <p className="font-display text-[24px]">{copy.title}</p>
      <p className="mt-2 text-sm text-cream/70">{copy.hint}</p>

      <div className="mt-6 grid w-[min(100%,300px)] grid-cols-3 gap-1.5 rounded-2xl bg-white/10 p-1.5">
        {tiles.map((original, i) => {
          const row = Math.floor(original / 3);
          const col = original % 3;
          return (
            <motion.button
              key={`${original}-${i}`}
              type="button"
              aria-label={`Puzzle tile ${i + 1}`}
              onClick={(e) => choose(i, e)}
              animate={{ scale: selected === i ? 0.94 : 1 }}
              className={`aspect-square overflow-hidden rounded-xl border-2 ${selected === i ? "border-blush" : "border-transparent"}`}
              style={{
                backgroundImage: `url(${image})`,
                backgroundSize: "300% 300%",
                backgroundPosition: `${(col / 2) * 100}% ${(row / 2) * 100}%`,
              }}
            />
          );
        })}
      </div>

      {!complete && (
        <button type="button" onClick={help} className="mt-4 min-h-11 text-sm text-cream/70">
          {copy.help}
        </button>
      )}

      {(complete || isSolved) && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 flex flex-col items-center gap-3">
          <p className="text-[16px]">{copy.complete}</p>
          <p className="font-hand text-[24px] text-blush">{copy.after}</p>
          <MagicalButton onClick={onNext}>{copy.cta}</MagicalButton>
        </motion.div>
      )}
    </div>
  );
}
