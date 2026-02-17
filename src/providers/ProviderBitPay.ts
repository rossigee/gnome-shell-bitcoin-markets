import * as BaseProvider from './BaseProvider';
import { DefaultTickers } from '../defaults';

export class Api extends BaseProvider.Api {
  apiName = 'BitPay';

  apiDocs = [['API Docs', 'https://bitpay.com/api']];

  interval = 60; // unclear, should be safe

  getUrl({ base }: BaseProvider.Ticker): string {
    return `https://bitpay.com/api/rates/${base}`;
  }

  getLast(data: any, { quote }: BaseProvider.Ticker): number {
    const result = data.find(({ code }: any) => code === quote);
    if (!result) {
      BaseProvider.throwNoData('quote', quote);
    }
    return result.rate;
  }

  getDefaultTicker(): BaseProvider.Ticker {
    return DefaultTickers.BTC_USD;
  }
}
