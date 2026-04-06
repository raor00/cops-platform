import { describe, it, expect } from 'vitest'
import {
  getDemoCurrentUser,
  getDemoUsers,
  getDemoTickets,
  getDemoTicketById,
  createDemoTicket,
  updateDemoTicket,
  deleteDemoTicket,
  assignDemoTechnician,
  createDemoFase,
  getDemoFasesByTicket,
  updateDemoFase,
  deleteDemoFase,
  createDemoFoto,
  getDemoFotosByTicket,
  getDemoFotoById,
  deleteDemoFoto,
  createDemoCliente,
  getDemoClienteById,
  updateDemoCliente,
  deleteDemoCliente,
  searchDemoClientes,
  getDemoClientes,
  getDemoUpdateLogs,
  addDemoUpdateLog,
} from '@/lib/mock-data'
import type { User } from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeAdmin(): User {
  return getDemoCurrentUser()
}

function baseTicketInput() {
  return {
    tipo: 'servicio' as const,
    cliente_nombre: 'Test Cliente',
    cliente_telefono: '+58 412 000 0000',
    cliente_direccion: 'Caracas',
    asunto: 'Servicio de prueba',
    descripcion: 'Descripción de prueba',
    prioridad: 'media' as const,
    origen: 'email' as const,
    tecnico_id: '33333333-3333-3333-3333-333333333333',
    monto_servicio: 40,
  }
}

// ─── getDemoCurrentUser ───────────────────────────────────────────────────────

describe('getDemoCurrentUser', () => {
  it('returns a user with presidente role', () => {
    const user = getDemoCurrentUser()
    expect(user.rol).toBe('presidente')
  })

  it('returns a user with valid id', () => {
    const user = getDemoCurrentUser()
    expect(user.id).toBeTruthy()
  })
})

// ─── getDemoUsers ─────────────────────────────────────────────────────────────

describe('getDemoUsers', () => {
  it('returns at least one user', () => {
    expect(getDemoUsers().length).toBeGreaterThan(0)
  })

  it('all returned users have required fields', () => {
    for (const user of getDemoUsers()) {
      expect(user.id).toBeTruthy()
      expect(user.nombre).toBeTruthy()
      expect(user.rol).toBeTruthy()
      expect(user.email).toBeTruthy()
    }
  })

  it('includes at least one tecnico', () => {
    const tecnicos = getDemoUsers().filter((u) => u.rol === 'tecnico')
    expect(tecnicos.length).toBeGreaterThan(0)
  })
})

// ─── createDemoTicket ─────────────────────────────────────────────────────────

describe('createDemoTicket', () => {
  it('creates a ticket and returns it', () => {
    const admin = makeAdmin()
    const ticket = createDemoTicket(baseTicketInput(), admin)
    expect(ticket.id).toBeTruthy()
    expect(ticket.numero_ticket).toBeTruthy()
  })

  it('assigns estado asignado by default when tecnico_id is provided', () => {
    const admin = makeAdmin()
    const ticket = createDemoTicket(baseTicketInput(), admin)
    expect(ticket.estado).toBe('asignado')
  })

  it('assigns estado borrador when estado borrador is requested', () => {
    const admin = makeAdmin()
    const input = { ...baseTicketInput(), tecnico_id: '', estado: 'borrador' as const }
    const ticket = createDemoTicket(input as Parameters<typeof createDemoTicket>[0], admin)
    expect(ticket.estado).toBe('borrador')
  })

  it('sets creado_por to the current user id', () => {
    const admin = makeAdmin()
    const ticket = createDemoTicket(baseTicketInput(), admin)
    expect(ticket.creado_por).toBe(admin.id)
  })

  it('stores monto_servicio from input', () => {
    const admin = makeAdmin()
    const ticket = createDemoTicket({ ...baseTicketInput(), monto_servicio: 80 }, admin)
    expect(ticket.monto_servicio).toBe(80)
  })

  it('generates unique ids for each ticket', () => {
    const admin = makeAdmin()
    const t1 = createDemoTicket(baseTicketInput(), admin)
    const t2 = createDemoTicket(baseTicketInput(), admin)
    expect(t1.id).not.toBe(t2.id)
  })

  it('applies default monto of 20 for inspeccion tipo', () => {
    const admin = makeAdmin()
    const { monto_servicio: _, ...rest } = baseTicketInput()
    const ticket = createDemoTicket({ ...rest, tipo: 'inspeccion' }, admin)
    expect(ticket.monto_servicio).toBe(20)
  })

  it('new ticket appears in getDemoTickets()', () => {
    const admin = makeAdmin()
    const ticket = createDemoTicket({ ...baseTicketInput(), asunto: 'Unique asunto XYZ99' }, admin)
    const all = getDemoTickets()
    expect(all.find((t) => t.id === ticket.id)).toBeTruthy()
  })
})

