import { createFileRoute } from '@tanstack/react-router';
import { ParagraphSession } from '../components/ParagraphSession';
import { ProtectedRoute } from '../components/ProtectedRoute';

interface SessionSearch {
  randomSessionId?: number;
}

export const Route = createFileRoute('/session/$paragraphId')({
  component: SessionPage,
  validateSearch: (search: Record<string, unknown>): SessionSearch => {
    return {
      randomSessionId:
        typeof search.randomSessionId === 'number' ? search.randomSessionId : undefined,
    };
  },
});

function SessionPage() {
  const { paragraphId } = Route.useParams();
  const { randomSessionId } = Route.useSearch();

  // If this is a random session with sessionId passed as paragraphId, treat it as sessionId
  const isRandomSession = randomSessionId !== undefined;
  const actualSessionId = isRandomSession ? Number(paragraphId) : undefined;
  const actualParagraphId = !isRandomSession ? Number(paragraphId) : undefined;

  return (
    <ProtectedRoute>
      <ParagraphSession
        paragraphId={actualParagraphId}
        sessionId={actualSessionId}
        randomSessionId={randomSessionId}
      />
    </ProtectedRoute>
  );
}
