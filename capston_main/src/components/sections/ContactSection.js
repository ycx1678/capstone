// src/components/sections/ContactSection.js
import React, { useState } from "react";

export default function ContactSection({
  data,
  isMobile,
  styles,
  theme = "dark",
}) {
  const t = styles.themes?.[theme] ?? styles.themes?.dark ?? {};
  const c = data?.contact || {};
  const formText = data?.contactForm || {};

  const [form, setForm] = useState({
    name: "",
    org: "",
    phone: "",
    email: "",
    inquiry: "",
  });

  const address =
    c.address || "서울시 서대문구 신촌로25, 2층(창천동, 상록빌딩)";

  const fg = t.fg;
  const subFg = t.sub;
  const border = t.border;

  const bodyFont =
    styles?.fonts?.body || styles?.fonts?.display || "GmarketSans, sans-serif";
  const displayFont =
    styles?.fonts?.display || styles?.fonts?.body || "GmarketSans, sans-serif";

  const sectionStyle = {
    ...styles.section(theme, {
      background: theme === "dark" ? "#0c1117" : t.bg,
      overflow: "hidden",
    }),
    position: "relative",
  };

  const flare =
    theme === "dark"
      ? `radial-gradient(700px 380px at 18% 10%, ${styles.brand.softStrong}, transparent 60%),
         radial-gradient(640px 360px at 88% 30%, ${styles.brand.secondary.soft}, transparent 62%)`
      : `radial-gradient(720px 420px at 18% 10%, ${styles.brand.soft}, transparent 60%),
         radial-gradient(680px 400px at 88% 30%, ${styles.brand.secondary.soft}, transparent 62%)`;

  const wrapCard = {
    ...styles.ui.card(theme, {
      padding: 0,
      radius: 24,
      variant: "premium",
    }),
    overflow: "hidden",
    maxWidth: 1180,
    margin: "0 auto",
    background:
      theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.92)",
    border: `1px solid ${border}`,
  };

  const cardPad = isMobile ? 18 : 28;

  const labelStyle = {
    fontSize: isMobile ? "12px" : "13px",
    fontWeight: 500,
    marginBottom: 7,
    fontFamily: bodyFont,
    color: fg,
    opacity: 0.86,
    letterSpacing: "-0.01em",
  };

  const valueStyle = {
    fontSize: isMobile ? "14px" : "15px",
    lineHeight: 1.72,
    fontFamily: bodyFont,
    color: fg,
    whiteSpace: "pre-line",
    wordBreak: "keep-all",
    fontWeight: 700,
    letterSpacing: "-0.015em",
  };

  const divider = {
    height: 1,
    background:
      theme === "dark" ? "rgba(255,255,255,0.10)" : "rgba(11,18,32,0.08)",
  };

  const inputStyle = styles?.ui?.input
    ? {
        ...styles.ui.input(theme, {
          useBrand: true,
          background:
            theme === "dark" ? "rgba(255,255,255,0.045)" : "rgba(0,0,0,0.02)",
        }),
        minHeight: isMobile ? 48 : 52,
      }
    : {};

  const textareaStyle = styles?.ui?.textarea
    ? {
        ...styles.ui.textarea(theme, {
          useBrand: true,
          minHeight: isMobile ? 96 : 112,
          resize: "vertical",
          background:
            theme === "dark" ? "rgba(255,255,255,0.045)" : "rgba(0,0,0,0.02)",
        }),
      }
    : {};

  const submitBtn = styles?.ui?.btn
    ? {
        ...styles.ui.btn(theme, "brand", {
          size: "lg",
          radius: 14,
        }),
        width: isMobile ? "100%" : "auto",
        minWidth: isMobile ? "100%" : 170,
        justifyContent: "center",
        fontFamily: bodyFont,
        fontWeight: 600,
      }
    : {};

  const handleChange = (key) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("문의 폼 UI가 연결되었습니다. 실제 전송 연동은 추후 연결 가능합니다.");
  };

  return (
    <section id="contact" style={sectionStyle}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: flare,
          pointerEvents: "none",
          opacity: theme === "dark" ? 0.58 : 0.9,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            theme === "dark"
              ? "linear-gradient(180deg, rgba(12,17,23,0.18), rgba(12,17,23,0.04) 28%, rgba(12,17,23,0.28) 100%)"
              : "none",
        }}
      />

      <div style={{ ...styles.container, position: "relative", zIndex: 2 }}>
        <div style={{ marginBottom: isMobile ? 20 : 32 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              color: styles.brand.base,
              fontSize: styles.type.xs ?? "12px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontFamily: styles.fonts.nav,
            }}
          >
            <span
              style={{
                width: 34,
                height: 1,
                background: `linear-gradient(90deg, rgba(199,166,106,0.2), ${styles.brand.base})`,
              }}
            />
            <span>Contact</span>
          </div>

          <div
            style={{
              fontSize: styles.H2,
              fontWeight: 500,
              marginTop: 14,
              color: fg,
              fontFamily: displayFont,
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
            }}
          >
            {c.title || "CONTACT"}
          </div>

          <div
            style={{
              marginTop: 12,
              maxWidth: 760,
              fontSize: styles.P,
              lineHeight: 1.75,
              color: subFg,
              whiteSpace: "pre-line",
              fontFamily: bodyFont,
              fontWeight: 500,
              wordBreak: "keep-all",
              letterSpacing: "-0.01em",
            }}
          >
            {c.desc || "문의 내용을 남겨주시면 확인 후 연락드리겠습니다."}
          </div>
        </div>

        <div style={wrapCard}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "0.92fr 1.08fr",
              minHeight: isMobile ? "auto" : 470,
            }}
          >
            {/* LEFT */}
            <div
              style={{
                padding: cardPad,
                borderRight: isMobile
                  ? "none"
                  : `${styles.tok.border.w}px solid ${border}`,
                borderBottom: isMobile
                  ? `${styles.tok.border.w}px solid ${border}`
                  : "none",
                background:
                  theme === "dark"
                    ? "linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.02))"
                    : "rgba(255,255,255,0.82)",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  fontSize: isMobile ? "20px" : "22px",
                  fontWeight: 500,
                  color: fg,
                  fontFamily: displayFont,
                  letterSpacing: "-0.02em",
                  marginBottom: 20,
                }}
              >
                Company Information
              </div>

              <div style={{ display: "grid", gap: 18 }}>
                <div>
                  <div style={labelStyle}>상호명</div>
                  <div style={valueStyle}>{c.companyName || "-"}</div>
                </div>

                <div style={divider} />

                <div>
                  <div style={labelStyle}>주소</div>
                  <div style={valueStyle}>{address || "-"}</div>
                </div>

                <div style={divider} />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    gap: 18,
                  }}
                >
                  <div>
                    <div style={labelStyle}>전화</div>
                    <div style={valueStyle}>{c.tel || "-"}</div>
                  </div>

                  <div>
                    <div style={labelStyle}>E-mail</div>
                    <div style={valueStyle}>{c.email || "-"}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div
              style={{
                padding: cardPad,
                boxSizing: "border-box",
                background:
                  theme === "dark"
                    ? "rgba(255,255,255,0.025)"
                    : "rgba(255,255,255,0.94)",
              }}
            >
              <div
                style={{
                  fontSize: isMobile ? "20px" : "22px",
                  fontWeight: 500,
                  color: fg,
                  fontFamily: displayFont,
                  letterSpacing: "-0.02em",
                  marginBottom: 18,
                }}
              >
                {formText.title || "Send a Message"}
              </div>

              <form
                onSubmit={handleSubmit}
                style={{
                  display: "grid",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    gap: 14,
                  }}
                >
                  <div>
                    <div style={labelStyle}>성명</div>
                    <input
                      type="text"
                      value={form.name}
                      onChange={handleChange("name")}
                      placeholder="성명"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <div style={labelStyle}>소속</div>
                    <input
                      type="text"
                      value={form.org}
                      onChange={handleChange("org")}
                      placeholder="소속"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    gap: 14,
                  }}
                >
                  <div>
                    <div style={labelStyle}>핸드폰번호</div>
                    <input
                      type="text"
                      value={form.phone}
                      onChange={handleChange("phone")}
                      placeholder="핸드폰번호"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <div style={labelStyle}>이메일주소</div>
                    <input
                      type="email"
                      value={form.email}
                      onChange={handleChange("email")}
                      placeholder="이메일주소"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <div style={labelStyle}>문의사항</div>
                  <textarea
                    value={form.inquiry}
                    onChange={handleChange("inquiry")}
                    placeholder="문의사항"
                    style={textareaStyle}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: isMobile ? "stretch" : "flex-start",
                    marginTop: 2,
                  }}
                >
                  <button type="submit" style={submitBtn}>
                    {formText?.fields?.submit || "전송"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div
            style={{
              padding: isMobile ? "14px 16px" : "14px 24px",
              borderTop: `${styles.tok.border.w}px solid ${border}`,
              background:
                theme === "dark"
                  ? "rgba(255,255,255,0.035)"
                  : "rgba(11,18,32,0.02)",
              textAlign: "center",
              fontSize: styles.S,
              color: subFg,
              fontFamily: bodyFont,
              fontWeight: 500,
            }}
          >
            © {new Date().getFullYear()} {c.companyName || "CAPSTONE"}
          </div>
        </div>
      </div>
    </section>
  );
}