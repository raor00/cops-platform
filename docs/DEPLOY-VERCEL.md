# Deploy Vercel (Monorepo)

## Requisito
El repo debe estar en GitHub y actualizado en `main`.

## Proyecto 1: Web
1. En Vercel: Add New Project.
2. Importar repo `raor00/cops-platform`.
3. Configurar:
   - Framework Preset: Next.js
   - Root Directory: `apps/web`
   - Install Command: `corepack pnpm install --frozen-lockfile`
   - Build Command: `corepack pnpm --filter web build`
4. Variables de entorno de Web:
   - `COTIZACIONES_APP_URL` = URL de Vercel del proyecto cotizaciones (ejemplo: `https://tu-cotizaciones.vercel.app`)
5. Deploy.

## Proyecto 2: Cotizaciones
1. En Vercel: Add New Project.
2. Importar repo `raor00/cops-platform`.
3. Configurar:
   - Framework Preset: Next.js
   - Root Directory: `apps/cotizaciones`
   - Install Command: `corepack pnpm install --frozen-lockfile`
   - Build Command: `corepack pnpm --filter cotizaciones build`
4. Variables de entorno: cargar las del modulo de cotizaciones.
5. Deploy.

## Navegacion entre modulos
- En `web`, el portal interno usa `/panel/cotizaciones`.
- Esa ruta redirige automaticamente a `COTIZACIONES_APP_URL`.

## Nota
Cada proyecto despliega de forma independiente aunque comparten repo.
