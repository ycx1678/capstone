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

  const logoSrc = "/capstone_logo_2.png";
  const logoScale = isMobile ? 1.02 : 1.12;
  const gold = "#C7A66A";

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

  // 로고 -> 사라짐 -> 배경 -> 텍스트
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
          width: ${isMobile ? "100%" : "min(900px, 66vw)"};
          display: grid;
          gap: ${isMobile ? "8px" : "10px"};
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
            isMobile ? "clamp(32px, 9vw, 42px)" : "clamp(54px, 5.3vw, 78px)"
          };
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1.03;
          color: #fff;
          word-break: keep-all;
          text-shadow: 0 10px 30px rgba(0,0,0,0.22);
        }

        .introSub {
          margin: 0;
          font-size: ${isMobile ? "15px" : "19px"};
          font-weight: 600;
          line-height: 1.32;
          color: rgba(255,255,255,0.9);
          max-width: 58ch;
          white-space: pre-line;
          word-break: keep-all;
          text-shadow: 0 8px 24px rgba(0,0,0,0.18);
        }

        .introBulletList {
          margin: ${isMobile ? "6px" : "8px"} 0 0;
          padding: 0;
          list-style: none;
          display: grid;
          gap: ${isMobile ? "10px" : "12px"};
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
          grid-template-columns: ${isMobile ? "18px 1fr" : "22px 1fr"};
          column-gap: 10px;
          align-items: start;
          color: #fff;
          word-break: keep-all;
          text-shadow: 0 8px 24px rgba(0,0,0,0.16);
        }

        .introBulletDot {
          width: ${isMobile ? "9px" : "10px"};
          height: ${isMobile ? "9px" : "10px"};
          border-radius: 50%;
          background: ${gold};
          margin-top: ${isMobile ? "9px" : "11px"};
          box-shadow: 0 0 0 4px rgba(199,166,106,0.15);
          flex: 0 0 auto;
        }

        .introBulletContent {
          display: grid;
          gap: 2px;
        }

        .introBulletHeading {
          display: inline-block;
          color: ${gold};
          font-size: ${
            isMobile ? "clamp(19px, 5.4vw, 26px)" : "clamp(24px, 2vw, 34px)"
          };
          font-weight: 800;
          line-height: 1.08;
          letter-spacing: -0.03em;
        }

        .introBulletDesc {
          color: rgba(255,255,255,0.96);
          font-size: ${isMobile ? "14px" : "16px"};
          font-weight: 500;
          line-height: 1.36;
          margin-top: 0;
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
            style={{ backgroundImage: `url(${previousBg})` }}
          />
          <div
            className="introBgLayer introBgCurrent"
            style={{ backgroundImage: `url(${currentBg})` }}
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

            <p className="introSub">
              {main.subtitle || "각 분야의 전문가들이 최고의 행사를 기획 및 운영합니다."}
            </p>

            <ul className={`introBulletList ${showBullets ? "show" : ""}`}>
              {introItems.map((item, i) => (
                <li key={i} className="introBulletItem">
                  <span className="introBulletDot" />
                  <div className="introBulletContent">
                    <span className="introBulletHeading">{item.title}</span>
                    <span className="introBulletDesc">- {item.desc}</span>
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