import { Hint, LearningPath, LearningStep, ValidationRule } from "@/lib/types";
import { gamificationBus } from "@/lib/gamification/events/event-bus";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  CheckCircle,
  ClipboardText,
  Lightning,
  Plus,
  Question,
  Trash,
  X,
} from "@phosphor-icons/react";
import { useCallback, useState } from "react";

interface LearningPathEditorProps {
  path: LearningPath | null;
  onSave: (path: LearningPath) => void;
  onClose: () => void;
  theme: "light" | "dark";
  subject: string;
}

const STEP_TYPE_ICONS: Record<LearningStep["type"], React.ReactNode> = {
  info: <BookOpen size={16} />,
  task: <ClipboardText size={16} />,
  quiz: <Question size={16} />,
  checkpoint: <CheckCircle size={16} />,
};

const STEP_TYPE_LABELS: Record<LearningStep["type"], string> = {
  info: "Info",
  task: "Aufgabe",
  quiz: "Quiz",
  checkpoint: "Checkpoint",
};

const DIFFICULTY_LABELS: Record<LearningPath["difficulty"], string> = {
  beginner: "Anfänger",
  intermediate: "Fortgeschritten",
  advanced: "Experte",
};

function createEmptyStep(order: number): LearningStep {
  return {
    id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    title: "",
    description: "",
    type: "info",
    order,
    completed: false,
    hints: [],
    validationRules: [],
  };
}

