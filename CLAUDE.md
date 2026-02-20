# COPS Platform — Contexto Completo para LLM

Este archivo contiene todo el contexto técnico del proyecto. Un LLM que lea este archivo
puede continuar el desarrollo sin perder continuidad. Actualizado: 2026-02-20 (Sprint 8).

---

## 1. Resumen del Proyecto

**COPS Electronics** — Sistema de gestión de servicios y proyectos técnicos (campo, soporte, instalación).
Es el sistema de tickets de campo para una empresa de electrónica/CCTV/seguridad electrónica.

**Repositorio:** https://github.com/raor00/cops-platform
**Branch activo:** `main`
**Estructura:** Monorepo con 3 apps Next.js

```
cops-platform/
├── apps/
│   ├── web/            → Portal corporativo + selector de módulos (puerto 3000)
│   ├── cotizaciones/   → Sistema de cotizaciones (puerto 3001)
│   └── tickets/        → Sistema de tickets/servicios (puerto 3002) ← FOCO PRINCIPAL
├── CLAUDE.md           ← este archivo
└── package.json        (pnpm workspaces)
```

---

## 2. Stack Técnico — apps/tickets

| Tecnología | Versión / Detalle |
|---|---|
| Framework | Next.js 15/16, App Router, TypeScript strict |
| UI | Tailwind CSS + Radix UI primitivos |
| Datos | Supabase (PostgreSQL + Storage) |
| Forms | React Hook Form + Zod |
| Toast | Sonner |
| Gráficas | Recharts |
| Icons | Lucide React |
| Animaciones | **SOLO CSS** — NO framer-motion |
| Package mgr | pnpm (corepack) |

---

## 3. Comandos

```bash
# Desde raíz del monorepo
corepack pnpm install
corepack pnpm dev:tickets      # puerto 3002
corepack pnpm dev:web          # puerto 3000
corepack pnpm --filter tickets build

# Desde apps/tickets
npx tsc --noEmit               # TypeScript check (debe dar 0 errores)
```

**Demo credentials:** Email: `admin@copselectronics.com` / Password: cualquier valor en local mode

---

## 4. Modos de Ejecución

El sistema tiene **dual mode**:

| Modo | Activación | Datos |
|---|---|---|
| **Local/Demo** | `TICKETS_LOCAL_MODE=true` o sin vars de Supabase | `lib/mock-data.ts` en memoria |
| **Real** | Vars de Supabase configuradas | Supabase PostgreSQL |

```typescript
// Siempre usar este patrón en server actions:
import { isLocalMode } from "@/lib/local-mode"

if (isLocalMode()) {
  return { success: true, data: getDemoXxx() }
}
const supabase = await createClient()
// ... query real
```

**CRÍTICO:** `getAllUsers()` NO tiene rama local mode. Usar así:
```typescript
const users = isLocalMode() ? getDemoUsers() : (await getAllUsers()).data ?? []
```

---

## 5. Estado de Sprints

| Sprint | Estado | Entregables |
|--------|--------|-------------|
| Sprint 1 | ✅ | Schema SQL, tipos TypeScript, mock-data, dashboard KPIs+charts, sidebar glass-morphism |
| Sprint 2 | ✅ | Ticket detail (tabs), sistema de Fases, wizard de estados, creación de usuarios, modal de pagos |
| Sprint 3 | ✅ | Fotos Supabase Storage, FotosGallery autónoma, perfiles de usuario, comprobante PDF, export CSV pagos |
| Sprint 4 | ✅ | Inspección técnica real (25 ítems), perfil `/usuarios/[id]` con 3 tabs, reportes KPIs, sidebar animations, links usuarios |
| Sprint 5 | ✅ | Vista móvil técnicos (cards+pills), pipeline board dedicado (/pipeline), config page (/configuracion), loading.tsx en 8 rutas, fix sidebar collapse |
| Sprint 6 | ✅ | Visual redesign (sky-500 + gray-900), estados bidireccionales admin, timeline UpdateLog, back button, filas clickeables, wizard materiales toggle, botón imprimir, tabla estadísticas técnicos |
| Sprint 7 | ✅ | Clientes DB (/clientes), cuadro de pagos (/pagos/cuadro), Quick Actions dashboard, bug fixes (dropdown/flicker/colores), redesign pagos dialog |
| Sprint 8 | ⏳ | Quick fixes UI (botón duplicado, sidebar badge), config:view para gerente, login redesign, nuevo formulario tickets (selector clientes, tipo mantenimiento, nº carta, notas técnico), documentación |

