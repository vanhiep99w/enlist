import { createFileRoute } from '@tanstack/react-router';
import { ParagraphList } from '../components/ParagraphList';

export const Route = createFileRoute('/paragraphs')({
  component: ParagraphsPage,
});

function ParagraphsPage() {
  return <ParagraphList />;
}
