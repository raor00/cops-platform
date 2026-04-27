# COPS Platform — Arquitectura del Monorepo

**Última actualización:** 2026-04-27
**Repositorio:** https://github.com/raor00/cops-platform
**Branch:** `main`

---

## 1. Estructura del Monorepo

```
cops-platform/
├── apps/
│   ├── web/                    # Portal corporativo (Next.js 16, puerto 3000)
│   ├── cotizaciones/           # Sistema de cotizaciones (Next.js 16, puerto 3001)
│   └── tickets/               # Sistema de tickets/servicios (Next.js 16, puerto 3002)
├── packages/
│   └── shared/                # CÓDIGO COMPARTIDO (types, Firestore client)
├── docs/
│   ├── superpowers/specs/     # Specs de diseño
│   └── monorepo-arquitectura.md  # Este documento
├── CLAUDE.md                  # Contexto técnico de tickets (histórico)
├── AGENTS.md                  # Reglas para AI assistants
├── pnpm-workspace.yaml
├── package.json
└── turbo.json (si aplica)
```

---

## 2. apps/web

**Puerto:** 3000
**Framework:** Next.js 16, App Router
**Función:** Portal corporativo con selector de módulos

### Rutas
| Ruta | Descripción |
|------|-------------|
| `/` | Landing page / selector de apps |

### Dependencias clave
- Next.js 16
- Tailwind CSS
- shadcn/ui

---

## 3. apps/cotizaciones

**Puerto:** 3001
**Framework:** Next.js 16, App Router, TypeScript strict
**Base de datos:** Firebase/Firestore (client-side SDK)
**Función:** Crear, editar y exportar cotizaciones comerciales

### Stack
| Tecnología | Uso |
|------------|-----|
| Next.js 16 | Framework |
| TypeScript strict | Tipado |
| Tailwind CSS + shadcn/ui | UI |
| Firebase/Firestore | Base de datos |
| jspdf + html2canvas | Export PDF |
| react-hook-form + zod | Forms |
| sonner | Toast notifications |
| lucide-react | Icons |

### Colecciones Firestore
| Colección | Descripción |
|-----------|-------------|
| `cotizaciones` | Documentos de cotización (JSONB payload) |
| `catalogo_productos` | Catálogo de productos con inventario |
| `catalogo_movimientos` | Registro de cada entrada/salida de stock |
| `catalogo-config` | Configuración de descuentos |
| `clientes` | Clientes compartidos (heredado de tickets) |
| `notas-entrega` | Notas de entrega |
| `guias-transporte` | Guías de transporte |

### Rutas principales
| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | `AppShell` | Shell principal con navegación |
| `/?tab=quotation` | `QuotationBuilder` | Constructor de cotizaciones |
| `/?tab=catalog` | `CatalogManager` | Gestión de catálogo de productos |
| `/?tab=delivery` | `DeliveryNoteManager` | Notas de entrega |
| `/?tab=transport` | `TransportGuideManager` | Guías de transporte |

### Componentes principales
```
components/quotation/
├── app-shell.tsx                  # Layout principal con tabs
├── quotation-builder.tsx          # Constructor de cotizaciones
├── items-table.tsx               # Tabla de items (equipos/materiales)
├── labor-section.tsx             # Sección de mano de obra
├── summary-panel.tsx             # Panel de totales/IVA/descuentos
├── catalog-manager.tsx           # Gestor de catálogo (orquestador)
├── catalog/                       # Subcomponentes del catálogo
│   ├── catalog-layout.tsx
│   ├── catalog-toolbar.tsx
│   ├── catalog-filters.tsx
│   ├── product-grid.tsx
│   ├── product-list.tsx
│   ├── product-card.tsx
│   ├── quick-view-drawer.tsx
│   ├── catalog-picker-drawer.tsx
│   ├── catalog-manager-dialogs.tsx
│   ├── use-catalog-manager.ts
│   └── brand-manager-dialog.tsx
├── client-info-form.tsx          # Formulario de cliente
├── quotation-preview.tsx         # Vista previa de cotización
├── pdf-preview-dialog.tsx        # Vista previa PDF
├── ai-assistant.tsx              # Asistente AI (Ollama/Gemini)
├── automation-suggestions.tsx    # Sugerencias automáticas
└── catalog/                      # (detallado arriba)
```

### Lib
```
lib/
├── quotation-types.ts           # Tipos: CatalogItem, QuotationData, ClientInfo, etc.
├── quotation-storage.ts         # Persistencia localStorage + Firestore
├── generate-pdf.ts              # Generación de HTML para PDF
├── download-html-pdf.ts         # Renderizado jspdf + html2canvas
├── ablerex-catalog.ts           # Catálogo Ablerex (importación)
├── firebase/
│   └── config.ts               # Configuración Firebase client SDK
└── validations/
    └── index.ts                # Schemas Zod
```

