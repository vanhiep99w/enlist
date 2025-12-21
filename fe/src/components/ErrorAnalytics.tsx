import { motion } from 'framer-motion';
import { useErrorAnalytics } from '../hooks/useAnalytics';

interface ErrorAnalyticsProps {
  userId?: number;
}

const ERROR_TYPE_COLORS: Record<string, string> = {
  GRAMMAR: '#ef4444', // red
  WORD_CHOICE: '#f59e0b', // amber
  NATURALNESS: '#06b6d4', // cyan
};

const ERROR_TYPE_LABELS: Record<string, string> = {
  GRAMMAR: 'Grammar',
  WORD_CHOICE: 'Word Choice',
  NATURALNESS: 'Naturalness',
};

export function ErrorAnalytics({ userId = 1 }: ErrorAnalyticsProps) {
  const { data, isLoading } = useErrorAnalytics(userId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  if (!data || data.distribution.totalErrors === 0) {
    return (
      <div
        className="rounded-2xl border-2 p-12 text-center"
        style={{
          backgroundColor: 'var(--color-surface-light)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="mb-4 text-6xl">📊</div>
        <h3 className="mb-2 text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          No Error Data Yet
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Complete some exercises to see your error analytics
        </p>
      </div>
    );
  }

  const maxErrorCount = Math.max(...Object.values(data.distribution.byType));

  return (
    <div
      className="rounded-xl border p-5"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Compact Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Error Analytics
          </h2>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Understand your mistakes
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
            {data.distribution.totalErrors}
          </div>
          <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
            Total Errors
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Error Distribution - Compact Bars */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border p-4"
          style={{
            backgroundColor: 'var(--color-surface-light)',
            borderColor: 'var(--color-border)',
          }}
        >
          <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Error Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(data.distribution.byType).map(([type, count], index) => {
              const percentage = (count / maxErrorCount) * 100;
              const color = ERROR_TYPE_COLORS[type] || '#6b7280';

              return (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                      <span
                        className="text-sm font-medium"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {ERROR_TYPE_LABELS[type] || type}
                      </span>
                    </div>
                    <span
                      className="font-mono text-xs font-bold"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {count}
                    </span>
                  </div>
                  <div
                    className="relative h-2 overflow-hidden rounded-full"
                    style={{ backgroundColor: 'var(--color-surface)' }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Weak Areas Section - Compact Cards */}
        {data.weakAreas && data.weakAreas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-lg border p-4"
            style={{
              backgroundColor: 'var(--color-surface-light)',
              borderColor: 'var(--color-border)',
            }}
          >
            <h3
              className="mb-3 text-sm font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              🎯 Weak Areas & Recommendations
            </h3>
            <div className="grid gap-3 md:grid-cols-3">
              {data.weakAreas.slice(0, 3).map((area, index) => {
                const color = ERROR_TYPE_COLORS[area.errorType] || '#6b7280';
                const severityConfig = {
                  high: { bg: 'bg-red-950/30', text: 'text-red-400', border: 'border-red-600' },
                  medium: {
                    bg: 'bg-amber-950/30',
                    text: 'text-amber-400',
                    border: 'border-amber-600',
                  },
                  low: { bg: 'bg-cyan-950/30', text: 'text-cyan-400', border: 'border-cyan-600' },
                }[area.severity];

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 * index }}
                    className={`rounded-lg border p-3 ${severityConfig.bg}`}
                    style={{ borderColor: color }}
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <div
                          className="mb-0.5 text-[10px] font-bold tracking-wide uppercase opacity-60"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          #{index + 1} Weak Area
                        </div>
                        <div className="text-sm font-bold" style={{ color }}>
                          {ERROR_TYPE_LABELS[area.errorType] || area.errorType}
                        </div>
                        {area.errorCategory && (
                          <div
                            className="mt-0.5 text-xs"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            {area.errorCategory}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-black" style={{ color }}>
                          {area.percentage}%
                        </div>
                        <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                          {area.count} errors
                        </div>
                      </div>
                    </div>

                    {/* Severity Badge */}
                    <div
                      className={`mb-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${severityConfig.text} ${severityConfig.border}`}
                    >
                      <span>●</span>
                      {area.severity}
                    </div>

                    {/* Recommendation */}
                    <div
                      className="rounded p-2"
                      style={{ backgroundColor: 'var(--color-surface)' }}
                    >
                      <div
                        className="mb-1 text-[10px] font-bold"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        💡 Recommendation
                      </div>
                      <div
                        className="text-xs leading-relaxed"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {getRecommendation(area.errorType, area.errorCategory)}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Top Errors List - Compact */}
        {data.topErrors && data.topErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-lg border p-4"
            style={{
              backgroundColor: 'var(--color-surface-light)',
              borderColor: 'var(--color-border)',
            }}
          >
            <h3
              className="mb-3 text-sm font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              📋 Most Common
            </h3>
            <div className="space-y-2">
              {data.topErrors.map((error, index) => {
                const color = ERROR_TYPE_COLORS[error.errorType] || '#6b7280';
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.03 * index }}
                    className="flex items-center justify-between rounded border p-2"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: color }}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <div
                          className="text-sm font-medium"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {ERROR_TYPE_LABELS[error.errorType] || error.errorType}
                        </div>
                        {error.errorCategory && (
                          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            {error.errorCategory}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm font-bold" style={{ color }}>
                        {error.count}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function getRecommendation(errorType: string, category: string): string {
  const recommendations: Record<string, Record<string, string>> = {
    GRAMMAR: {
      'verb tense':
        'Practice timeline exercises. Focus on when actions happened (past/present/future).',
      'subject-verb agreement': 'Pay attention to singular/plural. "He goes" not "He go".',
      'article usage': 'Study countable vs uncountable nouns. When to use a/an/the.',
      default: 'Review grammar rules and practice with targeted exercises.',
    },
    WORD_CHOICE: {
      collocation: 'Learn common word partnerships. "Make a decision" not "do a decision".',
      vocabulary: 'Expand your vocabulary with flashcards and reading.',
      default: 'Focus on context and natural word combinations.',
    },
    NATURALNESS: {
      formality: 'Consider the context. Use appropriate tone for formal vs casual situations.',
      idiom: 'Learn common idioms and expressions used by native speakers.',
      default: 'Read more English content to develop natural phrasing.',
    },
  };

  const typeRecs = recommendations[errorType] || {};
  return typeRecs[category.toLowerCase()] || typeRecs.default || 'Keep practicing!';
}