---

## 6. Roles y Permisos

```typescript
// Jerarquía numérica (ROLE_HIERARCHY en types/index.ts)
tecnico       = 1
coordinador   = 2
gerente       = 3
vicepresidente = 4
presidente    = 5

// Verificar permiso de nivel
ROLE_HIERARCHY[user.rol] >= 2   // coordinador o superior

// Verificar permiso granular
hasPermission(user.rol, 'tickets:create')
hasPermission(user.rol, 'config:view')   // gerente(3)+
hasPermission(user.rol, 'config:edit')   // vicepresidente(4)+
```

**Permisos disponibles:** `tickets:view`, `tickets:create`, `tickets:edit`, `tickets:delete`, `users:view`, `users:create`, `users:edit`, `payments:view`, `payments:process`, `reports:view`, `config:view`, `config:edit`, `audit:view`

---

## 7. Rutas Activas — apps/tickets

| Ruta | Archivo | Acceso | Notas |
|------|---------|--------|-------|
| `/dashboard` | `page.tsx` | todos | KPIs, charts, pipeline widget, activity feed |
| `/dashboard/tickets` | `tickets/page.tsx` | todos | Cards móvil para técnico / tabla para otros |
| `/dashboard/tickets/nuevo` | `nuevo/page.tsx` | coordinador(2)+ | Formulario creación |
| `/dashboard/tickets/[id]` | `[id]/page.tsx` | todos | 5 tabs: Detalle, Fases, Fotos, Historial, Inspección |
| `/dashboard/tickets/[id]/inspeccion` | `inspeccion/page.tsx` | coordinador(2)+ | Checklist 25 ítems |
| `/dashboard/tickets/[id]/inspeccion/view` | `view/page.tsx` | coordinador(2)+ | Vista imprimible inspección |
| `/dashboard/tickets/[id]/comprobante` | `comprobante/page.tsx` | coordinador(2)+ | Comprobante PDF |
| `/dashboard/pipeline` | `pipeline/page.tsx` | todos | Board completo, técnico ve solo los suyos |
| `/dashboard/configuracion` | `configuracion/page.tsx` | gerente(3)+ / editar: vp(4)+ | 14 parámetros del sistema |
| `/dashboard/usuarios` | `usuarios/page.tsx` | gerente(3)+ | Grid de cards de usuarios |
| `/dashboard/usuarios/nuevo` | `nuevo/page.tsx` | gerente(3)+ | Formulario creación usuario |
| `/dashboard/usuarios/[id]` | `[id]/page.tsx` | gerente(3)+ o propio | 3 tabs: Perfil, Tickets, Rendimiento |
| `/dashboard/reportes` | `reportes/page.tsx` | coordinador(2)+ | 4 KPIs, distribución estado, TechnicianStatsTable interactiva, gráfico mensual |
| `/dashboard/pagos` | `pagos/page.tsx` | coordinador(2)+ | Tabla pagos con filtros avanzados y export CSV |
| `/dashboard/pagos/cuadro` | `pagos/cuadro/page.tsx` | gerente(3)+ | Cuadro de pagos agrupado por técnico, print-friendly |
| `/dashboard/clientes` | `clientes/page.tsx` | coordinador(2)+ (clients:view) | CRUD clientes con panel lateral de detalle |

**Loading skeletons** (`loading.tsx`): dashboard, tickets, tickets/[id], pipeline, configuracion, reportes, pagos, usuarios

---

## 8. Todos los Archivos del Proyecto

