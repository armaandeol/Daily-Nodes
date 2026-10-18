"use client";

import { useEffect, useState, useRef } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import {
  fetchUserProfile,
  updateUserProfile,
  checkUsernameAvailability,
  uploadUserAvatar,
} from "@/app/home/actions";
import Image from "next/image";
import ActivityCalendar from "./ActivityCalendar";
import { Tape, StampLabel, WobblyButton, Scribble } from "@/components/sketch";
import { PageMotion, GhostProfile } from "@/components/sketch/PageMotion";
import { useCachedFetch, writeCache, peekCache } from "@/lib/client-cache";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user } = useUser();
  const { signOut } = useClerk();

  // Profile data already fetched this session, if any — read synchronously
  // so a revisit (e.g. home -> profile -> home -> profile) renders the real
  // page immediately instead of the ghost, then quietly revalidates.
  const { data: cachedProfile } = useCachedFetch("profile", fetchUserProfile);
  const initialCached = peekCache<any>("profile");

  // Original profile to compare changes — seeded from cache when warm.
  const [initialProfile, setInitialProfile] = useState<any>(() => initialCached || null);

  // Profile data state
  const [displayName, setDisplayName] = useState(() => initialCached?.display_name || "");
  const [username, setUsername] = useState(() => initialCached?.username || "");
  const [bio, setBio] = useState(() => initialCached?.bio || "");
  const [digestSlot, setDigestSlot] = useState<"morning" | "night">(() => initialCached?.digest_slot || "night");
  const [avatarUrl, setAvatarUrl] = useState(() => initialCached?.avatar_signed_url || initialCached?.avatar_url || "");

  // Loading and helper state
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Username validation state
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [usernameSuccess, setUsernameSuccess] = useState("");

  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Populate fields once the profile is known — either immediately from
  // cache (synchronous init above already handled that case) or once the
  // background/initial fetch in useCachedFetch resolves. Guarded by
  // `initialProfile` so a later silent revalidation never clobbers edits
  // the user has made in the meantime.
  useEffect(() => {
    if (!cachedProfile || initialProfile) return;
    const profile = cachedProfile as any;
    setInitialProfile(profile);
    setDisplayName(profile.display_name || user?.fullName || "");
    setUsername(profile.username || user?.username || "");
    setBio(profile.bio || "");
    setDigestSlot(profile.digest_slot || "night");
    setAvatarUrl(profile.avatar_signed_url || profile.avatar_url || user?.imageUrl || "");
  }, [cachedProfile, initialProfile, user]);

  // Track changes dynamically
  useEffect(() => {
    if (!initialProfile) return;
    const isDisplayNameChanged = displayName !== (initialProfile.display_name || "");
    const isUsernameChanged = username !== (initialProfile.username || "");
    const isBioChanged = bio !== (initialProfile.bio || "");
    const isDigestSlotChanged = digestSlot !== (initialProfile.digest_slot || "night");

    setHasChanges(
      isDisplayNameChanged ||
      isUsernameChanged ||
      isBioChanged ||
      isDigestSlotChanged
    );
  }, [displayName, username, bio, digestSlot, initialProfile]);

  // Debounced username validation
  useEffect(() => {
    if (!username || username === initialProfile?.username) {
      setUsernameError("");
      setUsernameSuccess("");
      setIsCheckingUsername(false);
      return;
    }

    const usernameRegex = /^[a-z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      setUsernameError("Alphanumeric characters and underscores only");
      setUsernameSuccess("");
      return;
    }

    setIsCheckingUsername(true);
    setUsernameError("");
    setUsernameSuccess("");

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await checkUsernameAvailability(username);
        if (res.available) {
          setUsernameSuccess("Username is available");
          setUsernameError("");
        } else {
          setUsernameError("Username is already taken");
          setUsernameSuccess("");
        }
      } catch (error) {
        console.error("Error checking username:", error);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [username, initialProfile]);

  const handleSave = async () => {
    if (usernameError || saving) return;
    setSaving(true);
    try {
      const updated = await updateUserProfile({
        display_name: displayName,
        username: username,
        bio: bio,
        digest_slot: digestSlot,
      });
      setInitialProfile(updated);
      writeCache("profile", updated);
      setHasChanges(false);
    } catch (error: any) {
      console.error("Error saving profile:", error);
      setUsernameError(error.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be smaller than 2MB");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsUploadingAvatar(true);
    try {
      const updated = await uploadUserAvatar(formData);
      setAvatarUrl(updated.avatar_signed_url || updated.avatar_url);
      setInitialProfile(updated);
      writeCache("profile", updated);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("Failed to upload avatar image");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (!initialProfile) {
    return <GhostProfile />;
  }

  const inputClass =
    "border-2 border-pencil bg-card px-4 py-3 font-note text-base text-pencil shadow-hard-sm wobbly-sm focus:border-marker focus:outline-none transition-colors";
  const labelClass = "font-mono text-[10px] uppercase tracking-[0.25em] text-pencil/60";

  return (
    <div className="min-h-screen paper-grain text-pencil selection:bg-marker selection:text-card">
      <main className="mx-auto flex min-h-screen max-w-[640px] flex-col px-5">
        {/* Masthead */}
        <header className="mt-6 border-y-4 border-double border-pencil py-4">
          <div className="flex items-center justify-between gap-4">
            <Link href="/home" className="font-note text-lg text-pencil/70 transition-colors hover:text-marker">
              ← home
            </Link>
            <span className="font-serif text-2xl font-black tracking-tight sm:text-3xl">
              Roz<span className="text-marker">.</span>
            </span>
            <span className="w-14" aria-hidden />
          </div>
        </header>

        <PageMotion className="flex flex-1 flex-col gap-10 pb-16 pt-10">
          {/* Avatar — pinned polaroid */}
          <section className="flex flex-col items-center gap-3">
            <div className="relative -rotate-2 border-2 border-pencil bg-card p-2 pb-8 shadow-hard wobbly-sm">
              <Tape />
              <div
                onClick={handleAvatarClick}
                className="group relative h-32 w-32 cursor-pointer overflow-hidden border-2 border-pencil/20 bg-erased"
              >
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="Profile"
                    fill
                    sizes="128px"
                    priority
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-hand text-4xl font-bold text-pencil/40">
                    {(displayName || user?.firstName || "U")[0]}
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-pencil/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-card">change</span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-card">photo</span>
                </div>

                {/* Uploading indicator overlay */}
                {isUploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center bg-pencil/60">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-card border-t-transparent" />
                  </div>
                )}
              </div>
              <p className="absolute bottom-1.5 left-0 w-full text-center font-hand text-sm text-pencil/60">
                that&apos;s you!
              </p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-pencil/50">
              JPG, PNG or WEBP · max 2MB
            </p>
          </section>

          {/* Activity calendar */}
          <section className="flex flex-col gap-3">
            <div className="flex items-end justify-between">
              <div className="flex flex-col">
                <StampLabel tone="marker">log map</StampLabel>
                <h2 className="mt-2 font-serif text-2xl font-black">your month, on paper</h2>
                <Scribble className="h-2.5 w-36" />
              </div>
              <p className="max-w-[140px] text-right font-hand text-sm leading-tight text-pencil/60">
                tap a marked day to revisit it
              </p>
            </div>
            <ActivityCalendar />
          </section>

          {/* Form Fields */}
          <section className="flex flex-col gap-6">
            <StampLabel tone="ink">the fine print</StampLabel>

            {/* Display Name */}
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className={inputClass}
                placeholder="Enter your display name"
              />
            </div>

            {/* Username */}
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                className={inputClass}
                placeholder="Enter your username"
              />
              {isCheckingUsername && (
                <p className="mt-0.5 animate-pulse font-note text-sm text-pencil/60">Checking availability...</p>
              )}
              {usernameSuccess && (
                <p className="mt-0.5 font-note text-sm text-ink">✓ {usernameSuccess}</p>
              )}
              {usernameError && (
                <p className="mt-0.5 font-note text-sm text-marker">✗ {usernameError}</p>
              )}
            </div>

            {/* Bio */}
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className={cn(inputClass, "resize-none")}
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Digest Slot */}
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Digest Slot</label>
              <div className="flex gap-3">
                {(["morning", "night"] as const).map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setDigestSlot(slot)}
                    className={cn(
                      "flex-1 border-2 border-pencil px-4 py-3 font-note text-base capitalize shadow-hard-sm transition-all wobbly-sm",
                      digestSlot === slot
                        ? "bg-pencil text-card"
                        : "bg-card text-pencil hover:-translate-y-0.5 hover:bg-postit",
                    )}
                  >
                    {slot === "morning" ? "☀ morning" : "☾ night"}
                  </button>
                ))}
              </div>
            </div>

            {/* Save Button */}
            {hasChanges && (
              <WobblyButton
                variant="marker"
                size="lg"
                onClick={handleSave}
                disabled={!!usernameError || saving}
                className="w-full"
              >
                {saving ? "saving changes..." : "save changes"}
              </WobblyButton>
            )}

            {/* Logout Button */}
            <WobblyButton
              variant="paper"
              size="lg"
              onClick={() => signOut({ redirectUrl: "/sign-in" })}
              className="w-full text-marker hover:bg-marker hover:text-card"
            >
              log out
            </WobblyButton>
          </section>
        </PageMotion>

        <footer className="border-t-2 border-dashed border-pencil/30 py-5 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-pencil/50">
          Roz · one page a day
        </footer>
      </main>
    </div>
  );
}
