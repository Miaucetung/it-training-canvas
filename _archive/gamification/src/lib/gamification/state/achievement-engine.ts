import { ACHIEVEMENT_RULES } from '../rules/achievement-rules';
import type { AchievementRule, ProgressState, AchievementCondition, PersistedEvent } from '../types';
import type { GamificationEvent } from '../events/event-types';
import { gamificationBus } from '../events/event-bus';
import { findRelatedConcepts } from '@/lib/content/cross-references';
import { getClock } from '../clock';

function getEventField(event: PersistedEvent, field: string): string | number | boolean | undefined {
  const payload = event.payload as unknown as Record<string, unknown>;
  const val = payload[field];
  if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return val;
  return undefined;
}

function filterRelevantEvents(
  history: PersistedEvent[],
  triggerType: GamificationEvent['type'] | 'any'
): PersistedEvent[] {
  if (triggerType === 'any') return history;
  return history.filter(e => e.type === triggerType);
}

function applyFieldFilter(events: PersistedEvent[], condition: AchievementCondition): PersistedEvent[] {
  if (condition.filterField === undefined) return events;
  return events.filter(e => getEventField(e, condition.filterField!) === condition.filterValue);
}

export function evaluateRule(
  rule: AchievementRule,
  history: PersistedEvent[],
  currentState: ProgressState
): boolean {
  const { condition } = rule;
  const triggerType = rule.trigger.type;

  switch (condition.aggregate) {
    case 'count': {
      let relevant = filterRelevantEvents(history, triggerType);
      relevant = applyFieldFilter(relevant, condition);
      return relevant.length >= (condition.threshold ?? 1);
    }

    case 'count_distinct': {
      if (condition.useCrossReferences) {
        const topicEvents = history.filter(e => e.type === 'topic_completed');
        const moduleIds = new Set<string>();
        for (const e of topicEvents) {
          const payload = e.payload as unknown as Record<string, unknown>;
          if (typeof payload['moduleId'] === 'string') {
            moduleIds.add(payload['moduleId'] as string);
          }
        }
        if (moduleIds.size < 2) return false;
        const moduleArr = Array.from(moduleIds);
        for (let i = 0; i < moduleArr.length; i++) {
          for (let j = i + 1; j < moduleArr.length; j++) {
            const topicsInModuleI = topicEvents.filter(e => {
              const p = e.payload as unknown as Record<string, unknown>;
              return p['moduleId'] === moduleArr[i];
            });
            for (const topicEvent of topicsInModuleI) {
              const p = topicEvent.payload as unknown as Record<string, unknown>;
              const topicId = p['topicId'] as string;
              const related = findRelatedConcepts(topicId, moduleArr[j]);
              if (related.length > 0) return true;
            }
          }
        }
        return false;
      }

      let relevant = filterRelevantEvents(history, triggerType);
      relevant = applyFieldFilter(relevant, condition);

      if (!condition.field) return false;

      if (condition.scope === 'per_module') {
        const byModule = new Map<string, Set<string>>();
        for (const e of relevant) {
          const payload = e.payload as unknown as Record<string, unknown>;
          const moduleId = typeof payload['moduleId'] === 'string' ? payload['moduleId'] as string : 'unknown';
          const fieldVal = getEventField(e, condition.field);
          if (fieldVal !== undefined) {
            if (!byModule.has(moduleId)) byModule.set(moduleId, new Set());
            byModule.get(moduleId)!.add(String(fieldVal));
          }
        }
        for (const [, vals] of byModule) {
          if (vals.size >= (condition.threshold ?? 1)) return true;
        }
        return false;
      }

      const distinctVals = new Set<string>();
      for (const e of relevant) {
        const val = getEventField(e, condition.field);
        if (val !== undefined) distinctVals.add(String(val));
      }
      return distinctVals.size >= (condition.threshold ?? 1);
    }

    case 'consecutive_days': {
      return currentState.streak.currentStreak >= (condition.threshold ?? 1);
    }

    case 'all_in_set': {
      if (!condition.set || condition.set.length === 0) return false;
      const relevant = filterRelevantEvents(history, triggerType);
      const field = condition.field ?? 'exerciseId';
      const seenIds = new Set<string>();
      for (const e of relevant) {
        const val = getEventField(e, field);
        if (typeof val === 'string') seenIds.add(val);
      }
      return condition.set.every(id => seenIds.has(id));
    }

    case 'time_of_day': {
      let relevant = filterRelevantEvents(history, triggerType);
      const hourMin = condition.hourMin ?? 0;
      const hourMax = condition.hourMax ?? 24;
      relevant = relevant.filter(e => {
        const hour = new Date(e.timestamp).getHours();
        return hour >= hourMin && hour < hourMax;
      });
      return relevant.length >= (condition.threshold ?? 1);
    }

    default:
      return false;
  }
}

export function checkAllAchievements(
  state: ProgressState,
  triggerEvent: GamificationEvent
): ProgressState {
  let newState = state;

  for (const rule of ACHIEVEMENT_RULES) {
    if (newState.unlockedAchievementIds.includes(rule.id)) continue;

    if (rule.trigger.type !== 'any' && rule.trigger.type !== triggerEvent.type) continue;

    const persistedEvent: PersistedEvent = {
      id: triggerEvent.id,
      type: triggerEvent.type,
      timestamp: triggerEvent.timestamp,
      payload: triggerEvent.payload,
    };

    const historyWithEvent = [...newState.eventHistory, persistedEvent];

    if (evaluateRule(rule, historyWithEvent, newState)) {
      newState = {
        ...newState,
        unlockedAchievementIds: [...newState.unlockedAchievementIds, rule.id],
        xpTotal: newState.xpTotal + rule.xpReward,
      };

      gamificationBus.emit({
        id: `achievement-${rule.id}-${getClock().now()}`,
        type: 'achievement_unlocked',
        timestamp: getClock().now(),
        payload: {
          achievementId: rule.id,
          achievementName: rule.name,
          xpReward: rule.xpReward,
        },
      });
    }
  }

  return newState;
}
