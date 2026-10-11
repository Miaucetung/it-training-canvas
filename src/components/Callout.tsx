import { useState, type ComponentType } from "react";
import {
  Target,
  ArrowsLeftRight,
  Key,
  Warning,
  Brain,
  Lightbulb,
  CaretRight,
} from "@phosphor-icons/react";
import type { DidacticVariant } from "@/lib/content/didactic-blocks";
import { ConceptMarkdown } from "./markdown-render";

type IconCmp = ComponentType<{
  size?: number;
  weight?: "bold" | "regular" | "fill" | "duotone" | "light" | "thin";
  className?: string;
  "aria-hidden"?: boolean;
}>;

interface Props {
  variant: DidacticVariant;
  title?: string;
  body: string;
  dark: boolean;
}

interface Palette {
  wrap: string; // Hintergrund + linker Akzentrand
  icon: string;
  label: string;
}
interface Meta {
  label: string;
  Icon: IconCmp;
  light: Palette;
  dark: Palette;
}

// Lernwissenschaftlich motivierte Signaling-Taxonomie:
// jede Variante hat eine feste Farbe/Ikone → schnelle visuelle Zuordnung.
const META: Record<DidacticVariant, Meta> = {
  kernidee: {
    label: "Kernidee",
    Icon: Target,
    light: {
      wrap: "bg-[var(--status-trunk-bg)] border-[var(--status-trunk-border)]",
      icon: "text-[var(--status-trunk-fg)]",
      label: "text-[var(--status-trunk-fg)]",
    },
    dark: {
      wrap: "bg-[var(--status-trunk-bg)] border-[var(--status-trunk-border)]",
      icon: "text-[var(--status-trunk-fg)]",
      label: "text-[var(--status-trunk-fg)]",
    },
  },
  analogie: {
    label: "Analogie",
    Icon: ArrowsLeftRight,
    light: {
      wrap: "bg-sky-50 dark:bg-sky-500/10 border-[var(--accent-primary)]",
      icon: "text-[var(--accent-primary-fg)]",
      label: "text-[var(--accent-primary-fg)]",
    },
    dark: {
      wrap: "bg-sky-500/10 border-[var(--accent-primary)]",
      icon: "text-[var(--accent-primary-fg)]",
      label: "text-[var(--accent-primary-fg)]",
    },
  },
  merke: {
    label: "Merksatz",
    Icon: Key,
    light: {
      wrap: "bg-[var(--status-success-bg)] border-[var(--status-success-border)]",
      icon: "text-[var(--status-success-fg)]",
      label: "text-[var(--status-success-fg)]",
    },
    dark: {
      wrap: "bg-[var(--status-success-bg)] border-[var(--status-success-border)]",
      icon: "text-[var(--status-success-fg)]",
      label: "text-[var(--status-success-fg)]",
    },
  },
  falle: {
    label: "Prüfungsfalle",
    Icon: Warning,
    light: {
      wrap: "bg-[var(--status-error-bg)] border-[var(--status-error-border)]",
      icon: "text-[var(--status-error-fg)]",
      label: "text-[var(--status-error-fg)]",
    },
    dark: {
      wrap: "bg-[var(--status-error-bg)] border-[var(--status-error-border)]",
      icon: "text-[var(--status-error-fg)]",
      label: "text-[var(--status-error-fg)]",
    },
  },
  check: {
    label: "Selbst-Check",
    Icon: Brain,
    light: {
      wrap: "bg-[var(--status-trunk-bg)] border-[var(--status-trunk-border)]",
      icon: "text-[var(--status-trunk-fg)]",
      label: "text-[var(--status-trunk-fg)]",
    },
    dark: {
      wrap: "bg-[var(--status-trunk-bg)] border-[var(--status-trunk-border)]",
      icon: "text-[var(--status-trunk-fg)]",
      label: "text-[var(--status-trunk-fg)]",
    },
  },
  tipp: {
    label: "Tipp",
    Icon: Lightbulb,
    light: {
      wrap: "bg-[var(--status-warning-bg)] border-[var(--status-warning-border)]",
      icon: "text-[var(--status-warning-fg)]",
      label: "text-[var(--status-warning-fg)]",
    },
    dark: {
      wrap: "bg-[var(--status-warning-bg)] border-[var(--status-warning-border)]",
      icon: "text-[var(--status-warning-fg)]",
      label: "text-[var(--status-warning-fg)]",
    },
  },
};

export function Callout({ variant, title, body, dark }: Props) {
  const meta = META[variant];
  const pal = dark ? meta.dark : meta.light;
  const { Icon } = meta;
  const [open, setOpen] = useState(false);

  // Selbst-Check: Retrieval-Prompt mit eingeklappter Lösung (Testing-Effect).
  if (variant === "check") {
    return (
      <div className={`my-3 rounded-lg border-l-4 px-3 py-2 ${pal.wrap}`}>
        <div className="mb-1 flex items-center gap-1.5">
          <Icon size={15} weight="bold" className={pal.icon} aria-hidden />
          <span
            className={`text-[11px] font-bold uppercase tracking-wide ${pal.label}`}
          >
            {meta.label}
          </span>
        </div>
        {title && (
          <p
            className={`text-xs font-medium leading-relaxed ${dark ? "text-slate-200" : "text-slate-700"}`}
          >
            {title}
          </p>
        )}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`mt-1.5 flex items-center gap-1 text-[11px] font-semibold ${pal.label} hover:underline`}
          aria-expanded={open}
        >
          <CaretRight
            size={11}
            weight="bold"
            className={`transition-transform ${open ? "rotate-90" : ""}`}
            aria-hidden
          />
          {open ? "Lösung verbergen" : "Lösung anzeigen"}
        </button>
        {open && (
          <div className="mt-1">
            <ConceptMarkdown text={body} dark={dark} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`my-3 rounded-lg border-l-4 px-3 py-2 ${pal.wrap}`}>
      <div className="mb-0.5 flex items-center gap-1.5">
        <Icon size={15} weight="bold" className={pal.icon} aria-hidden />
        <span
          className={`text-[11px] font-bold uppercase tracking-wide ${pal.label}`}
        >
          {title || meta.label}
        </span>
      </div>
      <ConceptMarkdown text={body} dark={dark} />
    </div>
  );
}
