import { useState } from 'react';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { motion } from 'motion/react';
import { Eye, EyeOff, UserPlus, ArrowLeft, Check, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from '../components/Logo';

export const Route = createFileRoute('/register')({
  component: RegisterPage,
});

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'At least 6 characters', valid: password.length >= 6 },
    { label: 'Contains a number', valid: /\d/.test(password) },
    { label: 'Contains uppercase', valid: /[A-Z]/.test(password) },
  ];

  const strength = checks.filter((c) => c.valid).length;
  const strengthColors = ['#ef4444', '#eab308', '#22c55e'];
  const strengthLabels = ['Weak', 'Medium', 'Strong'];

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mt-3 space-y-2"
    >
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-1 flex-1 rounded-full"
            style={{ background: 'var(--color-surface-elevated)' }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: i < strength ? strengthColors[strength - 1] : 'transparent' }}
              initial={{ width: 0 }}
              animate={{ width: i < strength ? '100%' : 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
            />
          </motion.div>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs">
        <span style={{ color: strengthColors[strength - 1] || 'var(--color-text-muted)' }}>
          {password && strengthLabels[strength - 1]}
        </span>
      </div>
      <div className="space-y-1">
        {checks.map((check) => (
          <motion.div
            key={check.label}
            className="flex items-center gap-2 text-xs"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {check.valid ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <X className="h-3 w-3" style={{ color: 'var(--color-text-muted)' }} />
            )}
            <span style={{ color: check.valid ? '#22c55e' : 'var(--color-text-muted)' }}>
              {check.label}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordsMatch = formData.password === formData.confirmPassword;
  const isFormValid =
    formData.username.length >= 3 &&
    formData.email.includes('@') &&
    formData.password.length >= 6 &&
    passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setError(null);
    setIsSubmitting(true);

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      navigate({ to: '/' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: 'var(--color-surface-dark)' }}
      >
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-transparent border-t-amber-500" />
      </div>
    );
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8"
      style={{ backgroundColor: 'var(--color-surface-dark)' }}
    >
      {/* Animated background - different pattern for register */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-48 left-1/4 h-[500px] w-[500px] rounded-full opacity-15 blur-3xl"
          style={{
            background: 'linear-gradient(180deg, var(--color-accent), var(--color-primary))',
          }}
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute right-0 bottom-0 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'var(--color-primary)' }}
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(var(--color-text-primary) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-text-primary) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:opacity-80"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </motion.div>

        {/* Glass card */}
        <div
          className="rounded-3xl p-8 backdrop-blur-xl"
          style={{
            background:
              'linear-gradient(145deg, rgba(var(--color-surface-rgb), 0.85), rgba(var(--color-surface-dark-rgb), 0.95))',
            border: '1px solid rgba(var(--color-border-rgb), 0.5)',
            boxShadow:
              '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          }}
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <motion.div
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="mb-4 inline-flex items-center justify-center"
            >
              <Link to="/" className="transition-transform hover:scale-105">
                <Logo size={56} />
              </Link>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-2 text-3xl font-bold tracking-tight"
              style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}
            >
              Create Account
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Start your language learning adventure
            </motion.p>
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              className="mb-6 rounded-xl px-4 py-3 text-sm"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
              }}
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label
                className="mb-2 block text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full rounded-xl px-4 py-3.5 text-base transition-all duration-200 focus:outline-none"
                style={{
                  background: 'var(--color-surface-light)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-primary)';
                  e.target.style.boxShadow = '0 0 0 3px var(--glow-primary)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--color-border)';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Choose a username"
                required
                minLength={3}
                autoComplete="username"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 }}
            >
              <label
                className="mb-2 block text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl px-4 py-3.5 text-base transition-all duration-200 focus:outline-none"
                style={{
                  background: 'var(--color-surface-light)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-primary)';
                  e.target.style.boxShadow = '0 0 0 3px var(--glow-primary)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--color-border)';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Enter your email"
                required
                autoComplete="email"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label
                className="mb-2 block text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded-xl px-4 py-3.5 pr-12 text-base transition-all duration-200 focus:outline-none"
                  style={{
                    background: 'var(--color-surface-light)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--color-primary)';
                    e.target.style.boxShadow = '0 0 0 3px var(--glow-primary)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--color-border)';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Create a password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-1.5 transition-colors hover:bg-white/5"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <PasswordStrength password={formData.password} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.65 }}
            >
              <label
                className="mb-2 block text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full rounded-xl px-4 py-3.5 pr-12 text-base transition-all duration-200 focus:outline-none"
                  style={{
                    background: 'var(--color-surface-light)',
                    border: `1px solid ${formData.confirmPassword && !passwordsMatch ? '#ef4444' : 'var(--color-border)'}`,
                    color: 'var(--color-text-primary)',
                  }}
                  onFocus={(e) => {
                    if (passwordsMatch || !formData.confirmPassword) {
                      e.target.style.borderColor = 'var(--color-primary)';
                      e.target.style.boxShadow = '0 0 0 3px var(--glow-primary)';
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor =
                      formData.confirmPassword && !passwordsMatch
                        ? '#ef4444'
                        : 'var(--color-border)';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Confirm your password"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-1.5 transition-colors hover:bg-white/5"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {formData.confirmPassword && !passwordsMatch && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-xs text-red-500"
                >
                  Passwords do not match
                </motion.p>
              )}
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              whileHover={
                isFormValid ? { scale: 1.02, boxShadow: '0 0 30px var(--glow-accent)' } : {}
              }
              whileTap={isFormValid ? { scale: 0.98 } : {}}
              type="submit"
              disabled={isSubmitting || !isFormValid}
              className="group relative mt-6 w-full overflow-hidden rounded-xl py-4 text-base font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background: isFormValid
                  ? 'linear-gradient(135deg, var(--color-accent), var(--color-accent-dark))'
                  : 'var(--color-surface-elevated)',
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    <UserPlus className="h-5 w-5" />
                    Create Account
                  </>
                )}
              </span>
              {isFormValid && (
                <motion.div
                  className="absolute inset-0 -z-0"
                  style={{
                    background:
                      'linear-gradient(135deg, var(--color-accent-light), var(--color-accent))',
                  }}
                  initial={{ x: '-100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.button>
          </form>

          {/* Login link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-center"
          >
            <span style={{ color: 'var(--color-text-muted)' }}>Already have an account? </span>
            <Link
              to="/login"
              className="font-medium transition-colors hover:opacity-80"
              style={{ color: 'var(--color-primary)' }}
            >
              Sign in
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
