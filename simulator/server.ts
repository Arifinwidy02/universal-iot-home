import { config } from "./config";
import { app } from "./app";

import { deviceService } from "./services";
import { createGateway } from "./mqtt/gateway";

const gateway = createGateway(config);
gateway.start();

const server = app.listen(config.httpPort, () => {
  console.log(`[http] http://localhost:${config.httpPort}/devices`);
  console.log(
    `[mqtt] broker ${config.brokerUrl}, prefix "${config.topicPrefix}"`,
  );
});

const ticker = setInterval(
  () => deviceService.tickSensor("sensor-1"),
  config.sensorIntervalMs,
);

function shutdown(signal: string): void {
  console.log(`[sim] ${signal} received, marking devices offline`);
  clearInterval(ticker);
  gateway.stop();
  server.close(() => process.exit(0));
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
