import { useMemo } from "react";

const CARD_RATIO = "16 / 10";

function normImage(im) {
  if (!im) return { src: "", title: "", lines: [] };

  if (typeof im === "string") {
    return { src: im, title: "", lines: [] };
  }

  return {
    ...im,
    src: im?.src || "",
    title: im?.title || im?.name || "",
    lines: Array.isArray(im?.lines) ? im.lines.map((s) => String(s ?? "")) : [],
  };
}

export default function ImageCard({
  im,
  styles,
  theme = "dark",
  placeholderBox,
}) {
  const t = styles.themes?.[theme] ?? styles.themes.dark;
  const x = useMemo(() => normImage(im), [im]);

  const hasImg = !!x.src;
  const lines = (x.lines || []).filter(Boolean).slice(0, 5);

  return (
    <div
      className="caseCard"
      style={{
        borderRadius: 18,
        overflow: "hidden",
        border: `1px solid ${t.border}`,
        background: theme === "dark" ? "rgba(255,255,255,0.03)" : t.surface,
        boxShadow: "0 18px 60px rgba(0,0,0,0.32)",
        position: "relative",
      }}
    >
      <style>{`
        .caseMedia{
          position: relative;
          width: 100%;
          aspect-ratio: ${CARD_RATIO};
          overflow: hidden;
          background: ${
            theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"
          };
        }

        .caseImg{
          position:absolute;
          inset:0;
          width:100%;
          height:100%;
          object-fit:cover;
          display:block;
          transform:scale(1);
          transition:transform .22s ease;
        }

        .caseOverlay{
          position:absolute;
          left:0;
          right:0;
          bottom:0;
          transform:translateY(100%);
          transition:transform .24s ease;
          will-change:transform;
          background:rgba(0,0,0,0.78);
          border-top:1px solid rgba(255,255,255,0.14);
          padding:12px;
        }

        @media (hover:hover) and (pointer:fine){
          .caseCard:hover .caseImg{
            transform:scale(1.03);
          }

          .caseCard:hover .caseOverlay{
            transform:translateY(0);
          }
        }
      `}</style>

      <div className="caseMedia">
        {hasImg ? (
          <img className="caseImg" src={x.src} alt={x.title || ""} />
        ) : placeholderBox ? (
          <div style={{ width: "100%", height: "100%" }}>{placeholderBox("CASE")}</div>
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              color:
                theme === "dark"
                  ? "rgba(255,255,255,0.35)"
                  : "rgba(0,0,0,0.35)",
            }}
          >
            IMAGE
          </div>
        )}

        <div className="caseOverlay">
          <div
            style={{
              fontSize: "clamp(13px,1.3vw,15px)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "rgba(255,255,255,0.95)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {x.title || " "}
          </div>

          <div
            style={{
              marginTop: 8,
              display: "grid",
              gap: 4,
              color: "rgba(255,255,255,0.85)",
              fontSize: 12.5,
              lineHeight: 1.45,
            }}
          >
            {lines.map((s, i) => (
              <div
                key={i}
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}