import { useState, useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { createRandomSession, getUserRandomSessions, type RandomSession } from '../api/sessionApi';

export const Route = createFileRoute('/random-session')({
  component: RandomSessionPageWrapper,
});

function RandomSessionPageWrapper() {
  return (
    <ProtectedRoute>
      <RandomSessionPage />
    </ProtectedRoute>
  );
}

function RandomSessionPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeRandomSession();
  }, []);

  const initializeRandomSession = async () => {
    try {
      setIsLoading(true);

      // First, check if there's an active random session
      const userSessions = await getUserRandomSessions();
      const activeSession = userSessions.find((s) => s.status === 'ACTIVE');

      let session: RandomSession;

      if (activeSession && activeSession.currentParagraph?.paragraphSessionId) {
        // Resume existing active session
        console.log('Resuming active random session:', activeSession);
        session = activeSession;
      } else {
        // Create new session
        console.log('Creating new random session');
        session = await createRandomSession({
          targetLanguage: 'en',
          initialDifficulty: 1,
        });
        console.log('Created random session:', session);
      }

      // Navigate to the paragraph session for the current paragraph
      if (session.currentParagraph?.paragraphSessionId) {
        // For random sessions, pass the paragraphSessionId as the route param
        // The session route will detect randomSessionId and treat it as sessionId
        navigate({
          to: '/session/$paragraphId',
          params: { paragraphId: String(session.currentParagraph.paragraphSessionId) },
          search: { randomSessionId: session.id },
        });
      } else {
        console.error('No current paragraph or paragraphSessionId in session:', session);
        setError('Failed to initialize practice session - no paragraph available');
      }
    } catch (err) {
      console.error('Failed to create random session:', err);
      setError('Failed to start random practice session');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: 'var(--color-surface-dark)' }}
      >
        <div className="text-center">
          <div className="mb-4 text-4xl">🎲</div>
          <h2 className="mb-2 text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Preparing Your Adaptive Practice
          </h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Generating a personalized paragraph just for you...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: 'var(--color-surface-dark)' }}
      >
        <div className="text-center">
          <div className="mb-4 text-4xl">⚠️</div>
          <h2 className="mb-2 text-xl font-semibold" style={{ color: 'var(--color-error)' }}>
            {error}
          </h2>
          <button
            onClick={() => navigate({ to: '/' })}
            className="mt-4 rounded-lg px-6 py-2"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'white',
            }}
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return null;
}
