import { useEffect, useState, useMemo } from 'react';
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

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      playAchievementSound();

      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [achievement, playAchievementSound, handleClose]);

  if (!achievement) return null;

  const icon = achievementIcons[achievement.id] || achievement.icon || '🏅';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={`relative max-w-md transform transition-all duration-500 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
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
          className="relative overflow-hidden rounded-3xl border-2 border-yellow-400/50 p-8 shadow-2xl"
          style={{
            backgroundColor: 'var(--color-surface)',
            boxShadow: '0 0 60px rgba(250, 204, 21, 0.3)',
          }}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 rounded-full p-1 transition-colors hover:bg-white/10"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <X className="h-5 w-5" />
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
          <div className="relative text-center">
            {/* Badge header */}
            <div className="mb-4 flex items-center justify-center gap-2">
              <Star className="h-5 w-5 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-400">ACHIEVEMENT UNLOCKED</span>
              <Star className="h-5 w-5 text-yellow-400" />
            </div>

            {/* Icon with glow */}
            <div className="relative mx-auto mb-6 flex h-32 w-32 items-center justify-center">
              {/* Glow rings */}
              <div className="absolute inset-0 animate-ping rounded-full bg-yellow-400/30" />
              <div className="absolute inset-2 animate-pulse rounded-full bg-yellow-400/20" />

              {/* Icon */}
              <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full border-4 border-yellow-400 bg-gradient-to-br from-yellow-500 to-amber-600 text-6xl shadow-lg">
                {icon}
              </div>

              {/* Sparkles */}
              <Sparkles className="absolute -top-2 -right-2 h-8 w-8 animate-spin text-yellow-400" />
              <Sparkles className="absolute -bottom-2 -left-2 h-6 w-6 animate-spin text-yellow-300" />
            </div>

            {/* Achievement title */}
            <h2 className="mb-2 text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {achievement.title}
            </h2>

            {/* Description */}
            {achievement.description && (
              <p className="mb-6 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {achievement.description}
              </p>
            )}

            {/* Celebration icon */}
            <div className="flex items-center justify-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
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
