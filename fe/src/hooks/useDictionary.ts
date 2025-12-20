import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  translateWord,
  saveWordToDictionary,
  getUserDictionary,
  getSessionDictionary,
  deleteWord,
} from '../api/dictionaryApi';
import type { SaveWordRequest } from '../api/dictionaryApi';

export const dictionaryKeys = {
  all: ['dictionary'] as const,
  user: (userId: number) => [...dictionaryKeys.all, 'user', userId] as const,
  session: (userId: number, sessionId: number) =>
    [...dictionaryKeys.all, 'session', userId, sessionId] as const,
};

export function useTranslateWord() {
  return useMutation({
    mutationFn: ({ word, context }: { word: string; context?: string }) =>
      translateWord(word, context),
  });
}

export function useSaveWord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, request }: { userId: number; request: SaveWordRequest }) =>
      saveWordToDictionary(userId, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: dictionaryKeys.user(variables.userId) });
      if (variables.request.sessionId) {
        queryClient.invalidateQueries({
          queryKey: dictionaryKeys.session(variables.userId, variables.request.sessionId),
        });
      }
    },
  });
}

export function useUserDictionary(userId: number) {
  return useQuery({
    queryKey: dictionaryKeys.user(userId),
    queryFn: () => getUserDictionary(userId),
    enabled: !!userId,
  });
}

export function useSessionDictionary(userId: number, sessionId: number) {
  return useQuery({
    queryKey: dictionaryKeys.session(userId, sessionId),
    queryFn: () => getSessionDictionary(userId, sessionId),
    enabled: !!userId && !!sessionId,
  });
}

export function useDeleteWord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, wordId }: { userId: number; wordId: number }) =>
      deleteWord(userId, wordId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: dictionaryKeys.user(variables.userId) });
    },
  });
}
