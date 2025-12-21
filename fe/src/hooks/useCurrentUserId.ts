import { useAuth } from '../contexts/AuthContext';

export function useCurrentUserId(): number | null {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  return user.id;
}
