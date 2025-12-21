import { useState, useEffect } from 'react';
import {
  X,
  Search,
  Trash2,
  BookOpen,
  Calendar,
  Sparkles,
  Volume2,
  MessageSquareQuote,
} from 'lucide-react';
import { useUserDictionary, useDeleteWord } from '../hooks/useDictionary';
import { Card, CardContent } from './ui/card';
import { cn } from '@/lib/utils';
import { ttsService } from '../services/ttsService';
import type { DictionaryWord } from '../api/dictionaryApi';

interface DictionaryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
}

export const DictionaryPanel = ({ isOpen, onClose, userId }: DictionaryPanelProps) => {
  const { data: words = [], isLoading, refetch } = useUserDictionary(userId);
  const deleteWordMutation = useDeleteWord();

  const [filteredWords, setFilteredWords] = useState<DictionaryWord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWord, setSelectedWord] = useState<DictionaryWord | null>(null);
  const [playingWordId, setPlayingWordId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ wordId: number; word: string } | null>(null);

  const handleSpeak = async (e: React.MouseEvent, word: DictionaryWord) => {
    e.stopPropagation();
    if (playingWordId === word.id) {
      ttsService.stop();
      setPlayingWordId(null);
      return;
    }
    setPlayingWordId(word.id);
    try {
      await ttsService.speakWithFallback(word.translation);
    } finally {
      setPlayingWordId(null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      setFilteredWords(
        words.filter(
          (w) => w.word.toLowerCase().includes(query) || w.translation.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredWords(words);
    }
  }, [searchQuery, words]);

  const handleDelete = (wordId: number) => {
    if (selectedWord?.id === wordId) {
      setSelectedWord(null);
    }
    deleteWordMutation.mutate({ userId, wordId });
    setDeleteConfirm(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
        onClick={onClose}
      />

      {/* Slide-out Panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full transform shadow-2xl transition-transform duration-300 ease-out sm:w-[480px] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          backgroundColor: 'var(--color-surface-dark)',
          borderLeft: '1px solid var(--color-border)',
        }}
      >
        {/* Gradient overlay for depth */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background: `radial-gradient(ellipse 70% 50% at 50% 0%, rgba(var(--color-primary-rgb), 0.15), transparent 60%)`,
          }}
        />

        {/* Header */}
        <div
          className="relative z-10 border-b px-6 py-5"
          style={{
            borderColor: 'var(--color-border)',
            background: `linear-gradient(180deg, rgba(var(--color-primary-rgb), 0.08) 0%, transparent 100%)`,
          }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl shadow-lg"
                style={{
                  background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)`,
                }}
              >
                <BookOpen className="h-5 w-5" style={{ color: 'var(--color-text-primary)' }} />
              </div>
              <div>
                <h2
                  className="font-display text-xl font-bold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  My Dictionary
                </h2>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {words.length} words saved
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 transition-colors hover:bg-white/5"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
              style={{ color: 'var(--color-text-muted)' }}
            />
            <input
              type="text"
              placeholder="Search words..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg py-2.5 pr-4 pl-10 text-sm transition-all outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
                boxShadow: '0 0 0 0 rgba(var(--color-primary-rgb), 0)',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-primary)';
                e.target.style.boxShadow = '0 0 0 3px rgba(var(--color-primary-rgb), 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--color-border)';
                e.target.style.boxShadow = '0 0 0 0 rgba(var(--color-primary-rgb), 0)';
              }}
            />
          </div>
        </div>

        {/* Word List */}
        <div className="custom-scrollbar relative z-10 h-[calc(100%-200px)] space-y-2 overflow-y-auto px-4 py-4">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div
                className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
                style={{ borderColor: 'var(--color-primary)' }}
              />
            </div>
          ) : filteredWords.length === 0 ? (
            <div
              className="flex h-32 flex-col items-center justify-center"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <Sparkles className="mb-3 h-12 w-12 animate-pulse opacity-50" />
              <p className="text-sm">
                {searchQuery ? 'No words found' : 'Start building your vocabulary!'}
              </p>
            </div>
          ) : (
            filteredWords.map((word, index) => (
              <Card
                key={word.id}
                className={cn(
                  'group cursor-pointer border transition-all duration-200 hover:scale-[1.02]',
                  selectedWord?.id === word.id ? 'shadow-lg' : 'shadow-sm hover:shadow-md'
                )}
                style={{
                  backgroundColor:
                    selectedWord?.id === word.id
                      ? 'var(--color-surface-elevated)'
                      : 'var(--color-surface)',
                  borderColor:
                    selectedWord?.id === word.id ? 'var(--color-primary)' : 'var(--color-border)',
                  animationDelay: `${index * 0.03}s`,
                }}
                onClick={() => setSelectedWord(word)}
              >
                <CardContent className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3
                          className="font-display text-lg font-bold"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {word.word}
                        </h3>
                        <button
                          onClick={(e) => handleSpeak(e, word)}
                          className={cn(
                            'flex h-6 w-6 items-center justify-center rounded-full transition-all hover:scale-110',
                            playingWordId === word.id && 'animate-pulse'
                          )}
                          style={{
                            backgroundColor: 'var(--color-primary)',
                            color: 'white',
                          }}
                          title="Listen to pronunciation"
                        >
                          <Volume2 className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {word.translation}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm({ wordId: word.id, word: word.word });
                      }}
                      className="rounded-lg p-1.5 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500/20"
                      style={{ color: 'var(--color-error)' }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {word.context && (
                    <div className="mb-2 space-y-1">
                      <p
                        className="line-clamp-2 text-xs italic"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        "{word.context}"
                      </p>
                      <p
                        className="line-clamp-2 text-xs"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        → {word.translation}
                      </p>
                    </div>
                  )}

                  {/* Examples Section */}
                  {word.examples && word.examples.length > 0 && (
                    <div
                      className="mb-2 rounded-lg p-2"
                      style={{ backgroundColor: 'var(--color-surface-dark)' }}
                    >
                      <div
                        className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        <MessageSquareQuote className="h-3 w-3" />
                        Examples
                      </div>
                      <div className="space-y-1.5">
                        {word.examples.slice(0, 2).map((example, idx) => (
                          <div
                            key={idx}
                            className="border-l-2 pl-2"
                            style={{ borderColor: 'var(--color-primary)' }}
                          >
                            <p
                              className="text-xs italic"
                              style={{ color: 'var(--color-text-secondary)' }}
                            >
                              {example.en}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                              {example.vi}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div
                    className="flex items-center gap-2 text-xs"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(word.createdAt)}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Footer Stats */}
        <div
          className="absolute right-0 bottom-0 left-0 z-10 border-t px-6 py-4"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-surface-dark)',
            background: `linear-gradient(0deg, rgba(var(--color-primary-rgb), 0.08) 0%, transparent 100%)`,
          }}
        >
          <div
            className="flex items-center justify-between text-xs"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <span className="flex items-center gap-2">
              <span className="text-base">📚</span>
              Keep learning!
            </span>
            <span className="font-medium">
              {filteredWords.length} of {words.length}
            </span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          />
          <div
            className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl p-6 shadow-2xl"
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            <h3 className="mb-2 text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Delete Word?
            </h3>
            <p className="mb-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Are you sure you want to delete "
              <span className="font-semibold">{deleteConfirm.word}</span>" from your dictionary?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--color-surface-dark)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.wordId)}
                className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:opacity-90"
                style={{
                  backgroundColor: 'var(--color-error)',
                  color: 'white',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};
