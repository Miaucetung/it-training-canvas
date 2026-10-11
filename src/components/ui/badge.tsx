import { ComponentProps } from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--accent-primary-fg)] text-white [a&]:hover:opacity-90",
        secondary:
          "border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] [a&]:hover:bg-[var(--surface-sunken)]",
        success:
          "border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success-fg)]",
        warning:
          "border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] text-[var(--status-warning-fg)]",
        destructive:
          "border-[var(--status-error-border)] bg-[var(--status-error-bg)] text-[var(--status-error-fg)]",
        trunk:
          "border-[var(--status-trunk-border)] bg-[var(--status-trunk-bg)] text-[var(--status-trunk-fg)]",
        blocking:
          "border-[var(--status-blocking-border)] bg-[var(--status-blocking-bg)] text-[var(--status-blocking-fg)]",
        outline:
          "border-[var(--border-default)] text-[var(--text-primary)] [a&]:hover:bg-[var(--surface-elevated)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
