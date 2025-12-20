import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserCredits, spendCredits, getDailyProgress, setDailyGoal } from '../api/userApi';
import type { SpendCreditsRequest } from '../types/user';

export const userKeys = {
  all: ['users'] as const,
  credits: (userId: number) => [...userKeys.all, 'credits', userId] as const,
  dailyProgress: (userId: number) => [...userKeys.all, 'dailyProgress', userId] as const,
};

export function useUserCredits(userId: number) {
  return useQuery({
    queryKey: userKeys.credits(userId),
    queryFn: () => getUserCredits(userId),
    enabled: !!userId,
  });
}

export function useSpendCredits() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: SpendCreditsRequest) => spendCredits(request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.credits(variables.userId) });
    },
  });
}

export function useDailyProgress(userId: number) {
  return useQuery({
    queryKey: userKeys.dailyProgress(userId),
    queryFn: () => getDailyProgress(userId),
    enabled: !!userId,
  });
}

export function useSetDailyGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, dailyGoal }: { userId: number; dailyGoal: number }) =>
      setDailyGoal(userId, dailyGoal),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.dailyProgress(variables.userId) });
    },
  });
}
