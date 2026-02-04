import * as BaseProvider from './BaseProvider';
import { ProviderIntervals, DefaultTickers } from '../defaults';

export class Api extends BaseProvider.Api {
  apiName = 'CryptoCompare';

  apiDocs = [['API Docs', 'https://min-api.cryptocompare.com/documentation']];

  interval = ProviderIntervals.CAUTIOUS;

  getUrl({ base, quote }: BaseProvider.Ticker): string {
    return `https://min-api.cryptocompare.com/data/price?fsym=${base}&tsyms=${quote}`;
  }

  getLast(data: any, { quote }: BaseProvider.Ticker): number {
    if (!(quote in data)) {
      BaseProvider.throwNoData('quote', quote);
    }

    return data[quote];
  }

  getDefaultTicker(): BaseProvider.Ticker {
    return DefaultTickers.BTC_USD;
  }
}
