import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";

dotenv.config();

export function createApp() {
  const app = express();
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

  app.get("/api/devices/:id/state", (req, res) => {
    res.json({
      nodeId: req.params.id,
      mode: "NIGHT_STANDBY",
      brightness: 30,
      rgbColor: "blue"
    });
  });

  app.get("/api/devices/:id/telemetry", (req, res) => {
    res.json({
      nodeId: req.params.id,
      samples: []
    });
  });

  app.post("/api/devices/:id/commands", (req, res) => {
    res.status(202).json({
      message: "Command accepted",
      nodeId: req.params.id,
      command: req.body
    });
  });

  app.get("/api/alerts", (_req, res) => {
    res.json([]);
  });

  function initRealtime(server) {
    const io = new Server(server, {
      cors: { origin: "*" }
    });

    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);
      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });
  }

  return { app, initRealtime };
}