### Tipos principales
```typescript
interface CatalogItem {
  id: string
  code: string
  description: string
  unitPrice: number
  imageUrl?: string
  category: string
  brand?: string
  subcategory?: string
  variant?: string
  unit: string
}

interface QuotationData {
  id: string
  code: string
  type: "proyecto" | "servicio" | "mantenimiento"
  clientInfo: ClientInfo
  items: QuotationItem[]        // Equipos
  materials: QuotationItem[]    // Materiales
  laborItems: LaborItem[]
  subtotalEquipment: number
  subtotalMaterials: number
  subtotalLabor: number
  discountAmount: number
  ivaRate: number
  ivaAmount: number
  total: number
  paymentCondition: string
  notes: string
  termsAndConditions: string
  issueDate: string
  validUntil: string
  companyFormat: "sa" | "llc"
}

interface ClientInfo {
  name: string
  attention: string
  email: string
  rif: string
  phone: string
  address: string
  customerId?: string          // ← NUEVO: vinculación con tickets
  billToName?: string
  billToAttention?: string
  billToEmail?: string
  billToPhone?: string
  billToAddress?: string
  shipToName?: string
  shipToAttention?: string
  shipToEmail?: string
  shipToPhone?: string
  shipToAddress?: string
}
```

### Variables de entorno
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
AI_PROVIDER_MODE=hybrid        # hybrid | ollama | gemini
OLLAMA_BASE_URL=
GEMINI_API_KEY=
```

---

## 4. apps/tickets

**Puerto:** 3002
**Framework:** Next.js 15/16, App Router, TypeScript strict
**Base de datos:** Firebase/Firestore (Admin SDK server-side)
**Función:** Gestión de tickets de servicio técnico, inspecciones, pagos, reportes

### Stack
| Tecnología | Uso |
|------------|-----|
| Next.js 15/16 | Framework |
| TypeScript strict | Tipado |
| Tailwind CSS + Radix UI | UI |
| Supabase (histórico) | Referenciado en docs pero NO usado actualmente |
| Firebase/Firestore | Base de datos real |
| Firebase Admin SDK | Server-side Firestore |
| Firebase Storage | Fotos y documentos |
| react-hook-form + zod | Forms |
| sonner | Toast notifications |
| recharts | Gráficos |
| lucide-react | Icons |

### Modo de ejecución
| Modo | Activación | Datos |
|------|------------|-------|
| **Local/Demo** | `TICKETS_LOCAL_MODE=true` | `lib/mock-data.ts` en memoria |
| **Real** | Firebase env vars configuradas | Firestore |

### Colecciones Firestore
| Colección | Descripción |
|-----------|-------------|
| `tickets` | Tickets de servicio |
| `clientes` | Clientes (CRUD completo) |
| `users` | Usuarios del sistema |
| `pagos` | Pagos a técnicos |
| `ticket_fotos` | Fotos de tickets |
| `ticket_documentos` | Documentos adjuntos |
| `ticket_fases` | Fases de proyecto |
| `inspecciones` | Inspecciones técnicas |
| `ticket_sesiones_trabajo` | Sesiones de trabajo |
| `update-logs` | Notas de bitácora |
| `catalogo_productos` | Catálogo compartido (cotizaciones) |
| `catalogo_movimientos` | Movimientos de inventario |

### Roles y Jerarquía
```typescript
tecnico        = 1
coordinador    = 2
gerente        = 3
vicepresidente = 4
presidente     = 5
```

### Permisos
```typescript
tickets:view, tickets:create, tickets:edit, tickets:delete
users:view, users:create, users:edit
payments:view, payments:process
reports:view
config:view (gerente+), config:edit (vp+)
audit:view
clients:view (coordinador+), clients:create, clients:edit
```

### Rutas principales
| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/dashboard` | Todos | KPIs, charts, pipeline widget |
| `/dashboard/tickets` | Todos | Lista de tickets |
| `/dashboard/tickets/nuevo` | Coordinador+ | Crear ticket |
| `/dashboard/tickets/[id]` | Todos | Detalle del ticket (5 tabs) |
| `/dashboard/tickets/[id]/inspeccion` | Coordinador+ | Checklist 25 ítems |
| `/dashboard/pipeline` | Todos | Board kanban |
| `/dashboard/configuracion` | Gerente+ | Config del sistema |
| `/dashboard/usuarios` | Gerente+ | Grid de usuarios |
| `/dashboard/usuarios/[id]` | Gerente+ o propio | Perfil usuario |
| `/dashboard/reportes` | Coordinador+ | KPIs y estadísticas |
| `/dashboard/pagos` | Coordinador+ | Tabla de pagos |
| `/dashboard/pagos/cuadro` | Gerente+ | Cuadro de pagos |
| `/dashboard/clientes` | Coordinador+ | CRUD clientes |

