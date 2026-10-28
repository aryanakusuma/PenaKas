# 💰 PenaKas - Money Tracker Kas Organisasi (PWA & Google Sheets)

Aplikasi pencatat keuangan kas organisasi yang modern, responsif (laptop & HP), dan mudah digunakan tanpa ribet. Dilengkapi dengan database **Google Sheets**, sistem audit log untuk developer/super admin, serta ekspor laporan LPJ.

---

## ✨ Fitur Utama

1. **Dashboard Saldo Real-Time**
   * Saldo akhir otomatis terhitung: `Saldo Awal + Total Masuk - Total Keluar`.
   * Input dan edit Saldo Awal Organisasi kapan saja.
   * Ringkasan Total Pemasukan & Pengeluaran dengan filter per bulan.

2. **Pencatatan Cepat & UX Simpel (Anti Ribet)**
   * Tombol besar satu klik: **"+ Uang Masuk"** dan **"- Uang Keluar"**.
   * Format otomatis titik ribuan Rupiah saat mengetik (contoh: `50.000`), meminimalisir salah input digit.
   * *Preset Chips* kategori cepat (Iuran Kas, Danus, Konsumsi Rapat, Perlengkapan, dll).

3. **2 Akses Admin (Bendahara & Developer)**
   * **Mode Bendahara:** Tampilan bersih & sederhana, fokus input harian, edit transaksi, dan download laporan.
   * **Mode Admin/Developer:** Dilengkapi panel **Audit Log** (riwayat siapa yang menambah/mengedit/menghapus transaksi berserta waktu kejadian) dan pemantau status koneksi.

4. **Database Google Sheets & Mode Offline**
   * Data tersimpan aman di Google Sheets milikmu.
   * Jika internet lambat atau belum terhubung, aplikasi tetap bisa dipakai dalam mode offline/lokal.

5. **Ekspor & Cetak LPJ**
   * Unduh file `.csv` yang langsung bisa dibuka di Microsoft Excel atau Google Sheets.
   * Fitur Cetak / Simpan PDF dengan format LPJ rapi dan kolom tanda tangan Ketua & Bendahara.

6. **PWA (Progressive Web App)**
   * Bisa di-install langsung ke layar utama (*Add to Home Screen*) di smartphone Android, iPhone, dan laptop PC.

---

## 🚀 Cara Menjalankan Aplikasi di Laptop

Buka terminal di folder project ini:
```bash
cd C:\Users\userh\.gemini\antigravity\scratch\money-tracker-org
npm run dev
```

Aplikasi akan berjalan di:
* **Laptop:** Buka `http://localhost:5173`
* **HP (Satu Jaringan Wi-Fi):** Buka alamat IP Network yang muncul di terminal (misal: `http://192.168.1.xxx:5173`)

---

## 📊 Cara Menghubungkan Google Sheets (Hanya 3 Menit)

1. Buka spreadsheet baru di [sheets.new](https://sheets.new).
2. Di menu atas, pilih **Ekstensi** > **Apps Script**.
3. Buka file `google-apps-script/Code.gs` di folder project ini (atau klik tombol *Salin Script* di dalam aplikasi).
4. Tempelkan seluruh kodenya ke editor Apps Script, lalu klik ikon **Simpan** (Ctrl+S).
5. Klik **Terapkan (Deploy)** > **Penerapan Baru (New Deployment)**:
   * Pilih jenis: **Aplikasi Web (Web App)**.
   * Jalankan sebagai: **Saya (Me)**.
   * Yang memiliki akses: **Siapa saja (Anyone)** *(Penting agar aplikasi HP/Laptop bisa kirim data)*.
6. Klik **Terapkan** dan setujui izin Google.
7. Salin **URL Aplikasi Web** yang muncul (berakhiran `/exec`), lalu tempelkan ke aplikasi KasKita pada tombol ikon spreadsheet di menu atas. Selesai!
