import { ComponentProps } from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "bg-surface text-text-primary border-border-default placeholder:text-text-muted selection:bg-accent-primary/20 selection:text-text-primary flex h-9 w-full min-w-0 rounded-lg border px-3 py-1 text-base shadow-xs transition-[color,box-shadow,border-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:border-accent-primary",
        "aria-invalid:border-status-error-border aria-invalid:ring-2 aria-invalid:ring-status-error-border/30",
        className
      )}
      {...props}
    />
  )
}

export { Input }
