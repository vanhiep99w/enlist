import { useState } from 'react';
import { Volume2, BookPlus, X, Sparkles } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface WordPopupProps {
  word: string;
  translation: string;
  partOfSpeech?: string;
  example?: string;
  position: { x: number; y: number };
  onClose: () => void;
  onAddToDictionary: (word: string, translation: string, context?: string) => void;
  children?: React.ReactNode;
}

export const WordPopup = ({ 
  word, 
  translation, 
  partOfSpeech,
  example,
  onClose, 
  onAddToDictionary,
  children
}: WordPopupProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [open, setOpen] = useState(true);

  const handlePlayAudio = () => {
    setIsPlaying(true);
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleAddToDictionary = () => {
    onAddToDictionary(word, translation, example);
    setIsAdded(true);
    setTimeout(() => {
      setOpen(false);
      onClose();
    }, 800);
  };

  const getPartOfSpeechColor = (pos?: string) => {
    if (!pos) return 'bg-primary/80';
    const lower = pos.toLowerCase();
    if (lower.includes('noun')) return 'bg-violet-500';
    if (lower.includes('verb')) return 'bg-pink-500';
    if (lower.includes('adj')) return 'bg-emerald-500';
    if (lower.includes('adv')) return 'bg-amber-500';
    return 'bg-primary/80';
  };

  return (
    <Popover open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) onClose();
    }}>
      <PopoverTrigger asChild>
        {children || <span className="cursor-pointer">{word}</span>}
      </PopoverTrigger>
      <PopoverContent 
        className="w-[380px] bg-card/95 backdrop-blur-xl border-primary/20 shadow-2xl p-5"
        sideOffset={8}
      >
        <div>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-2">
                <h3 className="font-display font-bold text-xl tracking-tight text-foreground">
                  {word}
                </h3>
                {partOfSpeech && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider text-white ${getPartOfSpeechColor(partOfSpeech)}`}>
                    {partOfSpeech}
                  </span>
                )}
              </div>
              <p className="text-base leading-relaxed text-muted-foreground">
                {translation}
              </p>
              {example && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-xs italic leading-relaxed text-muted-foreground/80">
                    "{example}"
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                setOpen(false);
                onClose();
              }}
              className="p-1.5 rounded-lg hover:bg-muted/50 transition-all text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handlePlayAudio}
              disabled={isPlaying}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 font-medium text-sm bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/40"
            >
              <Volume2 className="w-4 h-4" />
              <span>{isPlaying ? 'Playing...' : 'Listen'}</span>
            </button>

            <button
              onClick={handleAddToDictionary}
              disabled={isAdded}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border transition-all hover:scale-[1.02] active:scale-[0.98] font-medium text-sm disabled:opacity-50 ${
                isAdded 
                  ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' 
                  : 'border-border/50 text-foreground bg-muted/30 hover:bg-muted/50'
              }`}
            >
              {isAdded ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <BookPlus className="w-4 h-4" />
                  <span>Save</span>
                </>
              )}
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
