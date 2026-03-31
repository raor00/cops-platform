# Módulo de Tickets: arquitectura, rutas y puntos de control

## Objetivo

Documentar el estado real del módulo `apps/tickets` para poder revisarlo, mejorarlo y mantenerlo con menos fricción.

## Ubicación

- App: `/Users/oviedo/Documents/GitHub/cops-platform/apps/tickets`
- README del módulo: `/Users/oviedo/Documents/GitHub/cops-platform/apps/tickets/README.md`

## Stack real

- Next.js 16 con App Router
- React 19
- TypeScript
- Tailwind CSS + componentes sobre Radix UI
- Server Actions como capa principal de acceso a datos
- Tres modos de persistencia:
  - local/demo: `lib/mock-data.ts`
  - Firebase: `lib/firebase/*`
  - Supabase: `lib/supabase/*`

## Cómo decide el proveedor de datos

Archivo clave: `/Users/oviedo/Documents/GitHub/cops-platform/apps/tickets/lib/local-mode.ts`

Reglas actuales:

1. Si `TICKETS_LOCAL_MODE=true` o `NEXT_PUBLIC_TICKETS_LOCAL_MODE=true`, entra en modo local.
2. Si no hay credenciales públicas de Supabase, también entra en modo local.
3. Si NO está en local y existe `FIREBASE_PROJECT_ID`, entra en modo Firebase.
4. En cualquier otro caso usa Supabase.

## Rutas clave

### Acceso y sesión

- `/login` → formularios de autenticación
- `/auth/bridge` → puente de autenticación
- `middleware.ts` → protege rutas privadas y redirige según el modo activo

### Dashboard

- `/dashboard` → panel principal
- `/dashboard/tickets` → listado principal de tickets
- `/dashboard/tickets/nuevo` → creación de ticket
- `/dashboard/tickets/[id]` → detalle de ticket
- `/dashboard/tickets/[id]/editar` → edición
- `/dashboard/tickets/[id]/inspeccion` → inspección asociada
- `/dashboard/tickets/[id]/comprobante` → comprobante

### Dominios operativos adicionales

- `/dashboard/usuarios`
- `/dashboard/clientes`
- `/dashboard/pagos`
- `/dashboard/pipeline`
- `/dashboard/mantenimiento`
- `/dashboard/reportes`
- `/dashboard/configuracion`

## Capas principales

### 1. UI y rutas

- `/Users/oviedo/Documents/GitHub/cops-platform/apps/tickets/app/dashboard/tickets/page.tsx`
- `/Users/oviedo/Documents/GitHub/cops-platform/apps/tickets/app/dashboard/tickets/nuevo/create-ticket-form.tsx`
- `/Users/oviedo/Documents/GitHub/cops-platform/apps/tickets/app/dashboard/tickets/[id]/page.tsx`
- `/Users/oviedo/Documents/GitHub/cops-platform/apps/tickets/app/dashboard/tickets/[id]/ticket-status-actions.tsx`

### 2. Lógica de negocio y acceso a datos

- `/Users/oviedo/Documents/GitHub/cops-platform/apps/tickets/lib/actions/tickets.ts`
- `/Users/oviedo/Documents/GitHub/cops-platform/apps/tickets/lib/actions/dashboard.ts`
- `/Users/oviedo/Documents/GitHub/cops-platform/apps/tickets/lib/actions/pagos.ts`
- `/Users/oviedo/Documents/GitHub/cops-platform/apps/tickets/lib/actions/usuarios.ts`
- `/Users/oviedo/Documents/GitHub/cops-platform/apps/tickets/lib/actions/fotos.ts`
- `/Users/oviedo/Documents/GitHub/cops-platform/apps/tickets/lib/actions/inspecciones.ts`
- `/Users/oviedo/Documents/GitHub/cops-platform/apps/tickets/lib/actions/mantenimiento.ts`

### 3. Contratos de dominio

