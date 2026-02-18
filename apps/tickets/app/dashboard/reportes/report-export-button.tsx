'use client'

import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { downloadCSV } from '@/lib/utils/csv-export'
import type { EnhancedDashboardStats } from '@/types'

interface ReportExportButtonProps {
  stats: EnhancedDashboardStats
}

export function ReportExportButton({ stats }: ReportExportButtonProps) {
  function handleExport() {
    // Build CSV from technician KPIs
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
    downloadCSV(csv, `reporte-tecnicos-${new Date().toISOString().split('T')[0]}.csv`)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
      <Download className="h-4 w-4" />
      Exportar CSV
    </Button>
  )
}
