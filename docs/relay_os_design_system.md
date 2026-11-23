# RELAY // OS — Design System & UI/UX Specification

> **Target Audience:** AI Coding Agents & Mobile Engineers (Flutter, React Native, Kotlin/Compose, SwiftUI)  
> **Product:** Universal IoT Home App (Protocol-Agnostic Smart Home Controller)  
> **Aesthetic Direction:** Tactile Industrial Hardware / Architectural Switchboard (inspired by Dieter Rams / Braun & Teenage Engineering)

**Authority of this document.** This is the source of truth for **appearance**: colour, typography, spacing, components, motion. It is *not* the source of truth for the data model or the wire format — those are `docs/message-contract.md` (topics, endpoints, payloads) and `app/src/domain/` (types). Section 7 has been aligned with both; if they ever disagree again, fix this document, not the contract.

**Scope against the brief.** The take-home brief lists 9 must-haves; rooms, a scene (`ALL OFF`), dark mode and QR scan are explicitly *nice to have*. Everything in this document is allowed, but the UI work is split into two phases in `docs/MILESTONES.md`: phase 1 covers the must-haves in RELAY styling, phase 2 adds the optional extras. Nothing in phase 2 may start while a must-have is red.

---

## 1. Design Philosophy & Anti-Slop Guardrails

### Core Principles
1. **Hardware Honesty:** UI controls should look and behave like physical switches, dimmer rails, and telemetry gauges—not generic web cards.
2. **Protocol Agnosticism in UI:** The UI **must never** import or reference MQTT/HTTP client libraries directly. Every screen and component binds strictly to a normalized `CommonDeviceModel`.
3. **High-Contrast Legibility:** Use matte ceramic/charcoal surfaces with crisp `1.5px` borders and high-contrast monospace telemetry.
4. **Zero-Ambiguity Safety:** Destructive or high-impact actions (`ALL OFF`, `DELETE`) require explicit 2-step confirmation. Error states must clearly explain *what* failed without crashing or hanging the app.

### Strict "DO NOT" Rules (Anti-Slop)
- **DO NOT** use purple/blue neon gradients, glassmorphism (`backdrop-blur`), or glowing drop shadows on cards.
- **DO NOT** use generic soft-pill toggles (`Switch`) for Smart Plugs; use the mechanical `I / O` rocker switch.
- **DO NOT** use proportional fonts for numbers (brightness %, temperature, humidity, counts). Always use monospace with `tabular-nums`.
- **DO NOT** hide `EDIT` or `DELETE` behind obscure gestures (like swipe-only); keep them explicitly accessible on every device card and inside the Edit sheet.
- **DO NOT** invent unsupported device types (keep strictly to `Light`, `Smart Plug`, `Sensor`).

---

## 2. Color System (Semantic Tokens)

The app supports two first-class themes: **Daylight Ceramic** (default) and **Night-Shift** (dark mode). All components must consume semantic tokens, never hardcoded hex values.

| Semantic Token | Daylight Ceramic (`theme-day`) | Night-Shift (`theme-night`) | Usage |
| :--- | :--- | :--- | :--- |
| `canvas` | `#EFECE6` | `#141413` | Main screen background |
| `surface` | `#F7F5F0` | `#1E1E1C` | Device cards, bottom sheets, primary buttons |
| `recessed` | `#E2DDD5` | `#0D0D0C` | Input fields, dimmer rail track, rocker housing, card footer |
| `ink` | `#1A1A18` | `#F2EFE9` | Primary text, active chip fill, primary CTA background |
| `inkMuted` | `#6E6A63` | `#8E8A82` | Labels, metadata, inactive states, room tags |
| `border` | `#D2CCC1` | `#2E2D2A` | Default card border (`1.5px`), dividers (`1px`) |
| `borderStrong` | `#B5AEA1` | `#46443F` | Interactive borders, inputs, rocker housing, badges |
| `accent` | `#FF4D00` | `#FF4D00` | **International Safety Orange** — Active power, LED slit, primary save CTA, dimmer handle |
| `accentSoft` | `rgba(255, 77, 0, 0.14)` | `rgba(255, 77, 0, 0.20)` | Energized badge background, dimmer fill start |
| `online` | `#16A34A` | `#16A34A` | Online LED dot, MQTT live indicator, sensor sparkline |
| `onlineSoft` | `rgba(22, 163, 74, 0.12)` | `rgba(22, 163, 74, 0.16)` | Online pill background |
| `danger` | `#D92D20` | `#EF4444` | Fault border, offline/error text, hazard stripe, delete actions |
| `dangerBg` | `#FDF2F1` | `rgba(217, 45, 32, 0.11)` | Fault card & error banner background |
| `rockerTop` | `#FFFFFF` | `#2B2B28` | Mechanical rocker switch bevel highlight |
| `rockerBot` | `#DDD7CD` | `#121211` | Mechanical rocker switch bevel shadow |

