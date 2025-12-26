import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getRandomSession, type RandomSessionParagraphDTO } from '../api/sessionApi';
import { useState } from 'react';

export const Route = createFileRoute('/random-history/$sessionId')({
  component: RandomSessionDetailPage,
});

function RandomSessionDetailPage() {
  const { sessionId } = Route.useParams();
  const navigate = useNavigate();
  const [selectedParagraph, setSelectedParagraph] = useState<RandomSessionParagraphDTO | null>(
    null
  );

  const { data: session, isLoading } = useQuery({
    queryKey: ['random-session', Number(sessionId)],
    queryFn: () => getRandomSession(Number(sessionId)),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen p-8">
        <div className="mx-auto max-w-6xl">
          <div
            className="mb-8 h-8 w-48 animate-pulse rounded"
            style={{ backgroundColor: 'var(--color-surface)' }}
          />
          <div
            className="h-64 animate-pulse rounded-xl"
            style={{ backgroundColor: 'var(--color-surface)' }}
          />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen p-8">
        <div className="mx-auto max-w-6xl text-center">
          <p style={{ color: 'var(--color-text-secondary)' }}>Session not found</p>
        </div>
      </div>
    );
  }

  const isActive = session.status === 'ACTIVE';
  const duration = session.endedAt
    ? Math.floor(
        (new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 1000
      )
    : 0;
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  const handleContinueSession = () => {
    if (session.currentParagraph?.paragraphId) {
      navigate({
        to: '/session/$paragraphId',
        params: { paragraphId: String(session.currentParagraph.paragraphId) },
        search: { randomSessionId: session.id },
      });
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/random-history"
            className="mb-4 inline-block text-sm hover:underline"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            ← Back to History
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-bold">Session Details</h1>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {new Date(session.startedAt).toLocaleString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            {isActive && (
              <button
                onClick={handleContinueSession}
                className="rounded-xl px-6 py-3 font-semibold transition-all hover:scale-105"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-surface)',
                }}
              >
                Continue Session
              </button>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">
          <SummaryCard
            label="Status"
            value={isActive ? 'In Progress' : 'Completed'}
            icon={isActive ? '🔥' : '✓'}
            highlight={isActive}
          />
          <SummaryCard
            label="Avg Accuracy"
            value={`${session.averageAccuracy.toFixed(0)}%`}
            icon="🎯"
          />
          <SummaryCard label="Paragraphs" value={session.totalParagraphsCompleted} icon="📝" />
          <SummaryCard label="Points" value={session.totalPoints} icon="⭐" />
          <SummaryCard
            label="Duration"
            value={isActive ? 'Active' : `${minutes}m ${seconds}s`}
            icon="⏱️"
          />
        </div>

        {/* Paragraph List */}
        <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--color-surface)' }}>
          <h2 className="mb-6 text-2xl font-bold">Paragraph Performance</h2>
          <div className="space-y-3">
            {session.paragraphs.map((paragraph, index) => (
              <ParagraphRow
                key={paragraph.id}
                paragraph={paragraph}
                index={index}
                isSelected={selectedParagraph?.id === paragraph.id}
                onClick={() => setSelectedParagraph(paragraph)}
              />
            ))}
          </div>
        </div>

        {/* Detail Modal */}
        {selectedParagraph && (
          <ParagraphDetailModal
            paragraph={selectedParagraph}
            onClose={() => setSelectedParagraph(null)}
          />
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  highlight,
}: {
  label: string;
  value: string | number;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        backgroundColor: highlight ? 'var(--color-accent)' : 'var(--color-surface)',
      }}
    >
      <div className="mb-2 text-2xl">{icon}</div>
      <div
        className="mb-1 text-2xl font-bold"
        style={{ color: highlight ? 'var(--color-surface)' : 'var(--color-text-primary)' }}
      >
        {value}
      </div>
      <p
        className="text-xs"
        style={{ color: highlight ? 'var(--color-surface)' : 'var(--color-text-secondary)' }}
      >
        {label}
      </p>
    </div>
  );
}