- `/Users/oviedo/Documents/GitHub/cops-platform/apps/tickets/types/index.ts`
- `/Users/oviedo/Documents/GitHub/cops-platform/apps/tickets/lib/validations/index.ts`

## Flujo principal del ticket

1. El usuario autenticado entra a `/dashboard/tickets`.
2. La vista consulta `getCurrentUser()` y `getTickets()`.
3. `getTickets()` resuelve el proveedor de datos activo.
4. La UI renderiza:
   - tabla para perfiles administrativos
   - lista móvil para técnicos
5. La edición, asignación, cambio de estado y cierre usan server actions del dominio.

## Reglas de negocio visibles en código

- Jerarquía de roles en `types/index.ts`
- Transiciones de estado válidas en `VALID_TRANSITIONS`
- Transiciones reversibles para gerente+ en `ADMIN_REVERSE_TRANSITIONS`
- La UI diferencia técnico vs roles administrativos desde la página de tickets

## Hallazgos técnicos

### Hallazgos confirmados

1. **El módulo concentra demasiada responsabilidad en pocos archivos**
   - `lib/actions/tickets.ts` supera 1000 líneas.
   - `app/dashboard/tickets/nuevo/create-ticket-form.tsx` supera 1100 líneas.
   - `lib/mock-data.ts` supera 1500 líneas.

2. **La documentación previa no refleja el estado real**
   - El README mencionaba `types/` y `supabase/schema.sql`, pero ese `schema.sql` no está versionado dentro de `apps/tickets`.
   - El módulo hoy soporta tres proveedores de datos, no solo Supabase.

3. **No hay suite de pruebas automatizadas visible en el módulo**
   - No se encontraron archivos de prueba versionados en `apps/tickets`.

4. **Hay deuda de tipado**
   - Existen castings con `as any` en rutas críticas de creación/actualización.

5. **Hay acoplamiento fuerte entre UI, reglas y persistencia**
   - La misma lógica de negocio se replica por proveedor o queda mezclada con composición de payloads.

## Riesgos prioritarios

### P1

- Cambios en tickets pueden introducir regresiones por tamaño y acoplamiento de `tickets.ts`.
- El formulario de creación es difícil de razonar y de probar.
- La falta de pruebas deja sin red de seguridad el flujo crítico del negocio.

### P2

- El modo local puede ocultar problemas reales de Supabase/Firebase.
- La documentación operativa puede inducir configuraciones incorrectas.

## Recomendaciones de mejora

### Corto plazo

1. Extraer el dominio de tickets por casos de uso:
   - lectura
   - creación
   - edición
   - transición de estado
   - auditoría
2. Separar validaciones y mapeos de payload del formulario de creación.
3. Eliminar `as any` de los flujos de ticket y usuarios.
4. Documentar variables de entorno por proveedor.

### Mediano plazo

1. Crear pruebas de integración para:
   - creación de ticket
   - cambio de estado
   - permisos por rol
2. Unificar contrato de repositorio para Firebase/Supabase/local.
3. Mover reglas de negocio a una capa de dominio independiente de la infraestructura.

## Subagentes recomendados para este módulo

- `code-mapper` → mapear rutas y ownership antes de tocar flujos grandes
- `nextjs-developer` → rutas App Router, Server Actions y boundaries server/client
- `typescript-pro` → sanear contratos, tipos y `as any`
- `fullstack-developer` → cambios end-to-end acotados
- `reviewer` → revisión funcional y riesgo de regresiones
- `architect-reviewer` → desacoplamiento y diseño del módulo
- `refactoring-specialist` → refactors sin cambio de comportamiento
- `documentation-engineer` → mantener docs alineadas con el código

## Checklist de revisión para próximos cambios

- Verificar modo de datos activo antes de cambiar lógica
- Confirmar permisos por rol
- Confirmar transición de estado válida
- Revisar impacto en dashboard, pagos e inspecciones
- Actualizar documentación si cambian rutas, contratos o variables de entorno