### Hazard Stripe Pattern (Error Banners)
Diagonal 45-degree repeating stripe used exclusively on the top strip of an inline error banner:
- **Day:** `rgba(217, 45, 32, 0.09)` `6px` stripe / `6px` transparent.
- **Night:** `rgba(217, 45, 32, 0.16)` `6px` stripe / `6px` transparent.

---

## 3. Typography

### Font Families
- **Display / UI Sans:** `Space Grotesk` (Fallback: system sans-serif) — Used for Brand title, Device Name, Modal Headings.
- **Technical / Telemetry Mono:** `JetBrains Mono` (Fallback: system monospace) — Used for ALL numbers, status pills, protocol tags, button labels, form labels, and error diagnostics.

### Type Scale & Rules
| Role | Family | Size | Weight | Tracking | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Brand Wordmark (`RELAY // OS`) | Sans + Mono | `18px` | `700` | `-0.03em` | `//` colored in `accent` |
| Device Name | Sans | `15px` | `700` | `-0.01em` | Single line, ellipsis overflow |
| Telemetry Readout (`On, 70%`, `26.5°C`) | Mono | `24px` | `700` | `0` | **Mandatory `tabular-nums`** |
| Section / Modal Heading | Sans | `16px` | `700` | `-0.02em` | Uppercase or Title Case |
| Action Button / CTA | Mono | `12px` | `700` | `+0.10em` | Always UPPERCASE |
| Micro Badge / Pill / Label | Mono | `9.5px–10px` | `700` | `+0.08em` | Always UPPERCASE |
| Error Diagnostic / Wire Preview | Mono | `10.5px` | `400–500` | `0` | `line-height: 1.35` |

---

## 4. Spacing, Radii & Elevation

- **Base Grid:** `4px` spatial grid.
- **Screen Horizontal Padding:** `16px` (`px-4`).
- **Card Padding:** `14px` (`p-3.5`) for body, `14px` horizontal / `8px` vertical for footer.
- **Card Stack Gap:** `12px` (`space-y-3`).
- **Border Widths:** `1.5px` for cards, dimmer rails, and rocker housings; `1px` for internal dividers and chips.
- **Border Radii:**
  - Device Card: `16px` (`rounded-2xl`)
  - Bottom Sheet Top Corners: `24px` (`rounded-t-[24px]`)
  - Primary Buttons / Error Banner: `12px` (`rounded-xl`)
  - Inputs / Chips / Dimmer Rail / Rocker Housing: `8px–10px` (`rounded-lg`)
  - Micro Badges: `4px–6px` (`rounded`)
- **Elevation:** Flat-tactile. No heavy blur shadows. Use subtle `0 2px 0 rgba(0,0,0,0.04)` on cards and crisp border contrast instead.

---

## 5. Motion & Tactile Feedback

- **Button Press:** Scale down to `0.95–0.98` on press (`100ms`).
- **Rocker Switch:** `140ms` spring/cubic-bezier (`0.2, 0.8, 0.2, 1`) flipping top/bottom bevel gradient + lighting the orange LED slit (`box-shadow: 0 0 10px #FF4D00`).
- **Live Telemetry Pulse (`flash-live`):** Whenever an external state update arrives (via MQTT subscription or HTTP poll delta), briefly animate a `2px` `online` (`#16A34A`) ring around the card that fades out over `650ms`.
- **Online LED Dot:** Gentle `2s` opacity pulse (`1.0 -> 0.4 -> 1.0`). Solid (non-pulsing) when offline/error.
- **Bottom Sheet:** Slide up from bottom (`260ms`, `cubic-bezier(0.16, 1, 0.3, 1)`).

