import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const VENEZUELA_TIMEZONE = 'America/Caracas'

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('es-VE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: VENEZUELA_TIMEZONE,
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('es-VE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: VENEZUELA_TIMEZONE,
  }).format(new Date(date))
}

export function formatDateTimeExactVE(date: string | Date): string {
  return new Intl.DateTimeFormat('es-VE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: VENEZUELA_TIMEZONE,
  }).format(new Date(date))
}

export function formatDateTimeInputValue(date: string | Date | null | undefined): string {
  if (!date) return ''
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return ''

  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: VENEZUELA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  return formatter.format(parsed).replace(' ', 'T')
}

export function parseDateTimeLocalToISO(value: string | null | undefined): string | undefined {
  if (!value) return undefined
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return undefined
  return parsed.toISOString()
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const target = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Hace un momento'
  if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`
  if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`
  if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} días`
  
  return formatDate(date)
}

export function formatMinutesToDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}min`
}

export function formatMinutesAndHours(minutes: number | null | undefined): string {
  if (minutes == null || minutes <= 0) return '—'
  const hours = minutes / 60
  return `${minutes} min (${hours.toFixed(hours % 1 === 0 ? 0 : 2)} h)`
}

export function getElapsedMinutes(start?: string | null, end?: string | null): number | null {
  if (!start || !end) return null
  const startDate = new Date(start)
  const endDate = new Date(end)
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return null
  return Math.max(0, Math.round((endDate.getTime() - startDate.getTime()) / 60000))
}

export function getInitials(nombre?: string | null, apellido?: string | null): string {
  const safeNombre = nombre?.trim() || 'Usuario'
  const safeApellido = apellido?.trim() || ''
  const first = safeNombre.charAt(0).toUpperCase()
  const last = safeApellido ? safeApellido.charAt(0).toUpperCase() : ''
  return `${first}${last}`
}

export function getFullName(nombre?: string | null, apellido?: string | null): string {
  const parts = [nombre?.trim(), apellido?.trim()].filter(Boolean)
  return parts.join(' ') || 'Usuario'
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
