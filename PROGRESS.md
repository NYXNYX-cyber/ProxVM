# 🌙 NyxHosting Project Progress Report

Dokumen ini mencatat status implementasi fitur, perbaikan bug, dan rencana pengembangan untuk platform manajemen VPS Proxmox **NyxHosting**.

## 📊 Status Ringkasan (v1.7-Beta - Current)

| Kategori | Status | Keterangan |
| :--- | :---: | :--- |
| **Backend & API** | 🟢 100% | Stabil (LXC, SSH Jumper, Automated FRP, Admin Logic). |
| **Frontend & UI** | 🟢 100% | Admin Panel, Mobile Responsive, Fullscreen Console. |
| **Database** | 🟢 100% | SQLite, Role-based (USER/ADMIN), Dynamic Credits. |
| **Provisioning** | 🟢 100% | Auto-Start, Auto-SSH Config, Automated Bridge. |

---

## ✅ Fitur Terbaru (Implemented in v1.7)

### 1. Panel Administrator (Admin Dashboard)
- [x] **Manajemen User:** Melihat daftar pengguna, saldo, dan jumlah VPS secara global.
- [x] **Billing Control:** Kemampuan Admin untuk mengubah saldo pengguna langsung dari UI.
- [x] **Global VPS Control:** Kontrol penuh (Start/Stop/Destroy/Console) atas VPS milik seluruh pengguna.
- [x] **Role Management:** Fitur untuk mempromosikan atau mendemosi user menjadi Admin via UI & Database.

### 2. Otomatisasi Jaringan & SSH (Automated Bridge)
- [x] **FRP Automation:** Backend otomatis mendaftarkan tunnel reverse proxy di host Proxmox (Format YAML v0.61.1).
- [x] **NAT Port Forwarding:** Otomatisasi aturan IPTables di Proxmox Host untuk port SSH unik (10000 + VMID).
- [x] **Internal SSH Config:** Otomatisasi `PermitRootLogin yes` dan pemaksaan password di dalam LXC via `pct exec`.
- [x] **Auto-Start:** Memastikan VPS otomatis menyala segera setelah dibuat (`start: 1`).

### 3. Peningkatan Konsol & UI
- [x] **Fullscreen Mode:** Terminal konsol kini mendukung mode layar penuh.
- [x] **Mobile Responsive:** Integrasi `@xterm/addon-fit` untuk kenyamanan terminal di layar HP.
- [x] **Session Persistence:** Login session diperpanjang menjadi **7 hari** (JWT & Cookies).
- [x] **SSH Access Info:** Menampilkan instruksi koneksi SSH publik dan password default di Dashboard.

---

## 🛠️ Perbaikan Bug Terakhir

| Masalah | Solusi |
| :--- | :--- |
| `API Connection Refused` | Migrasi ke URL API Dinamis (Auto-detect hostname/Cloudflare support). |
| `Destroy Auth Error (401)` | Memperbaiki penempatan Header Authorization pada axios post. |
| `Container Not Running` | Menambahkan logika force start sebelum eksekusi perintah konfigurasi. |
| `Permission Denied SSH` | Memperkuat perintah sed & chpasswd dengan strategi brute-force dan delay 20 detik. |
| `FRP Config Failure` | Migrasi dari format TOML ke YAML untuk kompatibilitas FRP versi 0.61.1. |
| `TS Compilation Error` | Explicit type casting pada parameter request di admin controller. |

---

## ⬜ Rencana Mendatang (To-Do List)

### Fitur Lanjutan
- [ ] **Snapshots & Backups**: Fitur cadangan data user sendiri.
- [ ] **Payment Top-Up**: Integrasi Midtrans asli untuk isi saldo.
- [ ] **Email Notifications**: Detail login otomatis via email.
- [ ] **Custom Templates:** Pilihan OS LXC yang lebih beragam di UI.

---

## 📝 Ringkasan Proyek
NyxHosting v1.7-Beta adalah pencapaian besar dalam hal otomatisasi infrastruktur. Sistem kini tidak hanya bisa membuat VPS, tapi juga secara otomatis membukakan jalur akses (tunnel) dari jaringan lokal ke IP Publik melalui FRP. Dengan adanya Panel Admin yang matang, platform ini sudah siap digunakan untuk skala operasional yang lebih luas.
