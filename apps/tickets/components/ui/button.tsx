import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border border-[rgba(14,165,233,0.3)] bg-gradient-to-br from-[rgba(14,165,233,0.3)] to-[rgba(2,132,199,0.2)] text-white shadow-[0_4px_20px_rgba(14,165,233,0.15),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-xl hover:translate-y-[-2px] hover:shadow-[0_12px_40px_rgba(14,165,233,0.25),inset_0_1px_0_rgba(255,255,255,0.15)] hover:border-[rgba(56,189,248,0.4)] hover:from-[rgba(14,165,233,0.4)] hover:to-[rgba(2,132,199,0.3)]",
        destructive:
          "border border-red-500/30 bg-gradient-to-br from-red-600/35 to-red-700/25 text-white shadow-[0_4px_20px_rgba(220,38,38,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-xl hover:translate-y-[-2px] hover:shadow-[0_12px_40px_rgba(220,38,38,0.3)] hover:border-red-400/40",
        outline:
          "border border-white/10 bg-gradient-to-br from-white/8 to-white/3 text-white backdrop-blur-xl hover:translate-y-[-2px] hover:shadow-[0_8px_32px_rgba(14,165,233,0.1)] hover:border-[rgba(56,189,248,0.2)] hover:from-white/12 hover:to-white/5",
        secondary:
          "border border-white/15 bg-white/10 text-white backdrop-blur-xl hover:bg-white/15 hover:border-white/20",
        ghost:
          "text-white/80 hover:bg-white/10 hover:text-white",
        link:
          "text-sky-400 underline-offset-4 hover:underline hover:text-sky-300",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Cargando...</span>
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
