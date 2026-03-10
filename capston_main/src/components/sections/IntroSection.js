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
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [showText, setShowText] = useState(false);
  const [showBullets, setShowBullets] = useState(false);

  const [canvasVisible, setCanvasVisible] = useState(true);
  const [canvasFade, setCanvasFade] = useState(false);
  const [showBg, setShowBg] = useState(false);

  const firedRef = useRef(false);
  const timers = useRef([]);
  const intervalRef = useRef(null);
  const fadeTimerRef = useRef(null);

  const clearAllTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];

    if (intervalRef.current) clearInterval(intervalRef.current);
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
  };

  const onLogoDone = () => {
    if (firedRef.current) return;
    firedRef.current = true;

    timers.current.push(setTimeout(() => setCanvasFade(true), 900));
    timers.current.push(setTimeout(() => setShowBg(true), 1100));
    timers.current.push(setTimeout(() => setShowText(true), 1450));
    timers.current.push(setTimeout(() => setShowBullets(true), 1750));
    timers.current.push(setTimeout(() => setCanvasVisible(false), 2100));
  };

  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  // preload
  useEffect(() => {
    if (!bgImages.length) return;

    const imgs = bgImages.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });

    return () => {
      imgs.length = 0;
    };
  }, [bgImages]);

  // smooth background loop
  useEffect(() => {
    if (!showBg || bgImages.length <= 1) return;

    intervalRef.current = setInterval(() => {
      setPrevIndex((currPrev) => {
        return activeIndex;
      });

      setActiveIndex((prev) => {
        const next = (prev + 1) % bgImages.length;
        return next;
      });

      setIsTransitioning(true);

      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = setTimeout(() => {
        setIsTransitioning(false);
      }, 1600);
    }, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, [showBg, bgImages.length, activeIndex]);

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
          transform: scale(1.03);
        }

        .introBgCurrent,
        .introBgPrev {
          transition: opacity 1600ms ease-in-out;
        }

        .introBgVisible {
          opacity: ${showBg ? 0.88 : 0};
        }

        .introBgHidden {
          opacity: 0;
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
              rgba(8,10,15,0.22) 68%,
              rgba(8,10,15,0.08) 100%
            );
          pointer-events: none;
        }

        .introBgGlow {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background:
            radial-gradient(900px 520px at 78% 28%, rgba(199,166,106,0.10), transparent 62%),
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
          width: min(1300px, 92vw);
          margin: 0 auto;
          display: flex;
          justify-content: flex-start;
        }

        .introTextWrap {
          width: ${isMobile ? "100%" : "min(720px, 52vw)"};
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
            isMobile ? "clamp(32px, 9vw, 42px)" : "clamp(48px, 5vw, 72px)"
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
          line-height: 1.8;
          color: rgba(255,255,255,0.86);
          max-width: 56ch;
          white-space: pre-line;
          word-break: keep-all;
          text-shadow: 0 8px 24px rgba(0,0,0,0.18);
        }

        .introBulletList {
          margin: 0;
          padding: 0;
          list-style: none;
          display: grid;
          gap: 12px;
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
          line-height: 1.7;
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

        @media (max-width:768px) {
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
            className={`introBgLayer introBgPrev ${
              isTransitioning ? "introBgVisible" : "introBgHidden"
            }`}
            style={{
              backgroundImage: `url(${currentBg})`,
            }}
          />
          <div
            className={`introBgLayer introBgCurrent ${
              isTransitioning ? "introBgHidden" : "introBgVisible"
            }`}
            style={{
              backgroundImage: `url(${previousBg})`,
            }}
          />
        </>
      )}

      <div className="introBgGradient" />
      <div className="introBgGlow" />

      {canvasVisible && (
        <div className={`introCanvasWrap ${canvasFade ? "fade" : ""}`}>
          <LogoParticleMorphCanvas
            src="/capstone_logo_remove.png"
            bg={introBg}
            color={"199,166,106"}
            density={1400}
            oneShot={true}
            onComplete={onLogoDone}
            centerOffsetY={0}
            logoScale={1.22}
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