import { useMutation } from '@tanstack/react-query';
import { evaluateTranslation } from '../api/translationApi';

export function useEvaluateTranslation() {
  return useMutation({
    mutationFn: ({
      originalText,
      userTranslation,
    }: {
      originalText: string;
      userTranslation: string;
    }) => evaluateTranslation(originalText, userTranslation),
  });
}
