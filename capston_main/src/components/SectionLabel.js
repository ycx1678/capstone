export default function SectionLabel({ text, styles }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        color: styles?.brand?.base || "#C7A66A",
        fontSize: "12px",
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
      }}
    >
      <span
        style={{
          width: 34,
          height: 1,
          background: `linear-gradient(90deg, rgba(199,166,106,0.18), ${
            styles?.brand?.base || "#C7A66A"
          })`,
        }}
      />
      <span>{text}</span>
    </div>
  );
}