// src/components/Header.js
import React, { useEffect, useMemo, useRef, useState } from "react";

export default function Header({ data, styles }) {
  const themeName = data?.theme?.name ?? "dark";
  const theme = styles?.themes?.[themeName] ?? styles?.themes?.dark ?? {};
  const tok = styles?.tok ?? { border: { w: 1 }, radius: { pill: 999 } };

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(!!mq.matches);

    update();

    if (mq.addEventListener) mq.addEventListener("change", update);
    else mq.addListener(update);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", update);
      else mq.removeListener(update);
    };
  }, []);

  const headerH = data?.layout?.headerHeight ?? (isMobile ? 58 : 68);

  const navItems = useMemo(() => data?.brand?.nav || [], [data]);
  const [activeId, setActiveId] = useState("");

  const logoSrc = "/capstone_logo_remove.png";

  const brand = styles?.brand?.base || "#C7A66A";
  const brandBorder = styles?.brand?.border || "rgba(199,166,106,0.34)";
  const brandBorderStrong =
    styles?.brand?.borderStrong || "rgba(199,166,106,0.5)";
  const brandSoftStrong =
    styles?.brand?.softStrong || "rgba(199,166,106,0.18)";
  const brandRgb = styles?.brand?.rgb || "199, 166, 106";

  const normalizeId = (id) => String(id || "").replace(/^#/, "");

  const getEl = (id) => {
    const key = normalizeId(id);
    if (!key) return null;
    return document.getElementById(key);
  };

  const scrollToEl = (el) => {
    if (!el) return;

    const y = window.scrollY + el.getBoundingClientRect().top - (headerH + 12);

    try {
      window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    } catch {
      window.scrollTo(0, Math.max(0, y));
    }

    setTimeout(() => {
      const y2 =
        window.scrollY + el.getBoundingClientRect().top - (headerH + 12);

      try {
        window.scrollTo({ top: Math.max(0, y2), behavior: "smooth" });
      } catch {
        window.scrollTo(0, Math.max(0, y2));
      }
    }, 70);
  };

  const scrollToId = (id) => {
    const key = normalizeId(id);
    const el = getEl(key);

    if (key) window.location.hash = `#${key}`;
    if (el) scrollToEl(el);
  };

  const onNavClick = (e, id) => {
    e.preventDefault();
    scrollToId(id);
  };

  const onLogoClick = (e) => {
    e.preventDefault();
    const introEl = getEl("intro");
    if (introEl) scrollToEl(introEl);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const ids = navItems.map((n) => normalizeId(n.id)).filter(Boolean);
    const els = ids.map((id) => getEl(id)).filter(Boolean);
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0)
          );

        if (visible[0]?.target?.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        root: null,
        rootMargin: `-${headerH + 12}px 0px -58% 0px`,
        threshold: [0.12, 0.2, 0.35, 0.5, 0.7],
      }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [navItems, headerH]);

  const primaryCountMobile = 1;
  const primaryNav = isMobile
    ? navItems.slice(0, primaryCountMobile)
    : navItems;
  const moreNav = isMobile ? navItems.slice(primaryCountMobile) : [];

  const [moreOpen, setMoreOpen] = useState(false);
  const moreWrapRef = useRef(null);

  useEffect(() => {
    if (!moreOpen) return;

    const onDown = (e) => {
      const box = moreWrapRef.current;
      if (!box) return;
      if (!box.contains(e.target)) setMoreOpen(false);
    };

    const onEsc = (e) => {
      if (e.key === "Escape") setMoreOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);

    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [moreOpen]);

  useEffect(() => {
    if (!isMobile) setMoreOpen(false);
  }, [isMobile]);

  const headerGlass =
    themeName === "dark" ? "rgba(7,9,13,0.72)" : "rgba(255,255,255,0.84)";
  const borderLine =
    theme.headerBorder ?? theme.border ?? "rgba(255,255,255,0.08)";

  const navWrapBg =
    themeName === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.035)";

  const navWrapBorder =
    themeName === "dark" ? "rgba(255,255,255,0.085)" : "rgba(0,0,0,0.07)";

  const activePillBg =
    themeName === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.045)";

  const goldPillBg =
    themeName === "dark"
      ? `rgba(${brandRgb},0.12)`
      : `rgba(${brandRgb},0.10)`;

  const logoHDesktop = 46;
  const logoHMobile = 36;

  const innerPadYDesktop = 9;
  const innerPadYMobile = 7;

  const moreBtnStyle = {
    ...styles.navLink(themeName),
    fontFamily: styles.fonts?.nav,
    padding: isMobile ? "6px 10px" : "7px 11px",
    borderRadius: tok.radius.pill,
    border: `${tok.border.w}px solid ${moreOpen ? brandBorder : "transparent"}`,
    background: moreOpen ? activePillBg : "transparent",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
    userSelect: "none",
    lineHeight: 1.1,
    color: theme.fg,
  };

  const dropdownCardStyle = {
    position: "absolute",
    right: 0,
    top: "calc(100% + 10px)",
    minWidth: 230,
    borderRadius: 18,
    border: `${tok.border.w}px solid ${navWrapBorder}`,
    background:
      themeName === "dark" ? "rgba(10,12,16,0.94)" : "rgba(255,255,255,0.97)",
    boxShadow:
      themeName === "dark"
        ? "0 22px 70px rgba(0,0,0,0.56)"
        : "0 22px 70px rgba(11,18,32,0.14)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    overflow: "hidden",
    zIndex: 9999,
  };

  const dropdownItemStyle = (_, isActive) => {
    return {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      padding: "12px 14px",
      textDecoration: "none",
      color: isActive ? brand : theme.fg,
      fontFamily: styles.fonts?.nav,
      fontWeight: 700,
      fontSize: styles.type?.small ?? styles.S,
      letterSpacing: styles.type?.letter?.menu ?? "0.03em",
      textTransform: "uppercase",
      background: isActive
        ? themeName === "dark"
          ? `rgba(${brandRgb},0.12)`
          : `rgba(${brandRgb},0.09)`
        : "transparent",
      borderLeft: `${tok.border.w}px solid ${isActive ? brand : "transparent"}`,
      cursor: "pointer",
      boxSizing: "border-box",
    };
  };

  return (
    <header
      style={{
        ...styles.headerStyle(themeName),
        height: headerH,
        background: headerGlass,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: `${tok.border.w}px solid ${borderLine}`,
        display: "flex",
        alignItems: "center",
      }}
    >
      <style>{`
        @media (hover:hover) and (pointer:fine) {
          .capLogo {
            transition: opacity 170ms ease, transform 170ms ease, filter 170ms ease;
          }
          .capLogo:hover {
            opacity: 0.96;
            transform: translateY(-1px);
            filter: saturate(1.04);
          }

          .capNavLink {
            transition: transform 160ms ease, opacity 160ms ease, background 160ms ease, border-color 160ms ease, color 160ms ease;
          }
          .capNavLink:hover {
            transform: translateY(-1px);
            opacity: 1;
          }

          .capMoreBtn:hover {
            transform: translateY(-1px);
            opacity: 1;
          }

          .capDropItem:hover {
            background: ${
              themeName === "dark"
                ? "rgba(255,255,255,0.055)"
                : "rgba(0,0,0,0.04)"
            };
          }

          .capHeaderInner {
            padding: ${innerPadYDesktop}px ${styles.padXDesktop}px;
          }

          .capLogoImg {
            height: ${logoHDesktop}px;
          }

          .capNavWrap {
            padding: 6px 10px;
          }

          @media (max-width: 768px) {
            .capHeaderInner {
              padding: ${innerPadYMobile}px ${styles.padXMobile}px;
            }

            .capLogoImg {
              height: ${logoHMobile}px;
            }

            .capNavWrap {
              padding: 5px 8px;
            }
          }
        }
      `}</style>

      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            themeName === "dark"
              ? `
                radial-gradient(580px 220px at 12% 24%, rgba(${brandRgb},0.12), transparent 62%),
                radial-gradient(420px 180px at 84% 24%, rgba(255,255,255,0.04), transparent 66%)
              `
              : `
                radial-gradient(640px 240px at 12% 24%, rgba(${brandRgb},0.10), transparent 62%),
                radial-gradient(480px 200px at 84% 24%, rgba(0,0,0,0.03), transparent 66%)
              `,
          opacity: themeName === "dark" ? 0.9 : 1,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 1,
          background: `linear-gradient(90deg, rgba(${brandRgb},0) 0%, rgba(${brandRgb},0.52) 50%, rgba(${brandRgb},0) 100%)`,
          pointerEvents: "none",
          opacity: 0.8,
        }}
      />

      <div
        className="capHeaderInner"
        style={{
          ...styles.container,
          position: "relative",
          height: "100%",
          display: "flex",
          alignItems: "center",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            minWidth: 0,
          }}
        >
          <a
            href="#"
            onClick={onLogoClick}
            className="capLogo"
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              color: "inherit",
              cursor: "pointer",
              userSelect: "none",
              padding: "2px 2px",
              flex: "0 0 auto",
              lineHeight: 1,
            }}
            aria-label="CAPSTONE Home"
          >
            <img
              src={logoSrc}
              alt={data?.brand?.logoText || "CAPSTONE"}
              className="capLogoImg"
              style={{
                width: "auto",
                display: "block",
                objectFit: "contain",
                filter:
                  themeName === "dark"
                    ? "drop-shadow(0 6px 18px rgba(0,0,0,0.22))"
                    : "none",
              }}
            />
          </a>

          <nav
            className="capNavWrap"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              justifyContent: "flex-end",
              flexWrap: "nowrap",
              overflow: "visible",
              borderRadius: tok.radius.pill,
              background: navWrapBg,
              border: `${tok.border.w}px solid ${navWrapBorder}`,
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              flex: "0 1 auto",
              maxWidth: isMobile ? "72vw" : "min(80vw, 900px)",
              boxShadow:
                themeName === "dark"
                  ? "inset 0 1px 0 rgba(255,255,255,0.04)"
                  : "inset 0 1px 0 rgba(255,255,255,0.35)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: isMobile ? 6 : 8,
                flexWrap: "nowrap",
                overflow: "hidden",
                minWidth: 0,
              }}
            >
              {primaryNav.map((n) => {
                const id = normalizeId(n.id);
                const isActive = id && id === activeId;

                return (
                  <a
                    key={id}
                    href={`#${id}`}
                    onClick={(e) => onNavClick(e, id)}
                    className="capNavLink"
                    style={{
                      ...styles.navLink(themeName),
                      fontFamily: styles.fonts?.nav,
                      position: "relative",
                      fontWeight: 700,
                      opacity: isActive ? 1 : 0.92,
                      padding: isMobile ? "6px 9px" : "7px 11px",
                      borderRadius: tok.radius.pill,
                      background: isActive ? goldPillBg : "transparent",
                      border: `${tok.border.w}px solid ${
                        isActive ? brandBorderStrong : "transparent"
                      }`,
                      color: isActive ? brand : theme.fg,
                      whiteSpace: "nowrap",
                      lineHeight: 1.1,
                      textTransform: "uppercase",
                      letterSpacing: styles.type?.letter?.menu ?? "0.04em",
                    }}
                  >
                    {n.label}
                    <span
                      style={{
                        position: "absolute",
                        left: 10,
                        right: 10,
                        bottom: 4,
                        height: 2,
                        borderRadius: 999,
                        background: isActive ? brand : "transparent",
                        opacity: isActive ? 0.95 : 0,
                        transform: isActive ? "scaleX(1)" : "scaleX(0.7)",
                        transition: "opacity 160ms ease, transform 160ms ease",
                        boxShadow: isActive
                          ? `0 10px 22px ${brandSoftStrong}`
                          : "none",
                        pointerEvents: "none",
                      }}
                    />
                  </a>
                );
              })}
            </div>

            {isMobile && moreNav.length > 0 && (
              <div
                ref={moreWrapRef}
                style={{ position: "relative", flex: "0 0 auto" }}
              >
                <button
                  type="button"
                  className="capMoreBtn"
                  onClick={() => setMoreOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={moreOpen}
                  style={moreBtnStyle}
                >
                  More
                  <span
                    aria-hidden="true"
                    style={{
                      width: 8,
                      height: 8,
                      borderRight: `2px solid ${theme.fg}`,
                      borderBottom: `2px solid ${theme.fg}`,
                      transform: moreOpen
                        ? "rotate(-135deg) translateY(-1px)"
                        : "rotate(45deg) translateY(-1px)",
                      opacity: 0.8,
                      marginLeft: 2,
                    }}
                  />
                </button>

                {moreOpen && (
                  <div style={dropdownCardStyle} role="menu">
                    <div
                      style={{
                        height: 1,
                        background:
                          themeName === "dark"
                            ? "rgba(255,255,255,0.10)"
                            : "rgba(0,0,0,0.08)",
                      }}
                    />

                    <div style={{ padding: "6px 6px" }}>
                      {moreNav.map((n) => {
                        const id = normalizeId(n.id);
                        const isActive = id && id === activeId;

                        return (
                          <a
                            key={id}
                            href={`#${id}`}
                            className="capDropItem"
                            role="menuitem"
                            onClick={(e) => {
                              setMoreOpen(false);
                              onNavClick(e, id);
                            }}
                            style={{
                              ...dropdownItemStyle(n, isActive),
                              borderRadius: 12,
                              margin: "2px 0",
                            }}
                          >
                            <span>{n.label}</span>
                            {isActive && (
                              <span
                                aria-hidden="true"
                                style={{
                                  width: 7,
                                  height: 7,
                                  borderRadius: 999,
                                  background: brand,
                                  boxShadow: `0 10px 22px ${brandSoftStrong}`,
                                }}
                              />
                            )}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}