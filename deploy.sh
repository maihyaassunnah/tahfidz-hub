#!/usr/bin/env bash
# ==============================================================================
# Script Otomatis Deploy SIMTAH (Tahfidz Hub) di VPS Ubuntu / Debian
# Mendukung: Git Pull/Clone, Build React, PM2 Backend API, Nginx Reverse Proxy & SSL
# ==============================================================================

set -e

# Warna terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

DOMAIN="${1:-tahfidz.domainanda.com}"
APP_DIR="/var/www/tahfidz"
REPO_URL="https://github.com/maihyaassunnah/tahfidz-hub.git"

echo -e "${BLUE}======================================================${NC}"
echo -e "${GREEN}🚀 Memulai Otomasi Deployment SIMTAH (Tahfidz Hub)${NC}"
echo -e "${BLUE}Subdomain / Domain Target : ${YELLOW}${DOMAIN}${NC}"
echo -e "${BLUE}Direktori Aplikasi       : ${YELLOW}${APP_DIR}${NC}"
echo -e "${BLUE}======================================================${NC}\n"

# 1. Periksa Hak Akses Root / Sudo
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Harap jalankan script ini sebagai root atau gunakan sudo:${NC}"
  echo "sudo bash deploy.sh ${DOMAIN}"
  exit 1
fi

# 2. Periksa dependensi esensial (Git, Node.js, NPM, Nginx, PM2)
echo -e "${BLUE}[1/7] Memeriksa dependensi sistem...${NC}"
command -v git >/dev/null 2>&1 || { echo -e "${YELLOW}Menginstall Git...${NC}"; apt update && apt install -y git; }
command -v nginx >/dev/null 2>&1 || { echo -e "${YELLOW}Menginstall Nginx...${NC}"; apt update && apt install -y nginx; }

if ! command -v node >/dev/null 2>&1; then
  echo -e "${YELLOW}Node.js belum terpasang. Menginstall Node.js 20 LTS...${NC}"
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt install -y nodejs
fi

if ! command -v pm2 >/dev/null 2>&1; then
  echo -e "${YELLOW}Menginstall PM2 Process Manager secara global...${NC}"
  npm install -g pm2
fi

echo -e "${GREEN}✔ Node.js $(node -v), NPM $(npm -v), Git, Nginx, dan PM2 siap.${NC}\n"

# 3. Clone atau Update Repository
echo -e "${BLUE}[2/7] Mengunduh / Memperbarui kode dari GitHub...${NC}"
if [ -d "$APP_DIR/.git" ]; then
  echo -e "Direktori $APP_DIR sudah ada, melakukan git pull..."
  cd "$APP_DIR"
  git fetch --all
  git reset --hard origin/main
  git pull origin main
else
  echo -e "Melakukan clone repository baru ke $APP_DIR..."
  mkdir -p /var/www
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi
echo -e "${GREEN}✔ Kode aplikasi terbaru berhasil diunduh.${NC}\n"

# 4. Install Dependensi & Build Frontend
echo -e "${BLUE}[3/7] Menginstall dependensi frontend & membangun aplikasi (Build)...${NC}"
cd "$APP_DIR"
npm install --legacy-peer-deps
npm run build

if [ ! -d "$APP_DIR/dist" ]; then
  echo -e "${RED}Gagal: Folder $APP_DIR/dist tidak ditemukan setelah build!${NC}"
  exit 1
fi
echo -e "${GREEN}✔ Frontend React (SPA) berhasil di-build di $APP_DIR/dist.${NC}\n"

# 5. Siapkan Backend Server & File .env
echo -e "${BLUE}[4/7] Menyiapkan Backend API & Database Connection...${NC}"
cd "$APP_DIR/server"
npm install --production

# Pastikan file server/.env tersedia
if [ ! -f "$APP_DIR/server/.env" ]; then
  echo -e "Menyiapkan file server/.env..."
  cat << 'EOF' > "$APP_DIR/server/.env"
DATABASE_URL="postgresql://postgres:31122000Hfz@43.173.12.46:5432/tahfidz_db?schema=public"
PORT=5001
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=tahfidz_db
DB_USER=postgres
DB_PASSWORD=31122000Hfz
EOF
fi

# 6. Jalankan atau Restart Backend via PM2
echo -e "${BLUE}[5/7] Menjalankan Backend API dengan PM2 di port 5001...${NC}"
cd "$APP_DIR"
pm2 restart ecosystem.config.cjs 2>/dev/null || pm2 start ecosystem.config.cjs
pm2 save
echo -e "${GREEN}✔ Service 'tahfidz-api' aktif di PM2.${NC}\n"

# 7. Konfigurasi Nginx Server Block untuk Subdomain
echo -e "${BLUE}[6/7] Mengonfigurasi Nginx Server Block untuk ${DOMAIN}...${NC}"
NGINX_CONF="/etc/nginx/sites-available/tahfidz.conf"

cat << EOF > "$NGINX_CONF"
# ==============================================================================
# Konfigurasi Nginx untuk SIMTAH (Tahfidz Hub)
# Subdomain: ${DOMAIN}
# ==============================================================================

server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    # 1. Routing Frontend React (SPA)
    root ${APP_DIR}/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # 2. Reverse Proxy ke Backend Node.js API (Port 5001)
    location /api/ {
        proxy_pass http://127.0.0.1:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 3. Cache Aset Statis
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)\$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    client_max_body_size 20M;
}
EOF

# Buat symlink ke sites-enabled jika belum ada
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/

# Uji konfigurasi Nginx
echo -e "Menguji sintaks Nginx..."
nginx -t
systemctl reload nginx
echo -e "${GREEN}✔ Nginx berhasil dikonfigurasi dan direload.${NC}\n"

# 8. Konfigurasi Sertifikat SSL HTTPS Gratis (Certbot)
echo -e "${BLUE}[7/7] Memeriksa Let's Encrypt SSL (Certbot)...${NC}"
if command -v certbot >/dev/null 2>&1; then
  echo -e "${YELLOW}Menjalankan certbot untuk domain ${DOMAIN}...${NC}"
  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m admin@ihya.sch.id --redirect || {
    echo -e "${YELLOW}Catatan SSL: Jika DNS domain belum terpropagasi ke IP VPS ini, jalankan certbot nanti secara manual:${NC}"
    echo "sudo certbot --nginx -d ${DOMAIN}"
  }
else
  echo -e "${YELLOW}Certbot belum terpasang. Untuk mengaktifkan HTTPS, pasang certbot:${NC}"
  echo "sudo apt install -y certbot python3-certbot-nginx"
  echo "sudo certbot --nginx -d ${DOMAIN}"
fi

echo -e "\n${GREEN}======================================================${NC}"
echo -e "${GREEN}🎉 DEPLOYMENT SELESAI DENGAN SUKSES!${NC}"
echo -e "${BLUE}Akses Website Anda di : ${YELLOW}http://${DOMAIN}${NC} atau ${YELLOW}https://${DOMAIN}${NC}"
echo -e "${BLUE}Cek Health API di     : ${YELLOW}http://${DOMAIN}/api/health${NC}"
echo -e "${GREEN}======================================================${NC}"
