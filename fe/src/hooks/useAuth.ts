import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import type { LoginRequest, RegisterRequest } from '../types/auth';

export const authKeys = {
  all: ['auth'] as const,
  currentUser: () => [...authKeys.all, 'currentUser'] as const,
};

export function useCurrentUser() {
  const token = localStorage.getItem('token');
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: () => authApi.getCurrentUser(),
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: async (response) => {
      localStorage.setItem('token', response.token);
      await queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: async (response) => {
      localStorage.setItem('token', response.token);
      await queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    onSuccess: () => {
      queryClient.setQueryData(authKeys.currentUser(), null);
      queryClient.clear();
    },
  });
}
