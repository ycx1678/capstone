// src/hooks/useSiteStore.js
import { useCallback, useMemo, useState, useEffect } from "react";
import { defaultData } from "../data/siteData";
import { fetchRemoteContent, saveRemoteContent } from "../lib/contentApi";

const DEFAULT_DATA = {
  layout: {},
  media: {},
};

function normalizeData(raw) {
  const d = raw && typeof raw === "object" ? raw : {};
  return {
    ...DEFAULT_DATA,
    ...defaultData,
    ...d,
    layout: {
      ...DEFAULT_DATA.layout,
      ...(defaultData.layout || {}),
      ...(d.layout || {}),
    },
    media: {
      ...DEFAULT_DATA.media,
      ...(defaultData.media || {}),
      ...(d.media || {}),
    },
  };
}

function useSiteStoreImpl() {
  const [data, _setData] = useState(() => normalizeData(defaultData));
  const [saveError, setSaveError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;

    async function init() {
      try {
        const remote = await fetchRemoteContent();
        if (!alive) return;
        _setData(normalizeData(remote || defaultData));
        setSaveError(null);
      } catch (e) {
        console.error("fetchRemoteContent failed:", e);
        if (!alive) return;
        _setData(normalizeData(defaultData));
        setSaveError("원격 데이터를 불러오지 못해 기본 데이터로 표시 중입니다.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    init();

    return () => {
      alive = false;
    };
  }, []);

  const setData = useMemo(
    () => (updater) => {
      _setData((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        return normalizeData(next);
      });
    },
    []
  );

  const save = useCallback(async () => {
    setSaving(true);
    try {
      await saveRemoteContent(data);
      setSaveError(null);
      return { ok: true };
    } catch (e) {
      console.error("saveRemoteContent failed:", e);
      setSaveError("원격 저장에 실패했습니다.");
      return { ok: false, error: e };
    } finally {
      setSaving(false);
    }
  }, [data]);

  return {
    data,
    setData,
    save,
    saveError,
    loading,
    saving,
  };
}

export function useSiteStore() {
  return useSiteStoreImpl();
}

export default function useSiteStoreDefault() {
  return useSiteStoreImpl();
}