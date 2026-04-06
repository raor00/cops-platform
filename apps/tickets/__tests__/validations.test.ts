import { describe, it, expect } from 'vitest'
import {
  loginSchema,
  userCreateSchema,
  ticketCreateSchema,
  paymentProcessSchema,
  ticketTechnicianSchema,
} from '@/lib/validations'

// ─── loginSchema ──────────────────────────────────────────────────────────────

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({ identifier: 'admin@cops.com', password: 'secret123' })
    expect(result.success).toBe(true)
  })

  it('rejects empty identifier', () => {
    const result = loginSchema.safeParse({ identifier: '', password: 'secret123' })
    expect(result.success).toBe(false)
  })

  it('rejects missing identifier', () => {
    const result = loginSchema.safeParse({ password: 'secret123' })
    expect(result.success).toBe(false)
  })

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({ identifier: 'user', password: '' })
    expect(result.success).toBe(false)
  })

  it('rejects password shorter than 6 characters', () => {
    const result = loginSchema.safeParse({ identifier: 'user', password: '12345' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/6/)
    }
  })

  it('accepts exactly 6-character password', () => {
    const result = loginSchema.safeParse({ identifier: 'user', password: '123456' })
    expect(result.success).toBe(true)
  })

  it('accepts non-email identifier (username)', () => {
    const result = loginSchema.safeParse({ identifier: 'username', password: 'secure123' })
    expect(result.success).toBe(true)
  })
})

// ─── userCreateSchema ─────────────────────────────────────────────────────────

describe('userCreateSchema', () => {
  const base = {
    nombre: 'Juan',
    apellido: 'Perez',
    email: 'juan@cops.com',
    password: 'secure123',
    rol: 'tecnico' as const,
    cedula: 'V-12345678',
  }

  it('accepts a fully valid user', () => {
    expect(userCreateSchema.safeParse(base).success).toBe(true)
  })

  it('accepts valid user with optional telefono', () => {
    expect(userCreateSchema.safeParse({ ...base, telefono: '+58 412 000 0000' }).success).toBe(true)
  })

  it('accepts empty string for telefono (optional)', () => {
    expect(userCreateSchema.safeParse({ ...base, telefono: '' }).success).toBe(true)
  })

  it('rejects nombre shorter than 2 characters', () => {
    expect(userCreateSchema.safeParse({ ...base, nombre: 'A' }).success).toBe(false)
  })

  it('rejects nombre exceeding 100 characters', () => {
    expect(userCreateSchema.safeParse({ ...base, nombre: 'A'.repeat(101) }).success).toBe(false)
  })

  it('rejects invalid email', () => {
    expect(userCreateSchema.safeParse({ ...base, email: 'not-an-email' }).success).toBe(false)
  })

  it('rejects password shorter than 6 characters', () => {
    expect(userCreateSchema.safeParse({ ...base, password: '12345' }).success).toBe(false)
  })

  it('rejects password longer than 72 characters', () => {
    expect(userCreateSchema.safeParse({ ...base, password: 'a'.repeat(73) }).success).toBe(false)
  })

  it('rejects invalid rol', () => {
    expect(userCreateSchema.safeParse({ ...base, rol: 'superadmin' }).success).toBe(false)
  })

  it.each(['tecnico', 'coordinador', 'gerente', 'vicepresidente', 'presidente'] as const)(
    'accepts rol: %s',
    (rol) => {
      expect(userCreateSchema.safeParse({ ...base, rol }).success).toBe(true)
    }
  )

  it('rejects missing cedula', () => {
    const { cedula: _removed, ...noCedula } = base
    expect(userCreateSchema.safeParse(noCedula).success).toBe(false)
  })

  it('rejects cedula exceeding 20 characters', () => {
    expect(userCreateSchema.safeParse({ ...base, cedula: '1'.repeat(21) }).success).toBe(false)
  })
})

// ─── ticketCreateSchema ───────────────────────────────────────────────────────

