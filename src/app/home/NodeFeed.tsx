"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { format, addDays, subDays } from "date-fns";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import { fetchNodes, reactToNode, fetchUserGroup } from "./actions";
import { WobblyButton } from "@/components/sketch";
import { GhostFeed } from "@/components/sketch/PageMotion";
import { PolaroidNode, NoteNode } from "./NodeCards";
import NodeComposer from "./NodeComposer";
import { TILTS, type GroupData, type NodeData, type ReactionType } from "./feed-types";

/** Parses a "YYYY-MM-DD" string as a local date, avoiding the UTC-midnight
 * shift `new Date("YYYY-MM-DD")` would otherwise introduce. */
function parseLocalDate(dateStr: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) return null;
  const [, y, m, d] = match;
  return new Date(Number(y), Number(m) - 1, Number(d));
}

function DayNavigator({
  date,
  isToday,
  onPrev,
  onNext,
}: {
  date: Date;
  isToday: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-center gap-4 font-note text-lg text-pencil">
      <button onClick={onPrev} className="px-2 text-pencil/60 transition-colors hover:text-marker" aria-label="Previous day">
        ← {format(subDays(date, 1), "EEE")}
      </button>
      <AnimatePresence mode="wait">
        <motion.span
          key={date.toDateString()}
          initial={{ opacity: 0, y: -8, rotate: -3 }}
          animate={{ opacity: 1, y: 0, rotate: -1 }}
          exit={{ opacity: 0, y: 8 }}
          className="border-2 border-pencil bg-card px-4 py-0.5 font-hand text-xl font-bold shadow-hard-sm wobbly"
        >
          {isToday ? "today" : format(date, "MMM d, yyyy")}
        </motion.span>
      </AnimatePresence>
      <button
        onClick={onNext}
        disabled={isToday}
        className="px-2 text-pencil/60 transition-colors hover:text-marker disabled:opacity-25 disabled:hover:text-pencil/60"
        aria-label="Next day"
      >
        {format(addDays(date, 1), "EEE")} →
      </button>
    </div>
  );
}

