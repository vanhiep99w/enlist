import { useState, useEffect } from 'react';
import type { TranslationFeedback, TranslationError } from '../types/translation';

interface Props {
  feedback: TranslationFeedback;
  originalText?: string;
  showDetailedPrompt?: boolean;
  onPromptDismiss?: () => void;
}

const FEEDBACK_MODE_KEY = 'feedbackMode';

type FeedbackMode = 'quick' | 'detailed';

const errorTypeBadgeColors: Record<TranslationError['type'], string> = {
  GRAMMAR: 'bg-purple-100 text-purple-800',
  WORD_CHOICE: 'bg-blue-100 text-blue-800',
  NATURALNESS: 'bg-orange-100 text-orange-800',
};

const errorTypeLabels: Record<TranslationError['type'], string> = {
  GRAMMAR: 'Grammar',
  WORD_CHOICE: 'Word Choice',
  NATURALNESS: 'Naturalness',
};

function QuickErrorCard({ error }: { error: TranslationError }) {
  return (
    <div className="flex items-center gap-2 py-1.5 px-2 bg-gray-50 rounded border border-gray-200">
      <span
        className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${errorTypeBadgeColors[error.type]}`}
      >
        {errorTypeLabels[error.type]}
      </span>
      <span className="text-sm text-gray-700 truncate">
        {error.quickFix || error.correction}
      </span>
    </div>
  );
}

function DetailedErrorCard({ error }: { error: TranslationError }) {
  return (
    <div className="border border-gray-200 rounded p-3 bg-gray-50">
      <div className="flex items-start gap-2">
        <span
          className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium shrink-0 ${errorTypeBadgeColors[error.type]}`}
        >
          {errorTypeLabels[error.type]}
        </span>
        <div className="flex-1 min-w-0 text-sm">
          <p className="text-gray-900 font-medium">{error.issue}</p>
          <p className="text-gray-600 mt-1">
            <span className="font-medium">Fix:</span>{' '}
            <span className="text-green-700">{error.correction}</span>
          </p>
          {error.explanation && (
            <p className="text-gray-500 mt-1 text-xs">{error.explanation}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ModeToggle({ mode, onChange }: { mode: FeedbackMode; onChange: (mode: FeedbackMode) => void }) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded p-0.5">
      <button
        onClick={() => onChange('quick')}
        className={`px-2 py-1 text-xs font-medium rounded transition-all ${
          mode === 'quick'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Quick
      </button>
      <button
        onClick={() => onChange('detailed')}
        className={`px-2 py-1 text-xs font-medium rounded transition-all ${
          mode === 'detailed'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Detailed
      </button>
    </div>
  );
}

interface CollapsibleTipsSectionProps {
  feedback: TranslationFeedback;
  isExpanded: boolean;
  onToggle: () => void;
}

function CollapsibleTipsSection({ feedback, isExpanded, onToggle }: CollapsibleTipsSectionProps) {
  const hasTips = 
    (feedback.articleTips && feedback.articleTips.length > 0) ||
    (feedback.collocationHighlights && feedback.collocationHighlights.length > 0) ||
    (feedback.reasoningTips && feedback.reasoningTips.length > 0) ||
    (feedback.registerTips && feedback.registerTips.length > 0) ||
    (feedback.suggestions && feedback.suggestions.length > 0);

  if (!hasTips) return null;

  const tipCount = 
    (feedback.articleTips?.length || 0) +
    (feedback.collocationHighlights?.length || 0) +
    (feedback.reasoningTips?.length || 0) +
    (feedback.registerTips?.length || 0) +
    (feedback.suggestions?.length || 0);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">📖</span>
          <span className="text-sm font-medium text-gray-800">Learning Tips</span>
          <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">
            {tipCount}
          </span>
        </div>
        <svg
          className={`h-4 w-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <div className={`transition-all duration-300 ${isExpanded ? 'max-h-[2000px]' : 'max-h-0 overflow-hidden'}`}>
        <div className="p-3 space-y-3 bg-white">
          {/* Article Tips */}
          {feedback.articleTips && feedback.articleTips.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-purple-700">
                <span>📚</span> Article Tips
              </div>
              {feedback.articleTips.map((tip, index) => (
                <div key={index} className="bg-purple-50 border border-purple-100 rounded p-2 text-xs">
                  <p className="font-medium text-purple-900">{tip.context}</p>
                  <p className="text-purple-700 mt-0.5">{tip.rule}</p>
                  <p className="text-purple-600 mt-1 italic">Ex: {tip.example}</p>
                </div>
              ))}
            </div>
          )}

          {/* Collocation */}
          {feedback.collocationHighlights && feedback.collocationHighlights.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-blue-700">
                <span>🔗</span> Collocations
              </div>
              {feedback.collocationHighlights.map((coll, index) => (
                <div key={index} className="bg-blue-50 border border-blue-100 rounded p-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-red-500 line-through">{coll.incorrect}</span>
                    <span className="text-gray-400">→</span>
                    <span className="text-green-600 font-medium">{coll.correct}</span>
                  </div>
                  <p className="text-blue-700 mt-1">{coll.explanation}</p>
                </div>
              ))}
            </div>
          )}

          {/* Reasoning Tips */}
          {feedback.reasoningTips && feedback.reasoningTips.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700">
                <span>💡</span> Reasoning Words
              </div>
              {feedback.reasoningTips.map((tip, index) => (
                <div key={index} className="bg-amber-50 border border-amber-100 rounded p-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-red-500 line-through">{tip.incorrectWord}</span>
                    <span className="text-gray-400">→</span>
                    <span className="text-green-600 font-medium">{tip.correctWord}</span>
                  </div>
                  <p className="text-amber-700 mt-1">{tip.explanation}</p>
                </div>
              ))}
            </div>
          )}

          {/* Register Tips */}
          {feedback.registerTips && feedback.registerTips.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-rose-700">
                <span>🎭</span> Tone & Register
              </div>
              {feedback.registerTips.map((tip, index) => (
                <div key={index} className="bg-rose-50 border border-rose-100 rounded p-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500">Casual:</span>
                    <span className="text-rose-600">{tip.casualWord}</span>
                    <span className="text-gray-400">→</span>
                    <span className="text-gray-500">Formal:</span>
                    <span className="text-green-600 font-medium">{tip.formalWord}</span>
                  </div>
                  <p className="text-rose-700 mt-1">{tip.explanation}</p>
                </div>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {feedback.suggestions && feedback.suggestions.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                <span>✨</span> Suggestions
              </div>
              {feedback.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-1.5 text-xs text-gray-600">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>{suggestion}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function FeedbackPanel({ feedback, originalText, showDetailedPrompt, onPromptDismiss }: Props) {
  const [promptDismissed, setPromptDismissed] = useState(false);
  const [tipsExpanded, setTipsExpanded] = useState(false);
  
  const [mode, setMode] = useState<FeedbackMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(FEEDBACK_MODE_KEY);
      return (saved as FeedbackMode) || 'quick';
    }
    return 'quick';
  });

  const handleEnableDetailed = () => {
    setMode('detailed');
    setPromptDismissed(true);
    onPromptDismiss?.();
  };

  const handleDismissPrompt = () => {
    setPromptDismissed(true);
    onPromptDismiss?.();
  };

  useEffect(() => {
    localStorage.setItem(FEEDBACK_MODE_KEY, mode);
  }, [mode]);

  const ErrorCard = mode === 'quick' ? QuickErrorCard : DetailedErrorCard;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
      {/* Onboarding Prompt - Compact */}
      {showDetailedPrompt && !promptDismissed && mode === 'quick' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-blue-600">⚡</span>
            <span className="text-blue-800">Ready for detailed feedback?</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleEnableDetailed}
              className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700"
            >
              Enable
            </button>
            <button
              onClick={handleDismissPrompt}
              className="text-blue-600 text-xs hover:text-blue-800"
            >
              Later
            </button>
          </div>
        </div>
      )}

      {/* Correct Translation - Compact */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-green-600 text-sm font-medium">✓ Correct:</span>
            <p 
              className="text-green-800 font-medium cursor-help"
              title={originalText || 'Original Vietnamese sentence'}
            >
              {feedback.correctTranslation}
            </p>
          </div>
          {originalText && (
            <span className="text-xs text-green-600 opacity-70 shrink-0">(hover)</span>
          )}
        </div>
      </div>

      {/* Errors - Compact */}
      {feedback.errors.length > 0 && (
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-sm font-medium text-gray-800">
              Errors ({feedback.errors.length})
            </span>
            <ModeToggle mode={mode} onChange={setMode} />
          </div>
          <div className={`space-y-${mode === 'quick' ? '1' : '2'}`}>
            {feedback.errors.map((error, index) => (
              <ErrorCard key={index} error={error} />
            ))}
          </div>
        </div>
      )}

      {/* Learning Tips - Collapsible, collapsed by default */}
      <CollapsibleTipsSection 
        feedback={feedback} 
        isExpanded={tipsExpanded} 
        onToggle={() => setTipsExpanded(!tipsExpanded)} 
      />
    </div>
  );
}