// ─── getDemoTicketById ────────────────────────────────────────────────────────

describe('getDemoTicketById', () => {
  it('returns the ticket for a valid id', () => {
    const admin = makeAdmin()
    const created = createDemoTicket(baseTicketInput(), admin)
    const found = getDemoTicketById(created.id, admin)
    expect(found).not.toBeNull()
    expect(found?.id).toBe(created.id)
  })

  it('returns null for a nonexistent id', () => {
    const admin = makeAdmin()
    expect(getDemoTicketById('nonexistent-id', admin)).toBeNull()
  })
})

// ─── updateDemoTicket ─────────────────────────────────────────────────────────

describe('updateDemoTicket', () => {
  it('updates asunto and returns the updated ticket', () => {
    const admin = makeAdmin()
    const ticket = createDemoTicket(baseTicketInput(), admin)
    const updated = updateDemoTicket(ticket.id, { asunto: 'Nuevo asunto actualizado' }, admin)
    expect(updated?.asunto).toBe('Nuevo asunto actualizado')
  })

  it('returns null for a nonexistent ticket id', () => {
    const admin = makeAdmin()
    expect(updateDemoTicket('nonexistent', { asunto: 'X' }, admin)).toBeNull()
  })

  it('preserves unchanged fields', () => {
    const admin = makeAdmin()
    const ticket = createDemoTicket(baseTicketInput(), admin)
    const updated = updateDemoTicket(ticket.id, { asunto: 'Changed' }, admin)
    expect(updated?.cliente_nombre).toBe(ticket.cliente_nombre)
    expect(updated?.descripcion).toBe(ticket.descripcion)
  })

  it('records modificado_por to the updater user id', () => {
    const admin = makeAdmin()
    const ticket = createDemoTicket(baseTicketInput(), admin)
    const updated = updateDemoTicket(ticket.id, { prioridad: 'alta' }, admin)
    expect(updated?.modificado_por).toBe(admin.id)
  })
})

// ─── deleteDemoTicket ─────────────────────────────────────────────────────────

describe('deleteDemoTicket', () => {
  it('returns true when deleting an existing ticket', () => {
    const admin = makeAdmin()
    const ticket = createDemoTicket(baseTicketInput(), admin)
    expect(deleteDemoTicket(ticket.id)).toBe(true)
  })

  it('removes the ticket from the store', () => {
    const admin = makeAdmin()
    const ticket = createDemoTicket(baseTicketInput(), admin)
    deleteDemoTicket(ticket.id)
    expect(getDemoTicketById(ticket.id, admin)).toBeNull()
  })

  it('returns false when deleting a nonexistent ticket', () => {
    expect(deleteDemoTicket('nonexistent-id')).toBe(false)
  })

  it('is idempotent — second delete returns false', () => {
    const admin = makeAdmin()
    const ticket = createDemoTicket(baseTicketInput(), admin)
    deleteDemoTicket(ticket.id)
    expect(deleteDemoTicket(ticket.id)).toBe(false)
  })
})

// ─── assignDemoTechnician ─────────────────────────────────────────────────────

describe('assignDemoTechnician', () => {
  it('assigns a technician and returns the updated ticket', () => {
    const admin = makeAdmin()
    const ticket = createDemoTicket(baseTicketInput(), admin)
    const techId = '33333333-3333-3333-3333-333333333333'
    const updated = assignDemoTechnician(ticket.id, techId)
    expect(updated?.tecnico_id).toBe(techId)
  })

  it('returns null for a nonexistent ticket id', () => {
    expect(assignDemoTechnician('nonexistent', 'some-tech')).toBeNull()
  })
})

// ─── Fases CRUD ───────────────────────────────────────────────────────────────

