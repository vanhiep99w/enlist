export interface ScoreBreakdown {
  grammarScore: number;
  wordChoiceScore: number;
  naturalnessScore: number;
  overallScore: number;
}

export type ErrorCategory = 'ARTICLE' | 'COLLOCATION' | 'PREPOSITION' | 'VERB_FORM' | 'WORD_ORDER' | 'REGISTER';

export interface TranslationError {
  type: 'GRAMMAR' | 'WORD_CHOICE' | 'NATURALNESS';
  position: string;
  issue: string;
  correction: string;
  explanation: string;
  quickFix: string;
  category?: ErrorCategory | null;
  learningTip?: string | null;
  startIndex?: number | null;
  endIndex?: number | null;
  errorText?: string | null;
}

export interface ArticleTip {
  context: string;
  rule: string;
  example: string;
}

export interface CollocationHighlight {
  incorrect: string;
  correct: string;
  explanation: string;
  relatedCollocations: string[];
}

export interface ReasoningTip {
  incorrectWord: string;
  correctWord: string;
  context: string;
  explanation: string;
  examples: string[];
}

export interface RegisterTip {
  casualWord: string;
  formalWord: string;
  context: string;
  explanation: string;
  formalAlternatives: string[];
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
  articleTips?: ArticleTip[];
  collocationHighlights?: CollocationHighlight[];
  reasoningTips?: ReasoningTip[];
  registerTips?: RegisterTip[];
  overallComment?: string | null;
  goodPoints?: GoodPoint[];
}

export interface TranslationResponse {
  submissionId: number;
  feedback: TranslationFeedback;
}
