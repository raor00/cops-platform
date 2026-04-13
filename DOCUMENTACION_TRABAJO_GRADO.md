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
| Framework web | **Next.js** | 15 (App Router) | Full-stack React con Server Components y routing basado en archivos |
| Lenguaje | **TypeScript** | 5 | Tipado estático que previene errores en tiempo de compilación |
| Autenticación | **Firebase Authentication** | — | Login con email/password, sesiones con cookies firmadas de servidor |
| Base de datos | **Firestore (Firebase)** | — | Base de datos NoSQL orientada a documentos, sin servidor que administrar |
| Almacenamiento archivos | **Firebase Storage** | — | Almacenamiento de fotos e imágenes (accedido vía REST API) |
| Admin SDK | **firebase-admin** | — | SDK de servidor para operar Firestore y Auth desde Server Actions |
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
    │       │   ├── firebase/           ← Clientes Firebase (Auth, Firestore, Storage)
    │       │   │   ├── client.ts       ← Firebase Auth para el browser (signIn)
    │       │   │   ├── admin.ts        ← Firebase Admin SDK (Firestore + Auth + Storage en servidor)
    │       │   │   ├── session.ts      ← Crear/verificar/limpiar cookie de sesión Firebase
    │       │   │   └── storage-rest.ts ← Subida/descarga de archivos vía REST API de Firebase Storage
    │       │   ├── supabase/           ← [LEGACY] Cliente Supabase (no se usa en producción)
    │       │   │   ├── client.ts
    │       │   │   └── server.ts
    │       │   ├── utils/              ← Funciones de utilidad (formateo, etc.)
    │       │   │   └── index.ts
    │       │   ├── validations/        ← Schemas Zod de validación
    │       │   │   └── index.ts
    │       │   ├── mock-data.ts        ← Datos de demostración en memoria
    │       │   └── local-mode.ts       ← Detección del modo (local / firebase)
    │       ├── types/                  ← Definiciones de tipos TypeScript
    │       │   └── index.ts
    │       ├── supabase/               ← [LEGACY] Schema SQL original (referencia histórica)
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
// lib/actions/tickets.ts
"use server"

