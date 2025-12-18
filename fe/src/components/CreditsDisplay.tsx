import { useUserCredits } from '../hooks/useUserCredits';

export function CreditsDisplay() {
  const { credits, isLoading } = useUserCredits();

  if (isLoading) {
    return (
      <div className="flex items-center gap-4 animate-pulse">
        <div className="h-6 w-20 bg-gray-700 rounded" />
        <div className="h-6 w-20 bg-gray-700 rounded" />
      </div>
    );
  }

  if (!credits) return null;

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg border border-gray-700">
        <span className="text-lg">💰</span>
        <span className="font-medium text-yellow-400">{credits.credits}</span>
        <span className="text-gray-400 text-sm">credits</span>
      </div>
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg border border-gray-700">
        <span className="text-lg">⭐</span>
        <span className="font-medium text-yellow-400">{credits.totalPoints}</span>
        <span className="text-gray-400 text-sm">points</span>
      </div>
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg border border-gray-700">
        <span className="text-lg">📚</span>
        <span className="font-medium text-green-400">{credits.sessionsCompleted}</span>
        <span className="text-gray-400 text-sm">sessions</span>
      </div>
    </div>
  );
}
