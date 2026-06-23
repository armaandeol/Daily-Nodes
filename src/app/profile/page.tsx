"use client";

import { useEffect, useState, useRef } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  fetchUserProfile,
  updateUserProfile,
  checkUsernameAvailability,
  uploadUserAvatar,
} from "@/app/home/actions";

export default function ProfilePage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  // Profile data state
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [digestSlot, setDigestSlot] = useState<"morning" | "night">("night");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Loading and helper state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Original profile to compare changes
  const [initialProfile, setInitialProfile] = useState<any>(null);

  // Username validation state
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [usernameSuccess, setUsernameSuccess] = useState("");

  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Load profile on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await fetchUserProfile();
        setInitialProfile(profile);
        setDisplayName(profile.display_name || user?.fullName || "");
        setUsername(profile.username || user?.username || "");
        setBio(profile.bio || "");
        setDigestSlot(profile.digest_slot || "night");
        setAvatarUrl(profile.avatar_signed_url || profile.avatar_url || user?.imageUrl || "");
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadProfile();
    }
  }, [user]);

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
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("Failed to upload avatar image");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen max-w-[680px] mx-auto px-6 flex items-center justify-center">
        <p className="text-sm font-medium text-neutral-500 animate-pulse">Loading profile...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen max-w-[680px] mx-auto px-6 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between pt-7 pb-5 border-b border-neutral-200">
        <Link
          href="/home"
          className="text-sm font-semibold tracking-wide text-neutral-900 hover:text-neutral-600 transition-colors"
        >
          ← back
        </Link>
        <span className="text-sm font-semibold tracking-wide text-neutral-900">profile</span>
        <div className="w-16" /> {/* Spacer for centering */}
      </header>

      {/* Profile Content */}
      <section className="flex-1 flex flex-col pt-12 pb-8 gap-8">
        {/* Profile Picture */}
        <div className="flex flex-col items-center gap-3">
          <div
            onClick={handleAvatarClick}
            className="group relative w-24 h-24 rounded-full overflow-hidden bg-neutral-200 cursor-pointer shadow-sm border border-neutral-200 hover:border-neutral-400 transition-all"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-400 text-2xl font-semibold">
                {(displayName || user?.firstName || "U")[0]}
              </div>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span className="text-[10px] uppercase tracking-widest text-white font-medium">Change</span>
              <span className="text-[10px] uppercase tracking-widest text-white font-medium">Photo</span>
            </div>

            {/* Uploading indicator overlay */}
            {isUploadingAvatar && (
              <div className="absolute inset-0 bg-neutral-900/60 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />
          <p className="text-[11px] text-neutral-400 tracking-wide">JPG, PNG or WEBP. Max 2MB.</p>
        </div>

        {/* Empty Rectangle Placeholder */}
        <div className="w-full h-48 border-2 border-dashed border-neutral-300 rounded-lg bg-neutral-50" />

        {/* Form Fields */}
        <div className="flex flex-col gap-6">
          {/* Display Name */}
          <div className="flex flex-col gap-2">
            <label className="text-xs tracking-widest uppercase text-neutral-400">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="px-4 py-3 border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              placeholder="Enter your display name"
            />
          </div>

          {/* Username */}
          <div className="flex flex-col gap-2">
            <label className="text-xs tracking-widest uppercase text-neutral-400">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
              className="px-4 py-3 border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              placeholder="Enter your username"
            />
            {isCheckingUsername && (
              <p className="text-xs text-neutral-500 animate-pulse mt-0.5">Checking availability...</p>
            )}
            {usernameSuccess && (
              <p className="text-xs text-green-600 mt-0.5">✓ {usernameSuccess}</p>
            )}
            {usernameError && (
              <p className="text-xs text-red-500 mt-0.5">✗ {usernameError}</p>
            )}
          </div>

          {/* Bio */}
          <div className="flex flex-col gap-2">
            <label className="text-xs tracking-widest uppercase text-neutral-400">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="px-4 py-3 border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>

          {/* Digest Slot */}
          <div className="flex flex-col gap-2">
            <label className="text-xs tracking-widest uppercase text-neutral-400">
              Digest Slot
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setDigestSlot("morning")}
                className={`flex-1 px-4 py-3 border rounded-lg text-sm font-medium transition-all ${
                  digestSlot === "morning"
                    ? "bg-neutral-900 text-white border-neutral-900"
                    : "bg-white text-neutral-900 border-neutral-300 hover:border-neutral-400"
                }`}
              >
                Morning
              </button>
              <button
                onClick={() => setDigestSlot("night")}
                className={`flex-1 px-4 py-3 border rounded-lg text-sm font-medium transition-all ${
                  digestSlot === "night"
                    ? "bg-neutral-900 text-white border-neutral-900"
                    : "bg-white text-neutral-900 border-neutral-300 hover:border-neutral-400"
                }`}
              >
                Night
              </button>
            </div>
          </div>

          {/* Save Button */}
          {hasChanges && (
            <Button
              onClick={handleSave}
              disabled={!!usernameError || saving}
              className="w-full py-6 text-sm font-semibold tracking-wide"
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </Button>
          )}

          {/* Logout Button */}
          <Button
            variant="outline"
            onClick={() => signOut({ redirectUrl: '/sign-in' })}
            className="w-full py-6 text-sm font-semibold tracking-wide text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            Logout
          </Button>
        </div>
      </section>
    </main>
  );
}

