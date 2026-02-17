import { BybitApi } from './ProviderBybitBase';

export class Api extends BybitApi {
  apiName = 'Bybit';

  getCategory(): string {
    return 'spot';
  }
}
