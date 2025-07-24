import { createClient } from '@supabase/supabase-js';

export enum EventType {
  // Auth events
  AUTH_OAUTH_LOGIN = 'auth.oauth.login',
  AUTH_OAUTH_METADATA_MISSING = 'auth.oauth.metadata_missing',
  AUTH_OAUTH_METADATA_INITIALIZED = 'auth.oauth.metadata_initialized',
  AUTH_OAUTH_METADATA_FAILED = 'auth.oauth.metadata_failed',
  
  // Payment events
  PAYMENT_TRANSACTION_CREATED = 'payment.transaction.created',
  PAYMENT_TRANSACTION_PROCESSING = 'payment.transaction.processing',
  PAYMENT_TRANSACTION_COMPLETED = 'payment.transaction.completed',
  PAYMENT_TRANSACTION_FAILED = 'payment.transaction.failed',
  PAYMENT_USER_TIER_UPGRADED = 'payment.user.tier_upgraded',
  PAYMENT_USER_NOT_FOUND = 'payment.user.not_found',
  
  // Error events
  ERROR_DATABASE = 'error.database',
  ERROR_PAYMENT_PROVIDER = 'error.payment_provider',
  ERROR_USER_LOOKUP = 'error.user_lookup'
}

export enum Severity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export interface MonitoringEvent {
  eventType: EventType;
  severity: Severity;
  userId?: string;
  userEmail?: string;
  metadata: Record<string, any>;
  timestamp: Date;
  error?: string;
}

