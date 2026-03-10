// src/components/sections/FieldsSection.js
import React, {
  useMemo,
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";

export default function FieldsSection({
  data,
  isMobile,
  styles,
  theme = "dark",
}) {
  const fields = data?.fields || {};
  const photosRaw = fields?.rollingPhotos || [];

  const photosBase = useMemo(
    () =>
      (Array.isArray(photosRaw) ? photosRaw : []).filter(
        (p) => p && (p.src || p.label)
      ),
    [photosRaw]
  );

  const bgImage = data?.sectionBg?.fields || "";

  // 무한 루프용 복제
  const times = 3;
  const photos = useMemo(() => {
    if (!photosBase.length) return [];
    return Array.from({ length: times }, () => photosBase).flat();
  }, [photosBase]);

  // ✅ PPT 기준 텍스트 반영
  const titleText = "주요 사업분야";
  const subtitleText =
    "정부, 공공기관, 학술단체 및 민간기업 등이 개최하는 국내/외 행사";
  const summaryLines = [
    "VIP, 국무총리, 장관급 등 격식 행사",
    "국제회의, 컨퍼런스, 포럼, 심포지엄, 학술대회, 세미나 등 학술관련 행사",
    "기념식, 시상식, 비전선포식, 프로모션 등 부대 행사",
    "온라인 및 하이브리드 행사",
  ];

  // 다크 톤
  const bg = "#05070C";
  const fg = "#fff";
  const sub = "rgba(255,255,255,0.82)";
  const subSoft = "rgba(255,255,255,0.72)";
  const border = "rgba(255,255,255,0.14)";
  const borderHover = "rgba(255,255,255,0.22)";
  const gold = styles?.brand?.base || "#C7A66A";

  // 롤링
  const scrollerRef = useRef(null);
  const rafRef = useRef(0);
  const pausedRef = useRef(false);

  // 속도
  const speedPxPerSec = isMobile ? 40 : 58;

  // 1세트 폭
  const baseWidthRef = useRef(0);

  // 이미지 로딩 타이밍 보정
  const [imgLoadedTick, setImgLoadedTick] = useState(0);

  const cardW = isMobile ? 240 : 290;
  const imgH = isMobile ? 150 : 176;

  const measureBaseWidth = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const total = el.scrollWidth || 0;
    const baseW = total > 0 ? total / times : 0;
    baseWidthRef.current = baseW;

    if (baseW > 0 && el.scrollLeft > baseW) {
      el.scrollLeft = el.scrollLeft % baseW;
    }
  }, []);

  useEffect(() => {
    measureBaseWidth();
    const onResize = () => measureBaseWidth();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measureBaseWidth]);

  useEffect(() => {
    measureBaseWidth();
  }, [imgLoadedTick, measureBaseWidth, photos.length]);

  // 무한 자동 스크롤
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || !photos.length || !photosBase.length) return;

    let last = performance.now();

    const tick = (now) => {
      if (!el) return;

      const dt = Math.min(48, now - last);
      last = now;

      if (!pausedRef.current) {
        el.scrollLeft += (speedPxPerSec * dt) / 1000;
      }

      const baseW = baseWidthRef.current;
      if (baseW > 0 && el.scrollLeft >= baseW) {
        el.scrollLeft -= baseW;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [photos.length, photosBase.length, speedPxPerSec]);

  // 잡으면 멈춤
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const pause = () => (pausedRef.current = true);
    const resume = () => (pausedRef.current = false);

    const onPointerDown = () => pause();
    const onPointerUp = () => resume();
    const onTouchStart = () => pause();
    const onTouchEnd = () => resume();

    let wheelTimer = null;
    const onWheel = () => {
      pause();
      if (wheelTimer) clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => resume(), 800);
    };

    el.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: true });

    const onEnter = () => pause();
    const onLeave = () => resume();
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("wheel", onWheel);
      if (wheelTimer) clearTimeout(wheelTimer);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // 접근성: reduce motion
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      if (mq.matches) pausedRef.current = true;
    };
    apply();
    if (mq.addEventListener) mq.addEventListener("change", apply);
    else mq.addListener(apply);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", apply);
      else mq.removeListener(apply);
    };
  }, []);

  return (
    <section
      id="fields"
      style={{
        ...styles.sectionPad,
        position: "relative",
        background: bg,
        color: fg,
        overflow: "hidden",
      }}
    >
      <style>{`
        .csbBg {
          position: absolute;
          inset: 0;
          z-index: 0;
          background-position: center center;
          background-size: cover;
          background-repeat: no-repeat;
          opacity: 0.24;
          transform: scale(1.02);
        }

        .csbBgOverlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background:
            linear-gradient(
              180deg,
              rgba(0,0,0,0.44) 0%,
              rgba(0,0,0,0.58) 34%,
              rgba(0,0,0,0.76) 100%
            );
        }

        .csbVignette {
          position: absolute;
          inset: -2px;
          z-index: 1;
          pointer-events: none;
          background:
            radial-gradient(1200px 520px at 20% 10%, rgba(47,107,255,0.16), transparent 55%),
            radial-gradient(700px 320px at 18% 22%, rgba(199,166,106,0.12), transparent 62%),
            radial-gradient(900px 520px at 55% 110%, rgba(0,0,0,0.70), transparent 55%);
          filter: saturate(1.02);
          opacity: 0.98;
        }

        .csbScroller {
          -ms-overflow-style: none;
          scrollbar-width: none;
          overscroll-behavior-x: contain;
          -webkit-overflow-scrolling: touch;
        }
        .csbScroller::-webkit-scrollbar { display:none; }

        .csbMask {
          position: relative;
        }

        .csbMask:before,
        .csbMask:after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          width: 52px;
          pointer-events: none;
          z-index: 3;
        }

        .csbMask:before {
          left: -2px;
          background: linear-gradient(90deg, ${bg} 0%, rgba(0,0,0,0) 100%);
        }

        .csbMask:after {
          right: -2px;
          background: linear-gradient(270deg, ${bg} 0%, rgba(0,0,0,0) 100%);
        }

        @media (hover:hover) and (pointer:fine) {
          .csbCard {
            transition:
              transform 180ms ease,
              box-shadow 180ms ease,
              border-color 180ms ease,
              background 180ms ease;
          }
          .csbCard:hover {
            transform: translateY(-3px);
            border-color: ${borderHover};
            box-shadow: 0 22px 70px rgba(0,0,0,0.70);
            background: rgba(255,255,255,0.06);
          }
        }
      `}</style>

      {bgImage ? (
        <div
          className="csbBg"
          style={{
            backgroundImage: `url(${bgImage})`,
          }}
        />
      ) : null}

      <div className="csbBgOverlay" />
      <div className="csbVignette" />

      <div style={{ ...styles.container, position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: 980, marginTop: 6 }}>
          <h2
            style={{
              margin: 0,
              fontSize: isMobile
                ? "clamp(28px, 8vw, 36px)"
                : "clamp(34px, 3.6vw, 44px)",
              fontWeight: 500,
              letterSpacing: "-0.035em",
              lineHeight: 1.14,
              fontFamily:
                styles?.fonts?.body ||
                styles?.fonts?.display ||
                "GmarketSans, sans-serif",
              color: fg,
              wordBreak: "keep-all",
            }}
          >
            {titleText}
          </h2>

          <div
            style={{
              marginTop: 10,
              fontSize: isMobile ? "13.5px" : "15px",
              color: subSoft,
              maxWidth: 920,
              lineHeight: 1.7,
              fontFamily:
                styles?.fonts?.body ||
                styles?.fonts?.display ||
                "GmarketSans, sans-serif",
              wordBreak: "keep-all",
            }}
          >
            {subtitleText}
          </div>

          <ul
            style={{
              margin: "14px 0 0",
              paddingLeft: isMobile ? 18 : 20,
              color: sub,
              fontSize: isMobile ? "13.5px" : "15px",
              lineHeight: 1.75,
              fontFamily:
                styles?.fonts?.body ||
                styles?.fonts?.display ||
                "GmarketSans, sans-serif",
              wordBreak: "keep-all",
            }}
          >
            {summaryLines.map((line, idx) => (
              <li key={idx} style={{ marginTop: idx === 0 ? 0 : 4 }}>
                {line}
              </li>
            ))}
          </ul>

          <div
            style={{
              width: "100%",
              height: 1,
              marginTop: 18,
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.03) 100%)",
            }}
          />
        </div>

        <div style={{ marginTop: isMobile ? 18 : 22, position: "relative" }}>
          <div className="csbMask">
            <div
              ref={scrollerRef}
              className="csbScroller"
              style={{
                display: "flex",
                gap: isMobile ? 12 : 16,
                overflowX: "auto",
                padding: "10px 4px",
                scrollBehavior: "auto",
              }}
            >
              {photos.length === 0 ? (
                <div style={{ height: imgH + 48 }} />
              ) : (
                photos.map((ph, idx) => (
                  <div
                    key={`${ph?.src || ph?.label || "ph"}_${idx}`}
                    style={{ flex: "0 0 auto", width: cardW }}
                  >
                    <div
                      className="csbCard"
                      style={{
                        borderRadius: 18,
                        overflow: "hidden",
                        background: "rgba(255,255,255,0.04)",
                        border: `1px solid ${border}`,
                        boxShadow: "0 12px 38px rgba(0,0,0,0.58)",
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                      }}
                    >
                      <div style={{ position: "relative" }}>
                        {ph?.src ? (
                          <img
                            src={ph.src}
                            alt={ph.label || ""}
                            onLoad={() => setImgLoadedTick((n) => n + 1)}
                            style={{
                              width: "100%",
                              height: imgH,
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              height: imgH,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "rgba(255,255,255,0.35)",
                              fontWeight: 500,
                              letterSpacing: 2,
                              fontFamily:
                                styles?.fonts?.body ||
                                styles?.fonts?.display ||
                                "GmarketSans, sans-serif",
                            }}
                          >
                            PHOTO
                          </div>
                        )}

                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background:
                              "linear-gradient(180deg, rgba(0,0,0,0.00) 55%, rgba(0,0,0,0.42) 100%)",
                            pointerEvents: "none",
                          }}
                        />
                      </div>

                      <div
                        style={{
                          padding: "12px 12px",
                          background: "rgba(0,0,0,0.58)",
                          borderTop: `1px solid ${border}`,
                          textAlign: "center",
                          fontSize: isMobile ? 12.8 : 13.6,
                          fontWeight: 500,
                          letterSpacing: "-0.02em",
                          color: fg,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontFamily:
                            styles?.fonts?.body ||
                            styles?.fonts?.display ||
                            "GmarketSans, sans-serif",
                        }}
                        title={ph?.label || ""}
                      >
                        {ph?.label || ""}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {isMobile && photosBase.length > 1 && (
            <div
              style={{
                marginTop: 8,
                color: subSoft,
                fontSize: styles.S,
                fontFamily:
                  styles?.fonts?.body ||
                  styles?.fonts?.display ||
                  "GmarketSans, sans-serif",
              }}
            >
              터치하면 잠시 멈추고, 놓으면 다시 흐릅니다.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}