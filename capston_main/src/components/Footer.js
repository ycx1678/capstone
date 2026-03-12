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
          padding: isMobile ? "24px 16px" : "34px 40px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 980,
            display: "flex",
            flexDirection: "row", // 모바일에서도 가로 유지
            alignItems: "center",
            justifyContent: "center",
            gap: isMobile ? 18 : 56,
          }}
        >
          {/* 로고 영역 */}
          <div
            style={{
              flex: "0 0 auto",
              width: isMobile ? 110 : 220,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: isMobile ? 32 : 48,
            }}
          >
            {
            <img
              src="/capstone_logo_2.png"
              alt="CAPSTONE"
              style={{
                width: isMobile ? 100 : 180,
                height: "auto",
                objectFit: "contain",
              }}
            />
            }
          </div>

          {/* 회사 정보 */}
          <div
            style={{
              flex: "0 1 auto",
              textAlign: "left",
              color: textColor,
              fontFamily: '"Pretendard","Noto Sans KR",sans-serif',
              fontSize: isMobile ? 12.8 : 14.5,
              lineHeight: 1.7,
              letterSpacing: "-0.01em",
            }}
          >
            <div
              style={{
                color: titleColor,
                fontWeight: 600,
                marginBottom: 2,
              }}
            >
              주식회사 캡스톤그룹
            </div>

            <div>서울시 서대문구 신촌로 25(창천동, 상록빌딩)</div>

            <div>Tel. 02-6010-8500</div>

            <div>
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

            <div style={{ marginTop: 4 }}>
              Copyright ©CAPSTONE Group. All Rights Reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}