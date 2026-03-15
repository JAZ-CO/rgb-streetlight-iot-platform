export default function NodeCard({ node }) {
  return (
    <section
      style={{
        border: "1px solid #ddd",
        borderRadius: "12px",
        padding: "1rem",
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
      }}
    >
      <h2>{node.id}</h2>
      <p><strong>Mode:</strong> {node.mode}</p>
      <p><strong>Brightness:</strong> {node.brightness}</p>
      <p><strong>RGB:</strong> {node.rgbColor}</p>
      <p><strong>Lux:</strong> {node.lux}</p>
      <p><strong>Motion:</strong> {String(node.motion)}</p>
    </section>
  );
}
