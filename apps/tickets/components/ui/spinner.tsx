import { cn } from "@/lib/utils"

interface SpinnerProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function Spinner({ className, size = "md" }: SpinnerProps) {
  const sizeClass = size === "sm" ? "h-6 w-6" : size === "lg" ? "h-14 w-14" : "h-10 w-10"
  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        sizeClass,
        className
      )}
    >
      <svg
        className="animate-spin"
        viewBox="0 0 38 38"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
      >
        <circle
          cx="19"
          cy="19"
          r="16"
          stroke="currentColor"
          strokeOpacity="0.15"
          strokeWidth="3"
        />
        <path
          d="M35 19a16 16 0 0 0-16-16"
          stroke="#0ea5e9"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

export function FullPageSpinner({ label }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a1628]/80 backdrop-blur-sm">
      <Spinner size="lg" />
      {label && (
        <p className="mt-4 text-sm text-white/50">{label}</p>
      )}
    </div>
  )
}

export function PageLoadingSpinner() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      <p className="text-sm text-white/40 animate-pulse">Cargando...</p>
    </div>
  )
}
