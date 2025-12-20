import axios from 'axios';
import type { Paragraph, PaginatedResponse, ParagraphFilters, Session, SessionProgress, SentenceSubmissionResponse } from '../types/session';

const API_BASE = 'http://localhost:8081/api';

export async function getParagraphs(filters: ParagraphFilters = {}): Promise<PaginatedResponse<Paragraph>> {
  const params = new URLSearchParams();
  if (filters.difficulty) params.append('difficulty', filters.difficulty);
  if (filters.topic) params.append('topic', filters.topic);
  if (filters.search) params.append('search', filters.search);
  if (filters.page !== undefined) params.append('page', String(filters.page));
  if (filters.pageSize !== undefined) params.append('pageSize', String(filters.pageSize));
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
  
  const response = await axios.get<PaginatedResponse<Paragraph>>(`${API_BASE}/paragraphs`, { params });
  return response.data;
}

export async function getTopics(): Promise<string[]> {
  const response = await axios.get<string[]>(`${API_BASE}/paragraphs/topics`);
  return response.data;
}

export async function getParagraphById(id: number): Promise<Paragraph> {
  const response = await axios.get<Paragraph>(`${API_BASE}/paragraphs/${id}`);
  return response.data;
}

export async function searchParagraphs(query: string): Promise<Paragraph[]> {
  const response = await axios.get<Paragraph[]>(`${API_BASE}/paragraphs/search`, {
    params: { query },
  });
  return response.data;
}

export async function createSession(paragraphId: number, userId?: number): Promise<Session> {
  const response = await axios.post<Session>(`${API_BASE}/sessions`, {
    paragraphId,
    userId: userId || 1,
  });
  return response.data;
}

export async function getSession(sessionId: number): Promise<Session> {
  const response = await axios.get<Session>(`${API_BASE}/sessions/${sessionId}`);
  return response.data;
}

export async function submitSentenceTranslation(
  sessionId: number,
  userTranslation: string,
  options?: { isRetry?: boolean; parentSubmissionId?: number }
): Promise<SentenceSubmissionResponse> {
  const response = await axios.post<SentenceSubmissionResponse>(
    `${API_BASE}/sessions/${sessionId}/submit`,
    { 
      userTranslation,
      isRetry: options?.isRetry,
      parentSubmissionId: options?.parentSubmissionId
    }
  );
  return response.data;
}

export async function skipSentence(sessionId: number): Promise<SentenceSubmissionResponse> {
  const response = await axios.post<SentenceSubmissionResponse>(
    `${API_BASE}/sessions/${sessionId}/skip`
  );
  return response.data;
}

export async function getSessionProgress(sessionId: number): Promise<SessionProgress> {
  const response = await axios.get<SessionProgress>(`${API_BASE}/sessions/${sessionId}/progress`);
  return response.data;
}

export async function getUserSessions(userId: number): Promise<Session[]> {
  const response = await axios.get<Session[]>(`${API_BASE}/sessions/user/${userId}`);
  return response.data;
}
