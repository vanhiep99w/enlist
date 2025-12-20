import { createFileRoute } from '@tanstack/react-router';
import { ReviewMode } from '../components/ReviewMode';

export const Route = createFileRoute('/review')({
  component: ReviewPage,
});

function ReviewPage() {
  return <ReviewMode />;
}
