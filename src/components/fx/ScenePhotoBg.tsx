"use client";

type Props = {
  src: string;
  opacity?: number;
  overlay?: string;
};

export function ScenePhotoBg({
  src,
  opacity = 0.38,
  overlay = "linear-gradient(180deg, rgba(20,8,14,0.55) 0%, rgba(42,21,32,0.62) 48%, rgba(26,12,18,0.82) 100%)",
}: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="h-full w-full object-cover" style={{ opacity }} />
      <div className="absolute inset-0" style={{ background: overlay }} />
    </div>
  );
}
