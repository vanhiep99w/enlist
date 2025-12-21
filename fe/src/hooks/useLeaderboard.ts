import { useQuery } from '@tanstack/react-query';
import { getGlobalLeaderboard, getUserRank } from '../api/leaderboardApi';

export function useGlobalLeaderboard(limit: number = 10) {
  return useQuery({
    queryKey: ['leaderboard', limit],
    queryFn: () => getGlobalLeaderboard(limit),
  });
}

export function useUserRank() {
  return useQuery({
    queryKey: ['leaderboard-rank'],
    queryFn: () => getUserRank(),
  });
}
