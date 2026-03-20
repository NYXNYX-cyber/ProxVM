# 🌐 Panduan Setup FRP (Fast Reverse Proxy) untuk ProxVM

Dokumen ini berisi langkah-langkah untuk menyiapkan jembatan SSH otomatis menggunakan FRP antara **VPS Publik** dan **Host Proxmox Lokal** Anda.

---

## 🏗️ Arsitektur Sistem
- **VPS Publik (129.226.192.200):** Berperan sebagai **FRP Server (frps)**. Ia akan menerima koneksi dari internet pada port 10000-11000 dan meneruskannya ke Proxmox.
- **Host Proxmox Lokal:** Berperan sebagai **FRP Client (frpc)**. Ia akan membuat terowongan (*tunnel*) dari rumah/kantor Anda ke VPS Publik.

---

## 1. Setup di VPS Publik (FRP Server)
Jalankan perintah ini di terminal **VPS Publik (129.226.192.200)**:

### A. Instalasi Binary
```bash
wget https://github.com/fatedier/frp/releases/download/v0.61.1/frp_0.61.1_linux_amd64.tar.gz
tar -xvzf frp_0.61.1_linux_amd64.tar.gz
cd frp_0.61.1_linux_amd64
cp frps /usr/bin/
mkdir -p /etc/frp
```

### B. Konfigurasi `frps.toml`
```bash
cat <<EOF > /etc/frp/frps.toml
bind_port = 7000

# Izinkan port remote untuk SSH VPS
allow_ports = [
  { start = 10000, end = 11000 }
]

# Dashboard Monitoring (Buka http://IP_PUBLIK:7500)
webServer.port = 7500
webServer.addr = "0.0.0.0"
webServer.user = "admin"
webServer.password = "admin123"
EOF
```

### C. Jalankan sebagai Service
```bash
cat <<EOF > /etc/systemd/system/frps.service
[Unit]
Description=FRP Server
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/frps -c /etc/frp/frps.toml
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable frps
systemctl start frps
```

---

## 2. Setup di Host Proxmox (FRP Client)
Jalankan perintah ini di terminal **Host Proxmox lokal** Anda:

### A. Instalasi Binary
```bash
wget https://github.com/fatedier/frp/releases/download/v0.61.1/frp_0.61.1_linux_amd64.tar.gz
tar -xvzf frp_0.61.1_linux_amd64.tar.gz
cd frp_0.61.1_linux_amd64
cp frpc /usr/bin/
mkdir -p /etc/frp
```

### B. Konfigurasi Awal `frpc.toml`
```bash
cat <<EOF > /etc/frp/frpc.toml
server_addr = "129.226.192.200"
server_port = 7000
EOF
```

### C. Jalankan sebagai Service
```bash
cat <<EOF > /etc/systemd/system/frpc.service
[Unit]
Description=FRP Client
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/frpc -c /etc/frp/frpc.toml
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable frpc
systemctl start frpc
```

---

## ⚡ Cara Kerja Otomatisasi
1. Ketika Anda membuat VPS baru di Dashboard ProxVM, **Backend** akan secara otomatis mengirimkan perintah ke Proxmox via SSH.
2. Perintah tersebut akan menambahkan baris konfigurasi baru ke dalam `/etc/frp/frpc.toml`.
3. Backend kemudian me-restart layanan `frpc` (`systemctl restart frpc`).
4. Tunnel baru aktif, dan Anda bisa langsung SSH ke port `10000 + VMID`.

---

## 🔍 Troubleshooting
- **Cek Status:** `systemctl status frps` (di VPS) atau `systemctl status frpc` (di Proxmox).
- **Cek Log:** `journalctl -u frpc -f`.
- **Port Tertutup:** Pastikan port 7000 (TCP) dan port 10000-11000 (TCP) sudah dibuka di Firewall/Security Group provider VPS Anda.
