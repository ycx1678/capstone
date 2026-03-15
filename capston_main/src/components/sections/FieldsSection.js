import React, {
  useMemo,
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";
import SectionLabel from "../SectionLabel";
import { normalizeRollingPhotos } from "../../data/siteData";

export default function FieldsSection({
  data,
  isMobile,
  styles,
  theme = "dark",
}) {
  const fields = data?.fields || {};
  const photosRaw = useMemo(
    () => normalizeRollingPhotos(fields?.rollingPhotos),
    [fields?.rollingPhotos]
  );

  const photosBase = useMemo(
    () =>
      photosRaw.filter((p) => {
        return p && (p.src || p.label);
      }),
    [photosRaw]
  );

  const bgImage = data?.sectionBg?.fields || "";

  const photos = useMemo(() => {
    if (!photosBase.length) return [];
    return [...photosBase, ...photosBase];
  }, [photosBase]);

  const eyebrowText = fields?.tagTitle || "Portfolio";
  const titleText = fields?.title || "주요 사업분야";
  const subtitleText =
    fields?.subtitle ||
    "정부, 공공기관, 학술단체 및 민간기업 등이 개최하는 국내/외 행사";

  const summaryLines =
    Array.isArray(fields?.summaryLines) && fields.summaryLines.length
      ? fields.summaryLines
      : [
          "VIP, 국무총리, 장관급 등 격식 행사",
          "국제회의, 컨퍼런스, 포럼, 심포지엄, 학술대회, 세미나 등 학술관련 행사",
          "기념식, 시상식, 비전선포식, 프로모션 등 부대 행사",
          "온라인 및 하이브리드 행사",
        ];

  const bg = "#05070C";
  const fg = "#fff";
  const sub = "rgba(255,255,255,0.86)";
  const subSoft = "rgba(255,255,255,0.76)";
  const border = "rgba(255,255,255,0.14)";
  const borderHover = "rgba(255,255,255,0.22)";

  const trackRef = useRef(null);
  const firstSetRef = useRef(null);
  const pausedRef = useRef(false);

  const speedPxPerSec = isMobile ? 40 : 58;
  const [imgLoadedTick, setImgLoadedTick] = useState(0);
  const [loopWidth, setLoopWidth] = useState(0);

  const cardW = isMobile ? 248 : 304;
  const imgH = isMobile ? 156 : 184;
  const gapPx = isMobile ? 12 : 16;

  const measureLoopWidth = useCallback(() => {
    const first = firstSetRef.current;
    if (!first) return;
    const width = first.getBoundingClientRect().width || 0;
    setLoopWidth(width);
  }, []);

  useEffect(() => {
    measureLoopWidth();
    const onResize = () => measureLoopWidth();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measureLoopWidth]);

  useEffect(() => {
    measureLoopWidth();
  }, [imgLoadedTick, measureLoopWidth, photosBase.length, isMobile]);

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

  const durationSec =
    loopWidth > 0 ? Math.max(12, loopWidth / speedPxPerSec) : 24;

  const pause = useCallback(() => {
    pausedRef.current = true;
    if (trackRef.current) {
      trackRef.current.style.animationPlayState = "paused";
    }
  }, []);

  const resume = useCallback(() => {
    pausedRef.current = false;
    if (trackRef.current) {
      trackRef.current.style.animationPlayState = "running";
    }
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

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

    const onEnter = () => pause();
    const onLeave = () => resume();

    track.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    track.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    track.addEventListener("wheel", onWheel, { passive: true });
    track.addEventListener("mouseenter", onEnter);
    track.addEventListener("mouseleave", onLeave);

    return () => {
      track.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      track.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      track.removeEventListener("wheel", onWheel);
      if (wheelTimer) clearTimeout(wheelTimer);
      track.removeEventListener("mouseenter", onEnter);
      track.removeEventListener("mouseleave", onLeave);
    };
  }, [pause, resume]);

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

        .csbMask {
          position: relative;
          overflow: hidden;
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

        .csbViewport {
          overflow: hidden;
          width: 100%;
          padding: 10px 4px;
        }

        .csbTrack {
          display: flex;
          align-items: stretch;
          gap: ${gapPx}px;
          width: max-content;
          will-change: transform;
          transform: translate3d(0, 0, 0);
          animation-name: csbMarquee;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          animation-duration: ${durationSec}s;
          animation-play-state: running;
        }

        .csbSet {
          display: flex;
          align-items: stretch;
          gap: ${gapPx}px;
          width: max-content;
          flex: 0 0 auto;
        }

        @keyframes csbMarquee {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(calc(-1 * var(--csb-loop-width, 0px)), 0, 0);
          }
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
        <div style={{ maxWidth: 1020, marginTop: 6 }}>
          <SectionLabel text={eyebrowText} styles={styles} />

          <h2
            style={{
              margin: "14px 0 0",
              fontSize: isMobile
                ? "clamp(28px, 8vw, 36px)"
                : "clamp(34px, 3.6vw, 46px)",
              fontWeight: 700,
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
              fontSize: isMobile ? "13.5px" : "15.5px",
              color: subSoft,
              maxWidth: 940,
              lineHeight: 1.72,
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
              lineHeight: 1.78,
              fontFamily:
                styles?.fonts?.body ||
                styles?.fonts?.display ||
                "GmarketSans, sans-serif",
              wordBreak: "keep-all",
            }}
          >
            {summaryLines.map((line, idx) => (
              <li key={idx} style={{ marginTop: idx === 0 ? 0 : 5 }}>
                {line}
              </li>
            ))}
          </ul>

          <div
            style={{
              width: "100%",
              height: 1,
              marginTop: 20,
              background:
                "linear-gradient(90deg, rgba(199,166,106,0.40) 0%, rgba(255,255,255,0.03) 100%)",
            }}
          />
        </div>

        <div style={{ marginTop: isMobile ? 20 : 24, position: "relative" }}>
          <div className="csbMask">
            <div className="csbViewport">
              {photos.length === 0 ? (
                <div style={{ height: imgH + 52 }} />
              ) : (
                <div
                  ref={trackRef}
                  className="csbTrack"
                  style={{
                    "--csb-loop-width": `${loopWidth}px`,
                  }}
                >
                  <div ref={firstSetRef} className="csbSet">
                    {photosBase.map((ph, idx) => (
                      <div
                        key={`set1_${ph?.src || ph?.label || "ph"}_${idx}`}
                        style={{ flex: "0 0 auto", width: cardW }}
                      >
                        <div
                          className="csbCard"
                          style={{
                            borderRadius: 20,
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
                                alt={ph.alt || ph.label || ""}
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
                              background: "rgba(0,0,0,0.60)",
                              borderTop: `1px solid ${border}`,
                              textAlign: "center",
                              fontSize: isMobile ? 12.8 : 13.8,
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
                    ))}
                  </div>

                  <div className="csbSet" aria-hidden="true">
                    {photosBase.map((ph, idx) => (
                      <div
                        key={`set2_${ph?.src || ph?.label || "ph"}_${idx}`}
                        style={{ flex: "0 0 auto", width: cardW }}
                      >
                        <div
                          className="csbCard"
                          style={{
                            borderRadius: 20,
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
                                alt=""
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
                              background: "rgba(0,0,0,0.60)",
                              borderTop: `1px solid ${border}`,
                              textAlign: "center",
                              fontSize: isMobile ? 12.8 : 13.8,
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
                          >
                            {ph?.label || ""}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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