import { useState, useEffect, useCallback } from 'react';
import { getUserCredits, spendCredits } from '../api/userApi';
import type { UserCredits } from '../types/user';

const DEFAULT_USER_ID = 1;

export function useUserCredits(userId: number = DEFAULT_USER_ID) {
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCredits = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getUserCredits(userId);
      setCredits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch credits');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  const spend = useCallback(
    async (amount: number = 1, reason: string = 'hint') => {
      try {
        const result = await spendCredits({ userId, amount, reason });
        if (result.success) {
          setCredits((prev) => (prev ? { ...prev, credits: result.remainingCredits } : null));
        }
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to spend credits');
        return { success: false, remainingCredits: credits?.credits || 0, message: 'Error' };
      }
    },
    [userId, credits?.credits]
  );

  const refresh = useCallback(() => {
    fetchCredits();
  }, [fetchCredits]);

  return {
    credits,
    isLoading,
    error,
    spend,
    refresh,
  };
}
