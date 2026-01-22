import * as BaseProvider from './BaseProvider';
import { ProviderIntervals, DefaultTickers } from '../defaults';

export class Api extends BaseProvider.Api {
  apiName = 'Binance';

  apiDocs = [['API Docs', 'https://binance-docs.github.io/apidocs/spot/en/#symbol-price-ticker']];

  interval = ProviderIntervals.CAUTIOUS;

  getUrl({ base, quote }: BaseProvider.Ticker): string {
    return `https://api.binance.com/api/v3/ticker/price?symbol=${BaseProvider.formatSymbol(base, quote)}`;
  }

  getLast(data: any): number {
    return data.price;
  }

  getDefaultTicker(): BaseProvider.Ticker {
    return DefaultTickers.BTC_USDT;
  }
}
