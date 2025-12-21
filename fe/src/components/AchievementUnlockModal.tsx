import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Trophy, Star, Sparkles, X } from 'lucide-react';
import { useSoundEffects } from '../hooks/useSoundEffects';
import type { Achievement } from '../types/user';

interface Props {
  achievement: Achievement | null;
  onClose: () => void;
}

const achievementIcons: Record<string, string> = {
  day_streak: '🔥',
  bright_mind: '💡',
  perfect_score: '🏆',
  speed_demon: '⚡',
  first_session: '🎯',
  points_milestone: '🌟',
};

export function AchievementUnlockModal({ achievement, onClose }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const { playAchievementSound } = useSoundEffects();
  const soundPlayedRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate confetti particles once - outside of render
  const confettiParticles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => {
        // Using hash-based pseudo-random for deterministic results
        const hash = (i * 2654435761) % 2 ** 32;
        return {
          id: i,
          left: ((hash % 100) + i * 3.33) % 100,
          delay: (i % 10) * 0.05,
          duration: 2 + (i % 4) * 0.5,
          emoji: ['⭐', '✨', '🎉', '💫'][i % 4],
        };
      }),
    []
  );

  const handleClose = useCallback(() => {
    // Clear timer if user closes manually
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setIsVisible(false);
    setTimeout(() => {
      onClose();
      soundPlayedRef.current = false;
    }, 300); // Wait for animation to complete
  }, [onClose]);

  useEffect(() => {
    if (achievement && !soundPlayedRef.current) {
      setIsVisible(true);
      playAchievementSound();
      soundPlayedRef.current = true;

      // Auto-close after 3 seconds
      timerRef.current = setTimeout(() => {
        handleClose();
      }, 3000);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }
  }, [achievement, playAchievementSound, handleClose]);

  if (!achievement) return null;

  const icon = achievementIcons[achievement.id] || achievement.icon || '🏅';

  return (
    <div
      className={`fixed top-20 right-4 z-50 max-w-sm transform transition-all duration-500 ${
        isVisible ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-[120%] opacity-0'
      }`}
    >
      {/* Toast Notification */}
      <div className="relative">
        {/* Confetti particles */}
        <div className="absolute inset-0 overflow-hidden">
          {confettiParticles.map((particle) => (
            <div
              key={particle.id}
              className="confetti-particle absolute"
              style={{
                left: `${particle.left}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
              }}
            >
              {particle.emoji}
            </div>
          ))}
        </div>

        {/* Card */}
        <div
          className="relative overflow-hidden rounded-2xl border-2 border-yellow-400/50 p-6 shadow-2xl"
          style={{
            backgroundColor: 'var(--color-surface)',
            boxShadow: '0 0 40px rgba(250, 204, 21, 0.3)',
          }}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 rounded-full p-1 transition-colors hover:bg-white/10"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <X className="h-4 w-4" />
          </button>

          {/* Animated background glow */}
          <div
            className="pointer-events-none absolute inset-0 animate-pulse opacity-20"
            style={{
              background:
                'radial-gradient(circle at center, rgba(250, 204, 21, 0.4) 0%, transparent 70%)',
            }}
          />

          {/* Content */}
          <div className="relative">
            {/* Badge header */}
            <div className="mb-3 flex items-center justify-center gap-1.5">
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="text-xs font-medium text-yellow-400">ACHIEVEMENT UNLOCKED</span>
              <Star className="h-4 w-4 text-yellow-400" />
            </div>

            {/* Icon with glow - Compact */}
            <div className="relative mx-auto mb-3 flex h-16 w-16 items-center justify-center">
              {/* Glow rings */}
              <div className="absolute inset-0 animate-ping rounded-full bg-yellow-400/30" />

              {/* Icon */}
              <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 border-yellow-400 bg-gradient-to-br from-yellow-500 to-amber-600 text-3xl shadow-lg">
                {icon}
              </div>

              {/* Sparkle */}
              <Sparkles className="absolute -top-1 -right-1 h-5 w-5 animate-spin text-yellow-400" />
            </div>

            {/* Achievement title */}
            <h3
              className="mb-1 text-center text-lg font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {achievement.title}
            </h3>

            {/* Description */}
            {achievement.description && (
              <p className="mb-3 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {achievement.description}
              </p>
            )}

            {/* Celebration icon */}
            <div className="flex items-center justify-center gap-1.5">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span
                className="text-xs font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Keep up the great work!
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        .confetti-particle {
          animation: confetti-fall linear forwards;
          font-size: 1.5rem;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
