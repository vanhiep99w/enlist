import { Link } from '@tanstack/react-router';
import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import {
  ChevronDown,
  Volume2,
  VolumeX,
  Moon,
  Sunrise,
  Snowflake,
  Sun,
  RefreshCw,
} from 'lucide-react';
import { Logo } from './Logo';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useTheme, type Theme } from '../hooks/useTheme';
import { useUserCredits } from '../hooks/useUserCredits';
import { getDailyProgress, getStreak } from '../api/userApi';
import { reviewApi } from '../api/reviewApi';
import type { DailyProgress, StreakData } from '../types/user';
import { useEffect, useCallback } from 'react';

const themeConfig: Record<Theme, { icon: React.ReactNode; label: string; color: string }> = {
  midnight: { icon: <Moon className="h-4 w-4" />, label: 'Midnight', color: 'text-violet-400' },
  sunrise: { icon: <Sunrise className="h-4 w-4" />, label: 'Sunrise', color: 'text-amber-400' },
  arctic: { icon: <Snowflake className="h-4 w-4" />, label: 'Arctic', color: 'text-sky-400' },
  desert: { icon: <Sun className="h-4 w-4" />, label: 'Desert', color: 'text-orange-400' },
};

function NavLink({
  to,
  children,
  exact = false,
}: {
  to: string;
  children: React.ReactNode;
  exact?: boolean;
}) {
  return (
    <Link
      to={to}
      className="group relative px-1 py-2 text-sm font-medium tracking-wide transition-colors [&.active]:text-amber-500"
      style={{ color: 'var(--color-text-secondary)' }}
      activeOptions={exact ? { exact: true } : undefined}
    >
      {children}
      <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-amber-500 transition-all duration-300 group-hover:w-full [.active_&]:w-full" />
    </Link>
  );
}

function StatPill({
  icon,
  value,
  label,
  accent = false,
}: {
  icon: string;
  value: number | string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-base">{icon}</span>
      <span
        className="text-sm font-semibold tabular-nums"
        style={{ color: accent ? '#fbbf24' : 'var(--color-text-primary)' }}
      >
        {value}
      </span>
      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
        {label}
      </span>
    </div>
  );
}

function ThemeDropdown() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const themes: Theme[] = ['midnight', 'sunrise', 'arctic', 'desert'];
  const current = themeConfig[theme];

  const handleOpen = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setOpen(!open);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleOpen}
        className="flex items-center gap-2 rounded-lg px-3 py-2 transition-all hover:opacity-80"
        style={{ backgroundColor: 'var(--color-surface-light)' }}
      >
        <span className={current.color}>{current.icon}</span>
        <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          {current.label}
        </span>
        <ChevronDown
          className="h-3.5 w-3.5 transition-transform"
          style={{
            color: 'var(--color-text-muted)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {open &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed z-[9999] w-36 overflow-hidden rounded-xl p-1 shadow-xl"
              style={{
                top: dropdownPos.top,
                right: dropdownPos.right,
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
              }}
            >
              {themes.map((t) => {
                const cfg = themeConfig[t];
                const isActive = t === theme;
                return (
                  <button
                    key={t}
                    onClick={() => {
                      setTheme(t);
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-all hover:opacity-80"
                    style={{
                      backgroundColor: isActive ? 'var(--color-surface-light)' : 'transparent',
                    }}
                  >
                    <span className={cfg.color}>{cfg.icon}</span>
                    <span
                      className="text-sm font-medium"
                      style={{
                        color: isActive
                          ? 'var(--color-text-primary)'
                          : 'var(--color-text-secondary)',
                      }}
                    >
                      {cfg.label}
                    </span>
                  </button>
                );
              })}
            </motion.div>
          </>,
          document.body
        )}
    </div>
  );
}

function SoundButton() {
  const { soundEnabled, toggleSounds } = useSoundEffects();

  return (
    <button
      onClick={toggleSounds}
      className="flex h-9 w-9 items-center justify-center rounded-lg transition-all hover:scale-105"
      style={{ backgroundColor: 'var(--color-surface-light)' }}
      aria-label={soundEnabled ? 'Disable sounds' : 'Enable sounds'}
    >
      {soundEnabled ? (
        <Volume2 className="h-4 w-4 text-amber-500" />
      ) : (
        <VolumeX className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
      )}
    </button>
  );
}

