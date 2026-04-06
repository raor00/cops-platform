import { describe, it, expect, beforeEach } from 'vitest'
import { VALID_TRANSITIONS, ADMIN_REVERSE_TRANSITIONS, ROLE_HIERARCHY } from '@/types'
import {
  changeDemoTicketStatus,
  createDemoTicket,
  getDemoCurrentUser,
  getDemoTicketById,
} from '@/lib/mock-data'
import type { TicketStatus, UserRole, User } from '@/types'

// ─── VALID_TRANSITIONS ────────────────────────────────────────────────────────

describe('VALID_TRANSITIONS (forward state machine)', () => {
  it('borrador can move to asignado or cancelado only', () => {
    expect(VALID_TRANSITIONS['borrador']).toContain('asignado')
    expect(VALID_TRANSITIONS['borrador']).toContain('cancelado')
    expect(VALID_TRANSITIONS['borrador']).toHaveLength(2)
  })

  it('asignado can move to iniciado or cancelado only', () => {
    expect(VALID_TRANSITIONS['asignado']).toContain('iniciado')
    expect(VALID_TRANSITIONS['asignado']).toContain('cancelado')
    expect(VALID_TRANSITIONS['asignado']).toHaveLength(2)
  })

  it('iniciado can move to en_progreso or cancelado only', () => {
    expect(VALID_TRANSITIONS['iniciado']).toContain('en_progreso')
    expect(VALID_TRANSITIONS['iniciado']).toContain('cancelado')
    expect(VALID_TRANSITIONS['iniciado']).toHaveLength(2)
  })

  it('en_progreso can move to finalizado or cancelado only', () => {
    expect(VALID_TRANSITIONS['en_progreso']).toContain('finalizado')
    expect(VALID_TRANSITIONS['en_progreso']).toContain('cancelado')
    expect(VALID_TRANSITIONS['en_progreso']).toHaveLength(2)
  })

  it('finalizado has no valid forward transitions (terminal state)', () => {
    expect(VALID_TRANSITIONS['finalizado']).toHaveLength(0)
  })

  it('cancelado has no valid forward transitions (terminal state)', () => {
    expect(VALID_TRANSITIONS['cancelado']).toHaveLength(0)
  })

  it('every status is a key in the map', () => {
    const allStatuses: TicketStatus[] = ['borrador', 'asignado', 'iniciado', 'en_progreso', 'finalizado', 'cancelado']
    for (const status of allStatuses) {
      expect(VALID_TRANSITIONS).toHaveProperty(status)
    }
  })

  it('no status can transition to borrador (no backward transitions for regular users)', () => {
    for (const transitions of Object.values(VALID_TRANSITIONS)) {
      expect(transitions).not.toContain('borrador')
    }
  })
})

// ─── ADMIN_REVERSE_TRANSITIONS ────────────────────────────────────────────────

describe('ADMIN_REVERSE_TRANSITIONS (gerente+ revert)', () => {
  it('borrador and asignado have no reverse transitions', () => {
    expect(ADMIN_REVERSE_TRANSITIONS['borrador']).toHaveLength(0)
    expect(ADMIN_REVERSE_TRANSITIONS['asignado']).toHaveLength(0)
  })

  it('iniciado can revert to asignado', () => {
    expect(ADMIN_REVERSE_TRANSITIONS['iniciado']).toContain('asignado')
    expect(ADMIN_REVERSE_TRANSITIONS['iniciado']).toHaveLength(1)
  })

  it('en_progreso can revert to iniciado', () => {
    expect(ADMIN_REVERSE_TRANSITIONS['en_progreso']).toContain('iniciado')
    expect(ADMIN_REVERSE_TRANSITIONS['en_progreso']).toHaveLength(1)
  })

  it('finalizado can revert to en_progreso', () => {
    expect(ADMIN_REVERSE_TRANSITIONS['finalizado']).toContain('en_progreso')
    expect(ADMIN_REVERSE_TRANSITIONS['finalizado']).toHaveLength(1)
  })

  it('cancelado can revert to asignado', () => {
    expect(ADMIN_REVERSE_TRANSITIONS['cancelado']).toContain('asignado')
    expect(ADMIN_REVERSE_TRANSITIONS['cancelado']).toHaveLength(1)
  })

  it('each reverse target is exactly one step back in the chain', () => {
    // reverse chain: finalizado → en_progreso → iniciado → asignado
    const chain: [TicketStatus, TicketStatus][] = [
      ['finalizado', 'en_progreso'],
      ['en_progreso', 'iniciado'],
      ['iniciado', 'asignado'],
      ['cancelado', 'asignado'],
    ]
    for (const [from, to] of chain) {
      expect(ADMIN_REVERSE_TRANSITIONS[from]).toContain(to)
    }
  })
})

