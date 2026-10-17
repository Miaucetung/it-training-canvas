import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { NetworkTopology } from "@/types/topology";
import {
  simulatePing,
  clearArpCache,
  findConnectedLinkForInterface,
} from "@/lib/topology/simulation/packet-simulator";
import type { HopStep, SimulationResult } from "@/lib/topology/simulation/types";
import { formatNatTranslations, type NatTable } from "@/lib/topology/simulation/nat-simulation";
import type { ConvergenceMode, FailoverAnalysis } from "@/lib/topology/failover";
import { TabBar, TabBarList, TabBarPanel, TabBarTab } from "@/components/ui/tabs";
import { ConvergenceView, FailoverChangesView } from "./FailoverTabs";
import {
  Play,
  Pause,
  SkipForward,
  ArrowClockwise,
  Trash,
  X,
  CaretRight,
  CaretDown,
  CaretUp,
  CaretLeft,
  Minus,
  Info,
} from "@phosphor-icons/react";

export type DockTab = "ping" | "ausfall" | "konvergenz";
export type DockStage = "collapsed" | "half" | "full";

/** Am Ping beteiligte Geräte und Links (für Einpassen der Ansicht und dauerhafte Hervorhebung) */
export interface SimulationPath {
  deviceIds: string[];
  linkIds: string[];
}

interface SimulationDockProps {
  topology: NetworkTopology;
  isOpen: boolean;
  onClose: () => void;
  activeHopIndex: number | null;
  onSelectHop: (hopIndex: number | null, deviceId?: string | null, linkId?: string | null, fromDeviceId?: string | null) => void;
  onPathChange?: (path: SimulationPath | null) => void;
  failoverAnalysis?: FailoverAnalysis | null;
  convergenceMode?: ConvergenceMode;
  onConvergenceModeChange?: (mode: ConvergenceMode) => void;
  /** Wechsel auf einen Reiter von außen (nonce erzwingt erneutes Umschalten, z. B. nach einer Ausfall-Aktion) */
  requestedTab?: { tab: DockTab; nonce: number } | null;
  /** Höhenstufe des Bottom Sheets bzw. ein-/ausgeklappte Seitenleiste; ohne Angabe verwaltet das Dock sie selbst */
  stage?: DockStage;
  onStageChange?: (stage: DockStage) => void;
}

const TAB_LABELS: Array<{ id: DockTab; label: string }> = [
  { id: "ping", label: "Ping" },
  { id: "ausfall", label: "Ausfall" },
  { id: "konvergenz", label: "Konvergenz" },
];

const PREVIEW_NOTE = "Vorschau · noch nicht simuliert: RIP, IPv6-Ping, IPsec, DHCP-Relay";

/** Zeile in den sichtbaren Bereich des nächsten Scroll-Containers holen; die fixierte Kopfzeile verdeckt nichts. */
function scrollRowIntoView(row: HTMLElement, headerOffset: number) {
  let scroller: HTMLElement | null = row.parentElement;
  while (scroller && !(scroller.scrollHeight > scroller.clientHeight && /(auto|scroll)/.test(getComputedStyle(scroller).overflowY))) {
    scroller = scroller.parentElement;
  }
  if (!scroller) return;
  const s = scroller.getBoundingClientRect();
  const r = row.getBoundingClientRect();
  const above = r.top - s.top - headerOffset;
  const below = r.bottom - s.bottom;
  if (above < 0) scroller.scrollTop += above;
  else if (below > 0) scroller.scrollTop += below;
}

const fieldClass =
  "w-full min-w-0 rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring";

