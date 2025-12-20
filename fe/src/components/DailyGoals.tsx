/* eslint-disable react-hooks/purity */
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSoundEffects } from '../hooks/useSoundEffects';

interface DailyGoalsProps {
  userId?: number;
}

interface GoalData {
  dailyGoal: number;
  dailyProgressCount: number;
  isGoalAchieved: boolean;
}

export function DailyGoals({ userId = 1 }: DailyGoalsProps) {
  const [goalData, setGoalData] = useState<GoalData>({
    dailyGoal: 10,
    dailyProgressCount: 0,
    isGoalAchieved: false,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [newGoal, setNewGoal] = useState(10);
  const [showCelebration, setShowCelebration] = useState(false);
  const { playAchievementSound } = useSoundEffects();

  // Pre-generate random values for confetti (outside of render)
  const confettiData = useMemo(() => {
    const data = [];
    for (let i = 0; i < 20; i++) {
      data.push({
        x: 50 + (Math.random() - 0.5) * 200,
        y: 50 + (Math.random() - 0.5) * 200,
        scale: Math.random() * 2 + 1,
        rotate: Math.random() * 360,
        color: ['#fbbf24', '#f59e0b', '#06b6d4', '#8b5cf6', '#ec4899'][
          Math.floor(Math.random() * 5)
        ],
      });
    }
    return data;
  }, []);

  // Fetch daily progress
  useEffect(() => {
    fetch(`http://localhost:8080/api/users/${userId}/daily-progress`)
      .then((res) => res.json())
      .then((data) => {
        // Ensure all numeric fields have valid values
        const validData = {
          dailyGoal: data.dailyGoal || 10,
          dailyProgressCount: data.dailyProgressCount || 0,
          isGoalAchieved: data.isGoalAchieved || false,
        };
        setGoalData(validData);
        setNewGoal(validData.dailyGoal);

        // Trigger celebration if goal just achieved
        if (validData.isGoalAchieved && !showCelebration) {
          setShowCelebration(true);
          playAchievementSound();
          setTimeout(() => setShowCelebration(false), 3000);
        }
      })
      .catch((err) => console.error('Failed to fetch daily progress:', err));
  }, [userId, playAchievementSound, showCelebration]);

  const handleSetGoal = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/users/${userId}/daily-goal`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dailyGoal: newGoal }),
      });
      const data = await response.json();
      const validData = {
        dailyGoal: data.dailyGoal || 10,
        dailyProgressCount: data.dailyProgressCount || 0,
        isGoalAchieved: data.isGoalAchieved || false,
      };
      setGoalData(validData);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to set daily goal:', err);
    }
  };

  const progress = Math.min(
    ((goalData.dailyProgressCount || 0) / (goalData.dailyGoal || 1)) * 100,
    100
  );

  return (
    <div className="relative">
      {/* Main Card with Neo-brutalist aesthetic */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="group relative overflow-hidden rounded-2xl border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
        style={{
          background: goalData.isGoalAchieved
            ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
            : 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
        }}
      >
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 h-24 w-24 rounded-bl-full bg-black opacity-10" />

        {/* Header */}
        <div className="relative z-10 mb-6 flex items-center justify-between">
          <div>
            <h3 className="font-display text-2xl font-black tracking-tight text-black uppercase">
              Daily Goal
            </h3>
            <p className="mt-1 text-sm font-bold text-black/70">Keep the streak alive! 🔥</p>
          </div>

          {!isEditing ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(true)}
              className="rounded-xl border-2 border-black bg-white px-4 py-2 font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              ✏️ Edit
            </motion.button>
          ) : null}
        </div>

        {/* Progress Section */}
        <div className="relative z-10 mb-6">
          {/* Circular Progress Ring */}
          <div className="relative mx-auto h-48 w-48">
            {/* Background ring */}
            <svg className="absolute inset-0 h-full w-full -rotate-90 transform">
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="none"
                stroke="rgba(0,0,0,0.2)"
                strokeWidth="16"
              />
              {/* Progress ring */}
              <motion.circle
                cx="96"
                cy="96"
                r="88"
                fill="none"
                stroke="black"
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 88}
                initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 88 * (1 - progress / 100) }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                key={goalData.dailyProgressCount}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="font-display text-6xl font-black text-black"
              >
                {goalData.dailyProgressCount}
              </motion.div>
              <div className="mt-1 text-xl font-bold text-black/70">/ {goalData.dailyGoal}</div>
              <div className="mt-2 text-sm font-bold tracking-wide text-black/60 uppercase">
                Sentences
              </div>
            </div>
          </div>

          {/* Progress bar alternative (hidden on large screens) */}
          <div className="mt-6">
            <div className="relative h-8 overflow-hidden rounded-full border-4 border-black bg-white">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="h-full bg-black"
              />
              <div className="absolute inset-0 flex items-center justify-center font-bold text-white mix-blend-difference">
                {Math.round(progress)}%
              </div>
            </div>
          </div>
        </div>

        {/* Edit Goal Section */}
        <AnimatePresence initial={false}>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, scaleY: 0, marginTop: 0 }}
              animate={{ opacity: 1, scaleY: 1, marginTop: 24 }}
              exit={{ opacity: 0, scaleY: 0, marginTop: 0 }}
              transition={{
                duration: 0.25,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              style={{ originY: 0 }}
              className="relative z-10 overflow-hidden rounded-xl border-4 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <label className="mb-2 block text-sm font-bold text-black uppercase">
                Set New Goal
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={newGoal}
                  onChange={(e) => setNewGoal(parseInt(e.target.value) || 10)}
                  className="flex-1 rounded-lg border-4 border-black px-4 py-2 font-bold focus:ring-4 focus:ring-black/20 focus:outline-none"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSetGoal}
                  className="rounded-lg border-4 border-black bg-amber-400 px-6 py-2 font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  Save
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setIsEditing(false);
                    setNewGoal(goalData.dailyGoal);
                  }}
                  className="rounded-lg border-4 border-black bg-gray-200 px-4 py-2 font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Achievement Badge */}
        {goalData.isGoalAchieved && (
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="absolute -top-3 -right-3 z-20"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-black bg-gradient-to-br from-yellow-300 to-amber-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-4xl">⭐</span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Celebration Confetti */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 z-30"
          >
            {confettiData.map((data, i) => (
              <motion.div
                key={i}
                initial={{
                  x: '50%',
                  y: '50%',
                  scale: 0,
                  rotate: 0,
                }}
                animate={{
                  x: `${data.x}%`,
                  y: `${data.y}%`,
                  scale: data.scale,
                  rotate: data.rotate,
                }}
                transition={{
                  duration: 2,
                  ease: 'easeOut',
                }}
                className="absolute h-4 w-4 rounded-full"
                style={{
                  backgroundColor: data.color,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
