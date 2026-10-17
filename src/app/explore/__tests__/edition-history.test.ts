// @ts-nocheck -- run with bun test
import { expect, test } from "bun:test";
import { editionHistory } from "../edition-history";
const editions = [
  { id: "yesterday", date_start: "2026-10-16", slot: "night", status: "generated" },
  { id: "today", date_start: "2026-10-17", slot: "night", status: "generated" },
  { id: "pending", date_start: "2026-10-18", slot: "morning", status: "pending" },
];
test("latest edition links to yesterday and cannot advance", () => {
  const history = editionHistory(editions);
  expect(history.digest?.id).toBe("today");
  expect(history.older?.id).toBe("yesterday");
  expect(history.newer).toBeNull();
});
test("yesterday links back to today's digest", () => {
  expect(editionHistory(editions, "yesterday").newer?.id).toBe("today");
});
test("unknown edition does not silently show the latest", () => {
  expect(editionHistory(editions, "missing").digest).toBeNull();
});