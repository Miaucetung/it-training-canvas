import type { ProgressState } from '../types';
import type { GamificationEvent, GamificationEventType } from '../events/event-types';
import { getClock } from '../clock';

const STREAK_ELIGIBLE_TYPES: Set<GamificationEventType> = new Set([
  'topic_completed',
  'quiz_completed',
  'exercise_completed',
]);

function getISOWeek(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const thursday = new Date(date);
  thursday.setDate(date.getDate() - (date.getDay() + 6) % 7 + 3);
  const firstThursday = new Date(thursday.getFullYear(), 0, 4);
  const weekNum = Math.round(((thursday.getTime() - firstThursday.getTime()) / 86400000 - 3 + (firstThursday.getDay() + 6) % 7) / 7) + 1;
  return `${thursday.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00').getTime();
  const db = new Date(b + 'T00:00:00').getTime();
  return Math.round(Math.abs(db - da) / 86400000);
}

export function updateStreak(
  state: ProgressState,
  event: GamificationEvent
): ProgressState {
  if (!STREAK_ELIGIBLE_TYPES.has(event.type)) return state;

  const today = getClock().today();
  const last = state.streak.lastActivityDate;

  if (last === today) {
    return state;
  }

  let newStreak = state.streak.currentStreak;

  if (last === null) {
    newStreak = 1;
  } else {
    const diff = daysBetween(last, today);
    if (diff === 1) {
      newStreak = state.streak.currentStreak + 1;
    } else if (diff === 2 && state.streak.freezeUsedThisWeek) {
      // Streak freeze covers exactly one missed day
      newStreak = state.streak.currentStreak + 1;
    } else {
      newStreak = 1;
    }
  }

  const newLongest = Math.max(state.streak.longestStreak, newStreak);

  return {
    ...state,
    streak: {
      ...state.streak,
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActivityDate: today,
    },
  };
}

export function getCurrentStreak(state: ProgressState): number {
  return state.streak.currentStreak;
}

export function getLongestStreak(state: ProgressState): number {
  return state.streak.longestStreak;
}

export function useStreakFreeze(
  state: ProgressState,
  featureFlagEnabled = false
): ProgressState {
  if (!featureFlagEnabled) return state;
  if (state.streak.freezeUsedThisWeek) return state;

  return {
    ...state,
    streak: {
      ...state.streak,
      freezeUsedThisWeek: true,
    },
  };
}

export function resetWeeklyFreezeIfNeeded(state: ProgressState): ProgressState {
  const today = getClock().today();
  const lastDate = state.streak.lastActivityDate;
  if (!lastDate) return state;

  const currentWeek = getISOWeek(today);
  const lastWeek = getISOWeek(lastDate);

  if (currentWeek !== lastWeek) {
    return {
      ...state,
      streak: {
        ...state.streak,
        freezeUsedThisWeek: false,
      },
    };
  }
  return state;
}