### app/ (rutas Next.js)

```
app/
├── globals.css                          → Estilos globales, design system, animaciones CSS
├── layout.tsx                           → Root layout con fuentes
├── login/page.tsx                       → Página de login
├── middleware.ts                        → Auth guard (Next.js middleware)
└── dashboard/
    ├── layout.tsx                       → Auth check + DashboardLayoutClient
    ├── layout-client.tsx                → Sidebar + Header layout (sidebarCollapsed controlado)
    ├── loading.tsx                      → Skeleton dashboard
    ├── page.tsx                         → Dashboard principal (KPIs, charts, pipeline widget)
    ├── tickets/
    │   ├── loading.tsx
    │   ├── page.tsx                     → Lista tickets (mobile cards técnico / tabla otros)
    │   ├── tickets-filters.tsx          → Filtros de búsqueda (client component)
    │   ├── tickets-table.tsx            → Tabla paginada (server component)
    │   ├── nuevo/
    │   │   ├── page.tsx
    │   │   └── create-ticket-form.tsx   → Formulario nuevo ticket (RHF+Zod)
    │   └── [id]/
    │       ├── loading.tsx
    │       ├── page.tsx                 → Detail page (fetch paralelo)
    │       ├── ticket-details.tsx       → Header del ticket con badges y acciones
    │       ├── ticket-detail-tabs.tsx   → 5 tabs: Detalle/Fases/Fotos/Historial/Inspección
    │       ├── ticket-status-actions.tsx → Wizard de cambio de estado
    │       ├── inspeccion/
    │       │   ├── page.tsx
    │       │   └── view/page.tsx
    │       └── comprobante/
    │           ├── page.tsx
    │           └── comprobante-view.tsx
    ├── pipeline/
    │   ├── loading.tsx
    │   └── page.tsx                     → Board completo 4 columnas + filtros técnico/prioridad
    ├── configuracion/
    │   ├── loading.tsx
    │   └── page.tsx                     → Config del sistema (14 parámetros, 3 secciones)
    ├── usuarios/
    │   ├── loading.tsx
    │   ├── page.tsx                     → Grid cards usuarios
    │   ├── nuevo/
    │   │   ├── page.tsx
    │   │   └── nuevo-usuario-form.tsx
    │   └── [id]/
    │       └── page.tsx                 → Perfil usuario (3 tabs: Perfil/Tickets/Rendimiento)
    ├── reportes/
    │   ├── loading.tsx
    │   ├── page.tsx                     → 4 KPIs + distribución + tabla técnicos + gráfico mensual
    │   └── report-export-button.tsx     → Botón export CSV reportes
    ├── pagos/
    │   ├── loading.tsx
    │   ├── page.tsx
    │   ├── pagos-client.tsx             → Client con filtros, paginación, modal de pago
    │   └── cuadro/
    │       └── page.tsx                 → Cuadro de pagos por técnico (print-friendly) ← Sprint 7
    └── clientes/
        └── page.tsx                     → CRUD clientes (tabla + panel detalle lateral) ← Sprint 7
```

### components/ (componentes reutilizables)

