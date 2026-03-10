export default function Field({ label, fieldLabelStyle, children }) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={fieldLabelStyle}>{label}</div>
      {children}
    </div>
  );
}
