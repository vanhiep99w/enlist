import { useEffect, useState } from 'react';

interface Props {
  show: boolean;
  accuracy: number;
  onComplete?: () => void;
}

export function SuccessAnimation({ show, accuracy, onComplete }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string }>>([]);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      
      // Generate confetti particles
      const newParticles = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: ['#22c55e', '#3b82f6', '#eab308', '#a855f7', '#ec4899'][Math.floor(Math.random() * 5)],
      }));
      setParticles(newParticles);

      // Auto-hide after animation
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!isVisible) return null;

  const getMessage = () => {
    if (accuracy >= 95) return { text: 'Perfect!', emoji: '🏆' };
    if (accuracy >= 90) return { text: 'Excellent!', emoji: '⭐' };
    if (accuracy >= 85) return { text: 'Great job!', emoji: '🎯' };
    return { text: 'Good work!', emoji: '✓' };
  };

  const message = getMessage();

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {/* Confetti particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-3 h-3 rounded-full animate-confetti"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
            animationDelay: `${particle.id * 50}ms`,
          }}
        />
      ))}

      {/* Success badge */}
      <div className="animate-success-pop bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
        <span className="text-3xl animate-bounce-once">{message.emoji}</span>
        <div>
          <div className="text-xl font-bold">{message.text}</div>
          <div className="text-green-100 text-sm">{accuracy}% accuracy</div>
        </div>
      </div>
    </div>
  );
}
