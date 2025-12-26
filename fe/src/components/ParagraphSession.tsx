import { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { BookOpen, History, LogOut, Trophy, Clock, Target } from 'lucide-react';
import { toast } from 'sonner';
import { ScoreBreakdown } from './ScoreBreakdown';
import { FeedbackPanel } from './FeedbackPanel';
import { TypingIndicator } from './TypingIndicator';
import { DictionaryPanel } from './DictionaryPanel';
import { WordPopup } from './WordPopup';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { SentenceTooltip } from './SentenceTooltip';
import { SuccessAnimation } from './SuccessAnimation';
import { AchievementUnlockModal } from './AchievementUnlockModal';
import { ParagraphSummaryModal } from './ParagraphSummaryModal';
import { PreviousAttemptsModal } from './PreviousAttemptsModal';
import { Tooltip } from './Tooltip';
import { TooltipProvider } from './ui/tooltip';
import { AutoResizeTextarea, type AutoResizeTextareaRef } from './AutoResizeTextarea';
import { useTextSelection } from '../hooks/useTextSelection';
import { useAuth } from '../contexts/AuthContext';
import {
  useCreateSession,
  useSession,
  useSubmitSentenceTranslation,
  useSkipSentence,
  useRandomSession,
  useEndRandomSession,
} from '../hooks/useSession';
import { generateNextParagraph } from '../api/sessionApi';
import type { SentenceSubmissionResponse, CompletedSentenceData } from '../types/session';
import type { Achievement } from '../types/user';

const SIDEBAR_COLLAPSED_KEY = 'sidebarCollapsed';

interface Props {
  paragraphId?: number;
  sessionId?: number;
  randomSessionId?: number;
}

export function ParagraphSession({
  paragraphId,
  sessionId: providedSessionId,
  randomSessionId,
}: Props) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const textareaRef = useRef<AutoResizeTextareaRef>(null);
  const isRandomMode = !!randomSessionId;

  // React Query hooks
  const createSessionMutation = useCreateSession();
  const [sessionId, setSessionId] = useState<number | null>(null);
  const {
    data: session,
    isLoading,
    error: sessionError,
    refetch: refetchSession,
  } = useSession(sessionId || 0);
  const submitTranslationMutation = useSubmitSentenceTranslation();
  const skipSentenceMutation = useSkipSentence();

  // Random session hooks
  const { data: randomSession } = useRandomSession(randomSessionId || 0);
  const endRandomSessionMutation = useEndRandomSession();

  // Local state
  const [userTranslation, setUserTranslation] = useState('');
  const [lastSubmission, setLastSubmission] = useState<SentenceSubmissionResponse | null>(null);
  const [retryingSubmission, setRetryingSubmission] = useState<SentenceSubmissionResponse | null>(
    null
  );
  const [previousAttempt, setPreviousAttempt] = useState<SentenceSubmissionResponse | null>(null);
  const [completedData, setCompletedData] = useState<Record<number, CompletedSentenceData>>({});
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showDictionaryPanel, setShowDictionaryPanel] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [wordPopup, setWordPopup] = useState<{
    word: string;
    position: { x: number; y: number };
  } | null>(null);
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showPreviousAttempts, setShowPreviousAttempts] = useState(false);
  const paragraphRef = useRef<HTMLDivElement>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
    }
    return false;
  });

  // Random Mode state
  const [isGeneratingNext, setIsGeneratingNext] = useState(false);
  const [nextGenError, setNextGenError] = useState<string | null>(null);
  const [sessionStartTime] = useState(Date.now());
  const isMountedRef = useRef(true);
  const generationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle page refresh - persist state to sessionStorage
  useEffect(() => {
    if (!isRandomMode || !randomSessionId) return;

    const storageKey = `random-session-${randomSessionId}`;

    // Restore state on mount
    const savedState = sessionStorage.getItem(storageKey);
    if (savedState) {
      try {
        const { timestamp } = JSON.parse(savedState);
        // Clear stale state (older than 1 hour)
        if (Date.now() - timestamp > 3600000) {
          sessionStorage.removeItem(storageKey);
        }
      } catch {
        sessionStorage.removeItem(storageKey);
      }
    }

    // Save state on unmount/refresh
    const handleBeforeUnload = () => {
      sessionStorage.setItem(
        storageKey,
        JSON.stringify({
          timestamp: Date.now(),
          paragraphId,
        })
      );
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isRandomMode, randomSessionId, paragraphId]);

  // Detect multiple tabs
  useEffect(() => {
    if (!isRandomMode || !randomSessionId) return;

    const channelKey = `random-session-channel-${randomSessionId}`;
    const channel = new BroadcastChannel(channelKey);

    // Announce this tab's presence
    channel.postMessage({ type: 'ping', tabId: sessionStartTime });

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'ping' && event.data.tabId !== sessionStartTime) {
        toast.warning('Multiple Tabs Detected', {
          description: 'This session is open in another tab. Progress may conflict.',
        });
      }
    };

    channel.addEventListener('message', handleMessage);

    return () => {
      channel.close();
    };
  }, [isRandomMode, randomSessionId, sessionStartTime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;

      // Clear any pending generation timeout
      if (generationTimeoutRef.current) {
        clearTimeout(generationTimeoutRef.current);
      }
    };
  }, []);

  const error = sessionError?.message || null;
  const isSubmitting = submitTranslationMutation.isPending || skipSentenceMutation.isPending;

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const newValue = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(newValue));
      return newValue;
    });
  };

  // Initialize session
  useEffect(() => {
    // If sessionId is provided (random session), use it directly
    if (providedSessionId) {
      setSessionId(providedSessionId);
      return;
    }

    // Otherwise create a new session
    if (!paragraphId) return;

    const initSession = async () => {
      try {
        const newSession = await createSessionMutation.mutateAsync(paragraphId);
        setSessionId(newSession.id);

        // Load completedData from backend
        if (newSession.completedSentenceDetails) {
          setCompletedData(newSession.completedSentenceDetails);
        }
      } catch (err) {
        toast.error('Failed to start session', {
          description: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    };

    initSession();
  }, [paragraphId, providedSessionId]);

  useEffect(() => {
    if (session && !isLoading && session.status !== 'COMPLETED') {
      textareaRef.current?.focus();
    }
  }, [isLoading, session?.status]);

  // Auto-generate next paragraph in random mode when session completes
  useEffect(() => {
    if (isRandomMode && session?.status === 'COMPLETED' && randomSessionId && !isGeneratingNext) {
      const autoGenerateNext = async () => {
        setIsGeneratingNext(true);
        try {
          console.log('🎲 Generating next paragraph for random session:', randomSessionId);
          const updatedSession = await generateNextParagraph(randomSessionId);
          console.log('✅ Generated session:', updatedSession);
          console.log('📝 Current paragraph:', updatedSession.currentParagraph);

          if (updatedSession.currentParagraph?.paragraphSessionId) {
            const newSessionId = updatedSession.currentParagraph.paragraphSessionId;
            console.log('➡️ Navigating to new paragraph session:', newSessionId);

            // Navigate to the new paragraph session
            navigate({
              to: '/session/$paragraphId',
              params: { paragraphId: String(newSessionId) },
              search: { randomSessionId },
            });
          } else {
            console.error('❌ No paragraphSessionId in current paragraph');
          }
        } catch (err) {
          console.error('Failed to generate next paragraph:', err);
          toast.error('Failed to load next paragraph');
        } finally {
          setIsGeneratingNext(false);
        }
      };

      // Small delay to show completion animation
      const timeout = setTimeout(autoGenerateNext, 1500);
      return () => clearTimeout(timeout);
    }
  }, [session?.status, isRandomMode, randomSessionId, isGeneratingNext, navigate]);

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
      // Ctrl+D to toggle Dictionary Panel (My Dictionary)
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        setShowDictionaryPanel((prev) => !prev);
      }
      // ? key to toggle Keyboard Shortcuts help
      if (e.key === '?' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
      }
      // Ctrl+B to toggle Dictionary Panel
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        setShowDictionaryPanel((prev) => !prev);
      }
      // Escape to close modals
      if (e.key === 'Escape') {
        if (showShortcuts) setShowShortcuts(false);
        if (showDictionaryPanel) setShowDictionaryPanel(false);
        if (wordPopup) {
          setWordPopup(null);
          window.getSelection()?.removeAllRanges();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lastSubmission, showShortcuts, showDictionaryPanel, wordPopup]);

  // Text selection for word popup
  useTextSelection({
    containerRef: paragraphRef as React.RefObject<HTMLElement>,
    minLength: 2,
    onSelect: (sel) => {
      setWordPopup({
        word: sel.text,
        position: sel,
      });
    },
  });

  const handleSubmit = async () => {
    if (!session || !userTranslation.trim()) return;

    try {
      const isRetry = retryingSubmission !== null;
      const result = await submitTranslationMutation.mutateAsync({
        sessionId: session.id,
        userTranslation,
        options: isRetry ? { isRetry: true, parentSubmissionId: retryingSubmission.id } : undefined,
      });

      setLastSubmission(result);
      setRetryingSubmission(null);

      // Refetch session to get updated state
      await refetchSession();

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
            errors:
              result.feedback?.errors?.map((e) => ({
                type: e.type,
                quickFix: e.quickFix,
                correction: e.correction,
              })) || [],
          },
        };
        setCompletedData(newCompletedData);

        // Check for achievements
        checkForAchievements(result);
      }

      // Session completed achievement
      if (result.isLastSentence && passedThreshold) {
        const sessionCompletedAchievement: Achievement = {
          id: 'session_completed',
          title: 'Session Master',
          description: 'Completed a full paragraph session!',
          icon: '🎯',
        };
        setTimeout(() => {
          setUnlockedAchievement(sessionCompletedAchievement);
          toast.success('Achievement Unlocked!', {
            description: sessionCompletedAchievement.title,
          });
        }, 1500);

        // Show summary modal after achievement
        setTimeout(() => {
          setShowSummary(true);
        }, 3000);
      }
    } catch (err) {
      toast.error('Failed to submit translation', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  };

  const handleGenerateNextParagraph = async () => {
    if (!isRandomMode || !randomSessionId) return;
    if (isGeneratingNext) return;

    try {
      setIsGeneratingNext(true);
      setNextGenError(null);

      // Set timeout to prevent stuck loading (30 seconds)
      generationTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current && isGeneratingNext) {
          setNextGenError('Generation timeout');
          setIsGeneratingNext(false);
          toast.error('Generation Timeout', {
            description: 'Taking too long. Please try again.',
          });
        }
      }, 30000);

      const nextSession = await generateNextParagraph(randomSessionId);

      // Clear timeout on success
      if (generationTimeoutRef.current) {
        clearTimeout(generationTimeoutRef.current);
        generationTimeoutRef.current = null;
      }

      if (!isMountedRef.current) return;

      if (nextSession.currentParagraph?.paragraphSessionId) {
        // Check if using fallback content
        const isFallback =
          nextSession.currentParagraph.paragraphTitle?.includes('AI Generated') === false;
        if (isFallback) {
          toast.info('Using Curated Content', {
            description: 'AI generation unavailable, selected from our paragraph library',
          });
        }

        navigate({
          to: '/session/$paragraphId',
          params: { paragraphId: String(nextSession.currentParagraph.paragraphSessionId) },
          search: { randomSessionId },
        });
      } else {
        throw new Error('No next paragraph available');
      }
    } catch (err) {
      // Clear timeout on error
      if (generationTimeoutRef.current) {
        clearTimeout(generationTimeoutRef.current);
        generationTimeoutRef.current = null;
      }

      if (!isMountedRef.current) return;

      const errorMessage = err instanceof Error ? err.message : 'Failed to generate next paragraph';
      setNextGenError(errorMessage);

      // Suggest trying again or returning to practice mode
      toast.error('Generation Failed', {
        description: `${errorMessage}. Please try again or return to practice mode.`,
      });
    } finally {
      if (isMountedRef.current) {
        setIsGeneratingNext(false);
      }
    }
  };

  const handleEndRandomSession = async () => {
    if (!randomSessionId) return;

    try {
      await endRandomSessionMutation.mutateAsync(randomSessionId);
      toast.success('Session Ended', {
        description: 'Your progress has been saved',
      });
      navigate({ to: '/random-session' });
    } catch (err) {
      toast.error('Failed to end session', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  };

  const checkForAchievements = (result: SentenceSubmissionResponse) => {
    // Perfect score achievement (100% accuracy)
    if (result.accuracy === 100) {
      const achievement: Achievement = {
        id: 'perfect_score',
        title: 'Perfect Translation!',
        description: 'Achieved 100% accuracy on a sentence',
        icon: '🏆',
      };
      setTimeout(() => {
        setUnlockedAchievement(achievement);
        toast.success('Achievement Unlocked!', {
          description: achievement.title,
        });
      }, 1000);
    }

    // Bright Mind achievement (95%+ accuracy)
    if (result.accuracy >= 95 && result.accuracy < 100) {
      const achievement: Achievement = {
        id: 'bright_mind',
        title: 'Bright Mind',
        description: 'Scored 95%+ accuracy',
        icon: '💡',
      };
      setTimeout(() => {
        setUnlockedAchievement(achievement);
        toast.success('Achievement Unlocked!', {
          description: achievement.title,
        });
      }, 1000);
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

    try {
      const result = await skipSentenceMutation.mutateAsync(session.id);
      setLastSubmission(result);

      if (!result.isLastSentence) {
        await refetchSession();
      }
      setUserTranslation('');
      setTimeout(() => textareaRef.current?.focus(), 0);
    } catch (err) {
      toast.error('Failed to skip sentence', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  };

  const handleNextSentence = () => {
    setLastSubmission(null);
    setPreviousAttempt(null);
    setUserTranslation('');
    setTimeout(() => textareaRef.current?.focus(), 0);
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
          <div
            key={chunkIdx}
            className="leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {chunk.map((sentence) => {
              const index = sentenceIndex++;
              return renderSentence(sentence, index, retryingSentenceIndex);
            })}
          </div>
        ))}
      </div>
    );
  };

  const renderSentence = (
    sentence: string,
    index: number,
    retryingSentenceIndex: number | undefined
  ) => {
    if (!session) return null;

    const isRetryingSentence =
      retryingSentenceIndex !== undefined && index === retryingSentenceIndex;
    const isCurrentSentence =
      index === session.currentSentenceIndex && !retryingSubmission && !lastSubmission;
    const isCompleted = index < session.currentSentenceIndex && !isRetryingSentence;
    const data = completedData[index];

    if (isCompleted && data) {
      const trimmed = data.correctTranslation.trim();
      const needsPunctuation = !/[.!?]$/.test(trimmed);
      const displayText = needsPunctuation ? `${trimmed}.` : trimmed;
      const hasErrors = data.errors.length > 0;
      const userDiffersFromCorrect =
        data.userTranslation.toLowerCase().trim() !== data.correctTranslation.toLowerCase().trim();

      return (
        <SentenceTooltip
          key={index}
          trigger={
            <span
              className="relative inline cursor-help"
              style={{ color: 'var(--color-text-highlight)' }}
            >
              {displayText}{' '}
            </span>
          }
        >
          {/* Accuracy */}
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Accuracy:
            </span>
            <span
              className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                data.accuracy >= 90
                  ? 'bg-green-900 text-green-300'
                  : data.accuracy >= 80
                    ? 'bg-yellow-900 text-yellow-300'
                    : 'bg-red-900 text-red-300'
              }`}
            >
              {Math.round(data.accuracy)}%
            </span>
          </div>

          {/* Original Vietnamese */}
          <div className="mb-2">
            <span className="block text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Original:
            </span>
            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              {data.originalSentence}
            </span>
          </div>

          {/* User's input if different */}
          {userDiffersFromCorrect && (
            <div className="mb-2">
              <span className="block text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Your input:
              </span>
              <span className="text-xs text-orange-400 line-through">{data.userTranslation}</span>
            </div>
          )}

          {/* Errors */}
          {hasErrors && (
            <div>
              <span className="mb-1 block text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Corrections:
              </span>
              {data.errors.slice(0, 3).map((err, i) => (
                <div key={i} className="mb-0.5 flex items-start gap-1 text-xs">
                  <span
                    className={`rounded px-1 text-[10px] ${
                      err.type === 'GRAMMAR'
                        ? 'bg-purple-900 text-purple-300'
                        : err.type === 'WORD_CHOICE'
                          ? 'bg-blue-900 text-blue-300'
                          : 'bg-orange-900 text-orange-300'
                    }`}
                  >
                    {err.type === 'GRAMMAR' ? 'G' : err.type === 'WORD_CHOICE' ? 'W' : 'N'}
                  </span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    {err.quickFix || err.correction}
                  </span>
                </div>
              ))}
              {data.errors.length > 3 && (
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  +{data.errors.length - 3} more
                </span>
              )}
            </div>
          )}
        </SentenceTooltip>
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
        <SentenceTooltip
          key={index}
          trigger={
            <span
              className="relative inline cursor-help"
              style={{ color: 'var(--color-text-highlight)' }}
            >
              {displayText}{' '}
            </span>
          }
        >
          <div className="mb-2">
            <span className="block text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Original:
            </span>
            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              {originalSentence}
            </span>
          </div>
          <div className="text-xs italic" style={{ color: 'var(--color-text-muted)' }}>
            (Detailed feedback not available for this sentence)
          </div>
        </SentenceTooltip>
      );
    }

    return (
      <span
        key={index}
        className={`${isCurrentSentence || isRetryingSentence ? 'font-semibold' : ''}`}
        style={
          isCurrentSentence || isRetryingSentence
            ? { color: 'var(--color-text-current)' }
            : { color: 'var(--color-text-secondary)' }
        }
      >
        {sentence}{' '}
      </span>
    );
  };

  if (isLoading || !session) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: 'var(--color-surface-dark)' }}
      >
        <svg className="h-12 w-12 animate-spin text-blue-500" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: 'var(--color-surface-dark)' }}
      >
        <div className="max-w-md rounded-lg border border-red-700 bg-red-900/50 p-6">
          <p className="text-red-300">{error}</p>
          <button
            onClick={() => navigate({ to: '/paragraphs' })}
            className="mt-4 rounded-lg px-4 py-2 hover:opacity-80"
            style={{
              backgroundColor: 'var(--color-surface-light)',
              color: 'var(--color-text-primary)',
            }}
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
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface-dark)' }}>
        {/* Success Animation */}
        <SuccessAnimation
          show={showSuccessAnimation}
          accuracy={lastSubmission?.accuracy || 0}
          onComplete={() => setShowSuccessAnimation(false)}
        />

        {/* Random Mode Header */}
        {isRandomMode && randomSession && (
          <div
            className="sticky top-0 z-40 border-b"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="mx-auto max-w-7xl px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                {/* Left: Session stats */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                    <span style={{ color: 'var(--color-text-secondary)' }}>Difficulty:</span>
                    <span className="font-bold" style={{ color: 'var(--color-primary)' }}>
                      {randomSession.currentDifficulty}/10
                    </span>
                  </div>
                  <div className="hidden items-center gap-2 sm:flex">
                    <Trophy className="h-4 w-4" style={{ color: 'var(--color-accent)' }} />
                    <span style={{ color: 'var(--color-text-secondary)' }}>Completed:</span>
                    <span className="font-bold" style={{ color: 'var(--color-accent)' }}>
                      {randomSession.totalParagraphsCompleted}
                    </span>
                  </div>
                  <div className="hidden items-center gap-2 md:flex">
                    <Clock className="h-4 w-4" style={{ color: 'var(--color-success)' }} />
                    <span style={{ color: 'var(--color-text-secondary)' }}>Time:</span>
                    <span className="font-bold" style={{ color: 'var(--color-success)' }}>
                      {Math.floor((Date.now() - sessionStartTime) / 60000)}m
                    </span>
                  </div>
                </div>

                {/* Right: End Session button */}
                <button
                  onClick={handleEndRandomSession}
                  disabled={endRandomSessionMutation.isPending}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all hover:opacity-80 disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--color-error)',
                    color: 'white',
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">End Session</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Compact Header */}
        <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            {/* Left: Title + Sentence counter */}
            <div className="flex min-w-0 items-center gap-3">
              <h1
                className="font-display truncate text-base font-semibold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {session.paragraphTitle}
              </h1>
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-xs"
                style={{
                  backgroundColor: 'var(--color-surface-light)',
                  color: 'var(--color-text-muted)',
                }}
              >
                {session.currentSentenceIndex + 1}/{session.totalSentences}
              </span>

              {/* Previous Attempts Button */}
              <button
                onClick={() => setShowPreviousAttempts(true)}
                className="flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all hover:scale-105"
                style={{
                  backgroundColor: 'var(--color-surface-light)',
                  color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border)',
                }}
                title="View previous attempts"
              >
                <History className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">History</span>
              </button>
            </div>

            {/* Right: Compact progress bar */}
            <div className="flex shrink-0 items-center gap-3">
              {/* Dictionary Button */}
              <button
                onClick={() => setShowDictionaryPanel(true)}
                className="rounded-lg p-2 transition-all hover:scale-110 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                  boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)',
                }}
                title="Open Dictionary (Ctrl+B)"
              >
                <BookOpen className="h-5 w-5 text-white" />
              </button>

              <div className="hidden w-32 items-center gap-2 sm:flex">
                <div
                  className="h-1.5 flex-1 overflow-hidden rounded-full"
                  style={{ backgroundColor: 'var(--color-surface-light)' }}
                >
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-emerald-400">
                  {Math.round(progressPercent)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-4 py-2">
          {session.status === 'COMPLETED' ? (
            isRandomMode ? (
              // Random mode: Show loading state for next paragraph
              <div
                className="rounded-lg p-8 text-center"
                style={{ backgroundColor: 'var(--color-surface)' }}
              >
                <div className="mb-4 text-6xl">🎉</div>
                <h2
                  className="mb-2 text-2xl font-bold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Great Job!
                </h2>
                <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                  Preparing your next challenge...
                </p>
                <div className="mb-6 flex justify-center gap-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400">{session.totalPoints}</div>
                    <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      Total Points
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">
                      {session.averageAccuracy.toFixed(1)}%
                    </div>
                    <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      Average Accuracy
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500"></div>
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-blue-500"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-blue-500"
                    style={{ animationDelay: '0.4s' }}
                  ></div>
                </div>
              </div>
            ) : (
              // Normal mode: Show completion screen
              <div
                className="rounded-lg p-8 text-center"
                style={{ backgroundColor: 'var(--color-surface)' }}
              >
                <div className="mb-4 text-6xl">🎉</div>
                <h2
                  className="mb-2 text-2xl font-bold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Session Complete!
                </h2>
                <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                  You've completed all {session.totalSentences} sentences
                </p>
                <div className="mb-6 flex justify-center gap-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400">{session.totalPoints}</div>
                    <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      Total Points
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">
                      {session.averageAccuracy.toFixed(1)}%
                    </div>
                    <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      Average Accuracy
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate({ to: '/paragraphs' })}
                  className="rounded-lg bg-blue-600 px-6 py-3 font-medium hover:bg-blue-700"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Back to Paragraphs
                </button>
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Left Column - Exercise (Redesigned for long content) */}
              <div className="flex flex-col gap-3" style={{ height: 'calc(100vh - 90px)' }}>
                {/* Paragraph Display - Compact with auto height */}
                <div
                  className="relative overflow-hidden rounded-xl"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    maxHeight: 'calc(100vh - 300px)',
                  }}
                >
                  {/* Scrollable content */}
                  <div
                    ref={paragraphRef}
                    className="custom-scrollbar overflow-y-auto p-4 pr-3"
                    style={{ scrollBehavior: 'smooth' }}
                  >
                    {renderHighlightedParagraph()}
                  </div>
                </div>

                {/* Translation Input - Always visible, fixed at bottom */}
                <div
                  className="relative shrink-0 overflow-hidden rounded-xl p-4"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    boxShadow: '0 -4px 20px -4px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  {/* Elegant accent bar - matching Dictionary theme */}
                  <div
                    className="absolute top-0 right-0 left-0 h-1 overflow-hidden"
                    style={{
                      background:
                        'linear-gradient(90deg, rgba(139, 92, 246, 0.3) 0%, rgba(139, 92, 246, 0.6) 50%, rgba(139, 92, 246, 0.3) 100%)',
                    }}
                  >
                    <div
                      className="absolute inset-0 animate-pulse"
                      style={{
                        background:
                          'linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.8) 50%, transparent 100%)',
                        filter: 'blur(4px)',
                      }}
                    />
                  </div>

                  {/* Current sentence indicator - more compact */}
                  <div className="mb-2 flex items-center gap-2">
                    <div
                      className="flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: 'var(--color-surface-light)',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-400" />
                      Sentence {session.currentSentenceIndex + 1}
                    </div>
                    <span className="truncate text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {session.allSentences[session.currentSentenceIndex]?.slice(0, 40)}...
                    </span>
                  </div>

                  <AutoResizeTextarea
                    ref={textareaRef}
                    placeholder="Type your English translation here... (Ctrl+Enter to submit)"
                    value={userTranslation}
                    onChange={(e) => setUserTranslation(e.target.value)}
                    onKeyDown={(e) => {
                      if (
                        e.ctrlKey &&
                        e.key === 'Enter' &&
                        userTranslation.trim() &&
                        !isSubmitting &&
                        !lastSubmission
                      ) {
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
                    <div className="mt-3 rounded-lg border border-red-700 bg-red-900/50 p-3 text-sm text-red-300">
                      {error}
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-end">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSkip}
                        disabled={isSubmitting || session.totalCredits <= 0}
                        className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-all hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                        style={{
                          backgroundColor: 'var(--color-surface)',
                          color: 'var(--color-text-secondary)',
                          borderColor: 'var(--color-border)',
                        }}
                      >
                        💡 Hint
                      </button>

                      {lastSubmission ? (
                        lastSubmission.accuracy >= 80 ? (
                          <div className="flex gap-2">
                            <Tooltip
                              content={
                                <span className="flex items-center gap-2">
                                  <kbd
                                    className="rounded px-1.5 py-0.5 text-xs"
                                    style={{ backgroundColor: 'var(--color-surface-light)' }}
                                  >
                                    Ctrl+'
                                  </kbd>{' '}
                                  Practice again
                                </span>
                              }
                            >
                              <button
                                onClick={handleOptionalRetry}
                                className="flex items-center gap-2 rounded-lg bg-purple-600 px-3 py-2 text-sm font-medium hover:bg-purple-700"
                                style={{ color: 'var(--color-text-primary)' }}
                              >
                                🔄 Retry
                              </button>
                            </Tooltip>
                            <Tooltip
                              content={
                                <span className="flex items-center gap-2">
                                  <kbd
                                    className="rounded px-1.5 py-0.5 text-xs"
                                    style={{ backgroundColor: 'var(--color-surface-light)' }}
                                  >
                                    Ctrl+↵
                                  </kbd>{' '}
                                  Continue
                                </span>
                              }
                            >
                              <button
                                onClick={handleNextSentence}
                                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium hover:bg-green-700"
                                style={{ color: 'var(--color-text-primary)' }}
                              >
                                Next →
                              </button>
                            </Tooltip>
                          </div>
                        ) : (
                          <Tooltip
                            content={
                              <span className="flex items-center gap-2">
                                <kbd
                                  className="rounded px-1.5 py-0.5 text-xs"
                                  style={{ backgroundColor: 'var(--color-surface-light)' }}
                                >
                                  Ctrl+↵
                                </kbd>{' '}
                                Try again
                              </span>
                            }
                          >
                            <button
                              onClick={handleRetry}
                              className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all"
                              style={{
                                backgroundColor: 'var(--color-accent)',
                                color: 'var(--color-text-primary)',
                                borderColor: 'var(--color-accent-dark)',
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
                          className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {isSubmitting ? (
                            <>
                              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="none"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                />
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
                          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-2 text-sm font-medium shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {isSubmitting ? (
                            <>
                              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="none"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                />
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
              <div className="custom-scrollbar space-y-4 lg:max-h-[calc(100vh-90px)] lg:overflow-y-auto">
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
                      <div className="flex items-center justify-between rounded-lg border border-purple-700 bg-purple-900/30 px-3 py-2">
                        <span className="text-sm text-purple-300">
                          🔄 Retry #{lastSubmission.retryAttempt}
                        </span>
                        <div className="flex items-center gap-3 text-sm">
                          <span
                            className={
                              previousAttempt.accuracy >= 80 ? 'text-green-400' : 'text-gray-400'
                            }
                          >
                            {Math.round(previousAttempt.accuracy)}%
                          </span>
                          <span style={{ color: 'var(--color-text-muted)' }}>→</span>
                          <span
                            className={`font-bold ${lastSubmission.accuracy >= 80 ? 'text-green-400' : 'text-orange-400'}`}
                          >
                            {Math.round(lastSubmission.accuracy)}%
                          </span>
                          {lastSubmission.accuracy !== previousAttempt.accuracy && (
                            <span
                              className={
                                lastSubmission.accuracy > previousAttempt.accuracy
                                  ? 'text-green-400'
                                  : 'text-red-400'
                              }
                            >
                              {lastSubmission.accuracy > previousAttempt.accuracy ? '+' : ''}
                              {Math.round(lastSubmission.accuracy - previousAttempt.accuracy)}%
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
                    <FeedbackPanel
                      feedback={lastSubmission.feedback}
                      userTranslation={lastSubmission.userTranslation}
                    />
                  </div>
                ) : lastSubmission?.skipped ? (
                  <div
                    className="rounded-lg p-6"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                    }}
                  >
                    <h3
                      className="mb-2 text-lg font-semibold"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      Sentence Skipped
                    </h3>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                      You used 1 credit to skip this sentence.
                    </p>
                  </div>
                ) : (
                  <div
                    className="group relative overflow-hidden rounded-2xl p-8 text-center backdrop-blur-sm"
                    style={{
                      backgroundColor: 'var(--color-card-translucent)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    {/* Decorative background elements */}
                    <div className="absolute inset-0 opacity-30">
                      <div
                        className="absolute -top-8 -right-8 h-32 w-32 rounded-full blur-2xl transition-all duration-500 group-hover:opacity-70"
                        style={{ backgroundColor: 'var(--color-accent)', opacity: 0.1 }}
                      />
                      <div
                        className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full blur-2xl transition-all duration-500 group-hover:opacity-70"
                        style={{ backgroundColor: 'var(--color-primary)', opacity: 0.1 }}
                      />
                    </div>

                    {/* Animated illustration */}
                    <div className="relative mb-6">
                      <svg className="mx-auto h-20 w-20" viewBox="0 0 80 80" fill="none">
                        {/* Chat bubble base */}
                        <rect
                          x="10"
                          y="20"
                          width="45"
                          height="32"
                          rx="8"
                          style={{ fill: 'var(--color-card-solid)', stroke: 'var(--color-border)' }}
                          strokeWidth="1.5"
                        />
                        <circle
                          cx="22"
                          cy="36"
                          r="3"
                          style={{ fill: 'var(--color-text-muted)' }}
                          className="animate-pulse"
                        />
                        <circle
                          cx="32"
                          cy="36"
                          r="3"
                          style={{ fill: 'var(--color-text-muted)' }}
                          className="animate-pulse"
                        />
                        <circle
                          cx="42"
                          cy="36"
                          r="3"
                          style={{ fill: 'var(--color-text-muted)' }}
                          className="animate-pulse"
                        />
                        {/* Arrow pointing to bubble */}
                        <path
                          d="M10 46 L6 52 L14 52 Z"
                          style={{ fill: 'var(--color-card-solid)' }}
                        />

                        {/* Decorative sparkles */}
                        <circle
                          cx="62"
                          cy="28"
                          r="2"
                          style={{ fill: 'var(--color-accent)', opacity: 0.6 }}
                          className="animate-sparkle"
                        />
                        <circle
                          cx="68"
                          cy="38"
                          r="1.5"
                          style={{ fill: 'var(--color-primary)', opacity: 0.6 }}
                          className="animate-sparkle"
                        />
                        <path
                          d="M58 45 L60 48 L58 51 L55 48 Z"
                          style={{ fill: 'var(--color-accent)', opacity: 0.4 }}
                          className="animate-sparkle"
                        />
                      </svg>
                    </div>

                    <h3
                      className="font-display relative mb-2 text-lg font-semibold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      Awaiting Your Translation
                    </h3>
                    <p
                      className="relative mx-auto max-w-xs text-sm"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      Type your translation and submit to receive AI-powered feedback
                    </p>

                    {/* Keyboard hint */}
                    <div
                      className="relative mt-4 flex items-center justify-center gap-2 text-xs"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      <kbd
                        className="rounded px-2 py-1"
                        style={{
                          backgroundColor: 'var(--color-surface-elevated)',
                          borderColor: 'var(--color-border)',
                          borderWidth: '1px',
                          borderStyle: 'solid',
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        Ctrl
                      </kbd>
                      <span>+</span>
                      <kbd
                        className="rounded px-2 py-1"
                        style={{
                          backgroundColor: 'var(--color-surface-elevated)',
                          borderColor: 'var(--color-border)',
                          borderWidth: '1px',
                          borderStyle: 'solid',
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        Enter
                      </kbd>
                      <span style={{ color: 'var(--color-text-muted)' }}>to submit</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <KeyboardShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />

        {/* Keyboard shortcuts hint */}
        {session && session.status !== 'COMPLETED' && (
          <div className="fixed right-4 bottom-4 z-30 hidden md:block">
            <button
              onClick={() => setShowShortcuts(true)}
              className="flex items-center gap-1 text-xs transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Press{' '}
              <kbd
                className="rounded px-1.5 py-0.5 text-xs"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                }}
              >
                ?
              </kbd>{' '}
              for shortcuts
            </button>
          </div>
        )}

        {/* Floating Sidebar - Premium Glass Design */}
        {session && (
          <div
            className={`fixed top-1/2 right-4 z-40 hidden -translate-y-1/2 flex-col gap-4 transition-all duration-300 md:flex ${sidebarCollapsed ? 'translate-x-[calc(100%-12px)]' : ''}`}
          >
            {/* Collapse/Expand Toggle */}
            <button
              onClick={toggleSidebar}
              className="group absolute top-1/2 -left-4 flex h-16 w-8 -translate-y-1/2 items-center justify-center rounded-l-2xl shadow-xl backdrop-blur-xl transition-all duration-300"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-secondary)',
              }}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg
                className={`h-4 w-4 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`}
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
              onClick={() => setShowDictionaryPanel(true)}
              className="group relative flex flex-col items-center justify-center gap-2 overflow-hidden rounded-3xl p-5 shadow-2xl ring-1 shadow-black/30 ring-white/5 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-violet-500/50 hover:shadow-violet-500/20"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-secondary)',
              }}
              title="My Dictionary (Ctrl+D)"
            >
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-600/0 via-violet-600/0 to-purple-600/0 transition-all duration-300 group-hover:from-violet-600/10 group-hover:via-violet-600/5 group-hover:to-purple-600/10" />

              {/* Icon container with glow */}
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 transition-all duration-300 group-hover:from-violet-500/30 group-hover:to-purple-500/20 group-hover:shadow-lg group-hover:shadow-violet-500/20">
                <svg
                  className="h-6 w-6 text-violet-400 transition-colors group-hover:text-violet-300"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path
                    d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M8 7h8M8 11h6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <span
                className={`text-xs font-medium transition-all duration-300 group-hover:text-violet-300 ${sidebarCollapsed ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Dictionary
              </span>

              {/* Keyboard shortcut hint */}
              <div
                className={`absolute right-1 bottom-1 rounded px-1.5 py-0.5 text-[9px] opacity-0 transition-opacity group-hover:opacity-100 ${sidebarCollapsed ? 'hidden' : ''}`}
                style={{
                  backgroundColor: 'var(--color-surface-dark)',
                  color: 'var(--color-text-muted)',
                }}
              >
                Ctrl+D
              </div>
            </button>

            {/* Accuracy Display - Premium Card */}
            <div
              className="group relative flex flex-col items-center justify-center overflow-hidden rounded-3xl p-5 shadow-2xl ring-1 shadow-black/30 ring-white/5 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-emerald-500/50 hover:shadow-emerald-500/20"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
              }}
              title="Session Accuracy"
            >
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-600/0 via-emerald-600/0 to-teal-600/0 transition-all duration-300 group-hover:from-emerald-600/10 group-hover:via-emerald-600/5 group-hover:to-teal-600/10" />

              {/* Circular progress ring */}
              <div className="relative h-14 w-14">
                <svg className="h-14 w-14 -rotate-90" viewBox="0 0 56 56">
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
                  <span className="text-sm font-bold text-emerald-400 transition-colors group-hover:text-emerald-300">
                    {session.averageAccuracy.toFixed(0)}%
                  </span>
                </div>
              </div>

              <span
                className={`mt-2 text-xs font-medium transition-all duration-300 group-hover:text-emerald-300 ${sidebarCollapsed ? 'mt-0 h-0 scale-0 opacity-0' : 'scale-100 opacity-100'}`}
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Accuracy
              </span>
            </div>
          </div>
        )}

        {/* Mobile Bottom Bar - Dictionary & Accuracy */}
        {session && (
          <div className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 gap-3 md:hidden">
            <button
              onClick={() => setShowDictionaryPanel(true)}
              className="flex items-center gap-2.5 rounded-2xl px-5 py-2.5 shadow-xl ring-1 shadow-black/30 ring-white/5 backdrop-blur-xl transition-all active:scale-95"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-secondary)',
              }}
              title="My Dictionary (Ctrl+D)"
            >
              <span className="text-lg">📖</span>
              <span
                className="text-xs font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Dictionary
              </span>
            </button>
            <div
              className="flex items-center gap-2.5 rounded-2xl px-5 py-2.5 shadow-xl ring-1 shadow-black/30 ring-white/5 backdrop-blur-xl"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-emerald-500/60 bg-emerald-500/10">
                <span className="text-[10px] font-bold text-emerald-400">
                  {session.averageAccuracy.toFixed(0)}%
                </span>
              </div>
              <span
                className="text-xs font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Accuracy
              </span>
            </div>
          </div>
        )}

        {/* Word Popup */}
        {wordPopup && (
          <WordPopup
            word={wordPopup.word}
            position={wordPopup.position}
            onClose={() => {
              setWordPopup(null);
              window.getSelection()?.removeAllRanges();
            }}
            sessionId={session?.id}
            context={session?.currentSentence}
            userId={user?.id ?? 0}
          />
        )}

        {/* Dictionary Panel */}
        <DictionaryPanel
          isOpen={showDictionaryPanel}
          onClose={() => setShowDictionaryPanel(false)}
          userId={user?.id ?? 0}
        />

        {/* Achievement Unlock Modal */}
        <AchievementUnlockModal
          achievement={unlockedAchievement}
          onClose={() => setUnlockedAchievement(null)}
        />

        {/* Paragraph Summary Modal */}
        {sessionId && (
          <ParagraphSummaryModal
            sessionId={sessionId}
            isOpen={showSummary}
            onClose={() => setShowSummary(false)}
            onContinue={isRandomMode ? handleGenerateNextParagraph : undefined}
            isProcessingNext={isRandomMode && isGeneratingNext}
            processingLabel="Generating next paragraph..."
            errorMessage={isRandomMode ? nextGenError : null}
          />
        )}

        {/* Previous Attempts Modal */}
        {session && (
          <PreviousAttemptsModal
            paragraphId={session.paragraphId}
            paragraphTitle={session.paragraphTitle}
            isOpen={showPreviousAttempts}
            onClose={() => setShowPreviousAttempts(false)}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
