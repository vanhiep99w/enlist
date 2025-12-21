export interface Paragraph {
  id: number;
  title: string;
  content: string;
  difficulty: string;
  topic: string;
  sentenceCount: number;
  sentences: string[];
  completionStatus?: 'completed' | 'in_progress' | 'not_started';
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ParagraphFilters {
  difficulty?: string;
  topic?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  userId?: number;
  completionStatus?: 'completed' | 'in_progress' | 'not_started';
}

export interface CompletedSentenceData {
  correctTranslation: string;
  userTranslation: string;
  originalSentence: string;
  accuracy: number;
  errors: Array<{ type: string; quickFix?: string; correction?: string }>;
}

export interface Session {
  id: number;
  paragraphId: number;
  paragraphTitle: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  currentSentenceIndex: number;
  totalSentences: number;
  completedSentences: number;
  averageAccuracy: number;
  totalPoints: number;
  totalCredits: number;
  currentSentence: string | null;
  allSentences: string[];
  fullContent: string;
  startedAt: string;
  completedAt: string | null;
  completedTranslations: Record<number, string>;
  completedSentenceDetails: Record<number, CompletedSentenceData>;
}

export interface SessionProgress {
  sessionId: number;
  completedSentences: number;
  totalSentences: number;
  progressPercentage: number;
  averageAccuracy: number;
  totalPoints: number;
  status: string;
}

export interface SentenceSubmissionResponse {
  id: number;
  sentenceIndex: number;
  originalSentence: string;
  userTranslation: string;
  correctTranslation: string;
  accuracy: number;
  grammarScore: number;
  wordChoiceScore: number;
  naturalnessScore: number;
  pointsEarned: number;
  skipped: boolean;
  retryAttempt: number;
  parentSubmissionId: number | null;
  isLastSentence: boolean;
  nextSentenceIndex: number;
  nextSentence: string | null;
  submittedAt: string;
  feedback: import('./translation').TranslationFeedback | null;
}

export interface SessionSummary {
  sessionId: number;
  paragraphId: number;
  paragraphTitle: string;
  totalSentences: number;
  completedSentences: number;
  averageAccuracy: number;
  totalErrors: number;
  totalPoints: number;
  completedAt: string;
  errorBreakdown: {
    grammarErrors: number;
    wordChoiceErrors: number;
    naturalnessErrors: number;
  };
  allErrors: Array<{
    sentenceIndex: number;
    originalSentence: string;
    userTranslation: string;
    type: string;
    quickFix: string;
    correction: string;
  }>;
}

export interface PreviousAttempt {
  sessionId: number;
  completedAt: string;
  averageAccuracy: number;
  totalErrors: number;
  completedSentences: number;
  totalSentences: number;
  totalPoints: number;
}
