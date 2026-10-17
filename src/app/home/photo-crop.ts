export const POLAROID_ASPECT = 4 / 3;
export type CropPixels = { x: number; y: number; width: number; height: number };

export function cropOutputSize(crop: Pick<CropPixels, "width" | "height">) {
  if (crop.width <= 0 || crop.height <= 0) throw new Error("Invalid photo crop");
  const width = Math.max(4, Math.floor(Math.min(crop.width, 1200) / 4) * 4);
  return { width, height: width * 3 / 4 };
}

/** Encode only the selected pixels; the original never enters the upload. */
export async function createCroppedPhoto(source: string, crop: CropPixels, originalName: string): Promise<File> {
  const image = new Image();
  image.src = source;
  await image.decode();
  const canvas = document.createElement("canvas");
  const size = cropOutputSize(crop);
  canvas.width = size.width;
  canvas.height = size.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Photo cropping is unavailable");
  context.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, size.width, size.height);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => result ? resolve(result) : reject(new Error("Couldn't crop this photo")), "image/jpeg", 0.92);
  });
  return new File([blob], `${originalName.replace(/\.[^.]+$/, "") || "photo"}-cropped.jpg`, { type: "image/jpeg" });
}