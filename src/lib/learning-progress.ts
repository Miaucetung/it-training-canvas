import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * Lernfortschritt für das CCNA-Dashboard: Lektionen (gelesen), Quizzes (bearbeitet, mit Ergebnis).
 * Gespeichert wird nur, was Nutzer tatsächlich getan haben. Vorhandene Daten (Lernpfad-Schritte, ccna-completed-topics,
 * zuletzt geöffnete Themen) werden beim Lesen berücksichtigt, aber nicht verändert (abwärtskompatibel).
 */

export const LEARNING_PROGRESS_KEY = "ccna-learning-progress-v1";
export const LEGACY_COMPLETED_TOPICS_KEY = "ccna-completed-topics";
export const LEGACY_RECENT_KEY = "ccna-recent-history";
/** Speicher des Lernpfad-Fortschritts der App (Record<pfadId, { completedSteps }>) */
export const LEGACY_USER_PROGRESS_KEY = "canvas-user-progress";
const CHANGE_EVENT = "ccna-learning-progress-changed";

export interface LessonProgress {
  /** zuletzt geöffnet */
  openedAt?: number;
  /** Nutzerentscheidung „als gelesen markiert“: true/false; undefined = nichts entschieden (Altdaten gelten) */
  read?: boolean;
  readAt?: number;
}

export interface QuizProgress {
  /** Anzahl vollständig durchlaufener Versuche */
  attempts: number;
  completedAt: number;
  lastPercent: number;
  bestPercent: number;
}

export interface LearningProgressState {
  version: 1;
  lessons: Record<string, LessonProgress>;
  quizzes: Record<string, QuizProgress>;
}

/** Altdaten, die der Aufrufer kennt (z. B. aus dem Lernpfad-Fortschritt der App). */
export interface LegacyProgress {
  /** Schritt-IDs des Lernpfads `ccna-full-path` (completedSteps) */
  completedStepIds?: string[];
}

/** Info-Schritt des Lernpfads `ccna-full-path` → Thema-ID. */
export const LEGACY_STEP_TO_TOPIC: Record<string, string> = {
  "step-1-netzwerkgrundlagen": "networking-fundamentals",
  "step-3-ios-cli": "ios-cli",
  "step-5-ipv4": "ipv4-addressing",
  "step-7-ipv6": "ipv6",
  "step-9-switching": "switching-vlans",
  "step-11-routing-ospf": "routing-ospf",
  "step-13-dhcp-nat": "dhcp-nat",
  "step-16-segmentierung": "subnet-segmentation",
  "step-18-security": "security",
  "step-20-wlan": "wlan",
  "step-22-device-management": "device-management",
  "step-24-fhrp": "fhrp",
  "step-26-qos": "qos",
  "step-28-wan-vpn": "wan",
  "step-30-sdn": "sdn-controller",
  "step-32-automation": "automation",
  "step-34-troubleshooting": "troubleshooting",
};

/** Quiz-Schritt des Lernpfads → Quiz-ID. */
export const LEGACY_STEP_TO_QUIZ: Record<string, string> = {
  "step-2-quiz-netzwerkgrundlagen": "ccna-quiz-netzwerkgrundlagen",
  "step-4-quiz-ios-cli": "ccna-quiz-ios-cli",
  "step-6-quiz-ipv4": "ccna-quiz-ipv4",
  "step-8-quiz-ipv6": "ccna-quiz-ipv6",
  "step-10-quiz-switching": "ccna-quiz-switching",
  "step-12-quiz-ospf": "ccna-quiz-ospf",
  "step-14-quiz-dhcp": "ccna-quiz-dhcp",
  "step-15-quiz-nat": "ccna-quiz-nat",
  "step-17-quiz-segmentierung": "ccna-quiz-segmentierung",
  "step-19-quiz-security": "ccna-quiz-security",
  "step-21-quiz-wlan": "ccna-quiz-wlan",
  "step-23-quiz-device-mgmt": "ccna-quiz-device-management",
  "step-25-quiz-fhrp": "ccna-quiz-fhrp",
  "step-27-quiz-qos": "ccna-quiz-qos",
  "step-29-quiz-wan-vpn": "ccna-quiz-wan-vpn",
  "step-31-quiz-sdn": "ccna-quiz-sdn",
  "step-33-quiz-automation": "ccna-quiz-automation",
  "step-35-quiz-troubleshooting": "ccna-quiz-troubleshooting",
};

