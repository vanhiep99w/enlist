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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 animate-fade-up">
      {/* Results info & page size selector */}
      <div className="flex items-center gap-4">
        <span className="text-[var(--color-text-muted)] text-sm">
          Showing <span className="text-[var(--color-text-secondary)] font-medium">{startItem}-{endItem}</span> of{' '}
          <span className="text-[var(--color-text-secondary)] font-medium">{totalElements}</span>
        </span>
        
        <div className="flex items-center gap-2">
          <label htmlFor="pageSize" className="text-[var(--color-text-muted)] text-sm">
            Per page:
          </label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            disabled={isLoading}
            className="px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg
              text-[var(--color-text-primary)] text-sm cursor-pointer
              focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)]
              hover:border-[var(--color-primary)]/50 transition-all
              disabled:opacity-50 disabled:cursor-not-allowed"
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
          className="group relative p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]
            text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]
            hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-surface-light)]
            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[var(--color-border)]
            transition-all duration-200"
          aria-label="Previous page"
        >
          <svg 
            className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1 mx-1">
          {getVisiblePages().map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="w-9 h-9 flex items-center justify-center text-[var(--color-text-muted)]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
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
                className={`
                  relative w-9 h-9 rounded-lg font-medium text-sm transition-all duration-200
                  disabled:cursor-not-allowed
                  ${isActive
                    ? 'bg-[var(--color-primary)] text-black shadow-lg shadow-[var(--color-primary)]/25'
                    : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-surface-light)]'
                  }
                `}
                aria-label={`Page ${page + 1}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {page + 1}
                {isActive && (
                  <span className="absolute inset-0 rounded-lg ring-2 ring-[var(--color-primary)]/30 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1 || isLoading}
          className="group relative p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]
            text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]
            hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-surface-light)]
            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[var(--color-border)]
            transition-all duration-200"
          aria-label="Next page"
        >
          <svg 
            className="w-4 h-4 transition-transform group-hover:translate-x-0.5" 
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
