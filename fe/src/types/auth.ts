export interface User {
  id: number;
  username: string;
  email: string;
  totalPoints: number;
  credits: number;
  sessionsCompleted: number;
  dailyGoal: number;
  dailyProgressCount: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}