export const emptyState = (): LearningProgressState => ({ version: 1, lessons: {}, quizzes: {} });

function storage(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Liest den gespeicherten Zustand; kaputte Einträge werden verworfen, nie erfunden. */
export function loadState(): LearningProgressState {
  const s = storage();
  if (!s) return emptyState();
  try {
    const raw = s.getItem(LEARNING_PROGRESS_KEY);
    if (!raw) return emptyState();
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.version !== 1) return emptyState();
    const state = emptyState();
    if (isRecord(parsed.lessons)) {
      for (const [id, l] of Object.entries(parsed.lessons)) {
        if (!isRecord(l)) continue;
        state.lessons[id] = {
          ...(typeof l.openedAt === "number" ? { openedAt: l.openedAt } : {}),
          ...(typeof l.read === "boolean" ? { read: l.read } : {}),
          ...(typeof l.readAt === "number" ? { readAt: l.readAt } : {}),
        };
      }
    }
    if (isRecord(parsed.quizzes)) {
      for (const [id, q] of Object.entries(parsed.quizzes)) {
        if (!isRecord(q) || typeof q.attempts !== "number" || typeof q.bestPercent !== "number") continue;
        state.quizzes[id] = {
          attempts: q.attempts,
          completedAt: typeof q.completedAt === "number" ? q.completedAt : 0,
          lastPercent: typeof q.lastPercent === "number" ? q.lastPercent : q.bestPercent,
          bestPercent: q.bestPercent,
        };
      }
    }
    return state;
  } catch {
    return emptyState();
  }
}

