import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { Header } from '../components/Header'
import { OnboardingModal } from '../components/OnboardingModal'
import { useOnboarding } from '../hooks/useOnboarding'

function RootComponent() {
  const { showOnboarding, completeOnboarding } = useOnboarding()

  return (
    <div className="min-h-screen noise-overlay" style={{ backgroundColor: 'var(--color-surface-dark)' }}>
      <Header />
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
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})
