# cops-platform monorepo

## Estructura
- apps/web
- apps/cotizaciones

## Comandos
- `pnpm install`
- `pnpm dev:web`
- `pnpm dev:cotizaciones`
- `pnpm build:web`
- `pnpm build:cotizaciones`

## Deploy en Vercel
Crear 2 proyectos conectados al mismo repo:
- Web: Root Directory `apps/web`
- Cotizaciones: Root Directory `apps/cotizaciones`

## Nota de aislamiento
Cada app se despliega por separado. Cambios en una no rompen la otra en CI/CD.
