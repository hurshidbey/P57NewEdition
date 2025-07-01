import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useProtocolEvaluation } from '@/hooks/use-protocol-evaluation'

// Mock the auth context
const mockAuthContext = {
  user: null,
  isAuthenticated: false,
  loading: false,
}

vi.mock('@/contexts/auth-context', () => ({
  useAuth: () => mockAuthContext,
}))

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

describe('useProtocolEvaluation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthContext.user = null
    mockAuthContext.isAuthenticated = false
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  describe('Evaluation Limits', () => {
    it('should return correct limits for free tier users', () => {
      mockAuthContext.user = { email: 'user@example.com', tier: 'free' }
      mockAuthContext.isAuthenticated = true
      
      const { result } = renderHook(() => useProtocolEvaluation(1))
      
      expect(result.current.evaluationLimit).toBe(1)
    })

    it('should return correct limits for paid tier users', () => {
      mockAuthContext.user = { email: 'user@example.com', tier: 'paid' }
      mockAuthContext.isAuthenticated = true
      
      const { result } = renderHook(() => useProtocolEvaluation(1))
      
      expect(result.current.evaluationLimit).toBe(5)
    })

    it('should treat admin users as paid tier', () => {
      mockAuthContext.user = { email: 'hurshidbey@gmail.com', tier: 'free' }
      mockAuthContext.isAuthenticated = true
      
      const { result } = renderHook(() => useProtocolEvaluation(1))
      
      expect(result.current.evaluationLimit).toBe(5)
    })
  })

  describe('Evaluation Count Tracking', () => {
    it('should start with 0 evaluations for new protocol', () => {
      mockAuthContext.user = { email: 'user@example.com', tier: 'free' }
      mockAuthContext.isAuthenticated = true
      
      const { result } = renderHook(() => useProtocolEvaluation(1))
      
      expect(result.current.evaluationCount).toBe(0)
      expect(result.current.canEvaluate).toBe(true)
    })

    it('should load existing evaluation count from localStorage', () => {
      mockAuthContext.user = { email: 'user@example.com', tier: 'free' }
      mockAuthContext.isAuthenticated = true
      
      // Mock existing evaluation data
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        'protocol_1': { count: 1, lastEvaluation: Date.now() }
      }))
      
      const { result } = renderHook(() => useProtocolEvaluation(1))
      
      expect(result.current.evaluationCount).toBe(1)
      expect(result.current.canEvaluate).toBe(false) // Free user hit limit
    })

    it('should allow evaluation when under limit', () => {
      mockAuthContext.user = { email: 'user@example.com', tier: 'paid' }
      mockAuthContext.isAuthenticated = true
      
      // Mock existing evaluation data
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        'protocol_1': { count: 3, lastEvaluation: Date.now() }
      }))
      
      const { result } = renderHook(() => useProtocolEvaluation(1))
      
      expect(result.current.evaluationCount).toBe(3)
      expect(result.current.canEvaluate).toBe(true) // Paid user can do 5 total
    })

    it('should block evaluation when limit reached', () => {
      mockAuthContext.user = { email: 'user@example.com', tier: 'paid' }
      mockAuthContext.isAuthenticated = true
      
      // Mock existing evaluation data at limit
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        'protocol_1': { count: 5, lastEvaluation: Date.now() }
      }))
      
      const { result } = renderHook(() => useProtocolEvaluation(1))
      
      expect(result.current.evaluationCount).toBe(5)
      expect(result.current.canEvaluate).toBe(false) // Paid user hit limit
    })
  })

  describe('Use Evaluation Function', () => {
    it('should increment count and update localStorage', () => {
      mockAuthContext.user = { email: 'user@example.com', tier: 'free' }
      mockAuthContext.isAuthenticated = true
      
      const { result } = renderHook(() => useProtocolEvaluation(1))
      
      act(() => {
        result.current.useEvaluation()
      })
      
      expect(result.current.evaluationCount).toBe(1)
      expect(result.current.canEvaluate).toBe(false) // Free user hit limit
      expect(mockLocalStorage.setItem).toHaveBeenCalled()
    })

    it('should not allow evaluation when limit reached', () => {
      mockAuthContext.user = { email: 'user@example.com', tier: 'free' }
      mockAuthContext.isAuthenticated = true
      
      // Mock existing evaluation data at limit
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        'protocol_1': { count: 1, lastEvaluation: Date.now() }
      }))
      
      const { result } = renderHook(() => useProtocolEvaluation(1))
      
      expect(result.current.canEvaluate).toBe(false)
      
      act(() => {
        result.current.useEvaluation()
      })
      
      // Count should not change
      expect(result.current.evaluationCount).toBe(1)
    })

    it('should handle multiple protocols independently', () => {
      mockAuthContext.user = { email: 'user@example.com', tier: 'paid' }
      mockAuthContext.isAuthenticated = true
      
      // Mock existing evaluation data for different protocols
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        'protocol_1': { count: 2, lastEvaluation: Date.now() },
        'protocol_2': { count: 4, lastEvaluation: Date.now() }
      }))
      
      const { result: result1 } = renderHook(() => useProtocolEvaluation(1))
      const { result: result2 } = renderHook(() => useProtocolEvaluation(2))
      
      expect(result1.current.evaluationCount).toBe(2)
      expect(result1.current.canEvaluate).toBe(true)
      
      expect(result2.current.evaluationCount).toBe(4)
      expect(result2.current.canEvaluate).toBe(true)
    })
  })

  describe('Reset Functionality', () => {
    it('should reset evaluation count for specific protocol', () => {
      mockAuthContext.user = { email: 'user@example.com', tier: 'free' }
      mockAuthContext.isAuthenticated = true
      
      // Mock existing evaluation data
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        'protocol_1': { count: 1, lastEvaluation: Date.now() }
      }))
      
      const { result } = renderHook(() => useProtocolEvaluation(1))
      
      expect(result.current.evaluationCount).toBe(1)
      
      act(() => {
        result.current.resetEvaluations()
      })
      
      expect(result.current.evaluationCount).toBe(0)
      expect(result.current.canEvaluate).toBe(true)
      expect(mockLocalStorage.setItem).toHaveBeenCalled()
    })
  })

  describe('Unauthenticated Users', () => {
    it('should handle unauthenticated users gracefully', () => {
      mockAuthContext.user = null
      mockAuthContext.isAuthenticated = false
      
      const { result } = renderHook(() => useProtocolEvaluation(1))
      
      expect(result.current.evaluationCount).toBe(0)
      expect(result.current.evaluationLimit).toBe(1) // Default to free tier limit
      expect(result.current.canEvaluate).toBe(true)
    })
  })
})