# Flujo de trabajo del monorepo

## Estructura
- `apps/web`
- `apps/cotizaciones`

## Desarrollo local
- Web: `corepack pnpm dev:web`
- Cotizaciones: `corepack pnpm dev:cotizaciones`

## Cambios aislados por modulo
- Cambios web:
  - editar solo `apps/web/**`
  - `git add apps/web`
- Cambios cotizaciones:
  - editar solo `apps/cotizaciones/**`
  - `git add apps/cotizaciones`

## CI por paths
- `.github/workflows/ci-web.yml` corre solo con cambios en web.
- `.github/workflows/ci-cotizaciones.yml` corre solo con cambios en cotizaciones.

## Branch protection recomendado
- Requerir Pull Request para merge a `main`.
- Requerir checks de CI.
- Requerir al menos 1 aprobacion.
