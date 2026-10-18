"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Tape, StampLabel, Scribble, WobblyButton } from "@/components/sketch";
import { cn } from "@/lib/utils";

export type BookTab = "overview" | "members" | "settings";
type Member = { id: string; name: string; email: string; role: "admin" | "member"; avatarUrl: string | null };
type Group = { id: string; name: string; invite_code: string; invite_link: string; created_at: string };

const TABS: { id: BookTab; label: string; tone: string }[] = [
  { id: "overview", label: "overview", tone: "bg-postit text-pencil" },
  { id: "members", label: "members", tone: "bg-ink text-card" },
  { id: "settings", label: "settings", tone: "bg-marker text-card" },
];
const TILTS = [-2.5, 1.8, -1.2, 2.4, -0.8, 1.4];
const tiltFor = (id: string) => TILTS[[...id].reduce((a, c) => a + c.charCodeAt(0), 0) % TILTS.length];

type Props = {
  open: boolean;
  onClose: () => void;
  tab: BookTab;
  onTab: (t: BookTab) => void;
  group: Group;
  members: Member[];
  isAdmin: boolean;
  currentUserId?: string | null;
  error: string;
  submitting: boolean;
  copySuccess: boolean;
  isEditingName: boolean;
  setIsEditingName: (v: boolean) => void;
  editedName: string;
  setEditedName: (v: string) => void;
  isEditingBio: boolean;
  setIsEditingBio: (v: boolean) => void;
  editedBio: string;
  setEditedBio: (v: string) => void;
  onSaveName: () => void;
  onSaveBio: () => void;
  onCopy: (v: string) => void;
  onRegenerate: () => void;
  onKick: (id: string) => void;
  onLeave: () => void;
};

const input = "w-full border-2 border-pencil bg-card px-3 py-2 font-note text-base text-pencil wobbly-sm focus:outline-none focus:border-ink";

