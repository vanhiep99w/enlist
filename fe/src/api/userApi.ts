import { authAxios } from './authApi';
import type {
  UserCredits,
  SpendCreditsRequest,
  SpendCreditsResponse,
  DailyProgress,
  StreakData,
  UserAchievement,
} from '../types/user';

export async function getUserCredits(userId: number): Promise<UserCredits> {
  const response = await authAxios.get<UserCredits>(`/users/${userId}/credits`);
  return response.data;
}

export async function spendCredits(request: SpendCreditsRequest): Promise<SpendCreditsResponse> {
  const response = await authAxios.post<SpendCreditsResponse>('/users/credits/spend', request);
  return response.data;
}

export async function getDailyProgress(userId: number): Promise<DailyProgress> {
  const response = await authAxios.get<DailyProgress>(`/users/${userId}/daily-progress`);
  return response.data;
}

export async function setDailyGoal(userId: number, dailyGoal: number): Promise<DailyProgress> {
  const response = await authAxios.put<DailyProgress>(`/users/${userId}/daily-goal`, {
    dailyGoal,
  });
  return response.data;
}

export async function getStreak(userId: number): Promise<StreakData> {
  const response = await authAxios.get<StreakData>(`/users/${userId}/streak`);
  return response.data;
}

export async function getUserAchievements(userId: number): Promise<UserAchievement[]> {
  const response = await authAxios.get<UserAchievement[]>(`/users/${userId}/achievements`);
  return response.data;
}
