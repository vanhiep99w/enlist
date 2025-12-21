import { useState, useEffect } from 'react';
import { X, Calendar, AlertCircle, TrendingUp, Eye, ChevronRight } from 'lucide-react';
import { usePreviousAttempts } from '../hooks/useSession';
import { ParagraphSummaryModal } from './ParagraphSummaryModal';

interface Props {
  paragraphId: number;
  paragraphTitle: string;
  userId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function PreviousAttemptsModal({
  paragraphId,
  paragraphTitle,
  userId,
  isOpen,
  onClose,
}: Props) {
  const { data: attempts, isLoading } = usePreviousAttempts(paragraphId, userId);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  const handleViewSummary = (sessionId: number) => {
    setSelectedSessionId(sessionId);
  };

  if (!isOpen) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getPerformanceGrade = (accuracy: number) => {
    if (accuracy >= 95) return 'S';
    if (accuracy >= 90) return 'A';
    if (accuracy >= 85) return 'B';
    if (accuracy >= 80) return 'C';
    return 'D';
  };

  const getGradeColor = (grade: string) => {
    if (grade === 'S') return 'var(--color-primary)';
    if (grade === 'A') return 'var(--color-accent)';
    if (grade === 'B') return 'var(--color-success)';
    if (grade === 'C') return 'var(--color-warning)';
    return 'var(--color-error)';
  };

  if (isLoading) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
      >
        <div className="animate-pulse text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

        <div
          className={`relative w-full max-w-2xl transform transition-all duration-300 ${
            isVisible ? 'scale-100' : 'scale-95'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Content */}
          <div
            className="relative rounded-2xl p-6"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            {/* Header */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <div
                  className="mb-2 text-xs font-bold tracking-wider uppercase"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Previous Attempts
                </div>
                <h2
                  className="text-lg leading-relaxed font-bold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {paragraphTitle}
                </h2>
                <div
                  className="mt-2 flex items-center gap-2 text-xs"
                  style={{ color: 'var(--color-accent)' }}
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  {attempts?.length || 0} completions
                </div>
              </div>
              <button
                onClick={handleClose}
                className="rounded-lg p-2 transition-all hover:opacity-70"
                style={{
                  color: 'var(--color-text-muted)',
                  backgroundColor: 'var(--color-surface-light)',
                }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Attempts list */}
            {!attempts || attempts.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mb-3 text-4xl">📊</div>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  No previous attempts
                </p>
                <p className="mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Complete this paragraph to see your history
                </p>
              </div>
            ) : (
              <div className="max-h-96 space-y-3 overflow-x-hidden overflow-y-auto pr-2">
                {attempts.map((attempt, index) => {
                  const grade = getPerformanceGrade(attempt.averageAccuracy);
                  const gradeColor = getGradeColor(grade);

                  return (
                    <div
                      key={attempt.sessionId}
                      className="group hover:bg-opacity-90 relative overflow-hidden rounded-xl p-4 transition-colors"
                      style={{
                        backgroundColor: 'var(--color-surface-light)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      {/* Rank badge */}
                      <div
                        className="absolute -top-1 -left-1 flex h-7 w-7 items-center justify-center rounded-br-lg text-xs font-bold"
                        style={{
                          backgroundColor: gradeColor,
                          color: 'var(--color-surface)',
                        }}
                      >
                        #{index + 1}
                      </div>

                      <div className="ml-6 flex items-center justify-between gap-4">
                        <div className="flex-1">
                          {/* Date */}
                          <div
                            className="mb-2 flex items-center gap-2 text-xs"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(attempt.completedAt)}
                          </div>

                          {/* Stats grid */}
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <div
                                className="mb-1 text-[10px] tracking-wide uppercase"
                                style={{ color: 'var(--color-text-muted)' }}
                              >
                                Accuracy
                              </div>
                              <div className="text-base font-bold" style={{ color: gradeColor }}>
                                {attempt.averageAccuracy.toFixed(1)}%
                              </div>
                            </div>

                            <div>
                              <div
                                className="mb-1 text-[10px] tracking-wide uppercase"
                                style={{ color: 'var(--color-text-muted)' }}
                              >
                                Errors
                              </div>
                              <div
                                className="flex items-center gap-1 text-base font-bold"
                                style={{ color: 'var(--color-error)' }}
                              >
                                <AlertCircle className="h-3.5 w-3.5" />
                                {attempt.totalErrors}
                              </div>
                            </div>

                            <div>
                              <div
                                className="mb-1 text-[10px] tracking-wide uppercase"
                                style={{ color: 'var(--color-text-muted)' }}
                              >
                                Points
                              </div>
                              <div
                                className="text-base font-bold"
                                style={{ color: 'var(--color-accent)' }}
                              >
                                {attempt.totalPoints}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Grade & View button */}
                        <div className="flex flex-col items-center gap-2">
                          <div
                            className="flex h-14 w-14 items-center justify-center rounded-xl text-2xl font-black"
                            style={{
                              backgroundColor: `${gradeColor}20`,
                              color: gradeColor,
                              border: `2px solid ${gradeColor}`,
                            }}
                          >
                            {grade}
                          </div>

                          <button
                            onClick={() => handleViewSummary(attempt.sessionId)}
                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all hover:scale-105"
                            style={{
                              backgroundColor: 'var(--color-primary)',
                              color: 'var(--color-surface)',
                            }}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div
                        className="mt-3 h-1.5 overflow-hidden rounded-full"
                        style={{ backgroundColor: 'var(--color-surface-elevated)' }}
                      >
                        <div
                          className="h-full transition-all duration-500"
                          style={{
                            width: `${(attempt.completedSentences / attempt.totalSentences) * 100}%`,
                            backgroundColor: gradeColor,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary modal for selected attempt */}
      {selectedSessionId && (
        <ParagraphSummaryModal
          sessionId={selectedSessionId}
          isOpen={true}
          onClose={() => setSelectedSessionId(null)}
        />
      )}
    </>
  );
}