describe('fases CRUD', () => {
  it('createDemoFase creates a fase and associates it with the ticket', () => {
    const admin = makeAdmin()
    const ticket = createDemoTicket(baseTicketInput(), admin)
    const fase = createDemoFase({ ticket_id: ticket.id, nombre: 'Fase 1' }, admin)
    expect(fase.id).toBeTruthy()
    expect(fase.ticket_id).toBe(ticket.id)
    expect(fase.estado).toBe('pendiente')
    expect(fase.orden).toBeGreaterThanOrEqual(0)
  })

  it('getDemoFasesByTicket returns only fases for the specified ticket', () => {
    const admin = makeAdmin()
    const t1 = createDemoTicket(baseTicketInput(), admin)
    const t2 = createDemoTicket(baseTicketInput(), admin)
    createDemoFase({ ticket_id: t1.id, nombre: 'Fase A' }, admin)
    createDemoFase({ ticket_id: t2.id, nombre: 'Fase B' }, admin)
    const fases = getDemoFasesByTicket(t1.id)
    expect(fases.every((f) => f.ticket_id === t1.id)).toBe(true)
  })

  it('getDemoFasesByTicket returns empty array for ticket with no fases', () => {
    const admin = makeAdmin()
    const ticket = createDemoTicket(baseTicketInput(), admin)
    expect(getDemoFasesByTicket(ticket.id)).toHaveLength(0)
  })

  it('createDemoFase assigns sequential orden', () => {
    const admin = makeAdmin()
    const ticket = createDemoTicket(baseTicketInput(), admin)
    const f1 = createDemoFase({ ticket_id: ticket.id, nombre: 'F1' }, admin)
    const f2 = createDemoFase({ ticket_id: ticket.id, nombre: 'F2' }, admin)
    expect(f2.orden).toBeGreaterThan(f1.orden)
  })

  it('updateDemoFase updates nombre', () => {
    const admin = makeAdmin()
    const ticket = createDemoTicket(baseTicketInput(), admin)
    const fase = createDemoFase({ ticket_id: ticket.id, nombre: 'Original' }, admin)
    const updated = updateDemoFase(fase.id, { nombre: 'Renamed' })
    expect(updated?.nombre).toBe('Renamed')
  })

  it('updateDemoFase sets fecha_fin_real and progreso 100 when estado is completada', () => {
    const admin = makeAdmin()
    const ticket = createDemoTicket(baseTicketInput(), admin)
    const fase = createDemoFase({ ticket_id: ticket.id, nombre: 'F' }, admin)
    const updated = updateDemoFase(fase.id, { estado: 'completada' })
    expect(updated?.fecha_fin_real).toBeTruthy()
    expect(updated?.progreso_porcentaje).toBe(100)
  })

  it('updateDemoFase sets fecha_inicio_real when estado is en_progreso', () => {
    const admin = makeAdmin()
    const ticket = createDemoTicket(baseTicketInput(), admin)
    const fase = createDemoFase({ ticket_id: ticket.id, nombre: 'F' }, admin)
    const updated = updateDemoFase(fase.id, { estado: 'en_progreso' })
    expect(updated?.fecha_inicio_real).toBeTruthy()
  })

  it('updateDemoFase returns null for nonexistent id', () => {
    expect(updateDemoFase('nonexistent', { nombre: 'X' })).toBeNull()
  })

  it('deleteDemoFase removes the fase', () => {
    const admin = makeAdmin()
    const ticket = createDemoTicket(baseTicketInput(), admin)
    const fase = createDemoFase({ ticket_id: ticket.id, nombre: 'To delete' }, admin)
    expect(deleteDemoFase(fase.id)).toBe(true)
    expect(getDemoFasesByTicket(ticket.id).find((f) => f.id === fase.id)).toBeUndefined()
  })

  it('deleteDemoFase returns false for nonexistent id', () => {
    expect(deleteDemoFase('nonexistent')).toBe(false)
  })
})

// ─── Fotos CRUD ───────────────────────────────────────────────────────────────

