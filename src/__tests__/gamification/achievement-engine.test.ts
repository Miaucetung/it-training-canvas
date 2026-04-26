import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { evaluateRule, checkAllAchievements } from '@/lib/gamification/state/achievement-engine';
import { gamificationBus } from '@/lib/gamification/events/event-bus';
import { createEmptyState } from '@/lib/gamification/state/progress-store';
import type { AchievementRule, PersistedEvent } from '@/lib/gamification/types';
import type { GamificationEvent } from '@/lib/gamification/events/event-types';
import type { ProgressState } from '@/lib/gamification/types';
import type { AchievementUnlockedPayload } from '@/lib/gamification/events/event-types';
import { findRelatedConcepts } from '@/lib/content/cross-references';
import type { Concept } from '@/lib/content/types';
import type { ConceptBridge } from '@/lib/content/types';

vi.mock('@/lib/content/cross-references', () => ({
  findRelatedConcepts: vi.fn(() => []),
}));

const mockFindRelatedConcepts = vi.mocked(findRelatedConcepts);

function makePersistedTopicEvent(topicId: string, moduleId: string, timestamp = Date.now()): PersistedEvent {
  return { id: `e-${topicId}`, type: 'topic_completed', timestamp, payload: { topicId, moduleId, estimatedMinutes: 10 } };
}

function makePersistedQuizEvent(quizId: string, score: number, passed: boolean, timestamp = Date.now()): PersistedEvent {
  return { id: `e-${quizId}`, type: 'quiz_completed', timestamp, payload: { quizId, moduleId: 'm1', score, correctAnswers: 8, totalQuestions: 10, passed } };
}

function makePersistedQuestionEvent(questionId: string, correct: boolean, timestamp = Date.now()): PersistedEvent {
  return { id: `e-${questionId}`, type: 'question_answered', timestamp, payload: { questionId, quizId: 'q1', correct } };
}

function makeGamificationEvent(type: GamificationEvent['type'], payload: GamificationEvent['payload']): GamificationEvent {
  return { id: 'trigger', type, timestamp: Date.now(), payload };
}

describe('evaluateRule - count', () => {
  const rule: AchievementRule = {
    id: 'test-count',
    name: 'Test',
    description: '',
    icon: '🔥',
    trigger: { type: 'topic_completed' },
    condition: { aggregate: 'count', threshold: 3 },
    xpReward: 50,
  };
  const state = createEmptyState();

  it('0 events → false', () => {
    expect(evaluateRule(rule, [], state)).toBe(false);
  });

  it('exactly threshold events → true', () => {
    const history = [
      makePersistedTopicEvent('t1', 'm1'),
      makePersistedTopicEvent('t2', 'm1'),
      makePersistedTopicEvent('t3', 'm1'),
    ];
    expect(evaluateRule(rule, history, state)).toBe(true);
  });

  it('more than threshold → true', () => {
    const history = [
      makePersistedTopicEvent('t1', 'm1'),
      makePersistedTopicEvent('t2', 'm1'),
      makePersistedTopicEvent('t3', 'm1'),
      makePersistedTopicEvent('t4', 'm1'),
    ];
    expect(evaluateRule(rule, history, state)).toBe(true);
  });
});

describe('evaluateRule - count_distinct', () => {
  const rule: AchievementRule = {
    id: 'test-distinct',
    name: 'Test',
    description: '',
    icon: '🌍',
    trigger: { type: 'topic_completed' },
    condition: { aggregate: 'count_distinct', field: 'topicId', threshold: 3 },
    xpReward: 100,
  };
  const state = createEmptyState();

  it('3 distinct topicIds → true if threshold=3', () => {
    const history = [
      makePersistedTopicEvent('t1', 'm1'),
      makePersistedTopicEvent('t2', 'm1'),
      makePersistedTopicEvent('t1', 'm1'),
      makePersistedTopicEvent('t3', 'm1'),
      makePersistedTopicEvent('t2', 'm1'),
    ];
    expect(evaluateRule(rule, history, state)).toBe(true);
  });

  it('2 distinct topicIds → false if threshold=3', () => {
    const history = [
      makePersistedTopicEvent('t1', 'm1'),
      makePersistedTopicEvent('t2', 'm1'),
    ];
    expect(evaluateRule(rule, history, state)).toBe(false);
  });
});

