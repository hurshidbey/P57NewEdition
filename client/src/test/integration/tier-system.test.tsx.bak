import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

// Mock the auth context with controlled state
const mockAuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  signIn: vi.fn(),
  signOut: vi.fn(),
  signUp: vi.fn(),
}

vi.mock('@/contexts/auth-context', () => ({
  useAuth: () => mockAuthState,
  AuthProvider: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

// Mock fetch for API calls
global.fetch = vi.fn()

// Create a test wrapper with QueryClient
const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('Tier System Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthState.user = null
    mockAuthState.isAuthenticated = false
    mockAuthState.loading = false
    
    // Reset localStorage
    global.localStorage.clear()
    
    // Reset fetch mock
    vi.mocked(fetch).mockClear()
  })

  describe('Free User Protocol Access Flow', () => {
    beforeEach(() => {
      mockAuthState.user = { 
        email: 'freeuser@example.com', 
        tier: 'free',
        id: '1'
      }
      mockAuthState.isAuthenticated = true

      // Mock API response for protocols
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => [
          { id: 1, number: 1, title: 'Free Protocol 1', isFreeAccess: true },
          { id: 2, number: 2, title: 'Free Protocol 2', isFreeAccess: true },
          { id: 3, number: 3, title: 'Free Protocol 3', isFreeAccess: true },
          { id: 4, number: 4, title: 'Premium Protocol 1', isFreeAccess: false },
        ],
      } as Response)
    })

    it('should allow free user to access up to 3 free protocols', async () => {
      // Simulate user accessing 2 protocols
      global.localStorage.setItem('user_progress_1', JSON.stringify({
        completedProtocols: [1, 2],
        totalScore: 140,
        lastUpdated: Date.now()
      }))

      const TestComponent = () => {
        const { useUserTier } = require('@/hooks/use-user-tier')
        const { tier, canAccessProtocol, getAccessedProtocolsCount } = useUserTier()
        
        return (
          <div>
            <div data-testid="tier">{tier}</div>
            <div data-testid="accessed-count">{getAccessedProtocolsCount()}</div>
            <div data-testid="can-access-new">{canAccessProtocol(3, true) ? 'yes' : 'no'}</div>
            <div data-testid="can-access-premium">{canAccessProtocol(4, false) ? 'yes' : 'no'}</div>
          </div>
        )
      }

      const Wrapper = createTestWrapper()
      render(<TestComponent />, { wrapper: Wrapper })

      await waitFor(() => {
        expect(screen.getByTestId('tier')).toHaveTextContent('free')
        expect(screen.getByTestId('accessed-count')).toHaveTextContent('2')
        expect(screen.getByTestId('can-access-new')).toHaveTextContent('yes')
        expect(screen.getByTestId('can-access-premium')).toHaveTextContent('no')
      })
    })

    it('should block free user when 3 protocol limit is reached', async () => {
      // Simulate user accessing 3 protocols (limit reached)
      global.localStorage.setItem('user_progress_1', JSON.stringify({
        completedProtocols: [1, 2, 3],
        totalScore: 210,
        lastUpdated: Date.now()
      }))

      const TestComponent = () => {
        const { useUserTier } = require('@/hooks/use-user-tier')
        const { canAccessProtocol, canAccessNewProtocol } = useUserTier()
        
        return (
          <div>
            <div data-testid="can-access-completed">{canAccessProtocol(1, true) ? 'yes' : 'no'}</div>
            <div data-testid="can-access-new">{canAccessNewProtocol() ? 'yes' : 'no'}</div>
          </div>
        )
      }

      const Wrapper = createTestWrapper()
      render(<TestComponent />, { wrapper: Wrapper })

      await waitFor(() => {
        expect(screen.getByTestId('can-access-completed')).toHaveTextContent('yes') // Can still access completed
        expect(screen.getByTestId('can-access-new')).toHaveTextContent('no') // Cannot access new
      })
    })
  })

  describe('Premium User Access Flow', () => {
    beforeEach(() => {
      mockAuthState.user = { 
        email: 'premiumuser@example.com', 
        tier: 'paid',
        id: '2'
      }
      mockAuthState.isAuthenticated = true
    })

    it('should allow premium user unlimited access to all protocols', async () => {
      const TestComponent = () => {
        const { useUserTier } = require('@/hooks/use-user-tier')
        const { tier, canAccessProtocol, canAccessNewProtocol } = useUserTier()
        
        return (
          <div>
            <div data-testid="tier">{tier}</div>
            <div data-testid="can-access-free">{canAccessProtocol(1, true) ? 'yes' : 'no'}</div>
            <div data-testid="can-access-premium">{canAccessProtocol(2, false) ? 'yes' : 'no'}</div>
            <div data-testid="can-access-new">{canAccessNewProtocol() ? 'yes' : 'no'}</div>
          </div>
        )
      }

      const Wrapper = createTestWrapper()
      render(<TestComponent />, { wrapper: Wrapper })

      await waitFor(() => {
        expect(screen.getByTestId('tier')).toHaveTextContent('paid')
        expect(screen.getByTestId('can-access-free')).toHaveTextContent('yes')
        expect(screen.getByTestId('can-access-premium')).toHaveTextContent('yes')
        expect(screen.getByTestId('can-access-new')).toHaveTextContent('yes')
      })
    })
  })

  describe('Admin User Access Flow', () => {
    beforeEach(() => {
      mockAuthState.user = { 
        email: 'hurshidbey@gmail.com', 
        tier: 'free', // Admin has free tier but gets paid privileges
        id: 'admin'
      }
      mockAuthState.isAuthenticated = true
    })

    it('should give admin user full access like premium user', async () => {
      const TestComponent = () => {
        const { useUserTier } = require('@/hooks/use-user-tier')
        const { tier, canAccessProtocol, canAccessNewProtocol } = useUserTier()
        
        return (
          <div>
            <div data-testid="tier">{tier}</div>
            <div data-testid="can-access-premium">{canAccessProtocol(1, false) ? 'yes' : 'no'}</div>
            <div data-testid="can-access-new">{canAccessNewProtocol() ? 'yes' : 'no'}</div>
          </div>
        )
      }

      const Wrapper = createTestWrapper()
      render(<TestComponent />, { wrapper: Wrapper })

      await waitFor(() => {
        expect(screen.getByTestId('tier')).toHaveTextContent('paid') // Admin treated as paid
        expect(screen.getByTestId('can-access-premium')).toHaveTextContent('yes')
        expect(screen.getByTestId('can-access-new')).toHaveTextContent('yes')
      })
    })
  })

  describe('Protocol Evaluation Limits Flow', () => {
    it('should enforce per-protocol evaluation limits for free users', async () => {
      mockAuthState.user = { 
        email: 'freeuser@example.com', 
        tier: 'free',
        id: '1'
      }
      mockAuthState.isAuthenticated = true

      const TestComponent = () => {
        const { useProtocolEvaluation } = require('@/hooks/use-protocol-evaluation')
        const { evaluationCount, evaluationLimit, canEvaluate, useEvaluation } = useProtocolEvaluation(1)
        
        return (
          <div>
            <div data-testid="count">{evaluationCount}</div>
            <div data-testid="limit">{evaluationLimit}</div>
            <div data-testid="can-evaluate">{canEvaluate ? 'yes' : 'no'}</div>
            <button onClick={useEvaluation} data-testid="evaluate-btn">Evaluate</button>
          </div>
        )
      }

      const Wrapper = createTestWrapper()
      render(<TestComponent />, { wrapper: Wrapper })

      await waitFor(() => {
        expect(screen.getByTestId('count')).toHaveTextContent('0')
        expect(screen.getByTestId('limit')).toHaveTextContent('1')
        expect(screen.getByTestId('can-evaluate')).toHaveTextContent('yes')
      })

      // Use the evaluation
      fireEvent.click(screen.getByTestId('evaluate-btn'))

      await waitFor(() => {
        expect(screen.getByTestId('count')).toHaveTextContent('1')
        expect(screen.getByTestId('can-evaluate')).toHaveTextContent('no') // Hit limit
      })
    })

    it('should allow premium users 5 evaluations per protocol', async () => {
      mockAuthState.user = { 
        email: 'premiumuser@example.com', 
        tier: 'paid',
        id: '2'
      }
      mockAuthState.isAuthenticated = true

      const TestComponent = () => {
        const { useProtocolEvaluation } = require('@/hooks/use-protocol-evaluation')
        const { evaluationLimit, canEvaluate } = useProtocolEvaluation(1)
        
        return (
          <div>
            <div data-testid="limit">{evaluationLimit}</div>
            <div data-testid="can-evaluate">{canEvaluate ? 'yes' : 'no'}</div>
          </div>
        )
      }

      const Wrapper = createTestWrapper()
      render(<TestComponent />, { wrapper: Wrapper })

      await waitFor(() => {
        expect(screen.getByTestId('limit')).toHaveTextContent('5')
        expect(screen.getByTestId('can-evaluate')).toHaveTextContent('yes')
      })
    })
  })

  describe('Upgrade Flow Integration', () => {
    it('should show appropriate upgrade CTAs based on tier limits', async () => {
      mockAuthState.user = { 
        email: 'freeuser@example.com', 
        tier: 'free',
        id: '1'
      }
      mockAuthState.isAuthenticated = true

      // Simulate user at protocol limit
      global.localStorage.setItem('user_progress_1', JSON.stringify({
        completedProtocols: [1, 2, 3],
        totalScore: 210,
        lastUpdated: Date.now()
      }))

      const TestComponent = () => {
        const { useUserTier } = require('@/hooks/use-user-tier')
        const { UpgradeCTA } = require('@/components/upgrade-cta')
        const { canAccessNewProtocol, getAccessedProtocolsCount } = useUserTier()
        
        return (
          <div>
            {!canAccessNewProtocol() && (
              <UpgradeCTA
                variant="modal"
                title="Limit tugadi"
                description={`Sizning 3 ta bepul protokol limitingiz tugadi`}
                reason={`Hozirgi holat: ${getAccessedProtocolsCount()}/3 bepul protokol ishlatilgan`}
              />
            )}
          </div>
        )
      }

      const Wrapper = createTestWrapper()
      render(<TestComponent />, { wrapper: Wrapper })

      await waitFor(() => {
        expect(screen.getByText('Limit tugadi')).toBeInTheDocument()
        expect(screen.getByText(/Sizning 3 ta bepul protokol limitingiz tugadi/)).toBeInTheDocument()
        expect(screen.getByText('Premium olish')).toBeInTheDocument()
      })
    })
  })

  describe('Storage Integration', () => {
    it('should persist progress data correctly', async () => {
      mockAuthState.user = { 
        email: 'testuser@example.com', 
        tier: 'free',
        id: '1'
      }
      mockAuthState.isAuthenticated = true

      const TestComponent = () => {
        const { useProgress } = require('@/hooks/use-progress')
        const { markProtocolCompleted, isProtocolCompleted } = useProgress()
        
        return (
          <div>
            <div data-testid="completed">{isProtocolCompleted(1) ? 'yes' : 'no'}</div>
            <button 
              onClick={() => markProtocolCompleted(1, 70)} 
              data-testid="complete-btn"
            >
              Complete
            </button>
          </div>
        )
      }

      const Wrapper = createTestWrapper()
      render(<TestComponent />, { wrapper: Wrapper })

      // Initially not completed
      await waitFor(() => {
        expect(screen.getByTestId('completed')).toHaveTextContent('no')
      })

      // Complete the protocol
      fireEvent.click(screen.getByTestId('complete-btn'))

      await waitFor(() => {
        expect(screen.getByTestId('completed')).toHaveTextContent('yes')
      })

      // Check localStorage was updated
      const progressData = JSON.parse(
        global.localStorage.getItem('user_progress_1') || '{}'
      )
      expect(progressData.completedProtocols).toContain(1)
    })
  })
})