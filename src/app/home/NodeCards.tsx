"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { format } from "date-fns";
import { StampLabel, Tape, Tack } from "@/components/sketch";
import {
  REACTION_EMOJIS,
  categoryOf,
  imageSrc,
  type NodeData,
  type ReactionType,
} from "./feed-types";

type ReactionCounts = Record<ReactionType, { count: number; users: string[]; hasReacted: boolean }>;

export function getReactionCounts(reactions: NodeData["reactions"], currentUserId?: string | null): ReactionCounts {
  const counts: ReactionCounts = {
    heart: { count: 0, users: [], hasReacted: false },
    thumbs_up: { count: 0, users: [], hasReacted: false },
    thumbs_down: { count: 0, users: [], hasReacted: false },
    fire: { count: 0, users: [], hasReacted: false },
  };
  reactions?.forEach((r) => {
    const t = r.type as ReactionType;
    if (!counts[t]) return;
    counts[t].count++;
    counts[t].users.push(r.display_name);
    if (currentUserId && r.user_id === currentUserId) counts[t].hasReacted = true;
  });
  return counts;
}

function ReactionBar({
  node,
  userId,
  onReact,
}: {
  node: NodeData;
  userId: string | null | undefined;
  onReact: (nodeId: string, type: ReactionType) => void;
}) {
  const [open, setOpen] = useState(false);
  const [nudging, setNudging] = useState<ReactionType | null>(null);
  const [hovered, setHovered] = useState<ReactionType | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const counts = getReactionCounts(node.reactions, userId);
  const active = (Object.keys(REACTION_EMOJIS) as ReactionType[]).filter((t) => counts[t].count > 0);

  const show = () => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(true);
  };
  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), 450);
  };
  const react = (t: ReactionType) => {
    setNudging(t);
    setTimeout(() => setNudging(null), 350);
    setOpen(false);
    onReact(node.id, t);
  };

  return (
    <div className="relative" onMouseEnter={show} onMouseLeave={hide} onClick={(e) => e.stopPropagation()}>
      {active.length > 0 ? (
        <div className="flex items-center gap-1">
          {active.map((t) => {
            const { count, users, hasReacted } = counts[t];
            return (
              <div key={t} className="relative" onMouseEnter={() => setHovered(t)} onMouseLeave={() => setHovered(null)}>
                <button
                  onClick={() => react(t)}
                  className={`flex items-center gap-1 border-2 border-pencil px-2 py-0.5 font-note text-sm wobbly-sm transition-colors ${
                    nudging === t ? "animate-nudge" : ""
                  } ${hasReacted ? "bg-postit" : "bg-card hover:bg-erased"}`}
                >
                  <span className="text-xs">{REACTION_EMOJIS[t]}</span>
                  <span className="text-xs">{count}</span>
                </button>
                {hovered === t && (
                  <div className="pointer-events-none absolute bottom-full right-1/2 z-50 mb-2 translate-x-1/2 whitespace-nowrap border-2 border-pencil bg-card px-2 py-1 font-note text-xs text-pencil shadow-hard-sm wobbly-sm">
                    {users.slice(0, 5).map((u, i) => (
                      <div key={i}>{u}</div>
                    ))}
                    {users.length > 5 && <div className="opacity-60">+{users.length - 5} more</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <button
          className="flex h-7 w-7 items-center justify-center border-2 border-dashed border-pencil bg-card font-note text-xs text-pencil opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 wobbly-sm"
          title="Add reaction"
          aria-label="Add reaction"
        >
          ☺+
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.9, rotate: -3 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: -1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 420, damping: 24 }}
            className="absolute bottom-full right-0 z-50 mb-2 flex items-center gap-1 border-2 border-pencil bg-card p-1.5 shadow-hard-sm wobbly"
            onMouseEnter={show}
            onMouseLeave={hide}
          >
            {(Object.keys(REACTION_EMOJIS) as ReactionType[]).map((t) => (
              <button
                key={t}
                onClick={() => react(t)}
                title={t.replace("_", " ")}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-125 active:scale-90 ${
                  counts[t].hasReacted ? "bg-postit" : "hover:bg-erased"
                }`}
              >
                <span className="text-base leading-none">{REACTION_EMOJIS[t]}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Byline({ node }: { node: NodeData }) {
  const time = (() => {
    try {
      return format(new Date(node.logged_at), "HH:mm");
    } catch {
      return "";
    }
  })();
  return (
    <div className="flex min-w-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-pencil/60">
      {time && <span className="text-marker">{time}</span>}
      {node.profiles && (
        <>
          {node.profiles.avatar_url ? (
            <img src={node.profiles.avatar_url} alt="" className="h-4 w-4 flex-shrink-0 rounded-full border border-pencil object-cover" />
          ) : (
            <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border border-pencil bg-erased text-[8px] text-pencil">
              {node.profiles.display_name.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="truncate normal-case tracking-normal">{node.profiles.display_name}</span>
        </>
      )}
    </div>
  );
}

type CardProps = {
  node: NodeData;
  index: number;
  tilt: number;
  userId: string | null | undefined;
  onReact: (nodeId: string, type: ReactionType) => void;
};

function useCardMotion(index: number, tilt: number) {
  const reduce = useReducedMotion();
  return {
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 28, rotate: tilt * 3, scale: 0.96 },
    animate: { opacity: 1, y: 0, rotate: tilt, scale: 1 },
    whileHover: reduce ? undefined : { rotate: 0, y: -4, boxShadow: "6px 6px 0 0 var(--pencil)" },
    transition: { type: "spring" as const, stiffness: 260, damping: 22, delay: Math.min(index * 0.07, 0.5) },
  };
}

/** Photo log: polaroid frame, photo fully visible, words in the bottom margin. */
export function PolaroidNode({ node, index, tilt, userId, onReact }: CardProps) {
  const m = useCardMotion(index, tilt);
  const cat = categoryOf(node.type);
  const [headline, ...rest] = (node.content || node.title || "").split("\n");
  return (
    <motion.article {...m} className="group relative flex flex-col border-2 border-pencil bg-card p-3 pb-4 shadow-hard wobbly-md">
      <Tape rotate={index % 2 ? 5 : -5} />
      <div className="relative aspect-[4/3] w-full overflow-hidden border-2 border-pencil bg-erased" style={{ borderRadius: "6px 14px 4px 10px" }}>
        <img src={imageSrc(node)} alt={headline || "photo log"} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        <div className="absolute left-2 top-2 flex gap-1">
          <StampLabel className="bg-card/90">◉ photo</StampLabel>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 px-1 pt-3">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-pencil/60">
            {cat.icon} {cat.label}
          </span>
          {node.visibility === "shared" && <StampLabel tone="ink">shared</StampLabel>}
        </div>
        {headline && <p className="font-hand text-xl leading-snug text-pencil">{headline}</p>}
        {rest.length > 0 && <p className="whitespace-pre-line font-note text-base leading-snug text-pencil/75">{rest.join("\n")}</p>}
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <Byline node={node} />
          {node.visibility === "shared" && <ReactionBar node={node} userId={userId} onReact={onReact} />}
        </div>
      </div>
    </motion.article>
  );
}

/** Text log: post-it note with a red margin line and a big serif heading. */
export function NoteNode({ node, index, tilt, userId, onReact }: CardProps) {
  const m = useCardMotion(index, tilt);
  const cat = categoryOf(node.type);
  const lined = index % 2 === 1;
  return (
    <motion.article
      {...m}
      className={`group relative flex min-h-[200px] flex-col border-2 border-pencil p-5 pl-9 shadow-hard wobbly-md ${lined ? "bg-card" : "bg-postit"}`}
      style={
        lined
          ? { backgroundImage: "repeating-linear-gradient(transparent 0 27px, color-mix(in oklab, var(--ink) 18%, transparent) 27px 28px)" }
          : undefined
      }
    >
      <Tack />
      <span aria-hidden className="absolute bottom-3 left-6 top-3 w-[2px] bg-marker/60" />
      <div className="flex items-center justify-between gap-2">
        <StampLabel tone="marker">✎ note</StampLabel>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-pencil/60">
          {cat.icon} {cat.label}
        </span>
      </div>
      {node.title && <h3 className="mt-3 font-serif text-2xl font-black leading-tight text-pencil">{node.title}</h3>}
      {node.content && <p className="mt-2 whitespace-pre-line font-note text-lg leading-7 text-pencil/80">{node.content}</p>}
      <div className="mt-auto flex items-end justify-between gap-2 pt-4">
        <Byline node={node} />
        <div className="flex items-center gap-2">
          {node.visibility === "shared" && <StampLabel tone="ink">shared</StampLabel>}
          {node.visibility === "shared" && <ReactionBar node={node} userId={userId} onReact={onReact} />}
        </div>
      </div>
    </motion.article>
  );
}
