import { useEffect, useMemo, useRef, useState } from "react";
import LogoParticleMorphCanvas from "../LogoParticleMorphCanvas";

export default function IntroSection({
  data,
  isMobile,
  headerHeight = 64,
  headerIsFixed = true,
  introBg = "#0B0D12",
}) {
  const main = data?.main || {};

  const bgImages = useMemo(() => {
    const arr = Array.isArray(data?.sectionBg?.intro)
      ? data.sectionBg.intro.filter(Boolean)
      : [];
    return arr;
  }, [data]);

  const [activeIndex, setActiveIndex] = useState(0);

  const [showText, setShowText] = useState(false);
  const [showBullets, setShowBullets] = useState(false);

  const [canvasVisible, setCanvasVisible] = useState(true);
  const [canvasFade, setCanvasFade] = useState(false);
  const [showBg, setShowBg] = useState(false);

  const firedRef = useRef(false);
  const timersRef = useRef([]);
  const slideTimeoutRef = useRef(null);
  const mountedRef = useRef(false);

  const logoSrc = "/capstone_logo_2.png";
  const logoScale = isMobile ? 1.02 : 1.12;
  const gold = "#C7A66A";

  const [forceLiteMode, setForceLiteMode] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ua = window.navigator.userAgent || "";
    const vendor = window.navigator.vendor || "";
    const platform = window.navigator.platform || "";
    const maxTouchPoints = window.navigator.maxTouchPoints || 0;

    const isIOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (platform === "MacIntel" && maxTouchPoints > 1);

    const isSafari =
      /Safari/i.test(ua) &&
      !/Chrome|CriOS|Edg|OPR|SamsungBrowser|Firefox|FxiOS/i.test(ua) &&
      /Apple/i.test(vendor);

    setForceLiteMode(isIOS || isSafari);
  }, []);

  const introItems = [
    {
      title: "PCO",
      desc: "국제회의, 컨퍼런스, 포럼, 심포지엄, 학술대회, 세미나 등 학술관련 프로그램 기획 및 운영",
    },
    {
      title: "Event & Exhibition",
      desc: "기념식, 시상식, 비전선포식, 프로모션 등 부대행사 기획 및 운영",
    },
    {
      title: "Design & Journal",
      desc: "온/오프라인 디자인 기획 및 운영, 편집 및 인쇄",
    },
    {
      title: "On-Line",
      desc: "온라인 회의 기획 및 운영, 홈페이지 제작, 중계시스템 운영",
    },
  ];

  const clearAllTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    if (slideTimeoutRef.current) {
      clearTimeout(slideTimeoutRef.current);
      slideTimeoutRef.current = null;
    }
  };

  const onLogoDone = () => {
    if (firedRef.current) return;
    firedRef.current = true;

    timersRef.current.push(setTimeout(() => setCanvasFade(true), 380));
    timersRef.current.push(setTimeout(() => setShowBg(true), 620));
    timersRef.current.push(setTimeout(() => setShowText(true), 1080));
    timersRef.current.push(setTimeout(() => setShowBullets(true), 1360));
    timersRef.current.push(setTimeout(() => setCanvasVisible(false), 1680));
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearAllTimers();
    };
  }, []);

  useEffect(() => {
    if (!bgImages.length) return;

    let cancelled = false;

    const preload = async () => {
      try {
        await Promise.all(
          bgImages.map(
            (src) =>
              new Promise((resolve) => {
                const img = new Image();
                img.decoding = "async";
                img.loading = "eager";

                img.onload = async () => {
                  try {
                    if (img.decode) await img.decode();
                  } catch (_) {}
                  resolve();
                };

                img.onerror = () => resolve();
                img.src = src;
              })
          )
        );
      } catch (_) {
        // ignore
      }

      if (cancelled || !mountedRef.current) return;
    };

    preload();

    return () => {
      cancelled = true;
    };
  }, [bgImages]);

  useEffect(() => {
    const img = new Image();
    img.decoding = "async";
    img.src = logoSrc;
  }, [logoSrc]);

  useEffect(() => {
    if (!showBg || bgImages.length <= 1) return;

    const SLIDE_MS = 4600;

    const tick = () => {
      slideTimeoutRef.current = setTimeout(() => {
        if (!mountedRef.current) return;

        setActiveIndex((prev) => (prev + 1) % bgImages.length);
        tick();
      }, SLIDE_MS);
    };

    tick();

    return () => {
      if (slideTimeoutRef.current) {
        clearTimeout(slideTimeoutRef.current);
        slideTimeoutRef.current = null;
      }
    };
  }, [showBg, bgImages.length]);

  const padTop = headerIsFixed ? headerHeight : 0;

  return (
    <section
      id="intro"
      style={{
        position: "relative",
        height: "100vh",
        minHeight: "100svh",
        background: introBg,
        overflow: "hidden",
        paddingTop: padTop,
      }}
    >
      <style>{`
        .introBgStage {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .introBgLayer {
          position: absolute;
          inset: -6%;
          z-index: 0;
          pointer-events: none;
          background-position: center center;
          background-size: cover;
          background-repeat: no-repeat;
          will-change: opacity, transform;
          backface-visibility: hidden;
          transform: translate3d(0, 0, 0) scale(1.14);
          opacity: 0;
          transition:
            opacity 1500ms ease-in-out,
            transform 1500ms ease-out,
            filter 1500ms ease-in-out;
          filter: saturate(0.98) brightness(0.94);
        }

        .introBgLayer.showBg {
          opacity: 0;
        }

        .introBgLayer.isActive {
          opacity: 1;
          filter: saturate(1.08) brightness(1.04);
        }

        .introBgLayer.isInactive {
          opacity: 0;
          filter: saturate(0.9) brightness(0.82);
        }

        .introBgLayer.pan-a {
          animation: introPanA 12s ease-in-out infinite alternate;
        }

        .introBgLayer.pan-b {
          animation: introPanB 13s ease-in-out infinite alternate;
        }

        .introBgLayer.pan-c {
          animation: introPanC 14s ease-in-out infinite alternate;
        }

        @keyframes introPanA {
          0% {
            transform: translate3d(-5.2%, 3.0%, 0) scale(1.12);
          }
          100% {
            transform: translate3d(5.2%, -3.0%, 0) scale(1.26);
          }
        }

        @keyframes introPanB {
          0% {
            transform: translate3d(4.8%, 2.4%, 0) scale(1.11);
          }
          100% {
            transform: translate3d(-3.8%, -3.4%, 0) scale(1.25);
          }
        }

        @keyframes introPanC {
          0% {
            transform: translate3d(-3.6%, -3.4%, 0) scale(1.13);
          }
          100% {
            transform: translate3d(4.1%, 2.8%, 0) scale(1.27);
          }
        }

        .introBgGradient {
          position: absolute;
          inset: 0;
          z-index: 1;
          background:
            linear-gradient(
              90deg,
              rgba(8,10,15,0.72) 0%,
              rgba(8,10,15,0.52) 34%,
              rgba(8,10,15,0.24) 68%,
              rgba(8,10,15,0.10) 100%
            );
          pointer-events: none;
        }

        .introBgGlow {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background:
            radial-gradient(900px 520px at 78% 28%, rgba(199,166,106,0.14), transparent 62%),
            radial-gradient(760px 440px at 18% 72%, rgba(255,255,255,0.06), transparent 66%);
        }

        .introCanvasWrap {
          position: absolute;
          left: 0;
          right: 0;
          top: ${padTop}px;
          bottom: 0;
          opacity: 1;
          transition: opacity 820ms ease;
          z-index: 2;
          will-change: opacity;
        }

        .introCanvasWrap.fade {
          opacity: 0;
        }

        .introGrid {
          position: relative;
          z-index: 3;
          min-height: calc(100vh - ${padTop}px);
          display: flex;
          align-items: center;
        }

        .introInner {
          width: min(1340px, 92vw);
          margin: 0 auto;
          display: flex;
          justify-content: flex-start;
        }

        .introTextWrap {
          width: ${isMobile ? "100%" : "min(900px, 66vw)"};
          display: grid;
          gap: ${isMobile ? "9px" : "10px"};
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 900ms ease, transform 900ms ease;
        }

        .introTextWrap.show {
          opacity: 1;
          transform: translateY(0);
        }

        .introTitle {
          margin: 0;
          font-size: ${
            isMobile ? "clamp(31px, 8.5vw, 40px)" : "clamp(54px, 5.3vw, 78px)"
          };
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: ${isMobile ? "1.04" : "1.03"};
          color: #fff;
          word-break: keep-all;
          text-shadow: 0 10px 30px rgba(0,0,0,0.22);
        }

        .introSub {
          margin: 0;
          font-size: ${isMobile ? "14px" : "19px"};
          font-weight: 600;
          line-height: ${isMobile ? "1.42" : "1.32"};
          color: rgba(255,255,255,0.92);
          max-width: ${isMobile ? "30ch" : "58ch"};
          white-space: pre-line;
          word-break: keep-all;
          text-shadow: 0 8px 24px rgba(0,0,0,0.18);
        }

        .introBulletList {
          margin: ${isMobile ? "10px" : "8px"} 0 0;
          padding: 0;
          list-style: none;
          display: grid;
          gap: ${isMobile ? "12px" : "12px"};
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 700ms ease, transform 700ms ease;
          max-width: ${isMobile ? "100%" : "980px"};
        }

        .introBulletList.show {
          opacity: 1;
          transform: translateY(0);
        }

        .introBulletItem {
          display: grid;
          grid-template-columns: ${isMobile ? "16px 1fr" : "22px 1fr"};
          column-gap: ${isMobile ? "9px" : "10px"};
          align-items: start;
          color: #fff;
          word-break: keep-all;
          text-shadow: 0 8px 24px rgba(0,0,0,0.16);
        }

        .introBulletDot {
          width: ${isMobile ? "7px" : "10px"};
          height: ${isMobile ? "7px" : "10px"};
          border-radius: 50%;
          background: ${gold};
          margin-top: ${isMobile ? "7px" : "11px"};
          box-shadow: ${
            isMobile
              ? "0 0 0 3px rgba(199,166,106,0.16)"
              : "0 0 0 4px rgba(199,166,106,0.15)"
          };
          flex: 0 0 auto;
        }

        .introBulletContent {
          display: grid;
          gap: ${isMobile ? "3px" : "2px"};
          min-width: 0;
        }

        .introBulletHeading {
          display: inline-block;
          color: ${gold};
          font-size: ${
            isMobile ? "clamp(17px, 4.9vw, 22px)" : "clamp(24px, 2vw, 34px)"
          };
          font-weight: 800;
          line-height: ${isMobile ? "1.12" : "1.08"};
          letter-spacing: -0.03em;
        }

        .introBulletDesc {
          position: relative;
          color: rgba(255,255,255,0.96);
          font-size: ${isMobile ? "12.5px" : "16px"};
          font-weight: 500;
          line-height: ${isMobile ? "1.46" : "1.36"};
          margin-top: 0;
          max-width: ${isMobile ? "30ch" : "unset"};
          padding-left: ${isMobile ? "12px" : "14px"};
          word-break: keep-all;
        }

        .introBulletDesc::before {
          content: "-";
          position: absolute;
          left: 0;
          top: 0;
          color: rgba(255,255,255,0.96);
        }

        @media (max-width: 768px) {
          .introGrid {
            align-items: center;
          }

          .introInner {
            width: min(92vw, 560px);
            padding-top: clamp(72px, 12vh, 110px);
            padding-bottom: clamp(34px, 7vh, 64px);
          }

          .introTextWrap {
            width: 100%;
            max-width: 100%;
            gap: 8px;
          }

          @keyframes introPanA {
            0% {
              transform: translate3d(-2.8%, 2.0%, 0) scale(1.10);
            }
            100% {
              transform: translate3d(2.8%, -2.0%, 0) scale(1.20);
            }
          }

          @keyframes introPanB {
            0% {
              transform: translate3d(2.8%, 1.6%, 0) scale(1.10);
            }
            100% {
              transform: translate3d(-2.2%, -2.2%, 0) scale(1.20);
            }
          }

          @keyframes introPanC {
            0% {
              transform: translate3d(-2.1%, -2.1%, 0) scale(1.11);
            }
            100% {
              transform: translate3d(2.4%, 1.9%, 0) scale(1.21);
            }
          }

          .introBgGradient {
            background:
              linear-gradient(
                180deg,
                rgba(8,10,15,0.34) 0%,
                rgba(8,10,15,0.28) 18%,
                rgba(8,10,15,0.42) 44%,
                rgba(8,10,15,0.66) 72%,
                rgba(8,10,15,0.84) 100%
              );
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .introBgLayer,
          .introCanvasWrap,
          .introTextWrap,
          .introBulletList {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      {bgImages.length > 0 && (
        <div className="introBgStage">
          {bgImages.map((src, idx) => {
            const panClass =
              idx % 3 === 0 ? "pan-a" : idx % 3 === 1 ? "pan-b" : "pan-c";

            const stateClass = showBg
              ? idx === activeIndex
                ? "isActive"
                : "isInactive"
              : "";

            return (
              <div
                key={`${src}-${idx}`}
                className={`introBgLayer showBg ${panClass} ${stateClass}`}
                style={{ backgroundImage: `url(${src})` }}
              />
            );
          })}
        </div>
      )}

      <div className="introBgGradient" />
      <div className="introBgGlow" />

      {canvasVisible && (
        <div className={`introCanvasWrap ${canvasFade ? "fade" : ""}`}>
          <LogoParticleMorphCanvas
            src={logoSrc}
            bg={introBg}
            color="199,166,106"
            density={isMobile ? 900 : 1400}
            oneShot={true}
            onComplete={onLogoDone}
            centerOffsetY={0}
            logoScale={logoScale}
            dprCap={isMobile ? 2 : 2.5}
            overlayOversample={isMobile ? 1.6 : 2}
            overlayStrength={0.82}
            logoFitW={isMobile ? 0.82 : 0.66}
            logoFitH={isMobile ? 0.24 : 0.28}
            orbitSec={1.55}
            scatterSec={0.6}
            freeSec={0.18}
            gatherSec={0.95}
            holdSec={0.72}
            sphereRadiusFactor={0.33}
            driftAmp={isMobile ? 4.8 : 6}
            orbitSpeed={0.16}
            orbitSpeedScatter={0.24}
            orbitTilt={0.4}
            orbitWobble={0.06}
            liteMode={forceLiteMode}
          />
        </div>
      )}

      <div className="introGrid">
        <div className="introInner">
          <div className={`introTextWrap ${showText ? "show" : ""}`}>
            <h1 className="introTitle">{main.title || "MICE 산업 전문기업"}</h1>

            <p className="introSub">
              {main.subtitle ||
                "각 분야의 전문가들이 최고의 행사를 기획 및 운영합니다."}
            </p>

            <ul className={`introBulletList ${showBullets ? "show" : ""}`}>
              {introItems.map((item, i) => (
                <li key={i} className="introBulletItem">
                  <span className="introBulletDot" />
                  <div className="introBulletContent">
                    <span className="introBulletHeading">{item.title}</span>
                    <span className="introBulletDesc">{item.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}