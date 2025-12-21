import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useParagraphs, useTopics } from '../hooks/useSession';
import type { Paragraph } from '../types/session';
import { Pagination } from './Pagination';
import { TopicDropdown } from './TopicDropdown';
import { useAuth } from '../contexts/AuthContext';

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];
const DIFFICULTY_TO_API: Record<string, string> = {
  Beginner: 'EASY',
  Intermediate: 'MEDIUM',
  Advanced: 'HARD',
};
const COMPLETION_STATUSES = ['All', 'Not Started', 'In Progress', 'Completed'];
const STATUS_TO_API: Record<string, string | undefined> = {
  All: undefined,
  'Not Started': 'not_started',
  'In Progress': 'in_progress',
  Completed: 'completed',
};
const DEFAULT_PAGE_SIZE = 12;

export function ParagraphList() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Filter states
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedCompletionStatus, setSelectedCompletionStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Build filters object for React Query
  const filters = {
    difficulty: selectedDifficulty ? DIFFICULTY_TO_API[selectedDifficulty] : undefined,
    topic: selectedTopic || undefined,
    search: debouncedSearch || undefined,
    page: currentPage,
    pageSize: pageSize,
    userId: user?.id,
    completionStatus: STATUS_TO_API[selectedCompletionStatus],
  };

  // React Query hooks
  const { data: paragraphData, isLoading, error } = useParagraphs(filters);
  const { data: topics = [] } = useTopics();

  const handleDifficultyChange = (difficulty: string) => {
    setSelectedDifficulty(difficulty);
    setCurrentPage(0);
  };

  const handleTopicChange = (topic: string) => {
    setSelectedTopic(topic);
    setCurrentPage(0);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0);
  };

  const clearFilters = () => {
    setSelectedDifficulty('');
    setSelectedTopic('');
    setSelectedCompletionStatus('All');
    setSearchQuery('');
    setCurrentPage(0);
  };

  const hasActiveFilters =
    selectedDifficulty || selectedTopic || selectedCompletionStatus !== 'All' || searchQuery;

  // No need for client-side filtering - backend handles completionStatus
  const filteredParagraphs = paragraphData?.content || [];

  const getDifficultyStyles = (
    difficulty: string
  ): { badge: string; accent: string; badgeStyle?: React.CSSProperties } => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return {
          badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          accent: 'border-l-emerald-500',
        };
      case 'intermediate':
        return {
          badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          accent: 'border-l-amber-500',
        };
      case 'advanced':
        return {
          badge: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
          accent: 'border-l-rose-500 glow-accent',
        };
      default:
        return {
          badge: 'border',
          accent: 'border-l-gray-500',
          badgeStyle: {
            backgroundColor: 'rgba(var(--color-surface-elevated-rgb, 75, 85, 99), 0.2)',
            color: 'var(--color-text-muted)',
            borderColor: 'var(--color-border)',
          },
        };
    }
  };

  const isAdvanced = (difficulty: string) => difficulty?.toLowerCase() === 'advanced';
  const isLongContent = (content: string) => content.length > 200;

  const handleStartSession = (paragraphId: number) => {
    navigate({ to: '/session/$paragraphId', params: { paragraphId: String(paragraphId) } });
  };

  const renderCard = (paragraph: Paragraph, index: number, isFeatured: boolean = false) => {
    const styles = getDifficultyStyles(paragraph.difficulty);
    const showAccentGlow = isAdvanced(paragraph.difficulty);
    const completionStatus = paragraph.completionStatus || 'not_started';

    return (
      <div
        key={paragraph.id}
        className={`group animate-fade-up relative ${isFeatured ? 'md:col-span-2 md:row-span-2' : ''} ${isLongContent(paragraph.content) && !isFeatured ? 'md:row-span-2' : ''} `}
        style={{ animationDelay: `${0.1 + index * 0.05}s` }}
        onClick={() => handleStartSession(paragraph.id)}
      >
        {/* Decorative background element for featured/advanced cards */}
        {(isFeatured || showAccentGlow) && (
          <div
            className={`absolute -inset-1 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${showAccentGlow ? 'bg-gradient-to-br from-cyan-500/20 to-transparent' : 'bg-gradient-to-br from-amber-500/20 to-transparent'} `}
          />
        )}

        {/* Main card */}
        <div
          className={`hover-lift relative h-full cursor-pointer overflow-hidden rounded-xl border-[var(--color-border)] bg-[var(--color-surface)] ${styles.accent} ${showAccentGlow ? 'ring-1 ring-cyan-500/20' : ''} ${completionStatus === 'completed' ? 'ring-2 ring-emerald-500/40' : ''} ${completionStatus === 'in_progress' ? 'ring-2 ring-amber-500/40' : ''}`}
        >
          {/* Geometric decorative element */}
          {isFeatured && (
            <div className="absolute top-0 right-0 h-32 w-32 opacity-10">
              <svg viewBox="0 0 100 100" className="h-full w-full text-amber-500">
                <circle cx="80" cy="20" r="60" fill="currentColor" />
              </svg>
            </div>
          )}

          {showAccentGlow && !isFeatured && (
            <div className="absolute right-0 bottom-0 h-20 w-20 opacity-10">
              <svg viewBox="0 0 100 100" className="h-full w-full text-cyan-500">
                <polygon points="100,100 100,40 40,100" fill="currentColor" />
              </svg>
            </div>
          )}

          <div className={`relative p-6 ${isFeatured ? 'md:p-8' : ''}`}>
            {/* Completion Status Badge */}
            {completionStatus !== 'not_started' && (
              <div className="absolute -top-2 -right-2 z-10">
                {completionStatus === 'completed' ? (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 ring-2 ring-emerald-500/60 backdrop-blur-sm">
                    <svg
                      className="h-5 w-5 text-emerald-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 ring-2 ring-amber-500/60 backdrop-blur-sm">
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
                  </div>
                )}
              </div>
            )}

            {/* Topic badge */}
            {paragraph.topic && (
              <span className="mb-4 inline-block rounded-full bg-[var(--color-surface-elevated)] px-3 py-1 text-xs font-medium text-[var(--color-text-muted)]">
                {paragraph.topic}
              </span>
            )}

            {/* Title */}
            <h3
              className={`font-display mb-3 font-semibold text-[var(--color-text-primary)] ${isFeatured ? 'text-2xl md:text-3xl' : 'text-lg'} ${!isFeatured ? 'line-clamp-2' : ''} `}
            >
              {paragraph.title}
            </h3>

            {/* Difficulty badge */}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${styles.badge} mb-4`}
              style={styles.badgeStyle}
            >
              {showAccentGlow && (
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
              )}
              {paragraph.difficulty}
            </span>

            {/* Content preview */}
            <p
              className={`mb-6 text-[var(--color-text-secondary)] ${isFeatured ? 'line-clamp-4 text-base md:line-clamp-6' : 'line-clamp-3 text-sm'} `}
            >
              {paragraph.content}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
                </svg>
                {paragraph.sentenceCount} sentences
              </span>
              <button
                className={`flex items-center gap-2 font-medium transition-colors ${
                  isFeatured
                    ? 'rounded-lg bg-[var(--color-primary)] px-4 py-2 text-black hover:bg-[var(--color-primary-light)]'
                    : 'text-[var(--color-primary)] hover:text-[var(--color-primary-light)]'
                } `}
              >
                {isFeatured ? 'Start Practice' : 'Start'}
                <svg
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface-dark)] px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="animate-fade-up mb-10">
          <h1 className="font-display mb-2 text-4xl font-bold text-[var(--color-text-primary)]">
            Paragraph <span className="text-gradient-primary">Translation</span>
          </h1>
          <p className="text-lg text-[var(--color-text-secondary)]">
            Choose a paragraph to practice sentence-by-sentence translation
          </p>
        </div>

        {/* Filters - Compact Design */}
        <div className="animate-fade-up stagger-2 relative z-20 mb-8 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          {/* Search and Topic Row */}
          <div className="mb-5 flex gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <svg
                className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Search paragraphs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-dark)] pr-4 pl-11 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute top-1/2 right-3 -translate-y-1/2 p-1 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)]"
                  aria-label="Clear search"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>

            {/* Topic Dropdown */}
            <TopicDropdown
              topics={topics}
              selectedTopic={selectedTopic}
              onTopicChange={handleTopicChange}
            />
          </div>

          {/* Difficulty Filter */}
          <div className="mb-4">
            <div className="mb-2.5 flex items-center">
              <span className="text-sm text-[var(--color-text-muted)]">Difficulty:</span>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="ml-auto flex items-center gap-1 text-xs text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)]"
                >
                  <svg
                    className="h-3 w-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                  </svg>
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleDifficultyChange('')}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  selectedDifficulty === ''
                    ? 'bg-[var(--color-primary)] text-black'
                    : 'bg-[var(--color-surface-dark)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                All
              </button>
              {DIFFICULTIES.map((diff) => (
                <button
                  key={diff}
                  onClick={() => handleDifficultyChange(diff)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    selectedDifficulty === diff
                      ? 'bg-[var(--color-primary)] text-black'
                      : 'bg-[var(--color-surface-dark)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="my-4 h-px bg-[var(--color-border)]" />

          {/* Status Filter */}
          <div>
            <span className="mb-2.5 block text-sm text-[var(--color-text-muted)]">Status:</span>
            <div className="flex flex-wrap gap-2">
              {COMPLETION_STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setSelectedCompletionStatus(status);
                    setCurrentPage(0);
                  }}
                  className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    selectedCompletionStatus === status
                      ? 'bg-[var(--color-primary)] text-black'
                      : 'bg-[var(--color-surface-dark)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  {status === 'Completed' && (
                    <svg
                      className="h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {status === 'In Progress' && (
                    <svg
                      className="h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Featured skeleton */}
            <div className="skeleton h-80 rounded-xl md:col-span-2 md:row-span-2" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-48 rounded-xl" />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="animate-fade-up mb-6 rounded-xl border border-rose-700/50 bg-rose-900/30 p-4 text-rose-300">
            <div className="flex items-center gap-3">
              <svg
                className="h-5 w-5 text-rose-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
              </svg>
              {error.message || 'Failed to load paragraphs'}
            </div>
          </div>
        )}

        {/* Paragraph Grid - Asymmetric Layout */}
        {!isLoading && !error && (
          <>
            <div className="grid auto-rows-min grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredParagraphs.length === 0 ? (
                <div className="col-span-full py-16 text-center">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface)]">
                    <svg
                      className="h-8 w-8 text-[var(--color-text-muted)]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="text-lg text-[var(--color-text-muted)]">No paragraphs found</p>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    Try adjusting your filters
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="mt-4 px-4 py-2 text-sm text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-light)]"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              ) : (
                filteredParagraphs.map((paragraph, index) =>
                  renderCard(paragraph, index, index === 0 && currentPage === 0)
                )
              )}
            </div>

            {/* Pagination */}
            {paragraphData && paragraphData.totalPages > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={paragraphData.totalPages}
                pageSize={pageSize}
                totalElements={paragraphData.totalElements}
                onPageChange={setCurrentPage}
                onPageSizeChange={handlePageSizeChange}
                isLoading={isLoading}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
