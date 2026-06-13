"use server";

import { auth } from "@clerk/nextjs/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function joinGroupByToken(token: string) {
  const { getToken } = await auth();
  const authToken = await getToken();
  
  if (!authToken) throw new Error("Unauthorized");

  const res = await fetch(`${API_URL}/api/v1/groups/join?invite_token=${token}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json"
    }
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("joinGroupByToken error:", errorText);
    
    // Try to parse error message from response
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.detail || errorJson.message || "Failed to join group");
    } catch {
      throw new Error("Failed to join group. The invite link may be invalid or expired.");
    }
  }

  return res.json();
}
