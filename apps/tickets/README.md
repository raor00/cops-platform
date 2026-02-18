# Sistema de Tickets - COP'S Electronics

Sistema de gestión de servicios y proyectos para COP'S Electronics, desarrollado como trabajo de grado.

## 🚀 Características

### Gestión de Tickets
- **Creación de tickets** (servicios $40 fijo o proyectos con monto variable)
- **Máquina de estados**: Asignado → Iniciado → En Progreso → Finalizado/Cancelado
- **Asignación de técnicos** con control de permisos
- **Historial de cambios** completo para auditoría

### Sistema de Roles (RBAC)
| Rol | Nivel | Permisos |
|-----|-------|----------|
| Técnico | 1 | Ver/cambiar estado de sus tickets |
| Coordinador | 2 | Crear tickets, ver todos, asignar técnicos |
| Gerente | 3 | Todo lo anterior + editar/eliminar tickets, gestionar usuarios y pagos |
| Vicepresidente | 4 | Todo lo anterior + configuración del sistema |
| Presidente | 5 | Control total |

### Regla Crítica de Inmutabilidad
> Una vez creado, el **Coordinador NO puede modificar** el ticket. Solo Gerente, Vicepresidente o Presidente pueden editar.

### Gestión de Pagos
- Pago automático habilitado al finalizar ticket
- Comisión del 50% para técnicos (configurable)
- Registro de método de pago y referencia

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 16 (App Router)
- **Estilos**: Tailwind CSS + Glass Morphism
- **Base de datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Validaciones**: Zod + React Hook Form
- **UI Components**: Radix UI

## 📁 Estructura del Proyecto

```
apps/tickets/
├── app/
│   ├── login/              # Autenticación
│   ├── dashboard/
│   │   ├── page.tsx        # Dashboard principal
│   │   ├── tickets/        # CRUD de tickets
│   │   ├── usuarios/       # Gestión de usuarios
│   │   ├── pagos/          # Gestión de pagos
│   │   └── reportes/       # Reportes y estadísticas
│   └── api/                # API Routes
├── components/
│   ├── ui/                 # Componentes base (Button, Input, Card...)
│   ├── layout/             # Sidebar, Header
│   └── tickets/            # Componentes específicos de tickets
├── lib/
│   ├── actions/            # Server Actions
│   ├── supabase/           # Configuración Supabase
│   ├── utils/              # Utilidades
│   └── validations/        # Esquemas Zod
├── types/                  # TypeScript types
└── supabase/
    └── schema.sql          # Script de base de datos
```

## 🚀 Instalación

### 1. Requisitos previos
- Node.js 18+
- pnpm 10+
- Cuenta en Supabase

### 2. Configurar Supabase

1. Crear proyecto en [Supabase](https://supabase.com)
2. Ejecutar el script `supabase/schema.sql` en el SQL Editor
3. Copiar las credenciales

### 3. Variables de entorno

```bash
cp .env.example .env.local
```

Editar `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

### 4. Instalar dependencias

```bash
# Desde la raíz del monorepo
corepack pnpm install
```

### 5. Ejecutar en desarrollo

```bash
corepack pnpm dev:tickets
```

La app estará disponible en `http://localhost:3002`

### 6. Crear usuario administrador

1. En Supabase Dashboard → Authentication → Users → Add User
2. Ejecutar en SQL Editor:
```sql
INSERT INTO public.users (id, nombre, apellido, email, rol, nivel_jerarquico, cedula)
VALUES ('UUID_DEL_USUARIO', 'Admin', 'Sistema', 'admin@copselectronics.com', 'presidente', 5, 'V-00000000');
```

## 📋 Flujo del Proceso

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO DE UN TICKET                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📧 Solicitud → 📝 Creación → 👷 Asignación → 🔧 Ejecución      │
│    (email/tel)   (Coordinador)  (Técnico)     (Técnico)         │
│                                                                  │
│  Estados: ASIGNADO → INICIADO → EN_PROGRESO → FINALIZADO       │
│                                    ↓                             │
│                                CANCELADO                         │
│                                                                  │
│  Al FINALIZAR:                                                   │
│  💰 Se habilita pago automático al técnico (50% del monto)      │
│  📄 Se puede generar PDF del servicio                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 🔒 Seguridad

- **Row Level Security (RLS)** en todas las tablas
- **Middleware** de autenticación en todas las rutas
- **Validación** de permisos en cada Server Action
- **Auditoría** completa de cambios

## 📦 Deploy en Vercel

1. Conectar repositorio a Vercel
2. Configurar Root Directory: `apps/tickets`
3. Agregar variables de entorno
4. Deploy

## 🔗 Integración con otros módulos

Este módulo se integra con:
- **apps/web**: Página web corporativa
- **apps/cotizaciones**: Sistema de cotizaciones

Cuando llega una solicitud de cotización por email, se puede:
1. Registrar como ticket de tipo "proyecto"
2. Notificar al sistema de cotizaciones

---

Desarrollado para COP'S Electronics, S.A. - Trabajo de Grado 2025
