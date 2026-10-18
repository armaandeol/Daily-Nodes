export type NodeData = {
  id: string;
  type: string;
  title: string | null;
  content: string | null;
  image_url: string | null;
  image_signed_url?: string | null;
  logged_at: string;
  visibility: string;
  /** Visual style chosen when the log was created (see LOG_STYLES). */
  style?: string | null;
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

export type StampShape = "rect" | "round" | "pill";
/** Each category has one fixed rubber-stamp shape and ink, so they read apart at a glance. */
export const CATEGORY_STAMPS: Record<string, { shape: StampShape; ink: string }> = {
  study: { shape: "rect", ink: "var(--ink)" },
  custom: { shape: "round", ink: "var(--marker)" },
  mood: { shape: "pill", ink: "#4f7a4a" },
  workout: { shape: "rect", ink: "#c2662d" },
  food: { shape: "pill", ink: "#8a5a2b" },
  social: { shape: "round", ink: "#6b4f8a" },
};
export const stampOf = (id: string) => CATEGORY_STAMPS[id] ?? { shape: "pill" as StampShape, ink: "var(--pencil)" };

export type LogStyleId = "postit" | "lined" | "index" | "scrap";
export const LOG_STYLES: { id: LogStyleId; label: string }[] = [
  { id: "postit", label: "Post-it" },
  { id: "lined", label: "Lined paper" },
  { id: "index", label: "Index card" },
  { id: "scrap", label: "Torn scrap" },
];
export const logStyleOf = (id?: string | null): LogStyleId =>
  (LOG_STYLES.find((s) => s.id === id)?.id ?? "postit");
