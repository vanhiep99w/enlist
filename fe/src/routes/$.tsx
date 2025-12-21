import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'motion/react';
import { Home, ArrowLeft, Search, Compass } from 'lucide-react';

export const Route = createFileRoute('/$')({
  component: NotFoundPage,
});

function NotFoundPage() {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden p-6"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* Animated background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Floating orbs */}
        <motion.div
          className="absolute h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'var(--color-primary)', top: '10%', left: '10%' }}
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute h-64 w-64 rounded-full opacity-15 blur-3xl"
          style={{ background: 'var(--color-accent)', bottom: '20%', right: '15%' }}
          animate={{ x: [0, -40, 0], y: [0, -50, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute h-48 w-48 rounded-full opacity-10 blur-2xl"
          style={{ background: '#22c55e', top: '60%', left: '60%' }}
          animate={{ x: [0, 30, 0], y: [0, 40, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(var(--color-text-muted) 1px, transparent 1px),
              linear-gradient(90deg, var(--color-text-muted) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-2xl text-center">
        {/* 404 number with glitch effect */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="relative mb-8"
        >
          <h1
            className="text-[12rem] leading-none font-black tracking-tighter select-none sm:text-[16rem]"
            style={{
              background:
                'linear-gradient(135deg, var(--color-primary), var(--color-accent), var(--color-primary))',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradient-shift 4s ease infinite',
            }}
          >
            404
          </h1>
          {/* Shadow layer */}
          <span
            className="pointer-events-none absolute inset-0 text-[12rem] leading-none font-black tracking-tighter opacity-20 blur-xl select-none sm:text-[16rem]"
            style={{ color: 'var(--color-primary)' }}
          >
            404
          </span>
        </motion.div>

        {/* Compass icon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, var(--color-surface), var(--color-surface-light))',
            border: '1px solid var(--color-border)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Compass className="h-10 w-10" style={{ color: 'var(--color-primary)' }} />
          </motion.div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2
            className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Lost in translation?
          </h2>
          <p
            className="mx-auto mb-8 max-w-md text-base"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            The page you're looking for doesn't exist or has been moved. Let's get you back on
            track.
          </p>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Link
            to="/"
            className="group flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95"
            style={{
              background:
                'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
              boxShadow: '0 4px 20px rgba(var(--color-primary-rgb), 0.3)',
            }}
          >
            <Home className="h-4 w-4" />
            Go to Homepage
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all hover:scale-105 active:scale-95"
            style={{
              backgroundColor: 'var(--color-surface-light)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </motion.div>

        {/* Search suggestion */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12"
        >
          <div
            className="mx-auto flex max-w-xs items-center gap-3 rounded-xl px-4 py-3"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <Search className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
            <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Try practicing some translations instead?
            </span>
          </div>
        </motion.div>
      </div>

      {/* CSS for gradient animation */}
      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}
