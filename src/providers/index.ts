import * as BaseProvider from './BaseProvider';

export * as BaseProvider from './BaseProvider';

import * as ProviderBinance from './ProviderBinance';
import * as ProviderBinanceFutures from './ProviderBinanceFutures';
import * as ProviderBit2C from './ProviderBit2C';
import * as ProviderBitfinex from './ProviderBitfinex';
import * as ProviderBitMEX from './ProviderBitMEX';
import * as ProviderBitPay from './ProviderBitPay';
import * as ProviderBitkub from './ProviderBitkub';
import * as ProviderBitso from './ProviderBitso';
import * as ProviderBitstamp from './ProviderBitstamp';
import * as ProviderBittrex from './ProviderBittrex';
import * as ProviderBuda from './ProviderBuda';
import * as ProviderBTCMarkets from './ProviderBTCMarkets';
import * as ProviderCexio from './ProviderCexio';
import * as ProviderCoinbase from './ProviderCoinbase';
import * as ProviderCoinGecko from './ProviderCoinGecko';
import * as ProviderCryptoCompare from './ProviderCryptoCompare';
import * as ProviderFtx from './ProviderFtx';
import * as ProviderGate from './ProviderGate';
import * as ProviderHitBTC from './ProviderHitBTC';
import * as ProviderHuobi from './ProviderHuobi';
import * as ProviderKraken from './ProviderKraken';
import * as ProviderKucoin from './ProviderKucoin';
import * as ProviderMEXC from './ProviderMEXC';
import * as ProviderNobitex from './ProviderNobitex';
import * as ProviderPaymium from './ProviderPaymium';
import * as ProviderPoloniex from './ProviderBitPay';
import * as ProviderTomoX from './ProviderTomoX';
import * as ProviderVccExchange from './ProviderVccExchange';
import * as ProviderBybit from './ProviderBybit';
import * as ProviderBybitPerpetual from './ProviderBybitPerpetual';

export const Providers: Record<string, BaseProvider.Api> = {
  binance: new ProviderBinance.Api(),
  binanceFutures: new ProviderBinanceFutures.Api(),
  bit2c: new ProviderBit2C.Api(),
  bitfinex: new ProviderBitfinex.Api(),
  bitmex: new ProviderBitMEX.Api(),
  bitpay: new ProviderBitPay.Api(),
  bitkub: new ProviderBitkub.Api(),
  bitso: new ProviderBitso.Api(),
  bitstamp: new ProviderBitstamp.Api(),
  bittrex: new ProviderBittrex.Api(),
  btcmarkets: new ProviderBTCMarkets.Api(),
  buda: new ProviderBuda.Api(),
  bybit: new ProviderBybit.Api(),
  bybitPerpetual: new ProviderBybitPerpetual.Api(),
  cexio: new ProviderCexio.Api(),
  coinbase: new ProviderCoinbase.Api(),
  coingecko: new ProviderCoinGecko.Api(),
  cryptocompare: new ProviderCryptoCompare.Api(),
  ftx: new ProviderFtx.Api(),
  gate: new ProviderGate.Api(),
  hitbtc: new ProviderHitBTC.Api(),
  huobi: new ProviderHuobi.Api(),
  kraken: new ProviderKraken.Api(),
  kucoin: new ProviderKucoin.Api(),
  mexc: new ProviderMEXC.Api(),
  nobitex: new ProviderNobitex.Api(),
  paymium: new ProviderPaymium.Api(),
  poloniex: new ProviderPoloniex.Api(),
  tomox: new ProviderTomoX.Api(),
  vccexchange: new ProviderVccExchange.Api(),
};

export type ProviderKey = keyof typeof Providers;

export function getProvider(name: ProviderKey): BaseProvider.Api {
  if (name in Providers) {
    return Providers[name];
  } else {
    throw new Error(`unknown api ${name}`);
  }
}
