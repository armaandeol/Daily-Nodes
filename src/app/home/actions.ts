"use server";

import { auth } from "@clerk/nextjs/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchNodes(date?: string) {
  const { getToken } = await auth();
  const token = await getToken();
  
  if (!token) throw new Error("Unauthorized");

  const url = new URL(`${API_URL}/nodes/`);
  if (date) {
    url.searchParams.append("date", date);
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    console.error("fetchNodes error:", await res.text());
    throw new Error("Failed to fetch nodes");
  }

  return res.json();
}

export async function createNode(formData: FormData) {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) throw new Error("Unauthorized");

  const res = await fetch(`${API_URL}/nodes/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData,
  });

  if (!res.ok) {
    console.error("createNode error:", await res.text());
    throw new Error("Failed to create node");
  }

  return res.json();
}

export async function fetchUserGroup() {
  const { getToken } = await auth();
  const token = await getToken();
  
  if (!token) throw new Error("Unauthorized");

  const res = await fetch(`${API_URL}/api/v1/groups/my-group`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (res.status === 404) {
    return null; // User is not in a group
  }

  if (!res.ok) {
    console.error("fetchUserGroup error:", await res.text());
    throw new Error("Failed to fetch group");
  }

  return res.json();
}

export async function createGroup(name: string) {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) throw new Error("Unauthorized");

  const res = await fetch(`${API_URL}/api/v1/groups/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name })
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("createGroup error:", errorText);
    
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.detail || errorJson.message || "Failed to create group");
    } catch {
      throw new Error("Failed to create group");
    }
  }

  return res.json();
}

export async function regenerateInviteCode(groupId: string) {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) throw new Error("Unauthorized");

  const res = await fetch(`${API_URL}/api/v1/groups/${groupId}/regenerate-invite`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (!res.ok) {
    console.error("regenerateInviteCode error:", await res.text());
    throw new Error("Failed to regenerate invite code");
  }

  return res.json();
}

export async function joinGroupByCode(code: string) {
  const { getToken } = await auth();
  const token = await getToken();
  
  if (!token) throw new Error("Unauthorized");

  const res = await fetch(`${API_URL}/api/v1/groups/join?invite_code=${code}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("joinGroupByCode error:", errorText);
    
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.detail || errorJson.message || "Failed to join group");
    } catch {
      throw new Error("Failed to join group. The invite code may be invalid or expired.");
    }
  }

  return res.json();
}

export async function fetchUserProfile() {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) throw new Error("Unauthorized");

  const res = await fetch(`${API_URL}/api/v1/profiles/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    console.error("fetchUserProfile error:", await res.text());
    throw new Error("Failed to fetch profile");
  }

  return res.json();
}

export async function updateUserProfile(data: { display_name?: string; username?: string; bio?: string; digest_slot?: string }) {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) throw new Error("Unauthorized");

  const res = await fetch(`${API_URL}/api/v1/profiles/me`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("updateUserProfile error:", errorText);
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.detail || "Failed to update profile");
    } catch {
      throw new Error("Failed to update profile");
    }
  }

  return res.json();
}

export async function checkUsernameAvailability(username: string) {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) throw new Error("Unauthorized");

  const res = await fetch(`${API_URL}/api/v1/profiles/check-username?username=${encodeURIComponent(username)}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    console.error("checkUsernameAvailability error:", await res.text());
    throw new Error("Failed to check username availability");
  }

  return res.json();
}

export async function uploadUserAvatar(formData: FormData) {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) throw new Error("Unauthorized");

  const res = await fetch(`${API_URL}/api/v1/profiles/me/avatar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  if (!res.ok) {
    console.error("uploadUserAvatar error:", await res.text());
    throw new Error("Failed to upload avatar");
  }

  return res.json();
}

export async function updateGroup(groupId: string, data: { name?: string; bio?: string }) {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) throw new Error("Unauthorized");

  const res = await fetch(`${API_URL}/api/v1/groups/${groupId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("updateGroup error:", errorText);
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.detail || "Failed to update group");
    } catch {
      throw new Error("Failed to update group");
    }
  }

  return res.json();
}

export async function kickGroupMember(groupId: string, memberClerkId: string) {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) throw new Error("Unauthorized");

  const res = await fetch(`${API_URL}/api/v1/groups/${groupId}/kick/${memberClerkId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("kickGroupMember error:", errorText);
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.detail || "Failed to kick member");
    } catch {
      throw new Error("Failed to kick member");
    }
  }

  return res.json();
}

export async function leaveGroup() {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) throw new Error("Unauthorized");

  const res = await fetch(`${API_URL}/api/v1/groups/me/leave`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("leaveGroup error:", errorText);
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.detail || "Failed to leave group");
    } catch {
      throw new Error("Failed to leave group");
    }
  }

  return res.json();
}

export async function reactToNode(nodeId: string, reactionType: string) {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) throw new Error("Unauthorized");

  const res = await fetch(`${API_URL}/nodes/${nodeId}/react`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ type: reactionType })
  });

  if (!res.ok) {
    console.error("reactToNode error:", await res.text());
    throw new Error("Failed to react to node");
  }

  return res.json();
}


