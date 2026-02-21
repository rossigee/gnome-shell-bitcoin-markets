import { timeoutAdd, timeoutRemove } from './timeouts';
import * as Config from '@gnome-shell/misc/config';
import Glib from '@girs/glib-2.0';
import Gio from '@girs/gio-2.0';

import * as HTTP from './HTTP';
import { getProvider, BaseProvider, Providers } from './providers';
import { Extension } from '@gnome-shell/extensions/extension';
import { ERROR_MESSAGES, createContextualError, CircuitBreaker } from './ApiServiceUtils';

interface PriceData {
  date: Date;
  value: number;
}

export interface Subscriber {
  options: BaseProvider.Options;

  onUpdateStart(): void;

  onUpdateError(err: Error, opts?: { ticker: BaseProvider.Ticker }): void;

  onUpdatePriceData(priceData: PriceData[]): void;
}

// Re-export for backwards compatibility
export { CircuitBreaker, ERROR_MESSAGES, createContextualError } from './ApiServiceUtils';

const permanentErrors: Map<BaseProvider.Api, Error> = new Map();
const permanentErrorTimeouts: Map<BaseProvider.Api, number> = new Map();
const circuitBreakers: Map<BaseProvider.Api, CircuitBreaker> = new Map();

// Clear permanent errors after 1 hour
export const PERMANENT_ERROR_TIMEOUT = 60 * 60 * 1000; // 1 hour in milliseconds

function getCircuitBreaker(provider: BaseProvider.Api): CircuitBreaker {
  if (!circuitBreakers.has(provider)) {
    circuitBreakers.set(provider, new CircuitBreaker());
  }
  return circuitBreakers.get(provider)!;
}

function setPermanentError(provider: BaseProvider.Api, error: Error) {
  permanentErrors.set(provider, error);

  // Clear any existing timeout for this provider
  const existingTimeout = permanentErrorTimeouts.get(provider);
  if (existingTimeout) {
    timeoutRemove(existingTimeout);
  }

  // Set a new timeout to clear the error
  const timeoutId = timeoutAdd(PERMANENT_ERROR_TIMEOUT, () => {
    permanentErrors.delete(provider);
    permanentErrorTimeouts.delete(provider);
    console.log(`Cleared permanent error for provider ${provider.apiName} after timeout`);
  });

  permanentErrorTimeouts.set(provider, timeoutId);
}

function filterSubscribers(
  subscribers: Subscriber[],
  {
    provider,
    url,
    ticker,
  }: {
    provider?: BaseProvider.Api;
    url?: string;
    ticker?: BaseProvider.Ticker;
  },
): Subscriber[] {
  return subscribers.filter((s) => {
    const { options } = s;
    if (provider !== undefined && getProvider(options.api) !== provider) {
      return false;
    }
    if (url !== undefined && getSubscriberUrl(s) !== url) {
      return false;
    }
    if (ticker !== undefined) {
      if (ticker !== getProvider(options.api).getTicker(s.options)) {
        return false;
      }
    }
    return true;
  });
}

const applySubscribers = (subscribers: Subscriber[], func: (s: Subscriber) => void) =>
  subscribers.forEach((s) => {
    try {
      func(s);
    } catch (e: any) {
      try {
        const { api, base, quote } = s.options;
        s.onUpdateError(e);
        e.message = `Error with subscriber ${api} ${base}${quote}: ${e.message}`;
        console.log(e);
      } catch (e) {
        console.log(e);
      }
    }
  });

class PriceDataLog {
  map: Map<BaseProvider.Ticker, Map<Date, number>> = new Map();

  maxHistory = 10;

  get(ticker: BaseProvider.Ticker): Map<Date, number> {
    if (!this.map.has(ticker)) {
      this.map.set(ticker, new Map());
    }
    return this.map.get(ticker)!;
  }

  addValue(ticker: BaseProvider.Ticker, date: Date, value: number): PriceData[] {
    if (isNaN(value)) {
      throw new Error(`invalid price value ${value}`);
    }
    const values = this.get(ticker);
    values.set(date, value);

    const keys = [...values.keys()].sort((a, b) => b.getTime() - a.getTime());
    keys.splice(this.maxHistory).forEach((k) => values.delete(k));

    return keys.map((k: Date) => ({ date: k, value: values.get(k)! }));
  }
}

const getSubscriberUrl = ({ options }: Subscriber) => getProvider(options.api).getUrl(options);

const getSubscriberTicker = ({ options }: Subscriber) => getProvider(options.api).getTicker(options);

class PollLoop {
  private provider: BaseProvider.Api;
  private interval: number;
  private cache = new Map();
  private priceDataLog = new PriceDataLog();
  private signal: number | null = null;
  private subscribers: any[] = [];
  private urls: string[] = [];
  private _cancellable: Gio.Cancellable | null = null;

  constructor(provider: BaseProvider.Api) {
    const interval = Number(provider.interval);
    if (isNaN(interval) || interval < 5) {
      throw new Error(`invalid interval for ${provider}: ${provider.interval}`);
    }
    this.interval = interval;
    this.provider = provider;
  }

  start(): boolean {
    if (this.signal === null) {
      this._cancellable = new Gio.Cancellable();
      this.signal = Glib.idle_add(Glib.PRIORITY_DEFAULT, () => {
        this.run();
        return Glib.SOURCE_REMOVE;
      });
      return true;
    }
    return false;
  }