---

## 6. Component Specifications

### 6.1 App Header
- **Left:** `RELAY // OS` wordmark + live counter (`3/4 ONLINE`) with status LED.
- **Right:**
  1. **Theme Toggle:** Compact button (`DAY` / `NIGHT`) with an orange indicator dot.
  2. **2-Step Guarded `ALL OFF` Scene Button:**
     - *Idle:* Surface background, reads `ALL OFF`.
     - *Armed (1st tap):* Turns solid `accent` (`#FF4D00`) with white text `CONFIRM?`. Auto-disarms after `3000ms` if not tapped again.
     - *Executed (2nd tap):* Sends `{ on: false }` to all online `light` and `plug` devices via `DeviceRepository`, displays toast confirmation.

### 6.2 Room Filter Bar
- Horizontally scrollable row of compact monospace chips (`ALL`, `LIVING`, `STUDIO`, `BEDROOM`, `KITCHEN`, `BALCONY`) showing device count per room.
- Active chip: `ink` background + `canvas` text. Inactive chip: `surface` background + `inkMuted` text.

### 6.3 Universal Device Card Anatomy
Every device card shares the exact same outer shell regardless of protocol:
1. **Card Header:**
   - Left: Type badge (`LIGHT` | `SMART PLUG` | `SENSOR`) + Room label + Bold Device Name.
   - Right: Status pill (`ONLINE` in green, `OFFLINE` or `ERROR` in red) + Subtle protocol sync badge (`MQTT • SUB` or `HTTP • POLL 3s`).
2. **Card Body (Type-Specific Control):**
   - Disabled (`opacity: 0.45–0.50`, non-interactive) whenever `status !== 'online'`.
3. **Inline Error Banner (Conditional):**
   - Rendered only when `status !== 'online'`.
4. **Card Footer (`recessed` background, `1px` top border):**
   - Left: Explicit normalized state readout (`STATE: On, 70%`, `STATE: Off`, `STATE: 26.5°C · 61% RH`, or error title).
   - Right: Explicit `EDIT` button and 2-step `DEL` button (1st tap turns solid red `DEL?` for 3s; 2nd tap deletes).

### 6.4 Device Type Controls (Strictly 3 Types)

#### A. `LIGHT` (On/Off + Brightness 0–100)
- **Top Row:** `ILLUMINATION` label + large monospace readout (`On, 70%` or `Off`) on left; tactile Power button (`ON` in `accent` / `OFF` in `recessed`) on right.
- **Dimmer Rail:** Full-width `36px`-tall recessed horizontal track (`0`–`100%`) with scale markers (`0  25  50  75  100%`).
  - Supports direct horizontal drag/scrub (pointer/touch).
  - Filled portion uses `accentSoft` gradient with a `2.5px` solid `accent` right-edge handle.
  - Dragging updates readout immediately; releasing commits `{ on: pct > 0, brightness: pct }` to the adapter.

#### B. `SMART PLUG` (On/Off)
- **Left:** `RELAY CIRCUIT` label + large monospace readout (`On` / `Off`) + status pill (`ENERGIZED` in orange / `CUT` in muted).
- **Right:** Mechanical `66x88px` `I / O` Rocker Switch inside a recessed housing:
  - Top label `I`, center `24x4px` LED slit, bottom label `O`.
  - When `ON`: paddle tilts up, LED slit glows `#FF4D00`.
  - When `OFF`: paddle tilts down, LED slit is unlit.

#### C. `SENSOR` (Temperature & Humidity — Read-Only)
- **Header Row:** `TELEMETRY FEED` label on left + explicit bordered `READ-ONLY` badge on right.
- **Metrics (Left 60%):** Two columns separated by a `1px` vertical divider:
  - `TEMP`: `26.5°C` (`24px` bold mono, 1 decimal place)
  - `HUMIDITY`: `61%` (`24px` bold mono, integer)
