-- ═══════════════════════════════════════════════════════════════════════════
-- COPS ELECTRONICS - SISTEMA DE TICKETS
-- Script de creación de base de datos para Supabase
-- ═══════════════════════════════════════════════════════════════════════════

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLA: users (Usuarios del sistema con roles jerárquicos)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  rol VARCHAR(20) NOT NULL CHECK (rol IN ('tecnico', 'coordinador', 'gerente', 'vicepresidente', 'presidente')),
  nivel_jerarquico SMALLINT NOT NULL CHECK (nivel_jerarquico BETWEEN 1 AND 5),
  telefono VARCHAR(20),
  cedula VARCHAR(20) UNIQUE,
  estado VARCHAR(10) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_rol ON public.users(rol);
CREATE INDEX IF NOT EXISTS idx_users_estado ON public.users(estado);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLA: tickets (Servicios y Proyectos)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_ticket VARCHAR(20) UNIQUE NOT NULL,
  tipo VARCHAR(10) NOT NULL DEFAULT 'servicio' CHECK (tipo IN ('servicio', 'proyecto')),
  
  -- Datos del cliente
  cliente_nombre VARCHAR(150) NOT NULL,
  cliente_empresa VARCHAR(150),
  cliente_email VARCHAR(100),
  cliente_telefono VARCHAR(20) NOT NULL,
  cliente_direccion TEXT NOT NULL,
  
  -- Descripción del trabajo
  asunto VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  requerimientos TEXT NOT NULL,
  materiales_planificados JSONB,
  prioridad VARCHAR(10) NOT NULL DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta', 'urgente')),
  origen VARCHAR(20) NOT NULL CHECK (origen IN ('email', 'telefono', 'carta_aceptacion')),
  carta_aceptacion_path VARCHAR(255),
  
  -- Asignación y estados
  creado_por UUID NOT NULL REFERENCES public.users(id),
  tecnico_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  estado VARCHAR(15) NOT NULL DEFAULT 'asignado' CHECK (estado IN ('asignado', 'iniciado', 'en_progreso', 'finalizado', 'cancelado')),
  fecha_asignacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_inicio TIMESTAMPTZ,
  fecha_finalizacion TIMESTAMPTZ,
  
  -- Datos del técnico (al finalizar)
  materiales_usados JSONB,
  tiempo_trabajado INTEGER, -- En minutos
  observaciones_tecnico TEXT,
  solucion_aplicada TEXT,
  comprobante_path VARCHAR(255),
  
  -- Financiero
  monto_servicio DECIMAL(10,2) NOT NULL DEFAULT 40.00,
  
  -- Auditoría
  modificado_por UUID REFERENCES public.users(id) ON DELETE SET NULL,
  fecha_ultima_modificacion TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para tickets
