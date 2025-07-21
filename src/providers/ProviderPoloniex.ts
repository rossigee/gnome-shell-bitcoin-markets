import * as BaseProvider from './BaseProvider';

export class Api extends BaseProvider.Api {
  apiName = 'Poloniex';

  apiDocs = [
    ['API Docs', 'https://api-docs.poloniex.com/'],
    ['Market Data', 'https://api-docs.poloniex.com/spot/api/public/market-data'],
  ];

  interval = 10;

  getUrl(_options) {
    return 'https://api.poloniex.com/markets/ticker24h';
  }

  getLast(data, { base, quote }) {
    // New API returns array of objects with symbol field
    const pair = `${base}_${quote}`;
    const ticker = data.find((item) => item.symbol === pair);

    if (!ticker) {
      throw new Error(`no data for pair ${pair}`);
    }

    return ticker.close;
  }

  getDefaultTicker() {
    return { base: 'BTC', quote: 'USDT' };
  }
}