describe('fotos CRUD', () => {
  it('createDemoFoto creates a foto and returns it', () => {
    const admin = makeAdmin()
    const ticket = createDemoTicket(baseTicketInput(), admin)
    const foto = createDemoFoto(ticket.id, { nombre_archivo: 'test.jpg', tipo_foto: 'progreso' }, admin)
    expect(foto.id).toBeTruthy()
    expect(foto.ticket_id).toBe(ticket.id)
    expect(foto.tipo_foto).toBe('progreso')
  })

  it('getDemoFotosByTicket returns fotos for that ticket', () => {
    const admin = makeAdmin()
    const ticket = createDemoTicket(baseTicketInput(), admin)
    createDemoFoto(ticket.id, { nombre_archivo: 'a.jpg', tipo_foto: 'antes' }, admin)
    createDemoFoto(ticket.id, { nombre_archivo: 'b.jpg', tipo_foto: 'despues' }, admin)
    const fotos = getDemoFotosByTicket(ticket.id)
    expect(fotos.length).toBeGreaterThanOrEqual(2)
    expect(fotos.every((f) => f.ticket_id === ticket.id)).toBe(true)
  })

  it('getDemoFotosByTicket filters by tipo_foto', () => {
    const admin = makeAdmin()
    const ticket = createDemoTicket(baseTicketInput(), admin)
    createDemoFoto(ticket.id, { nombre_archivo: 'antes.jpg', tipo_foto: 'antes' }, admin)
    createDemoFoto(ticket.id, { nombre_archivo: 'despues.jpg', tipo_foto: 'despues' }, admin)
    const antes = getDemoFotosByTicket(ticket.id, 'antes')
    expect(antes.every((f) => f.tipo_foto === 'antes')).toBe(true)
  })

  it('getDemoFotoById returns the correct foto', () => {
    const admin = makeAdmin()
    const ticket = createDemoTicket(baseTicketInput(), admin)
    const foto = createDemoFoto(ticket.id, { nombre_archivo: 'x.jpg', tipo_foto: 'documento' }, admin)
    const found = getDemoFotoById(foto.id)
    expect(found?.id).toBe(foto.id)
  })

  it('getDemoFotoById returns null for nonexistent id', () => {
    expect(getDemoFotoById('nonexistent')).toBeNull()
  })

  it('deleteDemoFoto allows owner to delete own foto', () => {
    const admin = makeAdmin()
    const ticket = createDemoTicket(baseTicketInput(), admin)
    const foto = createDemoFoto(ticket.id, { nombre_archivo: 'd.jpg', tipo_foto: 'progreso' }, admin)
    expect(deleteDemoFoto(foto.id, admin.id, 5)).toBe(true)
    expect(getDemoFotoById(foto.id)).toBeNull()
  })

  it('deleteDemoFoto denies non-owner with level < 3', () => {
    const admin = makeAdmin()
    const ticket = createDemoTicket(baseTicketInput(), admin)
    const foto = createDemoFoto(ticket.id, { nombre_archivo: 'x.jpg', tipo_foto: 'progreso' }, admin)
    expect(deleteDemoFoto(foto.id, 'other-user-id', 2)).toBe(false)
  })

  it('deleteDemoFoto allows manager-level non-owner (level >= 3)', () => {
    const admin = makeAdmin()
    const ticket = createDemoTicket(baseTicketInput(), admin)
    const foto = createDemoFoto(ticket.id, { nombre_archivo: 'y.jpg', tipo_foto: 'progreso' }, admin)
    expect(deleteDemoFoto(foto.id, 'different-manager', 3)).toBe(true)
  })

  it('deleteDemoFoto returns false for nonexistent foto id', () => {
    expect(deleteDemoFoto('nonexistent', 'any-user', 5)).toBe(false)
  })
})

// ─── Clientes CRUD ────────────────────────────────────────────────────────────

