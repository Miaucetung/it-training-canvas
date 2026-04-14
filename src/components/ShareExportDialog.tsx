import {
  generateShareLink,
  getExportFilename,
  getShareUrl,
} from "@/lib/collaboration-engine";
import type {
  ExportFormat,
  ExportOptions,
  SessionPermissions,
  ShareLink,
} from "@/lib/types";
import {
  Check,
  Copy,
  Eye,
  FilePdf,
  FilePng,
  FileSvg,
  FileText,
  Link,
  Lock,
  Presentation,
  Share,
  Timer,
  X,
} from "@phosphor-icons/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

interface ShareExportDialogProps {
  theme: "light" | "dark";
  currentSubject: string;
  objectCount: number;
  connectionCount: number;
  onExportJSON: () => void;
  onExportPNG: () => void;
  onExportSVG: () => void;
  onClose: () => void;
}

const FORMAT_OPTIONS: {
  format: ExportFormat;
  label: string;
  desc: string;
  icon: React.ElementType;
  available: boolean;
}[] = [
  {
    format: "json",
    label: "JSON",
    desc: "Vollständiger Canvas-Export",
    icon: FileText,
    available: true,
  },
  {
    format: "png",
    label: "PNG",
    desc: "Bild-Export (Raster)",
    icon: FilePng,
    available: true,
  },
  {
    format: "svg",
    label: "SVG",
    desc: "Vektor-Grafik",
    icon: FileSvg,
    available: true,
  },
  {
    format: "pdf",
    label: "PDF",
    desc: "Dokument-Export",
    icon: FilePdf,
    available: false,
  },
  {
    format: "pptx",
    label: "PPTX",
    desc: "PowerPoint-Präsentation",
    icon: Presentation,
    available: false,
  },
];

