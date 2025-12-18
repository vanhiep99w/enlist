import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { getParagraphs } from '../api/sessionApi';
import type { Paragraph } from '../types/session';

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

export function ParagraphList() {
  const navigate = useNavigate();
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadParagraphs();
  }, [selectedDifficulty]);

  const loadParagraphs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getParagraphs(selectedDifficulty || undefined);
      setParagraphs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load paragraphs');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredParagraphs = paragraphs.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.topic?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleStartSession = (paragraphId: number) => {
    navigate({ to: '/session/$paragraphId', params: { paragraphId: String(paragraphId) } });
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Paragraph Translation</h1>
          <p className="text-gray-400">Choose a paragraph to practice sentence-by-sentence translation</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by title or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedDifficulty('')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedDifficulty === ''
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              All
            </button>
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedDifficulty === diff
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 text-red-300 mb-6">
            {error}
          </div>
        )}

        {/* Paragraph Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredParagraphs.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                No paragraphs found. Try adjusting your filters.
              </div>
            ) : (
              filteredParagraphs.map((paragraph) => (
                <div
                  key={paragraph.id}
                  className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-blue-500 transition-colors cursor-pointer"
                  onClick={() => handleStartSession(paragraph.id)}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white line-clamp-2">
                        {paragraph.title}
                      </h3>
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded border ${getDifficultyColor(paragraph.difficulty)}`}>
                        {paragraph.difficulty}
                      </span>
                    </div>
                    
                    {paragraph.topic && (
                      <span className="inline-block px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded mb-3">
                        {paragraph.topic}
                      </span>
                    )}
                    
                    <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                      {paragraph.content}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        {paragraph.sentenceCount} sentences
                      </span>
                      <button className="text-blue-400 hover:text-blue-300 font-medium">
                        Start →
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
