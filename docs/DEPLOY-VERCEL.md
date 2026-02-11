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
4. Variables de entorno: cargar las de la web.
5. Deploy.
6. Dominio recomendado: `www.tudominio.com`.

## Proyecto 2: Cotizaciones
1. En Vercel: Add New Project.
2. Importar repo `raor00/cops-platform`.
3. Configurar:
   - Framework Preset: Next.js
   - Root Directory: `apps/cotizaciones`
   - Install Command: `corepack pnpm install --frozen-lockfile`
   - Build Command: `corepack pnpm --filter cotizaciones build`
4. Variables de entorno: cargar las de cotizaciones.
5. Deploy.
6. Dominio recomendado: `cotizaciones.tudominio.com`.

## Nota
Cada proyecto despliega de forma independiente aunque comparten repo.
