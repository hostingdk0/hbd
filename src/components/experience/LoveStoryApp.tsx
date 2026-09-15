"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { loveStory } from "@/config/loveStory";
import { sound } from "@/lib/sound";
import { Chrome } from "@/components/experience/Chrome";
import { ConfettiRain, HeartBurst, Toast, useBursts } from "@/components/fx/Ambient";
import { SceneOpening } from "@/components/scenes/SceneOpening";
import { SceneArrowHeart } from "@/components/scenes/SceneArrowHeart";
import { SceneEnvelope } from "@/components/scenes/SceneEnvelope";
import { SceneLoveMeter } from "@/components/scenes/SceneLoveMeter";
import { SceneBalloons } from "@/components/scenes/SceneBalloons";
import { SceneAlbum } from "@/components/scenes/SceneAlbum";
import { ScenePuzzle } from "@/components/scenes/ScenePuzzle";
import { ScenePickOne } from "@/components/scenes/ScenePickOne";
import { SceneNoButton } from "@/components/scenes/SceneNoButton";
import { SceneWishes } from "@/components/scenes/SceneWishes";
import { SceneCake } from "@/components/scenes/SceneCake";
import { SceneLetter } from "@/components/scenes/SceneLetter";
import { ScenePhotoReveal } from "@/components/scenes/ScenePhotoReveal";
import { SceneFinalHeart } from "@/components/scenes/SceneFinalHeart";
import { SceneFinale } from "@/components/scenes/SceneFinale";

export const SCENES = [
  "opening",
  "arrowHeart",
  "envelope",
  "loveMeter",
  "balloons",
  "album",
  "puzzle",
  "pickOne",
  "noButton",
  "wishes",
  "cake",
  "letter",
  "photoReveal",
  "finalHeart",
  "finale",
] as const;

const BACKGROUNDS: Record<(typeof SCENES)[number], string> = {
  opening: "linear-gradient(180deg, #140910 0%, #2a1520 46%, #4a2434 100%)",
  arrowHeart: "linear-gradient(180deg, #160c12 0%, #3a1a28 50%, #5a2a3c 100%)",
  envelope: "linear-gradient(180deg, #1d1016 0%, #3a1f2b 52%, #6a3546 100%)",
  loveMeter: "linear-gradient(180deg, #201018 0%, #4a2434 55%, #7a3d50 100%)",
  balloons: "linear-gradient(180deg, #2a1824 0%, #5a3348 40%, #c99bb0 100%)",
  album: "linear-gradient(180deg, #24151c 0%, #4a2d38 50%, #8a5564 100%)",
  puzzle: "linear-gradient(180deg, #1c1016 0%, #3d2430 55%, #6d3d4c 100%)",
  pickOne: "linear-gradient(180deg, #22141b 0%, #4a2a38 50%, #8a4d62 100%)",
  noButton: "linear-gradient(180deg, #1a1016 0%, #402430 55%, #734050 100%)",
  wishes: "linear-gradient(180deg, #241820 0%, #4a3344 45%, #8a6270 100%)",
  cake: "linear-gradient(180deg, #2a1420 0%, #5a2438 40%, #c45c6a 100%)",
  letter: "linear-gradient(180deg, #1c1216 0%, #3a242c 50%, #6a4850 100%)",
  photoReveal: "linear-gradient(180deg, #10080c 0%, #241018 60%, #3a1824 100%)",
  finalHeart: "linear-gradient(180deg, #14080e 0%, #3a1424 50%, #6a2038 100%)",
  finale: "linear-gradient(180deg, #2a1820 0%, #6a3d4c 48%, #f0d2d8 100%)",
};

type Eggs = {
  corner: boolean;
  rapid: boolean;
  longPress: boolean;
  doublePhoto: boolean;
  balloons: boolean;
  puzzle: boolean;
  wishes: boolean;
  cake: boolean;
  secret: boolean;
};

