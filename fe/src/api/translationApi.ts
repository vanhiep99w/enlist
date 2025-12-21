import { authAxios } from './authApi';
import type { TranslationResponse } from '../types/translation';

export async function evaluateTranslation(
  originalText: string,
  userTranslation: string
): Promise<TranslationResponse> {
  const response = await authAxios.post<TranslationResponse>(`/translate/evaluate`, {
    originalText,
    userTranslation,
  });
  return response.data;
}
