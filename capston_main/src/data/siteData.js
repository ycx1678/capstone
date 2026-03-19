// src/data/siteData.js
import defaultDataJson from "./defaultData.delivery.json";

export const STORAGE_KEY = "capstone_site_data_v5";
export const FIELDS_ROLLING_SLOTS = 22;
export const INTRO_BG_SLOTS = 3;

function createEmptyRollingPhoto() {
  return {
    src: "",
    label: "",
    alt: "",
  };
}

function normalizeIntroImages(list, count = INTRO_BG_SLOTS) {
  const safeList = Array.isArray(list) ? list : [];

  return Array.from({ length: count }, (_, idx) => {
    const item = safeList[idx];
    return typeof item === "string" ? item : "";
  });
}

export function normalizeRollingPhotos(list, count = FIELDS_ROLLING_SLOTS) {
  const safeList = Array.isArray(list) ? list : [];

  return Array.from({ length: count }, (_, idx) => {
    const item = safeList[idx] || {};
    return {
      ...createEmptyRollingPhoto(),
      ...(item && typeof item === "object" ? item : {}),
      src: typeof item?.src === "string" ? item.src : "",
      label: typeof item?.label === "string" ? item.label : "",
      alt: typeof item?.alt === "string" ? item.alt : "",
    };
  });
}

function normalizeFields(fields) {
  const safeFields = fields && typeof fields === "object" ? fields : {};
  return {
    ...safeFields,
    rollingPhotos: normalizeRollingPhotos(safeFields.rollingPhotos),
  };
}

function normalizeSectionBg(sectionBg) {
  const safeSectionBg =
    sectionBg && typeof sectionBg === "object" ? sectionBg : {};

  return {
    ...safeSectionBg,
    intro: normalizeIntroImages(safeSectionBg.intro),
    fields: typeof safeSectionBg.fields === "string" ? safeSectionBg.fields : "",
  };
}

function normalizeDataShape(data) {
  const safeData = data && typeof data === "object" ? data : {};

  return {
    ...safeData,
    fields: normalizeFields(safeData.fields),
    sectionBg: normalizeSectionBg(safeData.sectionBg),
  };
}

export const defaultData = normalizeDataShape(defaultDataJson);

export function deepMerge(base, patch) {
  if (Array.isArray(base)) return Array.isArray(patch) ? patch : base;
  if (typeof base !== "object" || base === null) return patch ?? base;

  const out = { ...base };
  for (const k of Object.keys(patch || {})) {
    out[k] = k in base ? deepMerge(base[k], patch[k]) : patch[k];
  }
  return out;
}

function migrateNav(defaultNav, savedNav) {
  const d = Array.isArray(defaultNav) ? defaultNav : [];
  const s = Array.isArray(savedNav) ? savedNav : [];

  const map = new Map(
    s.map((x) => [String(x?.id || "").replace(/^#/, ""), x])
  );

  return d
    .map((n) => {
      const id = String(n?.id || "").replace(/^#/, "");
      const old = map.get(id);
      return old ? { ...n, ...old, id } : { ...n, id };
    })
    .filter((x) => x && x.id);
}

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return normalizeDataShape(defaultData);
    }

    const saved = JSON.parse(raw);
    const merged = deepMerge(defaultData, saved);

    const defaultNav = defaultData?.brand?.nav || [];
    const savedNav = saved?.brand?.nav || merged?.brand?.nav || [];

    merged.brand = merged.brand || {};
    merged.brand.nav = migrateNav(defaultNav, savedNav);

    return normalizeDataShape(merged);
  } catch {
    return normalizeDataShape(defaultData);
  }
}

export function saveData(data) {
  const normalized = normalizeDataShape(data);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
}