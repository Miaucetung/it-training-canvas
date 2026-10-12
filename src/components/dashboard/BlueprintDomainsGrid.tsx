import { useState } from "react";
import {
  CaretDown,
  CaretUp,
  CheckCircle,
  Circle,
  Folders,
} from "@phosphor-icons/react";
import { BLUEPRINT_DOMAINS } from "@/lib/dashboard-blueprint-config";
import { cn } from "@/lib/utils";

interface BlueprintDomainsGridProps {
  completedTopicIds: string[];
  onSelectTopic: (topicId: string) => void;
}

export function BlueprintDomainsGrid({
  completedTopicIds,
  onSelectTopic,
}: BlueprintDomainsGridProps) {
  // Track open state for domain drilldowns (by domain id)
  const [expandedDomainId, setExpandedDomainId] = useState<string | null>(null);

  const toggleDomain = (domainId: string) => {
    setExpandedDomainId((prev) => (prev === domainId ? null : domainId));
  };

  return (
    <section aria-label="Cisco CCNA 200-301 Prüfungsbereiche" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div>
          <h2 className="text-lg font-bold text-foreground font-sans">
            Die 6 Blueprint-Bereiche
          </h2>
          <p className="text-xs text-muted-foreground">
            Offizielle Cisco CCNA 200-301 Prüfungsdomänen und Lehrplan-Fortschritt
          </p>
        </div>
        <span className="text-xs text-muted-foreground font-mono self-start sm:self-auto">
          Gesamt: 100 % Prüfungsabdeckung
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {BLUEPRINT_DOMAINS.map((domain) => {
          const totalTopics = domain.topicIds.length;
          const completedInDomain = domain.topicIds.filter((id) =>
            completedTopicIds.includes(id)
          ).length;
          const progressPercent =
            totalTopics > 0 ? Math.round((completedInDomain / totalTopics) * 100) : 0;
          const isExpanded = expandedDomainId === domain.id;

          return (
            <div
              key={domain.id}
              className={cn(
                "rounded-lg border bg-surface p-4 transition-all flex flex-col justify-between",
                isExpanded
                  ? "border-primary ring-1 ring-primary/20 shadow-sm"
                  : "border-border hover:border-border-hover"
              )}
            >
              <div>
                {/* Header: Domain number & Official Weight Badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-primary px-1.5 py-0.5 rounded bg-primary/10">
                    {domain.number}
                  </span>
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-surface-elevated border border-border text-foreground">
                    {domain.weightPercent} % Gewichtung
                  </span>
                </div>

                {/* Domain Title & Short description */}
                <h3 className="font-bold text-sm text-foreground mb-1 font-sans">
                  {domain.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                  {domain.shortDesc}
                </p>

                {/* Lesson Progress (Only Lessons/Steps - no question hit rates) */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1 font-mono">
                    <span className="text-muted-foreground">
                      Lektionen: {completedInDomain}/{totalTopics}
                    </span>
                    <span className="text-foreground font-semibold">
                      {progressPercent} %
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-surface-elevated overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Accordion Drill-down */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleDomain(domain.id)}
                  aria-expanded={isExpanded}
                  className="w-full flex items-center justify-between text-xs py-1.5 px-2 rounded border border-border/80 bg-surface-elevated/50 hover:bg-surface-elevated text-foreground font-medium transition-colors"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Folders className="h-3.5 w-3.5 text-primary" />
                    <span>
                      {isExpanded
                        ? "Unterthemen schließen"
                        : `${domain.subtopics.length} Unterthemen anzeigen`}
                    </span>
                  </span>
                  {isExpanded ? (
                    <CaretUp className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <CaretDown className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </button>

                {isExpanded && (
                  <div className="mt-2 pt-2 border-t border-border/60 space-y-1.5 animate-in fade-in duration-200">
                    {domain.subtopics.map((sub) => {
                      const isSubCompleted =
                        sub.topicId && completedTopicIds.includes(sub.topicId);

                      return (
                        <div
                          key={sub.code}
                          className="flex items-start justify-between gap-2 p-1.5 rounded hover:bg-surface-elevated text-xs transition-colors"
                        >
                          <div className="flex items-start gap-1.5 flex-1 min-w-0">
                            {isSubCompleted ? (
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" weight="fill" />
                            ) : (
                              <Circle className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 mt-0.5" />
                            )}
                            <div className="min-w-0">
                              <span className="font-mono text-[11px] font-semibold text-primary mr-1">
                                {sub.code}
                              </span>
                              <span className="text-foreground text-[11px] leading-tight">
                                {sub.title}
                              </span>
                            </div>
                          </div>

                          {sub.topicId && (
                            <button
                              type="button"
                              onClick={() => onSelectTopic(sub.topicId!)}
                              className="text-[11px] font-medium text-primary hover:underline shrink-0 ml-1 py-0.5"
                            >
                              Öffnen
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
