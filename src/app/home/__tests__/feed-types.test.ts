// @ts-nocheck -- run with `bun test`
import { expect, test } from "bun:test";
import { logStyleOf, stampOf } from "../feed-types";
test("unknown or missing log style falls back to post-it", () => {
  expect(logStyleOf(undefined)).toBe("postit");
  expect(logStyleOf("nope")).toBe("postit");
});
test("chosen log style is kept", () => expect(logStyleOf("scrap")).toBe("scrap"));
test("study, custom and mood stamps differ in shape", () => {
  expect(new Set([stampOf("study").shape, stampOf("custom").shape, stampOf("mood").shape]).size).toBe(3);
});
