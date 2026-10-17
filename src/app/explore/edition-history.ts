import type { Digest } from "./actions";

export function editionHistory(digests: Digest[], id?: string, date?: string) {
  const editions = digests.filter((d) => d.status === "generated").sort((a, b) => b.date_start.localeCompare(a.date_start) || (b.slot === "night" ? 1 : 0) - (a.slot === "night" ? 1 : 0));
  const resolvedId = id ?? (date ? editions.find((d) => d.date_start === date)?.id : undefined);
  const index = resolvedId ? editions.findIndex((d) => d.id === resolvedId) : 0;
  return { digest: editions[index] ?? null, older: index >= 0 ? editions[index + 1] ?? null : null, newer: index > 0 ? editions[index - 1] : null };
}