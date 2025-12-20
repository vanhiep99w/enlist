interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export function Skeleton({ className = '', width, height }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height }}
    />
  );
}

export function ParagraphCardSkeleton() {
  return (
    <div
      className="rounded-lg border p-5"
      style={{ backgroundColor: 'var(--color-surface-light)', borderColor: 'var(--color-surface-elevated)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <Skeleton className="skeleton-title w-3/4" />
        <Skeleton className="skeleton-badge" />
      </div>
      <Skeleton className="skeleton-text w-1/4 mb-3" />
      <div className="space-y-2 mb-4">
        <Skeleton className="skeleton-text w-full" />
        <Skeleton className="skeleton-text w-5/6" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="skeleton-text w-24" />
        <Skeleton className="skeleton-text w-16" />
      </div>
    </div>
  );
}

export function QuickStartSkeleton() {
  return (
    <div
      className="rounded-xl border p-6"
      style={{ backgroundColor: 'var(--color-surface-light)', borderColor: 'var(--color-surface-elevated)' }}
    >
      <Skeleton className="skeleton-title w-32 mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="skeleton-button h-20" />
        ))}
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div
      className="rounded-lg border p-5 flex flex-col items-center"
      style={{ backgroundColor: 'var(--color-surface-light)', borderColor: 'var(--color-surface-elevated)' }}
    >
      <Skeleton className="w-12 h-12 rounded-full mb-2" />
      <Skeleton className="skeleton-title w-16 mb-1" />
      <Skeleton className="skeleton-text w-24" />
    </div>
  );
}
