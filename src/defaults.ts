export const Defaults = {
  api: 'bitstamp',
  base: 'BTC',
  quote: 'USD',
  attribute: 'last',
  show_change: true,
  format: '{v} {qs}',
};

// Common update intervals for providers (in seconds)
export const ProviderIntervals = {
  STANDARD: 10, // Most providers use 10 seconds
  CAUTIOUS: 15, // Some providers use 15 seconds for rate limiting
} as const;

// Common default trading pairs
export const DefaultTickers = {
  BTC_USD: { base: 'BTC', quote: 'USD' },
  BTC_USDT: { base: 'BTC', quote: 'USDT' },
  BTC_EUR: { base: 'BTC', quote: 'EUR' },
} as const;
