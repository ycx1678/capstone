import { useEffect, useRef, useState } from "react";
import LogoParticleMorphCanvas from "../LogoParticleMorphCanvas";

export default function IntroSection({
  data,
  isMobile,
  headerHeight = 64,
  headerIsFixed = true,
  introBg = "#0B0D12",
}) {
  const main = data?.main || {};

  const bgImages = Array.isArray(data?.sectionBg?.intro)
    ? data.sectionBg.intro.filter(Boolean)
    : [];

  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);

  const [showText, setShowText] = useState(false);
  const [showBullets, setShowBullets] = useState(false);

  const [canvasVisible, setCanvasVisible] = useState(true);
  const [canvasFade, setCanvasFade] = useState(false);
  const [showBg, setShowBg] = useState(false);

  const [bgCrossfade, setBgCrossfade] = useState(false);

  const firedRef = useRef(false);
  const activeIndexRef = useRef(0);

  const timers = useRef([]);
  const slideIntervalRef = useRef(null);
  const crossfadeTimerRef = useRef(null);

  const logoSrc = "/capstone_logo_remove.png";
  const logoScale = isMobile ? 1.22 : 1.38;

  const clearAllTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];

    if (slideIntervalRef.current) {
      clearInterval(slideIntervalRef.current);
      slideIntervalRef.current = null;
    }

    if (crossfadeTimerRef.current) {
      clearTimeout(crossfadeTimerRef.current);
      crossfadeTimerRef.current = null;
    }
  };

  // ✅ 로고 -> 사라짐 -> 배경 -> 텍스트
  const onLogoDone = () => {
    if (firedRef.current) return;
    firedRef.current = true;

    timers.current.push(setTimeout(() => setCanvasFade(true), 1100));
    timers.current.push(setTimeout(() => setShowBg(true), 2050));
    timers.current.push(setTimeout(() => setShowText(true), 2800));
    timers.current.push(setTimeout(() => setShowBullets(true), 3150));
    timers.current.push(setTimeout(() => setCanvasVisible(false), 3300));
  };

  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  useEffect(() => {
    if (!bgImages.length) return;

    const imgs = bgImages.map((src) => {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
      return img;
    });

    return () => {
      imgs.length = 0;
    };
  }, [bgImages]);

  useEffect(() => {
    const img = new Image();
    img.decoding = "async";
    img.src = logoSrc;
  }, []);

  // ✅ 배경은 항상 2레이어 유지하고 opacity만 교차
  useEffect(() => {
    if (!showBg || bgImages.length <= 1) return;

    const SLIDE_MS = 7600;
    const FADE_MS = 2600;

    slideIntervalRef.current = setInterval(() => {
      const current = activeIndexRef.current;
      const next = (current + 1) % bgImages.length;

      setPrevIndex(current);
      setActiveIndex(next);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setBgCrossfade(true);
        });
      });

      activeIndexRef.current = next;

      if (crossfadeTimerRef.current) clearTimeout(crossfadeTimerRef.current);
      crossfadeTimerRef.current = setTimeout(() => {
        setBgCrossfade(false);
      }, FADE_MS);
    }, SLIDE_MS);

    return () => {
      if (slideIntervalRef.current) {
        clearInterval(slideIntervalRef.current);
        slideIntervalRef.current = null;
      }
      if (crossfadeTimerRef.current) {
        clearTimeout(crossfadeTimerRef.current);
        crossfadeTimerRef.current = null;
      }
    };
  }, [showBg, bgImages.length]);

  const padTop = headerIsFixed ? headerHeight : 0;
  const currentBg = bgImages[activeIndex] || "";
  const previousBg = bgImages[prevIndex] || currentBg;

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
        .introBgLayer {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background-position: center center;
          background-size: cover;
          background-repeat: no-repeat;
          will-change: opacity, transform;
          backface-visibility: hidden;
          transform: translateZ(0);
        }

        .introBgPrev {
          opacity: ${showBg ? (bgCrossfade ? 0.88 : 0) : 0};
          transform: scale(${bgCrossfade ? 1.035 : 1.02});
          transition:
            opacity 2200ms ease-in-out,
            transform 2200ms ease-in-out;
        }

        .introBgCurrent {
          opacity: ${showBg ? 0.88 : 0};
          transform: scale(${bgCrossfade ? 1.02 : 1.035});
          transition:
            opacity 2200ms ease-in-out,
            transform 2200ms ease-in-out;
        }

        .introBgGradient {
          position: absolute;
          inset: 0;
          z-index: 1;
          background:
            linear-gradient(
              90deg,
              rgba(8,10,15,0.80) 0%,
              rgba(8,10,15,0.62) 34%,
              rgba(8,10,15,0.30) 68%,
              rgba(8,10,15,0.14) 100%
            );
          pointer-events: none;
        }

        .introBgGlow {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background:
            radial-gradient(900px 520px at 78% 28%, rgba(199,166,106,0.12), transparent 62%),
            radial-gradient(760px 440px at 18% 72%, rgba(255,255,255,0.05), transparent 66%);
        }

        .introCanvasWrap {
          position: absolute;
          left: 0;
          right: 0;
          top: ${padTop}px;
          bottom: 0;
          opacity: 1;
          transition: opacity 900ms ease;
          z-index: 2;
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
          width: ${isMobile ? "100%" : "min(760px, 54vw)"};
          display: grid;
          gap: ${isMobile ? "14px" : "20px"};
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
            isMobile ? "clamp(32px, 9vw, 42px)" : "clamp(50px, 5vw, 74px)"
          };
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1.05;
          color: #fff;
          word-break: keep-all;
          text-shadow: 0 10px 30px rgba(0,0,0,0.22);
        }

        .introSub {
          margin: 0;
          font-size: ${isMobile ? "15px" : "18px"};
          font-weight: 500;
          line-height: 1.82;
          color: rgba(255,255,255,0.88);
          max-width: 58ch;
          white-space: pre-line;
          word-break: keep-all;
          text-shadow: 0 8px 24px rgba(0,0,0,0.18);
        }

        .introBulletList {
          margin: 4px 0 0;
          padding: 0;
          list-style: none;
          display: grid;
          gap: ${isMobile ? "10px" : "12px"};
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 700ms ease, transform 700ms ease;
        }

        .introBulletList.show {
          opacity: 1;
          transform: translateY(0);
        }

        .introBulletItem {
          display: flex;
          gap: 12px;
          font-size: ${isMobile ? "14px" : "16px"};
          font-weight: 500;
          color: #fff;
          line-height: 1.72;
          word-break: keep-all;
          text-shadow: 0 8px 24px rgba(0,0,0,0.16);
        }

        .introBulletDot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #C7A66A;
          margin-top: 8px;
          box-shadow: 0 0 0 4px rgba(199,166,106,0.15);
          flex: 0 0 auto;
        }

        @media (max-width: 768px) {
          .introGrid {
            align-items: flex-end;
          }

          .introInner {
            padding-bottom: clamp(60px, 12vh, 110px);
          }
        }
      `}</style>

      {bgImages.length > 0 && (
        <>
          <div
            className="introBgLayer introBgPrev"
            style={{
              backgroundImage: `url(${previousBg})`,
            }}
          />
          <div
            className="introBgLayer introBgCurrent"
            style={{
              backgroundImage: `url(${currentBg})`,
            }}
          />
        </>
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
            dprCap={isMobile ? 3 : 5}
            overlayOversample={isMobile ? 2.2 : 3.2}
            overlayStrength={1}
            logoFitW={isMobile ? 0.82 : 0.66}
            logoFitH={isMobile ? 0.24 : 0.28}
          />
        </div>
      )}

      <div className="introGrid">
        <div className="introInner">
          <div className={`introTextWrap ${showText ? "show" : ""}`}>
            <h1 className="introTitle">{main.title || "MICE 산업 전문기업"}</h1>

            {main.subtitle && <p className="introSub">{main.subtitle}</p>}

            {(main.bullets || []).length > 0 && (
              <ul className={`introBulletList ${showBullets ? "show" : ""}`}>
                {main.bullets.map((b, i) => (
                  <li key={i} className="introBulletItem">
                    <span className="introBulletDot" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}