"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { format } from "date-fns";
import { Scribble } from "@/components/sketch";

function greetingFor(hour: number) {
  if (hour < 5) return "up late";
  if (hour < 12) return "good morning";
  if (hour < 17) return "good afternoon";
  return "good evening";
}

export default function HomeGreeting({ firstName }: { firstName: string }) {
  const reduce = useReducedMotion();
  // Time-based text is computed after hydration to avoid server/client mismatch.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center gap-1 text-center"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-pencil/60">
        {now ? format(now, "EEEE · MMMM d, yyyy") : "\u00a0"}
      </p>
      <h1 className="relative font-serif text-4xl font-black leading-tight tracking-tight sm:text-5xl">
        {now ? greetingFor(now.getHours()) : "hello"}
        {firstName && <span className="font-hand font-bold text-marker">, {firstName}</span>}.
        <Scribble className="absolute -bottom-2 left-0 h-3 w-full" />
      </h1>
      <p className="mt-3 font-note text-xl text-pencil/70">what's worth remembering today?</p>
    </motion.div>
  );
}
