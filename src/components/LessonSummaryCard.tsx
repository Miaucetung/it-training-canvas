import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { LessonSummary } from "@/lib/content/types";

interface LessonSummaryCardProps {
  summary: LessonSummary;
}

export function LessonSummaryCard({ summary }: LessonSummaryCardProps) {
  return (
    <Card className="mt-8 p-6 space-y-6">
      <h2 className="text-lg font-semibold">Lernzusammenfassung</h2>

      {/* Section 1 — Must Know */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          ✅ Das musst du wissen
        </h3>
        <ul className="list-disc list-inside space-y-1">
          {summary.mustKnow.map((item, i) => (
            <li key={i} className="text-sm leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Section 2 — Best Practice */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          ⚙️ Best Practice (Empfehlung)
        </h3>
        <div className="space-y-3">
          {summary.bestPractice.map((entry, i) => (
            <div key={i}>
              <div className="flex items-center gap-1 flex-wrap">
                <span className="font-medium text-sm">{entry.topic}</span>
                {entry.note && (
                  <Badge variant="outline" className="text-xs ml-2">
                    {entry.note}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5 ml-4">
                {entry.practice}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3 — Legacy / Exam Only */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          🚫 Veraltet / Nur für die Prüfung
        </h3>
        <div className="space-y-3">
          {summary.legacyOrExamOnly.map((entry, i) => (
            <div key={i}>
              <span className="font-medium text-sm line-through text-muted-foreground">
                {entry.topic}
              </span>
              <p className="text-sm text-muted-foreground mt-0.5 ml-4">
                {entry.reason}
              </p>
              {entry.replacedBy && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-0.5 ml-4">
                  → {entry.replacedBy}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Section 4 — Fast Facts */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          ⚡ Schnellfakten
        </h3>
        <ol className="list-decimal list-inside space-y-1">
          {summary.fastFacts.map((fact, i) => {
            const verifyIndex = fact.indexOf("Verify:");
            if (verifyIndex === -1) {
              return (
                <li key={i} className="text-sm leading-relaxed">
                  {fact}
                </li>
              );
            }
            const before = fact.slice(0, verifyIndex);
            const verifyPart = fact.slice(verifyIndex);
            return (
              <li key={i} className="text-sm leading-relaxed">
                {before}
                <code className="text-xs bg-muted px-1 rounded">
                  {verifyPart}
                </code>
              </li>
            );
          })}
        </ol>
      </div>
    </Card>
  );
}
