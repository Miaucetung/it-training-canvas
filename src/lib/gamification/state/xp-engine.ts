import { XP_VALUES, LEVEL_THRESHOLDS } from '../rules/xp-rules';
import type { ProgressState, XpEntry } from '../types';
import type { GamificationEvent, QuizCompletedPayload, QuestionAnsweredPayload } from '../events/event-types';
import { gamificationBus } from '../events/event-bus';
import { getClock } from '../clock';

export function xpToLevel(xp: number): number {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return level;
}

export function calculateXpForEvent(
  event: GamificationEvent,
  state: ProgressState
): XpEntry | null {
  const now = getClock().now();

  switch (event.type) {
    case 'topic_completed': {
      return { amount: XP_VALUES.TOPIC_COMPLETED, reason: 'Topic abgeschlossen', timestamp: now };
    }
    case 'exercise_completed': {
      return { amount: XP_VALUES.EXERCISE_COMPLETED, reason: 'Übung abgeschlossen', timestamp: now };
    }
    case 'question_answered': {
      const p = event.payload as QuestionAnsweredPayload;
      if (!p.correct) return null;
      return { amount: XP_VALUES.QUESTION_CORRECT, reason: 'Frage richtig beantwortet', timestamp: now };
    }
    case 'quiz_completed': {
      const p = event.payload as QuizCompletedPayload;
      if (p.score === 100) {
        return { amount: XP_VALUES.QUIZ_BONUS_100, reason: 'Quiz mit 100% abgeschlossen', timestamp: now };
      } else if (p.score >= 80) {
        return { amount: XP_VALUES.QUIZ_BONUS_80, reason: 'Quiz mit ≥80% abgeschlossen', timestamp: now };
      }
      return null;
    }
    case 'daily_warmup': {
      const today = getClock().today();
      const alreadyToday = state.eventHistory.some(e => {
        if (e.type !== 'daily_warmup') return false;
        const d = new Date(e.timestamp);
        const y = d.getFullYear();
        const mo = String(d.getMonth() + 1).padStart(2, '0');
        const da = String(d.getDate()).padStart(2, '0');
        return `${y}-${mo}-${da}` === today;
      });
      if (alreadyToday) return null;
      return { amount: XP_VALUES.DAILY_WARMUP, reason: 'Tägliches Warmup', timestamp: now };
    }
    default:
      return null;
  }
}

export function applyXpEvent(
  state: ProgressState,
  event: GamificationEvent
): ProgressState {
  const entry = calculateXpForEvent(event, state);
  if (!entry) return state;

  const newXpTotal = state.xpTotal + entry.amount;
  const oldLevel = state.level;
  const newLevel = xpToLevel(newXpTotal);

  const newState: ProgressState = {
    ...state,
    xpTotal: newXpTotal,
    level: newLevel,
    lastUpdated: getClock().now(),
  };

  if (newLevel > oldLevel) {
    gamificationBus.emit({
      id: `level-up-${getClock().now()}`,
      type: 'level_up',
      timestamp: getClock().now(),
      payload: {
        fromLevel: oldLevel,
        toLevel: newLevel,
        totalXp: newXpTotal,
      },
    });
  }

  return newState;
}
