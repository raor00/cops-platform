import Link from "next/link"
import {
  Plus,
  ArrowRight,
  UserCheck,
  RefreshCw,
  CheckCircle2,
  Image,
  ClipboardList,
  Timer,
  AlertTriangle,
} from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"
import type { ActivityFeedItem, ChangeType } from "@/types"
import { CHANGE_TYPE_LABELS } from "@/types"

const ICON_MAP: Record<ChangeType, React.ComponentType<{ className?: string }>> = {
  creacion: Plus,
  asignacion: UserCheck,
  cambio_estado: ArrowRight,
  modificacion: RefreshCw,
  finalizacion: CheckCircle2,
  foto_subida: Image,
  inspeccion: ClipboardList,
  sesion_trabajo: Timer,
  bloqueador: AlertTriangle,
}

const COLOR_MAP: Record<ChangeType, string> = {
  creacion: "text-blue-400 bg-blue-500/15 border-blue-500/20",
  asignacion: "text-purple-400 bg-purple-500/15 border-purple-500/20",
  cambio_estado: "text-yellow-400 bg-yellow-500/15 border-yellow-500/20",
  modificacion: "text-slate-400 bg-slate-500/15 border-slate-500/20",
  finalizacion: "text-green-400 bg-green-500/15 border-green-500/20",
  foto_subida: "text-cyan-400 bg-cyan-500/15 border-cyan-500/20",
  inspeccion: "text-indigo-400 bg-indigo-500/15 border-indigo-500/20",
  sesion_trabajo: "text-orange-400 bg-orange-500/15 border-orange-500/20",
  bloqueador: "text-red-400 bg-red-500/15 border-red-500/20",
}

interface ActivityFeedProps {
  items: ActivityFeedItem[]
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  if (items.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-white/40 text-sm">
        Sin actividad reciente
      </div>
    )
  }

  return (
    <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin">
      {items.map((item) => {
        const Icon = ICON_MAP[item.tipo] || RefreshCw
        const color = COLOR_MAP[item.tipo] || COLOR_MAP.modificacion

        const content = (
          <div className="flex items-start gap-3 rounded-xl p-3 border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${color}`}>
              <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white leading-snug truncate">{item.descripcion}</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-white/40">
                {item.ticket_numero && (
                  <span className="font-mono text-blue-400/70">{item.ticket_numero}</span>
                )}
                <span>·</span>
                <span>{item.usuario}</span>
                <span>·</span>
                <span>{formatRelativeTime(item.fecha)}</span>
              </div>
            </div>
          </div>
        )

        return item.ticket_numero ? (
          <Link key={item.id} href="/dashboard/tickets" className="block">
            {content}
          </Link>
        ) : (
          <div key={item.id}>{content}</div>
        )
      })}
    </div>
  )
}