export const SimulationDock: React.FC<SimulationDockProps> = ({
  topology,
  isOpen,
  onClose,
  activeHopIndex,
  onSelectHop,
  onPathChange,
  failoverAnalysis = null,
  convergenceMode = "sofort",
  onConvergenceModeChange,
  requestedTab = null,
  stage: stageProp,
  onStageChange,
}) => {
  const [tab, setTab] = useState<DockTab>("ping");
  const [innerStage, setInnerStage] = useState<DockStage>("half");
  const stage = stageProp ?? innerStage;
  const setStage = onStageChange ?? setInnerStage;

  // Quelle & Ziel
  const [sourceId, setSourceId] = useState<string>("");
  // Quell-IP wie bei `ping … source …`; leer = automatisch (Ausgangsinterface bzw. Host-Interface)
  const [sourceIp, setSourceIp] = useState<string>("");
  const [targetMode, setTargetMode] = useState<"device" | "ip">("device");
  const [targetId, setTargetId] = useState<string>("");
  const [targetCustomIp, setTargetCustomIp] = useState<string>("");

  // Simulations-Ergebnis & ARP-Cache
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [arpCache, setArpCache] = useState<Record<string, Record<string, string>>>({});
  // Translation-Tabelle (dynamisches NAT/PAT): Simulationszustand über mehrere Pings
  const [natTranslations, setNatTranslations] = useState<NatTable>({});

  // Playback State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [expandedHopIdx, setExpandedHopIdx] = useState<number | null>(null);

  // prefers-reduced-motion Abfrage
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const stageRef = useRef(stage);
  stageRef.current = stage;
  useEffect(() => {
    if (!requestedTab) return;
    setTab(requestedTab.tab);
    if (stageRef.current === "collapsed") setStage("half");
  }, [requestedTab, setStage]);

  const linkIdOf = useCallback(
    (hop: HopStep): string | null => {
      if (hop.linkId) return hop.linkId;
      if (!hop.outInterface) return null;
      return findConnectedLinkForInterface(topology, hop.deviceId, hop.outInterface)?.link.id ?? null;
    },
    [topology],
  );

  // Hilfsfunktion: Setzt Hop-Index, Gerätekennung und Link-ID für Pfadanimation
  const selectHop = useCallback((idx: number | null, result?: SimulationResult | null) => {
    const r = result ?? simulationResult;
    if (idx === null || !r || !r.allHops[idx]) {
      onSelectHop(null, null, null, null);
    } else {
      const hop = r.allHops[idx];
      onSelectHop(idx, hop.deviceId, linkIdOf(hop), hop.deviceId);
    }
  }, [simulationResult, linkIdOf, onSelectHop]);

  // Verfügbare Quellgeräte (haben mindestens ein Interface mit IP)
  const candidateDevices = useMemo(() => {
    return topology.devices.filter(
      (d) =>
        d.interfaces.some((i) => !!i.ip || !!i.dhcp) ||
        (d.config?.svis && d.config.svis.length > 0)
    );
  }, [topology]);

  // Quell-IP-Auswahl nur für Router und L3-Switches
  const sourceDevice = topology.devices.find((d) => d.id === sourceId);
  const sourceIpOptions = useMemo(() => {
    if (!sourceDevice || (sourceDevice.type !== "router" && sourceDevice.type !== "switch-l3")) return [];
    return sourceDevice.interfaces
      .filter((i) => !!i.ip)
      .map((i) => ({ name: i.name, ip: i.ip!.split("/")[0] }));
  }, [sourceDevice]);

  // Standard-Quelle & Ziel vorauswählen
  useEffect(() => {
    if (candidateDevices.length > 0 && !sourceId) {
      setSourceId(candidateDevices[0].id);
    }
    if (candidateDevices.length > 1 && !targetId) {
      setTargetId(candidateDevices[candidateDevices.length - 1].id);
    }
  }, [candidateDevices, sourceId, targetId]);

  // Ping ausführen
  const handleRunPing = () => {
    setIsPlaying(false);
    selectHop(null);
    setExpandedHopIdx(null);
    setTab("ping");

    const res = simulatePing({
      topology,
      sourceDeviceId: sourceId,
      targetDeviceId: targetMode === "device" ? targetId : undefined,
      targetIp: targetMode === "ip" ? targetCustomIp.trim() : undefined,
      sourceIp: sourceIp || undefined,
      arpCache,
      natTranslations,
    });

    setSimulationResult(res);
    setArpCache(res.arpCache);
    setNatTranslations(res.natTranslations ?? {});

    if (res.allHops.length > 0) {
      const deviceIds = [...new Set(res.allHops.map((h) => h.deviceId))];
      const linkIds = [...new Set(res.allHops.map(linkIdOf).filter((id): id is string => !!id))];
      onPathChange?.({ deviceIds, linkIds });
      selectHop(0, res);
      if (!prefersReducedMotion) {
        setIsPlaying(true);
      }
    } else {
      onPathChange?.(null);
    }
  };

  // ARP-Cache zurücksetzen
  const handleClearArp = () => {
    const fresh = clearArpCache();
    setArpCache(fresh);
    if (simulationResult) {
      setSimulationResult({
        ...simulationResult,
        arpCache: fresh,
      });
    }
  };

  // Translation-Tabelle leeren (entspricht clear ip nat translation *)
  const handleClearNat = () => {
    setNatTranslations({});
  };
  const natDevices = topology.devices.filter((d) => (natTranslations[d.id] ?? []).length > 0);

  // Timer für Auto-Play
  const totalHops = simulationResult?.allHops.length ?? 0;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isPlaying || totalHops === 0 || prefersReducedMotion || !simulationResult) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalMs = Math.round(1000 / speedMultiplier);
    timerRef.current = setInterval(() => {
      const cur = activeHopIndex ?? 0;
      const next = cur + 1;
      if (next >= totalHops) {
        setIsPlaying(false);
      } else {
        selectHop(next);
      }
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, totalHops, speedMultiplier, prefersReducedMotion, activeHopIndex, simulationResult, selectHop]);

  // Aktuelle Zeile mitscrollen (Kopfzeile ist fixiert)
  const tableRef = useRef<HTMLTableElement>(null);
  useEffect(() => {
    if (activeHopIndex === null || !tableRef.current) return;
    const row = tableRef.current.querySelector<HTMLElement>(`tr[data-hop-index="${activeHopIndex}"]`);
    if (row) scrollRowIntoView(row, tableRef.current.querySelector("thead")?.getBoundingClientRect().height ?? 0);
  }, [activeHopIndex, tab, stage]);

  // Schritt-Navigation
  const handleStepForward = () => {
    setIsPlaying(false);
    if (totalHops === 0) return;
    const cur = activeHopIndex ?? 0;
    selectHop(Math.min(totalHops - 1, cur + 1));
  };

  const handleStepBack = () => {
    setIsPlaying(false);
    if (totalHops === 0) return;
    const cur = activeHopIndex ?? 0;
    selectHop(Math.max(0, cur - 1));
  };

  const handleResetStep = () => {
    setIsPlaying(false);
    selectHop(0);
  };

  if (!isOpen) return null;

  const collapsed = stage === "collapsed";
  const stageHeight = stage === "collapsed" ? "var(--sim-sheet-collapsed)" : stage === "half" ? "var(--sim-sheet-half)" : "var(--sim-sheet-full)";
  const forwardCount = simulationResult?.forwardHops.length ?? 0;
  const iconBtn = "rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <aside
      aria-label="Netzwerksimulation & Hop-Inspector"
      style={{ ["--sim-h" as string]: stageHeight } as React.CSSProperties}
      className={`z-30 flex min-h-0 shrink-0 flex-col border-border bg-card text-card-foreground shadow-2xl max-md:h-[var(--sim-h)] max-md:w-full max-md:border-t md:h-auto md:border-l ${
        collapsed ? "md:w-[var(--sim-sidebar-rail)]" : "md:w-[var(--sim-sidebar-width)]"
      } ${stage === "full" ? "max-md:absolute max-md:inset-x-0 max-md:bottom-0" : ""}`}
    >
      {/* Kopfzeile */}
      <div className="shrink-0 border-b border-border px-3 py-1.5">
        <div className={`flex items-center justify-between gap-2 ${collapsed ? "md:flex-col md:justify-start" : ""}`}>
          <h2 className={`text-xs font-bold uppercase tracking-wide text-foreground ${collapsed ? "md:hidden" : ""}`}>Simulation</h2>
          {collapsed && (
            <button
              type="button"
              onClick={() => setStage("half")}
              aria-label="Seitenleiste ausklappen"
              aria-expanded={false}
              className={`hidden md:inline-flex ${iconBtn}`}
            >
              <CaretLeft size={16} aria-hidden />
            </button>
          )}
          <div className={`flex items-center gap-1 ${collapsed ? "md:flex-col" : ""}`}>
            {/* Desktop: Seitenleiste ein-/ausklappen */}
            {!collapsed && (
              <button
                type="button"
                onClick={() => setStage("collapsed")}
                aria-label="Seitenleiste einklappen"
                aria-expanded
                className={`hidden md:inline-flex ${iconBtn}`}
              >
                <CaretRight size={16} aria-hidden />
              </button>
            )}
            {/* Mobil: Bottom Sheet in drei Stufen */}
            <div role="group" aria-label="Höhe des Bottom Sheets" className="inline-flex rounded border border-input bg-background p-0.5 md:hidden">
              {([
                ["collapsed", "Eingeklappt", <Minus key="c" size={13} aria-hidden />],
                ["half", "Halbe Höhe", <CaretUp key="h" size={13} aria-hidden />],
                ["full", "Volle Höhe", <CaretDown key="f" size={13} aria-hidden className="rotate-180" />],
              ] as const).map(([id, label, icon]) => (
                <button
                  key={id}
                  type="button"
                  aria-label={label}
                  aria-pressed={stage === id}
                  onClick={() => setStage(id)}
                  className={`rounded px-1.5 py-0.5 ${stage === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {icon}
                </button>
              ))}
            </div>
            <button type="button" onClick={onClose} aria-label="Simulation schließen" className={iconBtn}>
              <X size={16} aria-hidden />
            </button>
          </div>
        </div>
        <p
          className={`truncate text-[11px] text-muted-foreground ${collapsed ? "md:hidden" : ""}`}
          title="Noch nicht simuliert: RIP, IPv6-Ping, IPsec, DHCP-Relay (ip helper-address)"
          data-testid="simulation-preview-note"
        >
          {PREVIEW_NOTE}
        </p>
      </div>

      {!collapsed && (
        <TabBar value={tab} onValueChange={(v) => setTab(v as DockTab)} className="flex min-h-0 flex-1 flex-col">
          <TabBarList aria-label="Simulationsbereiche" className="flex shrink-0 gap-1 border-b border-border px-3 pt-1.5">
            {TAB_LABELS.map((t) => (
              <TabBarTab
                key={t.id}
                value={t.id}
                className="rounded-t-md border-b-2 border-transparent px-3 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
              >
                {t.label}
                {t.id !== "ping" && failoverAnalysis && (
                  <span className="ml-1 rounded bg-muted px-1 text-[10px] text-foreground" aria-label={`${failoverAnalysis.changes.length} Änderungen`}>
                    {failoverAnalysis.changes.length}
                  </span>
                )}
              </TabBarTab>
            ))}
          </TabBarList>

          {/* ── Ping ── */}
          <TabBarPanel value="ping" className="flex min-h-0 flex-1 flex-col max-md:overflow-y-auto md:overflow-hidden">
            <div className="shrink-0 space-y-2 border-b border-border p-3 text-xs">
              <div className={`grid gap-2 ${sourceIpOptions.length > 0 ? "grid-cols-2" : "grid-cols-1"}`}>
                <div className="min-w-0">
                  <label htmlFor="sim-source-select" className="mb-0.5 block text-[11px] font-medium text-muted-foreground">
                    Quelle:
                  </label>
                  <select
                    id="sim-source-select"
                    value={sourceId}
                    onChange={(e) => {
                      setSourceId(e.target.value);
                      setSourceIp("");
                    }}
                    className={fieldClass}
                  >
                    {candidateDevices.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.interfaces[0]?.ip ?? "Host"})
                      </option>
                    ))}
                  </select>
                </div>
                {sourceIpOptions.length > 0 && (
                  <div className="min-w-0">
                    <label htmlFor="sim-source-ip-select" className="mb-0.5 block text-[11px] font-medium text-muted-foreground">
                      Quell-IP:
                    </label>
                    <select id="sim-source-ip-select" value={sourceIp} onChange={(e) => setSourceIp(e.target.value)} className={fieldClass}>
                      <option value="">automatisch (Ausgangsinterface)</option>
                      {sourceIpOptions.map((o) => (
                        <option key={o.name} value={o.ip}>
                          source {o.ip} ({o.name})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <span id="sim-target-label" className="text-[11px] font-medium text-muted-foreground">Ziel:</span>
                <div role="group" aria-labelledby="sim-target-label" className="inline-flex shrink-0 rounded-md border border-input bg-background p-0.5">
                  {(["device", "ip"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      aria-pressed={targetMode === m}
                      onClick={() => setTargetMode(m)}
                      className={`rounded px-1.5 py-0.5 text-[11px] font-semibold transition-colors ${
                        targetMode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {m === "device" ? "Gerät" : "IP"}
                    </button>
                  ))}
                </div>
                {targetMode === "device" ? (
                  <select aria-label="Zielgerät auswählen" value={targetId} onChange={(e) => setTargetId(e.target.value)} className={fieldClass}>
                    {candidateDevices
                      .filter((d) => d.id !== sourceId)
                      .map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.interfaces[0]?.ip ?? "Host"})
                        </option>
                      ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    aria-label="Ziel-IP eingeben"
                    placeholder="z. B. 203.0.113.50"
                    value={targetCustomIp}
                    onChange={(e) => setTargetCustomIp(e.target.value)}
                    className={`${fieldClass} font-mono`}
                  />
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleRunPing}
                  className="flex items-center gap-1 rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Play size={13} weight="fill" aria-hidden />
                  <span>Ping senden</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearArp}
                  title="ARP-Cache leeren (nächster Ping löst ARP frisch auf und verliert das erste Echo: .!!!!)"
                  className="flex items-center gap-1 rounded-md border border-input bg-background px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Trash size={13} aria-hidden />
                  <span>ARP Reset</span>
                </button>
                {totalHops > 0 && !prefersReducedMotion && (
                  <div className="ml-auto flex items-center gap-0.5" role="group" aria-label="Wiedergabe">
                    <button type="button" onClick={handleResetStep} aria-label="Zurück zum Anfang" title="Zurück zum Anfang" className={iconBtn}>
                      <ArrowClockwise size={14} aria-hidden />
                    </button>
                    <button type="button" onClick={handleStepBack} disabled={activeHopIndex === null || activeHopIndex === 0} aria-label="Schritt zurück" title="Schritt zurück" className={`${iconBtn} disabled:opacity-40`}>
                      <SkipForward size={14} className="rotate-180" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPlaying((p) => !p)}
                      aria-label={isPlaying ? "Pause" : "Abspielen"}
                      title={isPlaying ? "Pause" : "Abspielen"}
                      className="flex items-center rounded bg-secondary px-2 py-1 text-secondary-foreground hover:bg-secondary/80"
                    >
                      {isPlaying ? <Pause size={13} weight="fill" aria-hidden /> : <Play size={13} weight="fill" aria-hidden />}
                    </button>
                    <button type="button" onClick={handleStepForward} disabled={activeHopIndex === null || activeHopIndex >= totalHops - 1} aria-label="Schritt vor" title="Schritt vor" className={`${iconBtn} disabled:opacity-40`}>
                      <SkipForward size={14} aria-hidden />
                    </button>
                    <div className="ml-1 inline-flex rounded border border-input bg-background p-0.5 text-[10px]" role="group" aria-label="Geschwindigkeit">
                      {[0.5, 1, 2].map((spd) => (
                        <button
                          key={spd}
                          type="button"
                          aria-pressed={speedMultiplier === spd}
                          onClick={() => setSpeedMultiplier(spd)}
                          className={`rounded px-1.5 py-0.5 font-mono ${speedMultiplier === spd ? "bg-primary font-bold text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {prefersReducedMotion && (
                <p className="text-[11px] italic text-muted-foreground">prefers-reduced-motion: Animation deaktiviert</p>
              )}
            </div>

            {simulationResult ? (
              <>
                {/* Zusammenfassung */}
                <div className="shrink-0 px-3 pt-3">
                  <div
                    className={`flex items-center gap-3 rounded-lg border p-2.5 ${
                      simulationResult.success
                        ? "border-border bg-accent/20 text-foreground"
                        : "border-status-error-border bg-status-error-bg text-status-error-fg"
                    }`}
                  >
                    <span className="font-mono text-base font-extrabold tracking-wider">{simulationResult.iosSummary}</span>
                    <div className="min-w-0 text-xs">
                      <p className="font-semibold">{simulationResult.explanation}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Gesamtzahl Hops: {simulationResult.allHops.length} (Hinweg: {forwardCount}, Rückweg: {simulationResult.returnHops.length})
                      </p>
                      {simulationResult.simulatedLeases && simulationResult.simulatedLeases.length > 0 && (
                        <p className="text-[11px] text-muted-foreground" data-testid="simulated-leases">
                          Simulierte DHCP-Vergabe (nur in dieser Simulation, keine Bindings auf dem Server):{" "}
                          {simulationResult.simulatedLeases.map((l) => `${l.deviceName} ${l.ip}`).join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* NAT-Translation-Tabelle: eingeklappt */}
                {natDevices.length > 0 && (
                  <details className="mx-3 mt-2 shrink-0 rounded-lg border border-border bg-card text-xs">
                    <summary className="cursor-pointer select-none px-3 py-1.5 font-semibold text-foreground">
                      NAT-Translation-Tabelle (Simulationszustand)
                    </summary>
                    <div className="space-y-2 border-t border-border p-3">
                      <button
                        type="button"
                        onClick={handleClearNat}
                        className="rounded border border-border px-2 py-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                      >
                        clear ip nat translation *
                      </button>
                      {natDevices.map((d) => (
                        <div key={d.id}>
                          <p className="text-muted-foreground">{d.config?.hostname ?? d.name}# show ip nat translations</p>
                          <pre
                            tabIndex={0}
                            aria-label={`show ip nat translations auf ${d.config?.hostname ?? d.name}`}
                            className="overflow-x-auto font-mono text-[11px] text-foreground"
                            data-testid="nat-translations"
                          >
                            {formatNatTranslations(natTranslations[d.id])}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </details>
                )}

                {/* Hop-Tabelle: eigener Scrollbereich mit fixierter Kopfzeile */}
                <div className="mx-3 mb-3 mt-2 min-h-24 rounded-lg border border-border bg-card md:min-h-0 md:flex-1 md:overflow-y-auto" role="region" tabIndex={0} aria-label="Hop-Tabelle, scrollbar">
                  <table ref={tableRef} aria-label="Hop-Tabelle der simulierten Netzwerk-Pfade" className="w-full border-collapse text-left text-xs">
                    <thead className="sticky top-0 z-10 border-b border-border bg-muted text-muted-foreground">
                      <tr>
                        <th scope="col" className="w-8 px-2 py-1.5 text-center font-semibold">#</th>
                        <th scope="col" className="w-28 px-2 py-1.5 font-semibold">Gerät</th>
                        <th scope="col" className="px-2 py-1.5 font-semibold">Aktion & Entscheidung</th>
                        <th scope="col" className="w-14 px-1 py-1.5 text-center font-semibold">Status</th>
                        <th scope="col" className="w-8 px-1 py-1.5 text-center font-semibold"><span className="sr-only">PDU</span></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {simulationResult.allHops.map((hop, index) => {
                        const isSelected = activeHopIndex === index;
                        const isExpanded = expandedHopIdx === index;
                        const isReturn = index >= forwardCount;
                        const startsDirection = index === 0 || index === forwardCount;
                        return (
                          <React.Fragment key={index}>
                            {startsDirection && (
                              <tr>
                                <td colSpan={5} className="bg-muted/60 px-2 py-1 text-[11px] font-semibold text-muted-foreground">
                                  {isReturn ? "Rückweg (Reply)" : "Hinweg (Request)"}
                                </td>
                              </tr>
                            )}
                            <tr
                              data-hop-index={index}
                              aria-current={isSelected ? "step" : undefined}
                              onClick={() => selectHop(index)}
                              className={`cursor-pointer align-top transition-colors ${isSelected ? "bg-accent font-medium" : "text-foreground hover:bg-muted/40"}`}
                            >
                              <td className="px-2 py-1.5 text-center font-mono text-muted-foreground">{index + 1}</td>
                              <td className="px-2 py-1.5">
                                <div className="font-semibold">{hop.deviceName}</div>
                                <div className="break-words font-mono text-[11px] text-muted-foreground">
                                  {hop.inInterface ? `${hop.inInterface} → ` : ""}
                                  {hop.outInterface ?? "-"}
                                </div>
                              </td>
                              <td className="px-2 py-1.5">{hop.reason}</td>
                              <td className="px-1 py-1.5 text-center">
                                <span
                                  className={`inline-block rounded border px-1.5 py-0.5 text-[11px] font-semibold ${
                                    hop.status === "ok"
                                      ? hop.action.startsWith("nat")
                                        ? "border-border-subtle bg-surface-elevated text-text-secondary"
                                        : "border-status-success-border bg-status-success-bg text-status-success-fg"
                                      : "border-status-error-border bg-status-error-bg text-status-error-fg"
                                  }`}
                                >
                                  {hop.status === "ok" ? (hop.action.startsWith("nat") ? "NAT" : "OK") : "DROP"}
                                </span>
                              </td>
                              <td className="px-1 py-1.5 text-center">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedHopIdx(isExpanded ? null : index);
                                  }}
                                  aria-expanded={isExpanded}
                                  className={iconBtn}
                                  title="PDU-Details einsehen"
                                  aria-label={`PDU-Details für Hop ${index + 1} ${isExpanded ? "zuklappen" : "aufklappen"}`}
                                >
                                  {isExpanded ? <CaretDown size={14} aria-hidden /> : <CaretRight size={14} aria-hidden />}
                                </button>
                              </td>
                            </tr>

                            {isExpanded && (
                              <tr className="bg-muted/30">
                                <td colSpan={5} className="px-2 py-2 text-xs">
                                  <div className="grid grid-cols-1 gap-2 rounded-md border border-border bg-background p-2 font-mono text-[11px]">
                                    <div>
                                      <span className="mb-1 block font-bold text-foreground">Layer 2 (Ethernet-Frame):</span>
                                      <div className="text-muted-foreground">
                                        Quell-MAC: <span className="text-foreground">{hop.packet.srcMac}</span>
                                      </div>
                                      <div className="text-muted-foreground">
                                        Ziel-MAC: <span className="text-foreground">{hop.packet.dstMac}</span>
                                      </div>
                                    </div>
                                    <div>
                                      <span className="mb-1 block font-bold text-foreground">Layer 3 (IP-Paket):</span>
                                      <div className="text-muted-foreground">
                                        Quell-IP: <span className="text-foreground">{hop.packet.srcIp}</span>
                                        {hop.natTranslation?.direction === "inside-to-outside" && (
                                          <span className="ml-1 font-bold text-primary">→ {hop.natTranslation.afterIp}</span>
                                        )}
                                      </div>
                                      <div className="text-muted-foreground">
                                        Ziel-IP: <span className="text-foreground">{hop.packet.dstIp}</span>
                                        {hop.natTranslation?.direction === "outside-to-inside" && (
                                          <span className="ml-1 font-bold text-primary">→ {hop.natTranslation.afterIp}</span>
                                        )}
                                      </div>
                                      <div className="text-muted-foreground">
                                        TTL: <span className="text-foreground">{hop.packet.ttl}</span> | Protokoll:{" "}
                                        <span className="text-foreground">{hop.packet.protocol.toUpperCase()}</span>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                <Info size={32} className="mb-2 opacity-50" aria-hidden />
                <p className="text-sm font-semibold">Kein aktiver Ping-Lauf</p>
                <p className="text-xs">
                  Wählen Sie Quelle und Ziel aus und klicken Sie auf „Ping senden“, um den Hop-by-Hop-Trace zu starten.
                </p>
              </div>
            )}
          </TabBarPanel>

          {/* ── Ausfall ── */}
          <TabBarPanel value="ausfall" className="min-h-0 flex-1 overflow-y-auto">
            <FailoverChangesView analysis={failoverAnalysis} />
          </TabBarPanel>

          {/* ── Konvergenz ── */}
          <TabBarPanel value="konvergenz" className="min-h-0 flex-1 overflow-y-auto">
            <ConvergenceView
              analysis={failoverAnalysis}
              mode={convergenceMode}
              onModeChange={(m) => onConvergenceModeChange?.(m)}
              prefersReducedMotion={prefersReducedMotion}
            />
          </TabBarPanel>
        </TabBar>
      )}
    </aside>
  );
};
