import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { xpToLevel, calculateXpForEvent, applyXpEvent } from '@/lib/gamification/state/xp-engine';
import { gamificationBus } from '@/lib/gamification/events/event-bus';
import { createEmptyState } from '@/lib/gamification/state/progress-store';
import type { GamificationEvent } from '@/lib/gamification/events/event-types';
import type { ProgressState } from '@/lib/gamification/types';

function makeTopicEvent(): GamificationEvent {
  return { id: 'e1', type: 'topic_completed', timestamp: Date.now(), payload: { topicId: 't1', moduleId: 'm1', estimatedMinutes: 10 } };
}
function makeQuizEvent(score: number, passed = score >= 70): GamificationEvent {
  return { id: 'e2', type: 'quiz_completed', timestamp: Date.now(), payload: { quizId: 'q1', moduleId: 'm1', score, correctAnswers: 8, totalQuestions: 10, passed } };
}
function makeQuestionEvent(correct: boolean): GamificationEvent {
  return { id: 'e3', type: 'question_answered', timestamp: Date.now(), payload: { questionId: 'q1', quizId: 'quiz1', correct } };
}
function makeExerciseEvent(): GamificationEvent {
  return { id: 'e4', type: 'exercise_completed', timestamp: Date.now(), payload: { exerciseId: 'ex1', moduleId: 'm1' } };
}
function makeWarmupEvent(): GamificationEvent {
  return { id: 'e5', type: 'daily_warmup', timestamp: Date.now(), payload: { date: '2024-01-15' } };
}

describe('xpToLevel', () => {
  it('xp=0 → level 1', () => expect(xpToLevel(0)).toBe(1));
  it('xp=199 → level 1', () => expect(xpToLevel(199)).toBe(1));
  it('xp=200 → level 2', () => expect(xpToLevel(200)).toBe(2));
  it('xp=201 → level 2', () => expect(xpToLevel(201)).toBe(2));
  it('xp=500 → level 3', () => expect(xpToLevel(500)).toBe(3));
  it('xp=15000 → level 10', () => expect(xpToLevel(15000)).toBe(10));
  it('xp=99999 → level 10 (max)', () => expect(xpToLevel(99999)).toBe(10));
});

describe('calculateXpForEvent', () => {
  let state: ProgressState;
  beforeEach(() => { state = createEmptyState(); });

  it('topic_completed → 50 XP', () => {
    const entry = calculateXpForEvent(makeTopicEvent(), state);
    expect(entry?.amount).toBe(50);
  });

  it('question_answered correct=true → 10 XP', () => {
    const entry = calculateXpForEvent(makeQuestionEvent(true), state);
    expect(entry?.amount).toBe(10);
  });

  it('question_answered correct=false → null', () => {
    expect(calculateXpForEvent(makeQuestionEvent(false), state)).toBeNull();
  });

  it('quiz_completed score=100 → 100 XP', () => {
    expect(calculateXpForEvent(makeQuizEvent(100), state)?.amount).toBe(100);
  });

  it('quiz_completed score=85 → 50 XP', () => {
    expect(calculateXpForEvent(makeQuizEvent(85), state)?.amount).toBe(50);
  });

  it('quiz_completed score=70 → null', () => {
    expect(calculateXpForEvent(makeQuizEvent(70), state)).toBeNull();
  });

  it('exercise_completed → 75 XP', () => {
    expect(calculateXpForEvent(makeExerciseEvent(), state)?.amount).toBe(75);
  });

  it('daily_warmup first time today → 20 XP', () => {
    vi.setSystemTime(new Date('2024-01-15T10:00:00'));
    expect(calculateXpForEvent(makeWarmupEvent(), state)?.amount).toBe(20);
    vi.useRealTimers();
  });

  it('daily_warmup second time same day → null', () => {
    vi.setSystemTime(new Date('2024-01-15T10:00:00'));
    const stateWithWarmup: ProgressState = {
      ...state,
      eventHistory: [{
        id: 'w1',
        type: 'daily_warmup',
        timestamp: new Date('2024-01-15T08:00:00').getTime(),
        payload: { date: '2024-01-15' },
      }],
    };
    expect(calculateXpForEvent(makeWarmupEvent(), stateWithWarmup)).toBeNull();
    vi.useRealTimers();
  });
  it('unknown event type → null', () => {
    const unknownEvent: GamificationEvent = {
      id: 'e99',
      type: 'streak_updated' as GamificationEvent['type'],
      timestamp: Date.now(),
      payload: { currentStreak: 1, longestStreak: 1, date: '2024-01-15' },
    };
    expect(calculateXpForEvent(unknownEvent, createEmptyState())).toBeNull();
  });
});

describe('applyXpEvent', () => {
  let state: ProgressState;

  beforeEach(() => {
    state = createEmptyState();
    gamificationBus.unsubscribeAll();
  });

  afterEach(() => {
    gamificationBus.unsubscribeAll();
  });

  it('xpTotal increases correctly', () => {
    const newState = applyXpEvent(state, makeTopicEvent());
    expect(newState.xpTotal).toBe(50);
  });

  it('level increases when threshold crossed', () => {
    const stateNearLevel2: ProgressState = { ...state, xpTotal: 190 };
    const newState = applyXpEvent(stateNearLevel2, makeTopicEvent());
    expect(newState.level).toBe(2);
  });

  it('level_up event emitted on gamificationBus when level increases', () => {
    const fn = vi.fn();
    gamificationBus.subscribe('level_up', fn);
    const stateNearLevel2: ProgressState = { ...state, xpTotal: 190 };
    applyXpEvent(stateNearLevel2, makeTopicEvent());
    expect(fn).toHaveBeenCalledOnce();
  });

  it('no level_up event when level stays same', () => {
    const fn = vi.fn();
    gamificationBus.subscribe('level_up', fn);
    applyXpEvent(state, makeTopicEvent()); // 50 XP, stays level 1
    expect(fn).not.toHaveBeenCalled();
  });
});
