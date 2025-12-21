import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useErrorAnalytics, useErrorTrends } from '../hooks/useAnalytics';

interface ErrorInsightsProps {
  userId?: number;
}

const ERROR_CONFIG = {
  GRAMMAR: { color: '#ef4444', label: 'Grammar', icon: '📝' },
  WORD_CHOICE: { color: '#f59e0b', label: 'Word Choice', icon: '💭' },
  NATURALNESS: { color: '#06b6d4', label: 'Naturalness', icon: '🗣️' },
};

export function ErrorInsights({ userId = 1 }: ErrorInsightsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<7 | 30>(7);

  const { data: analytics, isLoading: isAnalyticsLoading } = useErrorAnalytics(userId);
  const { data: trends7, isLoading: isTrends7Loading } = useErrorTrends(userId, 7);
  const { data: trends30, isLoading: isTrends30Loading } = useErrorTrends(userId, 30);

  const isLoading = isAnalyticsLoading || isTrends7Loading || isTrends30Loading;

  const data =
    analytics && trends7 && trends30
      ? {
          distribution: analytics.distribution,
          trends: { period7: trends7, period30: trends30 },
          weakAreas: analytics.weakAreas || [],
        }
      : null;

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
        className="rounded-xl border p-12 text-center"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="mb-4 text-6xl">📊</div>
        <h3 className="mb-2 text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          No Error Data Yet
        </h3>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Complete some exercises to see your insights
        </p>
      </div>
    );
  }

  const currentTrend = selectedPeriod === 7 ? data.trends.period7 : data.trends.period30;
  const maxTrendCount = Math.max(...Object.values(currentTrend.byType));

  return (
    <div
      className="relative space-y-6 overflow-hidden rounded-2xl border-2 p-6"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-primary)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
      }}
    >
      {/* Decorative background pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, var(--color-primary) 0, var(--color-primary) 1px, transparent 0, transparent 50%)`,
          backgroundSize: '10px 10px',
        }}
      />

      {/* Header */}
      <div className="relative flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              }}
            >
              📊
            </div>
            <div>
              <h2
                className="text-2xl font-black tracking-tight uppercase"
                style={{
                  color: 'var(--color-text-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                Error Insights
              </h2>
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                Understand patterns, improve faster
              </p>
            </div>
          </div>
        </div>
        <div
          className="rounded-xl border-2 px-4 py-2 text-right"
          style={{
            backgroundColor: 'var(--color-surface-light)',
            borderColor: 'var(--color-primary)',
          }}
        >
          <div
            className="text-4xl font-black tabular-nums"
            style={{ color: 'var(--color-primary)' }}
          >
            {data.distribution.totalErrors}
          </div>
          <div
            className="text-[10px] font-bold tracking-wider uppercase"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Total Errors
          </div>
        </div>
      </div>

      {/* Trend Chart Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-xl border-2 p-5"
        style={{
          backgroundColor: 'var(--color-surface-light)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="h-8 w-1 rounded-full"
              style={{ backgroundColor: 'var(--color-accent)' }}
            />
            <h3
              className="text-base font-black tracking-tight uppercase"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Trend Overview
            </h3>
          </div>
          <div className="flex gap-2">
            {[7, 30].map((days) => (
              <button
                key={days}
                onClick={() => setSelectedPeriod(days as 7 | 30)}
                className={`rounded-lg border-2 px-4 py-2 text-xs font-black tracking-wider uppercase transition-all ${
                  selectedPeriod === days
                    ? 'shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]'
                    : 'hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]'
                }`}
                style={{
                  backgroundColor: selectedPeriod === days ? 'var(--color-accent)' : 'transparent',
                  color: selectedPeriod === days ? 'var(--color-surface)' : 'var(--color-accent)',
                  borderColor: 'var(--color-accent)',
                }}
              >
                {days}D
              </button>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="relative flex items-end justify-around gap-6" style={{ height: '200px' }}>
          <AnimatePresence mode="wait">
            {Object.entries(currentTrend.byType).map(([type, count], index) => {
              const config = ERROR_CONFIG[type as keyof typeof ERROR_CONFIG];
              const heightPercentage = (count / maxTrendCount) * 100;

              return (
                <motion.div
                  key={`${selectedPeriod}-${type}`}
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: 1 }}
                  exit={{ scaleY: 0, opacity: 0 }}
                  transition={{
                    delay: index * 0.08,
                    duration: 0.5,
                    ease: [0.34, 1.56, 0.64, 1],
                  }}
                  className="flex flex-1 origin-bottom flex-col items-center justify-end"
                >
                  {/* Bar */}
                  <div
                    className="relative w-full rounded-t-xl border-2 border-b-0"
                    style={{
                      height: `${Math.max(heightPercentage, 20)}%`,
                      minHeight: '40px',
                      backgroundColor: config.color,
                      borderColor: 'rgba(0, 0, 0, 0.2)',
                      boxShadow: `0 -4px 16px ${config.color}40`,
                    }}
                  >
                    <div
                      className="absolute -top-8 left-1/2 -translate-x-1/2 rounded px-2 py-1 font-mono text-base font-black"
                      style={{
                        color: config.color,
                        backgroundColor: 'var(--color-surface)',
                        border: `2px solid ${config.color}`,
                      }}
                    >
                      {count}
                    </div>
                  </div>

                  {/* Label */}
                  <div className="mt-3 text-center">
                    <div className="mb-1 text-2xl">{config.icon}</div>
                    <div
                      className="text-[11px] font-black tracking-wide uppercase"
                      style={{ color: config.color }}
                    >
                      {config.label.split(' ')[0]}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Weak Areas - Bold Cards */}
      {data.weakAreas && data.weakAreas.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <div
              className="h-8 w-1 rounded-full"
              style={{ backgroundColor: 'var(--color-accent)' }}
            />
            <h3
              className="text-base font-black tracking-tight uppercase"
              style={{ color: 'var(--color-text-primary)' }}
            >
              🎯 Focus Areas
            </h3>
          </div>
          <div className="space-y-3">
            {data.weakAreas.slice(0, 3).map((area, index) => {
              const config = ERROR_CONFIG[area.errorType as keyof typeof ERROR_CONFIG];
              const severityColors = {
                high: {
                  bg: 'rgba(239, 68, 68, 0.08)',
                  border: '#ef4444',
                  shadow: 'rgba(239, 68, 68, 0.2)',
                },
                medium: {
                  bg: 'rgba(251, 191, 36, 0.08)',
                  border: '#fbbf24',
                  shadow: 'rgba(251, 191, 36, 0.2)',
                },
                low: {
                  bg: 'rgba(6, 182, 212, 0.08)',
                  border: '#06b6d4',
                  shadow: 'rgba(6, 182, 212, 0.2)',
                },
              }[area.severity];

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="flex items-center justify-between rounded-xl border-2 p-4 transition-transform hover:translate-x-[-2px] hover:translate-y-[-2px]"
                  style={{
                    backgroundColor: severityColors.bg,
                    borderColor: severityColors.border,
                    boxShadow: `4px 4px 0px 0px ${severityColors.shadow}`,
                  }}
                >
                  <div className="flex flex-1 items-center gap-4">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl border-2 text-xl font-black"
                      style={{
                        backgroundColor: config.color,
                        color: 'white',
                        borderColor: 'rgba(0, 0, 0, 0.2)',
                      }}
                    >
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <div
                        className="text-sm font-black tracking-wide uppercase"
                        style={{ color: config.color }}
                      >
                        {config.label}
                      </div>
                      {area.errorCategory && (
                        <div
                          className="text-xs font-medium"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          {area.errorCategory}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className="text-2xl font-black tabular-nums"
                      style={{ color: config.color }}
                    >
                      {area.percentage}%
                    </div>
                    <div
                      className="text-[10px] font-bold uppercase"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {area.count} errors
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
