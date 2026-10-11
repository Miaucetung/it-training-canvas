import { ComponentProps } from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-accent-solid text-on-accent-solid [a&]:hover:opacity-90",
        secondary:
          "border-border-subtle bg-surface-elevated text-text-secondary [a&]:hover:bg-surface-sunken",
        success:
          "border-status-success-border bg-status-success-bg text-status-success-fg",
        warning:
          "border-status-warning-border bg-status-warning-bg text-status-warning-fg",
        destructive:
          "border-status-error-border bg-status-error-bg text-status-error-fg",
        trunk:
          "border-status-trunk-border bg-status-trunk-bg text-status-trunk-fg",
        blocking:
          "border-status-blocking-border bg-status-blocking-bg text-status-blocking-fg",
        outline:
          "border-border-default text-text-primary [a&]:hover:bg-surface-elevated",
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