describe('evaluateRule - consecutive_days', () => {
  const rule: AchievementRule = {
    id: 'week-warrior',
    name: 'Wochenkrieger',
    description: '',
    icon: '🔥',
    trigger: { type: 'any' },
    condition: { aggregate: 'consecutive_days', threshold: 7 },
    xpReward: 200,
  };

  it('currentStreak=7 → true', () => {
    const state: ProgressState = { ...createEmptyState(), streak: { ...createEmptyState().streak, currentStreak: 7 } };
    expect(evaluateRule(rule, [], state)).toBe(true);
  });

  it('currentStreak=6 → false', () => {
    const state: ProgressState = { ...createEmptyState(), streak: { ...createEmptyState().streak, currentStreak: 6 } };
    expect(evaluateRule(rule, [], state)).toBe(false);
  });

  it('currentStreak=8 → true (above threshold)', () => {
    const state: ProgressState = { ...createEmptyState(), streak: { ...createEmptyState().streak, currentStreak: 8 } };
    expect(evaluateRule(rule, [], state)).toBe(true);
  });
});

describe('evaluateRule - time_of_day', () => {
  const rule: AchievementRule = {
    id: 'early-bird',
    name: 'Frühaufsteher',
    description: '',
    icon: '🌅',
    trigger: { type: 'any' },
    condition: { aggregate: 'time_of_day', hourMin: 0, hourMax: 8, threshold: 3 },
    xpReward: 75,
  };
  const state = createEmptyState();

  it('events at 7:30 AM count', () => {
    const ts = new Date('2024-01-15T07:30:00').getTime();
    const history = [
      makePersistedTopicEvent('t1', 'm1', ts),
      makePersistedTopicEvent('t2', 'm1', ts),
      makePersistedTopicEvent('t3', 'm1', ts),
    ];
    expect(evaluateRule(rule, history, state)).toBe(true);
  });

  it('events at 9:00 AM do not count', () => {
    const ts = new Date('2024-01-15T09:00:00').getTime();
    const history = [
      makePersistedTopicEvent('t1', 'm1', ts),
      makePersistedTopicEvent('t2', 'm1', ts),
      makePersistedTopicEvent('t3', 'm1', ts),
    ];
    expect(evaluateRule(rule, history, state)).toBe(false);
  });
});

describe('evaluateRule - all_in_set', () => {
  const rule: AchievementRule = {
    id: 'subnet-hero',
    name: 'Subnetting-Held',
    description: '',
    icon: '🧮',
    trigger: { type: 'exercise_completed' },
    condition: { aggregate: 'all_in_set', field: 'exerciseId', set: ['ex-subnet-1', 'ex-subnet-2'] },
    xpReward: 150,
  };
  const state = createEmptyState();

  function makeExerciseEvent(exerciseId: string): PersistedEvent {
    return { id: `e-${exerciseId}`, type: 'exercise_completed', timestamp: Date.now(), payload: { exerciseId, moduleId: 'ccna' } };
  }

  it('empty set condition → false', () => {
    const emptySetRule: AchievementRule = { ...rule, condition: { aggregate: 'all_in_set', set: [] } };
    expect(evaluateRule(emptySetRule, [makeExerciseEvent('ex-subnet-1')], state)).toBe(false);
  });

  it('only one of two required items → false', () => {
    expect(evaluateRule(rule, [makeExerciseEvent('ex-subnet-1')], state)).toBe(false);
  });

  it('all required items present → true', () => {
    const history = [makeExerciseEvent('ex-subnet-1'), makeExerciseEvent('ex-subnet-2')];
    expect(evaluateRule(rule, history, state)).toBe(true);
  });

  it('extra items + all required → true', () => {
    const history = [makeExerciseEvent('ex-subnet-1'), makeExerciseEvent('other'), makeExerciseEvent('ex-subnet-2')];
    expect(evaluateRule(rule, history, state)).toBe(true);
  });
});

