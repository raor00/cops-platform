'use client'

import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { downloadCSV } from '@/lib/utils/csv-export'
import type { EnhancedDashboardStats, ReportsSummary } from '@/types'

interface ReportExportButtonProps {
  stats: EnhancedDashboardStats
  reports: ReportsSummary
}

export function ReportExportButton({ stats, reports }: ReportExportButtonProps) {
  function handleExportCsv() {
    const headers = ['Técnico', 'Completados', 'Activos', 'Tasa %', 'Pendiente Pago']
    const rows = stats.technicianKPIs.map((kpi) => {
      const total = kpi.ticketsCompletados + kpi.ticketsActivos
      const tasa = total > 0 ? Math.round((kpi.ticketsCompletados / total) * 100) : 0
      return [
        `${kpi.nombre} ${kpi.apellido}`,
        String(kpi.ticketsCompletados),
        String(kpi.ticketsActivos),
        `${tasa}%`,
        String(kpi.montoPendiente),
      ]
    })

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const bancaribeHeaders = ['Cliente', 'Agencia', 'Tickets', 'Servicios', 'Proyectos', 'Finalizados', 'Cupones', 'Horas']
    const bancaribeRows = reports.clientRows.map((row) => [row.cliente, row.agencia, String(row.tickets), String(row.servicios), String(row.proyectos), String(row.finalizados), String(row.cupones), String(row.horasTrabajadas)])
    const reportCsv = [bancaribeHeaders, ...bancaribeRows].map((row) => row.join(',')).join('\n')
    const technicianHeaders = ['Técnico', 'Tickets', 'Servicios', 'Proyectos', 'Finalizados', 'Cupones', 'Horas']
    const technicianRows = reports.technicianRows.map((row) => [row.tecnico, String(row.tickets), String(row.servicios), String(row.proyectos), String(row.finalizados), String(row.cupones), String(row.horasTrabajadas)])
    const technicianCsv = [technicianHeaders, ...technicianRows].map((row) => row.join(',')).join('\n')
    downloadCSV(`${csv}\n\n${reportCsv}\n\n${technicianCsv}`, `reporte-operativo-${new Date().toISOString().split('T')[0]}.csv`)
  }

  function handleExportPdf() {
    const html = `
      <html><head><title>Reporte operativo</title><style>
      body{font-family:Arial,sans-serif;padding:24px;color:#0f172a} h1,h2{margin:0 0 12px} table{width:100%;border-collapse:collapse;margin-top:12px} th,td{border:1px solid #cbd5e1;padding:8px;text-align:left;font-size:12px} .meta{margin:12px 0 20px;color:#475569;font-size:12px} .cards{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:20px}.card{border:1px solid #cbd5e1;border-radius:12px;padding:12px;min-width:140px}
      </style></head><body>
      <h1>Reporte operativo</h1>
      <div class="meta">Preset: ${reports.filters.preset || 'general'} · Mes: ${reports.filters.month || 'Todos'} · Cliente: ${reports.filters.client || 'Todos'} · Agencia: ${reports.filters.agency || 'Todas'} · Técnico: ${reports.filters.technician || 'Todos'}</div>
      <div class="cards">
        <div class="card"><strong>Tickets</strong><div>${reports.totalTickets}</div></div>
        <div class="card"><strong>Finalizados</strong><div>${reports.totalFinalizados}</div></div>
        <div class="card"><strong>Cupones</strong><div>${reports.totalCupones}</div></div>
        <div class="card"><strong>Horas</strong><div>${reports.totalHoras}</div></div>
      </div>
      <h2>Resumen por cliente y agencia</h2>
      <table><thead><tr><th>Cliente</th><th>Agencia</th><th>Tickets</th><th>Servicios</th><th>Proyectos</th><th>Finalizados</th><th>Cupones</th><th>Horas</th></tr></thead><tbody>
      ${reports.clientRows.map((row) => `<tr><td>${row.cliente}</td><td>${row.agencia}</td><td>${row.tickets}</td><td>${row.servicios}</td><td>${row.proyectos}</td><td>${row.finalizados}</td><td>${row.cupones}</td><td>${row.horasTrabajadas}</td></tr>`).join('')}
      </tbody></table>
      <h2>Detalle Bancaribe por agencia</h2>
      <table><thead><tr><th>Agencia</th><th>Tickets</th><th>Servicios</th><th>Finalizados</th><th>Cupones</th><th>Horas</th></tr></thead><tbody>
      ${reports.bancaribeRows.map((row) => `<tr><td>${row.agencia}</td><td>${row.tickets}</td><td>${row.servicios}</td><td>${row.finalizados}</td><td>${row.cupones}</td><td>${row.horasTrabajadas}</td></tr>`).join('') || '<tr><td colspan="6">Sin datos</td></tr>'}
      </tbody></table>
      <h2>Resumen por técnico</h2>
      <table><thead><tr><th>Técnico</th><th>Tickets</th><th>Servicios</th><th>Proyectos</th><th>Finalizados</th><th>Cupones</th><th>Horas</th></tr></thead><tbody>
      ${reports.technicianRows.map((row) => `<tr><td>${row.tecnico}</td><td>${row.tickets}</td><td>${row.servicios}</td><td>${row.proyectos}</td><td>${row.finalizados}</td><td>${row.cupones}</td><td>${row.horasTrabajadas}</td></tr>`).join('') || '<tr><td colspan="7">Sin datos</td></tr>'}
      </tbody></table>
      </body></html>`
    const printWindow = window.open('', '_blank', 'width=1200,height=900')
    if (!printWindow) return
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleExportCsv} className="gap-2">
        <Download className="h-4 w-4" />
        Exportar CSV
      </Button>
      <Button variant="outline" size="sm" onClick={handleExportPdf} className="gap-2">
        <Download className="h-4 w-4" />
        Exportar PDF
      </Button>
    </div>
  )
}