function ParagraphRow({
  paragraph,
  index,
  isSelected,
  onClick,
}: {
  paragraph: RandomSessionParagraphDTO;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  const isCompleted = paragraph.status === 'COMPLETED';
  const accuracy = paragraph.accuracy ?? 0;

  return (
    <button
      onClick={onClick}
      className="w-full rounded-lg p-4 text-left transition-all hover:scale-[1.01]"
      style={{
        backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-surface-elevated)',
        borderLeft: `4px solid ${getAccuracyColor(accuracy)}`,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center gap-4">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full font-bold"
            style={{
              backgroundColor: isSelected ? 'var(--color-surface)' : 'var(--color-surface)',
              color: 'var(--color-text-primary)',
            }}
          >
            {index + 1}
          </div>
          <div className="flex-1">
            <h3
              className="mb-1 font-semibold"
              style={{
                color: isSelected ? 'var(--color-surface)' : 'var(--color-text-primary)',
              }}
            >
              {paragraph.paragraphTitle || 'Paragraph ' + (index + 1)}
            </h3>
            <div className="flex items-center gap-3 text-sm">
              <span
                style={{
                  color: isSelected ? 'var(--color-surface)' : 'var(--color-text-secondary)',
                }}
              >
                Difficulty: {paragraph.difficultyLevel}
              </span>
              {isCompleted && paragraph.timeSpentSeconds && (
                <span
                  style={{
                    color: isSelected ? 'var(--color-surface)' : 'var(--color-text-secondary)',
                  }}
                >
                  ⏱️ {Math.floor(paragraph.timeSpentSeconds / 60)}m{' '}
                  {paragraph.timeSpentSeconds % 60}s
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          {isCompleted ? (
            <>
              <div
                className="text-2xl font-bold"
                style={{
                  color: isSelected ? 'var(--color-surface)' : getAccuracyColor(accuracy),
                }}
              >
                {accuracy.toFixed(0)}%
              </div>
              <p
                className="text-xs"
                style={{
                  color: isSelected ? 'var(--color-surface)' : 'var(--color-text-secondary)',
                }}
              >
                +{paragraph.pointsEarned} pts
              </p>
            </>
          ) : (
            <span
              className="text-sm font-semibold"
              style={{
                color: isSelected ? 'var(--color-surface)' : 'var(--color-text-secondary)',
              }}
            >
              {paragraph.status}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function ParagraphDetailModal({
  paragraph,
  onClose,
}: {
  paragraph: RandomSessionParagraphDTO;
  onClose: () => void;
}) {
  const accuracy = paragraph.accuracy ?? 0;
  const isCompleted = paragraph.status === 'COMPLETED';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-xl p-8"
        style={{
          backgroundColor: 'var(--color-surface)',
          backdropFilter: 'blur(20px)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between">
          <h2 className="text-2xl font-bold">{paragraph.paragraphTitle || 'Paragraph Details'}</h2>
          <button
            onClick={onClose}
            className="text-2xl transition-transform hover:scale-110"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            ×
          </button>
        </div>

        {isCompleted ? (
          <div className="space-y-6">
            {/* Performance */}
            <div>
              <h3
                className="mb-3 text-sm font-semibold"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Performance
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <MetricCard label="Accuracy" value={`${accuracy.toFixed(0)}%`} />
                <MetricCard label="Points Earned" value={paragraph.pointsEarned} />
                <MetricCard label="Credits Earned" value={paragraph.creditsEarned} />
                {paragraph.timeSpentSeconds && (
                  <MetricCard
                    label="Time Spent"
                    value={`${Math.floor(paragraph.timeSpentSeconds / 60)}m ${
                      paragraph.timeSpentSeconds % 60
                    }s`}
                  />
                )}
              </div>
            </div>

            {/* Paragraph Content */}
            {paragraph.paragraphContent && (
              <div>
                <h3
                  className="mb-3 text-sm font-semibold"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Content (Vietnamese)
                </h3>
                <div
                  className="rounded-lg p-4"
                  style={{ backgroundColor: 'var(--color-surface-elevated)' }}
                >
                  <p style={{ color: 'var(--color-text-primary)', lineHeight: 1.8 }}>
                    {paragraph.paragraphContent}
                  </p>
                </div>
              </div>
            )}

            {/* Read-only mode link */}
            {paragraph.paragraphId && (
              <Link
                to="/session/$paragraphId"
                params={{ paragraphId: String(paragraph.paragraphId) }}
                className="block rounded-xl py-3 text-center font-semibold transition-all hover:scale-105"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-surface)',
                }}
              >
                View Full Session
              </Link>
            )}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p style={{ color: 'var(--color-text-secondary)' }}>
              This paragraph is {paragraph.status.toLowerCase()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--color-surface-elevated)' }}>
      <div className="mb-1 text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
        {value}
      </div>
      <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </p>
    </div>
  );
}

function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 90) return '#10b981'; // green
  if (accuracy >= 80) return '#f59e0b'; // amber
  return '#ef4444'; // red
}
