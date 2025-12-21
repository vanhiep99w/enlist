import { createFileRoute } from '@tanstack/react-router';
import { Leaderboard } from '../components/Leaderboard';
import { ProtectedRoute } from '../components/ProtectedRoute';

export const Route = createFileRoute('/leaderboard')({
  component: LeaderboardPage,
});

function LeaderboardPage() {
  return (
    <ProtectedRoute>
      <Leaderboard />
    </ProtectedRoute>
  );
}