export class MonitoringService {
  private static instance: MonitoringService;
  private supabase: any;
  private events: MonitoringEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  private constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
      this.startFlushInterval();
    }
  }

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  /**
   * Log an event
   */
  logEvent(
    eventType: EventType,
    severity: Severity,
    metadata: Record<string, any>,
    userId?: string,
    userEmail?: string,
    error?: string
  ): void {
    const event: MonitoringEvent = {
      eventType,
      severity,
      userId,
      userEmail,
      metadata,
      timestamp: new Date(),
      error
    };

    // Console log based on severity
    const logMessage = `[${severity.toUpperCase()}] ${eventType}: ${JSON.stringify(metadata)}`;
    
    switch (severity) {
      case Severity.ERROR:
      case Severity.CRITICAL:
        console.error(logMessage, error ? `\nError: ${error}` : '');
        break;
      case Severity.WARNING:
        console.warn(logMessage);
        break;
      default:
        console.log(logMessage);
    }

    // Add to queue for batch insert
    this.events.push(event);

    // Flush immediately for critical events
    if (severity === Severity.CRITICAL) {
      this.flush();
    }
  }

  /**
   * Log OAuth login event
   */
  logOAuthLogin(userId: string, userEmail: string, provider: string, hasMetadata: boolean): void {
    this.logEvent(
      EventType.AUTH_OAUTH_LOGIN,
      Severity.INFO,
      {
        provider,
        hasMetadata,
        userAgent: process.env.USER_AGENT || 'unknown'
      },
      userId,
      userEmail
    );

    if (!hasMetadata) {
      this.logEvent(
        EventType.AUTH_OAUTH_METADATA_MISSING,
        Severity.WARNING,
        {
          provider,
          reason: 'User logged in via OAuth without required metadata'
        },
        userId,
        userEmail
      );
    }
  }

  /**
   * Log metadata initialization result
   */
  logMetadataInitialization(
    userId: string,
    userEmail: string,
    success: boolean,
    metadata?: Record<string, any>,
    error?: string
  ): void {
    if (success) {
      this.logEvent(
        EventType.AUTH_OAUTH_METADATA_INITIALIZED,
        Severity.INFO,
        {
          ...metadata,
          source: 'oauth_callback'
        },
        userId,
        userEmail
      );
    } else {
      this.logEvent(
        EventType.AUTH_OAUTH_METADATA_FAILED,
        Severity.ERROR,
        {
          reason: 'Failed to initialize user metadata',
          attemptedMetadata: metadata
        },
        userId,
        userEmail,
        error
      );
    }
  }

  /**
   * Log payment transaction events
   */
  logPaymentTransaction(
    transactionId: string,
    userId: string,
    userEmail: string,
    status: 'created' | 'processing' | 'completed' | 'failed',
    amount: number,
    paymentMethod: string,
    metadata?: Record<string, any>,
    error?: string
  ): void {
    let eventType: EventType;
    let severity: Severity;

    switch (status) {
      case 'created':
        eventType = EventType.PAYMENT_TRANSACTION_CREATED;
        severity = Severity.INFO;
        break;
      case 'processing':
        eventType = EventType.PAYMENT_TRANSACTION_PROCESSING;
        severity = Severity.INFO;
        break;
      case 'completed':
        eventType = EventType.PAYMENT_TRANSACTION_COMPLETED;
        severity = Severity.INFO;
        break;
      case 'failed':
        eventType = EventType.PAYMENT_TRANSACTION_FAILED;
        severity = Severity.ERROR;
        break;
    }

    this.logEvent(
      eventType,
      severity,
      {
        transactionId,
        amount,
        paymentMethod,
        ...metadata
      },
      userId,
      userEmail,
      error
    );
  }

  /**
   * Log user tier upgrade
   */
  logUserTierUpgrade(
    userId: string,
    userEmail: string,
    fromTier: string,
    toTier: string,
    paymentMethod: string,
    transactionId: string
  ): void {
    this.logEvent(
      EventType.PAYMENT_USER_TIER_UPGRADED,
      Severity.INFO,
      {
        fromTier,
        toTier,
        paymentMethod,
        transactionId
      },
      userId,
      userEmail
    );
  }

  /**
   * Log critical errors
   */
  logCriticalError(
    errorType: 'database' | 'payment_provider' | 'user_lookup',
    error: string,
    metadata: Record<string, any>,
    userId?: string,
    userEmail?: string
  ): void {
    let eventType: EventType;
    
    switch (errorType) {
      case 'database':
        eventType = EventType.ERROR_DATABASE;
        break;
      case 'payment_provider':
        eventType = EventType.ERROR_PAYMENT_PROVIDER;
        break;
      case 'user_lookup':
        eventType = EventType.ERROR_USER_LOOKUP;
        break;
    }

    this.logEvent(
      eventType,
      Severity.CRITICAL,
      metadata,
      userId,
      userEmail,
      error
    );
  }

  /**
   * Get summary statistics
   */
  async getStatsSummary(hours = 24): Promise<{
    totalOAuthLogins: number;
    oauthLoginsWithoutMetadata: number;
    metadataInitializationSuccess: number;
    metadataInitializationFailure: number;
    paymentTransactionsCreated: number;
    paymentTransactionsCompleted: number;
    paymentTransactionsFailed: number;
    userTierUpgrades: number;
    criticalErrors: number;
  }> {
    if (!this.supabase) {
      return {
        totalOAuthLogins: 0,
        oauthLoginsWithoutMetadata: 0,
        metadataInitializationSuccess: 0,
        metadataInitializationFailure: 0,
        paymentTransactionsCreated: 0,
        paymentTransactionsCompleted: 0,
        paymentTransactionsFailed: 0,
        userTierUpgrades: 0,
        criticalErrors: 0
      };
    }

    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    // This would query from a monitoring_events table if it exists
    // For now, return zeros as placeholder
    return {
      totalOAuthLogins: 0,
      oauthLoginsWithoutMetadata: 0,
      metadataInitializationSuccess: 0,
      metadataInitializationFailure: 0,
      paymentTransactionsCreated: 0,
      paymentTransactionsCompleted: 0,
      paymentTransactionsFailed: 0,
      userTierUpgrades: 0,
      criticalErrors: 0
    };
  }

  /**
   * Start interval to flush events to database
   */
  private startFlushInterval(): void {
    this.flushInterval = setInterval(() => {
      if (this.events.length > 0) {
        this.flush();
      }
    }, 30000); // Flush every 30 seconds
  }

  /**
   * Flush events to database
   */
  private async flush(): Promise<void> {
    if (!this.supabase || this.events.length === 0) {
      return;
    }

    const eventsToFlush = [...this.events];
    this.events = [];

    try {
      // Transform events for database insert
      const dbEvents = eventsToFlush.map(event => ({
        event_type: event.eventType,
        severity: event.severity,
        user_id: event.userId,
        user_email: event.userEmail,
        metadata: event.metadata,
        error_message: event.error,
        created_at: event.timestamp.toISOString()
      }));

      // Insert into monitoring_events table (if it exists)
      const { error } = await this.supabase
        .from('monitoring_events')
        .insert(dbEvents);

      if (error) {
        console.error('[MonitoringService] Failed to flush events:', error);
        // Re-add events to queue on failure
        this.events.unshift(...eventsToFlush);
      }
    } catch (error) {
      console.error('[MonitoringService] Error flushing events:', error);
      // Re-add events to queue on failure
      this.events.unshift(...eventsToFlush);
    }
  }

  /**
   * Cleanup on shutdown
   */
  shutdown(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
  }
}

// Export singleton instance
export const monitoring = MonitoringService.getInstance();