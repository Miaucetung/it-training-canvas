import React, { useState, useMemo } from "react";
import { LinkType, TopologyDevice, TopologyLink } from "@/types/topology";
import {
  getDeviceInterfaceOptions,
  validateLinkConnection,
  createNewLink,
} from "@/lib/topology/topology-operations";
import { X, PlugsConnected, Warning, Check } from "@phosphor-icons/react";

interface ConnectDialogProps {
  sourceDevice: TopologyDevice;
  targetDevice: TopologyDevice;
  existingLinks: TopologyLink[];
  theme?: "dark" | "light";
  onConnect: (newLink: TopologyLink) => void;
  onClose: () => void;
}

export const ConnectDialog: React.FC<ConnectDialogProps> = ({
  sourceDevice,
  targetDevice,
  existingLinks,
  theme = "dark",
  onConnect,
  onClose,
}) => {
  const isDark = theme === "dark";

  const sourceOptions = useMemo(
    () => getDeviceInterfaceOptions(sourceDevice, existingLinks),
    [sourceDevice, existingLinks]
  );
  const targetOptions = useMemo(
    () => getDeviceInterfaceOptions(targetDevice, existingLinks),
    [targetDevice, existingLinks]
  );

  // Erste freie Interfaces vorauswählen
  const firstFreeSource = sourceOptions.find((o) => !o.isOccupied)?.id || sourceOptions[0]?.id;
  const firstFreeTarget = targetOptions.find((o) => !o.isOccupied)?.id || targetOptions[0]?.id;

  const [selectedSourceIface, setSelectedSourceIface] = useState<string>(firstFreeSource || "");
  const [selectedTargetIface, setSelectedTargetIface] = useState<string>(firstFreeTarget || "");
  const [linkType, setLinkType] = useState<LinkType>(
    sourceDevice.type === "router" && targetDevice.type === "router" ? "serial" : "ethernet"
  );
  const [customLabel, setCustomLabel] = useState<string>("");

  const validation = useMemo(() => {
    return validateLinkConnection(
      sourceDevice,
      targetDevice,
      selectedSourceIface,
      selectedTargetIface,
      linkType,
      existingLinks
    );
  }, [
    sourceDevice,
    targetDevice,
    selectedSourceIface,
    selectedTargetIface,
    linkType,
    existingLinks,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation.valid) return;

    const link = createNewLink(
      sourceDevice.id,
      targetDevice.id,
      selectedSourceIface,
      selectedTargetIface,
      linkType,
      customLabel.trim() || undefined
    );

    onConnect(link);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden ${
          isDark
            ? "bg-slate-900 border-slate-700 text-white"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
              <PlugsConnected size={20} weight="bold" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Geräte verbinden</h3>
              <p className="text-[11px] text-slate-400">
                {sourceDevice.name} ↔ {targetDevice.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Quell-Interface */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              Interface auf <strong className="text-sky-400">{sourceDevice.name}</strong>:
            </label>
            <select
              value={selectedSourceIface}
              onChange={(e) => setSelectedSourceIface(e.target.value)}
              className={`w-full p-2.5 rounded-xl border outline-none font-mono ${
                isDark
                  ? "bg-slate-800 border-slate-700 text-white"
                  : "bg-slate-50 border-slate-300 text-slate-900"
              }`}
            >
              {sourceOptions.map((opt) => (
                <option key={opt.id} value={opt.id} disabled={opt.isOccupied}>
                  {opt.name} {opt.ip ? `(${opt.ip})` : ""} {opt.isOccupied ? "— [Belegt]" : "— [Frei]"}
                </option>
              ))}
            </select>
          </div>

          {/* Ziel-Interface */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              Interface auf <strong className="text-sky-400">{targetDevice.name}</strong>:
            </label>
            <select
              value={selectedTargetIface}
              onChange={(e) => setSelectedTargetIface(e.target.value)}
              className={`w-full p-2.5 rounded-xl border outline-none font-mono ${
                isDark
                  ? "bg-slate-800 border-slate-700 text-white"
                  : "bg-slate-50 border-slate-300 text-slate-900"
              }`}
            >
              {targetOptions.map((opt) => (
                <option key={opt.id} value={opt.id} disabled={opt.isOccupied}>
                  {opt.name} {opt.ip ? `(${opt.ip})` : ""} {opt.isOccupied ? "— [Belegt]" : "— [Frei]"}
                </option>
              ))}
            </select>
          </div>

          {/* Link-Typ */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              Verbindungstyp (CCNA Link-Medium):
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { type: "ethernet", label: "Ethernet (LAN)" },
                  { type: "serial", label: "Serial WAN (Router)" },
                  { type: "trunk", label: "802.1Q Trunk" },
                  { type: "wireless", label: "Wireless WLAN" },
                ] as const
              ).map((m) => (
                <button
                  type="button"
                  key={m.type}
                  onClick={() => setLinkType(m.type)}
                  className={`p-2 rounded-xl border text-left font-medium transition-all ${
                    linkType === m.type
                      ? "bg-sky-500/20 border-sky-500 text-sky-300 shadow-xs"
                      : isDark
                        ? "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white"
                        : "bg-slate-100 border-slate-200 text-slate-600 hover:text-black"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Optionales Label */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Optionale Link-Beschriftung (z.B. Subnetz / Bandbreite):
            </label>
            <input
              type="text"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="z.B. 10.0.12.0/30 oder T1 (1.544M)"
              className={`w-full p-2 rounded-xl border outline-none font-mono text-xs ${
                isDark
                  ? "bg-slate-800 border-slate-700 text-white"
                  : "bg-slate-50 border-slate-300 text-slate-900"
              }`}
            />
          </div>

          {/* Validierungsfehler oder OK */}
          {!validation.valid && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 flex items-start gap-2">
              <Warning size={16} className="shrink-0 mt-0.5 text-red-400" />
              <span>{validation.error}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-700/50">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                isDark
                  ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={!validation.valid}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                validation.valid
                  ? "bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/25"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              <Check size={15} weight="bold" />
              <span>Verbinden</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