```
components/
├── glass-provider.tsx                   → Provider de glass morphism
├── ui/                                  → Primitivos Radix UI
│   ├── alert-dialog.tsx
│   ├── avatar.tsx
│   ├── badge.tsx
│   ├── back-button.tsx                  → Reutilizable: router.back() o router.push(href) ← Sprint 6
│   ├── button.tsx                       → primary variant: sky-600 (desde Sprint 6)
│   ├── card.tsx                         → Acepta variant="glass"
│   ├── checkbox.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── popover.tsx
│   ├── select.tsx
│   ├── tabs.tsx
│   ├── textarea.tsx
│   └── index.ts
├── layout/
│   ├── header.tsx                       → Header con hamburger móvil
│   ├── sidebar.tsx                      → Sidebar con collapsed controlado + Pipeline nav
│   └── index.ts
├── dashboard/
│   ├── activity-feed.tsx                → Feed de actividad reciente
│   ├── dashboard-shell.tsx
│   ├── kpi-card.tsx                     → Card KPI con contador animado
│   ├── pipeline-board.tsx               → Widget del dashboard (máx 5 cards/col)
│   ├── status-distribution-chart.tsx    → Donut chart por estado
│   ├── technician-performance-chart.tsx → Bar chart rendimiento técnicos
│   └── tickets-by-month-chart.tsx       → Line chart últimos 6 meses
├── tickets/
│   ├── technician-mobile-card.tsx       → Card móvil con borde de color por estado ← Sprint 5
│   ├── technician-mobile-list.tsx       → Lista con pills de filtro estado ← Sprint 5
│   ├── ticket-fases-list.tsx            → Lista de fases del proyecto
│   ├── ticket-fotos-grid.tsx            → Grid de fotos en tab
│   ├── ticket-status-changer.tsx        → Wizard de cambio de estado
│   ├── tickets-table-rows.tsx           → Client component: filas clickeables + stopPropagation ← Sprint 6
│   └── update-log-panel.tsx             → Timeline de notas UpdateLog (textarea + lista) ← Sprint 6
├── fotos/
│   ├── foto-edit-dialog.tsx
│   ├── foto-upload-dialog.tsx
│   └── fotos-gallery.tsx                → Autónomo: carga sus propias fotos con ticketId
├── inspecciones/
│   ├── inspeccion-form.tsx              → Checklist 25 ítems, 5 categorías
│   └── inspeccion-view.tsx              → Vista imprimible
├── pagos/
│   ├── pagos-filters.tsx                → Filtros avanzados + export CSV
│   ├── payment-dialog.tsx               → Modal procesar pago
│   └── pending-payments-list.tsx
├── usuarios/
│   └── profile-edit-dialog.tsx          → Editar foto de perfil + campos
├── pipeline/                            ← Sprint 5
│   ├── pipeline-filters.tsx             → Select técnico + prioridad (client)
│   └── pipeline-page-board.tsx          → Board completo + SLA warning
├── configuracion/                       ← Sprint 5
│   ├── config-edit-dialog.tsx           → Dialog edición (boolean/number/string)
│   ├── config-section.tsx               → Sección agrupada de configuraciones
│   └── config-skeleton.tsx              → Skeleton loading
├── reportes/                            ← Sprint 6
│   └── technician-stats-table.tsx       → Tabla técnicos con panel detalle expandible (TechnicianKPI[])
├── clientes/                            ← Sprint 7
│   ├── clientes-client.tsx              → Tabla + panel lateral detalle
│   └── cliente-form-dialog.tsx          → Dialog crear/editar con Zod+RHF
└── pagos/                               ← Sprint 7
    └── cuadro-pagos.tsx                 → Cuadro agrupado por técnico, print-friendly, export CSV
```

### lib/ (lógica, datos, utilidades)

