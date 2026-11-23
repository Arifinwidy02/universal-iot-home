# Skenario Video Demo (3–5 menit)

Brief mewajibkan 4 hal. Skenario di bawah mencakup semuanya dengan target **±4 menit**. Latih 1–2 kali dulu supaya tidak ada waktu terbuang.

## Persiapan sebelum merekam
- [ ] Jalankan dari **fresh clone** agar yang direkam sama dengan yang akan dilihat reviewer
- [ ] Mosquitto dan HTTP mock simulator sudah hidup; 3 device dummy tersedia
- [ ] App kosong (data dihapus) supaya "add device" terlihat dari nol
- [ ] Rekam di **Android emulator** (platform utama); sebutkan itu di pembuka video
- [ ] Dua jendela siap: emulator dan terminal simulator (font terminal diperbesar)
- [ ] Notifikasi dimatikan, layar bersih
- [ ] Siapkan catatan perintah simulator (mis. `node sim.js set plug-1 on`) agar tidak mengetik dari nol
- [ ] Rekam dengan suara atau caption; resolusi cukup agar teks terbaca

## Alur

| Waktu | Adegan | Yang diucapkan (poin) |
|---|---|---|
| 0:00–0:20 | Pembuka: tampilkan app kosong dan terminal simulator | Apa yang dibangun; stack singkat (React Native, Redux, Jest, Android) |
| 0:20–0:50 | Tunjukkan slide arsitektur sebentar | UI hanya bicara ke model umum; adapter yang tahu MQTT/HTTP |
| 0:50–1:40 | **Add** lampu via **MQTT** (form: nama, tipe, protokol, broker URL + topic), lalu plug via **HTTP** (base URL) | Form berubah mengikuti protokol; list menampilkan nama, tipe, status, state |
| 1:40–2:20 | **Kontrol**: toggle lampu, geser brightness; toggle plug | Command lewat adapter yang berbeda, tapi UI-nya sama |
| 2:20–3:10 | **Live state**: di terminal ubah state plug/lampu dari simulator; sensor berubah sendiri | MQTT = subscription (instan), HTTP = polling (beberapa detik) |
| 3:10–3:50 | **Error**: matikan Mosquitto (`docker compose stop`) → pesan broker unreachable; opsional salah URL / simulator mati | App tidak crash dan tidak hang; pulihkan broker, status kembali online |
| 3:50–4:20 | **Persistence**: tutup paksa dan buka ulang app, device tetap ada | Hanya konfigurasi yang disimpan, state live diambil ulang |
| 4:20–4:40 | Penutup singkat: edit/delete sekilas, struktur kode, test dijalankan (`npm test`) | Apa yang selesai, apa yang berikutnya |

## Tips
- Jangan menjelaskan kode baris demi baris; fokus pada apa yang terlihat dan keputusan desainnya.
- Jika ada bagian yang belum selesai, katakan terus terang di video, lalu tulis juga di README.
- Upload sebagai YouTube **unlisted**, Loom, atau Google Drive "anyone with the link", lalu **buka linknya di jendela incognito** untuk memastikan bisa diakses.