CREATE INDEX IF NOT EXISTS idx_tickets_tipo ON public.tickets(tipo);
CREATE INDEX IF NOT EXISTS idx_tickets_estado ON public.tickets(estado);
CREATE INDEX IF NOT EXISTS idx_tickets_tecnico ON public.tickets(tecnico_id);
CREATE INDEX IF NOT EXISTS idx_tickets_prioridad ON public.tickets(prioridad);
CREATE INDEX IF NOT EXISTS idx_tickets_creado_por ON public.tickets(creado_por);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON public.tickets(created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLA: pagos_tecnicos (Gestión de pagos a técnicos)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.pagos_tecnicos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  tecnico_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  monto_ticket DECIMAL(10,2) NOT NULL,
  porcentaje_comision DECIMAL(5,2) NOT NULL DEFAULT 50.00,
  monto_a_pagar DECIMAL(10,2) NOT NULL,
  estado_pago VARCHAR(10) NOT NULL DEFAULT 'pendiente' CHECK (estado_pago IN ('pendiente', 'pagado')),
  fecha_habilitacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_pago TIMESTAMPTZ,
  metodo_pago VARCHAR(15) CHECK (metodo_pago IN ('efectivo', 'transferencia', 'deposito', 'cheque')),
  referencia_pago VARCHAR(100),
  pagado_por UUID REFERENCES public.users(id) ON DELETE SET NULL,
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para pagos_tecnicos
CREATE INDEX IF NOT EXISTS idx_pagos_estado ON public.pagos_tecnicos(estado_pago);
CREATE INDEX IF NOT EXISTS idx_pagos_tecnico ON public.pagos_tecnicos(tecnico_id);
CREATE INDEX IF NOT EXISTS idx_pagos_ticket ON public.pagos_tecnicos(ticket_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLA: historial_cambios (Auditoría de acciones)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.historial_cambios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.users(id),
  tipo_cambio VARCHAR(20) NOT NULL CHECK (tipo_cambio IN ('creacion', 'asignacion', 'cambio_estado', 'modificacion', 'finalizacion')),
  campo_modificado VARCHAR(100),
  valor_anterior TEXT,
  valor_nuevo TEXT,
  observacion TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para historial_cambios
CREATE INDEX IF NOT EXISTS idx_historial_ticket ON public.historial_cambios(ticket_id);
CREATE INDEX IF NOT EXISTS idx_historial_tipo ON public.historial_cambios(tipo_cambio);
CREATE INDEX IF NOT EXISTS idx_historial_created_at ON public.historial_cambios(created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLA: configuracion_sistema (Parámetros configurables)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.configuracion_sistema (
  id SERIAL PRIMARY KEY,
  clave VARCHAR(100) UNIQUE NOT NULL,
  valor TEXT NOT NULL,
  descripcion TEXT,
  tipo_dato VARCHAR(10) DEFAULT 'string' CHECK (tipo_dato IN ('string', 'number', 'boolean', 'json')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Valores iniciales de configuración
INSERT INTO public.configuracion_sistema (clave, valor, descripcion, tipo_dato) VALUES
  ('monto_servicio_base', '40.00', 'Monto estándar por servicio individual', 'number'),
  ('porcentaje_comision_tecnico', '50.00', 'Porcentaje de comisión para técnicos', 'number'),
  ('prefijo_ticket_servicio', 'TKT', 'Prefijo para numeración de servicios', 'string'),
  ('prefijo_ticket_proyecto', 'PRY', 'Prefijo para numeración de proyectos', 'string')
ON CONFLICT (clave) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- FUNCIONES Y TRIGGERS
-- ─────────────────────────────────────────────────────────────────────────────

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tickets_updated_at ON public.tickets;
CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pagos_updated_at ON public.pagos_tecnicos;
CREATE TRIGGER update_pagos_updated_at
  BEFORE UPDATE ON public.pagos_tecnicos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────────────────────────

-- Habilitar RLS en todas las tablas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos_tecnicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historial_cambios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracion_sistema ENABLE ROW LEVEL SECURITY;

-- Políticas para users
CREATE POLICY "Users can view all users" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Only managers can insert users" ON public.users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND nivel_jerarquico >= 3
    )
  );

CREATE POLICY "Only managers can update users" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND nivel_jerarquico >= 3
    )
  );

-- Políticas para tickets
CREATE POLICY "Technicians can view their own tickets" ON public.tickets
  FOR SELECT USING (
    tecnico_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND nivel_jerarquico >= 2
    )
  );

CREATE POLICY "Coordinators can create tickets" ON public.tickets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND nivel_jerarquico >= 2
    )
  );

CREATE POLICY "Only managers can update tickets" ON public.tickets
  FOR UPDATE USING (
    -- Técnicos solo pueden cambiar estado de sus tickets
    (tecnico_id = auth.uid()) OR
    -- Gerentes pueden modificar todo
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND nivel_jerarquico >= 3
    )
  );

CREATE POLICY "Only managers can delete tickets" ON public.tickets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND nivel_jerarquico >= 3
    )
  );

-- Políticas para pagos_tecnicos
CREATE POLICY "Only managers can view payments" ON public.pagos_tecnicos
  FOR SELECT USING (
    tecnico_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND nivel_jerarquico >= 3
    )
  );

CREATE POLICY "Only managers can manage payments" ON public.pagos_tecnicos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND nivel_jerarquico >= 3
    )
  );

