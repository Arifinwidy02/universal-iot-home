# Rencana Milestone — Universal IoT Home

Dokumen kerja pribadi (bahasa Indonesia). Boleh dihapus dari repo sebelum submit, atau dibiarkan sebagai bukti perencanaan.

**Batas waktu:** 7 hari kalender sejak brief diterima, **pukul 23:59 WIB**. Isi tanggalnya di sini: `____`
**Budget kerja:** 15–20 jam. Rencana di bawah = ±18 jam, sisanya buffer.
**Prinsip:** satu irisan vertikal yang jalan end-to-end (HTTP dulu), baru MQTT. Fitur nice-to-have hanya setelah semua must-have selesai.

## Ringkasan

| # | Milestone | Jam | Selesai bila | Target hari |
|---|---|---|---|---|
| M0 | Setup repo & kerangka | 1 | App kosong jalan di emulator, struktur folder siap, commit awal | 1 |
| M1 | Domain & test model | 2 | Model, command, error type, validasi + test Jest hijau | 1 |
| M2 | Simulator | 2 | Mosquitto (Docker) + HTTP mock jalan, state bisa diubah dari luar | 2 |
| M3 | HttpAdapter + irisan vertikal | 3 | 1 device HTTP tampil di list, bisa di-toggle, update live (polling) | 3 |
| M4 | MqttAdapter | 3 | Device MQTT: subscribe state/status, publish set, reconnect | 4 |
| M5 | Add/Edit/Delete + persistence | 3 | Form tiap protokol, device bertahan setelah restart app | 5 |
| M6 | Error states & hardening | 2 | 4 jenis error punya pesan jelas, app tidak crash/hang | 6 |
| M7 | Test lengkap | 1 | Test adapter (mock transport) + test model + reducer | 6 |
| M8 | Deliverable non-kode | 2 | README, slide, video, link ada di README | 7 |
| — | Buffer & cek submit | 1 | Checklist `SUBMISSION-CHECKLIST.md` semua tercentang | 7 |

## Platform dan lingkungan

- **Utama: Android emulator.** Semua demo, video, dan README dibuat dari sini.
- **iOS simulator: bonus.** Hanya klaim "iOS didukung" di README jika benar-benar dicoba. Kalau tidak diuji, tulis "iOS: belum diuji".
- **Tanpa Expo (bare RN).** Konsekuensinya: library native butuh `pod install` untuk iOS (Android otomatis ter-link), dan pengaturan cleartext HTTP dilakukan manual.
- **Alamat host berbeda per platform** (ini sumber bug klasik):

| Lingkungan | Alamat komputer host |
|---|---|
| Android emulator | `10.0.2.2` |
| iOS simulator | `localhost` |
| Perangkat fisik | IP LAN komputer (atau `adb reverse` untuk Android) |

- **HTTP non-HTTPS:** template RN biasanya sudah mengizinkan cleartext pada build debug Android (`usesCleartextTraffic`) dan akses jaringan lokal di iOS (ATS). Verifikasi di proyekmu; kalau request ditolak, cek dua pengaturan ini lebih dulu. Cukup untuk demo; tulis di README bahwa ini bukan konfigurasi produksi.
- **Test Jest:** logika domain dan adapter adalah TypeScript biasa, jadi test-nya tidak perlu menyalakan emulator.

## Detail per milestone

### M0 — Setup (1 jam)
- [ ] Buat repo publik di GitHub, `.gitignore`, lisensi opsional
- [ ] Init **bare React Native (RN CLI, tanpa Expo)** dengan TypeScript, mis. `npx @react-native-community/cli@latest init IoTHome` (cek perintah terbaru di dokumentasi RN); jalan di Android emulator (platform utama)
- [ ] iOS (opsional): `cd ios && pod install`, coba di simulator. Jangan habiskan waktu jika bermasalah; brief hanya butuh satu platform
- [ ] Pasang Redux Toolkit, redux-persist, AsyncStorage, Jest
- [ ] Buat struktur folder (lihat di bawah) dan kerangka README
- [ ] Commit: `chore: scaffold React Native app with TypeScript, RTK, Jest`

Struktur folder yang disarankan:
```
/app            # React Native
  src/
    ui/           # screens, components
    state/        # slices, thunks, selectors, store
    domain/       # device model, commands, errors, DeviceAdapter interface,
                  # DeviceRepository, AdapterRegistry
    adapters/     # mqtt/, http/
    storage/      # persistence config
/simulator      # Node: mosquitto config, http mock, CLI
/docs           # architecture.(pdf|png|drawio), message-contract.md, ...
README.md
```

