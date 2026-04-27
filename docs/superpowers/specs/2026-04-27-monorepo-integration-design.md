# Spec: Integración de Inventario y Clientes entre Cotizaciones y Tickets

**Fecha:** 2026-04-27
**Estado:** Aprobado para implementación
**Autor:** AI Assistant
**Apps afectadas:** `apps/cotizaciones`, `apps/tickets`

---

## 1. Resumen Ejecutivo

Este spec define la integración arquitectónica entre las apps `cotizaciones` y `tickets` del monorepo COPS Platform, mediante la creación de un paquete compartido (`packages/shared`) y la migración del catálogo de productos a Firestore como fuente de verdad única.

### Objetivos
1. **Inventario centralizado**: El catálogo de productos vive en Firestore `catalogo_productos`, con campos de stock (`stock`, `stockMinimo`, `ubicacion`, `costo`).
2. **Deducción automática**: Cuando un ticket pasa a `finalizado`, los materiales usados se descuentan del stock. Si un gerente revierte el ticket, el stock se reintegra automáticamente.
3. **Clientes compartidos**: `cotizaciones` adopta la colección `clientes` de `tickets`, con autocompletado y creación cruzada.
4. **Todo material debe existir en catálogo**: No se permiten materiales ad-hoc. El técnico busca en el catálogo.

### Decisiones de Arquitectura Clave
| Decisión | Valor | Razonamiento |
|----------|-------|--------------|
| Paquete compartido | `packages/shared` | Vercel soporta pnpm workspaces nativamente |
| Base de datos | Firestore (existente) | Ambas apps ya usan Firebase |
| Reversión de stock | Opción B | Reintegración automática al revertir `finalizado` |
| Materiales ad-hoc | Prohibidos | Opción A — todo debe estar en catálogo |

---

## 2. Estado Actual

### apps/tickets
- **BD**: Firebase/Firestore
- **Clientes**: Colección `clientes` con CRUD completo (`lib/actions/clientes.ts`)
- **Materiales**: `Ticket.materiales_usados` es texto libre (array de `{nombre, cantidad, unidad}`)
- **Ticket finalization**: `changeTicketStatus()` en `lib/actions/tickets.ts` guarda materiales pero no toca inventario

### apps/cotizaciones
- **BD**: Firebase/Firestore (client-side SDK)
- **Catálogo**: `CatalogItem[]` en localStorage + sync parcial a Firestore `catalogo-custom`
- **Clientes**: `ClientInfo` es texto libre embebido en cada cotización
- **Colecciones Firestore**: `cotizaciones`, `catalogo-custom`, `catalogo-config`, `notas-entrega`, `guias-transporte`

### Monorepo
- `pnpm-workspace.yaml`: `packages: ["apps/*", "packages/*"]`
- `packages/` no existe — no hay código compartido
- Cada app es independiente con su propia config de Firebase

---

## 3. Estado Futuro (Target)

### Estructura del Monorepo
```
cops-platform/
├── apps/
│   ├── web/
│   ├── cotizaciones/
│   └── tickets/
├── packages/
│   └── shared/              ← NUEVO
│       ├── src/
│       │   ├── types/
│       │   │   ├── cliente.ts
│       │   │   ├── catalogo-producto.ts
│       │   │   └── movimiento-inventario.ts
│       │   └── firestore/
│       │       └── client.ts
│       ├── package.json
│       └── tsconfig.json
└── docs/
    └── monorepo-arquitectura.md
```

### Colecciones Firestore Compartidas
```
clientes/                    ← Existente (tickets), adoptada por cotizaciones
catalogo_productos/          ← NUEVA: catálogo con inventario
catalogo_movimientos/        ← NUEVA: cada entrada/salida de stock
cotizaciones/                ← Existente (cotizaciones)
tickets/                     ← Existente (tickets)
catalogo-custom/             ← DEPRECATED: migrar a catalogo_productos
catalogo-config/             ← Existente (cotizaciones descuentos)
```

### Flujo de Datos
```
[cotizaciones] ──crea/edita──> catalogo_productos
     │                              │
     │                              │ stock
     │                              │
     └──lee clientes<───────────────┘
                    
[tickets] ──usa materiales──> catalogo_productos (descuento)
     │                              │
     │                              │ reintegración
     │                              │ (si revertido)
     └──crea/lee clientes<─────────┘
```

---

## 4. Modelos de Datos

