/**
 * Gamification Integration Tests
 *
 * Tests the full pipeline:  User-Action → Event → Engine → Persistence → State
 *
 * What this file does NOT test:
 * - React component rendering (covered by UI smoke tests)
 * - The engine in isolation (covered by unit tests)
 *
 * Mocked: clock (setClock), localStorage (vi.stubGlobal)
 * Real:   EventBus, XpEngine, StreakEngine, AchievementEngine, ProgressStore
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { applyXpEvent } from '@/lib/gamification/state/xp-engine';
import { updateStreak, useStreakFreeze, resetWeeklyFreezeIfNeeded } from '@/lib/gamification/state/streak-engine';
import { checkAllAchievements } from '@/lib/gamification/state/achievement-engine';
import {
  LocalStorageProgressStore,
  SCHEMA_VERSION,
} from '@/lib/gamification/state/progress-store';
import { gamificationBus } from '@/lib/gamification/events/event-bus';
import { setClock, resetClock } from '@/lib/gamification/clock';
import { contentRegistry } from '@/lib/content/content-registry';

import type { ProgressState, PersistedEvent } from '@/lib/gamification/types';
import type { GamificationEvent } from '@/lib/gamification/events/event-types';
import type { AchievementUnlockedPayload } from '@/lib/gamification/events/event-types';
import type { CertificationModule } from '@/lib/content/types';

// ──────────────────────────────────────────────────────────────────────────────
// Test helpers
// ──────────────────────────────────────────────────────────────────────────────

/** Creates a deterministic fake clock for a given YYYY-MM-DD date string. */
function makeFakeClock(date: string) {
  const ts = new Date(`${date}T12:00:00`).getTime();
  return { now: () => ts, today: () => date };
}

/** Creates a mock localStorage backed by an in-memory Map. */
function createMockStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string): string | null => store.get(key) ?? null,
    setItem: (key: string, value: string): void => { store.set(key, value); },
    removeItem: (key: string): void => { store.delete(key); },
    clear: (): void => { store.clear(); },
    get length(): number { return store.size; },
    key: (index: number): string | null => Array.from(store.keys())[index] ?? null,
    /** Direct access for seeding raw test data */
    _raw: store,
  };
}

/**
 * Runs a single event through the full pipeline:
 *   applyXpEvent → updateStreak → checkAllAchievements → persist
 *
 * Note: checkAllAchievements internally appends the event to the evaluation
 * history (via historyWithEvent), so we append it to state.eventHistory
 * AFTER that call to avoid double-counting.
 */
function processEvent(
  state: ProgressState,
  event: GamificationEvent,
  store: LocalStorageProgressStore,
): ProgressState {
  let s = resetWeeklyFreezeIfNeeded(state);
  s = applyXpEvent(s, event);
  s = updateStreak(s, event);
  s = checkAllAchievements(s, event);

  const persisted: PersistedEvent = {
    id: event.id,
    type: event.type,
    timestamp: event.timestamp,
    payload: event.payload,
  };
  s = { ...s, eventHistory: [...s.eventHistory, persisted] };
  store.save(s);
  return s;
}

/** Builds a typed GamificationEvent from loose parts. */
function makeEvent(
  type: GamificationEvent['type'],
  payload: GamificationEvent['payload'],
  timestamp: number,
): GamificationEvent {
  return { id: `${type}-${timestamp}`, type, timestamp, payload };
}

// ──────────────────────────────────────────────────────────────────────────────
// Shared test lifecycle
// ──────────────────────────────────────────────────────────────────────────────

let mockStorage: ReturnType<typeof createMockStorage>;

beforeEach(() => {
  mockStorage = createMockStorage();
  vi.stubGlobal('localStorage', mockStorage);
  gamificationBus.unsubscribeAll();
});

afterEach(() => {
  gamificationBus.unsubscribeAll();
  resetClock();
  vi.unstubAllGlobals();
});

// ──────────────────────────────────────────────────────────────────────────────
// Scenario 1: First Quiz Success
// ──────────────────────────────────────────────────────────────────────────────

