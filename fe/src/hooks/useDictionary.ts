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
  user: () => [...dictionaryKeys.all, 'user'] as const,
  session: (sessionId: number) => [...dictionaryKeys.all, 'session', sessionId] as const,
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
    mutationFn: (request: SaveWordRequest) => saveWordToDictionary(request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: dictionaryKeys.user() });
      if (variables.sessionId) {
        queryClient.invalidateQueries({ queryKey: dictionaryKeys.session(variables.sessionId) });
      }
    },
  });
}

export function useUserDictionary() {
  return useQuery({
    queryKey: dictionaryKeys.user(),
    queryFn: () => getUserDictionary(),
  });
}

export function useSessionDictionary(sessionId: number) {
  return useQuery({
    queryKey: dictionaryKeys.session(sessionId),
    queryFn: () => getSessionDictionary(sessionId),
    enabled: !!sessionId,
  });
}

export function useDeleteWord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (wordId: number) => deleteWord(wordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dictionaryKeys.user() });
    },
  });
}
