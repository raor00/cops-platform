"use client"

import { Printer, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Inspeccion, Ticket } from "@/types"
import { formatDate } from "@/lib/utils"

interface InspeccionViewProps {
  inspeccion: Inspeccion
  ticket: Ticket
}

export function InspeccionView({ inspeccion, ticket }: InspeccionViewProps) {
  const handlePrint = () => window.print()

  // Agrupar checklist por categoría
  const groupedChecklist = inspeccion.datos_checklist.reduce((acc, item) => {
    if (!acc[item.categoria]) {
      acc[item.categoria] = []
    }
    acc[item.categoria].push(item)
    return acc
  }, {} as Record<string, typeof inspeccion.datos_checklist>)

  const totalItems = inspeccion.datos_checklist.length
  const completedItems = inspeccion.datos_checklist.filter((item) => item.estado === "ok").length
  const completionPercentage = Math.round((completedItems / totalItems) * 100)

  return (
    <>
      {/* Barra de acción (oculta en impresión) */}
      <div className="no-print flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Reporte de Inspección</h1>
          <p className="text-white/60 mt-1">{ticket.numero_ticket} — {ticket.asunto}</p>
        </div>
        <Button onClick={handlePrint} className="gap-2">
          <Printer className="h-4 w-4" />
          Imprimir / PDF
        </Button>
      </div>

      {/* Documento imprimible */}
      <div className="inspeccion-doc">
        {/* Encabezado */}
        <div className="inspeccion-header">
          <div className="inspeccion-logo-block">
            <div className="inspeccion-logo-circle">
              <span>COPS</span>
            </div>
            <div>
              <p className="inspeccion-empresa">COPS Electronics, C.A.</p>
              <p className="inspeccion-rif">R.I.F. J-30513629-7</p>
              <p className="inspeccion-rif">Servicios de Tecnología e Infraestructura</p>
            </div>
          </div>

          <div className="inspeccion-title-block">
            <h1 className="inspeccion-title">REPORTE DE INSPECCIÓN TÉCNICA</h1>
            <p className="inspeccion-numero">{ticket.numero_ticket}</p>
            <p className="inspeccion-fecha">
              Fecha: {formatDate(inspeccion.fecha_inspeccion)}
            </p>
          </div>
        </div>

        <div className="inspeccion-divider" />

        {/* Información del ticket */}
        <section className="inspeccion-section">
          <h2 className="inspeccion-section-title">INFORMACIÓN DEL SERVICIO</h2>
          <div className="inspeccion-grid-2">
            <InspeccionField label="Cliente" value={ticket.cliente_nombre} />
            <InspeccionField label="Empresa" value={ticket.cliente_empresa || "—"} />
            <InspeccionField label="Dirección" value={ticket.cliente_direccion} className="col-span-2" />
            <InspeccionField label="Asunto" value={ticket.asunto} className="col-span-2" />
            <InspeccionField
              label="Inspector"
              value={
                inspeccion.tecnico
                  ? `${inspeccion.tecnico.nombre} ${inspeccion.tecnico.apellido}`
                  : "—"
              }
            />
            <InspeccionField
              label="Fecha de Inspección"
              value={formatDate(inspeccion.fecha_inspeccion)}
            />
          </div>
        </section>

        <div className="inspeccion-divider" />

        {/* Resumen */}
        <section className="inspeccion-section">
          <h2 className="inspeccion-section-title">RESUMEN</h2>
          <div className="inspeccion-summary">
            <div className="inspeccion-summary-item">
              <span className="inspeccion-summary-label">Total de Items:</span>
              <span className="inspeccion-summary-value">{totalItems}</span>
            </div>
            <div className="inspeccion-summary-item">
              <span className="inspeccion-summary-label">Conformes:</span>
              <span className="inspeccion-summary-value text-green-600">{completedItems}</span>
            </div>
            <div className="inspeccion-summary-item">
              <span className="inspeccion-summary-label">No Conformes:</span>
              <span className="inspeccion-summary-value text-red-600">
                {totalItems - completedItems}
              </span>
            </div>
            <div className="inspeccion-summary-item">
              <span className="inspeccion-summary-label">Porcentaje:</span>
              <span className="inspeccion-summary-value">{completionPercentage}%</span>
            </div>
          </div>
        </section>

        <div className="inspeccion-divider" />

        {/* Checklist por categorías */}
        <section className="inspeccion-section">
          <h2 className="inspeccion-section-title">CHECKLIST DE INSPECCIÓN</h2>
          {Object.entries(groupedChecklist).map(([categoria, items]) => (
            <div key={categoria} className="inspeccion-categoria">
              <h3 className="inspeccion-categoria-title">{categoria}</h3>
              <table className="inspeccion-table">
                <thead>
                  <tr>
                    <th className="w-12 text-center">Estado</th>
                    <th>Item Inspeccionado</th>
                    <th>Observación</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="text-center">
                        {item.estado === "ok" ? (
                          <CheckCircle className="h-5 w-5 text-green-600 inline-block" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 inline-block" />
                        )}
                      </td>
                      <td>{item.descripcion}</td>
                      <td className="text-sm text-gray-600">
                        {item.notas || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </section>

        {/* Observaciones Generales */}
        {inspeccion.observaciones_generales && (
          <>
            <div className="inspeccion-divider" />
            <section className="inspeccion-section">
              <h2 className="inspeccion-section-title">OBSERVACIONES GENERALES</h2>
              <div className="inspeccion-textarea-display">
                {inspeccion.observaciones_generales}
              </div>
            </section>
          </>
        )}

        {/* Recomendaciones */}
        {inspeccion.recomendaciones && (
          <>
            <div className="inspeccion-divider" />
            <section className="inspeccion-section">
              <h2 className="inspeccion-section-title">RECOMENDACIONES</h2>
              <div className="inspeccion-textarea-display">
                {inspeccion.recomendaciones}
              </div>
            </section>
          </>
        )}

        {/* Firma */}
        <div className="inspeccion-divider" />
        <section className="inspeccion-section">
          <h2 className="inspeccion-section-title">FIRMA Y CONFORMIDAD</h2>
          <div className="inspeccion-firma">
            <div className="inspeccion-firma-block">
              <p className="inspeccion-firma-titulo">INSPECTOR TÉCNICO</p>
              <p className="inspeccion-firma-row">
                Nombre: <span>
                  {inspeccion.tecnico
                    ? `${inspeccion.tecnico.nombre} ${inspeccion.tecnico.apellido}`
                    : "—"}
                </span>
              </p>
              {inspeccion.tecnico?.cedula && (
                <p className="inspeccion-firma-row">
                  C.I.: <span>{inspeccion.tecnico.cedula}</span>
                </p>
              )}
              <div className="inspeccion-firma-linea">Firma</div>
            </div>
          </div>
        </section>

        {/* Pie de página */}
        <div className="inspeccion-footer">
          <p>COPS Electronics, C.A. — R.I.F. J-30513629-7</p>
          <p>
            Documento generado el {formatDate(new Date().toISOString())} | Ref.{" "}
            {ticket.numero_ticket}
          </p>
        </div>
      </div>

      {/* Estilos */}
      <style>{`
        .inspeccion-doc {
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

        .inspeccion-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.25rem;
        }

        .inspeccion-logo-block {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .inspeccion-logo-circle {
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

        .inspeccion-empresa {
          font-weight: 700;
          font-size: 15px;
          color: #1e3a8a;
          margin: 0;
        }

        .inspeccion-rif {
          font-size: 11px;
          color: #6b7280;
          margin: 0;
        }

        .inspeccion-title-block {
          text-align: right;
        }

        .inspeccion-title {
          font-size: 18px;
          font-weight: 800;
          color: #1e3a8a;
          margin: 0;
          letter-spacing: 0.04em;
        }

        .inspeccion-numero {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin: 2px 0 0;
        }

        .inspeccion-fecha {
          font-size: 11px;
          color: #6b7280;
          margin: 2px 0 0;
        }

        .inspeccion-divider {
          height: 1px;
          background: #e5e7eb;
          margin: 1.25rem 0;
        }

        .inspeccion-section {
          margin-bottom: 0.5rem;
        }

        .inspeccion-section-title {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #1e3a8a;
          text-transform: uppercase;
          margin: 0 0 0.75rem;
          padding-bottom: 0.25rem;
          border-bottom: 2px solid #1e3a8a;
        }

        .inspeccion-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.625rem 1.5rem;
        }

        .col-span-2 { grid-column: span 2; }

        .inspeccion-field { }

        .inspeccion-label {
          font-size: 10px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 2px;
        }

        .inspeccion-value {
          font-size: 13px;
          color: #111827;
          border-bottom: 1px solid #d1d5db;
          padding-bottom: 3px;
          min-height: 20px;
        }

        .inspeccion-summary {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .inspeccion-summary-item {
          text-align: center;
        }

        .inspeccion-summary-label {
          display: block;
          font-size: 10px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 4px;
        }

        .inspeccion-summary-value {
          display: block;
          font-size: 20px;
          font-weight: 700;
          color: #111827;
        }

        .inspeccion-categoria {
          margin-bottom: 1.5rem;
        }

        .inspeccion-categoria-title {
          font-size: 12px;
          font-weight: 700;
          color: #374151;
          margin: 0 0 0.5rem;
          padding-left: 0.5rem;
          border-left: 3px solid #1e3a8a;
        }

        .inspeccion-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          margin-bottom: 1rem;
        }

        .inspeccion-table th {
          background: #f3f4f6;
          color: #374151;
          font-weight: 600;
          text-align: left;
          padding: 6px 10px;
          border: 1px solid #e5e7eb;
          font-size: 11px;
        }

        .inspeccion-table td {
          padding: 8px 10px;
          border: 1px solid #e5e7eb;
          color: #111827;
          vertical-align: top;
        }

        .inspeccion-table tr:nth-child(even) td {
          background: #f9fafb;
        }

        .inspeccion-textarea-display {
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 0.75rem;
          min-height: 70px;
          color: #111827;
          font-size: 13px;
          white-space: pre-wrap;
          background: #f9fafb;
        }

        .inspeccion-firma {
          margin-top: 2rem;
        }

        .inspeccion-firma-block {
          max-width: 400px;
        }

        .inspeccion-firma-titulo {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: #1e3a8a;
          text-transform: uppercase;
          border-bottom: 1px solid #1e3a8a;
          padding-bottom: 3px;
          margin-bottom: 6px;
        }

        .inspeccion-firma-row {
          font-size: 11px;
          color: #6b7280;
          margin: 4px 0;
        }

        .inspeccion-firma-row span {
          color: #111827;
          font-weight: 500;
        }

        .inspeccion-firma-linea {
          margin-top: 2rem;
          border-top: 1px solid #374151;
          padding-top: 4px;
          font-size: 10px;
          color: #9ca3af;
          text-align: center;
        }

        .inspeccion-footer {
          margin-top: 1.5rem;
          padding-top: 0.75rem;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          font-size: 10px;
          color: #9ca3af;
        }

        .inspeccion-footer p {
          margin: 2px 0;
        }

        @media print {
          .no-print { display: none !important; }
          body, html { background: white !important; }
          nav, aside, header[class*="sidebar"],
          [data-sidebar], [class*="sidebar"],
          [class*="topbar"], [class*="nav"] {
            display: none !important;
          }
          .inspeccion-doc {
            box-shadow: none;
            border-radius: 0;
            padding: 1.5rem;
            max-width: 100%;
            margin: 0;
            font-size: 11px;
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

function InspeccionField({
  label,
  value,
  className = "",
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={`inspeccion-field ${className}`}>
      <p className="inspeccion-label">{label}</p>
      <p className="inspeccion-value">{value || "—"}</p>
    </div>
  )
}