describe('Scenario 1: First Quiz Success', () => {
  it('awards correct XP, unlocks first achievements, sets streak=1, and persists', () => {
    const DAY = '2024-01-15';
    setClock(makeFakeClock(DAY));
    const store = new LocalStorageProgressStore();

    const unlockedIds: string[] = [];
    gamificationBus.subscribe('achievement_unlocked', (e) => {
      unlockedIds.push((e.payload as AchievementUnlockedPayload).achievementId);
    });

    let state = store.load(); // fresh empty state

    const ts = makeFakeClock(DAY).now();

    // Daily warmup: +20 XP
    state = processEvent(state, makeEvent('daily_warmup', { date: DAY }, ts), store);

    // 5 correct answers: +10 each = +50 XP
    for (let i = 1; i <= 5; i++) {
      state = processEvent(
        state,
        makeEvent('question_answered', { questionId: `q${i}`, quizId: 'quiz-1', correct: true }, ts + i),
        store,
      );
    }

    // Quiz completed with 100%: +100 XP
    state = processEvent(
      state,
      makeEvent('quiz_completed', { quizId: 'quiz-1', moduleId: 'ccna', score: 100, correctAnswers: 5, totalQuestions: 5, passed: true }, ts + 10),
      store,
    );

    // Topic completed: +50 XP + achievement XP (first-topic +50, first-step-distinct +25)
    state = processEvent(
      state,
      makeEvent('topic_completed', { topicId: 'subnetting', moduleId: 'ccna', estimatedMinutes: 10 }, ts + 20),
      store,
    );

    // XP: 20 (warmup) + 50 (questions) + 100 (quiz 100%) + 50 (topic) + 50 (first-topic) + 25 (first-step-distinct) = 295
    expect(state.xpTotal).toBe(295);

    // Achievement "Erste Schritte" (first-topic) must be unlocked
    expect(state.unlockedAchievementIds).toContain('first-topic');
    expect(state.unlockedAchievementIds).toContain('first-step-distinct');

    // Events were emitted to the bus
    expect(unlockedIds).toContain('first-topic');
    expect(unlockedIds).toContain('first-step-distinct');

    // Streak starts at 1
    expect(state.streak.currentStreak).toBe(1);

    // Persistence: reload from store and state is identical
    const reloaded = store.load();
    expect(reloaded.xpTotal).toBe(295);
    expect(reloaded.streak.currentStreak).toBe(1);
    expect(reloaded.unlockedAchievementIds).toContain('first-topic');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Scenario 2: Streak over 3 days with break
// ──────────────────────────────────────────────────────────────────────────────

describe('Scenario 2: Streak over 3 days', () => {
  function doActivity(state: ProgressState, date: string, store: LocalStorageProgressStore): ProgressState {
    setClock(makeFakeClock(date));
    const ts = makeFakeClock(date).now();
    return processEvent(
      state,
      makeEvent('topic_completed', { topicId: 'bgp', moduleId: 'ccna', estimatedMinutes: 5 }, ts),
      store,
    );
  }

  it('builds streak correctly and resets after a 2-day gap without freeze', () => {
    const store = new LocalStorageProgressStore();
    let state = store.load();

    // Day 1: streak = 1
    state = doActivity(state, '2024-01-01', store);
    expect(state.streak.currentStreak).toBe(1);
    expect(store.load().streak.currentStreak).toBe(1);

    // Day 2: streak = 2
    state = doActivity(state, '2024-01-02', store);
    expect(state.streak.currentStreak).toBe(2);
    expect(store.load().streak.currentStreak).toBe(2);

    // Day 3: streak = 3
    state = doActivity(state, '2024-01-03', store);
    expect(state.streak.currentStreak).toBe(3);
    expect(store.load().streak.currentStreak).toBe(3);

    // Day 5: 2-day gap, no freeze → streak resets to 1
    state = doActivity(state, '2024-01-05', store);
    expect(state.streak.currentStreak).toBe(1);
    expect(store.load().streak.currentStreak).toBe(1);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Scenario 3: Streak Freeze saves the series
// ──────────────────────────────────────────────────────────────────────────────

describe('Scenario 3: Streak Freeze saves the series', () => {
  function doActivity(state: ProgressState, date: string, store: LocalStorageProgressStore): ProgressState {
    setClock(makeFakeClock(date));
    const ts = makeFakeClock(date).now();
    return processEvent(
      state,
      makeEvent('topic_completed', { topicId: 'vlan', moduleId: 'ccna', estimatedMinutes: 5 }, ts),
      store,
    );
  }

  it('freeze covers one missed day and second freeze is rejected (same week)', () => {
    const store = new LocalStorageProgressStore();
    let state = store.load();

    // Days 1–3 within same ISO week (Mon–Wed)
    state = doActivity(state, '2024-01-08', store); // streak = 1
    state = doActivity(state, '2024-01-09', store); // streak = 2
    state = doActivity(state, '2024-01-10', store); // streak = 3
    expect(state.streak.currentStreak).toBe(3);

    // Day 5 (Friday): 2-day gap — apply freeze FIRST, then activity
    setClock(makeFakeClock('2024-01-12'));
    state = useStreakFreeze(state, true); // marks freezeUsedThisWeek=true
    expect(state.streak.freezeUsedThisWeek).toBe(true);

    state = doActivity(state, '2024-01-12', store); // diff=2, freeze active → streak = 4
    expect(state.streak.currentStreak).toBe(4);
    expect(store.load().streak.currentStreak).toBe(4);

    // Day 6 (Saturday): second freeze attempt — state returned unchanged
    setClock(makeFakeClock('2024-01-13'));
    const stateBeforeSecondFreeze = state;
    state = useStreakFreeze(state, true);
    // useStreakFreeze returns state unchanged when freezeUsedThisWeek is already true
    expect(state.streak.freezeUsedThisWeek).toBe(true);
    expect(state.streak.currentStreak).toBe(stateBeforeSecondFreeze.streak.currentStreak);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Scenario 4: Cross-Module Achievement
// ──────────────────────────────────────────────────────────────────────────────

describe('Scenario 4: Cross-Module Achievement (bridge-builder)', () => {
  beforeEach(() => {
    // Register minimal module stubs so findRelatedConcepts can resolve concepts.
    // setup.ts beforeEach already cleared the registry; this runs after that.
    // Uses vlans↔vnet-subnet — a real bridge that exists in CONCEPT_BRIDGES.
    const ccnaStub = {
      id: 'ccna',
      title: 'CCNA',
      subtitle: '',
      description: '',
      vendor: 'cisco',
      difficulty: 'intermediate',
      estimatedHours: 40,
      topics: [],
      concepts: {
        vlans: {
          id: 'vlans',
          title: 'VLANs',
          content: '',
          tags: ['networking', 'switching'],
          appliesTo: ['ccna'],
        },
      },
      quizzes: {},
      exercises: {},
      learningPaths: {},
    } as unknown as CertificationModule;

    const az900Stub = {
      id: 'az-900',
      title: 'AZ-900',
      subtitle: '',
      description: '',
      vendor: 'microsoft',
      difficulty: 'beginner',
      estimatedHours: 20,
      topics: [],
      concepts: {
        'vnet-subnet': {
          id: 'vnet-subnet',
          title: 'VNet Subnet',
          content: '',
          tags: ['networking', 'azure'],
          appliesTo: ['az-900'],
        },
      },
      quizzes: {},
      exercises: {},
      learningPaths: {},
    } as unknown as CertificationModule;

    contentRegistry.register(ccnaStub);
    contentRegistry.register(az900Stub);
  });

  it('unlocks bridge-builder when subnetting (CCNA) and az-900 topic are both completed', () => {
    const DAY = '2024-02-01';
    setClock(makeFakeClock(DAY));
    const store = new LocalStorageProgressStore();
    let state = store.load();
    const ts = makeFakeClock(DAY).now();

    const unlockedIds: string[] = [];
    gamificationBus.subscribe('achievement_unlocked', (e) => {
      unlockedIds.push((e.payload as AchievementUnlockedPayload).achievementId);
    });

    // Complete CCNA vlans topic (vlans is a sourceConceptId in the vlans↔vnet-subnet bridge)
    state = processEvent(
      state,
      makeEvent('topic_completed', { topicId: 'vlans', moduleId: 'ccna', estimatedMinutes: 10 }, ts),
      store,
    );

    // Complete an AZ-900 topic — this triggers bridge-builder check
    state = processEvent(
      state,
      makeEvent('topic_completed', { topicId: 'azure-networking', moduleId: 'az-900', estimatedMinutes: 8 }, ts + 100),
      store,
    );

    // bridge-builder should now be unlocked (cross-reference vlans↔vnet-subnet exists)
    expect(state.unlockedAchievementIds).toContain('bridge-builder');
    expect(unlockedIds).toContain('bridge-builder');

    // Persisted correctly
    expect(store.load().unlockedAchievementIds).toContain('bridge-builder');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Scenario 5: Corrupt LocalStorage state
// ──────────────────────────────────────────────────────────────────────────────

describe('Scenario 5: Corrupt LocalStorage state', () => {
  const STORAGE_KEY = 'it-training-progress-v1';

  it('resets to empty state on garbage JSON and does not crash', () => {
    mockStorage._raw.set(STORAGE_KEY, '{this is not valid JSON!!!}');
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const store = new LocalStorageProgressStore();
    const state = store.load();

    expect(state.xpTotal).toBe(0);
    expect(state.unlockedAchievementIds).toHaveLength(0);
    expect(state.schemaVersion).toBe(SCHEMA_VERSION);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[ProgressStore]'),
    );

    consoleWarnSpy.mockRestore();
  });

  it('resets to empty state on future schema version and logs a warning', () => {
    mockStorage._raw.set(STORAGE_KEY, JSON.stringify({ schemaVersion: 999, xpTotal: 9000 }));
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const store = new LocalStorageProgressStore();
    const state = store.load();

    expect(state.xpTotal).toBe(0);
    expect(state.schemaVersion).toBe(SCHEMA_VERSION);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[ProgressStore]'),
    );

    // Future events still work correctly after corrupt-state reset
    setClock(makeFakeClock('2024-03-01'));
    const ts = makeFakeClock('2024-03-01').now();
    const updatedState = processEvent(
      state,
      makeEvent('topic_completed', { topicId: 'ospf', moduleId: 'ccna', estimatedMinutes: 5 }, ts),
      store,
    );
    expect(updatedState.xpTotal).toBeGreaterThan(0);
    expect(updatedState.streak.currentStreak).toBe(1);

    consoleWarnSpy.mockRestore();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Scenario 7: AZ-900 Topic Completed — Gamification Pipeline
// ──────────────────────────────────────────────────────────────────────────────

describe('Scenario 7: AZ-900 topic completed triggers full gamification pipeline', () => {
  it('awards XP, sets streak to 1, unlocks first-topic achievement, and persists', () => {
    const DAY = '2024-03-01';
    setClock(makeFakeClock(DAY));
    const store = new LocalStorageProgressStore();

    const unlockedIds: string[] = [];
    gamificationBus.subscribe('achievement_unlocked', (e) => {
      unlockedIds.push((e.payload as AchievementUnlockedPayload).achievementId);
    });

    let state = store.load(); // fresh empty state
    const ts = makeFakeClock(DAY).now();

    // Complete an AZ-900 topic — same event shape as CCNA, module-agnostic engine
    state = processEvent(
      state,
      makeEvent('topic_completed', { topicId: 'cloud-fundamentals', moduleId: 'az-900', estimatedMinutes: 60 }, ts),
      store,
    );

    // XP must be awarded — engine is module-agnostic
    expect(state.xpTotal).toBeGreaterThan(0);

    // Streak: Day 1 starts
    expect(state.streak.currentStreak).toBe(1);

    // first-topic achievement unlocked (module-agnostic, fires on first topic_completed ever)
    expect(state.unlockedAchievementIds).toContain('first-topic');
    expect(unlockedIds).toContain('first-topic');

    // ProgressStore persisted correctly
    const loaded = store.load();
    expect(loaded.xpTotal).toBe(state.xpTotal);
    expect(loaded.streak.currentStreak).toBe(1);
    expect(loaded.unlockedAchievementIds).toContain('first-topic');
  });
});


describe('Scenario 6: Schema Migration v1 → v2', () => {
  const STORAGE_KEY = 'it-training-progress-v1';

  it('migrates a v1 state to v2 on load, adding totalDaysActive', () => {
    // Write a v1-format state directly into the mock storage
    const v1State = {
      schemaVersion: 1,
      userId: 'local',
      xpTotal: 150,
      level: 1,
      streak: {
        currentStreak: 3,
        longestStreak: 5,
        lastActivityDate: '2024-01-10',
        freezeAvailableAt: null,
        freezeUsedThisWeek: false,
      },
      unlockedAchievementIds: ['first-topic'],
      eventHistory: [],
      lastUpdated: Date.now(),
      // No 'totalDaysActive' field — this is what v1 looked like
    };
    mockStorage._raw.set(STORAGE_KEY, JSON.stringify(v1State));

    const store = new LocalStorageProgressStore();
    const migrated = store.load();

    // Should be upgraded to v2
    expect(migrated.schemaVersion).toBe(2);
    // totalDaysActive should be injected with default value 0
    expect(migrated.totalDaysActive).toBe(0);
    // Existing data must be preserved
    expect(migrated.xpTotal).toBe(150);
    expect(migrated.streak.currentStreak).toBe(3);
    expect(migrated.unlockedAchievementIds).toContain('first-topic');
  });

  it('saves a migrated state that passes subsequent load() without re-migrating', () => {
    const v1State = {
      schemaVersion: 1,
      userId: 'local',
      xpTotal: 0,
      level: 1,
      streak: { currentStreak: 0, longestStreak: 0, lastActivityDate: null, freezeAvailableAt: null, freezeUsedThisWeek: false },
      unlockedAchievementIds: [],
      eventHistory: [],
      lastUpdated: Date.now(),
    };
    mockStorage._raw.set(STORAGE_KEY, JSON.stringify(v1State));

    const store = new LocalStorageProgressStore();
    const migrated = store.load();
    store.save(migrated);

    // Second load should return schemaVersion 2, not re-trigger migration
    const reloaded = store.load();
    expect(reloaded.schemaVersion).toBe(2);
    expect(reloaded.totalDaysActive).toBe(0);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Scenario 8: Network+ N10-009 Topic Completed — Gamification Pipeline
// The Lackmustest: module-agnostic engine must handle comptia-network-plus
// identically to ccna and az-900. No module-specific branches anywhere.
// ──────────────────────────────────────────────────────────────────────────────

describe('Scenario 8: Network+ N10-009 topic completed triggers full gamification pipeline', () => {
  it('awards XP for netplus-monitoring topic (comptia-network-plus module)', () => {
    const DAY = '2024-04-01';
    setClock(makeFakeClock(DAY));
    const store = new LocalStorageProgressStore();

    const unlockedIds: string[] = [];
    gamificationBus.subscribe('achievement_unlocked', (e) => {
      unlockedIds.push((e.payload as AchievementUnlockedPayload).achievementId);
    });

    let state = store.load();
    const ts = makeFakeClock(DAY).now();

    // Complete a Network+ topic — engine must be completely module-agnostic
    state = processEvent(
      state,
      makeEvent('topic_completed', { topicId: 'netplus-monitoring', moduleId: 'comptia-network-plus', estimatedMinutes: 55 }, ts),
      store,
    );

    // XP awarded — module name is irrelevant to the XP engine
    expect(state.xpTotal).toBeGreaterThan(0);

    // Streak starts at 1 — module-agnostic streak engine
    expect(state.streak.currentStreak).toBe(1);

    // first-topic unlocked on first topic_completed regardless of module
    expect(state.unlockedAchievementIds).toContain('first-topic');
    expect(unlockedIds).toContain('first-topic');

    // Persisted correctly
    const loaded = store.load();
    expect(loaded.xpTotal).toBe(state.xpTotal);
    expect(loaded.streak.currentStreak).toBe(1);
  });

  it('handles N10-009 quiz_completed event (netplus-quiz-security)', () => {
    const DAY = '2024-04-02';
    setClock(makeFakeClock(DAY));
    const store = new LocalStorageProgressStore();
    let state = store.load();
    const ts = makeFakeClock(DAY).now();

    // 6 correct answers (typical N10-009 stub quiz size: 6-8 questions)
    for (let i = 1; i <= 6; i++) {
      state = processEvent(
        state,
        makeEvent('question_answered', { questionId: `nq${i}`, quizId: 'netplus-quiz-security', correct: true }, ts + i),
        store,
      );
    }

    // Quiz completed at 100% — N10-009 quiz, passingScore: 70
    state = processEvent(
      state,
      makeEvent('quiz_completed', {
        quizId: 'netplus-quiz-security',
        moduleId: 'comptia-network-plus',
        score: 100,
        correctAnswers: 6,
        totalQuestions: 6,
        passed: true,
      }, ts + 10),
      store,
    );

    // XP: 6×10 (questions) + 100 (quiz 100%) = 160 minimum
    expect(state.xpTotal).toBeGreaterThanOrEqual(160);

    // Persistence round-trip
    expect(store.load().xpTotal).toBe(state.xpTotal);
  });
});
