// src/pages/admin_console/AdminConsolePage.js
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { loadData, STORAGE_KEY } from "../../data/siteData";

import ui from "./adminConsoleUI";
import useIsMobile from "./useIsMobile";

import AdminCard from "./AdminCard";
import AdminPreview from "./AdminPreview";
import AdminMobileGate from "./AdminMobileGate";
import AdminPinGate from "./AdminPinGate";
import AdminTabs from "./AdminTabs";

import {
  getExpectedPin,
  getSavedAuth,
  setSavedAuth,
  clearSavedAuth,
  getFailState,
  setFailState,
  clearFailState,
  nowMs,
} from "./adminAuth";

import { deepClone, clamp, reorder, getByPath, setByPath } from "./adminPath";
import {
  humanBytes,
  estimateDataUrlBytes,
  traverseAndSumDataUrls,
} from "./adminBytes";
import { uploadImage } from "./adminImage";
import { CASE_SLOTS, ensureCaseSlots, setBlockImages } from "./adminCases";

export default function AdminConsolePage({ data, setData, saveError }) {
  const isMobile = useIsMobile(860);
  const [forceOpen, setForceOpen] = useState(false);

  const [tab, setTab] = useState("cases");

  const expectedPin = useMemo(() => getExpectedPin(), []);
  const [authed, setAuthed] = useState(() => !!getSavedAuth());
  const [pin, setPin] = useState("");
  const [remember, setRemember] = useState(true);
  const [fail, setFail] = useState(() => getFailState());

  const failSafe = fail || { count: 0, lockUntil: 0 };
  const locked = Number(failSafe.lockUntil || 0) > nowMs();
  const lockRemainSec = locked
    ? Math.ceil((Number(failSafe.lockUntil) - nowMs()) / 1000)
    : 0;

  const [maxDim, setMaxDim] = useState(1600);
  const [quality, setQuality] = useState(0.8);
  const imageOpts = useMemo(() => ({ maxDim, quality }), [maxDim, quality]);

  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const dragRef = useRef({ type: null, from: null, blockIdx: null });

  const showToast = useCallback((msg, type = "info") => {
    setToast({ msg, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  useEffect(() => {
    return () => toastTimer.current && clearTimeout(toastTimer.current);
  }, []);

  useEffect(() => {
    if (!locked) return;
    const id = setInterval(() => setFail(getFailState()), 500);
    return () => clearInterval(id);
  }, [locked]);

  const goHome = useCallback(() => {
    window.location.hash = "#/";
  }, []);

  const onSubmitPin = useCallback(
    (e) => {
      e.preventDefault();
      if (locked) return;

      const input = String(pin || "").trim();
      if (input === expectedPin) {
        setAuthed(true);
        setPin("");
        clearFailState();
        setFail({ count: 0, lockUntil: 0 });
        if (remember) setSavedAuth(30);
        showToast("인증 완료", "ok");
        return;
      }

      const cur = getFailState();
      const nextCount = (cur.count ?? 0) + 1;
      let lockUntil = cur.lockUntil ?? 0;
      if (nextCount >= 5) lockUntil = nowMs() + 30 * 1000;

      const next = { count: nextCount, lockUntil };
      setFailState(next);
      setFail(next);
      showToast("PIN이 틀렸습니다.", "err");
    },
    [expectedPin, locked, pin, remember, showToast]
  );

  const logout = useCallback(() => {
    clearSavedAuth();
    setAuthed(false);
    setPin("");
    showToast("로그아웃", "ok");
  }, [showToast]);

  const mutate = useCallback(
    (fn) => {
      setData((prev) => {
        const next = deepClone(prev);
        fn(next);
        return next;
      });
    },
    [setData]
  );

  const updateByPath = useCallback(
    (path, value) => {
      mutate((next) => setByPath(next, path, value));
    },
    [mutate]
  );

  const reset = useCallback(() => {
    if (!window.confirm("정말 초기화할까요? (모든 이미지/데이터가 삭제됩니다)"))
      return;
    localStorage.removeItem(STORAGE_KEY);
    setData(loadData());
    showToast("초기화 완료", "ok");
  }, [setData, showToast]);

  const downloadBackup = useCallback(() => {
    try {
      const s = JSON.stringify(data || {}, null, 2);
      const blob = new Blob([s], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `capstone_admin_backup_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("백업 파일 다운로드 완료", "ok");
    } catch (e) {
      console.error(e);
      showToast("백업 실패", "err");
    }
  }, [data, showToast]);

  const importBackupFile = useCallback(
    async (file) => {
      if (!file) return;
      if (
        !window.confirm(
          "백업 파일을 불러오면 현재 데이터가 덮어씌워집니다. 진행할까요?"
        )
      )
        return;

      setBusy(true);
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);

        if (!parsed || typeof parsed !== "object") {
          throw new Error("Invalid JSON");
        }

        if (!parsed.org || !parsed.fields || !parsed.cases) {
          throw new Error("Backup shape mismatch");
        }

        setData(parsed);
        showToast("백업 불러오기 완료", "ok");
      } catch (e) {
        console.error(e);
        showToast(`불러오기 실패: ${e?.message || "unknown"}`, "err");
      } finally {
        setBusy(false);
      }
    },
    [setData, showToast]
  );

  const approxJsonSize = useMemo(() => {
    try {
      const s = JSON.stringify(data || {});
      return humanBytes(s.length * 2);
    } catch {
      return "-";
    }
  }, [data]);

  const approxImagesSize = useMemo(
    () => humanBytes(traverseAndSumDataUrls(data || {})),
    [data]
  );

  const uploadToPath = useCallback(
    async (path, file) => {
      if (!file) return;
      setBusy(true);
      try {
        const url = await uploadImage(file, imageOpts);
        updateByPath(path, url);
        showToast("업로드 완료", "ok");
      } catch (e) {
        console.error(e);
        showToast(`업로드 실패: ${e?.message || "unknown"}`, "err");
      } finally {
        setBusy(false);
      }
    },
    [imageOpts, showToast, updateByPath]
  );

  const clearPath = useCallback(
    (path) => {
      if (!window.confirm("삭제할까요?")) return;
      updateByPath(path, "");
      showToast("삭제 완료", "ok");
    },
    [showToast, updateByPath]
  );

  const rollingPhotos = (data?.fields?.rollingPhotos || []).map((p) => ({
    ...p,
    label: p?.label || "",
    src: p?.src || "",
  }));

  const casesBlocks = (data?.cases?.blocks || []).map((b) => ({
    ...b,
    images: Array.isArray(b?.images) ? b.images : [],
  }));

  const navItems = Array.isArray(data?.brand?.nav) ? data.brand.nav : [];

  const addCaseBlock = useCallback(() => {
    mutate((next) => {
      const blocks = Array.isArray(next?.cases?.blocks)
        ? next.cases.blocks
        : [];
      const base =
        blocks[0] != null
          ? deepClone(blocks[0])
          : { eyebrow: "CASES", title: "New Block", subtitle: "", images: [] };

      base.images = [];
      base.eyebrow = base.eyebrow || "CASES";
      if (typeof base.title === "string")
        base.title = `New Block ${blocks.length + 1}`;
      if (typeof base.subtitle !== "string") base.subtitle = "";

      if (!next.cases) next.cases = {};
      next.cases.blocks = [...blocks, base];
    });
    showToast("블록 추가 완료", "ok");
  }, [mutate, showToast]);

  const removeCaseBlock = useCallback(
    (blockIdx) => {
      if (casesBlocks.length <= 1) {
        showToast("마지막 블록은 삭제할 수 없습니다.", "err");
        return;
      }
      if (!window.confirm("이 블록을 삭제할까요?")) return;

      mutate((next) => {
        const blocks = Array.isArray(next?.cases?.blocks)
          ? next.cases.blocks
          : [];
        const copy = blocks.slice();
        copy.splice(blockIdx, 1);
        if (!next.cases) next.cases = {};
        next.cases.blocks = copy;
      });
      showToast("블록 삭제 완료", "ok");
    },
    [casesBlocks.length, mutate, showToast]
  );

  const moveCaseBlock = useCallback(
    (from, to) => {
      mutate((next) => {
        const blocks = Array.isArray(next?.cases?.blocks)
          ? next.cases.blocks
          : [];
        if (!blocks.length) return;
        if (!next.cases) next.cases = {};
        next.cases.blocks = reorder(blocks, from, to);
      });
    },
    [mutate]
  );

  const setCaseSlot = useCallback(
    (blockIdx, slotIdx, patch) => {
      mutate((next) => {
        const path = `cases.blocks[${blockIdx}].images`;
        const cur = getByPath(next, path);
        const safe = Array.isArray(cur) ? cur : [];
        const slots = ensureCaseSlots(safe, CASE_SLOTS);

        const prev = slots[slotIdx] || { src: "", title: "", lines: [] };
        const nextItem = {
          ...prev,
          ...patch,
          src: patch?.src !== undefined ? patch.src : prev.src,
          title: patch?.title !== undefined ? patch.title : prev.title,
          lines: patch?.lines !== undefined ? patch.lines : prev.lines,
        };

        slots[slotIdx] = nextItem;
        setBlockImages(next, blockIdx, slots);
      });
    },
    [mutate]
  );

  const uploadCaseSlotImage = useCallback(
    async (blockIdx, slotIdx, file) => {
      if (!file) return;
      setBusy(true);
      try {
        const url = await uploadImage(file, imageOpts);
        setCaseSlot(blockIdx, slotIdx, { src: url });
        showToast("업로드 완료", "ok");
      } catch (e) {
        console.error(e);
        showToast(`업로드 실패: ${e?.message || "unknown"}`, "err");
      } finally {
        setBusy(false);
      }
    },
    [imageOpts, setCaseSlot, showToast]
  );

  const clearCaseSlotImage = useCallback(
    (blockIdx, slotIdx) => {
      if (!window.confirm("삭제할까요?")) return;
      setCaseSlot(blockIdx, slotIdx, { src: "" });
      showToast("삭제 완료", "ok");
    },
    [setCaseSlot, showToast]
  );

  const moveCaseSlot = useCallback(
    (blockIdx, from, to) => {
      mutate((next) => {
        const path = `cases.blocks[${blockIdx}].images`;
        const cur = getByPath(next, path);
        const safe = Array.isArray(cur) ? cur : [];
        const slots = ensureCaseSlots(safe, CASE_SLOTS);
        setBlockImages(next, blockIdx, reorder(slots, from, to));
      });
    },
    [mutate]
  );

  const onDragStartBlock = (idx) => (e) => {
    dragRef.current = { type: "block", from: idx, blockIdx: null };
    try {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", `block:${idx}`);
    } catch {}
  };

  const onDropBlock = (toIdx) => (e) => {
    e.preventDefault();
    const { type, from } = dragRef.current || {};
    if (type !== "block" || from == null) return;
    if (from === toIdx) return;
    moveCaseBlock(from, toIdx);
    showToast("블록 순서 변경", "ok");
    dragRef.current = { type: null, from: null, blockIdx: null };
  };

  const onDragStartSlot = (blockIdx, slotIdx) => (e) => {
    dragRef.current = { type: "slot", from: slotIdx, blockIdx };
    try {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", `slot:${blockIdx}:${slotIdx}`);
    } catch {}
  };

  const onDropSlot = (blockIdx, toIdx) => (e) => {
    e.preventDefault();
    const st = dragRef.current || {};
    if (st.type !== "slot" || st.blockIdx !== blockIdx || st.from == null)
      return;
    if (st.from === toIdx) return;
    moveCaseSlot(blockIdx, st.from, toIdx);
    showToast("이미지 순서 변경", "ok");
    dragRef.current = { type: null, from: null, blockIdx: null };
  };

  const showMobileGate = authed && isMobile && !forceOpen;

  const padX = "clamp(16px, 4vw, 40px)";
  const container = useMemo(() => ({ maxWidth: 1140, margin: "0 auto" }), []);

  return (
    <div style={{ ...ui.page, padding: 0 }}>
      <style>{`
        * { box-sizing: border-box; }
        html, body { margin:0; padding:0; background:#0b0d12; }
        body { overflow-x: auto; }
      `}</style>

      {!authed ? (
        <div style={{ padding: `22px ${padX} 40px` }}>
          <AdminPinGate
            ui={ui}
            pin={pin}
            setPin={setPin}
            remember={remember}
            setRemember={setRemember}
            locked={locked}
            lockRemainSec={lockRemainSec}
            failCount={Number(failSafe.count) || 0}
            onSubmit={onSubmitPin}
            onGoHome={goHome}
          />
        </div>
      ) : (
        <>
          {showMobileGate ? (
            <AdminMobileGate ui={ui} onForceOpen={() => setForceOpen(true)} />
          ) : (
            <div style={{ padding: `22px ${padX} 40px` }}>
              <div style={container}>
                <div style={ui.topbar}>
                  <div style={{ minWidth: 0 }}>
                    <div style={ui.h1}>Capstone Admin</div>
                    <div style={ui.hint}>
                      이미지/문구 편집 ·{" "}
                      <span style={ui.monoInline}>#/admin</span>
                      <br />
                      저장(대략): JSON <b>{approxJsonSize}</b> / Images{" "}
                      <b>{approxImagesSize}</b>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={logout}
                      style={{ ...ui.btn, ...ui.btnGhost }}
                    >
                      로그아웃
                    </button>

                    <label
                      style={{
                        ...ui.btn,
                        ...ui.btnGhost,
                        cursor: busy ? "not-allowed" : "pointer",
                      }}
                      title="백업 JSON 불러오기"
                    >
                      백업 불러오기
                      <input
                        type="file"
                        accept="application/json"
                        style={{ display: "none" }}
                        disabled={busy}
                        onChange={(e) => {
                          const f = e.target.files?.[0] || null;
                          e.target.value = "";
                          importBackupFile(f);
                        }}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={downloadBackup}
                      style={{ ...ui.btn, ...ui.btnGhost }}
                      disabled={busy}
                    >
                      백업 다운로드
                    </button>

                    <a
                      href="#/"
                      style={{
                        ...ui.btn,
                        ...ui.btnGhost,
                        textDecoration: "none",
                      }}
                    >
                      사이트로
                    </a>

                    <button
                      type="button"
                      onClick={reset}
                      style={{ ...ui.btn, ...ui.btnDanger }}
                    >
                      데이터 초기화
                    </button>
                  </div>
                </div>

                <AdminTabs ui={ui} tab={tab} setTab={setTab} />

                {saveError ? (
                  <div
                    style={{
                      ...ui.toast,
                      borderColor: "rgba(255,96,128,0.45)",
                    }}
                  >
                    {saveError}
                    <div
                      style={{
                        marginTop: 8,
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        type="button"
                        style={{ ...ui.btn, ...ui.btnGhost }}
                        onClick={() => {
                          setMaxDim(1400);
                          setQuality(0.75);
                          showToast("압축 설정(1400 / 0.75) 적용", "ok");
                        }}
                      >
                        1400 / 0.75
                      </button>
                      <button
                        type="button"
                        style={{ ...ui.btn, ...ui.btnGhost }}
                        onClick={() => {
                          setMaxDim(1200);
                          setQuality(0.68);
                          showToast("압축 설정(1200 / 0.68) 적용", "ok");
                        }}
                      >
                        1200 / 0.68
                      </button>
                    </div>
                  </div>
                ) : null}

                {toast ? (
                  <div
                    style={{
                      ...ui.toast,
                      borderColor:
                        toast.type === "ok"
                          ? "rgba(64, 230, 160, 0.35)"
                          : toast.type === "err"
                          ? "rgba(255, 96, 128, 0.35)"
                          : "rgba(255,255,255,0.14)",
                    }}
                  >
                    {toast.msg}
                  </div>
                ) : null}

                <AdminCard
                  ui={ui}
                  title="업로드 압축 옵션"
                  sub="용량 초과 시 maxDim/quality를 낮추세요."
                >
                  <div style={ui.formGrid3}>
                    <div style={{ display: "grid", gap: 8 }}>
                      <div style={ui.fieldLabel}>maxDim</div>
                      <input
                        type="number"
                        min={800}
                        max={2400}
                        step={50}
                        value={maxDim}
                        onChange={(e) => setMaxDim(Number(e.target.value))}
                        style={ui.input}
                      />
                    </div>

                    <div style={{ display: "grid", gap: 8 }}>
                      <div style={ui.fieldLabel}>quality</div>
                      <input
                        type="number"
                        min={0.3}
                        max={0.95}
                        step={0.01}
                        value={quality}
                        onChange={(e) => setQuality(Number(e.target.value))}
                        style={ui.input}
                      />
                    </div>

                    <div style={{ display: "grid", gap: 8 }}>
                      <div style={ui.fieldLabel}>프리셋</div>
                      <div
                        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                      >
                        <button
                          type="button"
                          style={{ ...ui.btn, ...ui.btnGhost }}
                          onClick={() => {
                            setMaxDim(1600);
                            setQuality(0.82);
                            showToast("권장(1600 / 0.82) 적용", "ok");
                          }}
                        >
                          권장
                        </button>
                        <button
                          type="button"
                          style={{ ...ui.btn, ...ui.btnGhost }}
                          onClick={() => {
                            setMaxDim(1400);
                            setQuality(0.75);
                            showToast("가벼움(1400 / 0.75) 적용", "ok");
                          }}
                        >
                          가벼움
                        </button>
                        <button
                          type="button"
                          style={{ ...ui.btn, ...ui.btnGhost }}
                          onClick={() => {
                            setMaxDim(1200);
                            setQuality(0.68);
                            showToast("초가벼움(1200 / 0.68) 적용", "ok");
                          }}
                        >
                          초가벼움
                        </button>
                      </div>
                      <div style={ui.sizeHint}>
                        케이스 이미지가 많으면 localStorage 한계가 빨리 옵니다.
                        <br />
                        <b>큰 이미지부터</b> 줄이세요.
                      </div>
                    </div>
                  </div>
                </AdminCard>

                {tab === "org" ? (
                  <>
                    <AdminCard
                      ui={ui}
                      title="헤더 메뉴 / 공통 라벨"
                      sub="클라이언트 요청사항에 맞는 메뉴 텍스트를 수정합니다."
                    >
                      <div
                        style={{
                          display: "grid",
                          gap: 14,
                          minWidth: 0,
                          overflowX: "auto",
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: isMobile
                              ? "minmax(0, 1fr)"
                              : "repeat(2, minmax(0, 1fr))",
                            gap: 12,
                          }}
                        >
                          {navItems.map((item, idx) => {
                            const path = `brand.nav[${idx}].label`;
                            return (
                              <div
                                key={idx}
                                style={{ display: "grid", gap: 6, minWidth: 0 }}
                              >
                                <div
                                  style={{
                                    ...ui.monoLine,
                                    whiteSpace: "normal",
                                    overflowWrap: "anywhere",
                                  }}
                                >
                                  {path}
                                </div>
                                <input
                                  value={item?.label ?? ""}
                                  onChange={(e) =>
                                    updateByPath(path, e.target.value)
                                  }
                                  style={{ ...ui.input, width: "100%" }}
                                  placeholder={
                                    idx === 0
                                      ? "About Us"
                                      : idx === 1
                                      ? "Value&Work"
                                      : idx === 2
                                      ? "Portfolio"
                                      : idx === 3
                                      ? "Cases"
                                      : "Contact"
                                  }
                                />
                              </div>
                            );
                          })}
                        </div>

                        <div
                          style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
                        >
                          <button
                            type="button"
                            style={{ ...ui.btn, ...ui.btnGhost }}
                            onClick={() => {
                              mutate((next) => {
                                if (!next.brand) next.brand = {};
                                if (!Array.isArray(next.brand.nav)) {
                                  next.brand.nav = [];
                                }
                                const base = [
                                  { id: "org", label: "About Us" },
                                  { id: "valuesWork", label: "Value&Work" },
                                  { id: "fields", label: "Portfolio" },
                                  { id: "cases", label: "Cases" },
                                  { id: "contact", label: "Contact" },
                                ];
                                next.brand.nav = base;
                              });
                              showToast("헤더 메뉴 기본값 적용", "ok");
                            }}
                            disabled={busy}
                          >
                            헤더 메뉴 기본값 적용
                          </button>
                        </div>
                      </div>
                    </AdminCard>

                    <AdminCard
                      ui={ui}
                      title="조직도 (코드 기반)"
                      sub="org.title / subtitle / sectionLabel / showSectionLabel / ceo / offices / divisions"
                    >
                      <div
                        style={{
                          display: "grid",
                          gap: 16,
                          minWidth: 0,
                          overflowX: "auto",
                        }}
                      >
                        <div style={ui.blockShell}>
                          <div style={ui.fieldLabel}>섹션 제목</div>
                          <div style={ui.monoLine}>org.title</div>
                          <input
                            value={data?.org?.title ?? ""}
                            onChange={(e) =>
                              updateByPath("org.title", e.target.value)
                            }
                            style={{ ...ui.input, width: "100%" }}
                            placeholder="조직도 및 인원 현황"
                          />

                          <div style={{ ...ui.fieldLabel, marginTop: 12 }}>
                            섹션 설명
                          </div>
                          <div style={ui.monoLine}>org.subtitle</div>
                          <textarea
                            value={data?.org?.subtitle ?? ""}
                            onChange={(e) =>
                              updateByPath("org.subtitle", e.target.value)
                            }
                            style={{ ...ui.textarea, width: "100%" }}
                            placeholder="실무 경력자들의 경험과 노하우를 보유한 전문가 집단"
                          />

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: isMobile
                                ? "1fr"
                                : "1fr 1fr",
                              gap: 12,
                              marginTop: 12,
                            }}
                          >
                            <div style={{ display: "grid", gap: 6 }}>
                              <div style={ui.fieldLabel}>상단 라벨 문구</div>
                              <div style={ui.monoLine}>org.sectionLabel</div>
                              <input
                                value={data?.org?.sectionLabel ?? ""}
                                onChange={(e) =>
                                  updateByPath("org.sectionLabel", e.target.value)
                                }
                                style={ui.input}
                                placeholder="ABOUT US"
                              />
                            </div>

                            <div style={{ display: "grid", gap: 8 }}>
                              <div style={ui.fieldLabel}>상단 라벨 표시 여부</div>
                              <label
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 8,
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={data?.org?.showSectionLabel !== false}
                                  onChange={(e) =>
                                    updateByPath(
                                      "org.showSectionLabel",
                                      e.target.checked
                                    )
                                  }
                                />
                                <span style={ui.sizeHint}>
                                  체크 시 ABOUT US 라벨 표시
                                </span>
                              </label>
                            </div>
                          </div>
                        </div>

                        <div style={ui.blockShell}>
                          <div style={ui.fieldLabel}>대표 (CEO)</div>
                          <div style={ui.monoLine}>org.ceo.title</div>
                          <input
                            value={data?.org?.ceo?.title ?? ""}
                            onChange={(e) =>
                              updateByPath("org.ceo.title", e.target.value)
                            }
                            style={{ ...ui.input, width: "100%" }}
                            placeholder="대표이사"
                          />
                        </div>

                        <div style={ui.blockShell}>
                          <div style={ui.fieldLabel}>실 (2개)</div>
                          <div style={ui.sizeHint}>전략기획실 / 경영지원실</div>

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: isMobile
                                ? "minmax(0, 1fr)"
                                : "repeat(2, minmax(0, 1fr))",
                              gap: 10,
                              marginTop: 10,
                            }}
                          >
                            {Array.from({ length: 2 }).map((_, idx) => {
                              const path = `org.offices[${idx}].title`;
                              const v = data?.org?.offices?.[idx]?.title ?? "";
                              return (
                                <div
                                  key={idx}
                                  style={{ display: "grid", gap: 6, minWidth: 0 }}
                                >
                                  <div
                                    style={{
                                      ...ui.monoLine,
                                      whiteSpace: "normal",
                                      overflowWrap: "anywhere",
                                    }}
                                  >
                                    {path}
                                  </div>
                                  <input
                                    value={v}
                                    onChange={(e) =>
                                      updateByPath(path, e.target.value)
                                    }
                                    style={{ ...ui.input, width: "100%" }}
                                    placeholder={
                                      idx === 0 ? "전략기획실" : "경영지원실"
                                    }
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div style={ui.blockShell}>
                          <div style={ui.fieldLabel}>본부 (4개)</div>
                          <div style={ui.sizeHint}>
                            기획 / 디자인 / 온라인 / 영상제작
                          </div>

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: isMobile
                                ? "minmax(0, 1fr)"
                                : "repeat(2, minmax(0, 1fr))",
                              gap: 10,
                              marginTop: 10,
                            }}
                          >
                            {Array.from({ length: 4 }).map((_, idx) => {
                              const titlePath = `org.divisions[${idx}].title`;
                              const v =
                                data?.org?.divisions?.[idx]?.title ?? "";
                              return (
                                <div
                                  key={idx}
                                  style={{ display: "grid", gap: 6, minWidth: 0 }}
                                >
                                  <div
                                    style={{
                                      ...ui.monoLine,
                                      whiteSpace: "normal",
                                      overflowWrap: "anywhere",
                                    }}
                                  >
                                    {titlePath}
                                  </div>
                                  <input
                                    value={v}
                                    onChange={(e) =>
                                      updateByPath(titlePath, e.target.value)
                                    }
                                    style={{ ...ui.input, width: "100%" }}
                                    placeholder={
                                      [
                                        "기획 본부",
                                        "디자인 본부",
                                        "온라인 본부",
                                        "영상제작 본부",
                                      ][idx]
                                    }
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div
                          style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
                        >
                          <button
                            type="button"
                            style={{ ...ui.btn, ...ui.btnGhost }}
                            onClick={() => {
                              mutate((next) => {
                                if (!next.org) next.org = {};
                                next.org.sectionLabel =
                                  next.org.sectionLabel || "ABOUT US";
                                next.org.showSectionLabel = false;

                                if (!next.org.ceo)
                                  next.org.ceo = { title: "대표이사" };

                                if (
                                  !Array.isArray(next.org.offices) ||
                                  next.org.offices.length < 2
                                ) {
                                  next.org.offices = [
                                    { title: "전략기획실" },
                                    { title: "경영지원실" },
                                  ];
                                }

                                if (
                                  !Array.isArray(next.org.divisions) ||
                                  next.org.divisions.length < 4
                                ) {
                                  next.org.divisions = [
                                    {
                                      title: "기획 본부",
                                      teams: ["1 TEAM", "2 TEAM", "3 TEAM"],
                                    },
                                    {
                                      title: "디자인 본부",
                                      teams: ["1 TEAM", "2 TEAM"],
                                    },
                                    {
                                      title: "온라인 본부",
                                      teams: ["1 TEAM", "2 TEAM"],
                                    },
                                    { title: "영상제작 본부", teams: ["1 TEAM"] },
                                  ];
                                }
                              });
                              showToast("조직도 기본 골격 생성", "ok");
                            }}
                            disabled={busy}
                          >
                            org 기본 골격 생성
                          </button>
                        </div>
                      </div>
                    </AdminCard>

                    <AdminCard
                      ui={ui}
                      title="Contact 텍스트"
                      sub="ContactSection의 회사 정보와 문의 문구를 수정합니다."
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: isMobile
                            ? "1fr"
                            : "repeat(2, minmax(0, 1fr))",
                          gap: 12,
                        }}
                      >
                        <div style={{ display: "grid", gap: 6 }}>
                          <div style={ui.fieldLabel}>Contact 제목</div>
                          <div style={ui.monoLine}>contact.title</div>
                          <input
                            value={data?.contact?.title ?? ""}
                            onChange={(e) =>
                              updateByPath("contact.title", e.target.value)
                            }
                            style={ui.input}
                            placeholder="CONTACT"
                          />
                        </div>

                        <div style={{ display: "grid", gap: 6 }}>
                          <div style={ui.fieldLabel}>회사명</div>
                          <div style={ui.monoLine}>contact.companyName</div>
                          <input
                            value={data?.contact?.companyName ?? ""}
                            onChange={(e) =>
                              updateByPath("contact.companyName", e.target.value)
                            }
                            style={ui.input}
                            placeholder="주식회사 캡스톤그룹"
                          />
                        </div>

                        <div
                          style={{
                            display: "grid",
                            gap: 6,
                            gridColumn: isMobile ? "auto" : "1 / -1",
                          }}
                        >
                          <div style={ui.fieldLabel}>설명 문구</div>
                          <div style={ui.monoLine}>contact.desc</div>
                          <textarea
                            value={data?.contact?.desc ?? ""}
                            onChange={(e) =>
                              updateByPath("contact.desc", e.target.value)
                            }
                            style={ui.textarea}
                            placeholder="여러분과 언제든 함께할 수 있도록..."
                          />
                        </div>

                        <div
                          style={{
                            display: "grid",
                            gap: 6,
                            gridColumn: isMobile ? "auto" : "1 / -1",
                          }}
                        >
                          <div style={ui.fieldLabel}>주소</div>
                          <div style={ui.monoLine}>contact.address</div>
                          <input
                            value={data?.contact?.address ?? ""}
                            onChange={(e) =>
                              updateByPath("contact.address", e.target.value)
                            }
                            style={ui.input}
                            placeholder="서울특별시 서대문구 신촌로 25, 2층(창천동, 상록빌딩)"
                          />
                        </div>

                        <div style={{ display: "grid", gap: 6 }}>
                          <div style={ui.fieldLabel}>전화번호</div>
                          <div style={ui.monoLine}>contact.tel</div>
                          <input
                            value={data?.contact?.tel ?? ""}
                            onChange={(e) =>
                              updateByPath("contact.tel", e.target.value)
                            }
                            style={ui.input}
                            placeholder="02-6010-8500"
                          />
                        </div>

                        <div style={{ display: "grid", gap: 6 }}>
                          <div style={ui.fieldLabel}>이메일</div>
                          <div style={ui.monoLine}>contact.email</div>
                          <input
                            value={data?.contact?.email ?? ""}
                            onChange={(e) =>
                              updateByPath("contact.email", e.target.value)
                            }
                            style={ui.input}
                            placeholder="info@capstone-pco.com"
                          />
                        </div>

                        <div style={{ display: "grid", gap: 6 }}>
                          <div style={ui.fieldLabel}>폼 제목</div>
                          <div style={ui.monoLine}>contactForm.title</div>
                          <input
                            value={data?.contactForm?.title ?? ""}
                            onChange={(e) =>
                              updateByPath("contactForm.title", e.target.value)
                            }
                            style={ui.input}
                            placeholder="Send a Message"
                          />
                        </div>

                        {[
                          ["name", "성명"],
                          ["org", "소속"],
                          ["phone", "핸드폰번호"],
                          ["email", "이메일주소"],
                          ["inquiry", "문의사항"],
                          ["submit", "전송"],
                        ].map(([key, ph]) => (
                          <div key={key} style={{ display: "grid", gap: 6 }}>
                            <div style={ui.fieldLabel}>폼 라벨 - {key}</div>
                            <div style={ui.monoLine}>
                              {`contactForm.fields.${key}`}
                            </div>
                            <input
                              value={data?.contactForm?.fields?.[key] ?? ""}
                              onChange={(e) =>
                                updateByPath(
                                  `contactForm.fields.${key}`,
                                  e.target.value
                                )
                              }
                              style={ui.input}
                              placeholder={ph}
                            />
                          </div>
                        ))}
                      </div>
                    </AdminCard>
                  </>
                ) : null}

                {tab === "fields" ? (
                  <>
                    <AdminCard
                      ui={ui}
                      title="Portfolio 섹션 텍스트"
                      sub="FieldsSection에서 표시되는 PORTFOLIO 라벨과 설명 문구"
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: isMobile
                            ? "1fr"
                            : "repeat(2, minmax(0, 1fr))",
                          gap: 12,
                        }}
                      >
                        <div style={{ display: "grid", gap: 6 }}>
                          <div style={ui.fieldLabel}>상단 라벨</div>
                          <div style={ui.monoLine}>fields.tagTitle</div>
                          <input
                            value={data?.fields?.tagTitle ?? ""}
                            onChange={(e) =>
                              updateByPath("fields.tagTitle", e.target.value)
                            }
                            style={ui.input}
                            placeholder="Portfolio"
                          />
                        </div>

                        <div style={{ display: "grid", gap: 6 }}>
                          <div style={ui.fieldLabel}>상단 강조 라벨</div>
                          <div style={ui.monoLine}>fields.displayTitle</div>
                          <input
                            value={data?.fields?.displayTitle ?? ""}
                            onChange={(e) =>
                              updateByPath("fields.displayTitle", e.target.value)
                            }
                            style={ui.input}
                            placeholder="PORTFOLIO"
                          />
                        </div>

                        <div style={{ display: "grid", gap: 6 }}>
                          <div style={ui.fieldLabel}>하단 강조 라벨</div>
                          <div style={ui.monoLine}>
                            fields.displayBottomLabel
                          </div>
                          <input
                            value={data?.fields?.displayBottomLabel ?? ""}
                            onChange={(e) =>
                              updateByPath(
                                "fields.displayBottomLabel",
                                e.target.value
                              )
                            }
                            style={ui.input}
                            placeholder="PORTFOLIO"
                          />
                        </div>

                        <div style={{ display: "grid", gap: 6 }}>
                          <div style={ui.fieldLabel}>섹션 제목</div>
                          <div style={ui.monoLine}>fields.title</div>
                          <input
                            value={data?.fields?.title ?? ""}
                            onChange={(e) =>
                              updateByPath("fields.title", e.target.value)
                            }
                            style={ui.input}
                            placeholder="주요 사업분야"
                          />
                        </div>

                        <div
                          style={{
                            display: "grid",
                            gap: 6,
                            gridColumn: isMobile ? "auto" : "1 / -1",
                          }}
                        >
                          <div style={ui.fieldLabel}>섹션 설명</div>
                          <div style={ui.monoLine}>fields.subtitle</div>
                          <textarea
                            value={data?.fields?.subtitle ?? ""}
                            onChange={(e) =>
                              updateByPath("fields.subtitle", e.target.value)
                            }
                            style={ui.textarea}
                            placeholder="정부, 공공기관, 학술단체 및 민간기업 등이 개최하는 국내/외 행사"
                          />
                        </div>

                        <div
                          style={{
                            display: "grid",
                            gap: 8,
                            gridColumn: isMobile ? "auto" : "1 / -1",
                          }}
                        >
                          <div style={ui.fieldLabel}>요약 라인</div>
                          {Array.from({ length: 4 }).map((_, idx) => (
                            <div key={idx} style={{ display: "grid", gap: 6 }}>
                              <div style={ui.monoLine}>
                                {`fields.summaryLines[${idx}]`}
                              </div>
                              <input
                                value={data?.fields?.summaryLines?.[idx] ?? ""}
                                onChange={(e) =>
                                  updateByPath(
                                    `fields.summaryLines[${idx}]`,
                                    e.target.value
                                  )
                                }
                                style={ui.input}
                                placeholder={`요약 문구 ${idx + 1}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </AdminCard>

                    <AdminCard
                      ui={ui}
                      title="사업분야 롤링 이미지"
                      sub="fields.rollingPhotos[].src / label 수정 가능"
                    >
                      <div style={ui.grid}>
                        {rollingPhotos.map((p, idx) => {
                          const srcPath = `fields.rollingPhotos[${idx}].src`;
                          const labelPath = `fields.rollingPhotos[${idx}].label`;
                          const bytes = p.src ? estimateDataUrlBytes(p.src) : 0;

                          return (
                            <div key={idx} style={ui.gridItem}>
                              <div style={ui.gridHeader}>
                                <div style={{ minWidth: 0 }}>
                                  <div style={ui.gridTitle}>
                                    {p.label || `Rolling #${idx + 1}`}
                                  </div>

                                  <div style={ui.monoLine}>{srcPath}</div>

                                  {bytes ? (
                                    <div style={ui.sizeHint}>
                                      Stored: {humanBytes(bytes)}
                                    </div>
                                  ) : null}
                                </div>
                              </div>

                              <AdminPreview ui={ui} src={p.src} />

                              <div style={{ marginTop: 10 }}>
                                <div style={ui.fieldLabel}>제목(label)</div>

                                <input
                                  value={p.label || ""}
                                  onChange={(e) =>
                                    updateByPath(labelPath, e.target.value)
                                  }
                                  style={ui.input}
                                  placeholder="예: 국제회의 / Exhibition / Conference"
                                />
                              </div>

                              <div
                                style={{
                                  display: "flex",
                                  gap: 10,
                                  flexWrap: "wrap",
                                  marginTop: 10,
                                }}
                              >
                                <label
                                  style={{
                                    ...ui.btn,
                                    ...ui.btnPrimary,
                                    cursor: busy ? "not-allowed" : "pointer",
                                  }}
                                >
                                  업로드
                                  <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: "none" }}
                                    disabled={busy}
                                    onChange={(e) => {
                                      const f = e.target.files?.[0] || null;
                                      e.target.value = "";
                                      uploadToPath(srcPath, f);
                                    }}
                                  />
                                </label>

                                <button
                                  type="button"
                                  style={{ ...ui.btn, ...ui.btnDanger }}
                                  onClick={() => clearPath(srcPath)}
                                  disabled={busy || !p.src}
                                >
                                  삭제
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </AdminCard>
                  </>
                ) : null}

                {tab === "cases" ? (
                  <>
                    <AdminCard
                      ui={ui}
                      title="Cases 공통 라벨"
                      sub="섹션 공통 CASES 라벨과 각 블록 eyebrow를 관리합니다."
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: isMobile
                            ? "1fr"
                            : "repeat(2, minmax(0, 1fr))",
                          gap: 12,
                        }}
                      >
                        <div style={{ display: "grid", gap: 6 }}>
                          <div style={ui.fieldLabel}>섹션 공통 라벨</div>
                          <div style={ui.monoLine}>cases.sectionLabel</div>
                          <input
                            value={data?.cases?.sectionLabel ?? ""}
                            onChange={(e) =>
                              updateByPath("cases.sectionLabel", e.target.value)
                            }
                            style={ui.input}
                            placeholder="CASES"
                          />
                        </div>
                      </div>
                    </AdminCard>

                    <div style={{ marginTop: 16 }}>
                      <div style={ui.sectionTitle}>Cases 이미지 + 문구</div>
                      <div style={ui.sectionHint}>
                        PC: 카드의 <b>⠿</b>을 드래그해서 순서 변경 가능 · 각
                        카드에서 타이틀/라인 편집 가능
                      </div>
                      <div
                        style={{
                          marginTop: 10,
                          display: "flex",
                          gap: 10,
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          type="button"
                          style={{ ...ui.btn, ...ui.btnPrimary }}
                          onClick={addCaseBlock}
                          disabled={busy}
                        >
                          블록 추가
                        </button>
                      </div>
                    </div>

                    <div style={{ display: "grid", gap: 14, marginTop: 12 }}>
                      {casesBlocks.map((block, bIdx) => {
                        const slots = ensureCaseSlots(block.images, CASE_SLOTS);

                        return (
                          <div
                            key={`case-block-${bIdx}`}
                            style={ui.blockShell}
                            draggable
                            onDragStart={onDragStartBlock(bIdx)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={onDropBlock(bIdx)}
                          >
                            <div style={ui.blockHead}>
                              <div style={{ minWidth: 0 }}>
                                <div style={ui.blockTitleRow}>
                                  <span
                                    style={ui.dragHandle}
                                    title="드래그로 블록 순서 변경"
                                  >
                                    ⠿
                                  </span>
                                  <div style={{ fontWeight: 950 }}>
                                    Block #{bIdx + 1}
                                  </div>
                                  <span style={{ ...ui.badge, marginLeft: 10 }}>
                                    slots: {CASE_SLOTS}
                                  </span>
                                </div>
                                <div
                                  style={ui.monoLine}
                                >{`cases.blocks[${bIdx}]`}</div>
                              </div>

                              <div
                                style={{
                                  display: "flex",
                                  gap: 8,
                                  flexWrap: "wrap",
                                }}
                              >
                                <button
                                  type="button"
                                  style={{
                                    ...ui.btn,
                                    ...ui.btnGhost,
                                    padding: "8px 10px",
                                  }}
                                  onClick={() =>
                                    moveCaseBlock(
                                      bIdx,
                                      clamp(bIdx - 1, 0, casesBlocks.length - 1)
                                    )
                                  }
                                  disabled={busy || bIdx === 0}
                                  title="위로"
                                >
                                  ▲
                                </button>
                                <button
                                  type="button"
                                  style={{
                                    ...ui.btn,
                                    ...ui.btnGhost,
                                    padding: "8px 10px",
                                  }}
                                  onClick={() =>
                                    moveCaseBlock(
                                      bIdx,
                                      clamp(bIdx + 1, 0, casesBlocks.length - 1)
                                    )
                                  }
                                  disabled={
                                    busy || bIdx === casesBlocks.length - 1
                                  }
                                  title="아래로"
                                >
                                  ▼
                                </button>

                                <button
                                  type="button"
                                  style={{ ...ui.btn, ...ui.btnDanger }}
                                  onClick={() => removeCaseBlock(bIdx)}
                                  disabled={busy || casesBlocks.length <= 1}
                                  title={
                                    casesBlocks.length <= 1
                                      ? "마지막 블록은 삭제 불가"
                                      : "블록 삭제"
                                  }
                                >
                                  블록 삭제
                                </button>
                              </div>
                            </div>

                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: isMobile
                                  ? "1fr"
                                  : "1fr 1fr",
                                gap: 12,
                                marginBottom: 14,
                              }}
                            >
                              <div style={{ display: "grid", gap: 6 }}>
                                <div style={ui.fieldLabel}>블록 라벨</div>
                                <div
                                  style={ui.monoLine}
                                >{`cases.blocks[${bIdx}].eyebrow`}</div>
                                <input
                                  value={block?.eyebrow ?? ""}
                                  onChange={(e) =>
                                    updateByPath(
                                      `cases.blocks[${bIdx}].eyebrow`,
                                      e.target.value
                                    )
                                  }
                                  style={ui.input}
                                  placeholder="CASES"
                                />
                              </div>

                              <div style={{ display: "grid", gap: 6 }}>
                                <div style={ui.fieldLabel}>블록 제목</div>
                                <div
                                  style={ui.monoLine}
                                >{`cases.blocks[${bIdx}].title`}</div>
                                <input
                                  value={block?.title ?? ""}
                                  onChange={(e) =>
                                    updateByPath(
                                      `cases.blocks[${bIdx}].title`,
                                      e.target.value
                                    )
                                  }
                                  style={ui.input}
                                  placeholder="대형 행사 경험과 노하우 보유"
                                />
                              </div>

                              <div
                                style={{
                                  display: "grid",
                                  gap: 6,
                                  gridColumn: isMobile ? "auto" : "1 / -1",
                                }}
                              >
                                <div style={ui.fieldLabel}>블록 서브타이틀</div>
                                <div
                                  style={ui.monoLine}
                                >{`cases.blocks[${bIdx}].subtitle`}</div>
                                <input
                                  value={block?.subtitle ?? ""}
                                  onChange={(e) =>
                                    updateByPath(
                                      `cases.blocks[${bIdx}].subtitle`,
                                      e.target.value
                                    )
                                  }
                                  style={ui.input}
                                  placeholder="VIP, 국무총리, 장관급 행사 등"
                                />
                              </div>
                            </div>

                            <div style={ui.gridSlots8}>
                              {slots.map((slot, slotIdx) => {
                                const bytes = slot.src
                                  ? estimateDataUrlBytes(slot.src)
                                  : 0;

                                return (
                                  <div
                                    key={`case-${bIdx}-${slotIdx}`}
                                    style={ui.gridItem}
                                    draggable
                                    onDragStart={onDragStartSlot(bIdx, slotIdx)}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={onDropSlot(bIdx, slotIdx)}
                                  >
                                    <div style={ui.gridHeader}>
                                      <div style={{ minWidth: 0 }}>
                                        <div style={ui.gridTitle}>
                                          <span
                                            style={ui.dragHandleSm}
                                            title="드래그로 순서 변경"
                                          >
                                            ⠿
                                          </span>
                                          Slot #{slotIdx + 1}
                                        </div>
                                        {bytes ? (
                                          <div style={ui.sizeHint}>
                                            Stored: {humanBytes(bytes)}
                                          </div>
                                        ) : null}
                                      </div>

                                      <div
                                        style={{
                                          display: "flex",
                                          gap: 8,
                                          alignItems: "flex-start",
                                        }}
                                      >
                                        <button
                                          type="button"
                                          style={{
                                            ...ui.btn,
                                            ...ui.btnGhost,
                                            padding: "8px 10px",
                                          }}
                                          onClick={() =>
                                            moveCaseSlot(
                                              bIdx,
                                              slotIdx,
                                              clamp(
                                                slotIdx - 1,
                                                0,
                                                CASE_SLOTS - 1
                                              )
                                            )
                                          }
                                          disabled={busy || slotIdx === 0}
                                          title="위로"
                                        >
                                          ▲
                                        </button>
                                        <button
                                          type="button"
                                          style={{
                                            ...ui.btn,
                                            ...ui.btnGhost,
                                            padding: "8px 10px",
                                          }}
                                          onClick={() =>
                                            moveCaseSlot(
                                              bIdx,
                                              slotIdx,
                                              clamp(
                                                slotIdx + 1,
                                                0,
                                                CASE_SLOTS - 1
                                              )
                                            )
                                          }
                                          disabled={
                                            busy || slotIdx === CASE_SLOTS - 1
                                          }
                                          title="아래로"
                                        >
                                          ▼
                                        </button>
                                      </div>
                                    </div>

                                    <AdminPreview ui={ui} src={slot.src} />

                                    <div
                                      style={{
                                        display: "flex",
                                        gap: 10,
                                        flexWrap: "wrap",
                                      }}
                                    >
                                      <label
                                        style={{
                                          ...ui.btn,
                                          ...ui.btnPrimary,
                                          cursor: busy
                                            ? "not-allowed"
                                            : "pointer",
                                        }}
                                      >
                                        업로드/교체
                                        <input
                                          type="file"
                                          accept="image/*"
                                          style={{ display: "none" }}
                                          disabled={busy}
                                          onChange={(e) => {
                                            const f =
                                              e.target.files?.[0] || null;
                                            e.target.value = "";
                                            uploadCaseSlotImage(
                                              bIdx,
                                              slotIdx,
                                              f
                                            );
                                          }}
                                        />
                                      </label>

                                      <button
                                        type="button"
                                        style={{ ...ui.btn, ...ui.btnDanger }}
                                        onClick={() =>
                                          clearCaseSlotImage(bIdx, slotIdx)
                                        }
                                        disabled={busy || !slot.src}
                                      >
                                        삭제
                                      </button>
                                    </div>

                                    <div
                                      style={{
                                        display: "grid",
                                        gap: 8,
                                        marginTop: 8,
                                      }}
                                    >
                                      <div style={ui.fieldLabel}>타이틀</div>
                                      <input
                                        value={slot.title || ""}
                                        onChange={(e) =>
                                          setCaseSlot(bIdx, slotIdx, {
                                            title: e.target.value,
                                          })
                                        }
                                        style={ui.input}
                                        placeholder="예) OECD 라운드테이블"
                                      />

                                      <div style={ui.fieldLabel}>
                                        상세 라인 (최대 5줄)
                                      </div>
                                      {Array.from({ length: 5 }).map(
                                        (_, li) => {
                                          const v =
                                            (slot.lines || [])[li] || "";
                                          return (
                                            <input
                                              key={li}
                                              value={v}
                                              onChange={(e) => {
                                                const nextLines = Array.isArray(
                                                  slot.lines
                                                )
                                                  ? slot.lines.slice()
                                                  : [];
                                                nextLines[li] = e.target.value;
                                                setCaseSlot(bIdx, slotIdx, {
                                                  lines: nextLines,
                                                });
                                              }}
                                              style={ui.input}
                                              placeholder={
                                                li === 0
                                                  ? "예) 장소: 워커힐 호텔"
                                                  : li === 1
                                                  ? "예) 참석자: 2,000명 (국내1,000+해외1,000)"
                                                  : "예) 과업범위: 행사 기획 및 운영"
                                              }
                                            />
                                          );
                                        }
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : null}

                <div style={ui.footer}>
                  <div style={ui.footerHint}>
                    헤더 / Org / Portfolio / Cases / Contact 문구까지 어드민에서
                    수정 가능합니다.
                  </div>
                  <button
                    type="button"
                    style={{ ...ui.btn, ...ui.btnGhost }}
                    onClick={() => {
                      try {
                        const s = JSON.stringify(data || {}, null, 2);
                        navigator.clipboard?.writeText(s);
                        showToast("현재 데이터(JSON) 복사 완료", "ok");
                      } catch {
                        showToast("복사 실패", "err");
                      }
                    }}
                    disabled={busy}
                  >
                    데이터 복사
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}