export default function HomeFeed({
  groupData: initialGroupData,
  initialDate,
}: {
  groupData: GroupData;
  initialDate?: string;
}) {
  const { userId } = useAuth();
  const reduce = useReducedMotion();
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupData, setGroupData] = useState<GroupData>(initialGroupData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const cacheRef = useRef<Record<string, NodeData[]>>({});

  // "Now" (or a date passed via ?date=) is only resolved on the client, after
  // mount, so the SSR pass and the first client render agree (avoids a
  // hydration mismatch around midnight).
  useEffect(() => {
    setCurrentDate((initialDate && parseLocalDate(initialDate)) || new Date());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dateStr = currentDate ? format(currentDate, "yyyy-MM-dd") : null;
  const isToday = dateStr !== null && dateStr === format(new Date(), "yyyy-MM-dd");

  // Refresh group data when the composer opens (catches recent create/join)
  useEffect(() => {
    if (!isModalOpen) return;
    fetchUserGroup().then(setGroupData).catch((err) => console.error("Failed to fetch group data:", err));
  }, [isModalOpen]);

  // Load nodes when date changes (stale-while-revalidate)
  useEffect(() => {
    if (!dateStr) return;
    const key = dateStr;
    let active = true;
    async function load() {
      if (cacheRef.current[key]) {
        setNodes(cacheRef.current[key]);
        setLoading(false);
      } else {
        setLoading(true);
      }
      try {
        const data = await fetchNodes(key);
        if (!active) return;
        if (JSON.stringify(data) !== JSON.stringify(cacheRef.current[key])) {
          cacheRef.current[key] = data;
          setNodes(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [dateStr]);

  const goPrev = () => {
    setDirection(-1);
    setCurrentDate((d) => (d ? subDays(d, 1) : d));
  };
  const goNext = () => {
    setDirection(1);
    setCurrentDate((d) => (d ? addDays(d, 1) : d));
  };

  const refresh = async () => {
    if (!dateStr) return;
    const data = await fetchNodes(dateStr);
    cacheRef.current[dateStr] = data;
    setNodes(data);
  };

  const handleReaction = (nodeId: string, reactionType: ReactionType) => {
    const updated = nodes.map((node) => {
      if (node.id !== nodeId) return node;
      const existing = node.reactions || [];
      const mine = existing.find((r) => r.user_id === userId);
      let next = [...existing];
      if (mine) {
        next =
          mine.type === reactionType
            ? next.filter((r) => r.user_id !== userId)
            : next.map((r) => (r.user_id === userId ? { ...r, type: reactionType } : r));
      } else {
        next.push({ type: reactionType, user_id: userId || "", display_name: "You" });
      }
      return { ...node, reactions: next };
    });
    setNodes(updated);
    if (dateStr) cacheRef.current[dateStr] = updated;
    reactToNode(nodeId, reactionType)
      .then(refresh)
      .catch((err) => console.error("Failed to sync reaction with backend:", err));
  };

  const slide = reduce ? 0 : 60;

  if (!currentDate) {
    return <GhostFeed />;
  }

  return (
    <div className="flex flex-1 flex-col gap-8">
      <DayNavigator date={currentDate} isToday={isToday} onPrev={goPrev} onNext={goNext} />

      {/* Centerpiece: add a log */}
      {isToday && (
        <div className="relative flex flex-col items-center py-4">
          <motion.div
            animate={reduce ? undefined : { y: [0, -5, 0], rotate: [-1, 0.5, -1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <WobblyButton variant="marker" onClick={() => setIsModalOpen(true)} aria-label="Add a log" title="Add a log" className="h-20 w-20 rounded-full p-0 text-5xl">
              <svg aria-hidden="true" viewBox="0 0 32 32" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M16 5v22M5 16h22" /></svg>
            </WobblyButton>
          </motion.div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <span className="h-0 flex-1 border-t-2 border-dashed border-pencil/40" />
        <span className="font-serif text-sm font-black uppercase tracking-[0.25em] text-pencil">
          {isToday ? "today's page" : format(currentDate, "EEEE")}
        </span>
        <span className="font-mono text-[10px] text-marker">{nodes.length.toString().padStart(2, "0")}</span>
        <span className="h-0 flex-1 border-t-2 border-dashed border-pencil/40" />
      </div>

      {/* Digests are only generated for days with 3+ logs — no digest, no link. */}
      {!isToday && dateStr && !loading && nodes.length >= 3 && (
        <div className="-mt-4 flex justify-center">
          <Link
            href={`/explore?date=${dateStr}`}
            className="font-note text-sm text-ink underline-offset-2 hover:underline"
          >
            go to this day&apos;s digest →
          </Link>
        </div>
      )}

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={dateStr}
          initial={{ opacity: 0, y: slide / 2, x: direction * slide / 4 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -slide / 4 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          {loading ? (
            <GhostFeed />
          ) : nodes.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 border-2 border-dashed border-pencil/40 p-8 text-center wobbly-md">
              <span className="font-serif text-4xl text-pencil/20">◇</span>
              <p className="font-hand text-xl text-pencil/70">
                {isToday ? "a blank page. lovely." : "nothing was logged this day."}
              </p>
              {isToday && <p className="font-note text-base text-pencil/50">tap the red button to pin your first moment.</p>}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 pt-3 sm:grid-cols-2">
              {nodes.map((node, i) => {
                const props = { node, index: i, tilt: TILTS[i % TILTS.length], userId, onReact: handleReaction };
                return node.image_url ? <PolaroidNode key={node.id} {...props} /> : <NoteNode key={node.id} {...props} />;
              })}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <NodeComposer
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={refresh}
        groupData={groupData}
      />
    </div>
  );
}
