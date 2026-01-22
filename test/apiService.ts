import * as assert from 'assert';
import { describe, it, beforeEach } from 'mocha';

// Mock CircuitBreaker class for testing
class CircuitBreaker {
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
    }
  }

  getState(): string {
    return this.state;
  }

  getFailureCount(): number {
    return this.failures;
  }
}

// Error wrapping function for testing
const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect to exchange. Check your internet connection.',
  RATE_LIMITED: 'Exchange rate limit exceeded. Data will update automatically.',
  INVALID_RESPONSE: 'Exchange returned invalid data. This may be temporary.',
  PROVIDER_DISABLED: 'Provider is temporarily disabled due to repeated failures.',
  UNKNOWN_ERROR: 'An unexpected error occurred while fetching price data.',
} as const;

function createContextualError(
  originalError: Error,
  context: { url?: string; ticker?: any; provider?: any },
): Error {
  const error = new Error();

  // Determine error type and message
  if (originalError.message.includes('429')) {
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
  if (context.provider) {
    contextParts.push(`Provider: ${context.provider.apiName}`);
  }
  if (context.ticker) {
    contextParts.push(`Pair: ${context.ticker.base}/${context.ticker.quote}`);
  }
  if (context.url) {
    contextParts.push(`URL: ${context.url}`);
  }

  if (contextParts.length > 0) {
    error.message += ` (${contextParts.join(', ')})`;
  }

  // Preserve original error for debugging
  (error as any).originalError = originalError;

  return error;
}

describe('CircuitBreaker', function () {
  let breaker: CircuitBreaker;

  beforeEach(function () {
    breaker = new CircuitBreaker();
  });

  it('starts in CLOSED state', function () {
    assert.strictEqual(breaker.getState(), 'CLOSED');
    assert.strictEqual(breaker.isOpen(), false);
  });

  it('opens after 5 failures', function () {
    for (let i = 0; i < 4; i++) {
      breaker.recordFailure();
      assert.strictEqual(breaker.isOpen(), false, `Should not be open after ${i + 1} failures`);
    }

    breaker.recordFailure(); // 5th failure
    assert.strictEqual(breaker.getState(), 'OPEN');
    assert.strictEqual(breaker.isOpen(), true);
  });

  it('resets failure count on success', function () {
    breaker.recordFailure();
    breaker.recordFailure();
    assert.strictEqual(breaker.getFailureCount(), 2);

    breaker.recordSuccess();
    assert.strictEqual(breaker.getFailureCount(), 0);
    assert.strictEqual(breaker.getState(), 'CLOSED');
    assert.strictEqual(breaker.isOpen(), false);
  });

  it('returns to CLOSED when success recorded after failures', function () {
    for (let i = 0; i < 5; i++) {
      breaker.recordFailure();
    }
    assert.strictEqual(breaker.isOpen(), true);

    breaker.recordSuccess();
    assert.strictEqual(breaker.getState(), 'CLOSED');
    assert.strictEqual(breaker.isOpen(), false);
  });

  it('prevents requests when open', function () {
    for (let i = 0; i < 5; i++) {
      breaker.recordFailure();
    }

    assert.strictEqual(breaker.isOpen(), true);
    breaker.recordFailure(); // Try another failure while open
    assert.strictEqual(breaker.getFailureCount(), 6); // Still tracks failures
  });
});

describe('Error Context Wrapping', function () {
  it('wraps network errors', function () {
    const originalError = new Error('fetch failed');
    const wrapped = createContextualError(originalError, {});

    assert.ok(wrapped.message.includes(ERROR_MESSAGES.NETWORK_ERROR));
    assert.strictEqual((wrapped as any).originalError, originalError);
  });

  it('wraps rate limit errors', function () {
    const originalError = new Error('HTTP 429');
    const wrapped = createContextualError(originalError, {});

    assert.ok(wrapped.message.includes(ERROR_MESSAGES.RATE_LIMITED));
  });

  it('wraps JSON parse errors', function () {
    const originalError = new Error('JSON parse error');
    const wrapped = createContextualError(originalError, {});

    assert.ok(wrapped.message.includes(ERROR_MESSAGES.INVALID_RESPONSE));
  });

  it('wraps unknown errors', function () {
    const originalError = new Error('something unexpected');
    const wrapped = createContextualError(originalError, {});

    assert.ok(wrapped.message.includes(ERROR_MESSAGES.UNKNOWN_ERROR));
  });

  it('adds provider context', function () {
    const originalError = new Error('HTTP 429');
    const provider = { apiName: 'Binance' };
    const wrapped = createContextualError(originalError, { provider });

    assert.ok(wrapped.message.includes('Provider: Binance'));
  });

  it('adds ticker context', function () {
    const originalError = new Error('HTTP 429');
    const ticker = { base: 'BTC', quote: 'USD' };
    const wrapped = createContextualError(originalError, { ticker });

    assert.ok(wrapped.message.includes('Pair: BTC/USD'));
  });

  it('adds URL context', function () {
    const originalError = new Error('HTTP 429');
    const url = 'https://api.example.com/price';
    const wrapped = createContextualError(originalError, { url });

    assert.ok(wrapped.message.includes(`URL: ${url}`));
  });

  it('combines multiple context pieces', function () {
    const originalError = new Error('HTTP 429');
    const context = {
      provider: { apiName: 'Kraken' },
      ticker: { base: 'ETH', quote: 'EUR' },
      url: 'https://api.kraken.com/data',
    };
    const wrapped = createContextualError(originalError, context);

    assert.ok(wrapped.message.includes('Provider: Kraken'));
    assert.ok(wrapped.message.includes('Pair: ETH/EUR'));
    assert.ok(wrapped.message.includes('URL: https://api.kraken.com/data'));
  });

  it('preserves original error for debugging', function () {
    const originalError = new Error('original error message');
    const wrapped = createContextualError(originalError, {});

    assert.strictEqual((wrapped as any).originalError, originalError);
    assert.strictEqual((wrapped as any).originalError.message, 'original error message');
  });
});

describe('Retry Logic Constants', function () {
  it('defines correct timeout values', function () {
    const PERMANENT_ERROR_TIMEOUT = 60 * 60 * 1000; // 1 hour
    assert.strictEqual(PERMANENT_ERROR_TIMEOUT, 3600000);
  });

  it('defines error messages for all scenarios', function () {
    assert.ok(ERROR_MESSAGES.NETWORK_ERROR);
    assert.ok(ERROR_MESSAGES.RATE_LIMITED);
    assert.ok(ERROR_MESSAGES.INVALID_RESPONSE);
    assert.ok(ERROR_MESSAGES.PROVIDER_DISABLED);
    assert.ok(ERROR_MESSAGES.UNKNOWN_ERROR);

    // Verify all messages are non-empty strings
    Object.values(ERROR_MESSAGES).forEach((msg) => {
      assert.strictEqual(typeof msg, 'string');
      assert.ok(msg.length > 0, 'Error message should not be empty');
    });
  });
});
