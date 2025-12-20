import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { getParagraphs, getTopics } from '../api/sessionApi';
import type { Paragraph, PaginatedResponse } from '../types/session';
import { Pagination } from './Pagination';
import { TopicDropdown } from './TopicDropdown';

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];
const DIFFICULTY_TO_API: Record<string, string> = {
  'Beginner': 'EASY',
  'Intermediate': 'MEDIUM', 
  'Advanced': 'HARD',
};
const DEFAULT_PAGE_SIZE = 12;

export function ParagraphList() {
  const navigate = useNavigate();
  const [paragraphData, setParagraphData] = useState<PaginatedResponse<Paragraph> | null>(null);
  const [topics, setTopics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
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

  // Load topics on mount
  useEffect(() => {
    loadTopics();
  }, []);

  // Load paragraphs when filters change
  useEffect(() => {
    loadParagraphs();
  }, [selectedDifficulty, selectedTopic, debouncedSearch, currentPage, pageSize]);

  const loadTopics = async () => {
    try {
      const data = await getTopics();
      setTopics(data);
    } catch (err) {
      console.error('Failed to load topics:', err);
    }
  };

  const loadParagraphs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getParagraphs({
        difficulty: selectedDifficulty ? DIFFICULTY_TO_API[selectedDifficulty] : undefined,
        topic: selectedTopic || undefined,
        search: debouncedSearch || undefined,
        page: currentPage,
        pageSize: pageSize,
      });
      setParagraphData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load paragraphs');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDifficulty, selectedTopic, debouncedSearch, currentPage, pageSize]);

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
    setSearchQuery('');
    setCurrentPage(0);
  };

  const hasActiveFilters = selectedDifficulty || selectedTopic || searchQuery;

  const getDifficultyStyles = (difficulty: string): { badge: string; accent: string; badgeStyle?: React.CSSProperties } => {
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

    return (
      <div
        key={paragraph.id}
        className={`
          group relative animate-fade-up
          ${isFeatured ? 'md:col-span-2 md:row-span-2' : ''}
          ${isLongContent(paragraph.content) && !isFeatured ? 'md:row-span-2' : ''}
        `}
        style={{ animationDelay: `${0.1 + index * 0.05}s` }}
        onClick={() => handleStartSession(paragraph.id)}
      >
        {/* Decorative background element for featured/advanced cards */}
        {(isFeatured || showAccentGlow) && (
          <div 
            className={`
              absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
              ${showAccentGlow ? 'bg-gradient-to-br from-cyan-500/20 to-transparent' : 'bg-gradient-to-br from-amber-500/20 to-transparent'}
            `}
          />
        )}

        {/* Main card */}
        <div
          className={`
            relative h-full bg-[var(--color-surface)] rounded-xl border-l-4 
            border border-[var(--color-border)] overflow-hidden
            hover-lift cursor-pointer
            ${styles.accent}
            ${showAccentGlow ? 'ring-1 ring-cyan-500/20' : ''}
          `}
        >
          {/* Geometric decorative element */}
          {isFeatured && (
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
              <svg viewBox="0 0 100 100" className="w-full h-full text-amber-500">
                <circle cx="80" cy="20" r="60" fill="currentColor" />
              </svg>
            </div>
          )}

          {showAccentGlow && !isFeatured && (
            <div className="absolute bottom-0 right-0 w-20 h-20 opacity-10">
              <svg viewBox="0 0 100 100" className="w-full h-full text-cyan-500">
                <polygon points="100,100 100,40 40,100" fill="currentColor" />
              </svg>
            </div>
          )}

          <div className={`relative p-6 ${isFeatured ? 'md:p-8' : ''}`}>
            {/* Topic badge */}
            {paragraph.topic && (
              <span className="inline-block px-3 py-1 bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] text-xs font-medium rounded-full mb-4">
                {paragraph.topic}
              </span>
            )}

            {/* Title */}
            <h3 className={`
              font-display font-semibold text-[var(--color-text-primary)] mb-3
              ${isFeatured ? 'text-2xl md:text-3xl' : 'text-lg'}
              ${!isFeatured ? 'line-clamp-2' : ''}
            `}>
              {paragraph.title}
            </h3>

            {/* Difficulty badge */}
            <span 
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${styles.badge} mb-4`}
              style={styles.badgeStyle}
            >
              {showAccentGlow && (
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              )}
              {paragraph.difficulty}
            </span>

            {/* Content preview */}
            <p className={`
              text-[var(--color-text-secondary)] mb-6
              ${isFeatured ? 'text-base line-clamp-4 md:line-clamp-6' : 'text-sm line-clamp-3'}
            `}>
              {paragraph.content}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-text-muted)] text-sm flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
                </svg>
                {paragraph.sentenceCount} sentences
              </span>
              <button className={`
                flex items-center gap-2 font-medium transition-colors
                ${isFeatured 
                  ? 'px-4 py-2 rounded-lg bg-[var(--color-primary)] text-black hover:bg-[var(--color-primary-light)]' 
                  : 'text-[var(--color-primary)] hover:text-[var(--color-primary-light)]'
                }
              `}>
                {isFeatured ? 'Start Practice' : 'Start'}
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const paragraphs = paragraphData?.content || [];

  return (
    <div className="min-h-screen bg-[var(--color-surface-dark)] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10 animate-fade-up">
          <h1 className="font-display text-4xl font-bold text-[var(--color-text-primary)] mb-2">
            Paragraph <span className="text-gradient-primary">Translation</span>
          </h1>
          <p className="text-[var(--color-text-secondary)] text-lg">
            Choose a paragraph to practice sentence-by-sentence translation
          </p>
        </div>

        {/* Filters */}
        <div className="space-y-4 mb-8 animate-fade-up stagger-2 relative z-20">
          {/* Search and Topic Filter Row */}
          <div className="flex flex-wrap gap-4 relative z-20">
            {/* Search Input */}
            <div className="flex-1 min-w-[200px] relative">
              <svg 
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" 
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
                className="w-full pl-12 pr-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl 
                  text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]
                  focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-[var(--color-text-muted)] 
                    hover:text-[var(--color-text-primary)] transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

          {/* Difficulty Buttons Row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[var(--color-text-muted)] text-sm mr-2">Difficulty:</span>
            <button
              onClick={() => handleDifficultyChange('')}
              className={`px-4 py-2.5 rounded-xl font-medium transition-all hover-button ${
                selectedDifficulty === ''
                  ? 'bg-[var(--color-primary)] text-black'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-light)]'
              }`}
            >
              All
            </button>
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff}
                onClick={() => handleDifficultyChange(diff)}
                className={`px-4 py-2.5 rounded-xl font-medium transition-all hover-button ${
                  selectedDifficulty === diff
                    ? 'bg-[var(--color-primary)] text-black'
                    : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-light)]'
                }`}
              >
                {diff}
              </button>
            ))}
            
            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-muted)] 
                  hover:text-[var(--color-text-primary)] transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                </svg>
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Featured skeleton */}
            <div className="md:col-span-2 md:row-span-2 skeleton rounded-xl h-80" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton rounded-xl h-48" />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-rose-900/30 border border-rose-700/50 rounded-xl p-4 text-rose-300 mb-6 animate-fade-up">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Paragraph Grid - Asymmetric Layout */}
        {!isLoading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
              {paragraphs.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-surface)] mb-4">
                    <svg className="w-8 h-8 text-[var(--color-text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="text-[var(--color-text-muted)] text-lg">No paragraphs found</p>
                  <p className="text-[var(--color-text-muted)] text-sm mt-1">Try adjusting your filters</p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="mt-4 px-4 py-2 text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition-colors"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              ) : (
                paragraphs.map((paragraph, index) => 
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
