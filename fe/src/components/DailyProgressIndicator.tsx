import { useState, useEffect } from 'react';
import { getDailyProgress } from '../api/userApi';
import type { DailyProgress } from '../types/user';
import { motion } from 'motion/react';
import { Flame } from 'lucide-react';

export function DailyProgressIndicator() {
  const [progress, setProgress] = useState<DailyProgress | null>(null);
  const userId = 1;

  const loadProgress = async () => {
    try {
      const data = await getDailyProgress(userId);
      setProgress(data);
    } catch (error) {
      console.error('Failed to load daily progress:', error);
    }
  };
  useEffect(() => {
    loadProgress();
  }, []);

  if (!progress) return null;

  const { progressCount, dailyGoal, percentage, goalAchieved } = progress;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative flex items-center gap-3 rounded-xl px-4 py-2.5 backdrop-blur-sm"
      style={{
        background: goalAchieved
          ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(251, 146, 60, 0.1))'
          : 'rgba(var(--color-surface-elevated-rgb), 0.6)',
        border: goalAchieved
          ? '1.5px solid rgba(251, 191, 36, 0.3)'
          : '1.5px solid rgba(var(--color-border-rgb), 0.3)',
      }}
    >
      {goalAchieved && (
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), transparent)',
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      <div className="relative flex items-center gap-2">
        <motion.div
          animate={goalAchieved ? { rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5 }}
        >
          <Flame
            size={24}
            style={{
              color: goalAchieved ? '#fbbf24' : 'var(--color-accent)',
              fill: goalAchieved ? '#fbbf24' : 'var(--color-accent)',
              filter: goalAchieved ? 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))' : 'none',
            }}
          />
        </motion.div>

        <div className="flex flex-col leading-none">
          <div className="flex items-baseline gap-1.5">
            <motion.span
              className="text-lg font-bold tracking-tight"
              style={{
                color: goalAchieved ? '#fbbf24' : 'var(--color-text-primary)',
                fontFamily: 'var(--font-display)',
              }}
              key={progressCount}
              initial={{ scale: 1.2, color: '#fbbf24' }}
              animate={{ scale: 1, color: goalAchieved ? '#fbbf24' : 'var(--color-text-primary)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              {progressCount}
            </motion.span>
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              / {dailyGoal}
            </span>
          </div>
          <span className="text-xs tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
            {goalAchieved ? 'GOAL CRUSHED!' : 'TODAY'}
          </span>
        </div>
      </div>

      <div className="relative ml-2 h-8 w-24 overflow-hidden rounded-full bg-black/20">
        <motion.div
          className="absolute inset-0 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            background: goalAchieved
              ? 'linear-gradient(90deg, #fbbf24, #fb923c)'
              : 'linear-gradient(90deg, var(--color-accent), var(--color-primary))',
            boxShadow: goalAchieved
              ? '0 0 12px rgba(251, 191, 36, 0.5)'
              : '0 0 8px var(--glow-accent)',
          }}
        />

        {percentage >= 100 && (
          <>
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-1 w-1 rounded-full bg-yellow-200"
                style={{
                  top: '50%',
                  left: `${20 + i * 15}%`,
                }}
                initial={{ scale: 0, y: 0 }}
                animate={{
                  scale: [0, 1.5, 0],
                  y: [0, -20, -30],
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: 1.2,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
              />
            ))}
          </>
        )}
      </div>
    </motion.div>
  );
}