```
lib/
├── local-mode.ts                        → isLocalMode(), DEMO_SESSION_COOKIE
├── mock-data.ts                         → Store demo completo en memoria
│   Exporta: getDemoUsers(), getDemoTickets(), getDemoPayments(),
│            getDemoFases(), getDemoFotos(), getDemoSessions(),
│            getDemoInspecciones(), getDemoConfig(), updateDemoConfig(),
│            getDemoUpdateLogs(), addDemoUpdateLog()               ← Sprint 6
│            + funciones de mutación demo (createDemo*, updateDemo*, etc.)
├── utils.ts (o utils/index.ts)          → cn(), formatCurrency(), formatRelativeTime(), getInitials()
├── utils/
│   └── csv-export.ts                    → generatePaymentsCSV(), downloadCSV()
├── validations/
│   └── index.ts                         → Schemas Zod (LoginSchema, TicketCreateSchema, etc.)
├── supabase/
│   ├── client.ts                        → createBrowserClient()
│   ├── server.ts                        → createClient() (server)
│   └── middleware.ts                    → updateSession()
└── actions/
    ├── auth.ts                          → loginAction(), getCurrentUser(), logoutAction()
    ├── tickets.ts                       → getTickets(), getTicketById(), createTicket(),
    │                                      updateTicket(), changeTicketStatus() (bidireccional ← S6),
    │                                      assignTicket(), deleteTicket(), updateTicketFromTecnico(),
    │                                      getTicketUpdateLogs(), addTicketUpdateLog()  ← Sprint 6
    ├── dashboard.ts                     → getDashboardStats(), getEnhancedDashboardStats(),
    │                                      getTechnicianStats()
    ├── fotos.ts                         → uploadTicketFoto(), getTicketFotos(),
    │                                      deleteTicketFoto(), updateTicketFoto()
    ├── inspecciones.ts                  → getInspeccionByTicket(), createInspeccion(),
    │                                      updateInspeccion(), completarInspeccion()
    ├── fases.ts                         → getFasesByTicket(), createFase(),
    │                                      updateFase(), deleteFase()
    ├── pagos.ts                         → processPaymentAction(), generatePaymentSchedule() ← Sprint 7
    ├── clientes.ts                      → getClientes(), getClienteById(), createCliente(),  ← Sprint 7
    │                                      updateCliente(), deleteCliente(), searchClientes()
    ├── usuarios.ts                      → getAllUsers()*, getUserById(), createUser(),
    │                                      updateUserProfile(), uploadProfilePhoto()
    │                                      (* sin isLocalMode branch — ver nota crítica)
    ├── configuracion.ts                 → getConfiguracion(), updateConfigValue() ← Sprint 5
    └── index.ts                         → re-exports de auth + tickets
```

---

## 9. Tipos Principales (types/index.ts)

### Tipos base
```typescript
type UserRole = 'tecnico' | 'coordinador' | 'gerente' | 'vicepresidente' | 'presidente'
type TicketStatus = 'asignado' | 'iniciado' | 'en_progreso' | 'finalizado' | 'cancelado'
type TicketPriority = 'baja' | 'media' | 'alta' | 'urgente'
type TicketType = 'servicio' | 'proyecto'
type FaseEstado = 'pendiente' | 'en_progreso' | 'completada' | 'cancelada'
type TipoFoto = 'progreso' | 'inspeccion' | 'documento' | 'antes' | 'despues'
type InspeccionEstado = 'borrador' | 'completada' | 'reportada'
```

### Interfaces clave
```typescript
interface User { id, nombre, apellido, email, rol, nivel_jerarquico, telefono, cedula, estado, created_at, updated_at }
interface UserProfile extends User { foto_perfil_path, especialidad, activo_desde, foto_perfil_url? }
interface Ticket { id, numero_ticket, tipo, asunto, descripcion, cliente_nombre, cliente_email,
                   cliente_telefono, estado, prioridad, origen, monto_servicio, porcentaje_comision,
                   tiempo_estimado_horas, tecnico_id, tecnico?, asignado_por, created_at, updated_at,
                   fases?, historial_cambios? }
interface SystemConfig { id, clave, valor, descripcion, tipo_dato: 'string'|'number'|'boolean'|'json', updated_at }
interface ActionResponse<T> { success: boolean, data?: T, error?: string, message?: string }
interface PaginatedResponse<T> { data: T[], total, page, pageSize, totalPages }
// PaginatedResponse usa .data[] NO .items[]

// ChecklistItem — CRÍTICO: no usar campos de V0 (cumple/observacion/item)
interface ChecklistItem { id, categoria, descripcion, aplica, estado: 'ok'|'falla'|'pendiente'|'na', notas, foto_ids }
```

