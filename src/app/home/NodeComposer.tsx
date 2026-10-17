"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { StampLabel, Tape, Tack, WobblyButton } from "@/components/sketch";
import { createNode } from "./actions";
import { CATEGORIES, categoryOf, mergeHeadingIntoDescription, type GroupData } from "./feed-types";
import PhotoCropEditor from "./PhotoCropEditor";

const inputCls =
  "w-full border-2 border-pencil bg-card px-3 py-2 font-note text-lg text-pencil placeholder:text-pencil/40 focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/20 wobbly-sm";

export default function NodeComposer({
  open,
  onClose,
  onCreated,
  groupData,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void | Promise<void>;
  groupData: GroupData;
}) {
  const reduce = useReducedMotion();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("custom");
  const [visibility, setVisibility] = useState<"solo" | "shared">("solo");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [movedNote, setMovedNote] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [originalPhoto, setOriginalPhoto] = useState<File | null>(null);

  const memberCount = groupData?.members?.length || 0;
  const sharedDisabled = !groupData || memberCount <= 1;
  const sharedTip = !groupData ? "Create or join a group to share nodes" : "Invite members to your group to share nodes";

  useEffect(() => {
    if (!imageFile) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || submitting) return;
      if (cropFile) setCropFile(null);
      else reset();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, cropFile, submitting]);

  function reset() {
    setTitle("");
    setContent("");
    setType("custom");
    setVisibility("solo");
    setImageFile(null);
    setCropFile(null);
    setOriginalPhoto(null);
    setMovedNote(false);
    setError(null);
    setShowHelp(false);
    onClose();
  }

  function handleImage(file: File | null) {
    setImageFile(file);
    if (file && title.trim()) {
      setContent((c) => mergeHeadingIntoDescription(title, c));
      setTitle("");
      setMovedNote(true);
    } else {
      setMovedNote(false);
    }
  }

  function selectPhoto(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }
    setError(null);
    setCropFile(file);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (cropFile || submitting) return;
    if (!imageFile && !title.trim()) {
      setError("Give your note a heading.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const fd = new FormData();
    fd.set("type", type);
    fd.set("visibility", visibility);
    if (imageFile) {
      fd.set("image", imageFile);
      const merged = mergeHeadingIntoDescription(title, content);
      if (merged.trim()) fd.set("content", merged);
    } else {
      fd.set("title", title.trim());
      if (content.trim()) fd.set("content", content);
    }
    try {
      await createNode(fd);
      await onCreated();
      reset();
    } catch (err) {
      console.error(err);
      setError("Couldn't save that log. Try again?");
    } finally {
      setSubmitting(false);
    }
  }

  const cat = categoryOf(type);
  const previewLines = mergeHeadingIntoDescription(title, content).split("\n");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-pencil/50 p-4 md:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => { if (!cropFile && !submitting) reset(); }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="New log"
            onClick={(e) => e.stopPropagation()}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, rotate: -2, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, rotate: -0.5, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 40, rotate: 3, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="relative my-6 grid w-full max-w-[860px] gap-6 border-[3px] border-pencil p-5 pt-14 shadow-hard-lg paper-grain wobbly-md md:grid-cols-[1.1fr_1fr] md:p-7 md:pt-14"
          >
            <Tape className="w-28" />
            <WobblyButton type="button" onClick={() => cropFile ? setCropFile(null) : reset()} disabled={submitting} aria-label={cropFile ? "Close photo crop" : "Close new log"} title="Close" className="absolute right-3 top-3 h-9 w-9 border-0 bg-transparent p-0 text-3xl text-marker shadow-none hover:bg-transparent hover:text-marker">×</WobblyButton>
            {cropFile ? <PhotoCropEditor
              key={`${cropFile.name}-${cropFile.lastModified}`}
              file={cropFile}
              onCancel={() => setCropFile(null)}
              onConfirm={(cropped) => {
                setOriginalPhoto(cropFile);
                handleImage(cropped);
                setCropFile(null);
              }}
            /> : <>
            <form onSubmit={submit} className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-3xl font-black text-pencil">
                  New log<span className="text-marker">.</span>
                </h2>
                <button
                  type="button"
                  onClick={() => setShowHelp((s) => !s)}
                  className={`h-7 w-7 border-2 border-pencil font-note text-sm wobbly-sm ${showHelp ? "bg-pencil text-card" : "bg-card text-pencil"}`}
                  aria-label="How it works"
                >
                  ?
                </button>
              </div>

              <AnimatePresence>
                {showHelp && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="border-2 border-dashed border-pencil bg-postit p-3 font-note text-base text-pencil wobbly-sm">
                      <p>✎ <b>Notes</b> need a heading.</p>
                      <p>◉ <b>Photos</b> keep the image clean. Any heading you wrote moves into the description.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <label className="flex flex-col gap-1">
                <span className="font-hand text-base text-pencil">
                  heading {!imageFile && <span className="text-marker">*</span>}
                </span>
                <input
                  className={inputCls}
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setMovedNote(false);
                  }}
                  placeholder={imageFile ? "optional — goes under the photo" : "what happened?"}
                />
              </label>

              <AnimatePresence>
                {movedNote && (
                  <motion.p
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="-mt-2 font-note text-sm text-ink"
                  >
                    ↓ moved your heading into the description
                  </motion.p>
                )}
              </AnimatePresence>

              <div className="flex flex-col gap-1.5">
                <span className="font-hand text-base text-pencil">category</span>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      title={c.desc}
                      onClick={() => setType(c.id)}
                      className={`border-2 border-pencil px-2.5 py-0.5 font-note text-base transition-all wobbly-sm ${
                        type === c.id ? "-rotate-2 bg-pencil text-card shadow-hard-sm" : "bg-card text-pencil hover:bg-erased"
                      }`}
                    >
                      {c.icon} {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="font-hand text-base text-pencil">who sees it</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setVisibility("solo")}
                    className={`flex-1 border-2 border-pencil py-1.5 font-note text-base wobbly-sm ${visibility === "solo" ? "bg-pencil text-card" : "bg-card text-pencil"}`}
                  >
                    🔒 just me
                  </button>
                  <button
                    type="button"
                    disabled={sharedDisabled}
                    title={sharedDisabled ? sharedTip : ""}
                    onClick={() => setVisibility("shared")}
                    className={`flex-1 border-2 border-pencil py-1.5 font-note text-base wobbly-sm disabled:cursor-not-allowed disabled:border-dashed disabled:opacity-50 ${
                      visibility === "shared" ? "bg-ink text-card" : "bg-card text-pencil"
                    }`}
                  >
                    👥 my circle
                  </button>
                </div>
                {sharedDisabled && <p className="font-note text-sm text-pencil/60">{sharedTip}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-hand text-base text-pencil">photo</span>
                <label className="flex cursor-pointer items-center gap-3 border-2 border-dashed border-pencil bg-card px-3 py-2 font-note text-base text-pencil hover:bg-erased wobbly-sm">
                  <span className="text-xl">◉</span>
                  <span className="truncate">{imageFile ? imageFile.name : "attach a photo (optional)"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      selectPhoto(e.target.files?.[0] ?? null);
                      e.target.value = "";
                    }}
                  />
                </label>
                {imageFile && (
                  <div className="flex gap-3">
                    <WobblyButton type="button" onClick={() => { if (originalPhoto) setCropFile(originalPhoto); }} className="text-sm">adjust crop</WobblyButton>
                    <WobblyButton type="button" onClick={() => { handleImage(null); setOriginalPhoto(null); }} className="text-sm text-marker">remove photo</WobblyButton>
                  </div>
                )}
              </div>

              <label className="flex flex-col gap-1">
                <span className="font-hand text-base text-pencil">description</span>
                <textarea
                  className={`${inputCls} min-h-[90px] resize-y`}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="a few more words…"
                />
              </label>

              {error && <p className="font-note text-base text-marker">{error}</p>}

              <div className="mt-1 flex items-center justify-end gap-3">
                <WobblyButton type="submit" variant="marker" size="lg" disabled={submitting}>
                  {submitting ? "pinning…" : "pin it →"}
                </WobblyButton>
              </div>
            </form>

            {/* Live preview */}
            <div className="flex flex-col gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-pencil/60">live preview</span>
              <div className="flex flex-1 items-start justify-center pt-4">
                <AnimatePresence mode="wait">
                  {preview ? (
                    <motion.div
                      key="polaroid"
                      initial={{ opacity: 0, rotate: 6, y: 10 }}
                      animate={{ opacity: 1, rotate: 1.5, y: 0 }}
                      exit={{ opacity: 0, rotate: -6 }}
                      className="relative w-full max-w-[320px] border-2 border-pencil bg-card p-3 pb-4 shadow-hard wobbly-md"
                    >
                      <Tape />
                      <div className="aspect-[4/3] overflow-hidden border-2 border-pencil">
                        <img src={preview} alt="preview" className="h-full w-full object-cover" />
                      </div>
                      <div className="px-1 pt-3">
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-pencil/60">
                          {cat.icon} {cat.label}
                        </span>
                        {previewLines[0] ? (
                          <p className="font-hand text-xl text-pencil">{previewLines[0]}</p>
                        ) : (
                          <p className="font-hand text-xl text-pencil/30">your caption…</p>
                        )}
                        {previewLines.length > 1 && (
                          <p className="whitespace-pre-line font-note text-base text-pencil/75">{previewLines.slice(1).join("\n")}</p>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="note"
                      initial={{ opacity: 0, rotate: -6, y: 10 }}
                      animate={{ opacity: 1, rotate: -1.5, y: 0 }}
                      exit={{ opacity: 0, rotate: 6 }}
                      className="relative min-h-[220px] w-full max-w-[320px] border-2 border-pencil bg-postit p-5 pl-9 shadow-hard wobbly-md"
                    >
                      <Tack />
                      <span aria-hidden className="absolute bottom-3 left-6 top-3 w-[2px] bg-marker/60" />
                      <div className="flex items-center justify-between">
                        <StampLabel tone="marker">✎ note</StampLabel>
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-pencil/60">
                          {cat.icon} {cat.label}
                        </span>
                      </div>
                      <h3 className={`mt-3 font-serif text-2xl font-black leading-tight ${title ? "text-pencil" : "text-pencil/25"}`}>
                        {title || "your heading"}
                      </h3>
                      {content && <p className="mt-2 whitespace-pre-line font-note text-lg leading-7 text-pencil/80">{content}</p>}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            </>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
