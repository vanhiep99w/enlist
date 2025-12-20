export interface ScoreBreakdown {
  grammarScore: number;
  wordChoiceScore: number;
  naturalnessScore: number;
  overallScore: number;
}

export type ErrorCategory =
  | 'ARTICLE'
  | 'COLLOCATION'
  | 'PREPOSITION'
  | 'VERB_FORM'
  | 'WORD_ORDER'
  | 'REGISTER';

export interface TranslationError {
  type: 'GRAMMAR' | 'WORD_CHOICE' | 'NATURALNESS';
  position: string;
  issue: string;
  correction: string;
  quickFix: string;
  category?: ErrorCategory | null;
  startIndex?: number | null;
  endIndex?: number | null;
  errorText?: string | null;
}

export interface GoodPoint {
  phrase: string;
  reason: string;
  type: 'WORD_CHOICE' | 'GRAMMAR' | 'NATURALNESS';
}

export interface TranslationFeedback {
  scores: ScoreBreakdown;
  errors: TranslationError[];
  suggestions: string[];
  correctTranslation: string;
  goodPoints?: GoodPoint[];
}

export interface TranslationResponse {
  submissionId: number;
  feedback: TranslationFeedback;
}
