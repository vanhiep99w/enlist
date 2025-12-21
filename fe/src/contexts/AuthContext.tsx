import { createContext, useContext, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrentUser, useLogin, useRegister, useLogout, authKeys } from '../hooks/useAuth';
import type { User, LoginRequest, RegisterRequest } from '../types/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');

  const { data: user, isLoading, refetch } = useCurrentUser();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  const login = async (data: LoginRequest) => {
    await loginMutation.mutateAsync(data);
    const userData = await queryClient.fetchQuery({
      queryKey: authKeys.currentUser(),
      queryFn: async () => {
        const { authApi } = await import('../api/authApi');
        return authApi.getCurrentUser();
      },
    });
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const register = async (data: RegisterRequest) => {
    await registerMutation.mutateAsync(data);
    const userData = await queryClient.fetchQuery({
      queryKey: authKeys.currentUser(),
      queryFn: async () => {
        const { authApi } = await import('../api/authApi');
        return authApi.getCurrentUser();
      },
    });
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  const refreshUser = async () => {
    await refetch();
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
