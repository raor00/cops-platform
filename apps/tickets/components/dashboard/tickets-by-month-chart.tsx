"use client"

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { TicketsPorMes } from "@/types"

interface TicketsByMonthChartProps {
  data: TicketsPorMes[]
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur-xl">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
          <span className="capitalize text-slate-600">{entry.name}:</span>
          <span className="font-semibold text-slate-900">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export function TicketsByMonthChart({ data }: TicketsByMonthChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
        <XAxis
          dataKey="mes"
          tick={{ fill: "rgba(71,85,105,0.8)", fontSize: 11 }}
          axisLine={{ stroke: "rgba(148,163,184,0.3)" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "rgba(71,85,105,0.8)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ color: "rgba(71,85,105,0.8)", fontSize: "12px" }}
          iconType="circle"
          iconSize={8}
        />
        <Line
          type="monotone"
          dataKey="servicios"
          stroke="#60a5fa"
          strokeWidth={2.5}
          dot={{ fill: "#60a5fa", r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: "#60a5fa" }}
          name="Servicios"
        />
        <Line
          type="monotone"
          dataKey="proyectos"
          stroke="#a78bfa"
          strokeWidth={2.5}
          dot={{ fill: "#a78bfa", r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: "#a78bfa" }}
          name="Proyectos"
        />
        <Line
          type="monotone"
          dataKey="finalizados"
          stroke="#34d399"
          strokeWidth={2}
          strokeDasharray="4 3"
          dot={false}
          name="Finalizados"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
