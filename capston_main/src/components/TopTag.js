export default function TopTag({
  title,
  sub,
  isMobile,
  padXMobile,
  padXDesktop,
  S,
  theme = "dark",
  styles,
}) {
  const t = styles?.themes?.[theme] ?? styles?.themes?.dark ?? {};
  const border = t.border ?? "rgba(0,0,0,0.12)";

  return (
    <div
      style={{
        position: "absolute",
        right: isMobile ? padXMobile : padXDesktop,
        top: isMobile ? 14 : 28,

        ...styles.ui.panel(theme, {
          padding: isMobile ? "10px 14px" : "12px 16px",
          radius: styles.tok.radius.md,
          shadow: "sm",
          glass: true,
          bg:
            theme === "dark"
              ? styles.brand.softStrong
              : "rgba(255,255,255,0.78)",
          borderColor: theme === "dark" ? styles.brand.border : border,
        }),

        textAlign: "center",
        fontWeight: styles.type.weight.heavy,
        lineHeight: 1.15,
        fontFamily: styles.fonts.body,
        zIndex: 3,
      }}
    >
      <div
        style={{
          fontSize: "clamp(14px,1.8vw,16px)",
          color: t.fg,
          letterSpacing: -0.2,
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: 4,
          fontSize: S,
          color: t.sub,
          opacity: 0.9,
        }}
      >
        {sub}
      </div>
    </div>
  );
}
