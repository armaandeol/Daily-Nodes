"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { fetchUserGroup, createGroup, regenerateInviteCode, joinGroupByCode, updateGroup, kickGroupMember, leaveGroup } from "./actions";
import JoinGroupModal from "./JoinGroupModal";

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
};

type ActiveTab = "overview" | "members" | "settings";

export default function GroupManager({ initialGroup }: { initialGroup?: any }) {
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
        role: m.role === "owner" ? "admin" : "member"
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
          role: m.role === "owner" ? "admin" : "member"
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
      <div className="bg-card border-2 border-pencil wobbly-md p-4 shadow-hard font-note text-pencil">
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
        <div className="bg-card border-2 border-pencil wobbly-md p-6 shadow-hard font-note text-pencil">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-blue-200/50 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">👥</span>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-neutral-900 mb-1">Create or Join a Group</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  You&apos;re not part of any group yet. Create one to collaborate or join an existing group with an invite code.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
              >
                + Create Group
              </button>
              <button
                onClick={() => setIsJoinModalOpen(true)}
                className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Join Group
              </button>
            </div>
          </div>
        </div>

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
      {/* Compact Group Card */}
      <div className="bg-card border-2 border-pencil wobbly-md p-4 shadow-hard font-note text-pencil">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
              <span className="text-base">👥</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-neutral-900 truncate">{group.name}</h3>
              <p className="text-xs text-neutral-500">{members.length} members</p>
            </div>
          </div>
          <button
            onClick={() => { setError(""); setIsManageModalOpen(true); }}
            className="px-3 py-1.5 bg-neutral-900 text-white text-xs font-medium rounded-md hover:bg-neutral-800 transition-colors flex-shrink-0"
          >
            Manage
          </button>
        </div>
      </div>

      {/* Group Management Modal */}
      {isManageModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" onClick={() => { setError(""); setIsManageModalOpen(false); }}>
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-neutral-900">Group Settings</h2>
                <button
                  onClick={() => { setError(""); setIsManageModalOpen(false); }}
                  className="text-neutral-400 hover:text-neutral-600 text-2xl leading-none w-8 h-8 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-6 pt-4 border-b border-neutral-200">
              <div className="flex gap-1">
                <button
                  onClick={() => { setError(""); setActiveTab("overview"); }}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === "overview"
                      ? "bg-neutral-100 text-neutral-900"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => { setError(""); setActiveTab("members"); }}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === "members"
                      ? "bg-neutral-100 text-neutral-900"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                  }`}
                >
                  Members
                </button>
                <button
                  onClick={() => { setError(""); setActiveTab("settings"); }}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === "settings"
                      ? "bg-neutral-100 text-neutral-900"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                  }`}
                >
                  Settings
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-md text-sm mb-4">
                  {error}
                </div>
              )}
              
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  
                  {/* Group Name */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Group Name</label>
                    {isEditingName ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent text-sm"
                          autoFocus
                        />
                        <button
                          onClick={handleSaveName}
                          className="px-4 py-2 bg-neutral-900 text-white text-sm rounded-lg hover:bg-neutral-800 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingName(false);
                            setEditedName(group.name);
                          }}
                          className="px-4 py-2 border border-neutral-300 text-neutral-700 text-sm rounded-lg hover:bg-neutral-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between px-3 py-2 bg-neutral-50 rounded-lg">
                        <span className="text-sm text-neutral-900">{group.name}</span>
                        {isAdmin && (
                          <button
                            onClick={() => setIsEditingName(true)}
                            className="text-xs text-neutral-600 hover:text-neutral-900 underline"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Group Bio */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Bio</label>
                    {isEditingBio ? (
                      <div className="space-y-2">
                        <textarea
                          value={editedBio}
                          onChange={(e) => setEditedBio(e.target.value)}
                          placeholder="Add a description for your group..."
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent text-sm resize-none"
                          rows={4}
                          autoFocus
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => {
                              setIsEditingBio(false);
                              setEditedBio("");
                            }}
                            className="px-4 py-2 border border-neutral-300 text-neutral-700 text-sm rounded-lg hover:bg-neutral-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveBio}
                            className="px-4 py-2 bg-neutral-900 text-white text-sm rounded-lg hover:bg-neutral-800 transition-colors"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="px-3 py-2 bg-neutral-50 rounded-lg min-h-[100px]">
                        {editedBio ? (
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-sm text-neutral-700 whitespace-pre-wrap">{editedBio}</p>
                            {isAdmin && (
                              <button
                                onClick={() => setIsEditingBio(true)}
                                className="text-xs text-neutral-600 hover:text-neutral-900 underline flex-shrink-0"
                              >
                                Edit
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            {isAdmin ? (
                              <button
                                onClick={() => setIsEditingBio(true)}
                                className="text-sm text-neutral-500 hover:text-neutral-700 underline"
                              >
                                + Add a bio
                              </button>
                            ) : (
                              <span className="text-sm text-neutral-400">No bio yet</span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Group Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="px-4 py-3 bg-neutral-50 rounded-lg">
                      <div className="text-2xl font-semibold text-neutral-900">{members.length}</div>
                      <div className="text-xs text-neutral-600 mt-1">Members</div>
                    </div>
                    <div className="px-4 py-3 bg-neutral-50 rounded-lg">
                      <div className="text-2xl font-semibold text-neutral-900">
                        {new Date(group.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-xs text-neutral-600 mt-1">Created</div>
                    </div>
                  </div>

                  {/* Invite Section */}
                  <div className="pt-4 border-t border-neutral-200">
                    <h3 className="text-sm font-medium text-neutral-900 mb-3">Invite Members</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-neutral-600 mb-1.5">Invite Link</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={group.invite_link}
                            readOnly
                            className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono text-neutral-700"
                          />
                          <button
                            onClick={() => copyToClipboard(group.invite_link)}
                            className="px-3 py-2 bg-neutral-900 text-white text-xs rounded-lg hover:bg-neutral-800 transition-colors"
                          >
                            {copySuccess ? "✓" : "Copy"}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-neutral-600 mb-1.5">Invite Code</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={group.invite_code}
                            readOnly
                            className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono text-neutral-700"
                          />
                          <button
                            onClick={() => copyToClipboard(group.invite_code)}
                            className="px-3 py-2 bg-neutral-900 text-white text-xs rounded-lg hover:bg-neutral-800 transition-colors"
                          >
                            {copySuccess ? "✓" : "Copy"}
                          </button>
                        </div>
                      </div>

                      {isAdmin && (
                        <button
                          onClick={handleRegenerateInvite}
                          disabled={submitting}
                          className="text-xs text-neutral-600 hover:text-neutral-900 underline disabled:opacity-50"
                        >
                          {submitting ? "Regenerating..." : "Regenerate invite code"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Members Tab */}
              {activeTab === "members" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-neutral-900">
                      {members.length} {members.length === 1 ? "Member" : "Members"}
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between px-4 py-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-neutral-700">
                              {member.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-neutral-900 truncate">
                                {member.name}
                              </span>
                              {member.role === "admin" && (
                                <span className="px-2 py-0.5 bg-neutral-900 text-white text-[10px] font-medium rounded">
                                  ADMIN
                                </span>
                              )}
                              {member.id === currentUserId && (
                                <span className="text-xs text-neutral-500">(You)</span>
                              )}
                            </div>
                            <p className="text-xs text-neutral-500 truncate">{member.email}</p>
                          </div>
                        </div>

                        {isAdmin && member.id !== currentUserId && (
                          <button
                            onClick={() => handleKickMember(member.id)}
                            className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === "settings" && (
                <div className="space-y-6">
                  
                  {/* Danger Zone */}
                  <div className="border border-rose-200 rounded-lg p-4 bg-rose-50/50">
                    <h3 className="text-sm font-semibold text-rose-900 mb-2">Danger Zone</h3>
                    <p className="text-xs text-rose-700 mb-4">
                      {isAdmin 
                        ? "As an admin, leaving will transfer ownership to another member. If you're the last member, the group will be deleted."
                        : "Once you leave, you'll need a new invite to rejoin this group."
                      }
                    </p>
                    <button
                      onClick={handleLeaveGroup}
                      className="px-4 py-2 bg-rose-600 text-white text-sm font-medium rounded-lg hover:bg-rose-700 transition-colors"
                    >
                      Leave Group
                    </button>
                  </div>

                  {/* Group Info */}
                  <div className="pt-4 border-t border-neutral-200">
                    <h3 className="text-sm font-medium text-neutral-900 mb-3">Group Information</h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-2">
                        <span className="text-neutral-600">Group ID</span>
                        <span className="font-mono text-neutral-900">{group.id.slice(0, 12)}...</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-neutral-600">Created</span>
                        <span className="text-neutral-900">
                          {new Date(group.created_at).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-neutral-600">Your Role</span>
                        <span className="text-neutral-900 capitalize">{isAdmin ? "Admin" : "Member"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
