export default function AdminMobileGate({ ui, onForceOpen }) {
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: 18 }}>
      <div style={ui.card}>
        <div style={ui.cardHeader}>
          <div style={ui.cardTitle}>관리자 페이지는 PC에서 사용해주세요</div>
        </div>
        <div style={ui.cardBody}>
          <div style={ui.hint}>
            이미지 업로드 / 드래그 정렬은 모바일에서 오류가 날 수 있습니다.
            <br />
            PC(크롬)에서 <span style={ui.monoInline}>#/admin</span>으로
            접속해주세요.
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              marginTop: 14,
            }}
          >
            <a
              href="#/"
              style={{ ...ui.btn, ...ui.btnGhost, textDecoration: "none" }}
            >
              사이트로
            </a>
            <button
              type="button"
              style={{ ...ui.btn, ...ui.btnPrimary }}
              onClick={onForceOpen}
            >
              그래도 열기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
