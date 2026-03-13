const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'lib', 'mock-data.ts');
let c = fs.readFileSync(filePath, 'utf8');

// 1. Add contactos to Banco Nacional (c1)
c = c.replace(
  `    tickets_count: 2,
    ultimo_ticket_fecha: new Date(now - 48 * hour).toISOString(),
  },
  {
    id: "c1000000-0000-0000-0000-000000000002",`,
  `    tickets_count: 2,
    ultimo_ticket_fecha: new Date(now - 48 * hour).toISOString(),
    contactos: [
      { id: "ct01", nombre: "Carlos", apellido: "Rodríguez", email: "c.rodriguez@banconacional.com.ve", telefono: "+58 212 600 0001", cargo: "Gerente de TI", es_principal: true },
      { id: "ct02", nombre: "María", apellido: "López", email: "m.lopez@banconacional.com.ve", telefono: "+58 212 600 0002", cargo: "Jefe de Compras", es_principal: false },
      { id: "ct03", nombre: "Luis", apellido: "Pérez", email: "l.perez@banconacional.com.ve", telefono: "+58 412 600 0003", cargo: "Supervisor de Sistemas", es_principal: false },
    ],
  },
  {
    id: "c1000000-0000-0000-0000-000000000002",`
);

// 2. Add contactos to TecnoMax (c5)
c = c.replace(
  `    tickets_count: 0,
    ultimo_ticket_fecha: null,
  },
  {
    id: "c1000000-0000-0000-0000-000000000006",`,
  `    tickets_count: 0,
    ultimo_ticket_fecha: null,
    contactos: [
      { id: "ct11", nombre: "Alejandro", apellido: "Vásquez", email: "a.vasquez@tecnomax.com.ve", telefono: "+58 212 700 4441", cargo: "Director Comercial", es_principal: true },
      { id: "ct12", nombre: "Sandra", apellido: "Mora", email: "s.mora@tecnomax.com.ve", telefono: "+58 414 700 4442", cargo: "Coordinadora de Proyectos", es_principal: false },
    ],
  },
  {
    id: "c1000000-0000-0000-0000-000000000006",`
);

// 3. Update createDemoCliente to include contactos
c = c.replace(
  `  const cliente: Cliente = {
    id: crypto.randomUUID(),
    nombre: input.nombre,
    apellido: input.apellido || null,
    empresa: input.empresa || null,
    email: input.email || null,
    telefono: input.telefono,
    direccion: input.direccion,
    rif_cedula: input.rif_cedula || null,
    estado: "activo",
    observaciones: input.observaciones || null,
    created_at: now,
    updated_at: now,
    tickets_count: 0,
    ultimo_ticket_fecha: null,
  }`,
  `  const cliente: Cliente = {
    id: crypto.randomUUID(),
    nombre: input.nombre,
    apellido: input.apellido || null,
    empresa: input.empresa || null,
    email: input.email || null,
    telefono: input.telefono,
    direccion: input.direccion,
    rif_cedula: input.rif_cedula || null,
    estado: "activo",
    observaciones: input.observaciones || null,
    contactos: input.contactos ? input.contactos.map((ct) => ({ ...ct, id: crypto.randomUUID() })) : [],
    created_at: now,
    updated_at: now,
    tickets_count: 0,
    ultimo_ticket_fecha: null,
  }`
);

// 4. Update updateDemoCliente to handle contactos
c = c.replace(
  `    observaciones: input.observaciones !== undefined ? (input.observaciones || null) : demoClientes[idx]!.observaciones,
    updated_at: new Date().toISOString(),`,
  `    observaciones: input.observaciones !== undefined ? (input.observaciones || null) : demoClientes[idx]!.observaciones,
    contactos: input.contactos !== undefined ? input.contactos.map((ct) => ({ ...ct, id: (ct as any).id || crypto.randomUUID() })) : demoClientes[idx]!.contactos,
    updated_at: new Date().toISOString(),`
);

fs.writeFileSync(filePath, c);
console.log('mock-data.ts patched');
