function getHttpStatusCode(err: Error): number | null {
  return (err as any).soupMessage?.status_code || null;
}

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect to exchange. Check your internet connection.',
  RATE_LIMITED: 'Exchange rate limit exceeded. Data will update automatically.',
  INVALID_PAIR: 'This trading pair is not supported by this exchange. Try a different pair in Settings.',
  PROVIDER_DISABLED: 'Provider is temporarily disabled due to repeated failures.',
  NOT_FOUND: 'Exchange endpoint not found. This pair may not be supported.',
  SERVER_ERROR: 'Exchange server error (5xx). Their service may be temporarily unavailable.',
  CLIENT_ERROR: 'Request error (4xx). The pair or exchange may have changed.',
  TIMEOUT: 'Request timeout. Exchange took too long to respond.',
  UNKNOWN_ERROR: 'Error fetching price data.',
} as const;

function classifyError(originalError: Error): string {
  const statusCode = getHttpStatusCode(originalError);
  const msg = originalError.message || '';

  // HTTP status code errors
  if (statusCode === 429 || msg.includes('429')) return ERROR_MESSAGES.RATE_LIMITED;
  if (statusCode === 404) return ERROR_MESSAGES.NOT_FOUND;
  if (statusCode && statusCode >= 500) return ERROR_MESSAGES.SERVER_ERROR;
  if (statusCode && statusCode >= 400) return ERROR_MESSAGES.CLIENT_ERROR;

  // Data extraction errors - invalid pair produces invalid price value, NaN, or missing fields
  if (msg.includes('invalid price value') || msg.includes('no data for') || msg.includes('undefined')) {
    return ERROR_MESSAGES.INVALID_PAIR;
  }

  // Network and timing errors
  if (msg.includes('timeout') || msg.includes('Timeout')) return ERROR_MESSAGES.TIMEOUT;
  if (msg.includes('fetch') || msg.includes('Connection')) return ERROR_MESSAGES.NETWORK_ERROR;

  // Malformed response
  if (msg.includes('JSON') || msg.includes('parse')) return ERROR_MESSAGES.INVALID_PAIR;

  // Unknown - include original message if available
  if (msg) {
    const cleanMsg = msg.substring(0, 60);
    return `${ERROR_MESSAGES.UNKNOWN_ERROR} (${cleanMsg})`;
  }

  return ERROR_MESSAGES.UNKNOWN_ERROR;
}

function formatContext(context?: { provider?: { apiName: string }; ticker?: { base: string; quote: string } }): string {
  if (!context?.provider && !context?.ticker) return '';

  const parts = [];
  if (context.provider) parts.push(`Provider: ${context.provider.apiName}`);
  if (context.ticker) parts.push(`Pair: ${context.ticker.base}/${context.ticker.quote}`);

  return ` (${parts.join(', ')})`;
}

export function createContextualError(
  originalError: Error,
  context?: { url?: string; ticker?: { base: string; quote: string }; provider?: { apiName: string } },
): Error {
  const error = new Error();
  error.message = classifyError(originalError) + formatContext(context);
  (error as any).originalError = originalError;
  return error;
}

export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private readonly failureThreshold = 5;
  private readonly recoveryTimeout = 60000; // 1 minute

  isOpen(): boolean {
    if (this.state === 'OPEN') {
      // Check if we should transition to HALF_OPEN
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'HALF_OPEN';
        return false;
      }
      return true;
    }
    return false;
  }

  recordSuccess(): void {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      console.log(`Circuit breaker opened after ${this.failures} failures`);
    }
  }

  getState(): string {
    return this.state;
  }
}
