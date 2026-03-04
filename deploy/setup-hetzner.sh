#!/bin/bash
# COPS Platform — Setup inicial en VPS Hetzner (Ubuntu 22.04/24.04)
# Ejecutar como root o usuario con sudo
# Uso: bash setup-hetzner.sh

set -e

REPO_URL="https://github.com/raor00/cops-platform.git"
APP_DIR="/home/cops/cops-platform"
DOMAIN_WEB="copselectronics.com"
DOMAIN_COT="cotizaciones.copselectronics.com"
DOMAIN_TIC="tickets.copselectronics.com"

echo "=== 1. Dependencias del sistema ==="
apt update && apt upgrade -y
apt install -y git curl nginx certbot python3-certbot-nginx

echo "=== 2. Node.js 20 via nvm ==="
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
nvm install 20
nvm use 20
nvm alias default 20

echo "=== 3. pnpm + PM2 ==="
npm install -g pnpm@10 pm2

echo "=== 4. Ollama ==="
curl -fsSL https://ollama.com/install.sh | sh
systemctl enable ollama
systemctl start ollama
sleep 3
ollama pull qwen3.5:2b   # o el modelo que uses — ajustar si cambia

echo "=== 5. Clonar el repo ==="
mkdir -p /home/cops
cd /home/cops
git clone "$REPO_URL" cops-platform
cd "$APP_DIR"

echo "=== 6. Copiar archivos de entorno ==="
echo ">>> IMPORTANTE: edita los archivos en deploy/env/ ANTES de continuar"
echo ">>> Reemplaza los valores REEMPLAZAR_CON_* con valores reales"
echo ">>> Presiona Enter cuando estés listo..."
read -r

cp deploy/env/web.env         apps/web/.env.local
cp deploy/env/cotizaciones.env apps/cotizaciones/.env.local
cp deploy/env/tickets.env     apps/tickets/.env.local

echo "=== 7. Instalar dependencias ==="
pnpm install --frozen-lockfile

echo "=== 8. Build de las tres apps ==="
pnpm --filter web build
pnpm --filter cotizaciones build
pnpm --filter tickets build

echo "=== 9. Nginx — copiar configs ==="
cp deploy/nginx/cops-web.conf         /etc/nginx/sites-available/
cp deploy/nginx/cops-cotizaciones.conf /etc/nginx/sites-available/
cp deploy/nginx/cops-tickets.conf     /etc/nginx/sites-available/

ln -sf /etc/nginx/sites-available/cops-web.conf         /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/cops-cotizaciones.conf /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/cops-tickets.conf     /etc/nginx/sites-enabled/

nginx -t && systemctl reload nginx

echo "=== 10. SSL con Let's Encrypt ==="
certbot --nginx \
  -d "$DOMAIN_WEB" -d "www.$DOMAIN_WEB" \
  -d "$DOMAIN_COT" \
  -d "$DOMAIN_TIC" \
  --non-interactive --agree-tos -m admin@copselectronics.com

echo "=== 11. Iniciar apps con PM2 ==="
cd "$APP_DIR"
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root
systemctl enable pm2-root

echo ""
echo "=== ✅ Deploy completado ==="
echo "Web:          https://$DOMAIN_WEB"
echo "Cotizaciones: https://$DOMAIN_COT"
echo "Tickets:      https://$DOMAIN_TIC"
echo ""
echo "Comandos útiles:"
echo "  pm2 status          — ver estado de los procesos"
echo "  pm2 logs cops-cotizaciones — ver logs del chatbot"
echo "  pm2 restart all     — reiniciar todo"
echo "  ollama list         — ver modelos instalados"
