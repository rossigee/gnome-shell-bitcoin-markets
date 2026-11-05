# gnome-shell-bitcoin-markets

![Screenshot](https://github.com/rossigee/gnome-shell-bitcoin-markets/blob/master/data/screenshot.png?raw=true)

Displays Bitcoin and Altcoin market information in the GNOME Shell top panel.

## Supported GNOME Shell Versions

- GNOME Shell 46, 47, 48, 49, 50, 51
- Tested on Fedora 45 (GNOME Shell 51.1)

## Available APIs

- BTCMarkets
- Binance
- Binance Futures
- Bit2C
- BitMEX
- BitPay
- Bitfinex
- Bitso
- Bitstamp
- Buda
- Bybit
- Bybit Perpetual
- CEX.IO
- CoinGecko
- Coinbase
- CryptoCompare
- Gate.io
- HitBTC
- HTX (formerly Huobi)
- Kraken
- Kucoin
- MEXC
- Paymium
- Poloniex

## Installation

### Via extensions.gnome.org

The latest reviewed version can be found at:
https://extensions.gnome.org/extension/648/bitcoin-markets/

### Via GitHub (Development Version)

The latest development version can be installed manually:

```bash
git clone https://github.com/psam21/gnome-shell-bitcoin-markets.git
cd gnome-shell-bitcoin-markets
npm install
make
make install
```

Then enable the extension via the Extensions app (or `gnome-extensions-app`) or GNOME Tweaks.

### Fedora-Specific Notes

On Fedora 45+, ensure you have the required build dependencies:

```bash
sudo dnf install nodejs nodejs-npm gettext glib2-devel
```

## Format Options

### Base Options

| Option | Result |
| ------ | ------ |
| `b`    | Base currency code |
| `bs`   | Base currency symbol \|\| base currency code |
| `btc`  | Bitcoin symbol (₿) |

### Value Options

| Option | Result |
| ------ | ------ |
| `v`    | Formatted value with defaults |
| `mv`   | Value divided by 1,000 |
| `kv`   | Value multiplied by 1,000 |
| `satv` | Value multiplied by 1e8 (satoshis) |
| `mv0`-`mv8` | Value / 1,000 with 0-8 decimals |
| `kv0`-`kv8` | Value × 1,000 with 0-8 decimals |
| `satv0`-`satv8` | Value × 1e8 with 0-8 decimals |
| `raw`  | Raw value without additional formatting |
| `moscow` | Moscow Time format (price in sats as HH:MM) |
| `moscow!segment` | Moscow Time as segment display characters |

### Quote Options

| Option | Result |
| ------ | ------ |
| `q`    | Quote currency code |
| `qs`   | Quote currency symbol \|\| quote currency code |

## Configuration

Open the extension preferences via the Extensions app or run:

```bash
gnome-extensions prefs bitcoin-markets@ottoallmendinger.github.com
```

### Settings

- **Provider**: Select the exchange API (Binance, Coinbase, Kraken, etc.)
- **Base Currency**: The cryptocurrency to track (e.g., BTC, ETH)
- **Quote Currency**: The fiat currency to display prices in (e.g., USD, EUR)
- **Format**: Custom display format using the options above (default: `{v} {qs}`)
- **Show Change**: Display ▲/▼ indicator for price movement

## Development

### Commands

```bash
make              # Build and create distribution archive
make build        # Install deps, build dist/, create archive
make install      # Install extension to ~/.local/share/gnome-shell/extensions/
make restart      # Restart GNOME Shell (Wayland: log out/in; X11: Alt+F2, r)
make watch        # Watch mode for development (rebuilds on changes)
make prefs        # Open preferences dialog
make lint         # Run ESLint
make check        # TypeScript type checking
npm test          # Run Mocha tests for providers and utilities
```

### Debugging

Monitor extension logs:

```bash
journalctl /usr/bin/gnome-shell -f
```

Filter for this extension:

```bash
journalctl /usr/bin/gnome-shell -f | grep -i bitcoin
```

### Architecture

- **`src/extension.ts`**: Main extension entry point, manages panel indicators
- **`src/prefs/prefs.ts`**: Preferences dialog (GTK4/Adwaita)
- **`src/ApiService.ts`**: HTTP polling, circuit breakers, retry logic, subscriber notifications
- **`src/providers/`**: 25+ exchange implementations extending `BaseProvider`
- **`src/format/`**: Price formatting, Moscow Time, currency symbols

### Adding a New Exchange

1. Create a new provider class in `src/providers/` extending `BaseProvider`
2. Implement: `getUrl()`, `getLast()`, `getDefaultTicker()`, `apiName`, `apiDocs`, `interval`
3. Register it in `src/providers/index.ts`

## Dependencies

### Runtime (GNOME Shell)
- GNOME Shell 46+
- GJS (JavaScript bindings)
- libsoup3 (HTTP client)

### Build-Time
- Node.js 20+
- npm
- TypeScript 5+
- Rollup (bundler)
- gettext (translations)
- glib2-devel (schema compilation)

## Translations

Supported languages: German (de), Spanish (es), Portuguese (pt_BR)

To update translations:
```bash
make translations
```

## License

MIT License - see LICENSE file for details.

## Contributors

- https://github.com/filidorwiese - Altcoin support, CoinMarketCap and Poloniex support
- https://github.com/fearenales - Popup settings implementation, BTCChina support
- https://github.com/b00bl1k - WEX support
- https://github.com/osiux - Bitso support
- https://github.com/brunobertoldi - Bitfinex support
- https://github.com/eloo - Kraken support
- https://github.com/plehatron - CEX.io support
- https://github.com/h6w - BTCMarkets.net support
- https://github.com/vecr25 - Binance support
- https://github.com/joaoescribano - CoinGecko support
- https://github.com/volandku - BitMEX support
- https://github.com/HawtDogFlvrWtr - CryptoCompare support
- https://github.com/jpereira - Blinktrade support
- https://github.com/WeirdFishBK201 - Huobi support
- https://github.com/thanhnguyennguyen - HitBTC, Kucoin, and BinanceFutures support
- https://github.com/omerta - Buda support
- https://github.com/sha-265 - Bit2C support
- https://github.com/proro485 - Gate.io, MEXC support
- https://github.com/psam21 - Fedora 45 / GNOME Shell 51 compatibility, CI improvements

## Format options

### Base options

| option | result                                       |
| ------ | -------------------------------------------- |
| b      | base currency code                           |
| bs     | base currency symbol \|\| base currency code |
| btc    | btc symbol                                   |

### Value options

| option         | result                                   |
| -------------- | ---------------------------------------- |
| v              | value                                    |
| mv             | value divided by 1000                    |
| kv             | value multiplied by 1000                 |
| satv           | value multiplied by 1e8                  |
| mv0            | value divided by 1000 with 0 decimals    |
| mv1            | value divided by 1000 with 1 decimal     |
| mv2            | value divided by 1000 with 2 decimals    |
| ...            | ...                                      |
| mv8            | value divided by 1000 with 8 decimals    |
| kv0            | value multiplied by 1000 with 0 decimals |
| kv1            | value multiplied by 1000 with 1 decimal  |
| kv2            | value multiplied by 1000 with 2 decimals |
| ...            | ...                                      |
| kv8            | value multiplied by 1000 with 8 decimals |
| satv0          | value multiplied by 1e8 with 0 decimals  |
| satv1          | value multiplied by 1e8 with 1 decimal   |
| satv2          | value multiplied by 1e8 with 2 decimals  |
| ...            | ...                                      |
| satv8          | value multiplied by 1e8 with 8 decimals  |
| raw            | raw value without additional formatting  |
| moscow         | moscow time                              |
| moscow!segment | moscow time as segment characters        |

### Quote options

| option | result                                         |
| ------ | ---------------------------------------------- |
| q      | quote currency code                            |
| qs     | quote currency symbol \|\| quote currency code |

## Development

With `make restart` the gnome-shell can be restarted during development iterations.

On most systems you can use `journalctl /usr/bin/gnome-shell -f` to get log output from this (and other) extensions.

## Contributors

- https://github.com/filidorwiese - Altcoin support, CoinMarketCap and Poloniex support
- https://github.com/fearenales - Popup settings implementation, BTCChina support
- https://github.com/b00bl1k - WEX support
- https://github.com/osiux - Bitso support
- https://github.com/brunobertoldi - Bitfinex support
- https://github.com/eloo - Kraken support
- https://github.com/plehatron - CEX.io support
- https://github.com/h6w - BTCMarkets.net support
- https://github.com/vecr25 - Binance support
- https://github.com/joaoescribano - CoinGecko support
- https://github.com/volandku - BitMEX support
- https://github.com/HawtDogFlvrWtr - CryptoCompare support
- https://github.com/jpereira - Blinktrade support
- https://github.com/WeirdFishBK201 - Huobi support
- https://github.com/thanhnguyennguyen - HitBTC, Kucoin, and BinanceFutures support
- https://github.com/omerta - Buda support
- https://github.com/sha-265 - Bit2C support
- https://github.com/proro485 - Gate.io, MEXC support

## Tips

Bitcoin 3MuUGXgSyZXdqdgn6V4VxGBR3dtA92w1C1
