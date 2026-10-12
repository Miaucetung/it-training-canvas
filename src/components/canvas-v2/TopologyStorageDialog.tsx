import React, { useState, useEffect } from "react";
import { NetworkTopology } from "@/types/topology";
import {
  getNamedTopologies,
  saveNamedTopology,
  loadNamedTopology,
  deleteNamedTopology,
  importTopologyFromJson,
  exportTopologyAsSvg,
  exportTopologyAsPng,
  StoredTopologySummary,
} from "@/lib/topology/storage-manager";
import { validateTopology } from "@/lib/topology/topology-validation";
import { BUILT_IN_CCNA_TOPOLOGIES } from "@/lib/topology/sample-topologies";
import { ModalPortal } from "@/components/ui/modal-portal";
import {
  X,
  FloppyDisk,
  DownloadSimple,
  UploadSimple,
  Trash,
  CheckCircle,
  Warning,
  FileCode,
  FileSvg,
  Image,
  FolderOpen,
  Stack,
} from "@phosphor-icons/react";
import { useFocusTrap } from "@/hooks/useFocusTrap";

interface TopologyStorageDialogProps {
  currentTopology: NetworkTopology;
  theme?: "dark" | "light";
  isOpen: boolean;
  onClose: () => void;
  onLoadTopology: (topology: NetworkTopology) => void;
  svgElementRef?: React.RefObject<SVGSVGElement | null>;
  initialTab?: StorageTab;
}

export type StorageTab = "templates" | "saved" | "export" | "import" | "diagnostics";

