import { describe, it, expect } from 'vitest'
import {
  ROLE_HIERARCHY,
  ROLE_PERMISSIONS,
  hasPermission,
  hasMinimumLevel,
  canEditTicket,
  canViewAllTickets,
  canProcessPayments,
} from '@/types'
import type { UserRole, Permission } from '@/types'

// ─── ROLE_HIERARCHY ──────────────────────────────────────────────────────────

describe('ROLE_HIERARCHY', () => {
  it.each([
    ['tecnico', 1],
    ['coordinador', 2],
    ['gerente', 3],
    ['vicepresidente', 4],
    ['presidente', 5],
  ] as [UserRole, number][])(
    'assigns level %i to %s',
    (role, expected) => {
      expect(ROLE_HIERARCHY[role]).toBe(expected)
    }
  )

  it('maintains strictly increasing order across the hierarchy', () => {
    const levels = ['tecnico', 'coordinador', 'gerente', 'vicepresidente', 'presidente'] as UserRole[]
    for (let i = 1; i < levels.length; i++) {
      expect(ROLE_HIERARCHY[levels[i]!]).toBeGreaterThan(ROLE_HIERARCHY[levels[i - 1]!])
    }
  })
})

// ─── hasPermission ────────────────────────────────────────────────────────────

describe('hasPermission', () => {
  describe('tecnico', () => {
    it('can view own tickets', () => {
      expect(hasPermission('tecnico', 'tickets:view_own')).toBe(true)
    })
    it('can change ticket status', () => {
      expect(hasPermission('tecnico', 'tickets:change_status')).toBe(true)
    })
    it('cannot view all tickets', () => {
      expect(hasPermission('tecnico', 'tickets:view_all')).toBe(false)
    })
    it('cannot create tickets', () => {
      expect(hasPermission('tecnico', 'tickets:create')).toBe(false)
    })
    it('cannot delete tickets', () => {
      expect(hasPermission('tecnico', 'tickets:delete')).toBe(false)
    })
    it('cannot view users', () => {
      expect(hasPermission('tecnico', 'users:view')).toBe(false)
    })
    it('cannot view payments', () => {
      expect(hasPermission('tecnico', 'payments:view')).toBe(false)
    })
    it('cannot view config', () => {
      expect(hasPermission('tecnico', 'config:view')).toBe(false)
    })
    it('cannot edit config', () => {
      expect(hasPermission('tecnico', 'config:edit')).toBe(false)
    })
  })

  describe('coordinador', () => {
    it('can view all tickets', () => {
      expect(hasPermission('coordinador', 'tickets:view_all')).toBe(true)
    })
    it('can create tickets', () => {
      expect(hasPermission('coordinador', 'tickets:create')).toBe(true)
    })
    it('can assign tickets', () => {
      expect(hasPermission('coordinador', 'tickets:assign')).toBe(true)
    })
    it('can view clients', () => {
      expect(hasPermission('coordinador', 'clients:view')).toBe(true)
    })
    it('cannot edit tickets', () => {
      expect(hasPermission('coordinador', 'tickets:edit')).toBe(false)
    })
    it('cannot delete tickets', () => {
      expect(hasPermission('coordinador', 'tickets:delete')).toBe(false)
    })
    it('cannot process payments', () => {
      expect(hasPermission('coordinador', 'payments:process')).toBe(false)
    })
    it('cannot view config', () => {
      expect(hasPermission('coordinador', 'config:view')).toBe(false)
    })
  })

  describe('gerente', () => {
    it('can edit tickets', () => {
      expect(hasPermission('gerente', 'tickets:edit')).toBe(true)
    })
    it('can delete tickets', () => {
      expect(hasPermission('gerente', 'tickets:delete')).toBe(true)
    })
    it('can process payments', () => {
      expect(hasPermission('gerente', 'payments:process')).toBe(true)
    })
    it('can view config', () => {
      expect(hasPermission('gerente', 'config:view')).toBe(true)
    })
    it('cannot edit config', () => {
      expect(hasPermission('gerente', 'config:edit')).toBe(false)
    })
    it('can manage users', () => {
      expect(hasPermission('gerente', 'users:view')).toBe(true)
      expect(hasPermission('gerente', 'users:create')).toBe(true)
      expect(hasPermission('gerente', 'users:edit')).toBe(true)
      expect(hasPermission('gerente', 'users:delete')).toBe(true)
    })
  })

  describe('vicepresidente', () => {
    it('can edit config', () => {
      expect(hasPermission('vicepresidente', 'config:edit')).toBe(true)
    })
    it('can view config', () => {
      expect(hasPermission('vicepresidente', 'config:view')).toBe(true)
    })
    it('has all ticket permissions', () => {
      const ticketPerms: Permission[] = ['tickets:view_own', 'tickets:view_all', 'tickets:create', 'tickets:edit', 'tickets:delete', 'tickets:change_status', 'tickets:assign', 'tickets:reassign']
      for (const perm of ticketPerms) {
        expect(hasPermission('vicepresidente', perm)).toBe(true)
      }
    })
  })

  describe('presidente', () => {
    it('has every defined permission', () => {
      const allPerms = Object.values(ROLE_PERMISSIONS).flat()
      const unique = [...new Set(allPerms)] as Permission[]
      for (const perm of unique) {
        expect(hasPermission('presidente', perm)).toBe(true)
      }
    })
  })

  it('returns false for an unknown permission string', () => {
    expect(hasPermission('gerente', 'nonexistent:perm' as Permission)).toBe(false)
  })
})

// ─── hasMinimumLevel ──────────────────────────────────────────────────────────

describe('hasMinimumLevel', () => {
  it.each([
    ['tecnico', 1, true],
    ['tecnico', 2, false],
    ['coordinador', 2, true],
    ['coordinador', 3, false],
    ['gerente', 3, true],
    ['gerente', 4, false],
    ['vicepresidente', 4, true],
    ['vicepresidente', 5, false],
    ['presidente', 5, true],
    ['presidente', 6, false],
  ] as [UserRole, number, boolean][])(
    '%s at min level %i → %s',
    (role, level, expected) => {
      expect(hasMinimumLevel(role, level)).toBe(expected)
    }
  )
})

// ─── Role-based convenience functions ────────────────────────────────────────

describe('canEditTicket', () => {
  it.each([
    ['tecnico', false],
    ['coordinador', false],
    ['gerente', true],
    ['vicepresidente', true],
    ['presidente', true],
  ] as [UserRole, boolean][])('%s → %s', (role, expected) => {
    expect(canEditTicket(role)).toBe(expected)
  })
})

describe('canViewAllTickets', () => {
  it.each([
    ['tecnico', false],
    ['coordinador', true],
    ['gerente', true],
    ['vicepresidente', true],
    ['presidente', true],
  ] as [UserRole, boolean][])('%s → %s', (role, expected) => {
    expect(canViewAllTickets(role)).toBe(expected)
  })
})

describe('canProcessPayments', () => {
  it.each([
    ['tecnico', false],
    ['coordinador', false],
    ['gerente', true],
    ['vicepresidente', true],
    ['presidente', true],
  ] as [UserRole, boolean][])('%s → %s', (role, expected) => {
    expect(canProcessPayments(role)).toBe(expected)
  })
})
