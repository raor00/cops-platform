"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface KpiCardProps {
  title: string
  value: number
  displayValue: string   // Pre-formatted on the server, no function needed
  subtitle?: string
  icon: ReactNode        // Already rendered JSX, not a component reference
  colorClass: string
  iconColorClass: string
  borderColorClass: string
  trend?: number
  delay?: number
}

function useAnimatedCounter(target: number, duration = 1200) {
  const [display, setDisplay] = useState(0)
  const frameRef = useRef<number>(0)
  const startRef = useRef<number>(0)

  useEffect(() => {
    const startVal = 0
    startRef.current = performance.now()

    function step(now: number) {
      const elapsed = now - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(startVal + (target - startVal) * ease))
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step)
      }
    }

    frameRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frameRef.current)
  }, [target, duration])

  return display
}

export function KpiCard({
  title,
  value,
  displayValue,
  subtitle,
  icon,
  colorClass,
  iconColorClass,
  borderColorClass,
  trend,
  delay = 0,
}: KpiCardProps) {
  const [visible, setVisible] = useState(false)
  const animated = useAnimatedCounter(visible ? value : 0)

  // Use animated counter only for plain numeric values
  // For pre-formatted (currency etc.) we show displayValue once visible
  const shown = visible ? (animated > 0 ? String(animated) : displayValue) : "0"

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay * 1000)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl p-6 border",
        "bg-white/5 backdrop-blur-sm cursor-default",
        "transition-all duration-150 ease-out",
        "hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(14,47,111,0.25)]",
        borderColorClass,
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
      style={{ transitionDelay: `${delay * 1000}ms` }}
    >
      {/* Glow de fondo — se intensifica en hover */}
      <div
        className={cn(
          "absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl pointer-events-none",
          "opacity-10 transition-opacity duration-500 group-hover:opacity-20",
          colorClass
        )}
      />

      {/* Línea top decorativa */}
      <div
        className={cn(
          "absolute top-0 left-6 right-6 h-px opacity-40",
          colorClass.replace("bg-", "bg-")
        )}
      />

      {/* Ícono — posición absoluta para no competir con el texto */}
      <div
        className={cn(
          "absolute top-5 right-5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
          "transition-transform duration-150 group-hover:scale-105",
          colorClass,
          borderColorClass
        )}
      >
        {icon}
      </div>

      <div className="relative pr-14">
        <p className="text-sm font-medium text-white/60 truncate">{title}</p>
        <p className="mt-2 text-2xl font-bold text-white tracking-tight tabular-nums">
          {displayValue}
        </p>
        {subtitle && (
          <p className="mt-1 text-xs text-white/50 truncate">{subtitle}</p>
        )}
        {trend !== undefined && (
          <div
            title="vs mes anterior"
            className={cn(
              "mt-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold",
              trend >= 0
                ? "bg-green-500/15 text-green-400 border border-green-500/25"
                : "bg-red-500/15 text-red-400 border border-red-500/25"
            )}
          >
            <span className="text-sm leading-none">{trend >= 0 ? "↑" : "↓"}</span>
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    </div>
  )
}
