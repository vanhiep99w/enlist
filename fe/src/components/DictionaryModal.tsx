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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-md max-h-[80vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-200">📖 Dictionary</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200"
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
              className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
              autoFocus
            />
            <button
              onClick={handleSearch}
              disabled={isLoading || !query.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '...' : 'Look up'}
            </button>
          </div>
          
          <div className="overflow-y-auto max-h-[50vh]">
            {isLoading && (
              <div className="text-center text-gray-400 py-8">
                Looking up word...
              </div>
            )}
            
            {notFound && (
              <div className="text-center text-gray-400 py-8">
                No definition found for "{query}"
              </div>
            )}
            
            {result && (
              <div className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-gray-200">{result.word}</span>
                  {result.phonetic && (
                    <span className="text-gray-400">{result.phonetic}</span>
                  )}
                </div>
                
                {result.meanings.map((meaning, idx) => (
                  <div key={idx} className="space-y-2">
                    <span className="text-sm font-medium text-blue-400 italic">
                      {meaning.partOfSpeech}
                    </span>
                    <ol className="list-decimal list-inside space-y-2">
                      {meaning.definitions.map((def, defIdx) => (
                        <li key={defIdx} className="text-gray-300 text-sm">
                          {def.definition}
                          {def.example && (
                            <p className="text-gray-500 italic ml-4 mt-1">
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
              <div className="text-center text-gray-500 py-8">
                Enter a word to look up its definition
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
