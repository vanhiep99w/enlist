import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useProgressAnalytics } from '../hooks/useAnalytics';

interface ProgressChartProps {
  userId?: number;
}

type TimeRange = 7 | 30 | 90;
type ChartMetric = 'sentences' | 'accuracy' | 'points';

const METRIC_CONFIG = {
  sentences: {
    label: 'Sentences Completed',
    color: '#10b981',
    icon: '📝',
    dataKey: 'sentencesCompleted',
  },
  accuracy: {
    label: 'Accuracy Rate',
    color: '#06b6d4',
    icon: '🎯',
    dataKey: 'accuracyRate',
  },
  points: {
    label: 'Points Earned',
    color: '#f59e0b',
    icon: '⭐',
    dataKey: 'pointsEarned',
  },
};

export function ProgressChart({ userId = 1 }: ProgressChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>(30);
  const [selectedMetric, setSelectedMetric] = useState<ChartMetric>('sentences');
  const { data, isLoading } = useProgressAnalytics(userId, timeRange);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const chartData =
    data?.dataPoints.map((point) => ({
      ...point,
      date: formatDate(point.date),
    })) || [];

  const config = METRIC_CONFIG[selectedMetric];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <div className="absolute inset-0 flex items-center justify-center text-2xl">
            {config.icon}
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.dataPoints.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl border-2 p-16 text-center"
        style={{
          background:
            'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="mb-6 text-8xl">📊</div>
        <h3 className="mb-3 text-2xl font-black" style={{ color: 'var(--color-text-primary)' }}>
          No Progress Data Yet
        </h3>
        <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
          Complete exercises to start tracking your journey
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border-2 p-8"
      style={{
        backgroundColor: 'var(--color-surface-light)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Header */}
      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2
            className="mb-2 flex items-center gap-3 text-3xl font-black"
            style={{ color: 'var(--color-text-primary)' }}
          >
            <span className="text-4xl">{config.icon}</span>
            {config.label}
          </h2>
          <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
            Track your learning progress over time
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 rounded-xl bg-black/5 p-2 dark:bg-white/5">
          {([7, 30, 90] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`rounded-lg px-5 py-2.5 font-bold transition-all ${
                timeRange === range
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'text-gray-600 hover:bg-white/50 dark:text-gray-400 dark:hover:bg-white/10'
              }`}
            >
              {range}d
            </button>
          ))}
        </div>
      </div>

      {/* Metric Selector */}
      <div className="mb-8 flex gap-3">
        {(Object.keys(METRIC_CONFIG) as ChartMetric[]).map((metric) => {
          const metricConfig = METRIC_CONFIG[metric];
          const isSelected = selectedMetric === metric;
          return (
            <motion.button
              key={metric}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedMetric(metric)}
              className={`flex-1 rounded-2xl border-2 p-4 transition-all ${
                isSelected
                  ? 'border-transparent shadow-xl'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
              }`}
              style={
                isSelected
                  ? {
                      background: `linear-gradient(135deg, ${metricConfig.color}20, ${metricConfig.color}10)`,
                      borderColor: metricConfig.color,
                    }
                  : {}
              }
            >
              <div className="mb-2 text-3xl">{metricConfig.icon}</div>
              <div
                className="text-sm font-bold"
                style={{ color: isSelected ? metricConfig.color : 'var(--color-text-secondary)' }}
              >
                {metricConfig.label}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Chart */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedMetric}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`gradient-${selectedMetric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={config.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={config.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
              <XAxis
                dataKey="date"
                stroke="var(--color-text-muted)"
                tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                tickLine={false}
              />
              <YAxis
                stroke="var(--color-text-muted)"
                tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-surface)',
                  border: '2px solid var(--color-border)',
                  borderRadius: '12px',
                  padding: '12px',
                }}
                labelStyle={{ color: 'var(--color-text-primary)', fontWeight: 'bold' }}
                itemStyle={{ color: config.color }}
              />
              <Area
                type="monotone"
                dataKey={config.dataKey}
                stroke={config.color}
                strokeWidth={3}
                fill={`url(#gradient-${selectedMetric})`}
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </AnimatePresence>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          {
            label: 'Total Sentences',
            value: data.summary.totalSentences,
            icon: '📝',
            color: '#10b981',
          },
          {
            label: 'Avg Accuracy',
            value: `${data.summary.averageAccuracy.toFixed(1)}%`,
            icon: '🎯',
            color: '#06b6d4',
          },
          { label: 'Total Points', value: data.summary.totalPoints, icon: '⭐', color: '#f59e0b' },
          { label: 'Active Days', value: data.summary.activeDays, icon: '📅', color: '#ec4899' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-2xl border-2 p-4"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-2xl">{stat.icon}</span>
              <div className="text-3xl font-black" style={{ color: stat.color }}>
                {stat.value}
              </div>
            </div>
            <div className="text-xs font-bold" style={{ color: 'var(--color-text-muted)' }}>
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
