# cops-platform monorepo

## Estructura
- apps/web
- apps/cotizaciones

## Comandos
- `corepack pnpm install`
- `corepack pnpm dev:web`
- `corepack pnpm dev:cotizaciones`
- `corepack pnpm build:web`
- `corepack pnpm build:cotizaciones`

## Navegacion Web -> Cotizaciones
Configura en `apps/web` la variable:
- `COTIZACIONES_APP_URL=https://tu-cotizaciones.vercel.app`

Luego `/panel/cotizaciones` redirige al modulo de cotizaciones.

## Deploy en Vercel
Crear 2 proyectos conectados al mismo repo:
- Web: Root Directory `apps/web`
- Cotizaciones: Root Directory `apps/cotizaciones`

## Nota de aislamiento
Cada app se despliega por separado. Cambios en una no rompen la otra en CI/CD.
