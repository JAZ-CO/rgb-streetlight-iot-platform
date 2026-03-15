import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/devices", (_req, res) => {
  res.json([
    { id: "node1", label: "Lamp Node 1" },
    { id: "node2", label: "Lamp Node 2" }
  ]);
});

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
