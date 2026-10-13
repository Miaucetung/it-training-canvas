import {
  ArrowRight,
  BookOpen,
  ClockCounterClockwise,
  ListChecks,
  Question,
} from "@phosphor-icons/react";

export interface RecentActivityItem {
  id: string;
  type: "topic" | "quiz" | "dragdrop";
  title: string;
  timestamp?: number;
}

interface RecentActivitySectionProps {
  recentItems: RecentActivityItem[];
  onSelectItem: (item: RecentActivityItem) => void;
  onStartFirstTopic: () => void;
}

function formatRelativeTime(ts?: number): string {
  if (!ts) return "Kürzlich";
  const diffMs = Date.now() - ts;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return "Vor kurzem";
  if (diffHours === 1) return "Vor 1 Stunde";
  if (diffHours < 24) return `Vor ${diffHours} Stunden`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Gestern";
  return `Vor ${diffDays} Tagen`;
}

export function RecentActivitySection({
  recentItems,
  onSelectItem,
  onStartFirstTopic,
}: RecentActivitySectionProps) {
  const hasHistory = recentItems && recentItems.length > 0;

  return (
    <section aria-label="Zuletzt bearbeitet" className="space-y-3">
      <div className="flex items-center gap-2">
        <ClockCounterClockwise className="h-4 w-4 text-primary" weight="bold" />
        <h2 className="text-base font-bold text-foreground font-sans">
          Zuletzt bearbeitet
        </h2>
      </div>

      {hasHistory ? (
        <div className="rounded-lg border border-border bg-surface divide-y divide-border overflow-hidden">
          {recentItems.slice(0, 4).map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="p-3 sm:px-4 sm:py-3 flex items-center justify-between gap-3 hover:bg-surface-elevated/60 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 rounded bg-primary/10 text-accent-primary-fg flex items-center justify-center shrink-0">
                  {item.type === "topic" ? (
                    <BookOpen className="h-4 w-4" weight="bold" />
                  ) : item.type === "dragdrop" ? (
                    <ListChecks className="h-4 w-4" weight="bold" />
                  ) : (
                    <Question className="h-4 w-4" weight="bold" />
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-semibold text-foreground truncate">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                    <span>
                      {item.type === "topic"
                        ? "Lektion"
                        : item.type === "dragdrop"
                        ? "Drag-and-Drop"
                        : "Quiz"}
                    </span>
                    <span>•</span>
                    <span>{formatRelativeTime(item.timestamp)}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectItem(item)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-elevated hover:bg-surface border border-border text-foreground font-medium text-xs transition-colors shrink-0"
              >
                <span>Fortsetzen</span>
                <ArrowRight className="h-3 w-3 text-primary" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border/80 bg-surface/50 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-0.5">
              Noch keine Lernhistorie vorhanden
            </h3>
            <p className="text-xs text-muted-foreground">
              Beginne mit der ersten Lektion, um deinen Lernfortschritt nach dem Cisco-Blueprint zu starten.
            </p>
          </div>

          <button
            type="button"
            onClick={onStartFirstTopic}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs transition-colors shrink-0 shadow-sm"
          >
            <span>Erste Lektion starten</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </section>
  );
}