describe('ticketCreateSchema', () => {
  const base = {
    tipo: 'servicio' as const,
    cliente_nombre: 'Empresa ABC',
    cliente_telefono: '+58 212 000 0000',
    cliente_direccion: 'Caracas, Venezuela',
    asunto: 'Instalación CCTV',
    descripcion: 'Instalar 4 cámaras en oficina',
    prioridad: 'media' as const,
    origen: 'email' as const,
    tecnico_id: 'tech-uuid-123',
  }

  it('accepts a minimal valid ticket', () => {
    expect(ticketCreateSchema.safeParse(base).success).toBe(true)
  })

  it('accepts all valid tipos', () => {
    for (const tipo of ['servicio', 'proyecto', 'inspeccion'] as const) {
      expect(ticketCreateSchema.safeParse({ ...base, tipo }).success).toBe(true)
    }
  })

  it('rejects invalid tipo', () => {
    expect(ticketCreateSchema.safeParse({ ...base, tipo: 'reparacion' }).success).toBe(false)
  })

  it('accepts all valid prioridades', () => {
    for (const prioridad of ['baja', 'media', 'alta', 'urgente'] as const) {
      expect(ticketCreateSchema.safeParse({ ...base, prioridad }).success).toBe(true)
    }
  })

  it('rejects invalid prioridad', () => {
    expect(ticketCreateSchema.safeParse({ ...base, prioridad: 'critica' }).success).toBe(false)
  })

  it('accepts all valid origenes', () => {
    for (const origen of ['email', 'telefono', 'carta_aceptacion'] as const) {
      expect(ticketCreateSchema.safeParse({ ...base, origen }).success).toBe(true)
    }
  })

  it('rejects invalid origen', () => {
    expect(ticketCreateSchema.safeParse({ ...base, origen: 'whatsapp' }).success).toBe(false)
  })

  it('rejects empty cliente_nombre', () => {
    expect(ticketCreateSchema.safeParse({ ...base, cliente_nombre: '' }).success).toBe(false)
  })

  it('rejects cliente_nombre exceeding 150 characters', () => {
    expect(ticketCreateSchema.safeParse({ ...base, cliente_nombre: 'A'.repeat(151) }).success).toBe(false)
  })

  it('rejects empty tecnico_id', () => {
    expect(ticketCreateSchema.safeParse({ ...base, tecnico_id: '' }).success).toBe(false)
  })

  it('accepts optional numero_carta as empty string', () => {
    expect(ticketCreateSchema.safeParse({ ...base, numero_carta: '' }).success).toBe(true)
  })

  it('rejects numero_carta exceeding 50 characters', () => {
    expect(ticketCreateSchema.safeParse({ ...base, numero_carta: 'N'.repeat(51) }).success).toBe(false)
  })

  it('accepts optional tipo_mantenimiento when tipo is servicio', () => {
    expect(ticketCreateSchema.safeParse({ ...base, tipo_mantenimiento: 'correctivo' }).success).toBe(true)
    expect(ticketCreateSchema.safeParse({ ...base, tipo_mantenimiento: 'preventivo' }).success).toBe(true)
  })

  it('rejects invalid tipo_mantenimiento', () => {
    expect(ticketCreateSchema.safeParse({ ...base, tipo_mantenimiento: 'mixto' }).success).toBe(false)
  })

  it('rejects invalid cliente_email when provided', () => {
    expect(ticketCreateSchema.safeParse({ ...base, cliente_email: 'not-an-email' }).success).toBe(false)
  })

  it('accepts empty string for cliente_email (optional)', () => {
    expect(ticketCreateSchema.safeParse({ ...base, cliente_email: '' }).success).toBe(true)
  })

  it('accepts valid materiales_planificados', () => {
    const result = ticketCreateSchema.safeParse({
      ...base,
      materiales_planificados: [{ id: 'm1', nombre: 'Cable', cantidad: 10, unidad: 'metros' }],
    })
    expect(result.success).toBe(true)
  })

  it('rejects material with negative cantidad', () => {
    const result = ticketCreateSchema.safeParse({
      ...base,
      materiales_planificados: [{ id: 'm1', nombre: 'Cable', cantidad: -1, unidad: 'metros' }],
    })
    expect(result.success).toBe(false)
  })

  it('applies default monto_servicio of 40 when omitted', () => {
    const result = ticketCreateSchema.safeParse(base)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.monto_servicio).toBe(40)
    }
  })

  it('rejects negative monto_servicio', () => {
    expect(ticketCreateSchema.safeParse({ ...base, monto_servicio: -10 }).success).toBe(false)
  })

  it('rejects asunto exceeding 255 characters', () => {
    expect(ticketCreateSchema.safeParse({ ...base, asunto: 'A'.repeat(256) }).success).toBe(false)
  })

  it('rejects descripcion exceeding 5000 characters', () => {
    expect(ticketCreateSchema.safeParse({ ...base, descripcion: 'D'.repeat(5001) }).success).toBe(false)
  })

  it('rejects empty asunto', () => {
    expect(ticketCreateSchema.safeParse({ ...base, asunto: '' }).success).toBe(false)
  })

  it('rejects empty descripcion', () => {
    expect(ticketCreateSchema.safeParse({ ...base, descripcion: '' }).success).toBe(false)
  })

  it('rejects empty cliente_telefono', () => {
    expect(ticketCreateSchema.safeParse({ ...base, cliente_telefono: '' }).success).toBe(false)
  })

  it('rejects empty cliente_direccion', () => {
    expect(ticketCreateSchema.safeParse({ ...base, cliente_direccion: '' }).success).toBe(false)
  })
})

