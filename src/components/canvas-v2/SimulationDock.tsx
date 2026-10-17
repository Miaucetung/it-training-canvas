import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import type { NetworkTopology } from "@/types/topology";
import {
  simulatePing,
  clearArpCache,
  findConnectedLinkForInterface,
} from "@/lib/topology/simulation/packet-simulator";
import type {
  SimulationResult,
} from "@/lib/topology/simulation/types";
import {
  Play,
  Pause,
  SkipForward,
  ArrowClockwise,
  Trash,
  X,
  CaretRight,
  CaretDown,
  Info,
} from "@phosphor-icons/react";

interface SimulationDockProps {
  topology: NetworkTopology;
  isOpen: boolean;
  onClose: () => void;
  activeHopIndex: number | null;
  onSelectHop: (hopIndex: number | null, deviceId?: string | null, linkId?: string | null) => void;
}

export const SimulationDock: React.FC<SimulationDockProps> = ({
  topology,
  isOpen,
  onClose,
  activeHopIndex,
  onSelectHop,
}) => {
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

  // Hilfsfunktion: Setzt Hop-Index, Gerätekennung und Link-ID für Pfadanimation
  const selectHop = useCallback((idx: number | null, result?: SimulationResult | null) => {
    const r = result ?? simulationResult;
    if (idx === null || !r || !r.allHops[idx]) {
      onSelectHop(null, null, null);
    } else {
      const hop = r.allHops[idx];
      let linkId: string | null = null;
      if (hop.outInterface) {
        const conn = findConnectedLinkForInterface(topology, hop.deviceId, hop.outInterface);
        linkId = conn?.link.id ?? null;
      }
      onSelectHop(idx, hop.deviceId, linkId);
    }
  }, [simulationResult, topology, onSelectHop]);

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

    const res = simulatePing({
      topology,
      sourceDeviceId: sourceId,
      targetDeviceId: targetMode === "device" ? targetId : undefined,
      targetIp: targetMode === "ip" ? targetCustomIp.trim() : undefined,
      sourceIp: sourceIp || undefined,
      arpCache,
    });

    setSimulationResult(res);
    setArpCache(res.arpCache);

    if (res.allHops.length > 0) {
      selectHop(0, res);
      if (!prefersReducedMotion) {
        setIsPlaying(true);
      }
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

  return (
    <aside
      aria-label="Netzwerksimulation & Hop-Inspector"
      className="fixed bottom-0 left-0 right-0 z-30 flex max-h-[50vh] flex-col border-t border-border bg-card text-card-foreground shadow-2xl transition-all"
    >
      {/* Kopfzeile: Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold tracking-wide uppercase text-foreground">
            Canvas Simulation (Phase 1: Ping)
          </span>

          {/* Quelle Auswahl */}
          <div className="flex items-center gap-1.5 text-xs">
            <label htmlFor="sim-source-select" className="text-muted-foreground font-medium">
              Quelle:
            </label>
            <select
              id="sim-source-select"
              value={sourceId}
              onChange={(e) => {
                setSourceId(e.target.value);
                setSourceIp("");
              }}
              className="rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {candidateDevices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.interfaces[0]?.ip ?? "Host"})
                </option>
              ))}
            </select>
          </div>

          {/* Quell-IP (ping … source …) */}
          {sourceIpOptions.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs">
              <label htmlFor="sim-source-ip-select" className="text-muted-foreground font-medium">
                Quell-IP:
              </label>
              <select
                id="sim-source-ip-select"
                value={sourceIp}
                onChange={(e) => setSourceIp(e.target.value)}
                className="rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">automatisch (Ausgangsinterface)</option>
                {sourceIpOptions.map((o) => (
                  <option key={o.name} value={o.ip}>
                    source {o.ip} ({o.name})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Ziel Auswahl (Gerät oder IP) */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground font-medium">Ziel:</span>
            <div className="inline-flex rounded-md border border-input p-0.5 bg-background">
              <button
                type="button"
                onClick={() => setTargetMode("device")}
                className={`rounded px-1.5 py-0.5 text-[11px] font-semibold transition-colors ${
                  targetMode === "device"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Gerät
              </button>
              <button
                type="button"
                onClick={() => setTargetMode("ip")}
                className={`rounded px-1.5 py-0.5 text-[11px] font-semibold transition-colors ${
                  targetMode === "ip"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                IP
              </button>
            </div>

            {targetMode === "device" ? (
              <select
                aria-label="Zielgerät auswählen"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
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
                className="w-32 rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring font-mono"
              />
            )}
          </div>

          {/* Senden Button */}
          <button
            type="button"
            onClick={handleRunPing}
            className="flex items-center gap-1 rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <Play size={13} weight="fill" />
            <span>Ping senden</span>
          </button>

          {/* ARP-Cache leeren Button */}
          <button
            type="button"
            onClick={handleClearArp}
            title="ARP-Cache leeren (nächster Ping löst ARP frisch auf und verliert das erste Echo: .!!!!)"
            className="flex items-center gap-1 rounded-md border border-input bg-background px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Trash size={13} />
            <span className="hidden sm:inline">ARP Reset</span>
          </button>
        </div>

        {/* Playback Controls & Schließen */}
        <div className="flex items-center gap-2">
          {totalHops > 0 && !prefersReducedMotion && (
            <div className="flex items-center gap-1 border-r border-border pr-2">
              <button
                type="button"
                onClick={handleResetStep}
                title="Zurück zum Anfang"
                className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <ArrowClockwise size={14} />
              </button>
              <button
                type="button"
                onClick={handleStepBack}
                disabled={activeHopIndex === null || activeHopIndex === 0}
                title="Schritt zurück"
                className="rounded p-1 text-muted-foreground disabled:opacity-40 hover:bg-accent hover:text-foreground"
              >
                <SkipForward size={14} className="rotate-180" />
              </button>
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                title={isPlaying ? "Pause" : "Abspielen"}
                className="flex items-center gap-1 rounded bg-secondary px-2 py-1 text-xs font-semibold text-secondary-foreground hover:bg-secondary/80"
              >
                {isPlaying ? <Pause size={13} weight="fill" /> : <Play size={13} weight="fill" />}
                <span className="hidden md:inline">{isPlaying ? "Pause" : "Play"}</span>
              </button>
              <button
                type="button"
                onClick={handleStepForward}
                disabled={activeHopIndex === null || activeHopIndex >= totalHops - 1}
                title="Schritt vor"
                className="rounded p-1 text-muted-foreground disabled:opacity-40 hover:bg-accent hover:text-foreground"
              >
                <SkipForward size={14} />
              </button>

              {/* Geschwindigkeit Umschalter */}
              <div className="ml-1 inline-flex rounded border border-input bg-background p-0.5 text-[10px]">
                {[0.5, 1, 2].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => setSpeedMultiplier(spd)}
                    className={`px-1.5 py-0.5 rounded font-mono ${
                      speedMultiplier === spd
                        ? "bg-primary text-primary-foreground font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          )}

          {prefersReducedMotion && (
            <span className="text-[11px] text-muted-foreground italic">
              prefers-reduced-motion: Animation deaktiviert
            </span>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Simulation schließen"
            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Hauptbereich: IOS-Zusammenfassung & Hop-Tabelle */}
      <div className="flex flex-1 flex-col overflow-hidden p-4">
        {simulationResult ? (
          <div className="flex flex-col gap-3 overflow-hidden">
            {/* IOS Ergebnis-Banner */}
            <div
              className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 ${
                simulationResult.success
                  ? "border-border bg-accent/20 text-foreground"
                  : "border-status-error-border bg-status-error-bg text-status-error-fg"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-base font-extrabold tracking-wider">
                  {simulationResult.iosSummary}
                </span>
                <div className="text-xs">
                  <p className="font-semibold">{simulationResult.explanation}</p>
                  <p className="text-muted-foreground text-[11px]">
                    Gesamtzahl Hops: {simulationResult.allHops.length} (Hinweg:{" "}
                    {simulationResult.forwardHops.length}, Rückweg:{" "}
                    {simulationResult.returnHops.length})
                  </p>
                </div>
              </div>
            </div>

            {/* Hop-Inspector Tabelle */}
            <div className="max-h-[30vh] overflow-y-auto rounded-lg border border-border bg-card">
              <table aria-label="Hop-Tabelle der simulierten Netzwerk-Pfade" className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 border-b border-border bg-muted/80 text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-3 py-2 font-semibold w-12 text-center">#</th>
                    <th scope="col" className="px-3 py-2 font-semibold">Richtung</th>
                    <th scope="col" className="px-3 py-2 font-semibold">Gerät</th>
                    <th scope="col" className="px-3 py-2 font-semibold">Interface</th>
                    <th scope="col" className="px-3 py-2 font-semibold">Aktion & Entscheidung</th>
                    <th scope="col" className="px-3 py-2 font-semibold w-24 text-center">Status</th>
                    <th scope="col" className="px-3 py-2 font-semibold w-16 text-center">PDU</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {simulationResult.allHops.map((hop, index) => {
                    const isSelected = activeHopIndex === index;
                    const isExpanded = expandedHopIdx === index;
                    const isReturn = index >= simulationResult.forwardHops.length;

                    return (
                      <React.Fragment key={index}>
                        <tr
                          onClick={() => selectHop(index)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-accent/40 font-medium"
                              : "hover:bg-muted/40 text-foreground"
                          }`}
                        >
                          <td className="px-3 py-2 text-center font-mono text-muted-foreground">
                            {index + 1}
                          </td>
                          <td className="px-3 py-2 text-[11px] text-muted-foreground">
                            {isReturn ? "Rückweg (Reply)" : "Hinweg (Request)"}
                          </td>
                          <td className="px-3 py-2 font-semibold">{hop.deviceName}</td>
                          <td className="px-3 py-2 font-mono text-[11px]">
                            {hop.inInterface ? `${hop.inInterface} → ` : ""}
                            {hop.outInterface ?? "-"}
                          </td>
                          <td className="px-3 py-2">{hop.reason}</td>
                          <td className="px-3 py-2 text-center">
                            <span
                              className={`inline-block rounded px-2 py-0.5 text-xs font-semibold border ${
                                hop.status === "ok"
                                  ? hop.action.startsWith("nat")
                                    ? "border-border-subtle bg-surface-elevated text-text-secondary"
                                    : "border-status-success-border bg-status-success-bg text-status-success-fg"
                                  : "border-status-error-border bg-status-error-bg text-status-error-fg"
                              }`}
                            >
                              {hop.status === "ok"
                                ? hop.action.startsWith("nat")
                                  ? "NAT"
                                  : "OK"
                                : "DROP"}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedHopIdx(isExpanded ? null : index);
                              }}
                              className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                              title="PDU-Details einsehen"
                              aria-label={`PDU-Details für Hop ${index + 1} ${isExpanded ? "zuklappen" : "aufklappen"}`}
                            >
                              {isExpanded ? <CaretDown size={14} /> : <CaretRight size={14} />}
                            </button>
                          </td>
                        </tr>

                        {/* Aufgeklappte PDU-Details */}
                        {isExpanded && (
                          <tr className="bg-muted/30">
                            <td colSpan={7} className="px-4 py-2.5 text-xs">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border border-border rounded-md p-2.5 bg-background font-mono text-[11px]">
                                <div>
                                  <span className="font-bold text-foreground block mb-1">
                                    Layer 2 (Ethernet-Frame):
                                  </span>
                                  <div className="text-muted-foreground">
                                    Quell-MAC: <span className="text-foreground">{hop.packet.srcMac}</span>
                                  </div>
                                  <div className="text-muted-foreground">
                                    Ziel-MAC: <span className="text-foreground">{hop.packet.dstMac}</span>
                                  </div>
                                </div>
                                <div>
                                  <span className="font-bold text-foreground block mb-1">
                                    Layer 3 (IP-Paket):
                                  </span>
                                  <div className="text-muted-foreground">
                                    Quell-IP: <span className="text-foreground">{hop.packet.srcIp}</span>
                                    {hop.natTranslation?.direction === "inside-to-outside" && (
                                      <span className="text-primary font-bold ml-1">
                                        → {hop.natTranslation.afterIp}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-muted-foreground">
                                    Ziel-IP: <span className="text-foreground">{hop.packet.dstIp}</span>
                                    {hop.natTranslation?.direction === "outside-to-inside" && (
                                      <span className="text-primary font-bold ml-1">
                                        → {hop.natTranslation.afterIp}
                                      </span>
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
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
            <Info size={32} className="mb-2 opacity-50" />
            <p className="text-sm font-semibold">Kein aktiver Ping-Lauf</p>
            <p className="text-xs">
              Wählen Sie Quelle und Ziel aus und klicken Sie auf „Ping senden“, um den
              Hop-by-Hop-Trace zu starten.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};
