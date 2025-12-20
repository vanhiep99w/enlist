import { useState, useEffect } from 'react';
import { getDetailedErrorAnalytics } from '../api/analyticsApi';
import type { ErrorAnalytics } from '../types/analytics';
import { motion } from 'motion/react';
import { AlertCircle, TrendingDown, Award, Brain } from 'lucide-react';

export function ErrorAnalyticsPanel() {
  const [analytics, setAnalytics] = useState<ErrorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const userId = 1;

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await getDetailedErrorAnalytics(userId);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-8 w-8 rounded-full border-2 border-t-transparent"
          style={{ borderColor: 'var(--color-primary)' }}
        />
      </div>
    );
  }

  if (!analytics || analytics.distribution.totalErrors === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <Brain size={64} style={{ color: 'var(--color-accent)', opacity: 0.3 }} className="mb-4" />
        <p className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          No errors yet!
        </p>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Start practicing to see your learning insights
        </p>
      </div>
    );
  }

  const { distribution, topErrors, weakAreas } = analytics;
  const errorTypes = Object.entries(distribution.byType);
  const maxTypeCount = Math.max(...errorTypes.map(([, count]) => count), 1);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      default:
        return '#22c55e';
    }
  };

  const getErrorTypeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'GRAMMAR':
        return '#ef4444';
      case 'WORD_CHOICE':
        return '#f59e0b';
      case 'NATURALNESS':
        return '#8b5cf6';
      default:
        return 'var(--color-accent)';
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(var(--color-surface-elevated-rgb), 0.8), rgba(var(--color-surface-rgb), 0.6))',
          border: '1.5px solid rgba(var(--color-border-rgb), 0.4)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="mb-6 flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl"
            style={{
              background: 'linear-gradient(135deg, #ef4444, #f59e0b)',
              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)',
            }}
          >
            <AlertCircle size={22} style={{ color: '#fff' }} />
          </div>
          <div>
            <h3
              className="text-lg font-bold tracking-tight"
              style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}
            >
              Error Distribution
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {distribution.totalErrors} total errors tracked
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {errorTypes.map(([type, count], index) => {
            const percentage = (count / distribution.totalErrors) * 100;
            const width = (count / maxTypeCount) * 100;

            return (
              <motion.div
                key={type}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {type.charAt(0) + type.slice(1).toLowerCase().replace('_', ' ')}
                  </span>
                  <span className="text-sm font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                    {count} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div
                  className="relative h-3 overflow-hidden rounded-full"
                  style={{ background: 'rgba(0, 0, 0, 0.2)' }}
                >
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${width}%` }}
                    transition={{ duration: 1, delay: index * 0.1, ease: 'easeOut' }}
                    style={{
                      background: `linear-gradient(90deg, ${getErrorTypeColor(type)}, ${getErrorTypeColor(type)}99)`,
                      boxShadow: `0 0 8px ${getErrorTypeColor(type)}66`,
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {weakAreas.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-6"
          style={{
            background: 'linear-gradient(135deg, rgba(var(--color-surface-elevated-rgb), 0.8), rgba(var(--color-surface-rgb), 0.6))',
            border: '1.5px solid rgba(var(--color-border-rgb), 0.4)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="mb-6 flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                boxShadow: '0 4px 14px rgba(139, 92, 246, 0.3)',
              }}
            >
              <TrendingDown size={22} style={{ color: '#fff' }} />
            </div>
            <div>
              <h3
                className="text-lg font-bold tracking-tight"
                style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}
              >
                Focus Areas
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Your most common mistakes
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {weakAreas.slice(0, 5).map((area, index) => (
              <motion.div
                key={`${area.errorType}-${area.errorCategory}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="relative overflow-hidden rounded-xl p-4"
                style={{
                  background: 'rgba(var(--color-surface-dark-rgb), 0.4)',
                  border: `1.5px solid ${getSeverityColor(area.severity)}33`,
                }}
              >
                <div
                  className="absolute inset-y-0 left-0 w-1"
                  style={{ background: getSeverityColor(area.severity) }}
                />
                <div className="ml-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      {area.errorCategory.replace(/_/g, ' ')}
                    </span>
                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider"
                      style={{
                        background: `${getSeverityColor(area.severity)}22`,
                        color: getSeverityColor(area.severity),
                      }}
                    >
                      {area.severity}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span style={{ color: 'var(--color-text-secondary)' }}>
                      {area.errorType.charAt(0) + area.errorType.slice(1).toLowerCase().replace('_', ' ')}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>•</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>
                      {area.count} occurrence{area.count > 1 ? 's' : ''}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>•</span>
                    <span className="font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {area.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {topErrors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl p-6"
          style={{
            background: 'linear-gradient(135deg, rgba(var(--color-surface-elevated-rgb), 0.8), rgba(var(--color-surface-rgb), 0.6))',
            border: '1.5px solid rgba(var(--color-border-rgb), 0.4)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="mb-6 flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{
                background: 'linear-gradient(135deg, var(--color-accent), var(--color-primary))',
                boxShadow: '0 4px 14px var(--glow-accent)',
              }}
            >
              <Award size={22} style={{ color: '#fff' }} />
            </div>
            <div>
              <h3
                className="text-lg font-bold tracking-tight"
                style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}
              >
                Most Frequent
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Top {topErrors.length} recurring errors
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {topErrors.map((error, index) => (
              <motion.div
                key={`${error.errorType}-${error.errorCategory}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="rounded-xl p-4"
                style={{
                  background: `linear-gradient(135deg, ${getErrorTypeColor(error.errorType)}11, transparent)`,
                  border: `1.5px solid ${getErrorTypeColor(error.errorType)}33`,
                }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: getErrorTypeColor(error.errorType) }}
                  >
                    {error.errorType.replace('_', ' ')}
                  </span>
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-bold"
                    style={{
                      background: `${getErrorTypeColor(error.errorType)}22`,
                      color: getErrorTypeColor(error.errorType),
                    }}
                  >
                    ×{error.count}
                  </span>
                </div>
                <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {error.errorCategory.replace(/_/g, ' ')}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
