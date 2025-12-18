export interface Paragraph {
  id: number;
  title: string;
  content: string;
  difficulty: string;
  topic: string;
  sentenceCount: number;
  sentences: string[];
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
  isLastSentence: boolean;
  nextSentenceIndex: number;
  nextSentence: string | null;
  submittedAt: string;
  feedback: import('./translation').TranslationFeedback | null;
}
