import { useUserCredits } from '../hooks/useUserCredits';

export function CreditsDisplay() {
  const { credits, isLoading } = useUserCredits();

  if (isLoading) {
    return (
      <div className="flex items-center gap-4 animate-pulse">
        <div className="h-6 w-20 rounded" style={{ backgroundColor: 'var(--color-surface-light)' }} />
        <div className="h-6 w-20 rounded" style={{ backgroundColor: 'var(--color-surface-light)' }} />
      </div>
    );
  }

  if (!credits) return null;

  return (
    <div className="flex items-center gap-4">
      <div 
        className="flex items-center gap-2 h-10 px-3 rounded-lg"
        style={{ backgroundColor: 'var(--color-surface)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
      >
        <span className="text-lg">💰</span>
        <span className="font-medium text-yellow-400">{credits.credits}</span>
        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>credits</span>
      </div>
      <div 
        className="flex items-center gap-2 h-10 px-3 rounded-lg"
        style={{ backgroundColor: 'var(--color-surface)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
      >
        <span className="text-lg">⭐</span>
        <span className="font-medium text-yellow-400">{credits.totalPoints}</span>
        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>points</span>
      </div>
      <div 
        className="flex items-center gap-2 h-10 px-3 rounded-lg"
        style={{ backgroundColor: 'var(--color-surface)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
      >
        <span className="text-lg">📚</span>
        <span className="font-medium text-green-400">{credits.sessionsCompleted}</span>
        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>sessions</span>
      </div>
    </div>
  );
}
