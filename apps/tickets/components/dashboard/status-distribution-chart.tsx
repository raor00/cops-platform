"use client"

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import type { TicketStatus } from "@/types"
import { STATUS_LABELS } from "@/types"

interface StatusDistributionChartProps {
  data: Record<TicketStatus, number>
}

const STATUS_FILL: Record<TicketStatus, string> = {
  asignado: "#60a5fa",
  iniciado: "#fbbf24",
  en_progreso: "#a78bfa",
  finalizado: "#34d399",
  cancelado: "#f87171",
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { fill: string } }> }) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  if (!item) return null
  return (
    <div className="rounded-xl border border-white/20 bg-[#0e2f6f]/95 backdrop-blur-xl p-3 shadow-xl">
      <div className="flex items-center gap-2 text-sm">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.payload.fill }} />
        <span className="text-white/70">{item.name}:</span>
        <span className="font-semibold text-white">{item.value}</span>
      </div>
    </div>
  )
}

export function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  const chartData = (Object.entries(data) as [TicketStatus, number][])
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      name: STATUS_LABELS[status],
      value: count,
      fill: STATUS_FILL[status],
    }))

  const total = chartData.reduce((sum, d) => sum + d.value, 0)

  if (total === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-white/40 text-sm">
        Sin datos para mostrar
      </div>
    )
  }

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} opacity={0.9} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ color: "rgba(255,255,255,0.6)", fontSize: "11px" }}
            iconType="circle"
            iconSize={8}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center label */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{total}</p>
          <p className="text-xs text-white/50">total</p>
        </div>
      </div>
    </div>
  )
}
