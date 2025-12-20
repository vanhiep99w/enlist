export interface UserCredits {
  userId: number;
  credits: number;
  totalPoints: number;
  sessionsCompleted: number;
}

export interface SpendCreditsRequest {
  userId: number;
  amount?: number;
  reason?: string;
}

export interface SpendCreditsResponse {
  success: boolean;
  remainingCredits: number;
  message: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress?: number;
  target?: number;
}

export type AchievementType =
  | 'day_streak'
  | 'bright_mind'
  | 'perfect_score'
  | 'speed_demon'
  | 'first_session'
  | 'points_milestone';

export interface DailyProgress {
  dailyGoal: number;
  progressCount: number;
  goalAchieved: boolean;
  percentage: number;
  lastResetDate: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
}

export interface UserAchievement {
  id: number;
  userId: number;
  achievementId: number;
  unlockedAt: string;
}
