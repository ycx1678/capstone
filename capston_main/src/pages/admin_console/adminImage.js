import { clamp } from "./adminPath";

async function fileToWebpBlob(
  file,
  { maxDim = 1600, quality = 0.8 } = {}
) {
  if (!file) throw new Error("No file");

  const bitmap = await createImageBitmap(file).catch(() => null);

  let width, height, source;

  if (bitmap) {
    width = bitmap.width;
    height = bitmap.height;
    source = bitmap;
  } else {
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = reject;
        el.src = url;
      });
      width = img.naturalWidth || img.width;
      height = img.naturalHeight || img.height;
      source = img;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  if (!width || !height) throw new Error("Invalid image");

  const scale = Math.min(1, maxDim / Math.max(width, height));
  const outW = Math.max(1, Math.round(width * scale));
  const outH = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;

  const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
  if (!ctx) throw new Error("Canvas context unavailable");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, outW, outH);
  ctx.drawImage(source, 0, 0, outW, outH);

  const q = clamp(Number(quality) || 0.8, 0.05, 1);

  const blob = await new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/webp", q);
  });

  if (!blob) throw new Error("WebP encode failed");

  if (bitmap && bitmap.close) bitmap.close();

  return blob;
}

export async function uploadImage(
  file,
  { maxDim = 1600, quality = 0.8, folder = "capstone" } = {}
) {
  const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName) throw new Error("Missing REACT_APP_CLOUDINARY_CLOUD_NAME");
  if (!uploadPreset) throw new Error("Missing REACT_APP_CLOUDINARY_UPLOAD_PRESET");
  if (!file) throw new Error("No file");

  const webpBlob = await fileToWebpBlob(file, { maxDim, quality });

  const safeBaseName =
    (file.name || "image")
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9-_]/g, "_") || "image";

  const uploadFile = new File([webpBlob], `${safeBaseName}.webp`, {
    type: "image/webp",
  });

  const formData = new FormData();
  formData.append("file", uploadFile);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message || "Cloudinary upload failed");
  }

  if (!data?.secure_url) {
    throw new Error("No secure_url returned from Cloudinary");
  }

  return data.secure_url;
}