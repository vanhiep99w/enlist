import axios from 'axios';

const API_BASE = 'http://localhost:8081/api';

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
  const response = await axios.get<LeaderboardUser[]>(`${API_BASE}/leaderboard`, {
    params: { limit },
  });
  return response.data;
}

export async function getUserRank(userId: number): Promise<number> {
  const response = await axios.get<number>(`${API_BASE}/leaderboard/rank/${userId}`);
  return response.data;
}
