import { useState } from "react";
import ImageCard from "../cards/ImageCard";
import SectionLabel from "../SectionLabel";

const CASE_SLOTS = 8;

function normalizeImages(images) {
  return (images || []).map((x) =>
    typeof x === "string" ? { src: x } : { ...(x || {}), src: x?.src || "" }
  );
}

function ensureSlots(images, n = CASE_SLOTS) {
  const norm = normalizeImages(images);

  return Array.from({ length: n }, (_, i) => {
    const it = norm[i] || {};
    const src = it?.src ? String(it.src).trim() : "";
    return {
      ...(it || {}),
      src,
      __empty: !src,
    };
  });
}

function EmptyCard({ styles, theme }) {
  const t = styles.themes?.[theme] ?? styles.themes.dark;

  return (
    <div
      className="csbEmptyCard"
      style={{
        borderRadius: 18,
        border: `1px dashed ${t.border}`,
        background:
          theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
        height: "clamp(140px, 12vw, 200px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "opacity 0.2s ease",
      }}
    >
      <img
        src="/capstone_logo_remove.png"
        alt="capstone logo"
        style={{
          width: "42%",
          opacity: 0.55,
          filter: "grayscale(100%)",
          userSelect: "none",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

export default function CasesSection({
  data,
  isMobile,
  styles,
  theme = "dark",
}) {
  const t = styles.themes?.[theme] ?? styles.themes.dark;
  const blocks = Array.isArray(data?.cases?.blocks) ? data.cases.blocks : [];
  const sectionLabel = data?.cases?.sectionLabel || "CASES";
  const gold = styles?.brand?.base || "#C7A66A";
  const goldBorder = styles?.brand?.border || "rgba(199,166,106,0.34)";
  const goldSoft = styles?.brand?.soft || "rgba(199,166,106,0.10)";

  const [openMap, setOpenMap] = useState(() => ({}));
  const toggleOpen = (bi) =>
    setOpenMap((prev) => ({ ...prev, [bi]: !prev?.[bi] }));

  const titleFont =
    styles?.fonts?.body || styles?.fonts?.display || "GmarketSans, sans-serif";

  return (
    <section
      id="cases"
      style={{
        ...styles.section(theme),
        position: "relative",
      }}
    >
      <style>{`
        .csbEmptyCard:hover { opacity: 0.85; }

        @media (hover:hover) and (pointer:fine) {
          .csCasesBtn {
            transition:
              transform 160ms ease,
              border-color 160ms ease,
              background 160ms ease,
              opacity 160ms ease;
          }
          .csCasesBtn:hover {
            transform: translateY(-1px);
            opacity: 1;
          }
        }
      `}</style>

      <div style={styles.container}>
        <div style={{ display: "grid", gap: "clamp(28px, 4vw, 48px)" }}>
          {blocks.map((blk, bi) => {
            const imgs = ensureSlots(blk?.images, CASE_SLOTS);
            const eyebrow = blk?.eyebrow || sectionLabel;

            const isOpen = !!openMap[bi];
            const visibleImgs = isMobile && !isOpen ? imgs.slice(0, 4) : imgs;

            return (
              <div
                key={bi}
                style={{
                  borderTop: `1px solid ${t.border}`,
                  paddingTop: "clamp(18px, 2.6vw, 28px)",
                }}
              >
                <SectionLabel text={eyebrow} styles={styles} />

                <div
                  style={{
                    marginTop: 14,
                    fontSize: isMobile
                      ? "clamp(24px, 6.4vw, 30px)"
                      : "clamp(28px, 3.2vw, 38px)",
                    fontWeight: 700,
                    letterSpacing: "-0.03em",
                    lineHeight: 1.2,
                    fontFamily: titleFont,
                    wordBreak: "keep-all",
                    ...styles.text(theme),
                  }}
                >
                  {blk?.title}
                </div>

                {!!blk?.subtitle && (
                  <div
                    style={{
                      marginTop: 9,
                      fontWeight: 500,
                      fontSize: isMobile
                        ? "clamp(13px, 3.4vw, 14px)"
                        : "clamp(14px, 1.15vw, 16px)",
                      lineHeight: 1.72,
                      letterSpacing: "-0.01em",
                      fontFamily: titleFont,
                      wordBreak: "keep-all",
                      maxWidth: isMobile ? "100%" : 1080,
                      ...styles.subText(theme),
                    }}
                  >
                    {blk?.subtitle}
                  </div>
                )}

                <div
                  style={{
                    marginTop: 20,
                    display: "grid",
                    gridTemplateColumns: isMobile
                      ? "repeat(2, minmax(0, 1fr))"
                      : "repeat(4, minmax(0, 1fr))",
                    gap: "clamp(10px, 2vw, 16px)",
                  }}
                >
                  {visibleImgs.map((im, ii) =>
                    im.__empty ? (
                      <EmptyCard key={ii} styles={styles} theme={theme} />
                    ) : (
                      <ImageCard
                        key={ii}
                        im={im}
                        theme={theme}
                        styles={styles}
                      />
                    )
                  )}
                </div>

                {isMobile ? (
                  <div
                    style={{
                      marginTop: 16,
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <button
                      type="button"
                      className="csCasesBtn"
                      onClick={() => toggleOpen(bi)}
                      style={{
                        padding: "10px 18px",
                        borderRadius: 12,
                        border: `1px solid ${goldBorder}`,
                        background: goldSoft,
                        color: gold,
                        fontWeight: 700,
                        letterSpacing: "-0.01em",
                        fontFamily: titleFont,
                        cursor: "pointer",
                      }}
                    >
                      {isOpen ? "접기" : "더보기"}
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}