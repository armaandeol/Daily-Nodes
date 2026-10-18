"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export function PageMotion({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return <motion.div className={className} initial={reduce ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }}>{children}</motion.div>;
}

export function GhostFeed() {
  return (
    <div role="status" aria-label="Loading logs" className="grid grid-cols-1 gap-6 motion-safe:animate-pulse sm:grid-cols-2">
      {[0, 1].map((i) => <div key={i} aria-hidden="true" className="min-h-[240px] border-2 border-dashed border-pencil/20 bg-paper p-5 wobbly-md">
        <div className="mb-5 h-4 w-16 bg-erased" />
        <div className={i === 0 ? "mb-4 aspect-[4/3] bg-erased/60" : "mb-4 h-8 w-3/4 bg-erased/60"} />
        <div className="mb-3 h-3 w-full bg-erased/60" /><div className="h-3 w-2/3 bg-erased/60" />
      </div>)}
    </div>
  );
}

export function GhostPage({ digest = false }: { digest?: boolean }) {
  return <main className="mx-auto min-h-screen max-w-[760px] px-5 text-pencil" aria-label="Loading page" role="status">
    <header className="mt-6 border-y-4 border-double border-pencil py-4 text-center font-serif text-3xl font-black">Roz<span className="text-marker">.</span></header>
    <div aria-hidden="true" className="py-10 motion-safe:animate-pulse">
      <div className="mb-6 h-4 w-32 bg-erased" /><div className="mb-8 h-10 w-2/3 bg-erased/70" />
      {!digest && <div className="mx-auto mb-10 h-20 w-20 rounded-full border-2 border-pencil/20 bg-marker/20" />}
      <GhostFeed />
    </div>
  </main>;
}

/** Mirrors Home's real masthead + greeting + group pill + feed shape, so the
 * loading state doesn't jump around once real content lands. */
export function GhostHome() {
  return (
    <div className="min-h-screen paper-grain text-pencil" role="status" aria-label="Loading your day">
      <main className="mx-auto flex min-h-screen max-w-[760px] flex-col px-5">
        <header className="mt-6 border-y-4 border-double border-pencil py-4">
          <div className="flex items-center justify-between gap-4">
            <span className="font-note text-lg text-pencil/40">explore ↗</span>
            <span className="font-serif text-2xl font-black tracking-tight sm:text-3xl">
              Roz<span className="text-marker">.</span>
            </span>
            <span aria-hidden className="h-10 w-10 border-2 border-pencil bg-erased wobbly" />
          </div>
        </header>

        <div aria-hidden="true" className="flex flex-1 flex-col gap-8 pb-16 pt-10 motion-safe:animate-pulse">
          <div className="flex flex-col items-center gap-2">
            <div className="h-2.5 w-40 bg-erased" />
            <div className="h-9 w-64 max-w-full bg-erased/70" />
            <div className="h-3 w-48 bg-erased/60" />
          </div>
          <div className="mx-auto h-8 w-48 border-2 border-pencil/20 bg-card" />
          <div className="mx-auto h-7 w-56 bg-erased/60" />
          <div className="mx-auto h-20 w-20 rounded-full bg-marker/20" />
          <div className="border-t-2 border-dashed border-pencil/30" />
          <GhostFeed />
        </div>

        <footer className="border-t-2 border-dashed border-pencil/30 py-5 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-pencil/50">
          Roz · one page a day
        </footer>
      </main>
    </div>
  );
}

/** Mirrors Explore's nav + masthead + stat stubs + lead story shape. */
export function GhostExplore() {
  return (
    <main className="min-h-screen bg-paper paper-grain pb-16 text-pencil" role="status" aria-label="Loading edition">
      <nav aria-hidden className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5">
        <span className="font-note text-lg text-ink/40">← home</span>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="h-8 w-20 border-2 border-pencil/20 bg-card" />
          <span className="h-8 w-16 border-2 border-pencil/20 bg-card" />
          <span className="h-8 w-20 border-2 border-pencil/20 bg-card" />
        </div>
        <span className="h-12 w-12 border-2 border-pencil/20 bg-card" />
      </nav>

      <div aria-hidden="true" className="motion-safe:animate-pulse">
        <header className="mx-auto max-w-6xl border-y-4 border-double border-pencil px-6 py-6 text-center">
          <span className="font-serif text-5xl font-black tracking-tight text-pencil/15 md:text-6xl">Roz.</span>
          <div className="mx-auto mt-3 h-3 w-40 bg-erased/60" />
        </header>

        <div className="mx-auto mt-8 grid max-w-5xl grid-cols-2 gap-5 px-6 md:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-16 border-2 border-dashed border-pencil/20 bg-card" />
          ))}
        </div>

        <section className="mx-auto grid max-w-6xl grid-cols-12 gap-8 border-b-2 border-dashed border-pencil/40 px-6 py-12 md:py-16">
          <div className="col-span-12 md:col-span-7">
            <div className="mb-4 h-5 w-24 bg-erased" />
            <div className="mb-6 h-10 w-3/4 bg-erased/70" />
            <div className="mb-3 h-3 w-full bg-erased/60" />
            <div className="h-3 w-2/3 bg-erased/60" />
          </div>
          <div className="col-span-12 md:col-span-5">
            <div className="aspect-[4/3] w-full border-2 border-pencil/20 bg-erased" />
          </div>
        </section>
      </div>
    </main>
  );
}

/** Mirrors Profile's real masthead + avatar polaroid + calendar + form shape. */
export function GhostProfile() {
  return (
    <div className="min-h-screen paper-grain text-pencil" role="status" aria-label="Loading profile">
      <main className="mx-auto flex min-h-screen max-w-[640px] flex-col px-5">
        <header className="mt-6 border-y-4 border-double border-pencil py-4">
          <div className="flex items-center justify-between gap-4">
            <span className="font-note text-lg text-pencil/40">← home</span>
            <span className="font-serif text-2xl font-black tracking-tight sm:text-3xl">
              Roz<span className="text-marker">.</span>
            </span>
            <span className="w-14" aria-hidden />
          </div>
        </header>

        <div aria-hidden="true" className="flex flex-1 flex-col gap-10 pb-16 pt-10 motion-safe:animate-pulse">
          <div className="flex flex-col items-center gap-3">
            <div className="h-32 w-32 border-2 border-pencil/20 bg-erased" />
            <div className="h-2.5 w-40 bg-erased/60" />
          </div>

          <div className="flex flex-col gap-3">
            <div className="h-5 w-24 bg-erased" />
            <div className="h-8 w-48 bg-erased/70" />
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="aspect-square border border-dashed border-pencil/20 bg-paper/60" />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="h-5 w-28 bg-erased" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-11 border-2 border-pencil/15 bg-card" />
            ))}
            <div className="h-24 border-2 border-pencil/15 bg-card" />
          </div>
        </div>

        <footer className="border-t-2 border-dashed border-pencil/30 py-5 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-pencil/50">
          Roz · one page a day
        </footer>
      </main>
    </div>
  );
}