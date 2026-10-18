"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import { Tape } from "@/components/sketch";
import { cn } from "@/lib/utils";

const TILTS = [-1.6, 1.2, -0.6, 1.8, -1.1, 0.7];

export function PageMotion({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return <motion.div className={className} initial={reduce ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }}>{children}</motion.div>;
}

/** A faded pencil-shaded bar. */
export function GhostBlock({ className, style }: { className?: string; style?: CSSProperties }) {
  return <span aria-hidden className={cn("block ghost-shimmer bg-erased/70", className)} style={style} />;
}

/** Same frame as PolaroidNode: padded card, 4:3 photo, words under the photo, reaction row. */
export function GhostPolaroid({ tilt = 0 }: { tilt?: number }) {
  return (
    <div aria-hidden className="relative flex flex-col border-2 border-pencil/25 bg-card p-3 pb-4 shadow-[3px_3px_0_0_color-mix(in_srgb,var(--pencil)_15%,transparent)] wobbly-md" style={{ rotate: `${tilt}deg` }}>
      <Tape className="opacity-50" />
      <GhostBlock className="aspect-[4/3] w-full border-2 border-pencil/15" style={{ borderRadius: "6px 14px 4px 10px" }} />
      <div className="flex flex-col gap-2 px-1 pt-3">
        <GhostBlock className="h-5 w-2/3" />
        <GhostBlock className="h-3 w-full" />
        <div className="mt-2 flex justify-between"><GhostBlock className="h-3 w-20" /><GhostBlock className="h-6 w-16 wobbly-sm" /></div>
      </div>
    </div>
  );
}

/** Same frame as NoteNode: post-it paper, serif heading, stamp corner, red margin. */
export function GhostNote({ tilt = 0 }: { tilt?: number }) {
  return (
    <div aria-hidden className="relative flex min-h-[200px] flex-col border-2 border-pencil/25 bg-postit/60 p-5 pl-9 shadow-[3px_3px_0_0_color-mix(in_srgb,var(--pencil)_15%,transparent)] wobbly" style={{ rotate: `${tilt}deg` }}>
      <span className="absolute bottom-3 left-6 top-3 w-[2px] bg-marker/25" />
      <div className="flex items-start justify-between gap-3">
        <GhostBlock className="mt-1 h-7 w-3/5" />
        <span className="h-6 w-14 rotate-[-7deg] border-2 border-dashed border-pencil/20 wobbly-sm" />
      </div>
      <GhostBlock className="mt-4 h-3 w-full" />
      <GhostBlock className="mt-3 h-3 w-4/5" />
      <div className="mt-auto flex justify-between pt-4"><GhostBlock className="h-3 w-20" /><GhostBlock className="h-6 w-16 wobbly-sm" /></div>
    </div>
  );
}

export function GhostFeed({ count = 2 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading logs" className="grid grid-cols-1 gap-x-6 gap-y-10 pt-3 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => i % 2 === 0 ? <GhostPolaroid key={i} tilt={TILTS[i % 6]} /> : <GhostNote key={i} tilt={TILTS[i % 6]} />)}
    </div>
  );
}

/** Mirrors GroupManager's small group pill. */
export function GhostGroupPill() {
  return (
    <div role="status" aria-label="Loading group" className="mx-auto inline-flex w-fit max-w-full items-center gap-3 border-2 border-pencil/25 bg-card px-3 py-1.5 shadow-hard-sm wobbly-sm" style={{ boxShadow: "2px 2px 0 0 color-mix(in srgb, var(--pencil) 20%, transparent)" }}>
      <span aria-hidden className="text-base opacity-40">👥</span>
      <GhostBlock className="h-4 w-24" /><GhostBlock className="h-3 w-16" /><GhostBlock className="h-5 w-14 bg-postit wobbly-sm" />
    </div>
  );
}

function GhostTapedAvatar({ size = "h-12 w-12" }: { size?: string }) {
  return (
    <span aria-hidden className={cn("relative block rotate-3 border-2 border-pencil/30 bg-card p-1 shadow-hard-sm", size)}>
      <Tape className="!h-3 !w-8 !-top-2 opacity-60" />
      <GhostBlock className="h-full w-full" />
    </span>
  );
}

