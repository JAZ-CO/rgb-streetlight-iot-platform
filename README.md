# Adaptive RGB Smart Street Lighting - Ultrasonic 2-bit states

This is a simple COE 454 IoT project version.

It uses:

- ESP32-S3
- 2 common-cathode RGB LEDs per node
- 1 ultrasonic sensor per node
- MQTT
- Node.js dashboard
- embedded MQTT broker

The dashboard supports multiple ESP32 nodes.
Each ESP32 should use a different NODE_ID in the Arduino sketch.

## One-command run

On Windows:

```powershell
.\run.bat
```

This starts:

- MQTT broker on port 1883
- web dashboard at http://localhost:3000

## MQTT topics

Each node publishes to:

```text
streetlight/<nodeId>/state
```

The dashboard sends commands to:

```text
streetlight/<nodeId>/cmd
```

Example node IDs:

```text
node1
node2
node3
```

## 2-bit road states

| Bits | State | LED behavior |
|---|---|---|
| 00 | clear | green |
| 01 | low congestion | yellow |
| 10 | high congestion | red |
| 11 | accident | flashing red |

The state changes slowly on purpose.
A close object must stay stable for several readings before the state increases.

## ESP32-S3 pin layout

| Part | Signal | ESP32-S3 pin |
|---|---|---:|
| LED 1 | Red | GPIO35 |
| LED 1 | Green | GPIO36 |
| LED 1 | Blue | GPIO37 |
| LED 2 | Red | GPIO38 |
| LED 2 | Green | GPIO39 |
| LED 2 | Blue | GPIO40 |
| Ultrasonic | TRIG | GPIO41 |
| Ultrasonic | ECHO | GPIO42 |

## Arduino file

Upload:

```text
firmware/streetlight_esp32s3_ultrasonic_2bit_states.ino
```

Before upload, edit:

```cpp
const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";
const char* mqtt_server = "YOUR_LAPTOP_IP";
const char* NODE_ID = "node1";
```

For another ESP32, change only `NODE_ID`, for example:

```cpp
const char* NODE_ID = "node2";
```

## Manual dashboard control

The dashboard can manually set each node's LEDs to:

- blue
- purple
- yellow

Use Auto to return that node to automatic ultrasonic detection.

This version fixes manual control by publishing commands directly through the embedded MQTT broker. When the ESP32 receives a dashboard command, Serial Monitor prints `[CMD] ...`, then the ESP32 publishes an updated state message.