describe('evaluateRule - count_distinct per_module scope', () => {
  const rule: AchievementRule = {
    id: 'module-master',
    name: 'Modulmeister',
    description: '',
    icon: '🎓',
    trigger: { type: 'topic_completed' },
    condition: { aggregate: 'count_distinct', field: 'topicId', scope: 'per_module', threshold: 2 },
    xpReward: 200,
  };
  const state = createEmptyState();

  it('2 distinct topics in one module → true', () => {
    const history = [
      makePersistedTopicEvent('t1', 'ccna'),
      makePersistedTopicEvent('t2', 'ccna'),
    ];
    expect(evaluateRule(rule, history, state)).toBe(true);
  });

  it('1 distinct topic per module → false', () => {
    const history = [
      makePersistedTopicEvent('t1', 'ccna'),
      makePersistedTopicEvent('t2', 'az-900'),
    ];
    expect(evaluateRule(rule, history, state)).toBe(false);
  });
});

describe('evaluateRule - count with filterField', () => {
  const rule: AchievementRule = {
    id: 'perfectionist',
    name: 'Perfektionist',
    description: '',
    icon: '💯',
    trigger: { type: 'quiz_completed' },
    condition: { aggregate: 'count', filterField: 'score', filterValue: 100, threshold: 2 },
    xpReward: 200,
  };
  const state = createEmptyState();

  it('2 quizzes with score=100 → true', () => {
    const history = [
      makePersistedQuizEvent('q1', 100, true),
      makePersistedQuizEvent('q2', 100, true),
    ];
    expect(evaluateRule(rule, history, state)).toBe(true);
  });

  it('1 quiz with score=100 → false', () => {
    expect(evaluateRule(rule, [makePersistedQuizEvent('q1', 100, true)], state)).toBe(false);
  });
});

describe('evaluateRule - default (unknown aggregate)', () => {
  it('returns false for unknown aggregate type', () => {
    const rule: AchievementRule = {
      id: 'unknown',
      name: 'Unknown',
      description: '',
      icon: '❓',
      trigger: { type: 'any' },
      condition: { aggregate: 'unknown_aggregate' as never },
      xpReward: 0,
    };
    expect(evaluateRule(rule, [], createEmptyState())).toBe(false);
  });
});

describe('evaluateRule - boolean filterValue (getEventField boolean branch)', () => {
  const rule: AchievementRule = {
    id: 'passed-bool-test',
    name: 'Bestanden',
    description: '',
    icon: '✅',
    trigger: { type: 'quiz_completed' },
    condition: { aggregate: 'count', threshold: 2, filterField: 'passed', filterValue: true },
    xpReward: 50,
  };
  const state = createEmptyState();

  it('counts events where passed=true (boolean filterValue)', () => {
    const history = [
      makePersistedQuizEvent('q1', 75, true),
      makePersistedQuizEvent('q2', 60, false),
      makePersistedQuizEvent('q3', 80, true),
    ];
    expect(evaluateRule(rule, history, state)).toBe(true);
  });

  it('does not count events where passed=false', () => {
    const history = [
      makePersistedQuizEvent('q1', 40, false),
      makePersistedQuizEvent('q2', 60, false),
    ];
    expect(evaluateRule(rule, history, state)).toBe(false);
  });

  it('exactly threshold events with boolean filter → true', () => {
    const history = [
      makePersistedQuizEvent('q1', 80, true),
      makePersistedQuizEvent('q2', 90, true),
    ];
    expect(evaluateRule(rule, history, state)).toBe(true);
  });
});

