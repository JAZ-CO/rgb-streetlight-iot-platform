# MQTT Topics and Payloads

## Topics
- `streetlight/node1/telemetry`
- `streetlight/node1/state`
- `streetlight/node1/cmd`
- `streetlight/node2/telemetry`
- `streetlight/node2/state`
- `streetlight/node2/cmd`

## Example payload
```json
{
  "node_id": "node1",
  "lux": 120,
  "motion": true,
  "mode": "MOTION_ACTIVE",
  "brightness": 100,
  "rgb_color": "yellow",
  "timestamp": "2026-03-15T19:30:00Z"
}
```
