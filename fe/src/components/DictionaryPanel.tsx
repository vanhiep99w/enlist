import { useState, useEffect } from 'react';
import { X, Search, Trash2, BookOpen, Calendar, Sparkles } from 'lucide-react';
import { getUserDictionary, deleteWord, type DictionaryWord } from '../api/dictionaryApi';
import { Card, CardContent } from './ui/card';
import { cn } from '@/lib/utils';

interface DictionaryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
}

export const DictionaryPanel = ({ isOpen, onClose, userId }: DictionaryPanelProps) => {
  const [words, setWords] = useState<DictionaryWord[]>([]);
  const [filteredWords, setFilteredWords] = useState<DictionaryWord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWord, setSelectedWord] = useState<DictionaryWord | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadDictionary();
    }
  }, [isOpen, userId]);

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

  const loadDictionary = async () => {
    setIsLoading(true);
    try {
      const data = await getUserDictionary(userId);
      setWords(data);
      setFilteredWords(data);
    } catch (error) {
      console.error('Failed to load dictionary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (wordId: number) => {
    try {
      await deleteWord(userId, wordId);
      setWords(words.filter((w) => w.id !== wordId));
      if (selectedWord?.id === wordId) {
        setSelectedWord(null);
      }
    } catch (error) {
      console.error('Failed to delete word:', error);
    }
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
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Slide-out Panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full transform shadow-2xl transition-transform duration-300 ease-out sm:w-[480px] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
          borderLeft: '1px solid rgba(139, 92, 246, 0.2)',
        }}
      >
        {/* Header */}
        <div
          className="relative border-b px-6 py-5"
          style={{
            borderColor: 'rgba(255, 255, 255, 0.1)',
            background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.1) 0%, transparent 100%)',
          }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' }}
              >
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2
                  className="text-xl font-bold text-white"
                  style={{ fontFamily: 'ui-serif, Georgia, serif' }}
                >
                  My Dictionary
                </h2>
                <p className="text-xs text-white/50">{words.length} words saved</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 transition-colors hover:bg-white/10"
              style={{ color: 'rgba(255, 255, 255, 0.7)' }}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search words..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg py-2.5 pr-4 pl-10 text-sm transition-all outline-none"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
              }}
            />
          </div>
        </div>

        {/* Word List */}
        <div className="h-[calc(100%-160px)] space-y-2 overflow-y-auto px-4 py-4">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
            </div>
          ) : filteredWords.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center text-white/40">
              <Sparkles className="mb-3 h-12 w-12 opacity-50" />
              <p className="text-sm">
                {searchQuery ? 'No words found' : 'Start building your vocabulary!'}
              </p>
            </div>
          ) : (
            filteredWords.map((word) => (
              <Card
                key={word.id}
                className={cn(
                  'group cursor-pointer transition-all hover:scale-[1.02]',
                  selectedWord?.id === word.id
                    ? 'border-purple-500/40 bg-purple-900/20'
                    : 'bg-card/5 border-border/10'
                )}
                onClick={() => setSelectedWord(word)}
              >
                <CardContent className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex-1">
                      <h3
                        className="mb-1 text-lg font-bold text-white"
                        style={{ fontFamily: 'ui-serif, Georgia, serif' }}
                      >
                        {word.word}
                      </h3>
                      <p className="text-sm text-white/70">{word.translation}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(word.id);
                      }}
                      className="rounded-lg p-1.5 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500/20"
                      style={{ color: '#ef4444' }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {word.context && (
                    <p className="mb-2 line-clamp-2 text-xs text-white/40 italic">
                      "{word.context}"
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-xs text-white/30">
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
          className="absolute right-0 bottom-0 left-0 border-t px-6 py-4"
          style={{
            borderColor: 'rgba(255, 255, 255, 0.1)',
            background: 'linear-gradient(0deg, rgba(139, 92, 246, 0.1) 0%, transparent 100%)',
          }}
        >
          <div className="flex items-center justify-between text-xs text-white/50">
            <span>Keep learning! 📚</span>
            <span>
              {filteredWords.length} of {words.length}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
