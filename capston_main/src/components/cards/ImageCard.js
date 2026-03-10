import { useMemo, useState, useEffect } from "react";

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

  const [openMobile, setOpenMobile] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const x = useMemo(() => normImage(im), [im]);

  const hasImg = !!x.src;
  const lines = (x.lines || []).filter(Boolean).slice(0, 5);

  // ✅ 안전한 모바일 체크
  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    check();
    window.addEventListener("resize", check);

    return () => window.removeEventListener("resize", check);
  }, []);

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
        cursor: isMobile ? "pointer" : "default",
      }}
      onClick={() => {
        if (isMobile) setOpenMobile((v) => !v);
      }}
    >
      {/* CSS */}
      <style>{`
        .caseImg{
          width:100%;
          height:clamp(150px,12vw,220px);
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

      {/* 이미지 */}
      {hasImg ? (
        <img className="caseImg" src={x.src} alt={x.title || ""} />
      ) : placeholderBox ? (
        placeholderBox("CASE")
      ) : (
        <div
          style={{
            height: "clamp(150px,12vw,220px)",
            display: "grid",
            placeItems: "center",
            color:
              theme === "dark" ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)",
          }}
        >
          IMAGE
        </div>
      )}

      {/* Overlay */}
      <div
        className="caseOverlay"
        style={{
          background: "rgba(0,0,0,0.78)",
          borderTop: "1px solid rgba(255,255,255,0.14)",
          padding: "12px",
          transform: isMobile
            ? openMobile
              ? "translateY(0)"
              : "translateY(100%)"
            : undefined,
        }}
      >
        {/* Title */}
        <div
          style={{
            fontSize: "clamp(13px,1.3vw,15px)",
            fontWeight: 950,
            letterSpacing: -0.3,
            color: "rgba(255,255,255,0.95)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {x.title || " "}
        </div>

        {/* Lines */}
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

        {/* 모바일 안내 */}
        {isMobile && (
          <div
            style={{
              marginTop: 10,
              color: "rgba(255,255,255,0.65)",
              fontSize: 12,
              fontWeight: 800,
              textAlign: "center",
              userSelect: "none",
            }}
          >
            {openMobile ? "접기" : "터치하면 상세 보기"}
          </div>
        )}
      </div>
    </div>
  );
}