function createEmptyHint(level: 1 | 2 | 3): Hint {
  return {
    id: `hint-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    level,
    text: "",
    pointsDeduction: level * 5,
  };
}

function createEmptyRule(): ValidationRule {
  return {
    id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    type: "shape-exists",
    description: "",
    points: 10,
  };
}

export function LearningPathEditor({
  path,
  onSave,
  onClose,
  theme,
  subject,
}: LearningPathEditorProps) {
  const [editPath, setEditPath] = useState<LearningPath>(
    path || {
      id: `path-${Date.now()}`,
      title: "",
      description: "",
      subject,
      steps: [createEmptyStep(0)],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      difficulty: "beginner",
      estimatedMinutes: 15,
      tags: [],
    },
  );

  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [showStepDetails, setShowStepDetails] = useState(true);
  const [tagInput, setTagInput] = useState("");

  const isDark = theme === "dark";
  const bg = isDark ? "bg-slate-900" : "bg-white";
  const border = isDark ? "border-slate-700" : "border-slate-200";
  const text = isDark ? "text-white" : "text-slate-900";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const inputBg = isDark ? "bg-slate-800" : "bg-slate-50";
  const cardBg = isDark ? "bg-slate-800/50" : "bg-slate-50";

  const activeStep = editPath.steps[activeStepIndex];

  const updateStep = useCallback(
    (index: number, updates: Partial<LearningStep>) => {
      setEditPath((prev) => ({
        ...prev,
        steps: prev.steps.map((s, i) =>
          i === index ? { ...s, ...updates } : s,
        ),
        updatedAt: Date.now(),
      }));
    },
    [],
  );

  const addStep = useCallback(() => {
    setEditPath((prev) => {
      const newStep = createEmptyStep(prev.steps.length);
      return {
        ...prev,
        steps: [...prev.steps, newStep],
        updatedAt: Date.now(),
      };
    });
    setActiveStepIndex(editPath.steps.length);
  }, [editPath.steps.length]);

  const removeStep = useCallback(
    (index: number) => {
      if (editPath.steps.length <= 1) return;
      setEditPath((prev) => ({
        ...prev,
        steps: prev.steps
          .filter((_, i) => i !== index)
          .map((s, i) => ({ ...s, order: i })),
        updatedAt: Date.now(),
      }));
      if (activeStepIndex >= editPath.steps.length - 1) {
        setActiveStepIndex(Math.max(0, editPath.steps.length - 2));
      }
    },
    [editPath.steps.length, activeStepIndex],
  );

  const moveStep = useCallback(
    (index: number, direction: "up" | "down") => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= editPath.steps.length) return;
      setEditPath((prev) => {
        const newSteps = [...prev.steps];
        [newSteps[index], newSteps[targetIndex]] = [
          newSteps[targetIndex],
          newSteps[index],
        ];
        return {
          ...prev,
          steps: newSteps.map((s, i) => ({ ...s, order: i })),
          updatedAt: Date.now(),
        };
      });
      setActiveStepIndex(targetIndex);
    },
    [editPath.steps.length],
  );

  const addHint = useCallback(() => {
    if (!activeStep) return;
    const maxLevel = Math.max(0, ...activeStep.hints.map((h) => h.level));
    const newLevel = Math.min(3, maxLevel + 1) as 1 | 2 | 3;
    updateStep(activeStepIndex, {
      hints: [...activeStep.hints, createEmptyHint(newLevel)],
    });
  }, [activeStep, activeStepIndex, updateStep]);

  const removeHint = useCallback(
    (hintId: string) => {
      if (!activeStep) return;
      updateStep(activeStepIndex, {
        hints: activeStep.hints.filter((h) => h.id !== hintId),
      });
    },
    [activeStep, activeStepIndex, updateStep],
  );

  const addValidationRule = useCallback(() => {
    if (!activeStep) return;
    updateStep(activeStepIndex, {
      validationRules: [
        ...(activeStep.validationRules || []),
        createEmptyRule(),
      ],
    });
  }, [activeStep, activeStepIndex, updateStep]);

  const removeValidationRule = useCallback(
    (ruleId: string) => {
      if (!activeStep) return;
      updateStep(activeStepIndex, {
        validationRules: (activeStep.validationRules || []).filter(
          (r) => r.id !== ruleId,
        ),
      });
    },
    [activeStep, activeStepIndex, updateStep],
  );

  const addTag = useCallback(() => {
    const tag = tagInput.trim();
    if (!tag || editPath.tags.includes(tag)) return;
    setEditPath((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
    setTagInput("");
  }, [tagInput, editPath.tags]);

  const removeTag = useCallback((tag: string) => {
    setEditPath((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  }, []);

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleSave = useCallback(() => {
    const errors: string[] = [];
    if (!editPath.title.trim()) errors.push("Titel fehlt");
    if (editPath.steps.length === 0)
      errors.push("Mindestens ein Schritt nötig");
    editPath.steps.forEach((step, i) => {
      if (!step.title.trim()) errors.push(`Schritt ${i + 1}: Titel fehlt`);
    });
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);
    gamificationBus.emit({
      id: `topic-${editPath.id}-${Date.now()}`,
      type: 'topic_completed',
      timestamp: Date.now(),
      payload: {
        topicId: editPath.id,
        moduleId: 'learning-path',
        estimatedMinutes: editPath.estimatedMinutes ?? 0,
      },
    });
    onSave({ ...editPath, updatedAt: Date.now() });
  }, [editPath, onSave]);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Editor Panel */}
      <div
        className={`relative ml-auto w-[900px] max-w-[95vw] h-full ${bg} ${border} border-l flex flex-col shadow-2xl`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${border}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <BookOpen size={20} className="text-indigo-400" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${text}`}>Lernpfad-Editor</h2>
              <p className={`text-xs ${textMuted}`}>
                {path ? "Lernpfad bearbeiten" : "Neuen Lernpfad erstellen"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {validationErrors.length > 0 && (
              <span
                className="text-xs text-red-400 max-w-[200px] truncate"
                title={validationErrors.join(", ")}
              >
                {validationErrors[0]}
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={!editPath.title.trim()}
              className="px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Speichern
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg hover:bg-slate-700/50 ${textMuted}`}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left: Step List */}
          <div className={`w-64 border-r ${border} flex flex-col`}>
            <div className={`px-4 py-3 border-b ${border}`}>
              <h3 className={`text-sm font-semibold ${text}`}>Schritte</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {editPath.steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => {
                    setActiveStepIndex(index);
                    setShowStepDetails(true);
                  }}
                  className={`w-full text-left p-3 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                    index === activeStepIndex
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      : `${cardBg} ${textMuted} hover:bg-slate-700/30`
                  }`}
                >
                  <span className="shrink-0 w-6 h-6 rounded-full bg-slate-700/50 flex items-center justify-center text-xs">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      {STEP_TYPE_ICONS[step.type]}
                      <span className="truncate text-xs font-medium">
                        {step.title || `Schritt ${index + 1}`}
                      </span>
                    </div>
                    <span className={`text-xs ${textMuted}`}>
                      {STEP_TYPE_LABELS[step.type]}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <div className={`p-2 border-t ${border}`}>
              <button
                onClick={addStep}
                className={`w-full flex items-center justify-center gap-2 p-2 rounded-lg text-sm ${textMuted} hover:bg-slate-700/30 transition-colors`}
              >
                <Plus size={16} /> Schritt hinzufügen
              </button>
            </div>
          </div>

          {/* Right: Details */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {!showStepDetails ? (
              /* Path Meta */
              <PathMetaEditor
                editPath={editPath}
                setEditPath={setEditPath}
                tagInput={tagInput}
                setTagInput={setTagInput}
                addTag={addTag}
                removeTag={removeTag}
                isDark={isDark}
                text={text}
                textMuted={textMuted}
                inputBg={inputBg}
                cardBg={cardBg}
                border={border}
              />
            ) : activeStep ? (
              /* Step Editor */
              <StepEditor
                step={activeStep}
                stepIndex={activeStepIndex}
                totalSteps={editPath.steps.length}
                updateStep={(updates) => updateStep(activeStepIndex, updates)}
                onMoveUp={() => moveStep(activeStepIndex, "up")}
                onMoveDown={() => moveStep(activeStepIndex, "down")}
                onRemove={() => removeStep(activeStepIndex)}
                onAddHint={addHint}
                onRemoveHint={removeHint}
                onAddRule={addValidationRule}
                onRemoveRule={removeValidationRule}
                isDark={isDark}
                text={text}
                textMuted={textMuted}
                inputBg={inputBg}
                cardBg={cardBg}
                border={border}
              />
            ) : null}

            {/* Toggle between Path Meta and Step Details */}
            <div className="flex justify-center">
              <button
                onClick={() => setShowStepDetails(!showStepDetails)}
                className={`text-xs ${textMuted} hover:text-indigo-400 transition-colors`}
              >
                {showStepDetails
                  ? "← Pfad-Einstellungen anzeigen"
                  : "→ Schritt-Details anzeigen"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-component: Path Meta Editor
function PathMetaEditor({
  editPath,
  setEditPath,
  tagInput,
  setTagInput,
  addTag,
  removeTag,
  isDark,
  text,
  textMuted,
  inputBg,
  cardBg,
  border,
}: {
  editPath: LearningPath;
  setEditPath: React.Dispatch<React.SetStateAction<LearningPath>>;
  tagInput: string;
  setTagInput: (v: string) => void;
  addTag: () => void;
  removeTag: (tag: string) => void;
  isDark: boolean;
  text: string;
  textMuted: string;
  inputBg: string;
  cardBg: string;
  border: string;
}) {
  return (
    <>
      <div>
        <label className={`block text-sm font-medium ${text} mb-1`}>
          Titel
        </label>
        <input
          type="text"
          value={editPath.title}
          onChange={(e) =>
            setEditPath((p) => ({ ...p, title: e.target.value }))
          }
          placeholder="z.B. Netzwerk-Grundlagen Lab"
          className={`w-full px-3 py-2 rounded-lg ${inputBg} ${text} border ${border} text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
        />
      </div>

      <div>
        <label className={`block text-sm font-medium ${text} mb-1`}>
          Beschreibung
        </label>
        <textarea
          value={editPath.description}
          onChange={(e) =>
            setEditPath((p) => ({ ...p, description: e.target.value }))
          }
          placeholder="Was lernt der Teilnehmer in diesem Pfad?"
          rows={3}
          className={`w-full px-3 py-2 rounded-lg ${inputBg} ${text} border ${border} text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none`}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium ${text} mb-1`}>
            Schwierigkeit
          </label>
          <select
            value={editPath.difficulty}
            onChange={(e) =>
              setEditPath((p) => ({
                ...p,
                difficulty: e.target.value as LearningPath["difficulty"],
              }))
            }
            className={`w-full px-3 py-2 rounded-lg ${inputBg} ${text} border ${border} text-sm`}
          >
            {(
              Object.entries(DIFFICULTY_LABELS) as [
                LearningPath["difficulty"],
                string,
              ][]
            ).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={`block text-sm font-medium ${text} mb-1`}>
            Geschätzte Dauer (Min)
          </label>
          <input
            type="number"
            min={1}
            value={editPath.estimatedMinutes}
            onChange={(e) =>
              setEditPath((p) => ({
                ...p,
                estimatedMinutes: Math.max(1, parseInt(e.target.value) || 1),
              }))
            }
            className={`w-full px-3 py-2 rounded-lg ${inputBg} ${text} border ${border} text-sm`}
          />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className={`block text-sm font-medium ${text} mb-1`}>Tags</label>
        <div className="flex gap-2 mb-2 flex-wrap">
          {editPath.tags.map((tag) => (
            <span
              key={tag}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${cardBg} ${textMuted}`}
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="hover:text-red-400"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), addTag())
            }
            placeholder="Tag hinzufügen..."
            className={`flex-1 px-3 py-2 rounded-lg ${inputBg} ${text} border ${border} text-sm`}
          />
          <button
            onClick={addTag}
            className="px-3 py-2 rounded-lg bg-indigo-500/20 text-indigo-300 text-sm hover:bg-indigo-500/30"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </>
  );
}

