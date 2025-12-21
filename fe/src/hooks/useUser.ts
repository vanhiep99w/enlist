import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUserCredits,
  spendCredits,
  getDailyProgress,
  setDailyGoal,
  getStreak,
  getUserAchievements,
} from '../api/userApi';
import type { SpendCreditsRequest } from '../types/user';

export const userKeys = {
  all: ['users'] as const,
  credits: () => [...userKeys.all, 'credits'] as const,
  dailyProgress: () => [...userKeys.all, 'dailyProgress'] as const,
  streak: () => [...userKeys.all, 'streak'] as const,
  achievements: () => [...userKeys.all, 'achievements'] as const,
};

export function useUserCredits() {
  return useQuery({
    queryKey: userKeys.credits(),
    queryFn: () => getUserCredits(),
  });
}

export function useSpendCredits() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: Omit<SpendCreditsRequest, 'userId'>) => spendCredits(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.credits() });
    },
  });
}

export function useDailyProgress() {
  return useQuery({
    queryKey: userKeys.dailyProgress(),
    queryFn: () => getDailyProgress(),
  });
}

export function useSetDailyGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dailyGoal: number) => setDailyGoal(dailyGoal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.dailyProgress() });
    },
  });
}

export function useStreak() {
  return useQuery({
    queryKey: userKeys.streak(),
    queryFn: () => getStreak(),
  });
}

export function useUserAchievements() {
  return useQuery({
    queryKey: userKeys.achievements(),
    queryFn: () => getUserAchievements(),
  });
}
