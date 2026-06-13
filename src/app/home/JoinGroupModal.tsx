"use client";

import { useState } from "react";

type JoinGroupModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (code: string) => Promise<void>;
};

export default function JoinGroupModal({ isOpen, onClose, onJoin }: JoinGroupModalProps) {
  const [inviteCode, setInviteCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!inviteCode.trim()) {
      setError("Please enter an invite code");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await onJoin(inviteCode.trim());
      setInviteCode("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join group");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setInviteCode("");
    setError("");
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" onClick={handleClose}>
      <div className="bg-white p-6 rounded-lg w-[90%] max-w-[400px]" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <h3 className="m-0 text-lg font-medium text-neutral-900">Join a Group</h3>
          
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm text-neutral-600 font-medium">Invite Code</label>
            <input
              className="p-2 border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-500 font-mono"
              type="text"
              placeholder="Enter invite code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              autoFocus
            />
            <p className="text-xs text-neutral-500 mt-1">Enter the invite code shared by your group admin</p>
          </div>
          
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              className="px-4 py-2 bg-transparent text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? "Joining..." : "Join Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
