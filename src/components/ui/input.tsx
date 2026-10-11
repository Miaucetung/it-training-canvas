import { ComponentProps } from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "bg-[var(--surface)] text-[var(--text-primary)] border-[var(--border-default)] placeholder:text-[var(--text-muted)] selection:bg-[var(--accent-primary)]/20 selection:text-[var(--text-primary)] flex h-9 w-full min-w-0 rounded-lg border px-3 py-1 text-base shadow-xs transition-[color,box-shadow,border-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:border-[var(--accent-primary)]",
        "aria-invalid:border-[var(--status-error-border)] aria-invalid:ring-2 aria-invalid:ring-[var(--status-error-border)]/30",
        className
      )}
      {...props}
    />
  )
}

export { Input }
