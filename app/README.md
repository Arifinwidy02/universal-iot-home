# app — Universal IoT Home (React Native)

Kode aplikasinya. Cara menjalankan, arsitektur, dan daftar API ada di **[README.md](../README.md)** di root repo — dokumen itu yang menjelaskan cara start dari clone baru.

Ringkas untuk folder ini saja:

```bash
npm ci
npm start          # Metro
npm run android    # terminal terpisah, emulator harus jalan
npm test           # 52 tes, 12 suite
npm run typecheck
npm run lint
```

Struktur `src/`:

| Folder | Isi |
|---|---|
| `ui/` | layar, komponen, token tema. Nol import MQTT atau HTTP |
| `state/` | `devicesSlice` + `useDeviceRuntime` (pemilik adapter) |
| `domain/` | `model/` tipe dan error · `rules/` command, validate, parse · `connection/` kontrak adapter, registry, repository |
| `adapters/` | `HttpAdapter`, `MqttAdapter` — satu-satunya kode yang tahu protokol |
| `storage/` | transform redux-persist: hanya konfigurasi yang disimpan |
