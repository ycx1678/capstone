export default function AdminPinGate({
  ui,
  pin,
  setPin,
  remember,
  setRemember,
  locked,
  lockRemainSec,
  failCount,
  onSubmit,
  onGoHome,
}) {
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: 18 }}>
      <div style={ui.card}>
        <div style={ui.cardHeader}>
          <div style={{ minWidth: 0 }}>
            <div style={ui.cardTitle}>Admin Access</div>
          </div>
          <a
            href="#/"
            onClick={(e) => {
              e.preventDefault();
              onGoHome();
            }}
            style={{ ...ui.btn, ...ui.btnGhost, textDecoration: "none" }}
          >
            사이트로
          </a>
        </div>

        <div style={ui.cardBody}>
          <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gap: 8 }}>
              <div style={ui.fieldLabel}>PIN</div>
              <input
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                inputMode="numeric"
                autoComplete="one-time-code"
                disabled={locked}
                style={ui.input}
              />

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: locked ? "not-allowed" : "pointer",
                  color: "rgba(255,255,255,0.75)",
                  fontSize: 13,
                }}
              >
                <input
                  type="checkbox"
                  checked={remember}
                  disabled={locked}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                이 기기에서 기억하기(30일)
              </label>

              {locked ? (
                <div style={{ ...ui.sizeHint, marginTop: 4 }}>
                  너무 많은 시도로 잠겼습니다. {lockRemainSec}초 후 다시
                  시도하세요.
                </div>
              ) : failCount > 0 ? (
                <div style={{ ...ui.sizeHint, marginTop: 4 }}>
                  PIN이 틀렸습니다. 실패 횟수: {failCount} / 5
                </div>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={locked}
              style={{
                ...ui.btn,
                ...ui.btnPrimary,
                opacity: locked ? 0.65 : 1,
                cursor: locked ? "not-allowed" : "pointer",
              }}
            >
              {locked ? `잠금 중 (${lockRemainSec}s)` : "입장"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
