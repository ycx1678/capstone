import React, { useState } from "react";
import SectionLabel from "../SectionLabel";

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
    c.address || "서울시 서대문구 신촌로25 (창천동,상록빌딩)";

  const fg = t.fg;
  const subFg = t.sub;
  const border = t.border;
  const gold = styles?.brand?.base || "#C7A66A";
  const goldBorder = styles?.brand?.border || "rgba(199,166,106,0.34)";
  const goldSoft = styles?.brand?.soft || "rgba(199,166,106,0.10)";
  const goldSoftStrong =
    styles?.brand?.softStrong || "rgba(199,166,106,0.18)";

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
      radius: 26,
      variant: "premium",
    }),
    overflow: "hidden",
    maxWidth: 1200,
    margin: "0 auto",
    background:
      theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.92)",
    border: `1px solid ${border}`,
  };

  const cardPad = isMobile ? 20 : 32;

  const labelStyle = {
    fontSize: isMobile ? "12.5px" : "13.5px",
    fontWeight: 500,
    marginBottom: 8,
    fontFamily: bodyFont,
    color: fg,
    opacity: 0.88,
    letterSpacing: "-0.01em",
  };

  const valueStyle = {
    fontSize: isMobile ? "15px" : "16px",
    lineHeight: 1.76,
    fontFamily: bodyFont,
    color: fg,
    whiteSpace: "pre-line",
    wordBreak: "keep-all",
    fontWeight: 700,
    letterSpacing: "-0.015em",
  };

  const addressValueStyle = {
    ...valueStyle,
    fontSize: isMobile ? "15.5px" : "17px",
    color: gold,
    lineHeight: 1.8,
  };

  const divider = {
    height: 1,
    background:
      theme === "dark" ? "rgba(255,255,255,0.10)" : "rgba(11,18,32,0.08)",
  };

  const infoBlock = {
    padding: isMobile ? "14px 0" : "16px 0",
  };

  const inputStyle = styles?.ui?.input
    ? {
        ...styles.ui.input(theme, {
          useBrand: true,
          background:
            theme === "dark" ? "rgba(255,255,255,0.045)" : "rgba(0,0,0,0.02)",
        }),
        minHeight: isMobile ? 50 : 54,
      }
    : {};

  const textareaStyle = styles?.ui?.textarea
    ? {
        ...styles.ui.textarea(theme, {
          useBrand: true,
          minHeight: isMobile ? 110 : 126,
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
        minWidth: isMobile ? "100%" : 180,
        justifyContent: "center",
        fontFamily: bodyFont,
        fontWeight: 700,
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
        <div style={{ marginBottom: isMobile ? 22 : 34 }}>
          <SectionLabel text="Contact" styles={styles} />

          <div
            style={{
              fontSize: isMobile
                ? "clamp(28px, 6.6vw, 34px)"
                : "clamp(34px, 3vw, 46px)",
              fontWeight: 700,
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
              maxWidth: 820,
              fontSize: isMobile
                ? "clamp(14px, 3.5vw, 16px)"
                : "clamp(15.5px, 1.18vw, 17.5px)",
              lineHeight: 1.78,
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
              gridTemplateColumns: isMobile ? "1fr" : "0.94fr 1.06fr",
              minHeight: isMobile ? "auto" : 520,
            }}
          >
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
                    ? "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.025))"
                    : "rgba(255,255,255,0.82)",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: isMobile ? "7px 12px" : "8px 14px",
                  borderRadius: 999,
                  border: `1px solid ${goldBorder}`,
                  background: goldSoft,
                  color: gold,
                  fontSize: isMobile ? "11px" : "12px",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontFamily: styles?.fonts?.nav,
                  boxShadow: `0 10px 24px ${goldSoftStrong}`,
                  marginBottom: 16,
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 1,
                    background: `linear-gradient(90deg, rgba(199,166,106,0.18), ${gold})`,
                  }}
                />
                <span>Company Information</span>
              </div>

              <div
                style={{
                  fontSize: isMobile ? "22px" : "24px",
                  fontWeight: 700,
                  color: fg,
                  fontFamily: displayFont,
                  letterSpacing: "-0.02em",
                  marginBottom: 22,
                }}
              >
                {c.companyName || "주식회사 캡스톤그룹"}
              </div>

              <div style={{ display: "grid", gap: 0 }}>
                <div style={infoBlock}>
                  <div style={labelStyle}>상호명</div>
                  <div style={valueStyle}>{c.companyName || "-"}</div>
                </div>

                <div style={divider} />

                <div style={infoBlock}>
                  <div style={labelStyle}>주소</div>
                  <div style={addressValueStyle}>{address || "-"}</div>
                </div>

                <div style={divider} />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    gap: 18,
                    ...infoBlock,
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
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: isMobile ? "7px 12px" : "8px 14px",
                  borderRadius: 999,
                  border: `1px solid ${goldBorder}`,
                  background: goldSoft,
                  color: gold,
                  fontSize: isMobile ? "11px" : "12px",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontFamily: styles?.fonts?.nav,
                  boxShadow: `0 10px 24px ${goldSoftStrong}`,
                  marginBottom: 16,
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 1,
                    background: `linear-gradient(90deg, rgba(199,166,106,0.18), ${gold})`,
                  }}
                />
                <span>Message</span>
              </div>

              <div
                style={{
                  fontSize: isMobile ? "22px" : "24px",
                  fontWeight: 700,
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
                    <div style={labelStyle}>
                      {formText?.fields?.name || "성명"}
                    </div>
                    <input
                      type="text"
                      value={form.name}
                      onChange={handleChange("name")}
                      placeholder={formText?.fields?.name || "성명"}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <div style={labelStyle}>
                      {formText?.fields?.org || "소속"}
                    </div>
                    <input
                      type="text"
                      value={form.org}
                      onChange={handleChange("org")}
                      placeholder={formText?.fields?.org || "소속"}
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
                    <div style={labelStyle}>
                      {formText?.fields?.phone || "핸드폰번호"}
                    </div>
                    <input
                      type="text"
                      value={form.phone}
                      onChange={handleChange("phone")}
                      placeholder={formText?.fields?.phone || "핸드폰번호"}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <div style={labelStyle}>
                      {formText?.fields?.email || "이메일주소"}
                    </div>
                    <input
                      type="email"
                      value={form.email}
                      onChange={handleChange("email")}
                      placeholder={formText?.fields?.email || "이메일주소"}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <div style={labelStyle}>
                    {formText?.fields?.inquiry || "문의사항"}
                  </div>
                  <textarea
                    value={form.inquiry}
                    onChange={handleChange("inquiry")}
                    placeholder={formText?.fields?.inquiry || "문의사항"}
                    style={textareaStyle}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: isMobile ? "stretch" : "flex-start",
                    marginTop: 4,
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