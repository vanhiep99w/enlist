import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { RefreshCw } from 'lucide-react';
import { reviewApi } from '../api/reviewApi';

export function ReviewBadge() {
  const [dueCount, setDueCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const loadDueCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const count = await reviewApi.getDueCount(token);
      setDueCount(count);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load due count:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDueCount();
    const interval = setInterval(loadDueCount, 60000);
    return () => clearInterval(interval);
  }, []);

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