### Componentes principales
```
components/
├── ui/                          # shadcn/ui primitivos
├── layout/
│   ├── header.tsx
│   └── sidebar.tsx
├── tickets/
│   ├── technician-mobile-card.tsx
│   ├── ticket-fases-list.tsx
│   ├── ticket-fotos-grid.tsx
│   ├── ticket-status-changer.tsx
│   └── update-log-panel.tsx
├── clientes/
│   ├── clientes-client.tsx
│   └── cliente-form-dialog.tsx
├── fotos/
│   └── fotos-gallery.tsx
├── inspecciones/
│   └── inspeccion-form.tsx
├── pagos/
│   └── payment-dialog.tsx
├── pipeline/
│   └── pipeline-page-board.tsx
├── reportes/
│   └── technician-stats-table.tsx
└── configuracion/
    └── config-edit-dialog.tsx
```

### Lib (Actions)
```
lib/actions/
├── auth.ts                     # login, logout, getCurrentUser
├── tickets.ts                  # CRUD tickets + changeTicketStatus
├── clientes.ts                 # CRUD clientes
├── usuarios.ts                 # CRUD usuarios
├── dashboard.ts                # Estadísticas
├── pagos.ts                    # Procesar pagos
├── fotos.ts                    # Subir/eliminar fotos
├── inspecciones.ts             # CRUD inspecciones
├── fases.ts                    # CRUD fases
├── configuracion.ts            # Config del sistema
└── inventario.ts               # NUEVO: Control de inventario
```

### Tipos principales (types/index.ts)
```typescript
interface Ticket {
  id: string
  numero_ticket: string
  tipo: "servicio" | "proyecto"
  asunto: string
  descripcion: string
  cliente_nombre: string
  cliente_email: string
  cliente_telefono: string
  estado: TicketStatus
  prioridad: TicketPriority
  origen: string
  monto_servicio: number
  porcentaje_comision: number
  tiempo_estimado_horas: number
  tecnico_id: string
  materiales_planificados?: MaterialItem[]
  materiales_usados?: MaterialItem[]
  estado_operativo?: string
  // ... más campos
}

interface MaterialItem {
  id: string
  nombre: string
  cantidad: number
  unidad: string
  observacion?: string
  producto_id?: string        // ← NUEVO: vinculación con catálogo
}

interface Cliente {
  id: string
  nombre: string
  apellido?: string
  empresa?: string
  email?: string
  telefono: string
  direccion: string
  rif_cedula?: string
  estado: "activo" | "inactivo"
  observaciones?: string
  contactos?: ClienteContacto[]
}

interface UpdateLog {
  id: string
  ticket_id: string
  autor_id: string
  contenido: string
  tipo: "nota" | "cambio_estado"
  created_at: string
}
```

### Variables de entorno
```bash
TICKETS_LOCAL_MODE=true
TICKETS_DEMO_EMAIL=admin@copselectronics.com
TICKETS_DEMO_PASSWORD=admin123
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

---

## 5. packages/shared

**NUEVO — Creado como parte de la integración**

### Propósito
Código compartido entre `cotizaciones` y `tickets`:
- Tipos de datos comunes
- Cliente Firestore unificado
- Utilidades compartidas

### Estructura
```
packages/shared/
├── src/
│   ├── types/
│   │   ├── index.ts            # Re-export
│   │   ├── catalogo-producto.ts
│   │   ├── movimiento-inventario.ts
│   │   └── cliente.ts
│   ├── firestore/
│   │   └── client.ts           # Cliente Firestore compartido
│   └── utils/
│       └── format.ts           # formatCurrency, etc.
├── package.json
└── tsconfig.json
```

### Uso en apps
```typescript
// apps/cotizaciones
import type { CatalogoProducto, Cliente } from "@cops/shared"
import { getSharedFirestore } from "@cops/shared/firestore"

// apps/tickets
import type { CatalogoProducto, MovimientoInventario } from "@cops/shared"
import { getSharedFirestore } from "@cops/shared/firestore"
```

---

## 6. Flujos de Datos Compartidos

### 6.1 Inventario: Tickets → Catálogo
```
[Technician]
    │
    ▼
[ticket-status-actions.tsx]
    │ Wizard: selecciona materiales del catálogo
    │ (autocompletado, stock visible)
    ▼
