/**
 * Domain failover mechanism for P57
 * Automatically switches to backup domains when primary is unavailable
 */

import { DOMAINS, getCurrentDomain, getPreferredDomain } from '@shared/config/domains';

interface HealthCheckResult {
  domain: string;
  available: boolean;
  responseTime?: number;
  error?: string;
}

class DomainFailoverService {
  private static instance: DomainFailoverService;
  private healthCheckInterval: number = 5 * 60 * 1000; // 5 minutes
  private healthCheckTimeout: number = 5000; // 5 seconds
  private lastHealthCheck: Map<string, HealthCheckResult> = new Map();
  private checkIntervalId?: NodeJS.Timeout;
  private isChecking: boolean = false;

  private constructor() {
    this.startHealthChecks();
  }

  static getInstance(): DomainFailoverService {
    if (!DomainFailoverService.instance) {
      DomainFailoverService.instance = new DomainFailoverService();
    }
    return DomainFailoverService.instance;
  }

  /**
   * Start periodic health checks
   */
  private startHealthChecks() {
    // Initial check
    this.checkAllDomains();

    // Periodic checks
    this.checkIntervalId = setInterval(() => {
      this.checkAllDomains();
    }, this.healthCheckInterval);
  }

  /**
   * Stop health checks
   */
  stopHealthChecks() {
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
      this.checkIntervalId = undefined;
    }
  }

  /**
   * Check health of a single domain
   */
  async checkDomainHealth(domain: string): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.healthCheckTimeout);

      const response = await fetch(`${domain}/health`, {
        method: 'GET',
        signal: controller.signal,
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        }
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      const result: HealthCheckResult = {
        domain,
        available: response.ok,
        responseTime,
        error: response.ok ? undefined : `HTTP ${response.status}`
      };

      this.lastHealthCheck.set(domain, result);
      return result;

    } catch (error: any) {
      const result: HealthCheckResult = {
        domain,
        available: false,
        error: error.name === 'AbortError' ? 'Timeout' : error.message
      };

      this.lastHealthCheck.set(domain, result);
      return result;
    }
  }

  /**
   * Check all domains
   */
  async checkAllDomains(): Promise<Map<string, HealthCheckResult>> {
    if (this.isChecking) return this.lastHealthCheck;

    this.isChecking = true;
    const domains = [DOMAINS.app, ...DOMAINS.backupDomains];

    try {
      const results = await Promise.all(
        domains.map(domain => this.checkDomainHealth(domain))
      );

      results.forEach(result => {
        this.lastHealthCheck.set(result.domain, result);
      });

      // Emit event for UI updates
      this.emitHealthCheckUpdate();

    } catch (error) {
      console.error('Domain health check failed:', error);
    } finally {
      this.isChecking = false;
    }

    return this.lastHealthCheck;
  }

  /**
   * Get the best available domain
   */
  async getBestAvailableDomain(): Promise<string> {
    // If we have recent health check data, use it
    const recentChecks = this.getRecentHealthChecks();
    
    if (recentChecks.size > 0) {
      // Sort by availability and response time
      const sortedDomains = Array.from(recentChecks.entries())
        .filter(([_, result]) => result.available)
        .sort((a, b) => {
          // Prefer primary domain
          if (a[0] === DOMAINS.app) return -1;
          if (b[0] === DOMAINS.app) return 1;
          
          // Then sort by response time
          return (a[1].responseTime || 9999) - (b[1].responseTime || 9999);
        });

      if (sortedDomains.length > 0) {
        return sortedDomains[0][0];
      }
    }

    // Fallback to checking domains in order
    return await getPreferredDomain();
  }

  /**
   * Get recent health check results (less than 10 minutes old)
   */
  private getRecentHealthChecks(): Map<string, HealthCheckResult> {
    const recent = new Map<string, HealthCheckResult>();
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;

    this.lastHealthCheck.forEach((result, domain) => {
      // Assume checks are recent if we have them
      recent.set(domain, result);
    });

    return recent;
  }

  /**
   * Emit health check update event
   */
  private emitHealthCheckUpdate() {
    const event = new CustomEvent('domainHealthUpdate', {
      detail: {
        results: Array.from(this.lastHealthCheck.entries()),
        timestamp: new Date().toISOString()
      }
    });
    window.dispatchEvent(event);
  }

  /**
   * Get current health status
   */
  getHealthStatus(): { primary: boolean; backups: HealthCheckResult[] } {
    const primaryHealth = this.lastHealthCheck.get(DOMAINS.app);
    const backupHealth = DOMAINS.backupDomains.map(domain => 
      this.lastHealthCheck.get(domain) || { domain, available: false }
    );

    return {
      primary: primaryHealth?.available || false,
      backups: backupHealth
    };
  }

  /**
   * Should show failover notification
   */
  shouldShowFailoverNotice(): boolean {
    const current = getCurrentDomain();
    const primaryHealth = this.lastHealthCheck.get(DOMAINS.app);
    
    // Show notice if:
    // 1. We're on a backup domain
    // 2. Primary domain is down
    return DOMAINS.backupDomains.includes(current) && 
           primaryHealth?.available === false;
  }

  /**
   * Get failover message
   */
  getFailoverMessage(): string {
    const status = this.getHealthStatus();
    
    if (!status.primary) {
      const availableBackup = status.backups.find(b => b.available);
      if (availableBackup) {
        return `Primary site is temporarily unavailable. You're currently using our backup site.`;
      }
    }
    
    return '';
  }

  /**
   * Redirect to best available domain
   */
  async redirectToBestDomain() {
    const current = getCurrentDomain();
    const best = await this.getBestAvailableDomain();
    
    if (best !== current) {
      // Preserve current path and query
      const url = new URL(window.location.href);
      url.host = new URL(best).host;
      url.protocol = new URL(best).protocol;
      
      window.location.href = url.toString();
    }
  }
}

