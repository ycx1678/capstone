export default function AdminCard({ ui, title, sub, right, children }) {
  return (
    <div style={ui.card}>
      <div style={ui.cardHeader}>
        <div style={{ minWidth: 0 }}>
          <div style={ui.cardTitle}>{title}</div>
          {sub ? <div style={ui.cardSub}>{sub}</div> : null}
        </div>
        {right ? <div>{right}</div> : null}
      </div>
      <div style={ui.cardBody}>{children}</div>
    </div>
  );
}
