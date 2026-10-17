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