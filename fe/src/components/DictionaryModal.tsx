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
      <DialogContent className="bg-card/95 border-primary/20 shadow-2xl backdrop-blur-xl sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-display text-foreground flex items-center gap-2 text-2xl">
            <BookOpen className="text-primary h-6 w-6" />
            Dictionary Lookup
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter a word..."
              className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:ring-primary/50 w-full rounded-lg border px-4 py-3 pl-11 transition-all focus:ring-2 focus:outline-none"
              autoFocus
            />
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
          </div>

          <button
            onClick={handleSearch}
            disabled={isLoading || !query.trim()}
            className="bg-primary text-primary-foreground hover:shadow-primary/20 w-full rounded-lg px-4 py-3 font-medium transition-all hover:opacity-90 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>

          <div className="custom-scrollbar max-h-[400px] min-h-[200px] overflow-y-auto">
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="border-primary/30 border-t-primary h-8 w-8 animate-spin rounded-full border-4" />
              </div>
            )}

            {notFound && (
              <div className="py-12 text-center">
                <p className="text-muted-foreground text-lg">No definition found</p>
                <p className="text-muted-foreground/60 mt-2 text-sm">Try a different word</p>
              </div>
            )}

            {result && (
              <div className="bg-secondary/30 border-border/50 space-y-6 rounded-lg border p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-display text-primary text-2xl font-bold">
                          {result.word}
                        </h3>
                        <button className="hover:bg-primary/10 group rounded-full p-2 transition-colors">
                          <Volume2 className="text-muted-foreground group-hover:text-primary h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-accent mt-1 text-sm font-medium">{result.partOfSpeech}</p>
                    </div>
                  </div>

                  <div className="border-border/50 border-t pt-2">
                    <p className="text-foreground text-lg leading-relaxed">{result.translation}</p>
                  </div>

                  {result.example && (
                    <div className="bg-background/50 border-accent mt-4 rounded-lg border-l-4 p-4">
                      <p className="text-muted-foreground text-sm leading-relaxed italic">
                        "{result.example}"
                      </p>
                      {result.exampleTranslation && (
                        <p className="text-muted-foreground/80 mt-2 text-sm leading-relaxed">
                          → {result.exampleTranslation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {!isLoading && !notFound && !result && (
              <div className="text-muted-foreground flex flex-col items-center justify-center py-12">
                <BookOpen className="mb-4 h-16 w-16 opacity-30" />
                <p className="text-lg">Search for any word</p>
                <p className="mt-1 text-sm opacity-60">Translations and definitions</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
