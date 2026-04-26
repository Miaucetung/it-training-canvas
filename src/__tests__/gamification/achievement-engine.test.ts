import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { evaluateRule, checkAllAchievements } from '@/lib/gamification/state/achievement-engine';
import { gamificationBus } from '@/lib/gamification/events/event-bus';
import { createEmptyState } from '@/lib/gamification/state/progress-store';
import type { AchievementRule, PersistedEvent } from '@/lib/gamification/types';
import type { GamificationEvent } from '@/lib/gamification/events/event-types';
import type { ProgressState } from '@/lib/gamification/types';

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

describe('evaluateRule - count_distinct without field', () => {
  it('returns false when field is not specified', () => {
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
