# Panduan Lengkap: Menghubungkan PostgreSQL & Deploy Subdomain di VPS

Panduan ini dirancang khusus agar proyek **SIMTAH (Tahfidz Hub)** dapat berjalan berdampingan secara aman dengan **proyek-proyek lain yang sudah aktif di VPS Anda** tanpa saling mengganggu.

---

## Arsitektur & Jaminan Keamanan Multi-Project

1. **Database PostgreSQL**: Dibuat terpisah (`tahfidz_db`) dengan user khusus (`tahfidz_user`). Hak akses hanya mencakup database ini saja, sehingga database proyek lain Anda 100% aman.
2. **Backend API Node.js**: Berjalan pada port internal terisolasi (`5001`) yang dikelola oleh **PM2**.
3. **Nginx Web Server**: Menggunakan *Server Block* baru khusus untuk subdomain Anda (`server_name tahfidz.domainanda.com;`). Konfigurasi website lama Anda tidak akan terganggu.
4. **Sertifikat SSL**: Let's Encrypt mengamankan subdomain secara independen.

---

## Langkah 1: Pengaturan DNS Subdomain

Sebelum melakukan konfigurasi di VPS, arahkan subdomain Anda ke IP VPS:

1. Buka DNS Management domain Anda (misal di **Cloudflare**, Niagahoster, DomaiNesia, dsb).
2. Tambahkan **A Record** baru:
   - **Type**: `A`
   - **Name**: `tahfidz` *(atau nama subdomain yang Anda inginkan)*
   - **IPv4 Address**: `IP_VPS_ANDA` *(misal: 103.123.45.67)*
   - **TTL**: Auto atau 1/2 Jam
3. Simpan. Subdomain Anda sekarang adalah `tahfidz.domainanda.com`.

---

## Langkah 2: Membuat Database & User di PostgreSQL VPS

Masuk ke terminal VPS Anda via SSH:
```bash
ssh root@IP_VPS_ANDA
```

Buka terminal PostgreSQL:
```bash
sudo -u postgres psql
```

Jalankan perintah SQL berikut (ganti `PasswordKuatAnda123!` dengan password pilihan Anda):
```sql
-- 1. Buat user database baru
CREATE USER tahfidz_user WITH PASSWORD 'PasswordKuatAnda123!';

-- 2. Buat database baru khusus tahfidz
CREATE DATABASE tahfidz_db OWNER tahfidz_user;

-- 3. Berikan hak akses penuh ke database tersebut
GRANT ALL PRIVILEGES ON DATABASE tahfidz_db TO tahfidz_user;

-- 4. Keluar dari psql
\q
```

---

## Langkah 3: Menyiapkan File Proyek di VPS

1. Buat direktori aplikasi di `/var/www/` (standar Linux):
```bash
sudo mkdir -p /var/www/tahfidz
sudo chown -R $USER:$USER /var/www/tahfidz
```

2. Salin atau clone file proyek Anda ke `/var/www/tahfidz`:
*(Bisa via Git clone, rsync, FileZilla SFTP, atau SCP)*

3. Masuk ke folder backend server:
```bash
cd /var/www/tahfidz/server
```

4. Buat file `.env` dari template:
```bash
cp .env.example .env
nano .env
```
Sesuaikan isinya dengan user dan password yang Anda buat di Langkah 2:
```env
PORT=5001
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=tahfidz_db
DB_USER=tahfidz_user
DB_PASSWORD=PasswordKuatAnda123!
```
Simpan dengan menekan `CTRL + O`, lalu `Enter`, kemudian `CTRL + X`.

5. Install dependensi backend & inisialisasi tabel otomatis:
```bash
npm install
npm run db:init
```
*Output akan menampilkan: `✔ [DB Init] Tabel dan data awal berhasil dibuat di PostgreSQL.`*

---

## Langkah 4: Jalankan Backend API dengan PM2

1. Pastikan PM2 terpasang secara global di VPS:
```bash
sudo npm install -g pm2
```

2. Jalankan service backend menggunakan file `ecosystem.config.cjs`:
```bash
cd /var/www/tahfidz
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

3. Cek status service:
```bash
pm2 status
```
Anda akan melihat aplikasi `tahfidz-api` berstatus **online** pada port `5001`.

---

## Langkah 5: Build Frontend React

Jalankan instalasi dependensi dan build aplikasi di folder utama:
```bash
cd /var/www/tahfidz
npm install
npm run build
```
File hasil build statis akan tersimpan di folder `/var/www/tahfidz/dist`.

---

## Langkah 6: Konfigurasi Nginx Server Block untuk Subdomain

Buat file konfigurasi Nginx baru untuk subdomain Anda tanpa menyentuh konfigurasi project lain:
```bash
sudo nano /etc/nginx/sites-available/tahfidz.conf
```

Tempelkan (*paste*) konfigurasi berikut (ganti `tahfidz.domainanda.com` dengan subdomain asli Anda):

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name tahfidz.domainanda.com;

    # 1. Routing Frontend React (SPA)
    root /var/www/tahfidz/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 2. Reverse Proxy ke Backend Node.js API (Port 5001)
    location /api/ {
        proxy_pass http://127.0.0.1:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Optimasi Cache Asset Statis
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    client_max_body_size 20M;
}
```

Simpan file (`CTRL + O` ➔ `Enter` ➔ `CTRL + X`).

Aktifkan konfigurasi dengan membuat symlink ke `sites-enabled`:
```bash
sudo ln -s /etc/nginx/sites-available/tahfidz.conf /etc/nginx/sites-enabled/
```

Uji apakah ada kesalahan sintaks Nginx (aman untuk proyek lain):
```bash
sudo nginx -t
```
*Jika muncul `syntax is ok` dan `test is successful`:*
```bash
sudo systemctl reload nginx
```

---

## Langkah 7: Pasang Sertifikat SSL (HTTPS) Gratis dengan Certbot

Amankan subdomain Anda dengan SSL Let's Encrypt:
```bash
sudo certbot --nginx -d tahfidz.domainanda.com
```

Pilih opsi redirect HTTP ke HTTPS jika ditanya. Certbot akan otomatis mengupdate file `tahfidz.conf` tanpa mengganggu sertifikat SSL pada domain/proyek Anda yang lain.

---

## Langkah 8: Verifikasi & Selesai!

1. Buka browser dan kunjungi `https://tahfidz.domainanda.com`.
2. Buka `https://tahfidz.domainanda.com/api/health`.
   - Akan muncul respon JSON:
   ```json
   {
     "status": "ok",
     "service": "tahfidz-api",
     "database": "connected",
     "dbTime": "2026-09-13T...",
     "timestamp": "2026-09-13T..."
   }
   ```
3. Proyek Tahfidz Anda sekarang resmi terhubung ke database **PostgreSQL**, online di **subdomain** Anda, dan semua proyek Anda yang lain di VPS tetap berjalan lancar!
