import axios from 'axios';
import type {
  UserCredits,
  SpendCreditsRequest,
  SpendCreditsResponse,
  DailyProgress,
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