const emptyEggs: Eggs = {
  corner: false,
  rapid: false,
  longPress: false,
  doublePhoto: false,
  balloons: false,
  puzzle: false,
  wishes: false,
  cake: false,
  secret: false,
};

export default function LoveStoryApp() {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [musicOn, setMusicOn] = useState(false);
  const [musicVisible, setMusicVisible] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [cornerTaps, setCornerTaps] = useState(0);
  const [eggs, setEggs] = useState<Eggs>(emptyEggs);
  const [showAchievement, setShowAchievement] = useState(false);
  const phoneRef = useRef<HTMLDivElement>(null);
  const { bursts, spawn } = useBursts();
  const scene = SCENES[index];

  useEffect(() => {
    loveStory.album.memories.forEach((m) => {
      const img = new Image();
      img.src = m.image;
    });
    [loveStory.puzzle.image, loveStory.photoReveal.image, loveStory.finale.psImage].forEach((src) => {
      const img = new Image();
      img.src = src;
    });
    Object.values(loveStory.extras).forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem("naina-love-scene-v2");
    if (saved) {
      const n = Number(saved);
      if (n > 0 && n < SCENES.length) {
        setIndex(n);
        setMusicVisible(true);
      }
    }
    window.history.replaceState({ scene: Number(saved) || 0 }, "", window.location.pathname);
  }, []);

  useEffect(() => {
    sessionStorage.setItem("naina-love-scene-v2", String(index));
  }, [index]);

  useEffect(() => {
    const onPop = (event: PopStateEvent) => {
      const next = event.state?.scene;
      if (typeof next === "number" && next >= 0 && next < SCENES.length) {
        setDirection(next < index ? -1 : 1);
        setIndex(next);
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [index]);

  const showToast = useCallback((text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(null), 1800);
  }, []);

  const burstAt = useCallback(
    (clientX: number, clientY: number) => {
      if (reduceMotion) return;
      const rect = phoneRef.current?.getBoundingClientRect();
      const x = rect ? clientX - rect.left : clientX;
      const y = rect ? clientY - rect.top : clientY;
      spawn(x, y);
    },
    [reduceMotion, spawn],
  );

  const celebrate = useCallback(() => {
    if (reduceMotion) return;
    setConfetti(true);
    window.setTimeout(() => setConfetti(false), 2200);
  }, [reduceMotion]);

  const goTo = useCallback((next: number, dir = 1) => {
    const clamped = Math.max(0, Math.min(SCENES.length - 1, next));
    setDirection(dir);
    setIndex(clamped);
    window.history.pushState({ scene: clamped }, "", `#${SCENES[clamped]}`);
  }, []);

  const onNext = useCallback(() => {
    sound.play("whoosh");
    goTo(index + 1, 1);
  }, [goTo, index]);

  const begin = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      burstAt(event.clientX, event.clientY);
      await sound.unlock();
      await sound.setMusic(true);
      setMusicOn(true);
      setMusicVisible(true);
      celebrate();
      onNext();
    },
    [burstAt, celebrate, onNext],
  );

  const markEgg = useCallback((key: keyof Eggs, message?: string) => {
    setEggs((prev) => {
      if (prev[key]) return prev;
      if (message) showToast(message);
      return { ...prev, [key]: true };
    });
  }, [showToast]);

  useEffect(() => {
    const complete =
      eggs.corner &&
      eggs.rapid &&
      eggs.longPress &&
      eggs.doublePhoto &&
      eggs.balloons &&
      eggs.puzzle &&
      eggs.wishes &&
      eggs.cake &&
      eggs.secret &&
      scene === "finale";
    if (complete) {
      setShowAchievement(true);
      sound.play("celebrate");
      celebrate();
    }
  }, [eggs, scene, celebrate]);

  const variants = useMemo(
    () => ({
      enter: (dir: number) => ({
        opacity: 0,
        x: reduceMotion ? 0 : dir > 0 ? 36 : -36,
        scale: reduceMotion ? 1 : 0.98,
      }),
      center: { opacity: 1, x: 0, scale: 1 },
      exit: (dir: number) => ({
        opacity: 0,
        x: reduceMotion ? 0 : dir > 0 ? -28 : 28,
        scale: reduceMotion ? 1 : 0.985,
      }),
    }),
    [reduceMotion],
  );

  return (
    <main className="stage">
      <div className="phone">
        <div className="phone-notch" />
        <div ref={phoneRef} className="phone-inner" style={{ background: BACKGROUNDS[scene] }}>
          <Chrome
            index={index}
            total={SCENES.length}
            showProgress={index > 0}
            showMusic={musicVisible}
            musicOn={musicOn}
            onToggleMusic={() => {
              void (async () => {
                await sound.unlock();
                const next = !musicOn;
                setMusicOn(next);
                await sound.setMusic(next);
              })();
            }}
            onSecretHeart={() => {
              const next = cornerTaps + 1;
              setCornerTaps(next);
              sound.play("soft");
              if (next >= 5) markEgg("corner", loveStory.easterEggs.corner);
            }}
          />

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={scene}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: reduceMotion ? 0.18 : 0.42, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              {scene === "opening" && <SceneOpening onBegin={begin} />}
              {scene === "arrowHeart" && (
                <SceneArrowHeart onNext={onNext} burstAt={burstAt} onCelebrate={celebrate} />
              )}
              {scene === "envelope" && <SceneEnvelope onNext={onNext} burstAt={burstAt} />}
              {scene === "loveMeter" && (
                <SceneLoveMeter
                  onNext={onNext}
                  burstAt={burstAt}
                  onRapidTaps={() => markEgg("rapid", loveStory.easterEggs.excited)}
                  onLongPress={() => markEgg("longPress", loveStory.easterEggs.longPress)}
                />
              )}
              {scene === "balloons" && (
                <SceneBalloons
                  onNext={() => {
                    celebrate();
                    onNext();
                  }}
                  burstAt={burstAt}
                  onPoppedAll={() => markEgg("balloons")}
                />
              )}
              {scene === "album" && (
                <SceneAlbum onNext={onNext} burstAt={burstAt} onDoublePhoto={() => markEgg("doublePhoto")} />
              )}
              {scene === "puzzle" && (
                <ScenePuzzle onNext={onNext} burstAt={burstAt} onSolved={() => markEgg("puzzle")} />
              )}
              {scene === "pickOne" && <ScenePickOne onNext={onNext} burstAt={burstAt} />}
              {scene === "noButton" && <SceneNoButton onNext={onNext} />}
              {scene === "wishes" && (
                <SceneWishes onNext={onNext} burstAt={burstAt} onOpenedAll={() => markEgg("wishes")} />
              )}
              {scene === "cake" && (
                <SceneCake
                  onNext={() => {
                    celebrate();
                    onNext();
                  }}
                  burstAt={burstAt}
                  onWished={() => {
                    markEgg("cake");
                    celebrate();
                  }}
                />
              )}
              {scene === "letter" && <SceneLetter onNext={onNext} />}
              {scene === "photoReveal" && (
                <ScenePhotoReveal
                  onNext={onNext}
                  burstAt={burstAt}
                  onDoublePhoto={() => markEgg("doublePhoto")}
                  onCelebrate={celebrate}
                />
              )}
              {scene === "finalHeart" && (
                <SceneFinalHeart
                  onNext={onNext}
                  burstAt={burstAt}
                  onLongPress={() => markEgg("longPress", loveStory.easterEggs.longPress)}
                />
              )}
              {scene === "finale" && (
                <SceneFinale
                  showAchievement={showAchievement}
                  onSecretOpened={() => markEgg("secret")}
                  onReplay={() => {
                    setEggs(emptyEggs);
                    setShowAchievement(false);
                    setCornerTaps(0);
                    goTo(0, -1);
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {bursts.map((burst) => (
            <HeartBurst key={burst.id} burst={burst} />
          ))}
          <ConfettiRain show={confetti} />
          <Toast text={toast} />
        </div>
      </div>
    </main>
  );
}
