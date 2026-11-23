# Checklist Submit

Centang semuanya sebelum mengirim email. Batas: **hari ke-7, 23:59 WIB**.

## Must-have (dari brief)
- [ ] 1. Device list: nama, tipe, online/offline, state saat ini (mis. "On, 70%", "26.5 °C")
- [ ] 2. Add device: nama, tipe, protokol, detail koneksi per protokol
- [ ] 3. Tiga tipe: Light (on/off + brightness 0–100), Plug (on/off), Sensor (suhu + kelembapan, read only)
- [ ] 4. Dua protokol (MQTT + HTTP) di balik satu abstraksi; protokol ketiga tidak mengubah layar apa pun
- [ ] 5. Live state: MQTT via subscription, HTTP via polling, tanpa refresh manual
- [ ] 6. Persistence: device tetap ada setelah restart app
- [ ] 7. Error states: broker tak terjangkau, URL salah, device offline, timeout, semuanya dengan pesan jelas; app tidak crash/hang
- [ ] 8. Unit test: model device + minimal satu adapter (mock transport)
- [ ] 9. Edit dan delete device

## Repo (GitHub, publik)
- [ ] Source app + `/simulator`
- [ ] Unit test + perintah menjalankannya di README
- [ ] Riwayat commit bertahap (bukan satu commit raksasa)
- [ ] README mencakup: cara run dari fresh clone, alasan stack + platform, apa yang selesai/belum/langkah berikutnya, trade-off dan asumsi, penggunaan AI
- [ ] Link video dan slide ada di README
- [ ] Tidak ada secret/kredensial yang ikut ter-commit
- [ ] Repo **publik** (cek dari incognito) dan tetap publik sampai proses rekrutmen selesai

## Slide arsitektur
- [ ] 1 slide PDF/PNG di `/docs` (sudah ada: `architecture.pdf/png/drawio`)
- [ ] Menunjukkan layer + arah dependensi, alur command, alur state update
- [ ] Nama di diagram cocok dengan nama di kode

## Video
- [ ] 3–5 menit
- [ ] Add 1 MQTT + 1 HTTP · kontrol lampu dan plug · ubah state dari simulator, app update live · minimal satu kasus error
- [ ] Link bisa dibuka tanpa login (cek di incognito)

## Verifikasi akhir
- [ ] `git clone` ke folder baru → ikuti README langkah demi langkah → app + simulator jalan
- [ ] `npm test` hijau dari clone yang bersih
- [ ] README menyebut platform yang benar-benar diuji (Android); iOS hanya diklaim jika sudah dicoba
- [ ] README menyebut alamat host per platform (`10.0.2.2` Android, `localhost` iOS)
- [ ] Kode ditulis sendiri; penggunaan AI dijelaskan jujur dan spesifik di README

## Email
- [ ] Balas email brief (bukan email baru), sertakan link repo
- [ ] Kirim sebelum 23:59 WIB, sisakan margin 1–2 jam
