import type { Achievement } from '../types/user';

interface Props {
  achievement: Achievement;
  isNew?: boolean;
}

const achievementIcons: Record<string, string> = {
  day_streak: '🔥',
  bright_mind: '💡',
  perfect_score: '🏆',
  speed_demon: '⚡',
  first_session: '🎯',
  points_milestone: '🌟',
};

export function AchievementCard({ achievement, isNew = false }: Props) {
  const icon = achievementIcons[achievement.id] || achievement.icon || '🏅';
  const hasProgress = achievement.progress !== undefined && achievement.target !== undefined;

  return (
    <div
      className={`relative rounded-lg p-4 text-center transition-all duration-300 ${
        isNew ? 'ring-2 ring-yellow-400 animate-pulse' : ''
      }`}
      style={{ backgroundColor: 'var(--color-surface-light)' }}
    >
      {isNew && (
        <div className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full">
          NEW!
        </div>
      )}
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{achievement.title}</div>
      {achievement.description && (
        <div className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>{achievement.description}</div>
      )}
      {hasProgress && (
        <div className="mt-2">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface-elevated)' }}>
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${Math.min(100, (achievement.progress! / achievement.target!) * 100)}%` }}
            />
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            {achievement.progress}/{achievement.target}
          </div>
        </div>
      )}
    </div>
  );
}
