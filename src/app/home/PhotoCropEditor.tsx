"use client";

import { useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import { ArrowsClockwise, Minus, Plus } from "@phosphor-icons/react";
import { WobblyButton } from "@/components/sketch";
import { createCroppedPhoto, POLAROID_ASPECT, type CropPixels } from "./photo-crop";

export default function PhotoCropEditor({ file, onConfirm, onCancel }: {
  file: File;
  onConfirm: (cropped: File) => void;
  onCancel: () => void;
}) {
  const [source, setSource] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pixels, setPixels] = useState<CropPixels | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSource(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function confirm() {
    if (!source || !pixels || saving) return;
    setSaving(true);
    setError(null);
    try {
      onConfirm(await createCroppedPhoto(source, pixels, file.name));
    } catch {
      setError("Couldn't crop this photo. Try another image?");
      setSaving(false);
    }
  }

  return (
    <section aria-label="Crop photo" className="col-span-full flex min-w-0 flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-serif text-3xl font-black text-pencil">Crop photo<span className="text-marker">.</span></h2>
        <span className="font-mono text-xs text-pencil/60">4 : 3</span>
      </div>
      <div className="photo-crop-stage relative h-[300px] w-full overflow-hidden border-2 border-pencil bg-pencil sm:h-[400px]" aria-busy={saving}>
        {source && <Cropper
          image={source}
          crop={crop}
          zoom={zoom}
          minZoom={1}
          maxZoom={3}
          aspect={POLAROID_ASPECT}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_, area) => setPixels(area)}
          onMediaLoaded={() => setError(null)}
          mediaProps={{ onError: () => setError("This photo couldn't be opened. Choose another image.") }}
          zoomWithScroll={false}
          classes={{ cropAreaClassName: "photo-crop-frame" }}
        />}
      </div>
      <div className="flex items-center gap-3">
        <WobblyButton type="button" aria-label="Zoom out" title="Zoom out" disabled={saving || zoom <= 1} onClick={() => setZoom((z) => Math.max(1, z - 0.1))} className="h-9 w-9 shrink-0 p-0"><Minus size={18} /></WobblyButton>
        <input aria-label="Photo zoom" type="range" min="1" max="3" step="0.01" value={zoom} disabled={saving} onChange={(e) => setZoom(Number(e.target.value))} className="min-w-0 flex-1 accent-ink" />
        <WobblyButton type="button" aria-label="Zoom in" title="Zoom in" disabled={saving || zoom >= 3} onClick={() => setZoom((z) => Math.min(3, z + 0.1))} className="h-9 w-9 shrink-0 p-0"><Plus size={18} /></WobblyButton>
        <WobblyButton type="button" aria-label="Reset crop" title="Reset crop" disabled={saving} onClick={() => { setCrop({ x: 0, y: 0 }); setZoom(1); }} className="h-9 w-9 shrink-0 p-0"><ArrowsClockwise size={18} /></WobblyButton>
      </div>
      {error && <p role="alert" className="font-note text-base text-marker">{error}</p>}
      <div className="flex flex-wrap justify-end gap-3">
        <WobblyButton type="button" disabled={saving} onClick={onCancel}>back</WobblyButton>
        <WobblyButton type="button" variant="marker" disabled={!pixels || saving || !!error} onClick={confirm}>{saving ? "cropping…" : "use photo →"}</WobblyButton>
      </div>
    </section>
  );
}