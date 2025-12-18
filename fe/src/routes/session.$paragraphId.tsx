import { createFileRoute } from '@tanstack/react-router';
import { ParagraphSession } from '../components/ParagraphSession';

export const Route = createFileRoute('/session/$paragraphId')({
  component: SessionPage,
});

function SessionPage() {
  const { paragraphId } = Route.useParams();
  return <ParagraphSession paragraphId={Number(paragraphId)} />;
}