### 4.1 CatalogoProducto
```typescript
interface CatalogoProducto {
  id: string                    // Firestore auto-ID
  code: string                  // SKU único (indexado)
  description: string
  unitPrice: number             // Precio de venta
  costo?: number                // Costo de adquisición
  category: string              // CCTV, Control de Acceso, etc.
  brand?: string
  subcategory?: string
  variant?: string
  unit: string                  // UND, BOB, MTS, etc.
  imageUrl?: string
  stock: number                 // Cantidad actual (>= 0)
  stockMinimo: number           // Umbral de alerta
  ubicacion?: string            // Estante, bodega, etc.
  activo: boolean               // Disponible para venta
  created_at: string            // ISO 8601
  updated_at: string
}
```

**Reglas de validación**:
- `code` debe ser único (case-insensitive)
- `stock` nunca negativo
- `stockMinimo` >= 0
- `unitPrice` >= 0
- `costo` >= 0 (si existe)

### 4.2 MovimientoInventario
```typescript
interface MovimientoInventario {
  id: string
  producto_id: string           // Ref a catalogo_productos
  tipo: 'entrada' | 'salida' | 'reversion'
  cantidad: number              // Siempre positivo
  ticket_id?: string            // Si es salida/reversion por ticket
  cotizacion_id?: string        // Si es entrada por cotización
  notas?: string
  fecha: string                 // ISO 8601
  usuario_id: string            // Quién hizo el movimiento
}
```

### 4.3 Cliente (existente, a compartir)
```typescript
interface Cliente {
  id: string
  nombre: string
  apellido?: string
  empresa?: string
  email?: string
  telefono: string
  direccion: string
  rif_cedula?: string
  estado: 'activo' | 'inactivo'
  observaciones?: string
  contactos?: ClienteContacto[]
  created_at: string
  updated_at: string
}
```

---

## 5. Cambios por App

### 5.1 apps/cotizaciones

#### Catálogo
- `lib/quotation-types.ts`: `CatalogItem` se reemplaza por `CatalogoProducto` (importado de `packages/shared`)
- `lib/quotation-storage.ts`:
  - `getCatalog()`: Lee de Firestore `catalogo_productos` donde `activo == true`
  - `saveCatalogItem()`: Escribe a Firestore
  - `deleteCatalogItem()`: Soft-delete (`activo = false`) o hard-delete
  - Cache localStorage para offline
- `components/quotation/catalog/catalog-manager-dialogs.tsx`:
  - Campos nuevos: `stock`, `stockMinimo`, `ubicacion`, `costo`
  - Badge de stock en tarjetas

#### Clientes
- `lib/quotation-types.ts`: `ClientInfo` ahora opcionalmente incluye `cliente_id`
- `components/quotation/quotation-builder.tsx`:
  - `ClienteAutocomplete`: Busca en Firestore `clientes` por nombre/empresa/RIF
  - Botón "+ Nuevo Cliente": Abre dialog que crea en Firestore `clientes`
  - Al seleccionar cliente: auto-rellena campos, guarda `cliente_id`
- `lib/quotation-storage.ts`:
  - `getClientes()`, `searchClientes()`, `createCliente()` usan Firestore

### 5.2 apps/tickets

#### Inventario
- `lib/actions/inventario.ts` (NUEVO):
  - `getCatalogoProductos()`: Lee `catalogo_productos`
  - `descontarStock(ticketId, materiales[], usuarioId)`: Transacción Firestore
  - `reintegrarStock(ticketId, materiales[], usuarioId)`: Transacción Firestore
  - `getMovimientos(productoId?)`: Historial de movimientos
  - `getAlertasStock()`: Productos con `stock < stockMinimo`
- `lib/actions/tickets.ts`:
  - `changeTicketStatus()`:
    - Si pasa a `finalizado`: llama `descontarStock()`
    - Si revierte de `finalizado`: llama `reintegrarStock()`
- `components/tickets/ticket-status-actions.tsx`:
  - Wizard de materiales: autocompletado de catálogo
  - Muestra stock disponible
  - No permite agregar si stock < cantidad requerida
  - Valida que material exista en catálogo

#### Clientes
- Sin cambios — ya es la fuente de verdad

---

## 6. Reglas de Negocio

### 6.1 Deducción de Stock
1. Solo ocurre cuando `changeTicketStatus()` pasa a `finalizado`
2. Se ejecuta dentro de una **transacción Firestore**
3. Para cada material usado:
   - Buscar `CatalogoProducto` por `code` o `description`
   - Si no existe → **ERROR** (no se permite ad-hoc)
   - Si `stock < cantidad` → **ERROR** (stock insuficiente)
   - `stock -= cantidad`
   - Crear `MovimientoInventario` tipo `salida`
