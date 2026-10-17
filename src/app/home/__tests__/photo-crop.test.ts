// @ts-nocheck -- run with bun test
import { expect, test, mock } from "bun:test";
import { createCroppedPhoto, cropOutputSize, POLAROID_ASPECT } from "../photo-crop";

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

test("export saves only the selected pixels in a new image file", async () => {
  const previousImage = globalThis.Image;
  const previousDocument = globalThis.document;
  const drawImage = mock(() => {});
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => ({ drawImage }),
    toBlob: (callback) => callback(new Blob(["cropped pixels"], { type: "image/jpeg" })),
  };
  globalThis.Image = class { src = ""; decode() { return Promise.resolve(); } };
  globalThis.document = { createElement: () => canvas };
  try {
    const exported = await createCroppedPhoto("blob:original-photo", { x: 120, y: 80, width: 800, height: 600 }, "original.png");
    expect(drawImage.mock.calls[0].slice(1)).toEqual([120, 80, 800, 600, 0, 0, 800, 600]);
    expect(exported.name).toBe("original-cropped.jpg");
    expect(exported.type).toBe("image/jpeg");
    expect(await exported.text()).toBe("cropped pixels");
  } finally {
    globalThis.Image = previousImage;
    globalThis.document = previousDocument;
  }
});