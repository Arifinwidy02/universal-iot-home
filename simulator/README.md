# simulator — perangkat palsu

Mosquitto (Docker) + mock HTTP Express + publisher MQTT + CLI. Ini yang berdiri di tempat hardware sungguhan.

```bash
docker compose up -d     # Mosquitto: 1883 (MQTT), 9001 (WebSocket)
yarn install
npm start                # Express :3000 + publisher MQTT + sensor tiap 3 detik
```

Perangkat yang disiapkan: `light-1`, `plug-1`, `sensor-1`.

```bash
npm run cli -- list
npm run cli -- get light-1
npm run cli -- set plug-1 off
npm run cli -- set light-1 brightness=35
```

| Folder | Isi |
|---|---|
| `routes/` | definisi route Express |
| `controller/` | handler per route |
| `services/` | state perangkat di memori + tick sensor |
| `mqtt/` | gateway Mosquitto: publikasi `state`/`status`, Last Will, subscription `set` |
| `data/` | data awal perangkat |
| `bruno/` | koleksi Bruno untuk endpoint yang sama |

Topik, endpoint, dan bentuk payload: [../docs/message-contract.md](../docs/message-contract.md).
