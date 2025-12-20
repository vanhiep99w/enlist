import { useState, useEffect } from 'react';
import { X, Search, Trash2, BookOpen, Calendar, Sparkles } from 'lucide-react';
import { getUserDictionary, deleteWord, type DictionaryWord } from '../api/dictionaryApi';

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
          (w) =>
            w.word.toLowerCase().includes(query) ||
            w.translation.toLowerCase().includes(query)
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
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 z-40 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Slide-out Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[480px] shadow-2xl transform transition-transform duration-300 ease-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
          borderLeft: '1px solid rgba(139, 92, 246, 0.2)',
        }}
      >
        {/* Header */}
        <div
          className="relative px-6 py-5 border-b"
          style={{
            borderColor: 'rgba(255, 255, 255, 0.1)',
            background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.1) 0%, transparent 100%)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' }}
              >
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'ui-serif, Georgia, serif' }}>
                  My Dictionary
                </h2>
                <p className="text-xs text-white/50">{words.length} words saved</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              style={{ color: 'rgba(255, 255, 255, 0.7)' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search words..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
              }}
            />
          </div>
        </div>

        {/* Word List */}
        <div className="h-[calc(100%-160px)] overflow-y-auto px-4 py-4 space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent" />
            </div>
          ) : filteredWords.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-white/40">
              <Sparkles className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm">{searchQuery ? 'No words found' : 'Start building your vocabulary!'}</p>
            </div>
          ) : (
            filteredWords.map((word) => (
              <div
                key={word.id}
                className="group rounded-lg p-4 cursor-pointer transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: selectedWord?.id === word.id ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid',
                  borderColor: selectedWord?.id === word.id ? 'rgba(139, 92, 246, 0.4)' : 'rgba(255, 255, 255, 0.1)',
                }}
                onClick={() => setSelectedWord(word)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-white mb-1" style={{ fontFamily: 'ui-serif, Georgia, serif' }}>
                      {word.word}
                    </h3>
                    <p className="text-sm text-white/70">{word.translation}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(word.id);
                    }}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all"
                    style={{ color: '#ef4444' }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {word.context && (
                  <p className="text-xs italic text-white/40 mb-2 line-clamp-2">"{word.context}"</p>
                )}

                <div className="flex items-center gap-2 text-xs text-white/30">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(word.createdAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Stats */}
        <div
          className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t"
          style={{
            borderColor: 'rgba(255, 255, 255, 0.1)',
            background: 'linear-gradient(0deg, rgba(139, 92, 246, 0.1) 0%, transparent 100%)',
          }}
        >
          <div className="flex items-center justify-between text-xs text-white/50">
            <span>Keep learning! 📚</span>
            <span>{filteredWords.length} of {words.length}</span>
          </div>
        </div>
      </div>
    </>
  );
};
