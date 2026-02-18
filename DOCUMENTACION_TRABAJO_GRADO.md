# DOCUMENTACIÓN TÉCNICA — COPS Platform
## Sistema de Gestión de Tickets y Servicios Técnicos
### COPS Electronics, C.A.

> **Para**: Defensa de Trabajo de Grado
> **Nivel de detalle**: Técnico pero explicable a evaluadores
> **Fecha**: Febrero 2026

---

## ÍNDICE

1. [Visión General del Sistema](#1-visión-general-del-sistema)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Estructura del Proyecto](#3-estructura-del-proyecto)
4. [Arquitectura de la Aplicación](#4-arquitectura-de-la-aplicación)
5. [Base de Datos y Tipos](#5-base-de-datos-y-tipos)
6. [Sistema de Autenticación y Control de Acceso (RBAC)](#6-sistema-de-autenticación-y-control-de-acceso-rbac)
7. [Módulo de Tickets](#7-módulo-de-tickets)
8. [Sistema de Fases para Proyectos](#8-sistema-de-fases-para-proyectos)
9. [Módulo de Pagos a Técnicos](#9-módulo-de-pagos-a-técnicos)
10. [Comprobante de Servicio](#10-comprobante-de-servicio)
11. [Gestión de Usuarios](#11-gestión-de-usuarios)
12. [Dashboard y KPIs](#12-dashboard-y-kpis)
13. [Modo Local (Demo)](#13-modo-local-demo)
14. [Flujo de Datos End-to-End](#14-flujo-de-datos-end-to-end)
15. [Patrones de Diseño Utilizados](#15-patrones-de-diseño-utilizados)
16. [Rutas del Sistema](#16-rutas-del-sistema)

---

## 1. Visión General del Sistema

**COPS Platform** es una aplicación web de gestión de servicios técnicos diseñada para **COPS Electronics, C.A.** La plataforma permite:

- Crear y gestionar **tickets de servicio y proyectos** de instalación/mantenimiento
- Asignar técnicos a trabajos y hacer seguimiento del progreso en tiempo real
- Registrar materiales, tiempo trabajado y solución aplicada al finalizar
- Emitir **comprobantes de servicio** oficiales para el cliente
- Gestionar el **pago a técnicos** por comisiones de servicio
- Controlar el acceso por **jerarquía de roles** (5 niveles)

---

## 2. Stack Tecnológico

| Categoría | Tecnología | Versión | Por qué se usa |
|---|---|---|---|
| Framework web | **Next.js** | 16 (App Router) | Full-stack React con Server Components y routing basado en archivos |
| Lenguaje | **TypeScript** | 5 | Tipado estático que previene errores en tiempo de compilación |
| Base de datos | **Supabase** (PostgreSQL) | — | BaaS con autenticación, RLS y API REST automática |
| ORM/Cliente DB | **Supabase JS Client** | 2 | Cliente tipado para queries a PostgreSQL |
| Estilos | **Tailwind CSS** | 3 | Utilidades CSS sin hojas de estilo separadas |
| Componentes UI | **Radix UI** | — | Componentes accesibles sin estilos (headless) |
| Formularios | **React Hook Form** | — | Gestión de estado de formularios de alto rendimiento |
| Validación | **Zod** | 3 | Schemas de validación con tipado TypeScript automático |
| Notificaciones | **Sonner** | — | Toasts animados para feedback del usuario |
| Íconos | **Lucide React** | — | Biblioteca de íconos SVG |
| Monorepo | **pnpm workspaces** | — | Un solo repositorio con múltiples aplicaciones |

---

## 3. Estructura del Proyecto

```
cops-platform/
└── cops-platform/
    ├── apps/
    │   └── tickets/                    ← APLICACIÓN PRINCIPAL
    │       ├── app/                    ← Next.js App Router (páginas y rutas)
    │       │   ├── (auth)/             ← Grupo de rutas: Login
    │       │   │   └── login/
    │       │   │       └── page.tsx    ← Página de inicio de sesión
    │       │   └── dashboard/          ← Área protegida (requiere autenticación)
    │       │       ├── layout.tsx      ← Layout del dashboard (sidebar + topbar)
    │       │       ├── page.tsx        ← Dashboard principal con KPIs
    │       │       ├── tickets/        ← Módulo de tickets
    │       │       │   ├── page.tsx    ← Lista de todos los tickets
    │       │       │   ├── nuevo/      ← Crear ticket nuevo
    │       │       │   └── [id]/       ← Detalle de ticket (ruta dinámica)
    │       │       │       ├── page.tsx
    │       │       │       ├── ticket-detail-tabs.tsx
    │       │       │       ├── ticket-details.tsx
    │       │       │       ├── ticket-status-actions.tsx
    │       │       │       └── comprobante/        ← NUEVO Sprint 2
    │       │       │           ├── page.tsx
    │       │       │           └── comprobante-view.tsx
    │       │       ├── pagos/          ← Módulo de pagos
    │       │       │   └── page.tsx
    │       │       └── usuarios/       ← Gestión de usuarios
    │       │           ├── page.tsx    ← Lista de usuarios
    │       │           └── nuevo/      ← NUEVO Sprint 2
    │       │               ├── page.tsx
    │       │               └── nuevo-usuario-form.tsx
    │       ├── components/             ← Componentes reutilizables
    │       │   ├── ui/                 ← Componentes base (botones, inputs, cards)
    │       │   ├── layout/             ← Sidebar, topbar, mobile-nav
    │       │   ├── dashboard/          ← KPI cards, charts
    │       │   ├── tickets/            ← Componentes específicos de tickets
    │       │   │   └── ticket-fases-list.tsx   ← NUEVO Sprint 2
    │       │   └── pagos/              ← Componentes de pagos
    │       │       ├── payment-dialog.tsx      ← NUEVO Sprint 2
    │       │       └── pending-payments-list.tsx ← NUEVO Sprint 2
    │       ├── lib/                    ← Lógica de negocio
    │       │   ├── actions/            ← Server Actions (operaciones en servidor)
    │       │   │   ├── auth.ts         ← Login, logout, registro
    │       │   │   ├── tickets.ts      ← CRUD de tickets + historial
    │       │   │   ├── fases.ts        ← NUEVO Sprint 2: CRUD de fases
    │       │   │   └── pagos.ts        ← NUEVO Sprint 2: procesar pagos
    │       │   ├── supabase/           ← Configuración del cliente Supabase
    │       │   │   ├── client.ts       ← Cliente para componentes Client
    │       │   │   └── server.ts       ← Cliente para Server Components
    │       │   ├── utils/              ← Funciones de utilidad (formateo, etc.)
    │       │   │   └── index.ts
    │       │   ├── validations/        ← Schemas Zod de validación
    │       │   │   └── index.ts
    │       │   ├── mock-data.ts        ← Datos de demostración en memoria
    │       │   └── local-mode.ts       ← Detección del modo demo
    │       ├── types/                  ← Definiciones de tipos TypeScript
    │       │   └── index.ts
    │       ├── supabase/               ← Schema SQL de la base de datos
    │       │   └── schema.sql
    │       └── public/                 ← Archivos estáticos
    └── packages/                       ← Paquetes compartidos del monorepo
```

---

## 4. Arquitectura de la Aplicación

### 4.1 El modelo de Next.js App Router

Next.js App Router introduce dos tipos de componentes que trabajan juntos:

#### Server Components (Componentes de Servidor)
- **Se ejecutan en el servidor**, nunca en el navegador del usuario
- Pueden acceder directamente a la base de datos, cookies y variables de entorno secretas
- **NO** pueden manejar eventos del usuario (onClick, onChange, etc.)
- **NO** pueden usar hooks de React (useState, useEffect)
- Son la **opción por defecto** en Next.js 16 — cualquier archivo sin `"use client"` es un Server Component

```typescript
// apps/tickets/app/dashboard/tickets/[id]/page.tsx
// Este es un Server Component — ejecuta en el servidor
export default async function TicketDetailPage({ params }) {
  const user = await getCurrentUser()      // Lee cookies del servidor
  const ticket = await getTicketById(id)   // Consulta la base de datos

  return <TicketDetailTabs ticket={ticket} /> // Renderiza HTML y lo envía al browser
}
```

#### Client Components (Componentes de Cliente)
- Se marcan con `"use client"` en la **primera línea** del archivo
- Se ejecutan en el navegador del usuario
- Pueden usar hooks (useState, useEffect) y manejar eventos
- **No pueden** acceder directamente a la base de datos

```typescript
// apps/tickets/app/dashboard/tickets/[id]/ticket-detail-tabs.tsx
"use client"   // ← Esta directiva los convierte en Client Components

export function TicketDetailTabs({ ticket, fases }) {
  const [tabActiva, setTabActiva] = useState("detalle")   // ✓ useState permitido
  return <Tabs onValueChange={setTabActiva}>...</Tabs>    // ✓ eventos permitidos
}
```

#### Regla crítica: Server → Client boundary
Un Server Component **puede pasar datos** a un Client Component, pero **NO puede pasar funciones** ni componentes como si fueran datos. Solo puede pasar datos serializables (strings, números, objetos planos, arrays).

```typescript
// ✗ INCORRECTO — funciones no son serializables
<KpiCard icon={Ticket} formatValue={(v) => `$${v}`} />

// ✓ CORRECTO — JSX pre-renderizado y string formateado
<KpiCard icon={<Ticket className="h-6 w-6" />} displayValue="$1,234" />
```

### 4.2 Fetch paralelo con Promise.all

Para no "anidar" las peticiones a la base de datos (waterfall), se usan fetches paralelos:

```typescript
// apps/tickets/app/dashboard/tickets/[id]/page.tsx
// Sin Promise.all: fases esperaría a que historial termine → más lento
// Con Promise.all: ambos se ejecutan al mismo tiempo → más rápido

const [fasesResult, historialResult] = await Promise.all([
  ticket.tipo === "proyecto"
    ? getFasesByTicket(id)
    : Promise.resolve({ success: true, data: [] }),  // no hace fetch innecesario
  getTicketHistory(id),
])
```

### 4.3 Server Actions

Los **Server Actions** son funciones marcadas con `"use server"` que el browser puede llamar directamente, pero que se ejecutan en el servidor. Son el mecanismo de Next.js para hacer mutaciones (crear, actualizar, eliminar datos) sin necesidad de crear una API REST manualmente.

```typescript
// libs/actions/tickets.ts
"use server"

export async function changeTicketStatus(
  ticketId: string,
  nuevoEstado: TicketStatus
): Promise<ActionResponse<Ticket>> {
  // Este código SIEMPRE ejecuta en el servidor, aunque lo llame un componente del browser
  const supabase = await createClient()
  const { data } = await supabase
    .from("tickets")
    .update({ estado: nuevoEstado })
    .eq("id", ticketId)
  // ...
}
```

**Desde el componente cliente se llama así:**
```typescript
// ticket-status-actions.tsx (Client Component)
const result = await changeTicketStatus(ticket.id, "finalizado")
// El browser envía una petición HTTP al servidor, ejecuta la función, devuelve el resultado
```

---

## 5. Base de Datos y Tipos

### 5.1 Tablas principales en Supabase (PostgreSQL)

| Tabla | Propósito | Archivo de tipos |
|---|---|---|
| `users` | Usuarios del sistema con roles | `types/index.ts → User` |
| `tickets` | Tickets de servicio y proyectos | `types/index.ts → Ticket` |
| `ticket_fases` | Fases/hitos de proyectos | `types/index.ts → TicketFase` |
| `pagos_tecnicos` | Registro de pagos por comisión | `types/index.ts → TechnicianPayment` |
| `historial_cambios` | Auditoría de cambios en tickets | `types/index.ts → ChangeHistory` |

### 5.2 El archivo de tipos: `types/index.ts`

Este archivo centraliza **todas las definiciones de tipos** del sistema. Es fundamental porque TypeScript usa estos tipos para:
1. Detectar errores en tiempo de compilación (antes de ejecutar el código)
2. Proporcionar autocompletado en el editor
3. Documentar la estructura de cada entidad

**Ejemplo del tipo Ticket:**
```typescript
export interface Ticket {
  id: string                          // UUID generado por Supabase
  numero_ticket: string               // Ej: "TKT-2026-0001"
  tipo: TicketType                    // "servicio" | "proyecto"

  // Datos del cliente
  cliente_nombre: string
  cliente_empresa: string | null      // null = campo vacío
  cliente_telefono: string
  cliente_direccion: string

  // Datos técnicos (se llenan al finalizar)
  materiales_usados: MaterialItem[] | null
  tiempo_trabajado: number | null     // en minutos
  solucion_aplicada: string | null

  // Relaciones (JOIN de otras tablas)
  tecnico?: User                      // El ? significa "puede no estar presente"
  creador?: User
}
```

### 5.3 Row Level Security (RLS) en Supabase

Supabase permite definir **políticas de seguridad directamente en la base de datos**. Así, aunque alguien acceda a la API de Supabase directamente, las políticas garantizan que solo vea los datos que le corresponden.

```sql
-- Solo técnicos ven sus propios tickets
CREATE POLICY "tecnico_sees_own_tickets" ON tickets
  FOR SELECT USING (
    auth.uid() = tecnico_id
    OR nivel_jerarquico >= 3  -- gerentes ven todos
  );
```

---

## 6. Sistema de Autenticación y Control de Acceso (RBAC)

**RBAC** = Role-Based Access Control (Control de Acceso Basado en Roles)

### 6.1 Los 5 roles del sistema

```typescript
// types/index.ts
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  tecnico:        1,    // Ve y trabaja sus tickets asignados
  coordinador:    2,    // Ve todos, asigna técnicos, lee comprobantes
  gerente:        3,    // Crea usuarios, gestiona fases, procesa pagos
  vicepresidente: 4,    // Acceso total más configuración del sistema
  presidente:     5,    // Acceso total
}
```

### 6.2 Cómo se aplica en cada capa

**En Server Actions** (capa de negocio):
```typescript
// lib/actions/fases.ts
export async function createFase(input) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }

  if (ROLE_HIERARCHY[currentUser.rol] < 3) {  // Mínimo: gerente
    return { success: false, error: "Sin permisos" }
  }
  // ... lógica de negocio
}
```

**En páginas** (capa de presentación):
```typescript
// app/dashboard/tickets/[id]/page.tsx
const canEdit = ROLE_HIERARCHY[user.rol] >= 3           // gerente+
const canChangeStatus = user.rol === "tecnico"
  ? ticket.tecnico_id === user.id                       // técnico: solo sus tickets
  : ROLE_HIERARCHY[user.rol] >= 3                       // gerente+: todos
const canViewComprobante = ticket.estado === "finalizado"
  && ROLE_HIERARCHY[user.rol] >= 2                      // coordinador+
```

### 6.3 Flujo de autenticación

```
1. Usuario ingresa email y contraseña en /login
2. loginAction() llama a Supabase Auth → verifica credenciales
3. Supabase devuelve JWT (token de sesión)
4. getUser() en Server Components lee ese JWT → obtiene perfil del usuario
5. Cada página protegida llama getCurrentUser() al inicio
   → si devuelve null → redirect("/login")
```

---

## 7. Módulo de Tickets

### 7.1 Tipos de ticket

| Tipo | Descripción | Diferencias en UI |
|---|---|---|
| `servicio` | Visita técnica puntual (reparación, diagnóstico) | Sin tab "Fases" |
| `proyecto` | Instalación o trabajo multi-etapa | Con tab "Fases" + barra de progreso global |

### 7.2 Máquina de estados (flujo de trabajo)

El ticket sigue un flujo lineal estricto. Las transiciones válidas están definidas en:
```
types/index.ts → VALID_TRANSITIONS
```

```
asignado ──→ iniciado ──→ en_progreso ──→ finalizado
    │              │              │
    └──────────────┴──────────────┴──→ cancelado
```

Solo hay una acción "especial": el paso a **finalizado** abre un wizard de 3 pasos.

### 7.3 Wizard de finalización (3 pasos)

**Ubicación**: `app/dashboard/tickets/[id]/ticket-status-actions.tsx`

El wizard solo se activa cuando el técnico hace clic en "Finalizar". Los otros cambios de estado (Iniciar, En Progreso, Cancelar) son un solo clic sin dialog.

**Paso 1 — Materiales utilizados**:
- Pre-carga la lista de `ticket.materiales_planificados` (materiales que se estimaron al crear el ticket)
- El técnico puede agregar, quitar o modificar materiales
- Campos por material: nombre, cantidad, unidad

**Paso 2 — Tiempo trabajado**:
- Input numérico de minutos
- Muestra conversión en tiempo real: "120 min → 2h"
- No es obligatorio (puede dejarse en blanco)

**Paso 3 — Resumen**:
- `solucion_aplicada`: campo obligatorio, describe qué se hizo
- `observaciones_tecnico`: campo opcional, notas adicionales

Al confirmar, llama a `changeTicketStatus(ticket.id, "finalizado", { materiales_usados, tiempo_trabajado, solucion_aplicada, observaciones_tecnico })`.

### 7.4 Detalle de ticket con Tabs

**Ubicación**: `app/dashboard/tickets/[id]/ticket-detail-tabs.tsx`

| Tab | Contenido | Condición de visibilidad |
|---|---|---|
| Detalle | Datos completos del ticket + barra de progreso (proyectos) | Siempre |
| Fases | Lista de fases del proyecto | Solo si `ticket.tipo === "proyecto"` |
| Historial | Timeline de todos los cambios | Siempre |
| Inspección | Datos del levantamiento o link para crear uno | Siempre |

El componente es **Client** porque gestiona el estado de qué tab está activa (usa `Tabs` de Radix UI).

---

## 8. Sistema de Fases para Proyectos

### 8.1 Concepto

Las **fases** representan las etapas o hitos de un proyecto. Por ejemplo, un proyecto de instalación CCTV podría tener:
1. Inspección del sitio
2. Tendido de cableado
3. Instalación de cámaras
4. Configuración del NVR
5. Pruebas y entrega

Cada fase tiene su propio estado y porcentaje de progreso. El dashboard del ticket calcula el progreso global como el promedio de todas las fases.

### 8.2 Archivos involucrados

| Archivo | Tipo | Rol |
|---|---|---|
| `lib/actions/fases.ts` | Server Action | CRUD completo en BD |
| `components/tickets/ticket-fases-list.tsx` | Client Component | UI de lista + formularios |
| `lib/mock-data.ts` (funciones demo) | Lógica demo | Datos en memoria para modo local |

### 8.3 Permisos por rol

- **Técnico asignado**: puede actualizar el progreso (%) y estado de cada fase
- **Gerente+**: puede crear, editar y eliminar fases

### 8.4 Cálculo del progreso global

```typescript
// ticket-detail-tabs.tsx
const progresoGlobal = fases.length > 0
  ? Math.round(
      fases.reduce((sum, f) => sum + f.progreso_porcentaje, 0) / fases.length
    )
  : 0   // Si no hay fases, progreso = 0
```

---

## 9. Módulo de Pagos a Técnicos

### 9.1 Flujo de pagos

Cuando un ticket se **finaliza**, el sistema crea automáticamente un registro en `pagos_tecnicos` con:
- `monto_ticket`: monto del servicio
- `porcentaje_comision`: porcentaje que corresponde al técnico (configurable)
- `monto_a_pagar`: resultado de `monto_ticket × porcentaje_comision / 100`
- `estado_pago`: `"pendiente"` (inicial)

Un gerente o superior luego **procesa el pago** desde la página de Pagos.

### 9.2 Componentes del módulo de pagos

| Archivo | Tipo | Función |
|---|---|---|
| `app/dashboard/pagos/page.tsx` | Server Page | Carga pagos y muestra stats |
| `components/pagos/pending-payments-list.tsx` | Client | Lista de pagos pendientes con botón "Pagar" |
| `components/pagos/payment-dialog.tsx` | Client | Dialog modal para confirmar y registrar el pago |
| `lib/actions/pagos.ts` | Server Action | `processPaymentAction()` — actualiza la BD |

### 9.3 El dialog de pago (`payment-dialog.tsx`)

Cuando el usuario hace clic en "Pagar", se abre un dialog con:
- **Panel verde** con el monto a pagar (para que sea visible y no haya confusión)
- **Select** de método de pago: Efectivo, Transferencia, Depósito, Cheque
- **Input de referencia**: solo aparece si el método es Transferencia o Depósito
- **Textarea** de observaciones (opcional)

Al confirmar, llama a `processPaymentAction()` que:
1. Valida que el pago aún esté pendiente (guarda contra doble pago)
2. Actualiza `estado_pago = "pagado"` junto con método, referencia, fecha y quién pagó
3. Llama a `revalidatePath("/dashboard/pagos")` para refrescar la página

### 9.4 Protección contra doble pago

En Supabase se usa un filtro doble:
```typescript
await supabase
  .from("pagos_tecnicos")
  .update({ estado_pago: "pagado", ... })
  .eq("id", paymentId)
  .eq("estado_pago", "pendiente")  // ← si ya está pagado, no actualiza nada
```

---

## 10. Comprobante de Servicio

### 10.1 Propósito

El comprobante es el documento oficial que COPS Electronics entrega al cliente al finalizar un servicio. Replica el formato físico real de la empresa (que se usa actualmente en papel).

### 10.2 Acceso y seguridad

Solo es accesible bajo dos condiciones simultáneas:
1. El ticket debe tener `estado === "finalizado"`
2. El usuario debe tener `nivel_jerarquico >= 2` (coordinador o superior)

Si el ticket no está finalizado, hace redirect automático a `/dashboard/tickets/[id]`.

### 10.3 Archivos

| Archivo | Tipo | Función |
|---|---|---|
| `app/dashboard/tickets/[id]/comprobante/page.tsx` | Server Page | Verifica permisos, carga datos |
| `app/dashboard/tickets/[id]/comprobante/comprobante-view.tsx` | Client Component | Renderiza el documento con CSS print |

### 10.4 Estructura del documento (formato COPS)

El componente `ComprobanteView` genera un documento que replica el formato oficial:

1. **Encabezado**: Logo COPS + R.I.F. J-30513629-7 + título "COMPROBANTE DE SERVICIO" + número de ticket + fecha
2. **Datos del Cliente**: Nombre, Agencia/Empresa, Teléfono, Email, Dirección
3. **Detalles del Servicio**: Asunto, Hora de Entrada, Hora de Salida, Horas Trabajadas, Monto
4. **Informe de la Visita**: Procedimiento detallado (solución aplicada) + Observaciones
5. **Resultado de la Visita**: Checkboxes — Inspección / Mantenimiento / Proyecto / Garantía / Otros
6. **Materiales Utilizados**: Tabla con nombre, cantidad, unidad (si hay materiales registrados)
7. **Firmas y Conformidad**: 3 bloques — Técnico Responsable | Cliente | Supervisor

### 10.5 Impresión / Exportación a PDF

Se usa el mecanismo nativo del navegador:
```typescript
const handlePrint = () => window.print()
```

El CSS `@media print` se encarga de:
- Ocultar la barra de navegación, sidebar y botones de la app
- Eliminar sombras y bordes redondeados del documento
- Configurar tamaño de página A4 con márgenes de 1.5cm
- Evitar saltos de página en medio de los bloques de firmas

El usuario abre la vista del comprobante, hace clic en "Imprimir / PDF", selecciona "Guardar como PDF" en el diálogo del navegador.

---

## 11. Gestión de Usuarios

### 11.1 Lista de usuarios

**Ubicación**: `app/dashboard/usuarios/page.tsx`

Muestra una tabla de todos los usuarios del sistema con: nombre, email, rol, estado (activo/inactivo). Accesible solo para gerente+.

### 11.2 Creación de usuarios

**Archivos**:
- `app/dashboard/usuarios/nuevo/page.tsx` — Server Component, verifica permisos y renderiza el form
- `app/dashboard/usuarios/nuevo/nuevo-usuario-form.tsx` — Client Component con el formulario

**Campos del formulario**:
- Nombre y Apellido (grid 2 columnas)
- Email y Cédula (grid 2 columnas)
- Teléfono y Rol (grid 2 columnas) — el Rol usa un `Select` con los 5 roles del sistema
- Especialidad (ancho completo) — Ej: "Redes y Telecomunicaciones"
- Contraseña y Confirmar contraseña (grid 2 columnas) — con toggle mostrar/ocultar

**Validación** (con Zod + React Hook Form):
- Extiende `userCreateSchema` (schema base del sistema) con `confirmPassword` y `especialidad`
- Usa `.refine()` para la validación cruzada entre password y confirmPassword
- Errores se muestran en rojo bajo cada campo

**Banner de modo local**:
```jsx
{isLocalMode && (
  <div className="... bg-yellow-500/10 border-yellow-500/30">
    <AlertTriangle />
    <p>Modo de demostración activo — No disponible sin Supabase</p>
  </div>
)}
```

**Flujo**:
1. Usuario completa el form y hace submit
2. `handleSubmit` de React Hook Form valida con Zod
3. Si pasa validación, llama a `registerUserAction()` (Server Action)
4. Supabase crea el usuario en Auth (email + password)
5. Supabase crea el perfil en la tabla `users` (nombre, rol, cédula, etc.)
6. Si exitoso: toast de éxito + redirect a `/dashboard/usuarios`
7. Si falla: toast de error con el mensaje de Supabase

---

## 12. Dashboard y KPIs

### 12.1 Métricas en pantalla

**Ubicación**: `app/dashboard/page.tsx`

El dashboard muestra en tiempo real:
- **Total de tickets** del período
- **Tickets activos** (en progreso)
- **Ingresos del mes** (solo gerente+)
- **Comisiones pendientes** (solo gerente+)

Luego muestra secciones adicionales:
- Pipeline Kanban con columnas por estado
- Gráficos de distribución (Recharts)
- Actividad reciente del historial

### 12.2 KPI Card (`components/dashboard/kpi-card.tsx`)

Este es un **Client Component** que recibe datos ya preparados del servidor:
```typescript
// El Server Component pre-formatea el valor
<KpiCard
  title="Ingresos del Mes"
  displayValue="$12,450.00"              // string ya formateado
  icon={<DollarSign className="h-6 w-6" />}  // JSX ya renderizado
  trend="+12% vs mes anterior"
/>
```

El valor es un string y el ícono es JSX porque **no se pueden pasar funciones de componente** desde Server Components a Client Components.

---

## 13. Modo Local (Demo)

### 13.1 Por qué existe

Durante el desarrollo (o en una demo sin Supabase), el sistema necesita funcionar con datos de prueba sin base de datos real. El modo local simula toda la aplicación usando datos en memoria.

### 13.2 Cómo funciona

```typescript
// lib/local-mode.ts
export function isLocalMode(): boolean {
  return process.env.NEXT_PUBLIC_LOCAL_MODE === "true"
}
```

Cuando está activo:
- La autenticación usa un usuario demo predefinido (admin@copselectronics.com)
- Los datos vienen de `lib/mock-data.ts` (arrays JavaScript en memoria)
- Las mutaciones (crear, editar, eliminar) modifican esos arrays en memoria
- **Los cambios NO persisten** entre reinicios del servidor de desarrollo

### 13.3 El patrón de doble rama en cada Server Action

Cada action sigue este patrón obligatorio:
```typescript
export async function miAction(input): Promise<ActionResponse<T>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }
  if (ROLE_HIERARCHY[currentUser.rol] < nivelRequerido)
    return { success: false, error: "Sin permisos" }

  if (isLocalMode()) {
    // ─── RAMA 1: Datos en memoria (mock-data.ts) ───────────────────
    const result = funcionDemoCorrespondiente(input)
    revalidatePath("/dashboard/ruta")
    return { success: true, data: result, message: "Hecho (demo)" }
  }

  // ─── RAMA 2: Base de datos real (Supabase) ─────────────────────
  const supabase = await createClient()
  const { data, error } = await supabase.from("tabla").insert(input)
  if (error) return { success: false, error: error.message }
  revalidatePath("/dashboard/ruta")
  return { success: true, data, message: "Hecho" }
}
```

---

## 14. Flujo de Datos End-to-End

### Ejemplo completo: Técnico finaliza un ticket

```
BROWSER (Client Component)
│
│  1. Técnico hace clic en "Finalizar"
│  2. Se abre el wizard (Dialog) con 3 pasos
│  3. Rellena materiales, tiempo, solución
│  4. Hace clic en "Finalizar Ticket"
│
│  → handleFinalize() llama a:
│
SERVER (Server Action: changeTicketStatus)
│  5. Verifica autenticación (getCurrentUser)
│  6. Verifica permisos (solo técnico asignado puede finalizar)
│  7. isLocalMode() → si es demo, actualiza demoTickets en memoria
│     → si es producción:
│  8. UPDATE tickets SET
│       estado = 'finalizado',
│       fecha_finalizacion = NOW(),
│       materiales_usados = [...],
│       tiempo_trabajado = 120,
│       solucion_aplicada = "Se reemplazó el disco duro..."
│     WHERE id = 'uuid-del-ticket'
│  9. INSERT historial_cambios (tipo: 'finalizacion')
│  10. INSERT pagos_tecnicos (estado: 'pendiente', monto calculado)
│  11. revalidatePath("/dashboard/tickets/uuid") → invalida caché
│
BROWSER
│  12. Server Action devuelve { success: true }
│  13. toast.success("Ticket finalizado")
│  14. router.refresh() → Next.js re-fetcha la página desde el servidor
│  15. La página se actualiza con el estado "finalizado"
│  16. Aparece el botón "Comprobante"
```

---

## 15. Patrones de Diseño Utilizados

### 15.1 ActionResponse<T> — Respuesta estándar de Server Actions

Todas las server actions devuelven este tipo:
```typescript
type ActionResponse<T = void> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}
```

Esto garantiza consistencia: el código cliente siempre sabe qué esperar y maneja errores de la misma forma.

### 15.2 Glass-morphism (estilo visual)

El sistema usa un diseño "vidrio" con:
- Fondo oscuro semitransparente: `bg-white/5` (blanco al 5% de opacidad)
- Bordes sutiles: `border border-white/10`
- Desenfoque de fondo: `backdrop-blur-xl`
- Texto blanco con opacidades variables: `text-white`, `text-white/60`, `text-white/40`

### 15.3 Optimistic UI con toast + refresh

En lugar de mostrar un spinner largo, el patrón es:
1. Hacer la llamada al servidor
2. Cuando responde: mostrar toast (feedback inmediato)
3. `router.refresh()` para refrescar los datos reales desde el servidor

### 15.4 Validación en dos capas

```
Capa 1: Frontend (Zod + React Hook Form)
  → Valida antes de enviar al servidor
  → Feedback inmediato al usuario (errores bajo cada campo)

Capa 2: Backend (Server Action)
  → Valida permisos y datos de negocio
  → Nunca confía ciegamente en el input del cliente
```

### 15.5 Separación Server/Client por responsabilidad

| Responsabilidad | Tipo de componente | Ejemplo |
|---|---|---|
| Leer datos de BD | Server Component | `page.tsx` en cualquier ruta |
| Controlar permisos | Server Component + Server Action | `page.tsx` + `lib/actions/*.ts` |
| Interactividad de UI | Client Component | `ticket-status-actions.tsx` |
| Formularios | Client Component | `nuevo-usuario-form.tsx` |
| Tabs, dialogs, dropdowns | Client Component | `ticket-detail-tabs.tsx` |

---

## 16. Rutas del Sistema

| Ruta | Acceso mínimo | Descripción |
|---|---|---|
| `/login` | Público | Inicio de sesión |
| `/dashboard` | tecnico+ | Dashboard con KPIs |
| `/dashboard/tickets` | tecnico+ | Lista de tickets |
| `/dashboard/tickets/nuevo` | coordinador+ | Crear ticket |
| `/dashboard/tickets/[id]` | tecnico+ | Detalle de ticket con tabs |
| `/dashboard/tickets/[id]/comprobante` | coordinador+ | Comprobante imprimible |
| `/dashboard/tickets/[id]/inspeccion` | tecnico+ | Levantamiento de inspección |
| `/dashboard/usuarios` | gerente+ | Lista de usuarios |
| `/dashboard/usuarios/nuevo` | gerente+ | Crear usuario |
| `/dashboard/pagos` | gerente+ | Gestión de pagos a técnicos |

---

## GLOSARIO TÉCNICO

| Término | Definición |
|---|---|
| **Server Component** | Componente React que ejecuta SOLO en el servidor, puede leer la BD directamente |
| **Client Component** | Componente React con `"use client"`, ejecuta en el browser, maneja interactividad |
| **Server Action** | Función con `"use server"` que el browser llama como si fuera local pero ejecuta en el servidor |
| **RBAC** | Role-Based Access Control — control de acceso por jerarquía de roles |
| **JWT** | JSON Web Token — token firmado que prueba la identidad del usuario |
| **RLS** | Row Level Security — políticas de seguridad a nivel de fila en PostgreSQL |
| **Supabase** | Backend-as-a-Service basado en PostgreSQL con Auth, Storage y API automática |
| **revalidatePath()** | Función de Next.js que invalida el caché de una ruta, forzando re-fetch del servidor |
| **Zod** | Biblioteca de validación que genera tipos TypeScript automáticamente desde los schemas |
| **React Hook Form** | Librería de gestión de formularios que minimiza re-renders |
| **Glass-morphism** | Estilo de UI con fondos translúcidos y efecto de cristal |
| **Promise.all** | Ejecuta múltiples promesas en paralelo, reduciendo tiempo de espera total |
| **Monorepo** | Un único repositorio Git que contiene múltiples proyectos (apps + packages) |
| **pnpm workspaces** | Sistema de monorepo que comparte dependencias entre proyectos |
| **ActionResponse<T>** | Tipo de respuesta estándar de todas las server actions del sistema |
| **BaaS** | Backend-as-a-Service — proveedor que ofrece infraestructura de backend lista para usar |

---

*Documentación generada para defensa de Trabajo de Grado — COPS Platform v2.0 (Sprint 2)*
