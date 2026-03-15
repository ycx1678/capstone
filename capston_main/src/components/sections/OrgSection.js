import { useEffect, useRef, useState } from "react";
import SectionLabel from "../SectionLabel";

export default function OrgSection({ data, isMobile, styles, theme = "dark" }) {
  const t = styles?.themes?.[theme] ?? styles?.themes?.dark ?? {};
  const org = data?.org ?? {};
  const bgImage = data?.sectionBg?.org || "";

  const ceo = org?.ceo ?? { title: "대표이사" };

  const offices =
    Array.isArray(org?.offices) && org.offices.length
      ? org.offices.slice(0, 2)
      : [{ title: "전략기획실" }, { title: "경영지원실" }];

  const divisions =
    Array.isArray(org?.divisions) && org.divisions.length
      ? org.divisions.slice(0, 4)
      : [
          { title: "기획 본부", teams: ["1 TEAM", "2 TEAM", "3 TEAM"] },
          { title: "디자인 본부", teams: ["1 TEAM", "2 TEAM"] },
          { title: "온라인 본부", teams: ["1 TEAM", "2 TEAM"] },
          { title: "영상제작 본부", teams: ["1 TEAM"] },
        ];

  const maxTeams = Math.max(
    1,
    ...divisions.map((d) => (Array.isArray(d?.teams) ? d.teams.length : 0))
  );

  const lineColor =
    theme === "dark"
      ? isMobile
        ? "rgba(255,255,255,0.42)"
        : "rgba(255,255,255,0.28)"
      : isMobile
      ? "rgba(0,0,0,0.22)"
      : "rgba(0,0,0,0.14)";

  const lineWidth = isMobile ? 1.8 : 1.2;

  const gold = styles?.brand?.base || "#C7A66A";
  const goldSoftStrong =
    styles?.brand?.softStrong || "rgba(199,166,106,0.18)";
  const goldBorder = styles?.brand?.border || "rgba(199,166,106,0.34)";
  const goldBorderStrong =
    styles?.brand?.borderStrong || "rgba(199,166,106,0.50)";

  // 상단 3개 박스 컬러 수정
  // TEAM 박스보다 "조금 더 진한" 차콜 계열로 보정
  const CEO_BG = "rgba(24, 27, 34, 0.96)";
  const OFFICE_BG = "rgba(28, 31, 39, 0.94)";
  const PRIMARY_TEXT = "rgba(255,255,255,0.96)";

  const DIV_BG = "rgba(255,255,255,0.97)";
  const DIV_TEXT = "rgba(0,0,0,0.92)";

  const TEAM_BORDER = "rgba(255,255,255,0.78)";
  const TEAM_TEXT = "rgba(255,255,255,0.94)";
  const TEAM_BG = "rgba(34,38,48,0.92)";

  const sectionLabel =
    org?.sectionLabel || org?.tagTitle || org?.tagSub || "ABOUT US";
  const showSectionLabel = org?.showSectionLabel !== false;

  const pad = isMobile ? 18 : 30;

  const sectionStyle = {
    ...styles.section(theme, {
      overflow: "hidden",
    }),
    position: "relative",
  };

  const contentWrap = {
    ...styles.container,
    maxWidth: "1360px",
    margin: "0 auto",
    position: "relative",
    zIndex: 2,
    boxSizing: "border-box",
  };

  const cardWrap = {
    marginTop: isMobile ? 24 : 30,
    borderRadius: isMobile ? 24 : 28,
    border: `1px solid ${t.border ?? "rgba(255,255,255,0.14)"}`,
    background: "rgba(255,255,255,0.045)",
    overflow: "hidden",
    position: "relative",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    boxShadow: "0 24px 60px rgba(0,0,0,0.24)",
    width: "100%",
    boxSizing: "border-box",
  };

  const primaryBox = {
    background: OFFICE_BG,
    color: PRIMARY_TEXT,
    fontWeight: 500,
    fontSize: isMobile ? "14px" : "16px",
    lineHeight: 1.28,
    textAlign: "center",
    padding: isMobile ? "12px 14px" : "16px 18px",
    borderRadius: 14,
    letterSpacing: "-0.02em",
    border: `1px solid rgba(255,255,255,0.16)`,
    boxShadow:
      "0 12px 28px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.03)",
    fontFamily: styles?.fonts?.body,
    wordBreak: "keep-all",
    boxSizing: "border-box",
    minHeight: isMobile ? 48 : 58,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const ceoBox = {
    ...primaryBox,
    background: CEO_BG,
    fontWeight: 700,
    fontSize: isMobile ? "15px" : "17px",
    minHeight: isMobile ? 52 : 62,
    border: `1px solid rgba(255,255,255,0.20)`,
    boxShadow:
      "0 14px 32px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.04)",
  };

  const divisionHeader = {
    background: DIV_BG,
    color: DIV_TEXT,
    fontWeight: 700,
    fontSize: isMobile ? "14px" : "15px",
    lineHeight: 1.25,
    textAlign: "center",
    padding: isMobile ? "12px 14px" : "15px 16px",
    borderRadius: 14,
    letterSpacing: "-0.02em",
    boxShadow: "0 10px 24px rgba(0,0,0,0.22)",
    fontFamily: styles?.fonts?.body,
    wordBreak: "keep-all",
    boxSizing: "border-box",
    minHeight: isMobile ? 48 : 56,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    zIndex: 2,
  };

  const teamRowH = isMobile ? 42 : 48;
  const teamBox = {
    border: `1px solid ${TEAM_BORDER}`,
    color: TEAM_TEXT,
    background: TEAM_BG,
    height: teamRowH,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 12px",
    borderRadius: 11,
    textAlign: "center",
    fontWeight: 500,
    fontSize: isMobile ? "12.5px" : "13.5px",
    lineHeight: 1.22,
    letterSpacing: "-0.02em",
    fontFamily: styles?.fonts?.body,
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    boxSizing: "border-box",
    wordBreak: "keep-all",
    position: "relative",
    zIndex: 2,
  };

  const chartRef = useRef(null);
  const ceoRef = useRef(null);
  const officeRefs = useRef([]);
  const divisionRefs = useRef([]);
  const teamRefs = useRef([]);

  const [paths, setPaths] = useState([]);

  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  const getAnchor = (el, where) => {
    const chartEl = chartRef.current;
    if (!chartEl || !el) return null;

    const c = chartEl.getBoundingClientRect();
    const r = el.getBoundingClientRect();

    const x = r.left - c.left + r.width / 2;
    const top = r.top - c.top;
    const bottom = r.top - c.top + r.height;

    if (where === "top") return { x, y: top };
    if (where === "bottom") return { x, y: bottom };
    return { x, y: top + r.height / 2 };
  };

  const V = (x, y1, y2) => `M ${x} ${y1} L ${x} ${y2}`;
  const H = (x1, x2, y) => `M ${x1} ${y} L ${x2} ${y}`;
  const L = (a, b) => `M ${a.x} ${a.y} L ${b.x} ${b.y}`;

  const recompute = () => {
    const ceoB = getAnchor(ceoRef.current, "bottom");

    const officeT = officeRefs.current
      .map((el) => getAnchor(el, "top"))
      .filter(Boolean);

    const officeB = officeRefs.current
      .map((el) => getAnchor(el, "bottom"))
      .filter(Boolean);

    const divT = divisionRefs.current
      .map((el) => getAnchor(el, "top"))
      .filter(Boolean);

    const divB = divisionRefs.current
      .map((el) => getAnchor(el, "bottom"))
      .filter(Boolean);

    const teamsByDivision = teamRefs.current.map((arr) =>
      (arr || [])
        .map((el) =>
          el
            ? {
                top: getAnchor(el, "top"),
                bottom: getAnchor(el, "bottom"),
              }
            : null
        )
        .filter(Boolean)
        .filter((x) => x.top && x.bottom)
    );

    if (!ceoB || officeT.length < 2 || divT.length < 2) {
      setPaths([]);
      return;
    }

    const officeTopMinY = Math.min(...officeT.map((p) => p.y));
    const officeLineY = clamp(
      (ceoB.y + officeTopMinY) / 2,
      ceoB.y + 10,
      officeTopMinY - 10
    );

    const officeBottomMaxY = Math.max(...officeB.map((p) => p.y));
    const divTopMinY = Math.min(...divT.map((p) => p.y));
    const divLineY = clamp(
      (officeBottomMaxY + divTopMinY) / 2,
      officeBottomMaxY + 10,
      divTopMinY - 10
    );

    const officeLeftX = Math.min(...officeT.map((p) => p.x));
    const officeRightX = Math.max(...officeT.map((p) => p.x));

    const divLeftX = Math.min(...divT.map((p) => p.x));
    const divRightX = Math.max(...divT.map((p) => p.x));

    const out = [];

    out.push(V(ceoB.x, ceoB.y, officeLineY));
    out.push(H(officeLeftX, officeRightX, officeLineY));
    officeT.forEach((p) => out.push(V(p.x, officeLineY, p.y)));

    if (officeB.length >= 2) {
      const mid = (officeB[0].x + officeB[1].x) / 2;
      out.push(V(mid, officeBottomMaxY, divLineY));
    }

    out.push(H(divLeftX, divRightX, divLineY));
    divT.forEach((p) => out.push(V(p.x, divLineY, p.y)));

    for (let i = 0; i < Math.min(divB.length, teamsByDivision.length); i++) {
      const teamList = teamsByDivision[i];
      if (!teamList.length) continue;

      const firstTop = teamList[0].top;
      const divBottom = divB[i];

      if (Math.abs(divBottom.x - firstTop.x) < 2) {
        out.push(V(divBottom.x, divBottom.y, firstTop.y));
      } else {
        out.push(L({ x: divBottom.x, y: divBottom.y }, firstTop));
      }

      for (let j = 0; j < teamList.length - 1; j++) {
        const currBottom = teamList[j].bottom;
        const nextTop = teamList[j + 1].top;

        if (currBottom && nextTop && nextTop.y > currBottom.y) {
          out.push(V(currBottom.x, currBottom.y, nextTop.y));
        }
      }
    }

    setPaths(out);
  };

  useEffect(() => {
    recompute();

    const el = chartRef.current;
    if (!el) return;

    let raf = null;
    let t1 = null;
    let t2 = null;

    const run = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(recompute);
    };

    const ro = new ResizeObserver(() => run());
    ro.observe(el);

    const onResize = () => run();
    window.addEventListener("resize", onResize);

    t1 = setTimeout(run, 80);
    t2 = setTimeout(run, 220);

    return () => {
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
      if (t1) clearTimeout(t1);
      if (t2) clearTimeout(t2);
    };
  }, [isMobile, theme, data?.org]);

  return (
    <section id="org" style={sectionStyle}>
      {bgImage ? (
        <div
          style={styles.sectionBgImage?.(bgImage, {
            opacity: isMobile ? 0.12 : 0.16,
            position: "center center",
            size: "cover",
            zIndex: 0,
          })}
        />
      ) : null}

      <div
        style={styles.sectionOverlay?.(theme, {
          zIndex: 1,
          background:
            "linear-gradient(180deg, rgba(7,9,13,0.80) 0%, rgba(7,9,13,0.66) 32%, rgba(7,9,13,0.86) 100%)",
        })}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          background: `
            radial-gradient(720px 380px at 18% 18%, ${goldSoftStrong}, transparent 62%),
            radial-gradient(620px 320px at 84% 24%, rgba(255,255,255,0.04), transparent 66%)
          `,
        }}
      />

      <div style={contentWrap}>
        <div style={{ marginBottom: 6 }}>
          {showSectionLabel && (
            <SectionLabel text={sectionLabel} styles={styles} />
          )}

          <div
            style={{
              marginTop: showSectionLabel ? 14 : 0,
              ...styles.titleText(theme, "h2", {
                fontWeight: styles.type.weight.semibold,
                fontFamily: styles?.fonts?.display,
                fontSize: isMobile
                  ? "clamp(26px, 6.4vw, 34px)"
                  : "clamp(34px, 3.35vw, 48px)",
              }),
            }}
          >
            {org.title}
          </div>

          <div
            style={{
              marginTop: 12,
              ...styles.subText(theme, {
                fontSize: isMobile
                  ? "clamp(14px, 3.5vw, 16px)"
                  : "clamp(16px, 1.2vw, 18px)",
                fontWeight: styles.type.weight.med,
                fontFamily: styles?.fonts?.body,
                lineHeight: 1.74,
              }),
              wordBreak: "keep-all",
              maxWidth: isMobile ? "100%" : 1120,
            }}
          >
            {org.subtitle}
          </div>
        </div>

        <div style={cardWrap}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0))",
            }}
          />

          <div
            ref={chartRef}
            style={{
              position: "relative",
              padding: pad,
            }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${chartRef.current?.clientWidth || 1000} ${
                chartRef.current?.clientHeight || 1000
              }`}
              preserveAspectRatio="none"
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                overflow: "visible",
                zIndex: 0,
              }}
            >
              {paths.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  fill="none"
                  stroke={lineColor}
                  strokeWidth={lineWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>

            <div
              style={{
                width: "100%",
                maxWidth: isMobile ? "100%" : 760,
                margin: "0 auto",
                position: "relative",
                zIndex: 1,
              }}
            >
              <div ref={ceoRef} style={ceoBox}>
                {ceo?.title ?? "대표이사"}
              </div>
            </div>

            <div style={{ height: isMobile ? 28 : 36 }} />

            <div
              style={{
                width: "100%",
                maxWidth: "100%",
                margin: "0 auto",
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: isMobile ? 12 : 18,
                position: "relative",
                zIndex: 1,
              }}
            >
              {offices.map((o, i) => (
                <div
                  key={i}
                  ref={(el) => (officeRefs.current[i] = el)}
                  style={primaryBox}
                >
                  {o?.title ?? "-"}
                </div>
              ))}
            </div>

            <div style={{ height: isMobile ? 30 : 40 }} />

            <div
              style={{
                width: "100%",
                maxWidth: "100%",
                margin: "0 auto",
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "repeat(2, minmax(0, 1fr))"
                  : "repeat(4, minmax(0, 1fr))",
                gap: isMobile ? 12 : 18,
                alignItems: "start",
                position: "relative",
                zIndex: 1,
              }}
            >
              {divisions.map((d, i) => {
                const teams = Array.isArray(d?.teams) ? d.teams : [];
                return (
                  <div key={i} style={{ display: "grid", gap: 10 }}>
                    <div
                      ref={(el) => (divisionRefs.current[i] = el)}
                      style={divisionHeader}
                    >
                      {d?.title ?? "-"}
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gap: 10,
                        gridAutoRows: `${teamRowH}px`,
                      }}
                    >
                      {Array.from({ length: maxTeams }).map((_, idx) => {
                        const label = teams[idx];
                        const isEmpty = !label;

                        return (
                          <div
                            key={idx}
                            ref={(el) => {
                              if (!teamRefs.current[i]) teamRefs.current[i] = [];
                              teamRefs.current[i][idx] = isEmpty ? null : el;
                            }}
                            style={{
                              ...teamBox,
                              visibility: isEmpty ? "hidden" : "visible",
                            }}
                          >
                            {label ?? ""}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ height: isMobile ? 6 : 10 }} />
          </div>
        </div>
      </div>
    </section>
  );
}