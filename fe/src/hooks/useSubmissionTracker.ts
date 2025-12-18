import { useState, useEffect, useCallback } from 'react';

const SUBMISSION_COUNT_KEY = 'submissionCount';
const DETAILED_MODE_PROMPTED_KEY = 'detailedModePrompted';

interface SubmissionTracker {
  submissionCount: number;
  hasBeenPrompted: boolean;
  shouldShowPrompt: boolean;
  incrementCount: () => void;
  markPrompted: () => void;
}

export function useSubmissionTracker(): SubmissionTracker {
  const [submissionCount, setSubmissionCount] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem(SUBMISSION_COUNT_KEY) || '0', 10);
    }
    return 0;
  });

  const [hasBeenPrompted, setHasBeenPrompted] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(DETAILED_MODE_PROMPTED_KEY) === 'true';
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem(SUBMISSION_COUNT_KEY, String(submissionCount));
  }, [submissionCount]);

  useEffect(() => {
    localStorage.setItem(DETAILED_MODE_PROMPTED_KEY, String(hasBeenPrompted));
  }, [hasBeenPrompted]);

  const incrementCount = useCallback(() => {
    setSubmissionCount(prev => prev + 1);
  }, []);

  const markPrompted = useCallback(() => {
    setHasBeenPrompted(true);
  }, []);

  const shouldShowPrompt = submissionCount >= 5 && !hasBeenPrompted;

  return {
    submissionCount,
    hasBeenPrompted,
    shouldShowPrompt,
    incrementCount,
    markPrompted,
  };
}
