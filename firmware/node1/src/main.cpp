#include <Arduino.h>

void setup() {
  Serial.begin(115200);
  Serial.println("Node 1 boot");
}

void loop() {
  delay(1000);
}
