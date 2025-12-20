import { useState, useEffect } from 'react';
import type { TranslationFeedback, TranslationError } from '../types/translation';
import { SuggestionLine } from './SuggestionLine';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

interface Props {
  feedback: TranslationFeedback;
  userTranslation?: string;
  showDetailedPrompt?: boolean;
  onPromptDismiss?: () => void;
}

const FEEDBACK_MODE_KEY = 'feedbackMode';

type FeedbackMode = 'quick' | 'detailed';

const errorTypeBadgeColors: Record<TranslationError['type'], string> = {
  GRAMMAR: 'bg-purple-900 text-purple-300',
  WORD_CHOICE: 'bg-blue-900 text-blue-300',
  NATURALNESS: 'bg-orange-900 text-orange-300',
};

const errorTypeLabels: Record<TranslationError['type'], string> = {
  GRAMMAR: 'Grammar',
  WORD_CHOICE: 'Word Choice',
  NATURALNESS: 'Naturalness',
};

function QuickErrorCard({ error }: { error: TranslationError }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-2 py-1.5 px-2 p-0">
        <Badge className={cn('text-xs font-medium', errorTypeBadgeColors[error.type])}>
          {errorTypeLabels[error.type]}
        </Badge>
        <span className="text-sm truncate text-muted-foreground">
          {error.quickFix || error.correction}
        </span>
      </CardContent>
    </Card>
  );
}

