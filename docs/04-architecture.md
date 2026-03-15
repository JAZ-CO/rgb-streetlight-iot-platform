# Architecture

## Edge layer
- ESP32 node1
- ESP32 node2
- local sensing and actuation
- local state machine

## Communication layer
- MQTT
- Mosquitto broker

## Cloud layer
- Node.js backend
- PostgreSQL database
- React dashboard
- OpenStack VM

## Data flow
1. Node reads sensors
2. Node updates local state
3. Node publishes telemetry/state via MQTT
4. Backend consumes messages
5. Backend stores state/history
6. Dashboard retrieves or receives live updates
7. Dashboard commands are sent back through backend to MQTT
