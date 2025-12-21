import { useState, useEffect } from 'react';
import { useDailyProgress, useSetDailyGoal } from '../hooks/useUser';
import { motion } from 'motion/react';
import { Target, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

export function DailyGoalSettings() {
  const { user } = useAuth();
  const userId = user?.id ?? 0;
  const { data: progress } = useDailyProgress(userId);
  const setDailyGoalMutation = useSetDailyGoal();

  const [tempGoal, setTempGoal] = useState<number>(10);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (progress?.dailyGoal) {
      setTempGoal(progress.dailyGoal);
    }
  }, [progress?.dailyGoal]);

  const handleSaveGoal = () => {
    if (tempGoal < 1 || tempGoal > 100) {
      toast.error('Goal must be between 1 and 100');
      return;
    }

    setDailyGoalMutation.mutate(
      { userId, dailyGoal: tempGoal },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success(`Daily goal updated to ${tempGoal} sentences!`);
        },
        onError: () => {
          toast.error('Failed to update goal');
        },
      }
    );
  };

  const handleCancel = () => {
    setTempGoal(progress?.dailyGoal || 10);
    setIsEditing(false);
  };

  const adjustGoal = (delta: number) => {
    setTempGoal((prev) => Math.max(1, Math.min(100, prev + delta)));
  };

  if (!progress) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl p-6"
      style={{
        background:
          'linear-gradient(135deg, rgba(var(--color-surface-elevated-rgb), 0.8), rgba(var(--color-surface-rgb), 0.6))',
        border: '1.5px solid rgba(var(--color-border-rgb), 0.4)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 opacity-10">
        <Target size={128} style={{ color: 'var(--color-primary)' }} />
      </div>

      <div className="relative">
        <div className="mb-4 flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              boxShadow: '0 4px 14px var(--glow-primary)',
            }}
          >
            <Target size={22} style={{ color: '#fff' }} />
          </div>
          <div>
            <h3
              className="text-lg font-bold tracking-tight"
              style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}
            >
              Daily Goal
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Set your daily sentence target
            </p>
          </div>
        </div>

        {!isEditing ? (
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span
                className="text-5xl font-black tracking-tighter"
                style={{
                  color: 'var(--color-primary)',
                  fontFamily: 'var(--font-display)',
                  textShadow: '0 0 20px var(--glow-primary)',
                }}
              >
                {progress.dailyGoal}
              </span>
              <span
                className="text-xl font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                sentences
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(true)}
              className="rounded-lg px-5 py-2.5 font-semibold transition-all"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                color: '#fff',
                boxShadow: '0 4px 12px var(--glow-primary)',
              }}
            >
              Change
            </motion.button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => adjustGoal(-5)}
                className="flex h-10 w-10 items-center justify-center rounded-lg transition-all"
                style={{
                  background: 'rgba(var(--color-surface-dark-rgb), 0.6)',
                  border: '1.5px solid rgba(var(--color-border-rgb), 0.5)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <Minus size={18} />
              </motion.button>

              <div
                className="flex flex-1 items-center justify-center rounded-xl py-4"
                style={{
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '2px solid var(--color-primary)',
                  boxShadow: '0 0 20px var(--glow-primary)',
                }}
              >
                <input
                  type="number"
                  value={tempGoal}
                  onChange={(e) => setTempGoal(parseInt(e.target.value) || 1)}
                  min="1"
                  max="100"
                  className="w-20 bg-transparent text-center text-4xl font-black tracking-tighter outline-none"
                  style={{
                    color: 'var(--color-primary)',
                    fontFamily: 'var(--font-display)',
                  }}
                />
                <span
                  className="ml-2 text-lg font-medium"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  sentences
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => adjustGoal(5)}
                className="flex h-10 w-10 items-center justify-center rounded-lg transition-all"
                style={{
                  background: 'rgba(var(--color-surface-dark-rgb), 0.6)',
                  border: '1.5px solid rgba(var(--color-border-rgb), 0.5)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <Plus size={18} />
              </motion.button>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveGoal}
                disabled={setDailyGoalMutation.isPending}
                className="flex-1 rounded-lg py-3 font-bold tracking-wide transition-all disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                  color: '#fff',
                  boxShadow: '0 4px 16px var(--glow-primary)',
                }}
              >
                {setDailyGoalMutation.isPending ? 'Saving...' : 'Save Goal'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCancel}
                disabled={setDailyGoalMutation.isPending}
                className="flex-1 rounded-lg py-3 font-semibold transition-all disabled:opacity-50"
                style={{
                  background: 'rgba(var(--color-surface-dark-rgb), 0.6)',
                  border: '1.5px solid rgba(var(--color-border-rgb), 0.5)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                Cancel
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