-- Políticas para historial_cambios
CREATE POLICY "Coordinators can view history" ON public.historial_cambios
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND nivel_jerarquico >= 2
    )
  );

CREATE POLICY "System can insert history" ON public.historial_cambios
  FOR INSERT WITH CHECK (true);

-- Políticas para configuracion_sistema
CREATE POLICY "Everyone can view config" ON public.configuracion_sistema
  FOR SELECT USING (true);

CREATE POLICY "Only VP+ can update config" ON public.configuracion_sistema
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND nivel_jerarquico >= 4
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- USUARIO ADMINISTRADOR INICIAL (opcional - ejecutar manualmente)
-- ─────────────────────────────────────────────────────────────────────────────

-- NOTA: Primero debes crear el usuario en Supabase Auth, luego ejecutar:
-- INSERT INTO public.users (id, nombre, apellido, email, rol, nivel_jerarquico, cedula)
-- VALUES ('UUID_DEL_USUARIO_AUTH', 'Admin', 'Sistema', 'admin@copselectronics.com', 'presidente', 5, 'V-00000000');

-- ═══════════════════════════════════════════════════════════════════════════
-- EXTENSIONES v2 - REDISEÑO SISTEMA DE TICKETS
-- Sprint 1: Schema Extensions para gestión completa de proyectos/servicios
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- NUEVAS COLUMNAS EN TABLAS EXISTENTES
-- ─────────────────────────────────────────────────────────────────────────────

-- Extensiones tabla users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS foto_perfil_path TEXT,
  ADD COLUMN IF NOT EXISTS especialidad VARCHAR(100),
  ADD COLUMN IF NOT EXISTS activo_desde TIMESTAMPTZ DEFAULT NOW();

-- Extensiones tabla tickets
ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS progreso_porcentaje SMALLINT DEFAULT 0 CHECK (progreso_porcentaje BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS fecha_estimada_fin TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS notas_internas TEXT,
  ADD COLUMN IF NOT EXISTS carta_aceptacion_storage_path TEXT,
  ADD COLUMN IF NOT EXISTS comprobante_storage_path TEXT;

-- Extender tipo_cambio en historial_cambios para nuevos eventos
ALTER TABLE public.historial_cambios
  DROP CONSTRAINT IF EXISTS historial_cambios_tipo_cambio_check;
ALTER TABLE public.historial_cambios
  ADD CONSTRAINT historial_cambios_tipo_cambio_check
  CHECK (tipo_cambio IN (
    'creacion', 'asignacion', 'cambio_estado', 'modificacion', 'finalizacion',
    'foto_subida', 'inspeccion', 'sesion_trabajo', 'bloqueador'
  ));

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLA: ticket_fases (Fases e hitos de proyectos)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.ticket_fases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  orden SMALLINT NOT NULL DEFAULT 0,
  estado VARCHAR(15) NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'en_progreso', 'completada', 'cancelada')),
  progreso_porcentaje SMALLINT DEFAULT 0 CHECK (progreso_porcentaje BETWEEN 0 AND 100),
  fecha_inicio_estimada TIMESTAMPTZ,
  fecha_fin_estimada TIMESTAMPTZ,
  fecha_inicio_real TIMESTAMPTZ,
  fecha_fin_real TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fases_ticket ON public.ticket_fases(ticket_id);
CREATE INDEX IF NOT EXISTS idx_fases_orden ON public.ticket_fases(ticket_id, orden);

DROP TRIGGER IF EXISTS update_ticket_fases_updated_at ON public.ticket_fases;
CREATE TRIGGER update_ticket_fases_updated_at
  BEFORE UPDATE ON public.ticket_fases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLA: ticket_fotos (Galería de fotos por ticket)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.ticket_fotos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  subido_por UUID NOT NULL REFERENCES public.users(id),
  storage_path TEXT NOT NULL,
  nombre_archivo VARCHAR(255) NOT NULL,
  tipo_foto VARCHAR(20) NOT NULL DEFAULT 'progreso'
    CHECK (tipo_foto IN ('progreso', 'inspeccion', 'documento', 'antes', 'despues')),
  descripcion TEXT,
  tamanio_bytes INTEGER,
  mime_type VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fotos_ticket ON public.ticket_fotos(ticket_id);
