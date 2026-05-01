#include <WiFi.h>
#include <PubSubClient.h>

const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";
const char* mqtt_server = "YOUR_LAPTOP_IP";
const int mqtt_port = 1883;

// Change this for each ESP32 board: node1, node2, node3, ...
const char* NODE_ID = "node1";

const int L1_R = 35;
const int L1_G = 36;
const int L1_B = 37;
const int L2_R = 38;
const int L2_G = 39;
const int L2_B = 40;
const int TRIG = 41;
const int ECHO = 42;

const float CLOSE_CM = 30.0;
const float DELTA_CM = 4.0;
const int LOW_COUNT = 6;
const int HIGH_COUNT = 14;
const int ACCIDENT_COUNT = 24;
const int CLEAR_COUNT = 5;

WiFiClient wifi;
PubSubClient mqtt(wifi);

String stateCode = "00";
String stateName = "clear";
String modeName = "auto";
String manualColor = "";

float lastDistance = -1;
float distanceCm = 999;
int stableCount = 0;
int clearCount = 0;
bool blinkOn = true;

unsigned long lastSample = 0;
unsigned long lastBlink = 0;
unsigned long lastPublish = 0;

String topicState() {
  return "streetlight/" + String(NODE_ID) + "/state";
}

String topicCmd() {
  return "streetlight/" + String(NODE_ID) + "/cmd";
}

void oneLed(int r, int g, int b, String color) {
  digitalWrite(r, color == "red" || color == "yellow" || color == "purple" || color == "white");
  digitalWrite(g, color == "green" || color == "yellow" || color == "white");
  digitalWrite(b, color == "blue" || color == "purple" || color == "white");
}

String autoColor() {
  if (stateCode == "00") return "green";
  if (stateCode == "01") return "yellow";
  if (stateCode == "10") return "red";
  if (stateCode == "11") return blinkOn ? "red" : "off";
  return "off";
}

String ledColor() {
  if (modeName == "manual") return manualColor;
  return autoColor();
}

void applyLeds() {
  String color = ledColor();
  oneLed(L1_R, L1_G, L1_B, color);
  oneLed(L2_R, L2_G, L2_B, color);
}

float readDistance() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);

  long us = pulseIn(ECHO, HIGH, 30000);
  if (us == 0) return 999;
  return us * 0.0343 / 2.0;
}

void setState(String code, String name, String note) {
  if (stateCode == code) return;
  stateCode = code;
  stateName = name;
  publishState(note);
}

void updateState() {
  bool close = distanceCm <= CLOSE_CM;
  bool stable = false;

  if (lastDistance > 0) {
    stable = abs(distanceCm - lastDistance) <= DELTA_CM;
  }
  lastDistance = distanceCm;

  if (close && stable) {
    stableCount++;
    clearCount = 0;
  } else if (close) {
    stableCount = 1;
    clearCount = 0;
  } else {
    stableCount = 0;
    clearCount++;
  }

  if (clearCount >= CLEAR_COUNT) {
    setState("00", "clear", "road became clear");
  } else if (stableCount >= ACCIDENT_COUNT) {
    setState("11", "accident", "object stayed too long");
  } else if (stableCount >= HIGH_COUNT) {
    setState("10", "high congestion", "long stable close distance");
  } else if (stableCount >= LOW_COUNT) {
    setState("01", "low congestion", "short stable close distance");
  }
}

void publishState(String note) {
  String color = ledColor();
  String msg = "{";
  msg += "\"node\":\"" + String(NODE_ID) + "\",";
  msg += "\"light1\":\"" + color + "\",";
  msg += "\"light2\":\"" + color + "\",";
  msg += "\"stateCode\":\"" + stateCode + "\",";
  msg += "\"state\":\"" + stateName + "\",";
  msg += "\"mode\":\"" + modeName + "\",";
  msg += "\"distanceCm\":" + String(distanceCm, 1) + ",";
  msg += "\"stableCount\":" + String(stableCount) + ",";
  msg += "\"rssi\":" + String(WiFi.RSSI()) + ",";
  msg += "\"note\":\"" + note + "\"";
  msg += "}";

  mqtt.publish(topicState().c_str(), msg.c_str(), true);
  Serial.println("[MQTT] " + topicState() + " " + msg);
}

void onCommand(char* topic, byte* payload, unsigned int length) {
  String msg;
  for (unsigned int i = 0; i < length; i++) msg += (char)payload[i];
  msg.toLowerCase();

  Serial.println("[CMD] " + msg);

  if (msg.indexOf("blue") >= 0) {
    modeName = "manual";
    manualColor = "blue";
  } else if (msg.indexOf("purple") >= 0) {
    modeName = "manual";
    manualColor = "purple";
  } else if (msg.indexOf("yellow") >= 0) {
    modeName = "manual";
    manualColor = "yellow";
  } else if (msg.indexOf("auto") >= 0) {
    modeName = "auto";
    manualColor = "";
  } else {
    Serial.println("[CMD] ignored unknown command");
    return;
  }

  applyLeds();
  publishState("dashboard command received");
}
void connectWifi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.print("WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(" connected");
  Serial.println(WiFi.localIP());
}

void connectMqtt() {
  while (!mqtt.connected()) {
    String id = "ESP32S3-" + String(NODE_ID) + "-" + WiFi.macAddress();
    id.replace(":", "");

    Serial.print("MQTT connecting...");
    if (mqtt.connect(id.c_str())) {
      Serial.println(" connected");
      mqtt.subscribe(topicCmd().c_str(), 1);
      publishState("node online");
    } else {
      Serial.println(" failed");
      delay(1500);
    }
  }
}

void setup() {
  Serial.begin(115200);

  pinMode(L1_R, OUTPUT);
  pinMode(L1_G, OUTPUT);
  pinMode(L1_B, OUTPUT);
  pinMode(L2_R, OUTPUT);
  pinMode(L2_G, OUTPUT);
  pinMode(L2_B, OUTPUT);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);

  applyLeds();
  connectWifi();
  mqtt.setServer(mqtt_server, mqtt_port);
  mqtt.setCallback(onCommand);
  mqtt.setKeepAlive(30);
}

void loop() {
  if (!mqtt.connected()) connectMqtt();
  mqtt.loop();

  if (millis() - lastBlink > 500) {
    lastBlink = millis();
    blinkOn = !blinkOn;
    applyLeds();
  }

  if (millis() - lastSample > 700) {
    lastSample = millis();
    distanceCm = readDistance();
    updateState();
    applyLeds();

    Serial.print("[SENSOR] distance=");
    Serial.print(distanceCm, 1);
    Serial.print(" cm state=");
    Serial.print(stateCode);
    Serial.print(" stable=");
    Serial.print(stableCount);
    Serial.print(" mode=");
    Serial.println(modeName);
  }

  if (millis() - lastPublish > 8000) {
    lastPublish = millis();
    publishState("heartbeat");
  }
}