function Masthead({ left, right }: { left: string; right: ReactNode }) {
  return (
    <header className="mt-6 border-y-4 border-double border-pencil py-4">
      <div className="flex items-center justify-between gap-4">
        <span className="font-note text-lg text-pencil/40">{left}</span>
        <span className="font-serif text-2xl font-black tracking-tight sm:text-3xl">Roz<span className="text-marker">.</span></span>
        {right}
      </div>
    </header>
  );
}

const Footer = () => (
  <footer className="border-t-2 border-dashed border-pencil/30 py-5 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-pencil/50">Roz · one page a day</footer>
);

export function GhostPage({ digest = false }: { digest?: boolean }) {
  return digest ? <GhostExplore /> : <GhostHome />;
}

/** Mirrors Home: masthead, greeting, group pill, day switcher, add button, divider, feed. */
export function GhostHome() {
  return (
    <div className="min-h-screen paper-grain text-pencil" role="status" aria-label="Loading your day">
      <main className="mx-auto flex min-h-screen max-w-[760px] flex-col px-5">
        <Masthead left="explore ↗" right={<span aria-hidden className="h-10 w-10 border-2 border-pencil/40 bg-erased shadow-hard-sm wobbly" />} />
        <div aria-hidden="true" className="flex flex-1 flex-col gap-8 pb-16 pt-10">
          <div className="flex flex-col items-center gap-2">
            <GhostBlock className="h-2.5 w-36" />
            <div className="relative"><GhostBlock className="h-10 w-72 max-w-[80vw] sm:h-12" /><span className="absolute -bottom-2 left-0 h-[3px] w-full rounded-full bg-marker/25" /></div>
            <GhostBlock className="mt-3 h-4 w-56" />
          </div>
          <GhostGroupPill />
          <div className="flex flex-1 flex-col gap-8">
            <div className="flex items-center justify-center gap-4">
              <GhostBlock className="h-4 w-6" /><span className="h-8 w-24 border-2 border-pencil/25 bg-card shadow-hard-sm wobbly" /><GhostBlock className="h-4 w-6" />
            </div>
            <div className="flex justify-center py-4"><span className="h-20 w-20 rounded-full border-[3px] border-pencil/40 bg-marker/30 shadow-hard" /></div>
            <div className="flex items-center gap-3">
              <span className="h-0 flex-1 border-t-2 border-dashed border-pencil/40" />
              <span className="font-serif text-sm font-black uppercase tracking-[0.25em] text-pencil/30">today&apos;s page</span>
              <span className="h-0 flex-1 border-t-2 border-dashed border-pencil/40" />
            </div>
            <GhostFeed />
          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
}

/** Mirrors Explore: nav, masthead, ticket stubs, lead story, sticky note, index card. */
export function GhostExplore() {
  return (
    <main className="min-h-screen bg-paper paper-grain pb-16 text-pencil" role="status" aria-label="Loading edition">
      <nav aria-hidden className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5">
        <span className="font-note text-lg text-ink/40">← home</span>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {["← older", "latest", "newer →"].map((l) => <span key={l} className="border-2 border-pencil/25 bg-card px-3 py-1 font-note text-lg text-pencil/30 wobbly">{l}</span>)}
        </div>
        <GhostTapedAvatar />
      </nav>
      <div aria-hidden="true">
        <header className="mx-auto max-w-6xl border-y-4 border-double border-pencil px-6 py-6 text-center">
          <span className="font-serif text-5xl font-black tracking-tight md:text-6xl">Roz<span className="text-marker">.</span></span>
          <div className="mt-3 flex justify-center gap-3"><GhostBlock className="h-3 w-32" /><GhostBlock className="h-3 w-24" /></div>
        </header>
        <div className="mx-auto mt-8 grid max-w-5xl grid-cols-2 gap-5 px-6 md:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex h-20 flex-col items-center justify-center gap-2 border-2 border-dashed border-pencil/25 bg-card" style={{ rotate: `${TILTS[i]}deg` }}>
              <GhostBlock className="h-6 w-10" /><GhostBlock className="h-2.5 w-16" />
            </div>
          ))}
        </div>
        <section className="mx-auto grid max-w-6xl grid-cols-12 gap-8 border-b-2 border-dashed border-pencil/40 px-6 py-12 md:py-16">
          <div className="col-span-12 md:col-span-7">
            <span className="mb-4 block h-7 w-28 -rotate-2 border-[3px] border-marker/30" />
            <GhostBlock className="mb-3 h-10 w-full" /><GhostBlock className="mb-6 h-10 w-2/3" />
            <GhostBlock className="mb-3 h-3 w-full" /><GhostBlock className="mb-3 h-3 w-full" /><GhostBlock className="h-3 w-3/4" />
          </div>
          <div className="col-span-12 md:col-span-5">
            <div className="relative rotate-2 border-2 border-pencil/25 bg-card p-3 pb-10 shadow-hard-sm">
              <Tape className="opacity-50" /><GhostBlock className="aspect-[4/3] w-full" />
            </div>
          </div>
        </section>
        <div className="mx-auto max-w-3xl px-6 py-14">
          <div className="relative mx-auto max-w-xl -rotate-1 border-2 border-pencil/25 bg-postit/60 p-8 wobbly-md">
            <span className="absolute left-1/2 -top-2 h-4 w-4 -translate-x-1/2 rounded-full bg-marker/40" />
            <GhostBlock className="mb-3 h-5 w-full" /><GhostBlock className="h-5 w-2/3" />
          </div>
        </div>
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="border-2 border-pencil/25 bg-card p-6" style={{ backgroundImage: "repeating-linear-gradient(transparent 0 27px, color-mix(in srgb, var(--ink) 12%, transparent) 27px 28px)" }}>
            <GhostBlock className="mb-5 h-6 w-40" /><GhostBlock className="mb-3 h-3 w-full" /><GhostBlock className="h-3 w-1/2" />
          </div>
        </div>
      </div>
    </main>
  );
}

