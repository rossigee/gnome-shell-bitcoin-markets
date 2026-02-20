import * as BaseProvider from './BaseProvider';

export * as BaseProvider from './BaseProvider';

import * as ProviderBinance from './ProviderBinance';
import * as ProviderBinanceFutures from './ProviderBinanceFutures';
import * as ProviderBit2C from './ProviderBit2C';
import * as ProviderBitfinex from './ProviderBitfinex';
import * as ProviderBitMEX from './ProviderBitMEX';
import * as ProviderBitPay from './ProviderBitPay';
import * as ProviderBitso from './ProviderBitso';
import * as ProviderBitstamp from './ProviderBitstamp';
import * as ProviderBuda from './ProviderBuda';
import * as ProviderBTCMarkets from './ProviderBTCMarkets';
import * as ProviderCexio from './ProviderCexio';
import * as ProviderCoinbase from './ProviderCoinbase';
import * as ProviderCoinGecko from './ProviderCoinGecko';
import * as ProviderCryptoCompare from './ProviderCryptoCompare';
import * as ProviderGate from './ProviderGate';
import * as ProviderHitBTC from './ProviderHitBTC';
import * as ProviderHTX from './ProviderHTX';
import * as ProviderKraken from './ProviderKraken';
import * as ProviderKucoin from './ProviderKucoin';
import * as ProviderMEXC from './ProviderMEXC';
import * as ProviderPaymium from './ProviderPaymium';
import * as ProviderPoloniex from './ProviderPoloniex';
import * as ProviderBybit from './ProviderBybit';
import * as ProviderBybitPerpetual from './ProviderBybitPerpetual';

export const Providers: Record<string, BaseProvider.Api> = {
  binance: new ProviderBinance.Api(),
  binanceFutures: new ProviderBinanceFutures.Api(),
  bit2c: new ProviderBit2C.Api(),
  bitfinex: new ProviderBitfinex.Api(),
  bitmex: new ProviderBitMEX.Api(),
  bitpay: new ProviderBitPay.Api(),
  bitso: new ProviderBitso.Api(),
  bitstamp: new ProviderBitstamp.Api(),
  btcmarkets: new ProviderBTCMarkets.Api(),
  buda: new ProviderBuda.Api(),
  bybit: new ProviderBybit.Api(),
  bybitPerpetual: new ProviderBybitPerpetual.Api(),
  cexio: new ProviderCexio.Api(),
  coinbase: new ProviderCoinbase.Api(),
  coingecko: new ProviderCoinGecko.Api(),
  cryptocompare: new ProviderCryptoCompare.Api(),
  gate: new ProviderGate.Api(),
  hitbtc: new ProviderHitBTC.Api(),
  htx: new ProviderHTX.Api(),
  huobi: new ProviderHTX.Api(), // backward compat alias (Huobi rebranded to HTX)
  kraken: new ProviderKraken.Api(),
  kucoin: new ProviderKucoin.Api(),
  mexc: new ProviderMEXC.Api(),
  paymium: new ProviderPaymium.Api(),
  poloniex: new ProviderPoloniex.Api(),
};

export type ProviderKey = keyof typeof Providers;

export function getProvider(name: ProviderKey): BaseProvider.Api {
  if (name in Providers) {
    return Providers[name];
  } else {
    throw new Error(`unknown api ${name}`);
  }
}
