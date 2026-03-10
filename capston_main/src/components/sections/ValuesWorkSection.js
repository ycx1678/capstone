import React, { useMemo } from "react";

export default function ValuesWorkSection({
  data,
  isMobile,
  styles,
  headerHeight = 74,
}) {
  const workAll = data?.work?.items || [];
  const workItems = useMemo(() => workAll.slice(0, 8), [workAll]);

  const theme = "dark";
  const brand = styles.brand ?? {};

  const bgImage =
    data?.sectionBg?.valuesWork || data?.work?.backgroundImageSrc || "";

  const sectionBg = "#0C111B";
  const textMain = "rgba(255,255,255,0.96)";
  const textSub = "rgba(255,255,255,0.82)";
  const hairline = "rgba(255,255,255,0.10)";
  const panelBorder = "rgba(255,255,255,0.12)";
  const gold = brand.base || "#C7A66A";
  const goldBorder = "rgba(199,166,106,0.30)";

  const sectionPadY = isMobile ? 42 : 52;
  const innerPad = isMobile ? "14px" : "16px";

  const sectionTitleSize = isMobile
    ? "clamp(20px, 5vw, 24px)"
    : "clamp(22px, 2vw, 28px)";

  const cardBase = styles?.ui?.card
    ? styles.ui.card("dark", { variant: "premium" })
    : {};

  const shellBase = {
    ...cardBase,
    border: `1px solid ${panelBorder}`,
    background: "rgba(255,255,255,0.05)",
    borderRadius: 22,
    overflow: "hidden",
    boxSizing: "border-box",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
  };

  const hr = {
    marginTop: 10,
    height: 1,
    background:
      "linear-gradient(90deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.04) 100%)",
  };

  const workIcons = [
    <svg
      key="i1"
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 9h10M7 13h6" />
      <circle cx="17" cy="15" r="1.2" fill="currentColor" stroke="none" />
    </svg>,
    <svg
      key="i2"
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v5l3 2" />
    </svg>,
    <svg
      key="i3"
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M16 13a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path d="M3 19c.7-2.8 3.1-4 5-4s4.3 1.2 5 4" />
      <path d="M13.5 19c.5-1.9 2.1-2.8 3.5-2.8 1.3 0 2.8.8 3.5 2.8" />
    </svg>,
    <svg
      key="i4"
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 6h14v12H5z" />
      <path d="M8 10h8M8 14h5" />
      <path d="M15.5 3.5v5" />
    </svg>,
    <svg
      key="i5"
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 6h16" />
      <path d="M6 10h12" />
      <path d="M8 14h8" />
      <path d="M10 18h4" />
    </svg>,
    <svg
      key="i6"
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l7 4v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V7l7-4Z" />
      <path d="M9.5 12.5l1.6 1.6 3.4-3.8" />
    </svg>,
    <svg
      key="i7"
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 18v-5l5-5 3 3-7 7H4Z" />
      <path d="M14 8l2-2 4 4-2 2" />
      <path d="M13 13l5 5" />
    </svg>,
    <svg
      key="i8"
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M8 9h8M8 13h8M8 17h5" />
    </svg>,
  ];

  const iconBoxStyle = {
    width: isMobile ? 40 : 44,
    height: isMobile ? 40 : 44,
    borderRadius: 12,
    border: `1px solid ${goldBorder}`,
    background:
      "linear-gradient(180deg, rgba(199,166,106,0.16) 0%, rgba(199,166,106,0.08) 100%)",
    boxShadow:
      "inset 0 1px 0 rgba(255,255,255,0.06), 0 10px 24px rgba(0,0,0,0.16)",
    color: gold,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: "0 0 auto",
  };

  return (
    <section
      id="valuesWork"
      style={{
        ...styles.section?.(theme, {
          background: sectionBg,
          overflow: "hidden",
        }),
        position: "relative",
        scrollMarginTop: headerHeight + 10,
        padding: 0,
      }}
    >
      <style>{`
        @media (hover:hover) and (pointer:fine) {
          .vwWorkItem {
            transition:
              transform 180ms ease,
              box-shadow 180ms ease,
              border-color 180ms ease,
              background 180ms ease;
          }
          .vwWorkItem:hover {
            transform: translateY(-3px);
            box-shadow: 0 18px 42px rgba(0,0,0,0.24);
            border-color: rgba(199,166,106,0.34);
            background: rgba(255,255,255,0.08);
          }
        }
      `}</style>

      {bgImage ? (
        <div
          style={styles.sectionBgImage?.(bgImage, {
            opacity: isMobile ? 0.16 : 0.22,
            position: "center center",
            size: "cover",
            zIndex: 0,
          })}
        />
      ) : null}

      <div
        style={styles.sectionOverlay?.(theme, {
          zIndex: 1,
          background:
            "linear-gradient(180deg, rgba(12,17,27,0.58) 0%, rgba(12,17,27,0.48) 32%, rgba(12,17,27,0.62) 100%)",
        })}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          background: `
            radial-gradient(720px 420px at 10% 18%, rgba(199,166,106,0.09), transparent 62%),
            radial-gradient(720px 420px at 90% 22%, rgba(35,80,160,0.08), transparent 64%)
          `,
        }}
      />

      <div
        style={{
          ...styles.container,
          position: "relative",
          zIndex: 2,
          maxWidth: "1300px",
          margin: "0 auto",
          paddingTop: sectionPadY,
          paddingBottom: sectionPadY + 6,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            minHeight: isMobile ? "auto" : 64,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              color: gold,
              fontSize: styles?.type?.xs ?? "12px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontFamily: styles?.fonts?.nav,
            }}
          >
            <span
              style={{
                width: 34,
                height: 1,
                background: `linear-gradient(90deg, rgba(199,166,106,0.18), ${gold})`,
              }}
            />
            <span>About us</span>
          </div>

          <div
            style={{
              marginTop: 14,
              fontSize: sectionTitleSize,
              fontWeight: 500,
              letterSpacing: "-0.03em",
              color: textMain,
              fontFamily: styles?.fonts?.display,
              lineHeight: 1.18,
            }}
          >
            {data?.work?.title || "주요 업무"}
          </div>
          <div style={hr} />
        </div>

        <div
          style={{
            ...shellBase,
            marginTop: isMobile ? 14 : 16,
            padding: innerPad,
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "1fr"
                : "repeat(4, minmax(0, 1fr))",
              gap: isMobile ? 12 : 14,
            }}
          >
            {workItems.map((w, i) => (
              <div
                key={i}
                className="vwWorkItem"
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "40px 1fr" : "44px 1fr",
                  gap: isMobile ? 10 : 12,
                  alignItems: "start",
                  minHeight: isMobile ? 84 : 98,
                  padding: isMobile ? "12px 12px" : "14px 14px",
                  borderRadius: 16,
                  border: `1px solid ${hairline}`,
                  background: "rgba(255,255,255,0.06)",
                  boxSizing: "border-box",
                }}
              >
                <div style={iconBoxStyle}>
                  {workIcons[i % workIcons.length]}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 500,
                      fontSize: isMobile ? 13.5 : 14,
                      lineHeight: 1.3,
                      letterSpacing: "-0.02em",
                      color: textMain,
                      fontFamily: styles?.fonts?.body,
                      wordBreak: "keep-all",
                    }}
                  >
                    {w.t}
                  </div>

                  <div
                    style={{
                      marginTop: 6,
                      fontSize: isMobile ? 12.5 : 13,
                      lineHeight: isMobile ? 1.55 : 1.58,
                      color: textSub,
                      whiteSpace: "pre-line",
                      wordBreak: "keep-all",
                      fontFamily: styles?.fonts?.body,
                      fontWeight: 500,
                    }}
                  >
                    {w.d}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}