function save(state: LearningProgressState): void {
  const s = storage();
  if (!s) return;
  try {
    s.setItem(LEARNING_PROGRESS_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  } catch {
    // Speicher voll oder gesperrt: Fortschritt bleibt unverändert
  }
}

// ---------------------------------------------------------------------------
// Ereignisse (schreiben)
// ---------------------------------------------------------------------------

/** Lektion geöffnet (begonnen). */
export function markLessonOpened(topicId: string, now = Date.now()): void {
  const state = loadState();
  state.lessons[topicId] = { ...state.lessons[topicId], openedAt: now };
  save(state);
}

/** „Als gelesen markieren“ bzw. wieder abwählen. */
export function setLessonRead(topicId: string, read: boolean, now = Date.now()): void {
  const state = loadState();
  const prev = state.lessons[topicId] ?? {};
  state.lessons[topicId] = { ...prev, read, ...(read ? { readAt: now } : {}) };
  if (!read) delete state.lessons[topicId].readAt;
  save(state);
}

/** Quiz vollständig durchlaufen: Ergebnis in Prozent (0–100) speichern. */
export function recordQuizResult(quizId: string, percent: number, now = Date.now()): void {
  if (!Number.isFinite(percent)) return;
  const p = Math.max(0, Math.min(100, Math.round(percent)));
  const state = loadState();
  const prev = state.quizzes[quizId];
  state.quizzes[quizId] = {
    attempts: (prev?.attempts ?? 0) + 1,
    completedAt: now,
    lastPercent: p,
    bestPercent: Math.max(prev?.bestPercent ?? 0, p),
  };
  save(state);
}

// ---------------------------------------------------------------------------
// Auswertung (rein, testbar)
// ---------------------------------------------------------------------------

export interface EffectiveProgress {
  /** gelesene Themen (Nutzerentscheidung oder Altdaten) */
  readTopicIds: Set<string>;
  /** geöffnete (begonnene) Themen, auch wenn nicht als gelesen markiert */
  openedTopicIds: Set<string>;
  /** bearbeitete Quizzes; `percent` ist nur bei neu gespeicherten Ergebnissen bekannt */
  quizzes: Record<string, { attempts: number; bestPercent?: number; lastPercent?: number; legacy: boolean }>;
}

function readJsonArray(key: string): unknown[] {
  const s = storage();
  if (!s) return [];
  try {
    const raw = s.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Gespeicherter Zustand + Altdaten:
 * - `ccna-completed-topics` (Themen-IDs) und Info-Schritte des Lernpfads zählen als gelesen, außer der Nutzer hat bewusst abgewählt;
 * - Quiz-Schritte des Lernpfads zählen als bearbeitet (ohne Ergebnis);
 * - `ccna-recent-history` (Thema geöffnet) zählt als begonnen.
 */
export function deriveProgress(state: LearningProgressState, legacy: LegacyProgress = {}): EffectiveProgress {
  const read = new Set<string>();
  const opened = new Set<string>();
  const quizzes: EffectiveProgress["quizzes"] = {};

  const legacyRead = new Set<string>();
  for (const id of readJsonArray(LEGACY_COMPLETED_TOPICS_KEY)) if (typeof id === "string") legacyRead.add(id);
  const storedSteps: string[] = [];
  try {
    const raw = storage()?.getItem(LEGACY_USER_PROGRESS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    const path = isRecord(parsed) && isRecord(parsed["ccna-full-path"]) ? parsed["ccna-full-path"] : null;
    if (path && Array.isArray(path.completedSteps)) for (const st of path.completedSteps) if (typeof st === "string") storedSteps.push(st);
  } catch {
    // ignorieren
  }
  for (const step of [...(legacy.completedStepIds ?? []), ...storedSteps]) {
    const topic = LEGACY_STEP_TO_TOPIC[step];
    if (topic) legacyRead.add(topic);
    else if (!step.startsWith("step-") && !LEGACY_STEP_TO_QUIZ[step]) legacyRead.add(step); // frühere Anzeige zählte Themen-IDs direkt
    const quiz = LEGACY_STEP_TO_QUIZ[step];
    if (quiz && !state.quizzes[quiz]) quizzes[quiz] = { attempts: 1, legacy: true };
  }
  for (const item of readJsonArray(LEGACY_RECENT_KEY)) {
    if (isRecord(item) && item.type === "topic" && typeof item.id === "string") opened.add(item.id);
  }

  for (const id of legacyRead) read.add(id);
  for (const [id, l] of Object.entries(state.lessons)) {
    if (l.read === true) read.add(id);
    if (l.read === false) read.delete(id);
    if (l.openedAt !== undefined || l.read !== undefined) opened.add(id);
  }
  for (const id of read) opened.add(id);
  for (const [id, q] of Object.entries(state.quizzes)) {
    quizzes[id] = { attempts: q.attempts, bestPercent: q.bestPercent, lastPercent: q.lastPercent, legacy: false };
  }
  return { readTopicIds: read, openedTopicIds: opened, quizzes };
}

export type ItemStatus = "offen" | "begonnen" | "abgeschlossen";

/** Anteil gelesener Themen in einer Liste (für Prüfungsbereiche). */
export function readShare(topicIds: string[], progress: EffectiveProgress): { read: number; total: number; percent: number } {
  const read = topicIds.filter((id) => progress.readTopicIds.has(id)).length;
  return { read, total: topicIds.length, percent: topicIds.length > 0 ? Math.round((read / topicIds.length) * 100) : 0 };
}

// ---------------------------------------------------------------------------
// React-Anbindung
// ---------------------------------------------------------------------------

/** Liest den Fortschritt reaktiv (gleicher Tab per Ereignis, andere Tabs per storage-Ereignis). */
export function useLearningProgress(legacy: LegacyProgress = {}) {
  const [state, setState] = useState<LearningProgressState>(() => loadState());
  const refresh = useCallback(() => setState(loadState()), []);
  useEffect(() => {
    window.addEventListener(CHANGE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(CHANGE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);
  const stepKey = (legacy.completedStepIds ?? []).join("|");
  const progress = useMemo(
    () => deriveProgress(state, { completedStepIds: stepKey ? stepKey.split("|") : [] }),
    [state, stepKey],
  );
  return { progress, state, refresh };
}
