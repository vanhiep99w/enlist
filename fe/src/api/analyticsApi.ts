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

export async function getProgressAnalytics(days: number = 30): Promise<ProgressAnalytics> {
  const response = await authAxios.get<ProgressAnalytics>(`/analytics/progress?days=${days}`);
  return response.data;
}

export async function getDetailedErrorAnalytics(): Promise<ErrorAnalytics> {
  const response = await authAxios.get<ErrorAnalytics>(`/analytics/errors`);
  return response.data;
}

export async function getErrorDistribution(): Promise<ErrorDistribution> {
  const response = await authAxios.get<ErrorDistribution>(`/analytics/errors/distribution`);
  return response.data;
}

export async function getErrorTrends(days: number = 7): Promise<ErrorTrend> {
  const response = await authAxios.get<ErrorTrend>(`/analytics/errors/trends?days=${days}`);
  return response.data;
}

export async function getWeakAreas(): Promise<WeakArea[]> {
  const response = await authAxios.get<WeakArea[]>(`/analytics/errors/weak-areas`);
  return response.data;
}
