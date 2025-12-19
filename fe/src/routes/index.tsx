import { useState, useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { getParagraphs } from '../api/sessionApi';
import type { Paragraph } from '../types/session';

export const Route = createFileRoute('/')({
  component: HomePage,
});

const DIFFICULTIES = [
  { key: 'Beginner', label: 'Beginner', color: 'bg-green-600 hover:bg-green-700', icon: '🌱' },
  { key: 'Intermediate', label: 'Intermediate', color: 'bg-yellow-600 hover:bg-yellow-700', icon: '📚' },
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
      const data = await getParagraphs();
      setParagraphs(data);
    } catch (err) {
      console.error('Failed to load paragraphs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartRandom = (difficulty?: string) => {
    const filtered = difficulty 
      ? paragraphs.filter(p => p.difficulty === difficulty)
      : paragraphs;
    
    if (filtered.length > 0) {
      const random = filtered[Math.floor(Math.random() * filtered.length)];
      navigate({ to: '/session/$paragraphId', params: { paragraphId: String(random.id) } });
    }
  };

  const handleStartParagraph = (paragraphId: number) => {
    navigate({ to: '/session/$paragraphId', params: { paragraphId: String(paragraphId) } });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-900 text-green-300 border-green-700';
      case 'intermediate':
        return 'bg-yellow-900 text-yellow-300 border-yellow-700';
      case 'advanced':
        return 'bg-red-900 text-red-300 border-red-700';
      default:
        return 'bg-gray-700 text-gray-300 border-gray-600';
    }
  };

  const recentParagraphs = paragraphs.slice(0, 6);

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            Practice Vietnamese → English Translation
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Improve your translation skills with AI-powered feedback. Choose a difficulty level or browse paragraphs.
          </p>
        </div>

        {/* Quick Start by Difficulty */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <span>⚡</span> Quick Start
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff.key}
                onClick={() => handleStartRandom(diff.key)}
                disabled={isLoading || paragraphs.filter(p => p.difficulty === diff.key).length === 0}
                className={`${diff.color} text-white py-4 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span className="text-2xl">{diff.icon}</span>
                <div className="text-left">
                  <div className="font-semibold">{diff.label}</div>
                  <div className="text-sm opacity-80">
                    {paragraphs.filter(p => p.difficulty === diff.key).length} paragraphs
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-4 text-center">
            <button
              onClick={() => handleStartRandom()}
              disabled={isLoading || paragraphs.length === 0}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium disabled:opacity-50"
            >
              🎲 Start Random Paragraph
            </button>
          </div>
        </div>

        {/* Recent Paragraphs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <span>📖</span> Browse Paragraphs
            </h2>
            <button
              onClick={() => navigate({ to: '/paragraphs' })}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              View All →
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-800 rounded-lg border border-gray-700 p-5 animate-pulse">
                  <div className="h-5 bg-gray-700 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/4 mb-3"></div>
                  <div className="h-12 bg-gray-700 rounded mb-3"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentParagraphs.map((paragraph) => (
                <div
                  key={paragraph.id}
                  onClick={() => handleStartParagraph(paragraph.id)}
                  className="bg-gray-800 rounded-lg border border-gray-700 p-5 hover:border-blue-500 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                      {paragraph.title}
                    </h3>
                    <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded border shrink-0 ${getDifficultyColor(paragraph.difficulty)}`}>
                      {paragraph.difficulty}
                    </span>
                  </div>
                  
                  {paragraph.topic && (
                    <span className="inline-block px-2 py-0.5 bg-gray-700 text-gray-400 text-xs rounded mb-2">
                      {paragraph.topic}
                    </span>
                  )}
                  
                  <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                    {paragraph.content}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {paragraph.sentenceCount} sentences
                    </span>
                    <span className="text-blue-400 group-hover:text-blue-300 font-medium">
                      Start →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats / Features Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-5 text-center">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-white">{paragraphs.length}</div>
            <div className="text-gray-400 text-sm">Paragraphs Available</div>
          </div>
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-5 text-center">
            <div className="text-3xl mb-2">🤖</div>
            <div className="text-2xl font-bold text-white">AI</div>
            <div className="text-gray-400 text-sm">Powered Feedback</div>
          </div>
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-5 text-center">
            <div className="text-3xl mb-2">📈</div>
            <div className="text-2xl font-bold text-white">80%+</div>
            <div className="text-gray-400 text-sm">Pass Threshold</div>
          </div>
        </div>
      </div>
    </div>
  );
}
