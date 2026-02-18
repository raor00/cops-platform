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
| Sprint 5 | ✅ Completo | Vista móvil técnicos, pipeline board dedicado, config page, loading skeletons, fix sidebar collapse |

### Sprint 5 — Entregados (2026-02-18)
- **15** `tickets/page.tsx`: Vista móvil responsive para técnicos — cards con borde de color por estado + pills de filtro (`<768px`); desktop sigue mostrando tabla.
- **16** `app/dashboard/pipeline/page.tsx`: Pipeline board dedicado — todas las tarjetas sin límite, scroll por columna, indicador SLA ⚠ (>72h), filtros técnico/prioridad para coordinador+.
- **17** `app/dashboard/configuracion/page.tsx`: Página de configuración del sistema — 14 parámetros agrupados (empresa, SLA/tickets, notificaciones). Vista: gerente+. Edición: vicepresidente+.
- **18** Loading skeletons en 8 rutas: `dashboard`, `tickets`, `tickets/[id]`, `pipeline`, `configuracion`, `reportes`, `pagos`, `usuarios`.
- **Bug fix** `sidebar.tsx` + `layout-client.tsx`: El estado `sidebarCollapsed` ahora está sincronizado como prop controlada → margen del contenido desktop funciona correctamente.

---

## Rutas Activas — apps/tickets

| Ruta | Acceso mínimo |
|------|--------------|
| `/dashboard` | todos |
| `/dashboard/tickets` | todos (cards mobile para técnico, tabla para resto) |
| `/dashboard/tickets/[id]` | todos |
| `/dashboard/tickets/[id]/inspeccion` | coordinador(2)+ |
| `/dashboard/tickets/[id]/comprobante` | coordinador(2)+ |
| `/dashboard/pipeline` | todos (técnico ve solo los suyos) |
| `/dashboard/configuracion` | gerente(3)+ (editar: vicepresidente(4)+) |
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
| `Sidebar` | `components/layout/sidebar.tsx` | Props controladas: `collapsed?` + `onCollapsedChange?` |
| `PagosFiltersBar` | `components/pagos/pagos-filters.tsx` | Filtros + export CSV de pagos |
| `ConfigSection` | `components/configuracion/config-section.tsx` | Client component — secciones config con edición inline |
| `PipelinePageBoard` | `components/pipeline/pipeline-page-board.tsx` | Board completo sin límite + SLA warning |
| `TechnicianMobileList` | `components/tickets/technician-mobile-list.tsx` | Client component — pills de estado + cards stack |

---

## Sprint 5 — Nuevos archivos

```
lib/actions/configuracion.ts          → getConfiguracion(), updateConfigValue()
lib/mock-data.ts                      → + getDemoConfig(), updateDemoConfig() (14 entradas)
components/configuracion/
  config-skeleton.tsx
  config-edit-dialog.tsx              → Dialog edición un SystemConfig (boolean/number/string)
  config-section.tsx                  → Client component — grupo de configs editables
components/pipeline/
  pipeline-filters.tsx                → Client — Select técnico + prioridad
  pipeline-page-board.tsx             → Board completo con scroll/columna + SLA indicator
components/tickets/
  technician-mobile-card.tsx          → Card con borde de color por estado
  technician-mobile-list.tsx          → Client — pills filtro + stack de cards
app/dashboard/pipeline/
  page.tsx, loading.tsx
app/dashboard/configuracion/
  page.tsx, loading.tsx
app/dashboard/loading.tsx
app/dashboard/tickets/loading.tsx
app/dashboard/tickets/[id]/loading.tsx
app/dashboard/reportes/loading.tsx
app/dashboard/pagos/loading.tsx
app/dashboard/usuarios/loading.tsx
```

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
  if (!hasPermission(user.rol, 'permission:name')) return { success: false, error: "Sin permisos" }
  if (isLocalMode()) { return { success: true, data: mockData, message: "..." } }
  const supabase = await createClient()
  // query supabase...
  revalidatePath("/dashboard/ruta")
}
```

### IMPORTANTE: getAllUsers() NO tiene isLocalMode branch
```typescript
// ✅ CORRECTO — en páginas que necesiten usuarios en local mode:
const users = isLocalMode() ? getDemoUsers() : (await getAllUsers()).data ?? []
// ❌ INCORRECTO — llamar getAllUsers() directamente en local mode falla
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

### Sidebar collapse (sincronizado desde Sprint 5)
```typescript
// layout-client.tsx pasa estado controlado:
<Sidebar collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
// Sidebar acepta props opcionales; si no se pasan usa estado interno propio
```

---

## Design System Constraints

- Glass morphism: `bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl`
- Dialogs: `bg-[#0e2f6f]/95 backdrop-blur-2xl border border-white/20`
- Cards: `<Card variant="glass">`
- Animaciones: `animate-fade-in`, `animate-slide-up`, `animate-scale-in`
- Stagger delays: `stagger-1` ... `stagger-6` (definidos en globals.css)
- Mobile tech cards: clase `mobile-ticket-card mobile-ticket-card-{estado}` (borde izquierdo de color)
- Status pills bar: clase `status-pills-bar` (scroll horizontal sin scrollbar)
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
- `Lucide` icons NO aceptan prop `title` directamente — envolver en `<span title="...">`.