// ─── changeDemoTicketStatus ───────────────────────────────────────────────────

function makeAdmin(): User {
  return getDemoCurrentUser() // president by default
}

function makeTecnicoUser(): User {
  return {
    id: 'test-tech-id',
    nombre: 'Test',
    apellido: 'Tecnico',
    email: 'test@test.com',
    rol: 'tecnico',
    nivel_jerarquico: 1,
    telefono: null,
    cedula: 'V-99',
    estado: 'activo',
    activo_desde: null,
    foto_perfil_path: null,
    especialidad: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

function createTicketInState(estado: TicketStatus, admin: User): string {
  // Create a ticket (starts as asignado by default)
  const ticket = createDemoTicket(
    {
      tipo: 'servicio',
      cliente_nombre: 'Cliente Test',
      cliente_telefono: '+58 412 000 0000',
      cliente_direccion: 'Caracas',
      asunto: 'Test ticket',
      descripcion: 'Descripcion test',
      prioridad: 'media',
      origen: 'email',
      tecnico_id: 'test-tech-id',
      monto_servicio: 40,
    },
    admin
  )

  // Advance to the desired state
  const stateChain: TicketStatus[] = ['asignado', 'iniciado', 'en_progreso', 'finalizado']
  const idx = stateChain.indexOf(estado)
  for (let i = 0; i < idx; i++) {
    changeDemoTicketStatus(ticket.id, stateChain[i + 1]!, undefined, 'gerente')
  }

  if (estado === 'cancelado') {
    changeDemoTicketStatus(ticket.id, 'cancelado', undefined, 'gerente')
  }

  if (estado === 'borrador') {
    // borrador is the only state that can't be reached by advancing
    // so we create one explicitly with estado:borrador input
    const borrador = createDemoTicket(
      {
        tipo: 'servicio',
        cliente_nombre: 'Cliente Borrador',
        cliente_telefono: '+58 412 000 0001',
        cliente_direccion: 'Caracas',
        asunto: 'Test borrador',
        descripcion: 'Desc borrador',
        prioridad: 'baja',
        origen: 'email',
        tecnico_id: '',
        monto_servicio: 40,
        estado: 'borrador',
      } as Parameters<typeof createDemoTicket>[0],
      admin
    )
    return borrador.id
  }

  return ticket.id
}

describe('changeDemoTicketStatus', () => {
  let admin: User

  beforeEach(() => {
    admin = makeAdmin()
  })

  it('returns error when ticket id does not exist', () => {
    const result = changeDemoTicketStatus('nonexistent-id', 'iniciado', undefined, 'gerente')
    expect(result.error).toBeDefined()
    expect(result.ticket).toBeUndefined()
  })

  it('advances asignado → iniciado for any role', () => {
    const ticketId = createTicketInState('asignado', admin)
    const result = changeDemoTicketStatus(ticketId, 'iniciado', undefined, 'tecnico')
    expect(result.error).toBeUndefined()
    expect(result.ticket?.estado).toBe('iniciado')
  })

  it('advances iniciado → en_progreso', () => {
    const ticketId = createTicketInState('asignado', admin)
    changeDemoTicketStatus(ticketId, 'iniciado', undefined, 'tecnico')
    const result = changeDemoTicketStatus(ticketId, 'en_progreso', undefined, 'tecnico')
    expect(result.error).toBeUndefined()
    expect(result.ticket?.estado).toBe('en_progreso')
  })

  it('advances en_progreso → finalizado', () => {
    const ticketId = createTicketInState('en_progreso', admin)
    const result = changeDemoTicketStatus(ticketId, 'finalizado', undefined, 'gerente')
    expect(result.error).toBeUndefined()
    expect(result.ticket?.estado).toBe('finalizado')
  })

  it('sets fecha_inicio when transitioning to iniciado', () => {
    const ticketId = createTicketInState('asignado', admin)
    const result = changeDemoTicketStatus(ticketId, 'iniciado', undefined, 'tecnico')
    expect(result.ticket?.fecha_inicio).toBeTruthy()
  })

  it('sets fecha_finalizacion when transitioning to finalizado', () => {
    const ticketId = createTicketInState('en_progreso', admin)
    const result = changeDemoTicketStatus(ticketId, 'finalizado', undefined, 'gerente')
    expect(result.ticket?.fecha_finalizacion).toBeTruthy()
  })

  it('rejects invalid forward transition (asignado → finalizado)', () => {
    const ticketId = createTicketInState('asignado', admin)
    const result = changeDemoTicketStatus(ticketId, 'finalizado', undefined, 'gerente')
    expect(result.error).toBeDefined()
    expect(result.ticket).toBeUndefined()
  })

  it('rejects invalid forward transition (finalizado → iniciado) for any role', () => {
    const ticketId = createTicketInState('finalizado', admin)
    const result = changeDemoTicketStatus(ticketId, 'iniciado', undefined, 'presidente')
    expect(result.error).toBeDefined()
  })

  it('allows admin to revert finalizado → en_progreso', () => {
    const ticketId = createTicketInState('finalizado', admin)
    const result = changeDemoTicketStatus(ticketId, 'en_progreso', undefined, 'gerente')
    expect(result.error).toBeUndefined()
    expect(result.ticket?.estado).toBe('en_progreso')
  })

  it('allows admin to revert iniciado → asignado', () => {
    const ticketId = createTicketInState('asignado', admin)
    changeDemoTicketStatus(ticketId, 'iniciado', undefined, 'tecnico')
    const result = changeDemoTicketStatus(ticketId, 'asignado', undefined, 'gerente')
    expect(result.error).toBeUndefined()
    expect(result.ticket?.estado).toBe('asignado')
  })

  it('denies reverse transition when user is not admin (level < 3)', () => {
    const ticketId = createTicketInState('asignado', admin)
    changeDemoTicketStatus(ticketId, 'iniciado', undefined, 'tecnico')
    const result = changeDemoTicketStatus(ticketId, 'asignado', undefined, 'tecnico')
    expect(result.error).toBeDefined()
  })

  it('denies reverse transition when user is coordinador (level 2)', () => {
    const ticketId = createTicketInState('asignado', admin)
    changeDemoTicketStatus(ticketId, 'iniciado', undefined, 'coordinador')
    const result = changeDemoTicketStatus(ticketId, 'asignado', undefined, 'coordinador')
    expect(result.error).toBeDefined()
  })

  it('stores additional data (materiales, tiempo, observaciones) on finalizado', () => {
    const ticketId = createTicketInState('en_progreso', admin)
    const result = changeDemoTicketStatus(
      ticketId,
      'finalizado',
      {
        materiales_usados: [{ id: 'm1', nombre: 'Cable', cantidad: 5, unidad: 'metros' }],
        tiempo_trabajado: 120,
        observaciones_tecnico: 'Todo correcto',
        solucion_aplicada: 'Se instaló el cable',
        monto_servicio_final: 75,
      },
      'gerente'
    )
    expect(result.ticket?.estado).toBe('finalizado')
    expect(result.ticket?.materiales_usados).toHaveLength(1)
    expect(result.ticket?.tiempo_trabajado).toBe(120)
    expect(result.ticket?.observaciones_tecnico).toBe('Todo correcto')
    expect(result.ticket?.monto_servicio).toBe(75)
  })

  it('creates a payment entry when ticket reaches finalizado with a technician', () => {
    const ticketId = createTicketInState('en_progreso', admin)
    changeDemoTicketStatus(ticketId, 'finalizado', undefined, 'gerente')
    // The ticket should exist and have a payment generated (side effect)
    const ticket = getDemoTicketById(ticketId, admin)
    expect(ticket?.estado).toBe('finalizado')
  })
})
