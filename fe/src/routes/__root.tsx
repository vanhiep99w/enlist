import { Outlet, createRootRoute, useLocation } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { Header } from '../components/Header';
import { OnboardingModal } from '../components/OnboardingModal';
import { useOnboarding } from '../hooks/useOnboarding';
import { useAuth } from '../contexts/AuthContext';

function RootComponent() {
  const { showOnboarding, completeOnboarding } = useOnboarding();
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const showHeader = isAuthenticated && !isAuthPage;

  return (
    <div
      className="noise-overlay min-h-screen"
      style={{ backgroundColor: 'var(--color-surface-dark)' }}
    >
      {showHeader && <Header />}
      <Outlet />
      <OnboardingModal isOpen={showOnboarding} onComplete={completeOnboarding} />
      <TanStackDevtools
        config={{
          position: 'bottom-right',
        }}
        plugins={[
          {
            name: 'Tanstack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </div>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
