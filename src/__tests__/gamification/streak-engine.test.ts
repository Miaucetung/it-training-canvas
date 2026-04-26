import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { updateStreak, getCurrentStreak, getLongestStreak, useStreakFreeze, resetWeeklyFreezeIfNeeded } from '@/lib/gamification/state/streak-engine';
import { setClock, resetClock } from '@/lib/gamification/clock';
import { createEmptyState } from '@/lib/gamification/state/progress-store';
import type { ProgressState } from '@/lib/gamification/types';
import type { GamificationEvent } from '@/lib/gamification/events/event-types';

function makeTopicEvent(date: string): GamificationEvent {
  return {
    id: 'e1',
    type: 'topic_completed',
    timestamp: new Date(date + 'T12:00:00').getTime(),
    payload: { topicId: 't1', moduleId: 'm1', estimatedMinutes: 10 },
  };
}

function makeLevelUpEvent(): GamificationEvent {
  return {
    id: 'e2',
    type: 'level_up',
    timestamp: Date.now(),
    payload: { fromLevel: 1, toLevel: 2, totalXp: 200 },
  };
}

function setDate(dateStr: string): void {
  setClock({ now: () => new Date(dateStr + 'T12:00:00').getTime(), today: () => dateStr });
}

describe('updateStreak', () => {
  let state: ProgressState;

  beforeEach(() => {
    state = createEmptyState();
  });

  afterEach(() => {
    resetClock();
  });

  it('first activity sets streak to 1', () => {
    setDate('2024-01-15');
    const newState = updateStreak(state, makeTopicEvent('2024-01-15'));
    expect(newState.streak.currentStreak).toBe(1);
    expect(newState.streak.lastActivityDate).toBe('2024-01-15');
  });

  it('same day activity does not increment streak', () => {
    setDate('2024-01-15');
    let s = updateStreak(state, makeTopicEvent('2024-01-15'));
    s = updateStreak(s, makeTopicEvent('2024-01-15'));
    expect(s.streak.currentStreak).toBe(1);
  });

  it('next day activity increments streak to 2', () => {
    setDate('2024-01-15');
    let s = updateStreak(state, makeTopicEvent('2024-01-15'));
    setDate('2024-01-16');
    s = updateStreak(s, makeTopicEvent('2024-01-16'));
    expect(s.streak.currentStreak).toBe(2);
  });

  it('2-day gap resets streak to 1', () => {
    setDate('2024-01-15');
    let s = updateStreak(state, makeTopicEvent('2024-01-15'));
    s = { ...s, streak: { ...s.streak, currentStreak: 5 } };
    setDate('2024-01-17');
    s = updateStreak(s, makeTopicEvent('2024-01-17'));
    expect(s.streak.currentStreak).toBe(1);
  });

  it('3-day gap resets streak to 1', () => {
    setDate('2024-01-15');
    let s = updateStreak(state, makeTopicEvent('2024-01-15'));
    s = { ...s, streak: { ...s.streak, currentStreak: 5 } };
    setDate('2024-01-18');
    s = updateStreak(s, makeTopicEvent('2024-01-18'));
    expect(s.streak.currentStreak).toBe(1);
  });

  it('non-eligible event type does not change streak', () => {
    setDate('2024-01-15');
    const s = updateStreak(state, makeLevelUpEvent());
    expect(s.streak.currentStreak).toBe(0);
  });

  it('tracks longest streak', () => {
    setDate('2024-01-15');
    let s = updateStreak(state, makeTopicEvent('2024-01-15'));
    setDate('2024-01-16');
    s = updateStreak(s, makeTopicEvent('2024-01-16'));
    setDate('2024-01-17');
    s = updateStreak(s, makeTopicEvent('2024-01-17'));
    expect(s.streak.longestStreak).toBe(3);
    setDate('2024-01-20');
    s = updateStreak(s, makeTopicEvent('2024-01-20'));
    expect(s.streak.currentStreak).toBe(1);
    expect(s.streak.longestStreak).toBe(3);
  });
});

describe('getLongestStreak', () => {
  it('returns longestStreak from state', () => {
    const state = createEmptyState();
    const s: ProgressState = { ...state, streak: { ...state.streak, longestStreak: 10 } };
    expect(getLongestStreak(s)).toBe(10);
  });
});

describe('useStreakFreeze', () => {
  let state: ProgressState;

  beforeEach(() => {
    state = createEmptyState();
  });

  it('does nothing when featureFlag=false', () => {
    const result = useStreakFreeze(state, false);
    expect(result).toBe(state);
  });

  it('sets freezeUsedThisWeek when featureFlag=true and not used', () => {
    const result = useStreakFreeze(state, true);
    expect(result.streak.freezeUsedThisWeek).toBe(true);
  });

  it('does nothing when freeze already used this week', () => {
    const frozenState: ProgressState = {
      ...state,
      streak: { ...state.streak, freezeUsedThisWeek: true },
    };
    const result = useStreakFreeze(frozenState, true);
    expect(result).toBe(frozenState);
  });
});

describe('getCurrentStreak', () => {
  it('returns currentStreak from state', () => {
    const state = createEmptyState();
    const s: ProgressState = { ...state, streak: { ...state.streak, currentStreak: 5 } };
    expect(getCurrentStreak(s)).toBe(5);
  });
});

describe('resetWeeklyFreezeIfNeeded', () => {
  afterEach(() => resetClock());

  it('resets freezeUsedThisWeek when week changes', () => {
    // Week 1: Monday Jan 15 2024
    setClock({ now: () => new Date('2024-01-22T12:00:00').getTime(), today: () => '2024-01-22' });
    const state = createEmptyState();
    const frozenState: ProgressState = {
      ...state,
      streak: { ...state.streak, freezeUsedThisWeek: true, lastActivityDate: '2024-01-15' },
    };
    const result = resetWeeklyFreezeIfNeeded(frozenState);
    expect(result.streak.freezeUsedThisWeek).toBe(false);
  });

  it('does NOT reset if still same week', () => {
    setClock({ now: () => new Date('2024-01-16T12:00:00').getTime(), today: () => '2024-01-16' });
    const state = createEmptyState();
    const frozenState: ProgressState = {
      ...state,
      streak: { ...state.streak, freezeUsedThisWeek: true, lastActivityDate: '2024-01-15' },
    };
    const result = resetWeeklyFreezeIfNeeded(frozenState);
    expect(result.streak.freezeUsedThisWeek).toBe(true);
  });

  it('returns state unchanged if no lastActivityDate', () => {
    const state = createEmptyState();
    const result = resetWeeklyFreezeIfNeeded(state);
    expect(result).toBe(state);
  });
});

describe('date boundary tests', () => {
  afterEach(() => resetClock());

  it('activity at 23:59 and 00:01 next day counts as two different days', () => {
    setClock({ now: () => new Date('2024-01-15T23:59:00').getTime(), today: () => '2024-01-15' });
    let state = createEmptyState();
    state = updateStreak(state, makeTopicEvent('2024-01-15'));
    expect(state.streak.currentStreak).toBe(1);

    setClock({ now: () => new Date('2024-01-16T00:01:00').getTime(), today: () => '2024-01-16' });
    state = updateStreak(state, makeTopicEvent('2024-01-16'));
    expect(state.streak.currentStreak).toBe(2);
  });
});
