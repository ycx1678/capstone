// src/styles/siteStyles.js
export function getSiteStyles({ data, isMobile }) {
  const layout = data?.layout ?? {};

  // ---------------------------
  // Type scale
  // ---------------------------
  const type = {
    h1: isMobile ? "clamp(34px, 8.6vw, 48px)" : "clamp(46px, 5.3vw, 72px)",
    h2: isMobile ? "clamp(25px, 6.2vw, 34px)" : "clamp(32px, 3.25vw, 46px)",
    h3: isMobile ? "clamp(18px, 4.6vw, 23px)" : "clamp(21px, 2.05vw, 26px)",
    bodyLg: isMobile
      ? "clamp(15px, 3.7vw, 17px)"
      : "clamp(17px, 1.36vw, 20px)",
    body: isMobile
      ? "clamp(14px, 3.35vw, 16px)"
      : "clamp(15.5px, 1.18vw, 17.5px)",
    small: isMobile ? "clamp(12px, 2.9vw, 13.5px)" : "clamp(12.5px, 1.02vw, 14.5px)",
    xs: isMobile ? "11px" : "12px",
    menu: isMobile ? "12px" : "13px",

    weight: {
      light: 500,
      reg: 500,
      med: 500,
      semibold: 700,
      bold: 700,
      heavy: 700,
    },

    line: {
      tight: 1.1,
      heading: 1.22,
      normal: isMobile ? 1.68 : 1.7,
      relaxed: isMobile ? 1.82 : 1.84,
    },

    letter: {
      hero: "-0.04em",
      heading: "-0.03em",
      body: isMobile ? "-0.008em" : "-0.01em",
      menu: "0.035em",
      wide: "0.08em",
    },
  };

  // 기존 호환
  const H1 = type.h1;
  const H2 = type.h2;
  const H3 = type.h3;
  const P = type.body;
  const P_LG = type.bodyLg;
  const S = type.small;

  // ---------------------------
  // Layout
  // ---------------------------
  const padXDesktop = layout.sectionPadDesktopX ?? 40;
  const padYDesktop = layout.sectionPadDesktopY ?? 110;
  const padXMobile = layout.sectionPadMobileX ?? 16;
  const padYMobile = layout.sectionPadMobileY ?? 56;

  // 요청사항 대응: 전체 박스/영역이 조금 더 크게 보이도록 기본 최대폭 소폭 상향
  const containerMax = layout.containerMax ?? 1320;

  const container = {
    width: "100%",
    maxWidth: containerMax,
    margin: "0 auto",
    paddingLeft: isMobile ? padXMobile : padXDesktop,
    paddingRight: isMobile ? padXMobile : padXDesktop,
    boxSizing: "border-box",
  };

  const sectionPad = {
    padding: isMobile
      ? `${padYMobile}px ${padXMobile}px`
      : `${padYDesktop}px ${padXDesktop}px`,
  };

  const sectionInner = {
    width: "100%",
    maxWidth: containerMax,
    margin: "0 auto",
    boxSizing: "border-box",
  };

  // ---------------------------
  // Fonts
  // ---------------------------
  const fonts = {
    nav: `"KoPubWorldDotum", "Pretendard", "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`,
    body: `"GmarketSans", "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`,
    display: `"GmarketSans", "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`,
  };

  // ---------------------------
  // Tokens
  // ---------------------------
  const tok = {
    radius: {
      xs: 10,
      sm: 12,
      md: 16,
      lg: 20,
      xl: 28,
      xxl: 36,
      pill: 999,
    },

    border: { w: 1 },

    shadow: {
      sm: "0 8px 22px rgba(0,0,0,0.18)",
      md: "0 12px 34px rgba(0,0,0,0.24)",
      lg: "0 22px 64px rgba(0,0,0,0.30)",
      xl: "0 30px 104px rgba(0,0,0,0.34)",
    },

    motion: {
      fast: "140ms",
      base: "220ms",
      slow: "420ms",
      ease: "cubic-bezier(.2,.8,.2,1)",
    },

    blur: {
      sm: "8px",
      md: "12px",
      lg: "18px",
    },
  };

  // ---------------------------
  // Themes
  // ---------------------------
  const themes = {
    dark: {
      bg: "#07090d",
      bgAlt: "#0d1117",
      bgElev: "rgba(255,255,255,0.06)",
      fg: "rgba(255,255,255,0.96)",
      sub: "rgba(255,255,255,0.82)",
      faint: "rgba(255,255,255,0.68)",

      border: "rgba(255,255,255,0.11)",
      borderStrong: "rgba(255,255,255,0.18)",

      pillBg: "rgba(255,255,255,0.08)",
      surface: "rgba(255,255,255,0.06)",
      surfaceHover: "rgba(255,255,255,0.095)",
      softBg: "rgba(255,255,255,0.04)",

      headerBg: "rgba(7,9,13,0.72)",
      headerBorder: "rgba(255,255,255,0.09)",

      btnBg: "#ffffff",
      btnFg: "#111111",
      outlineBorder: "rgba(255,255,255,0.24)",

      sectionOverlay:
        "linear-gradient(180deg, rgba(255,255,255,0.018), rgba(255,255,255,0))",
    },

    light: {
      bg: "#ffffff",
      bgAlt: "#f6f7fa",
      bgElev: "rgba(0,0,0,0.035)",
      fg: "rgba(0,0,0,0.9)",
      sub: "rgba(0,0,0,0.68)",
      faint: "rgba(0,0,0,0.52)",

      border: "rgba(0,0,0,0.10)",
      borderStrong: "rgba(0,0,0,0.16)",

      pillBg: "rgba(0,0,0,0.05)",
      surface: "rgba(0,0,0,0.03)",
      surfaceHover: "rgba(0,0,0,0.05)",
      softBg: "rgba(0,0,0,0.02)",

      headerBg: "rgba(255,255,255,0.82)",
      headerBorder: "rgba(0,0,0,0.06)",

      btnBg: "#111111",
      btnFg: "#ffffff",
      outlineBorder: "rgba(0,0,0,0.25)",

      sectionOverlay:
        "linear-gradient(180deg, rgba(0,0,0,0.02), rgba(0,0,0,0))",
    },
  };

  const pick = (name) => themes[name] ?? themes.dark;

  // ---------------------------
  // Brand System
  // ---------------------------
  const brandBase = data?.theme?.brand || data?.theme?.accent || "#C7A66A";
  const brandSecondaryBase = data?.theme?.secondary || "#8D6B3F";

  function hexToRgb(hex) {
    const raw = String(hex || "")
      .replace("#", "")
      .trim();

    const c =
      raw.length === 3
        ? raw
            .split("")
            .map((x) => x + x)
            .join("")
        : raw;

    const n = parseInt(c || "000000", 16);

    return {
      r: (n >> 16) & 255,
      g: (n >> 8) & 255,
      b: n & 255,
    };
  }

  const { r, g, b } = hexToRgb(brandBase);
  const { r: r2, g: g2, b: b2 } = hexToRgb(brandSecondaryBase);

  const brand = {
    base: brandBase,
    rgb: `${r}, ${g}, ${b}`,
    soft: `rgba(${r},${g},${b},0.11)`,
    softStrong: `rgba(${r},${g},${b},0.20)`,
    surface: `rgba(${r},${g},${b},0.09)`,
    border: `rgba(${r},${g},${b},0.38)`,
    borderStrong: `rgba(${r},${g},${b},0.56)`,
    glow: `0 0 0 1px rgba(${r},${g},${b},0.16), 0 12px 42px rgba(${r},${g},${b},0.19)`,
    hover: `rgba(${r},${g},${b},0.92)`,
    textOn: "#ffffff",

    secondary: {
      base: brandSecondaryBase,
      rgb: `${r2}, ${g2}, ${b2}`,
      soft: `rgba(${r2},${g2},${b2},0.10)`,
      border: `rgba(${r2},${g2},${b2},0.35)`,
      textOn: "#ffffff",
    },
  };

  // ---------------------------
  // Section helper
  // ---------------------------
  const section = (themeName = "dark", opts = {}) => {
    const t = pick(themeName);

    return {
      position: "relative",
      background: opts.background ?? t.bg,
      color: t.fg,
      borderTop:
        opts.borderTop === false
          ? "none"
          : `${tok.border.w}px solid ${opts.borderColor ?? t.border}`,
      padding: isMobile
        ? `${padYMobile}px ${padXMobile}px`
        : `${padYDesktop}px ${padXDesktop}px`,
      overflow: opts.overflow ?? "hidden",
      boxSizing: "border-box",
    };
  };

  // ---------------------------
  // Text helpers
  // ---------------------------
  const text = (themeName = "dark", opts = {}) => ({
    color: opts.color ?? pick(themeName).fg,
    fontFamily: opts.fontFamily ?? fonts.body,
    fontWeight: opts.fontWeight ?? type.weight.med,
    lineHeight: opts.lineHeight ?? type.line.normal,
    letterSpacing: opts.letterSpacing ?? type.letter.body,
    wordBreak: opts.wordBreak ?? "keep-all",
  });

  const subText = (themeName = "dark", opts = {}) => ({
    color: opts.color ?? pick(themeName).sub,
    fontFamily: opts.fontFamily ?? fonts.body,
    fontWeight: opts.fontWeight ?? type.weight.med,
    lineHeight: opts.lineHeight ?? type.line.relaxed,
    letterSpacing: opts.letterSpacing ?? type.letter.body,
    wordBreak: opts.wordBreak ?? "keep-all",
  });

  const titleText = (themeName = "dark", level = "h2", opts = {}) => {
    const t = pick(themeName);
    const size = level === "h1" ? type.h1 : level === "h3" ? type.h3 : type.h2;

    return {
      color: opts.color ?? t.fg,
      fontFamily: opts.fontFamily ?? fonts.display,
      fontSize: opts.fontSize ?? size,
      fontWeight:
        opts.fontWeight ??
        (level === "h1" ? type.weight.bold : type.weight.semibold),
      lineHeight:
        opts.lineHeight ??
        (level === "h1" ? type.line.tight : type.line.heading),
      letterSpacing:
        opts.letterSpacing ??
        (level === "h1" ? type.letter.hero : type.letter.heading),
      wordBreak: opts.wordBreak ?? "keep-all",
    };
  };

  const accentText = (opts = {}) => ({
    color: opts.color ?? brand.base,
    fontFamily: opts.fontFamily ?? fonts.display,
    fontWeight: opts.fontWeight ?? type.weight.bold,
    letterSpacing: opts.letterSpacing ?? type.letter.heading,
  });

  // ---------------------------
  // Header / Nav helpers
  // ---------------------------
  const headerStyle = (themeName = "dark") => {
    const t = pick(themeName);

    return {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      zIndex: 50,
      background: t.headerBg,
      backdropFilter: `blur(${tok.blur.md})`,
      WebkitBackdropFilter: `blur(${tok.blur.md})`,
      borderBottom: `${tok.border.w}px solid ${t.headerBorder}`,
    };
  };

  const navLink = (themeName = "dark", opts = {}) => {
    const t = pick(themeName);
    const active = !!opts.active;
    const useBrand = !!opts.useBrand;

    return {
      color: active || useBrand ? brand.base : opts.color ?? t.fg,
      textDecoration: "none",
      fontSize: opts.fontSize ?? type.menu,
      fontWeight:
        opts.fontWeight ??
        (active || useBrand ? type.weight.bold : type.weight.med),
      letterSpacing: opts.letterSpacing ?? type.letter.menu,
      opacity: opts.opacity ?? (active ? 1 : 0.9),
      whiteSpace: "nowrap",
      textTransform: opts.textTransform ?? "uppercase",
      fontFamily: opts.fontFamily ?? fonts.nav,
      transition: `opacity ${tok.motion.fast} ${tok.motion.ease}, color ${tok.motion.fast} ${tok.motion.ease}`,
    };
  };

  const pill = (themeName = "dark", opts = {}) => {
    const t = pick(themeName);

    return {
      display: "inline-flex",
      alignItems: "center",
      gap: opts.gap ?? 10,
      padding: opts.padding ?? (isMobile ? "8px 14px" : "10px 16px"),
      borderRadius: tok.radius.pill,
      background: opts.useBrand ? brand.soft : t.pillBg,
      fontSize: opts.fontSize ?? type.small,
      fontWeight: opts.fontWeight ?? type.weight.bold,
      color: opts.color ?? (opts.useBrand ? brand.base : t.fg),
      fontFamily: opts.fontFamily ?? fonts.body,
      border: `${tok.border.w}px solid ${
        opts.useBrand ? brand.border : t.border
      }`,
      letterSpacing: opts.letterSpacing ?? "0.02em",
      boxSizing: "border-box",
    };
  };

  const placeholderBox = (label, themeName = "dark") => {
    const t = pick(themeName);

    return {
      background: t.softBg,
      border: `${tok.border.w}px dashed ${t.border}`,
      borderRadius: tok.radius.md,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: t.sub,
      fontSize: type.small,
      fontWeight: type.weight.bold,
      letterSpacing: 0.2,
      textTransform: "uppercase",
      userSelect: "none",
      width: "100%",
      height: "100%",
      fontFamily: fonts.body,
    };
  };

  // ---------------------------
  // Background / decorative helpers
  // ---------------------------
  const sectionBgImage = (src, opts = {}) => ({
    position: "absolute",
    inset: 0,
    backgroundImage: src ? `url(${src})` : "none",
    backgroundSize: opts.size ?? "cover",
    backgroundPosition: opts.position ?? "center center",
    backgroundRepeat: "no-repeat",
    opacity: opts.opacity ?? 0.16,
    pointerEvents: "none",
    zIndex: opts.zIndex ?? 0,
    transform: opts.transform ?? "none",
  });

  const sectionOverlay = (themeName = "dark", opts = {}) => ({
    position: "absolute",
    inset: 0,
    background:
      opts.background ??
      `linear-gradient(180deg, rgba(7,9,13,0.68) 0%, rgba(7,9,13,0.58) 38%, rgba(7,9,13,0.84) 100%)`,
    pointerEvents: "none",
    zIndex: opts.zIndex ?? 1,
  });

  const goldLine = {
    height: 1,
    width: "100%",
    background: `linear-gradient(90deg, rgba(${brand.rgb},0) 0%, rgba(${brand.rgb},0.78) 50%, rgba(${brand.rgb},0) 100%)`,
  };

  // ---------------------------
  // UI Primitives
  // ---------------------------
  const ui = {
    card: (themeName = "dark", opts = {}) => {
      const t = pick(themeName);
      const {
        padding = isMobile ? "18px" : "22px",
        radius = tok.radius.xl,
        hover = false,
        variant = "default",
        flat = false,
        useBrandBorder = false,
      } = opts;

      const baseShadow = flat
        ? "none"
        : variant === "premium"
        ? tok.shadow.lg
        : variant === "brand"
        ? brand.glow
        : tok.shadow.sm;

      const resolvedBg =
        variant === "brand"
          ? `linear-gradient(180deg, rgba(${brand.rgb},0.12) 0%, rgba(255,255,255,0.05) 100%)`
          : t.surface;

      return {
        background: resolvedBg,
        border: `${tok.border.w}px solid ${
          useBrandBorder || variant === "brand" ? brand.border : t.border
        }`,
        borderRadius: radius,
        boxShadow: baseShadow,
        padding,
        color: t.fg,
        fontFamily: fonts.body,
        fontWeight: type.weight.med,
        letterSpacing: type.letter.body,
        boxSizing: "border-box",
        transition: `transform ${tok.motion.base} ${tok.motion.ease}, box-shadow ${tok.motion.base} ${tok.motion.ease}, background ${tok.motion.base} ${tok.motion.ease}, border-color ${tok.motion.base} ${tok.motion.ease}`,
        ...(hover
          ? {
              background:
                variant === "brand"
                  ? `linear-gradient(180deg, rgba(${brand.rgb},0.15) 0%, rgba(255,255,255,0.06) 100%)`
                  : t.surfaceHover ?? t.surface,
              borderColor:
                useBrandBorder || variant === "brand"
                  ? brand.borderStrong
                  : t.borderStrong ?? t.border,
              boxShadow: variant === "brand" ? brand.glow : tok.shadow.md,
              transform: "translateY(-2px)",
            }
          : null),
      };
    },

    panel: (themeName = "dark", opts = {}) => {
      const t = pick(themeName);
      const {
        padding = isMobile ? "16px 18px" : "18px 24px",
        radius = tok.radius.md,
        shadow = "md",
        glass = true,
        bg,
        borderColor,
        useBrand = false,
      } = opts;

      const resolvedShadow =
        shadow === "none" ? "none" : tok.shadow[shadow] ?? tok.shadow.md;

      const defaultGlassBg =
        themeName === "dark"
          ? "rgba(255,255,255,0.07)"
          : "rgba(255,255,255,0.74)";

      return {
        padding,
        borderRadius: radius,
        background:
          bg ??
          (useBrand
            ? `rgba(${brand.rgb},0.09)`
            : glass
            ? defaultGlassBg
            : t.surface),
        border: `${tok.border.w}px solid ${
          borderColor ?? (useBrand ? brand.border : t.border)
        }`,
        boxShadow: resolvedShadow,
        fontFamily: fonts.body,
        fontWeight: type.weight.med,
        letterSpacing: type.letter.body,
        boxSizing: "border-box",
        ...(glass
          ? {
              backdropFilter: `blur(${tok.blur.sm})`,
              WebkitBackdropFilter: `blur(${tok.blur.sm})`,
            }
          : null),
      };
    },

    btn: (themeName = "dark", variant = "primary", opts = {}) => {
      const t = pick(themeName);
      const { size = "md", glass = false, radius = 12 } = opts;

      const sizing =
        size === "sm"
          ? { padding: "10px 14px", fontSize: type.small }
          : size === "lg"
          ? {
              padding: isMobile ? "13px 18px" : "15px 24px",
              fontSize: type.body,
            }
          : { padding: "12px 18px", fontSize: type.small };

      const base = {
        ...sizing,
        borderRadius: radius,
        cursor: "pointer",
        fontWeight: type.weight.semibold,
        fontFamily: fonts.body,
        letterSpacing: type.letter.body,
        userSelect: "none",
        lineHeight: 1,
        transition: `transform ${tok.motion.fast} ${tok.motion.ease}, opacity ${tok.motion.fast} ${tok.motion.ease}, background ${tok.motion.fast} ${tok.motion.ease}, border-color ${tok.motion.fast} ${tok.motion.ease}, color ${tok.motion.fast} ${tok.motion.ease}`,
        ...(glass
          ? {
              backdropFilter: `blur(${tok.blur.sm})`,
              WebkitBackdropFilter: `blur(${tok.blur.sm})`,
            }
          : null),
      };

      if (variant === "outline") {
        return {
          ...base,
          border: `${tok.border.w}px solid ${brand.border}`,
          background: glass ? `rgba(${brand.rgb},0.08)` : "transparent",
          color: t.fg,
        };
      }

      if (variant === "brand") {
        return {
          ...base,
          border: `${tok.border.w}px solid ${brand.base}`,
          background: brand.base,
          color: brand.textOn,
          boxShadow: `0 10px 30px rgba(${brand.rgb},0.20)`,
        };
      }

      if (variant === "brandSecondary") {
        return {
          ...base,
          border: `${tok.border.w}px solid ${brand.secondary.base}`,
          background: brand.secondary.base,
          color: brand.secondary.textOn,
        };
      }

      if (variant === "ghost") {
        return {
          ...base,
          border: `${tok.border.w}px solid ${t.border}`,
          background: "transparent",
          color: t.fg,
        };
      }

      return {
        ...base,
        border: `${tok.border.w}px solid ${t.btnBg}`,
        background: t.btnBg,
        color: t.btnFg,
      };
    },

    mediaFrame: (themeName = "dark", opts = {}) => {
      const t = pick(themeName);
      const {
        radius = tok.radius.lg,
        shadow = "sm",
        borderColor,
        useBrandBorder = false,
      } = opts;

      return {
        background: t.surface,
        border: `${tok.border.w}px solid ${
          borderColor ?? (useBrandBorder ? brand.border : t.border)
        }`,
        borderRadius: radius,
        overflow: "hidden",
        boxShadow: tok.shadow[shadow] ?? tok.shadow.sm,
      };
    },

    iconCard: (themeName = "dark", opts = {}) => ({
      display: "grid",
      gridTemplateColumns: "44px 1fr",
      gap: 12,
      alignItems: "start",
      ...ui.card(themeName, {
        padding: isMobile ? "16px" : "18px",
        radius: tok.radius.md,
        flat: true,
        ...opts,
      }),
    }),

    input: (themeName = "dark", opts = {}) => {
      const t = pick(themeName);

      return {
        width: "100%",
        minHeight: opts.minHeight ?? (isMobile ? 48 : 52),
        padding: opts.padding ?? (isMobile ? "13px 14px" : "15px 16px"),
        borderRadius: opts.radius ?? 14,
        border: `${tok.border.w}px solid ${
          opts.useBrand ? brand.border : t.border
        }`,
        background: opts.background ?? t.surface,
        color: t.fg,
        fontFamily: fonts.body,
        fontSize: opts.fontSize ?? type.body,
        fontWeight: type.weight.med,
        lineHeight: type.line.normal,
        letterSpacing: type.letter.body,
        outline: "none",
        boxSizing: "border-box",
      };
    },

    textarea: (themeName = "dark", opts = {}) => {
      const t = pick(themeName);

      return {
        width: "100%",
        minHeight: opts.minHeight ?? 152,
        padding: opts.padding ?? (isMobile ? "13px 14px" : "15px 16px"),
        borderRadius: opts.radius ?? 14,
        border: `${tok.border.w}px solid ${
          opts.useBrand ? brand.border : t.border
        }`,
        background: opts.background ?? t.surface,
        color: t.fg,
        fontFamily: fonts.body,
        fontSize: opts.fontSize ?? type.body,
        fontWeight: type.weight.med,
        lineHeight: type.line.normal,
        letterSpacing: type.letter.body,
        outline: "none",
        boxSizing: "border-box",
        resize: opts.resize ?? "vertical",
      };
    },
  };

  // ---------------------------
  // Legacy helpers
  // ---------------------------
  const iconCard = (themeName = "dark") => ui.iconCard(themeName);

  const iconSquare = (themeName = "dark") => {
    const t = pick(themeName);

    return {
      width: 44,
      height: 44,
      borderRadius: 12,
      background: themeName === "dark" ? brand.softStrong : brand.soft,
      border: `1px solid ${brand.border}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: type.weight.bold,
      color: t.fg,
      fontFamily: fonts.body,
      boxSizing: "border-box",
    };
  };

  const btnPrimary = (themeName = "dark") => ui.btn(themeName, "primary");
  const btnOutline = (themeName = "dark") => ui.btn(themeName, "outline");
  const btnBrand = (themeName = "dark") => ui.btn(themeName, "brand");
  const btnGhost = (themeName = "dark") => ui.btn(themeName, "ghost");

  const darkBtn = btnPrimary("dark");
  const outlineBtn = btnOutline("dark");

  return {
    H1,
    H2,
    H3,
    P,
    P_LG,
    S,
    type,

    container,
    sectionPad,
    sectionInner,
    padXDesktop,
    padXMobile,
    padYDesktop,
    padYMobile,
    containerMax,

    fonts,
    themes,
    tok,

    brand,

    section,
    text,
    subText,
    titleText,
    accentText,
    headerStyle,
    navLink,
    pill,
    placeholderBox,
    sectionBgImage,
    sectionOverlay,
    goldLine,

    iconCard,
    iconSquare,
    btnPrimary,
    btnOutline,
    btnBrand,
    btnGhost,
    darkBtn,
    outlineBtn,

    ui,
  };
}