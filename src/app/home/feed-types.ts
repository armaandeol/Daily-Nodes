export type NodeData = {
  id: string;
  type: string;
  title: string | null;
  content: string | null;
  image_url: string | null;
  image_signed_url?: string | null;
  logged_at: string;
  visibility: string;
  profiles?: {
    display_name: string;
    avatar_url: string | null;
  } | null;
  reactions?: {
    type: string;
    user_id: string;
    display_name: string;
  }[];
};

export type ReactionType = "heart" | "thumbs_up" | "thumbs_down" | "fire";

export type GroupData = {
  id: string;
  name: string;
  members?: any[];
} | null;

export const REACTION_EMOJIS: Record<ReactionType, string> = {
  heart: "❤️",
  thumbs_up: "👍",
  thumbs_down: "👎",
  fire: "🔥",
};

export const CATEGORIES: { id: string; label: string; icon: string; desc: string }[] = [
  { id: "custom", label: "Custom", icon: "✦", desc: "General logs, notes, or ideas." },
  { id: "workout", label: "Workout", icon: "⚡", desc: "Exercises and fitness metrics." },
  { id: "food", label: "Food", icon: "🍏", desc: "Meals and nutrition tracking." },
  { id: "mood", label: "Mood", icon: "✿", desc: "Mindfulness and reflections." },
  { id: "study", label: "Study", icon: "📖", desc: "Lectures, learning, and reads." },
  { id: "social", label: "Social", icon: "👥", desc: "Meetings, hangouts, and events." },
];

export const categoryOf = (id: string) => CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];

/** Deterministic small tilt per card so the feed looks pinned by hand. */
export const TILTS = [-1.6, 1.2, -0.6, 1.8, -1.1, 0.7];

export function imageSrc(node: Pick<NodeData, "image_signed_url" | "image_url">) {
  return node.image_signed_url || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/${node.image_url}`;
}

/**
 * When a photo is attached, the heading moves into the description so it is
 * never lost or hidden behind the image.
 */
export function mergeHeadingIntoDescription(title: string, description: string) {
  const t = title.trim();
  if (!t) return description;
  const d = description.trim();
  return d ? `${t}\n${d}` : t;
}
