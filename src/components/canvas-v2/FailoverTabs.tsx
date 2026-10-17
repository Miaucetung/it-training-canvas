import React, { useEffect, useMemo, useState } from "react";
import {
  convergenceTimeline,
  type ChangeKind,
  type ConvergenceMode,
  type FailoverAnalysis,
} from "@/lib/topology/failover";
import { Pause, Play, SkipForward, ArrowCounterClockwise, Info } from "@phosphor-icons/react";

export const ENDSTATE_NOTE =
  "Pings rechnen immer mit dem Endzustand der Topologie. Paketverluste während der Konvergenzzeit werden nicht simuliert.";

const GROUPS: Array<{ title: string; kinds: ChangeKind[] }> = [
  { title: "Interfaces", kinds: ["interface"] },
  { title: "Spanning Tree", kinds: ["stp-root", "stp-port"] },
  { title: "Port-Channel", kinds: ["port-channel"] },
  { title: "HSRP", kinds: ["hsrp"] },
  { title: "Routen", kinds: ["route-removed", "route-added", "route-changed"] },
];

/** Simulationssekunden je Echtzeit-Sekunde beim Abspielen */
const SPEED = 10;

const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
    <Info size={28} className="mb-2 opacity-60" aria-hidden />
    <p className="text-sm font-semibold">Noch keine Ausfall-Aktion</p>
    <p className="text-xs">
      Verbindung per Rechtsklick (oder Menütaste bzw. Shift+F10 bei ausgewählter Verbindung) trennen oder ein Interface
      auf shutdown setzen. Hier erscheint dann der Vergleich vorher/nachher.
    </p>
  </div>
);

interface ChangesProps {
  analysis: FailoverAnalysis | null;
}

