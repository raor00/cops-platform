# COPS Platform - Working Context

This file keeps the most important technical context so future work does not lose continuity.

---

## Monorepo Structure

- `apps/web`: Corporate website + master portal (login + module selector).
- `apps/cotizaciones`: Quotation system UI.
- `apps/tickets`: Tickets/support/field-service management system (trabajo de grado).

---

## Sprint Progress — apps/tickets (Trabajo de Grado)

| Sprint | Estado | Entregables |
|--------|--------|-------------|
| Sprint 1 | ✅ Completo | Schema SQL, tipos, mock-data, dashboard KPIs+charts, sidebar glass-morphism |
| Sprint 2 | ✅ Completo | Ticket detail con tabs, sistema de Fases, wizard de estados, creación de usuarios, modal de pagos |
| Sprint 3 | ✅ Completo | Fotos (Supabase Storage), FotosGallery, perfiles de usuario, comprobante PDF, export CSV de pagos |
| Sprint 4 | ✅ Completo | Inspección técnica real, perfil `/usuarios/[id]`, página de reportes KPIs, sidebar animations |
| Sprint 5 | ⏳ Pendiente | UI mobile para técnicos, pipeline board, configuración, notificaciones |

### Sprint 4 — Entregados (2025-02)
- **A2** `tickets/[id]/page.tsx`: Fetch real de `getInspeccionByTicket` en paralelo (no más `null` hardcodeado)
- **B** `usuarios/[id]/page.tsx`: Página nueva con 3 tabs — Perfil, Tickets asignados, Rendimiento con KPIs
- **C** `reportes/page.tsx` + `report-export-button.tsx`: Dashboard de reportes con 4 KPI cards, distribución por estado, tabla de técnicos, gráfico mensual, exportación CSV
- **D** `sidebar.tsx`: Clases `sidebar-nav-item` + `active` para animación de barra izquierda CSS
- **E** `usuarios/page.tsx`: Cards de usuario ahora son links a `/dashboard/usuarios/[id]`

---

## Rutas Activas — apps/tickets

| Ruta | Acceso mínimo |
|------|--------------|
| `/dashboard` | todos |
| `/dashboard/tickets` | todos |
| `/dashboard/tickets/[id]` | todos |
| `/dashboard/tickets/[id]/inspeccion` | coordinador(2)+ |
| `/dashboard/tickets/[id]/inspeccion/view` | coordinador(2)+ |
| `/dashboard/tickets/[id]/comprobante` | coordinador(2)+ |
| `/dashboard/usuarios` | gerente(3)+ |
| `/dashboard/usuarios/nuevo` | gerente(3)+ |
| `/dashboard/usuarios/[id]` | gerente(3)+ o propio usuario |
| `/dashboard/reportes` | coordinador(2)+ |
| `/dashboard/pagos` | coordinador(2)+ |

---

## Componentes Clave (NO modificar sin revisar)

| Componente | Ruta | Nota |
|---|---|---|
| `FotosGallery` | `components/fotos/fotos-gallery.tsx` | Autónomo — carga fotos con `ticketId` |
| `InspeccionForm` | `components/inspecciones/inspeccion-form.tsx` | ChecklistItem: usar `estado/notas/descripcion` |
| `InspeccionView` | `components/inspecciones/inspeccion-view.tsx` | Vista imprimible de inspección |
| `ProfileEditDialog` | `components/usuarios/profile-edit-dialog.tsx` | Foto + campos del perfil |
| `Sidebar` | `components/layout/sidebar.tsx` | NavLink con clase `sidebar-nav-item` |
| `PagosFiltersBar` | `components/pagos/pagos-filters.tsx` | Filtros + export CSV de pagos |

---

## Current Product Direction

- Mantener lenguaje visual unificado (`glass-morphism` dark blue) en todos los módulos.
- Cada app evoluciona independientemente con UX compartida.
- Portal en `web` enruta limpiamente a cada módulo vía `getTicketsAppUrl()`.

---

## Auth and Session Strategy

### `apps/web`
- Usa cookies de sesión master desde `apps/web/lib/masterAuth.ts`.
- Lógica de header/menú y visibilidad por rol en `apps/web/components/SiteHeader.tsx`.

