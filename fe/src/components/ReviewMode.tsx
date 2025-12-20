import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, RefreshCw, Calendar, Target, Brain } from 'lucide-react';
import { toast } from 'sonner';
import { reviewApi, type ReviewCard } from '../api/reviewApi';

export function ReviewMode() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dueCards, setDueCards] = useState<ReviewCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showingAnswer, setShowingAnswer] = useState(false);

  const loadDueCards = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate({ to: '/' });
        return;
      }

      const cards = await reviewApi.getDueReviews(token);
      setDueCards(cards);
      setLoading(false);

      if (cards.length === 0) {
        toast.success('All reviews completed! 🎉');
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
      toast.error('Failed to load reviews');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDueCards();
  }, []);

  const handleQualitySubmit = async (quality: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token || dueCards.length === 0) return;

      const currentCard = dueCards[currentIndex];
      await reviewApi.submitReview(token, {
        sentenceId: currentCard.sentenceId,
        quality,
      });

      if (currentIndex < dueCards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowingAnswer(false);
      } else {
        toast.success('All reviews completed! 🎉');
        navigate({ to: '/paragraphs' });
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
      toast.error('Failed to submit review');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="font-mono text-slate-400">Loading your reviews...</p>
        </div>
      </div>
    );
  }

  if (dueCards.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6">
        <div className="max-w-2xl text-center">
          <div className="mb-8 inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500">
            <Target className="h-12 w-12 text-white" />
          </div>
          <h1
            className="mb-4 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-5xl font-black text-transparent"
            style={{ fontFamily: 'Archivo Black, sans-serif' }}
          >
            All Caught Up!
          </h1>
          <p className="mb-8 text-xl leading-relaxed font-light text-slate-400">
            No reviews due right now. Come back later to reinforce your learning.
          </p>
          <button
            onClick={() => navigate({ to: '/paragraphs' })}
            className="inline-flex transform items-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 font-bold text-white shadow-xl transition-all hover:scale-105 hover:bg-indigo-700"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Practice
          </button>
        </div>
      </div>
    );
  }

  const currentCard = dueCards[currentIndex];
  const progress = ((currentIndex / dueCards.length) * 100).toFixed(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">
      <div className="pointer-events-none fixed inset-0 opacity-30">
        <div className="absolute top-20 left-20 h-96 w-96 rounded-full bg-indigo-500 blur-3xl" />
        <div className="absolute right-20 bottom-20 h-96 w-96 rounded-full bg-purple-500 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-12">
        <div className="mb-12 flex items-center justify-between">
          <button
            onClick={() => navigate({ to: '/paragraphs' })}
            className="flex items-center gap-2 px-4 py-2 text-slate-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-mono text-sm">Exit</span>
          </button>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 font-mono text-sm text-slate-400">
              <Calendar className="h-4 w-4" />
              <span>{dueCards.length} cards due</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-sm text-slate-400">
              <Brain className="h-4 w-4" />
              <span>Rep: {currentCard.repetitions}</span>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-xs text-slate-500">PROGRESS</span>
            <span className="font-mono text-xs text-slate-400">
              {currentIndex + 1} / {dueCards.length}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-12 shadow-2xl backdrop-blur-xl">
          <div className="mb-12 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/20 px-4 py-2 font-mono text-xs text-indigo-300">
              <RefreshCw className="h-3 w-3" />
              Review Mode
            </div>
            <h2
              className="mb-6 text-4xl font-black"
              style={{ fontFamily: 'Archivo Black, sans-serif' }}
            >
              Sentence #{currentCard.sentenceId}
            </h2>
            <p className="font-mono text-sm text-slate-500">
              Interval: {currentCard.intervalDays} days | Ease: {currentCard.easeFactor.toFixed(2)}
            </p>
          </div>

          <div className="mb-12 flex min-h-[200px] items-center justify-center">
            {!showingAnswer ? (
              <button
                onClick={() => setShowingAnswer(true)}
                className="transform rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-12 py-6 text-xl font-bold text-white shadow-xl transition-all hover:scale-105 hover:from-indigo-500 hover:to-purple-500"
              >
                Show Answer
              </button>
            ) : (
              <div className="w-full">
                <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-8">
                  <p
                    className="text-center text-2xl leading-relaxed"
                    style={{ fontFamily: 'Crimson Pro, serif' }}
                  >
                    Translation for sentence #{currentCard.sentenceId}
                  </p>
                </div>
              </div>
            )}
          </div>

          {showingAnswer && (
            <div className="space-y-4">
              <p className="mb-6 text-center font-mono text-sm text-slate-400">
                How well did you remember?
              </p>
              <div className="grid grid-cols-5 gap-3">
                {[
                  { quality: 0, label: 'Forgot', color: 'from-red-600 to-red-700' },
                  { quality: 1, label: 'Hard', color: 'from-orange-600 to-orange-700' },
                  { quality: 2, label: 'Okay', color: 'from-yellow-600 to-yellow-700' },
                  { quality: 3, label: 'Good', color: 'from-emerald-600 to-emerald-700' },
                  { quality: 4, label: 'Easy', color: 'from-cyan-600 to-cyan-700' },
                ].map(({ quality, label, color }) => (
                  <button
                    key={quality}
                    onClick={() => handleQualitySubmit(quality)}
                    className={`bg-gradient-to-br px-6 py-4 ${color} transform rounded-xl font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl`}
                  >
                    <div className="mb-1 text-2xl">{quality}</div>
                    <div className="text-xs opacity-90">{label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="font-mono text-xs text-slate-500">
            Press 0-4 on your keyboard for quick rating
          </p>
        </div>
      </div>
    </div>
  );
}
