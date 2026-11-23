import type { StatePatch } from "./types";

const BASE_URL = process.env.SIM_URL || "http://localhost:3000";

function usage(): void {
  console.log(`Usage:
  npm run cli -- list
  npm run cli -- get <deviceId>
  npm run cli -- set <deviceId> on|off
  npm run cli -- set <deviceId> <field>=<value> [...]

Env:
  SIM_URL   base URL of the simulator (default ${BASE_URL})`);
}

async function call(
  method: string,
  path: string,
  body?: StatePatch,
): Promise<void> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let payload: unknown;
  try {
    payload = JSON.parse(text);
  } catch {
    payload = text;
  }

  if (!response.ok) {
    console.error(`${response.status} ${method} ${path}`);
    console.error(
      typeof payload === "string" ? payload : JSON.stringify(payload),
    );
    process.exit(1);
  }

  console.log(JSON.stringify(payload, null, 2));
}

function parsePatch(args: string[]): StatePatch {
  const patch: Record<string, boolean | number | string> = {};

  for (const arg of args) {
    const [key, raw] = arg.split("=");
    if (!key || raw === undefined) {
      throw new Error(`Expected field=value, got "${arg}"`);
    }
    if (raw === "true") {
      patch[key] = true;
    } else if (raw === "false") {
      patch[key] = false;
    } else if (raw !== "" && !Number.isNaN(Number(raw))) {
      patch[key] = Number(raw);
    } else {
      patch[key] = raw;
    }
  }

  return patch as StatePatch;
}

async function main(): Promise<void> {
  const [command, ...rest] = process.argv.slice(2);

  switch (command) {
    case "list":
      await call("GET", "/devices");
      return;

    case "get": {
      const id = rest[0];
      if (!id) {
        usage();
        process.exit(1);
      }
      await call("GET", `/devices/${encodeURIComponent(id)}`);
      return;
    }

    case "set": {
      const [id, ...args] = rest;
      if (!id || args.length === 0) {
        usage();
        process.exit(1);
      }
      const patch: StatePatch =
        args.length === 1 && (args[0] === "on" || args[0] === "off")
          ? { on: args[0] === "on" }
          : parsePatch(args);
      await call(
        "POST",
        `/admin/devices/${encodeURIComponent(id)}/state`,
        patch,
      );
      return;
    }

    default:
      usage();
      process.exit(1);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
