import type { Achievement } from '../types/user';
import { Card, CardContent } from './ui/card';
import { cn } from '@/lib/utils';

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
    <Card
      className={cn(
        'relative text-center transition-all duration-300',
        isNew && 'ring-2 ring-yellow-400 animate-pulse'
      )}
    >
      {isNew && (
        <div className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full">
          NEW!
        </div>
      )}
      <CardContent className="p-4">
        <div className="text-3xl mb-2">{icon}</div>
        <div className="text-sm font-medium text-card-foreground">{achievement.title}</div>
        {achievement.description && (
          <div className="text-xs mt-1 text-muted-foreground">{achievement.description}</div>
        )}
        {hasProgress && (
          <div className="mt-2">
            <div className="h-1.5 rounded-full overflow-hidden bg-muted">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${Math.min(100, (achievement.progress! / achievement.target!) * 100)}%` }}
              />
            </div>
            <div className="text-xs mt-1 text-muted-foreground">
              {achievement.progress}/{achievement.target}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
