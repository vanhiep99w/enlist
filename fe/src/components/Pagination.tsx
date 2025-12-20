interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  isLoading?: boolean;
}

const PAGE_SIZE_OPTIONS = [6, 12, 24, 48];

export function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalElements,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
}: PaginationProps) {
  const getVisiblePages = (): (number | 'ellipsis')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    const pages: (number | 'ellipsis')[] = [];
    const showLeftEllipsis = currentPage > 3;
    const showRightEllipsis = currentPage < totalPages - 4;

    pages.push(0);

    if (showLeftEllipsis) {
      pages.push('ellipsis');
    }

    const start = showLeftEllipsis ? Math.max(1, currentPage - 1) : 1;
    const end = showRightEllipsis ? Math.min(totalPages - 2, currentPage + 1) : totalPages - 2;

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (showRightEllipsis) {
      pages.push('ellipsis');
    }

    pages.push(totalPages - 1);

    return pages;
  };

  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  if (totalPages <= 1 && totalElements <= pageSize) {
    return null;
  }

  return (
    <div className="animate-fade-up mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
      {/* Results info & page size selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-[var(--color-text-muted)]">
          Showing{' '}
          <span className="font-medium text-[var(--color-text-secondary)]">
            {startItem}-{endItem}
          </span>{' '}
          of <span className="font-medium text-[var(--color-text-secondary)]">{totalElements}</span>
        </span>

        <div className="flex items-center gap-2">
          <label htmlFor="pageSize" className="text-sm text-[var(--color-text-muted)]">
            Per page:
          </label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            disabled={isLoading}
            className="cursor-pointer rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-text-primary)] transition-all hover:border-[var(--color-primary)]/50 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Page navigation */}
      <nav className="flex items-center gap-1" aria-label="Pagination">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0 || isLoading}
          className="group relative rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-[var(--color-text-secondary)] transition-all duration-200 hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-surface-light)] hover:text-[var(--color-text-primary)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[var(--color-border)]"
          aria-label="Previous page"
        >
          <svg
            className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Page numbers */}
        <div className="mx-1 flex items-center gap-1">
          {getVisiblePages().map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="flex h-9 w-9 items-center justify-center text-[var(--color-text-muted)]"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="5" cy="12" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="19" cy="12" r="2" />
                  </svg>
                </span>
              );
            }

            const isActive = page === currentPage;
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                disabled={isLoading}
                className={`relative h-9 w-9 rounded-lg text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed ${
                  isActive
                    ? 'bg-[var(--color-primary)] text-black shadow-[var(--color-primary)]/25 shadow-lg'
                    : 'border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-surface-light)] hover:text-[var(--color-text-primary)]'
                } `}
                aria-label={`Page ${page + 1}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {page + 1}
                {isActive && (
                  <span className="absolute inset-0 animate-pulse rounded-lg ring-2 ring-[var(--color-primary)]/30" />
                )}
              </button>
            );
          })}
        </div>

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1 || isLoading}
          className="group relative rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-[var(--color-text-secondary)] transition-all duration-200 hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-surface-light)] hover:text-[var(--color-text-primary)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[var(--color-border)]"
          aria-label="Next page"
        >
          <svg
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </nav>
    </div>
  );
}
