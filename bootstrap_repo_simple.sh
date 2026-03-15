#!/usr/bin/env bash
set -euo pipefail

FORCE=0
TARGET="."

usage() {
  cat <<'EOF'
Usage:
  ./bootstrap_repo_simple.sh [--force] [target-directory]

Options:
  --force    Overwrite existing files
  -h, --help Show this help

Examples:
  ./bootstrap_repo_simple.sh
  ./bootstrap_repo_simple.sh --force
  ./bootstrap_repo_simple.sh my-project
EOF
}

while [ $# -gt 0 ]; do
  case "$1" in
    --force)
      FORCE=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      TARGET="$1"
      shift
      ;;
  esac
done

mkdir -p "$TARGET"

write_file() {
  local path="$1"
  local content="$2"

  mkdir -p "$(dirname "$path")"

  if [ -e "$path" ] && [ "$FORCE" -ne 1 ]; then
    echo "[skip] $path already exists"
    return
  fi

  printf "%s" "$content" > "$path"
  echo "[write] $path"
}

write_file "$TARGET/.gitignore" '# Node
node_modules/
dist/
build/
coverage/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Python
__pycache__/
*.pyc

# PlatformIO / Arduino
.pio/
.vscode/

# Environment
.env
.env.local

# Logs
*.log
logs/

# OS / IDE
.DS_Store
Thumbs.db
.idea/

# Runtime / temp
tmp/
temp/
'

write_file "$TARGET/.env.example" '# Backend
NODE_ENV=development
PORT=3000
DATABASE_URL=postgres://postgres:postgres@postgres:5432/streetlight
MQTT_BROKER_URL=mqtt://mosquitto:1883
FRONTEND_URL=http://localhost:5173

# Frontend
VITE_API_BASE_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
'

write_file "$TARGET/docker-compose.yml" 'version: "3.9"

services:
  mosquitto:
    image: eclipse-mosquitto:2
    ports:
      - "1883:1883"
    volumes:
      - ./infra/mosquitto.conf:/mosquitto/config/mosquitto.conf:ro

  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: streetlight
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    image: node:20
    working_dir: /app
    command: sh -c "npm install && npm run dev"
    env_file:
      - .env.example
    ports:
      - "3000:3000"
    volumes:
      - ./backend:/app
    depends_on:
      - mosquitto
      - postgres

  frontend:
    image: node:20
    working_dir: /app
    command: sh -c "npm install && npm run dev -- --host 0.0.0.0"
    env_file:
      - .env.example
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
    depends_on:
      - backend

volumes:
  postgres_data:
'

write_file "$TARGET/README.md" '# Adaptive RGB Smart Street Lighting System

An IoT-based smart lighting pilot for a private campus road or private roadway, built using:
- two ESP32 lamp nodes
- MQTT communication
- Node.js backend
- React dashboard
- PostgreSQL database
- OpenStack-oriented deployment

## Quick start
```bash
docker compose up
```

## Main folders
- `backend/` - Node.js backend
- `frontend/` - React dashboard
- `firmware/` - ESP32 firmware for node1 and node2
- `docs/` - shared project documentation
- `diagrams/` - UML and architecture diagrams
- `infra/` - broker config and infra notes
'

write_file "$TARGET/backend/README.md" '# Backend

Node.js backend for:
- MQTT telemetry ingestion
- REST APIs
- WebSocket updates
- device state and alert logic
'

write_file "$TARGET/backend/package.json" '{
  "name": "streetlight-backend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "node src/server.js",
    "start": "node src/server.js",
    "test": "echo \"Add backend tests later\""
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "mqtt": "^5.10.1",
    "pg": "^8.12.0",
    "socket.io": "^4.8.0"
  }
}
'

write_file "$TARGET/backend/src/server.js" 'import express from "express";
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
'

write_file "$TARGET/backend/tests/README.md" '# Backend tests go here.
'

write_file "$TARGET/frontend/README.md" '# Frontend

React dashboard for:
- live lamp status
- RGB meaning
- brightness and sensor values
- manual override controls
'

write_file "$TARGET/frontend/package.json" '{
  "name": "streetlight-frontend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.4.2"
  }
}
'

write_file "$TARGET/frontend/index.html" '<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Streetlight Dashboard</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
'

write_file "$TARGET/frontend/vite.config.js" 'import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()]
});
'

write_file "$TARGET/frontend/src/main.jsx" 'import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
'

write_file "$TARGET/frontend/src/App.jsx" 'export default function App() {
  return (
    <main style={{ fontFamily: "Arial, sans-serif", padding: "2rem" }}>
      <h1>Adaptive RGB Smart Street Lighting Dashboard</h1>
      <p>Frontend scaffold created successfully.</p>
    </main>
  );
}
'

write_file "$TARGET/frontend/public/README.md" 'Static assets go here.
'

