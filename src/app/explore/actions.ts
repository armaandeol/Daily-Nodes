"use server";

import { auth } from "@clerk/nextjs/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type DigestPhoto = {
  url: string;
  caption: string | null;
  source: "log" | "stock";
};

export type DigestStats = {
  logs_today: number;
  streak: number;
  most_active_hour: string | null;
  top_log_type: string | null;
};

export type Digest = {
  id: string;
  date_start: string;
  date_end: string;
  period: string;
  status: string;
  slot: "morning" | "night" | null;
  headline: string | null;
  tapestry: string | null;
  circle_headline: string | null;
  circle: string | null;
  pivot: string | null;
  pull_quote: string | null;
  has_circle: boolean;
  stats: DigestStats | null;
  photo: DigestPhoto | null;
  circle_photo: DigestPhoto | null;
};

export async function fetchDigestEditions(): Promise<Digest[]> {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) throw new Error("Unauthorized");

  const url = new URL(`${API_URL}/api/v1/digests/my`);
  url.searchParams.set("period", "daily");
  url.searchParams.set("limit", "100");

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("fetchLatestDigest error:", await res.text());
    throw new Error("Failed to fetch digest");
  }

  const data = await res.json();
  const digests: Digest[] = data.digests || [];
  return digests;
}

export async function fetchLatestDigest(): Promise<Digest | null> {
  const digests = await fetchDigestEditions();
  return digests.find((d) => d.status === "generated") ?? null;
}
