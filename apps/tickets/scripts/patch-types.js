const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'types', 'index.ts');
let c = fs.readFileSync(filePath, 'utf8');

// 1. Add 'borrador' to TicketStatus
c = c.replace(
  "export type TicketStatus = 'asignado' | 'iniciado' | 'en_progreso' | 'finalizado' | 'cancelado'",
  "export type TicketStatus = 'borrador' | 'asignado' | 'iniciado' | 'en_progreso' | 'finalizado' | 'cancelado'"
);

// 2. Add borrador to VALID_TRANSITIONS
c = c.replace(
  "  asignado: ['iniciado', 'cancelado'],\n  iniciado: ['en_progreso', 'cancelado'],",
  "  borrador: ['asignado', 'cancelado'],\n  asignado: ['iniciado', 'cancelado'],\n  iniciado: ['en_progreso', 'cancelado'],"
);

// 3. Add borrador to ADMIN_REVERSE_TRANSITIONS
c = c.replace(
  "  asignado: [],\n  iniciado: ['asignado'],",
  "  borrador: [],\n  asignado: [],\n  iniciado: ['asignado'],"
);

// 4. Add borrador to STATUS_LABELS
c = c.replace(
  "  asignado: 'Asignado',\n  iniciado: 'Iniciado',",
  "  borrador: 'Borrador',\n  asignado: 'Asignado',\n  iniciado: 'Iniciado',"
);

// 5. Add borrador to STATUS_COLORS
c = c.replace(
  "  asignado: 'bg-blue-500/20 text-blue-400 border-blue-500/30',",
  "  borrador: 'bg-slate-500/20 text-slate-400 border-slate-500/30',\n  asignado: 'bg-blue-500/20 text-blue-400 border-blue-500/30',"
);

// 6. Add facturacion_tipo and tarifa_hora to Ticket interface
c = c.replace(
  '  // Financiero\n  monto_servicio: number\n  // Correlación inspección',
  '  // Financiero\n  monto_servicio: number\n  facturacion_tipo: \'fijo\' | \'por_hora\' | null\n  tarifa_hora: number | null\n  // Correlación inspección'
);

// 7. Add DEFAULT_HOURLY_RATE constant
c = c.replace(
  'export const DEFAULT_COMMISSION_PERCENTAGE = 50.00',
  'export const DEFAULT_COMMISSION_PERCENTAGE = 50.00\nexport const DEFAULT_HOURLY_RATE = 10.00'
);

// 8. Add ClienteContacto interface before ClienteStatus
const contactoBlock = `// ─── Contactos de Cliente ────────────────────────────────────────────────────

export interface ClienteContacto {
  id: string
  nombre: string
  apellido: string | null
  email: string | null
  telefono: string
  cargo: string | null
  es_principal: boolean
}

`;
c = c.replace(
  '// ─── Clientes DB (Sprint 7) ───────────────────────────────────────────────────\n\nexport type ClienteStatus',
  '// ─── Clientes DB (Sprint 7) ───────────────────────────────────────────────────\n\n' + contactoBlock + 'export type ClienteStatus'
);

// 9. Add contactos field to Cliente interface
c = c.replace(
  '  // Computed\n  tickets_count?: number\n  ultimo_ticket_fecha?: string | null\n}',
  '  // Contactos de la empresa\n  contactos?: ClienteContacto[]\n  // Computed\n  tickets_count?: number\n  ultimo_ticket_fecha?: string | null\n}'
);

// 10. Add contactos to ClienteCreateInput
c = c.replace(
  '  rif_cedula?: string\n  observaciones?: string\n}\n\nexport interface ClienteUpdateInput',
  '  rif_cedula?: string\n  observaciones?: string\n  contactos?: Omit<ClienteContacto, \'id\'>[]\n}\n\nexport interface ClienteUpdateInput'
);

// 11. Add facturacion_tipo to PaymentScheduleRow
c = c.replace(
  '  monto_a_pagar: number\n  estado_pago: PaymentStatus',
  '  monto_a_pagar: number\n  facturacion_tipo: \'fijo\' | \'por_hora\' | null\n  estado_pago: PaymentStatus'
);

fs.writeFileSync(filePath, c);
console.log('types/index.ts patched successfully');
