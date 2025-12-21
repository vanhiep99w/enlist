import { useEffect, useState } from 'react';
import { X, CheckCircle2, AlertTriangle, Zap, TrendingUp, Award } from 'lucide-react';
import { useSessionSummary } from '../hooks/useSession';

interface Props {
  sessionId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ParagraphSummaryModal({ sessionId, isOpen, onClose }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const { data: summary, isLoading } = useSessionSummary(sessionId);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  if (!isOpen || !summary) return null;

  const getGradeInfo = (accuracy: number) => {
    if (accuracy >= 95) return { grade: 'S', label: 'EXCEPTIONAL', color: 'var(--color-primary)' };
    if (accuracy >= 90) return { grade: 'A', label: 'EXCELLENT', color: 'var(--color-accent)' };
    if (accuracy >= 85) return { grade: 'B', label: 'STRONG', color: 'var(--color-success)' };
    if (accuracy >= 80) return { grade: 'C', label: 'SOLID', color: 'var(--color-warning)' };
    return { grade: 'D', label: 'COMPLETED', color: 'var(--color-text-muted)' };
  };

  const grade = getGradeInfo(summary.averageAccuracy);
  const errorTypes = [
    {
      type: 'Grammar',
      count: summary.errorBreakdown.grammarErrors,
      icon: '📐',
      color: 'var(--color-error)',
    },
    {
      type: 'Word Choice',
      count: summary.errorBreakdown.wordChoiceErrors,
      icon: '📝',
      color: 'var(--color-warning)',
    },
    {
      type: 'Naturalness',
      count: summary.errorBreakdown.naturalnessErrors,
      icon: '🎭',
      color: 'var(--color-accent)',
    },
  ];

  const maxErrorCount = Math.max(...errorTypes.map((e) => e.count), 1);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="animate-pulse text-xl font-bold" style={{ color: 'var(--color-primary)' }}>
          Loading summary...
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />

      <div
        className={`relative w-full max-w-3xl transform transition-all duration-300 ${
          isVisible ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with grade banner */}
        <div
          className="relative overflow-hidden rounded-t-2xl px-8 py-6"
          style={{
            background: `linear-gradient(135deg, ${grade.color} 0%, ${grade.color}dd 100%)`,
          }}
        >
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 11px)`,
              }}
            />
          </div>

          <button
            onClick={handleClose}
            className="absolute top-4 right-4 rounded-full p-2 transition-all hover:bg-white/20"
            style={{ color: 'var(--color-surface)' }}
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative">
            <div className="mb-1 text-xs font-bold tracking-widest text-white uppercase opacity-90">
              Session Complete
            </div>
            <h1 className="mb-2 text-3xl font-black tracking-tight text-white">
              {summary.paragraphTitle}
            </h1>
            <div className="flex items-center gap-3">
              <div
                className="rounded-lg px-3 py-1.5 text-sm font-bold"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  color: grade.color,
                }}
              >
                {grade.label}
              </div>
              <div className="flex items-center gap-1.5 text-white/95">
                <Award className="h-4 w-4" />
                <span className="text-sm font-bold">{summary.totalPoints} pts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div
          className="rounded-b-2xl px-8 py-6"
          style={{ backgroundColor: 'var(--color-surface)' }}
        >
          {/* Stats grid */}
          <div className="mb-8 grid grid-cols-3 gap-4">
            <div
              className="rounded-xl p-4"
              style={{
                backgroundColor: 'var(--color-surface-light)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div
                className="mb-1 flex items-center gap-2 text-xs font-bold tracking-wider uppercase"
                style={{ color: 'var(--color-success)' }}
              >
                <CheckCircle2 className="h-4 w-4" />
                Accuracy
              </div>
              <div className="text-3xl font-black" style={{ color: 'var(--color-text-primary)' }}>
                {summary.averageAccuracy.toFixed(1)}%
              </div>
            </div>

            <div
              className="rounded-xl p-4"
              style={{
                backgroundColor: 'var(--color-surface-light)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div
                className="mb-1 flex items-center gap-2 text-xs font-bold tracking-wider uppercase"
                style={{ color: 'var(--color-accent)' }}
              >
                <TrendingUp className="h-4 w-4" />
                Completed
              </div>
              <div className="text-3xl font-black" style={{ color: 'var(--color-text-primary)' }}>
                {summary.completedSentences}/{summary.totalSentences}
              </div>
            </div>

            <div
              className="rounded-xl p-4"
              style={{
                backgroundColor: 'var(--color-surface-light)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div
                className="mb-1 flex items-center gap-2 text-xs font-bold tracking-wider uppercase"
                style={{ color: 'var(--color-error)' }}
              >
                <AlertTriangle className="h-4 w-4" />
                Errors
              </div>
              <div className="text-3xl font-black" style={{ color: 'var(--color-text-primary)' }}>
                {summary.totalErrors}
              </div>
            </div>
          </div>

          {/* Error breakdown */}
          <div className="mb-6">
            <h3
              className="mb-4 text-xs font-bold tracking-widest uppercase"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Error Analysis
            </h3>
            <div className="space-y-3">
              {errorTypes.map((error) => (
                <div key={error.type}>
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{error.icon}</span>
                      <span
                        className="text-sm font-bold"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {error.type}
                      </span>
                    </div>
                    <span
                      className="font-mono text-sm font-bold"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {error.count}
                    </span>
                  </div>
                  <div
                    className="h-2 overflow-hidden rounded-full"
                    style={{ backgroundColor: 'var(--color-surface-elevated)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(error.count / maxErrorCount) * 100}%`,
                        backgroundColor: error.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Error details */}
          {summary.allErrors.length > 0 && (
            <div>
              <h3
                className="mb-3 text-xs font-bold tracking-widest uppercase"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Detailed Feedback ({summary.allErrors.length})
              </h3>
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {summary.allErrors.map((error, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg p-3 transition-colors hover:opacity-90"
                    style={{
                      backgroundColor: 'var(--color-surface-light)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <span className="text-xs font-bold" style={{ color: 'var(--color-error)' }}>
                        #{error.sentenceIndex + 1} • {error.type}
                      </span>
                    </div>
                    {error.quickFix && (
                      <p className="mb-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        {error.quickFix}
                      </p>
                    )}
                    {error.correction && (
                      <div
                        className="mt-2 rounded px-2 py-1"
                        style={{
                          backgroundColor: 'var(--color-surface-elevated)',
                          borderLeft: '2px solid var(--color-success)',
                        }}
                      >
                        <p className="font-mono text-xs" style={{ color: 'var(--color-success)' }}>
                          {error.correction}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleClose}
              className="group relative overflow-hidden rounded-xl px-8 py-3 font-bold text-white transition-all hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${grade.color} 0%, ${grade.color}dd 100%)`,
              }}
            >
              <div className="absolute inset-0 -translate-x-full bg-white/20 transition-transform group-hover:translate-x-full" />
              <span className="relative flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Continue
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
