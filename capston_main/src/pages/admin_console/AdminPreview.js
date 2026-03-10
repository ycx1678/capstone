export default function AdminPreview({ ui, src }) {
  if (!src) return <div style={ui.previewEmpty}>No image</div>;
  return (
    <div style={ui.previewWrap}>
      <img src={src} alt="" style={ui.previewImg} />
    </div>
  );
}
