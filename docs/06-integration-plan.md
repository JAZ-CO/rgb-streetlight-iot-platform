# Integration Plan

## Person 1 delivers
- MQTT topic and payload definitions
- backend telemetry handler
- API endpoints
- dashboard pages

## Person 2 delivers
- working firmware on both nodes
- stable sensor reads
- local state machine
- correct MQTT publish/subscribe behavior

## Integration checkpoints
1. backend receives test MQTT payload
2. real ESP32 telemetry reaches backend
3. dashboard shows live device state
4. manual override command reaches node
