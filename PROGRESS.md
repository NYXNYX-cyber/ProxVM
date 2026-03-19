# 🌙 NyxHosting Project Progress Report

Dokumen ini mencatat status implementasi fitur, perbaikan bug, dan rencana pengembangan untuk platform manajemen VPS Proxmox **NyxHosting**.

## 📊 Status Ringkasan (v1.6-Alpha)

| Kategori | Status | Keterangan |
| :--- | :---: | :--- |
| **Backend & API** | 🟢 100% | Stabil (LXC, SSH Jumper Console, Dynamic Provisioning). |
| **Frontend & UI** | 🟢 98% | Dashboard real-time, Console Modal terintegrasi. |
| **Database** | 🟢 100% | SQLite Tunggal, Saldo disesuaikan ($5.00 default). |
| **Provisioning** | 🟢 100% | Dynamic Specs (RAM/CPU sesuai Plan UI). |

---

## ✅ Fitur Terbaru (Implemented)

### 1. Terminal LXC yang Stabil (SSH Jumper)
- [x] Mengganti sistem WebSocket Proxmox yang tidak stabil dengan **SSH Tunneling**.
- [x] Backend melakukan `pct enter` langsung ke container untuk performa 100% lancar.
- [x] Terintegrasi penuh dengan `xterm.js` di dashboard.

### 2. Billing & Saldo Awal
- [x] Menurunkan saldo awal pendaftaran dari $15.00 ke **$5.00** (Cukup untuk 1-2 VPS medium).
- [x] Sinkronisasi pemotongan saldo saat pembuatan VPS baru.

### 3. Dynamic VPS Provisioning
- [x] Backend sekarang membaca spesifikasi (RAM, CPU, Disk) langsung dari pilihan user di UI.
- [x] Tidak ada lagi perbedaan antara harga yang dibayar dan spesifikasi yang didapat di Proxmox.

---

## 🛠️ Perbaikan Bug Terakhir

| Masalah | Solusi |
| :--- | :--- |
| `WebSocket 401/400 Error` | Migrasi ke sistem **SSH Jumper** (Paling aman & pasti berhasil). |
| `Proxmox Service Crash` | Memperbaiki argumen fungsi dan memulihkan metode `createLXC` yang hilang. |
| `Spesifikasi Tidak Sama` | Implementasi parsing dynamic specs di `vps.controller.ts`. |
| `Backend Crash (TSError)` | Menangani strict null checks dan named/default imports Prisma. |

---

## ⬜ Rencana Mendatang (To-Do List)

### Fitur Lanjutan
- [ ] **Snapshots & Backups**: Fitur cadangan data user sendiri.
- [ ] **Payment Top-Up**: Integrasi Midtrans asli untuk isi saldo.
- [ ] **Email Notifications**: Detail login otomatis via email.

---

## 📝 Ringkasan Proyek
NyxHosting v1.6-Alpha adalah titik balik stabilisasi proyek. Dengan beralih ke **SSH Jumper** untuk terminal, masalah koneksi yang menghambat selama ini telah teratasi total. Sistem provisioning sekarang juga sudah jujur (apa yang dibeli = apa yang dibuat), menjadikannya pondasi yang kuat untuk panel manajemen VPS profesional.