export const TopologyStorageDialog: React.FC<TopologyStorageDialogProps> = ({
  currentTopology,
  theme = "dark",
  isOpen,
  onClose,
  onLoadTopology,
  svgElementRef,
  initialTab = "templates",
}) => {
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState<StorageTab>(initialTab);

  // Liste der gespeicherten Topologien
  const [savedList, setSavedList] = useState<StoredTopologySummary[]>([]);
  const [saveAsName, setSaveAsName] = useState<string>(currentTopology.name);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Import State
  const [importText, setImportText] = useState<string>("");
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<boolean>(false);

  // Export State
  const [exportRetina, setExportRetina] = useState<boolean>(true);
  const [exportLegend, setExportLegend] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Diagnose State
  const diagnostics = validateTopology(currentTopology);

  const refreshList = () => {
    setSavedList(getNamedTopologies());
  };

  useEffect(() => {
    if (isOpen) {
      refreshList();
      if (initialTab) {
        setActiveTab(initialTab);
      }
    }
  }, [isOpen, initialTab]);

  // WCAG AA Focus-Trap & Return-Focus Management
  const dialogRef = useFocusTrap<HTMLDivElement>(isOpen, onClose);

  if (!isOpen) return null;

  const handleSaveCurrent = () => {
    const toSave: NetworkTopology = {
      ...currentTopology,
      name: saveAsName.trim() || currentTopology.name,
    };
    const res = saveNamedTopology(toSave);
    if (res.success) {
      setSaveFeedback("Erfolgreich im Browser gespeichert!");
      refreshList();
      setTimeout(() => setSaveFeedback(null), 3000);
    } else {
      setSaveFeedback(`Fehler: ${res.error}`);
    }
  };

  const handleLoad = (id: string) => {
    const loaded = loadNamedTopology(id);
    if (loaded) {
      onLoadTopology(loaded);
      onClose();
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Möchten Sie diese gespeicherte Topologie wirklich löschen?")) {
      deleteNamedTopology(id);
      refreshList();
    }
  };

  const handleImportJson = () => {
    setImportError(null);
    setImportSuccess(false);

    if (!importText.trim()) {
      setImportError("Bitte fügen Sie den JSON-Code der Topologie ein.");
      return;
    }

    const res = importTopologyFromJson(importText);
    if (res.success && res.data) {
      setImportSuccess(true);
      onLoadTopology(res.data);
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setImportError(res.error || "Ungültiges Dateiformat.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportText(content);
    };
    reader.readAsText(file);
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(currentTopology, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentTopology.name.toLowerCase().replace(/[^a-z0-9_-]/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportSvg = () => {
    if (!svgElementRef?.current) return;
    exportTopologyAsSvg(
      svgElementRef.current,
      `${currentTopology.name.toLowerCase().replace(/[^a-z0-9_-]/g, "_")}.svg`,
      theme
    );
  };

  const handleExportPng = async () => {
    if (!svgElementRef?.current) return;
    setIsExporting(true);
    try {
      await exportTopologyAsPng(svgElementRef.current, {
        scale: exportRetina ? 2 : 1,
        theme,
        includeLegend: exportLegend,
        filename: `${currentTopology.name.toLowerCase().replace(/[^a-z0-9_-]/g, "_")}.png`,
      });
    } catch (err) {
      alert(`Export fehlgeschlagen: ${(err as Error).message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-dialog flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
        <div
          ref={dialogRef}
          tabIndex={-1}
          className={`w-full max-w-3xl max-h-[calc(100dvh-1.5rem)] md:max-h-[90dvh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden focus:outline-none ${
            isDark
              ? "bg-slate-900 border-slate-700 text-white"
              : "bg-white border-slate-200 text-slate-900"
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="storage-dialog-title"
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between px-4 sm:px-6 py-3.5 border-b shrink-0 ${
              isDark ? "border-slate-800 bg-slate-900/60" : "border-slate-100 bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 shrink-0">
                <FloppyDisk size={22} weight="bold" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                  Canvas v2 · Topologie-Bibliothek
                </div>
                <h2 id="storage-dialog-title" className="text-sm sm:text-base font-bold truncate">
                  {currentTopology.name}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-colors ${
                isDark
                  ? "text-slate-400 hover:text-white hover:bg-slate-800"
                  : "text-slate-500 hover:text-black hover:bg-slate-100"
              }`}
              aria-label="Dialog schließen"
              title="Schließen (Esc)"
            >
              <X size={18} weight="bold" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div
            className={`flex items-center gap-1 px-4 sm:px-6 border-b overflow-x-auto shrink-0 ${
              isDark ? "border-slate-800 bg-slate-950/40" : "border-slate-100 bg-slate-100/50"
            }`}
          >
            <button
              onClick={() => setActiveTab("templates")}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-all shrink-0 ${
                activeTab === "templates"
                  ? "border-sky-400 text-sky-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Stack size={14} weight="bold" />
              CCNA Vorlagen ({BUILT_IN_CCNA_TOPOLOGIES.length})
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-all shrink-0 ${
                activeTab === "saved"
                  ? "border-sky-400 text-sky-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <FolderOpen size={14} weight="bold" />
              Gespeichert ({savedList.length})
            </button>
            <button
              onClick={() => setActiveTab("export")}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-all shrink-0 ${
                activeTab === "export"
                  ? "border-sky-400 text-sky-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <DownloadSimple size={14} weight="bold" />
              Export (JSON / SVG / PNG)
            </button>
            <button
              onClick={() => setActiveTab("import")}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-all shrink-0 ${
                activeTab === "import"
                  ? "border-sky-400 text-sky-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <UploadSimple size={14} weight="bold" />
              JSON Import
            </button>
            <button
              onClick={() => setActiveTab("diagnostics")}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-all shrink-0 ${
                activeTab === "diagnostics"
                  ? "border-sky-400 text-sky-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Warning size={14} weight="bold" />
              Diagnose ({diagnostics.warningsCount})
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* TAB 0: CCNA REFERENZ-VORLAGEN */}
            {activeTab === "templates" && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">
                  Geprüfte CCNA 200-301 Referenz-Topologien (v2):
                </div>
                {BUILT_IN_CCNA_TOPOLOGIES.map((tpl) => (
                  <div
                    key={tpl.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isDark
                        ? "bg-slate-800/80 border-slate-700 hover:border-slate-600"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-sky-400">{tpl.name}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 font-semibold uppercase">
                            {tpl.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {tpl.description}
                        </p>
                        <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-3 flex-wrap">
                          <span>{tpl.devices.length} Geräte</span>
                          <span>•</span>
                          <span>{tpl.links.length} Verbindungen</span>
                          {tpl.subnetZones && tpl.subnetZones.length > 0 && (
                            <>
                              <span>•</span>
                              <span>{tpl.subnetZones.length} Subnetzzonen</span>
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          onLoadTopology(tpl);
                          onClose();
                        }}
                        className="px-3.5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shrink-0 transition-colors shadow-xs flex items-center justify-center gap-1.5 min-h-[38px]"
                      >
                        <Stack size={14} weight="bold" />
                        <span>Topologie laden</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 1: GESPEICHERTE TOPOLOGIEN */}
            {activeTab === "saved" && (
            <div className="space-y-4">
              {/* Aktuelle Topologie speichern */}
              <div
                className={`p-3.5 rounded-xl border space-y-2.5 ${
                  isDark ? "bg-slate-800/60 border-slate-700" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                  Aktuelle Topologie speichern
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={saveAsName}
                    onChange={(e) => setSaveAsName(e.target.value)}
                    className={`flex-1 px-3 py-1.5 rounded-lg border text-xs font-medium ${
                      isDark
                        ? "bg-slate-900 border-slate-700 text-white"
                        : "bg-white border-slate-300 text-slate-900"
                    }`}
                    placeholder="Name der Topologie..."
                  />
                  <button
                    onClick={handleSaveCurrent}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs transition-colors shrink-0"
                  >
                    <FloppyDisk size={14} weight="bold" /> Speichern
                  </button>
                </div>
                {saveFeedback && (
                  <div
                    className={`text-[11px] font-semibold ${
                      saveFeedback.includes("Fehler") ? "text-red-400" : "text-emerald-400"
                    }`}
                  >
                    {saveFeedback}
                  </div>
                )}
              </div>

              {/* Liste gespeicherter Topologien */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Im Browser gespeicherte Topologien:
                </h3>
                {savedList.length === 0 ? (
                  <div className="text-xs text-slate-500 italic p-4 text-center">
                    Noch keine benutzerdefinierten Topologien gespeichert.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {savedList.map((t) => (
                      <div
                        key={t.id}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                          isDark
                            ? "bg-slate-800/80 border-slate-700 hover:border-slate-600"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs">{t.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {t.deviceCount} Geräte · {t.linkCount} Links · Zuletzt bearbeitet:{" "}
                            {new Date(t.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleLoad(t.id)}
                            className="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-bold text-xs transition-colors"
                          >
                            Laden
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                            title="Löschen"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: EXPORT */}
          {activeTab === "export" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* JSON Export */}
                <div
                  className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                    isDark ? "bg-slate-800/60 border-slate-700" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 w-fit">
                      <FileCode size={20} weight="bold" />
                    </div>
                    <div className="font-bold text-xs">JSON Schema 2.0</div>
                    <div className="text-[11px] text-slate-400 leading-tight">
                      Vollständige Topologie mit Geräten, Interfaces, Subnetzen & Annotationen.
                    </div>
                  </div>
                  <button
                    onClick={handleExportJson}
                    className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                  >
                    JSON Download
                  </button>
                </div>

                {/* SVG Export */}
                <div
                  className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                    isDark ? "bg-slate-800/60 border-slate-700" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 w-fit">
                      <FileSvg size={20} weight="bold" />
                    </div>
                    <div className="font-bold text-xs">Vektor-Grafik (SVG)</div>
                    <div className="text-[11px] text-slate-400 leading-tight">
                      Verlustfrei skalierbare Vektordatei mit eingebetteten Styles und XML.
                    </div>
                  </div>
                  <button
                    onClick={handleExportSvg}
                    className="w-full py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors"
                  >
                    SVG Download
                  </button>
                </div>

                {/* PNG Export */}
                <div
                  className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                    isDark ? "bg-slate-800/60 border-slate-700" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 w-fit">
                      <Image size={20} weight="bold" />
                    </div>
                    <div className="font-bold text-xs">Rasterbild (PNG)</div>
                    <div className="text-[11px] text-slate-400 leading-tight">
                      Hochauflösender Bild-Export mit Theme-Hintergrund und Legende.
                    </div>
                  </div>
                  <button
                    onClick={handleExportPng}
                    disabled={isExporting}
                    className="w-full py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors disabled:opacity-50"
                  >
                    {isExporting ? "Exportiere..." : "PNG Download"}
                  </button>
                </div>
              </div>

              {/* PNG Optionen */}
              <div
                className={`p-3 rounded-xl border space-y-2 text-xs ${
                  isDark ? "bg-slate-800/40 border-slate-700/60" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="font-bold text-slate-300">Optionen für Bild-Export (PNG):</div>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportRetina}
                      onChange={(e) => setExportRetina(e.target.checked)}
                      className="rounded text-sky-500"
                    />
                    <span>2x Retina Auflösung (Super Sharp)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportLegend}
                      onChange={(e) => setExportLegend(e.target.checked)}
                      className="rounded text-sky-500"
                    />
                    <span>Cisco CCNA Legende einbinden</span>
                  </label>
                </div>
                <div className="text-[10px] text-slate-400 italic">
                  Hinweis: Enthält automatischen Safari-Schutz (&lt;4096px), um Canvas-Abstürze auf iOS/macOS zu verhindern.
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: IMPORT */}
          {activeTab === "import" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-semibold">
                  JSON Datei auswählen oder Code einfügen:
                </span>
                <label className="px-2.5 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold cursor-pointer transition-colors">
                  Datei wählen (.json)
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                rows={8}
                className={`w-full p-3 rounded-xl border text-xs font-mono leading-relaxed ${
                  isDark
                    ? "bg-[#0B0F19] border-slate-700 text-slate-200 focus:border-sky-400"
                    : "bg-slate-50 border-slate-300 text-slate-900 focus:border-sky-500"
                }`}
                placeholder='Fügen Sie hier den JSON-Code einer Topologie ein (z. B. { "id": "...", "version": "2.0", "devices": [...] })'
              />

              {importError && (
                <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <Warning size={16} className="shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {importSuccess && (
                <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle size={16} className="shrink-0" />
                  <span>Topologie erfolgreich validiert und geladen!</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">
                  Größenlimit: Max. 2 Megabyte · Zod Schema 2.0 validiert
                </span>
                <button
                  onClick={handleImportJson}
                  className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs transition-colors"
                >
                  Importieren & Laden
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: DIAGNOSE */}
          {activeTab === "diagnostics" && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 leading-relaxed">
                Automatische CCNA-Konfigurationsanalyse der aktuellen Topologie:
              </div>

              {diagnostics.issues.length === 0 ? (
                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs flex items-center gap-3">
                  <CheckCircle size={22} className="shrink-0 text-emerald-400" />
                  <div>
                    <div className="font-bold">Keine Konfigurationskonflikte gefunden</div>
                    <div className="text-[11px] text-emerald-300/80 mt-0.5">
                      Alle Host-Gateways liegen im Subnetz, Trunk-Native-VLANs stimmen überein und EtherChannel-Modi sind kompatibel.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {diagnostics.issues.map((issue) => (
                    <div
                      key={issue.id}
                      className="p-3 rounded-xl border border-amber-500/40 bg-amber-500/15 text-amber-200 text-xs space-y-1"
                    >
                      <div className="flex items-center gap-2 font-bold text-amber-300">
                        <Warning size={16} className="text-amber-400" />
                        <span>{issue.title}</span>
                      </div>
                      <div className="text-[11px] leading-relaxed text-amber-100">
                        {issue.message}
                      </div>
                      <div className="text-[10px] text-amber-200/80 italic pt-0.5">
                        {issue.didacticExplanation}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </div>
    </ModalPortal>
  );
};