- **Sparkline (Right 40%):** Live polyline + translucent green area fill with glowing endpoint dot plotting the last 10 temperature readings.

### 6.5 Error / Fault State Component (4 Required Cases)
When a device encounters a fault, its card border and background switch to `danger` / `dangerBg`, and an inline caution banner appears with a diagonal hazard stripe header, clear human-readable message, and two equal-width action buttons (`↻ RETRY` and `EDIT CONFIG`):

| Fault Key | Banner Title | Required Message Pattern |
| :--- | :--- | :--- |
| `broker_unreachable` | `BROKER UNREACHABLE` | `Broker unreachable — Failed to connect to <brokerUrl>` |
| `wrong_url` | `WRONG URL (404)` | `Wrong URL (404 / Invalid Endpoint) — Check Base URL / Topic: <endpoint>` |
| `device_offline` | `DEVICE OFFLINE` | `Device offline — Last will status: offline` (MQTT) / `No heartbeat from hardware endpoint` (HTTP) |
| `request_timeout` | `REQUEST TIMEOUT` | `Request timeout — Device did not respond within 3000ms` |

These four keys are one vocabulary, not two: they are exactly the `kind` values of `AppError` in `app/src/domain/error.ts` and the strings stored in the model's `errorType`. `wrong_url` covers both a malformed URL and an endpoint that answers `404` — from the user's side both mean "the address is wrong", and the banner shows the endpoint that failed. The full mapping lives in `docs/message-contract.md`.

### 6.6 Add / Edit Device Bottom Sheet
Triggered by the fixed bottom `+ ADD DEVICE` CTA or any card's `EDIT` button.
- **Header:** `PATCHBAY // ADAPTER CONFIG` subtitle, `ADD DEVICE` or `EDIT DEVICE` title, optional `[⊞] SCAN QR` button (Add mode only), and `✕` close button.
- **Form Fields:**
  1. `Device Name *` (Text input)
  2. `Room / Zone` (Chip selector)
  3. `Device Type` (3-column segmented selector: `LIGHT`, `SMART PLUG`, `SENSOR`)
  4. `Protocol Adapter` (2-column segmented selector: `MQTT`, `HTTP (REST)`)
  5. **Dynamic Connection Panel (`recessed` container):**
     - **If MQTT:** `Broker URL *` (`ws://` or `wss://`; React Native cannot open a raw `mqtt://` TCP socket without a native module) + `Device Topic Prefix *` (e.g. `home`) + live read-only preview of `SUB <prefix>/<deviceId>/state`, `PUB <prefix>/<deviceId>/set`, `LWT <prefix>/<deviceId>/status`.
     - **If HTTP:** `Base URL *` host-level (must start with `http://`, `https://`, e.g. `http://10.0.2.2:3000`) + live read-only preview of `GET <baseUrl>/devices/<deviceId>`, `POST <baseUrl>/devices/<deviceId>/set`. The device id is appended by the adapter, never typed by the user twice.
- **Inline Validation Banner:** Displays clear field validation errors at the top of the form without dismissing the sheet.
- **Footer Actions:**
  - Primary `SAVE DEVICE` / `SAVE CHANGES` button in `accent` (`#FF4D00`).
  - *(Edit Mode Only)* `DELETE DEVICE` button with 2-step inline confirmation (`CANCEL` | `CONFIRM DELETE?`).

---

## 7. Data & State Formatting Contract (UI Layer)

The UI must render these exact normalized state strings:
- **Light (On):** `On, 70%`
- **Light (Off):** `Off`
- **Smart Plug (On/Off):** `On` / `Off`
- **Sensor:** `26.5°C · 61% RH`
- **Offline / Error:** `<errorTitle>` (e.g., `DEVICE OFFLINE`, `BROKER UNREACHABLE`)

### Common model — implementation type

"`CommonDeviceModel`" is the concept; in code it is the TypeScript type `Device` in `app/src/domain/type.ts`. There is exactly one model — no separate UI copy, no adapter-specific type leaking upward.