describe('evaluateRule - count_distinct with useCrossReferences', () => {
  const rule: AchievementRule = {
    id: 'bridge-builder-test',
    name: 'Brückenbauer',
    description: '',
    icon: '🌉',
    trigger: { type: 'topic_completed' },
    condition: { aggregate: 'count_distinct', field: 'moduleId', threshold: 2, useCrossReferences: true },
    xpReward: 200,
  };
  const state = createEmptyState();

  afterEach(() => {
    mockFindRelatedConcepts.mockReset();
    mockFindRelatedConcepts.mockReturnValue([]);
  });

  it('returns false when fewer than 2 modules in history', () => {
    const history = [makePersistedTopicEvent('subnetting', 'ccna')];
    expect(evaluateRule(rule, history, state)).toBe(false);
  });

  it('returns false when no events in history', () => {
    expect(evaluateRule(rule, [], state)).toBe(false);
  });

  it('returns true when cross-references are found between two modules', () => {
    const mockRelated: Array<{ concept: Concept; bridge: ConceptBridge }> = [
      {
        concept: { id: 'azure-addressing', title: 'Azure Addressing', content: '', tags: [], appliesTo: ['az-900'] },
        bridge: { sourceConceptId: 'subnetting', sourceModuleId: 'ccna', targetConceptId: 'azure-addressing', targetModuleId: 'az-900', bridgeNote: '' },
      },
    ];
    mockFindRelatedConcepts.mockReturnValueOnce(mockRelated);

    const history = [
      makePersistedTopicEvent('subnetting', 'ccna'),
      makePersistedTopicEvent('azure-networking', 'az-900'),
    ];
    expect(evaluateRule(rule, history, state)).toBe(true);
  });

  it('returns false when two modules exist but no cross-references found', () => {
    mockFindRelatedConcepts.mockReturnValue([]);

    const history = [
      makePersistedTopicEvent('bgp', 'ccna'),
      makePersistedTopicEvent('vm-concepts', 'az-900'),
    ];
    expect(evaluateRule(rule, history, state)).toBe(false);
  });
});

describe('evaluateRule - count_distinct without field', () => {
  it('returns false when field is not specified (no field → no distinct values possible)', () => {
    const rule: AchievementRule = {
      id: 'no-field',
      name: 'No Field',
      description: '',
      icon: '🤷',
      trigger: { type: 'topic_completed' },
      condition: { aggregate: 'count_distinct', threshold: 1 },
      xpReward: 0,
    };
    expect(evaluateRule(rule, [makePersistedTopicEvent('t1', 'm1')], createEmptyState())).toBe(false);
  });
});

describe('evaluateRule - all_in_set with default field (no field specified)', () => {
  it('defaults to exerciseId when field is not explicitly set', () => {
    const rule: AchievementRule = {
      id: 'test-all-set-default-field',
      name: 'Default Field Test',
      description: '',
      icon: '🔧',
      trigger: { type: 'exercise_completed' },
      condition: { aggregate: 'all_in_set', set: ['ex-1', 'ex-2'] }, // no field!
      xpReward: 0,
    };
    const state = createEmptyState();

    const makeExEvent = (exerciseId: string): PersistedEvent => ({
      id: `e-${exerciseId}`,
      type: 'exercise_completed',
      timestamp: Date.now(),
      payload: { exerciseId, moduleId: 'ccna' },
    });

    // Exercises present by exerciseId (the default field) → should return true
    const history = [makeExEvent('ex-1'), makeExEvent('ex-2')];
    expect(evaluateRule(rule, history, state)).toBe(true);
  });

  it('returns false when default-field exercises are missing', () => {
    const rule: AchievementRule = {
      id: 'test-all-set-default-missing',
      name: 'Missing',
      description: '',
      icon: '❌',
      trigger: { type: 'exercise_completed' },
      condition: { aggregate: 'all_in_set', set: ['ex-1', 'ex-2'] },
      xpReward: 0,
    };
    const state = createEmptyState();

    const makeExEvent = (exerciseId: string): PersistedEvent => ({
      id: `e-${exerciseId}`,
      type: 'exercise_completed',
      timestamp: Date.now(),
      payload: { exerciseId, moduleId: 'ccna' },
    });

    expect(evaluateRule(rule, [makeExEvent('ex-1')], state)).toBe(false);
  });
});