### M1 — Domain (2 jam)
- [ ] `Device`, `DeviceType` (light/plug/sensor), state per tipe
- [ ] Validasi: brightness 0–100, sensor read-only (command ke sensor ditolak)
- [ ] `DeviceCommand` (`SetPower`, `SetBrightness`), tipe `AppError` (`BrokerUnreachable`, `InvalidUrl`, `DeviceOffline`, `RequestTimeout`)
- [ ] Interface `DeviceAdapter` + `AdapterRegistry`
- [ ] Test Jest untuk validasi dan parsing
- [ ] Commit: `feat(domain): device model, commands, typed errors` + `test(domain): ...`

### M2 — Simulator (2 jam)
- [ ] `docker-compose.yml` Mosquitto dengan listener 1883 dan **9001 (websockets)**; di Mosquitto 2.x tambahkan `allow_anonymous true` di `mosquitto.conf`, kalau tidak koneksi dari luar ditolak
- [ ] Node server: 1 lampu, 1 plug, 1 sensor; endpoint `GET /devices/:id`, `POST /devices/:id/set`
- [ ] Publisher MQTT: state, status (retained), Last Will
- [ ] Cara ubah state dari luar (CLI `node sim.js set plug-1 on` atau endpoint admin); sensor berubah otomatis tiap beberapa detik
- [ ] Topic prefix unik jika memakai broker publik
- [ ] Commit: `feat(simulator): ...`

### M3 — HttpAdapter + irisan vertikal (3 jam)
- [ ] `HttpAdapter` (fetch + `AbortController`, polling interval configurable)
- [ ] `DeviceRepository` minimal, slice `devices`, `DeviceListScreen` sederhana
- [ ] Toggle plug dari UI → simulator berubah; ubah dari simulator → UI berubah
- [ ] **Titik cek:** jika ini jalan, risiko terbesar sudah lewat
- [ ] Commit: `feat(adapter): HttpAdapter with polling` dst.

### M4 — MqttAdapter (3 jam)
- [ ] mqtt.js lewat **WebSocket**: `ws://10.0.2.2:9001` di Android emulator, `ws://localhost:9001` di iOS simulator; polyfill (mis. `buffer`, `process`) jika Metro mengeluh. Pastikan versi mqtt.js yang dipakai jalan di RN sebelum membangun adapter di atasnya
- [ ] Subscribe `state` dan `status`, publish `set`, timeout koneksi awal, reconnect dengan backoff
- [ ] `end()` saat device dihapus
- [ ] Commit: `feat(adapter): MqttAdapter with subscription and reconnect`

### M5 — CRUD + persistence (3 jam)
- [ ] Form Add digenerate dari skema konfigurasi per protokol (MQTT: broker URL + topic prefix; HTTP: base URL)
- [ ] Edit dan delete (cleanup adapter saat delete)
- [ ] redux-persist: whitelist **hanya konfigurasi** device
- [ ] Saat start: load device → buat adapter → subscribe
- [ ] Layar kontrol: lampu (toggle + slider), plug (toggle), sensor (read-only)

### M6 — Error states (2 jam)
- [ ] Broker mati, URL salah, device offline, request timeout → masing-masing pesan jelas di UI
- [ ] Uji manual: matikan Mosquitto saat app jalan; ketik URL ngawur; hentikan HTTP mock
- [ ] Pastikan tidak ada spinner abadi

### M7 — Test (1 jam)
- [ ] Minimal: model + satu adapter dengan transport di-mock (disarankan keduanya)
- [ ] Fake timer Jest untuk polling
- [ ] Perintah test tercantum di README

### M8 — Non-kode (2 jam)
- [ ] Finalisasi diagram (`docs/architecture.*`) agar cocok dengan nama di kode
- [ ] `docs/message-contract.md` disesuaikan jika kontrak berubah
- [ ] README final (template ada di `README.template.md`)
- [ ] Rekam video mengikuti `demo-script.md`, upload, tempel link di README
- [ ] Verifikasi dari **fresh clone** di folder lain

## Nice-to-have (hanya jika waktu lebih)
Urut dari paling murah: CI GitHub Actions (jalankan test) → dark mode → scene "All off" → grouping/room. Lewati sisanya, tulis di README sebagai "next steps".

## Gaya commit
Kecil dan sering, format `type(scope): pesan` (`feat`, `fix`, `test`, `docs`, `chore`, `refactor`). Target: minimal 20–30 commit selama 7 hari. Jangan satu commit besar di akhir.

## Jika waktu mepet
Brief menyatakan: tetap submit dan jelaskan di README apa yang belum selesai serta cara menyelesaikannya. Urutan prioritas pemotongan: nice-to-have → polish UI → test tambahan. **Jangan potong:** abstraksi adapter, dua protokol, error handling, persistence.
