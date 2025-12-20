import axios from 'axios';
import type { TranslationResponse } from '../types/translation';

const API_BASE = 'http://localhost:8081/api';

export async function evaluateTranslation(
  originalText: string,
  userTranslation: string
): Promise<TranslationResponse> {
  const response = await axios.post<TranslationResponse>(`${API_BASE}/translate/evaluate`, {
    originalText,
    userTranslation,
  });
  return response.data;
}
