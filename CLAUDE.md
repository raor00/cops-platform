# COPS Platform - Working Context

This file keeps the most important technical context so future work does not lose continuity.

## Monorepo Structure

- `apps/web`: Corporate website + master portal (login + module selector).
- `apps/cotizaciones`: Quotation system UI.
- `apps/tickets`: Tickets/support system.

## Current Product Direction

- Keep a unified visual language (`glass-refraction` / liquid-glass look) across modules.
- Maintain module boundaries: each app evolves independently, but with shared UX feel.
- Portal navigation from `web` should route cleanly to each module.

## Auth and Session Strategy

### `apps/web`

- Uses master session cookies from `apps/web/lib/masterAuth.ts`.
- Header/menu logic and role visibility handled in `apps/web/components/SiteHeader.tsx`.

### `apps/tickets`

- Supports two modes:
1. Real mode (Supabase).
2. Local demo mode without Supabase (for visual/dev testing).

- Local mode is controlled by:
  - `TICKETS_LOCAL_MODE=true` (server)
  - `NEXT_PUBLIC_TICKETS_LOCAL_MODE=true` (client hint)
- Local mode fallback also activates when Supabase env vars are missing.

Important files:
- `apps/tickets/lib/local-mode.ts`
- `apps/tickets/lib/mock-data.ts`
- `apps/tickets/lib/actions/auth.ts`
- `apps/tickets/lib/actions/tickets.ts`
- `apps/tickets/middleware.ts`

Demo credentials (tickets local mode):
- Email: `admin@copselectronics.com`
- Password: `admin123`

## Env Variables Used

### Web
- `NEXT_PUBLIC_PLATFORM_COTIZACIONES_URL`

### Tickets
- `TICKETS_LOCAL_MODE`
- `NEXT_PUBLIC_TICKETS_LOCAL_MODE`
- `TICKETS_DEMO_EMAIL`
- `TICKETS_DEMO_PASSWORD`
- Optional for real mode:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Commands

From monorepo root:

```bash
corepack pnpm install
corepack pnpm dev:web
corepack pnpm dev:cotizaciones
corepack pnpm dev:tickets
```

Build checks:

```bash
corepack pnpm --filter tickets build
```

## UX/Visual Decisions Applied

- Increased contrast for dropdown and mobile menu glass containers in `apps/web`.
- Removed heavy pill look from per-option menu items in dropdown/mobile menus.
- Kept glass style but with cleaner item hierarchy and better readability.
- Slowed glass shimmer/specular timings in `apps/cotizaciones`.
- Reduced refraction filter intensity in `apps/cotizaciones/components/glass-provider.tsx`.

## Known Notes

- Next.js warns that `middleware` convention is deprecated in favor of `proxy`; not blocking, but should be migrated in a later cleanup.
- `apps/tickets` currently appears as untracked in git status in this local workspace, so commits should be done intentionally from monorepo root.
