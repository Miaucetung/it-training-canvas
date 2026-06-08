// ============================================================
// ExamPrepDialog — CCNA 200-301 Prüfungsvorbereitung
// ------------------------------------------------------------
// 3 Modi:
//   1) Lernmodus   — Frage für Frage, sofortiges Feedback + Erklärung
//   2) Prüfungsmodus — Timer 120 min, 100 Zufallsfragen, Ergebnis am Ende
//   3) Schwächen-Drill — Wiederholt falsch beantwortete Fragen
//
// Daten: /exam-questions.json (1212 Fragen aus CCNA 200-301 PDF)
// Bilder: /exam-images/<Q####-N.png> (optional, graceful fallback)
// ============================================================

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle,
  Clock,
  DotsSixVertical,
  Eye,
  FireSimple,
  Gauge,
  ListChecks,
  Shuffle,
  Target,
  Warning,
  X,
  XCircle,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";

// ─── Types ───────────────────────────────────────────────────
interface ExamOption {
  letter: string;
  text: string;
}

interface ExamQuestion {
  id: string;
  category: string;
  type: "single" | "multi-select" | "drag-drop";
  expectedAnswerCount: number;
  text: string;
  options: ExamOption[];
  correctAnswer: string[] | null;
  exhibitImages: string[];
  needsExhibit: boolean;
  sourcePage: number;
  needsReview: boolean;
  // Drag-drop specific (from OCR extraction)
  dragItems?: string[];
  dropTargets?: string[];
  correctMapping?: string[];  // correctMapping[i] = correct item for dropTargets[i]
  questionStateImage?: string | null;  // before answering
  answerStateImage?: string | null;    // after answering (correct answer shown)
}

interface SessionResult {
  questionId: string;
  correct: boolean;
  userAnswer: string[];
  correctAnswer: string[];
}

type Mode = "menu" | "learn" | "exam" | "drill" | "results";
type Category = "all" | string;

interface Props {
  dark: boolean;
  onClose: () => void;
}

// ─── Constants ───────────────────────────────────────────────
const EXAM_TIME_SECONDS = 120 * 60; // 120 Minuten
const EXAM_QUESTIONS_COUNT = 100;
const PASS_THRESHOLD = 0.825; // 825/1000 Cisco Grenze
const STORAGE_KEY = "ccna-exam-weak-questions";

// ─── Helpers ─────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function answersEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

function loadWeakIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set();
}

function saveWeakIds(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

// ── Drag-drop helpers ────────────────────────────────────────
/** Loose match: does the user's choice approximate the correct answer? */
function fuzzyMatch(userText: string, correctText: string): boolean {
  const u = userText.toLowerCase().replace(/[^a-z0-9]/g, " ").trim();
  const c = correctText.toLowerCase().replace(/[^a-z0-9]/g, " ").trim();
  if (!u || !c) return false;
  // exact
  if (u === c) return true;
  // containment (at least 10 chars match)
  const minLen = 10;
  const short = u.length < c.length ? u : c;
  const long = u.length < c.length ? c : u;
  if (short.length >= minLen && long.includes(short)) return true;
  // word-overlap >= 60%
  const uWords = u.split(/\s+/).filter((w) => w.length > 2);
  const cWords = c.split(/\s+/).filter((w) => w.length > 2);
  if (uWords.length === 0 || cWords.length === 0) return false;
  const overlap = uWords.filter((w) => cWords.includes(w)).length;
  return overlap / Math.max(uWords.length, cWords.length) >= 0.6;
}

/** Score a drag-drop submission: returns fraction of correct slot assignments */
function scoreDragDrop(
  userSlots: (string | null)[],
  correctMapping: string[],
): number {
  let correct = 0;
  const total = correctMapping.filter((m) => m).length;
  if (total === 0) return 0;
  correctMapping.forEach((expected, i) => {
    const placed = userSlots[i];
    if (expected && placed && fuzzyMatch(placed, expected)) correct++;
  });
  return total > 0 ? correct / total : 0;
}

// ─── Sub-components ──────────────────────────────────────────
function ExhibitImage({ src, dark }: { src: string; dark: boolean }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        className={`flex items-center justify-center gap-2 rounded-lg border border-dashed p-4 text-sm ${
          dark ? "border-zinc-600 text-zinc-500" : "border-zinc-300 text-zinc-400"
        }`}
      >
        <Warning size={18} />
        <span>Exhibit-Bild nicht verfügbar — kopiere exam-images nach public/exam-images/</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt="Exhibit"
      className="max-w-full rounded-lg border border-zinc-300 dark:border-zinc-600"
      onError={() => setFailed(true)}
    />
  );
}

function CategoryBadge({ category, dark }: { category: string; dark: boolean }) {
  const colors: Record<string, string> = {
    Routing: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
    "Switching/VLAN": "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
    Wireless: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300",
    OSPF: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
    "Network Fundamentals":
      "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
    "IPv4/Subnetting": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300",
    IPv6: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300",
    Security: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
    "NAT/DHCP": "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300",
    "Automation/SDN": "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/50 dark:text-fuchsia-300",
    Architecture: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
    General: "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300",
  };
  const cls = colors[category] ?? colors["General"];
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{category}</span>;
}

