import axios from 'axios';
import type {
  UserCredits,
  SpendCreditsRequest,
  SpendCreditsResponse,
  DailyProgress,
  StreakData,
  UserAchievement,
} from '../types/user';

const API_BASE = 'http://localhost:8081/api';

export async function getUserCredits(userId: number): Promise<UserCredits> {
  const response = await axios.get<UserCredits>(`${API_BASE}/users/${userId}/credits`);
  return response.data;
}

export async function spendCredits(request: SpendCreditsRequest): Promise<SpendCreditsResponse> {
  const response = await axios.post<SpendCreditsResponse>(
    `${API_BASE}/users/credits/spend`,
    request
  );
  return response.data;
}

export async function getDailyProgress(userId: number): Promise<DailyProgress> {
  const response = await axios.get<DailyProgress>(`${API_BASE}/users/${userId}/daily-progress`);
  return response.data;
}

export async function setDailyGoal(userId: number, dailyGoal: number): Promise<DailyProgress> {
  const response = await axios.put<DailyProgress>(`${API_BASE}/users/${userId}/daily-goal`, {
    dailyGoal,
  });
  return response.data;
}

export async function getStreak(userId: number): Promise<StreakData> {
  const response = await axios.get<StreakData>(`${API_BASE}/users/${userId}/streak`);
  return response.data;
}

export async function getUserAchievements(userId: number): Promise<UserAchievement[]> {
  const response = await axios.get<UserAchievement[]>(`${API_BASE}/users/${userId}/achievements`);
  return response.data;
}
