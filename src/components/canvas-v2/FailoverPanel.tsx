import React, { useEffect, useMemo, useState } from "react";
import {
  convergenceTimeline,
  type ChangeKind,
  type ConvergenceMode,
  type FailoverAnalysis,
} from "@/lib/topology/failover";
import { Pause, Play, SkipForward, ArrowCounterClockwise, X } from "@phosphor-icons/react";

interface FailoverPanelProps {
  analysis: FailoverAnalysis;
  mode: ConvergenceMode;
  onModeChange: (mode: ConvergenceMode) => void;
  onClose: () => void;
  prefersReducedMotion?: boolean;
}

const GROUPS: Array<{ title: string; kinds: ChangeKind[] }> = [
  { title: "Interfaces", kinds: ["interface"] },
  { title: "Spanning Tree", kinds: ["stp-root", "stp-port"] },
  { title: "Port-Channel", kinds: ["port-channel"] },
  { title: "HSRP", kinds: ["hsrp"] },
  { title: "Routen", kinds: ["route-removed", "route-added", "route-changed"] },
];

/** Simulationssekunden je Echtzeit-Sekunde beim Abspielen */
const SPEED = 10;

/** Vorher/Nachher einer Ausfall-Aktion mit Konvergenz „sofort“ oder „realistische Zeiten“ (vereinfachtes Modell). */
export const FailoverPanel: React.FC<FailoverPanelProps> = ({ analysis, mode, onModeChange, onClose, prefersReducedMotion = false }) => {
  const events = useMemo(
    () => convergenceTimeline(analysis.before, analysis.after, analysis.actions, analysis.changes, mode),
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
    <section
      aria-label="Ausfall-Analyse"
      className="fixed right-4 top-24 z-30 flex max-h-[65vh] w-[min(30rem,calc(100vw-2rem))] flex-col rounded-xl border border-border bg-card text-card-foreground shadow-2xl"
    >
      <div className="flex items-start justify-between gap-2 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-foreground">Ausfall-Analyse</h2>
          <p className="text-xs text-muted-foreground">{analysis.title}</p>
        </div>
        <button type="button" aria-label="Ausfall-Analyse schließen" onClick={onClose} className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
          <X size={16} aria-hidden />
        </button>
      </div>

      <div className="space-y-2 border-b border-border px-4 py-2 text-xs">
        <div role="radiogroup" aria-label="Konvergenz" className="inline-flex rounded-md border border-input bg-background p-0.5">
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
          Vereinfachtes Modell: Zeiten aus Standard- bzw. Lab-Timern (STP, OSPF, EIGRP, HSRP), ohne Rechen- und
          Übertragungszeiten. Die Ping-Simulation verwendet den konvergierten Endzustand.
        </p>
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
              Nächstes Ereignis
            </button>
            <button type="button" onClick={() => (setPlaying(false), setClock(total))} className="inline-flex items-center gap-1 rounded border border-border px-2 py-0.5 text-foreground hover:bg-accent">
              <SkipForward size={12} aria-hidden /> Endzustand
            </button>
            <button type="button" onClick={() => (setPlaying(false), setClock(0))} className="inline-flex items-center gap-1 rounded border border-border px-2 py-0.5 text-foreground hover:bg-accent">
              <ArrowCounterClockwise size={12} aria-hidden /> t = 0
            </button>
          </div>
        )}
        {realistic && <p className="text-[11px] font-semibold text-foreground">{done ? `Konvergiert nach ${total} s.` : "Konvergenz läuft …"}</p>}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2 text-xs" tabIndex={0} aria-label="Änderungen vorher und nachher">
        {events.length === 0 && <p className="text-muted-foreground">Keine Änderung an STP, Routen, HSRP oder Port-Channels.</p>}
        {GROUPS.map((g) => {
          const list = events.filter((e) => g.kinds.includes(e.change.kind)).sort((a, b) => a.t - b.t);
          if (list.length === 0) return null;
          return (
            <div key={g.title} className="mb-3">
              <h3 className="mb-1 font-semibold text-foreground">{g.title}</h3>
              <ul className="space-y-1.5">
                {list.map((e, k) => {
                  const pending = realistic && e.t > clock;
                  const c = e.change;
                  const tag = c.kind === "route-removed" ? "entfällt" : c.kind === "route-added" ? "neu" : null;
                  return (
                    <li key={k} className="rounded-md border border-border bg-background p-2" data-testid="failover-change">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-foreground">
                          {c.deviceName} {c.subject}
                          {tag && (
                            <span className={`ml-1.5 rounded px-1 text-[10px] font-bold ${c.kind === "route-removed" ? "bg-status-error-bg text-status-error-fg" : "bg-status-success-bg text-status-success-fg"}`}>
                              {tag}
                            </span>
                          )}
                        </span>
                        {realistic && (
                          <span className={`font-mono text-[11px] ${pending ? "text-muted-foreground" : "text-foreground"}`}>
                            t = {e.t} s · {pending ? "ausstehend" : "wirksam"}
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                        <span>vorher: {c.before ?? "–"}</span>
                        <br />
                        <span className="text-foreground">nachher: {c.after ?? "–"}</span>
                      </div>
                      {realistic && <div className="mt-0.5 text-[11px] text-muted-foreground">{e.begruendung}</div>}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
};
