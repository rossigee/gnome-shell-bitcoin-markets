/**
 * Common provider utility functions to reduce code duplication
 */

// Helper to throw "no data for X" errors
export function throwNoData(field: string, value: string): never {
  throw new Error(`no data for ${field} ${value}`);
}

// Helper to extract error message from various response formats
export function throwApiError(errorValue: string | undefined): never {
  throw new Error(errorValue || 'unknown error');
}

// Helper for case conversion commonly used in symbol formatting
export function formatSymbol(base: string, quote: string): string {
  return `${base}${quote}`.toUpperCase();
}

export interface Ticker {
  base: string;
  quote: string;
}

export interface Options extends Ticker {
  api: string;
  base: string;
  quote: string;
  format: string;
  attribute: string;
}

/**
 * Api definitions
 */
export abstract class Api {
  private tickers: Ticker[] = [];

  abstract apiName: string;
  abstract apiDocs: string[][];
  abstract interval: number;

  getLabel({ base, quote }: Ticker): string {
    return `${this.apiName} ${base}/${quote}`;
  }

  private getTickerInstance(ticker: Ticker): Ticker {
    const equalArray = (arr1, arr2) => arr1.length === arr2.length && arr1.every((v, i) => v === arr2[i]);

    const equalObjects = (obj1, obj2) => {
      const keys1 = Object.keys(obj1).sort();
      const keys2 = Object.keys(obj2).sort();
      return (
        equalArray(keys1, keys2) &&
        equalArray(
          keys1.map((k) => obj1[k]),
          keys1.map((k) => obj2[k]),
        )
      );
    };

    const match = this.tickers.find((t) => equalObjects(t, ticker));
    if (match) {
      return match;
    }
    this.tickers.push(ticker);
    return ticker;
  }

  abstract getUrl(options: Ticker): string;

  abstract getLast(obj: any, ticker: Ticker): number;

  getTicker({ base, quote }: Options): Ticker {
    return this.getTickerInstance({ base, quote });
  }

  parseData(data, ticker: Ticker): number {
    return Number(this.getLast(data, ticker));
  }

  getDefaultTicker(): Ticker {
    return { base: 'BTC', quote: 'USD' };
  }
}