export function ShareExportDialog({
  theme,
  currentSubject,
  objectCount,
  connectionCount,
  onExportJSON,
  onExportPNG,
  onExportSVG,
  onClose,
}: ShareExportDialogProps) {
  const [activeTab, setActiveTab] = useState<"export" | "share">("export");
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: "json",
    includeAnnotations: true,
    includeMetadata: true,
    quality: "high",
  });
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [sharePassword, setSharePassword] = useState("");
  const [shareExpiry, setShareExpiry] = useState<number>(0);
  const [sharePermissions, setSharePermissions] = useState<SessionPermissions>({
    canEdit: false,
    canAnnotate: true,
    canChat: true,
    canExport: true,
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isDark = theme === "dark";

  const handleExport = useCallback(() => {
    switch (exportOptions.format) {
      case "json":
        onExportJSON();
        toast.success("JSON exportiert");
        break;
      case "png":
        onExportPNG();
        toast.success("PNG exportiert");
        break;
      case "svg":
        onExportSVG();
        toast.success("SVG exportiert");
        break;
      default:
        toast.info(`${exportOptions.format.toUpperCase()}-Export kommt bald!`);
    }
  }, [exportOptions.format, onExportJSON, onExportPNG, onExportSVG]);

  const handleCreateShareLink = useCallback(() => {
    const link = generateShareLink(
      currentSubject,
      "Lokaler Benutzer",
      sharePermissions,
      {
        expiresInHours: shareExpiry || undefined,
        password: sharePassword || undefined,
      },
    );
    setShareLinks((prev) => [link, ...prev]);
    toast.success("Freigabe-Link erstellt");
  }, [currentSubject, shareExpiry, sharePassword, sharePermissions]);

  const handleCopyLink = useCallback((link: ShareLink) => {
    const url = getShareUrl(link);
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(link.id);
      toast.success("Link kopiert!");
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);

  const handleDeleteLink = useCallback((id: string) => {
    setShareLinks((prev) => prev.filter((l) => l.id !== id));
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className={`w-[560px] max-h-[85vh] rounded-2xl shadow-2xl border overflow-hidden flex flex-col ${
          isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
        }`}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between ${isDark ? "border-slate-800" : "border-slate-100"}`}
        >
          <div className="flex items-center gap-3">
            <Share size={20} className="text-blue-500" weight="bold" />
            <h2
              className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}
            >
              Teilen & Exportieren
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg ${isDark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div
          className={`flex border-b ${isDark ? "border-slate-800" : "border-slate-100"}`}
        >
          {[
            { id: "export" as const, label: "Exportieren", icon: FileText },
            { id: "share" as const, label: "Freigeben", icon: Link },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === id
                  ? "border-blue-500 text-blue-500"
                  : `border-transparent ${isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"}`
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === "export" ? (
            <div className="space-y-5">
              {/* Stats */}
              <div
                className={`flex gap-4 p-3 rounded-xl ${isDark ? "bg-slate-800/50" : "bg-slate-50"}`}
              >
                <div className="text-center flex-1">
                  <div
                    className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
                  >
                    {objectCount}
                  </div>
                  <div
                    className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}
                  >
                    Objekte
                  </div>
                </div>
                <div className="text-center flex-1">
                  <div
                    className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
                  >
                    {connectionCount}
                  </div>
                  <div
                    className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}
                  >
                    Verbindungen
                  </div>
                </div>
                <div className="text-center flex-1">
                  <div
                    className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
                  >
                    {currentSubject}
                  </div>
                  <div
                    className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}
                  >
                    Fach
                  </div>
                </div>
              </div>

              {/* Format selection */}
              <div>
                <h3
                  className={`text-sm font-medium mb-3 ${isDark ? "text-slate-300" : "text-slate-700"}`}
                >
                  Format wählen
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {FORMAT_OPTIONS.map(
                    ({ format, label, desc, icon: Icon, available }) => (
                      <button
                        key={format}
                        onClick={() =>
                          available &&
                          setExportOptions((o) => ({ ...o, format }))
                        }
                        disabled={!available}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                          exportOptions.format === format
                            ? "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/30"
                            : !available
                              ? `opacity-40 cursor-not-allowed ${isDark ? "border-slate-800" : "border-slate-200"}`
                              : isDark
                                ? "border-slate-800 hover:border-slate-600"
                                : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <Icon
                          size={24}
                          className={
                            exportOptions.format === format
                              ? "text-blue-500"
                              : isDark
                                ? "text-slate-500"
                                : "text-slate-400"
                          }
                        />
                        <div>
                          <div
                            className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}
                          >
                            {label}
                            {!available && (
                              <span className="ml-1 text-[9px] text-amber-500">
                                Bald
                              </span>
                            )}
                          </div>
                          <div
                            className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}
                          >
                            {desc}
                          </div>
                        </div>
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* Options */}
              <div>
                <h3
                  className={`text-sm font-medium mb-3 ${isDark ? "text-slate-300" : "text-slate-700"}`}
                >
                  Optionen
                </h3>
                <div className="space-y-2">
                  {[
                    {
                      key: "includeAnnotations",
                      label: "Annotationen einbeziehen",
                    },
                    { key: "includeMetadata", label: "Metadaten einbeziehen" },
                  ].map(({ key, label }) => (
                    <label
                      key={key}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${
                        isDark ? "hover:bg-slate-800" : "hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={
                          exportOptions[key as keyof ExportOptions] as boolean
                        }
                        onChange={(e) =>
                          setExportOptions((o) => ({
                            ...o,
                            [key]: e.target.checked,
                          }))
                        }
                        className="rounded border-slate-400"
                      />
                      <span
                        className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}
                      >
                        {label}
                      </span>
                    </label>
                  ))}

                  {(exportOptions.format === "png" ||
                    exportOptions.format === "pdf") && (
                    <div className="flex items-center gap-3 p-2">
                      <span
                        className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}
                      >
                        Qualität
                      </span>
                      <div className="flex gap-1">
                        {(["low", "medium", "high"] as const).map((q) => (
                          <button
                            key={q}
                            onClick={() =>
                              setExportOptions((o) => ({ ...o, quality: q }))
                            }
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                              exportOptions.quality === q
                                ? "bg-blue-500 text-white"
                                : isDark
                                  ? "bg-slate-800 text-slate-400 hover:text-slate-200"
                                  : "bg-slate-100 text-slate-500 hover:text-slate-700"
                            }`}
                          >
                            {q === "low"
                              ? "Niedrig"
                              : q === "medium"
                                ? "Mittel"
                                : "Hoch"}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Export button */}
              <button
                onClick={handleExport}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                <FileText size={16} />
                {getExportFilename(currentSubject, exportOptions.format)}{" "}
                exportieren
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Create share link */}
              <div
                className={`p-4 rounded-xl border ${isDark ? "border-slate-800 bg-slate-800/30" : "border-slate-200 bg-slate-50"}`}
              >
                <h3
                  className={`text-sm font-medium mb-3 ${isDark ? "text-slate-200" : "text-slate-700"}`}
                >
                  Neuen Freigabe-Link erstellen
                </h3>

                {/* Permissions */}
                <div className="space-y-2 mb-3">
                  <span
                    className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}
                  >
                    Berechtigungen
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: "canEdit", label: "Bearbeiten" },
                      { key: "canAnnotate", label: "Annotieren" },
                      { key: "canChat", label: "Chat" },
                      { key: "canExport", label: "Exportieren" },
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() =>
                          setSharePermissions((p) => ({
                            ...p,
                            [key]: !p[key as keyof SessionPermissions],
                          }))
                        }
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                          sharePermissions[key as keyof SessionPermissions]
                            ? "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30"
                            : isDark
                              ? "bg-slate-800 text-slate-500"
                              : "bg-slate-200 text-slate-400"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Password & Expiry */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label
                      className={`flex items-center gap-1 text-xs mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}
                    >
                      <Lock size={12} />
                      Passwort (optional)
                    </label>
                    <input
                      type="password"
                      value={sharePassword}
                      onChange={(e) => setSharePassword(e.target.value)}
                      placeholder="Kein Passwort"
                      className={`w-full px-2.5 py-1.5 rounded-lg text-xs border ${
                        isDark
                          ? "bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-600"
                          : "bg-white border-slate-300 text-slate-700 placeholder-slate-400"
                      }`}
                    />
                  </div>
                  <div>
                    <label
                      className={`flex items-center gap-1 text-xs mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}
                    >
                      <Timer size={12} />
                      Ablauf (Stunden)
                    </label>
                    <input
                      type="number"
                      value={shareExpiry || ""}
                      onChange={(e) => setShareExpiry(Number(e.target.value))}
                      placeholder="Kein Ablauf"
                      min={0}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-xs border ${
                        isDark
                          ? "bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-600"
                          : "bg-white border-slate-300 text-slate-700 placeholder-slate-400"
                      }`}
                    />
                  </div>
                </div>

                <button
                  onClick={handleCreateShareLink}
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Link size={16} />
                  Link erstellen
                </button>
              </div>

              {/* Share links list */}
              {shareLinks.length > 0 && (
                <div>
                  <h3
                    className={`text-sm font-medium mb-3 ${isDark ? "text-slate-200" : "text-slate-700"}`}
                  >
                    Aktive Links ({shareLinks.length})
                  </h3>
                  <div className="space-y-2">
                    {shareLinks.map((link) => (
                      <div
                        key={link.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border ${
                          isDark
                            ? "border-slate-800 bg-slate-800/30"
                            : "border-slate-200 bg-slate-50"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div
                            className={`text-xs font-mono truncate ${isDark ? "text-slate-300" : "text-slate-600"}`}
                          >
                            {getShareUrl(link)}
                          </div>
                          <div
                            className={`flex items-center gap-2 mt-1 text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}
                          >
                            {link.password && (
                              <span className="flex items-center gap-0.5">
                                <Lock size={9} /> Geschützt
                              </span>
                            )}
                            {link.expiresAt && (
                              <span className="flex items-center gap-0.5">
                                <Timer size={9} />
                                {new Date(link.expiresAt).toLocaleDateString(
                                  "de-DE",
                                )}
                              </span>
                            )}
                            <span className="flex items-center gap-0.5">
                              <Eye size={9} />
                              {link.accessCount}x besucht
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleCopyLink(link)}
                          className={`p-2 rounded-lg transition-colors ${
                            copiedId === link.id
                              ? "bg-emerald-500/20 text-emerald-400"
                              : isDark
                                ? "hover:bg-slate-700 text-slate-400"
                                : "hover:bg-slate-200 text-slate-500"
                          }`}
                          title="Link kopieren"
                        >
                          {copiedId === link.id ? (
                            <Check size={16} />
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteLink(link.id)}
                          className={`p-2 rounded-lg ${isDark ? "hover:bg-slate-700 text-slate-500 hover:text-red-400" : "hover:bg-slate-200 text-slate-400 hover:text-red-500"}`}
                          title="Link löschen"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Info */}
              <div
                className={`p-3 rounded-xl text-xs ${isDark ? "bg-blue-500/10 text-blue-300" : "bg-blue-50 text-blue-600"}`}
              >
                <strong>Hinweis:</strong> Freigabe-Links funktionieren aktuell
                nur innerhalb derselben Browser-Session (via BroadcastChannel).
                Für echte Mehrspieler-Funktionalität wird ein Backend benötigt.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
