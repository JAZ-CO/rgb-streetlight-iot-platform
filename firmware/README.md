# Firmware

## Purpose
Contains ESP32 firmware for both lamp nodes.

## Structure
- `common/` - shared logic, config, helpers
- `node1/` - firmware for lamp node 1
- `node2/` - firmware for lamp node 2

## Main behavior
Each node should:
- read ambient light sensor
- read motion sensor
- control RGB output
- follow the local state machine
- publish telemetry to MQTT
- receive commands from MQTT

## State machine
- DAY_OFF
- NIGHT_STANDBY
- MOTION_ACTIVE
- MANUAL_OVERRIDE
- FAULT
