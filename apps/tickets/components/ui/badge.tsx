import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-blue-500/30 bg-blue-500/20 text-blue-400",
        secondary:
          "border-white/20 bg-white/10 text-white/80",
        destructive:
          "border-red-500/30 bg-red-500/20 text-red-400",
        success:
          "border-green-500/30 bg-green-500/20 text-green-400",
        warning:
          "border-yellow-500/30 bg-yellow-500/20 text-yellow-400",
        purple:
          "border-purple-500/30 bg-purple-500/20 text-purple-400",
        outline:
          "border-white/20 text-white/70",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
