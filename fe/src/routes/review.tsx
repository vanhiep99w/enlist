import { createFileRoute } from '@tanstack/react-router';
import { ReviewMode } from '../components/ReviewMode';
import { ProtectedRoute } from '../components/ProtectedRoute';

export const Route = createFileRoute('/review')({
  component: ReviewPage,
});

function ReviewPage() {
  return (
    <ProtectedRoute>
      <ReviewMode />
    </ProtectedRoute>
  );
}
