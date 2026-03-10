export default function PhotoCard({
  ph,
  placeholderBox,
  styles,
  theme = "dark",
  aspect = "16 / 10",
}) {
  const t = styles?.themes?.[theme] ?? styles?.themes?.dark;
  const label = ph?.label || "PHOTO";

  return (
    <div
      style={{
        width: "100%",
        ...styles.ui.mediaFrame(theme, { radius: 16, shadow: "sm" }),
        background: t.surface,
        border: `${styles.tok.border.w}px solid ${t.border}`,
        position: "relative",
        aspectRatio: aspect,
        transform: "translateZ(0)",
      }}
    >
      {ph?.src ? (
        <img
          src={ph.src}
          alt={label}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            transform: "scale(1.0)",
            transition: "transform 240ms ease",
          }}
          draggable={false}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
        />
      ) : (
        <div style={{ width: "100%", height: "100%" }}>
          <div style={placeholderBox(label)}>{label}</div>
        </div>
      )}

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.45), rgba(0,0,0,0) 60%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 12,
          right: 12,
          bottom: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          pointerEvents: "none",
          fontFamily: styles.fonts.body,
        }}
      >
        <div
          style={{
            fontWeight: 900,
            fontSize: styles.type.small,
            color: "rgba(255,255,255,0.92)",
            textShadow: "0 2px 10px rgba(0,0,0,0.35)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={label}
        >
          {label}
        </div>

        <div
          style={{
            padding: "6px 10px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.14)",
            border: "1px solid rgba(255,255,255,0.18)",
            color: "rgba(255,255,255,0.86)",
            fontWeight: 900,
            fontSize: "12px",
            letterSpacing: 0.2,
            backdropFilter: "blur(8px)",
          }}
        >
          VIEW
        </div>
      </div>
    </div>
  );
}
