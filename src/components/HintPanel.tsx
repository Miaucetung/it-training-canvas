import { Hint } from "@/lib/types";
import { Eye, EyeSlash, Lightning, Warning, X } from "@phosphor-icons/react";
import { useCallback, useState } from "react";

interface HintPanelProps {
  hints: Hint[];
  usedHintIds: string[];
  onUseHint: (hintId: string) => void;
  onClose: () => void;
  theme: "light" | "dark";
}

export function HintPanel({
  hints,
  usedHintIds,
  onUseHint,
  onClose,
  theme,
}: HintPanelProps) {
  const isDark = theme === "dark";
  const bg = isDark ? "bg-slate-900" : "bg-white";
  const border = isDark ? "border-slate-700" : "border-slate-200";
  const text = isDark ? "text-white" : "text-slate-900";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const cardBg = isDark ? "bg-slate-800/50" : "bg-slate-50";

  const [confirmHintId, setConfirmHintId] = useState<string | null>(null);

  const handleRevealHint = useCallback(
    (hintId: string) => {
      if (confirmHintId === hintId) {
        onUseHint(hintId);
        setConfirmHintId(null);
      } else {
        setConfirmHintId(hintId);
      }
    },
    [confirmHintId, onUseHint],
  );

  const sortedHints = [...hints].sort((a, b) => a.level - b.level);
  const totalDeduction = sortedHints
    .filter((h) => usedHintIds.includes(h.id))
    .reduce((sum, h) => sum + h.pointsDeduction, 0);

  const LEVEL_COLORS = {
    1: {
      bg: "bg-green-500/10",
      border: "border-green-500/30",
      text: "text-green-400",
      label: "Leichter Hinweis",
    },
    2: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      text: "text-amber-400",
      label: "Mittlerer Hinweis",
    },
    3: {
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      text: "text-red-400",
      label: "Starker Hinweis",
    },
  };

  if (hints.length === 0) {
    return (
      <div className={`rounded-xl ${cardBg} border ${border} p-4`}>
        <div className="flex items-center gap-2 mb-2">
          <Lightning size={16} className="text-amber-400" />
          <span className={`text-sm font-medium ${text}`}>Hinweise</span>
        </div>
        <p className={`text-xs ${textMuted}`}>
          Keine Hinweise für diesen Schritt verfügbar.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl ${bg} border ${border} shadow-lg overflow-hidden`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-3 border-b ${border}`}
      >
        <div className="flex items-center gap-2">
          <Lightning size={18} className="text-amber-400" weight="fill" />
          <span className={`text-sm font-semibold ${text}`}>Hinweise</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${cardBg} ${textMuted}`}
          >
            {usedHintIds.length}/{hints.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {totalDeduction > 0 && (
            <span className="text-xs text-red-400">-{totalDeduction} Pkt</span>
          )}
          <button
            onClick={onClose}
            className={`p-1 rounded ${textMuted} hover:bg-slate-700/30`}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Hints */}
      <div className="p-3 space-y-2">
        {sortedHints.map((hint) => {
          const isUsed = usedHintIds.includes(hint.id);
          const isConfirming = confirmHintId === hint.id;
          const levelStyle = LEVEL_COLORS[hint.level];
          const prevLevelUsed =
            hint.level === 1 ||
            sortedHints.some(
              (h) => h.level < hint.level && usedHintIds.includes(h.id),
            );

          return (
            <div
              key={hint.id}
              className={`rounded-lg border p-3 transition-all ${
                isUsed
                  ? `${levelStyle.bg} ${levelStyle.border}`
                  : `${cardBg} ${border}`
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Level indicator */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isUsed
                      ? levelStyle.bg
                      : isDark
                        ? "bg-slate-700"
                        : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`text-sm font-bold ${isUsed ? levelStyle.text : textMuted}`}
                  >
                    {hint.level}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-medium ${isUsed ? levelStyle.text : textMuted}`}
                    >
                      {levelStyle.label}
                    </span>
                    <span className={`text-xs ${textMuted}`}>
                      -{hint.pointsDeduction} Pkt
                    </span>
                  </div>

                  {isUsed ? (
                    <p className={`text-sm ${text}`}>{hint.text}</p>
                  ) : (
                    <div>
                      {isConfirming ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-xs text-amber-400">
                            <Warning size={14} />
                            <span>
                              Hinweis aufdecken? ({hint.pointsDeduction} Punkte
                              Abzug)
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRevealHint(hint.id)}
                              className="px-3 py-1 rounded text-xs bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors"
                            >
                              Aufdecken
                            </button>
                            <button
                              onClick={() => setConfirmHintId(null)}
                              className={`px-3 py-1 rounded text-xs ${textMuted} hover:bg-slate-700/30 transition-colors`}
                            >
                              Abbrechen
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRevealHint(hint.id)}
                          disabled={!prevLevelUsed}
                          className={`flex items-center gap-1.5 text-xs ${
                            prevLevelUsed
                              ? `${textMuted} hover:text-amber-400`
                              : "text-slate-600 cursor-not-allowed"
                          } transition-colors`}
                        >
                          {prevLevelUsed ? (
                            <Eye size={14} />
                          ) : (
                            <EyeSlash size={14} />
                          )}
                          {prevLevelUsed
                            ? "Hinweis aufdecken"
                            : "Vorherigen Hinweis zuerst nutzen"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
