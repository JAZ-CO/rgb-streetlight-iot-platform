import NodeCard from "../components/NodeCard.jsx";

export default function DashboardPage() {
  const nodes = [
    {
      id: "node1",
      mode: "NIGHT_STANDBY",
      brightness: 30,
      rgbColor: "blue",
      lux: 120,
      motion: false
    },
    {
      id: "node2",
      mode: "MOTION_ACTIVE",
      brightness: 100,
      rgbColor: "yellow",
      lux: 90,
      motion: true
    }
  ];

  return (
    <main style={{ fontFamily: "Arial, sans-serif", padding: "2rem" }}>
      <h1>Adaptive RGB Smart Street Lighting Dashboard</h1>
      <p>Live status of both lamp nodes.</p>
      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        {nodes.map((node) => (
          <NodeCard key={node.id} node={node} />
        ))}
      </div>
    </main>
  );
}
