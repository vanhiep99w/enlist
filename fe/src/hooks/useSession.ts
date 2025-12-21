import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getParagraphs,
  getTopics,
  getParagraphById,
  searchParagraphs,
  createSession,
  getSession,
  submitSentenceTranslation,
  skipSentence,
  getSessionProgress,
  getUserSessions,
  getSessionSummary,
  getPreviousAttempts,
} from '../api/sessionApi';
import type { ParagraphFilters } from '../types/session';

export const sessionKeys = {
  all: ['sessions'] as const,
  lists: () => [...sessionKeys.all, 'list'] as const,
  list: (filters: ParagraphFilters) => [...sessionKeys.lists(), filters] as const,
  details: () => [...sessionKeys.all, 'detail'] as const,
  detail: (id: number) => [...sessionKeys.details(), id] as const,
  progress: (id: number) => [...sessionKeys.all, 'progress', id] as const,
  userSessions: () => [...sessionKeys.all, 'user'] as const,
  summary: (id: number) => [...sessionKeys.all, 'summary', id] as const,
  previousAttempts: (paragraphId: number) =>
    [...sessionKeys.all, 'previous-attempts', paragraphId] as const,
  paragraphs: ['paragraphs'] as const,
  topics: () => [...sessionKeys.paragraphs, 'topics'] as const,
  search: (query: string) => [...sessionKeys.paragraphs, 'search', query] as const,
};

export function useParagraphs(filters: ParagraphFilters = {}) {
  return useQuery({
    queryKey: sessionKeys.list(filters),
    queryFn: () => getParagraphs(filters),
  });
}

export function useTopics() {
  return useQuery({
    queryKey: sessionKeys.topics(),
    queryFn: getTopics,
  });
}

export function useParagraph(id: number) {
  return useQuery({
    queryKey: sessionKeys.detail(id),
    queryFn: () => getParagraphById(id),
    enabled: !!id,
  });
}

export function useSearchParagraphs(query: string) {
  return useQuery({
    queryKey: sessionKeys.search(query),
    queryFn: () => searchParagraphs(query),
    enabled: query.length > 0,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paragraphId: number) => createSession(paragraphId),
    onSuccess: (data) => {
      queryClient.setQueryData(sessionKeys.detail(data.id), data);
    },
  });
}

export function useSession(sessionId: number) {
  return useQuery({
    queryKey: sessionKeys.detail(sessionId),
    queryFn: () => getSession(sessionId),
    enabled: !!sessionId,
  });
}

export function useSubmitSentenceTranslation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      userTranslation,
      options,
    }: {
      sessionId: number;
      userTranslation: string;
      options?: { isRetry?: boolean; parentSubmissionId?: number };
    }) => submitSentenceTranslation(sessionId, userTranslation, options),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.detail(variables.sessionId) });
      queryClient.invalidateQueries({ queryKey: sessionKeys.progress(variables.sessionId) });
    },
  });
}

export function useSkipSentence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: number) => skipSentence(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.detail(sessionId) });
      queryClient.invalidateQueries({ queryKey: sessionKeys.progress(sessionId) });
    },
  });
}

export function useSessionProgress(sessionId: number) {
  return useQuery({
    queryKey: sessionKeys.progress(sessionId),
    queryFn: () => getSessionProgress(sessionId),
    enabled: !!sessionId,
  });
}

export function useUserSessions() {
  return useQuery({
    queryKey: sessionKeys.userSessions(),
    queryFn: () => getUserSessions(),
  });
}

export function useSessionSummary(sessionId: number) {
  return useQuery({
    queryKey: sessionKeys.summary(sessionId),
    queryFn: () => getSessionSummary(sessionId),
    enabled: !!sessionId,
  });
}

export function usePreviousAttempts(paragraphId: number) {
  return useQuery({
    queryKey: sessionKeys.previousAttempts(paragraphId),
    queryFn: () => getPreviousAttempts(paragraphId),
    enabled: !!paragraphId,
  });
}
