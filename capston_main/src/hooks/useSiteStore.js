// src/hooks/useSiteStore.js
import { useEffect, useMemo, useState } from "react";
import { loadData, saveData } from "../data/siteData";

const DEFAULT_DATA = {
  layout: {},
  media: {},
};

function normalizeData(raw) {
  const d = raw && typeof raw === "object" ? raw : {};
  return {
    ...DEFAULT_DATA,
    ...d,
    layout: { ...DEFAULT_DATA.layout, ...(d.layout || {}) },
    media: { ...DEFAULT_DATA.media, ...(d.media || {}) },
  };
}

function getSaveErrorMessage(e) {
  const msg = String(e?.message || e || "");
  if (
    e?.name === "QuotaExceededError" ||
    /quota/i.test(msg) ||
    /exceed/i.test(msg) ||
    /storage/i.test(msg)
  ) {
    return "localStorage 용량이 부족해서 저장에 실패했습니다. maxDim/quality를 낮추거나 데이터를 정리하세요.";
  }
  return "저장에 실패했습니다. 콘솔 로그를 확인하세요.";
}

function useSiteStoreImpl() {
  const [data, _setData] = useState(() => normalizeData(loadData()));
  const [saveError, setSaveError] = useState(null);

  const setData = useMemo(
    () => (updater) => {
      _setData((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        return normalizeData(next);
      });
    },
    []
  );

  useEffect(() => {
    try {
      saveData(data);
      setSaveError(null);
    } catch (e) {
      console.error("saveData failed:", e);
      setSaveError(getSaveErrorMessage(e));
    }
  }, [data]);

  return { data, setData, saveError };
}

// ✅ named export (기존 코드와 호환)
export function useSiteStore() {
  return useSiteStoreImpl();
}

// ✅ default export (import 꼬임 방지용)
export default function useSiteStoreDefault() {
  return useSiteStoreImpl();
}
