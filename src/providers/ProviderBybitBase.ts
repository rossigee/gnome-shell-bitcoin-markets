import * as BaseProvider from './BaseProvider';

/**
 * Base class for Bybit spot and perpetual trading implementations
 * Consolidates common logic to reduce duplication
 */
export abstract class BybitApi extends BaseProvider.Api {
  apiDocs = [
    ['API Docs', 'https://bybit-exchange.github.io/docs/v5/market/tickers'],
    ['Symbols', 'https://bybit-exchange.github.io/docs/v5/enum#symbol'],
  ];

  /* quote https://bybit-exchange.github.io/docs/v5/rate-limit
   * `No more than 120 requests are allowed in any 5-second window.`
   */
  interval = 10;

  /** Subclasses must define the trading category (spot or linear) */
  abstract getCategory(): string;

  getUrl({ base, quote }: BaseProvider.Ticker): string {
    const symbol = BaseProvider.formatSymbol(base, quote);
    const category = this.getCategory();
    return `https://api.bybit.com/v5/market/tickers?category=${category}&symbol=${symbol}`;
  }

  getLast(data: any): number {
    if (data.retMsg !== 'OK') {
      BaseProvider.throwApiError(data.retMsg);
    }
    return data.result.list[0].lastPrice;
  }

  getDefaultTicker(): BaseProvider.Ticker {
    return { base: 'BTC', quote: 'USDT' };
  }
}
