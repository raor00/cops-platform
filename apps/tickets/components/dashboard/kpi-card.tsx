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
        "relative overflow-hidden rounded-2xl p-6 border transition-all duration-500",
        "bg-white/5 backdrop-blur-sm",
        borderColorClass,
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
      style={{ transitionDelay: `${delay * 1000}ms` }}
    >
      {/* Glow */}
      <div
        className={cn(
          "absolute -top-8 -right-8 h-28 w-28 rounded-full opacity-10 blur-2xl pointer-events-none",
          colorClass
        )}
      />

      <div className="relative flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white/60 truncate">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white tracking-tight tabular-nums">
            {displayValue}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-white/50 truncate">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div
              className={cn(
                "mt-2 flex items-center gap-1 text-xs font-medium",
                trend >= 0 ? "text-green-400" : "text-red-400"
              )}
            >
              <span>{trend >= 0 ? "↑" : "↓"}</span>
              <span>{Math.abs(trend)}% vs mes anterior</span>
            </div>
          )}
        </div>

        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ml-3",
            colorClass,
            borderColorClass
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}
