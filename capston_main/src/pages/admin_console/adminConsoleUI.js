const ui = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(1200px 800px at 20% 10%, rgba(120,120,255,0.12), transparent 60%), #0b0d12",
    color: "rgba(255,255,255,0.92)",
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Noto Sans KR", Arial',
  },

  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
    flexWrap: "wrap",
  },
  h1: { fontSize: 26, fontWeight: 950, letterSpacing: -0.6 },
  hint: {
    marginTop: 6,
    fontSize: 13,
    color: "rgba(255,255,255,0.65)",
    lineHeight: 1.55,
  },

  toast: {
    padding: "10px 12px",
    borderRadius: 12,
    background: "rgba(0,0,0,0.35)",
    border: "1px solid rgba(255,255,255,0.14)",
    fontSize: 13,
    color: "rgba(255,255,255,0.82)",
    marginBottom: 14,
  },

  card: {
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
    overflow: "hidden",
    marginTop: 14,
  },
  cardHeader: {
    padding: "14px 14px 10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  cardTitle: { fontSize: 15, fontWeight: 950, letterSpacing: -0.2 },
  cardSub: {
    marginTop: 4,
    fontSize: 12,
    color: "rgba(255,255,255,0.62)",
    lineHeight: 1.4,
  },
  cardBody: { padding: 14 },

  btn: {
    appearance: "none",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.88)",
    padding: "10px 12px",
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 900,
    letterSpacing: -0.1,
    cursor: "pointer",
    userSelect: "none",
  },
  btnPrimary: {
    border: "1px solid rgba(120,120,255,0.45)",
    background:
      "linear-gradient(180deg, rgba(120,120,255,0.25), rgba(120,120,255,0.12))",
  },
  btnGhost: {
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
  },
  btnDanger: {
    border: "1px solid rgba(255, 96, 128, 0.45)",
    background:
      "linear-gradient(180deg, rgba(255,96,128,0.18), rgba(255,96,128,0.10))",
  },

  input: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    outline: "none",
    background: "rgba(0,0,0,0.25)",
    color: "rgba(255,255,255,0.90)",
  },

  fieldLabel: { fontWeight: 950, fontSize: 13 },

  monoInline: {
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: 12,
    padding: "1px 6px",
    borderRadius: 8,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
    margin: "0 6px",
  },
  monoLine: {
    marginTop: 6,
    fontSize: 12,
    color: "rgba(255,255,255,0.62)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },

  sizeHint: { fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 6 },

  row2: {
    display: "grid",
    gridTemplateColumns: "minmax(240px, 1fr) minmax(260px, 420px)",
    gap: 14,
    alignItems: "start",
  },

  previewWrap: {
    width: "100%",
    aspectRatio: "16 / 10",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.25)",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  previewImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  previewEmpty: {
    width: "100%",
    aspectRatio: "16 / 10",
    borderRadius: 14,
    border: "1px dashed rgba(255,255,255,0.20)",
    background: "rgba(0,0,0,0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    fontWeight: 800,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 12,
    marginTop: 10,
  },

  // ✅ 케이스 8슬롯: 보기 좋게 조금 더 넓은 min width
  gridSlots8: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
    gap: 12,
    marginTop: 12,
    padding: 14,
  },

  gridItem: {
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
    padding: 12,
    display: "grid",
    gap: 10,
  },
  gridHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "flex-start",
  },
  gridTitle: {
    fontSize: 13,
    fontWeight: 950,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  formGrid3: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
  },

  sectionTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 950,
    letterSpacing: -0.2,
  },
  sectionHint: { marginTop: 6, fontSize: 12, color: "rgba(255,255,255,0.60)" },

  footer: {
    marginTop: 16,
    padding: "12px 14px",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
  },
  footerHint: {
    fontSize: 12,
    color: "rgba(255,255,255,0.62)",
    lineHeight: 1.5,
  },

  blockShell: {
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.035)",
    overflow: "hidden",
    boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
  },
  blockHead: {
    padding: 14,
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    flexWrap: "wrap",
  },
  blockTitleRow: { display: "flex", alignItems: "center", gap: 10 },
  dragHandle: {
    display: "inline-flex",
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.20)",
    color: "rgba(255,255,255,0.8)",
    cursor: "grab",
    userSelect: "none",
  },
  dragHandleSm: {
    display: "inline-flex",
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.18)",
    color: "rgba(255,255,255,0.8)",
    cursor: "grab",
    userSelect: "none",
  },
  badge: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    padding: "3px 8px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.18)",
  },
};

export default ui;