describe('evaluateRule - threshold: 0 edge case', () => {
  it('count with threshold=0 triggers immediately (even with empty history)', () => {
    const rule: AchievementRule = {
      id: 'zero-threshold',
      name: 'Zero',
      description: '',
      icon: '0️⃣',
      trigger: { type: 'any' },
      condition: { aggregate: 'count', threshold: 0 },
      xpReward: 0,
    };
    // 0 events: 0 >= 0 → true
    expect(evaluateRule(rule, [], createEmptyState())).toBe(true);
  });

  it('count_distinct with threshold=0 triggers immediately', () => {
    const rule: AchievementRule = {
      id: 'zero-distinct',
      name: 'Zero Distinct',
      description: '',
      icon: '0️⃣',
      trigger: { type: 'topic_completed' },
      condition: { aggregate: 'count_distinct', field: 'topicId', threshold: 0 },
      xpReward: 0,
    };
    expect(evaluateRule(rule, [], createEmptyState())).toBe(true);
  });
});

describe('checkAllAchievements - two achievements from same event', () => {
  beforeEach(() => {
    gamificationBus.unsubscribeAll();
  });

  afterEach(() => {
    gamificationBus.unsubscribeAll();
  });

  it('first-topic and first-step-distinct both unlock from the same topic_completed event', () => {
    const emitted: string[] = [];
    gamificationBus.subscribe('achievement_unlocked', (e) => {
      emitted.push((e.payload as AchievementUnlockedPayload).achievementId);
    });

    const stateWithHistory: ProgressState = {
      ...createEmptyState(),
      eventHistory: [makePersistedTopicEvent('t1', 'm1')],
    };
    const triggerEvent = makeGamificationEvent('topic_completed', {
      topicId: 't1', moduleId: 'm1', estimatedMinutes: 10,
    });

    const result = checkAllAchievements(stateWithHistory, triggerEvent);

    expect(result.unlockedAchievementIds).toContain('first-topic');
    expect(result.unlockedAchievementIds).toContain('first-step-distinct');
    expect(emitted).toContain('first-topic');
    expect(emitted).toContain('first-step-distinct');

    // Order is deterministic: follows ACHIEVEMENT_RULES array order
    // first-topic (index 0) is emitted before first-step-distinct (last in array)
    expect(emitted.indexOf('first-topic')).toBeLessThan(emitted.indexOf('first-step-distinct'));
  });

  it('already-unlocked achievement is not awarded twice', () => {
    const stateAlreadyUnlocked: ProgressState = {
      ...createEmptyState(),
      unlockedAchievementIds: ['first-topic'],
      eventHistory: [makePersistedTopicEvent('t1', 'm1')],
    };
    const triggerEvent = makeGamificationEvent('topic_completed', {
      topicId: 't2', moduleId: 'm1', estimatedMinutes: 10,
    });

    const result = checkAllAchievements(stateAlreadyUnlocked, triggerEvent);
    expect(result.unlockedAchievementIds.filter(id => id === 'first-topic')).toHaveLength(1);
  });
});

describe('evaluateRule - performance smoke test', () => {
  it('processes 1000 events in under 100ms', () => {
    const rule: AchievementRule = {
      id: 'perf-test',
      name: 'Performance',
      description: '',
      icon: '⚡',
      trigger: { type: 'topic_completed' },
      condition: { aggregate: 'count_distinct', field: 'topicId', threshold: 1 },
      xpReward: 0,
    };
    const state = createEmptyState();
    const history: PersistedEvent[] = Array.from({ length: 1000 }, (_, i) =>
      makePersistedTopicEvent(`t${i}`, 'm1')
    );

    const start = performance.now();
    evaluateRule(rule, history, state);
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(100);
  });
});