export default function GroupSettingsBook(p: Props) {
  const reduce = useReducedMotion();
  const [dir, setDir] = useState(1);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!p.open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && p.onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [p.open, p.onClose]);

  const go = (t: BookTab) => {
    const from = TABS.findIndex((x) => x.id === p.tab);
    const to = TABS.findIndex((x) => x.id === t);
    setDir(to >= from ? 1 : -1);
    p.onTab(t);
  };
  const copy = (key: string, v: string) => { p.onCopy(v); setCopied(key); setTimeout(() => setCopied(null), 1500); };

  const flip = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { x: dir > 0 ? 16 : -16, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: dir > 0 ? -16 : 16, opacity: 0 },
      };

  return (
    <AnimatePresence>
      {p.open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-pencil/50 p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={p.onClose}
        >
          <motion.div
            role="dialog" aria-modal="true" aria-label="Group settings"
            className="relative mt-8 flex max-h-[88vh] w-full max-w-2xl flex-col"
            initial={reduce ? false : { y: 60, rotate: -2, opacity: 0 }}
            animate={{ y: 0, rotate: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* index tabs */}
            <div className="relative z-0 flex gap-1 pl-10" role="tablist">
              {TABS.map((t, i) => {
                const active = t.id === p.tab;
                return (
                  <button
                    key={t.id} role="tab" aria-selected={active}
                    onClick={() => go(t.id)}
                    className={cn(
                      "border-2 border-b-0 border-pencil px-4 pb-1.5 pt-1 font-hand text-base transition-transform",
                      "rounded-t-[14px_10px]", t.tone,
                      active ? "relative z-20 -mb-[2px] translate-y-0 pb-2.5" : "translate-y-1.5 opacity-85 hover:translate-y-0.5",
                    )}
                    style={{ rotate: active ? "0deg" : `${i % 2 ? 2 : -2}deg` }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* book */}
            <div className="relative z-10 flex min-h-0 flex-1 flex-col border-[3px] border-pencil bg-paper shadow-hard-lg wobbly-md scrapbook-sheet">
              <Tape className="left-8 -top-3 translate-x-0" rotate={-8} />
              <Tape className="left-auto right-6 -top-3 translate-x-0" rotate={6} />
              {/* binding */}
              <div aria-hidden className="absolute bottom-6 left-2 top-6 flex flex-col justify-around">
                {Array.from({ length: 9 }).map((_, i) => (
                  <span key={i} className="block h-3 w-3 rounded-full border-2 border-pencil/60 bg-paper" />
                ))}
              </div>

              <div className="flex items-start justify-between pl-10 pr-4 pt-5">
                <div>
                  <h2 className="font-serif text-2xl font-black text-pencil">Group Settings</h2>
                  <Scribble className="h-3 w-40" />
                </div>
                <button onClick={p.onClose} aria-label="Close" className="text-marker transition-transform hover:rotate-90">
                  <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <path d="M5 6 C 9 9, 14 15, 19 18" /><path d="M18 5 C 14 9, 9 14, 6 19" />
                  </svg>
                </button>
              </div>

              <div className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-6 pl-10 pr-5 pt-3">
                {p.error && (
                  <div className="mb-4 inline-block -rotate-1 border-2 border-marker bg-postit px-3 py-2 font-note text-sm text-marker shadow-hard-sm">
                    ✎ {p.error}
                  </div>
                )}
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={p.tab}
                    {...flip}
                    transition={{ duration: reduce ? 0.15 : 0.22, ease: [0.4, 0, 0.2, 1] }}
                  >
                    {p.tab === "overview" && <Overview {...p} copied={copied} copy={copy} />}
                    {p.tab === "members" && <Members {...p} />}
                    {p.tab === "settings" && <Settings {...p} />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-pencil/60">{children}</p>;
}

function Overview(p: Props & { copied: string | null; copy: (k: string, v: string) => void }) {
  return (
    <div className="space-y-7">
      <section>
        <Label>group name</Label>
        {p.isEditingName ? (
          <div className="flex flex-wrap gap-2">
            <input className={cn(input, "flex-1")} value={p.editedName} onChange={(e) => p.setEditedName(e.target.value)} autoFocus />
            <WobblyButton variant="marker" onClick={p.onSaveName}>save</WobblyButton>
            <WobblyButton onClick={() => { p.setIsEditingName(false); p.setEditedName(p.group.name); }}>cancel</WobblyButton>
          </div>
        ) : (
          <div className="relative inline-flex -rotate-1 items-center gap-4 border-2 border-pencil bg-card px-5 py-2 shadow-hard-sm">
            <Tape className="-top-3 h-5 w-14" rotate={3} />
            <span className="font-serif text-xl font-bold text-pencil">{p.group.name}</span>
            {p.isAdmin && <button onClick={() => p.setIsEditingName(true)} className="font-hand text-sm text-ink underline decoration-wavy">✎ edit</button>}
          </div>
        )}
      </section>

      <section>
        <Label>bio</Label>
        {p.isEditingBio ? (
          <div className="space-y-2">
            <textarea className={cn(input, "resize-none")} rows={4} value={p.editedBio} onChange={(e) => p.setEditedBio(e.target.value)} placeholder="what's this group about?" autoFocus />
            <div className="flex justify-end gap-2">
              <WobblyButton onClick={() => { p.setIsEditingBio(false); p.setEditedBio(""); }}>cancel</WobblyButton>
              <WobblyButton variant="marker" onClick={p.onSaveBio}>save</WobblyButton>
            </div>
          </div>
        ) : p.editedBio ? (
          <div
            className="relative rotate-[0.6deg] border-2 border-pencil/80 bg-postit px-4 py-3 shadow-hard-sm"
            style={{ backgroundImage: "repeating-linear-gradient(transparent 0 27px, color-mix(in srgb, var(--ink) 25%, transparent) 27px 28px)" }}
          >
            <p className="whitespace-pre-wrap font-hand text-lg leading-7 text-pencil">{p.editedBio}</p>
            {p.isAdmin && <button onClick={() => p.setIsEditingBio(true)} className="absolute right-3 top-2 font-hand text-sm text-ink underline">✎ edit</button>}
          </div>
        ) : p.isAdmin ? (
          <button onClick={() => p.setIsEditingBio(true)} className="w-full border-2 border-dashed border-pencil/50 py-6 font-hand text-lg text-pencil/70 wobbly-sm hover:border-marker hover:text-marker">
            + add a bio
          </button>
        ) : (
          <p className="font-hand text-pencil/50">no bio yet…</p>
        )}
      </section>

      <section className="grid grid-cols-2 gap-5">
        {[
          { v: String(p.members.length), l: "members", r: -2 },
          { v: new Date(p.group.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }), l: "started", r: 1.8 },
        ].map((s) => (
          <div key={s.l} className="border-2 border-pencil bg-card p-2 pb-3 shadow-hard-sm" style={{ rotate: `${s.r}deg` }}>
            <div className="flex h-16 items-center justify-center bg-erased/50 font-serif text-3xl font-black text-pencil">{s.v}</div>
            <div className="mt-2 text-center"><StampLabel tone="marker">{s.l}</StampLabel></div>
          </div>
        ))}
      </section>

      <section className="relative border-2 border-dashed border-pencil bg-card p-4 shadow-hard-sm">
        <span aria-hidden className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border-2 border-pencil bg-paper" />
        <span aria-hidden className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border-2 border-pencil bg-paper" />
        <h3 className="mb-3 font-serif text-lg font-bold text-pencil">✂ invite friends</h3>
        {[
          { k: "link", label: "invite link", v: p.group.invite_link },
          { k: "code", label: "invite code", v: p.group.invite_code },
        ].map((row) => (
          <div key={row.k} className="mb-3">
            <Label>{row.label}</Label>
            <div className="flex gap-2">
              <input readOnly value={row.v} className="min-w-0 flex-1 border-b-2 border-dashed border-pencil/50 bg-transparent px-1 py-1 font-mono text-xs text-pencil focus:outline-none" />
              <button
                onClick={() => p.copy(row.k, row.v)}
                className={cn(
                  "border-2 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest transition-transform wobbly-sm",
                  p.copied === row.k ? "-rotate-6 border-marker text-marker" : "border-pencil text-pencil hover:bg-postit",
                )}
              >
                {p.copied === row.k ? "copied ✓" : "copy"}
              </button>
            </div>
          </div>
        ))}
        {p.isAdmin && (
          <button onClick={p.onRegenerate} disabled={p.submitting} className="inline-flex items-center gap-1 font-hand text-sm text-ink underline disabled:opacity-50">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 12a8 8 0 1 1-3-6.2" /><path d="M17 2v4h4" /></svg>
            {p.submitting ? "regenerating…" : "make a new invite code"}
          </button>
        )}
      </section>
    </div>
  );
}

function MemberAvatar({ m }: { m: Member }) {
  const [errored, setErrored] = useState(false);
  if (m.avatarUrl && !errored) {
    return (
      <img
        src={m.avatarUrl}
        alt={m.name}
        onError={() => setErrored(true)}
        className="h-12 w-12 flex-shrink-0 border-2 border-pencil object-cover"
        style={{ borderRadius: "50% 45% 55% 48% / 52% 48% 50% 46%" }}
      />
    );
  }
  return (
    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-pencil bg-postit font-serif text-xl font-black text-pencil" style={{ borderRadius: "50% 45% 55% 48% / 52% 48% 50% 46%" }}>
      {m.name.charAt(0).toUpperCase()}
    </div>
  );
}

function Members(p: Props) {
  const reduce = useReducedMotion();
  return (
    <div>
      <h3 className="mb-5 font-hand text-xl text-pencil">
        {p.members.length} {p.members.length === 1 ? "friend" : "friends"} in this book
      </h3>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {p.members.map((m, i) => (
          <motion.div
            key={m.id}
            initial={reduce ? false : { y: -24, opacity: 0, rotate: 0 }}
            animate={{ y: 0, opacity: 1, rotate: tiltFor(m.id) }}
            transition={{ delay: 0.25 + i * 0.07, type: "spring", stiffness: 300, damping: 20 }}
            className="relative flex items-center gap-3 border-2 border-pencil bg-card p-3 shadow-hard-sm"
          >
            <Tape className="-top-3 h-5 w-12" rotate={i % 2 ? 5 : -5} />
            <MemberAvatar m={m} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate font-note text-lg text-pencil">{m.name}</span>
                {m.role === "admin" && <StampLabel tone="marker" className="-rotate-6">admin</StampLabel>}
              </div>
              <p className="truncate font-mono text-[10px] text-pencil/60">{m.email}</p>
              {m.id === p.currentUserId && <p className="font-hand text-sm text-ink">↖ that&apos;s you!</p>}
            </div>
            {p.isAdmin && m.id !== p.currentUserId && (
              <button
                onClick={() => p.onKick(m.id)}
                aria-label={`Remove ${m.name}`}
                className="absolute -right-3 -top-3 flex h-7 w-7 items-center justify-center rounded-full border-2 border-pencil bg-marker font-bold text-card shadow-hard-sm transition-transform hover:rotate-90"
              >
                ×
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Settings(p: Props) {
  const rows = [
    ["group id", `${p.group.id.slice(0, 12)}…`],
    ["created", new Date(p.group.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })],
    ["your role", p.isAdmin ? "Admin" : "Member"],
  ];
  return (
    <div className="space-y-8">
      <section className="-rotate-[0.6deg] border-2 border-pencil bg-card shadow-hard-sm">
        <div className="border-b-2 border-marker/60 px-4 py-2 font-serif text-lg font-bold text-pencil">group info</div>
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between border-b border-ink/20 px-4 py-2 last:border-0">
            <span className="font-mono text-[11px] uppercase tracking-widest text-pencil/60">{k}</span>
            <span className="font-hand text-pencil">{v}</span>
          </div>
        ))}
      </section>

      <section
        className="relative rotate-[0.8deg] border-[3px] border-marker bg-card p-5 shadow-hard"
        style={{ backgroundImage: "repeating-linear-gradient(-45deg, color-mix(in srgb, var(--marker) 10%, transparent) 0 10px, transparent 10px 22px)" }}
      >
        <StampLabel tone="marker" className="mb-3 -rotate-3">⚠ danger zone</StampLabel>
        <p className="mb-4 font-hand text-base text-pencil">
          {p.isAdmin
            ? "As an admin, leaving will hand the group to another member. If you're the last one, the group will be deleted."
            : "Once you leave, you'll need a new invite to come back."}
        </p>
        <WobblyButton variant="marker" onClick={p.onLeave}>leave group</WobblyButton>
      </section>
    </div>
  );
}
