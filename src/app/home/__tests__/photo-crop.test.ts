// @ts-nocheck -- run with bun test
import { expect, test } from "bun:test";
import { cropOutputSize, POLAROID_ASPECT } from "../photo-crop";

test("photo output matches the fixed 4:3 polaroid frame", () => {
  expect(POLAROID_ASPECT).toBe(4 / 3);
  expect(cropOutputSize({ width: 803, height: 602 })).toEqual({ width: 800, height: 600 });
});
test("large crops are capped without changing the polaroid ratio", () => {
  expect(cropOutputSize({ width: 4000, height: 3000 })).toEqual({ width: 1200, height: 900 });
});
test("empty crops cannot be exported", () => {
  expect(() => cropOutputSize({ width: 0, height: 0 })).toThrow();
});