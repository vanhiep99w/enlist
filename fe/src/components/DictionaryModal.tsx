import { useState } from 'react';
import { lookupWord, type DictionaryEntry } from '../api/dictionaryApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function DictionaryModal({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<DictionaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setNotFound(false);
    setResult(null);
    
    const entry = await lookupWord(query);
    setIsLoading(false);
    
    if (entry) {
      setResult(entry);
    } else {
      setNotFound(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200" 
      onClick={onClose}
    >
      <div 
        className="backdrop-blur-xl rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/5 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        style={{ backgroundColor: 'var(--color-surface-dark)', opacity: 0.8, borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
        onClick={e => e.stopPropagation()}
      >
        <div 
          className="p-4 flex items-center justify-between bg-gradient-to-r from-purple-500/10 to-transparent"
          style={{ borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'var(--color-border)' }}
        >
          <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <span className="text-xl">📖</span>
            <span>Dictionary</span>
          </h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-all duration-200"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            ✕
          </button>
        </div>
        
        <div className="p-4">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter a word..."
              className="flex-1 backdrop-blur-sm rounded-xl px-4 py-2.5 placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
              style={{ backgroundColor: 'var(--color-surface)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              autoFocus
            />
            <button
              onClick={handleSearch}
              disabled={isLoading || !query.trim()}
              className="px-5 py-2.5 bg-purple-600/90 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25"
            >
              {isLoading ? '...' : 'Look up'}
            </button>
          </div>
          
          <div className="overflow-y-auto max-h-[50vh]">
            {isLoading && (
              <div className="text-center py-8" style={{ color: 'var(--color-text-secondary)' }}>
                Looking up word...
              </div>
            )}
            
            {notFound && (
              <div className="text-center py-8" style={{ color: 'var(--color-text-secondary)' }}>
                No definition found for "{query}"
              </div>
            )}
            
            {result && (
              <div className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{result.word}</span>
                  {result.phonetic && (
                    <span style={{ color: 'var(--color-text-secondary)' }}>{result.phonetic}</span>
                  )}
                </div>
                
                {result.meanings.map((meaning, idx) => (
                  <div key={idx} className="space-y-2">
                    <span className="text-sm font-medium text-blue-400 italic">
                      {meaning.partOfSpeech}
                    </span>
                    <ol className="list-decimal list-inside space-y-2">
                      {meaning.definitions.map((def, defIdx) => (
                        <li key={defIdx} className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          {def.definition}
                          {def.example && (
                            <p className="italic ml-4 mt-1" style={{ color: 'var(--color-text-muted)' }}>
                              "{def.example}"
                            </p>
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            )}
            
            {!isLoading && !notFound && !result && (
              <div className="text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
                Enter a word to look up its definition
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