function DetailedErrorCard({ error }: { error: TranslationError }) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <Badge className={cn('text-xs font-medium shrink-0', errorTypeBadgeColors[error.type])}>
            {errorTypeLabels[error.type]}
          </Badge>
          <div className="flex-1 min-w-0 text-sm">
            <p className="font-medium text-card-foreground">{error.issue}</p>
            <p className="mt-1 text-muted-foreground">
              <span className="font-medium">Fix:</span>{' '}
              <span className="text-green-400">{error.correction}</span>
            </p>
            {error.explanation && (
              <p className="mt-1 text-xs text-muted-foreground">{error.explanation}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ModeToggle({ mode, onChange }: { mode: FeedbackMode; onChange: (mode: FeedbackMode) => void }) {
  return (
    <div className="flex items-center gap-1 rounded p-0.5 bg-muted">
      <button
        onClick={() => onChange('quick')}
        className={cn(
          'px-2 py-1 text-xs font-medium rounded transition-all',
          mode === 'quick' 
            ? 'bg-background text-foreground shadow-sm' 
            : 'text-muted-foreground'
        )}
      >
        Quick
      </button>
      <button
        onClick={() => onChange('detailed')}
        className={cn(
          'px-2 py-1 text-xs font-medium rounded transition-all',
          mode === 'detailed'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground'
        )}
      >
        Detailed
      </button>
    </div>
  );
}

interface CollapsibleTipsSectionProps {
  feedback: TranslationFeedback;
  isExpanded: boolean;
  onToggle: () => void;
}

function CollapsibleTipsSection({ feedback, isExpanded, onToggle }: CollapsibleTipsSectionProps) {
  const hasTips = 
    (feedback.articleTips && feedback.articleTips.length > 0) ||
    (feedback.collocationHighlights && feedback.collocationHighlights.length > 0) ||
    (feedback.reasoningTips && feedback.reasoningTips.length > 0) ||
    (feedback.registerTips && feedback.registerTips.length > 0) ||
    (feedback.suggestions && feedback.suggestions.length > 0);

  if (!hasTips) return null;

  const tipCount = 
    (feedback.articleTips?.length || 0) +
    (feedback.collocationHighlights?.length || 0) +
    (feedback.reasoningTips?.length || 0) +
    (feedback.registerTips?.length || 0) +
    (feedback.suggestions?.length || 0);

  return (
    <Card className="overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 hover:from-indigo-900/70 hover:to-purple-900/70 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">📖</span>
          <span className="text-sm font-medium text-card-foreground">Learning Tips</span>
          <Badge className="bg-indigo-900 text-indigo-300 text-xs">
            {tipCount}
          </Badge>
        </div>
        <svg
          className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')}
          style={{ color: 'var(--color-text-secondary)' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <div className={cn('transition-all duration-300', isExpanded ? 'max-h-[2000px]' : 'max-h-0 overflow-hidden')}>
        <CardContent className="p-3 space-y-3 bg-card">
          {/* Article Tips */}
          {feedback.articleTips && feedback.articleTips.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-purple-400">
                <span>📚</span> Article Tips
              </div>
              {feedback.articleTips.map((tip, index) => (
                <div key={index} className="bg-purple-900/30 border border-purple-800 rounded p-2 text-xs">
                  <p className="font-medium text-purple-300">{tip.context}</p>
                  <p className="text-purple-400 mt-0.5">{tip.rule}</p>
                  <p className="text-purple-500 mt-1 italic">Ex: {tip.example}</p>
                </div>
              ))}
            </div>
          )}

          {/* Collocation */}
          {feedback.collocationHighlights && feedback.collocationHighlights.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-blue-400">
                <span>🔗</span> Collocations
              </div>
              {feedback.collocationHighlights.map((coll, index) => (
                <div key={index} className="bg-blue-900/30 border border-blue-800 rounded p-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-red-400 line-through">{coll.incorrect}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-green-400 font-medium">{coll.correct}</span>
                  </div>
                  <p className="text-blue-400 mt-1">{coll.explanation}</p>
                </div>
              ))}
            </div>
          )}

          {/* Reasoning Tips */}
          {feedback.reasoningTips && feedback.reasoningTips.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-amber-400">
                <span>💡</span> Reasoning Words
              </div>
              {feedback.reasoningTips.map((tip, index) => (
                <div key={index} className="bg-amber-900/30 border border-amber-800 rounded p-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-red-400 line-through">{tip.incorrectWord}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-green-400 font-medium">{tip.correctWord}</span>
                  </div>
                  <p className="text-amber-400 mt-1">{tip.explanation}</p>
                </div>
              ))}
            </div>
          )}

          {/* Register Tips */}
          {feedback.registerTips && feedback.registerTips.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-rose-400">
                <span>🎭</span> Tone & Register
              </div>
              {feedback.registerTips.map((tip, index) => (
                <div key={index} className="bg-rose-900/30 border border-rose-800 rounded p-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Casual:</span>
                    <span className="text-rose-400">{tip.casualWord}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-muted-foreground">Formal:</span>
                    <span className="text-green-400 font-medium">{tip.formalWord}</span>
                  </div>
                  <p className="text-rose-400 mt-1">{tip.explanation}</p>
                </div>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {feedback.suggestions && feedback.suggestions.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <span>✨</span> Suggestions
              </div>
              {feedback.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>{suggestion}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
}

export function FeedbackPanel({ feedback, userTranslation, showDetailedPrompt, onPromptDismiss }: Props) {
  const [promptDismissed, setPromptDismissed] = useState(false);
  const [tipsExpanded, setTipsExpanded] = useState(false);
  
  const [mode, setMode] = useState<FeedbackMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(FEEDBACK_MODE_KEY);
      return (saved as FeedbackMode) || 'quick';
    }
    return 'quick';
  });

  const handleEnableDetailed = () => {
    setMode('detailed');
    setPromptDismissed(true);
    onPromptDismiss?.();
  };

  const handleDismissPrompt = () => {
    setPromptDismissed(true);
    onPromptDismiss?.();
  };

  useEffect(() => {
    localStorage.setItem(FEEDBACK_MODE_KEY, mode);
  }, [mode]);

  const ErrorCard = mode === 'quick' ? QuickErrorCard : DetailedErrorCard;

  return (
    <Card className="p-4 space-y-3">
      {/* Onboarding Prompt - Compact */}
      {showDetailedPrompt && !promptDismissed && mode === 'quick' && (
        <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-blue-400">⚡</span>
            <span className="text-blue-300">Ready for detailed feedback?</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleEnableDetailed}
              className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700"
            >
              Enable
            </button>
            <button
              onClick={handleDismissPrompt}
              className="text-blue-400 text-xs hover:text-blue-300"
            >
              Later
            </button>
          </div>
        </div>
      )}

      {/* Suggestion Line with inline error highlighting */}
      {userTranslation && feedback.errors.length > 0 && (
        <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <span className="text-amber-400 text-sm font-medium shrink-0">📝 Your answer:</span>
            <div className="text-sm">
              <SuggestionLine userTranslation={userTranslation} errors={feedback.errors} />
            </div>
          </div>
        </div>
      )}

      {/* Correct Translation - Compact */}
      <div className="bg-green-900/30 border border-green-700 rounded-lg p-3">
        <div className="flex items-baseline gap-2">
          <span className="text-green-400 text-sm font-medium whitespace-nowrap">✓ Correct:</span>
          <p className="text-green-300 text-sm font-medium">
            {feedback.correctTranslation}
          </p>
        </div>
      </div>

      {/* Good Points - What the student did well */}
      {feedback.goodPoints && feedback.goodPoints.length > 0 && (
        <div className="bg-emerald-900/30 border border-emerald-700 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <span className="text-emerald-400 text-sm font-medium shrink-0">✨ Điểm tốt:</span>
            <div className="flex-1 space-y-1">
              {feedback.goodPoints.map((point, index) => (
                <div key={index} className="text-sm">
                  <span className="text-emerald-300 font-medium">"{point.phrase}"</span>
                  <span className="text-emerald-400"> – {point.reason}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Errors - Compact */}
      {feedback.errors.length > 0 && (
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Errors ({feedback.errors.length})
            </span>
            <ModeToggle mode={mode} onChange={setMode} />
          </div>
          <div className={cn('space-y-1', mode === 'detailed' && 'space-y-2')}>
            {feedback.errors.map((error, index) => (
              <ErrorCard key={index} error={error} />
            ))}
          </div>
        </div>
      )}

      {/* Overall Comment (Nhận xét) */}
      {feedback.overallComment && (
        <div className="bg-indigo-900/30 border border-indigo-700 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <span className="text-indigo-400 text-sm font-medium shrink-0">💬 Nhận xét:</span>
            <p className="text-sm text-indigo-300">{feedback.overallComment}</p>
          </div>
        </div>
      )}

      {/* Learning Tips - Collapsible, collapsed by default */}
      <CollapsibleTipsSection 
        feedback={feedback} 
        isExpanded={tipsExpanded} 
        onToggle={() => setTipsExpanded(!tipsExpanded)} 
      />
    </Card>
  );
}
