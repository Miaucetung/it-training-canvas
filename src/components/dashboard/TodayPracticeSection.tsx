import {
  ArrowRight,
  BookOpen,
  Calculator,
  ListChecks,
  Target,
} from "@phosphor-icons/react";
import { SubnetQuickCalc } from "./SubnetQuickCalc";

interface TodayPracticeSectionProps {
  onOpenWeaknessDrill: () => void;
  onOpenDragDropTrainer: () => void;
  onOpenSubnetDrill: () => void;
  onOpenLabs?: () => void;
}

export function TodayPracticeSection({
  onOpenWeaknessDrill,
  onOpenDragDropTrainer,
  onOpenSubnetDrill,
  onOpenLabs,
}: TodayPracticeSectionProps) {
  return (
    <section aria-label="Heute üben" className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-foreground font-sans">
          Heute üben
        </h2>
        <p className="text-xs text-muted-foreground">
          Praktische Schnellwerkzeuge und gezieltes Training ohne Umwege
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left Column: Inline Subnet Calculator (7 cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <SubnetQuickCalc />
        </div>

        {/* Right Column: Practice Cards (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-3">
          {/* Schwächen-Drill Card (No stats, clean entry link) */}
          <div className="rounded-lg border border-border bg-surface p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Target className="h-4 w-4 text-primary" weight="bold" />
                <h3 className="font-bold text-sm text-foreground font-sans">
                  Schwächen-Drill
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                Gezielte Wiederholung fehlerhafter Prüfungsfragen zur Schließung von Wissenslücken vor dem Prüfungstermin.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenWeaknessDrill}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded bg-surface-elevated hover:bg-surface border border-border text-foreground font-medium text-xs transition-colors"
            >
              <span>Schwächen-Drill starten</span>
              <ArrowRight className="h-3.5 w-3.5 text-primary" />
            </button>
          </div>

          {/* Drag-and-Drop Trainer Card (No stats, clean entry link) */}
          <div className="rounded-lg border border-border bg-surface p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <ListChecks className="h-4 w-4 text-primary" weight="bold" />
                <h3 className="font-bold text-sm text-foreground font-sans">
                  Drag-and-Drop Trainer (81 Labs)
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                Interaktive Zuordnungsaufgaben zu Protokollen, Header-Feldern, Portnummern und Konfigurationsschritten.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenDragDropTrainer}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded bg-surface-elevated hover:bg-surface border border-border text-foreground font-medium text-xs transition-colors"
            >
              <span>D&D-Trainer öffnen</span>
              <ArrowRight className="h-3.5 w-3.5 text-primary" />
            </button>
          </div>

          {/* Subnetting-Drill Speedtraining & Packet Tracer Labs Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onOpenSubnetDrill}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded border border-border/80 bg-surface/80 hover:bg-surface-elevated text-muted-foreground hover:text-foreground text-xs font-mono transition-colors"
            >
              <Calculator className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Subnetting-Drill</span>
            </button>
            {onOpenLabs && (
              <button
                type="button"
                onClick={onOpenLabs}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 hover:text-white text-xs font-medium transition-colors"
              >
                <BookOpen className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                <span>Packet Tracer Labs (55)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
