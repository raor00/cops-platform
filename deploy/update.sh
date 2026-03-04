#!/bin/bash
# COPS Platform — Script de actualización en Hetzner
# Uso: bash deploy/update.sh
# Ejecutar desde la raíz del repo: /home/cops/cops-platform

set -e

echo "=== Pull últimos cambios ==="
git pull origin main

echo "=== Instalar dependencias nuevas (si las hay) ==="
pnpm install --frozen-lockfile

echo "=== Re-build ==="
pnpm --filter web build
pnpm --filter cotizaciones build
pnpm --filter tickets build

echo "=== Reiniciar apps ==="
pm2 restart all

echo "✅ Actualización completada"
pm2 status
