import { createFileRoute } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { ProgressChart } from '../components/ProgressChart';
import { ErrorAnalyticsPanel } from '../components/ErrorAnalyticsPanel';
import { ErrorTrendChart } from '../components/ErrorTrendChart';
import { TrendingUp, Brain, Target, Sparkles } from 'lucide-react';

export const Route = createFileRoute('/analytics')({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const userId = 1;

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-3">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
              }}
            >
              <TrendingUp size={32} className="text-white" />
            </div>
          </div>
          <h1
            className="mb-3 text-5xl font-black"
            style={{
              color: 'var(--color-text-primary)',
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Analytics Dashboard
          </h1>
          <p className="text-xl" style={{ color: 'var(--color-text-muted)' }}>
            Track your learning journey and identify areas for improvement
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {[
            {
              title: 'Progress Tracking',
              description: 'Monitor sentences, accuracy, and points over time',
              icon: Target,
              color: '#10b981',
              gradient: 'from-emerald-500/20 to-emerald-500/5',
            },
            {
              title: 'Error Analysis',
              description: 'Understand your most common mistakes',
              icon: Brain,
              color: '#ef4444',
              gradient: 'from-red-500/20 to-red-500/5',
            },
            {
              title: 'Trend Insights',
              description: 'See how you improve day by day',
              icon: Sparkles,
              color: '#f59e0b',
              gradient: 'from-amber-500/20 to-amber-500/5',
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={`rounded-3xl border-2 bg-gradient-to-br p-6 ${stat.gradient}`}
              style={{
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: stat.color,
                    boxShadow: `0 4px 20px ${stat.color}40`,
                  }}
                >
                  <stat.icon size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-black" style={{ color: 'var(--color-text-primary)' }}>
                  {stat.title}
                </h3>
              </div>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {stat.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Progress Chart Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <ProgressChart userId={userId} />
        </motion.div>

        {/* Error Trend Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <ErrorTrendChart userId={userId} />
        </motion.div>

        {/* Error Analytics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <ErrorAnalyticsPanel />
        </motion.div>
      </div>
    </div>
  );
}
