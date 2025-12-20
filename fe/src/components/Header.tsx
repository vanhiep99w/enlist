import { Link } from '@tanstack/react-router';
import { CreditsDisplay } from './CreditsDisplay';
import { StreakDisplay } from './StreakDisplay';
import { SoundToggle } from './SoundToggle';
import { ThemeSelector } from './ThemeSelector';
import { Logo } from './Logo';

export function Header() {
  return (
    <header
      className="border-b px-6 py-3"
      style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-surface-light)' }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center gap-3 text-2xl font-bold transition-colors hover:text-amber-500"
            style={{ color: 'var(--color-text-primary)' }}
          >
            <Logo size={42} />
            <span>Enlist</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              to="/"
              className="hover-underline transition-colors [&.active]:text-amber-500"
              style={{ color: 'var(--color-text-secondary)' }}
              activeOptions={{ exact: true }}
            >
              Practice
            </Link>
            <Link
              to="/paragraphs"
              className="hover-underline transition-colors [&.active]:text-amber-500"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Paragraphs
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <StreakDisplay />
          <CreditsDisplay />
          <SoundToggle />
          <ThemeSelector />
        </div>
      </div>
    </header>
  );
}
