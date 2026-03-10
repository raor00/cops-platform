import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="relative">
        <textarea
          className={cn(
            "flex min-h-[100px] w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-900/40 transition-all duration-200",
            "border-white/10 backdrop-blur-xl resize-none",
            "focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50",
            "hover:border-slate-300 hover:bg-slate-50",
            "disabled:cursor-not-allowed disabled:opacity-50",
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
Textarea.displayName = "Textarea"

export { Textarea }
