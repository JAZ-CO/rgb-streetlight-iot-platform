import mqtt from "mqtt";

const brokerUrl = process.env.MQTT_BROKER_URL || "mqtt://localhost:1883";

export function connectMqtt() {
  const client = mqtt.connect(brokerUrl);

  client.on("connect", () => {
    console.log("Connected to MQTT broker:", brokerUrl);
    client.subscribe("streetlight/+/telemetry");
    client.subscribe("streetlight/+/state");
  });

  client.on("message", (topic, message) => {
    console.log("MQTT message:", topic, message.toString());
  });

  client.on("error", (err) => {
    console.error("MQTT error:", err.message);
  });

  return client;
}
