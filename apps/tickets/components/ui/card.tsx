import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "glass" | "dark"
  }
>(({ className, variant = "glass", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl transition-all duration-300",
      variant === "glass" && [
        "border border-white/[0.18]",
        "bg-gradient-to-br from-white/[0.19] to-white/[0.10]",
        "backdrop-blur-[20px] saturate-[1.4]",
        "shadow-[0_8px_32px_rgba(21,57,120,0.12)]",
        "hover:translate-y-[-4px]",
        "hover:shadow-[0_20px_60px_rgba(21,57,120,0.24),0_0_0_1px_rgba(158,190,255,0.20)]",
        "hover:border-[rgba(107,147,247,0.15)]",
        "hover:bg-gradient-to-br hover:from-white/[0.06] hover:to-white/[0.02]",
      ],
      variant === "dark" && [
        "border border-white/[0.18]",
        "bg-gradient-to-br from-white/[0.19] to-white/[0.10]",
        "backdrop-blur-[28px] saturate-[1.7]",
      ],
      variant === "default" && [
        "border border-white/10",
        "bg-white/5",
      ],
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-heading text-xl font-semibold leading-none tracking-tight text-white",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-white/60", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