/** Mirrors Profile: masthead, taped avatar polaroid, scrapbook calendar sheet, form. */
export function GhostProfile() {
  return (
    <div className="min-h-screen paper-grain text-pencil" role="status" aria-label="Loading profile">
      <main className="mx-auto flex min-h-screen max-w-[640px] flex-col px-5">
        <Masthead left="← home" right={<span className="w-14" aria-hidden />} />
        <div aria-hidden="true" className="flex flex-1 flex-col gap-10 pb-16 pt-10">
          <div className="flex flex-col items-center gap-3">
            <div className="relative -rotate-2 border-2 border-pencil/30 bg-card p-2 pb-8 shadow-hard-sm">
              <Tape className="opacity-60" /><GhostBlock className="h-28 w-28" />
            </div>
            <GhostBlock className="h-3 w-40" />
          </div>
          <div className="relative scrapbook-sheet border-2 border-pencil/25 p-5 opacity-80">
            <Tape className="!left-4 !translate-x-0 opacity-50" rotate={-30} />
            <Tape className="!left-auto !right-0 !translate-x-0 opacity-50" rotate={30} />
            <div className="mb-4 flex items-center justify-between">
              <GhostBlock className="h-4 w-8" />
              <span className="h-10 w-36 -rotate-2 border-2 border-pencil/20 bg-postit/70 shadow-hard-sm" />
              <GhostBlock className="h-4 w-8" />
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className={cn("aspect-square border border-pencil/15 p-1", i % 5 === 2 ? "bg-marker/15" : "bg-card/60")}>
                  <GhostBlock className="h-2 w-3" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <GhostBlock className="h-5 w-28" />
            {[0, 1, 2].map((i) => <div key={i} className="h-11 border-2 border-pencil/20 bg-card wobbly-sm" />)}
            <div className="h-24 border-2 border-pencil/20 bg-card wobbly-md" />
            <div className="flex gap-3"><span className="h-11 w-28 border-2 border-pencil/25 bg-marker/30 shadow-hard-sm wobbly" /><span className="h-11 w-24 border-2 border-pencil/25 bg-card shadow-hard-sm wobbly" /></div>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
}