function ReviewButton() {
  const [dueCount, setDueCount] = useState<number>(0);

  useEffect(() => {
    const loadDueCount = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const count = await reviewApi.getDueCount(token);
        setDueCount(count);
      } catch (err) {
        console.error('Failed to load due count:', err);
      }
    };
    loadDueCount();
    const interval = setInterval(loadDueCount, 60000);
    return () => clearInterval(interval);
  }, []);

  if (dueCount === 0) return null;

  return (
    <Link
      to="/review"
      className="relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-white transition-all hover:scale-105"
      style={{ backgroundColor: 'var(--color-primary)' }}
    >
      <RefreshCw className="h-3.5 w-3.5" />
      <span className="text-xs font-semibold">{dueCount}</span>
      <span className="absolute -top-0.5 -right-0.5 h-2 w-2 animate-pulse rounded-full bg-red-500" />
    </Link>
  );
}

export function Header() {
  const { credits, isLoading: creditsLoading } = useUserCredits();
  const [dailyProgress, setDailyProgress] = useState<DailyProgress | null>(null);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const userId = 1;

  const loadData = useCallback(async () => {
    try {
      const [progress, streak] = await Promise.all([getDailyProgress(userId), getStreak(userId)]);
      setDailyProgress(progress);
      setStreakData(streak);
    } catch (error) {
      console.error('Failed to load header data:', error);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--color-surface) 85%, transparent)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Left: Logo & Nav */}
        <div className="flex items-center gap-10">
          <Link
            to="/"
            className="flex items-center gap-2.5 transition-transform hover:scale-[1.02]"
          >
            <Logo size={36} />
            <span
              className="text-xl font-bold tracking-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Enlist
            </span>
          </Link>

          <nav className="flex items-center gap-6">
            <NavLink to="/" exact>
              Practice
            </NavLink>
            <NavLink to="/paragraphs">Paragraphs</NavLink>
            <NavLink to="/analytics">Analytics</NavLink>
            <NavLink to="/leaderboard">Leaderboard</NavLink>
          </nav>
        </div>

        {/* Right: Stats & Controls */}
        <div className="flex items-center gap-6">
          {/* Stats group */}
          <div
            className="flex items-center gap-4 rounded-xl px-4 py-2"
            style={{ backgroundColor: 'var(--color-surface-light)' }}
          >
            {/* Daily progress */}
            {dailyProgress && (
              <div className="flex items-center gap-2">
                <motion.span
                  className="text-base"
                  animate={dailyProgress.goalAchieved ? { scale: [1, 1.2, 1] } : {}}
                  transition={{
                    duration: 0.5,
                    repeat: dailyProgress.goalAchieved ? Infinity : 0,
                    repeatDelay: 2,
                  }}
                >
                  🔥
                </motion.span>
                <div className="flex items-baseline gap-0.5">
                  <span
                    className="text-sm font-bold tabular-nums"
                    style={{
                      color: dailyProgress.goalAchieved ? '#22c55e' : 'var(--color-text-primary)',
                    }}
                  >
                    {dailyProgress.progressCount}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    /{dailyProgress.dailyGoal}
                  </span>
                </div>
              </div>
            )}

            {/* Streak */}
            {streakData && streakData.currentStreak > 0 && (
              <>
                <div className="h-4 w-px" style={{ backgroundColor: 'var(--color-border)' }} />
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-amber-500 tabular-nums">
                    {streakData.currentStreak}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    days
                  </span>
                </div>
              </>
            )}

            {/* Credits & Points */}
            {!creditsLoading && credits && (
              <>
                <div className="h-4 w-px" style={{ backgroundColor: 'var(--color-border)' }} />
                <StatPill icon="💰" value={credits.credits} label="" accent />
                <StatPill icon="⭐" value={credits.totalPoints} label="" accent />
              </>
            )}
          </div>

          {/* Review badge */}
          <ReviewButton />

          {/* Controls */}
          <div className="flex items-center gap-2">
            <SoundButton />
            <ThemeDropdown />
          </div>
        </div>
      </div>
    </header>
  );
}
