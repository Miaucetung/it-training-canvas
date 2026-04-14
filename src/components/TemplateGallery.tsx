import {
  BUILT_IN_TEMPLATES,
  searchTemplates,
} from "@/lib/collaboration-engine";
import type {
  CanvasConnection,
  CanvasTemplate,
  DrawingObject,
  TemplateCategory,
} from "@/lib/types";
import { TEMPLATE_CATEGORY_LABELS } from "@/lib/types";
import {
  Clock,
  CloudArrowDown,
  Desktop,
  FolderOpen,
  MagnifyingGlass,
  Plus,
  Star,
  Tag,
  X,
} from "@phosphor-icons/react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

interface TemplateGalleryProps {
  theme: "light" | "dark";
  customTemplates: CanvasTemplate[];
  currentObjects: DrawingObject[];
  currentConnections: CanvasConnection[];
  onApplyTemplate: (
    objects: DrawingObject[],
    connections: CanvasConnection[],
  ) => void;
  onSaveAsTemplate: (
    name: string,
    description: string,
    category: TemplateCategory,
    tags: string[],
  ) => void;
  onClose: () => void;
}

const DIFFICULTY_LABELS: Record<
  CanvasTemplate["difficulty"],
  { label: string; color: string }
> = {
  beginner: { label: "Einsteiger", color: "#22C55E" },
  intermediate: { label: "Fortgeschritten", color: "#F59E0B" },
  advanced: { label: "Experte", color: "#EF4444" },
};

