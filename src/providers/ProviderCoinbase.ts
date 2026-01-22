import * as BaseProvider from './BaseProvider';
import { DefaultTickers } from '../defaults';

export class Api extends BaseProvider.Api {
  apiName = 'Coinbase';

  apiDocs = [['API Docs', 'https://developers.coinbase.com/api/v2#exchange-rates']];

  interval = 60; // unclear, should be safe

  getUrl({ base }: BaseProvider.Ticker): string {
    return `https://api.coinbase.com/v2/exchange-rates?currency=${base.toUpperCase()}`;
  }

  getLast(data: any, { quote }: BaseProvider.Ticker): number {
    const { rates } = data.data;
    if (!rates) {
      throw new Error('invalid response');
    }
    const upperQuote = quote.toUpperCase();
    if (!(upperQuote in rates)) {
      BaseProvider.throwNoData('quote', quote);
    }
    return rates[upperQuote];
  }

  getDefaultTicker(): BaseProvider.Ticker {
    return DefaultTickers.BTC_USD;
  }
}
