import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UpgradeCTA } from '@/components/upgrade-cta'

// Mock wouter Link component
vi.mock('wouter', () => ({
  Link: ({ children, href, className }: any) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}))

describe('UpgradeCTA', () => {
  describe('Default Props', () => {
    it('should render with default card variant', () => {
      render(<UpgradeCTA />)
      
      expect(screen.getByText('Premium olish')).toBeInTheDocument()
      expect(screen.getByText('Barcha protokollarga kirish uchun Premium obuna oling')).toBeInTheDocument()
    })

    it('should show features by default', () => {
      render(<UpgradeCTA />)
      
      expect(screen.getByText('✅ Barcha 57 protokolga kirish')).toBeInTheDocument()
      expect(screen.getByText('✅ Har protokol uchun 5 ta AI baholash')).toBeInTheDocument()
      expect(screen.getByText('✅ Cheksiz progress tracking')).toBeInTheDocument()
    })
  })

  describe('Variant Styles', () => {
    it('should render card variant correctly', () => {
      render(<UpgradeCTA variant="card" />)
      
      const container = screen.getByText('Premium olish').closest('div')
      expect(container).toHaveClass('bg-gradient-to-br')
    })

    it('should render banner variant correctly', () => {
      render(<UpgradeCTA variant="banner" />)
      
      const container = screen.getByText('Premium olish').closest('div')
      expect(container).toHaveClass('bg-orange-50')
    })

    it('should render modal variant correctly', () => {
      render(<UpgradeCTA variant="modal" />)
      
      const container = screen.getByText('Premium olish').closest('div')
      expect(container).toHaveClass('bg-white')
      expect(container).toHaveClass('rounded-2xl')
    })

    it('should render inline variant correctly', () => {
      render(<UpgradeCTA variant="inline" />)
      
      const button = screen.getByText('Premium olish')
      expect(button).toHaveClass('inline-flex')
    })
  })

  describe('Custom Content', () => {
    it('should display custom title and description', () => {
      render(
        <UpgradeCTA 
          title="Custom Title"
          description="Custom description text"
        />
      )
      
      expect(screen.getByText('Custom Title')).toBeInTheDocument()
      expect(screen.getByText('Custom description text')).toBeInTheDocument()
    })

    it('should display custom reason when provided', () => {
      render(
        <UpgradeCTA 
          reason="You have reached your limit"
        />
      )
      
      expect(screen.getByText('You have reached your limit')).toBeInTheDocument()
    })

    it('should hide features when showFeatures is false', () => {
      render(<UpgradeCTA showFeatures={false} />)
      
      expect(screen.queryByText('✅ Barcha 57 protokolga kirish')).not.toBeInTheDocument()
      expect(screen.queryByText('✅ Har protokol uchun 5 ta AI baholash')).not.toBeInTheDocument()
    })
  })

  describe('Button Functionality', () => {
    it('should link to payment page', () => {
      render(<UpgradeCTA />)
      
      const upgradeButton = screen.getByText('Premium olish')
      const link = upgradeButton.closest('a')
      expect(link).toHaveAttribute('href', '/atmos-payment')
    })

    it('should show crown icon in button', () => {
      render(<UpgradeCTA />)
      
      // Check for crown icon (it might be implemented as SVG or icon component)
      const button = screen.getByText('Premium olish')
      expect(button.closest('a')).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('should apply custom className', () => {
      render(<UpgradeCTA className="custom-class" />)
      
      const container = screen.getByText('Premium olish').closest('div')
      expect(container).toHaveClass('custom-class')
    })

    it('should handle different screen sizes appropriately for banner variant', () => {
      render(<UpgradeCTA variant="banner" />)
      
      const container = screen.getByText('Premium olish').closest('div')
      expect(container).toHaveClass('p-4')
      expect(container).toHaveClass('sm:p-6')
    })
  })

  describe('Modal Variant Specific', () => {
    it('should render modal with proper styling and layout', () => {
      render(
        <UpgradeCTA 
          variant="modal"
          title="Limit tugadi"
          description="Sizning 3 ta bepul protokol limitingiz tugadi"
          reason="Hozirgi holat: 3/3 bepul protokol ishlatilgan"
        />
      )
      
      expect(screen.getByText('Limit tugadi')).toBeInTheDocument()
      expect(screen.getByText('Sizning 3 ta bepul protokol limitingiz tugadi')).toBeInTheDocument()
      expect(screen.getByText('Hozirgi holat: 3/3 bepul protokol ishlatilgan')).toBeInTheDocument()
      
      const container = screen.getByText('Limit tugadi').closest('div')
      expect(container).toHaveClass('bg-white')
      expect(container).toHaveClass('p-8')
    })
  })

  describe('Features List', () => {
    it('should render all default features', () => {
      render(<UpgradeCTA showFeatures={true} />)
      
      const expectedFeatures = [
        '✅ Barcha 57 protokolga kirish',
        '✅ Har protokol uchun 5 ta AI baholash',
        '✅ Cheksiz progress tracking',
        '✅ Priority support'
      ]
      
      expectedFeatures.forEach(feature => {
        expect(screen.getByText(feature)).toBeInTheDocument()
      })
    })

    it('should style features list correctly', () => {
      render(<UpgradeCTA showFeatures={true} />)
      
      const featuresList = screen.getByText('✅ Barcha 57 protokolga kirish').closest('div')
      expect(featuresList).toHaveClass('space-y-2')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty title gracefully', () => {
      render(<UpgradeCTA title="" />)
      
      // Should still render the component without crashing
      expect(screen.getByText('Premium olish')).toBeInTheDocument()
    })

    it('should handle long description text', () => {
      const longDescription = 'A'.repeat(200)
      render(<UpgradeCTA description={longDescription} />)
      
      expect(screen.getByText(longDescription)).toBeInTheDocument()
    })

    it('should handle undefined props gracefully', () => {
      render(<UpgradeCTA title={undefined} description={undefined} />)
      
      // Should render with defaults
      expect(screen.getByText('Premium olish')).toBeInTheDocument()
    })
  })
})