  stop() {
    if (this.signal !== null) {
      timeoutRemove(this.signal);
      this.signal = null;
    }
    this._cancellable?.cancel();
    this._cancellable = null;
  }

  run() {
    try {
      this.update();
    } catch (e) {
      console.error(e);
    }

    this.signal = timeoutAdd(this.interval * 1000, this.run.bind(this));
  }

  setSubscribers(subscribers: Subscriber[]) {
    this.subscribers = filterSubscribers(subscribers, { provider: this.provider });

    if (this.subscribers.length === 0) {
      this.cache.clear();
      return this.stop();
    }

    this.urls = [...new Set(this.subscribers.map((s) => getSubscriberUrl(s)))];

    if (this.start()) {
      return;
    }

    this.urls.forEach((url) => this.updateUrl(url, this.cache.get(url)));
  }

  async updateUrl(url: string, cache?: { date: Date; data: any }) {
    const getUrlSubscribers = () => filterSubscribers(this.subscribers, { url });

    const tickers: Set<BaseProvider.Ticker> = new Set(getUrlSubscribers().map(getSubscriberTicker));

    const processResponse = (response: any, date: Date) => {
      tickers.forEach((ticker) => {
        const tickerSubscribers = filterSubscribers(getUrlSubscribers(), { ticker });
        try {
          const priceData = this.priceDataLog.addValue(ticker, date, this.provider.parseData(response, ticker));
          applySubscribers(tickerSubscribers, (s) => s.onUpdatePriceData(priceData));
        } catch (e: any) {
          const contextualError = createContextualError(e, { url, ticker, provider: this.provider });
          applySubscribers(tickerSubscribers, (s) => s.onUpdateError(contextualError, { ticker }));
          console.log(contextualError);
        }
      });
    };

    if (cache) {
      return processResponse(cache.data, cache.date);
    }

    applySubscribers(getUrlSubscribers(), (s) => s.onUpdateStart());

    const error = permanentErrors.get(this.provider);
    if (error) {
      applySubscribers(getUrlSubscribers(), (s) => s.onUpdateError(error));
      return;
    }

    // Check circuit breaker
    const circuitBreaker = getCircuitBreaker(this.provider);
    if (circuitBreaker.isOpen()) {
      const circuitError = new Error(ERROR_MESSAGES.PROVIDER_DISABLED);
      (circuitError as any).originalError = new Error(`Circuit breaker is OPEN for provider ${this.provider.apiName}`);
      applySubscribers(getUrlSubscribers(), (s) => s.onUpdateError(circuitError));
      return;
    }

    const ext = Extension.lookupByURL(import.meta.url);
    if (!ext) {
      throw new Error('Unable to find extension');
    }

    // Retry logic with exponential backoff
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await HTTP.getJSON(url, {
          userAgent: HTTP.getDefaultUserAgent(ext.metadata, Config.PACKAGE_VERSION),
          cancellable: this._cancellable,
        });
        const date = new Date();
        this.cache.set(url, { date, response });
        processResponse(response, date);
        circuitBreaker.recordSuccess(); // Record successful request
        return; // Success, exit retry loop
      } catch (err: any) {
        if (this._cancellable === null) {
          return; // Loop was stopped while request was in flight
        }
        const isLastAttempt = attempt === maxRetries - 1;

        if (HTTP.isErrTooManyRequests(err)) {
          setPermanentError(this.provider, err);
          console.error(err);
          this.cache.delete(url);
          applySubscribers(getUrlSubscribers(), (s) => s.onUpdateError(err));
          return;
        }

        if (!isLastAttempt) {
          // Calculate exponential backoff delay
          const delay = baseDelay * Math.pow(2, attempt);
          console.log(`Request failed, retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`);
          await new Promise((resolve) => timeoutAdd(delay, () => resolve(undefined)));
          if (this._cancellable === null) {
            return; // Loop was stopped during retry delay
          }
        } else {
          // Final attempt failed
          circuitBreaker.recordFailure(); // Record failed request
          const contextualError = createContextualError(err, { url, provider: this.provider });
          console.error(contextualError);
          this.cache.delete(url);
          applySubscribers(getUrlSubscribers(), (s) => s.onUpdateError(contextualError));
        }
      }
    }
  }

  update() {
    const lastUpdate = (url) => (this.cache.has(url) ? this.cache.get(url).date : undefined);

    const updateUrls = this.urls.filter((url) => lastUpdate(url) === undefined);

    const oldestUrl = this.urls
      .filter((url) => lastUpdate(url) !== undefined)
      .sort((a, b) => lastUpdate(a) - lastUpdate(b))[0];

    if (oldestUrl) {
      updateUrls.push(oldestUrl);
    }

    updateUrls.forEach((url) => this.updateUrl(url));
  }
}

const _pollLoops = new Map(Object.keys(Providers).map((k) => [k, new PollLoop(Providers[k])]));

export function setSubscribers(subscribers: Subscriber[]) {
  subscribers = subscribers.filter(({ options }) => {
    if (options.api in Providers) {
      return true;
    }
    console.log(new Error(`invalid provider ${options.api}`));
    return false;
  });

  _pollLoops.forEach((loop) => loop.setSubscribers(subscribers));
}
