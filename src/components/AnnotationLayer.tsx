import {
  addReply,
  createAnnotation,
  getAnnotationIcon,
} from "@/lib/collaboration-engine";
import type { Annotation, AnnotationType, DrawingObject } from "@/lib/types";
import {
  ArrowRight,
  ChatCircle,
  CheckCircle,
  Highlighter,
  PushPin,
  Question,
  Trash,
  Warning,
  X,
} from "@phosphor-icons/react";
import { useCallback, useRef, useState } from "react";

interface AnnotationLayerProps {
  annotations: Annotation[];
  objects: DrawingObject[];
  zoom: number;
  panX: number;
  panY: number;
  theme: "light" | "dark";
  currentUser: string;
  currentUserColor: string;
  onAnnotationsChange: (annotations: Annotation[]) => void;
  onClose: () => void;
}

const ANNOTATION_TYPE_CONFIG: {
  type: AnnotationType;
  label: string;
  icon: React.ElementType;
  color: string;
}[] = [
  { type: "comment", label: "Kommentar", icon: ChatCircle, color: "#3B82F6" },
  { type: "arrow", label: "Pfeil", icon: ArrowRight, color: "#10B981" },
  {
    type: "highlight",
    label: "Markierung",
    icon: Highlighter,
    color: "#EAB308",
  },
  { type: "callout", label: "Hinweis", icon: PushPin, color: "#F97316" },
  { type: "question", label: "Frage", icon: Question, color: "#8B5CF6" },
  { type: "warning", label: "Warnung", icon: Warning, color: "#EF4444" },
];

