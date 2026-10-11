import React from "react";
import { NetworkTopology, TopologyDevice } from "@/types/topology";
import { validateTopology } from "@/lib/topology/topology-validation";
import { X, Table, ShieldCheck, Warning } from "@phosphor-icons/react";

interface TopologyScreenReaderViewProps {
  topology: NetworkTopology;
  theme?: "dark" | "light";
  isOpen?: boolean;
  onClose?: () => void;
  isSrOnly?: boolean;
}

export const TopologyScreenReaderView: React.FC<TopologyScreenReaderViewProps> = ({
  topology,
  theme = "dark",
  isOpen = true,
  onClose,
  isSrOnly = false,
}) => {
  const isDark = theme === "dark";
  const diagnostics = validateTopology(topology);

  const deviceMap = new Map<string, TopologyDevice>();
  for (const d of topology.devices) {
    deviceMap.set(d.id, d);
  }

  const content = (
    <div
      role="region"
      aria-label="Semantische Textalternative der Netzwerktopologie"
      className={
        isSrOnly
          ? "sr-only"
          : `max-w-4xl mx-auto p-4 sm:p-6 rounded-2xl border space-y-6 ${
              isDark
                ? "bg-slate-900 border-slate-800 text-slate-100"
                : "bg-white border-slate-200 text-slate-800"
            }`
      }
    >
      <div className="flex items-center justify-between border-b pb-3 border-slate-700/50">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2">
            <Table size={20} className="text-sky-400" />
            <span>Topologie-Übersicht: {topology.name}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Vollständige semantische Tabelle für Screenreader und Tastaturnutzer (WCAG 2.1 AA)
          </p>
        </div>
        {!isSrOnly && onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            aria-label="Textansicht schließen"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* 1. Geräte-Tabelle */}
      <section aria-labelledby="sr-devices-heading">
        <h3 id="sr-devices-heading" className="text-sm font-semibold text-sky-400 mb-2">
          1. Netzwerkgeräte ({topology.devices.length})
        </h3>
        <div
          tabIndex={0}
          role="region"
          aria-label="Tabelle der Netzwerkgeräte"
          className="overflow-x-auto outline-none focus:ring-1 focus:ring-sky-500"
        >
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className={isDark ? "bg-slate-800/70 text-slate-300" : "bg-slate-100 text-slate-700"}>
                <th scope="col" className="p-2 border border-slate-700/60 font-semibold">Gerät</th>
                <th scope="col" className="p-2 border border-slate-700/60 font-semibold">Typ</th>
                <th scope="col" className="p-2 border border-slate-700/60 font-semibold">Status</th>
                <th scope="col" className="p-2 border border-slate-700/60 font-semibold">Schnittstellen & IP</th>
                <th scope="col" className="p-2 border border-slate-700/60 font-semibold">Gateway / Konfiguration</th>
              </tr>
            </thead>
            <tbody>
              {topology.devices.map((device) => {
                const ipList = device.interfaces.filter((i) => i.ip);
                return (
                  <tr
                    key={device.id}
                    className={`border-b ${
                      isDark ? "border-slate-800 hover:bg-slate-800/30" : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <th scope="row" className="p-2 font-mono font-bold text-sky-300">
                      {device.name}
                    </th>
                    <td className="p-2 capitalize">{device.type}</td>
                    <td className="p-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                          device.status === "error"
                            ? "bg-red-500/20 text-red-300"
                            : device.status === "warning"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-emerald-500/20 text-emerald-300"
                        }`}
                      >
                        {device.status || "aktiv"}
                      </span>
                    </td>
                    <td className="p-2 font-mono">
                      {ipList.length > 0 ? (
                        <ul className="list-disc list-inside space-y-0.5">
                          {ipList.map((i) => (
                            <li key={i.id}>
                              {i.name}: {i.ip} ({i.status})
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-slate-500 italic">Keine IP konfiguriert</span>
                      )}
                    </td>
                    <td className="p-2 font-mono text-[11px]">
                      {device.config?.defaultGateway && (
                        <div>GW: {device.config.defaultGateway}</div>
                      )}
                      {device.config?.domain && (
                        <div className="text-slate-400">Domain: {device.config.domain}</div>
                      )}
                      {device.config?.vlans && (
                        <div className="text-slate-400">
                          VLANs: {device.config.vlans.map((v) => v.id).join(", ")}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. Verbindungen-Tabelle */}
      <section aria-labelledby="sr-links-heading">
        <h3 id="sr-links-heading" className="text-sm font-semibold text-sky-400 mb-2">
          2. Netzwerk-Verbindungen ({topology.links.length})
        </h3>
        <div
          tabIndex={0}
          role="region"
          aria-label="Tabelle der Netzwerk-Verbindungen"
          className="overflow-x-auto outline-none focus:ring-1 focus:ring-sky-500"
        >
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className={isDark ? "bg-slate-800/70 text-slate-300" : "bg-slate-100 text-slate-700"}>
                <th scope="col" className="p-2 border border-slate-700/60 font-semibold">Endpunkt A</th>
                <th scope="col" className="p-2 border border-slate-700/60 font-semibold">Endpunkt B</th>
                <th scope="col" className="p-2 border border-slate-700/60 font-semibold">Link-Typ</th>
                <th scope="col" className="p-2 border border-slate-700/60 font-semibold">Status</th>
                <th scope="col" className="p-2 border border-slate-700/60 font-semibold">Beschriftung</th>
              </tr>
            </thead>
            <tbody>
              {topology.links.map((link) => {
                const srcDev = deviceMap.get(link.sourceDeviceId);
                const tgtDev = deviceMap.get(link.targetDeviceId);
                const srcIface = srcDev?.interfaces.find((i) => i.id === link.sourceInterfaceId);
                const tgtIface = tgtDev?.interfaces.find((i) => i.id === link.targetInterfaceId);

                return (
                  <tr
                    key={link.id}
                    className={`border-b ${
                      isDark ? "border-slate-800 hover:bg-slate-800/30" : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <td className="p-2 font-mono">
                      {srcDev?.name || link.sourceDeviceId} ({srcIface?.name || link.sourceInterfaceId})
                    </td>
                    <td className="p-2 font-mono">
                      {tgtDev?.name || link.targetDeviceId} ({tgtIface?.name || link.targetInterfaceId})
                    </td>
                    <td className="p-2 uppercase font-mono font-semibold text-sky-300">
                      {link.linkType}
                    </td>
                    <td className="p-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                          link.status === "down"
                            ? "bg-red-500/20 text-red-300"
                            : link.status === "stp-blocking"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-emerald-500/20 text-emerald-300"
                        }`}
                      >
                        {link.status}
                      </span>
                    </td>
                    <td className="p-2 font-mono text-slate-400">
                      {link.label || "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. CCNA Validierungshinweise & Diagnosen */}
      <section aria-labelledby="sr-diag-heading">
        <h3 id="sr-diag-heading" className="text-sm font-semibold text-sky-400 mb-2 flex items-center gap-1.5">
          <ShieldCheck size={16} />
          <span>3. Didaktische Validierung & Diagnose ({diagnostics.issues.length})</span>
        </h3>
        {diagnostics.issues.length === 0 ? (
          <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <ShieldCheck size={16} />
            <span>Alle CCNA-Prüfungen bestanden: Keine Fehlkonfigurationen erkannt.</span>
          </div>
        ) : (
          <ul className="space-y-2">
            {diagnostics.issues.map((issue) => (
              <li
                key={issue.id}
                className="p-3 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs space-y-1"
              >
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <Warning size={16} className="text-amber-400 shrink-0" />
                  <span>{issue.title}</span>
                </div>
                <div className="leading-relaxed">{issue.message}</div>
                <div className="text-[11px] text-amber-200/80 italic mt-0.5">
                  {issue.didacticExplanation}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );

  if (isSrOnly) {
    return content;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {content}
      </div>
    </div>
  );
};
