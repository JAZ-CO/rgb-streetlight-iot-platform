# Requirements

## Functional requirements
- The system shall detect ambient light level
- The system shall detect motion
- The system shall adapt lamp behavior based on local state
- The system shall publish telemetry through MQTT
- The backend shall store telemetry and current state
- The dashboard shall display live lamp status
- The dashboard shall allow manual override commands

## Non-functional requirements
- low latency
- maintainable code
- organized documentation
- reproducible deployment
- reliable communication

## Assumptions
- Wi-Fi is available in the test area
- OpenStack VM is reachable
- Both nodes can access the broker
