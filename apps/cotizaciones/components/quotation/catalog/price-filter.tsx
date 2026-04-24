"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"

interface PriceFilterProps {
  min: number
  max: number
  value: [number, number]
  onChange: (value: [number, number]) => void
}

export function PriceFilter({ min, max, value, onChange }: PriceFilterProps) {
  const isDefaultRange = value[0] === min && value[1] === max

  const updateBound = (index: 0 | 1, rawValue: string) => {
    const parsed = Number.parseFloat(rawValue)
    const fallback = index === 0 ? min : max
    const nextValue = Number.isNaN(parsed) ? fallback : parsed
    const nextRange = normalizeRange(index === 0 ? [nextValue, value[1]] : [value[0], nextValue], min, max)
    onChange(nextRange)
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <CurrencyInput label="Mín." value={value[0]} onChange={(next) => updateBound(0, next)} />
        <CurrencyInput label="Máx." value={value[1]} onChange={(next) => updateBound(1, next)} />
      </div>

      <Slider
        min={min}
        max={max}
        step={0.01}
        value={value}
        onValueChange={(next) => {
          if (next.length === 2) {
            onChange(normalizeRange([next[0], next[1]], min, max))
          }
        }}
        className="py-1"
      />

      <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <span>
          ${formatPrice(value[0])} - ${formatPrice(value[1])}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange([min, max])}
          disabled={isDefaultRange}
          className="h-7 px-2 text-xs"
        >
          Limpiar
        </Button>
      </div>
    </div>
  )
}

interface CurrencyInputProps {
  label: string
  value: number
  onChange: (value: string) => void
}

function CurrencyInput({ label, value, onChange }: CurrencyInputProps) {
  return (
    <div className="space-y-1">
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          $
        </span>
        <Input
          type="number"
          min={0}
          step="0.01"
          value={Number.isFinite(value) ? value : 0}
          onChange={(event) => onChange(event.target.value)}
          className="h-8 pl-7 text-xs"
          inputMode="decimal"
        />
      </div>
    </div>
  )
}

function normalizeRange([start, end]: [number, number], min: number, max: number): [number, number] {
  const safeStart = clamp(start, min, max)
  const safeEnd = clamp(end, min, max)
  return safeStart <= safeEnd ? [safeStart, safeEnd] : [safeEnd, safeStart]
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min))
}

function formatPrice(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
