import * as BaseProvider from './BaseProvider';

export class Api extends BaseProvider.Api {
  apiName = 'HTX';

  apiDocs = [['API Docs', 'https://www.htx.com/en-us/opend/newApiPages/']];

  // Each API Key can send maximum of 100 https requests within 10 seconds
  // so 15 should be safe.
  interval = 15;

  getUrl({ base, quote }) {
    return 'https://api.htx.com/market/detail/' + `merged?symbol=${base}${quote}`.toLowerCase();
  }

  getLast(data) {
    if (data['status'] === 'error') {
      throw new Error(data['err-msg']);
    }

    return data.tick.bid[0];
  }

  getDefaultTicker(): BaseProvider.Ticker {
    return { base: 'btc', quote: 'usdt' };
  }
}
