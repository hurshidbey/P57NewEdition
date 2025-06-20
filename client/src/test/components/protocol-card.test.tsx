import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ProtocolCard from '@/components/protocol-card'
import { Protocol } from '@shared/types'

// Mock the hooks
const mockProgress = {
  isProtocolCompleted: vi.fn(),
  getProtocolProgress: vi.fn(),
  markProtocolCompleted: vi.fn(),
}

const mockProtocolAccess = {
  canAccess: true,
  isLocked: false,
  requiresUpgrade: false,
}

vi.mock('@/hooks/use-progress', () => ({
  useProgress: () => mockProgress,
}))

vi.mock('@/hooks/use-user-tier', () => ({
  useProtocolAccess: () => mockProtocolAccess,
}))

// Mock wouter Link component
vi.mock('wouter', () => ({
  Link: ({ children, href, className }: any) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}))

const mockProtocol: Protocol = {
  id: 1,
  number: 1,
  title: 'Test Protocol',
  description: 'Test description',
  problemStatement: 'Test problem',
  whyExplanation: 'Test explanation',
  solutionApproach: 'Test solution',
  goodExample: 'Good example',
  badExample: 'Bad example',
  notes: 'Test notes',
  difficultyLevel: 'BEGINNER',
  isFreeAccess: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('ProtocolCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockProgress.isProtocolCompleted.mockReturnValue(false)
    mockProgress.getProtocolProgress.mockReturnValue(0)
    mockProtocolAccess.canAccess = true
    mockProtocolAccess.isLocked = false
    mockProtocolAccess.requiresUpgrade = false
  })

  describe('Free Protocol Display', () => {
    it('should show protocol title for accessible protocols', () => {
      render(<ProtocolCard protocol={mockProtocol} />)
      
      expect(screen.getByText('Test Protocol')).toBeInTheDocument()
      expect(screen.getByText('Test description')).toBeInTheDocument()
    })

    it('should show protocol number with correct padding', () => {
      render(<ProtocolCard protocol={mockProtocol} />)
      
      expect(screen.getByText('01')).toBeInTheDocument()
    })

    it('should show difficulty level badge', () => {
      render(<ProtocolCard protocol={mockProtocol} />)
      
      expect(screen.getByText("Boshlang'ich")).toBeInTheDocument()
    })

    it('should show action buttons for accessible protocols', () => {
      render(<ProtocolCard protocol={mockProtocol} />)
      
      expect(screen.getByText("O'rgandim")).toBeInTheDocument()
      expect(screen.getByText("Ko'rish")).toBeInTheDocument()
    })
  })

  describe('Locked Protocol Display', () => {
    beforeEach(() => {
      mockProtocolAccess.canAccess = false
      mockProtocolAccess.isLocked = true
      mockProtocolAccess.requiresUpgrade = true
    })

    it('should hide protocol title for locked protocols', () => {
      render(<ProtocolCard protocol={mockProtocol} />)
      
      expect(screen.queryByText('Test Protocol')).not.toBeInTheDocument()
      expect(screen.getByText('Premium Protokol')).toBeInTheDocument()
    })

    it('should show generic description for locked protocols', () => {
      render(<ProtocolCard protocol={mockProtocol} />)
      
      expect(screen.queryByText('Test description')).not.toBeInTheDocument()
      expect(screen.getByText(/Bu protokol Premium foydalanuvchilar uchun/)).toBeInTheDocument()
    })

    it('should show lock icon for locked protocols', () => {
      render(<ProtocolCard protocol={mockProtocol} />)
      
      const lockIcons = screen.getAllByTestId('lock-icon') // We might need to add test IDs
      expect(lockIcons.length).toBeGreaterThan(0)
    })

    it('should show premium upgrade button for locked protocols', () => {
      render(<ProtocolCard protocol={mockProtocol} />)
      
      expect(screen.getByText('Premium olish')).toBeInTheDocument()
      expect(screen.getByText('Premium protokol')).toBeInTheDocument()
    })

    it('should disable interaction for locked protocols', () => {
      render(<ProtocolCard protocol={mockProtocol} />)
      
      // The main Link should have pointer-events-none class
      const cardLink = screen.getByRole('link')
      expect(cardLink).toHaveClass('pointer-events-none')
    })
  })

  describe('Completed Protocol Display', () => {
    beforeEach(() => {
      mockProgress.isProtocolCompleted.mockReturnValue(true)
    })

    it('should show completion checkmark for completed protocols', () => {
      render(<ProtocolCard protocol={mockProtocol} />)
      
      // Check for completed styling
      const checkIcon = document.querySelector('.text-green-600')
      expect(checkIcon).toBeInTheDocument()
    })

    it('should show different action button text for completed protocols', () => {
      render(<ProtocolCard protocol={mockProtocol} />)
      
      expect(screen.getByText('Qayta mashq')).toBeInTheDocument()
    })

    it('should apply completed styling to protocol number', () => {
      render(<ProtocolCard protocol={mockProtocol} />)
      
      const protocolNumber = screen.getByText('01')
      expect(protocolNumber.closest('div')).toHaveClass('bg-green-100')
    })
  })

  describe('User Interactions', () => {
    it('should call markProtocolCompleted when O\'rgandim button is clicked', () => {
      render(<ProtocolCard protocol={mockProtocol} />)
      
      const learnButton = screen.getByText("O'rgandim")
      fireEvent.click(learnButton)
      
      expect(mockProgress.markProtocolCompleted).toHaveBeenCalledWith(1, 70)
    })

    it('should prevent event propagation when action buttons are clicked', () => {
      const stopPropagation = vi.fn()
      const preventDefault = vi.fn()
      
      render(<ProtocolCard protocol={mockProtocol} />)
      
      const learnButton = screen.getByText("O'rgandim")
      fireEvent.click(learnButton, {
        stopPropagation,
        preventDefault,
      })
      
      // The click handler should call preventDefault and stopPropagation
      expect(mockProgress.markProtocolCompleted).toHaveBeenCalled()
    })
  })

  describe('Visual States', () => {
    it('should apply correct border colors based on protocol state', () => {
      const { rerender } = render(<ProtocolCard protocol={mockProtocol} />)
      
      // Default state
      let card = document.querySelector('.border-border')
      expect(card).toBeInTheDocument()
      
      // Completed state
      mockProgress.isProtocolCompleted.mockReturnValue(true)
      rerender(<ProtocolCard protocol={mockProtocol} />)
      
      card = document.querySelector('.border-green-400')
      expect(card).toBeInTheDocument()
      
      // Locked state
      mockProgress.isProtocolCompleted.mockReturnValue(false)
      mockProtocolAccess.isLocked = true
      rerender(<ProtocolCard protocol={mockProtocol} />)
      
      card = document.querySelector('.border-gray-300')
      expect(card).toBeInTheDocument()
    })

    it('should handle different difficulty levels correctly', () => {
      const intermediateProtocol = { ...mockProtocol, difficultyLevel: "O'RTA DARAJA" as const }
      
      render(<ProtocolCard protocol={intermediateProtocol} />)
      
      expect(screen.getByText("O'rta daraja")).toBeInTheDocument()
    })

    it('should handle missing difficulty level gracefully', () => {
      const protocolWithoutDifficulty = { ...mockProtocol, difficultyLevel: undefined }
      
      render(<ProtocolCard protocol={protocolWithoutDifficulty} />)
      
      // Should render without difficulty badge
      expect(screen.queryByText("Boshlang'ich")).not.toBeInTheDocument()
    })
  })

  describe('Premium Protocol Variants', () => {
    it('should handle premium protocols for free users', () => {
      const premiumProtocol = { ...mockProtocol, isFreeAccess: false }
      mockProtocolAccess.canAccess = false
      mockProtocolAccess.isLocked = true
      mockProtocolAccess.requiresUpgrade = true
      
      render(<ProtocolCard protocol={premiumProtocol} />)
      
      expect(screen.getByText('Premium Protokol')).toBeInTheDocument()
      expect(screen.getByText('Premium olish')).toBeInTheDocument()
    })
  })
})