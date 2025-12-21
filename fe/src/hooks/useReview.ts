import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewApi, type ReviewSubmitRequest } from '../api/reviewApi';

export const reviewKeys = {
  all: ['reviews'] as const,
  dueReviews: () => [...reviewKeys.all, 'due'] as const,
  dueCount: () => [...reviewKeys.all, 'dueCount'] as const,
  allCards: () => [...reviewKeys.all, 'allCards'] as const,
};

export function useDueReviews() {
  const token = localStorage.getItem('token');
  return useQuery({
    queryKey: reviewKeys.dueReviews(),
    queryFn: () => reviewApi.getDueReviews(),
    enabled: !!token,
  });
}

export function useDueCount() {
  const token = localStorage.getItem('token');
  return useQuery({
    queryKey: reviewKeys.dueCount(),
    queryFn: () => reviewApi.getDueCount(),
    enabled: !!token,
    refetchInterval: 60000,
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: ReviewSubmitRequest) => reviewApi.submitReview(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.dueReviews() });
      queryClient.invalidateQueries({ queryKey: reviewKeys.dueCount() });
    },
  });
}

export function useAllUserCards() {
  const token = localStorage.getItem('token');
  return useQuery({
    queryKey: reviewKeys.allCards(),
    queryFn: () => reviewApi.getAllUserCards(),
    enabled: !!token,
  });
}
