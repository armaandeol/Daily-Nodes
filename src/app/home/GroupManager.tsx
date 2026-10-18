"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { fetchUserGroup, createGroup, regenerateInviteCode, joinGroupByCode, updateGroup, kickGroupMember, leaveGroup } from "./actions";
import JoinGroupModal from "./JoinGroupModal";
import GroupSettingsBook from "./GroupSettingsBook";
import { WobblyButton } from "@/components/sketch";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type GroupData = {
  id: string;
  name: string;
  invite_code: string;
  invite_token: string;
  invite_link: string;
  created_at: string;
};

type Member = {
  id: string;
  name: string;
  email: string;
  joined_at: string;
  role: "admin" | "member";
  avatarUrl: string | null;
};

type ActiveTab = "overview" | "members" | "settings";

export default function GroupManager({ initialGroup }: { initialGroup?: any }) {
  const [expanded, setExpanded] = useState(false);
  const reduce = useReducedMotion();
  const [group, setGroup] = useState<GroupData | null>(initialGroup || null);
  const [loading, setLoading] = useState(initialGroup === undefined);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [groupName, setGroupName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  // Edit states
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editedName, setEditedName] = useState(initialGroup?.name || "");
  const [editedBio, setEditedBio] = useState(initialGroup?.bio || "");

  const [members, setMembers] = useState<Member[]>(() => {
    if (initialGroup?.members) {
      return initialGroup.members.map((m: any) => ({
        id: m.clerk_user_id,
        name: m.profiles?.display_name || "Unknown User",
        email: m.profiles?.username ? `@${m.profiles.username}` : "",
        joined_at: m.joined_at,
        role: m.role === "owner" ? "admin" : "member",
        avatarUrl: m.profiles?.avatar_url || null
      }));
    }
    return [];
  });

  const { userId: currentUserId } = useAuth();

  useEffect(() => {
    if (initialGroup === undefined) {
      loadGroup();
    } else {
      console.log("GroupManager initialized with initialGroup", initialGroup);
    }
  }, [initialGroup]);

  async function loadGroup() {
    try {
      setLoading(true);
      const data = await fetchUserGroup();
      if (data) {
        setGroup(data);
        setEditedName(data.name || "");
        setEditedBio(data.bio || "");
        
        const mappedMembers = (data.members || []).map((m: any) => ({
          id: m.clerk_user_id,
          name: m.profiles?.display_name || "Unknown User",
          email: m.profiles?.username ? `@${m.profiles.username}` : "",
          joined_at: m.joined_at,
          role: m.role === "owner" ? "admin" : "member",
          avatarUrl: m.profiles?.avatar_url || null
        }));
        setMembers(mappedMembers);
      } else {
        setGroup(null);
        setMembers([]);
      }
    } catch (err) {
      console.error("Failed to load group:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!groupName.trim()) {
      setError("Group name is required");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await createGroup(groupName.trim());
      await loadGroup(); // Reload to get full group data with members
      setIsCreateModalOpen(false);
      setGroupName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create group");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleJoinGroup(code: string) {
    const result = await joinGroupByCode(code);
    setGroup(result);
    await loadGroup();
  }

  async function handleRegenerateInvite() {
    if (!group) return;
    setSubmitting(true);
    try {
      const updatedGroup = await regenerateInviteCode(group.id);
      setGroup(updatedGroup);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to regenerate invite");
    } finally {
      setSubmitting(false);
    }
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }

  async function handleSaveName() {
    if (!group) return;
    setError("");
    setSubmitting(true);
    try {
      const updated = await updateGroup(group.id, { name: editedName.trim() });
      setGroup(updated);
      setIsEditingName(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update group name");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveBio() {
    if (!group) return;
    setError("");
    setSubmitting(true);
    try {
      const updated = await updateGroup(group.id, { bio: editedBio.trim() });
      setGroup(updated);
      setIsEditingBio(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update group bio");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleKickMember(memberId: string) {
    if (!group) return;
    setError("");
    try {
      await kickGroupMember(group.id, memberId);
      await loadGroup();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to kick member");
    }
  }

  async function handleLeaveGroup() {
    setError("");
    try {
      await leaveGroup();
      setIsManageModalOpen(false);
      setGroup(null);
      setMembers([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to leave group");
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-fit max-w-full bg-card border-2 border-pencil wobbly-md p-4 shadow-hard font-note text-pencil">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
          <span className="text-sm text-neutral-500">Loading group...</span>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <>
        <section className="mx-auto w-fit max-w-full border-y border-dashed border-pencil/30 py-2 font-note text-pencil">
          <WobblyButton onClick={() => setExpanded((v) => !v)} aria-expanded={expanded} aria-controls="circle-options" className="w-full justify-between border-0 bg-transparent px-0 py-1 shadow-none hover:bg-transparent hover:text-ink">
            <span>👥 Create or join a group</span><span aria-hidden="true">{expanded ? "−" : "+"}</span>
          </WobblyButton>
          <AnimatePresence initial={false}>{expanded && <motion.div id="circle-options" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduce ? 0 : 0.2 }} className="overflow-hidden">
            <div className="flex flex-wrap justify-center gap-3 pb-2 pt-3">
              <WobblyButton onClick={() => setIsCreateModalOpen(true)}>+ Create group</WobblyButton>
              <WobblyButton onClick={() => setIsJoinModalOpen(true)}>Join group ↗</WobblyButton>
            </div>
          </motion.div>}</AnimatePresence>
        </section>

        {/* Create Group Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" onClick={() => { setIsCreateModalOpen(false); setError(""); setGroupName(""); }}>
            <div className="bg-white p-6 rounded-lg w-[90%] max-w-[400px]" onClick={e => e.stopPropagation()}>
              <form onSubmit={handleCreateGroup} className="flex flex-col gap-4">
                <h3 className="m-0 text-lg font-medium text-neutral-900">Create New Group</h3>
                
                {error && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <label className="text-sm text-neutral-600 font-medium">Group Name</label>
                  <input
                    className="p-2 border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-500"
                    type="text"
                    placeholder="Enter group name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    autoFocus
                  />
                </div>
                
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    className="px-4 py-2 bg-transparent text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
                    onClick={() => { setIsCreateModalOpen(false); setError(""); setGroupName(""); }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={submitting}
                  >
                    {submitting ? "Creating..." : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <JoinGroupModal
          isOpen={isJoinModalOpen}
          onClose={() => setIsJoinModalOpen(false)}
          onJoin={handleJoinGroup}
        />
      </>
    );
  }

  const isAdmin = members.find(m => m.id === currentUserId)?.role === "admin";

  return (
    <>
      {/* Compact Group Strip */}
      <div className="mx-auto inline-flex w-fit max-w-full items-center gap-3 border-2 border-pencil bg-card px-3 py-1.5 font-note text-pencil shadow-hard-sm wobbly-sm">
        <span aria-hidden className="text-base">👥</span>
        <span className="truncate font-hand text-lg leading-none">{group.name}</span>
        <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.15em] text-pencil/60">{members.length} members</span>
        <button
          onClick={() => { setError(""); setIsManageModalOpen(true); }}
          className="whitespace-nowrap border-2 border-pencil bg-postit px-2 py-0.5 font-hand text-sm text-pencil wobbly-sm transition-transform hover:-rotate-2"
        >
          manage →
        </button>
      </div>

      <GroupSettingsBook
        open={isManageModalOpen}
        onClose={() => { setError(""); setIsManageModalOpen(false); }}
        tab={activeTab}
        onTab={(t) => { setError(""); setActiveTab(t); }}
        group={group}
        members={members}
        isAdmin={isAdmin}
        currentUserId={currentUserId}
        error={error}
        submitting={submitting}
        copySuccess={copySuccess}
        isEditingName={isEditingName}
        setIsEditingName={setIsEditingName}
        editedName={editedName}
        setEditedName={setEditedName}
        isEditingBio={isEditingBio}
        setIsEditingBio={setIsEditingBio}
        editedBio={editedBio}
        setEditedBio={setEditedBio}
        onSaveName={handleSaveName}
        onSaveBio={handleSaveBio}
        onCopy={copyToClipboard}
        onRegenerate={handleRegenerateInvite}
        onKick={handleKickMember}
        onLeave={handleLeaveGroup}
      />
    </>
  );
}
