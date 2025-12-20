import { AchievementCard } from './AchievementCard';
import type { Achievement } from '../types/user';

interface Props {
  achievements: Achievement[];
  newAchievements?: string[];
}

export function AchievementsPanel({ achievements, newAchievements = [] }: Props) {
  if (achievements.length === 0) {
    return (
      <div className="rounded-lg p-6 border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-secondary)' }}>Today's Achievements</h3>
        <div className="flex flex-col items-center py-6">
          <svg
            className="w-24 h-24 mb-4"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Trophy base */}
            <rect
              x="35"
              y="75"
              width="30"
              height="8"
              rx="2"
              fill="#52525b"
            />
            <rect
              x="42"
              y="65"
              width="16"
              height="12"
              rx="2"
              fill="#71717a"
            />
            
            {/* Trophy cup */}
            <path
              className="animate-gentle-pulse"
              d="M30 25 C30 25 28 45 35 55 C40 62 45 65 50 65 C55 65 60 62 65 55 C72 45 70 25 70 25 L30 25 Z"
              fill="#f59e0b"
              opacity="0.8"
            />
            <path
              d="M30 25 C30 25 28 45 35 55 C40 62 45 65 50 65 C55 65 60 62 65 55 C72 45 70 25 70 25 L30 25 Z"
              stroke="#fbbf24"
              strokeWidth="2"
              fill="none"
            />
            
            {/* Trophy rim */}
            <ellipse cx="50" cy="25" rx="22" ry="6" fill="#d97706" />
            
            {/* Left handle */}
            <path
              d="M30 30 C20 30 18 40 22 48 C26 54 30 52 30 48"
              stroke="#f59e0b"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
            
            {/* Right handle */}
            <path
              d="M70 30 C80 30 82 40 78 48 C74 54 70 52 70 48"
              stroke="#f59e0b"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
            
            {/* Star decoration on trophy */}
            <polygon
              className="animate-sparkle"
              points="50,35 52,41 58,41 53,45 55,51 50,47 45,51 47,45 42,41 48,41"
              fill="#fef3c7"
            />
            
            {/* Sparkle effects */}
            <circle className="animate-sparkle" cx="25" cy="18" r="2" fill="#06b6d4" />
            <circle className="animate-sparkle-delayed" cx="75" cy="15" r="2.5" fill="#06b6d4" />
            <circle className="animate-sparkle-slow" cx="80" cy="60" r="2" fill="#f59e0b" opacity="0.7" />
            <circle className="animate-sparkle" cx="20" cy="55" r="1.5" fill="#fbbf24" opacity="0.6" />
            
            {/* Small stars */}
            <polygon
              className="animate-sparkle-delayed"
              points="85,25 86,28 89,28 87,30 88,33 85,31 82,33 83,30 81,28 84,28"
              fill="#06b6d4"
              opacity="0.8"
            />
            <polygon
              className="animate-sparkle-slow"
              points="15,40 16,42 18,42 16.5,43.5 17,46 15,44.5 13,46 13.5,43.5 12,42 14,42"
              fill="#fbbf24"
              opacity="0.7"
            />
          </svg>
          <p className="font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>No achievements yet</p>
          <p className="text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>Complete sessions to earn your first trophy!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg p-6 border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-secondary)' }}>Today's Achievements</h3>
      <div className="grid grid-cols-2 gap-4">
        {achievements.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            isNew={newAchievements.includes(achievement.id)}
          />
        ))}
      </div>
    </div>
  );
}
