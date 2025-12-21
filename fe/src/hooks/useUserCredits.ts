import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUserCredits as useUserCreditsQuery, useSpendCredits, userKeys } from './useUser';
import { useAuth } from '../contexts/AuthContext';

export function useUserCredits() {
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id ?? 0;

  const { data: credits, isLoading, error } = useUserCreditsQuery(userId);
  const spendCreditsMutation = useSpendCredits();
  const queryClient = useQueryClient();

  const spend = useCallback(
    async (amount: number = 1, reason: string = 'hint') => {
      if (!userId || !isAuthenticated) {
        return { success: false, remainingCredits: 0, message: 'Not authenticated' };
      }

      try {
        const result = await spendCreditsMutation.mutateAsync({ userId, amount, reason });
        return result;
      } catch {
        return { success: false, remainingCredits: credits?.credits || 0, message: 'Error' };
      }
    },
    [userId, isAuthenticated, spendCreditsMutation, credits?.credits]
  );

  const refresh = useCallback(() => {
    if (userId) {
      queryClient.invalidateQueries({ queryKey: userKeys.credits(userId) });
    }
  }, [userId, queryClient]);

  return {
    credits: credits ?? null,
    isLoading,
    error: error?.message ?? null,
    spend,
    refresh,
  };
}
