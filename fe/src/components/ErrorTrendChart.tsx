import { useState } from 'react';
import { motion } from 'framer-motion';
import { useErrorTrends } from '../hooks/useAnalytics';

interface ErrorTrendChartProps {
  userId: number;
}

const ERROR_TYPE_COLORS: Record<string, string> = {
  GRAMMAR: '#ef4444',
  WORD_CHOICE: '#f59e0b',
  NATURALNESS: '#06b6d4',
};

const ERROR_TYPE_LABELS: Record<string, string> = {
  GRAMMAR: 'Grammar',
  WORD_CHOICE: 'Word Choice',
  NATURALNESS: 'Naturalness',
};

export function ErrorTrendChart({ userId }: ErrorTrendChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<7 | 30>(7);

  const { data: trend7, isLoading: isTrend7Loading } = useErrorTrends(userId, 7);
  const { data: trend30, isLoading: isTrend30Loading } = useErrorTrends(userId, 30);

  const isLoading = isTrend7Loading || isTrend30Loading;
  const currentTrend = selectedPeriod === 7 ? trend7 : trend30;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  if (!currentTrend || currentTrend.totalErrors === 0) {
    return (
      <div
        className="rounded-2xl border-2 p-12 text-center"
        style={{
          backgroundColor: 'var(--color-surface-light)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="mb-4 text-6xl">📈</div>
        <h3 className="mb-2 text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          No Trend Data Yet
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Complete more exercises to see your error trends
        </p>
      </div>
    );
  }

  const maxCount = Math.max(...Object.values(currentTrend.byType));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border-2 p-6"
      style={{
        backgroundColor: 'var(--color-surface-light)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Header with Period Selector */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
            📊 Error Trend
          </h3>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Track improvements over time
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedPeriod(7)}
            className={`rounded-lg px-4 py-2 font-semibold transition-all ${
              selectedPeriod === 7
                ? 'bg-cyan-500 text-white shadow-lg'
                : 'text-cyan-500 hover:bg-cyan-500/10'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setSelectedPeriod(30)}
            className={`rounded-lg px-4 py-2 font-semibold transition-all ${
              selectedPeriod === 30
                ? 'bg-cyan-500 text-white shadow-lg'
                : 'text-cyan-500 hover:bg-cyan-500/10'
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* Total Errors Summary */}
      <div className="mb-6 rounded-xl p-4" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Total Errors ({currentTrend.period})
          </span>
          <span className="text-3xl font-black" style={{ color: 'var(--color-primary)' }}>
            {currentTrend.totalErrors}
          </span>
        </div>
      </div>

      {/* Vertical Bar Chart */}
      <div className="relative">
        <div className="flex items-end justify-around gap-4" style={{ height: '240px' }}>
          {Object.entries(currentTrend.byType).map(([type, count], index) => {
            const heightPercentage = (count / maxCount) * 100;
            const color = ERROR_TYPE_COLORS[type] || '#6b7280';

            return (
              <motion.div
                key={type}
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                transition={{ delay: index * 0.1, duration: 0.6, ease: 'easeOut' }}
                className="flex flex-1 flex-col items-center justify-end"
              >
                {/* Bar */}
                <div className="relative w-full">
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.6, ease: 'easeOut' }}
                    className="w-full origin-bottom rounded-t-xl"
                    style={{
                      height: `${Math.max(heightPercentage, 10)}%`,
                      minHeight: '40px',
                      backgroundColor: color,
                      boxShadow: `0 -4px 20px ${color}40`,
                    }}
                  >
                    {/* Count Label */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 font-mono text-lg font-bold text-white">
                      {count}
                    </div>
                  </motion.div>
                </div>

                {/* Label */}
                <div className="mt-3 text-center">
                  <div
                    className="mx-auto mb-1 h-3 w-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <div
                    className="text-xs font-bold"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {ERROR_TYPE_LABELS[type]?.split(' ').map((word, i) => (
                      <div key={i}>{word}</div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Y-axis reference lines */}
        <div className="pointer-events-none absolute inset-0">
          {[0.25, 0.5, 0.75, 1].map((percent) => (
            <div
              key={percent}
              className="absolute w-full border-t border-dashed opacity-10"
              style={{
                bottom: `${percent * 100}%`,
                borderColor: 'var(--color-text-primary)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Insight */}
      {currentTrend.totalErrors > 0 && (
        <div className="mt-6 rounded-xl border-2 border-cyan-500/30 bg-cyan-500/5 p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <div className="mb-1 font-bold text-cyan-400">Insight</div>
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {getInsight(currentTrend.byType, currentTrend.totalErrors)}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function getInsight(byType: Record<string, number>, total: number): string {
  const sortedTypes = Object.entries(byType).sort((a, b) => b[1] - a[1]);

  if (sortedTypes.length === 0) return 'Keep practicing to track your progress!';

  const [topType, topCount] = sortedTypes[0];
  const percentage = ((topCount / total) * 100).toFixed(0);

  const insights = {
    GRAMMAR: 'Focus on grammar rules and sentence structure exercises.',
    WORD_CHOICE: 'Expand vocabulary with flashcards and read more English content.',
    NATURALNESS: 'Practice with native speakers and consume English media.',
  };

  return `${ERROR_TYPE_LABELS[topType]} errors account for ${percentage}% of your mistakes. ${insights[topType as keyof typeof insights] || 'Keep practicing!'}`;
}
