import { useState } from 'react';
import { evaluateTranslation } from '../api/translationApi';
import { ScoreBreakdown } from './ScoreBreakdown';
import { FeedbackPanel } from './FeedbackPanel';
import { TypingIndicator } from './TypingIndicator';
import { AutoResizeTextarea } from './AutoResizeTextarea';
import { useSubmissionTracker } from '../hooks/useSubmissionTracker';
import type { TranslationResponse } from '../types/translation';

interface ExerciseData {
  originalText: string;
  context?: string;
}

interface Props {
  exercise: ExerciseData;
}

export function TranslationExercise({ exercise }: Props) {
  const [userTranslation, setUserTranslation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TranslationResponse | null>(null);
  const { shouldShowPrompt, incrementCount, markPrompted } = useSubmissionTracker();

  const handleSubmit = async () => {
    if (!userTranslation.trim()) {
      setError('Please enter a translation');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await evaluateTranslation(exercise.originalText, userTranslation);
      setResult(response);
      incrementCount();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to evaluate translation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setUserTranslation('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Translation Exercise */}
        <div
          className="rounded-lg p-6 h-fit lg:sticky lg:top-6"
          style={{ backgroundColor: 'var(--color-surface)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
        >
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Translation Exercise</h2>

          {exercise.context && (
            <div className="mb-4 text-sm italic" style={{ color: 'var(--color-text-secondary)' }}>Context: {exercise.context}</div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              Translate from Vietnamese:
            </label>
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
              <p className="text-lg text-blue-300 font-medium">{exercise.originalText}</p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <label htmlFor="translation" className="block text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Your English Translation:
              </label>
              <div className="group relative">
                <svg
                  className="h-4 w-4 cursor-help"
                  style={{ color: 'var(--color-text-secondary)' }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity w-64 pointer-events-none z-10"
                  style={{ backgroundColor: 'var(--color-surface-dark)', color: 'var(--color-text-primary)' }}
                >
                  <p className="font-medium mb-1">Translation Tips:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>Paraphrasing is acceptable</li>
                    <li>Focus on conveying the meaning</li>
                    <li>Natural English is preferred over literal translation</li>
                  </ul>
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent"
                    style={{ borderTopColor: 'var(--color-surface-dark)' }}
                  />
                </div>
              </div>
            </div>
            <AutoResizeTextarea
              id="translation"
              placeholder="Translate naturally, not word-by-word. Focus on meaning over literal translation. (Ctrl+Enter to submit)"
              value={userTranslation}
              onChange={(e) => setUserTranslation(e.target.value)}
              onKeyDown={(e) => {
                if (e.ctrlKey && e.key === 'Enter' && userTranslation.trim() && !isLoading && !result) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              disabled={isLoading || result !== null}
              minRows={3}
              maxRows={8}
              optimalRange={{ min: 40, max: 200 }}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            {!result ? (
              <button
                onClick={handleSubmit}
                disabled={isLoading || !userTranslation.trim()}
                className="flex-1 bg-blue-600 py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Evaluating...
                  </>
                ) : (
                  'Submit Translation'
                )}
              </button>
            ) : (
              <button
                onClick={handleReset}
                className="flex-1 py-3 px-6 rounded-lg font-medium hover:opacity-80 transition-colors"
                style={{ backgroundColor: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)' }}
              >
                Try Again
              </button>
            )}
          </div>
        </div>

        {/* Right Column - Response/Feedback */}
        <div className="space-y-6">
          {!result && !isLoading && (
            <div
              className="rounded-lg p-6 flex flex-col items-center justify-center min-h-[300px] text-center"
              style={{ backgroundColor: 'var(--color-surface)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
            >
              <svg
                className="h-16 w-16 mb-4"
                style={{ color: 'var(--color-text-muted)' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Awaiting Your Translation</h3>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Submit your translation to receive detailed feedback and scoring
              </p>
            </div>
          )}

          {isLoading && (
            <TypingIndicator 
              message="AI is thinking..." 
              submessage="Evaluating your translation" 
            />
          )}

          {result && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <ScoreBreakdown scores={result.feedback.scores} />
              <FeedbackPanel
                feedback={result.feedback}
                userTranslation={userTranslation}
                showDetailedPrompt={shouldShowPrompt}
                onPromptDismiss={markPrompted}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
