import type { ProgressState } from '../types';

export interface ProgressStore {
  load(): ProgressState;
  save(state: ProgressState): void;
  reset(): void;
}

export const SCHEMA_VERSION = 2;
const STORAGE_KEY = 'it-training-progress-v1';
const MAX_HISTORY_DAYS = 30;

export function createEmptyState(): ProgressState {
  return {
    schemaVersion: SCHEMA_VERSION,
    userId: 'local',
    xpTotal: 0,
    level: 1,
    streak: {
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      freezeAvailableAt: null,
      freezeUsedThisWeek: false,
    },
    unlockedAchievementIds: [],
    eventHistory: [],
    lastUpdated: Date.now(),
    totalDaysActive: 0,
  };
}

export function pruneEventHistory(state: ProgressState): ProgressState {
  const cutoff = Date.now() - (MAX_HISTORY_DAYS * 24 * 60 * 60 * 1000);
  return {
    ...state,
    eventHistory: state.eventHistory.filter(e => e.timestamp >= cutoff),
  };
}

function migrate(raw: unknown): ProgressState {
  if (typeof raw !== 'object' || raw === null) return createEmptyState();
  const obj = raw as Record<string, unknown>;
  if (typeof obj['schemaVersion'] !== 'number') return createEmptyState();
  if (obj['schemaVersion'] < 1) return createEmptyState();
  if (obj['schemaVersion'] > SCHEMA_VERSION) {
    console.warn('[ProgressStore] Future schema version detected — resetting');
    return createEmptyState();
  }
  // v1 → v2: add totalDaysActive field
  if (obj['schemaVersion'] === 1) {
    return {
      ...(raw as ProgressState),
      schemaVersion: 2,
      totalDaysActive: 0,
    };
  }
  return raw as ProgressState;
}

export class LocalStorageProgressStore implements ProgressStore {
  load(): ProgressState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return createEmptyState();
      return migrate(JSON.parse(raw) as unknown);
    } catch {
      console.warn('[ProgressStore] Corrupt data in localStorage — resetting');
      return createEmptyState();
    }
  }

  save(state: ProgressState): void {
    const pruned = pruneEventHistory(state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
  }

  reset(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const progressStore = new LocalStorageProgressStore();
