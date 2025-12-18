import { createFileRoute } from '@tanstack/react-router';
import { TranslationExercise } from '../components/TranslationExercise';

export const Route = createFileRoute('/')({
  component: HomePage,
});

const sampleExercise = {
  originalText: 'Tôi muốn cảm ơn bạn vì món quà đáng yêu này',
  context: 'Writing a thank-you note to a friend',
};

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <TranslationExercise exercise={sampleExercise} />
    </div>
  );
}