```ts
type Room = 'LIVING' | 'STUDIO' | 'BEDROOM' | 'KITCHEN' | 'BALCONY';

type MqttConfig = { protocol: 'mqtt'; brokerUrl: string; topicPrefix: string };
type HttpConfig = { protocol: 'http'; baseUrl: string };
type DeviceConfig = MqttConfig | HttpConfig;

type DeviceStatus = 'online' | 'offline' | 'error';
type DeviceErrorType =
  | 'broker_unreachable'
  | 'wrong_url'
  | 'device_offline'
  | 'request_timeout';

type DeviceBase = {
  id: string;
  name: string;
  room?: Room;
  config: DeviceConfig;
  status: DeviceStatus;
  errorType: DeviceErrorType | null;
  errorMessage: string | null;
};

type LightDevice  = DeviceBase & { type: 'light';  state: { on: boolean; brightness: number } };
type PlugDevice   = DeviceBase & { type: 'plug';   state: { on: boolean } };
type SensorDevice = DeviceBase & { type: 'sensor'; state: { temperature: number; humidity: number } };

type Device = LightDevice | PlugDevice | SensorDevice;
```

One device, as the app holds it:

```json
{
  "id": "lamp-01",
  "name": "Studio Desk Lamp",
  "room": "STUDIO",
  "config": {
    "protocol": "mqtt",
    "brokerUrl": "ws://10.0.2.2:9001",
    "topicPrefix": "home"
  },
  "type": "light",
  "status": "online",
  "errorType": null,
  "errorMessage": null,
  "state": { "on": true, "brightness": 70 }
}
```

### Field ownership

| Field | Written by | Persisted? |
| :--- | :--- | :--- |
| `id`, `name`, `room`, `type`, `config` | Add / Edit sheet | **yes** — this is the only subset `redux-persist` stores |
| `state` | adapter: poll result, subscription message, or the device's confirmation after a `set` | no — fetched again on launch |
| `status`, `errorType`, `errorMessage` | `DeviceRepository`, from adapter events | no — recomputed on launch |

Rules that keep the model honest:
- **`state` is per type, not one flat object with optional keys.** `{ "on": true }` alone cannot be told apart between a light and a plug, and a light without `brightness` would silently pass. Render by narrowing on `type`; the readout formatter switches on the same field.
- **Protocol lives in `config.protocol`.** There is no second `protocol` field at the top level to drift out of sync.
- **`topicPrefix` is `home`, not `home/lamp-01`.** The full topic is `<topicPrefix>/<id>/state`; see §6.6 and `docs/message-contract.md`.
- **Status and errors are never persisted.** A stale `online` badge after a restart would be a lie; the card starts at `offline` until the adapter reports otherwise.
- **A malformed number is not a state.** Payloads go through `parseState` in `src/domain/parse.ts`; a bad payload produces `errorType`, never a half-filled state object.

---

## 8. AI Agent Implementation Checklist

Before marking any UI screen complete, verify:
- [ ] Zero direct MQTT or HTTP imports exist inside UI component files.
- [ ] Both `Daylight Ceramic` and `Night-Shift` palettes are wired via semantic theme tokens (both exist as tokens from phase 1; the theme toggle itself is phase 2).
- [ ] All numerical readouts use monospace typography with `tabular-nums`.
- [ ] All 3 device types (`Light`, `Smart Plug`, `Sensor`) render their distinct tactile controls.
- [ ] `EDIT` and 2-step `DELETE` are accessible from every device card.
- [ ] All 4 error states render the caution banner cleanly with working `RETRY` and `EDIT CONFIG` actions and zero crashes.
- [ ] Adding/editing a device persists across app restarts and immediately subscribes (MQTT) or starts polling (HTTP).
- [ ] No persisted `status` / `errorType`: after a cold start every card is `offline` until its adapter reports in.
- [ ] Phase 1 only: room filter, `ALL OFF`, Night-Shift theme, QR scan and sparkline are built **after** all 9 brief must-haves are green.
- [ ] Fonts may use the platform fallbacks in §3 (`System` / `Menlo` / `monospace`); bundling Space Grotesk + JetBrains Mono as TTF is phase 2.