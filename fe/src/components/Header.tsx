import { Link } from '@tanstack/react-router';
import { CreditsDisplay } from './CreditsDisplay';

export function Header() {
  return (
    <header className="bg-gray-900 border-b border-gray-800 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold text-white hover:text-yellow-400 transition-colors">
            🌏 Enlist
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              to="/"
              className="text-gray-300 hover:text-white transition-colors [&.active]:text-yellow-400"
              activeOptions={{ exact: true }}
            >
              Practice
            </Link>
            <Link
              to="/paragraphs"
              className="text-gray-300 hover:text-white transition-colors [&.active]:text-yellow-400"
            >
              Paragraphs
            </Link>
          </nav>
        </div>
        <CreditsDisplay />
      </div>
    </header>
  );
}
