import { useState } from 'react';
import { Volume2, BookPlus, X, Sparkles } from 'lucide-react';

interface WordPopupProps {
  word: string;
  translation: string;
  partOfSpeech?: string;
  example?: string;
  position: { x: number; y: number };
  onClose: () => void;
  onAddToDictionary: (word: string, translation: string, context?: string) => void;
}

export const WordPopup = ({ 
  word, 
  translation, 
  partOfSpeech,
  example,
  position, 
  onClose, 
  onAddToDictionary 
}: WordPopupProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

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
    setTimeout(() => onClose(), 800);
  };

  const getPartOfSpeechColor = (pos?: string) => {
    if (!pos) return '#6366f1';
    const lower = pos.toLowerCase();
    if (lower.includes('noun')) return '#8b5cf6';
    if (lower.includes('verb')) return '#ec4899';
    if (lower.includes('adj')) return '#10b981';
    if (lower.includes('adv')) return '#f59e0b';
    return '#6366f1';
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <div
        className="fixed z-50 rounded-xl shadow-2xl border backdrop-blur-sm"
        style={{
          top: `${Math.min(position.y, window.innerHeight - 300)}px`,
          left: `${Math.min(position.x, window.innerWidth - 380)}px`,
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          minWidth: '340px',
          maxWidth: '380px',
          animation: 'slideIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-2">
                <h3 
                  className="font-bold text-xl tracking-tight"
                  style={{ 
                    color: '#fff',
                    fontFamily: 'ui-serif, Georgia, serif'
                  }}
                >
                  {word}
                </h3>
                {partOfSpeech && (
                  <span 
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider"
                    style={{ 
                      backgroundColor: getPartOfSpeechColor(partOfSpeech),
                      color: 'white',
                      letterSpacing: '0.05em'
                    }}
                  >
                    {partOfSpeech}
                  </span>
                )}
              </div>
              <p className="text-base leading-relaxed" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {translation}
              </p>
              {example && (
                <div 
                  className="mt-3 pt-3 border-t"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <p 
                    className="text-xs italic leading-relaxed"
                    style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                  >
                    "{example}"
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-all"
              style={{ color: 'rgba(255, 255, 255, 0.5)' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handlePlayAudio}
              disabled={isPlaying}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 font-medium text-sm"
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)'
              }}
            >
              <Volume2 className="w-4 h-4" />
              <span>{isPlaying ? 'Playing...' : 'Listen'}</span>
            </button>

            <button
              onClick={handleAddToDictionary}
              disabled={isAdded}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border transition-all hover:scale-[1.02] active:scale-[0.98] font-medium text-sm disabled:opacity-50"
              style={{
                borderColor: isAdded ? '#10b981' : 'rgba(255, 255, 255, 0.2)',
                color: isAdded ? '#10b981' : 'white',
                backgroundColor: isAdded ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
              }}
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

        <style>{`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-10px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}</style>
      </div>
    </>
  );
};
