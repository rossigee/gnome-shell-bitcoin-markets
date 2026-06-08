#!/bin/bash

# Provider Health Check - Verify all crypto exchange APIs are operational
# Tests HTTP connectivity and checks for authentication requirements

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0
TIMEOUT=5

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Provider Health Check${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Test each provider
test_provider() {
  local provider=$1
  local url=$2

  # Get HTTP status code
  http_code=$(curl -s -o /dev/null -w "%{http_code}" -m $TIMEOUT --connect-timeout 3 "$url" 2>/dev/null)

  case $http_code in
    200|201|202|203|206)
      echo -e "${GREEN}✓${NC} $provider"
      ((PASS_COUNT++))
      ;;
    401|403)
      echo -e "${RED}✗${NC} $provider (Auth required - HTTP $http_code)"
      ((FAIL_COUNT++))
      ;;
    404|410)
      echo -e "${RED}✗${NC} $provider (Not found - HTTP $http_code)"
      ((FAIL_COUNT++))
      ;;
    429|503|502|504)
      echo -e "${YELLOW}⚠${NC} $provider (Service issue - HTTP $http_code)"
      ((WARN_COUNT++))
      ;;
    000)
      echo -e "${RED}✗${NC} $provider (Connection timeout)"
      ((FAIL_COUNT++))
      ;;
    *)
      echo -e "${YELLOW}?${NC} $provider (HTTP $http_code)"
      ((WARN_COUNT++))
      ;;
  esac
}

# Bitstamp
test_provider "Bitstamp" "https://www.bitstamp.net/api/v2/ticker/btcusd"

# Binance
test_provider "Binance" "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"

# Bitfinex
test_provider "Bitfinex" "https://api.bitfinex.com/v2/ticker/tBTCUSD"

# Coinbase
test_provider "Coinbase" "https://api.coinbase.com/v2/exchange-rates?currency=BTC"

# Kraken
test_provider "Kraken" "https://api.kraken.com/0/public/Ticker?pair=XBTUSDT"

# Kucoin
test_provider "Kucoin" "https://openapi-v2.kucoin.com/api/v1/market/orderbook/level1?symbol=BTC-USDT"

# Bybit
test_provider "Bybit" "https://api.bybit.com/v5/market/tickers?category=spot&symbol=BTCUSDT"

# Gate.io
test_provider "Gate.io" "https://api.gateio.ws/api/v4/spot/tickers?currency_pair=BTC_USDT"

# CoinGecko
test_provider "CoinGecko" "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"

# HTX
test_provider "HTX" "https://api.htx.com/market/detail?symbol=btcusdt"

# BitMEX
test_provider "BitMEX" "https://www.bitmex.com/api/v1/instrument?symbol=XBTUSD"

# BitPay
test_provider "BitPay" "https://bitpay.com/api/rates/BTC"

# Bitso
test_provider "Bitso" "https://api.bitso.com/v3/ticker?book=btc_usd"

# BTCMarkets
test_provider "BTCMarkets" "https://api.btcmarkets.net/market/BTC/USD/tick"

# Buda (uses CLP as default pair)
test_provider "Buda" "https://www.buda.com/api/v2/markets/BTC-CLP/ticker"

# Bit2C
test_provider "Bit2C" "https://bit2c.co.il/Exchanges/BTC/USD/Ticker.json"

# CEX.IO
test_provider "CEX.IO" "https://cex.io/api/ticker/BTC/USD"

# HitBTC
test_provider "HitBTC" "https://api.hitbtc.com/api/2/public/ticker/BTCUSD"

# Paymium
test_provider "Paymium" "https://paymium.com/api/v1/data/eur/ticker"

# Poloniex
test_provider "Poloniex" "https://api.poloniex.com/markets/ticker24h"

# MEXC
test_provider "MEXC" "https://api.mexc.com/api/v3/ticker/price"

# CryptoCompare
test_provider "CryptoCompare" "https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD"

# Binance Futures
test_provider "Binance Futures" "https://fapi.binance.com/fapi/v1/ticker/price?symbol=BTCUSDT"

# Bybit Perpetual
test_provider "Bybit Perpetual" "https://api.bybit.com/v5/market/tickers?category=linear&symbol=BTCUSDT"

# BybitBase
test_provider "BybitBase" "https://api.bybit.com/v5/market/tickers?category=spot"

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "Results:"
echo -e "  ${GREEN}$PASS_COUNT passed${NC}"
echo -e "  ${YELLOW}$WARN_COUNT warnings${NC}"
echo -e "  ${RED}$FAIL_COUNT failed${NC}"
echo -e "${BLUE}========================================${NC}"

if [ $FAIL_COUNT -eq 0 ]; then
  echo -e "${GREEN}All critical providers are operational!${NC}"
  exit 0
else
  echo -e "${RED}$FAIL_COUNT provider(s) have issues${NC}"
  exit 1
fi
