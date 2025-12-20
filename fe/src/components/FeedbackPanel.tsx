import type { TranslationFeedback, TranslationError } from '../types/translation';
import { SuggestionLine } from './SuggestionLine';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

interface Props {
  feedback: TranslationFeedback;
  userTranslation?: string;
}

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

function ErrorCard({ error }: { error: TranslationError }) {
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

export function FeedbackPanel({ feedback, userTranslation }: Props) {
  return (
    <Card className="space-y-3 border p-4" style={{ borderColor: 'var(--color-border)' }}>
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

      {/* Correct Translation */}
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

      {/* Good Points */}
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

      {/* Errors */}
      {feedback.errors.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-muted-foreground text-sm font-medium">
              Errors ({feedback.errors.length})
            </span>
          </div>
          <div className="space-y-1">
            {feedback.errors.map((error, index) => (
              <ErrorCard key={index} error={error} />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