### Constantes exportadas
```typescript
ROLE_HIERARCHY: Record<UserRole, number>    // tecnico=1..presidente=5
VALID_TRANSITIONS: Record<TicketStatus, TicketStatus[]>   // máquina de estados (forward)
ADMIN_REVERSE_TRANSITIONS: Record<TicketStatus, TicketStatus[]>  // reverso para gerente+ ← Sprint 6
STATUS_LABELS, STATUS_COLORS                // para badges/UI
PRIORITY_LABELS, PRIORITY_COLORS
ROLE_LABELS
DEFAULT_COMMISSION_PERCENTAGE              // 50

// UpdateLog (Sprint 6)
interface UpdateLog { id, ticket_id, autor_id, contenido, tipo: 'nota'|'cambio_estado', created_at, autor? }
```

---

## 10. Patrón de Server Actions

```typescript
"use server"

export async function actionName(input: InputType): Promise<ActionResponse<OutputType>> {
  // 1. Auth
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "No autenticado" }

  // 2. Permisos (elegir uno)
  if (ROLE_HIERARCHY[user.rol] < 2) return { success: false, error: "Sin permisos" }
  if (!hasPermission(user.rol, 'permission:name')) return { success: false, error: "Sin permisos" }

  // 3. Local mode
  if (isLocalMode()) {
    const data = getDemoXxx()
    revalidatePath("/dashboard/ruta")      // solo en mutaciones
    return { success: true, data, message: "Operación exitosa" }
  }

  // 4. Supabase
  const supabase = await createClient()
  const { data, error } = await supabase.from("tabla").select("*")
  if (error) return { success: false, error: error.message }
  revalidatePath("/dashboard/ruta")        // solo en mutaciones
  return { success: true, data }
}
```

---

## 11. Design System

### Glass morphism
```
Cards:    bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl
Dialogs:  bg-[#0f1729]/95 backdrop-blur-2xl border border-white/20   (Sprint 6: neutro, no azul eléctrico)
Stat:     bg-white/[0.04] con glow overlay de color
```

### Colores base (CSS variables) — Sprint 6
```
--background: cuerpo oscuro #0d1a2e→#111827→#0a1628 (slate/navy)
--primary:    199 89% 48%   → sky-500 #0ea5e9  (antes era blue #2F54E0)
Sidebar:      bg-[#111827]  (gray-900, antes #0e2f6f azul eléctrico)
Fuentes: Space Grotesk (heading), Inter (body)
```

### Componente Card
```tsx
<Card variant="glass">  // glass morphism
<Card>                  // card estándar
```

### Animaciones disponibles (NO framer-motion)
```css
/* Clases de animación (definidas en globals.css): */
animate-fade-in        /* 0.35s ease-out */
animate-slide-up       /* 0.4s ease-out */
animate-scale-in       /* 0.22s ease-out */
animate-bounce-in      /* 0.45s cubic-bezier */
animate-count-up       /* 0.5s para números */
animate-spin-slow      /* rotación lenta */
animate-pulse-glow     /* brillo pulsante */

/* Stagger delays: */
stagger-1 (50ms) ... stagger-6 (300ms)
```

### Clases móvil (Sprint 5)
```css
mobile-ticket-card                        /* card con borde izquierdo */
mobile-ticket-card-asignado               /* borde azul */
mobile-ticket-card-iniciado               /* borde amarillo */
mobile-ticket-card-en_progreso            /* borde púrpura */
mobile-ticket-card-finalizado             /* borde verde */
mobile-ticket-card-cancelado              /* borde rojo */
status-pills-bar                          /* scroll horizontal sin scrollbar */
```

### Skeleton loading
```css
.skeleton        /* base pulse con shimmer */
.skeleton-text, .skeleton-title, .skeleton-avatar, .skeleton-card
```

### Layout helpers
```css
.page-container      /* p-4 md:p-6 lg:p-8 */
.page-header         /* flex col→row responsive */
.page-title          /* heading principal */
.page-description    /* subtítulo */
```

### Dialogs responsivos (Sprint 7)
```tsx
// Para dialogs con mucho contenido — evitar overflow en móvil:
<DialogContent className="max-h-[90dvh] flex flex-col overflow-hidden">
  <DialogHeader />
  <div className="flex-1 overflow-y-auto px-6 pb-6">
    {/* contenido scrollable */}
  </div>
</DialogContent>
// dvh (dynamic viewport height) = mejor que vh en móvil por barra del navegador
```