### `apps/tickets`
- Soporta dos modos:
  1. **Real mode** (Supabase) — requiere vars de entorno
  2. **Local demo mode** — sin Supabase, para testing visual/dev

- Modo local controlado por:
  - `TICKETS_LOCAL_MODE=true` (server)
  - `NEXT_PUBLIC_TICKETS_LOCAL_MODE=true` (client hint)
- Fallback también activa si faltan vars de Supabase.

Archivos clave:
- `apps/tickets/lib/local-mode.ts`
- `apps/tickets/lib/mock-data.ts`
- `apps/tickets/lib/actions/auth.ts`
- `apps/tickets/lib/actions/tickets.ts`
- `apps/tickets/middleware.ts`

**Demo credentials:**
- Email: `admin@copselectronics.com`
- Password: `admin123` (cualquier valor en local mode)

---

## Env Variables

### Web
- `NEXT_PUBLIC_PLATFORM_COTIZACIONES_URL`
- `NEXT_PUBLIC_TICKETS_APP_URL` (fallback: `https://cops-platform-tickets.vercel.app/`)

### Tickets
- `TICKETS_LOCAL_MODE`
- `NEXT_PUBLIC_TICKETS_LOCAL_MODE`
- `TICKETS_DEMO_EMAIL`
- `TICKETS_DEMO_PASSWORD`
- `NEXT_PUBLIC_SUPABASE_URL` (real mode)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (real mode)

---

## Commands

Desde la raíz del monorepo:

```bash
corepack pnpm install
corepack pnpm dev:web          # puerto 3000
corepack pnpm dev:cotizaciones # puerto 3001
corepack pnpm dev:tickets      # puerto 3002
```

Solo tickets:
```bash
cd apps/tickets
npm run dev
# Abre http://localhost:3000 (o 3002 si se configura)
```

TypeScript check (debe dar 0 errores):
```bash
cd apps/tickets && npx tsc --noEmit
```

Build:
```bash
corepack pnpm --filter tickets build
```

---

## Patrones de Código Importantes

### Server Action pattern
```typescript
export async function actionName(input): Promise<ActionResponse<T>> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "No autenticado" }
  if (ROLE_HIERARCHY[user.rol] < N) return { success: false, error: "Sin permisos" }
  if (isLocalMode()) { return { success: true, data: mockData, message: "..." } }
  const supabase = await createClient()
  // query supabase...
}
```

### ChecklistItem — Tipo CORRECTO
```typescript
// ✅ CORRECTO
{ id, categoria, descripcion, aplica, estado: 'ok'|'falla'|'pendiente'|'na', notas, foto_ids }
// ❌ INCORRECTO (V0 genera esto — NO usar)
{ cumple, observacion, item }
```

### PaginatedResponse
```typescript
// .data[] — NO .items[]
const tickets = result.data?.data ?? []
```

---

## Design System Constraints

- Glass morphism: `bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl`
- Dialogs: `bg-[#0e2f6f]/95 backdrop-blur-2xl border border-white/20`
- Cards: `<Card variant="glass">`
- Animaciones: `animate-fade-in`, `animate-slide-up`, `animate-scale-in`
- Stagger delays: `stagger-1` ... `stagger-6` (definidos en globals.css)
- **NO framer-motion** — solo CSS de globals.css + Tailwind transitions
- Sidebar activo: clase `sidebar-nav-item active`

---

## UX/Visual Decisions Applied

- Contraste aumentado en dropdown y mobile menu glass containers en `apps/web`.
- Estilo glass mantenido con jerarquía de ítems más limpia.
- Shimmer glass más lento en `apps/cotizaciones`.
- Intensidad de filtro refracción reducida en `apps/cotizaciones/components/glass-provider.tsx`.

---

## Known Notes

- Next.js advierte que `middleware` convention está deprecado en favor de `proxy`; no bloquea, migrar en limpieza futura.
- Hacer commits desde la raíz del monorepo para incluir cambios de todas las apps.
- V0 (Vercel) puede generar código con tipos incorrectos — siempre adaptar a `types/index.ts`.
- `downloadCSV` está en `@/lib/utils/csv-export` (NO en `@/lib/utils`).
- `useToast` es un wrapper local en `hooks/use-toast.ts` sobre sonner.