describe('evaluateRule - getEventField returns undefined (no matching field)', () => {
  it('applyFieldFilter excludes events where the filterField is absent from payload', () => {
    const rule: AchievementRule = {
      id: 'filter-absent-field',
      name: 'Test',
      description: '',
      icon: '🧪',
      trigger: { type: 'quiz_completed' },
      condition: { aggregate: 'count', threshold: 1, filterField: 'nonexistentField', filterValue: 'x' },
      xpReward: 0,
    };
    // Event payload has no 'nonexistentField' → getEventField returns undefined → filtered out
    const history = [makePersistedQuizEvent('q1', 80, true)];
    expect(evaluateRule(rule, history, createEmptyState())).toBe(false);
  });

  it('all_in_set skips events where the field value is not a string', () => {
    const rule: AchievementRule = {
      id: 'all-in-set-non-string',
      name: 'Test',
      description: '',
      icon: '🔢',
      trigger: { type: 'exercise_completed' },
      condition: { aggregate: 'all_in_set', set: ['ex-1'] },
      xpReward: 0,
    };
    // exerciseId is a number instead of string → not added to seenIds → set never complete
    const badEvent = {
      id: 'e1',
      type: 'exercise_completed' as const,
      timestamp: Date.now(),
      payload: { exerciseId: 42, moduleId: 'ccna' }, // number, not string
    } as unknown as PersistedEvent;
    expect(evaluateRule(rule, [badEvent], createEmptyState())).toBe(false);
  });
});

describe('evaluateRule - count_distinct per_module with non-string moduleId', () => {
  it('falls back to "unknown" bucket when moduleId is not a string', () => {
    const rule: AchievementRule = {
      id: 'per-module-nonstring-id',
      name: 'Module Master',
      description: '',
      icon: '🎓',
      trigger: { type: 'topic_completed' },
      condition: { aggregate: 'count_distinct', field: 'topicId', scope: 'per_module', threshold: 2 },
      xpReward: 0,
    };
    // Both events have a non-string moduleId — they land in the 'unknown' bucket together
    const event1 = {
      id: 'e1', type: 'topic_completed' as const, timestamp: Date.now(),
      payload: { topicId: 't1', moduleId: 99, estimatedMinutes: 5 },
    } as unknown as PersistedEvent;
    const event2 = {
      id: 'e2', type: 'topic_completed' as const, timestamp: Date.now(),
      payload: { topicId: 't2', moduleId: null, estimatedMinutes: 5 },
    } as unknown as PersistedEvent;
    // 'unknown' bucket has ['t1','t2'] → size 2 >= 2 → true
    expect(evaluateRule(rule, [event1, event2], createEmptyState())).toBe(true);
  });

  it('fieldVal undefined branch: skips events where the distinct field is missing', () => {
    const rule: AchievementRule = {
      id: 'per-module-missing-field',
      name: 'Module Master',
      description: '',
      icon: '🎓',
      trigger: { type: 'topic_completed' },
      condition: { aggregate: 'count_distinct', field: 'topicId', scope: 'per_module', threshold: 1 },
      xpReward: 0,
    };
    // Event has no topicId → getEventField returns undefined → skipped → empty set → false
    const eventNoTopic = {
      id: 'e1', type: 'topic_completed' as const, timestamp: Date.now(),
      payload: { moduleId: 'ccna', estimatedMinutes: 5 }, // no topicId!
    } as unknown as PersistedEvent;
    expect(evaluateRule(rule, [eventNoTopic], createEmptyState())).toBe(false);
  });
});

describe('evaluateRule - useCrossReferences with non-string moduleId', () => {
  afterEach(() => {
    mockFindRelatedConcepts.mockReset();
    mockFindRelatedConcepts.mockReturnValue([]);
  });

  it('skips events where moduleId is not a string in the useCrossReferences path', () => {
    const rule: AchievementRule = {
      id: 'bridge-nonstring-module',
      name: 'Bridge',
      description: '',
      icon: '🌉',
      trigger: { type: 'topic_completed' },
      condition: { aggregate: 'count_distinct', field: 'moduleId', threshold: 2, useCrossReferences: true },
      xpReward: 0,
    };
    // Event with numeric moduleId — not added to moduleIds Set → size stays 0 → false
    const badEvent = {
      id: 'e1', type: 'topic_completed' as const, timestamp: Date.now(),
      payload: { topicId: 'subnetting', moduleId: 123, estimatedMinutes: 5 },
    } as unknown as PersistedEvent;
    expect(evaluateRule(rule, [badEvent], createEmptyState())).toBe(false);
  });
});

