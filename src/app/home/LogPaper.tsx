"use client";

import type { CSSProperties, ReactNode } from "react";
import { Tape, Tack } from "@/components/sketch";
import { categoryOf, stampOf, type LogStyleId } from "./feed-types";

/** Rubber-stamp imprint for a category: fixed shape + ink, faded grainy texture, slight tilt. */
export function CategoryStamp({ type, className = "", tilt = -6 }: { type: string; className?: string; tilt?: number }) {
  const cat = categoryOf(type);
  const { shape, ink } = stampOf(type);
  const base: CSSProperties = {
    color: ink,
    borderColor: ink,
    rotate: `${tilt}deg`,
    // speckled "not fully inked" texture
    WebkitMaskImage:
      "radial-gradient(circle at 20% 30%, transparent 0 1px, #000 1.5px), radial-gradient(circle at 70% 60%, transparent 0 1px, #000 1.5px)",
    WebkitMaskSize: "7px 7px, 11px 9px",
    maskImage:
      "radial-gradient(circle at 20% 30%, transparent 0 1px, #000 1.5px), radial-gradient(circle at 70% 60%, transparent 0 1px, #000 1.5px)",
    maskSize: "7px 7px, 11px 9px",
    maskComposite: "intersect",
    WebkitMaskComposite: "source-in",
  };
  const label = cat.label.toUpperCase();
  if (shape === "round") {
    return (
      <span
        className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-[2.5px] font-mono text-[9px] font-bold tracking-[0.12em] opacity-85 ${className}`}
        style={base}
        title={cat.label}
      >
        <span className="flex h-[46px] w-[46px] items-center justify-center rounded-full border border-current">{label}</span>
      </span>
    );
  }
  if (shape === "rect") {
    return (
      <span
        className={`inline-block shrink-0 border-[2.5px] p-[2px] font-serif text-xs font-black tracking-[0.18em] opacity-85 ${className}`}
        style={base}
        title={cat.label}
      >
        <span className="block border border-current px-2 py-0.5">{label}</span>
      </span>
    );
  }
  return (
    <span
      className={`inline-flex shrink-0 flex-col items-center rounded-full border-2 px-3 py-0.5 font-mono text-[10px] font-bold tracking-[0.2em] opacity-85 ${className}`}
      style={base}
      title={cat.label}
    >
      {label}
      <span className="w-full border-t border-dotted border-current" />
    </span>
  );
}

const LINED: CSSProperties = {
  backgroundImage: "repeating-linear-gradient(transparent 0 27px, color-mix(in oklab, var(--ink) 18%, transparent) 27px 28px)",
};
const TORN = "polygon(0 2%, 6% 0, 14% 2.5%, 23% 0.5%, 33% 2%, 44% 0, 55% 2.2%, 66% 0.4%, 77% 2%, 88% 0.3%, 100% 1.8%, 99% 98%, 90% 100%, 79% 97.6%, 68% 99.6%, 57% 97.8%, 45% 100%, 34% 98%, 22% 99.7%, 11% 97.8%, 0 99%)";

/** Paper shell shared by feed cards and the composer preview, one look per log style. */
export function paperProps(style: LogStyleId, hasPhoto: boolean): { className: string; style?: CSSProperties; decor: ReactNode; margin: boolean } {
  switch (style) {
    case "lined":
      return { className: "border-2 border-pencil bg-card shadow-hard wobbly-md", style: LINED, decor: <Tack />, margin: !hasPhoto };
    case "index":
      return {
        className: "border-2 border-pencil bg-card shadow-hard",
        style: { borderRadius: 4, boxShadow: "inset 0 34px 0 -32px var(--ink), 4px 4px 0 0 var(--pencil)" },
        decor: <Tape className="!left-auto !right-[-14px] !translate-x-0 w-16" rotate={38} />,
        margin: false,
      };
    case "scrap":
      return {
        className: "bg-[#efe3c8]",
        style: { clipPath: TORN },
        decor: <Tape rotate={3} className="!top-1" />,
        margin: false,
      };
    default:
      return {
        className: `border-2 border-pencil shadow-hard wobbly-md ${hasPhoto ? "bg-card" : "bg-postit"}`,
        decor: hasPhoto ? <Tape /> : <Tack />,
        margin: !hasPhoto,
      };
  }
}