4. Si algún material falla → **transacción completa falla** (all-or-nothing)

### 6.2 Reintegración de Stock
1. Solo ocurre cuando `changeTicketStatus()` revierte de `finalizado`
2. Se ejecuta dentro de una **transacción Firestore**
3. Para cada material usado del ticket:
   - Buscar `CatalogoProducto` por `code`
   - `stock += cantidad`
   - Crear `MovimientoInventario` tipo `reversion`
4. La transacción es idempotente (si se reintenta, no duplica)

### 6.3 Alertas de Stock Bajo
1. Cada vez que cambia `stock` de un producto, se evalúa `stock < stockMinimo`
2. Si es true → se marca producto como "alerta" (campo `alertaStock: boolean`)
3. El dashboard de tickets muestra un widget/panel con productos en alerta
4. No se bloquea la venta/cotización, solo se alerta

---

## 7. Plan de Migración

### Paso 1: Migrar catálogo existente
1. Leer `DEFAULT_CATALOG` (61 items) + `catalogo-custom` (Firestore)
2. Para cada item, crear documento en `catalogo_productos` con:
   - `stock: 0`, `stockMinimo: 0`, `ubicacion: ""`, `costo: 0`, `activo: true`
3. Marcar `catalogo-custom` como deprecated

### Paso 2: Backward Compatibility
- `cotizaciones` sigue funcionando si no hay `cliente_id` en cotizaciones viejas
- `tickets` sigue funcionando si no hay movimientos de inventario en tickets viejos
- `CatalogItem` se mantiene como alias de `CatalogoProducto` durante la transición

---

## 8. Seguridad

### Firestore Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /catalogo_productos/{producto} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.token.rol in ['coordinador', 'gerente', 'vicepresidente', 'presidente'];
    }
    match /catalogo_movimientos/{movimiento} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if false; // Inmutable
    }
    match /clientes/{cliente} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.token.rol in ['coordinador', 'gerente', 'vicepresidente', 'presidente'];
    }
  }
}
```

---

## 9. Testing (Manual)

| Escenario | Pasos | Esperado |
|-----------|-------|----------|
| Crear producto con stock | Catalogo → Nuevo item → stock=10 | Producto aparece con stock=10 |
| Agregar a cotización | Cotización → picker → producto stock=10 | Stock no cambia |
| Usar material en ticket | Ticket → finalizar → material stock=10, cantidad=2 | Stock=8, movimiento creado |
| Revertir ticket | Ticket → revertir finalizado | Stock=10, movimiento de reversion |
| Stock insuficiente | Ticket → finalizar → material stock=1, cantidad=2 | Error: stock insuficiente |
| Material no existe | Ticket → finalizar → material "XYZ" no en catálogo | Error: material no encontrado |
| Cliente desde cotización | Cotización → autocomplete → seleccionar cliente | Cliente vinculado, campos rellenos |
| Crear cliente desde cotización | Cotización → + Nuevo cliente → guardar | Cliente aparece en tickets |

---

## 10. Riesgos y Mitigación

| Riesgo | Impacto | Probabilidad | Mitigación |
|--------|---------|--------------|------------|
| Fallo en transacción Firestore | Alto | Baja | Retry con backoff, rollback manual si necesario |
| Inconsistencia stock durante migración | Alto | Media | Migración en maintenance window, validación post-migración |
| Técnicos bloqueados por falta de stock | Alto | Media | Alertas visuales, pero no bloqueo; stock puede ajustarse manualmente |
| Duplicidad de datos (localStorage vs Firestore) | Medio | Media | Cache con TTL, invalidación en mutaciones |
| Performance Firestore en catálogo grande | Medio | Baja | Paginación, índices, cache local |

---

## 11. Checklist de Implementación

- [ ] Fase 1: Crear `packages/shared` con tipos y cliente Firestore
- [ ] Fase 2: Crear colección `catalogo_productos`, migrar datos
- [ ] Fase 3: Actualizar `cotizaciones` para leer/escribir catálogo en Firestore
- [ ] Fase 4: Agregar campos de inventario al form de producto
- [ ] Fase 5: Crear `lib/actions/inventario.ts` en tickets
- [ ] Fase 6: Integrar deducción/reintegración en `changeTicketStatus()`
- [ ] Fase 7: Wizard de materiales con autocompletado de catálogo
- [ ] Fase 8: Clientes compartidos (autocomplete + creación cruzada)
- [ ] Fase 9: Panel de alertas de stock bajo
- [ ] Fase 10: Documentación y validación
