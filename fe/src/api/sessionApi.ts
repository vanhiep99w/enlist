import { authAxios } from './authApi';
import type {
  Paragraph,
  PaginatedResponse,
  ParagraphFilters,
  Session,
  SessionProgress,
  SentenceSubmissionResponse,
  SessionSummary,
  PreviousAttempt,
} from '../types/session';

export async function getParagraphs(
  filters: ParagraphFilters = {}
): Promise<PaginatedResponse<Paragraph>> {
  const params = new URLSearchParams();
  if (filters.difficulty) params.append('difficulty', filters.difficulty);
  if (filters.topic) params.append('topic', filters.topic);
  if (filters.search) params.append('search', filters.search);
  if (filters.page !== undefined) params.append('page', String(filters.page));
  if (filters.pageSize !== undefined) params.append('pageSize', String(filters.pageSize));
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
  if (filters.completionStatus) params.append('completionStatus', filters.completionStatus);

  const response = await authAxios.get<PaginatedResponse<Paragraph>>(`/paragraphs`, {
    params,
  });
  return response.data;
}

export async function getTopics(): Promise<string[]> {
  const response = await authAxios.get<string[]>(`/paragraphs/topics`);
  return response.data;
}

export async function getParagraphById(id: number): Promise<Paragraph> {
  const response = await authAxios.get<Paragraph>(`/paragraphs/${id}`);
  return response.data;
}

export async function searchParagraphs(query: string): Promise<Paragraph[]> {
  const response = await authAxios.get<Paragraph[]>(`/paragraphs/search`, {
    params: { query },
  });
  return response.data;
}

export async function createSession(paragraphId: number): Promise<Session> {
  const response = await authAxios.post<Session>(`/sessions`, {
    paragraphId,
  });
  return response.data;
}

export async function getSession(sessionId: number): Promise<Session> {
  const response = await authAxios.get<Session>(`/sessions/${sessionId}`);
  return response.data;
}

export async function submitSentenceTranslation(
  sessionId: number,
  userTranslation: string,
  options?: { isRetry?: boolean; parentSubmissionId?: number }
): Promise<SentenceSubmissionResponse> {
  const response = await authAxios.post<SentenceSubmissionResponse>(
    `/sessions/${sessionId}/submit`,
    {
      userTranslation,
      isRetry: options?.isRetry,
      parentSubmissionId: options?.parentSubmissionId,
    }
  );
  return response.data;
}

export async function skipSentence(sessionId: number): Promise<SentenceSubmissionResponse> {
  const response = await authAxios.post<SentenceSubmissionResponse>(`/sessions/${sessionId}/skip`);
  return response.data;
}

export async function getSessionProgress(sessionId: number): Promise<SessionProgress> {
  const response = await authAxios.get<SessionProgress>(`/sessions/${sessionId}/progress`);
  return response.data;
}

export async function getUserSessions(): Promise<Session[]> {
  const response = await authAxios.get<Session[]>(`/sessions/user`);
  return response.data;
}

export async function getSessionSummary(sessionId: number): Promise<SessionSummary> {
  const response = await authAxios.get<SessionSummary>(`/sessions/${sessionId}/summary`);
  return response.data;
}

export async function getPreviousAttempts(paragraphId: number): Promise<PreviousAttempt[]> {
  const response = await authAxios.get<PreviousAttempt[]>(
    `/paragraphs/${paragraphId}/previous-attempts`
  );
  return response.data;
}

// Random Session APIs
export interface RandomSessionCreateRequest {
  targetLanguage?: string;
  initialDifficulty?: number;
}

export interface RandomSession {
  id: number;
  userId: number;
  status: string;
  currentDifficulty: number;
  initialDifficulty: number;
  targetLanguage: string;
  totalParagraphsCompleted: number;
  totalPoints: number;
  totalCredits: number;
  averageAccuracy: number;
  startedAt: string;
  endedAt?: string;
  currentParagraph?: RandomSessionParagraphDTO;
  paragraphs: RandomSessionParagraphDTO[];
}

export interface RandomSessionParagraphDTO {
  id: number;
  randomSessionId: number;
  paragraphId?: number;
  paragraphSessionId?: number;
  paragraphTitle?: string;
  paragraphContent?: string;
  orderIndex: number;
  difficultyLevel: number;
  status: string;
  accuracy?: number;
  timeSpentSeconds?: number;
  pointsEarned: number;
  creditsEarned: number;
  createdAt: string;
  completedAt?: string;
}

export async function createRandomSession(
  request: RandomSessionCreateRequest = {}
): Promise<RandomSession> {
  const response = await authAxios.post<RandomSession>('/random-sessions', request);
  return response.data;
}

export async function getRandomSession(id: number): Promise<RandomSession> {
  const response = await authAxios.get<RandomSession>(`/random-sessions/${id}`);
  return response.data;
}

export async function endRandomSession(id: number): Promise<RandomSession> {
  const response = await authAxios.post<RandomSession>(`/random-sessions/${id}/end`);
  return response.data;
}

export async function getUserRandomSessions(): Promise<RandomSession[]> {
  const response = await authAxios.get<RandomSession[]>('/random-sessions/user');
  return response.data;
}

export async function generateNextParagraph(randomSessionId: number): Promise<RandomSession> {
  const response = await authAxios.post<RandomSession>(
    `/random-sessions/${randomSessionId}/next-paragraph`
  );
  return response.data;
}