export function TemplateGallery({
  theme,
  customTemplates,
  currentObjects,
  currentConnections,
  onApplyTemplate,
  onSaveAsTemplate,
  onClose,
}: TemplateGalleryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    TemplateCategory | "all"
  >("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    CanvasTemplate["difficulty"] | "all"
  >("all");
  const [previewTemplate, setPreviewTemplate] = useState<CanvasTemplate | null>(
    null,
  );
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState<TemplateCategory>("general");
  const [newTags, setNewTags] = useState("");

  const isDark = theme === "dark";

  const allTemplates = useMemo(
    () => [...BUILT_IN_TEMPLATES, ...customTemplates],
    [customTemplates],
  );

  const filteredTemplates = useMemo(
    () =>
      searchTemplates(
        allTemplates,
        searchQuery,
        selectedCategory === "all" ? undefined : selectedCategory,
        selectedDifficulty === "all" ? undefined : selectedDifficulty,
      ),
    [allTemplates, searchQuery, selectedCategory, selectedDifficulty],
  );

  const handleApply = useCallback(
    (template: CanvasTemplate) => {
      // Offset objects slightly to avoid overlapping existing content
      const offsetX = currentObjects.length > 0 ? 50 : 0;
      const offsetY = currentObjects.length > 0 ? 50 : 0;

      const newObjects = template.objects.map((obj) => ({
        ...obj,
        id: `${obj.id}-${Date.now()}`,
        startPoint: obj.startPoint
          ? { x: obj.startPoint.x + offsetX, y: obj.startPoint.y + offsetY }
          : undefined,
        endPoint: obj.endPoint
          ? { x: obj.endPoint.x + offsetX, y: obj.endPoint.y + offsetY }
          : undefined,
      }));

      // Map old IDs to new IDs for connections
      const idMap = new Map<string, string>();
      template.objects.forEach((obj, i) => {
        idMap.set(obj.id, newObjects[i].id);
      });

      const newConnections = template.connections.map((conn) => ({
        ...conn,
        id: `${conn.id}-${Date.now()}`,
        sourceShapeId: idMap.get(conn.sourceShapeId) || conn.sourceShapeId,
        targetShapeId: idMap.get(conn.targetShapeId) || conn.targetShapeId,
      }));

      onApplyTemplate(newObjects, newConnections);
      toast.success(`Template "${template.name}" angewendet`);
      onClose();
    },
    [currentObjects.length, onApplyTemplate, onClose],
  );

  const handleSave = useCallback(() => {
    if (!newName.trim()) {
      toast.error("Bitte einen Namen eingeben");
      return;
    }
    if (currentObjects.length === 0) {
      toast.error("Canvas ist leer — nichts zum Speichern");
      return;
    }
    const tags = newTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    onSaveAsTemplate(newName.trim(), newDescription.trim(), newCategory, tags);
    toast.success(`Template "${newName.trim()}" gespeichert`);
    setShowSaveForm(false);
    setNewName("");
    setNewDescription("");
    setNewTags("");
  }, [
    currentObjects.length,
    newCategory,
    newDescription,
    newName,
    newTags,
    onSaveAsTemplate,
  ]);

  // Mini canvas preview
  const renderPreview = useCallback((template: CanvasTemplate) => {
    const objects = template.objects;
    if (objects.length === 0) return null;

    const getX = (o: DrawingObject) => o.startPoint?.x ?? 0;
    const getY = (o: DrawingObject) => o.startPoint?.y ?? 0;
    const getW = (o: DrawingObject) => o.shapeWidth || 60;
    const getH = (o: DrawingObject) => o.shapeHeight || 60;

    const minX = Math.min(...objects.map(getX));
    const minY = Math.min(...objects.map(getY));
    const maxX = Math.max(...objects.map((o) => getX(o) + getW(o)));
    const maxY = Math.max(...objects.map((o) => getY(o) + getH(o)));
    const w = maxX - minX + 40;
    const h = maxY - minY + 40;
    const scale = Math.min(280 / w, 160 / h, 1);

    return (
      <svg width={280} height={160} className="mx-auto">
        <g
          transform={`translate(${(280 - w * scale) / 2}, ${(160 - h * scale) / 2}) scale(${scale})`}
        >
          {/* Connections */}
          {template.connections.map((c) => {
            const from = objects.find((o) => o.id === c.sourceShapeId);
            const to = objects.find((o) => o.id === c.targetShapeId);
            if (!from || !to) return null;
            return (
              <line
                key={c.id}
                x1={getX(from) - minX + 20 + getW(from) / 2}
                y1={getY(from) - minY + 20 + getH(from) / 2}
                x2={getX(to) - minX + 20 + getW(to) / 2}
                y2={getY(to) - minY + 20 + getH(to) / 2}
                stroke={c.color || "#64748B"}
                strokeWidth={2}
                opacity={0.6}
              />
            );
          })}
          {/* Objects */}
          {objects.map((o) => (
            <g key={o.id}>
              <rect
                x={getX(o) - minX + 20}
                y={getY(o) - minY + 20}
                width={getW(o)}
                height={getH(o)}
                rx={8}
                fill={o.color || "#3B82F6"}
                opacity={0.8}
              />
              <text
                x={getX(o) - minX + 20 + getW(o) / 2}
                y={getY(o) - minY + 20 + getH(o) / 2 + 4}
                textAnchor="middle"
                fill="white"
                fontSize={10}
                fontWeight="600"
              >
                {(o.label || "").slice(0, 12)}
              </text>
            </g>
          ))}
        </g>
      </svg>
    );
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className={`w-[800px] max-h-[85vh] rounded-2xl shadow-2xl border overflow-hidden flex flex-col ${
          isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
        }`}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between ${isDark ? "border-slate-800" : "border-slate-100"}`}
        >
          <div className="flex items-center gap-3">
            <FolderOpen size={20} className="text-amber-500" weight="bold" />
            <h2
              className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}
            >
              Vorlagen-Galerie
            </h2>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"}`}
            >
              {allTemplates.length} Vorlagen
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSaveForm(!showSaveForm)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                showSaveForm
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-emerald-500 hover:bg-emerald-600 text-white"
              }`}
            >
              <Plus size={14} />
              {showSaveForm ? "Abbrechen" : "Als Vorlage speichern"}
            </button>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg ${isDark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Save form */}
        {showSaveForm && (
          <div
            className={`px-5 py-4 border-b ${isDark ? "border-slate-800 bg-emerald-500/5" : "border-slate-100 bg-emerald-50/50"}`}
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}
                >
                  Name *
                </label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Mein Netzwerk-Template"
                  className={`w-full mt-1 px-3 py-2 rounded-lg text-sm border ${
                    isDark
                      ? "bg-slate-900 border-slate-700 text-slate-200"
                      : "bg-white border-slate-300 text-slate-700"
                  }`}
                />
              </div>
              <div>
                <label
                  className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}
                >
                  Kategorie
                </label>
                <select
                  value={newCategory}
                  onChange={(e) =>
                    setNewCategory(e.target.value as TemplateCategory)
                  }
                  className={`w-full mt-1 px-3 py-2 rounded-lg text-sm border ${
                    isDark
                      ? "bg-slate-900 border-slate-700 text-slate-200"
                      : "bg-white border-slate-300 text-slate-700"
                  }`}
                >
                  {Object.entries(TEMPLATE_CATEGORY_LABELS).map(
                    ([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ),
                  )}
                </select>
              </div>
              <div>
                <label
                  className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}
                >
                  Beschreibung
                </label>
                <input
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Kurze Beschreibung..."
                  className={`w-full mt-1 px-3 py-2 rounded-lg text-sm border ${
                    isDark
                      ? "bg-slate-900 border-slate-700 text-slate-200"
                      : "bg-white border-slate-300 text-slate-700"
                  }`}
                />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label
                    className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}
                  >
                    Tags (kommagetrennt)
                  </label>
                  <input
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="LAN, Router, ..."
                    className={`w-full mt-1 px-3 py-2 rounded-lg text-sm border ${
                      isDark
                        ? "bg-slate-900 border-slate-700 text-slate-200"
                        : "bg-white border-slate-300 text-slate-700"
                    }`}
                  />
                </div>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Speichern
                </button>
              </div>
            </div>
            <div
              className={`mt-2 text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}
            >
              Aktueller Canvas: {currentObjects.length} Objekte,{" "}
              {currentConnections.length} Verbindungen
            </div>
          </div>
        )}

        {/* Filters */}
        <div
          className={`px-5 py-3 border-b flex items-center gap-3 ${isDark ? "border-slate-800" : "border-slate-100"}`}
        >
          <div
            className={`flex items-center gap-2 flex-1 px-3 py-1.5 rounded-lg border ${
              isDark
                ? "border-slate-700 bg-slate-800"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <MagnifyingGlass
              size={14}
              className={isDark ? "text-slate-500" : "text-slate-400"}
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Vorlagen suchen..."
              className={`flex-1 text-sm bg-transparent outline-none ${isDark ? "text-slate-200 placeholder-slate-500" : "text-slate-700 placeholder-slate-400"}`}
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) =>
              setSelectedCategory(e.target.value as TemplateCategory | "all")
            }
            className={`px-3 py-1.5 rounded-lg text-xs border ${
              isDark
                ? "bg-slate-800 border-slate-700 text-slate-300"
                : "bg-white border-slate-200 text-slate-600"
            }`}
          >
            <option value="all">Alle Kategorien</option>
            {Object.entries(TEMPLATE_CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) =>
              setSelectedDifficulty(
                e.target.value as CanvasTemplate["difficulty"] | "all",
              )
            }
            className={`px-3 py-1.5 rounded-lg text-xs border ${
              isDark
                ? "bg-slate-800 border-slate-700 text-slate-300"
                : "bg-white border-slate-200 text-slate-600"
            }`}
          >
            <option value="all">Alle Stufen</option>
            <option value="beginner">Einsteiger</option>
            <option value="intermediate">Fortgeschritten</option>
            <option value="advanced">Experte</option>
          </select>
        </div>

        {/* Template grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {filteredTemplates.length === 0 ? (
            <div
              className={`text-center py-12 ${isDark ? "text-slate-500" : "text-slate-400"}`}
            >
              <Desktop size={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">Keine Vorlagen gefunden</p>
              <p className="text-xs mt-1">
                Versuche andere Suchbegriffe oder Filter
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredTemplates.map((template) => {
                const diff = DIFFICULTY_LABELS[template.difficulty];
                const isCustom = !template.id.startsWith("tpl-");

                return (
                  <div
                    key={template.id}
                    className={`group rounded-xl border overflow-hidden transition-all hover:shadow-lg cursor-pointer ${
                      previewTemplate?.id === template.id
                        ? "ring-2 ring-blue-500"
                        : isDark
                          ? "border-slate-800 hover:border-slate-600"
                          : "border-slate-200 hover:border-slate-300"
                    }`}
                    onClick={() =>
                      setPreviewTemplate(
                        previewTemplate?.id === template.id ? null : template,
                      )
                    }
                  >
                    {/* Preview */}
                    <div
                      className={`h-40 ${isDark ? "bg-slate-800/50" : "bg-slate-50"}`}
                    >
                      {renderPreview(template)}
                    </div>

                    {/* Info */}
                    <div
                      className={`p-3 ${isDark ? "bg-slate-900" : "bg-white"}`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h4
                          className={`text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}
                        >
                          {template.name}
                          {isCustom && (
                            <span className="ml-1 text-[9px] text-amber-500 font-normal">
                              Eigene
                            </span>
                          )}
                        </h4>
                        <div className="flex items-center gap-1">
                          <Star
                            size={10}
                            weight="fill"
                            className="text-amber-400"
                          />
                          <span
                            className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}
                          >
                            {template.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      <p
                        className={`text-[11px] leading-relaxed mb-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}
                      >
                        {template.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="px-1.5 py-0.5 rounded text-[9px] font-medium"
                            style={{
                              color: diff.color,
                              backgroundColor: diff.color + "15",
                            }}
                          >
                            {diff.label}
                          </span>
                          <span
                            className={`text-[9px] ${isDark ? "text-slate-500" : "text-slate-400"}`}
                          >
                            {TEMPLATE_CATEGORY_LABELS[template.category]}
                          </span>
                          {template.estimatedTime && (
                            <span
                              className={`flex items-center gap-0.5 text-[9px] ${isDark ? "text-slate-500" : "text-slate-400"}`}
                            >
                              <Clock size={8} />
                              {template.estimatedTime}
                            </span>
                          )}
                        </div>

                        <span
                          className={`text-[9px] ${isDark ? "text-slate-600" : "text-slate-400"}`}
                        >
                          {template.objects.length} Obj ·{" "}
                          {template.connections.length} Verb
                        </span>
                      </div>

                      {/* Tags */}
                      {template.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {template.tags.slice(0, 4).map((tag) => (
                            <span
                              key={tag}
                              className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] ${
                                isDark
                                  ? "bg-slate-800 text-slate-400"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              <Tag size={8} />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Action button on expanded */}
                      {previewTemplate?.id === template.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApply(template);
                          }}
                          className="mt-3 w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <CloudArrowDown size={14} />
                          Auf Canvas anwenden
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
