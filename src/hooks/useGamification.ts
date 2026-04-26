import { useEffect, useRef, useState } from 'react';
import { progressStore } from '@/lib/gamification/state/progress-store';
import { gamificationBus } from '@/lib/gamification/events/event-bus';
import { applyXpEvent } from '@/lib/gamification/state/xp-engine';
import { updateStreak } from '@/lib/gamification/state/streak-engine';
import { checkAllAchievements } from '@/lib/gamification/state/achievement-engine';
import { showAchievementToast } from '@/lib/gamification/notifications';
import { ACHIEVEMENT_RULES } from '@/lib/gamification/rules/achievement-rules';
import type { ProgressState } from '@/lib/gamification/types';
import type { GamificationEvent, AchievementUnlockedPayload } from '@/lib/gamification/events/event-types';
import { getClock } from '@/lib/gamification/clock';
import { xpToLevel } from '@/lib/gamification/state/xp-engine';

export function useGamification(): {
  state: ProgressState;
  emitEvent: (event: Omit<GamificationEvent, 'id' | 'timestamp'>) => void;
} {
  const [state, setState] = useState<ProgressState>(() => progressStore.load());
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const unsub = gamificationBus.subscribe('achievement_unlocked', (event) => {
      if (event.type === 'achievement_unlocked') {
        const p = event.payload as AchievementUnlockedPayload;
        const rule = ACHIEVEMENT_RULES.find(r => r.id === p.achievementId);
        showAchievementToast(p.achievementName, rule?.icon ?? '🏆', p.xpReward);
      }
    });
    return unsub;
  }, []);

  const emitEvent = (partial: Omit<GamificationEvent, 'id' | 'timestamp'>) => {
    const event: GamificationEvent = {
      ...partial,
      id: `evt-${getClock().now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: getClock().now(),
    };

    setState(prev => {
      let newState = applyXpEvent(prev, event);
      newState = updateStreak(newState, event);
      newState = checkAllAchievements(newState, event);
      newState = {
        ...newState,
        eventHistory: [...newState.eventHistory, {
          id: event.id,
          type: event.type,
          timestamp: event.timestamp,
          payload: event.payload,
        }],
        lastUpdated: getClock().now(),
        level: xpToLevel(newState.xpTotal),
      };
      progressStore.save(newState);
      return newState;
    });

    gamificationBus.emit(event);
  };

  return { state, emitEvent };
}
