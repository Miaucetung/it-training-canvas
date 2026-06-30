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
      wrap: "bg-indigo-50 border-indigo-400",
      icon: "text-indigo-600",
      label: "text-indigo-700",
    },
    dark: {
      wrap: "bg-indigo-500/10 border-indigo-400",
      icon: "text-indigo-300",
      label: "text-indigo-200",
    },
  },
  analogie: {
    label: "Analogie",
    Icon: ArrowsLeftRight,
    light: {
      wrap: "bg-sky-50 border-sky-400",
      icon: "text-sky-600",
      label: "text-sky-700",
    },
    dark: {
      wrap: "bg-sky-500/10 border-sky-400",
      icon: "text-sky-300",
      label: "text-sky-200",
    },
  },
  merke: {
    label: "Merksatz",
    Icon: Key,
    light: {
      wrap: "bg-emerald-50 border-emerald-400",
      icon: "text-emerald-600",
      label: "text-emerald-700",
    },
    dark: {
      wrap: "bg-emerald-500/10 border-emerald-400",
      icon: "text-emerald-300",
      label: "text-emerald-200",
    },
  },
  falle: {
    label: "Prüfungsfalle",
    Icon: Warning,
    light: {
      wrap: "bg-rose-50 border-rose-400",
      icon: "text-rose-600",
      label: "text-rose-700",
    },
    dark: {
      wrap: "bg-rose-500/10 border-rose-400",
      icon: "text-rose-300",
      label: "text-rose-200",
    },
  },
  check: {
    label: "Selbst-Check",
    Icon: Brain,
    light: {
      wrap: "bg-violet-50 border-violet-400",
      icon: "text-violet-600",
      label: "text-violet-700",
    },
    dark: {
      wrap: "bg-violet-500/10 border-violet-400",
      icon: "text-violet-300",
      label: "text-violet-200",
    },
  },
  tipp: {
    label: "Tipp",
    Icon: Lightbulb,
    light: {
      wrap: "bg-amber-50 border-amber-400",
      icon: "text-amber-600",
      label: "text-amber-700",
    },
    dark: {
      wrap: "bg-amber-500/10 border-amber-400",
      icon: "text-amber-300",
      label: "text-amber-200",
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
