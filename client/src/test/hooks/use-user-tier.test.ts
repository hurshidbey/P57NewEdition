import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useUserTier, useProtocolAccess } from '@/hooks/use-user-tier'

// Mock the auth context
const mockAuthContext = {
  user: null,
  isAuthenticated: false,
  loading: false,
}

// Mock the progress hook
const mockProgressData = {
  completedProtocols: new Set<number>(),
  completionPercentage: 0,
}

vi.mock('@/contexts/auth-context', () => ({
  useAuth: () => mockAuthContext,
}))

vi.mock('@/hooks/use-progress', () => ({
  useProgress: () => ({
    getProgressData: () => mockProgressData,
  }),
}))

describe('useUserTier', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()
    mockAuthContext.user = null
    mockAuthContext.isAuthenticated = false
    mockAuthContext.loading = false
    mockProgressData.completedProtocols = new Set<number>()
  })

  describe('Tier Detection', () => {
    it('should default to free tier for unauthenticated users', () => {
      const { result } = renderHook(() => useUserTier())
      
      expect(result.current.tier).toBe('free')
      expect(result.current.loading).toBe(false)
    })

    it('should detect admin user correctly', () => {
      mockAuthContext.user = { email: 'hurshidbey@gmail.com', tier: 'free' }
      mockAuthContext.isAuthenticated = true
      
      const { result } = renderHook(() => useUserTier())
      
      expect(result.current.tier).toBe('paid') // Admin gets paid tier privileges
    })

    it('should detect paid tier user', () => {
      mockAuthContext.user = { email: 'user@example.com', tier: 'paid' }
      mockAuthContext.isAuthenticated = true
      
      const { result } = renderHook(() => useUserTier())
      
      expect(result.current.tier).toBe('paid')
    })

    it('should detect free tier user', () => {
      mockAuthContext.user = { email: 'user@example.com', tier: 'free' }
      mockAuthContext.isAuthenticated = true
      
      const { result } = renderHook(() => useUserTier())
      
      expect(result.current.tier).toBe('free')
    })
  })

  describe('Protocol Access - Free Tier', () => {
    beforeEach(() => {
      mockAuthContext.user = { email: 'user@example.com', tier: 'free' }
      mockAuthContext.isAuthenticated = true
    })

    it('should allow access to free protocols when under limit', () => {
      mockProgressData.completedProtocols = new Set([1]) // 1 protocol accessed
      
      const { result } = renderHook(() => useUserTier())
      
      expect(result.current.canAccessProtocol(2, true)).toBe(true) // Can access new free protocol
      expect(result.current.canAccessProtocol(3, false)).toBe(false) // Cannot access premium protocol
    })

    it('should block access to new protocols when limit reached', () => {
      mockProgressData.completedProtocols = new Set([1, 2, 3]) // 3 protocols accessed (limit reached)
      
      const { result } = renderHook(() => useUserTier())
      
      expect(result.current.canAccessProtocol(4, true)).toBe(false) // Cannot access new protocol
      expect(result.current.canAccessProtocol(1, true)).toBe(true) // Can still access already completed protocol
    })

    it('should track accessed protocols count correctly', () => {
      mockProgressData.completedProtocols = new Set([1, 2])
      
      const { result } = renderHook(() => useUserTier())
      
      expect(result.current.getAccessedProtocolsCount()).toBe(2)
    })

    it('should check if user can access new protocol', () => {
      mockProgressData.completedProtocols = new Set([1, 2])
      
      const { result } = renderHook(() => useUserTier())
      
      expect(result.current.canAccessNewProtocol()).toBe(true) // 2/3 protocols used
      
      // Update to limit
      mockProgressData.completedProtocols = new Set([1, 2, 3])
      
      const { result: result2 } = renderHook(() => useUserTier())
      expect(result2.current.canAccessNewProtocol()).toBe(false) // 3/3 protocols used
    })
  })

  describe('Protocol Access - Paid Tier', () => {
    beforeEach(() => {
      mockAuthContext.user = { email: 'user@example.com', tier: 'paid' }
      mockAuthContext.isAuthenticated = true
    })

    it('should allow unlimited access to all protocols', () => {
      const { result } = renderHook(() => useUserTier())
      
      expect(result.current.canAccessProtocol(1, true)).toBe(true) // Free protocol
      expect(result.current.canAccessProtocol(2, false)).toBe(true) // Premium protocol
      expect(result.current.canAccessNewProtocol()).toBe(true) // Always true for paid
      expect(result.current.getAccessedProtocolsCount()).toBe(0) // Always 0 for paid (no limit)
    })
  })

  describe('Tier Status Information', () => {
    it('should return correct free tier status', () => {
      mockAuthContext.user = { email: 'user@example.com', tier: 'free' }
      mockAuthContext.isAuthenticated = true
      
      const { result } = renderHook(() => useUserTier())
      const status = result.current.getTierStatus()
      
      expect(status.tier).toBe('free')
      expect(status.displayName).toBe('Bepul')
      expect(status.features).toContain('3 ta bepul protokol')
    })

    it('should return correct paid tier status', () => {
      mockAuthContext.user = { email: 'user@example.com', tier: 'paid' }
      mockAuthContext.isAuthenticated = true
      
      const { result } = renderHook(() => useUserTier())
      const status = result.current.getTierStatus()
      
      expect(status.tier).toBe('paid')
      expect(status.displayName).toBe('Premium')
      expect(status.features).toContain('Barcha 57 protokolga kirish')
    })
  })
})

describe('useProtocolAccess', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthContext.user = null
    mockAuthContext.isAuthenticated = false
    mockProgressData.completedProtocols = new Set<number>()
  })

  it('should correctly determine protocol access for free user', () => {
    mockAuthContext.user = { email: 'user@example.com', tier: 'free' }
    mockAuthContext.isAuthenticated = true
    mockProgressData.completedProtocols = new Set([1])
    
    const { result } = renderHook(() => useProtocolAccess(2, true))
    
    expect(result.current.canAccess).toBe(true)
    expect(result.current.isLocked).toBe(false)
    expect(result.current.tier).toBe('free')
    expect(result.current.requiresUpgrade).toBe(false)
  })

  it('should correctly determine premium protocol is locked for free user', () => {
    mockAuthContext.user = { email: 'user@example.com', tier: 'free' }
    mockAuthContext.isAuthenticated = true
    
    const { result } = renderHook(() => useProtocolAccess(2, false))
    
    expect(result.current.canAccess).toBe(false)
    expect(result.current.isLocked).toBe(true)
    expect(result.current.tier).toBe('free')
    expect(result.current.requiresUpgrade).toBe(true)
  })

  it('should allow paid user access to all protocols', () => {
    mockAuthContext.user = { email: 'user@example.com', tier: 'paid' }
    mockAuthContext.isAuthenticated = true
    
    const { result } = renderHook(() => useProtocolAccess(2, false))
    
    expect(result.current.canAccess).toBe(true)
    expect(result.current.isLocked).toBe(false)
    expect(result.current.tier).toBe('paid')
    expect(result.current.requiresUpgrade).toBe(false)
  })

  it('should allow admin user access to all protocols', () => {
    mockAuthContext.user = { email: 'hurshidbey@gmail.com', tier: 'free' }
    mockAuthContext.isAuthenticated = true
    
    const { result } = renderHook(() => useProtocolAccess(2, false))
    
    expect(result.current.canAccess).toBe(true)
    expect(result.current.isLocked).toBe(false)
    expect(result.current.tier).toBe('paid') // Admin gets paid privileges
    expect(result.current.requiresUpgrade).toBe(false)
  })
})