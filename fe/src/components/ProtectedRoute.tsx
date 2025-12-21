import { useNavigate } from '@tanstack/react-router';
import { useEffect, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: '/login' });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div
        className="flex min-h-[60vh] items-center justify-center"
        style={{ backgroundColor: 'var(--color-surface-dark)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div
              className="h-12 w-12 animate-spin rounded-full border-3 border-transparent"
              style={{ borderTopColor: 'var(--color-primary)' }}
            />
            <div
              className="absolute inset-2 animate-spin rounded-full border-2 border-transparent"
              style={{
                borderBottomColor: 'var(--color-accent)',
                animationDirection: 'reverse',
                animationDuration: '0.8s',
              }}
            />
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Loading...
          </p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
