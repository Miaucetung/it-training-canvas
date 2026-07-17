import type { GamificationEventType, EventPayload } from './events/event-types';

export type { GamificationEventType, EventPayload };

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  freezeAvailableAt: string | null;
  freezeUsedThisWeek: boolean;
}

export interface PersistedEvent {
  id: string;
  type: GamificationEventType;
  timestamp: number;
  payload: EventPayload;
}

export interface ProgressState {
  schemaVersion: number;
  userId: string;
  xpTotal: number;
  level: number;
  streak: StreakState;
  unlockedAchievementIds: string[];
  eventHistory: PersistedEvent[];
  lastUpdated: number;
  /** Added in schema v2 — tracks cumulative days with at least one activity */
  totalDaysActive?: number;
}

export interface XpEntry {
  amount: number;
  reason: string;
  timestamp: number;
}

export type AggregateType =
  | 'count'
  | 'count_distinct'
  | 'consecutive_days'
  | 'all_in_set'
  | 'time_of_day';

export interface AchievementCondition {
  aggregate: AggregateType;
  field?: string;
  scope?: 'global' | 'per_module';
  threshold?: number;
  set?: string[];
  hourMin?: number;
  hourMax?: number;
  filterField?: string;
  filterValue?: string | number | boolean;
  useCrossReferences?: boolean;
}

export interface AchievementRule {
  id: string;
  name: string;
  description: string;
  icon: string;
  trigger: { type: GamificationEventType | 'any' };
  condition: AchievementCondition;
  xpReward: number;
  secret?: boolean;
}

export interface UnlockedAchievement {
  ruleId: string;
  unlockedAt: number;
}

// Re-export GamificationEvent from event-types for convenience
export type { GamificationEvent } from './events/event-types';
