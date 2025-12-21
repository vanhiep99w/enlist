import { createFileRoute } from '@tanstack/react-router';
import { ParagraphSession } from '../components/ParagraphSession';
import { ProtectedRoute } from '../components/ProtectedRoute';

export const Route = createFileRoute('/session/$paragraphId')({
  component: SessionPage,
});

function SessionPage() {
  const { paragraphId } = Route.useParams();
  return (
    <ProtectedRoute>
      <ParagraphSession paragraphId={Number(paragraphId)} />
    </ProtectedRoute>
  );
}