// Sub-component: Step Editor
function StepEditor({
  step,
  stepIndex,
  totalSteps,
  updateStep,
  onMoveUp,
  onMoveDown,
  onRemove,
  onAddHint,
  onRemoveHint,
  onAddRule,
  onRemoveRule,
  isDark,
  text,
  textMuted,
  inputBg,
  cardBg,
  border,
}: {
  step: LearningStep;
  stepIndex: number;
  totalSteps: number;
  updateStep: (updates: Partial<LearningStep>) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onAddHint: () => void;
  onRemoveHint: (id: string) => void;
  onAddRule: () => void;
  onRemoveRule: (id: string) => void;
  isDark: boolean;
  text: string;
  textMuted: string;
  inputBg: string;
  cardBg: string;
  border: string;
}) {
  return (
    <>
      {/* Step Header */}
      <div className="flex items-center justify-between">
        <h3 className={`text-sm font-semibold ${text}`}>
          Schritt {stepIndex + 1} von {totalSteps}
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={onMoveUp}
            disabled={stepIndex === 0}
            className={`p-1.5 rounded ${textMuted} hover:bg-slate-700/30 disabled:opacity-30`}
          >
            <ArrowUp size={16} />
          </button>
          <button
            onClick={onMoveDown}
            disabled={stepIndex === totalSteps - 1}
            className={`p-1.5 rounded ${textMuted} hover:bg-slate-700/30 disabled:opacity-30`}
          >
            <ArrowDown size={16} />
          </button>
          <button
            onClick={onRemove}
            disabled={totalSteps <= 1}
            className="p-1.5 rounded text-red-400 hover:bg-red-500/10 disabled:opacity-30"
          >
            <Trash size={16} />
          </button>
        </div>
      </div>

      {/* Step Type */}
      <div className="grid grid-cols-4 gap-2">
        {(
          Object.entries(STEP_TYPE_LABELS) as [LearningStep["type"], string][]
        ).map(([type, label]) => (
          <button
            key={type}
            onClick={() => updateStep({ type })}
            className={`flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-medium transition-colors ${
              step.type === type
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                : `${cardBg} ${textMuted} hover:bg-slate-700/30`
            }`}
          >
            {STEP_TYPE_ICONS[type]}
            {label}
          </button>
        ))}
      </div>

      {/* Step Title & Description */}
      <div>
        <label className={`block text-sm font-medium ${text} mb-1`}>
          Titel
        </label>
        <input
          type="text"
          value={step.title}
          onChange={(e) => updateStep({ title: e.target.value })}
          placeholder="z.B. Router konfigurieren"
          className={`w-full px-3 py-2 rounded-lg ${inputBg} ${text} border ${border} text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
        />
      </div>

      <div>
        <label className={`block text-sm font-medium ${text} mb-1`}>
          Beschreibung / Anweisung
        </label>
        <textarea
          value={step.description}
          onChange={(e) => updateStep({ description: e.target.value })}
          placeholder="Beschreibe was der Teilnehmer in diesem Schritt tun soll..."
          rows={4}
          className={`w-full px-3 py-2 rounded-lg ${inputBg} ${text} border ${border} text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none`}
        />
      </div>

      {/* Hints Section */}
      <div className={`p-4 rounded-xl ${cardBg} border ${border}`}>
        <div className="flex items-center justify-between mb-3">
          <h4
            className={`text-sm font-semibold ${text} flex items-center gap-2`}
          >
            <Lightning size={16} className="text-amber-400" />
            Hinweise ({step.hints.length})
          </h4>
          <button
            onClick={onAddHint}
            disabled={step.hints.length >= 3}
            className={`text-xs ${textMuted} hover:text-indigo-400 disabled:opacity-30`}
          >
            <Plus size={14} /> Hinzufügen
          </button>
        </div>
        {step.hints.length === 0 ? (
          <p className={`text-xs ${textMuted}`}>
            Keine Hinweise. Füge bis zu 3 Hinweise hinzu.
          </p>
        ) : (
          <div className="space-y-2">
            {step.hints.map((hint) => (
              <div
                key={hint.id}
                className={`flex items-start gap-2 p-2 rounded-lg ${inputBg}`}
              >
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {hint.level}
                </span>
                <input
                  type="text"
                  value={hint.text}
                  onChange={(e) => {
                    const newHints = step.hints.map((h) =>
                      h.id === hint.id ? { ...h, text: e.target.value } : h,
                    );
                    updateStep({ hints: newHints });
                  }}
                  placeholder={`Hinweis Level ${hint.level}...`}
                  className={`flex-1 bg-transparent ${text} text-sm focus:outline-none`}
                />
                <span className={`text-xs ${textMuted} shrink-0`}>
                  -{hint.pointsDeduction}P
                </span>
                <button
                  onClick={() => onRemoveHint(hint.id)}
                  className="text-red-400 hover:text-red-300 shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Validation Rules Section (only for task/checkpoint steps) */}
      {(step.type === "task" || step.type === "checkpoint") && (
        <div className={`p-4 rounded-xl ${cardBg} border ${border}`}>
          <div className="flex items-center justify-between mb-3">
            <h4
              className={`text-sm font-semibold ${text} flex items-center gap-2`}
            >
              <CheckCircle size={16} className="text-green-400" />
              Validierungsregeln ({(step.validationRules || []).length})
            </h4>
            <button
              onClick={onAddRule}
              className={`text-xs ${textMuted} hover:text-indigo-400`}
            >
              <Plus size={14} /> Regel hinzufügen
            </button>
          </div>
          {(step.validationRules || []).length === 0 ? (
            <p className={`text-xs ${textMuted}`}>
              Keine Validierungsregeln. Definiere Regeln um den Fortschritt zu
              prüfen.
            </p>
          ) : (
            <div className="space-y-3">
              {(step.validationRules || []).map((rule) => (
                <div
                  key={rule.id}
                  className={`p-3 rounded-lg ${inputBg} space-y-2`}
                >
                  <div className="flex items-center gap-2">
                    <select
                      value={rule.type}
                      onChange={(e) => {
                        const newRules = (step.validationRules || []).map(
                          (r) =>
                            r.id === rule.id
                              ? {
                                  ...r,
                                  type: e.target
                                    .value as ValidationRule["type"],
                                }
                              : r,
                        );
                        updateStep({ validationRules: newRules });
                      }}
                      className={`px-2 py-1 rounded text-xs ${inputBg} ${text} border ${border}`}
                    >
                      <option value="shape-exists">Shape vorhanden</option>
                      <option value="shape-configured">
                        Shape konfiguriert
                      </option>
                      <option value="connection-exists">
                        Verbindung vorhanden
                      </option>
                      <option value="status-check">Status prüfen</option>
                    </select>
                    <input
                      type="text"
                      value={rule.description}
                      onChange={(e) => {
                        const newRules = (step.validationRules || []).map(
                          (r) =>
                            r.id === rule.id
                              ? { ...r, description: e.target.value }
                              : r,
                        );
                        updateStep({ validationRules: newRules });
                      }}
                      placeholder="Regelbeschreibung..."
                      className={`flex-1 bg-transparent ${text} text-xs focus:outline-none`}
                    />
                    <input
                      type="number"
                      value={rule.points}
                      onChange={(e) => {
                        const newRules = (step.validationRules || []).map(
                          (r) =>
                            r.id === rule.id
                              ? { ...r, points: parseInt(e.target.value) || 0 }
                              : r,
                        );
                        updateStep({ validationRules: newRules });
                      }}
                      className={`w-16 px-2 py-1 rounded text-xs ${inputBg} ${text} border ${border} text-center`}
                      min={0}
                    />
                    <span className={`text-xs ${textMuted}`}>Pkt</span>
                    <button
                      onClick={() => onRemoveRule(rule.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  {/* Rule-type specific fields */}
                  {(rule.type === "shape-exists" ||
                    rule.type === "shape-configured") && (
                    <input
                      type="text"
                      value={rule.shapeType || ""}
                      onChange={(e) => {
                        const newRules = (step.validationRules || []).map(
                          (r) =>
                            r.id === rule.id
                              ? { ...r, shapeType: e.target.value }
                              : r,
                        );
                        updateStep({ validationRules: newRules });
                      }}
                      placeholder="Shape-Typ (z.B. router, switch, server)"
                      className={`w-full bg-transparent ${text} text-xs focus:outline-none border-b ${border} pb-1`}
                    />
                  )}
                  {rule.type === "connection-exists" && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={rule.sourceShapeLabel || ""}
                        onChange={(e) => {
                          const newRules = (step.validationRules || []).map(
                            (r) =>
                              r.id === rule.id
                                ? { ...r, sourceShapeLabel: e.target.value }
                                : r,
                          );
                          updateStep({ validationRules: newRules });
                        }}
                        placeholder="Von Shape..."
                        className={`flex-1 bg-transparent ${text} text-xs focus:outline-none border-b ${border} pb-1`}
                      />
                      <span className={`text-xs ${textMuted}`}>→</span>
                      <input
                        type="text"
                        value={rule.targetShapeLabel || ""}
                        onChange={(e) => {
                          const newRules = (step.validationRules || []).map(
                            (r) =>
                              r.id === rule.id
                                ? { ...r, targetShapeLabel: e.target.value }
                                : r,
                          );
                          updateStep({ validationRules: newRules });
                        }}
                        placeholder="Zu Shape..."
                        className={`flex-1 bg-transparent ${text} text-xs focus:outline-none border-b ${border} pb-1`}
                      />
                    </div>
                  )}
                  {rule.type === "status-check" && (
                    <select
                      value={rule.expectedStatus || "running"}
                      onChange={(e) => {
                        const newRules = (step.validationRules || []).map(
                          (r) =>
                            r.id === rule.id
                              ? { ...r, expectedStatus: e.target.value }
                              : r,
                        );
                        updateStep({ validationRules: newRules });
                      }}
                      className={`px-2 py-1 rounded text-xs ${inputBg} ${text} border ${border}`}
                    >
                      <option value="running">Running</option>
                      <option value="stopped">Stopped</option>
                      <option value="error">Error</option>
                      <option value="pending">Pending</option>
                    </select>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
