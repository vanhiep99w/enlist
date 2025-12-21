import { createFileRoute } from '@tanstack/react-router';
import { ParagraphList } from '../components/ParagraphList';
import { ProtectedRoute } from '../components/ProtectedRoute';

export const Route = createFileRoute('/paragraphs')({
  component: ParagraphsPage,
});

function ParagraphsPage() {
  return (
    <ProtectedRoute>
      <ParagraphList />
    </ProtectedRoute>
  );
}
