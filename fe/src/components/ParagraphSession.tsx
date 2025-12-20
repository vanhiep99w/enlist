import { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { BookOpen } from 'lucide-react';
import { createSession, getSession, submitSentenceTranslation, skipSentence } from '../api/sessionApi';
import { translateWord, saveWordToDictionary } from '../api/dictionaryApi';
import { ScoreBreakdown } from './ScoreBreakdown';
import { FeedbackPanel } from './FeedbackPanel';
import { TypingIndicator } from './TypingIndicator';
import { DictionaryModal } from './DictionaryModal';
import { DictionaryPanel } from './DictionaryPanel';
import { WordPopup } from './WordPopup';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { SentenceTooltip } from './SentenceTooltip';
import { SuccessAnimation } from './SuccessAnimation';
import { Tooltip } from './Tooltip';
import { AutoResizeTextarea, type AutoResizeTextareaRef } from './AutoResizeTextarea';
import { useTextSelection } from '../hooks/useTextSelection';
import type { Session, SentenceSubmissionResponse, CompletedSentenceData } from '../types/session';

const SIDEBAR_COLLAPSED_KEY = 'sidebarCollapsed';

interface Props {
  paragraphId: number;
}

export function ParagraphSession({ paragraphId }: Props) {
  const navigate = useNavigate();
  const textareaRef = useRef<AutoResizeTextareaRef>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userTranslation, setUserTranslation] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSubmission, setLastSubmission] = useState<SentenceSubmissionResponse | null>(null);
  const [retryingSubmission, setRetryingSubmission] = useState<SentenceSubmissionResponse | null>(null);
  const [previousAttempt, setPreviousAttempt] = useState<SentenceSubmissionResponse | null>(null);
  const [completedData, setCompletedData] = useState<Record<number, CompletedSentenceData>>({});
  const [hoveredSentence, setHoveredSentence] = useState<number | null>(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showDictionary, setShowDictionary] = useState(false);
  const [showDictionaryPanel, setShowDictionaryPanel] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [wordPopup, setWordPopup] = useState<{ word: string; translation: string; partOfSpeech?: string; example?: string; position: { x: number; y: number } } | null>(null);
  const [isTranslatingWord, setIsTranslatingWord] = useState(false);
  const paragraphRef = useRef<HTMLDivElement>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
    }
    return false;
  });

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const newValue = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(newValue));
      return newValue;
    });
  };

  useEffect(() => {
    initSession();
  }, [paragraphId]);

  useEffect(() => {
    if (session && !isLoading && session.status !== 'COMPLETED') {
      textareaRef.current?.focus();
    }
  }, [isLoading, session?.status]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        if (lastSubmission) {
          if (lastSubmission.accuracy >= 80) {
            setLastSubmission(null);
            setPreviousAttempt(null);
            setUserTranslation('');
            setTimeout(() => textareaRef.current?.focus(), 0);
          } else {
            setLastSubmission(null);
            setRetryingSubmission(null);
            setPreviousAttempt(null);
            setUserTranslation('');
            setTimeout(() => textareaRef.current?.focus(), 0);
          }
        }
      }
      if (e.ctrlKey && e.key === "'") {
        e.preventDefault();
        if (lastSubmission && lastSubmission.accuracy >= 80) {
          setPreviousAttempt(lastSubmission);
          setRetryingSubmission(lastSubmission);
          setLastSubmission(null);
          setUserTranslation('');
          setTimeout(() => textareaRef.current?.focus(), 0);
        }
      }
      // Ctrl+D to toggle Dictionary
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        setShowDictionary(prev => !prev);
      }
      // ? key to toggle Keyboard Shortcuts help
      if (e.key === '?' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        setShowShortcuts(prev => !prev);
      }
      // Ctrl+B to toggle Dictionary Panel
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        setShowDictionaryPanel(prev => !prev);
      }
      // Escape to close modals
      if (e.key === 'Escape') {
        if (showShortcuts) setShowShortcuts(false);
        if (showDictionary) setShowDictionary(false);
        if (showDictionaryPanel) setShowDictionaryPanel(false);
        if (wordPopup) {
          setWordPopup(null);
          window.getSelection()?.removeAllRanges();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lastSubmission, showShortcuts, showDictionary, showDictionaryPanel, wordPopup]);

  // Text selection for word popup
  useTextSelection({
    containerRef: paragraphRef as React.RefObject<HTMLElement>,
    minLength: 2,
    onSelect: async (sel) => {
      if (isTranslatingWord) return;
      
      setIsTranslatingWord(true);
      try {
        const result = await translateWord(sel.text);
        setWordPopup({
          word: result.word,
          translation: result.translation,
          partOfSpeech: result.partOfSpeech,
          example: result.example,
          position: sel,
        });
      } catch (error) {
        console.error('Failed to translate word:', error);
      } finally {
        setIsTranslatingWord(false);
      }
    },
  });

  const handleAddToDictionary = async (word: string, translation: string, context?: string) => {
    if (!session) return;
    
    try {
      await saveWordToDictionary(1, { // TODO: Get actual userId
        word,
        translation,
        context,
        sessionId: session.id,
      });
    } catch (error) {
      console.error('Failed to save word:', error);
    }
  };

  const initSession = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const newSession = await createSession(paragraphId);
      setSession(newSession);
      
      // Load completedData from backend
      if (newSession.completedSentenceDetails) {
        setCompletedData(newSession.completedSentenceDetails);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!session || !userTranslation.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const isRetry = retryingSubmission !== null;
      const result = await submitSentenceTranslation(
        session.id, 
        userTranslation,
        isRetry ? { isRetry: true, parentSubmissionId: retryingSubmission.id } : undefined
      );
      setLastSubmission(result);
      setRetryingSubmission(null);
      
      const updatedSession = await getSession(session.id);
      
      const passedThreshold = result.accuracy >= 80;
      
      if (passedThreshold && !isRetry) {
        setShowSuccessAnimation(true);
        const newCompletedData = {
          ...completedData,
          [result.sentenceIndex]: {
            correctTranslation: result.correctTranslation || userTranslation,
            userTranslation: userTranslation,
            originalSentence: result.originalSentence,
            accuracy: result.accuracy,
            errors: result.feedback?.errors?.map(e => ({
              type: e.type,
              quickFix: e.quickFix,
              correction: e.correction
            })) || []
          }
        };
        setCompletedData(newCompletedData);
        
        if (result.isLastSentence) {
          setSession(prev => prev ? { ...updatedSession, status: 'COMPLETED' } : null);
        } else {
          setSession(updatedSession);
        }
      } else {
        setSession(updatedSession);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit translation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setLastSubmission(null);
    setRetryingSubmission(null);
    setPreviousAttempt(null);
    setUserTranslation('');
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleOptionalRetry = () => {
    if (!lastSubmission) return;
    setPreviousAttempt(lastSubmission);
    setRetryingSubmission(lastSubmission);
    setLastSubmission(null);
    setUserTranslation('');
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleSkip = async () => {
    if (!session) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const result = await skipSentence(session.id);
      setLastSubmission(result);
      
      if (!result.isLastSentence) {
        const updatedSession = await getSession(session.id);
        setSession(updatedSession);
      } else {
        setSession(prev => prev ? { ...prev, status: 'COMPLETED' } : null);
      }
      setUserTranslation('');
      setTimeout(() => textareaRef.current?.focus(), 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to skip sentence');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextSentence = () => {
    setLastSubmission(null);
    setPreviousAttempt(null);
    setUserTranslation('');
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleQuit = () => {
    navigate({ to: '/paragraphs' });
  };

  const renderHighlightedParagraph = () => {
    if (!session) return null;
    
    const retryingSentenceIndex = retryingSubmission?.sentenceIndex;
    
    // Split long sentences into smaller chunks for better readability
    const splitIntoChunks = (sentences: string[]) => {
      const chunks: string[][] = [];
      let currentChunk: string[] = [];
      let currentLength = 0;
      const MAX_CHUNK_LENGTH = 300; // Characters per paragraph chunk
      
      sentences.forEach((sentence) => {
        const sentenceLength = sentence.length;
        
        if (currentLength + sentenceLength > MAX_CHUNK_LENGTH && currentChunk.length > 0) {
          chunks.push(currentChunk);
          currentChunk = [sentence];
          currentLength = sentenceLength;
        } else {
          currentChunk.push(sentence);
          currentLength += sentenceLength;
        }
      });
      
      if (currentChunk.length > 0) {
        chunks.push(currentChunk);
      }
      
      return chunks;
    };
    
    const chunks = splitIntoChunks(session.allSentences);
    let sentenceIndex = 0;
    
    return (
      <div className="space-y-3">
        {chunks.map((chunk, chunkIdx) => (
          <div key={chunkIdx} className="leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            {chunk.map((sentence) => {
              const index = sentenceIndex++;
              return renderSentence(sentence, index, retryingSentenceIndex);
            })}
          </div>
        ))}
      </div>
    );
  };

  const renderSentence = (sentence: string, index: number, retryingSentenceIndex: number | undefined) => {
    if (!session) return null;
    
    const isRetryingSentence = retryingSentenceIndex !== undefined && index === retryingSentenceIndex;
    const isCurrentSentence = index === session.currentSentenceIndex && !retryingSubmission;
    const isCompleted = index < session.currentSentenceIndex && !isRetryingSentence;
    const data = completedData[index];
    
    if (isCompleted && data) {
      const trimmed = data.correctTranslation.trim();
      const needsPunctuation = !/[.!?]$/.test(trimmed);
      const displayText = needsPunctuation ? `${trimmed}.` : trimmed;
      const hasErrors = data.errors.length > 0;
      const userDiffersFromCorrect = data.userTranslation.toLowerCase().trim() !== data.correctTranslation.toLowerCase().trim();
      
      return (
        <span
          key={index}
          className="text-green-400 cursor-help relative inline"
          onMouseEnter={() => setHoveredSentence(index)}
          onMouseLeave={() => setHoveredSentence(null)}
        >
          {displayText}{' '}
          {hoveredSentence === index && (
            <SentenceTooltip>
            {/* Accuracy */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Accuracy:</span>
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                data.accuracy >= 90 ? 'bg-green-900 text-green-300' :
                data.accuracy >= 80 ? 'bg-yellow-900 text-yellow-300' :
                'bg-red-900 text-red-300'
              }`}>
                {Math.round(data.accuracy)}%
              </span>
            </div>
            
            {/* Original Vietnamese */}
            <div className="mb-2">
              <span className="text-xs block" style={{ color: 'var(--color-text-muted)' }}>Original:</span>
              <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{data.originalSentence}</span>
            </div>
            
            {/* User's input if different */}
            {userDiffersFromCorrect && (
              <div className="mb-2">
                <span className="text-xs block" style={{ color: 'var(--color-text-muted)' }}>Your input:</span>
                <span className="text-orange-400 text-xs line-through">{data.userTranslation}</span>
              </div>
            )}
            
            {/* Errors */}
            {hasErrors && (
              <div>
                <span className="text-xs block mb-1" style={{ color: 'var(--color-text-muted)' }}>Corrections:</span>
                {data.errors.slice(0, 3).map((err, i) => (
                  <div key={i} className="text-xs flex items-start gap-1 mb-0.5">
                    <span className={`px-1 rounded text-[10px] ${
                      err.type === 'GRAMMAR' ? 'bg-purple-900 text-purple-300' :
                      err.type === 'WORD_CHOICE' ? 'bg-blue-900 text-blue-300' :
                      'bg-orange-900 text-orange-300'
                    }`}>
                      {err.type === 'GRAMMAR' ? 'G' : err.type === 'WORD_CHOICE' ? 'W' : 'N'}
                    </span>
                    <span style={{ color: 'var(--color-text-secondary)' }}>{err.quickFix || err.correction}</span>
                  </div>
                ))}
                {data.errors.length > 3 && (
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>+{data.errors.length - 3} more</span>
                )}
              </div>
            )}
          </SentenceTooltip>
          )}
        </span>
      );
    }
    
    // For completed sentences without detailed data, use completedTranslations from backend
    if (isCompleted && session.completedTranslations[index]) {
      const translation = session.completedTranslations[index];
      const trimmed = translation.trim();
      const needsPunctuation = !/[.!?]$/.test(trimmed);
      const displayText = needsPunctuation ? `${trimmed}.` : trimmed;
      const originalSentence = session.allSentences[index];
      
      return (
        <span 
          key={index} 
          className="text-green-400 cursor-help relative inline"
          onMouseEnter={() => setHoveredSentence(index)}
          onMouseLeave={() => setHoveredSentence(null)}
        >
          {displayText}{' '}
          {hoveredSentence === index && (
            <SentenceTooltip>
              <div className="mb-2">
                <span className="text-xs block" style={{ color: 'var(--color-text-muted)' }}>Original:</span>
                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{originalSentence}</span>
              </div>
              <div className="text-xs italic" style={{ color: 'var(--color-text-muted)' }}>
                (Detailed feedback not available for this sentence)
              </div>
            </SentenceTooltip>
          )}
        </span>
      );
    }
    
    return (
      <span
        key={index}
        className={`${
          isCurrentSentence || isRetryingSentence
            ? 'text-orange-400 font-semibold'
            : ''
        }`}
        style={!(isCurrentSentence || isRetryingSentence) ? { color: 'var(--color-text-secondary)' } : undefined}
      >
        {sentence}{' '}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface-dark)' }}>
        <svg className="animate-spin h-12 w-12 text-blue-500" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface-dark)' }}>
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-6 max-w-md">
          <p className="text-red-300">{error}</p>
          <button
            onClick={() => navigate({ to: '/paragraphs' })}
            className="mt-4 px-4 py-2 rounded-lg hover:opacity-80"
            style={{ backgroundColor: 'var(--color-surface-light)', color: 'var(--color-text-primary)' }}
          >
            Back to Paragraphs
          </button>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const progressPercent = (session.completedSentences / session.totalSentences) * 100;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface-dark)' }}>
      {/* Success Animation */}
      <SuccessAnimation
        show={showSuccessAnimation}
        accuracy={lastSubmission?.accuracy || 0}
        onComplete={() => setShowSuccessAnimation(false)}
      />
      
      {/* Compact Header */}
      <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Title + Sentence counter */}
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-base font-display font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>{session.paragraphTitle}</h1>
            <span className="text-xs px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--color-surface-light)', color: 'var(--color-text-muted)' }}>
              {session.currentSentenceIndex + 1}/{session.totalSentences}
            </span>
          </div>
          
          {/* Right: Compact progress bar */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Dictionary Button */}
              <button
                onClick={() => setShowDictionaryPanel(true)}
                className="p-2 rounded-lg transition-all hover:scale-110 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                  boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)',
                }}
                title="Open Dictionary (Ctrl+B)"
              >
                <BookOpen className="w-5 h-5 text-white" />
              </button>
              
              <div className="hidden sm:flex items-center gap-2 w-32">
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface-light)' }}>
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-emerald-400">{Math.round(progressPercent)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-2">
          {session.status === 'COMPLETED' ? (
            <div className="rounded-lg p-8 text-center" style={{ backgroundColor: 'var(--color-surface)' }}>
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Session Complete!</h2>
              <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                You've completed all {session.totalSentences} sentences
              </p>
              <div className="flex justify-center gap-8 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">{session.totalPoints}</div>
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Total Points</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">{session.averageAccuracy.toFixed(1)}%</div>
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Average Accuracy</div>
              </div>
            </div>
            <button
              onClick={() => navigate({ to: '/paragraphs' })}
              className="px-6 py-3 bg-blue-600 rounded-lg font-medium hover:bg-blue-700"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Back to Paragraphs
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Column - Exercise (Redesigned for long content) */}
            <div className="flex flex-col gap-3" style={{ height: 'calc(100vh - 90px)' }}>
              {/* Paragraph Display - Compact with auto height */}
              <div 
                className="rounded-xl overflow-hidden relative"
                style={{ 
                  backgroundColor: 'var(--color-surface)', 
                  borderColor: 'var(--color-border)', 
                  borderWidth: '1px', 
                  borderStyle: 'solid',
                  maxHeight: 'calc(100vh - 300px)'
                }}
              >
                {/* Scrollable content */}
                <div 
                  ref={paragraphRef}
                  className="overflow-y-auto p-4 pr-3 custom-scrollbar"
                  style={{ scrollBehavior: 'smooth' }}
                >
                  {renderHighlightedParagraph()}
                </div>
              </div>

              {/* Translation Input - Always visible, fixed at bottom */}
              <div 
                className="shrink-0 rounded-xl p-4 relative overflow-hidden"
                style={{ 
                  backgroundColor: 'var(--color-surface)', 
                  borderColor: 'var(--color-border)', 
                  borderWidth: '1px', 
                  borderStyle: 'solid',
                  boxShadow: '0 -4px 20px -4px rgba(0, 0, 0, 0.3)'
                }}
              >
                {/* Subtle gradient accent */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-cyan-500/50" />
                
                {/* Current sentence indicator - more compact */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--color-surface-light)', color: 'var(--color-text-secondary)' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                    Sentence {session.currentSentenceIndex + 1}
                  </div>
                  <span className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                    {session.allSentences[session.currentSentenceIndex]?.slice(0, 40)}...
                  </span>
                </div>
                
                <AutoResizeTextarea
                  ref={textareaRef}
                  placeholder="Type your English translation here... (Ctrl+Enter to submit)"
                  value={userTranslation}
                  onChange={(e) => setUserTranslation(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.ctrlKey && e.key === 'Enter' && userTranslation.trim() && !isSubmitting && !lastSubmission) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  disabled={isSubmitting || lastSubmission !== null}
                  minRows={1}
                  maxRows={3}
                  optimalRange={{ min: 30, max: 150 }}
                />

                {error && (
                  <div className="mt-3 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-between mt-3">
                  <button
                    onClick={handleQuit}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:opacity-80 text-sm transition-all"
                    style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }}
                  >
                    ← Quit
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSkip}
                      disabled={isSubmitting || session.totalCredits <= 0}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-all"
                      style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }}
                    >
                      💡 Hint
                    </button>
                    
                    {lastSubmission ? (
                      lastSubmission.accuracy >= 80 ? (
                        <div className="flex gap-2">
                          <Tooltip content={<span className="flex items-center gap-2"><kbd className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: 'var(--color-surface-light)' }}>Ctrl+'</kbd> Practice again</span>}>
                            <button
                              onClick={handleOptionalRetry}
                              className="flex items-center gap-2 px-3 py-2 bg-purple-600 rounded-lg font-medium hover:bg-purple-700 text-sm"
                              style={{ color: 'var(--color-text-primary)' }}
                            >
                              🔄 Retry
                            </button>
                          </Tooltip>
                          <Tooltip content={<span className="flex items-center gap-2"><kbd className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: 'var(--color-surface-light)' }}>Ctrl+↵</kbd> Continue</span>}>
                            <button
                              onClick={handleNextSentence}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg font-medium hover:bg-green-700 text-sm"
                              style={{ color: 'var(--color-text-primary)' }}
                            >
                              Next →
                            </button>
                          </Tooltip>
                        </div>
                      ) : (
                        <Tooltip content={<span className="flex items-center gap-2"><kbd className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: 'var(--color-surface-light)' }}>Ctrl+↵</kbd> Try again</span>}>
                          <button
                            onClick={handleRetry}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border font-medium transition-all text-sm"
                            style={{ 
                              backgroundColor: 'var(--color-accent)', 
                              color: 'var(--color-text-primary)',
                              borderColor: 'var(--color-accent-dark)'
                            }}
                          >
                            🔄 Retry (80%+)
                          </button>
                        </Tooltip>
                      )
                    ) : retryingSubmission ? (
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !userTranslation.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            ...
                          </>
                        ) : (
                          <>Retry #{retryingSubmission.retryAttempt + 2}</>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !userTranslation.trim()}
                        className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg font-medium hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-lg shadow-blue-500/25 transition-all"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Checking...
                          </>
                        ) : (
                          <>Submit</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Feedback */}
            <div className="space-y-4 lg:max-h-[calc(100vh-90px)] lg:overflow-y-auto custom-scrollbar">
              {/* Feedback Panel */}
              {isSubmitting ? (
                <TypingIndicator 
                  message="AI is thinking..." 
                  submessage="Analyzing your translation" 
                />
              ) : lastSubmission?.feedback ? (
                <div className="space-y-4">
                  {/* Retry Comparison */}
                  {lastSubmission.retryAttempt > 0 && previousAttempt && (
                    <div className="bg-purple-900/30 border border-purple-700 rounded-lg px-3 py-2 flex items-center justify-between">
                      <span className="text-purple-300 text-sm">🔄 Retry #{lastSubmission.retryAttempt}</span>
                      <div className="flex items-center gap-3 text-sm">
                        <span className={previousAttempt.accuracy >= 80 ? 'text-green-400' : 'text-gray-400'}>
                          {Math.round(previousAttempt.accuracy)}%
                        </span>
                        <span style={{ color: 'var(--color-text-muted)' }}>→</span>
                        <span className={`font-bold ${lastSubmission.accuracy >= 80 ? 'text-green-400' : 'text-orange-400'}`}>
                          {Math.round(lastSubmission.accuracy)}%
                        </span>
                        {lastSubmission.accuracy !== previousAttempt.accuracy && (
                          <span className={lastSubmission.accuracy > previousAttempt.accuracy ? 'text-green-400' : 'text-red-400'}>
                            {lastSubmission.accuracy > previousAttempt.accuracy ? '+' : ''}{Math.round(lastSubmission.accuracy - previousAttempt.accuracy)}%
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  <ScoreBreakdown
                    scores={{
                      grammarScore: lastSubmission.grammarScore,
                      wordChoiceScore: lastSubmission.wordChoiceScore,
                      naturalnessScore: lastSubmission.naturalnessScore,
                      overallScore: Math.round(lastSubmission.accuracy),
                    }}
                  />
                  <FeedbackPanel feedback={lastSubmission.feedback} userTranslation={lastSubmission.userTranslation} />
                </div>
              ) : lastSubmission?.skipped ? (
                <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderWidth: '1px', borderStyle: 'solid' }}>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>Sentence Skipped</h3>
                  <p style={{ color: 'var(--color-text-muted)' }}>You used 1 credit to skip this sentence.</p>
                </div>
              ) : (
                <div className="backdrop-blur-sm rounded-2xl p-8 text-center relative overflow-hidden group" style={{ backgroundColor: 'var(--color-card-translucent)', border: '1px solid var(--color-border)' }}>
                  {/* Decorative background elements */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-2xl group-hover:opacity-70 transition-all duration-500" style={{ backgroundColor: 'var(--color-accent)', opacity: 0.1 }} />
                    <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full blur-2xl group-hover:opacity-70 transition-all duration-500" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.1 }} />
                  </div>
                  
                  {/* Animated illustration */}
                  <div className="relative mb-6">
                    <svg className="w-20 h-20 mx-auto" viewBox="0 0 80 80" fill="none">
                      {/* Chat bubble base */}
                      <rect x="10" y="20" width="45" height="32" rx="8" style={{ fill: 'var(--color-card-solid)', stroke: 'var(--color-border)' }} strokeWidth="1.5" />
                      <circle cx="22" cy="36" r="3" style={{ fill: 'var(--color-text-muted)' }} className="animate-pulse" />
                      <circle cx="32" cy="36" r="3" style={{ fill: 'var(--color-text-muted)' }} className="animate-pulse" />
                      <circle cx="42" cy="36" r="3" style={{ fill: 'var(--color-text-muted)' }} className="animate-pulse" />
                      {/* Arrow pointing to bubble */}
                      <path d="M10 46 L6 52 L14 52 Z" style={{ fill: 'var(--color-card-solid)' }} />
                      
                      {/* Decorative sparkles */}
                      <circle cx="62" cy="28" r="2" style={{ fill: 'var(--color-accent)', opacity: 0.6 }} className="animate-sparkle" />
                      <circle cx="68" cy="38" r="1.5" style={{ fill: 'var(--color-primary)', opacity: 0.6 }} className="animate-sparkle" />
                      <path d="M58 45 L60 48 L58 51 L55 48 Z" style={{ fill: 'var(--color-accent)', opacity: 0.4 }} className="animate-sparkle" />
                    </svg>
                  </div>
                  
                  <h3 className="text-lg font-display font-semibold mb-2 relative" style={{ color: 'var(--color-text-primary)' }}>
                    Awaiting Your Translation
                  </h3>
                  <p className="text-sm relative max-w-xs mx-auto" style={{ color: 'var(--color-text-muted)' }}>
                    Type your translation and submit to receive AI-powered feedback
                  </p>
                  
                  {/* Keyboard hint */}
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs relative" style={{ color: 'var(--color-text-muted)' }}>
                    <kbd className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border)', borderWidth: '1px', borderStyle: 'solid', color: 'var(--color-text-secondary)' }}>Ctrl</kbd>
                    <span>+</span>
                    <kbd className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border)', borderWidth: '1px', borderStyle: 'solid', color: 'var(--color-text-secondary)' }}>Enter</kbd>
                    <span style={{ color: 'var(--color-text-muted)' }}>to submit</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <DictionaryModal isOpen={showDictionary} onClose={() => setShowDictionary(false)} />
      <KeyboardShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />

      {/* Keyboard shortcuts hint */}
      {session && session.status !== 'COMPLETED' && (
        <div className="fixed bottom-4 right-4 z-30 hidden md:block">
          <button
            onClick={() => setShowShortcuts(true)}
            className="text-xs transition-colors flex items-center gap-1"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Press <kbd className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderWidth: '1px', borderStyle: 'solid' }}>?</kbd> for shortcuts
          </button>
        </div>
      )}

      {/* Floating Sidebar - Premium Glass Design */}
      {session && (
        <div className={`fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-40 hidden md:flex transition-all duration-300 ${sidebarCollapsed ? 'translate-x-[calc(100%-12px)]' : ''}`}>
          {/* Collapse/Expand Toggle */}
          <button
            onClick={toggleSidebar}
            className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-16 backdrop-blur-xl rounded-l-2xl flex items-center justify-center transition-all duration-300 shadow-xl group"
            style={{ 
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)'
            }}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg 
              className={`w-4 h-4 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          
          {/* Dictionary Button - Premium Card */}
          <button 
            onClick={() => setShowDictionary(true)}
            className="group relative flex flex-col items-center justify-center gap-2 p-5 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/30 ring-1 ring-white/5 transition-all duration-300 hover:scale-105 hover:border-violet-500/50 hover:shadow-violet-500/20 overflow-hidden"
            style={{ 
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)'
            }}
            title="Dictionary (Ctrl+D)"
          >
            {/* Hover gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/0 via-violet-600/0 to-purple-600/0 group-hover:from-violet-600/10 group-hover:via-violet-600/5 group-hover:to-purple-600/10 transition-all duration-300 rounded-3xl" />
            
            {/* Icon container with glow */}
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 flex items-center justify-center group-hover:from-violet-500/30 group-hover:to-purple-500/20 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-violet-500/20">
              <svg className="w-6 h-6 text-violet-400 group-hover:text-violet-300 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M8 7h8M8 11h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            
            <span className={`text-xs font-medium group-hover:text-violet-300 transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`} style={{ color: 'var(--color-text-secondary)' }}>
              Dictionary
            </span>
            
            {/* Keyboard shortcut hint */}
            <div className={`absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] opacity-0 group-hover:opacity-100 transition-opacity ${sidebarCollapsed ? 'hidden' : ''}`} style={{ backgroundColor: 'var(--color-surface-dark)', color: 'var(--color-text-muted)' }}>
              Ctrl+D
            </div>
          </button>
          
          {/* Accuracy Display - Premium Card */}
          <div 
            className="group relative flex flex-col items-center justify-center p-5 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/30 ring-1 ring-white/5 transition-all duration-300 hover:scale-105 hover:border-emerald-500/50 hover:shadow-emerald-500/20 overflow-hidden"
            style={{ 
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)'
            }}
            title="Session Accuracy"
          >
            {/* Hover gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/0 via-emerald-600/0 to-teal-600/0 group-hover:from-emerald-600/10 group-hover:via-emerald-600/5 group-hover:to-teal-600/10 transition-all duration-300 rounded-3xl" />
            
            {/* Circular progress ring */}
            <div className="relative w-14 h-14">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                <circle 
                  cx="28" 
                  cy="28" 
                  r="24" 
                  fill="none" 
                  style={{ stroke: 'var(--color-surface-light)' }}
                  strokeWidth="4" 
                />
                <circle 
                  cx="28" 
                  cy="28" 
                  r="24" 
                  fill="none" 
                  className="stroke-emerald-500 transition-all duration-700 ease-out"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${session.averageAccuracy * 1.51} 151`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors">
                  {session.averageAccuracy.toFixed(0)}%
                </span>
              </div>
            </div>
            
            <span className={`text-xs font-medium mt-2 group-hover:text-emerald-300 transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 scale-0 h-0 mt-0' : 'opacity-100 scale-100'}`} style={{ color: 'var(--color-text-secondary)' }}>
              Accuracy
            </span>
          </div>
        </div>
      )}

      {/* Mobile Bottom Bar - Dictionary & Accuracy */}
      {session && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-3 z-40 md:hidden">
          <button 
            onClick={() => setShowDictionary(true)}
            className="flex items-center gap-2.5 px-5 py-2.5 backdrop-blur-xl rounded-2xl shadow-xl shadow-black/30 ring-1 ring-white/5 active:scale-95 transition-all"
            style={{ 
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)'
            }}
            title="Dictionary (Ctrl+D)"
          >
            <span className="text-lg">📖</span>
            <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Dictionary</span>
          </button>
          <div 
            className="flex items-center gap-2.5 px-5 py-2.5 backdrop-blur-xl rounded-2xl shadow-xl shadow-black/30 ring-1 ring-white/5"
            style={{ 
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)'
            }}
          >
            <div className="w-7 h-7 rounded-full bg-emerald-500/10 border-2 border-emerald-500/60 flex items-center justify-center">
              <span className="text-emerald-400 text-[10px] font-bold">
                {session.averageAccuracy.toFixed(0)}%
              </span>
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Accuracy</span>
          </div>
        </div>
      )}

      {/* Dictionary Modal (old) */}
      <DictionaryModal isOpen={showDictionary} onClose={() => setShowDictionary(false)} />

      {/* Word Popup */}
      {wordPopup && (
        <WordPopup
          word={wordPopup.word}
          translation={wordPopup.translation}
          partOfSpeech={wordPopup.partOfSpeech}
          example={wordPopup.example}
          position={wordPopup.position}
          onClose={() => {
            setWordPopup(null);
            window.getSelection()?.removeAllRanges();
          }}
          onAddToDictionary={handleAddToDictionary}
        />
      )}

      {/* Dictionary Panel */}
      <DictionaryPanel
        isOpen={showDictionaryPanel}
        onClose={() => setShowDictionaryPanel(false)}
        userId={1} // TODO: Get actual userId
      />
    </div>
  );
}
