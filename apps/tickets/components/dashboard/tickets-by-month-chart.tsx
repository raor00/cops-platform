"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import type { TicketsPorMes } from "@/types"

interface TicketsByMonthChartProps {
  data: TicketsPorMes[]
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-white/20 bg-[#0e2f6f]/95 backdrop-blur-xl p-3 shadow-xl">
      <p className="mb-2 text-xs font-semibold text-white/70 uppercase tracking-wide">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-white/70 capitalize">{entry.name}:</span>
          <span className="font-semibold text-white">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export function TicketsByMonthChart({ data }: TicketsByMonthChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis
          dataKey="mes"
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
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ color: "rgba(255,255,255,0.6)", fontSize: "12px" }}
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
