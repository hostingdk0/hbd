"use client";

import { Volume2, VolumeX } from "lucide-react";
import { loveStory } from "@/config/loveStory";
import { cn } from "@/lib/cn";
import { HeartSvg } from "@/components/ui/HeartSvg";

type Props = {
  index: number;
  total: number;
  showProgress: boolean;
  showMusic: boolean;
  musicOn: boolean;
  onToggleMusic: () => void;
  onSecretHeart: () => void;
};

export function Chrome({
  index,
  total,
  showProgress,
  showMusic,
  musicOn,
  onToggleMusic,
  onSecretHeart,
}: Props) {
  return (
    <>
      <button
        type="button"
        aria-label="Secret heart"
        onClick={onSecretHeart}
        className="absolute left-4 z-30 flex h-11 w-11 items-center justify-center rounded-full text-rosepink/80"
        style={{ top: "calc(var(--safe-top) + 4px)" }}
      >
        <HeartSvg className="h-5 w-5" />
      </button>

      {showMusic && (
        <button
          type="button"
          aria-label={musicOn ? loveStory.ui.musicOff : loveStory.ui.musicOn}
          onClick={onToggleMusic}
          className="absolute right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md"
          style={{ top: "calc(var(--safe-top) + 4px)" }}
        >
          {musicOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      )}

      {showProgress && (
        <div
          className="absolute left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-1"
          style={{ top: "calc(var(--safe-top) + 10px)" }}
        >
          <div className="flex items-center gap-[3px]" aria-hidden>
            {Array.from({ length: total }, (_, i) => (
              <HeartSvg
                key={i}
                className={cn("h-[11px] w-[11px] transition-colors", i <= index ? "text-rosepink" : "text-white/30")}
              />
            ))}
          </div>
          <p className="text-[10px] tracking-wide text-white/70">
            {loveStory.ui.loveQuest} {index + 1}/{total} ❤️
          </p>
        </div>
      )}
    </>
  );
}
