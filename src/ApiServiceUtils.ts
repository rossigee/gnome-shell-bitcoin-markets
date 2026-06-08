// Helper to detect rate limit errors - supports both HTTPError (soupMessage.status_code) and generic errors
function isErrorTooManyRequests(err: Error): boolean {
  return !!(
    (err as any).soupMessage?.status_code === 429 || err.message.includes('429')
  );
}

function isHttpError(err: Error): boolean {
  return !!(err as any).soupMessage;
}

function getHttpStatusCode(err: Error): number | null {
  return (err as any).soupMessage?.status_code || null;
}

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect to exchange. Check your internet connection.',
  RATE_LIMITED: 'Exchange rate limit exceeded. Data will update automatically.',
  INVALID_PAIR: 'This trading pair is not supported by this exchange. Try a different pair in Settings.',
  INVALID_RESPONSE: 'Exchange returned invalid data. This may be temporary.',
  PROVIDER_DISABLED: 'Provider is temporarily disabled due to repeated failures.',
  NOT_FOUND: 'Exchange endpoint not found. This pair may not be supported.',
  SERVER_ERROR: 'Exchange server error (5xx). Their service may be temporarily unavailable.',
  CLIENT_ERROR: 'Request error (4xx). The pair or exchange may have changed.',
  TIMEOUT: 'Request timeout. Exchange took too long to respond.',
  UNKNOWN_ERROR: 'Error fetching price data.',
} as const;

function buildErrorMessage(baseMessage: string, originalMsg: string): string {
  // If we have a specific message that might be helpful, append it
  if (originalMsg && !originalMsg.toLowerCase().includes(baseMessage.toLowerCase())) {
    const cleanMsg = originalMsg.substring(0, 60); // Limit length
    return `${baseMessage} (${cleanMsg})`;
  }
  return baseMessage;
}

export function createContextualError(
  originalError: Error,
  context?: { url?: string; ticker?: { base: string; quote: string }; provider?: { apiName: string } },
): Error {
  const error = new Error();

  const isRateLimit = isErrorTooManyRequests(originalError);
  const statusCode = getHttpStatusCode(originalError);
  const originalMsg = originalError.message || '';

  let message: string;

  if (isRateLimit) {
    message = ERROR_MESSAGES.RATE_LIMITED;
  } else if (statusCode === 429) {
    message = ERROR_MESSAGES.RATE_LIMITED;
  } else if (statusCode === 404) {
    message = ERROR_MESSAGES.NOT_FOUND;
  } else if (statusCode && statusCode >= 500) {
    message = ERROR_MESSAGES.SERVER_ERROR;
  } else if (statusCode && statusCode >= 400) {
    message = ERROR_MESSAGES.CLIENT_ERROR;
  } else if (originalMsg.includes('invalid price value') || originalMsg.includes('no data for') || originalMsg.includes('undefined')) {
    // Provider couldn't extract price from response - likely invalid pair or empty response
    message = ERROR_MESSAGES.INVALID_PAIR;
  } else if (originalMsg.includes('timeout') || originalMsg.includes('Timeout')) {
    message = ERROR_MESSAGES.TIMEOUT;
  } else if (originalMsg.includes('fetch') || originalMsg.includes('Connection')) {
    message = ERROR_MESSAGES.NETWORK_ERROR;
  } else if (originalMsg.includes('JSON') || originalMsg.includes('parse')) {
    message = ERROR_MESSAGES.INVALID_PAIR;
  } else if (originalMsg) {
    // For unknown errors, include the actual error message for context
    message = buildErrorMessage(ERROR_MESSAGES.UNKNOWN_ERROR, originalMsg);
  } else {
    message = ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  error.message = message;

  // Add context information
  const contextParts: string[] = [];
  if (context?.provider) {
    contextParts.push(`Provider: ${context.provider.apiName}`);
  }
  if (context?.ticker) {
    contextParts.push(`Pair: ${context.ticker.base}/${context.ticker.quote}`);
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
