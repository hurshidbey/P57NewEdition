/**
 * P57 Analytics System for Tier Tracking
 * 
 * Tracks user interactions with the tier system to measure success metrics
 * and identify conversion opportunities.
 */

export interface AnalyticsEvent {
  event: string
  properties: Record<string, any>
  timestamp: number
  userId?: string
  sessionId: string
}

export interface TierMetrics {
  protocolAccess: {
    freeUsersBlocked: number
    upgradePromptShown: number
    upgradePromptClicked: number
  }
  evaluationLimits: {
    freeUsersHitLimit: number
    premiumUsersActive: number
  }
  conversionFunnel: {
    freeUsersSignup: number
    freeUsersCompleted3Protocols: number
    upgradeAttempts: number
    upgradeSuccess: number
  }
}

class AnalyticsTracker {
  private sessionId: string
  private events: AnalyticsEvent[] = []
  private metrics: TierMetrics = {
    protocolAccess: {
      freeUsersBlocked: 0,
      upgradePromptShown: 0,
      upgradePromptClicked: 0
    },
    evaluationLimits: {
      freeUsersHitLimit: 0,
      premiumUsersActive: 0
    },
    conversionFunnel: {
      freeUsersSignup: 0,
      freeUsersCompleted3Protocols: 0,
      upgradeAttempts: 0,
      upgradeSuccess: 0
    }
  }

  constructor() {
    this.sessionId = this.generateSessionId()
    this.loadMetricsFromStorage()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private loadMetricsFromStorage(): void {
    try {
      const storedMetrics = localStorage.getItem('p57_analytics_metrics')
      if (storedMetrics) {
        this.metrics = { ...this.metrics, ...JSON.parse(storedMetrics) }
      }
    } catch (error) {

    }
  }

  private saveMetricsToStorage(): void {
    try {
      localStorage.setItem('p57_analytics_metrics', JSON.stringify(this.metrics))
    } catch (error) {

    }
  }

  /**
   * Track a general analytics event
   */
  track(event: string, properties: Record<string, any> = {}, userId?: string): void {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: Date.now(),
      userId,
      sessionId: this.sessionId
    }

    this.events.push(analyticsEvent)
    
    // Keep only last 100 events in memory
    if (this.events.length > 100) {
      this.events = this.events.slice(-100)
    }

    // Send to console in development
    if (process.env.NODE_ENV === 'development') {

    }
  }

  /**
   * Track when a free user is blocked from accessing a protocol
   */
  trackProtocolBlocked(protocolId: number, reason: 'limit_reached' | 'premium_only'): void {
    this.track('protocol_access_blocked', {
      protocolId,
      reason,
      tier: 'free'
    })

    this.metrics.protocolAccess.freeUsersBlocked++
    this.saveMetricsToStorage()
  }

  /**
   * Track when upgrade prompt is shown to user
   */
  trackUpgradePromptShown(context: 'protocol_card' | 'protocol_detail' | 'evaluation_limit'): void {
    this.track('upgrade_prompt_shown', {
      context,
      tier: 'free'
    })

    this.metrics.protocolAccess.upgradePromptShown++
    this.saveMetricsToStorage()
  }

  /**
   * Track when user clicks upgrade prompt
   */
  trackUpgradePromptClicked(context: string): void {
    this.track('upgrade_prompt_clicked', {
      context,
      tier: 'free'
    })

    this.metrics.protocolAccess.upgradePromptClicked++
    this.saveMetricsToStorage()
  }

  /**
   * Track when a user hits evaluation limit
   */
  trackEvaluationLimitHit(protocolId: number, tier: 'free' | 'paid'): void {
    this.track('evaluation_limit_hit', {
      protocolId,
      tier
    })

    if (tier === 'free') {
      this.metrics.evaluationLimits.freeUsersHitLimit++
    }
    
    this.saveMetricsToStorage()
  }

  /**
   * Track user signup by tier
   */
  trackUserSignup(tier: 'free' | 'paid'): void {
    this.track('user_signup', { tier })

    if (tier === 'free') {
      this.metrics.conversionFunnel.freeUsersSignup++
    }

    this.saveMetricsToStorage()
  }

  /**
   * Track when free user completes 3 protocols (hits limit)
   */
  trackFreeUserCompletedLimit(): void {
    this.track('free_user_completed_limit', {
      protocolsCompleted: 3,
      tier: 'free'
    })

    this.metrics.conversionFunnel.freeUsersCompleted3Protocols++
    this.saveMetricsToStorage()
  }

