import type { Digest } from "./actions";

export function editionHistory(digests: Digest[], id?: string) {
  const editions = digests.filter((d) => d.status === "generated").sort((a, b) => b.date_start.localeCompare(a.date_start) || (b.slot === "night" ? 1 : 0) - (a.slot === "night" ? 1 : 0));
  const index = id ? editions.findIndex((d) => d.id === id) : 0;
  return { digest: editions[index] ?? null, older: index >= 0 ? editions[index + 1] ?? null : null, newer: index > 0 ? editions[index - 1] : null };
}