import * as BaseProvider from './BaseProvider';
import { ProviderIntervals } from '../defaults';

export class Api extends BaseProvider.Api {
  apiName = 'Kraken';

  apiDocs = [
    ['API Docs', 'https://www.kraken.com/help/api#public-market-data'],
    ['Asset Pairs (JSON)', 'https://api.kraken.com/0/public/AssetPairs'],
  ];

  interval = ProviderIntervals.STANDARD;

  getUrl({ base, quote }: BaseProvider.Ticker): string {
    return `https://api.kraken.com/0/public/Ticker?pair=${BaseProvider.formatSymbol(base, quote)}`;
  }

  getLast(data: any, { base, quote }: BaseProvider.Ticker): number {
    const { result, error } = data;
    if (error && error.length) {
      BaseProvider.throwApiError(error[0]);
    }

    const pair = BaseProvider.formatSymbol(base, quote);
    if (pair in result) {
      return result[pair].c[0];
    }

    BaseProvider.throwNoData('pair', pair);
  }

  getDefaultTicker(): BaseProvider.Ticker {
    return { base: 'XXBT', quote: 'ZUSD' };
  }
}
