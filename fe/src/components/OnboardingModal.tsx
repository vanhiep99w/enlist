import { useState } from 'react';
import { createPortal } from 'react-dom';

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
            <span className="font-bold text-green-400">Grammar</span>
            <span style={{ color: 'var(--color-text-secondary)' }} className="text-sm">
              Syntax, verb forms, articles
            </span>
          </div>
          <div
            className="flex items-center gap-3 rounded-lg p-3"
            style={{ backgroundColor: 'var(--color-surface-light)', opacity: 0.5 }}
          >
            <span className="font-bold text-blue-400">Word Choice</span>
            <span style={{ color: 'var(--color-text-secondary)' }} className="text-sm">
              Vocabulary accuracy
            </span>
          </div>
          <div
            className="flex items-center gap-3 rounded-lg p-3"
            style={{ backgroundColor: 'var(--color-surface-light)', opacity: 0.5 }}
          >
            <span className="font-bold text-purple-400">Naturalness</span>
            <span style={{ color: 'var(--color-text-secondary)' }} className="text-sm">
              Idiomatic expressions
            </span>
          </div>
        </div>
        <div className="rounded-lg border border-green-700/50 bg-green-900/30 p-3">
          <p className="text-sm text-green-300">
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
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Speed up your workflow with these shortcuts:
        </p>
        <div className="space-y-2">
          <div
            className="flex items-center justify-between rounded-lg p-3"
            style={{ backgroundColor: 'var(--color-surface-light)', opacity: 0.5 }}
          >
            <span style={{ color: 'var(--color-text-secondary)' }}>Submit translation</span>
            <kbd
              className="rounded px-2 py-1 font-mono text-sm"
              style={{
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
              }}
            >
              Ctrl + Enter
            </kbd>
          </div>
          <div
            className="flex items-center justify-between rounded-lg p-3"
            style={{ backgroundColor: 'var(--color-surface-light)', opacity: 0.5 }}
          >
            <span style={{ color: 'var(--color-text-secondary)' }}>Try again</span>
            <kbd
              className="rounded px-2 py-1 font-mono text-sm"
              style={{
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
              }}
            >
              Ctrl + '
            </kbd>
          </div>
          <div
            className="flex items-center justify-between rounded-lg p-3"
            style={{ backgroundColor: 'var(--color-surface-light)', opacity: 0.5 }}
          >
            <span style={{ color: 'var(--color-text-secondary)' }}>Open dictionary</span>
            <kbd
              className="rounded px-2 py-1 font-mono text-sm"
              style={{
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
              }}
            >
              Ctrl + D
            </kbd>
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
              <p className="font-medium text-yellow-400">Credits</p>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Earn credits for each translation. Use them to unlock more content.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">⭐</span>
            <div>
              <p className="font-medium text-yellow-400">Points</p>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Accumulate points based on your translation quality.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="font-medium text-orange-400">Streaks</p>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Practice daily to maintain your streak!
              </p>
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
        <div className="rounded-lg border border-blue-700/50 bg-blue-900/30 p-3">
          <p className="text-sm text-blue-300">
            Tip: Start with <span className="font-bold">Beginner</span> paragraphs and work your way
            up!
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

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
      <div
        className="animate-in fade-in zoom-in-95 w-full max-w-md overflow-hidden rounded-xl shadow-2xl duration-200"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'var(--color-border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress dots */}
        <div className="flex justify-center gap-2 pt-6 pb-2">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`h-2 w-2 rounded-full transition-all duration-200 ${
                idx === currentStep ? 'w-6 bg-blue-500' : idx < currentStep ? 'bg-blue-400' : ''
              }`}
              style={
                idx >= currentStep && idx !== currentStep
                  ? { backgroundColor: 'var(--color-surface-elevated)' }
                  : undefined
              }
              aria-label={`Go to step ${idx + 1}`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <div className="mb-4 text-center">
            <span className="mb-3 block text-4xl">{step.icon}</span>
            <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {step.title}
            </h2>
          </div>
          <div className="min-h-[200px]">{step.content}</div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 pb-6">
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
              className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700"
            >
              {isLastStep ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