  /**
   * Track upgrade attempt (user visits payment page)
   */
  trackUpgradeAttempt(source: string): void {
    this.track('upgrade_attempt', {
      source,
      tier: 'free'
    })

    this.metrics.conversionFunnel.upgradeAttempts++
    this.saveMetricsToStorage()
  }

  /**
   * Track successful upgrade
   */
  trackUpgradeSuccess(): void {
    this.track('upgrade_success', {
      previousTier: 'free',
      newTier: 'paid'
    })

    this.metrics.conversionFunnel.upgradeSuccess++
    this.saveMetricsToStorage()
  }

  /**
   * Track protocol access patterns
   */
  trackProtocolAccess(protocolId: number, tier: 'free' | 'paid', accessGranted: boolean): void {
    this.track('protocol_access', {
      protocolId,
      tier,
      accessGranted
    })

    if (tier === 'paid' && accessGranted) {
      this.metrics.evaluationLimits.premiumUsersActive++
      this.saveMetricsToStorage()
    }
  }

  /**
   * Get current metrics for dashboard
   */
  getMetrics(): TierMetrics {
    return { ...this.metrics }
  }

  /**
   * Get conversion rate calculations
   */
  getConversionRates(): {
    upgradeCTR: number // Click-through rate on upgrade prompts
    conversionRate: number // Free users who successfully upgrade
    completionToUpgradeRate: number // Users who complete 3 protocols and then upgrade
  } {
    const { protocolAccess, conversionFunnel } = this.metrics

    const upgradeCTR = protocolAccess.upgradePromptShown > 0 
      ? (protocolAccess.upgradePromptClicked / protocolAccess.upgradePromptShown) * 100
      : 0

    const conversionRate = conversionFunnel.freeUsersSignup > 0
      ? (conversionFunnel.upgradeSuccess / conversionFunnel.freeUsersSignup) * 100
      : 0

    const completionToUpgradeRate = conversionFunnel.freeUsersCompleted3Protocols > 0
      ? (conversionFunnel.upgradeSuccess / conversionFunnel.freeUsersCompleted3Protocols) * 100
      : 0

    return {
      upgradeCTR: Math.round(upgradeCTR * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100,
      completionToUpgradeRate: Math.round(completionToUpgradeRate * 100) / 100
    }
  }

  /**
   * Export analytics data (for admin dashboard)
   */
  exportData(): {
    events: AnalyticsEvent[]
    metrics: TierMetrics
    conversionRates: ReturnType<typeof this.getConversionRates>
    sessionInfo: {
      sessionId: string
      eventsCount: number
      sessionStart: number
    }
  } {
    return {
      events: this.events,
      metrics: this.metrics,
      conversionRates: this.getConversionRates(),
      sessionInfo: {
        sessionId: this.sessionId,
        eventsCount: this.events.length,
        sessionStart: this.events[0]?.timestamp || Date.now()
      }
    }
  }

  /**
   * Reset metrics (admin function)
   */
  resetMetrics(): void {
    this.metrics = {
      protocolAccess: {
        freeUsersBlocked: 0,
        upgradePromptShown: 0,
        upgradePromptClicked: 0
      },
      evaluationLimits: {
        freeUsersHitLimit: 0,
        premiumUsersActive: 0
      },
      conversionFunnel: {
        freeUsersSignup: 0,
        freeUsersCompleted3Protocols: 0,
        upgradeAttempts: 0,
        upgradeSuccess: 0
      }
    }
    
    this.saveMetricsToStorage()
  }
}

// Global analytics instance
export const analytics = new AnalyticsTracker()

// Convenience functions for common tracking scenarios
export const trackTierSystemEvent = {
  protocolBlocked: (protocolId: number, reason: 'limit_reached' | 'premium_only') => 
    analytics.trackProtocolBlocked(protocolId, reason),
    
  upgradePromptShown: (context: 'protocol_card' | 'protocol_detail' | 'evaluation_limit') => 
    analytics.trackUpgradePromptShown(context),
    
  upgradePromptClicked: (context: string) => 
    analytics.trackUpgradePromptClicked(context),
    
  evaluationLimitHit: (protocolId: number, tier: 'free' | 'paid') => 
    analytics.trackEvaluationLimitHit(protocolId, tier),
    
  protocolAccess: (protocolId: number, tier: 'free' | 'paid', accessGranted: boolean) => 
    analytics.trackProtocolAccess(protocolId, tier, accessGranted)
}