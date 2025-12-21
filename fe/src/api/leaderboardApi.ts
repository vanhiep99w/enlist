import { authAxios } from './authApi';

export interface LeaderboardUser {
  id: number;
  username: string;
  email: string;
  totalPoints: number;
  credits: number;
  sessionsCompleted: number;
  currentStreak: number;
  longestStreak: number;
}

export async function getGlobalLeaderboard(limit: number = 10): Promise<LeaderboardUser[]> {
  const response = await authAxios.get<LeaderboardUser[]>('/leaderboard', {
    params: { limit },
  });
  return response.data;
}

export async function getUserRank(): Promise<number> {
  const response = await authAxios.get<number>('/leaderboard/rank');
  return response.data;
}
