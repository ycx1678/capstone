// src/data/siteData.js
import defaultDataJson from "./defaultData.delivery.json";

export const STORAGE_KEY = "capstone_site_data_v4";

export const defaultData = defaultDataJson;

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
    if (!raw) return defaultData;

    const saved = JSON.parse(raw);
    const merged = deepMerge(defaultData, saved);

    const defaultNav = defaultData?.brand?.nav || [];
    const savedNav = saved?.brand?.nav || merged?.brand?.nav || [];
    merged.brand = merged.brand || {};
    merged.brand.nav = migrateNav(defaultNav, savedNav);

    return merged;
  } catch {
    return defaultData;
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}