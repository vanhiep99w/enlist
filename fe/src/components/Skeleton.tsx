import { Skeleton } from './ui/skeleton';

export function ParagraphCardSkeleton() {
  return (
    <div className="rounded-lg border p-5 bg-surface/20 border-border/30">
      <div className="flex items-start justify-between mb-3">
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-5 w-1/4 mb-3" />
      <div className="space-y-2 mb-4">
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
    <div className="rounded-xl border p-6 bg-surface/20 border-border/30">
      <Skeleton className="h-7 w-32 mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-lg border p-5 flex flex-col items-center bg-surface/20 border-border/30">
      <Skeleton className="w-12 h-12 rounded-full mb-2" />
      <Skeleton className="h-6 w-16 mb-1" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}
