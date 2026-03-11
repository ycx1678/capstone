import React, { useMemo } from "react";
import SectionLabel from "../SectionLabel";

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

  // ✅ 기존보다 조금 더 밝게
  const sectionBg = "#1B2432";
  const textMain = "rgba(255,255,255,0.985)";
  const textSub = "rgba(255,255,255,0.90)";
  const textBodyBright = "rgba(255,255,255,0.95)";
  const hairline = "rgba(255,255,255,0.20)";
  const panelBorder = "rgba(255,255,255,0.18)";
  const gold = brand.base || "#C7A66A";
  const goldBorder = "rgba(199,166,106,0.34)";
  const goldBgSoft = "rgba(199,166,106,0.12)";
  const goldBgStrong = "rgba(199,166,106,0.16)";

  const sectionPadY = isMobile ? 46 : 58;
  const innerPad = isMobile ? "16px" : "22px";

  // ✅ 기존 네 OrgSection 제목 크기와 동일
  const sectionTitleSize = isMobile
    ? "clamp(26px, 6.4vw, 34px)"
    : "clamp(34px, 3.35vw, 48px)";

  const sectionSubSize = isMobile
    ? "clamp(14px, 3.4vw, 16px)"
    : "clamp(15.5px, 1.2vw, 17.5px)";

  const cardBase = styles?.ui?.card
    ? styles.ui.card("dark", { variant: "premium" })
    : {};

  const shellBase = {
    ...cardBase,
    border: `1px solid ${panelBorder}`,
    background: "rgba(255,255,255,0.10)",
    borderRadius: 24,
    overflow: "hidden",
    boxSizing: "border-box",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
  };

  const hr = {
    marginTop: 12,
    height: 1,
    background:
      "linear-gradient(90deg, rgba(199,166,106,0.46) 0%, rgba(255,255,255,0.08) 100%)",
  };

  // ✅ ABOUT US 제거, VALUE&WORK만 유지
  const sectionEyebrow = "VALUE&WORK";

  const sectionTitle = data?.work?.title || "주요 업무";
  const sectionSubtitle =
    data?.work?.subtitle || "안정된 행사 운영과 효율적인 업무 진행";

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
    width: isMobile ? 42 : 48,
    height: isMobile ? 42 : 48,
    borderRadius: 13,
    border: `1px solid ${goldBorder}`,
    background: `linear-gradient(180deg, ${goldBgStrong} 0%, ${goldBgSoft} 100%)`,
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
            border-color: rgba(199,166,106,0.36);
            background: rgba(255,255,255,0.12);
          }
        }
      `}</style>

      {bgImage ? (
        <div
          style={styles.sectionBgImage?.(bgImage, {
            opacity: isMobile ? 0.18 : 0.24,
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
            "linear-gradient(180deg, rgba(27,36,50,0.56) 0%, rgba(27,36,50,0.44) 32%, rgba(27,36,50,0.60) 100%)",
        })}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          background: `
            radial-gradient(720px 420px at 10% 18%, rgba(199,166,106,0.10), transparent 62%),
            radial-gradient(720px 420px at 90% 22%, rgba(35,80,160,0.09), transparent 64%)
          `,
        }}
      />

      <div
        style={{
          ...styles.container,
          position: "relative",
          zIndex: 2,
          maxWidth: "1320px",
          margin: "0 auto",
          paddingTop: sectionPadY,
          paddingBottom: sectionPadY + 8,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            minHeight: isMobile ? "auto" : 82,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <div
            style={{
              color: gold,
            }}
          >
            <SectionLabel text={sectionEyebrow} styles={styles} />
          </div>

          <div
            style={{
              marginTop: 14,
              fontSize: sectionTitleSize,
              fontWeight: styles?.type?.weight?.semibold ?? 600,
              letterSpacing: "-0.03em",
              color: textMain,
              fontFamily: styles?.fonts?.display,
              lineHeight: 1.18,
              wordBreak: "keep-all",
            }}
          >
            {sectionTitle}
          </div>

          {!!sectionSubtitle && (
            <div
              style={{
                marginTop: 10,
                fontSize: sectionSubSize,
                fontWeight: 500,
                lineHeight: 1.72,
                color: textSub,
                fontFamily: styles?.fonts?.body,
                maxWidth: isMobile ? "100%" : 980,
                wordBreak: "keep-all",
              }}
            >
              {sectionSubtitle}
            </div>
          )}

          <div style={hr} />
        </div>

        <div
          style={{
            ...shellBase,
            marginTop: isMobile ? 16 : 18,
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
              gap: isMobile ? 12 : 16,
            }}
          >
            {workItems.map((w, i) => (
              <div
                key={i}
                className="vwWorkItem"
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "42px 1fr" : "48px 1fr",
                  gap: isMobile ? 11 : 14,
                  alignItems: "start",
                  minHeight: isMobile ? 110 : 160,
                  padding: isMobile ? "14px 13px" : "20px 18px",
                  borderRadius: 18,
                  border: `1px solid ${hairline}`,
                  background: "rgba(255,255,255,0.10)",
                  boxSizing: "border-box",
                }}
              >
                <div style={iconBoxStyle}>{workIcons[i % workIcons.length]}</div>

                <div
                  style={{
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: isMobile ? 14 : 15,
                      lineHeight: 1.34,
                      letterSpacing: "-0.02em",
                      color: gold,
                      fontFamily: styles?.fonts?.body,
                      wordBreak: "keep-all",
                    }}
                  >
                    {w.t}
                  </div>

                  <div
                    style={{
                      marginTop: 8,
                      fontSize: isMobile ? 13.5 : 14.5,
                      lineHeight: isMobile ? 1.7 : 1.75,
                      color: textBodyBright,
                      whiteSpace: "pre-line",
                      wordBreak: "keep-all",
                      overflowWrap: "anywhere",
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