// ─── paymentProcessSchema ─────────────────────────────────────────────────────

describe('paymentProcessSchema', () => {
  it('accepts all valid metodos de pago', () => {
    for (const metodo of ['pago_movil', 'transferencia', 'efectivo', 'deposito', 'cheque'] as const) {
      expect(paymentProcessSchema.safeParse({ metodo_pago: metodo }).success).toBe(true)
    }
  })

  it('rejects invalid metodo_pago', () => {
    expect(paymentProcessSchema.safeParse({ metodo_pago: 'bitcoin' }).success).toBe(false)
  })

  it('rejects missing metodo_pago', () => {
    expect(paymentProcessSchema.safeParse({}).success).toBe(false)
  })

  it('accepts optional referencia_pago', () => {
    expect(paymentProcessSchema.safeParse({ metodo_pago: 'efectivo', referencia_pago: 'REF-001' }).success).toBe(true)
  })

  it('accepts empty string for referencia_pago', () => {
    expect(paymentProcessSchema.safeParse({ metodo_pago: 'efectivo', referencia_pago: '' }).success).toBe(true)
  })

  it('rejects referencia_pago exceeding 1000 characters', () => {
    expect(paymentProcessSchema.safeParse({ metodo_pago: 'efectivo', referencia_pago: 'R'.repeat(1001) }).success).toBe(false)
  })

  it('accepts optional observaciones', () => {
    expect(paymentProcessSchema.safeParse({ metodo_pago: 'efectivo', observaciones: 'Ok' }).success).toBe(true)
  })

  it('rejects observaciones exceeding 500 characters', () => {
    expect(paymentProcessSchema.safeParse({ metodo_pago: 'efectivo', observaciones: 'O'.repeat(501) }).success).toBe(false)
  })
})

// ─── ticketTechnicianSchema ───────────────────────────────────────────────────

describe('ticketTechnicianSchema', () => {
  it('accepts empty object (all fields optional)', () => {
    expect(ticketTechnicianSchema.safeParse({}).success).toBe(true)
  })

  it('accepts all valid estados', () => {
    for (const estado of ['asignado', 'iniciado', 'en_progreso', 'finalizado', 'cancelado'] as const) {
      expect(ticketTechnicianSchema.safeParse({ estado }).success).toBe(true)
    }
  })

  it('rejects invalid estado', () => {
    expect(ticketTechnicianSchema.safeParse({ estado: 'desconocido' }).success).toBe(false)
  })

  it('rejects negative tiempo_trabajado', () => {
    expect(ticketTechnicianSchema.safeParse({ tiempo_trabajado: -1 }).success).toBe(false)
  })

  it('accepts zero tiempo_trabajado', () => {
    expect(ticketTechnicianSchema.safeParse({ tiempo_trabajado: 0 }).success).toBe(true)
  })

  it('rejects observaciones_tecnico exceeding 5000 characters', () => {
    expect(ticketTechnicianSchema.safeParse({ observaciones_tecnico: 'O'.repeat(5001) }).success).toBe(false)
  })

  it('rejects solucion_aplicada exceeding 5000 characters', () => {
    expect(ticketTechnicianSchema.safeParse({ solucion_aplicada: 'S'.repeat(5001) }).success).toBe(false)
  })

  it('accepts valid materiales_usados', () => {
    const result = ticketTechnicianSchema.safeParse({
      materiales_usados: [{ id: 'm1', nombre: 'Cable UTP', cantidad: 2, unidad: 'rollo' }],
    })
    expect(result.success).toBe(true)
  })
})
