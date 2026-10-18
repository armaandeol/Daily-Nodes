"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/** Paper section that drops in and settles; staggered by index. */
export function DropIn({ children, index = 0, className }: { children: ReactNode; index?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: -24, rotate: index % 2 ? 1.2 : -1.2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 220, damping: 22, delay: 0.08 * index }}
    >
      {children}
    </motion.div>
  );
}

/** Whole edition slides in; keyed by edition id so switching re-animates. */
export function EditionSlide({ children, editionKey }: { children: ReactNode; editionKey: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div key={editionKey} initial={reduce ? { opacity: 0 } : { opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}