export async function changeTicketStatus(
  ticketId: string,
  nuevoEstado: TicketStatus
): Promise<ActionResponse<Ticket>> {
  // Este código SIEMPRE ejecuta en el servidor, aunque lo llame un componente del browser
  const db = getAdminFirestore()
  await db.collection("tickets").doc(ticketId).update({
    estado: nuevoEstado,
    updated_at: new Date().toISOString(),
  })
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

### 5.1 Colecciones en Firestore

Firestore organiza los datos en **colecciones de documentos** (equivalente a tablas de filas). Cada documento es un objeto JSON con un ID único.

| Colección | Propósito | Archivo de tipos |
|---|---|---|
| `users` | Usuarios del sistema con roles | `types/index.ts → User` |
| `tickets` | Tickets de servicio y proyectos | `types/index.ts → Ticket` |
| `ticket_fases` | Fases/hitos de proyectos | `types/index.ts → TicketFase` |
| `pagos_tecnicos` | Registro de pagos por comisión | `types/index.ts → TechnicianPayment` |
| `ticket_fotos` | Metadata de fotos subidas | `types/index.ts → TicketFoto` |
| `update_logs` | Notas manuales del coordinador | `types/index.ts → UpdateLog` |
| `ticket_sesiones_trabajo` | Sesiones de trabajo del técnico | — |

**Diferencia clave con SQL**: Firestore **no tiene JOINs**. Para obtener un ticket con su técnico asignado se hacen dos lecturas separadas y se combinan en código:

```typescript
// Firestore: dos reads separados
const ticketDoc = await db.collection("tickets").doc(id).get()
const ticket = fromFirestoreDoc<Ticket>(ticketDoc.id, ticketDoc.data()!)

if (ticket.tecnico_id) {
  const userDoc = await db.collection("users").doc(ticket.tecnico_id).get()
  ticket.tecnico = fromFirestoreDoc<User>(userDoc.id, userDoc.data()!)
}

// SQL equivalente (un solo query):
// SELECT t.*, u.nombre FROM tickets t LEFT JOIN users u ON t.tecnico_id = u.id
```

### 5.2 El archivo de tipos: `types/index.ts`

Este archivo centraliza **todas las definiciones de tipos** del sistema. Es fundamental porque TypeScript usa estos tipos para:
1. Detectar errores en tiempo de compilación (antes de ejecutar el código)
2. Proporcionar autocompletado en el editor
3. Documentar la estructura de cada entidad

**Ejemplo del tipo Ticket:**
```typescript
export interface Ticket {
  id: string                          // ID del documento en Firestore (string auto-generado)
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

  // Relaciones (lecturas adicionales a Firestore — no hay JOINs)
  tecnico?: User                      // El ? significa "puede no estar presente"
  creador?: User
}
```

### 5.3 Firebase Security Rules

Firebase permite definir **reglas de seguridad declarativas** que la base de datos aplica independientemente de la aplicación. Equivalen al RLS de PostgreSQL pero con sintaxis propia de Firebase.

```
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Solo técnicos ven sus propios tickets; gerentes ven todos
    match /tickets/{ticketId} {
      allow read: if request.auth != null &&
        (request.auth.uid == resource.data.tecnico_id ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.nivel_jerarquico >= 3);
    }

    // Solo gerentes+ pueden leer todos los usuarios
    match /users/{userId} {
      allow read: if request.auth.uid == userId ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.nivel_jerarquico >= 3;
    }
  }
}
```

**Nota importante**: aunque las Security Rules estén activas en Firebase, el sistema utiliza el **Firebase Admin SDK** desde los Server Actions (ejecutados en el servidor), lo cual **bypassa** las Security Rules. Las reglas aplican a accesos directos desde el cliente. La seguridad en este sistema se garantiza principalmente en los Server Actions verificando `getCurrentUser()` + `ROLE_HIERARCHY`.

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

### 6.3 Flujo de autenticación con Firebase

El login usa un proceso en dos pasos: el cliente firma con Firebase, el servidor crea una cookie segura.

```
BROWSER (FirebaseLoginForm — Client Component)
│
│  1. Usuario ingresa email y contraseña
│  2. signInWithEmailAndPassword(auth, email, password)
│     → Firebase Auth verifica credenciales
│     → Devuelve un ID Token (JWT firmado por Firebase, válido 1h)
│  3. Se llama a setFirebaseSessionAction(idToken) — Server Action
│
SERVER (setFirebaseSessionAction)
│  4. getAdminAuth().verifyIdToken(idToken)  → verifica la firma del JWT
│  5. db.collection("users").doc(uid).get() → obtiene el perfil del usuario de Firestore
│  6. getAdminAuth().createSessionCookie(idToken, { expiresIn: 7 días })
│     → Crea una cookie de sesión de larga duración
│  7. cookieStore.set("tickets_firebase_session", sessionCookie) → cookie httpOnly en el browser
│
BROWSER → siguiente request
│  8. El browser envía la cookie en cada request automáticamente
│  9. getCurrentUser() llama a verifyFirebaseSession()
│     → getAdminAuth().verifySessionCookie(cookie) → obtiene uid
│     → db.collection("users").doc(uid).get() → obtiene perfil actualizado
│  10. Si devuelve null → redirect("/login")
```

**Por qué cookie httpOnly y no localStorage:**
- `httpOnly` = JavaScript del browser no puede leerla → protegida contra XSS
- La cookie la gestiona el servidor, no el cliente

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
| Fotos | Galería de fotos subidas por el técnico | Siempre |
| Historial | Timeline de cambios de estado + notas UpdateLog | Siempre |
| Inspección | Datos del levantamiento o link para crear uno | Siempre |

El componente es **Client** porque gestiona el estado de qué tab está activa (usa `Tabs` de Radix UI).

### 7.5 Campos extendidos del ticket (Sprint 8)

Los tickets de tipo `servicio` y los originados por `carta_aceptacion` tienen campos adicionales opcionales:

```typescript
interface Ticket {
  // ... campos base ...
  tipo_mantenimiento: 'correctivo' | 'preventivo' | null  // solo cuando tipo === 'servicio'
  numero_carta: string | null                              // solo cuando origen === 'carta_aceptacion'
  notas_tecnico: string | null                             // reemplaza "requerimientos técnicos"
}
```

En el formulario de creación (`create-ticket-form.tsx`) estos campos se muestran/ocultan con lógica condicional:

```typescript
// Visible solo cuando tipo === "servicio"
{watchTipo === "servicio" && (
  <Select name="tipo_mantenimiento">
    <SelectItem value="correctivo">Correctivo</SelectItem>
    <SelectItem value="preventivo">Preventivo</SelectItem>
  </Select>
)}

// Visible solo cuando origen === "carta_aceptacion"
{watchOrigen === "carta_aceptacion" && (
  <Input name="numero_carta" placeholder="Nº de la carta" />
)}
```

### 7.6 Estados bidireccionales (Sprint 6)

El flujo estándar de tickets es lineal (hacia adelante). Sin embargo, la gerencia necesita poder corregir errores operativos. Se definen dos constantes en `types/index.ts`:

```typescript
// Transiciones hacia adelante — cualquier usuario autorizado
export const VALID_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  asignado:    ['iniciado', 'cancelado'],
  iniciado:    ['en_progreso', 'cancelado'],
  en_progreso: ['finalizado', 'cancelado'],
  finalizado:  [],
  cancelado:   [],
}

// Transiciones hacia atrás — solo gerente+ (nivel >= 3)
export const ADMIN_REVERSE_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  asignado:    [],
  iniciado:    ['asignado'],
  en_progreso: ['iniciado'],
  finalizado:  ['en_progreso'],
  cancelado:   ['asignado'],
}
```

En `ticket-status-actions.tsx`, los botones de reversión aparecen solo si el usuario tiene nivel 3+:

```typescript
const canRevert = ROLE_HIERARCHY[userRole] >= 3
const reverseTransitions = ADMIN_REVERSE_TRANSITIONS[ticket.estado]

// En la action, se valida que la transición sea legal:
const forwardOk = VALID_TRANSITIONS[ticket.estado].includes(newStatus)
const reverseOk = isAdmin && ADMIN_REVERSE_TRANSITIONS[ticket.estado].includes(newStatus)

if (!forwardOk && !reverseOk) {
  return { success: false, error: "Transición no permitida" }
}
```

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

En Firestore se usa una **transacción atómica**: se verifica que el estado sea "pendiente" ANTES de actualizar, y si ya fue pagado se aborta la operación:

```typescript
// lib/actions/pagos.ts — modo Firebase
await db.runTransaction(async (tx) => {
  const pagoDoc = await tx.get(db.collection("pagos_tecnicos").doc(paymentId))
  if (!pagoDoc.exists) throw new Error("Pago no encontrado")
  if (pagoDoc.data()!.estado_pago !== "pendiente") throw new Error("El pago ya fue procesado")

  tx.update(pagoDoc.ref, {
    estado_pago: "pagado",
    metodo_pago: metodo,
    referencia_pago: referencia,
    fecha_pago: new Date().toISOString(),
    pagado_por: currentUser.id,
  })
})
// Si la transacción falla (pago ya procesado), lanza error y no actualiza nada
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
    <p>Modo de demostración activo — No disponible sin Firebase</p>
  </div>
)}
```

**Flujo**:
1. Usuario completa el form y hace submit
2. `handleSubmit` de React Hook Form valida con Zod
3. Si pasa validación, llama a `registerUserAction()` (Server Action)
4. Firebase Admin crea la cuenta en Firebase Auth: `getAdminAuth().createUser({ email, password })`
5. Firebase Admin crea el perfil en Firestore: `db.collection("users").doc(authUser.uid).set(profile)`
6. Si exitoso: toast de éxito + redirect a `/dashboard/usuarios`
7. Si falla: toast de error con el mensaje de Firebase

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

Durante el desarrollo (o en una demo sin Firebase), el sistema necesita funcionar con datos de prueba sin base de datos real. El modo local simula toda la aplicación usando datos en memoria.

### 13.2 Cómo funciona

```typescript
// lib/local-mode.ts
export type TicketsDataMode = "local" | "firebase"

export function resolveTicketsDataMode(): TicketsDataMode {
  const explicitFlag = process.env.TICKETS_LOCAL_MODE

  if (explicitFlag === "true") return "local"
  if (hasFirebaseConfig()) return "firebase"
  if (process.env.NODE_ENV === "production") return "firebase"
  return "local"  // default en desarrollo sin Firebase
}

export function isLocalMode(): boolean {
  return resolveTicketsDataMode() === "local"
}

export function isFirebaseMode(): boolean {
  return resolveTicketsDataMode() === "firebase"
}
```

Cuando el modo local está activo:
- La autenticación usa un usuario demo predefinido (usuario: `admin`)
- Los datos vienen de `lib/mock-data.ts` (arrays JavaScript en memoria)
- Las mutaciones (crear, editar, eliminar) modifican esos arrays en memoria
- **Los cambios NO persisten** entre reinicios del servidor de desarrollo

### 13.3 El patrón de doble rama en cada Server Action

Cada action sigue este patrón:
```typescript
export async function miAction(input): Promise<ActionResponse<T>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }
  if (ROLE_HIERARCHY[currentUser.rol] < nivelRequerido)
    return { success: false, error: "Sin permisos" }

  // ─── RAMA 1: Datos en memoria (modo local/demo) ────────────────
  if (isLocalMode()) {
    const result = funcionDemoCorrespondiente(input)
    revalidatePath("/dashboard/ruta")
    return { success: true, data: result, message: "Hecho (demo)" }
  }

  // ─── RAMA 2: Firebase / Firestore (modo producción) ───────────
  if (isFirebaseMode()) {
    const db = getAdminFirestore()
    const docRef = db.collection("tickets").doc()
    await docRef.set(cleanForFirestore(input))  // cleanForFirestore elimina undefined
    revalidatePath("/dashboard/ruta")
    return { success: true, data: { id: docRef.id, ...input }, message: "Hecho" }
  }

  return { success: false, error: "Modo de datos no configurado" }
}
```

**`cleanForFirestore()`**: Firestore lanza error si algún campo tiene valor `undefined` (a diferencia de `null` que sí acepta). Esta función serializa y deserializa el objeto con `JSON.parse(JSON.stringify(obj))`, eliminando automáticamente todos los campos `undefined`.

**`fromFirestoreDoc()`**: Firestore almacena fechas como objetos `Timestamp` propios, no como strings ISO. Esta función convierte todos los Timestamps a ISO strings al leer, manteniendo los tipos de TypeScript consistentes.

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

## 17. Documentación Fotográfica

### 17.1 Almacenamiento

Las fotos se guardan en **Firebase Storage**, no en la base de datos. La colección `ticket_fotos` en Firestore guarda la metadata:

```typescript
interface TicketFoto {
  id: string
  ticket_id: string
  path: string           // ruta en Firebase Storage
  tipo: TipoFoto         // 'progreso' | 'inspeccion' | 'documento' | 'antes' | 'despues'
  descripcion?: string
  subida_por: string     // usuario_id
  created_at: string
  url?: string           // URL firmada generada por Firebase (expira en X horas)
}
```

### 17.2 Flujo de subida

```
BROWSER (FotosGallery — Client Component)
│
│  1. Usuario selecciona archivo con <input type="file">
│  2. Se llama a uploadTicketFoto(ticketId, file, tipo)
│
SERVER ACTION (lib/actions/fotos.ts)
│  3. Genera nombre único: `tickets/${ticketId}/${uuid}.${extension}`
│  4. uploadFileToStorage(path, file) → lib/firebase/storage-rest.ts
│     (Firebase Storage REST API — no el SDK del cliente, que no funciona en el servidor)
│  5. getSignedDownloadUrl(path) → genera URL firmada de acceso temporal
│  6. db.collection("ticket_fotos").add({ path, url, tipo, ... })
│  7. revalidatePath() para refrescar la galería
```

**¿Por qué `storage-rest.ts` en lugar del SDK estándar?**
Firebase Storage SDK (web) no funciona en Server Components porque asume entorno de browser. El sistema usa la REST API de Firebase Storage directamente desde el servidor con las credenciales del Admin SDK.

### 17.3 Componente FotosGallery

**Ubicación**: `components/fotos/fotos-gallery.tsx`

Este componente es **autónomo**: recibe solo el `ticketId` y carga sus propias fotos internamente. No necesita que el componente padre le pase las fotos.

```typescript
// Autónomo: lo único que necesita es el ID del ticket
<FotosGallery ticketId={ticket.id} />
```

Internamente hace el fetch al montar el componente usando `useEffect` + `getTicketFotos(ticketId)`.

---

## 18. Inspecciones Técnicas

### 18.1 Concepto

Una **inspección** es un levantamiento técnico previo al trabajo. El técnico visita el sitio, evalúa las condiciones y llena un checklist de 25 ítems antes de que se ejecute el servicio.

### 18.2 Estructura del ChecklistItem

```typescript
// IMPORTANTE: NO usar campos de versiones anteriores (cumple/observacion/item)
interface ChecklistItem {
  id: string
  categoria: string           // 'electrica' | 'red' | 'seguridad' | 'ambiental' | 'equipos'
  descripcion: string         // Texto del ítem: "¿Hay toma de tierra en el rack?"
  aplica: boolean             // false = excluido de la inspección (No Aplica)
  estado: 'ok' | 'falla' | 'pendiente' | 'na'
  notas: string               // observación libre del inspector
  foto_ids: string[]          // fotos vinculadas a este ítem
}
```

### 18.3 Flujo de estados de la inspección

```
borrador ──→ completada ──→ reportada
```

- **borrador**: se está llenando el formulario (editable)
- **completada**: inspector marcó todos los ítems y confirma (ya no editable)
- **reportada**: gerencia tomó acción con base en la inspección

### 18.4 Archivos

| Archivo | Tipo | Función |
|---|---|---|
| `app/dashboard/tickets/[id]/inspeccion/page.tsx` | Server Page | Carga inspección existente o crea una nueva |
| `components/inspecciones/inspeccion-form.tsx` | Client Component | Checklist interactivo con 25 ítems en 5 categorías |
| `app/dashboard/tickets/[id]/inspeccion/view/page.tsx` | Server Page | Vista imprimible del informe de inspección |
| `components/inspecciones/inspeccion-view.tsx` | Client Component | Renderiza el informe con CSS print |
| `lib/actions/inspecciones.ts` | Server Action | CRUD: `getInspeccionByTicket`, `createInspeccion`, `completarInspeccion` |

### 18.5 Vista imprimible

Similar al comprobante de servicio, la vista de inspección usa `window.print()` + `@media print`. El resultado es un informe formal con los resultados del checklist, clasificado por categoría, con las notas del inspector.

---

## 19. Timeline de Actualizaciones — UpdateLog

### 19.1 Propósito

El historial de cambios (`historial_cambios`) registra eventos del sistema (cambios de estado, asignaciones). El **UpdateLog** es diferente: son **notas manuales** que el coordinador agrega para documentar lo que ocurrió entre estados.

Ejemplo: "El técnico llama desde el campo para avisar que necesita piezas adicionales. No cambia el estado pero se deja nota para trazabilidad."

### 19.2 Tipos de entrada

```typescript
interface UpdateLog {
  id: string
  ticket_id: string
  autor_id: string
  contenido: string
  tipo: 'nota' | 'cambio_estado'   // 'nota' = manual, 'cambio_estado' = automático
  created_at: string
  autor?: User                      // JOIN para mostrar nombre del autor
}
```

### 19.3 Componente UpdateLogPanel

**Ubicación**: `components/tickets/update-log-panel.tsx`

```typescript
// Recibe:
interface UpdateLogPanelProps {
  ticketId: string
  logs: UpdateLog[]
  userRole: string
  ticketActivo: boolean   // si false, oculta el textarea (no se agregan notas a tickets cerrados)
}
```

El panel muestra:
- Lista de notas en orden cronológico (timeline)
- Textarea para agregar nueva nota (solo si el ticket está activo y el usuario tiene permiso)
- Al enviar, llama a `addTicketUpdateLog(ticketId, contenido)` (Server Action)

### 19.4 Separación del Historial

En la pestaña **Historial** del ticket (`ticket-detail-tabs.tsx`), se muestran ambas fuentes mezcladas por fecha:
- Entradas de `historial_cambios` (eventos automáticos del sistema)
- Entradas de `update_logs` tipo `nota` (notas manuales del coordinador)

Esta separación de fuentes permite que el historial sea completo sin contaminar la tabla de cambios de estado con texto libre.

---

## 20. Guía de Presentación — Demo 12 Minutos

### Flujo recomendado para la defensa

**Minutos 1-2: Contexto**
- Abrir el dashboard `/dashboard`
- Señalar los KPIs: "Aquí respondo la pregunta que un gerente se hace cada mañana: ¿cuántos servicios están activos?"
- Mencionar que el sistema tiene modo demo sin necesidad de base de datos real

**Minutos 2-5: Crear un ticket**
- Ir a `/dashboard/tickets/nuevo`
- Buscar cliente en el selector → mostrar el auto-relleno de campos
- Cambiar tipo a "servicio" → aparece "tipo de mantenimiento" (campo condicional)
- Cambiar origen a "carta de aceptación" → aparece "número de carta" (campo condicional)
- Crear el ticket

**Minutos 5-7: Vista del técnico**
- Ir a `/dashboard/tickets` con ventana reducida a tamaño móvil
- Mostrar las tarjetas con borde de color por estado
- "El técnico lo ve desde su teléfono sin instalar ninguna app"

**Minutos 7-9: Flujo de trabajo completo**
- Abrir el ticket creado
- Cambiar estado a "Iniciado" → un clic
- Mostrar la pestaña Fotos
- Agregar una nota en la pestaña Historial (UpdateLog)
- Cambiar a "Finalizar" → mostrar el wizard en 3 pasos
- Mostrar el comprobante generado

**Minutos 9-11: Control de acceso**
- Abrir la misma sesión en un browser diferente como "técnico"
- Mostrar que solo ve sus tickets
- Mostrar que no puede acceder a `/dashboard/pagos`

**Minutos 11-12: Cierre**
- Volver al pipeline `/dashboard/pipeline`
- "Todo el ciclo queda trazado: solicitud → campo → comprobante → pago"

---

## 21. Temas Clave para la Defensa

### Preguntas que el jurado probablemente hará

**"¿Por qué Next.js y no otro framework?"**

Next.js 15 con App Router combina rendering del servidor (menor JS en el cliente, carga más rápida) con componentes interactivos en el browser cuando se necesitan. La alternativa más común es una SPA (React puro + API separada), pero eso requiere mantener dos proyectos separados (frontend + API), exponiendo endpoints que hay que asegurar. Con Server Actions, la lógica de negocio nunca llega al browser y no hay API REST que asegurar.

**"¿Por qué Firebase/Firestore en lugar de una base de datos relacional?"**

Firebase provee en un solo servicio: Firestore (base de datos NoSQL), Firebase Auth (login y sesiones) y Firebase Storage (archivos). Esto reduce la infraestructura a un único proveedor sin servidor que administrar y con escalabilidad automática. Firestore es especialmente eficiente para lecturas de documentos individuales — el patrón dominante en una app de tickets donde se consulta un ticket a la vez. La contrapartida es que no tiene JOINs: lo que en SQL es un query, en Firestore son múltiples lecturas combinadas en código.

**"¿Qué diferencia hay entre Firebase Auth y las sesiones tradicionales?"**

Firebase Auth usa JWT (JSON Web Tokens) firmados por Google. El flujo es: el cliente hace `signInWithEmailAndPassword` → Firebase devuelve un ID Token (válido 1h) → el servidor lo verifica con `getAdminAuth().verifyIdToken()` → crea una cookie de sesión de 7 días con `createSessionCookie()`. La ventaja de la cookie de servidor (httpOnly) sobre guardar el token en localStorage es que JavaScript del browser nunca puede leerla, protegiéndola de ataques XSS.

**"¿Qué es un Server Action y por qué lo usaste?"**

Función marcada con `"use server"` que siempre ejecuta en el servidor aunque la llame código del browser. Es el mecanismo de Next.js para mutaciones sin API REST manual. El framework serializa los argumentos, los envía al servidor vía HTTP POST, ejecuta la función y devuelve el resultado. Ventaja: el código de Firestore y las credenciales de Firebase Admin nunca llegan al cliente.

**"¿Cómo garantizas seguridad con múltiples roles?"**

Tres capas:
1. Middleware de Next.js: redirige a login si no hay sesión (verifica la cookie de Firebase)
2. Server Components y Server Actions: verifican `getCurrentUser()` y `ROLE_HIERARCHY` en cada operación
3. Firebase Security Rules: Firestore rechaza accesos directos desde el cliente que no cumplan las reglas, independientemente de la aplicación

**"¿Qué es TypeScript strict y por qué importa?"**

En modo strict, TypeScript no permite valores `null` o `undefined` sin verificación explícita. Esto fuerza al desarrollador a manejar casos edge. En un sistema con documentos de Firestore donde cualquier campo puede no existir, esto previene crashes en producción cuando un campo opcional no está presente en el documento.

**"¿Por qué Zod además de TypeScript?"**

TypeScript valida en tiempo de compilación (mientras se escribe código), pero en runtime los datos vienen de fuentes externas (forms, API) y TypeScript no puede verificarlos. Zod valida en runtime y además genera los tipos TypeScript automáticamente: un solo schema define tanto la validación como el tipo.

**"¿Cómo funciona la máquina de estados del ticket?"**

Es una FSM (Finite State Machine): un conjunto finito de estados y transiciones legales entre ellos. `VALID_TRANSITIONS` es el mapa de transiciones. Antes de cambiar estado, la Server Action verifica que la transición sea válida. Esto previene inconsistencias como finalizar un ticket que ni siquiera fue iniciado.

**"¿Por qué Firebase Storage para las fotos y no guardarlas en Firestore?"**

Los archivos binarios (imágenes) no deben guardarse en bases de datos NoSQL: Firestore tiene un límite de 1MB por documento y no está optimizado para binarios. Firebase Storage (equivalente a S3 de Amazon) está diseñado para archivos: entrega a través de CDN de Google, URLs firmadas con expiración temporal, políticas de acceso independientes. Firestore solo guarda la ruta (`path`) y la URL firmada, no el archivo en sí.

**"¿Qué harías diferente si lo volvieras a construir?"**

Respuesta honesta preparada:
- Pruebas automatizadas (Vitest para unit, Playwright para E2E) desde el sprint 1
- Notificaciones en tiempo real con Firestore listeners (`onSnapshot`) desde el inicio, no como feature futura
- Separar la lógica de negocio de las Server Actions en una capa de servicios independiente para facilitar el testing

---

## GLOSARIO TÉCNICO

| Término | Definición |
|---|---|
| **Server Component** | Componente React que ejecuta SOLO en el servidor, puede leer la BD directamente |
| **Client Component** | Componente React con `"use client"`, ejecuta en el browser, maneja interactividad |
| **Server Action** | Función con `"use server"` que el browser llama como si fuera local pero ejecuta en el servidor |
| **RBAC** | Role-Based Access Control — control de acceso por jerarquía de roles |
| **JWT** | JSON Web Token — token firmado que prueba la identidad del usuario |
| **Firebase Auth** | Servicio de autenticación de Google; maneja login, tokens y sesiones |
| **Firestore** | Base de datos NoSQL orientada a documentos de Google Firebase |
| **Firebase Storage** | Servicio de almacenamiento de archivos de Google Firebase |
| **Firebase Admin SDK** | SDK de servidor para operar Firebase con privilegios de administrador (sin restricciones de Security Rules) |
| **Firebase Security Rules** | Reglas declarativas en Firebase que controlan quién puede leer/escribir qué datos desde el cliente |
| **ID Token** | JWT de corta duración (1h) emitido por Firebase Auth tras el login en el cliente |
| **Session Cookie** | Cookie httpOnly de larga duración (7 días) creada por el servidor tras verificar el ID Token |
| **cleanForFirestore()** | Helper que elimina campos `undefined` de un objeto antes de escribirlo en Firestore |
| **fromFirestoreDoc()** | Helper que convierte Timestamps de Firestore a ISO strings al leer documentos |
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

*Documentación generada para defensa de Trabajo de Grado — COPS Platform v2.0 (Sprint 8)*
