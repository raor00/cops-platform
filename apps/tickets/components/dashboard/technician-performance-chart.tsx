"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import type { TechnicianKPI } from "@/types"

interface TechnicianPerformanceChartProps {
  data: TechnicianKPI[]
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-white/20 bg-[#0e2f6f]/95 backdrop-blur-xl p-3 shadow-xl min-w-[160px]">
      <p className="mb-2 text-xs font-semibold text-white/70 truncate">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-white/70">{entry.name}:</span>
          <span className="font-semibold text-white">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export function TechnicianPerformanceChart({ data }: TechnicianPerformanceChartProps) {
  const chartData = data.map((tec) => ({
    nombre: `${tec.nombre} ${tec.apellido.charAt(0)}.`,
    Completados: tec.ticketsCompletados,
    Activos: tec.ticketsActivos,
  }))

  if (chartData.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-white/40 text-sm">
        Sin técnicos asignados
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis
          dataKey="nombre"
          tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        <Legend
          wrapperStyle={{ color: "rgba(255,255,255,0.6)", fontSize: "12px" }}
          iconType="circle"
          iconSize={8}
        />
        <Bar dataKey="Completados" fill="#34d399" radius={[4, 4, 0, 0]} maxBarSize={32} />
        <Bar dataKey="Activos" fill="#60a5fa" radius={[4, 4, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  )
}
