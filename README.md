# Universal IoT Home

Satu aplikasi mobile untuk mengendalikan perangkat smart home apa pun protokolnya. UI hanya bicara dengan satu model perangkat; adapter protokol (MQTT, HTTP) yang menerjemahkan ke dan dari masing-masing protokol.

Perangkat yang dikendalikan adalah simulator di dalam repo ini — tidak ada hardware sungguhan, tidak ada akun, tidak ada backend milik sendiri.

**Video demo:** `https://drive.google.com/file/d/1PdqnvYrAKszHiS_ZIpiG8xpeIHyZAA_W/view?usp=sharing`
**Slide arsitektur:** [PDF](docs/architecture.pdf) · [PNG](docs/architecture.png) · **Milestone:** [docs/MILESTONES.md](docs/MILESTONES.md)

Status pengerjaan ada di bagian [Status](#status) — satu-satunya tempat yang menyatakan apa yang sudah jadi dan apa yang belum.

## Stack

- **React Native CLI 0.88.1** (bare, tanpa Expo) + TypeScript 6.0 — jalur build native, dan klien MQTT bisa jalan lewat WebSocket di runtime RN biasa.
- **Redux Toolkit** untuk state, **redux-persist** + AsyncStorage untuk menyimpan konfigurasi perangkat.
- **Jest 29** untuk tes; domain dan adapter adalah TypeScript biasa, jadi tes tidak butuh emulator.
- **Express + TypeScript** untuk simulator HTTP, **Mosquitto** (Docker) sebagai broker, `mqtt.js` di kedua sisi.
- **Platform yang diuji: emulator Android.** iOS belum di-build dan tidak diklaim.

## Arsitektur

Dependensi satu arah: **UI → State → Domain → Adapters**. Storage berdiri di samping State.

```
tht-ruparupa/
├─ app/                 aplikasi React Native
│  └─ src/
│     ├─ ui/            layar, komponen, token tema — nol import MQTT/HTTP
│     ├─ state/         devicesSlice + useDeviceRuntime (pemilik adapter)
│     ├─ domain/        model/ · rules/ · connection/ — lihat bawah
│     ├─ adapters/      satu-satunya kode yang tahu topik, JSON, fetch, mqtt.js
│     └─ storage/       transform redux-persist (hanya konfigurasi)
├─ simulator/           Mosquitto + mock HTTP + publisher MQTT + CLI
└─ docs/                slide arsitektur, message contract, design system, rencana milestone
```

**UI** mengikuti [docs/relay_os_design_system.md](docs/relay_os_design_system.md): token warna semantik, readout telemetri monospace, kontrol fisik (rocker I/O, rail dimmer). Tidak ada layar atau komponen yang meng-import `mqtt` atau memanggil `fetch`.

**State** adalah satu `devicesSlice` dengan reducer biasa: `deviceAdded`, `deviceUpdated`, `deviceRemoved`, `stateReceived`, `statusReceived`, `errorReceived`. `useDeviceRuntime` memegang satu `DeviceRepository` dan menyambungkan event adapter ke action tersebut.

**Domain** dipecah tiga menurut perannya: `domain/model/` berisi tipe perangkat, state awal, pembuat device, dan `AppError`; `domain/rules/` berisi `command`, `validate` (`checkCommand`), dan `parse`; `domain/connection/` berisi interface `DeviceAdapter`, `AdapterRegistry`, dan `DeviceRepository`. Tidak ada library protokol di layer ini.

**Adapters** adalah satu-satunya layer yang tahu soal topik, bentuk JSON, `fetch`, atau `mqtt.js`.

Menambah protokol ketiga = satu class adapter + satu baris `registry.register()` di `useDeviceRuntime`. Tidak ada layar yang berubah.

## Fitur

- **Daftar perangkat** — nama, tipe, status online/offline, dan state saat ini (`On, 70%`, `Off`, `26.5°C · 61% RH`), plus badge protokol (`MQTT • SUB` / `HTTP • POLL 3s`).
- **Tambah, edit, hapus** — form menyesuaikan diri dengan protokol yang dipilih; field koneksi yang muncul hanya yang dibutuhkan protokol itu.
- **Tiga tipe perangkat** — light (on/off + brightness 0–100 lewat rail yang di-drag), plug (rocker I/O mekanis), sensor (suhu + kelembapan, read-only).
- **Live state** — MQTT lewat subscription, HTTP lewat polling 3 detik. Tanpa tombol refresh.
- **Filter ruangan** — chip `ALL` dan lima ruangan dengan jumlah perangkat masing-masing; perangkat tanpa ruangan hanya muncul di `ALL`. Pilihan filter tidak disimpan, jadi app selalu mulai dari `ALL`.
- **Persistence** — konfigurasi perangkat bertahan setelah app ditutup.
- **Error state bertipe** — `broker_unreachable`, `wrong_url`, `device_offline`, `request_timeout`, masing-masing dengan banner yang menyebut endpoint yang gagal.

## Menjalankan dari clone baru

Prasyarat (versi yang benar-benar dipakai):

| Alat        | Versi                                         |
| ----------- | --------------------------------------------- |
| Node.js     | 24.14.1                                       |
| JDK         | 17 (Zulu 17.0.18)                             |
| Android SDK | compileSdk 37 · buildTools 37.0.0 · minSdk 24 |
| Emulator    | AVD Pixel_10 (android-37.0, playstore, arm64) |
| Docker      | Docker 29 + Compose v5                        |

Node.js `>= 22.11` juga jalan (lihat `engines` di `app/package.json`). Docker hanya dipakai untuk broker Mosquitto.

`app/package-lock.json` ikut di-commit, jadi `npm ci` berhasil dan memasang persis apa yang diuji. Simulator memakai `yarn.lock` dan tidak punya `package-lock.json`, jadi pakai `yarn` di sana.

### 1. Nyalakan simulator

```bash
cd simulator
docker compose up -d          # Mosquitto: 1883 (MQTT TCP), 9001 (MQTT over WebSocket)
yarn install                  # yarn.lock adalah lock file yang di-commit di sini
npm start                     # Express mock di :3000 + publisher MQTT
```

`npm start` menyiapkan tiga perangkat. Ketiganya bisa diakses lewat kedua transport, itulah sebabnya satu perangkat yang sama bisa ditambahkan dua kali — sekali lewat MQTT, sekali lewat HTTP.

| id         | tipe   | nama             | state                               |
| ---------- | ------ | ---------------- | ----------------------------------- |
| `light-1`  | light  | Studio Desk Lamp | `{on: false, brightness: 70}`       |
| `plug-1`   | plug   | Living Room Plug | `{on: true}`                        |
| `sensor-1` | sensor | Kitchen Sensor   | `{temperature: 26.5, humidity: 61}` |

`sensor-1` diperbarui tiap 3 detik.

Ubah state perangkat dari luar app untuk melihat pembaruan live:

```bash
npm run cli -- list
npm run cli -- set plug-1 off
npm run cli -- set light-1 brightness=35
npm run cli -- get light-1
```

Endpoint yang sama juga ada di koleksi Bruno pada `simulator/bruno/` kalau lebih suka mengklik.

### 2. Jalankan app

```bash
# emulator harus jalan lebih dulu
~/Library/Android/sdk/emulator/emulator -avd Pixel_10 &

cd app
npm ci
npm start                     # Metro, biarkan terminal ini terbuka -> jalankan jika memang metro secara otomatis ga terbuka pas jalanin npm run android
npm run android               # terminal terpisah
```

Lalu tekan **+ ADD DEVICE** dan tambahkan satu perangkat per protokol:

| Protokol | Field        | Emulator Android       | Simulator iOS ¹         |
| -------- | ------------ | ---------------------- | ----------------------- |
| MQTT     | Broker URL   | `ws://10.0.2.2:9001`   | `ws://localhost:9001`   |
| MQTT     | Topic prefix | `home`                 | `home`                  |
| HTTP     | Base URL     | `http://10.0.2.2:3000` | `http://localhost:3000` |

¹ hanya dicantumkan untuk kelengkapan; iOS belum di-build atau dijalankan. Di ponsel fisik, pakai IP LAN komputermu, bukan `10.0.2.2`.

Id perangkat diturunkan dari nama perangkat (`Living Room Plug` → `living-room-plug`), jadi nama yang diketik harus cocok dengan perangkat yang dikenal simulator. Beri nama `Light 1` kalau ingin memakai `light-1` yang sudah disiapkan.

### 3. Jalankan tes

```bash
cd app
npm test                      # 52 tes di 12 suite, ~0,3 detik
npm run typecheck             # tsc --noEmit
npm run lint                  # 0 error, 8 warning
```

Suite mencakup aturan domain (validasi, parsing, payload perintah, registry), kedua adapter dengan transport yang di-mock, transformasi persistence, reducer perangkat, dan formatter readout. Tidak ada yang menyentuh broker, socket, atau emulator sungguhan.

Polling diuji dengan fake timer Jest (`app/__tests__/adapters/HttpAdapter.polling.test.ts`) — begitulah interval 3 detik dan sifat "tidak ada timer tersisa setelah disconnect" diuji tanpa perlu menunggu.

## API

Referensi lengkap dengan contoh request/response: [docs/message-contract.md](docs/message-contract.md).

### MQTT

Broker: `ws://<host>:9001` (listener WebSocket Mosquitto — React Native tidak punya socket TCP mentah). Prefix topik dapat diatur per perangkat, default `home`; adapter menyusun `<prefix>/<deviceId>/<channel>`.

| Topik                  | Arah         | Payload                           | QoS / retain    |
| ---------------------- | ------------ | --------------------------------- | --------------- |
| `<prefix>/<id>/state`  | device → app | objek state                       | QoS 0, retained |
| `<prefix>/<id>/set`    | app → device | objek state parsial               | QoS 1, tidak    |
| `<prefix>/<id>/status` | device → app | `"online"` / `"offline"` (string) | QoS 1, retained |

`status` dipublikasikan `online` saat connect; simulator mendaftarkan **Last Will** `offline` pada topik yang sama, sehingga broker yang mengumumkannya kalau simulator mati. Karena retained, app langsung menerima nilai terakhir begitu subscribe.

### HTTP (REST)

Base URL: `http://<host>:3000`. App menyimpan URL tingkat host ini; adapter menambahkan `/devices/<deviceId>`, jadi satu base URL melayani semua perangkat HTTP dan id tidak perlu diketik dua kali.

| Method | Path                       | Arah         | Catatan                                        |
| ------ | -------------------------- | ------------ | ---------------------------------------------- |
| GET    | `/devices`                 | → simulator  | Daftar semua perangkat (dipakai CLI/Bruno)     |
| GET    | `/devices/:id`             | device → app | State saat ini                                 |
| POST   | `/devices/:id/set`         | app → device | Body: objek state parsial; balasan: state baru |
| POST   | `/admin/devices/:id/state` | simulator    | Mengubah state dari luar, tidak dipakai app    |

`404` untuk id atau path yang tidak dikenal. `200` yang body-nya bukan JSON, atau JSON yang tidak sesuai bentuk state tipe perangkat itu, juga dipetakan ke `wrong_url` — alamatnya menjawab, tapi tidak dengan sesuatu yang bisa dikirim perangkat tipe tersebut.

### Bentuk state

| Tipe   | State                                   | Set (app → device)                     |
| ------ | --------------------------------------- | -------------------------------------- |
| Light  | `{"on": true, "brightness": 70}`        | `{"on": false}` / `{"brightness": 40}` |
| Plug   | `{"on": true}`                          | `{"on": false}`                        |
| Sensor | `{"temperature": 26.5, "humidity": 61}` | tidak didukung (read only)             |

Aturan validasi: `on` boolean; `brightness` bilangan bulat 0–100; `temperature` angka °C; `humidity` angka 0–100. Perintah ke sensor ditolak sebelum mencapai transport.

### Pemetaan error

Adapter menerjemahkan kegagalan library dan HTTP menjadi satu nilai bertipe `AppError` dengan field `kind`. Empat `kind` ini satu-satunya kosakata error di app — string yang sama disimpan di `errorType` dan ditampilkan banner.

| Situasi                                                      | `kind`               |
| ------------------------------------------------------------ | -------------------- |
| Broker MQTT tidak terjangkau / connection timeout            | `broker_unreachable` |
| URL broker atau base URL cacat, atau endpoint menjawab `404` | `wrong_url`          |
| `status` MQTT = `offline`, atau satu polling HTTP gagal      | `device_offline`     |
| Request HTTP melewati timeout                                | `request_timeout`    |

Satu kegagalan polling cukup untuk menandai perangkat offline: perangkat smart home yang melewatkan satu polling sudah layak diketahui pengguna. Polling berikutnya yang berhasil mengembalikannya online, menghapus banner, dan mengirim state baru. Polling yang tumpang tindih dilewati, dan interval dibersihkan saat `disconnect()`.

## Trade-off dan asumsi

- **Hanya konfigurasi yang di-persist, state live tidak pernah.** `status`, `errorType`, `errorMessage`, dan `state` dibuang saat menyimpan dan dibangun ulang saat memuat, jadi setiap kartu mulai dari `offline` sampai adapter-nya melapor. Menampilkan `ONLINE` lama sebelum ada percobaan koneksi jatuhnya nanti jadi kebohongan jadi ga diterpin.
- **Tidak ada optimistic update.** Perintah dikonfirmasi oleh pesan state berikutnya dari perangkat itu sendiri. Menekan plug saat broker mati membiarkan kartu apa adanya dan menampilkan banner — lebih lambat, tapi UI tidak pernah menampilkan state yang tidak dilaporkan perangkat.
- **Polling untuk HTTP, 3 detik.** REST tidak bisa push. 3 detik adalah kompromi antara kesegaran data dan beban server; di deployment sungguhan saya akan memakai SSE atau WebSocket dan menyimpan polling sebagai cadangan.
- **Id perangkat diturunkan dari nama dan tidak bisa diubah.** Mengganti nama akan diam-diam mengarahkan perangkat ke topik MQTT lain. Karena itu sheet edit tidak bisa mengganti id, dan reducer mengabaikan `id` di dalam patch.
- **Satu proses memegang semua adapter.** `useDeviceRuntime` menyalakan satu adapter per perangkat dan menghentikannya saat konfigurasi berubah atau perangkat dihapus. App sungguhan kemungkinan memindahkan ini ke background service supaya daftar tetap ter-update saat app di-background — sekarang polling berhenti bersama React tree.
- **Tanpa auth, tanpa TLS, tanpa ACL di broker maupun mock.** Di luar cakupan brief; broker produksi butuh kredensial, ACL per perangkat, dan `wss://`. Build debug mengizinkan HTTP cleartext ke `10.0.2.2`, yang bukan konfigurasi produksi.

## Keterbatasan

- **Android emulator saja.** Tidak ada perangkat fisik, tidak ada iOS. Kodenya netral platform dan tidak punya cabang khusus platform, tapi belum pernah di-build untuk iOS.
- **`checkCommand` punya unit test tapi tidak ada di jalur perintah.** `app/src/domain/rules/validate.ts` punya validator lengkap (menolak sensor, menolak brightness di luar 0–100) beserta tesnya, tetapi `DeviceCard` dan `DeviceRepository` tidak memanggilnya — UI mencegah perintah ke sensor dengan tidak me-render kontrolnya, dan dimmer membatasi brightness sendiri. Repository seharusnya memanggilnya sebelum `adapter.send()`; sekarang ini penjaga yang ada tapi tidak menjaga.
- **`request_timeout` belum pernah terpicu di perangkat.** Alarmnya ada dan teruji, tapi mock Express selalu menjawab cepat. Cara memicunya:

  ```bash
  node -e "require('http').createServer(() => {}).listen(3999)"
  # lalu tambahkan perangkat HTTP dengan base URL http://10.0.2.2:3999
  ```

### Belum dikerjakan (nice-to-have dari brief)

- [ ] **`ALL OFF`** — sudah dirancang di design system (§6.1), belum diimplementasikan.
- [ ] **Tema Night-Shift** — palet lengkap ada di `app/src/ui/theme/tokens.ts`, tapi belum ada toggle. Mengganti tema saat runtime berarti setiap `StyleSheet.create` harus jadi fungsi dari palet, dan risiko regresinya tidak sepadan untuk submission ini.
- [ ] **Sparkline sensor** dan **`SCAN QR`** — belum; QR butuh modul kamera native dan rebuild.
- [ ] **Hazard stripe pada banner error** masih strip datar, bukan pola garis 45° dari §6.5. Warna, judul, pesan, dan kedua tombolnya sudah sesuai.

## Status

- [v] Model perangkat, command, error bertipe, dan validasi domain
- [v] Simulator: Mosquitto, mock HTTP, publisher MQTT, CLI, koleksi Bruno
- [v] `HttpAdapter` dengan polling, timeout, dan pembersihan timer
- [v] `MqttAdapter` dengan subscription, reconnect backoff, dan status timeout
- [v] Form tambah/edit/hapus perangkat per protokol
- [v] Persistence konfigurasi perangkat
- [v] Empat jenis error state dengan banner yang menyebut endpoint
- [v] Slide arsitektur (PDF/PNG) di `docs/`
- [v] Video demo

## Nice-to-Have

- [v] Filter ruangan di daftar perangkat
- [v] CI Testing

## Cara saya memakai alat AI

Brief mengizinkan AI coding assistant selama dijelaskan di sini. Ini yang saya terapkan:

- **Desain dulu, kode kemudian.** Pembagian layer (UI → State → Domain → Adapters), interface `DeviceAdapter`, dan kosakata empat error dirancang sebelum ada file apa pun, lalu ditulis ke `docs/relay_os_design_system.md` dan `docs/message-contract.md` sebagai sumber kebenaran untuk memeriksa kode maupun README ini.
- **Seluruh kode UI ditulis sendiri** — token tema, kartu perangkat, rocker plug, rail dimmer, banner error, dan sheet add/edit.
- **Dokumentasi dikerjakan dengan bantuan AI.** `docs/MILESTONES.md` (rencana per milestone dan alokasi jam), perapian README (urutan bagian, pohon folder, penyelarasan istilah dengan kode), dan slide arsitektur ( diekspor ke `docs/architecture.pdf` dan `docs/architecture.png``docs/relay_os_design_system.md` dan `docs/message-contract.md` ) disusun bersama AI. Keputusan isinya tetap milik saya: apa yang dipotong, trade-off yang diakui, dan setiap klaim status — semuanya saya cocokkan dengan kode dan hasil `npm test` sebelum diterima.
- **AI dipakai untuk perbaikan bug dan penyesuaian styling di kontrol brightness**, serta menyusun simulator dan sebagian berkas tes. Hasilnya saya tinjau dan jalankan sendiri sebelum diterima.
- **Tes diperiksa terhadap perilaku sungguhan.** Tes reducer "perubahan tipe mereset bentuk state" ada karena bug itu benar-benar membuat app crash, bukan karena template tes memintanya.
- **Debugging dikerjakan dengan menjalankan app-nya.** Beberapa dugaan awal salah dan hanya ketahuan setelah app dijalankan: kartu perangkat yang dikira gagal tersimpan ternyata hanya berada di luar layar dan perlu di-scroll, dan nama perangkat yang tidak terisi membuat penyimpanan ditolak validasi tanpa pesan yang jelas.
- **Yang paling jelas keputusan saya:** menentukan apa yang dipotong demi tenggat (tanpa toggle Night-Shift, tanpa QR, tanpa `ALL OFF`), dan menguji setiap error state dengan benar-benar mematikan broker alih-alih percaya bahwa jalur kodenya terlihat benar.
