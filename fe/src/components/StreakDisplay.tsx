import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { getDailyProgress } from '../api/userApi';
import type { DailyProgress } from '../types/user';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  weekDays: boolean[];
  lastActivityDate?: string;
}

const MOCK_STREAK_DATA: StreakData = {
  currentStreak: 3,
  longestStreak: 7,
  weekDays: [true, true, true, false, false, false, false],
  lastActivityDate: new Date().toISOString(),
};

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function getMilestoneMessage(streak: number): string | null {
  if (streak >= 100) return '🏆 Century!';
  if (streak >= 30) return '🌟 Monthly Master!';
  if (streak >= 7) return '🔥 Week Champion!';
  return null;
}

function StreakTooltip({
  position,
  data,
  milestone,
  dailyProgress,
}: {
  position: { top: number; left: number };
  data: StreakData;
  milestone: string | null;
  dailyProgress: DailyProgress | null;
}) {
  return createPortal(
    <div
      className="animate-in fade-in zoom-in-95 fixed z-[9999] w-56 rounded-lg p-3 shadow-xl duration-150"
      style={{
        top: position.top,
        left: position.left,
        backgroundColor: 'var(--color-surface)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Arrow */}
      <div
        className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderLeftWidth: '1px',
          borderTopWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'var(--color-border)',
        }}
      />

      <div className="relative space-y-2">
        {/* Daily Progress */}
        {dailyProgress && (
          <>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Today's Progress
                </span>
                <span className="text-xs font-bold" style={{ color: dailyProgress.goalAchieved ? '#22c55e' : 'var(--color-primary)' }}>
                  {dailyProgress.progressCount}/{dailyProgress.dailyGoal} sentences
                </span>
              </div>
              <div className="relative h-2 overflow-hidden rounded-full" style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(dailyProgress.percentage, 100)}%`,
                    background: dailyProgress.goalAchieved
                      ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                      : 'linear-gradient(90deg, var(--color-accent), var(--color-primary))',
                  }}
                />
              </div>
            </div>
            <div
              style={{
                borderTopWidth: '1px',
                borderTopStyle: 'solid',
                borderTopColor: 'var(--color-border)',
              }}
            />
          </>
        )}

        {/* Current streak */}
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Current Streak
          </span>
          <span className="font-bold text-amber-500">{data.currentStreak} days</span>
        </div>

        {/* Longest streak */}
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Longest Streak
          </span>
          <span className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            {data.longestStreak} days
          </span>
        </div>

        {/* Week visualization */}
        <div
          className="pt-2"
          style={{
            borderTopWidth: '1px',
            borderTopStyle: 'solid',
            borderTopColor: 'var(--color-border)',
          }}
        >
          <div className="mb-1 flex items-center justify-between">
            {DAY_LABELS.map((label, idx) => (
              <span
                key={idx}
                className="w-4 text-center text-[10px]"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {label}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between">
            {data.weekDays.map((active, idx) => (
              <div
                key={idx}
                className={`flex h-4 w-4 items-center justify-center rounded-full ${
                  active ? 'border border-amber-500 bg-amber-500/20' : ''
                }`}
                style={
                  !active
                    ? {
                        backgroundColor: 'var(--color-surface-light)',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: 'var(--color-border)',
                      }
                    : undefined
                }
              >
                {active && <span className="text-[8px]">🔥</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Milestone */}
        {milestone && (
          <div
            className="pt-2 text-center"
            style={{
              borderTopWidth: '1px',
              borderTopStyle: 'solid',
              borderTopColor: 'var(--color-border)',
            }}
          >
            <span className="text-xs font-medium text-amber-400">{milestone}</span>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export function StreakDisplay() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [dailyProgress, setDailyProgress] = useState<DailyProgress | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const data = MOCK_STREAK_DATA;
  const userId = 1;

  useEffect(() => {
    loadDailyProgress();
  }, []);

  const loadDailyProgress = async () => {
    try {
      const progress = await getDailyProgress(userId);
      setDailyProgress(progress);
    } catch (error) {
      console.error('Failed to load daily progress:', error);
    }
  };

  const milestone = getMilestoneMessage(data.currentStreak);
  const isActiveToday = data.weekDays[0];

  const handleMouseEnter = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const tooltipWidth = 224;
      let left = rect.left + rect.width / 2 - tooltipWidth / 2;

      if (left < 8) left = 8;
      if (left + tooltipWidth > window.innerWidth - 8) {
        left = window.innerWidth - tooltipWidth - 8;
      }

      setTooltipPos({
        top: rect.bottom + 8,
        left,
      });
      setShowTooltip(true);
    }
  };

  const goalAchieved = dailyProgress?.goalAchieved || false;

  return (
    <motion.div
      ref={containerRef}
      className="relative flex cursor-pointer items-center gap-2.5 rounded-xl px-3.5 py-2 transition-all hover:scale-105"
      style={{
        backgroundColor: goalAchieved 
          ? 'rgba(251, 191, 36, 0.1)' 
          : 'var(--color-surface-light)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: goalAchieved 
          ? 'rgba(251, 191, 36, 0.3)' 
          : 'var(--color-border)',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowTooltip(false)}
      animate={goalAchieved ? {
        boxShadow: [
          '0 0 0 rgba(251, 191, 36, 0)',
          '0 0 12px rgba(251, 191, 36, 0.3)',
          '0 0 0 rgba(251, 191, 36, 0)',
        ]
      } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {/* Flame icon with animation */}
      <motion.span 
        className={`text-lg ${isActiveToday ? 'animate-flame' : 'opacity-50'}`}
        animate={goalAchieved ? { rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.5, repeat: goalAchieved ? Infinity : 0, repeatDelay: 2 }}
      >
        🔥
      </motion.span>

      {/* Daily Progress Count */}
      {dailyProgress && (
        <div className="flex items-baseline gap-1">
          <span 
            className="text-sm font-bold tabular-nums"
            style={{ 
              color: goalAchieved ? '#fbbf24' : 'var(--color-text-primary)',
              fontFamily: 'var(--font-display)',
            }}
          >
            {dailyProgress.progressCount}
          </span>
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            /{dailyProgress.dailyGoal}
          </span>
        </div>
      )}

      {/* Separator */}
      <div 
        className="h-4 w-px" 
        style={{ backgroundColor: 'var(--color-border)' }}
      />

      {/* Week grid */}
      <div className="flex items-center gap-0.5">
        {data.weekDays.map((active, idx) => (
          <div
            key={idx}
            className={`h-2 w-2 rounded-full transition-all duration-200 ${
              active ? 'bg-amber-500 shadow-sm shadow-amber-500/50' : ''
            }`}
            style={!active ? { backgroundColor: 'var(--color-surface-elevated)' } : undefined}
            title={DAY_LABELS[idx]}
          />
        ))}
      </div>

      {/* Current streak count */}
      <span className="text-sm font-bold text-amber-500 tabular-nums">{data.currentStreak}</span>

      {/* Tooltip - rendered via portal to document.body */}
      {showTooltip && <StreakTooltip position={tooltipPos} data={data} milestone={milestone} dailyProgress={dailyProgress} />}
    </motion.div>
  );
}
