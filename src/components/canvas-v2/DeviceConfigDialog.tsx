import React, { useState, useMemo, useEffect } from "react";
import {
  TopologyDevice,
  TopologyInterface,
  TopologySubinterface,
  InterfaceMode,
  ChannelGroupMode,
  DeviceSvi,
  NetworkTopology,
} from "@/types/topology";
import {
  validateHostGateway,
  evaluateEtherChannelModes,
  parseIpCidr,
} from "@/lib/topology/topology-validation";
import { CiscoCliGenerator } from "@/lib/topology/cisco-cli-generator";
import {
  X,
  Gear,
  TerminalWindow,
  Warning,
  CheckCircle,
  Copy,
  Plus,
  Trash,
  Sliders,
  TreeStructure,
} from "@phosphor-icons/react";

interface DeviceConfigDialogProps {
  device: TopologyDevice;
  topology: NetworkTopology;
  theme?: "dark" | "light";
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedDevice: TopologyDevice) => void;
}

type TabType = "general" | "interfaces" | "vlans" | "cli";

export const DeviceConfigDialog: React.FC<DeviceConfigDialogProps> = ({
  device,
  topology,
  theme = "dark",
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState<TabType>("general");

  // Lokaler State für die Formularfelder
  const [hostname, setHostname] = useState<string>(device.config?.hostname || device.name);
  const [domain, setDomain] = useState<string>(device.config?.domain || "");
  const [defaultGateway, setDefaultGateway] = useState<string>(
    device.config?.defaultGateway || ""
  );
  const [dnsServers, setDnsServers] = useState<string>(
    device.config?.dnsServers?.join(", ") || ""
  );
  const [ipRoutingEnabled, setIpRoutingEnabled] = useState<boolean>(
    device.config?.ipRoutingEnabled !== false
  );

  // Interfaces State
  const [interfaces, setInterfaces] = useState<TopologyInterface[]>(
    JSON.parse(JSON.stringify(device.interfaces))
  );

  // VLANs State
  const [vlans, setVlans] = useState<Array<{ id: number; name: string }>>(
    device.config?.vlans || [
      { id: 1, name: "default" },
      { id: 10, name: "SALES" },
      { id: 20, name: "DEV" },
    ]
  );

  // SVIs State (L3 Switch)
  const [svis, setSvis] = useState<DeviceSvi[]>(device.config?.svis || []);

  const [copiedCli, setCopiedCli] = useState<boolean>(false);
  const [activeCliCommand, setActiveCliCommand] = useState<string>("show running-config");

  // Geräte-Klassifizierung
  const isHost = device.type === "pc" || device.type === "laptop" || device.type === "server";
  const isRouter = device.type === "router";
  const isSwitch = device.type === "switch-l2" || device.type === "switch-l3";
  const isL3Switch = device.type === "switch-l3";

  // Live-Validierung Host Gateway
  const gatewayValidation = useMemo(() => {
    if (!isHost) return { valid: true };
    const primaryIp = interfaces[0]?.ip;
    return validateHostGateway(primaryIp, defaultGateway);
  }, [isHost, interfaces, defaultGateway]);

  // Live-Generierung der Cisco Show Outputs
  const previewDevice: TopologyDevice = useMemo(() => {
    return {
      ...device,
      name: hostname,
      interfaces,
      config: {
        ...device.config,
        hostname,
        domain,
        defaultGateway: defaultGateway || undefined,
        dnsServers: dnsServers
          ? dnsServers.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined,
        ipRoutingEnabled: isL3Switch ? ipRoutingEnabled : undefined,
        vlans: isSwitch ? vlans : undefined,
        svis: isL3Switch ? svis : undefined,
      },
    };
  }, [
    device,
    hostname,
    domain,
    defaultGateway,
    dnsServers,
    ipRoutingEnabled,
    vlans,
    svis,
    interfaces,
    isL3Switch,
    isSwitch,
  ]);

  const dynamicCliOutputs = useMemo(() => {
    return CiscoCliGenerator.getDynamicShowOutputs(previewDevice, topology);
  }, [previewDevice, topology]);

  const handleSave = () => {
    onSave(previewDevice);
    onClose();
  };

  const handleCopyCli = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${
          isDark
            ? "bg-slate-900 border-slate-700 text-white"
            : "bg-white border-slate-200 text-slate-900"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="device-dialog-title"
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-4 border-b ${
            isDark ? "border-slate-800 bg-slate-900/60" : "border-slate-100 bg-slate-50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
              <Gear size={22} weight="bold" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                Geräte-Konfiguration · {device.type.toUpperCase()}
              </div>
              <h2 id="device-dialog-title" className="text-base font-bold truncate">
                {hostname}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isDark
                ? "text-slate-400 hover:text-white hover:bg-slate-800"
                : "text-slate-500 hover:text-black hover:bg-slate-100"
            }`}
            title="Schließen"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          className={`flex items-center gap-1 px-5 border-b overflow-x-auto ${
            isDark ? "border-slate-800 bg-slate-950/40" : "border-slate-100 bg-slate-100/50"
          }`}
        >
          <button
            onClick={() => setActiveTab("general")}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "general"
                ? "border-sky-400 text-sky-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sliders size={14} weight="bold" />
            Allgemein & IP
          </button>
          <button
            onClick={() => setActiveTab("interfaces")}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "interfaces"
                ? "border-sky-400 text-sky-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <TreeStructure size={14} weight="bold" />
            Schnittstellen ({interfaces.length})
          </button>
          {isSwitch && (
            <button
              onClick={() => setActiveTab("vlans")}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                activeTab === "vlans"
                  ? "border-sky-400 text-sky-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <TreeStructure size={14} weight="bold" />
              VLANs & SVIs
            </button>
          )}
          <button
            onClick={() => setActiveTab("cli")}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "cli"
                ? "border-sky-400 text-sky-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <TerminalWindow size={14} weight="bold" />
            Cisco IOS CLI
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: ALLGEMEIN & HOSTNAME */}
          {activeTab === "general" && (
            <div className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-300">
                  Gerätename (Hostname):
                </label>
                <input
                  type="text"
                  value={hostname}
                  onChange={(e) => setHostname(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border text-sm font-mono ${
                    isDark
                      ? "bg-slate-800 border-slate-700 text-white focus:border-sky-400"
                      : "bg-white border-slate-300 text-slate-900 focus:border-sky-500"
                  }`}
                  placeholder="z. B. R1, SW1, PC-Host"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-300">
                  Domain Name (DNS-Suffix):
                </label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border text-sm font-mono ${
                    isDark
                      ? "bg-slate-800 border-slate-700 text-white focus:border-sky-400"
                      : "bg-white border-slate-300 text-slate-900 focus:border-sky-500"
                  }`}
                  placeholder="z. B. ccna.lab.local"
                />
              </div>

              {/* Gateway für Hosts & Switche */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-300">
                  Default Gateway:
                </label>
                <input
                  type="text"
                  value={defaultGateway}
                  onChange={(e) => setDefaultGateway(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border text-sm font-mono ${
                    isDark
                      ? "bg-slate-800 border-slate-700 text-white focus:border-sky-400"
                      : "bg-white border-slate-300 text-slate-900 focus:border-sky-500"
                  }`}
                  placeholder="z. B. 192.168.1.1"
                />

                {/* Nicht-blockierende Warnung bei Subnetz-Mismatch */}
                {!gatewayValidation.valid && gatewayValidation.issue && (
                  <div className="mt-2 p-3 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
                    <Warning size={18} className="shrink-0 text-amber-400 mt-0.5" />
                    <div>
                      <div className="font-bold text-amber-300">
                        {gatewayValidation.issue.title}
                      </div>
                      <div className="text-[11px] mt-0.5 leading-relaxed">
                        {gatewayValidation.issue.message}
                      </div>
                      <div className="text-[10px] text-amber-200/80 mt-1 italic">
                        {gatewayValidation.issue.didacticExplanation}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {isHost && (
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-300">
                    DNS Server:
                  </label>
                  <input
                    type="text"
                    value={dnsServers}
                    onChange={(e) => setDnsServers(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border text-sm font-mono ${
                      isDark
                        ? "bg-slate-800 border-slate-700 text-white focus:border-sky-400"
                        : "bg-white border-slate-300 text-slate-900 focus:border-sky-500"
                    }`}
                    placeholder="z. B. 8.8.8.8, 1.1.1.1"
                  />
                </div>
              )}

              {/* L3 Switch IP Routing Toggle */}
              {isL3Switch && (
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    isDark ? "bg-slate-800/60 border-slate-700" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs text-sky-400">
                      Cisco IP Routing (Layer-3 Forwarding)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Befehl: <code>ip routing</code> (ermöglicht Routing zwischen SVIs).
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={ipRoutingEnabled}
                    onChange={(e) => setIpRoutingEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SCHNITTSTELLEN */}
          {activeTab === "interfaces" && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                Konfigurieren Sie IP-Adressen, Switchport-Modi, 802.1Q Trunks und EtherChannels:
              </div>

              <div className="space-y-3">
                {interfaces.map((iface, idx) => (
                  <div
                    key={iface.id}
                    className={`p-3 rounded-xl border space-y-3 ${
                      isDark ? "bg-slate-800/60 border-slate-700" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-sky-400">
                          {iface.name}
                        </span>
                        <select
                          value={iface.status}
                          onChange={(e) => {
                            const val = e.target.value as "up" | "down" | "admin-down";
                            const updated = [...interfaces];
                            updated[idx].status = val;
                            updated[idx].isShutdown = val === "admin-down";
                            setInterfaces(updated);
                          }}
                          className={`text-xs px-2 py-0.5 rounded border font-semibold ${
                            iface.status === "up"
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : "bg-red-500/20 text-red-300 border-red-500/40"
                          }`}
                        >
                          <option value="up">up (no shutdown)</option>
                          <option value="admin-down">shutdown</option>
                          <option value="down">down</option>
                        </select>
                      </div>

                      {/* Switchport Modus wenn Switch */}
                      {isSwitch && (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400">Modus:</span>
                          <select
                            value={iface.mode || "access"}
                            onChange={(e) => {
                              const mode = e.target.value as InterfaceMode;
                              const updated = [...interfaces];
                              updated[idx].mode = mode;
                              setInterfaces(updated);
                            }}
                            className={`text-xs px-2 py-1 rounded border font-mono ${
                              isDark
                                ? "bg-slate-900 border-slate-700 text-white"
                                : "bg-white border-slate-300 text-slate-900"
                            }`}
                          >
                            <option value="access">Access</option>
                            <option value="trunk">Trunk (802.1Q)</option>
                            {isL3Switch && <option value="routed">Routed Port</option>}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* IP-Adresse für Router / Hosts / Routed Ports */}
                    {(!isSwitch || iface.mode === "routed" || isHost) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-0.5">
                            IP-Adresse mit CIDR:
                          </label>
                          <input
                            type="text"
                            value={iface.ip || ""}
                            onChange={(e) => {
                              const updated = [...interfaces];
                              updated[idx].ip = e.target.value;
                              setInterfaces(updated);
                            }}
                            className={`w-full px-2.5 py-1.5 rounded border text-xs font-mono ${
                              isDark
                                ? "bg-slate-900 border-slate-700 text-white"
                                : "bg-white border-slate-300 text-slate-900"
                            }`}
                            placeholder="z. B. 192.168.1.1/24"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-0.5">
                            Beschreibung:
                          </label>
                          <input
                            type="text"
                            value={iface.description || ""}
                            onChange={(e) => {
                              const updated = [...interfaces];
                              updated[idx].description = e.target.value;
                              setInterfaces(updated);
                            }}
                            className={`w-full px-2.5 py-1.5 rounded border text-xs ${
                              isDark
                                ? "bg-slate-900 border-slate-700 text-white"
                                : "bg-white border-slate-300 text-slate-900"
                            }`}
                            placeholder="z. B. Uplink to SW2"
                          />
                        </div>
                      </div>
                    )}

                    {/* Access VLAN Konfiguration */}
                    {isSwitch && iface.mode !== "trunk" && iface.mode !== "routed" && (
                      <div className="flex items-center gap-3">
                        <label className="text-[11px] text-slate-400">Access VLAN:</label>
                        <select
                          value={iface.vlan || 1}
                          onChange={(e) => {
                            const updated = [...interfaces];
                            updated[idx].vlan = parseInt(e.target.value, 10);
                            setInterfaces(updated);
                          }}
                          className={`text-xs px-2.5 py-1 rounded border font-mono ${
                            isDark
                              ? "bg-slate-900 border-slate-700 text-white"
                              : "bg-white border-slate-300 text-slate-900"
                          }`}
                        >
                          {vlans.map((v) => (
                            <option key={v.id} value={v.id}>
                              VLAN {v.id} ({v.name})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Trunk Konfiguration: Native & Allowed VLANs */}
                    {isSwitch && iface.mode === "trunk" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-700/40">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-0.5">
                            Native VLAN (Default 1):
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="4094"
                            value={iface.nativeVlan ?? 1}
                            onChange={(e) => {
                              const updated = [...interfaces];
                              updated[idx].nativeVlan = parseInt(e.target.value, 10) || 1;
                              setInterfaces(updated);
                            }}
                            className={`w-full px-2.5 py-1 rounded border text-xs font-mono ${
                              isDark
                                ? "bg-slate-900 border-slate-700 text-white"
                                : "bg-white border-slate-300 text-slate-900"
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-0.5">
                            Allowed VLANs (z. B. 10,20):
                          </label>
                          <input
                            type="text"
                            value={iface.allowedVlans?.join(",") || "1-4094"}
                            onChange={(e) => {
                              const updated = [...interfaces];
                              const parts = e.target.value
                                .split(",")
                                .map((s) => parseInt(s.trim(), 10))
                                .filter((n) => !isNaN(n));
                              updated[idx].allowedVlans = parts.length > 0 ? parts : undefined;
                              setInterfaces(updated);
                            }}
                            className={`w-full px-2.5 py-1 rounded border text-xs font-mono ${
                              isDark
                                ? "bg-slate-900 border-slate-700 text-white"
                                : "bg-white border-slate-300 text-slate-900"
                            }`}
                            placeholder="10,20"
                          />
                        </div>
                      </div>
                    )}

                    {/* EtherChannel (Channel-Group) Konfiguration für Switche */}
                    {isSwitch && (
                      <div className="pt-2 border-t border-slate-700/40 flex items-center gap-3">
                        <span className="text-[11px] text-slate-400">EtherChannel:</span>
                        <select
                          value={iface.channelGroup ? `${iface.channelGroup.id}-${iface.channelGroup.mode}` : "none"}
                          onChange={(e) => {
                            const val = e.target.value;
                            const updated = [...interfaces];
                            if (val === "none") {
                              delete updated[idx].channelGroup;
                            } else {
                              const [idStr, modeStr] = val.split("-");
                              updated[idx].channelGroup = {
                                id: parseInt(idStr, 10),
                                mode: modeStr as ChannelGroupMode,
                              };
                            }
                            setInterfaces(updated);
                          }}
                          className={`text-xs px-2.5 py-1 rounded border font-mono ${
                            isDark
                              ? "bg-slate-900 border-slate-700 text-white"
                              : "bg-white border-slate-300 text-slate-900"
                          }`}
                        >
                          <option value="none">Kein Channel-Group</option>
                          <option value="1-active">Channel 1: mode active (LACP)</option>
                          <option value="1-passive">Channel 1: mode passive (LACP)</option>
                          <option value="1-desirable">Channel 1: mode desirable (PAgP)</option>
                          <option value="1-auto">Channel 1: mode auto (PAgP)</option>
                          <option value="1-on">Channel 1: mode on (Statisch)</option>
                        </select>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: VLANS & SVIS */}
          {activeTab === "vlans" && isSwitch && (
            <div className="space-y-5">
              {/* VLAN Liste */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400">
                    VLAN Datenbank (show vlan brief)
                  </h3>
                  <button
                    onClick={() => {
                      const nextId = Math.max(...vlans.map((v) => v.id), 1) + 10;
                      setVlans([...vlans, { id: nextId, name: `VLAN_${nextId}` }]);
                    }}
                    className="flex items-center gap-1 text-[11px] font-bold text-sky-400 hover:text-sky-300 px-2 py-0.5 rounded bg-sky-500/15"
                  >
                    <Plus size={12} weight="bold" /> VLAN hinzufügen
                  </button>
                </div>

                <div className="space-y-1.5">
                  {vlans.map((v, vIdx) => (
                    <div
                      key={v.id}
                      className={`flex items-center gap-3 p-2 rounded-lg border text-xs font-mono ${
                        isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <span className="w-16 font-bold text-sky-400">VLAN {v.id}</span>
                      <input
                        type="text"
                        value={v.name}
                        onChange={(e) => {
                          const updated = [...vlans];
                          updated[vIdx].name = e.target.value;
                          setVlans(updated);
                        }}
                        className={`flex-1 px-2 py-0.5 rounded border text-xs ${
                          isDark
                            ? "bg-slate-900 border-slate-700 text-white"
                            : "bg-white border-slate-300 text-slate-900"
                        }`}
                      />
                      {v.id !== 1 && (
                        <button
                          onClick={() => setVlans(vlans.filter((item) => item.id !== v.id))}
                          className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                          title="VLAN löschen"
                        >
                          <Trash size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* L3 Switch SVIs (Switched Virtual Interfaces) */}
              {isL3Switch && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                      SVI Default Gateways (interface VlanX)
                    </h3>
                    <button
                      onClick={() => {
                        setSvis([...svis, { vlan: 10, ip: "192.168.10.1/24" }]);
                      }}
                      className="flex items-center gap-1 text-[11px] font-bold text-purple-400 hover:text-purple-300 px-2 py-0.5 rounded bg-purple-500/15"
                    >
                      <Plus size={12} weight="bold" /> SVI hinzufügen
                    </button>
                  </div>

                  <div className="space-y-2">
                    {svis.map((svi, sIdx) => (
                      <div
                        key={sIdx}
                        className={`p-2.5 rounded-lg border text-xs font-mono flex items-center gap-3 ${
                          isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <span className="font-bold text-purple-400">Vlan{svi.vlan}</span>
                        <input
                          type="text"
                          value={svi.ip}
                          onChange={(e) => {
                            const updated = [...svis];
                            updated[sIdx].ip = e.target.value;
                            setSvis(updated);
                          }}
                          className={`flex-1 px-2 py-0.5 rounded border text-xs ${
                            isDark
                              ? "bg-slate-900 border-slate-700 text-white"
                              : "bg-white border-slate-300 text-slate-900"
                          }`}
                          placeholder="192.168.10.1/24"
                        />
                        <button
                          onClick={() => setSvis(svis.filter((_, idx) => idx !== sIdx))}
                          className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                          title="SVI löschen"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CISCO IOS CLI VORSCHAU */}
          {activeTab === "cli" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 overflow-x-auto">
                  {Object.keys(dynamicCliOutputs).map((cmd) => (
                    <button
                      key={cmd}
                      onClick={() => setActiveCliCommand(cmd)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors shrink-0 ${
                        activeCliCommand === cmd
                          ? "bg-sky-500 text-white font-bold"
                          : isDark
                            ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {cmd}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handleCopyCli(dynamicCliOutputs[activeCliCommand] || "")}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-white transition-colors shrink-0"
                >
                  {copiedCli ? (
                    <>
                      <CheckCircle size={14} className="text-emerald-400" /> Kopiert
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> Kopieren
                    </>
                  )}
                </button>
              </div>

              {/* Terminal Fenster */}
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#0B0F19] p-4 text-emerald-400 font-mono text-[11.5px] leading-relaxed shadow-inner max-h-[380px] overflow-y-auto whitespace-pre selection:bg-emerald-800 selection:text-white">
                <div className="text-slate-500 select-none pb-2 mb-2 border-b border-slate-800">
                  {hostname}# {activeCliCommand}
                </div>
                {dynamicCliOutputs[activeCliCommand] || "% Command output nicht verfügbar"}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`flex items-center justify-end gap-2 px-5 py-3 border-t ${
            isDark ? "border-slate-800 bg-slate-900/60" : "border-slate-100 bg-slate-50"
          }`}
        >
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              isDark
                ? "bg-slate-800 hover:bg-slate-700 text-slate-300"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-white transition-colors shadow-sm"
          >
            Übernehmen & Speichern
          </button>
        </div>
      </div>
    </div>
  );
};
