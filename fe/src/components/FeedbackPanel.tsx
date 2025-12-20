import type { TranslationFeedback, TranslationError } from '../types/translation';
import { SuggestionLine } from './SuggestionLine';
import { Card } from './ui/card';
import { cn } from '@/lib/utils';

interface Props {
  feedback: TranslationFeedback;
  userTranslation?: string;
}

const errorTypeBadgeColors: Record<TranslationError['type'], string> = {
  GRAMMAR: 'text-purple-500 border ',
  WORD_CHOICE: 'text-blue-500 border ',
  NATURALNESS: 'text-orange-500 border ',
};

const errorTypeLabels: Record<TranslationError['type'], string> = {
  GRAMMAR: 'Grammar',
  WORD_CHOICE: 'Word Choice',
  NATURALNESS: 'Naturalness',
};

const errorTypeIcons: Record<TranslationError['type'], string> = {
  GRAMMAR: '⚙',
  WORD_CHOICE: '💬',
  NATURALNESS: '✨',
};

function ErrorCard({ error }: { error: TranslationError }) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-md transition-all duration-150',
        errorTypeBadgeColors[error.type]
      )}
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="flex items-start gap-2 p-2.5">
        {/* Icon */}
        <span className="mt-0.5 shrink-0 text-base leading-none">{errorTypeIcons[error.type]}</span>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Type + Correction in one line */}
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="shrink-0 text-[10px] font-bold tracking-wide uppercase opacity-80">
              {errorTypeLabels[error.type]}
            </span>
            <span className="text-sm leading-tight font-semibold">
              {error.quickFix || error.correction}
            </span>
          </div>

          {/* Issue explanation */}
          {error.issue && <div className="mt-1 text-xs leading-snug opacity-70">{error.issue}</div>}
        </div>
      </div>

      {/* Subtle hover effect */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
    </div>
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
              style={{ color: 'var(--color-text-highlight)' }}
            >
              ✨ Điểm tốt:
            </span>
            <div className="flex-1 space-y-1">
              {feedback.goodPoints.map((point, index) => (
                <div key={index} className="text-sm">
                  <span className="font-medium" style={{ color: 'var(--color-text-highlight)' }}>
                    "{point.phrase}"
                  </span>
                  <span style={{ color: 'var(--color-text-highlight)' }}> – {point.reason}</span>
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
