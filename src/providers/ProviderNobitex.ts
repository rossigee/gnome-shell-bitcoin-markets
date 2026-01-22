import * as BaseProvider from './BaseProvider';

export class Api extends BaseProvider.Api {
  apiName = 'Nobitex';

  apiDocs = [['API Docs', 'https://apidocs.nobitex.ir/#quickstart']];

  interval = 15;

  getUrl({ base, quote }) {
    return `https://apiv2.nobitex.ir/v3/orderbook/${base}${quote}`;
  }

  getLast({ lastTradePrice }, { quote }) {
    return quote == 'IRT' ? lastTradePrice / 10 : lastTradePrice;
  }

  getDefaultTicker(): BaseProvider.Ticker {
    return { base: 'BTC', quote: 'USDT' };
  }
}
