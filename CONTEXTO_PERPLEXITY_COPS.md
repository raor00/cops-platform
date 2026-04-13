# Contexto resumido para continuar en Perplexity

## Proyecto

Estoy trabajando en un monorepo llamado **COPS Platform**.

La app principal que estoy usando es:

- `apps/tickets`

Es un sistema web para gestión de tickets, servicios técnicos, proyectos, pagos a técnicos, clientes, mantenimiento y reportes operativos.

---

## Estado actual del módulo tickets

### Arquitectura real

El módulo `apps/tickets` ya fue limpiado y quedó con arquitectura de dos modos:

- `local`
- `firebase`

**Supabase fue eliminado del módulo `tickets`** como proveedor activo y también se removieron helpers/ramas legacy.

### Stack principal

- Next.js App Router
- TypeScript
- Firebase Authentication
- Firestore
- Cloudinary para archivos (con compatibilidad/fallback en algunos flujos)
- Tailwind CSS
- Radix UI
- React Hook Form + Zod

---

## Funcionalidades importantes ya implementadas

### Tickets
- creación de tickets
- edición de tickets
- bitácora editable/eliminable
- documentos con tipos nuevos
- fotos y documentos mostrando fecha/hora exacta en hora Venezuela
- fecha de servicio
- registro manual de llegada al sitio
- pausa / continuar mañana
- reanudación del trabajo
- métricas de duración trabajada y tiempo total

### Pipeline
- vista Tablero
- vista Calendario mensual
- calendario compacto para móvil

### Reportes
- filtros por mes, cliente, sede/agencia y técnico
- resumen por cliente y sede/agencia
- detalle Bancaribe por agencia
- cupones Bancaribe
- reporte por técnico
- detalle ticket por ticket
- exportación CSV
- exportación PDF imprimible
- preset General, Bancaribe y Por técnico

### Usuarios
- creación de técnicos sin correo ni contraseña
- posibilidad de completar acceso luego desde perfil
- ese acceso se enlaza con Firebase Auth usando el mismo UID del perfil

---

## Estado de documentación y defensa

Ya existen estos archivos de apoyo:

- `DOCUMENTACION_TRABAJO_GRADO.md` → documento principal del trabajo
- `NOTEBOOKLM_TRABAJO_GRADO_COPS.md` → resumen optimizado para estudio
- `PROMPT_GAMMA_PRESENTACION_COPS.md` → prompt para crear presentación en Gamma
- `DEFENSA_18_MINUTOS_COPS.md` → guion optimizado para defensa oral de 18 minutos
- `PREGUNTAS_JURADO_COPS.md` → preguntas probables del jurado y respuestas modelo
- `GUIA_NOTEBOOKLM_DEFENSA_COPS.md` → guía para estudiar con NotebookLM
- `FLUJO_PRESENTACION_NOTEBOOKLM_GAMMA_COPS.md` → flujo recomendado para crear presentación y luego generar speech con NotebookLM

---

## Necesidad actual

Quiero continuar preparando la defensa del trabajo de grado y/o mejorar la presentación, el discurso oral, la estructura de láminas y las respuestas al jurado basadas en el estado técnico real del proyecto.

Cuando respondas, asume que:

1. el módulo `apps/tickets` ya fue limpiado de Supabase
2. no quiero reintroducir arquitectura vieja
3. necesito respuestas profesionales, claras y útiles para defensa académica
4. mi tiempo de defensa total es de **18 minutos**, incluyendo presentación y demo
