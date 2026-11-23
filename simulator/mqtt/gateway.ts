import mqtt, { type MqttClient } from "mqtt";
import { deviceService } from "../services";
import type { Config, Device } from "../types";

type GatewayConfig = Pick<Config, "brokerUrl" | "topicPrefix">;

export function createGateway(
  { brokerUrl, topicPrefix }: GatewayConfig,
  logger: Pick<Console, "log" | "warn" | "error"> = console,
) {
  const clients = new Map<string, MqttClient>();

  const topic = (id: string, channel: string): string =>
    `${topicPrefix}/${id}/${channel}`;

  function publishState(device: Device): void {
    const client = clients.get(device.id);
    if (!client?.connected) {
      return;
    }
    client.publish(topic(device.id, "state"), JSON.stringify(device.state), {
      qos: 0,
      retain: true,
    });
  }

  function connect(device: Device): void {
    const client = mqtt.connect(brokerUrl, {
      clientId: `sim-${device.id}`,
      reconnectPeriod: 2000,
      will: {
        topic: topic(device.id, "status"),
        payload: "offline",
        qos: 1,
        retain: true,
      },
    });

    client.on("connect", () => {
      logger.log(`[mqtt] ${device.id} connected`);
      client.publish(topic(device.id, "status"), "online", {
        qos: 1,
        retain: true,
      });
      client.subscribe(topic(device.id, "set"), { qos: 1 });
      publishState(device);
    });

    client.on("message", (_topic: string, payload: Buffer) => {
      let patch: unknown;
      try {
        patch = JSON.parse(payload.toString());
      } catch {
        logger.warn(`[mqtt] ${device.id}: payload is not JSON, ignored`);
        return;
      }

      try {
        const state = deviceService.apply(device.id, patch, { source: "app" });
        logger.log(`[mqtt] ${device.id} -> ${JSON.stringify(state)}`);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "unknown error";
        logger.warn(`[mqtt] ${device.id}: rejected (${message})`);
      }
    });

    client.on("error", (error: Error) => {
      logger.error(`[mqtt] ${device.id}: ${error.message}`);
    });

    clients.set(device.id, client);
  }

  function start(): void {
    for (const device of deviceService.list()) {
      connect(device);
    }
    deviceService.on("state", publishState);
  }

  function stop(): void {
    deviceService.off("state", publishState);
    for (const [id, client] of clients) {
      client.publish(topic(id, "status"), "offline", { qos: 1, retain: true });
      client.end();
    }
    clients.clear();
  }

  return { start, stop };
}