describe('clientes CRUD', () => {
  const baseCliente = {
    nombre: 'Juan',
    telefono: '+58 412 111 2222',
    direccion: 'Av. Principal, Caracas',
  }

  it('createDemoCliente creates a client and returns it', () => {
    const cliente = createDemoCliente(baseCliente)
    expect(cliente.id).toBeTruthy()
    expect(cliente.nombre).toBe('Juan')
    expect(cliente.estado).toBe('activo')
  })

  it('createDemoCliente sets optional fields to null when not provided', () => {
    const cliente = createDemoCliente(baseCliente)
    expect(cliente.apellido).toBeNull()
    expect(cliente.empresa).toBeNull()
    expect(cliente.email).toBeNull()
    expect(cliente.rif_cedula).toBeNull()
  })

  it('getDemoClienteById returns the client', () => {
    const created = createDemoCliente({ ...baseCliente, nombre: 'SearchTest' })
    const found = getDemoClienteById(created.id)
    expect(found?.id).toBe(created.id)
  })

  it('getDemoClienteById returns null for nonexistent id', () => {
    expect(getDemoClienteById('nonexistent')).toBeNull()
  })

  it('updateDemoCliente updates the telefono', () => {
    const cliente = createDemoCliente(baseCliente)
    const updated = updateDemoCliente(cliente.id, { telefono: '+58 426 999 0000' })
    expect(updated?.telefono).toBe('+58 426 999 0000')
  })

  it('updateDemoCliente preserves unchanged fields', () => {
    const cliente = createDemoCliente({ ...baseCliente, empresa: 'Corp S.A.' })
    const updated = updateDemoCliente(cliente.id, { telefono: '+58 416 000 1111' })
    expect(updated?.nombre).toBe(cliente.nombre)
    expect(updated?.empresa).toBe('Corp S.A.')
  })

  it('updateDemoCliente returns null for nonexistent id', () => {
    expect(updateDemoCliente('nonexistent', { telefono: '+58 400 000 0000' })).toBeNull()
  })

  it('deleteDemoCliente removes the client', () => {
    const cliente = createDemoCliente({ ...baseCliente, nombre: 'ToDelete' })
    expect(deleteDemoCliente(cliente.id)).toBe(true)
    expect(getDemoClienteById(cliente.id)).toBeNull()
  })

  it('deleteDemoCliente returns false for nonexistent id', () => {
    expect(deleteDemoCliente('nonexistent')).toBe(false)
  })

  it('deleteDemoCliente is idempotent — second call returns false', () => {
    const cliente = createDemoCliente(baseCliente)
    deleteDemoCliente(cliente.id)
    expect(deleteDemoCliente(cliente.id)).toBe(false)
  })

  describe('searchDemoClientes', () => {
    it('finds clients by nombre (case-insensitive)', () => {
      createDemoCliente({ ...baseCliente, nombre: 'UniqueNameABC' })
      const results = searchDemoClientes('uniquenameabc')
      expect(results.some((c) => c.nombre === 'UniqueNameABC')).toBe(true)
    })

    it('finds clients by empresa (case-insensitive)', () => {
      createDemoCliente({ ...baseCliente, nombre: 'Regular', empresa: 'TechCorpXYZ' })
      const results = searchDemoClientes('techcorpxyz')
      expect(results.some((c) => c.empresa === 'TechCorpXYZ')).toBe(true)
    })

    it('finds clients by telefono', () => {
      createDemoCliente({ ...baseCliente, nombre: 'PhoneSearch', telefono: '+58412777' })
      const results = searchDemoClientes('+58412777')
      expect(results.some((c) => c.nombre === 'PhoneSearch')).toBe(true)
    })

    it('returns empty array for no match', () => {
      const results = searchDemoClientes('ZZZNOMATCH999XYZ')
      expect(results).toHaveLength(0)
    })

    it('returns at most 10 results', () => {
      const prefix = 'BulkClient' + Math.random().toString(36).slice(2, 8)
      for (let i = 0; i < 15; i++) {
        createDemoCliente({ ...baseCliente, nombre: prefix })
      }
      const results = searchDemoClientes(prefix)
      expect(results.length).toBeLessThanOrEqual(10)
    })
  })
})

// ─── UpdateLog ────────────────────────────────────────────────────────────────

describe('UpdateLog', () => {
  it('addDemoUpdateLog adds a log and getDemoUpdateLogs returns it', () => {
    const admin = makeAdmin()
    const ticket = createDemoTicket(baseTicketInput(), admin)
    addDemoUpdateLog({ ticket_id: ticket.id, autor_id: admin.id, contenido: 'Visita completada', tipo: 'nota' })
    const logs = getDemoUpdateLogs(ticket.id)
    expect(logs.some((l) => l.contenido === 'Visita completada')).toBe(true)
  })

  it('getDemoUpdateLogs returns empty array for ticket with no logs', () => {
    const admin = makeAdmin()
    const ticket = createDemoTicket(baseTicketInput(), admin)
    expect(getDemoUpdateLogs(ticket.id)).toHaveLength(0)
  })

  it('logs are isolated per ticket', () => {
    const admin = makeAdmin()
    const t1 = createDemoTicket(baseTicketInput(), admin)
    const t2 = createDemoTicket(baseTicketInput(), admin)
    addDemoUpdateLog({ ticket_id: t1.id, autor_id: admin.id, contenido: 'T1 log', tipo: 'nota' })
    const logsT2 = getDemoUpdateLogs(t2.id)
    expect(logsT2.some((l) => l.contenido === 'T1 log')).toBe(false)
  })

  it('addDemoUpdateLog sets the correct ticket_id', () => {
    const admin = makeAdmin()
    const ticket = createDemoTicket(baseTicketInput(), admin)
    addDemoUpdateLog({ ticket_id: ticket.id, autor_id: admin.id, contenido: 'Check log', tipo: 'nota' })
    const logs = getDemoUpdateLogs(ticket.id)
    const log = logs.find((l) => l.contenido === 'Check log')
    expect(log?.ticket_id).toBe(ticket.id)
  })
})
