import { useState } from 'react';
import { lookupWord, type WordTranslation } from '../api/dictionaryApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Search, BookOpen, Volume2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function DictionaryModal({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<WordTranslation | null>(null);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-xl border-primary/20 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-display text-foreground">
            <BookOpen className="w-6 h-6 text-primary" />
            Dictionary Lookup
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter a word..."
              className="w-full px-4 py-3 pl-11 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              autoFocus
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          </div>

          <button
            onClick={handleSearch}
            disabled={isLoading || !query.trim()}
            className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-primary/20"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>

          <div className="min-h-[200px] max-h-[400px] overflow-y-auto custom-scrollbar">
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            )}
            
            {notFound && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No definition found</p>
                <p className="text-muted-foreground/60 text-sm mt-2">Try a different word</p>
              </div>
            )}
            
            {result && (
              <div className="space-y-6 p-4 bg-secondary/30 rounded-lg border border-border/50">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-display font-bold text-primary">{result.word}</h3>
                        <button className="p-2 rounded-full hover:bg-primary/10 transition-colors group">
                          <Volume2 className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                        </button>
                      </div>
                      <p className="text-sm text-accent font-medium mt-1">{result.partOfSpeech}</p>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-lg text-foreground leading-relaxed">{result.translation}</p>
                  </div>
                  
                  {result.example && (
                    <div className="mt-4 p-4 rounded-lg bg-background/50 border-l-4 border-accent">
                      <p className="text-sm italic text-muted-foreground leading-relaxed">
                        "{result.example}"
                      </p>
                      {result.exampleTranslation && (
                        <p className="text-sm text-muted-foreground/80 mt-2 leading-relaxed">
                          → {result.exampleTranslation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {!isLoading && !notFound && !result && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <BookOpen className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-lg">Search for any word</p>
                <p className="text-sm opacity-60 mt-1">Translations and definitions</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
