// Helper to detect rate limit errors - supports both HTTPError (soupMessage.status_code) and generic errors
function isErrorTooManyRequests(err: Error): boolean {
  return !!(
    (err as any).soupMessage?.status_code === 429 || err.message.includes('429')
  );
}

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect to exchange. Check your internet connection.',
  RATE_LIMITED: 'Exchange rate limit exceeded. Data will update automatically.',
  INVALID_RESPONSE: 'Exchange returned invalid data. This may be temporary.',
  PROVIDER_DISABLED: 'Provider is temporarily disabled due to repeated failures.',
  UNKNOWN_ERROR: 'An unexpected error occurred while fetching price data.',
} as const;

export function createContextualError(
  originalError: Error,
  context?: { url?: string; ticker?: { base: string; quote: string }; provider?: { apiName: string } },
): Error {
  const error = new Error();

  // Determine error type and message
  // Check for rate limit (429) - supports both HTTPError (soupMessage.status_code) and test/generic errors
  const isRateLimit = isErrorTooManyRequests(originalError);

  if (isRateLimit) {
    error.message = ERROR_MESSAGES.RATE_LIMITED;
  } else if (originalError.message.includes('fetch')) {
    error.message = ERROR_MESSAGES.NETWORK_ERROR;
  } else if (originalError.message.includes('JSON') || originalError.message.includes('parse')) {
    error.message = ERROR_MESSAGES.INVALID_RESPONSE;
  } else {
    error.message = ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  // Add context information
  const contextParts: string[] = [];
  if (context?.provider) {
    contextParts.push(`Provider: ${context.provider.apiName}`);
  }
  if (context?.ticker) {
    contextParts.push(`Pair: ${context.ticker.base}/${context.ticker.quote}`);
  }
  if (context?.url) {
    contextParts.push(`URL: ${context.url}`);
  }

  if (contextParts.length > 0) {
    error.message += ` (${contextParts.join(', ')})`;
  }

  // Preserve original error for debugging
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
