import React, { useState } from "react";
import SectionLabel from "../SectionLabel";

function encode(data) {
  return Object.keys(data)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
    .join("&");
}

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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState({
    ok: false,
    error: false,
    message: "",
  });

  const address =
    c.address || "서울시 서대문구 신촌로25 (창천동,상록빌딩)";

  const fg = t.fg;
  const subFg = t.sub;
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
    border: `1px solid ${goldBorder}`,
    boxShadow: theme === "dark" ? `0 24px 60px rgba(0,0,0,0.24)` : undefined,
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
    lineHeight: 1.8,
  };

  const divider = {
    height: 1,
    background: goldBorder,
  };

  const infoBlock = {
    padding: isMobile ? "12px 0" : "14px 0",
  };

  const inputStyle = styles?.ui?.input
    ? {
        ...styles.ui.input(theme, {
          useBrand: true,
          background:
            theme === "dark" ? "rgba(255,255,255,0.045)" : "rgba(0,0,0,0.02)",
        }),
        minHeight: isMobile ? 50 : 54,
        border: `1px solid ${goldBorder}`,
        boxShadow: "none",
      }
    : {
        width: "100%",
        minHeight: isMobile ? 50 : 54,
        padding: "0 16px",
        borderRadius: 14,
        border: `1px solid ${goldBorder}`,
        background:
          theme === "dark" ? "rgba(255,255,255,0.045)" : "rgba(0,0,0,0.02)",
        color: fg,
        outline: "none",
        fontFamily: bodyFont,
        fontSize: isMobile ? 14 : 15,
        boxSizing: "border-box",
      };

  const textareaStyle = styles?.ui?.textarea
    ? {
        ...styles.ui.textarea(theme, {
          useBrand: true,
          minHeight: isMobile ? 110 : 126,
          resize: "vertical",
          background:
            theme === "dark" ? "rgba(255,255,255,0.045)" : "rgba(0,0,0,0.02)",
        }),
        border: `1px solid ${goldBorder}`,
        boxShadow: "none",
      }
    : {
        width: "100%",
        minHeight: isMobile ? 110 : 126,
        padding: "14px 16px",
        borderRadius: 14,
        border: `1px solid ${goldBorder}`,
        background:
          theme === "dark" ? "rgba(255,255,255,0.045)" : "rgba(0,0,0,0.02)",
        color: fg,
        outline: "none",
        fontFamily: bodyFont,
        fontSize: isMobile ? 14 : 15,
        resize: "vertical",
        boxSizing: "border-box",
      };

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
        opacity: isSubmitting ? 0.7 : 1,
        cursor: isSubmitting ? "not-allowed" : "pointer",
      }
    : {
        width: isMobile ? "100%" : 180,
        minHeight: 52,
        border: "none",
        borderRadius: 14,
        background: gold,
        color: "#fff",
        fontFamily: bodyFont,
        fontWeight: 700,
        cursor: isSubmitting ? "not-allowed" : "pointer",
        opacity: isSubmitting ? 0.7 : 1,
      };

  const statusStyle = {
    marginTop: 12,
    padding: "12px 14px",
    borderRadius: 12,
    fontSize: isMobile ? 13 : 14,
    lineHeight: 1.6,
    fontFamily: bodyFont,
    border: `1px solid ${
      submitState.error ? "rgba(220,38,38,0.28)" : goldBorder
    }`,
    background: submitState.error
      ? "rgba(220,38,38,0.08)"
      : theme === "dark"
      ? "rgba(255,255,255,0.04)"
      : "rgba(0,0,0,0.03)",
    color: submitState.error ? "#ffb4b4" : subFg,
  };

  const handleChange = (key) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    if (submitState.ok || submitState.error) {
      setSubmitState({ ok: false, error: false, message: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitState({ ok: false, error: false, message: "" });

    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode({
          "form-name": "capstone-contact",
          ...form,
        }),
      });

      setSubmitState({
        ok: true,
        error: false,
        message:
          "문의가 정상적으로 접수되었습니다. 확인 후 연락드리겠습니다.",
      });

      setForm({
        name: "",
        org: "",
        phone: "",
        email: "",
        inquiry: "",
      });
    } catch (error) {
      setSubmitState({
        ok: false,
        error: true,
        message:
          "문의 전송 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      });
    } finally {
      setIsSubmitting(false);
    }
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
                borderRight: isMobile ? "none" : `1px solid ${goldBorder}`,
                borderBottom: isMobile ? `1px solid ${goldBorder}` : "none",
                background:
                  theme === "dark"
                    ? "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.025))"
                    : "rgba(255,255,255,0.82)",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  fontSize: isMobile ? "22px" : "24px",
                  fontWeight: 700,
                  color: fg,
                  fontFamily: displayFont,
                  letterSpacing: "-0.02em",
                  marginBottom: 14,
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
                name="capstone-contact"
                method="POST"
                data-netlify="true"
                netlify-honeypot="bot-field"
                onSubmit={handleSubmit}
                style={{
                  display: "grid",
                  gap: 14,
                }}
              >
                <input type="hidden" name="form-name" value="capstone-contact" />
                <input type="hidden" name="bot-field" />

                <div
                  style={{
                    position: "absolute",
                    left: "-9999px",
                    opacity: 0,
                    pointerEvents: "none",
                    height: 0,
                    overflow: "hidden",
                  }}
                  aria-hidden="true"
                >
                  <label>
                    Don’t fill this out if you're human:
                    <input name="bot-field" />
                  </label>
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
                      {formText?.fields?.name || "성명"}
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange("name")}
                      placeholder={formText?.fields?.name || "성명"}
                      style={inputStyle}
                      required
                    />
                  </div>

                  <div>
                    <div style={labelStyle}>
                      {formText?.fields?.org || "소속"}
                    </div>
                    <input
                      type="text"
                      name="org"
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
                      name="phone"
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
                      name="email"
                      value={form.email}
                      onChange={handleChange("email")}
                      placeholder={formText?.fields?.email || "이메일주소"}
                      style={inputStyle}
                      required
                    />
                  </div>
                </div>

                <div>
                  <div style={labelStyle}>
                    {formText?.fields?.inquiry || "문의사항"}
                  </div>
                  <textarea
                    name="inquiry"
                    value={form.inquiry}
                    onChange={handleChange("inquiry")}
                    placeholder={formText?.fields?.inquiry || "문의사항"}
                    style={textareaStyle}
                    required
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: isMobile ? "stretch" : "flex-start",
                    marginTop: 4,
                  }}
                >
                  <button type="submit" style={submitBtn} disabled={isSubmitting}>
                    {isSubmitting
                      ? "전송 중..."
                      : formText?.fields?.submit || "전송"}
                  </button>
                </div>

                {(submitState.ok || submitState.error) && (
                  <div style={statusStyle}>{submitState.message}</div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}