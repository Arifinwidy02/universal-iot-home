# Universal IoT Home

One mobile app that controls smart-home devices the same way, whatever protocol they speak. The UI only talks to a common device model; protocol adapters (MQTT, HTTP) translate to and from each protocol.

- **Platform:** Android (primary, run on the Android emulator). iOS simulator: <tested / best effort / not tested, state it honestly>
- **Stack:** React Native CLI (bare, no Expo), TypeScript, Redux Toolkit, Jest
- **Demo video:** <LINK>
- **Architecture slide:** [docs/architecture.pdf](docs/architecture.pdf) (editable source: [docs/architecture.drawio](docs/architecture.drawio))

## Screenshots
<!-- 3-4 images from docs/screenshots: device list, add device, device control, error state -->

## Run it from a fresh clone

### Prerequisites
<!-- Node version, JDK, Android Studio + emulator, Docker. Fill with the versions you actually used. -->

### 1. Start the simulator
```bash
cd simulator
docker compose up -d        # Mosquitto (TCP 1883, WebSocket 9001)
npm install
npm start                   # HTTP mock + MQTT publisher
```
Change a device's state from outside the app (to watch live updates):
```bash
node sim.js set plug-1 on
```

### 2. Run the app
```bash
cd app
npm install
npm run android             # Android emulator must be running
```
iOS (optional):
```bash
cd app/ios && pod install && cd ..
npm run ios
```
Connection details to enter when adding devices:

| Protocol | Field | Android emulator | iOS simulator |
|---|---|---|---|
| MQTT | Broker URL | `ws://10.0.2.2:9001` | `ws://localhost:9001` |
| MQTT | Topic prefix | `home` | `home` |
| HTTP | Base URL | `http://10.0.2.2:3000` | `http://localhost:3000` |

On a physical phone, use your computer's LAN IP instead.

### 3. Run the tests
```bash
cd app
npm test
```

The suite covers the domain rules, both adapters with a mocked transport, the
persistence transform, the device reducer, and the readout formatter. Nothing
touches a real broker, socket, or emulator, so it runs in well under a second.

Polling is covered with Jest fake timers
(`__tests__/adapters/HttpAdapter.polling.test.ts`), which is how the 3-second
interval is asserted without waiting.

## Why this stack
<!-- Why React Native + Redux Toolkit + Jest, why Android, why mqtt.js over WebSocket. Be honest about trade-offs (e.g. productivity vs. native). -->

## Architecture
Layers, with dependencies pointing one way: **UI → State (Redux) → Domain → Adapters**. Storage sits beside State.

- **UI** follows [docs/relay_os_design_system.md](docs/relay_os_design_system.md) (RELAY // OS): semantic colour tokens, monospace telemetry readouts, and zero MQTT or HTTP imports inside screens.
- **Domain** holds the common device model (`Device`, the brief's `CommonDeviceModel`), commands, typed errors, the `DeviceAdapter` interface, `DeviceRepository` and `AdapterRegistry`. No protocol library is imported here.
- **Adapters** (`MqttAdapter`, `HttpAdapter`) are the only code that knows topics, JSON shapes, `fetch` or `mqtt.js`.
- **Redux** stores only serializable data (device config, state, status, errors). Adapter instances live outside the store.
- **Adding a protocol** = one new adapter class + one registry entry. No screen changes.

See the slide in `docs/` for the command flow and the state-update flow, and [docs/message-contract.md](docs/message-contract.md) for the message formats.

## What is done / not done / next

### Done
<!-- tick the must-haves you actually finished -->
- [ ] Device list · [ ] Add · [ ] Edit/Delete · [ ] Light/Plug/Sensor · [ ] MQTT + HTTP · [ ] Live state · [ ] Persistence · [ ] Error states · [ ] Unit tests

### Not done
<!-- be specific and honest -->

### Next, with more time
<!-- e.g. SSE/WebSocket for HTTP devices, integration tests against a real broker, rooms and scenes, CI -->

## Trade-offs and assumptions
<!-- Examples to adapt to what you really did:
- HTTP uses polling every N s because REST has no push; production would consider SSE/WebSocket.
- Only device config is persisted; live state is re-fetched after launch.
- State is confirmed by the device's own state message, not an optimistic update.
- No authentication/TLS on the broker or HTTP mock (out of scope).
- Single platform (Android) tested on emulator version X. -->

## How I used AI tools
<!-- Be specific: which tool, for what (e.g. brainstorming architecture, generating simulator boilerplate, reviewing tests), and what you wrote/changed yourself. -->
