import * as BaseProvider from './BaseProvider';

export class Api extends BaseProvider.Api {
  apiName = 'Bitkub';

  apiDocs = [
    ['API Docs', 'https://github.com/bitkub/bitkub-official-api-docs/blob/master/restful-api.md#get-apimarketbids'],
  ];

  interval = 60; // unclear, should be safe

  getUrl({ base, quote }) {
    const symbol = `${quote}_${base}`.toUpperCase();
    return `https://api.bitkub.com/api/market/ticker?sym=${symbol}`;
  }

  getLast(data, { base, quote }) {
    const key = `${quote}_${base}`.toUpperCase();
    if (!data[key]) {
      BaseProvider.throwNoData('pair', key);
    }
    return data[key].last;
  }

  getDefaultTicker(): BaseProvider.Ticker {
    return { base: 'BTC', quote: 'THB' };
  }
}
