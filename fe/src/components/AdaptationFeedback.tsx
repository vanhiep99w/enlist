import { TrendingUp, TrendingDown, Minus, BookOpen } from 'lucide-react';

interface AdaptationFeedbackProps {
  previousDifficulty: number;
  currentDifficulty: number;
  previousAccuracy: number;
  errorSummary?: string;
  vocabTargeted?: string;
}

export function AdaptationFeedback({
  previousDifficulty,
  currentDifficulty,
  previousAccuracy,
  errorSummary,
  vocabTargeted,
}: AdaptationFeedbackProps) {
  const difficultyChange = currentDifficulty - previousDifficulty;

  const getDifficultyInfo = () => {
    if (difficultyChange > 0) {
      return {
        icon: TrendingUp,
        color: 'var(--color-success)',
        label: 'Difficulty Increased',
        message: `Great work! Moving to Level ${currentDifficulty}`,
      };
    } else if (difficultyChange < 0) {
      return {
        icon: TrendingDown,
        color: 'var(--color-warning)',
        label: 'Difficulty Adjusted',
        message: `Let's refine at Level ${currentDifficulty}`,
      };
    } else {
      return {
        icon: Minus,
        color: 'var(--color-accent)',
        label: 'Staying at This Level',
        message: `Practicing Level ${currentDifficulty}`,
      };
    }
  };

  const diffInfo = getDifficultyInfo();
  const Icon = diffInfo.icon;

  // Parse error summary and vocab if they exist
  const hasErrorSummary = errorSummary && errorSummary !== 'null';
  const hasVocabTargeted = vocabTargeted && vocabTargeted !== 'null';

  const bulletPoints: string[] = [];

  // Add difficulty change bullet
  bulletPoints.push(diffInfo.message);

  // Add accuracy-based feedback
  if (previousAccuracy >= 90) {
    bulletPoints.push('Excellent performance on the last paragraph');
  } else if (previousAccuracy >= 70) {
    bulletPoints.push('Solid understanding demonstrated');
  } else {
    bulletPoints.push("Let's focus on building confidence");
  }

  // Add error pattern bullet if available
  if (hasErrorSummary) {
    try {
      const errors = JSON.parse(errorSummary);
      if (errors && Object.keys(errors).length > 0) {
        const topError = Object.entries(errors)[0];
        bulletPoints.push(`Working on ${topError[0]} patterns`);
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Add vocab focus bullet if available
  if (hasVocabTargeted && bulletPoints.length < 3) {
    try {
      const vocab = JSON.parse(vocabTargeted);
      if (vocab && vocab.length > 0) {
        bulletPoints.push(`Introducing new vocabulary themes`);
      }
    } catch {
      // Ignore parse errors
    }
  }

  return (
    <div
      className="my-8 rounded-2xl p-6 backdrop-blur-sm"
      style={{
        backgroundColor: 'var(--color-surface-light)',
        border: '2px solid var(--color-border)',
      }}
    >
      <div className="mb-4 flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{
            backgroundColor: `${diffInfo.color}22`,
          }}
        >
          <Icon className="h-5 w-5" style={{ color: diffInfo.color }} />
        </div>
        <div>
          <h3
            className="text-sm font-bold tracking-wider uppercase"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Adaptation
          </h3>
          <p className="text-lg font-bold" style={{ color: diffInfo.color }}>
            {diffInfo.label}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {bulletPoints.slice(0, 3).map((point, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 rounded-lg p-3"
            style={{
              backgroundColor: 'var(--color-surface-elevated)',
            }}
          >
            <div
              className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
              style={{ backgroundColor: diffInfo.color }}
            />
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              {point}
            </p>
          </div>
        ))}
      </div>

      <div
        className="mt-4 flex items-center gap-2 rounded-lg p-3"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        <BookOpen className="h-4 w-4" style={{ color: 'var(--color-accent)' }} />
        <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
          The next paragraph will be tailored to your performance
        </p>
      </div>
    </div>
  );
}
