import { Trophy, Medal, Award, TrendingUp, Zap, Target } from 'lucide-react';
import { useGlobalLeaderboard, useUserRank } from '../hooks/useLeaderboard';
import { useAuth } from '../contexts/AuthContext';

export function Leaderboard() {
  const { user } = useAuth();
  const userId = user?.id ?? 0;
  const { data: leaderboard, isLoading, error } = useGlobalLeaderboard(20);
  const { data: userRank } = useUserRank(userId);

  if (isLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: 'var(--color-surface-dark)' }}
      >
        <div className="w-full max-w-4xl animate-pulse space-y-4 px-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-2xl"
              style={{ backgroundColor: 'var(--color-surface)' }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex min-h-screen items-center justify-center px-4"
        style={{ backgroundColor: 'var(--color-surface-dark)' }}
      >
        <div className="text-center">
          <p className="text-red-400">Failed to load leaderboard</p>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    );
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-300" />;
    if (rank === 3) return <Award className="h-6 w-6 text-amber-600" />;
    return null;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-500 to-amber-600';
    if (rank === 2) return 'bg-gradient-to-br from-gray-400 to-gray-500';
    if (rank === 3) return 'bg-gradient-to-br from-amber-600 to-orange-700';
    return 'bg-gradient-to-br from-blue-600 to-blue-700';
  };

  return (
    <div
      className="min-h-screen px-4 pt-24 pb-20"
      style={{ backgroundColor: 'var(--color-surface-dark)' }}
    >
      <div className="mx-auto max-w-4xl">
        {/* Hero Section */}
        <div className="animate-fade-up mb-12 text-center">
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-2"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <Trophy className="h-5 w-5 text-yellow-400" />
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Global Rankings
            </span>
          </div>

          <h1 className="font-display mb-4 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-5xl font-bold text-transparent">
            Leaderboard
          </h1>

          <p className="mx-auto max-w-2xl text-lg" style={{ color: 'var(--color-text-muted)' }}>
            See how you rank against other learners worldwide
          </p>

          {/* User's Current Rank */}
          {userRank && (
            <div
              className="mt-6 inline-flex items-center gap-3 rounded-2xl border px-6 py-3"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-accent)',
              }}
            >
              <TrendingUp className="h-5 w-5 text-cyan-400" />
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Your Rank:
              </span>
              <span className="text-xl font-bold text-cyan-400">#{userRank}</span>
            </div>
          )}
        </div>

        {/* Leaderboard Table */}
        <div className="animate-fade-up space-y-3" style={{ animationDelay: '0.1s' }}>
          {leaderboard?.map((user, index) => {
            const rank = index + 1;
            const isCurrentUser = user.id === userId;
            const isTopThree = rank <= 3;

            return (
              <div
                key={user.id}
                className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${
                  isCurrentUser ? 'scale-[1.02] ring-2 ring-cyan-500' : 'hover:scale-[1.01]'
                }`}
                style={{
                  backgroundColor: isCurrentUser
                    ? 'var(--color-card-translucent)'
                    : 'var(--color-surface)',
                  borderColor: isCurrentUser ? 'var(--color-accent)' : 'var(--color-border)',
                }}
              >
                {/* Background Gradient for Top 3 */}
                {isTopThree && (
                  <div
                    className="absolute inset-0 opacity-5"
                    style={{
                      background:
                        rank === 1
                          ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                          : rank === 2
                            ? 'linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)'
                            : 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                    }}
                  />
                )}

                <div className="relative flex items-center gap-4">
                  {/* Rank Badge */}
                  <div className="flex-shrink-0">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold ${getRankBadgeColor(rank)} shadow-lg`}
                      style={{ color: 'white' }}
                    >
                      {getRankIcon(rank) || `#${rank}`}
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="min-w-0 flex-grow">
                    <div className="mb-1 flex items-center gap-2">
                      <h3
                        className="truncate text-lg font-semibold"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {user.username || 'Anonymous'}
                      </h3>
                      {isCurrentUser && (
                        <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-xs font-medium text-cyan-400">
                          You
                        </span>
                      )}
                    </div>

                    {/* Stats Grid */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Zap className="h-4 w-4 text-yellow-400" />
                        <span style={{ color: 'var(--color-text-muted)' }}>
                          {user.totalPoints.toLocaleString()} pts
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Target className="h-4 w-4 text-green-400" />
                        <span style={{ color: 'var(--color-text-muted)' }}>
                          {user.sessionsCompleted} sessions
                        </span>
                      </div>

                      {user.currentStreak > 0 && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-orange-400">🔥</span>
                          <span style={{ color: 'var(--color-text-muted)' }}>
                            {user.currentStreak} day streak
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Points Display */}
                  <div className="flex-shrink-0 text-right">
                    <div className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-2xl font-bold text-transparent">
                      {user.totalPoints.toLocaleString()}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      points
                    </div>
                  </div>
                </div>

                {/* Top 3 Shine Effect */}
                {isTopThree && (
                  <div
                    className="absolute -top-1/2 -right-1/2 h-full w-full rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20"
                    style={{
                      background:
                        rank === 1
                          ? 'radial-gradient(circle, #fbbf24 0%, transparent 70%)'
                          : rank === 2
                            ? 'radial-gradient(circle, #d1d5db 0%, transparent 70%)'
                            : 'radial-gradient(circle, #f59e0b 0%, transparent 70%)',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {leaderboard && leaderboard.length === 0 && (
          <div className="py-20 text-center">
            <Trophy className="mx-auto mb-4 h-16 w-16 text-gray-600" />
            <h3
              className="mb-2 text-xl font-semibold"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              No Rankings Yet
            </h3>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Be the first to complete a session and claim the top spot!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
