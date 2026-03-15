// src/pages/admin_console/adminImage.js

const CLOUD_NAME = "dhubbsdry";
const UPLOAD_PRESET = "capstone_unsigned";
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function compressImage(file, opts = {}) {
  const maxDim = clamp(Number(opts?.maxDim || 1600), 400, 4000);
  const quality = clamp(Number(opts?.quality || 0.82), 0.3, 0.95);

  const type = String(file?.type || "").toLowerCase();

  // GIF/SVG는 원본 업로드
  if (type.includes("gif") || type.includes("svg")) {
    return file;
  }

  const dataUrl = await readFileAsDataURL(file);
  const img = await loadImage(dataUrl);

  const srcW = img.naturalWidth || img.width;
  const srcH = img.naturalHeight || img.height;

  if (!srcW || !srcH) return file;

  const scale = Math.min(1, maxDim / Math.max(srcW, srcH));
  const targetW = Math.max(1, Math.round(srcW * scale));
  const targetH = Math.max(1, Math.round(srcH * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return file;

  ctx.drawImage(img, 0, 0, targetW, targetH);

  const outType =
    type.includes("png") || type.includes("webp")
      ? "image/webp"
      : "image/jpeg";

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, outType, quality)
  );

  if (!blob) return file;

  const ext =
    outType === "image/webp"
      ? "webp"
      : outType === "image/jpeg"
      ? "jpg"
      : "png";

  const baseName = String(file.name || "upload").replace(/\.[^.]+$/, "");
  return new File([blob], `${baseName}.${ext}`, {
    type: outType,
    lastModified: Date.now(),
  });
}

function guessFolder(file) {
  const name = String(file?.name || "").toLowerCase();

  if (name.includes("logo")) return "capstone/common";
  if (name.includes("field") || name.includes("portfolio")) {
    return "capstone/fields";
  }
  if (name.includes("case")) return "capstone/cases";
  if (name.includes("org")) return "capstone/org";

  return "capstone/uploads";
}

async function uploadToCloudinary(file, folder = "capstone/uploads") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", folder);

  const res = await fetch(UPLOAD_URL, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudinary upload failed: ${text}`);
  }

  const data = await res.json();

  if (!data?.secure_url) {
    throw new Error("Cloudinary secure_url not returned");
  }

  return data.secure_url;
}

export async function uploadImage(file, opts = {}) {
  if (!file) throw new Error("No file");

  const compressed = await compressImage(file, opts);
  const folder = guessFolder(file);
  const url = await uploadToCloudinary(compressed, folder);

  return url;
}n