export function AnnotationLayer({
  annotations,
  objects,
  zoom,
  panX,
  panY,
  theme,
  currentUser,
  currentUserColor,
  onAnnotationsChange,
  onClose,
}: AnnotationLayerProps) {
  const [selectedTool, setSelectedTool] = useState<AnnotationType>("comment");
  const [selectedAnnotation, setSelectedAnnotation] =
    useState<Annotation | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showResolved, setShowResolved] = useState(false);
  const layerRef = useRef<HTMLDivElement>(null);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target !== layerRef.current) return;
      const rect = layerRef.current!.getBoundingClientRect();
      const x = (e.clientX - rect.left - panX) / zoom;
      const y = (e.clientY - rect.top - panY) / zoom;

      const text =
        selectedTool === "question"
          ? "Frage zu diesem Bereich?"
          : selectedTool === "warning"
            ? "Achtung!"
            : "";

      // Check if clicking near a shape
      const nearbyObject = objects.find((obj) => {
        const ox = obj.startPoint?.x ?? 0;
        const oy = obj.startPoint?.y ?? 0;
        const dx = Math.abs(ox + (obj.shapeWidth || 40) / 2 - x);
        const dy = Math.abs(oy + (obj.shapeHeight || 40) / 2 - y);
        return dx < 60 && dy < 60;
      });

      const annotation = createAnnotation(
        selectedTool,
        x,
        y,
        text,
        currentUser,
        currentUserColor,
        nearbyObject?.id,
      );

      onAnnotationsChange([...annotations, annotation]);
      setSelectedAnnotation(annotation);
    },
    [
      annotations,
      currentUser,
      currentUserColor,
      objects,
      onAnnotationsChange,
      panX,
      panY,
      selectedTool,
      zoom,
    ],
  );

  const handleDelete = useCallback(
    (id: string) => {
      onAnnotationsChange(annotations.filter((a) => a.id !== id));
      if (selectedAnnotation?.id === id) setSelectedAnnotation(null);
    },
    [annotations, onAnnotationsChange, selectedAnnotation],
  );

  const handleResolve = useCallback(
    (id: string) => {
      onAnnotationsChange(
        annotations.map((a) =>
          a.id === id
            ? { ...a, resolved: !a.resolved, updatedAt: Date.now() }
            : a,
        ),
      );
    },
    [annotations, onAnnotationsChange],
  );

  const handleUpdateText = useCallback(
    (id: string, text: string) => {
      onAnnotationsChange(
        annotations.map((a) =>
          a.id === id ? { ...a, text, updatedAt: Date.now() } : a,
        ),
      );
    },
    [annotations, onAnnotationsChange],
  );

  const handleReply = useCallback(
    (annotation: Annotation) => {
      if (!replyText.trim()) return;
      const updated = addReply(
        annotation,
        replyText.trim(),
        currentUser,
        currentUserColor,
      );
      onAnnotationsChange(
        annotations.map((a) => (a.id === updated.id ? updated : a)),
      );
      setReplyText("");
      setSelectedAnnotation(updated);
    },
    [
      annotations,
      currentUser,
      currentUserColor,
      onAnnotationsChange,
      replyText,
    ],
  );

  const visibleAnnotations = showResolved
    ? annotations
    : annotations.filter((a) => !a.resolved);

  const unresolvedCount = annotations.filter((a) => !a.resolved).length;
  const resolvedCount = annotations.filter((a) => a.resolved).length;

  const isDark = theme === "dark";

  return (
    <>
      {/* Toolbar */}
      <div
        className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 px-3 py-2 rounded-xl shadow-xl border ${
          isDark
            ? "bg-slate-900/95 border-slate-700"
            : "bg-white/95 border-slate-200"
        }`}
      >
        <span
          className={`text-xs font-medium mr-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}
        >
          Annotationen
        </span>
        {ANNOTATION_TYPE_CONFIG.map(({ type, label, icon: Icon, color }) => (
          <button
            key={type}
            onClick={() => setSelectedTool(type)}
            className={`p-2 rounded-lg transition-all ${
              selectedTool === type
                ? "ring-2 ring-offset-1 scale-110"
                : isDark
                  ? "hover:bg-slate-800"
                  : "hover:bg-slate-100"
            }`}
            style={{
              color: selectedTool === type ? color : undefined,
            }}
            title={label}
          >
            <Icon
              size={18}
              weight={selectedTool === type ? "fill" : "regular"}
            />
          </button>
        ))}

        <div
          className={`w-px h-6 mx-2 ${isDark ? "bg-slate-700" : "bg-slate-300"}`}
        />

        <div
          className={`flex items-center gap-2 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
        >
          <span>{unresolvedCount} offen</span>
          <button
            onClick={() => setShowResolved(!showResolved)}
            className={`px-2 py-1 rounded text-xs ${
              showResolved
                ? "bg-emerald-500/20 text-emerald-400"
                : isDark
                  ? "hover:bg-slate-800 text-slate-500"
                  : "hover:bg-slate-100"
            }`}
          >
            {resolvedCount} gelöst {showResolved ? "▾" : "▸"}
          </button>
        </div>

        <div
          className={`w-px h-6 mx-2 ${isDark ? "bg-slate-700" : "bg-slate-300"}`}
        />

        <button
          onClick={onClose}
          className={`p-1.5 rounded-lg ${isDark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
          title="Annotationen schließen"
        >
          <X size={16} />
        </button>
      </div>

      {/* Clickable overlay */}
      <div
        ref={layerRef}
        className="absolute inset-0 z-30 cursor-crosshair"
        onClick={handleCanvasClick}
      >
        {/* Annotation markers */}
        {visibleAnnotations.map((a) => {
          const screenX = a.x * zoom + panX;
          const screenY = a.y * zoom + panY;
          const isSelected = selectedAnnotation?.id === a.id;
          const config = ANNOTATION_TYPE_CONFIG.find((c) => c.type === a.type);

          return (
            <div
              key={a.id}
              className="absolute"
              style={{
                left: screenX,
                top: screenY,
                zIndex: isSelected ? 40 : 35,
              }}
            >
              {/* Marker dot */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedAnnotation(isSelected ? null : a);
                }}
                className={`w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center shadow-lg border-2 transition-transform ${
                  isSelected ? "scale-125" : "hover:scale-110"
                } ${a.resolved ? "opacity-50" : ""}`}
                style={{
                  backgroundColor: a.authorColor + "20",
                  borderColor: a.authorColor,
                  color: config?.color,
                }}
                title={`${getAnnotationIcon(a.type)} ${a.author}`}
              >
                {config && <config.icon size={14} weight="bold" />}
              </button>

              {/* Popup */}
              {isSelected && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className={`absolute top-6 left-0 w-72 rounded-xl shadow-2xl border overflow-hidden ${
                    isDark
                      ? "bg-slate-900 border-slate-700"
                      : "bg-white border-slate-200"
                  }`}
                >
                  {/* Header */}
                  <div
                    className="px-3 py-2 flex items-center justify-between"
                    style={{ backgroundColor: config?.color + "15" }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold text-white"
                        style={{ backgroundColor: a.authorColor }}
                      >
                        {a.author.charAt(0).toUpperCase()}
                      </div>
                      <span
                        className={`text-xs font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}
                      >
                        {a.author}
                      </span>
                      <span
                        className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}
                      >
                        {new Date(a.createdAt).toLocaleString("de-DE", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleResolve(a.id)}
                        className={`p-1 rounded ${a.resolved ? "text-emerald-400" : isDark ? "text-slate-500 hover:text-emerald-400" : "text-slate-400 hover:text-emerald-500"}`}
                        title={
                          a.resolved ? "Wieder öffnen" : "Als gelöst markieren"
                        }
                      >
                        <CheckCircle
                          size={14}
                          weight={a.resolved ? "fill" : "regular"}
                        />
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className={`p-1 rounded ${isDark ? "text-slate-500 hover:text-red-400" : "text-slate-400 hover:text-red-500"}`}
                        title="Löschen"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="px-3 py-2">
                    <textarea
                      value={a.text}
                      onChange={(e) => handleUpdateText(a.id, e.target.value)}
                      placeholder="Kommentar eingeben..."
                      rows={2}
                      className={`w-full text-sm resize-none border rounded-lg px-2 py-1.5 ${
                        isDark
                          ? "bg-slate-800 border-slate-700 text-slate-200 placeholder-slate-500"
                          : "bg-slate-50 border-slate-200 text-slate-700 placeholder-slate-400"
                      }`}
                    />

                    {/* Target shape */}
                    {a.targetObjectId && (
                      <div
                        className={`mt-1 text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}
                      >
                        📎 Verknüpft mit:{" "}
                        {objects.find((o) => o.id === a.targetObjectId)
                          ?.label || a.targetObjectId}
                      </div>
                    )}
                  </div>

                  {/* Replies */}
                  {a.replies.length > 0 && (
                    <div
                      className={`border-t px-3 py-2 space-y-2 ${isDark ? "border-slate-800" : "border-slate-100"}`}
                    >
                      {a.replies.map((r) => (
                        <div key={r.id} className="flex gap-2">
                          <div
                            className="w-4 h-4 rounded-full text-[8px] flex items-center justify-center font-bold text-white shrink-0 mt-0.5"
                            style={{ backgroundColor: r.authorColor }}
                          >
                            {r.author.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1">
                              <span
                                className={`text-[10px] font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}
                              >
                                {r.author}
                              </span>
                              <span
                                className={`text-[9px] ${isDark ? "text-slate-600" : "text-slate-400"}`}
                              >
                                {new Date(r.createdAt).toLocaleTimeString(
                                  "de-DE",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </span>
                            </div>
                            <p
                              className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}
                            >
                              {r.text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply input */}
                  <div
                    className={`border-t px-3 py-2 ${isDark ? "border-slate-800" : "border-slate-100"}`}
                  >
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleReply(a);
                          }
                        }}
                        placeholder="Antworten…"
                        className={`flex-1 text-xs border rounded-lg px-2 py-1.5 ${
                          isDark
                            ? "bg-slate-800 border-slate-700 text-slate-200 placeholder-slate-600"
                            : "bg-slate-50 border-slate-200 text-slate-700 placeholder-slate-400"
                        }`}
                      />
                      <button
                        onClick={() => handleReply(a)}
                        disabled={!replyText.trim()}
                        className="px-2 py-1 bg-blue-500 text-white rounded-lg text-xs font-medium disabled:opacity-30 hover:bg-blue-600 transition-colors"
                      >
                        ↩
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