write_file "$TARGET/firmware/README.md" '# Firmware

Contains ESP32 firmware for:
- `node1/`
- `node2/`

Each node should:
- read ambient light
- read motion
- control RGB output
- publish telemetry via MQTT
- receive commands from backend
'

write_file "$TARGET/firmware/node1/README.md" '# Node 1 Firmware

Add:
- pin mapping
- sensor thresholds
- state machine behavior
- MQTT topic usage
'

write_file "$TARGET/firmware/node1/platformio.ini" '[env:esp32dev]
platform = espressif32
board = esp32dev
framework = arduino
monitor_speed = 115200
'

write_file "$TARGET/firmware/node1/src/main.cpp" '#include <Arduino.h>

void setup() {
  Serial.begin(115200);
  Serial.println("Node 1 boot");
}

void loop() {
  delay(1000);
}
'

write_file "$TARGET/firmware/node2/README.md" '# Node 2 Firmware

Add:
- pin mapping
- sensor thresholds
- state machine behavior
- MQTT topic usage
'

write_file "$TARGET/firmware/node2/platformio.ini" '[env:esp32dev]
platform = espressif32
board = esp32dev
framework = arduino
monitor_speed = 115200
'

write_file "$TARGET/firmware/node2/src/main.cpp" '#include <Arduino.h>

void setup() {
  Serial.begin(115200);
  Serial.println("Node 2 boot");
}

void loop() {
  delay(1000);
}
'

write_file "$TARGET/docs/project-overview.md" '# Project Overview

## Title
Adaptive RGB Smart Street Lighting System

## Summary
A two-node IoT smart lighting pilot for a private campus or private roadway using ESP32 nodes, MQTT, Node.js, React, PostgreSQL, and OpenStack-oriented deployment.
'

write_file "$TARGET/docs/requirements.md" '# Requirements

## Functional
- detect ambient light
- detect motion
- change RGB/brightness locally
- publish telemetry over MQTT
- display live state on dashboard
- support manual override

## Non-functional
- low latency
- clear documentation
- maintainable code
- reproducible deployment
'

write_file "$TARGET/docs/architecture.md" '# Architecture

## Edge
- ESP32 node1
- ESP32 node2
- local sensing and actuation
- local state machine

## Cloud
- Mosquitto broker
- Node.js backend
- PostgreSQL
- React dashboard
- OpenStack VM
'

write_file "$TARGET/docs/team-roles.md" '# Team Roles

## Person 1
- Node.js backend
- PostgreSQL
- React dashboard
- MQTT communication layer
- APIs and realtime updates

## Person 2
- ESP32 firmware
- sensor integration
- RGB control
- local state machine
- OpenStack setup

## Shared
- architecture
- testing
- performance evaluation
- report
'

write_file "$TARGET/docs/api-and-mqtt.md" '# API and MQTT

## REST endpoints
- `GET /health`
- `GET /api/devices`

## MQTT topics
- `streetlight/node1/telemetry`
- `streetlight/node1/state`
- `streetlight/node1/cmd`
- `streetlight/node2/telemetry`
- `streetlight/node2/state`
- `streetlight/node2/cmd`
'

write_file "$TARGET/docs/hardware-and-firmware.md" '# Hardware and Firmware

Document here:
- component list
- wiring
- pin mapping
- thresholds
- node state machine
- calibration notes
'

write_file "$TARGET/docs/deployment.md" '# Deployment

## Local
- docker compose up

## Cloud
- OpenStack VM
- Docker install
- service deployment
- broker access
'

write_file "$TARGET/docs/test-plan.md" '# Test Plan

## Tests
- backend API checks
- MQTT flow validation
- firmware state behavior
- end-to-end motion event
- manual override
'

write_file "$TARGET/docs/performance-evaluation.md" '# Performance Evaluation

Measure:
- node-to-dashboard latency
- command-to-actuation latency
- MQTT QoS behavior
- disconnect/reconnect behavior
'

write_file "$TARGET/docs/user-manual.md" '# User Manual

Explain:
- how to start services
- how to flash nodes
- how to view dashboard
- how to send commands
'

write_file "$TARGET/diagrams/README.md" '# Diagrams

Store UML and architecture diagrams here:
- system-context
- architecture
- state-machine
- sequence-motion-event
- sequence-manual-override
- er-diagram
'

write_file "$TARGET/infra/README.md" '# Infrastructure

Contains broker config and simple infra notes.
Use `docs/deployment.md` for full deployment instructions.
'

write_file "$TARGET/infra/mosquitto.conf" 'listener 1883
allow_anonymous true
persistence false
'

echo
echo "[done] Simplified project scaffold created in: $TARGET"
echo "Next steps:"
echo "  1. git init"
echo "  2. git add ."
echo "  3. git commit -m "Initial simplified project scaffold""
echo "  4. docker compose up"
