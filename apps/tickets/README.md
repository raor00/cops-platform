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
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS + componentes UI propios sobre Radix UI
- **Datos**:
  - **Modo local/demo** con datos mock
  - **Modo Firebase** con Firestore + Firebase Auth
  - **Modo Supabase** con PostgreSQL + Supabase Auth
- **Validaciones**: Zod + React Hook Form
- **Gráficas**: Recharts

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
│   ├── actions/            # Server Actions por dominio
│   ├── firebase/           # Integración Firebase/Auth/Firestore
│   ├── mock-data.ts        # Datos demo y helpers de modo local
│   ├── local-mode.ts       # Selección de proveedor de datos
│   ├── utils/              # Utilidades
│   └── validations/        # Esquemas Zod
├── types/
│   └── index.ts            # Contratos de dominio compartidos
└── middleware.ts           # Protección de rutas y sesión
```

## 🚀 Instalación

### 1. Requisitos previos
- Node.js 18+
- pnpm 10+
- Proyecto Firebase

### 2. Configurar proveedor de datos

Este módulo soporta dos modos:

- **Local/demo**: se activa automáticamente si no hay credenciales de Firebase.
- **Firebase**: requiere `FIREBASE_PROJECT_ID` y credenciales de servicio.

### 3. Variables de entorno

```bash
cp .env.example .env.local
```

Editar `.env.local` según el modo:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
FIREBASE_PROJECT_ID=tu_project_id
FIREBASE_CLIENT_EMAIL=tu_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Opcional: forzar modo local/demo
TICKETS_LOCAL_MODE=true
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

## 🔒 Seguridad y control de acceso

- **Row Level Security (RLS)** en todas las tablas
- **Middleware** de autenticación en todas las rutas
- **Validación** de permisos en cada Server Action
- **Auditoría** completa de cambios

## 📚 Documentación adicional

- Arquitectura y mapa técnico: `/Users/oviedo/Documents/GitHub/cops-platform/docs/TICKETS-MODULE.md`
- Subagentes instalados para Codex: `/Users/oviedo/Documents/GitHub/cops-platform/docs/CODEX-SUBAGENTS.md`

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
