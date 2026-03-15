import React from "react";

export default function Footer({ isMobile }) {
  const borderColor = "rgba(255,255,255,0.12)";
  const textColor = "rgba(255,255,255,0.82)";
  const titleColor = "rgba(255,255,255,0.95)";
  const accentColor = "#C7A66A";

  return (
    <footer
      style={{
        background: "#05070C",
        borderTop: `1px solid ${borderColor}`,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: isMobile ? "20px 16px 24px" : "34px 40px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 980,
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: "center",
            justifyContent: "center",
            gap: isMobile ? 10 : 56,
          }}
        >
          {!isMobile && (
            <div
              style={{
                flex: "0 0 auto",
                width: 220,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 48,
              }}
            >
              <img
                src="/capstone_logo_2.png"
                alt="CAPSTONE"
                style={{
                  width: 180,
                  height: "auto",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>
          )}

          <div
            style={{
              flex: "0 1 auto",
              textAlign: isMobile ? "center" : "left",
              color: textColor,
              fontFamily: '"Pretendard","Noto Sans KR",sans-serif',
              fontSize: isMobile ? 12.2 : 14.5,
              lineHeight: isMobile ? 1.6 : 1.7,
              letterSpacing: "-0.01em",
              wordBreak: "keep-all",
            }}
          >
            <div
              style={{
                color: titleColor,
                fontWeight: 600,
                marginBottom: 4,
              }}
            >
              주식회사 캡스톤그룹
            </div>

            <div>서울시 서대문구 신촌로 25(창천동, 상록빌딩)</div>

            <div style={{ marginTop: 2 }}>Tel. 02-6010-8500</div>

            <div style={{ marginTop: 2 }}>
              E-mail.{" "}
              <a
                href="mailto:info@capstone-pco.com"
                style={{
                  color: accentColor,
                  textDecoration: "none",
                }}
              >
                info@capstone-pco.com
              </a>
            </div>

            <div style={{ marginTop: 6 }}>
              Copyright ©CAPSTONE Group. All Rights Reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}