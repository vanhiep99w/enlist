import axios from 'axios';
import type { Paragraph, Session, SessionProgress, SentenceSubmissionResponse } from '../types/session';

const API_BASE = 'http://localhost:8081/api';

export async function getParagraphs(difficulty?: string, topic?: string): Promise<Paragraph[]> {
  const params = new URLSearchParams();
  if (difficulty) params.append('difficulty', difficulty);
  if (topic) params.append('topic', topic);
  
  const response = await axios.get<Paragraph[]>(`${API_BASE}/paragraphs`, { params });
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
  userTranslation: string
): Promise<SentenceSubmissionResponse> {
  const response = await axios.post<SentenceSubmissionResponse>(
    `${API_BASE}/sessions/${sessionId}/submit`,
    { userTranslation }
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
