import { useState, useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { getParagraphs } from '../api/sessionApi';
import { ParagraphCardSkeleton } from '../components/Skeleton';
import { DailyGoals } from '../components/DailyGoals';
import { ErrorInsights } from '../components/ErrorInsights';
import { ProtectedRoute } from '../components/ProtectedRoute';
import type { Paragraph } from '../types/session';

export const Route = createFileRoute('/')({
  component: HomePageWrapper,
});

function HomePageWrapper() {
  return (
    <ProtectedRoute>
      <HomePage />
    </ProtectedRoute>
  );
}

const DIFFICULTIES = [
  { key: 'Beginner', label: 'Beginner', color: 'bg-emerald-500 hover:bg-emerald-600', icon: '🌱' },
  {
    key: 'Intermediate',
    label: 'Intermediate',
    color: 'bg-amber-500 hover:bg-amber-600',
    icon: '📚',
  },
  { key: 'Advanced', label: 'Advanced', color: 'bg-rose-500 hover:bg-rose-600', icon: '🎯' },
];

function HomePage() {
  const navigate = useNavigate();
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadParagraphs();
  }, []);

  const loadParagraphs = async () => {
    try {
      const data = await getParagraphs({ pageSize: 100 });
      setParagraphs(data.content);
    } catch (err) {
      console.error('Failed to load paragraphs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartRandom = (difficulty?: string) => {
    const filtered = difficulty
      ? paragraphs.filter((p) => p.difficulty === difficulty)
      : paragraphs;

    if (filtered.length > 0) {
      const random = filtered[Math.floor(Math.random() * filtered.length)];
      navigate({ to: '/session/$paragraphId', params: { paragraphId: String(random.id) } });
    }
  };

  const handleStartParagraph = (paragraphId: number) => {
    navigate({ to: '/session/$paragraphId', params: { paragraphId: String(paragraphId) } });
  };

  const getDifficultyColor = (
    difficulty: string
  ): { className: string; style?: React.CSSProperties } => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return { className: 'bg-emerald-950/40 text-emerald-300 border-emerald-700/50' };
      case 'intermediate':
        return { className: 'bg-amber-950/40 text-amber-300 border-amber-700/50' };
      case 'advanced':
        return { className: 'bg-rose-950/40 text-rose-300 border-rose-700/50' };
      default:
        return {
          className: 'border rounded',
          style: {
            backgroundColor: 'var(--color-surface-light)',
            color: 'var(--color-text-secondary)',
            borderColor: 'var(--color-border)',
          },
        };
    }
  };

  const recentParagraphs = paragraphs.slice(0, 6);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface-dark)' }}>
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        {/* Compact Hero */}
        <div className="animate-hero-reveal space-y-2 py-8 text-center">
          <h1
            className="text-5xl font-bold tracking-tight"
            style={{
              background:
                'linear-gradient(135deg, var(--color-primary-light), var(--color-accent))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Enlist
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Master Vietnamese → English translation with AI feedback
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          {/* Main Column */}
          <div className="space-y-6">
            {/* Quick Start */}
            <div
              className="animate-fade-up rounded-xl border p-5"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              <h2
                className="mb-3 flex items-center gap-2 text-base font-semibold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <span>⚡</span> Quick Start
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {DIFFICULTIES.map((diff) => (
                  <button
                    key={diff.key}
                    onClick={() => handleStartRandom(diff.key)}
                    disabled={
                      isLoading || paragraphs.filter((p) => p.difficulty === diff.key).length === 0
                    }
                    className={`${diff.color} hover-button group relative overflow-hidden rounded-lg px-4 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <div className="relative z-10 flex flex-col items-center gap-1">
                      <span className="text-2xl">{diff.icon}</span>
                      <div className="text-xs font-semibold">{diff.label}</div>
                      <div className="text-[10px] opacity-70">
                        {paragraphs.filter((p) => p.difficulty === diff.key).length}
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-white/0 transition-colors group-hover:bg-white/10" />
                  </button>
                ))}
              </div>
              <div className="mt-3 text-center">
                <button
                  onClick={() => handleStartRandom()}
                  disabled={isLoading || paragraphs.length === 0}
                  className="text-xs font-medium hover:underline disabled:opacity-50"
                  style={{ color: 'var(--color-accent)' }}
                >
                  🎲 Random
                </button>
              </div>
            </div>

            {/* Recent Paragraphs */}
            <div className="animate-fade-up stagger-1">
              <div className="mb-3 flex items-center justify-between">
                <h2
                  className="flex items-center gap-2 text-base font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  <span>📖</span> Browse
                </h2>
                <button
                  onClick={() => navigate({ to: '/paragraphs' })}
                  className="text-xs font-medium hover:underline"
                  style={{ color: 'var(--color-accent)' }}
                >
                  All →
                </button>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <ParagraphCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <div className="card-cascade grid grid-cols-2 gap-3 md:grid-cols-3">
                  {recentParagraphs.map((paragraph) => (
                    <div
                      key={paragraph.id}
                      onClick={() => handleStartParagraph(paragraph.id)}
                      className="group animate-fade-up hover-card cursor-pointer rounded-lg border p-4 transition-all"
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        borderColor: 'var(--color-border)',
                      }}
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <h3
                          className="line-clamp-1 text-sm font-semibold transition-colors"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {paragraph.title}
                        </h3>
                        <span
                          className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium ${getDifficultyColor(paragraph.difficulty).className}`}
                          style={getDifficultyColor(paragraph.difficulty).style}
                        >
                          {paragraph.difficulty[0]}
                        </span>
                      </div>

                      {paragraph.topic && (
                        <span
                          className="mb-2 inline-block rounded px-1.5 py-0.5 text-[10px]"
                          style={{
                            backgroundColor: 'var(--color-surface-elevated)',
                            color: 'var(--color-text-muted)',
                          }}
                        >
                          {paragraph.topic}
                        </span>
                      )}

                      <p
                        className="mb-2 line-clamp-2 text-xs leading-relaxed"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        {paragraph.content}
                      </p>

                      <div className="flex items-center justify-between text-xs">
                        <span style={{ color: 'var(--color-text-muted)' }}>
                          {paragraph.sentenceCount} sent.
                        </span>
                        <span
                          className="font-medium transition-transform group-hover:translate-x-0.5"
                          style={{ color: 'var(--color-accent)' }}
                        >
                          →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Daily Goals */}
            <div className="animate-fade-up stagger-2">
              <DailyGoals userId={1} />
            </div>
          </div>
        </div>

        {/* Error Insights - Full Width */}
        <div className="animate-fade-up stagger-4">
          <ErrorInsights userId={1} />
        </div>
      </div>
    </div>
  );
}
