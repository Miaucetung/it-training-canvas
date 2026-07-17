export type GamificationEventType =
  | 'topic_completed'
  | 'quiz_completed'
  | 'question_answered'
  | 'exercise_completed'
  | 'daily_warmup'
  | 'level_up'
  | 'achievement_unlocked'
  | 'streak_updated';

export interface TopicCompletedPayload {
  topicId: string;
  moduleId: string;
  estimatedMinutes: number;
}

export interface QuizCompletedPayload {
  quizId: string;
  moduleId: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  passed: boolean;
}

export interface QuestionAnsweredPayload {
  questionId: string;
  quizId: string;
  correct: boolean;
}

export interface ExerciseCompletedPayload {
  exerciseId: string;
  moduleId: string;
}

export interface DailyWarmupPayload {
  date: string;
}

export interface LevelUpPayload {
  fromLevel: number;
  toLevel: number;
  totalXp: number;
}

export interface AchievementUnlockedPayload {
  achievementId: string;
  achievementName: string;
  xpReward: number;
}

export interface StreakUpdatedPayload {
  currentStreak: number;
  longestStreak: number;
  date: string;
}

export type EventPayload =
  | TopicCompletedPayload
  | QuizCompletedPayload
  | QuestionAnsweredPayload
  | ExerciseCompletedPayload
  | DailyWarmupPayload
  | LevelUpPayload
  | AchievementUnlockedPayload
  | StreakUpdatedPayload;

export interface GamificationEvent {
  id: string;
  type: GamificationEventType;
  timestamp: number;
  payload: EventPayload;
}
