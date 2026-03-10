import { getByPath, setByPath } from "./adminPath";

export const CASE_SLOTS = 8;

/* -------------------- Cases image format normalization (string[] 호환) -------------------- */
export function normalizeImages(images) {
  return (images || []).map((x) => {
    if (typeof x === "string") return { src: x, title: "", lines: [] };
    return {
      ...(x || {}),
      src: x?.src || "",
      title: x?.title || x?.name || "",
      lines: Array.isArray(x?.lines) ? x.lines : [],
    };
  });
}

export function ensureCaseSlots(images, n = CASE_SLOTS) {
  const norm = normalizeImages(images);
  return Array.from({ length: n }, (_, i) => {
    const it = norm[i] || {};
    return {
      ...it,
      src: it?.src || "",
      title: it?.title || "",
      lines: Array.isArray(it?.lines)
        ? it.lines.map((s) => String(s ?? ""))
        : [],
    };
  });
}

export function setBlockImages(next, blockIdx, newImages) {
  const path = `cases.blocks[${blockIdx}].images`;
  const cur = getByPath(next, path);
  const safe = Array.isArray(cur) ? cur : [];
  const isStringList = safe.length > 0 ? typeof safe[0] === "string" : false;

  if (isStringList) {
    // string[] 형태면 src만 저장(구형 호환)
    setByPath(
      next,
      path,
      newImages.map((x) => x.src)
    );
  } else {
    // object[] 형태면 src + title + lines 유지
    setByPath(
      next,
      path,
      newImages.map((x) => ({
        ...(x || {}),
        src: x?.src || "",
        title: x?.title || "",
        lines: Array.isArray(x?.lines) ? x.lines : [],
      }))
    );
  }
}