// Export singleton instance
export const domainFailover = DomainFailoverService.getInstance();

// React hook for domain failover
export function useDomainFailover() {
  const [healthStatus, setHealthStatus] = React.useState(() => 
    domainFailover.getHealthStatus()
  );
  const [isChecking, setIsChecking] = React.useState(false);

  React.useEffect(() => {
    const handleUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      setHealthStatus(domainFailover.getHealthStatus());
    };

    window.addEventListener('domainHealthUpdate', handleUpdate);
    
    // Initial check
    checkHealth();

    return () => {
      window.removeEventListener('domainHealthUpdate', handleUpdate);
    };
  }, []);

  const checkHealth = async () => {
    setIsChecking(true);
    try {
      await domainFailover.checkAllDomains();
      setHealthStatus(domainFailover.getHealthStatus());
    } finally {
      setIsChecking(false);
    }
  };

  const redirectToBest = async () => {
    await domainFailover.redirectToBestDomain();
  };

  return {
    healthStatus,
    isChecking,
    checkHealth,
    redirectToBest,
    shouldShowNotice: domainFailover.shouldShowFailoverNotice(),
    failoverMessage: domainFailover.getFailoverMessage()
  };
}

// Auto-redirect on critical errors
export function setupAutoFailover() {
  let consecutiveErrors = 0;
  const maxErrors = 3;

  // Intercept fetch errors
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    try {
      const response = await originalFetch(...args);
      
      // Reset counter on success
      if (response.ok) {
        consecutiveErrors = 0;
      }
      
      return response;
    } catch (error) {
      consecutiveErrors++;
      
      // If too many errors, try failover
      if (consecutiveErrors >= maxErrors) {
        const currentDomain = getCurrentDomain();
        const bestDomain = await domainFailover.getBestAvailableDomain();
        
        if (bestDomain !== currentDomain) {
          console.warn(`Too many errors on ${currentDomain}, switching to ${bestDomain}`);
          domainFailover.redirectToBestDomain();
        }
      }
      
      throw error;
    }
  };
}