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
        isNew && 'animate-pulse ring-2 ring-yellow-400'
      )}
    >
      {isNew && (
        <div className="absolute -top-2 -right-2 rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-bold text-gray-900">
          NEW!
        </div>
      )}
      <CardContent className="p-4">
        <div className="mb-2 text-3xl">{icon}</div>
        <div className="text-card-foreground text-sm font-medium">{achievement.title}</div>
        {achievement.description && (
          <div className="text-muted-foreground mt-1 text-xs">{achievement.description}</div>
        )}
        {hasProgress && (
          <div className="mt-2">
            <div className="bg-muted h-1.5 overflow-hidden rounded-full">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{
                  width: `${Math.min(100, (achievement.progress! / achievement.target!) * 100)}%`,
                }}
              />
            </div>
            <div className="text-muted-foreground mt-1 text-xs">
              {achievement.progress}/{achievement.target}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
