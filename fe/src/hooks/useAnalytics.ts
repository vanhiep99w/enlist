import { useQuery } from '@tanstack/react-query';
import {
  getDetailedErrorAnalytics,
  getErrorDistribution,
  getErrorTrends,
  getWeakAreas,
} from '../api/analyticsApi';

export const analyticsKeys = {
  all: ['analytics'] as const,
  errors: (userId: number) => [...analyticsKeys.all, 'errors', userId] as const,
  distribution: (userId: number) => [...analyticsKeys.all, 'distribution', userId] as const,
  trends: (userId: number, days: number) => [...analyticsKeys.all, 'trends', userId, days] as const,
  weakAreas: (userId: number) => [...analyticsKeys.all, 'weakAreas', userId] as const,
};

export function useErrorAnalytics(userId: number) {
  return useQuery({
    queryKey: analyticsKeys.errors(userId),
    queryFn: () => getDetailedErrorAnalytics(userId),
    enabled: !!userId,
  });
}

export function useErrorDistribution(userId: number) {
  return useQuery({
    queryKey: analyticsKeys.distribution(userId),
    queryFn: () => getErrorDistribution(userId),
    enabled: !!userId,
  });
}

export function useErrorTrends(userId: number, days: number = 7) {
  return useQuery({
    queryKey: analyticsKeys.trends(userId, days),
    queryFn: () => getErrorTrends(userId, days),
    enabled: !!userId,
  });
}

export function useWeakAreas(userId: number) {
  return useQuery({
    queryKey: analyticsKeys.weakAreas(userId),
    queryFn: () => getWeakAreas(userId),
    enabled: !!userId,
  });
}
