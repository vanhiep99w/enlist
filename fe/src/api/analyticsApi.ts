import { authAxios } from './authApi';
import type { ErrorAnalytics, ErrorDistribution, ErrorTrend, WeakArea } from '../types/analytics';

export interface ProgressDataPoint {
  date: string;
  sentencesCompleted: number;
  accuracyRate: number;
  pointsEarned: number;
  totalAttempts: number;
}

export interface ProgressSummary {
  totalSentences: number;
  averageAccuracy: number;
  totalPoints: number;
  totalAttempts: number;
  activeDays: number;
}

export interface ProgressAnalytics {
  dataPoints: ProgressDataPoint[];
  summary: ProgressSummary;
}

export async function getProgressAnalytics(
  userId: number,
  days: number = 30
): Promise<ProgressAnalytics> {
  const response = await authAxios.get<ProgressAnalytics>(
    `/analytics/progress/${userId}?days=${days}`
  );
  return response.data;
}

export async function getDetailedErrorAnalytics(userId: number): Promise<ErrorAnalytics> {
  const response = await authAxios.get<ErrorAnalytics>(`/analytics/errors/${userId}`);
  return response.data;
}

export async function getErrorDistribution(userId: number): Promise<ErrorDistribution> {
  const response = await authAxios.get<ErrorDistribution>(
    `/analytics/errors/${userId}/distribution`
  );
  return response.data;
}

export async function getErrorTrends(userId: number, days: number = 7): Promise<ErrorTrend> {
  const response = await authAxios.get<ErrorTrend>(
    `/analytics/errors/${userId}/trends?days=${days}`
  );
  return response.data;
}

export async function getWeakAreas(userId: number): Promise<WeakArea[]> {
  const response = await authAxios.get<WeakArea[]>(`/analytics/errors/${userId}/weak-areas`);
  return response.data;
}
