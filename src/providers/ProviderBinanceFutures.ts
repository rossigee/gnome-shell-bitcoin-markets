import * as BaseProvider from './BaseProvider';
import { ProviderIntervals, DefaultTickers } from '../defaults';

export class Api extends BaseProvider.Api {
  apiName = 'Binance Futures';

  apiDocs = [
    [
      'API Docs',
      'https://binance-docs.github.io/apidocs/futures/en/#24hr-ticker-price-change-statistics-market_data',
    ],
  ];

  interval = ProviderIntervals.CAUTIOUS;

  getUrl({ base, quote }: BaseProvider.Ticker): string {
    return `https://fapi.binance.com/fapi/v1/ticker/price?symbol=${BaseProvider.formatSymbol(base, quote)}`;
  }

  getLast(data: any): number {
    return data.price;
  }

  getDefaultTicker(): BaseProvider.Ticker {
    return DefaultTickers.BTC_USDT;
  }
}
