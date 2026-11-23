# Message Contract

This document describes the messages exchanged between the app (through its protocol adapters) and the simulated devices. It is based on the suggested contract in the brief, with the details filled in. Edit anything that differs in the final implementation.

All payloads are JSON unless noted. `<deviceId>` is the device's stable id (e.g. `light-1`).

## Host addresses

`<host>` is the machine running the simulator, as seen from where the app runs:

| App runs on | `<host>` |
|---|---|
| Android emulator | `10.0.2.2` |
| iOS simulator | `localhost` |
| Physical device | the computer's LAN IP |

## MQTT

Broker URL: `ws://<host>:9001` (WebSocket listener of Mosquitto). See "Host addresses" below for `<host>`.
Topic prefix is configurable per device; default `home`. When using a public broker, use a unique prefix such as `home-<random>`. In the app it is stored as `config.topicPrefix`; the adapter builds the full topic as `<topicPrefix>/<deviceId>/<channel>`.

| Topic | Direction | Payload | QoS / retain |
|---|---|---|---|
| `<prefix>/<deviceId>/state` | device → app | state object (below) | QoS 0, retained |
| `<prefix>/<deviceId>/set` | app → device | partial state object (below) | QoS 1, not retained |
| `<prefix>/<deviceId>/status` | device → app | `"online"` or `"offline"` (plain string) | QoS 1, **retained** |

Notes:
- `status` is published as `online` on connect. The simulator registers a **Last Will** of `offline` on the same topic, so the broker publishes it if the simulator dies.
- Retained `state` and `status` mean the app gets the latest values immediately after subscribing.
- The device should publish a new `state` after applying a `set`; the app treats that message as the confirmation (no optimistic update).

## HTTP (REST)

Base URL: `http://<host>:3000`. See "Host addresses" below for `<host>`. The app stores this host-level URL as `config.baseUrl`; adapters append `/devices/<deviceId>`, so one base URL serves every HTTP device and the user never types the device id twice.

| Request | Response |
|---|---|
| `GET /devices/<deviceId>` | `200` with state object |
| `POST /devices/<deviceId>/set` with partial state object | `200` with the new state object |

Error responses: `404` unknown device or wrong path → `wrong_url`; `400` invalid payload → the adapter rejects the command before sending. A network failure or no response within the timeout is treated as `request_timeout` (no response) or `device_offline` (repeated failures) by the adapter.

Polling: the `HttpAdapter` calls `GET` every `N` seconds (default 3 s, configurable). Consecutive failures mark the device offline; the next success marks it online again.

Admin (simulator only, not used by the app): `POST /admin/devices/<deviceId>/state` changes a device's state from outside, to demonstrate live updates.

## State objects

| Device type | State | Set (app → device) |
|---|---|---|
| Light | `{"on": true, "brightness": 70}` | `{"on": false}` and/or `{"brightness": 40}` |
| Smart plug | `{"on": true}` | `{"on": false}` |
| Sensor | `{"temperature": 26.5, "humidity": 61}` | not supported (read only) |

Validation rules (enforced in the domain model, not in the adapters):
- `on`: boolean
- `brightness`: integer, 0–100 inclusive
- `temperature`: number, in °C
- `humidity`: number, 0–100 (%)
- Sending a command to a sensor is rejected before it reaches any transport.

## Error mapping

Adapters translate library and HTTP failures into one typed value, `AppError`, with a `kind` field. These four `kind` strings are the only error vocabulary in the app: the same strings are stored in the model's `errorType` and shown in the banner (design system §6.5). Do not introduce a second set of names.

| Situation | `kind` / `errorType` |
|---|---|
| MQTT broker cannot be reached / connection times out | `broker_unreachable` |
| Malformed broker or base URL, or the endpoint answers `404` | `wrong_url` |
| MQTT `status` = `offline`, or repeated HTTP polling failures | `device_offline` |
| HTTP request exceeds the timeout | `request_timeout` |

`404` is folded into `wrong_url`: a wrong device path and a wrong host look the same to the person holding the phone, and both banners show the endpoint that failed. Any other status code (`5xx`) is `request_timeout` only when the request never completes; otherwise it is reported as `device_offline` with the status code in `errorMessage`.
