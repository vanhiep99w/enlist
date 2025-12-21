import { authAxios } from './authApi';
import type {
  UserCredits,
  SpendCreditsRequest,
  SpendCreditsResponse,
  DailyProgress,
  StreakData,
  UserAchievement,
} from '../types/user';

export async function getUserCredits(): Promise<UserCredits> {
  const response = await authAxios.get<UserCredits>(`/users/credits`);
  return response.data;
}

export async function spendCredits(request: SpendCreditsRequest): Promise<SpendCreditsResponse> {
  const response = await authAxios.post<SpendCreditsResponse>('/users/credits/spend', request);
  return response.data;
}

export async function getDailyProgress(): Promise<DailyProgress> {
  const response = await authAxios.get<DailyProgress>(`/users/daily-progress`);
  return response.data;
}

export async function setDailyGoal(dailyGoal: number): Promise<DailyProgress> {
  const response = await authAxios.put<DailyProgress>(`/users/daily-goal`, {
    dailyGoal,
  });
  return response.data;
}

export async function getStreak(): Promise<StreakData> {
  const response = await authAxios.get<StreakData>(`/users/streak`);
  return response.data;
}

export async function getUserAchievements(): Promise<UserAchievement[]> {
  const response = await authAxios.get<UserAchievement[]>(`/users/achievements`);
  return response.data;
}
