import { useState } from 'react';

interface Props {
  isOpen: boolean;
  onComplete: () => void;
}

interface Step {
  title: string;
  icon: string;
  content: React.ReactNode;
}

const steps: Step[] = [
  {
    title: 'Welcome to Enlist!',
    icon: '👋',
    content: (
      <div className="space-y-3">
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Master English translation through interactive practice sessions.
        </p>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Translate Vietnamese sentences to English and receive instant AI-powered feedback.
        </p>
      </div>
    ),
  },
  {
    title: 'How Scoring Works',
    icon: '📊',
    content: (
      <div className="space-y-4">
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Your translations are evaluated on three criteria:
        </p>
        <div className="grid gap-2">
          <div 
            className="flex items-center gap-3 rounded-lg p-3"
            style={{ backgroundColor: 'var(--color-surface-light)', opacity: 0.5 }}
          >
            <span className="text-green-400 font-bold">Grammar</span>
            <span style={{ color: 'var(--color-text-secondary)' }} className="text-sm">Syntax, verb forms, articles</span>
          </div>
          <div 
            className="flex items-center gap-3 rounded-lg p-3"
            style={{ backgroundColor: 'var(--color-surface-light)', opacity: 0.5 }}
          >
            <span className="text-blue-400 font-bold">Word Choice</span>
            <span style={{ color: 'var(--color-text-secondary)' }} className="text-sm">Vocabulary accuracy</span>
          </div>
          <div 
            className="flex items-center gap-3 rounded-lg p-3"
            style={{ backgroundColor: 'var(--color-surface-light)', opacity: 0.5 }}
          >
            <span className="text-purple-400 font-bold">Naturalness</span>
            <span style={{ color: 'var(--color-text-secondary)' }} className="text-sm">Idiomatic expressions</span>
          </div>
        </div>
        <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-3">
          <p className="text-green-300 text-sm">
            <span className="font-bold">80%</span> or higher is considered passing!
          </p>
        </div>
      </div>
    ),
  },
  {
    title: 'Keyboard Shortcuts',
    icon: '⌨️',
    content: (
      <div className="space-y-3">
        <p style={{ color: 'var(--color-text-secondary)' }}>Speed up your workflow with these shortcuts:</p>
        <div className="space-y-2">
          <div 
            className="flex items-center justify-between rounded-lg p-3"
            style={{ backgroundColor: 'var(--color-surface-light)', opacity: 0.5 }}
          >
            <span style={{ color: 'var(--color-text-secondary)' }}>Submit translation</span>
            <kbd 
              className="px-2 py-1 rounded text-sm font-mono"
              style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
            >Ctrl + Enter</kbd>
          </div>
          <div 
            className="flex items-center justify-between rounded-lg p-3"
            style={{ backgroundColor: 'var(--color-surface-light)', opacity: 0.5 }}
          >
            <span style={{ color: 'var(--color-text-secondary)' }}>Try again</span>
            <kbd 
              className="px-2 py-1 rounded text-sm font-mono"
              style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
            >Ctrl + '</kbd>
          </div>
          <div 
            className="flex items-center justify-between rounded-lg p-3"
            style={{ backgroundColor: 'var(--color-surface-light)', opacity: 0.5 }}
          >
            <span style={{ color: 'var(--color-text-secondary)' }}>Open dictionary</span>
            <kbd 
              className="px-2 py-1 rounded text-sm font-mono"
              style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
            >Ctrl + D</kbd>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Credits & Progress',
    icon: '💰',
    content: (
      <div className="space-y-4">
        <p style={{ color: 'var(--color-text-secondary)' }}>Track your learning journey:</p>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <p className="text-yellow-400 font-medium">Credits</p>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Earn credits for each translation. Use them to unlock more content.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">⭐</span>
            <div>
              <p className="text-yellow-400 font-medium">Points</p>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Accumulate points based on your translation quality.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="text-orange-400 font-medium">Streaks</p>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Practice daily to maintain your streak!</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "You're All Set!",
    icon: '🚀',
    content: (
      <div className="space-y-4 text-center">
        <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
          Ready to start your translation journey?
        </p>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Choose a paragraph from the library and begin practicing.
        </p>
        <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-3">
          <p className="text-blue-300 text-sm">
            Tip: Start with <span className="font-bold">Beginner</span> paragraphs and work your way up!
          </p>
        </div>
      </div>
    ),
  },
];

export function OnboardingModal({ isOpen, onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div 
        className="rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        style={{ backgroundColor: 'var(--color-surface)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress dots */}
        <div className="flex justify-center gap-2 pt-6 pb-2">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                idx === currentStep
                  ? 'bg-blue-500 w-6'
                  : idx < currentStep
                  ? 'bg-blue-400'
                  : ''
              }`}
              style={idx >= currentStep && idx !== currentStep ? { backgroundColor: 'var(--color-surface-elevated)' } : undefined}
              aria-label={`Go to step ${idx + 1}`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <div className="text-center mb-4">
            <span className="text-4xl mb-3 block">{step.icon}</span>
            <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{step.title}</h2>
          </div>
          <div className="min-h-[200px]">{step.content}</div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-sm transition-colors hover:opacity-80"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Skip tutorial
          </button>
          <div className="flex gap-2">
            {!isFirstStep && (
              <button
                onClick={handlePrev}
                className="px-4 py-2 transition-colors"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {isLastStep ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
