import { Skeleton } from './ui/skeleton';

export function ParagraphCardSkeleton() {
  return (
    <div className="bg-surface/20 border-border/30 rounded-lg border p-5">
      <div className="mb-3 flex items-start justify-between">
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="mb-3 h-5 w-1/4" />
      <div className="mb-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

export function QuickStartSkeleton() {
  return (
    <div className="bg-surface/20 border-border/30 rounded-xl border p-6">
      <Skeleton className="mb-4 h-7 w-32" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-surface/20 border-border/30 flex flex-col items-center rounded-lg border p-5">
      <Skeleton className="mb-2 h-12 w-12 rounded-full" />
      <Skeleton className="mb-1 h-6 w-16" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}
