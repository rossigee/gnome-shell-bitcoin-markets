import { BybitApi } from './ProviderBybitBase';

export class Api extends BybitApi {
  apiName = 'Bybit Perpetual';

  getCategory(): string {
    return 'linear';
  }
}
