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
  GRAMMAR: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  WORD_CHOICE: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  NATURALNESS: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
};

const errorTypeLabels: Record<TranslationError['type'], string> = {
  GRAMMAR: 'Grammar',
  WORD_CHOICE: 'Word Choice',
  NATURALNESS: 'Naturalness',
};

function QuickErrorCard({ error }: { error: TranslationError }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-2 p-0 px-2 py-1.5">
        <Badge className={cn('text-xs font-medium', errorTypeBadgeColors[error.type])}>
          {errorTypeLabels[error.type]}
        </Badge>
        <span className="text-muted-foreground truncate text-sm">
          {error.quickFix || error.correction}
        </span>
      </CardContent>
    </Card>
  );
}

function DetailedErrorCard({ error }: { error: TranslationError }) {
  return (
    <div
      className="flex items-start gap-2 rounded-lg border p-3"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      <Badge className={cn('shrink-0 text-xs font-medium', errorTypeBadgeColors[error.type])}>
        {errorTypeLabels[error.type]}
      </Badge>
      <div className="min-w-0 flex-1 text-sm">
        <p className="text-card-foreground font-medium">{error.issue}</p>
        <p className="text-muted-foreground mt-1">
          <span className="font-medium">Fix:</span>{' '}
          <span className="text-green-400">{error.correction}</span>
        </p>
        {error.explanation && (
          <p className="text-muted-foreground mt-1 text-xs">{error.explanation}</p>
        )}
      </div>
    </div>
  );
}

function ModeToggle({
  mode,
  onChange,
}: {
  mode: FeedbackMode;
  onChange: (mode: FeedbackMode) => void;
}) {
  return (
    <div className="bg-muted flex items-center gap-1 rounded p-0.5">
      <button
        onClick={() => onChange('quick')}
        className={cn(
          'rounded px-2 py-1 text-xs font-medium transition-all',
          mode === 'quick' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
        )}
      >
        Quick
      </button>
      <button
        onClick={() => onChange('detailed')}
        className={cn(
          'rounded px-2 py-1 text-xs font-medium transition-all',
          mode === 'detailed' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
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
        className="flex w-full items-center justify-between p-3 transition-colors"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">📖</span>
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            Learning Tips
          </span>
          <Badge className="bg-primary/20 text-primary border-primary/30 border text-xs">
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

      <div
        className={cn(
          'transition-all duration-300',
          isExpanded ? 'max-h-[2000px]' : 'max-h-0 overflow-hidden'
        )}
      >
        <CardContent className="bg-card space-y-3 p-3">
          {/* Article Tips */}
          {feedback.articleTips && feedback.articleTips.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-purple-400">
                <span>📚</span> Article Tips
              </div>
              {feedback.articleTips.map((tip, index) => (
                <div
                  key={index}
                  className="rounded border border-purple-800 bg-purple-900/30 p-2 text-xs"
                >
                  <p className="font-medium text-purple-300">{tip.context}</p>
                  <p className="mt-0.5 text-purple-400">{tip.rule}</p>
                  <p className="mt-1 text-purple-500 italic">Ex: {tip.example}</p>
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
                <div
                  key={index}
                  className="rounded border border-blue-800 bg-blue-900/30 p-2 text-xs"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-red-400 line-through">{coll.incorrect}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-medium text-green-400">{coll.correct}</span>
                  </div>
                  <p className="mt-1 text-blue-400">{coll.explanation}</p>
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
                <div
                  key={index}
                  className="rounded border border-amber-800 bg-amber-900/30 p-2 text-xs"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-red-400 line-through">{tip.incorrectWord}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-medium text-green-400">{tip.correctWord}</span>
                  </div>
                  <p className="mt-1 text-amber-400">{tip.explanation}</p>
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
                <div
                  key={index}
                  className="rounded border border-rose-800 bg-rose-900/30 p-2 text-xs"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Casual:</span>
                    <span className="text-rose-400">{tip.casualWord}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-muted-foreground">Formal:</span>
                    <span className="font-medium text-green-400">{tip.formalWord}</span>
                  </div>
                  <p className="mt-1 text-rose-400">{tip.explanation}</p>
                </div>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {feedback.suggestions && feedback.suggestions.length > 0 && (
            <div className="space-y-1">
              <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                <span>✨</span> Suggestions
              </div>
              {feedback.suggestions.map((suggestion, index) => (
                <div key={index} className="text-muted-foreground flex items-start gap-1.5 text-xs">
                  <span className="mt-0.5 text-blue-400">•</span>
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

export function FeedbackPanel({
  feedback,
  userTranslation,
  showDetailedPrompt,
  onPromptDismiss,
}: Props) {
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
    <Card className="space-y-3 border p-4" style={{ borderColor: 'var(--color-border)' }}>
      {/* Onboarding Prompt - Compact */}
      {showDetailedPrompt && !promptDismissed && mode === 'quick' && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-blue-700 bg-blue-900/50 p-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-blue-400">⚡</span>
            <span className="text-blue-300">Ready for detailed feedback?</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleEnableDetailed}
              className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
            >
              Enable
            </button>
            <button
              onClick={handleDismissPrompt}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Later
            </button>
          </div>
        </div>
      )}

      {/* Suggestion Line with inline error highlighting */}
      {userTranslation && feedback.errors.length > 0 && (
        <div
          className="rounded-lg border p-3"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-start gap-2">
            <span
              className="shrink-0 text-sm font-medium"
              style={{ color: 'var(--color-text-primary)' }}
            >
              📝 Your answer:
            </span>
            <div className="text-sm">
              <SuggestionLine userTranslation={userTranslation} errors={feedback.errors} />
            </div>
          </div>
        </div>
      )}

      {/* Correct Translation - Compact */}
      <div
        className="rounded-lg border p-3"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex items-baseline gap-2">
          <span
            className="text-sm font-medium whitespace-nowrap"
            style={{ color: 'var(--color-primary)' }}
          >
            ✓ Correct:
          </span>
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {feedback.correctTranslation}
          </p>
        </div>
      </div>

      {/* Good Points - What the student did well */}
      {feedback.goodPoints && feedback.goodPoints.length > 0 && (
        <div className="rounded-lg border border-emerald-700 bg-emerald-900/30 p-3">
          <div className="flex items-start gap-2">
            <span className="shrink-0 text-sm font-medium text-emerald-400">✨ Điểm tốt:</span>
            <div className="flex-1 space-y-1">
              {feedback.goodPoints.map((point, index) => (
                <div key={index} className="text-sm">
                  <span className="font-medium text-emerald-300">"{point.phrase}"</span>
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
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-muted-foreground text-sm font-medium">
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
        <div
          className="rounded-lg border p-3"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-start gap-2">
            <span
              className="shrink-0 text-sm font-medium"
              style={{ color: 'var(--color-text-primary)' }}
            >
              💬 Nhận xét:
            </span>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {feedback.overallComment}
            </p>
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