### Print styles (Sprint 7 — Cuadro de Pagos)
```tsx
// Clases print-friendly en cuadro-pagos.tsx:
className="print:hidden"    // ocultar en impresión (filtros, botones)
className="print:block"     // mostrar solo en impresión (título con logo)
className="print:text-black print:bg-white"  // invertir colores para papel
```

### Sidebar nav
```tsx
// Clases para links activos
className={cn("sidebar-nav-item", active && "active")}
// Sidebar recibe props controladas desde Sprint 5:
<Sidebar collapsed={bool} onCollapsedChange={fn} />
```

---

## 12. Configuración del Sistema (Sprint 5)

14 parámetros en 3 grupos:

| Clave | Tipo | Default | Grupo |
|-------|------|---------|-------|
| empresa_nombre | string | COPS Electronics | empresa |
| empresa_rif | string | J-12345678-9 | empresa |
| empresa_telefono | string | +58 212 000 0000 | empresa |
| empresa_email | string | ops@copselectronics.com | empresa |
| empresa_direccion | string | Caracas, Venezuela | empresa |
| logo_url | string | (vacío) | empresa |
| ticket_tiempo_respuesta_horas | number | 24 | tickets |
| ticket_tiempo_resolucion_horas | number | 72 | tickets |
| ticket_monto_servicio_default | number | 40 | tickets |
| comision_porcentaje_default | number | 50 | tickets |
| inspeccion_requerida | boolean | false | tickets |
| notif_email_nuevo_ticket | boolean | true | notif |
| notif_email_cambio_estado | boolean | true | notif |
| notif_slack_webhook | string | (vacío) | notif |

---

## 13. Variables de Entorno

```bash
# apps/tickets
TICKETS_LOCAL_MODE=true                   # activa modo demo sin Supabase
NEXT_PUBLIC_TICKETS_LOCAL_MODE=true       # pista para client components
TICKETS_DEMO_EMAIL=admin@copselectronics.com
TICKETS_DEMO_PASSWORD=admin123
NEXT_PUBLIC_SUPABASE_URL=...              # solo modo real
NEXT_PUBLIC_SUPABASE_ANON_KEY=...        # solo modo real

# apps/web
NEXT_PUBLIC_TICKETS_APP_URL=http://localhost:3002
NEXT_PUBLIC_PLATFORM_COTIZACIONES_URL=http://localhost:3001
```

---

## 14. Gotchas y Notas Críticas

| Problema | Solución |
|----------|----------|
| `getAllUsers()` no funciona en local mode | Usar `isLocalMode() ? getDemoUsers() : (await getAllUsers()).data ?? []` |
| `PaginatedResponse` usa `.data[]` no `.items[]` | `result.data?.data ?? []` |
| V0 genera `ChecklistItem` con `cumple/observacion/item` | Adaptar a `estado/notas/descripcion` |
| Lucide icons no aceptan prop `title` | Envolver en `<span title="...">` |
| En Windows, heredocs de bash no funcionan | Usar `node -e "..."` para crear archivos |
| `downloadCSV` está en `csv-export` no en `utils` | `import { downloadCSV } from "@/lib/utils/csv-export"` |
| `useToast` es wrapper sobre sonner | `import { toast } from "sonner"` directamente o el wrapper en `hooks/use-toast.ts` |
| Hacer commits desde raíz del monorepo | `git -C "ruta/al/repo" add .` |
| TypeScript strict — verificar siempre | `npx tsc --noEmit` antes de commit |

---

## 15. Sprint 6 — Patrones Nuevos

### Estados Bidireccionales (gerente+ puede revertir)
```typescript
// En ticket-status-actions.tsx:
const canRevert = ROLE_HIERARCHY[userRole] >= 3
const reverseTransitions = ADMIN_REVERSE_TRANSITIONS[ticket.estado]
// Botones de reverso con estilo orange-300/70

// En changeTicketStatus():
const isAdmin = ROLE_HIERARCHY[currentUser.rol] >= 3
const forwardOk = VALID_TRANSITIONS[ticket.estado].includes(newStatus)
const reverseOk = isAdmin && ADMIN_REVERSE_TRANSITIONS[ticket.estado].includes(newStatus)
```

