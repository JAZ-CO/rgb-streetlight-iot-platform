const express = require("express");
const mqtt = require("mqtt");
const path = require("path");

const app = express();
const PORT = 3000;

// Keep the latest MQTT message in memory
let latestMessage = "No message received yet";

// Serve static files from public/
app.use(express.static(path.join(__dirname, "public")));

// Simple API to fetch latest message
app.get("/api/latest", (req, res) => {
  res.json({ latestMessage });
});

// Start Express server
app.listen(PORT, () => {
  console.log(`Web app running at http://localhost:${PORT}`);
});

// Connect to local MQTT broker
const client = mqtt.connect("mqtt://localhost:1883");

client.on("connect", () => {
  console.log("Connected to MQTT broker");
  client.subscribe("streetlight/node1/telemetry", (err) => {
    if (err) {
      console.error("Subscribe failed:", err.message);
    } else {
      console.log("Subscribed to streetlight/node1/telemetry");
    }
  });
});

client.on("message", (topic, message) => {
  latestMessage = message.toString();
  console.log(`MQTT message on ${topic}: ${latestMessage}`);
});

client.on("error", (err) => {
  console.error("MQTT error:", err.message);
});