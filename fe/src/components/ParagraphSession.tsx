import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { createSession, getSession, submitSentenceTranslation, skipSentence } from '../api/sessionApi';
import { ScoreBreakdown } from './ScoreBreakdown';
import { FeedbackPanel } from './FeedbackPanel';
import { AchievementsPanel } from './AchievementsPanel';
import type { Session, SentenceSubmissionResponse } from '../types/session';
import type { Achievement } from '../types/user';

interface Props {
  paragraphId: number;
}

export function ParagraphSession({ paragraphId }: Props) {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [userTranslation, setUserTranslation] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSubmission, setLastSubmission] = useState<SentenceSubmissionResponse | null>(null);
  const [completedTranslations, setCompletedTranslations] = useState<Record<number, string>>({});

  const achievements = useMemo<Achievement[]>(() => {
    if (!session) return [];
    const result: Achievement[] = [];
    
    if (session.status === 'COMPLETED') {
      result.push({
        id: 'first_session',
        title: 'Session Complete',
        description: 'Completed a paragraph session',
        icon: '🎯',
      });
    }
    
    if (session.averageAccuracy >= 90) {
      result.push({
        id: 'bright_mind',
        title: 'Bright Mind',
        description: '90%+ accuracy',
        icon: '💡',
      });
    }
    
    if (session.averageAccuracy === 100) {
      result.push({
        id: 'perfect_score',
        title: 'Perfect Score',
        description: '100% accuracy!',
        icon: '🏆',
      });
    }
    
    result.push({
      id: 'day_streak',
      title: 'Day Streak',
      description: 'Keep learning daily!',
      icon: '🔥',
      progress: 1,
      target: 7,
    });
    
    return result;
  }, [session]);

  useEffect(() => {
    initSession();
  }, [paragraphId]);

  const initSession = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const newSession = await createSession(paragraphId);
      setSession(newSession);
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
      const result = await submitSentenceTranslation(session.id, userTranslation);
      setLastSubmission(result);
      
      const passedThreshold = result.accuracy >= 80;
      
      if (passedThreshold) {
        setCompletedTranslations(prev => ({
          ...prev,
          [result.sentenceIndex]: userTranslation
        }));
        
        if (!result.isLastSentence) {
          const updatedSession = await getSession(session.id);
          setSession(updatedSession);
        } else {
          setSession(prev => prev ? { ...prev, status: 'COMPLETED' } : null);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit translation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setLastSubmission(null);
    setUserTranslation('');
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to skip sentence');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextSentence = () => {
    setLastSubmission(null);
    setUserTranslation('');
  };

  const handleQuit = () => {
    navigate({ to: '/paragraphs' });
  };

  const renderHighlightedParagraph = () => {
    if (!session) return null;
    
    return (
      <div className="text-gray-300 leading-relaxed">
        {session.allSentences.map((sentence, index) => {
          const isCurrentSentence = index === session.currentSentenceIndex;
          const isCompleted = index < session.currentSentenceIndex;
          const translation = completedTranslations[index];
          
          if (isCompleted && translation) {
            return (
              <span
                key={index}
                className="text-green-400 cursor-help relative group"
                title={sentence}
              >
                {translation}{' '}
                <span className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-800 text-gray-300 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border border-gray-600 max-w-md">
                  <span className="text-gray-500 text-xs block mb-1">Original:</span>
                  {sentence}
                </span>
              </span>
            );
          }
          
          return (
            <span
              key={index}
              className={`${
                isCurrentSentence
                  ? 'text-orange-400 font-semibold'
                  : isCompleted
                    ? 'text-green-400'
                    : 'text-gray-400'
              }`}
            >
              {sentence}{' '}
            </span>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <svg className="animate-spin h-12 w-12 text-blue-500" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-6 max-w-md">
          <p className="text-red-300">{error}</p>
          <button
            onClick={() => navigate({ to: '/paragraphs' })}
            className="mt-4 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
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
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-yellow-400">{session.paragraphTitle}</h1>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-yellow-400">
              <span className="text-lg">💰</span>
              <span className="font-medium">{session.totalCredits} credits</span>
            </div>
            <div className="flex items-center gap-2 text-yellow-400">
              <span className="text-lg">⭐</span>
              <span className="font-medium">{session.totalPoints} points</span>
            </div>
            <span className="text-gray-400">
              Progress: {session.completedSentences}/{session.totalSentences} sentences
            </span>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="max-w-7xl mx-auto mt-3">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {session.status === 'COMPLETED' ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-white mb-2">Session Complete!</h2>
            <p className="text-gray-400 mb-6">
              You've completed all {session.totalSentences} sentences
            </p>
            <div className="flex justify-center gap-8 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">{session.totalPoints}</div>
                <div className="text-gray-400 text-sm">Total Points</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">{session.averageAccuracy.toFixed(1)}%</div>
                <div className="text-gray-400 text-sm">Average Accuracy</div>
              </div>
            </div>
            <button
              onClick={() => navigate({ to: '/paragraphs' })}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Back to Paragraphs
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Exercise */}
            <div className="space-y-6">
              {/* Paragraph Display */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                {renderHighlightedParagraph()}
              </div>

              {/* Translation Input */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <textarea
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={4}
                  placeholder="Enter your English translation here... (Only highlighted sentence, Ctrl+Enter to submit)"
                  value={userTranslation}
                  onChange={(e) => setUserTranslation(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.ctrlKey && e.key === 'Enter' && userTranslation.trim() && !isSubmitting && !lastSubmission) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  disabled={isSubmitting || lastSubmission !== null}
                />

                {error && (
                  <div className="mt-3 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={handleQuit}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
                  >
                    ← Quit
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSkip}
                      disabled={isSubmitting || session.totalCredits <= 0}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      💡 Hint
                    </button>
                    
                    {lastSubmission ? (
                      lastSubmission.accuracy >= 80 ? (
                        <button
                          onClick={handleNextSentence}
                          className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                        >
                          Next Sentence →
                        </button>
                      ) : (
                        <button
                          onClick={handleRetry}
                          className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700"
                        >
                          🔄 Retry (Need 80%+)
                        </button>
                      )
                    ) : (
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !userTranslation.trim()}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Submitting...
                          </>
                        ) : (
                          <>Submit {session.currentSentenceIndex + 1} ⓘ</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Feedback */}
            <div className="space-y-6">
              {/* Dictionary & Accuracy */}
              <div className="flex gap-4">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700">
                  📖 Dictionary
                </button>
                <div className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg">
                  <div className="w-10 h-10 rounded-full border-2 border-green-500 flex items-center justify-center">
                    <span className="text-green-400 text-sm font-bold">
                      {session.averageAccuracy.toFixed(0)}%
                    </span>
                  </div>
                  <span className="text-gray-400 text-sm">Accuracy</span>
                </div>
              </div>

              {/* Feedback Panel */}
              {lastSubmission?.feedback ? (
                <div className="space-y-4">
                  <ScoreBreakdown
                    scores={{
                      grammarScore: lastSubmission.grammarScore,
                      wordChoiceScore: lastSubmission.wordChoiceScore,
                      naturalnessScore: lastSubmission.naturalnessScore,
                      overallScore: Math.round(lastSubmission.accuracy),
                    }}
                  />
                  <FeedbackPanel feedback={lastSubmission.feedback} />
                </div>
              ) : lastSubmission?.skipped ? (
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">Sentence Skipped</h3>
                  <p className="text-gray-500">You used 1 credit to skip this sentence.</p>
                </div>
              ) : (
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">Feedback</h3>
                  <p className="text-gray-500">Submit your translation to receive feedback</p>
                </div>
              )}

              <AchievementsPanel achievements={achievements} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
