/// <reference types="mocha" />
import * as assert from 'assert';

import { CircuitBreaker, createContextualError, ERROR_MESSAGES } from '../src/ApiServiceUtils';

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

    // Since getFailureCount is not exposed, we'll verify behavior through state
    breaker.recordSuccess();
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
    assert.strictEqual(breaker.isOpen(), true); // Should still be open
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
    const provider = { apiName: 'Binance' } as any;
    const wrapped = createContextualError(originalError, { provider });

    assert.ok(wrapped.message.includes('Provider: Binance'));
  });

  it('adds ticker context', function () {
    const originalError = new Error('HTTP 429');
    const ticker = { base: 'BTC', quote: 'USD' } as any;
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
      provider: { apiName: 'Kraken' } as any,
      ticker: { base: 'ETH', quote: 'EUR' } as any,
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