CREATE INDEX IF NOT EXISTS idx_fotos_tipo ON public.ticket_fotos(ticket_id, tipo_foto);
CREATE INDEX IF NOT EXISTS idx_fotos_subido_por ON public.ticket_fotos(subido_por);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLA: ticket_sesiones_trabajo (Registro de sesiones de trabajo por técnico)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.ticket_sesiones_trabajo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  tecnico_id UUID NOT NULL REFERENCES public.users(id),
  fecha_inicio TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_fin TIMESTAMPTZ,
  duracion_minutos INTEGER,
  notas TEXT,
  estado_al_inicio VARCHAR(15),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sesiones_ticket ON public.ticket_sesiones_trabajo(ticket_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_tecnico ON public.ticket_sesiones_trabajo(tecnico_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLA: inspecciones (Levantamiento de información / inspección técnica)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.inspecciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  realizado_por UUID NOT NULL REFERENCES public.users(id),
  fecha_inspeccion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  datos_checklist JSONB NOT NULL DEFAULT '[]',
  observaciones_generales TEXT,
  recomendaciones TEXT,
  materiales_requeridos JSONB DEFAULT '[]',
  estado VARCHAR(20) NOT NULL DEFAULT 'borrador'
    CHECK (estado IN ('borrador', 'completada', 'reportada')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inspecciones_ticket ON public.inspecciones(ticket_id);
CREATE INDEX IF NOT EXISTS idx_inspecciones_realizado_por ON public.inspecciones(realizado_por);

DROP TRIGGER IF EXISTS update_inspecciones_updated_at ON public.inspecciones;
CREATE TRIGGER update_inspecciones_updated_at
  BEFORE UPDATE ON public.inspecciones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY - Nuevas tablas
-- ─────────────────────────────────────────────────────────────────────────────

-- RLS: ticket_fases
ALTER TABLE public.ticket_fases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Technicians view fases of own tickets" ON public.ticket_fases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = ticket_id AND (
        t.tecnico_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND nivel_jerarquico >= 2)
      )
    )
  );

CREATE POLICY "Coordinators manage fases" ON public.ticket_fases
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND nivel_jerarquico >= 2)
  );

-- RLS: ticket_fotos
ALTER TABLE public.ticket_fotos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can upload own photos" ON public.ticket_fotos
  FOR INSERT WITH CHECK (subido_por = auth.uid());

CREATE POLICY "View fotos by ticket access" ON public.ticket_fotos
  FOR SELECT USING (
    subido_por = auth.uid() OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND nivel_jerarquico >= 2)
  );

CREATE POLICY "Managers can delete photos" ON public.ticket_fotos
  FOR DELETE USING (
    subido_por = auth.uid() OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND nivel_jerarquico >= 3)
  );

-- RLS: ticket_sesiones_trabajo
ALTER TABLE public.ticket_sesiones_trabajo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Technicians manage own sessions" ON public.ticket_sesiones_trabajo
  FOR ALL USING (
    tecnico_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND nivel_jerarquico >= 2)
  );

-- RLS: inspecciones
ALTER TABLE public.inspecciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Technicians manage own inspections" ON public.inspecciones
  FOR ALL USING (
    realizado_por = auth.uid() OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND nivel_jerarquico >= 2)
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- STORAGE BUCKETS (ejecutar en Supabase Dashboard > Storage, o via API)
-- ─────────────────────────────────────────────────────────────────────────────
-- Bucket: ticket-fotos      (privado, max 10MB por archivo)
-- Bucket: ticket-documentos (privado, max 20MB por archivo)
-- Bucket: user-avatars      (privado, max 2MB por archivo)
--
-- Política de Storage recomendada:
-- ticket-fotos: autenticados pueden subir, solo dueño o gerente+ puede eliminar
-- ─────────────────────────────────────────────────────────────────────────────
