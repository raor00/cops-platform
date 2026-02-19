"use client"

import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/ui/back-button"
import type { Ticket, User } from "@/types"
import { formatDate, formatCurrency, formatMinutesToDuration } from "@/lib/utils"

interface ComprobanteViewProps {
  ticket: Ticket
  emisor: User
}

export function ComprobanteView({ ticket, emisor }: ComprobanteViewProps) {
  const handlePrint = () => window.print()

  const fechaEmision = new Date().toLocaleDateString("es-VE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Resultado de la visita — derivado del tipo de ticket
  const esProyecto = ticket.tipo === "proyecto"

  return (
    <>
      {/* ── Barra de acción (oculta en impresión) ── */}
      <div className="no-print mb-6 page-container">
        <BackButton />
        <div className="flex items-center justify-between mt-2">
          <div>
            <h1 className="page-title">Comprobante de Servicio</h1>
            <p className="page-description">{ticket.numero_ticket} — {ticket.asunto}</p>
          </div>
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Imprimir / PDF
          </Button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          DOCUMENTO IMPRIMIBLE
          Todo lo que sigue se renderiza en pantalla Y en @print
      ══════════════════════════════════════════════════════════ */}
      <div className="comprobante-doc">
        {/* ─── ENCABEZADO ─── */}
        <div className="comprobante-header">
          {/* Logo / Nombre empresa */}
          <div className="comprobante-logo-block">
            <div className="comprobante-logo-circle">
              <span>COPS</span>
            </div>
            <div>
              <p className="comprobante-empresa">COPS Electronics, C.A.</p>
              <p className="comprobante-rif">R.I.F. J-30513629-7</p>
              <p className="comprobante-rif">Servicios de Tecnología e Infraestructura</p>
            </div>
          </div>

          {/* Título + número + fecha */}
          <div className="comprobante-title-block">
            <h1 className="comprobante-title">COMPROBANTE DE SERVICIO</h1>
            <p className="comprobante-numero">{ticket.numero_ticket}</p>
            <p className="comprobante-fecha">Fecha de emisión: {fechaEmision}</p>
          </div>
        </div>

        <div className="comprobante-divider" />

        {/* ─── SECCIÓN 1: DATOS DEL CLIENTE ─── */}
        <section className="comprobante-section">
          <h2 className="comprobante-section-title">DATOS DEL CLIENTE</h2>
          <div className="comprobante-grid-2">
            <ComprobanteField label="Cliente" value={ticket.cliente_nombre} />
            <ComprobanteField label="Agencia / Empresa" value={ticket.cliente_empresa || "—"} />
            <ComprobanteField label="Teléfono" value={ticket.cliente_telefono} />
            <ComprobanteField label="Correo electrónico" value={ticket.cliente_email || "—"} />
            <ComprobanteField
              label="Dirección"
              value={ticket.cliente_direccion}
              className="col-span-2"
            />
          </div>
        </section>

        <div className="comprobante-divider" />

        {/* ─── SECCIÓN 2: DETALLES DEL SERVICIO ─── */}
        <section className="comprobante-section">
          <h2 className="comprobante-section-title">DETALLES DEL SERVICIO</h2>
          <div className="comprobante-grid-2">
            <ComprobanteField label="Asunto / Motivo" value={ticket.asunto} className="col-span-2" />
            <ComprobanteField
              label="Hora de Entrada"
              value={ticket.fecha_inicio ? formatDate(ticket.fecha_inicio) : "—"}
            />
            <ComprobanteField
              label="Hora de Salida / Finalización"
              value={ticket.fecha_finalizacion ? formatDate(ticket.fecha_finalizacion) : "—"}
            />
            <ComprobanteField
              label="Horas Trabajadas"
              value={
                ticket.tiempo_trabajado
                  ? formatMinutesToDuration(ticket.tiempo_trabajado)
                  : "No registrado"
              }
            />
            <ComprobanteField
              label="Monto del Servicio"
              value={formatCurrency(ticket.monto_servicio)}
            />
          </div>
        </section>

        <div className="comprobante-divider" />

        {/* ─── SECCIÓN 3: INFORME DE LA VISITA ─── */}
        <section className="comprobante-section">
          <h2 className="comprobante-section-title">INFORME DE LA VISITA</h2>
          <p className="comprobante-label">Procedimiento detallado / Solución aplicada:</p>
          <div className="comprobante-textarea-display">
            {ticket.solucion_aplicada || "No especificado"}
          </div>

          {ticket.observaciones_tecnico && (
            <>
              <p className="comprobante-label mt-3">Observaciones del técnico:</p>
              <div className="comprobante-textarea-display">
                {ticket.observaciones_tecnico}
              </div>
            </>
          )}
        </section>

        <div className="comprobante-divider" />

        {/* ─── SECCIÓN 4: RESULTADO DE LA VISITA ─── */}
        <section className="comprobante-section">
          <h2 className="comprobante-section-title">RESULTADO DE LA VISITA</h2>
          <div className="comprobante-checkboxes">
            <CheckboxItem
              label="Inspección"
              checked={false}
            />
            <CheckboxItem
              label="Mantenimiento / Servicio Técnico"
              checked={!esProyecto}
            />
            <CheckboxItem
              label="Proyecto / Instalación"
              checked={esProyecto}
            />
            <CheckboxItem
              label="Garantía"
              checked={false}
            />
            <CheckboxItem
              label="Otros"
              checked={false}
            />
          </div>
        </section>

        {/* ─── SECCIÓN 5: MATERIALES UTILIZADOS ─── */}
        {ticket.materiales_usados && ticket.materiales_usados.length > 0 && (
          <>
            <div className="comprobante-divider" />
            <section className="comprobante-section">
              <h2 className="comprobante-section-title">MATERIALES UTILIZADOS</h2>
              <table className="comprobante-table">
                <thead>
                  <tr>
                    <th>Material / Repuesto</th>
                    <th className="text-center">Cantidad</th>
                    <th className="text-center">Unidad</th>
                  </tr>
                </thead>
                <tbody>
                  {ticket.materiales_usados.map((m) => (
                    <tr key={m.id}>
                      <td>{m.nombre}</td>
                      <td className="text-center">{m.cantidad}</td>
                      <td className="text-center">{m.unidad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        )}

        <div className="comprobante-divider" />

        {/* ─── SECCIÓN 6: FIRMAS ─── */}
        <section className="comprobante-section">
          <h2 className="comprobante-section-title">FIRMAS Y CONFORMIDAD</h2>
          <div className="comprobante-firmas">
            {/* Técnico */}
            <FirmaBlock
              titulo="TÉCNICO RESPONSABLE"
              nombre={ticket.tecnico
                ? `${ticket.tecnico.nombre} ${ticket.tecnico.apellido}`
                : emisor.rol === "tecnico"
                  ? `${emisor.nombre} ${emisor.apellido}`
                  : "—"}
              cedula={ticket.tecnico?.cedula ?? (emisor.rol === "tecnico" ? emisor.cedula : "—")}
            />

            {/* Cliente */}
            <FirmaBlock
              titulo="CLIENTE / REPRESENTANTE"
              nombre={ticket.cliente_nombre}
              cedula=""
            />

            {/* Supervisor */}
            <FirmaBlock
              titulo="SUPERVISOR / APROBADO POR"
              nombre={`${emisor.nombre} ${emisor.apellido}`}
              cedula={emisor.cedula}
            />
          </div>
        </section>

        {/* ─── PIE DE PÁGINA ─── */}
        <div className="comprobante-footer">
          <p>COPS Electronics, C.A. — R.I.F. J-30513629-7</p>
          <p>Documento generado el {fechaEmision} | Ref. {ticket.numero_ticket}</p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          ESTILOS (pantalla + @print)
      ══════════════════════════════════════════════════════════ */}
      <style>{`
        /* ── Pantalla: contenedor blanco sobre fondo oscuro ── */
        .comprobante-doc {
          background: #ffffff;
          color: #1a1a2e;
          max-width: 860px;
          margin: 0 auto 4rem;
          border-radius: 12px;
          padding: 2.5rem;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          font-family: 'Inter', 'Segoe UI', sans-serif;
          font-size: 13px;
          line-height: 1.5;
        }

        /* ── HEADER ── */
        .comprobante-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.25rem;
        }
        .comprobante-logo-block {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .comprobante-logo-circle {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #1e3a8a;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 800;
          font-size: 11px;
          letter-spacing: 0.05em;
        }
        .comprobante-empresa {
          font-weight: 700;
          font-size: 15px;
          color: #1e3a8a;
          margin: 0;
        }
        .comprobante-rif {
          font-size: 11px;
          color: #6b7280;
          margin: 0;
        }
        .comprobante-title-block {
          text-align: right;
        }
        .comprobante-title {
          font-size: 18px;
          font-weight: 800;
          color: #1e3a8a;
          margin: 0;
          letter-spacing: 0.04em;
        }
        .comprobante-numero {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin: 2px 0 0;
        }
        .comprobante-fecha {
          font-size: 11px;
          color: #6b7280;
          margin: 2px 0 0;
        }

        /* ── DIVISOR ── */
        .comprobante-divider {
          height: 1px;
          background: #e5e7eb;
          margin: 1.25rem 0;
        }

        /* ── SECCIONES ── */
        .comprobante-section {
          margin-bottom: 0.5rem;
        }
        .comprobante-section-title {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #1e3a8a;
          text-transform: uppercase;
          margin: 0 0 0.75rem;
          padding-bottom: 0.25rem;
          border-bottom: 2px solid #1e3a8a;
        }

        /* ── GRID ── */
        .comprobante-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.625rem 1.5rem;
        }
        .col-span-2 { grid-column: span 2; }

        /* ── CAMPO ── */
        .comprobante-field { }
        .comprobante-label {
          font-size: 10px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 2px;
        }
        .comprobante-value {
          font-size: 13px;
          color: #111827;
          border-bottom: 1px solid #d1d5db;
          padding-bottom: 3px;
          min-height: 20px;
        }

        /* ── TEXTAREA DISPLAY ── */
        .comprobante-textarea-display {
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 0.625rem 0.75rem;
          min-height: 70px;
          color: #111827;
          font-size: 13px;
          white-space: pre-wrap;
        }

        /* ── CHECKBOXES ── */
        .comprobante-checkboxes {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem 2rem;
        }
        .comprobante-checkbox-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .comprobante-checkbox {
          width: 16px;
          height: 16px;
          border: 2px solid #374151;
          border-radius: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .comprobante-checkbox.checked {
          background: #1e3a8a;
          border-color: #1e3a8a;
        }
        .comprobante-checkbox.checked::after {
          content: '✓';
          color: white;
          font-size: 10px;
          font-weight: 700;
        }
        .comprobante-checkbox-label {
          font-size: 13px;
          color: #374151;
        }

        /* ── TABLA MATERIALES ── */
        .comprobante-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        .comprobante-table th {
          background: #f3f4f6;
          color: #374151;
          font-weight: 600;
          text-align: left;
          padding: 6px 10px;
          border: 1px solid #e5e7eb;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .comprobante-table td {
          padding: 6px 10px;
          border: 1px solid #e5e7eb;
          color: #111827;
        }
        .comprobante-table tr:nth-child(even) td {
          background: #f9fafb;
        }

        /* ── FIRMAS ── */
        .comprobante-firmas {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-top: 0.5rem;
        }
        .comprobante-firma-block {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }
        .comprobante-firma-titulo {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: #1e3a8a;
          text-transform: uppercase;
          border-bottom: 1px solid #1e3a8a;
          padding-bottom: 3px;
          margin-bottom: 2px;
        }
        .comprobante-firma-row {
          font-size: 11px;
          color: #6b7280;
        }
        .comprobante-firma-row span {
          color: #111827;
          font-weight: 500;
        }
        .comprobante-firma-linea {
          margin-top: 1.5rem;
          border-top: 1px solid #374151;
          padding-top: 4px;
          font-size: 10px;
          color: #9ca3af;
          text-align: center;
        }

        /* ── PIE ── */
        .comprobante-footer {
          margin-top: 1.5rem;
          padding-top: 0.75rem;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          font-size: 10px;
          color: #9ca3af;
        }
        .comprobante-footer p { margin: 2px 0; }

        /* ══════════════════════════════════
           @PRINT — mismo documento sin chrome
        ══════════════════════════════════ */
        @media print {
          .no-print { display: none !important; }

          body, html {
            background: white !important;
          }

          /* Ocultar sidebar, topbar, etc. */
          nav, aside, header[class*="sidebar"],
          [data-sidebar], [class*="sidebar"],
          [class*="topbar"], [class*="nav"] {
            display: none !important;
          }

          .comprobante-doc {
            box-shadow: none;
            border-radius: 0;
            padding: 1.5rem;
            max-width: 100%;
            margin: 0;
            font-size: 11px;
          }

          .comprobante-firmas {
            break-inside: avoid;
          }

          @page {
            size: A4;
            margin: 1.5cm;
          }
        }
      `}</style>
    </>
  )
}

// ─── Sub-componentes de presentación ─────────────────────────────────────────

function ComprobanteField({
  label,
  value,
  className = "",
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={`comprobante-field ${className}`}>
      <p className="comprobante-label">{label}</p>
      <p className="comprobante-value">{value || "—"}</p>
    </div>
  )
}

function CheckboxItem({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div className="comprobante-checkbox-item">
      <div className={`comprobante-checkbox ${checked ? "checked" : ""}`} />
      <span className="comprobante-checkbox-label">{label}</span>
    </div>
  )
}

function FirmaBlock({
  titulo,
  nombre,
  cedula,
}: {
  titulo: string
  nombre: string
  cedula: string
}) {
  return (
    <div className="comprobante-firma-block">
      <p className="comprobante-firma-titulo">{titulo}</p>
      <p className="comprobante-firma-row">
        Nombre y Apellido: <span>{nombre}</span>
      </p>
      {cedula && (
        <p className="comprobante-firma-row">
          C.I.: <span>{cedula}</span>
        </p>
      )}
      {!cedula && (
        <p className="comprobante-firma-row">C.I.: <span>____________________</span></p>
      )}
      <div className="comprobante-firma-linea">Firma</div>
    </div>
  )
}