describe('evaluateRule - ?? default fallbacks (threshold, hourMin, hourMax)', () => {
  it('consecutive_days without threshold defaults to 1', () => {
    const rule: AchievementRule = {
      id: 'consec-no-threshold',
      name: 'Streak',
      description: '',
      icon: '🔥',
      trigger: { type: 'any' },
      condition: { aggregate: 'consecutive_days' }, // no threshold → defaults to 1
      xpReward: 0,
    };
    const stateWithStreak: ProgressState = {
      ...createEmptyState(),
      streak: { ...createEmptyState().streak, currentStreak: 1 },
    };
    expect(evaluateRule(rule, [], stateWithStreak)).toBe(true);
  });

  it('time_of_day without hourMin/hourMax/threshold uses defaults (0, 24, 1)', () => {
    const rule: AchievementRule = {
      id: 'time-defaults',
      name: 'Any Time',
      description: '',
      icon: '🕐',
      trigger: { type: 'any' },
      // No hourMin → defaults 0, no hourMax → defaults 24, no threshold → defaults 1
      condition: { aggregate: 'time_of_day' },
      xpReward: 0,
    };
    // Any event will fall within hours 0–24 → should count
    const event: PersistedEvent = {
      id: 'e1',
      type: 'topic_completed',
      timestamp: new Date('2024-01-01T14:00:00').getTime(),
      payload: { topicId: 't1', moduleId: 'm1', estimatedMinutes: 5 },
    };
    expect(evaluateRule(rule, [event], createEmptyState())).toBe(true);
  });
});


describe('checkAllAchievements', () => {
  beforeEach(() => {
    gamificationBus.unsubscribeAll();
  });

  afterEach(() => {
    gamificationBus.unsubscribeAll();
  });

  it('achievement only unlocked once', () => {
    const stateWithHistory: ProgressState = {
      ...createEmptyState(),
      eventHistory: [makePersistedTopicEvent('t1', 'm1')],
    };
    const triggerEvent = makeGamificationEvent('topic_completed', { topicId: 't1', moduleId: 'm1', estimatedMinutes: 10 });
    const s1 = checkAllAchievements(stateWithHistory, triggerEvent);
    expect(s1.unlockedAchievementIds).toContain('first-topic');
    const s2 = checkAllAchievements(s1, triggerEvent);
    expect(s2.unlockedAchievementIds.filter(id => id === 'first-topic')).toHaveLength(1);
  });

  it('achievement_unlocked event emitted on bus', () => {
    const fn = vi.fn();
    gamificationBus.subscribe('achievement_unlocked', fn);
    const stateWithHistory: ProgressState = {
      ...createEmptyState(),
      eventHistory: [makePersistedTopicEvent('t1', 'm1')],
    };
    const triggerEvent = makeGamificationEvent('topic_completed', { topicId: 't1', moduleId: 'm1', estimatedMinutes: 10 });
    checkAllAchievements(stateWithHistory, triggerEvent);
    expect(fn).toHaveBeenCalled();
  });

  it('xpReward added to state', () => {
    const stateWithHistory: ProgressState = {
      ...createEmptyState(),
      eventHistory: [makePersistedTopicEvent('t1', 'm1')],
    };
    const triggerEvent = makeGamificationEvent('topic_completed', { topicId: 't1', moduleId: 'm1', estimatedMinutes: 10 });
    const s = checkAllAchievements(stateWithHistory, triggerEvent);
    expect(s.xpTotal).toBeGreaterThan(0);
  });
});
