import { useState, useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { getParagraphs } from '../api/sessionApi';
import { ParagraphCardSkeleton } from '../components/Skeleton';
import type { Paragraph } from '../types/session';

export const Route = createFileRoute('/')({
  component: HomePage,
});

const DIFFICULTIES = [
  { key: 'Beginner', label: 'Beginner', color: 'bg-green-600 hover:bg-green-700', icon: '🌱' },
  {
    key: 'Intermediate',
    label: 'Intermediate',
    color: 'bg-yellow-600 hover:bg-yellow-700',
    icon: '📚',
  },
  { key: 'Advanced', label: 'Advanced', color: 'bg-red-600 hover:bg-red-700', icon: '🎯' },
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
        return { className: 'bg-green-900 text-green-300 border-green-700' };
      case 'intermediate':
        return { className: 'bg-yellow-900 text-yellow-300 border-yellow-700' };
      case 'advanced':
        return { className: 'bg-red-900 text-red-300 border-red-700' };
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
    <div className="px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-10">
        {/* Hero Section */}
        <div className="hero-gradient animate-hero-reveal space-y-4 rounded-2xl px-6 py-8 text-center">
          <h1 className="text-gradient-primary text-4xl font-bold">
            Practice Vietnamese → English Translation
          </h1>
          <p className="mx-auto max-w-2xl text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            Improve your translation skills with AI-powered feedback. Choose a difficulty level or
            browse paragraphs.
          </p>
        </div>

        {/* Quick Start by Difficulty */}
        <div
          className="animate-fade-up section-delay-1 rounded-xl border p-6"
          style={{
            backgroundColor: 'var(--color-surface-light)',
            borderColor: 'var(--color-surface-elevated)',
          }}
        >
          <h2
            className="mb-4 flex items-center gap-2 text-xl font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            <span>⚡</span> Quick Start
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff.key}
                onClick={() => handleStartRandom(diff.key)}
                disabled={
                  isLoading || paragraphs.filter((p) => p.difficulty === diff.key).length === 0
                }
                className={`${diff.color} hover-button flex items-center justify-center gap-3 rounded-lg px-6 py-4 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <span className="text-2xl">{diff.icon}</span>
                <div className="text-left">
                  <div className="font-semibold">{diff.label}</div>
                  <div className="text-sm opacity-80">
                    {paragraphs.filter((p) => p.difficulty === diff.key).length} paragraphs
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-4 text-center">
            <button
              onClick={() => handleStartRandom()}
              disabled={isLoading || paragraphs.length === 0}
              className="text-sm font-medium text-cyan-400 hover:text-cyan-300 disabled:opacity-50"
            >
              🎲 Start Random Paragraph
            </button>
          </div>
        </div>

        {/* Recent Paragraphs */}
        <div className="animate-fade-up section-delay-2">
          <div className="mb-4 flex items-center justify-between">
            <h2
              className="flex items-center gap-2 text-xl font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              <span>📖</span> Browse Paragraphs
            </h2>
            <button
              onClick={() => navigate({ to: '/paragraphs' })}
              className="text-sm font-medium text-cyan-400 hover:text-cyan-300"
            >
              View All →
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <ParagraphCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="card-cascade grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recentParagraphs.map((paragraph) => (
                <div
                  key={paragraph.id}
                  onClick={() => handleStartParagraph(paragraph.id)}
                  className="group animate-fade-up hover-card cursor-pointer rounded-lg border p-5 hover:border-cyan-500"
                  style={{
                    backgroundColor: 'var(--color-surface-light)',
                    borderColor: 'var(--color-surface-elevated)',
                  }}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <h3
                      className="line-clamp-1 text-lg font-semibold transition-colors group-hover:text-cyan-400"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {paragraph.title}
                    </h3>
                    <span
                      className={`ml-2 shrink-0 rounded border px-2 py-0.5 text-xs font-medium ${getDifficultyColor(paragraph.difficulty).className}`}
                      style={getDifficultyColor(paragraph.difficulty).style}
                    >
                      {paragraph.difficulty}
                    </span>
                  </div>

                  {paragraph.topic && (
                    <span
                      className="mb-2 inline-block rounded px-2 py-0.5 text-xs"
                      style={{
                        backgroundColor: 'var(--color-surface-elevated)',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      {paragraph.topic}
                    </span>
                  )}

                  <p
                    className="mb-3 line-clamp-2 text-sm"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {paragraph.content}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: 'var(--color-text-muted)' }}>
                      {paragraph.sentenceCount} sentences
                    </span>
                    <span className="font-medium text-cyan-400 group-hover:text-cyan-300">
                      Start →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats / Features Section */}
        <div className="card-cascade grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div
            className="animate-scale-in rounded-lg border p-5 text-center"
            style={{
              backgroundColor: 'var(--color-surface-light)',
              borderColor: 'var(--color-surface-elevated)',
            }}
          >
            <div className="mb-2 text-3xl">🎯</div>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {paragraphs.length}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Paragraphs Available
            </div>
          </div>
          <div
            className="animate-scale-in rounded-lg border p-5 text-center"
            style={{
              backgroundColor: 'var(--color-surface-light)',
              borderColor: 'var(--color-surface-elevated)',
            }}
          >
            <div className="mb-2 text-3xl">🤖</div>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              AI
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Powered Feedback
            </div>
          </div>
          <div
            className="animate-scale-in rounded-lg border p-5 text-center"
            style={{
              backgroundColor: 'var(--color-surface-light)',
              borderColor: 'var(--color-surface-elevated)',
            }}
          >
            <div className="mb-2 text-3xl">📈</div>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              80%+
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Pass Threshold
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
