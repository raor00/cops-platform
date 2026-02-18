import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-xl border bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 transition-all duration-200",
            "border-white/10 backdrop-blur-xl",
            "focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50",
            "hover:border-white/20 hover:bg-white/8",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            error && "border-red-500/50 focus:ring-red-500/40 focus:border-red-500/50",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-red-400">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
