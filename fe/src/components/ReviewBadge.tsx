import { Link } from '@tanstack/react-router';
import { RefreshCw } from 'lucide-react';
import { useDueCount } from '../hooks/useReview';

export function ReviewBadge() {
  const { data: dueCount = 0, isLoading: loading } = useDueCount();

  if (loading || dueCount === 0) {
    return null;
  }

  return (
    <Link
      to="/review"
      className="relative flex items-center gap-2 rounded-full px-3 py-1.5 transition-all hover:scale-105"
      style={{
        backgroundColor: 'var(--color-primary)',
        color: 'white',
      }}
    >
      <RefreshCw className="h-4 w-4" />
      <span className="text-sm font-semibold">{dueCount}</span>
      {dueCount > 0 && (
        <span className="absolute -top-1 -right-1 h-3 w-3 animate-pulse rounded-full bg-red-500" />
      )}
    </Link>
  );
}
