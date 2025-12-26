import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getUserRandomSessions, type RandomSession } from '../api/sessionApi';
import { useAuth } from '../contexts/AuthContext';

export const Route = createFileRoute('/random-history')({
  component: RandomHistoryPage,
});

function RandomHistoryPage() {
  const { user } = useAuth();

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['random-sessions', 'user', user?.id],
    queryFn: getUserRandomSessions,
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen p-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-8 text-4xl font-bold">Random Session History</h1>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-xl"
                style={{ backgroundColor: 'var(--color-surface)' }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const completedSessions = sessions?.filter((s) => s.status === 'COMPLETED') || [];
  const activeSessions = sessions?.filter((s) => s.status === 'ACTIVE') || [];

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold">Random Session History</h1>
          <Link
            to="/random-session"
            className="rounded-xl px-6 py-3 font-semibold transition-all"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-text-primary)',
            }}
          >
            Start New Session
          </Link>
        </div>

        {/* Active Sessions */}
        {activeSessions.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-4 text-2xl font-bold">Continue Practice</h2>
            <div className="grid gap-4">
              {activeSessions.map((session) => (
                <SessionCard key={session.id} session={session} isActive />
              ))}
            </div>
          </div>
        )}

        {/* Completed Sessions */}
        <div>
          <h2 className="mb-4 text-2xl font-bold">Past Sessions</h2>
          {completedSessions.length === 0 ? (
            <div
              className="rounded-xl p-12 text-center"
              style={{ backgroundColor: 'var(--color-surface)' }}
            >
              <p style={{ color: 'var(--color-text-secondary)' }}>
                No completed sessions yet. Start your first adaptive practice session!
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {completedSessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SessionCard({ session, isActive }: { session: RandomSession; isActive?: boolean }) {
  const duration = session.endedAt
    ? Math.floor(
        (new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 1000
      )
    : 0;

  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  return (
    <Link
      to="/random-history/$sessionId"
      params={{ sessionId: String(session.id) }}
      className="block rounded-xl p-6 transition-all hover:scale-[1.02]"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderLeft: `4px solid ${isActive ? 'var(--color-accent)' : 'var(--color-primary)'}`,
      }}
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <h3 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {isActive ? '🔥 In Progress' : '✓ Completed'}
            </h3>
            {isActive && (
              <span
                className="rounded-full px-3 py-1 text-xs font-bold"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-surface)',
                }}
              >
                ACTIVE
              </span>
            )}
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {new Date(session.startedAt).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
            {session.averageAccuracy.toFixed(0)}%
          </div>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Avg Accuracy
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatBox label="Paragraphs" value={session.totalParagraphsCompleted} icon="📝" />
        <StatBox label="Points" value={session.totalPoints} icon="⭐" />
        <StatBox label="Credits" value={session.totalCredits} icon="💎" />
        <StatBox
          label="Duration"
          value={isActive ? 'In Progress' : `${minutes}m ${seconds}s`}
          icon="⏱️"
        />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div
          className="rounded-lg px-3 py-1 text-xs font-semibold"
          style={{
            backgroundColor: 'var(--color-surface-elevated)',
            color: 'var(--color-text-secondary)',
          }}
        >
          {session.targetLanguage}
        </div>
        <div
          className="rounded-lg px-3 py-1 text-xs font-semibold"
          style={{
            backgroundColor: getDifficultyColor(session.currentDifficulty),
            color: 'var(--color-surface)',
          }}
        >
          Difficulty: {session.currentDifficulty}
        </div>
      </div>
    </Link>
  );
}

function StatBox({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--color-surface-elevated)' }}>
      <div className="mb-1 text-xl">{icon}</div>
      <div className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
        {value}
      </div>
      <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </p>
    </div>
  );
}

function getDifficultyColor(level: number): string {
  if (level <= 2) return '#10b981'; // Easy - green
  if (level <= 4) return '#f59e0b'; // Medium - amber
  return '#ef4444'; // Hard - red
}