/** Reiter „Ausfall“: Zustand vorher und nachher je Änderung (Endzustand, ohne Zeitverlauf). */
export const FailoverChangesView: React.FC<ChangesProps> = ({ analysis }) => {
  if (!analysis) return <EmptyState />;
  const changes = analysis.changes;
  return (
    <div className="space-y-3 p-3 text-xs">
      <div>
        <h3 className="text-sm font-bold text-foreground">Ausfall-Analyse</h3>
        <p className="text-muted-foreground" data-testid="failover-title">{analysis.title}</p>
      </div>
      <p className="rounded-md border border-border bg-muted/40 p-2 text-[11px] text-muted-foreground" data-testid="failover-endstate-note">
        {ENDSTATE_NOTE}
      </p>
      {changes.length === 0 && <p className="text-muted-foreground">Keine Änderung an STP, Routen, HSRP oder Port-Channels.</p>}
      {GROUPS.map((g) => {
        const list = changes.filter((c) => g.kinds.includes(c.kind));
        if (list.length === 0) return null;
        return (
          <section key={g.title} aria-label={g.title}>
            <h4 className="mb-1 font-semibold text-foreground">{g.title}</h4>
            <ul className="space-y-1.5">
              {list.map((c, k) => {
                const tag = c.kind === "route-removed" ? "entfällt" : c.kind === "route-added" ? "neu" : null;
                return (
                  <li key={k} className="rounded-md border border-border bg-background p-2" data-testid="failover-change">
                    <span className="font-semibold text-foreground">
                      {c.deviceName} {c.subject}
                      {tag && (
                        <span className={`ml-1.5 rounded px-1 text-[10px] font-bold ${c.kind === "route-removed" ? "bg-status-error-bg text-status-error-fg" : "bg-status-success-bg text-status-success-fg"}`}>
                          {tag}
                        </span>
                      )}
                    </span>
                    <div className="mt-0.5 break-words font-mono text-[11px] text-muted-foreground">
                      <span>vorher: {c.before ?? "–"}</span>
                      <br />
                      <span className="text-foreground">nachher: {c.after ?? "–"}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
};

interface ConvergenceProps {
  analysis: FailoverAnalysis | null;
  mode: ConvergenceMode;
  onModeChange: (mode: ConvergenceMode) => void;
  prefersReducedMotion?: boolean;
}

/** Reiter „Konvergenz“: Modus „sofort“ oder „realistische Zeiten“ mit Zeitverlauf (vereinfachtes Modell). */
export const ConvergenceView: React.FC<ConvergenceProps> = ({ analysis, mode, onModeChange, prefersReducedMotion = false }) => {
  const events = useMemo(
    () => (analysis ? convergenceTimeline(analysis.before, analysis.after, analysis.actions, analysis.changes, mode).sort((a, b) => a.t - b.t) : []),
    [analysis, mode],
  );
  const total = events.reduce((m, e) => Math.max(m, e.t), 0);
  const [clock, setClock] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setClock(0);
    setPlaying(false);
  }, [analysis, mode]);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setClock((c) => {
        const next = Math.min(total, c + SPEED / 10);
        if (next >= total) setPlaying(false);
        return next;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [playing, total]);

  const realistic = mode === "realistisch";
  const done = !realistic || clock >= total;

  return (
    <div className="space-y-3 p-3 text-xs">
      <div role="radiogroup" aria-label="Konvergenz-Modus" className="inline-flex rounded-md border border-input bg-background p-0.5">
        {(["sofort", "realistisch"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={mode === m}
            onClick={() => onModeChange(m)}
            className={`rounded px-2 py-0.5 text-[11px] font-semibold ${mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {m === "sofort" ? "sofort" : "realistische Zeiten"}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground" data-testid="failover-model-note">
        Vereinfachtes Modell: Zeiten aus Standard- bzw. Lab-Timern (STP, OSPF, EIGRP, HSRP), ohne Rechen- und Übertragungszeiten.
      </p>
      <p className="rounded-md border border-border bg-muted/40 p-2 text-[11px] text-muted-foreground" data-testid="convergence-endstate-note">
        {ENDSTATE_NOTE}
      </p>

      {!analysis && <EmptyState />}

      {analysis && (
        <>
          {realistic && total > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-foreground" aria-live="polite">
                t = {Math.floor(clock)} s / {total} s
              </span>
              {!prefersReducedMotion && (
                <button
                  type="button"
                  onClick={() => (clock >= total ? (setClock(0), setPlaying(true)) : setPlaying((p) => !p))}
                  className="inline-flex items-center gap-1 rounded border border-border px-2 py-0.5 text-foreground hover:bg-accent"
                >
                  {playing ? <Pause size={12} aria-hidden /> : <Play size={12} aria-hidden />}
                  {playing ? "Pause" : `Ablauf abspielen (${SPEED}×)`}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setPlaying(false);
                  setClock(events.map((e) => e.t).filter((t) => t > clock).sort((a, b) => a - b)[0] ?? total);
                }}
                className="inline-flex items-center gap-1 rounded border border-border px-2 py-0.5 text-foreground hover:bg-accent"
              >
                <SkipForward size={12} aria-hidden /> Nächstes Ereignis
              </button>
              <button
                type="button"
                onClick={() => (setPlaying(false), setClock(total))}
                className="inline-flex items-center gap-1 rounded border border-border px-2 py-0.5 text-foreground hover:bg-accent"
              >
                Endzustand
              </button>
              <button
                type="button"
                onClick={() => (setPlaying(false), setClock(0))}
                className="inline-flex items-center gap-1 rounded border border-border px-2 py-0.5 text-foreground hover:bg-accent"
              >
                <ArrowCounterClockwise size={12} aria-hidden /> t = 0
              </button>
            </div>
          )}
          {realistic && <p className="text-[11px] font-semibold text-foreground">{done ? `Konvergiert nach ${total} s.` : "Konvergenz läuft …"}</p>}

          <ol className="space-y-1.5" aria-label="Ereignisse nach Zeitpunkt">
            {events.length === 0 && <li className="text-muted-foreground">Keine Änderung an STP, Routen, HSRP oder Port-Channels.</li>}
            {events.map((e, k) => {
              const pending = realistic && e.t > clock;
              const c = e.change;
              return (
                <li key={k} className="rounded-md border border-border bg-background p-2" data-testid="failover-change">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-foreground">
                      {c.deviceName} {c.subject}
                    </span>
                    {realistic && (
                      <span className={`font-mono text-[11px] ${pending ? "text-muted-foreground" : "text-foreground"}`}>
                        t = {e.t} s · {pending ? "ausstehend" : "wirksam"}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 break-words font-mono text-[11px] text-muted-foreground">
                    <span>vorher: {c.before ?? "–"}</span>
                    <br />
                    <span className="text-foreground">nachher: {c.after ?? "–"}</span>
                  </div>
                  {realistic && <div className="mt-0.5 text-[11px] text-muted-foreground">{e.begruendung}</div>}
                </li>
              );
            })}
          </ol>
        </>
      )}
    </div>
  );
};