### Timeline UpdateLog
```typescript
// ticket-detail-tabs.tsx recibe:
updateLogs?: UpdateLog[]
userRole?: string
// UpdateLogPanel muestra textarea solo si canAdd && ticket activo
// addTicketUpdateLog(ticketId, contenido) — server action
```

### BackButton
```tsx
import { BackButton } from "@/components/ui/back-button"
<BackButton />                          // usa router.back()
<BackButton href="/dashboard/tickets" /> // push a ruta específica
```

### Wizard Materiales Toggle (ticket-status-actions.tsx)
```tsx
// Paso 1 del wizard tiene toggle "¿Se utilizaron materiales?"
// Si usedMaterials=false → materiales_usados=[]
// Si usedMaterials=true → muestra tabla de materiales
```

---

## 16. Sprint 7 — Nuevos Tipos e Interfaces

```typescript
interface Cliente { id, nombre, apellido?, empresa?, email?, telefono, direccion,
                    rif_cedula?, estado: 'activo'|'inactivo', observaciones?, created_at, updated_at,
                    tickets_count?, ultimo_ticket_fecha? }
interface ClienteCreateInput { nombre, apellido?, empresa?, email?, telefono, direccion, rif_cedula?, observaciones? }
interface PaymentScheduleRow { fecha_finalizacion, ticket_numero, cliente_nombre, cliente_empresa,
                               descripcion, monto_servicio, porcentaje_comision, monto_a_pagar,
                               estado_pago, metodo_pago, referencia_pago }
interface TechnicianPaymentSchedule { tecnico: User, rows: PaymentScheduleRow[], total: number, pendiente: number }
interface PaymentScheduleReport { periodo: {...}, tecnicos: TechnicianPaymentSchedule[], grandTotal: number }
```

### Sprint 7 — Nuevos campos en Ticket (Sprint 8)
```typescript
// Ticket ahora incluye (opcionales):
numero_carta: string | null        // solo cuando origen === 'carta_aceptacion'
tipo_mantenimiento: 'correctivo' | 'preventivo' | null   // solo cuando tipo === 'servicio'
```

### Sprint 7 — Clientes DB (mock-data)
```typescript
// Funciones disponibles en lib/mock-data.ts:
getDemoClientes(options?), getDemoClienteById(id), createDemoCliente(input),
updateDemoCliente(id, input), deleteDemoCliente(id), searchDemoClientes(query)
```

### Sprint 8 — Permisos corregidos
```typescript
// gerente ahora tiene config:view (antes solo vicepresidente+)
// Sidebar muestra Configuración para gerente(3)+
```

### Sprint 8 — Formulario Nuevo Ticket
- **Selector de cliente**: busca en `searchClientes(query)`, auto-rellena campos (editables)
- **Tipo de servicio**: Select Correctivo/Preventivo — visible solo cuando tipo === "servicio"
- **Número de carta**: Input opcional — visible solo cuando origen === "carta_aceptacion"
- **Notas para el Técnico**: reemplaza "Requerimientos Técnicos", ahora opcional

---

## 17. Alcance Futuro — Sprint 9+

| Feature | Complejidad |
|---------|-------------|
| Catálogo materiales / cotizaciones integradas | Alta — bridge entre apps separadas |
| Vinculación proyecto-cotización | Alta |
| Tabs Equipos/Materiales en ticket detail | Media |
| Notificaciones para presidente | Media — Supabase realtime o polling |
| Calendario dinámico de servicios | Alta |
| Sección Mantenimiento (/dashboard/mantenimientos) | Media |
| error.tsx granular por ruta | Baja |
| Drag & drop en pipeline | Media |
| Tests (Vitest/Playwright) | Media |
