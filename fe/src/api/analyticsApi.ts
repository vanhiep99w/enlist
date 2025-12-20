import axios from 'axios';
import type { ErrorAnalytics, ErrorDistribution, ErrorTrend, WeakArea } from '../types/analytics';

const API_BASE = 'http://localhost:8081/api';

export async function getDetailedErrorAnalytics(userId: number): Promise<ErrorAnalytics> {
  const response = await axios.get<ErrorAnalytics>(`${API_BASE}/analytics/errors/${userId}`);
  return response.data;
}

export async function getErrorDistribution(userId: number): Promise<ErrorDistribution> {
  const response = await axios.get<ErrorDistribution>(`${API_BASE}/analytics/errors/${userId}/distribution`);
  return response.data;
}

export async function getErrorTrends(userId: number, days: number = 7): Promise<ErrorTrend> {
  const response = await axios.get<ErrorTrend>(`${API_BASE}/analytics/errors/${userId}/trends?days=${days}`);
  return response.data;
}

export async function getWeakAreas(userId: number): Promise<WeakArea[]> {
  const response = await axios.get<WeakArea[]>(`${API_BASE}/analytics/errors/${userId}/weak-areas`);
  return response.data;
}
