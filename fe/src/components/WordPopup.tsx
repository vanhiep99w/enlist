import { useState, useEffect } from 'react';
import { Volume2, BookmarkPlus, X, Check, Loader2, BookText } from 'lucide-react';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ttsService } from '../services/ttsService';
import { useTranslateWord, useSaveWord } from '../hooks/useDictionary';
import { useQuery } from '@tanstack/react-query';
import { getWordExamples } from '../api/dictionaryApi';

interface WordPopupProps {
  word: string;
  position: { x: number; y: number };
  onClose: () => void;
  sessionId?: number;
  context: string | null;
  userId?: number;
}

interface WordData {
  translation?: string;
  partOfSpeech?: string;
  example?: string;
  exampleTranslation?: string;
}

export const WordPopup = ({
  word,
  position,
  onClose,
  sessionId,
  context,
  userId = 1, // TODO: Get actual userId
}: WordPopupProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [open, setOpen] = useState(true);
  const [wordData, setWordData] = useState<WordData>({});
  const [activeTab, setActiveTab] = useState<'translation' | 'examples'>('translation');

  const translateWordMutation = useTranslateWord();
  const saveWordMutation = useSaveWord();

  const { data: examples, isLoading: examplesLoading } = useQuery({
    queryKey: ['wordExamples', word],
    queryFn: () => getWordExamples(word),
    enabled: activeTab === 'examples',
  });

  // Load word translation on mount
  useEffect(() => {
    const loadTranslation = async () => {
      try {
        const result = await translateWordMutation.mutateAsync({
          word,
          context: context || undefined,
        });
        setWordData({
          translation: result.translation,
          partOfSpeech: result.partOfSpeech,
          example: result.example,
          exampleTranslation: result.exampleTranslation,
        });
      } catch (error) {
        console.error('Failed to translate word:', error);
        toast.error('Translation failed', {
          description: 'Could not translate the selected word. Please try again.',
        });
        onClose();
      }
    };

    loadTranslation();
  }, [word, context]);

  const handlePlayAudio = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();

    if (!wordData.translation) return;

    setIsPlaying(true);

    try {
      await ttsService.speakWithFallback(wordData.translation);
    } catch (error) {
      console.error('Failed to play audio:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleAddToDictionary = async () => {
    if (!wordData.translation) return;

    try {
      await saveWordMutation.mutateAsync({
        userId,
        request: {
          word,
          translation: wordData.translation,
          context: wordData.example,
          sessionId,
        },
      });
      toast.success('Saved to dictionary', {
        description: `"${word}" has been added to your personal dictionary`,
      });
      setIsAdded(true);
      setTimeout(() => {
        setOpen(false);
        onClose();
      }, 1200);
    } catch (error) {
      console.error('Failed to save word:', error);
      toast.error('Failed to save word', {
        description: 'Could not add word to dictionary. Please try again.',
      });
    }
  };

  const getPartOfSpeechConfig = (pos?: string) => {
    if (!pos) return { color: 'text-primary', bg: 'bg-primary/15', label: 'word' };
    const lower = pos.toLowerCase();
    if (lower.includes('noun'))
      return {
        color: 'text-violet-400',
        bg: 'bg-violet-500/15',
        label: 'noun',
      };
    if (lower.includes('verb'))
      return { color: 'text-rose-400', bg: 'bg-rose-500/15', label: 'verb' };
    if (lower.includes('adj'))
      return {
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/15',
        label: 'adj',
      };
    if (lower.includes('adv'))
      return { color: 'text-amber-400', bg: 'bg-amber-500/15', label: 'adv' };
    return { color: 'text-primary', bg: 'bg-primary/15', label: pos };
  };

  const posConfig = getPartOfSpeechConfig(wordData.partOfSpeech);
  const isLoading = translateWordMutation.isPending;

  return (
    <>
      {/* Invisible anchor */}
      <div
        className="pointer-events-none fixed h-0 w-0"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 9999,
        }}
        id="word-popup-anchor"
      />

      <Popover
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) onClose();
        }}
      >
        <PopoverTrigger asChild>
          <button
            className="pointer-events-none fixed h-0 w-0 opacity-0 focus:outline-none"
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
            }}
          />
        </PopoverTrigger>
        <PopoverContent
          className="bg-card/98 border-primary/20 w-[340px] overflow-hidden border-2 p-0 shadow-2xl backdrop-blur-xl"
          side="bottom"
          sideOffset={40}
          align="start"
          alignOffset={40}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          {/* Decorative top border gradient */}
          <div
            className="from-primary via-accent to-primary animate-shimmer h-1 bg-gradient-to-r"
            style={{ backgroundSize: '200% 100%' }}
          />

          <div className="p-4" onClick={(e) => e.stopPropagation()}>
            {/* Header with close button */}
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                {/* Word and POS badge */}
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="font-display text-foreground truncate text-2xl font-bold tracking-tight">
                    {word}
                  </h3>
                  <div
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${posConfig.color} ${posConfig.bg} shrink-0`}
                  >
                    {isLoading ? (
                      <div className="h-3 w-8 animate-pulse rounded bg-current/20" />
                    ) : (
                      posConfig.label
                    )}
                  </div>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={() => {
                  setOpen(false);
                  onClose();
                }}
                className="border-border/50 hover:border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground focus:ring-primary/50 shrink-0 cursor-pointer rounded-lg border p-1.5 transition-all focus:ring-2 focus:outline-none"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="border-border/50 mb-3 flex gap-1 border-b">
              <button
                onClick={() => setActiveTab('translation')}
                className={`flex-1 pb-2 text-xs font-semibold transition-colors ${
                  activeTab === 'translation'
                    ? 'text-primary border-primary border-b-2'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Translation
              </button>
              <button
                onClick={() => setActiveTab('examples')}
                className={`flex flex-1 items-center justify-center gap-1 pb-2 text-xs font-semibold transition-colors ${
                  activeTab === 'examples'
                    ? 'text-primary border-primary border-b-2'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <BookText className="h-3 w-3" />
                Examples
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'translation' ? (
              <>
                {/* Translation - Fixed height container */}
                <div className="flex min-h-[48px] items-start">
                  {isLoading ? (
                    <div className="w-full space-y-2">
                      <div className="bg-muted/40 h-3.5 w-full animate-pulse rounded-full" />
                      <div className="bg-muted/30 h-3.5 w-4/5 animate-pulse rounded-full" />
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                      {wordData.translation || 'No translation available'}
                    </p>
                  )}
                </div>

                {/* Example - Fixed height container */}
                <div className="mt-2 min-h-[56px] pt-2">
                  {isLoading ? (
                    <div className="space-y-2">
                      <div className="bg-muted/30 h-3 w-3/4 animate-pulse rounded-full" />
                      <div className="bg-muted/20 h-3 w-2/3 animate-pulse rounded-full" />
                    </div>
                  ) : wordData.example ? (
                    <div className="space-y-1">
                      <p className="text-muted-foreground/70 line-clamp-2 text-xs italic">
                        "{wordData.example}"
                      </p>
                      {wordData.exampleTranslation && (
                        <p className="text-muted-foreground/50 line-clamp-2 text-xs">
                          "{wordData.exampleTranslation}"
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="h-3" /> // Spacer to maintain height
                  )}
                </div>
              </>
            ) : (
              <div className="max-h-[240px] min-h-[104px] overflow-y-auto">
                {examplesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="space-y-2">
                        <div className="bg-muted/40 h-3 w-full animate-pulse rounded-full" />
                        <div className="bg-muted/30 h-3 w-4/5 animate-pulse rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : examples && examples.length > 0 ? (
                  <div className="space-y-3">
                    {examples.map((example, idx) => (
                      <div
                        key={example.id || idx}
                        className="border-primary/30 space-y-1 border-l-2 pl-3"
                      >
                        <p className="text-muted-foreground text-xs leading-relaxed italic">
                          "{example.exampleSentence}"
                        </p>
                        <p className="text-muted-foreground/60 text-xs leading-relaxed">
                          "{example.translation}"
                        </p>
                        <p className="text-muted-foreground/40 text-[10px] tracking-wide uppercase">
                          {example.source}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground flex h-24 items-center justify-center text-xs">
                    No examples available
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {/* Listen button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayAudio(e);
                }}
                disabled={isPlaying || isLoading}
                style={{ borderColor: 'var(--color-border)' }}
                className="group bg-primary text-primary-foreground focus:ring-primary/50 relative overflow-hidden rounded-lg border-2 px-3 py-2.5 text-xs font-bold shadow-md transition-all hover:scale-[1.02] hover:shadow-lg hover:brightness-110 focus:ring-2 focus:outline-none active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <div className="relative flex items-center justify-center gap-1.5">
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>{isPlaying ? 'Playing...' : 'Listen'}</span>
                </div>
              </button>

              {/* Save button */}
              <button
                onClick={handleAddToDictionary}
                disabled={isAdded || isLoading}
                style={{ borderColor: 'var(--color-border)' }}
                className={`group focus:ring-primary/50 relative overflow-hidden rounded-lg px-3 py-2.5 text-xs font-bold transition-all hover:scale-[1.02] focus:ring-2 focus:outline-none active:scale-[0.98] disabled:cursor-not-allowed ${
                  isAdded
                    ? 'border-2 bg-emerald-500 text-white shadow-md'
                    : 'bg-secondary text-secondary-foreground border-2 shadow-md hover:shadow-lg hover:brightness-110'
                } ${isLoading ? 'opacity-40' : ''}`}
              >
                <div className="relative flex items-center justify-center gap-1.5">
                  {isAdded ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="h-3.5 w-3.5" />
                      <span>Save</span>
                    </>
                  )}
                </div>
              </button>
            </div>

            {/* Loading indicator overlay */}
            {isLoading && (
              <div className="bg-card/60 pointer-events-none absolute inset-0 flex items-center justify-center backdrop-blur-[2px]">
                <div className="bg-primary/10 border-primary/20 flex items-center gap-2 rounded-full border px-3 py-1.5">
                  <Loader2 className="text-primary h-3.5 w-3.5 animate-spin" />
                  <span className="text-primary text-xs font-medium">Loading...</span>
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};
