import { describe, it } from 'mocha';
import * as assert from 'assert';

import { BaseProvider, getProvider, ProviderKey, Providers } from '../src/providers';
import { throwNoData, throwApiError, formatSymbol } from '../src/providers/BaseProvider';

// Mock response data for different provider types
const mockResponses = {
  binance: { symbol: 'BTCUSDT', price: '56379.30000000' },
  bitpay: [
    { code: 'BTC', rate: 1 },
    { code: 'USD', rate: 56451.73 },
  ],
  bitfinex: [null, null, null, null, null, null, 56438.1],
  coinbase: {
    data: {
      rates: {
        USD: '56451.73',
        EUR: '47743.72',
      },
    },
  },
  kraken: {
    result: {
      XXBTZUSD: {
        c: ['56438.10000', '0.00001000'],
      },
    },
    error: [],
  },
  coinGecko: {
    tickers: [{ target: 'USD', last: 56438.1 }],
  },
};

describe('providers', function () {
  describe('getLast method parsing', function () {
    it('should parse Binance response correctly', function () {
      const provider = getProvider('binance');
      const ticker = { base: 'BTC', quote: 'USDT' };
      const result = provider.getLast(mockResponses.binance, ticker);
      assert.strictEqual(result, '56379.30000000');
    });

    it('should parse BitPay response correctly', function () {
      const provider = getProvider('bitpay');
      const ticker = { base: 'BTC', quote: 'USD' };
      const result = provider.getLast(mockResponses.bitpay, ticker);
      assert.strictEqual(result, 56451.73);
    });

    it('should parse Bitfinex response correctly', function () {
      const provider = getProvider('bitfinex');
      const ticker = { base: 'BTC', quote: 'USD' };
      const result = provider.getLast(mockResponses.bitfinex, ticker);
      assert.strictEqual(result, 56438.1);
    });

    it('should parse Coinbase response correctly', function () {
      const provider = getProvider('coinbase');
      const ticker = { base: 'BTC', quote: 'USD' };
      const result = provider.getLast(mockResponses.coinbase, ticker);
      assert.strictEqual(result, '56451.73');
    });

    it('should parse Kraken response correctly', function () {
      const provider = getProvider('kraken');
      const ticker = { base: 'XXBT', quote: 'ZUSD' };
      const result = provider.getLast(mockResponses.kraken, ticker);
      assert.strictEqual(result, '56438.10000');
    });

    it('should parse CoinGecko response correctly', function () {
      const provider = getProvider('coingecko');
      const ticker = { base: 'bitcoin', quote: 'usd' };
      const result = provider.getLast(mockResponses.coinGecko, ticker);
      assert.strictEqual(result, 56438.1);
    });
  });

  describe('error handling', function () {
    it('should throw error for invalid BitPay response', function () {
      const provider = getProvider('bitpay');
      const ticker = { base: 'BTC', quote: 'INVALID' };
      assert.throws(() => {
        provider.getLast(mockResponses.bitpay, ticker);
      }, /no data for quote INVALID/);
    });

    it('should throw error for Kraken error response', function () {
      const provider = getProvider('kraken');
      const ticker = { base: 'XXBT', quote: 'ZUSD' };
      const errorResponse = {
        result: {},
        error: ['Some error occurred'],
      };
      assert.throws(() => {
        provider.getLast(errorResponse, ticker);
      }, /Some error occurred/);
    });

    it('should throw error for missing Kraken pair', function () {
      const provider = getProvider('kraken');
      const ticker = { base: 'INVALID', quote: 'ZUSD' };
      assert.throws(() => {
        provider.getLast(mockResponses.kraken, ticker);
      }, /no data for pair INVALIDZUSD/);
    });
  });

  describe('parseData method', function () {
    it('should convert getLast result to number', function () {
      const provider = getProvider('binance');
      const ticker = { base: 'BTC', quote: 'USDT' };
      const result = provider.parseData(mockResponses.binance, ticker);
      assert.strictEqual(typeof result, 'number');
      assert.strictEqual(result, 56379.3);
    });

    it('should handle string prices', function () {
      const provider = getProvider('kraken');
      const ticker = { base: 'XXBT', quote: 'ZUSD' };
      const result = provider.parseData(mockResponses.kraken, ticker);
      assert.strictEqual(typeof result, 'number');
      assert.strictEqual(result, 56438.1);
    });
  });

  describe('BaseProvider helpers', function () {
    it('throwNoData should throw with correct message', function () {
      assert.throws(() => throwNoData('quote', 'EUR'), /no data for quote EUR/);
    });

    it('throwApiError should throw with provided message', function () {
      assert.throws(() => throwApiError('rate limit exceeded'), /rate limit exceeded/);
    });

    it('throwApiError should throw "unknown error" when undefined', function () {
      assert.throws(() => throwApiError(undefined), /unknown error/);
    });

    it('formatSymbol should concatenate and uppercase', function () {
      assert.strictEqual(formatSymbol('btc', 'usd'), 'BTCUSD');
      assert.strictEqual(formatSymbol('Eth', 'Eur'), 'ETHEUR');
      assert.strictEqual(formatSymbol('BTC', 'USDT'), 'BTCUSDT');
    });
  });

  describe('provider metadata', function () {
    it('should have valid apiName for all providers', function () {
      Object.keys(Providers).forEach((name: ProviderKey) => {
        const provider = getProvider(name);
        assert.strictEqual(typeof provider.apiName, 'string');
        assert.ok(provider.apiName.length > 0);
      });
    });

    it('should have valid interval for all providers', function () {
      Object.keys(Providers).forEach((name: ProviderKey) => {
        const provider = getProvider(name);
        assert.strictEqual(typeof provider.interval, 'number');
        assert.ok(provider.interval > 0);
      });
    });

    it('should have default ticker for all providers', function () {
      Object.keys(Providers).forEach((name: ProviderKey) => {
        const provider = getProvider(name);
        const ticker = provider.getDefaultTicker();
        assert.ok(ticker.base);
        assert.ok(ticker.quote);
      });
    });
  });
});
