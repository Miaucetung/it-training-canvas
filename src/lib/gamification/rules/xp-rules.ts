export const XP_VALUES = {
  TOPIC_COMPLETED: 50,
  QUESTION_CORRECT: 10,
  QUESTION_INCORRECT: 0,
  QUIZ_BONUS_80: 50,
  QUIZ_BONUS_100: 100,
  EXERCISE_COMPLETED: 75,
  DAILY_WARMUP: 20,
} as const;

export const LEVEL_THRESHOLDS: readonly number[] = [
  0,
  200,
  500,
  1000,
  2000,
  3500,
  5500,
  8000,
  11000,
  15000,
] as const;
