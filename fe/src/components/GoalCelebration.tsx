/* eslint-disable react-hooks/purity */
import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Sparkles, Star } from 'lucide-react';

interface Props {
  isAchieved: boolean;
  onComplete?: () => void;
}

export function GoalCelebration({ isAchieved, onComplete }: Props) {
  const [show, setShow] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  // Pre-generate random values for confetti to avoid impure functions during render
  const confettiData = useMemo(() => {
    const data = [];
    for (let i = 0; i < 50; i++) {
      data.push({
        randomY: 600 + Math.random() * 200,
        randomX: (Math.random() - 0.5) * 400,
        randomRotate: Math.random() * 720 - 360,
        randomDuration: 2 + Math.random() * 1,
        randomDelay: Math.random() * 0.5,
        randomLeft: Math.random() * 100,
      });
    }
    return data;
  }, []);

  useEffect(() => {
    if (isAchieved && !hasShown) {
      setShow(true);
      setHasShown(true);

      const timer = setTimeout(() => {
        setShow(false);
        onComplete?.();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isAchieved, hasShown, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)' }}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotateY: -180 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="relative"
          >
            <div className="absolute inset-0 -z-10 animate-pulse">
              <div
                className="h-full w-full rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(251, 191, 36, 0.4), transparent 70%)',
                  filter: 'blur(40px)',
                }}
              />
            </div>

            <div
              className="relative overflow-hidden rounded-3xl p-12 text-center"
              style={{
                background:
                  'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(251, 146, 60, 0.15))',
                border: '2px solid rgba(251, 191, 36, 0.4)',
                boxShadow: '0 0 60px rgba(251, 191, 36, 0.3)',
              }}
            >
              <motion.div
                animate={{
                  rotate: [0, -10, 10, -10, 0],
                  scale: [1, 1.1, 1, 1.05, 1],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
                className="mb-6 flex justify-center"
              >
                <div
                  className="rounded-full p-6"
                  style={{
                    background: 'linear-gradient(135deg, #fbbf24, #fb923c)',
                    boxShadow: '0 8px 32px rgba(251, 191, 36, 0.5)',
                  }}
                >
                  <Trophy
                    size={80}
                    style={{ color: '#fff', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}
                  />
                </div>
              </motion.div>

              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-3 text-5xl font-black tracking-tight"
                style={{
                  color: '#fbbf24',
                  fontFamily: 'var(--font-display)',
                  textShadow: '0 2px 20px rgba(251, 191, 36, 0.5)',
                }}
              >
                GOAL CRUSHED!
              </motion.h2>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xl font-semibold"
                style={{ color: '#fef3c7' }}
              >
                You've completed your daily target! 🎉
              </motion.p>

              {[...Array(30)].map((_, i) => {
                const angle = (i / 30) * Math.PI * 2;
                const radius = 200 + Math.random() * 100;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                  <motion.div
                    key={i}
                    className="pointer-events-none absolute"
                    style={{
                      left: '50%',
                      top: '50%',
                    }}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                    animate={{
                      x,
                      y,
                      scale: [0, 1, 0.8],
                      opacity: [1, 1, 0],
                      rotate: Math.random() * 360,
                    }}
                    transition={{
                      duration: 1.5 + Math.random() * 0.5,
                      delay: Math.random() * 0.3,
                      ease: 'easeOut',
                    }}
                  >
                    {i % 3 === 0 ? (
                      <Star
                        size={16 + Math.random() * 12}
                        style={{
                          color: ['#fbbf24', '#fb923c', '#fef3c7'][i % 3],
                          fill: 'currentColor',
                        }}
                      />
                    ) : (
                      <Sparkles
                        size={16 + Math.random() * 12}
                        style={{
                          color: ['#fbbf24', '#fb923c', '#fef3c7'][i % 3],
                          fill: 'currentColor',
                        }}
                      />
                    )}
                  </motion.div>
                );
              })}

              {confettiData.map((data, i) => (
                <motion.div
                  key={`confetti-${i}`}
                  className="pointer-events-none absolute h-2 w-2 rounded-full"
                  style={{
                    left: `${data.randomLeft}%`,
                    top: '-10%',
                    background: ['#fbbf24', '#fb923c', '#fef3c7', '#22d3ee'][i % 4],
                  }}
                  animate={{
                    y: [0, data.randomY],
                    x: [0, data.randomX],
                    rotate: [0, data.randomRotate],
                    opacity: [1, 1, 0],
                  }}
                  transition={{
                    duration: data.randomDuration,
                    delay: data.randomDelay,
                    ease: 'easeIn',
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