// ─── Drag-Drop Card ──────────────────────────────────────────
interface DragDropCardProps {
  question: ExamQuestion;
  userSlots: (string | null)[];
  onUpdateSlots: (slots: (string | null)[]) => void;
  revealed: boolean;
  dark: boolean;
}

function DragDropCard({ question, userSlots, onUpdateSlots, revealed, dark }: DragDropCardProps) {
  const base = dark
    ? "bg-zinc-800 border-zinc-700 text-zinc-200"
    : "bg-white border-zinc-200 text-zinc-800";

  const items = question.dragItems ?? [];
  const targets = question.dropTargets ?? [];
  const correctMapping = question.correctMapping ?? [];
  const hasInteractive = items.length >= 2 && targets.length >= 1;

  // draggedItem: text of currently dragged item
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  // Items still in the pool (not placed in any slot)
  const placedItems = new Set(userSlots.filter(Boolean) as string[]);
  const poolItems = items.filter((item) => !placedItems.has(item));

  function handleDragStart(item: string) {
    setDraggedItem(item);
  }

  function handleDropOnSlot(slotIdx: number) {
    if (!draggedItem || revealed) return;
    const next = [...userSlots];
    // If this item was already placed somewhere else, remove it
    const prevIdx = next.indexOf(draggedItem);
    if (prevIdx !== -1) next[prevIdx] = null;
    next[slotIdx] = draggedItem;
    onUpdateSlots(next);
    setDraggedItem(null);
  }

  function handleDropOnPool() {
    if (!draggedItem || revealed) return;
    const next = [...userSlots];
    const prevIdx = next.indexOf(draggedItem);
    if (prevIdx !== -1) next[prevIdx] = null;
    onUpdateSlots(next);
    setDraggedItem(null);
  }

  function handleRemoveFromSlot(slotIdx: number) {
    if (revealed) return;
    const next = [...userSlots];
    next[slotIdx] = null;
    onUpdateSlots(next);
  }

  const score = revealed ? scoreDragDrop(userSlots, correctMapping) : null;

  if (!hasInteractive) {
    // Image-only fallback: show question-state + toggle answer image
    return (
      <div className={`rounded-xl border p-4 shadow-sm ${base}`}>
        <p className="mb-3 text-sm font-medium text-fuchsia-500">Drag &amp; Drop</p>
        {question.questionStateImage && (
          <div className="mb-3">
            <p className={`mb-1 text-xs ${dark ? "text-zinc-500" : "text-zinc-400"}`}>Aufgabe:</p>
            <ExhibitImage
              src={`/exam-images/${question.questionStateImage}`}
              dark={dark}
            />
          </div>
        )}
        {(question.exhibitImages ?? []).filter((img) =>
          img !== question.questionStateImage && img !== question.answerStateImage
        ).map((img) => (
          <ExhibitImage key={img} src={`/exam-images/${img}`} dark={dark} />
        ))}
        {(question.answerStateImage || revealed) && (
          <>
            <button
              onClick={() => setShowAnswer((v) => !v)}
              className={`mt-3 flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs ${
                dark ? "border-zinc-600 text-zinc-400 hover:bg-zinc-700" : "border-zinc-300 text-zinc-500 hover:bg-zinc-100"
              }`}
            >
              <Eye size={14} />
              {showAnswer ? "Antwort verbergen" : "Antwort anzeigen"}
            </button>
            {showAnswer && question.answerStateImage && (
              <div className="mt-3">
                <p className={`mb-1 text-xs ${dark ? "text-zinc-500" : "text-zinc-400"}`}>Korrekte Antwort:</p>
                <ExhibitImage
                  src={`/exam-images/${question.answerStateImage}`}
                  dark={dark}
                />
              </div>
            )}
          </>
        )}
        {!question.questionStateImage && !question.answerStateImage && (
          <div className={`rounded-lg border border-dashed p-4 text-sm ${
            dark ? "border-zinc-600 text-zinc-500" : "border-zinc-300 text-zinc-400"
          }`}>
            Drag &amp; Drop — Antwort im PDF-Exhibit sichtbar (Seite {question.sourcePage}).
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-xl border p-4 shadow-sm ${base}`}>
      <p className="mb-2 text-sm font-medium text-fuchsia-500">Drag &amp; Drop</p>

      {/* Question exhibit image if present */}
      {question.questionStateImage && !revealed && (
        <div className="mb-3">
          <ExhibitImage src={`/exam-images/${question.questionStateImage}`} dark={dark} />
        </div>
      )}

      {revealed && question.answerStateImage && (
        <div className="mb-3">
          <p className={`mb-1 text-xs font-medium ${dark ? "text-zinc-400" : "text-zinc-500"}`}>Korrekte Lösung:</p>
          <ExhibitImage src={`/exam-images/${question.answerStateImage}`} dark={dark} />
        </div>
      )}

      <div className="flex gap-3">
        {/* Left: drag source pool */}
        <div className="w-2/5">
          <p className={`mb-2 text-xs font-semibold uppercase tracking-wide ${
            dark ? "text-zinc-500" : "text-zinc-400"
          }`}>Items</p>
          <div
            className={`min-h-20 rounded-lg border border-dashed p-2 ${
              dark ? "border-zinc-600" : "border-zinc-300"
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDropOnPool}
          >
            {poolItems.map((item) => (
              <div
                key={item}
                draggable={!revealed}
                onDragStart={() => handleDragStart(item)}
                className={`mb-1.5 flex cursor-grab items-center gap-1.5 rounded-md border px-2 py-1.5 text-xs active:cursor-grabbing ${
                  revealed
                    ? dark ? "border-zinc-600 bg-zinc-700 opacity-60" : "border-zinc-200 bg-zinc-100 opacity-60"
                    : dark
                    ? "border-zinc-500 bg-zinc-700 hover:border-zinc-300"
                    : "border-zinc-200 bg-white hover:border-zinc-400"
                }`}
              >
                <DotsSixVertical size={12} className="shrink-0 opacity-40" />
                <span className="leading-tight">{item}</span>
              </div>
            ))}
            {poolItems.length === 0 && !revealed && (
              <p className={`text-center text-xs ${
                dark ? "text-zinc-600" : "text-zinc-400"
              }`}>Alle Items platziert</p>
            )}
          </div>
        </div>

        {/* Right: drop targets */}
        <div className="w-3/5">
          <p className={`mb-2 text-xs font-semibold uppercase tracking-wide ${
            dark ? "text-zinc-500" : "text-zinc-400"
          }`}>Ziele</p>
          <div className="flex flex-col gap-2">
            {targets.map((target, i) => {
              const placed = userSlots[i] ?? null;
              const expectedItem = correctMapping[i] ?? null;
              const isCorrect = revealed && placed !== null && expectedItem !== null && fuzzyMatch(placed, expectedItem);
              const isWrong = revealed && placed !== null && expectedItem !== null && !fuzzyMatch(placed, expectedItem);
              const isMissed = revealed && placed === null && expectedItem !== null;

              return (
                <div key={i} className="flex items-stretch gap-2">
                  {/* Target description */}
                  <div className={`flex-1 rounded-lg border px-2 py-1.5 text-xs leading-tight ${
                    dark ? "border-zinc-600 bg-zinc-700/50 text-zinc-300" : "border-zinc-200 bg-zinc-50 text-zinc-600"
                  }`}>
                    {target}
                  </div>
                  {/* Drop slot */}
                  <div
                    onDragOver={(e) => { if (!revealed) e.preventDefault(); }}
                    onDrop={() => handleDropOnSlot(i)}
                    className={`w-36 shrink-0 rounded-lg border-2 border-dashed transition-colors ${
                      isCorrect
                        ? "border-green-400 bg-green-500/10"
                        : isWrong
                        ? "border-red-400 bg-red-500/10"
                        : isMissed
                        ? "border-yellow-400 bg-yellow-500/10"
                        : placed
                        ? dark ? "border-sky-500 bg-sky-900/30" : "border-sky-400 bg-sky-50"
                        : dark ? "border-zinc-600 bg-zinc-700/20" : "border-zinc-300 bg-zinc-50"
                    }`}
                  >
                    {placed ? (
                      <div
                        draggable={!revealed}
                        onDragStart={() => handleDragStart(placed)}
                        className="flex h-full min-h-9 cursor-grab items-center justify-between gap-1 px-2 py-1 active:cursor-grabbing"
                      >
                        <span className="text-xs leading-tight">{placed}</span>
                        {!revealed && (
                          <button
                            onClick={() => handleRemoveFromSlot(i)}
                            className="shrink-0 opacity-40 hover:opacity-100"
                          >
                            <X size={12} />
                          </button>
                        )}
                        {isCorrect && <CheckCircle size={14} className="shrink-0 text-green-500" />}
                        {isWrong && <XCircle size={14} className="shrink-0 text-red-500" />}
                      </div>
                    ) : (
                      <div className="flex min-h-9 items-center justify-center">
                        {isMissed ? (
                          <span className="px-2 text-center text-xs text-yellow-500">{expectedItem}</span>
                        ) : (
                          <span className={`text-xs ${
                            dark ? "text-zinc-600" : "text-zinc-400"
                          }`}>←</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Score feedback */}
      {revealed && score !== null && (
        <div className={`mt-4 rounded-lg p-3 text-sm ${
          score >= 0.8
            ? dark ? "bg-green-900/30 text-green-300" : "bg-green-50 text-green-700"
            : score >= 0.5
            ? dark ? "bg-yellow-900/30 text-yellow-300" : "bg-yellow-50 text-yellow-700"
            : dark ? "bg-red-900/30 text-red-300" : "bg-red-50 text-red-700"
        }`}>
          {score >= 0.8 ? "✓ " : "✗ "}
          <span className="font-semibold">{Math.round(score * 100)}% korrekt</span>
          {score < 1 && " — Gelbe Slots zeigen die fehlenden richtigen Antworten"}
        </div>
      )}
    </div>
  );
}

// ─── Question Card ────────────────────────────────────────────
interface QuestionCardProps {
  question: ExamQuestion;
  userAnswer: string[];
  onToggle: (letter: string) => void;
  userSlots: (string | null)[];
  onUpdateSlots: (slots: (string | null)[]) => void;
  revealed: boolean;
  dark: boolean;
  index: number;
  total: number;
}

function QuestionCard({
  question,
  userAnswer,
  onToggle,
  userSlots,
  onUpdateSlots,
  revealed,
  dark,
  index,
  total,
}: QuestionCardProps) {
  const base = dark
    ? "bg-zinc-800 border-zinc-700 text-zinc-200"
    : "bg-white border-zinc-200 text-zinc-800";

  const correct = question.correctAnswer;
  const isMulti = question.type === "multi-select" || (correct && correct.length > 1);
  const isDragDrop = question.type === "drag-drop";
  const hasInteractiveDragDrop =
    isDragDrop &&
    (question.dragItems?.length ?? 0) >= 2 &&
    (question.dropTargets?.length ?? 0) >= 1;

  function optionCls(letter: string): string {
    const selected = userAnswer.includes(letter);
    if (!revealed) {
      if (selected) {
        return dark
          ? "border-sky-500 bg-sky-900/40 text-sky-200"
          : "border-sky-500 bg-sky-50 text-sky-900";
      }
      return dark
        ? "border-zinc-600 bg-zinc-700/50 hover:border-zinc-400"
        : "border-zinc-200 bg-zinc-50 hover:border-zinc-400";
    }
    // revealed
    if (correct && correct.includes(letter)) {
      return dark
        ? "border-green-500 bg-green-900/40 text-green-200"
        : "border-green-500 bg-green-50 text-green-900";
    }
    if (selected && correct && !correct.includes(letter)) {
      return dark
        ? "border-red-500 bg-red-900/40 text-red-200"
        : "border-red-500 bg-red-50 text-red-900";
    }
    return dark ? "border-zinc-600 bg-zinc-700/50 opacity-60" : "border-zinc-200 bg-zinc-50 opacity-60";
  }

  return (
    <div className={`rounded-xl border p-5 shadow-sm ${base}`}>
      {/* Header */}
      <div className="mb-3 flex items-center gap-2 text-sm">
        <span className={dark ? "text-zinc-500" : "text-zinc-400"}>
          {index + 1}/{total}
        </span>
        <CategoryBadge category={question.category} dark={dark} />
        {isMulti && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
            Wähle {correct ? correct.length : question.expectedAnswerCount}
          </span>
        )}
        {isDragDrop && (
          <span className="rounded-full bg-fuchsia-100 px-2 py-0.5 text-xs font-medium text-fuchsia-700 dark:bg-fuchsia-900/50 dark:text-fuchsia-300">
            Drag &amp; Drop
          </span>
        )}
        {question.needsReview && (
          <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300">
            ⚠ Review
          </span>
        )}
      </div>

      {/* Exhibit */}
      {question.needsExhibit && question.exhibitImages.length > 0 && (
        <div className="mb-4 flex flex-col gap-2">
          {question.exhibitImages.map((img) => (
            <ExhibitImage key={img} src={`/exam-images/${img}`} dark={dark} />
          ))}
        </div>
      )}

      {/* Question text */}
      <p className="mb-4 text-base leading-relaxed">{question.text}</p>

      {/* Options or Drag-Drop */}
      {isDragDrop ? (
        <DragDropCard
          question={question}
          userSlots={userSlots}
          onUpdateSlots={onUpdateSlots}
          revealed={revealed}
          dark={dark}
        />
      ) : question.options.length > 0 ? (
        <div className="flex flex-col gap-2">
          {question.options.map((opt) => (
            <button
              key={opt.letter}
              disabled={revealed}
              onClick={() => onToggle(opt.letter)}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-all ${optionCls(opt.letter)}`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-bold ${
                  userAnswer.includes(opt.letter)
                    ? "bg-sky-500 text-white"
                    : dark
                    ? "bg-zinc-600 text-zinc-300"
                    : "bg-zinc-200 text-zinc-600"
                }`}
              >
                {opt.letter}
              </span>
              <span className="flex-1">{opt.text}</span>
              {revealed && correct && correct.includes(opt.letter) && (
                <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />
              )}
              {revealed && userAnswer.includes(opt.letter) && correct && !correct.includes(opt.letter) && (
                <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
              )}
            </button>
          ))}
        </div>
      ) : (
        <div
          className={`rounded-lg border border-dashed p-4 text-sm ${
            dark ? "border-zinc-600 text-zinc-500" : "border-zinc-300 text-zinc-400"
          }`}
        >
          Keine Antwortoptionen extrahierbar (Sonderformat auf Seite {question.sourcePage}).
        </div>
      )}

      {/* Revealed feedback (MC only — drag-drop has its own) */}
      {revealed && correct && question.options.length > 0 && !isDragDrop && (
        <div
          className={`mt-4 rounded-lg p-3 text-sm ${
            answersEqual(userAnswer, correct)
              ? dark
                ? "bg-green-900/30 text-green-300"
                : "bg-green-50 text-green-700"
              : dark
              ? "bg-red-900/30 text-red-300"
              : "bg-red-50 text-red-700"
          }`}
        >
          {answersEqual(userAnswer, correct) ? (
            <span className="font-semibold">✓ Richtig!</span>
          ) : (
            <span>
              <span className="font-semibold">✗ Falsch.</span>{" "}
              Richtige Antwort: {correct.join(", ")}
            </span>
          )}
        </div>
      )}
      {revealed && !correct && (
        <div
          className={`mt-4 rounded-lg p-3 text-sm ${
            dark ? "bg-yellow-900/30 text-yellow-300" : "bg-yellow-50 text-yellow-700"
          }`}
        >
          ⚠ Antwort nicht extrahierbar (Seite {question.sourcePage}). Diese Frage braucht manuelle Prüfung.
        </div>
      )}
    </div>
  );
}

// ─── Results Screen ───────────────────────────────────────────
interface ResultsProps {
  results: SessionResult[];
  dark: boolean;
  onRetry: () => void;
  onMenu: () => void;
  mode: "learn" | "exam" | "drill";
}

function ResultsScreen({ results, dark, onRetry, onMenu, mode }: ResultsProps) {
  const correct = results.filter((r) => r.correct).length;
  const total = results.length;
  const pct = total > 0 ? correct / total : 0;
  const passed = pct >= PASS_THRESHOLD;
  const score = Math.round(pct * 1000);

  const byCategory = useMemo(() => {
    const map: Record<string, { c: number; t: number }> = {};
    results.forEach((r) => {
      // We can't easily get category here without questions — use id prefix
    });
    return map;
  }, [results]);

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      {/* Score circle */}
      <div
        className={`flex h-32 w-32 flex-col items-center justify-center rounded-full border-4 ${
          passed ? "border-green-500" : "border-red-500"
        }`}
      >
        <span className={`text-3xl font-bold ${passed ? "text-green-500" : "text-red-500"}`}>
          {score}
        </span>
        <span className="text-xs text-zinc-500">/ 1000</span>
      </div>

      <div className="text-center">
        <div className={`text-2xl font-bold ${passed ? "text-green-500" : "text-red-500"}`}>
          {passed ? "Bestanden! 🎉" : "Nicht bestanden"}
        </div>
        <div className={dark ? "text-zinc-400" : "text-zinc-500"}>
          {correct} / {total} richtig ({Math.round(pct * 100)}%)
          {" · "}Cisco-Grenze: 825/1000
        </div>
      </div>

      {/* Progress bar */}
      <div className={`h-3 w-full max-w-sm overflow-hidden rounded-full ${dark ? "bg-zinc-700" : "bg-zinc-200"}`}>
        <div
          className={`h-full rounded-full transition-all ${passed ? "bg-green-500" : "bg-red-500"}`}
          style={{ width: `${Math.round(pct * 100)}%` }}
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600"
        >
          <Shuffle size={16} />
          Nochmal
        </button>
        <button
          onClick={onMenu}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium ${
            dark
              ? "border-zinc-600 text-zinc-300 hover:bg-zinc-700"
              : "border-zinc-300 text-zinc-700 hover:bg-zinc-100"
          }`}
        >
          <ArrowLeft size={16} />
          Menü
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function ExamPrepDialog({ dark, onClose }: Props) {
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<Mode>("menu");
  const [sessionQ, setSessionQ] = useState<ExamQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Map<string, string[]>>(new Map());
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<SessionResult[]>([]);
  const [weakIds, setWeakIds] = useState<Set<string>>(loadWeakIds);
  const [timeLeft, setTimeLeft] = useState(EXAM_TIME_SECONDS);
  const [examFinished, setExamFinished] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [dragDropSlots, setDragDropSlots] = useState<Map<string, (string | null)[]>>(new Map());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load questions from public/exam-questions.json
  useEffect(() => {
    fetch("/exam-questions.json")
      .then((r) => r.json())
      .then((data: ExamQuestion[]) => {
        // Filter: only questions with options (skip pure drag-drop with no options)
        setQuestions(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(`Fehler beim Laden: ${e.message}`);
        setLoading(false);
      });
  }, []);

  // Timer für Prüfungsmodus
  useEffect(() => {
    if (mode === "exam" && !examFinished) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current!);
            finishExam();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, examFinished]);

  // Categories
  const categories = useMemo(() => {
    const cats = new Set(questions.map((q) => q.category));
    return ["all", ...Array.from(cats).sort()];
  }, [questions]);

  // Filtered pool: MC questions (existing filter) + drag-drop questions with images or items
  const filteredPool = useMemo(() => {
    let pool = questions.filter(
      (q) =>
        ((q.options.length > 0 &&
          q.type !== "drag-drop" &&
          q.correctAnswer !== null &&
          q.correctAnswer.length > 0 &&
          !q.needsReview) ||
         (q.type === "drag-drop" &&
          ((q.dragItems?.length ?? 0) >= 2 ||
           q.questionStateImage != null ||
           q.answerStateImage != null ||
           q.exhibitImages.length > 0)))
    );
    if (selectedCategory !== "all") {
      pool = pool.filter((q) => q.category === selectedCategory);
    }
    return pool;
  }, [questions, selectedCategory]);

  function startLearn() {
    const pool = shuffle(filteredPool);
    setSessionQ(pool);
    setQIndex(0);
    setUserAnswers(new Map());
    setDragDropSlots(new Map());
    setRevealed(new Set());
    setResults([]);
    setMode("learn");
  }

  function startExam() {
    const pool = shuffle(filteredPool).slice(0, EXAM_QUESTIONS_COUNT);
    setSessionQ(pool);
    setQIndex(0);
    setUserAnswers(new Map());
    setDragDropSlots(new Map());
    setRevealed(new Set());
    setResults([]);
    setTimeLeft(EXAM_TIME_SECONDS);
    setExamFinished(false);
    setMode("exam");
  }

  function startDrill() {
    const pool = shuffle(
      questions.filter(
        (q) => weakIds.has(q.id) &&
          (q.options.length > 0 ||
           (q.type === "drag-drop" && ((q.dragItems?.length ?? 0) >= 2 || q.questionStateImage != null)))
      )
    );
    if (pool.length === 0) {
      alert("Keine Schwächefragen gespeichert. Übe erst im Lernmodus!");
      return;
    }
    setSessionQ(pool);
    setQIndex(0);
    setUserAnswers(new Map());
    setDragDropSlots(new Map());
    setRevealed(new Set());
    setResults([]);
    setMode("drill");
  }

  function toggleAnswer(letter: string) {
    const q = sessionQ[qIndex];
    if (!q) return;
    setUserAnswers((prev) => {
      const next = new Map(prev);
      const cur = next.get(q.id) ?? [];
      const isMulti =
        q.type === "multi-select" ||
        (q.correctAnswer && q.correctAnswer.length > 1);
      if (isMulti) {
        next.set(
          q.id,
          cur.includes(letter) ? cur.filter((l) => l !== letter) : [...cur, letter]
        );
      } else {
        next.set(q.id, [letter]);
      }
      return next;
    });
  }

  function revealAnswer() {
    const q = sessionQ[qIndex];
    if (!q) return;
    setRevealed((prev) => new Set([...prev, q.id]));

    let isCorrect = false;
    let ua: string[] = [];
    let ca: string[] = [];

    if (q.type === "drag-drop") {
      const slots = dragDropSlots.get(q.id) ?? [];
      const mapping = q.correctMapping ?? [];
      const score = scoreDragDrop(slots, mapping);
      isCorrect = score >= 0.8;
      // encode drag-drop answer as sorted placed items
      ua = slots.filter(Boolean) as string[];
      ca = mapping.filter(Boolean);
    } else {
      ua = userAnswers.get(q.id) ?? [];
      ca = q.correctAnswer ?? [];
      isCorrect = ca.length > 0 && answersEqual(ua, ca);
    }

    setResults((prev) => {
      if (prev.find((r) => r.questionId === q.id)) return prev;
      return [...prev, { questionId: q.id, correct: isCorrect, userAnswer: ua, correctAnswer: ca }];
    });
    if (!isCorrect) {
      setWeakIds((prev) => { const next = new Set(prev); next.add(q.id); saveWeakIds(next); return next; });
    } else {
      setWeakIds((prev) => { const next = new Set(prev); next.delete(q.id); saveWeakIds(next); return next; });
    }
  }

  function nextQuestion() {
    if (qIndex < sessionQ.length - 1) {
      setQIndex(qIndex + 1);
    } else {
      finishExam();
    }
  }

  function prevQuestion() {
    if (qIndex > 0) setQIndex(qIndex - 1);
  }

  function finishExam() {
    if (mode === "exam") {
      const finalResults: SessionResult[] = sessionQ.map((q) => {
        const existing = results.find((r) => r.questionId === q.id);
        if (existing) return existing;
        if (q.type === "drag-drop") {
          const slots = dragDropSlots.get(q.id) ?? [];
          const mapping = q.correctMapping ?? [];
          const score = scoreDragDrop(slots, mapping);
          return {
            questionId: q.id,
            correct: score >= 0.8,
            userAnswer: slots.filter(Boolean) as string[],
            correctAnswer: mapping.filter(Boolean),
          };
        }
        const ua = userAnswers.get(q.id) ?? [];
        const ca = q.correctAnswer ?? [];
        const isCorrect = ca.length > 0 && answersEqual(ua, ca);
        return { questionId: q.id, correct: isCorrect, userAnswer: ua, correctAnswer: ca };
      });
      setResults(finalResults);
    }
    setExamFinished(true);
    setMode("results");
  }

  const bg = dark ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900";
  const headerBg = dark ? "bg-zinc-800 border-zinc-700" : "bg-zinc-50 border-zinc-200";
  const currentQ = sessionQ[qIndex];
  const currentAnswer = currentQ ? (userAnswers.get(currentQ.id) ?? []) : [];
  const currentSlots = currentQ ? (dragDropSlots.get(currentQ.id) ?? []) : [];
  const isRevealed = currentQ ? revealed.has(currentQ.id) : false;
  const isDragDropQ = currentQ?.type === "drag-drop";
  const dragDropHasInput =
    isDragDropQ &&
    (currentSlots.some(Boolean) ||
      // image-only drag-drop: always allow reveal
      ((currentQ?.dragItems?.length ?? 0) < 2 &&
        (currentQ?.questionStateImage != null || currentQ?.exhibitImages.length > 0)));
  const canReveal =
    !isRevealed &&
    (isDragDropQ ? dragDropHasInput : currentAnswer.length > 0);
  const progress = sessionQ.length > 0 ? (qIndex / sessionQ.length) * 100 : 0;
  const answeredCount = results.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 py-10">
      <div
        className={`relative w-full max-w-3xl rounded-2xl shadow-2xl ${bg}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between rounded-t-2xl border-b px-5 py-4 ${headerBg}`}>
          <div className="flex items-center gap-3">
            <Target size={24} className="text-sky-500" />
            <div>
              <h2 className="text-lg font-bold">CCNA 200-301 Prüfungsvorbereitung</h2>
              {mode !== "menu" && mode !== "results" && (
                <p className={`text-xs ${dark ? "text-zinc-400" : "text-zinc-500"}`}>
                  {mode === "learn" && "Lernmodus"}
                  {mode === "exam" && "Prüfungsmodus"}
                  {mode === "drill" && "Schwächen-Drill"}
                  {" · "}
                  {sessionQ.length} Fragen
                  {filteredPool.length !== questions.length && selectedCategory !== "all"
                    ? ` (${selectedCategory})`
                    : ""}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {mode === "exam" && !examFinished && (
              <div
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-mono font-semibold ${
                  timeLeft < 600
                    ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                    : dark
                    ? "bg-zinc-700 text-zinc-200"
                    : "bg-zinc-200 text-zinc-700"
                }`}
              >
                <Clock size={16} />
                {formatTime(timeLeft)}
              </div>
            )}
            <button
              onClick={onClose}
              className={`rounded-lg p-1.5 transition-colors ${
                dark ? "hover:bg-zinc-700" : "hover:bg-zinc-200"
              }`}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Progress bar (non-menu modes) */}
        {mode !== "menu" && mode !== "results" && (
          <div className={`h-1 ${dark ? "bg-zinc-700" : "bg-zinc-200"}`}>
            <div
              className="h-full bg-sky-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Body */}
        <div className="p-5">
          {loading && (
            <div className="flex items-center justify-center py-16 text-zinc-400">
              Lade Fragenkatalog...
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center gap-2 py-16 text-red-500">
              <Warning size={20} />
              {error}
            </div>
          )}

          {/* ── MENU ──────────────────────────────────────────── */}
          {!loading && !error && mode === "menu" && (
            <div className="flex flex-col gap-6">
              {/* Stats */}
              <div
                className={`grid grid-cols-2 gap-3 rounded-xl p-4 sm:grid-cols-4 ${
                  dark ? "bg-zinc-800" : "bg-zinc-50"
                }`}
              >
                {[
                  { label: "Fragen gesamt", value: questions.length, icon: <ListChecks size={20} className="text-sky-500" /> },
                  {
                    label: "Beantwortet",
                    value: questions.filter((q) => q.correctAnswer !== null).length,
                    icon: <CheckCircle size={20} className="text-green-500" />,
                  },
                  {
                    label: "Schwächefragen",
                    value: weakIds.size,
                    icon: <FireSimple size={20} className="text-orange-500" />,
                  },
                  { label: "Kategorien", value: categories.length - 1, icon: <Gauge size={20} className="text-purple-500" /> },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col items-center gap-1 text-center">
                    {s.icon}
                    <span className="text-2xl font-bold">{s.value}</span>
                    <span className={`text-xs ${dark ? "text-zinc-500" : "text-zinc-500"}`}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Category filter */}
              <div>
                <label className={`mb-2 block text-sm font-medium ${dark ? "text-zinc-400" : "text-zinc-600"}`}>
                  Kategorie filtern
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm ${
                    dark
                      ? "border-zinc-600 bg-zinc-800 text-zinc-200"
                      : "border-zinc-300 bg-white text-zinc-900"
                  }`}
                >
                  <option value="all">Alle Kategorien ({filteredPool.length} Fragen)</option>
                  {categories
                    .filter((c) => c !== "all")
                    .map((c) => {
                      const cnt = filteredPool.filter((q) => q.category === c).length;
                      return (
                        <option key={c} value={c}>
                          {c} ({cnt} Fragen)
                        </option>
                      );
                    })}
                </select>
              </div>

              {/* Mode buttons */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  onClick={startLearn}
                  disabled={filteredPool.length === 0}
                  className="flex flex-col items-center gap-2 rounded-xl border border-sky-500 bg-sky-500/10 p-5 text-sky-500 transition-all hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <BookOpen size={32} />
                  <span className="font-semibold">Lernmodus</span>
                  <span className="text-xs opacity-80">Sofortiges Feedback · Alle {filteredPool.length} Fragen</span>
                </button>

                <button
                  onClick={startExam}
                  disabled={filteredPool.length < 10}
                  className="flex flex-col items-center gap-2 rounded-xl border border-purple-500 bg-purple-500/10 p-5 text-purple-500 transition-all hover:bg-purple-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Clock size={32} />
                  <span className="font-semibold">Prüfungsmodus</span>
                  <span className="text-xs opacity-80">
                    120 min · {Math.min(EXAM_QUESTIONS_COUNT, filteredPool.length)} Fragen · Score
                  </span>
                </button>

                <button
                  onClick={startDrill}
                  disabled={weakIds.size === 0}
                  className="flex flex-col items-center gap-2 rounded-xl border border-orange-500 bg-orange-500/10 p-5 text-orange-500 transition-all hover:bg-orange-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FireSimple size={32} />
                  <span className="font-semibold">Schwächen-Drill</span>
                  <span className="text-xs opacity-80">
                    {weakIds.size > 0 ? `${weakIds.size} gespeicherte Fehler` : "Noch keine Fehler"}
                  </span>
                </button>
              </div>

              {weakIds.size > 0 && (
                <button
                  onClick={() => {
                    setWeakIds(new Set());
                    saveWeakIds(new Set());
                  }}
                  className={`text-xs ${dark ? "text-zinc-600 hover:text-zinc-400" : "text-zinc-400 hover:text-zinc-600"}`}
                >
                  Schwächeliste zurücksetzen ({weakIds.size})
                </button>
              )}
            </div>
          )}

          {/* ── QUIZ (learn / exam / drill) ───────────────────── */}
          {!loading && !error && (mode === "learn" || mode === "exam" || mode === "drill") && currentQ && (
            <div className="flex flex-col gap-4">
              <QuestionCard
                question={currentQ}
                userAnswer={currentAnswer}
                onToggle={toggleAnswer}
                userSlots={currentSlots}
                onUpdateSlots={(slots) => {
                  setDragDropSlots((prev) => {
                    const next = new Map(prev);
                    next.set(currentQ.id, slots);
                    return next;
                  });
                }}
                revealed={isRevealed || examFinished}
                dark={dark}
                index={qIndex}
                total={sessionQ.length}
              />

              {/* Controls */}
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={prevQuestion}
                  disabled={qIndex === 0}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40 ${
                    dark
                      ? "border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                      : "border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  <ArrowLeft size={16} /> Zurück
                </button>

                <div className="flex items-center gap-2">
                  {mode !== "exam" && !isRevealed && (
                    <button
                      onClick={revealAnswer}
                      disabled={!canReveal}
                      className="flex items-center gap-1.5 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <CheckCircle size={16} />
                      {isDragDropQ ? "Auflösen" : "Prüfen"}
                    </button>
                  )}
                  {mode === "exam" && (
                    <span className={`text-sm ${dark ? "text-zinc-400" : "text-zinc-500"}`}>
                      {answeredCount} / {sessionQ.length} beantwortet
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {qIndex < sessionQ.length - 1 ? (
                    <button
                      onClick={nextQuestion}
                      className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm ${
                        dark
                          ? "border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                          : "border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                      }`}
                    >
                      Weiter <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={finishExam}
                      className="flex items-center gap-1.5 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
                    >
                      <Target size={16} /> Auswertung
                    </button>
                  )}
                </div>
              </div>

              {/* Back to menu */}
              <button
                onClick={() => setMode("menu")}
                className={`text-xs ${dark ? "text-zinc-600 hover:text-zinc-400" : "text-zinc-400 hover:text-zinc-600"}`}
              >
                ← Zum Menü
              </button>
            </div>
          )}

          {/* ── RESULTS ──────────────────────────────────────── */}
          {!loading && !error && mode === "results" && (
            <ResultsScreen
              results={results}
              dark={dark}
              mode={
                (["learn", "exam", "drill"] as const).find(() => true) as "learn" | "exam" | "drill"
              }
              onRetry={() => {
                setMode("menu");
              }}
              onMenu={() => setMode("menu")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
