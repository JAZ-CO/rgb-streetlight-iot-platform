# Backend

## Purpose
Node.js backend that:
- subscribes to MQTT telemetry
- stores device state and history
- exposes REST APIs
- pushes live updates to the frontend

## Main responsibilities
- device state management
- alert logging
- command dispatch
- telemetry ingestion
- websocket updates

## Run locally
```bash
npm install
npm run dev
```

## Important files
- `src/server.js` - app entry point
- `src/app.js` - express app
- `src/routes/` - API routes
- `src/services/mqttService.js` - MQTT logic
- `src/config/db.js` - database configuration
