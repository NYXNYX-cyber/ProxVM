# 🚀 NyxHosting Developer Walkthrough

Dokumen ini menjelaskan cara kerja sistem inti NyxHosting dan bagaimana cara memodifikasinya.

## 1. Sistem Billing & Saldo Awal
Saldo awal diberikan secara otomatis saat user baru mendaftar (Register).

*   **Lokasi File:** `backend/prisma/schema.prisma`
*   **Cara Modifikasi:** Cari bagian `model User` dan ubah nilai `@default(5.00)` pada field `credits`.
*   **Update Database:** Setelah mengubah schema, jalankan:
    ```bash
    cd backend
    npx prisma db push
    ```

## 2. Sinkronisasi Spesifikasi VPS (Plan vs Deployment)
Sistem sekarang sudah dinamis. Apa yang dipilih di Frontend (UI) akan diteruskan ke Backend dan diterapkan ke LXC Proxmox.

### Sisi Frontend (Daftar Harga/Plan)
*   **Lokasi File:** `frontend/src/app/dashboard/page.tsx`
*   **Cara Modifikasi:** Cari array objek di dalam modal "Deploy Instance". Anda bisa mengubah harga, RAM, CPU, dan Disk di sana.
    ```javascript
    { planName: 'Medium VPS', price: 2.00, ram: '2GB', cpu: '1 Core', disk: '20GB' }
    ```

### Sisi Backend (Proses Pembuatan)
*   **Lokasi File:** `backend/src/controllers/vps.controller.ts`
*   **Logika:** Fungsi `createInstance` akan mengambil data dari frontend, melakukan parsing string ke angka (misal: "4GB" jadi 4096MB), lalu mengirimkannya ke `proxmoxService.createLXC`.

## 3. Sistem Terminal (Console)
NyxHosting menggunakan metode **SSH Jumper** untuk terminal yang 100% stabil.

*   **Lokasi File:** `backend/src/index.ts`
*   **Alur:** 
    1. User klik tombol Console.
    2. Frontend buka koneksi WebSocket ke `/console`.
    3. Backend melakukan SSH ke Node Proxmox.
    4. Backend menjalankan perintah `pct enter [vmid]` (Perintah internal Proxmox untuk masuk ke terminal LXC).
    5. Input/Output diteruskan ke browser menggunakan `xterm.js`.

## 4. Konfigurasi Proxmox
Semua rahasia dan alamat server disimpan di file `.env`.
*   **Lokasi File:** `backend/.env`
*   **Variabel Penting:**
    *   `PROXMOX_URL`: Alamat API (IP:8006).
    *   `PROXMOX_TOKEN_ID` & `SECRET`: Untuk Start/Stop/Status.
    *   `PROXMOX_PASSWORD`: Untuk jalur SSH Terminal.

---
*Dokumen ini dibuat pada 20 Maret 2026 sebagai panduan transisi fitur v1.5-Alpha.*
