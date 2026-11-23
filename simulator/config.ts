import type { Config } from "./types";

export const config: Config = {
  httpPort: Number(process.env.HTTP_PORT || 3000),
  brokerUrl: process.env.BROKER_URL || "mqtt://localhost:1883",
  topicPrefix: process.env.TOPIC_PREFIX || "home",
  sensorIntervalMs: Number(process.env.SENSOR_INTERVAL_MS || 5000),
};
