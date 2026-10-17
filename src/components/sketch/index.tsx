"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Translucent strip of masking tape, pinned to the top of a card. */
export function Tape({ className, rotate = -4 }: { className?: string; rotate?: number }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute left-1/2 -top-3 z-20 h-6 w-20 -translate-x-1/2 bg-erased/70 shadow-[0_1px_0_rgba(45,45,45,0.15)]",
        className,
      )}
      style={{ rotate: `${rotate}deg`, clipPath: "polygon(3% 0, 97% 4%, 100% 100%, 0 94%)" }}
    />
  );
}

/** Red thumbtack. */
export function Tack({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("absolute left-1/2 -top-2 z-20 -translate-x-1/2", className)}>
      <span className="block h-4 w-4 rounded-full border-2 border-pencil bg-marker shadow-hard-sm" />
    </span>
  );
}

/** Small stamped label, e.g. PHOTO / NOTE. */
export function StampLabel({
  children,
  tone = "pencil",
  className,
}: {
  children: ReactNode;
  tone?: "pencil" | "marker" | "ink";
  className?: string;
}) {
  const tones = {
    pencil: "border-pencil text-pencil",
    marker: "border-marker text-marker",
    ink: "border-ink text-ink",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 border-2 px-1.5 py-[1px] font-mono text-[9px] font-semibold uppercase tracking-[0.2em] wobbly-sm",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Hand-drawn dashed arrow, curving down-right. */
export function ScribbleArrow({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 120 80" fill="none" className={cn("text-pencil", className)} aria-hidden>
      <motion.path
        d="M6 8 C 30 4, 60 14, 72 34 S 92 66, 108 66"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="6 6"
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, delay: 0.5, ease: "easeInOut" }}
      />
      <motion.path
        d="M96 56 L 110 66 L 96 74"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
      />
    </svg>
  );
}

/** Hand-drawn underline scribble. */
export function Scribble({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 200 14" fill="none" preserveAspectRatio="none" className={cn("text-marker", className)} aria-hidden>
      <motion.path
        d="M2 9 C 40 3, 80 12, 120 6 S 180 4, 198 8"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay: 0.35, ease: "easeOut" }}
      />
    </svg>
  );
}

type WobblyButtonProps = HTMLMotionProps<"button"> & {
  variant?: "marker" | "paper" | "muted";
  size?: "md" | "lg" | "xl";
};

/** Wobbly oval button with a hard shadow that "presses flat". */
export function WobblyButton({ variant = "paper", size = "md", className, children, ...rest }: WobblyButtonProps) {
  const reduce = useReducedMotion();
  const variants = {
    marker: "bg-marker text-card hover:bg-pencil",
    paper: "bg-card text-pencil hover:bg-marker hover:text-card",
    muted: "bg-erased text-pencil hover:bg-ink hover:text-card",
  } as const;
  const sizes = {
    md: "px-4 py-1.5 text-base border-2",
    lg: "px-6 py-2.5 text-lg border-[3px]",
    xl: "px-10 py-4 text-2xl border-[3px]",
  } as const;
  return (
    <motion.button
      whileHover={reduce ? undefined : { x: 2, y: 2, boxShadow: "2px 2px 0 0 var(--pencil)" }}
      whileTap={reduce ? undefined : { x: 4, y: 4, boxShadow: "0px 0px 0 0 var(--pencil)" }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      className={cn(
        "relative inline-flex select-none items-center justify-center gap-2 border-pencil font-note shadow-hard wobbly transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
