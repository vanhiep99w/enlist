import { useState, useEffect } from 'react';
import type { TranslationFeedback, TranslationError } from '../types/translation';

interface Props {
  feedback: TranslationFeedback;
  showDetailedPrompt?: boolean;
  onPromptDismiss?: () => void;
}

const FEEDBACK_MODE_KEY = 'feedbackMode';
const COLLAPSED_SECTIONS_KEY = 'collapsedSections';

type FeedbackMode = 'quick' | 'detailed';

const errorTypeBadgeColors: Record<TranslationError['type'], string> = {
  GRAMMAR: 'bg-purple-100 text-purple-800',
  WORD_CHOICE: 'bg-blue-100 text-blue-800',
  NATURALNESS: 'bg-orange-100 text-orange-800',
};

const errorTypeHeaderColors: Record<TranslationError['type'], string> = {
  GRAMMAR: 'border-purple-200 bg-purple-50',
  WORD_CHOICE: 'border-blue-200 bg-blue-50',
  NATURALNESS: 'border-orange-200 bg-orange-50',
};

const errorTypeLabels: Record<TranslationError['type'], string> = {
  GRAMMAR: 'Grammar',
  WORD_CHOICE: 'Word Choice',
  NATURALNESS: 'Naturalness',
};

function QuickErrorCard({ error }: { error: TranslationError }) {
  return (
    <div className="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-lg border border-gray-200">
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${errorTypeBadgeColors[error.type]}`}
      >
        {errorTypeLabels[error.type]}
      </span>
      <span className="text-sm text-gray-700">
        {error.quickFix || error.correction}
      </span>
    </div>
  );
}

function DetailedErrorCard({ error }: { error: TranslationError }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 transition-all duration-300">
      <div className="flex items-start gap-3">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${errorTypeBadgeColors[error.type]}`}
        >
          {errorTypeLabels[error.type]}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 font-medium">{error.issue}</p>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Correction:</span>{' '}
              <span className="text-green-700">{error.correction}</span>
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Explanation:</span> {error.explanation}
            </p>
            {error.quickFix && (
              <p className="text-sm text-blue-600">
                <span className="font-medium">Quick fix:</span> {error.quickFix}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ModeToggle({ mode, onChange }: { mode: FeedbackMode; onChange: (mode: FeedbackMode) => void }) {
  return (
    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onChange('quick')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
          mode === 'quick'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Quick Fix
      </button>
      <button
        onClick={() => onChange('detailed')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
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

interface CollapsibleSectionProps {
  type: TranslationError['type'];
  errors: TranslationError[];
  isExpanded: boolean;
  onToggle: () => void;
  mode: FeedbackMode;
}

function CollapsibleSection({ type, errors, isExpanded, onToggle, mode }: CollapsibleSectionProps) {
  const ErrorCard = mode === 'quick' ? QuickErrorCard : DetailedErrorCard;

  return (
    <div className={`border rounded-lg overflow-hidden transition-all duration-300 ${errorTypeHeaderColors[type]}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-opacity-80 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${errorTypeBadgeColors[type]}`}>
            {errorTypeLabels[type]}
          </span>
          <span className="text-sm font-medium text-gray-700">
            {errors.length} {errors.length === 1 ? 'issue' : 'issues'}
          </span>
        </div>
        <svg
          className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className={`p-3 pt-0 space-y-${mode === 'quick' ? '1' : '2'}`}>
          {errors.map((error, index) => (
            <ErrorCard key={`${type}-${index}`} error={error} />
          ))}
        </div>
      </div>
    </div>
  );
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

export function FeedbackPanel({ feedback, showDetailedPrompt, onPromptDismiss }: Props) {
  const isMobile = useIsMobile();
  const [promptDismissed, setPromptDismissed] = useState(false);
  
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

  const errorTypes = Object.keys(
    feedback.errors.reduce((acc, e) => ({ ...acc, [e.type]: true }), {} as Record<string, boolean>)
  ) as TranslationError['type'][];

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(COLLAPSED_SECTIONS_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fall through
        }
      }
    }
    return errorTypes.reduce((acc, type) => ({ ...acc, [type]: !isMobile }), {} as Record<string, boolean>);
  });

  useEffect(() => {
    localStorage.setItem(FEEDBACK_MODE_KEY, mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem(COLLAPSED_SECTIONS_KEY, JSON.stringify(expandedSections));
  }, [expandedSections]);

  const groupedErrors = feedback.errors.reduce(
    (acc, error) => {
      if (!acc[error.type]) {
        acc[error.type] = [];
      }
      acc[error.type].push(error);
      return acc;
    },
    {} as Record<TranslationError['type'], TranslationError[]>
  );

  const toggleSection = (type: string) => {
    setExpandedSections(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const allExpanded = errorTypes.every(type => expandedSections[type]);
  const toggleAll = () => {
    const newState = !allExpanded;
    setExpandedSections(errorTypes.reduce((acc, type) => ({ ...acc, [type]: newState }), {} as Record<string, boolean>));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      {showDetailedPrompt && !promptDismissed && mode === 'quick' && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="shrink-0 mt-0.5">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">Ready for more detailed feedback?</p>
              <p className="text-sm text-blue-700 mt-1">
                You've completed 5+ exercises! Enable detailed mode for in-depth explanations and learning tips.
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleEnableDetailed}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  Enable Detailed Mode
                </button>
                <button
                  onClick={handleDismissPrompt}
                  className="px-3 py-1.5 text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Correct Translation</h3>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">{feedback.correctTranslation}</p>
        </div>
      </div>

      {feedback.errors.length > 0 && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-800">
                Errors ({feedback.errors.length})
              </h3>
              <button
                onClick={toggleAll}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                {allExpanded ? 'Collapse all' : 'Expand all'}
              </button>
            </div>
            <ModeToggle mode={mode} onChange={setMode} />
          </div>
          <div className="space-y-2">
            {(Object.entries(groupedErrors) as [TranslationError['type'], TranslationError[]][]).map(([type, errors]) => (
              <CollapsibleSection
                key={type}
                type={type}
                errors={errors}
                isExpanded={expandedSections[type] ?? true}
                onToggle={() => toggleSection(type)}
                mode={mode}
              />
            ))}
          </div>
        </div>
      )}

      {feedback.articleTips && feedback.articleTips.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-purple-600">📚</span> Article Tips for Vietnamese Learners
          </h3>
          <div className="space-y-3">
            {feedback.articleTips.map((tip, index) => (
              <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm font-medium text-purple-900">{tip.context}</p>
                <p className="text-sm text-purple-700 mt-1">{tip.rule}</p>
                <p className="text-sm text-purple-600 mt-2 italic">Example: {tip.example}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {feedback.collocationHighlights && feedback.collocationHighlights.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-blue-600">🔗</span> Collocation Learning
          </h3>
          <div className="space-y-3">
            {feedback.collocationHighlights.map((coll, index) => (
              <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-red-600 line-through">{coll.incorrect}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-green-600 font-medium">{coll.correct}</span>
                </div>
                <p className="text-sm text-blue-700 mt-2">{coll.explanation}</p>
                {coll.relatedCollocations.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs text-blue-600 font-medium">Related: </span>
                    <span className="text-xs text-blue-500">{coll.relatedCollocations.join(', ')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {feedback.reasoningTips && feedback.reasoningTips.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-amber-600">💡</span> Reasoning Words (for/because/since/as)
          </h3>
          <div className="space-y-3">
            {feedback.reasoningTips.map((tip, index) => (
              <div key={index} className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-red-600 line-through">{tip.incorrectWord}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-green-600 font-medium">{tip.correctWord}</span>
                </div>
                <p className="text-sm font-medium text-amber-900 mt-2">{tip.context}</p>
                <p className="text-sm text-amber-700 mt-1">{tip.explanation}</p>
                {tip.examples.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <span className="text-xs text-amber-600 font-medium">Examples:</span>
                    {tip.examples.map((example, i) => (
                      <p key={i} className="text-xs text-amber-600 italic ml-2">• {example}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {feedback.registerTips && feedback.registerTips.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-rose-600">🎭</span> Tone & Register (Formal vs Casual)
          </h3>
          <div className="space-y-3">
            {feedback.registerTips.map((tip, index) => (
              <div key={index} className="bg-rose-50 border border-rose-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">Casual:</span>
                  <span className="text-rose-600">{tip.casualWord}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-gray-500">Formal:</span>
                  <span className="text-green-600 font-medium">{tip.formalWord}</span>
                </div>
                <p className="text-sm font-medium text-rose-900 mt-2">{tip.context}</p>
                <p className="text-sm text-rose-700 mt-1">{tip.explanation}</p>
                {tip.formalAlternatives.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs text-rose-600 font-medium">Other formal options: </span>
                    <span className="text-xs text-rose-500">{tip.formalAlternatives.join(', ')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {feedback.suggestions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Suggestions</h3>
          <ul className="space-y-2">
            {feedback.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2">
                <svg
                  className="h-5 w-5 text-blue-500 mt-0.5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <span className="text-sm text-gray-700">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
