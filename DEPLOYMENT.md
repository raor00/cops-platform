# COPS Platform — Guía de Despliegue

Opciones para hospedar COPS Platform en producción, incluyendo uso de DreamHost para el dominio.

---

## Resumen de Opciones

| Opción | Costo Aprox. | Dificultad | Recomendado |
|--------|-------------|------------|-------------|
| **A: Vercel + Supabase Cloud** | $0/mes (free tier) | Baja | ✅ Sí |
| **B: DreamHost VPS + PM2** | $10-15/mes | Media | Para control total |
| **C: DreamHost Shared Hosting** | N/A | N/A | ❌ No compatible |

---

## Opción A — Vercel (Frontend) + Supabase Cloud (DB) ✅ Recomendada

### Por qué esta opción

- **Vercel** tiene soporte nativo para Next.js (misma empresa creadora)
- **Supabase Cloud** tiene free tier con 500MB de base de datos
- **DreamHost** se usa únicamente para apuntar el dominio — sin configurar servidores
- Costo total: $0/mes hasta ~1000 req/día, escalable bajo demanda

### Paso 1 — Supabase Cloud

1. Ir a [supabase.com](https://supabase.com) → Crear cuenta → **New Project**
2. Elegir región: `US East (N. Virginia)` o `South America (São Paulo)`
3. Guardar la contraseña del proyecto (se usa una sola vez)
4. Una vez creado, ir a **Settings → API** y copiar:
   - `SUPABASE_URL` (ej: `https://xyzxyz.supabase.co`)
   - `SUPABASE_ANON_KEY` (clave pública, empieza con `eyJ...`)
5. Ir a **SQL Editor** y ejecutar el schema de la carpeta `migrations/` del proyecto

### Paso 2 — Vercel

1. Ir a [vercel.com](https://vercel.com) → Crear cuenta → **Add New Project**
2. Conectar con GitHub → Seleccionar el repo `raor00/cops-platform`
3. En la pantalla de configuración:
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/tickets`
   - **Build Command:** `pnpm build` (o `npm run build`)
4. En **Environment Variables**, agregar:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xyzxyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
TICKETS_LOCAL_MODE=false
NEXT_PUBLIC_TICKETS_LOCAL_MODE=false
```

5. Hacer clic en **Deploy** → Vercel construye y publica el sitio
6. El sitio queda disponible en `https://cops-platform-tickets.vercel.app`

### Paso 3 — Dominio con DreamHost

Para usar `tickets.copselectronics.com` en lugar de la URL de Vercel:

1. En **Vercel → Settings → Domains**, agregar `tickets.copselectronics.com`
2. Vercel mostrará las instrucciones DNS (normalmente un registro CNAME)
3. Ir a **DreamHost → Domains → Manage Domains → DNS**
4. Agregar registro:
   - Tipo: `CNAME`
   - Nombre: `tickets`
   - Valor: `cname.vercel-dns.com`
5. Esperar propagación DNS (5 min – 24 horas)
6. Vercel otorga SSL automáticamente (HTTPS gratis)

### Resultado Final

```
https://tickets.copselectronics.com  →  Vercel  →  Supabase Cloud
        ↑ dominio DreamHost         ↑ servidor    ↑ base de datos
```

---

## Opción B — DreamHost VPS + PM2

Para quienes prefieren control total sobre el servidor.

### Requisitos

- Plan DreamHost VPS o Cloud (~$10-15/mes)
- Acceso SSH al servidor

### Instalación del entorno

```bash
# Conectar al VPS via SSH
ssh usuario@tuservidor.dreamhost.com

# Instalar Node.js 20 (si no está disponible, usar nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
nvm install 20

# Instalar pnpm
npm install -g pnpm

# Instalar PM2 (gestor de procesos)
npm install -g pm2
```

### Deploy de la aplicación

```bash
# Clonar el repo
git clone https://github.com/raor00/cops-platform.git
cd cops-platform

# Instalar dependencias
pnpm install

# Crear archivo de variables de entorno en apps/tickets
cat > apps/tickets/.env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://xyzxyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
TICKETS_LOCAL_MODE=false
NEXT_PUBLIC_TICKETS_LOCAL_MODE=false
EOF

# Build de la app de tickets
pnpm --filter tickets build

# Iniciar con PM2
cd apps/tickets
pm2 start npm --name "cops-tickets" -- start
pm2 startup    # configura PM2 para arrancar al reiniciar
pm2 save
```

### Nginx como reverse proxy

```nginx
# /etc/nginx/sites-available/cops-tickets
server {
    listen 80;
    server_name tickets.copselectronics.com;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activar el sitio
ln -s /etc/nginx/sites-available/cops-tickets /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# SSL gratuito con Let's Encrypt
certbot --nginx -d tickets.copselectronics.com
```

### Actualizaciones

```bash
# Para actualizar cuando hay cambios en GitHub:
cd ~/cops-platform
git pull
pnpm install
pnpm --filter tickets build
pm2 restart cops-tickets
```

---

## Opción C — DreamHost Shared Hosting ❌ No Compatible

DreamHost **Shared Hosting** **no soporta** Node.js / Next.js. Está diseñado para PHP/WordPress.

**No usar para COPS Platform.**

Si solo tienes hosting compartido de DreamHost, usa la Opción A (Vercel gratis + DreamHost solo para el dominio).

---

## Variables de Entorno — Referencia Completa

```bash
# ─── apps/tickets ────────────────────────────────────────────

# Modo de operación
TICKETS_LOCAL_MODE=false                    # true = demo sin Supabase
NEXT_PUBLIC_TICKETS_LOCAL_MODE=false

# Supabase (solo modo real)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...           # solo para operaciones admin (opcional)

# Demo credentials (solo modo local)
TICKETS_DEMO_EMAIL=admin@copselectronics.com
TICKETS_DEMO_PASSWORD=admin123
```

---

## Base de Datos — Aplicar Schema en Supabase

El schema SQL completo está en `migrations/` dentro del proyecto.

```bash
# Opción 1: Via Supabase Dashboard → SQL Editor
# Copiar y pegar el contenido de migrations/*.sql

# Opción 2: Via Supabase CLI (local)
npm install -g supabase
supabase link --project-ref TU_PROJECT_REF
supabase db push
```

---

## Checklist de Producción

Antes de hacer público el sistema, verificar:

- [ ] `TICKETS_LOCAL_MODE=false` en variables de entorno de Vercel
- [ ] Schema SQL aplicado en Supabase Cloud
- [ ] Crear usuario administrador inicial en Supabase Auth
- [ ] Dominio apuntando correctamente (verificar SSL verde en navegador)
- [ ] Probar login con credenciales reales (no demo)
- [ ] Revisar Storage en Supabase: crear buckets `ticket-fotos` y `profile-photos` con políticas RLS
- [ ] Configurar backup automático en Supabase (Dashboard → Database → Backups)

---

## Soporte y Mantenimiento

| Tarea | Frecuencia | Cómo |
|-------|-----------|------|
| Deploy de actualizaciones | Según necesidad | Push a `main` → Vercel redeploy automático |
| Backup de DB | Semanal (auto en Supabase free) | Supabase Dashboard → Backups |
| Monitoreo | Continuo | Vercel Analytics (gratis) |
| Revisión de errores | Semanal | Vercel → Logs |

---

*Guía generada para COPS Platform Sprint 8 — Febrero 2026*

---

## Bridge SSO Web -> Tickets (Obligatorio)

Para evitar doble login y mantener tickets sin pantalla de login local:

1. En `apps/web` (Vercel proyecto web):
- `TICKETS_APP_URL=https://cops-platform-tickets.vercel.app`
- `PLATFORM_TICKETS_BRIDGE_SECRET=<secreto-largo>`

2. En `apps/tickets` (Vercel proyecto tickets):
- `WEB_URL=https://cops-platform-web.vercel.app`
- `PLATFORM_TICKETS_BRIDGE_SECRET=<mismo-secreto-del-web>`
- `TICKETS_LOCAL_MODE=true` (si operas en demo/local mode)

3. Flujo esperado:
- Login en Web (`/login`) -> `/panel`
- Click `Tickets` -> Web firma token -> `tickets/auth/bridge` -> `tickets/dashboard`
- En Tickets:
  - `Cambiar modulo` -> `web/panel`
  - `Cerrar sesion` -> `web/`

4. Acceso directo al dominio de Tickets sin sesion local:
- Redirecciona a `web/login` (no muestra login local de tickets).
