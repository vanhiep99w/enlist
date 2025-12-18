import { AchievementCard } from './AchievementCard';
import type { Achievement } from '../types/user';

interface Props {
  achievements: Achievement[];
  newAchievements?: string[];
}

export function AchievementsPanel({ achievements, newAchievements = [] }: Props) {
  if (achievements.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Today's Achievements</h3>
        <p className="text-gray-500 text-center py-4">Complete sessions to earn achievements!</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-gray-300 mb-4">Today's Achievements</h3>
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