[changeTicketStatus() → lib/actions/tickets.ts]
    │ Estado: finalizado
    ▼
[lib/actions/inventario.ts]
    │ Transacción Firestore:
    │   1. Verificar stock suficiente
    │   2. Descontar stock
    │   3. Crear movimiento
    ▼
[Firestore: catalogo_productos]
[Firestore: catalogo_movimientos]
```

### 6.2 Inventario: Reversión
```
[Manager]
    │
    ▼
[changeTicketStatus() → lib/actions/tickets.ts]
    │ Estado: revertir finalizado → en_progreso
    ▼
[lib/actions/inventario.ts]
    │ Transacción Firestore:
    │   1. Leer materiales_usados del ticket
    │   2. Reintegrar stock
    │   3. Crear movimiento tipo "reversion"
    ▼
[Firestore: catalogo_productos]
[Firestore: catalogo_movimientos]
```

### 6.3 Clientes: Cotizaciones ↔ Tickets
```
[cotizaciones/quotation-builder.tsx]
    │
    ├── Buscar cliente ──> [Firestore: clientes]
    │      (autocompletado)
    │
    ├── Seleccionar cliente
    │      (auto-rellena campos, guarda cliente_id)
    │
    └── + Nuevo cliente
           │
           ▼
    [createCliente() → Firestore: clientes]
           │
           ▼
    [tickets/app/dashboard/clientes]
           (aparece inmediatamente)
```

### 6.4 Catálogo: Cotizaciones
```
[cotizaciones/catalog-manager.tsx]
    │
    ├── Leer catálogo ──> [Firestore: catalogo_productos]
    │      (cache localStorage para offline)
    │
    ├── Crear/editar producto
    │      (campos: stock, stockMinimo, ubicacion, costo)
    │
    └── Guardar ──> [Firestore: catalogo_productos]
           │
           ▼
    [tickets] puede leer el mismo catálogo
```

---

## 7. Decisiones Arquitectónicas

### 7.1 ¿Por qué Firestore y no Supabase?
Ambas apps ya usan Firebase/Firestore. Migrar a Supabase sería un proyecto aparte. La integración aprovecha la infraestructura existente.

### 7.2 ¿Por qué un paquete compartido?
- Vercel soporta pnpm workspaces nativamente
- Evita duplicación de tipos y lógica
- Cambios en tipos se propagan automáticamente

### 7.3 ¿Por qué no microservicios?
- Las apps son monolitos Next.js
- Firestore funciona como "backend-as-a-service"
- No hay necesidad de API REST intermedia

### 7.4 ¿Backward compatibility?
- Cotizaciones viejas sin `cliente_id` siguen funcionando
- Tickets viejos sin `producto_id` en materiales no afectan stock
- `CatalogItem` se mantiene como alias durante transición

---

## 8. Convenciones de Código

### Naming
- **Archivos**: kebab-case (`catalogo-producto.ts`)
- **Componentes**: PascalCase (`CatalogManager`)
- **Funciones/variables**: camelCase (`getCatalogoProductos`)
- **Tipos/Interfaces**: PascalCase (`CatalogoProducto`)
- **Constantes**: UPPER_SNAKE_CASE (`DEFAULT_CATALOG`)

### Imports
```typescript
// Orden: React/Next → shadcn/ui → shared → app lib → components → relative
import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { CatalogoProducto } from "@cops/shared"
import { formatCurrency } from "@/lib/quotation-types"
import { ProductCard } from "./product-card"
```

### Server Actions Pattern
```typescript
"use server"

export async function actionName(input: InputType): Promise<ActionResponse<OutputType>> {
  // 1. Auth
  // 2. Permisos
  // 3. Validación
  // 4. Ejecución
  // 5. Revalidar paths
  // 6. Retornar respuesta
}
```

---

## 9. Comandos Útiles

```bash
# Desde raíz del monorepo
corepack pnpm install
corepack pnpm dev:tickets      # puerto 3002
corepack pnpm dev:cotizaciones # puerto 3001
corepack pnpm dev:web          # puerto 3000

# TypeScript
cd apps/cotizaciones && npx tsc --noEmit
cd apps/tickets && npx tsc --noEmit

# Build
corepack pnpm --filter cotizaciones build
corepack pnpm --filter tickets build

# Shared package
cd packages/shared && pnpm build
```

---

## 10. Contacto y Soporte

**Empresa:** Cop's Electronics S.A.
**Teléfonos:** 0212-7934136 / 7940316
**Email:** proyectos@copselectronics.com
**Web:** [copselectronics.com](https://copselectronics.com)

---

*Este documento debe actualizarse cada vez que cambie la arquitectura del monorepo. La fuente de verdad es el código en `main`.*
