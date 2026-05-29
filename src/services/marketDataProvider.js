import { generateSeededCandles } from '../utils/seededRandom';

/**
 * Strict Binance timeframe interval mapping
 */
export function toBinanceInterval(timeframe) {
  const map = {
    "1m": "1m",
    "5m": "5m",
    "15m": "15m",
    "30m": "30m",
    "1h": "1h",
    "4h": "4h",
    "1D": "1d",
    "1W": "1w",
    "1M": "1M",
  };
  return map[timeframe] || null;
}

/**
 * Get Binance candle fetch limit based on timeframe
 */
function getBinanceLimit(timeframe) {
  const tf = timeframe.trim();
  if (tf === '1D' || tf === '1d') return 180;
  if (tf === '1W' || tf === '1w') return 156;
  if (tf === '1M' || tf === '1mo' || tf === '1Mo') return 96;
  return 300;
}

/**
 * Maps application symbol to Binance Spot pair. Strips slashes and converts USD to USDT.
 */
export function toBinanceSymbol(appSymbol) {
  if (!appSymbol) return null;
  const sym = appSymbol.toUpperCase().replace('/', '').trim();
  
  // Specific mappings for USD -> USDT
  if (sym === 'BTCUSD') return 'BTCUSDT';
  if (sym === 'ETHUSD') return 'ETHUSDT';
  if (sym === 'BNBUSD') return 'BNBUSDT';
  if (sym === 'SOLUSD') return 'SOLUSDT';
  if (sym === 'XRPUSD') return 'XRPUSDT';
  if (sym === 'DOGEUSD') return 'DOGEUSDT';
  if (sym === 'ADAUSD') return 'ADAUSDT';
  if (sym === 'AVAXUSD') return 'AVAXUSDT';
  if (sym === 'DOTUSD') return 'DOTUSDT';
  if (sym === 'MATICUSD') return 'MATICUSDT';
  
  // Supported Binance Spot pairs
  const supportedCrypto = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'DOGEUSDT', 'ADAUSDT', 'AVAXUSDT', 'DOTUSDT', 'MATICUSDT'];
  if (supportedCrypto.includes(sym)) {
    return sym;
  }
  return null;
}

/**
 * Maps application symbol to Twelve Data symbol (forex gets slashes EURUSD -> EUR/USD)
 */
export function toTwelveDataSymbol(appSymbol) {
  if (!appSymbol) return null;
  const upper = appSymbol.toUpperCase().trim();
  
  if (upper.includes('/')) {
    return upper;
  }

  // Forex pairs mapping
  const forexPairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD', 'EURGBP', 'EURJPY', 'GBPJPY'];
  if (forexPairs.includes(upper)) {
    return `${upper.slice(0, 3)}/${upper.slice(3)}`;
  }
  
  // Commodities XAUUSD, XAGUSD
  if (upper === 'XAUUSD') return 'XAU/USD';
  if (upper === 'XAGUSD') return 'XAG/USD';
  
  // Standard stocks or indices
  if (upper.length === 6) {
    const isCryptoWord = upper.startsWith('BTC') || upper.startsWith('ETH') || upper.startsWith('SOL') || upper.startsWith('BNB') || upper.startsWith('XRP') || upper.startsWith('ADA') || upper.startsWith('DOT') || upper.startsWith('DOGE') || upper.endsWith('USDT');
    if (!isCryptoWord) {
      return `${upper.slice(0, 3)}/${upper.slice(3)}`;
    }
  }

  return upper;
}

/**
 * Normalise timeframe for Twelve Data
 */
function normalizeTimeframeTwelveData(timeframe) {
  const num = parseInt(timeframe);
  const unit = timeframe.replace(num, '').trim();
  if (unit === 'm') return `${num}min`;
  if (unit === 'h') return `${num}h`;
  if (unit === 'd' || unit === 'D') return '1day';
  if (unit === 'w' || unit === 'W') return '1week';
  if (unit === 'mo' || unit === 'M') return '1month';
  return '1h';
}

/**
 * Normalise timeframe for Alpha Vantage
 */
function normalizeTimeframeAlphaVantage(timeframe) {
  const num = parseInt(timeframe);
  const unit = timeframe.replace(num, '').toLowerCase();
  if (unit === 'm') return `${num}min`;
  if (unit === 'h') return '60min';
  if (unit === 'd') return 'daily';
  if (unit === 'w') return 'weekly';
  if (unit === 'mo' || unit === 'M') return 'monthly';
  return '60min';
}

// Twelve Data Caching and Debouncing State
const twelveDataCache = new Map(); // key: `${symbol}_${timeframe}_${marketType}`, value: { timestamp, response }
let lastTwelveDataRequestToken = 0;

/**
 * Classify Twelve Data errors into standard user-facing labels
 */
function classifyTwelveDataError(error, responseStatus) {
  const errMsg = (error && error.message ? error.message : String(error)).toLowerCase();
  
  if (responseStatus === 429 || errMsg.includes('limit') || errMsg.includes('rate') || errMsg.includes('credits') || errMsg.includes('plan')) {
    return {
      message: 'Demo Feed — Twelve Data limit reached.',
      error: 'Twelve Data API limit reached. Switched to demo feed.'
    };
  }
  
  if (responseStatus === 404 || errMsg.includes('not found') || errMsg.includes('unsupported symbol') || errMsg.includes('invalid symbol') || errMsg.includes('exist') || errMsg.includes('symbol')) {
    return {
      message: 'Demo Feed — unsupported Twelve Data symbol.',
      error: 'Unsupported Twelve Data symbol. Switched to demo feed.'
    };
  }
  
  if (errMsg.includes('interval') || errMsg.includes('timeframe') || errMsg.includes('period')) {
    return {
      message: 'Demo Feed — interval not supported.',
      error: 'Timeframe/interval not supported by Twelve Data. Switched to demo feed.'
    };
  }

  if (errMsg.includes('no data') || errMsg.includes('closed') || errMsg.includes('empty')) {
    return {
      message: 'Demo Feed — Twelve Data unavailable.',
      error: 'Market closed or no data available. Switched to demo feed.'
    };
  }
  
  if (errMsg.includes('fetch') || errMsg.includes('network') || errMsg.includes('offline') || errMsg.includes('cors')) {
    return {
      message: 'Demo Feed — Twelve Data unavailable.',
      error: 'Network unavailable. Switched to demo feed.'
    };
  }

  return {
    message: 'Demo Feed — Twelve Data unavailable.',
    error: error.message || 'Twelve Data unavailable. Switched to demo feed.'
  };
}

/**
 * Unified Market Data Provider supporting fallback behavior and data normalization
 * Secret keys require backend proxy before production.
 * Do not store secrets such as OPENAI_API_KEY, RAZORPAY_KEY_SECRET, SUPABASE_SERVICE_ROLE_KEY, or BROKER_SECRET_KEY on the frontend.
 */
export async function marketDataProvider({ symbol, timeframe, marketType, mode }) {
  const resolvedMode = mode || import.meta.env.VITE_MARKET_DATA_MODE || 'demo';
  
  // Seeded demo candles format: { time, open, high, low, close, volume }
  const demoResult = generateSeededCandles(symbol, timeframe);
  const demoCandles = demoResult.candles;

  // Validate symbol & timeframe
  const supportedTimeframeUnits = ['m', 'h', 'd', 'D', 'w', 'W', 'mo', 'M'];
  const tfNum = parseInt(timeframe);
  const tfUnit = timeframe.replace(tfNum, '').trim();
  const isValidTimeframe = !isNaN(tfNum) && supportedTimeframeUnits.includes(tfUnit);
  const isValidSymbol = symbol && symbol.length >= 3;

  if (!isValidSymbol || !isValidTimeframe) {
    return {
      candles: demoCandles,
      mode: 'demo_fallback',
      message: 'Invalid symbol or unsupported timeframe.',
      isLive: false,
      error: 'Invalid symbol or unsupported timeframe.'
    };
  }

  // Under all conditions, only demo mode works for now.
  // We check the requested mode and simulate fallback messages accordingly.

  const cacheKey = `${symbol}_${timeframe}_${marketType}`;

  // Strict Provider Routing: Non-Crypto uses Twelve Data (or Demo if key missing / mode is demo)
  if (marketType !== 'crypto') {
    if (resolvedMode === 'demo') {
      return {
        candles: demoCandles,
        mode: 'demo',
        message: 'Demo Feed — connect API for live market data.',
        isLive: false
      };
    }

    // Cache lookup (valid for 60 seconds)
    const cachedEntry = twelveDataCache.get(cacheKey);
    if (cachedEntry && (Date.now() - cachedEntry.timestamp < 60000)) {
      if (import.meta.env.DEV) {
        console.log('[Dev Debug] Twelve Data Cache Hit:', cacheKey);
      }
      return cachedEntry.response;
    }

    const twelvedataKey = import.meta.env.VITE_TWELVEDATA_API_KEY;
    if (!twelvedataKey || !twelvedataKey.trim()) {
      return {
        candles: demoCandles,
        mode: 'demo_fallback',
        message: 'Demo Feed — Twelve Data key not configured.',
        isLive: false,
        error: 'Twelve Data key not configured. Using demo feed.'
      };
    }

    const tdSymbol = toTwelveDataSymbol(symbol);
    const tdInterval = normalizeTimeframeTwelveData(timeframe);
    let fetchResponse = null;

    // Debounce: Wait 350ms to see if user changed selection.
    const myRequestToken = ++lastTwelveDataRequestToken;
    await new Promise(resolve => setTimeout(resolve, 350));
    if (myRequestToken !== lastTwelveDataRequestToken) {
      if (import.meta.env.DEV) {
        console.log('[Dev Debug] Twelve Data request superceded:', cacheKey);
      }
      const cachedBackup = twelveDataCache.get(cacheKey);
      if (cachedBackup) {
        return cachedBackup.response;
      }
      return {
        candles: demoCandles,
        mode: 'demo_fallback',
        message: 'Demo Feed — Twelve Data unavailable.',
        isLive: false,
        error: 'Request superceded.'
      };
    }

    try {
      const url = `https://api.twelvedata.com/time_series?symbol=${tdSymbol}&interval=${tdInterval}&apikey=${twelvedataKey}&outputsize=300`;

      const response = await fetch(url);
      fetchResponse = response;

      if (!response.ok) {
        throw {
          message: `Twelve Data fetch failed with status ${response.status}`
        };
      }

      const data = await response.json();
      
      // Twelve Data error responses are returned inside JSON { status: "error", message: "..." }
      if (data && data.status === 'error') {
        const msg = (data.message || '').toLowerCase();
        const isNotFound = msg.includes('not found') || msg.includes('unsupported') || msg.includes('invalid') || msg.includes('exist');
        throw {
          isUnsupportedSymbol: isNotFound,
          message: data.message || 'Twelve Data API returned error'
        };
      }

      const hasValues = data && Array.isArray(data.values);
      const isStatusOk = data && (data.status === 'ok' || !data.status);

      if (!hasValues || !isStatusOk) {
        throw {
          message: data ? data.message || 'Twelve Data returned invalid status or empty values' : 'No response data'
        };
      }

      const normalized = data.values.map(item => {
        let timestamp;
        if (item.datetime.includes(':')) {
          timestamp = Math.floor(new Date(item.datetime).getTime() / 1000);
        } else {
          timestamp = Math.floor(new Date(`${item.datetime} 00:00:00`).getTime() / 1000);
        }
        return {
          time: timestamp,
          open: Number(item.open),
          high: Number(item.high),
          low: Number(item.low),
          close: Number(item.close),
          volume: Number(item.volume || 0)
        };
      });

      // Sort oldest to newest
      normalized.sort((a, b) => a.time - b.time);

      if (import.meta.env.DEV) {
        console.log('[Dev Debug] Twelve Data Sourcing:', {
          provider: 'twelvedata',
          mappedSymbol: tdSymbol,
          interval: tdInterval,
          responseStatus: response.status,
          valuesLength: data.values.length,
          normalizedCandleCount: normalized.length,
          firstCandleTime: normalized.length > 0 ? normalized[0].time : null,
          lastCandleTime: normalized.length > 0 ? normalized[normalized.length - 1].time : null
        });
      }

      const successResponse = {
        candles: normalized,
        mode: 'twelvedata',
        message: 'Twelve Data Market Data',
        isLive: true
      };

      // Cache successful response
      twelveDataCache.set(cacheKey, {
        timestamp: Date.now(),
        response: successResponse
      });

      return successResponse;
    } catch (e) {
      const responseStatus = fetchResponse ? fetchResponse.status : null;
      const errorClassification = classifyTwelveDataError(e, responseStatus);

      if (import.meta.env.DEV) {
        console.error('[Dev Debug] Twelve Data Failed:', {
          provider: 'twelvedata',
          mappedSymbol: tdSymbol,
          interval: tdInterval,
          responseStatus,
          errorMessage: e && e.message ? e.message : String(e)
        });
      }

      // Check if we have any cached data for this key (even if expired) to avoid blank chart or fallback
      const cachedBackup = twelveDataCache.get(cacheKey);
      if (cachedBackup) {
        if (import.meta.env.DEV) {
          console.log('[Dev Debug] Twelve Data using expired cache as backup fallback:', cacheKey);
        }
        return {
          ...cachedBackup.response,
          message: 'Twelve Data Market Data (Cached)',
          isLive: true,
          warning: 'Using cached market data (Twelve Data is currently offline/limit reached).'
        };
      }

      return {
        candles: demoCandles,
        mode: 'demo_fallback',
        message: errorClassification.message,
        isLive: false,
        error: errorClassification.error
      };
    }
  }

  if (resolvedMode === 'demo') {
    return {
      candles: demoCandles,
      mode: 'demo',
      message: 'Demo Feed — connect API for live market data.',
      isLive: false
    };
  }

  if (resolvedMode === 'binance') {

    const cleanSym = toBinanceSymbol(symbol);
    
    // Check if the symbol is unsupported on Binance
    if (!cleanSym) {
      if (import.meta.env.DEV) {
        console.error("Binance fails: invalid symbol");
      }
      return {
        candles: demoCandles,
        mode: 'demo_fallback',
        message: 'Demo Feed — unsupported Binance symbol.',
        isLive: false,
        error: 'Binance data unavailable. Switched to demo feed.'
      };
    }

    // PART 1 Warning Calculations: Check if user typed USD pair and warn them it's normalized to USDT
    let warning = null;
    const originalUpper = symbol.toUpperCase().trim();
    if (originalUpper.includes('USD') && !originalUpper.includes('USDT')) {
      const targetUSDT = originalUpper.replace('USD', 'USDT');
      warning = `Binance Spot uses ${targetUSDT} for this demo feed.`;
    }

    const binanceInterval = toBinanceInterval(timeframe);
    const binanceSymbol = cleanSym;

    if (!binanceInterval) {
      if (import.meta.env.DEV) {
        console.error("Binance fails: invalid interval");
      }
      return {
        candles: demoCandles,
        mode: 'demo_fallback',
        message: 'Invalid symbol or unsupported timeframe.',
        isLive: false,
        error: 'Invalid symbol or unsupported timeframe.',
        warning
      };
    }

    try {
      const limit = getBinanceLimit(timeframe);
      const url = `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${binanceInterval}&limit=${limit}`;
      
      if (import.meta.env.DEV) {
        console.log("Binance request:", { symbol, binanceSymbol, timeframe, binanceInterval, url });
      }

      const response = await fetch(url);
      
      if (import.meta.env.DEV) {
        console.log("Binance response status:", response.status);
      }
      
      if (response.status === 429) {
        if (import.meta.env.DEV) {
          console.error("Binance fails: rate limit");
        }
        return {
          candles: demoCandles,
          mode: 'demo_fallback',
          message: 'Demo Feed — Binance unavailable.',
          isLive: false,
          error: 'Binance data unavailable. Switched to demo feed.',
          warning
        };
      }
      
      if (!response.ok) {
        if (import.meta.env.DEV) {
          console.error("Binance fails: network error");
        }
        throw new Error(`Binance fetch failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (import.meta.env.DEV) {
        console.log("Binance candle count:", data.length);
      }
      
      if (!Array.isArray(data) || data.length === 0) {
        if (import.meta.env.DEV) {
          console.error("Binance fails: empty data");
        }
        throw new Error('Empty response or invalid JSON structure');
      }

      // Convert openTime millisecond coordinates to seconds consistently
      const normalized = data.map(item => ({
        time: Math.floor(Number(item[0]) / 1000),
        open: Number(item[1]),
        high: Number(item[2]),
        low: Number(item[3]),
        close: Number(item[4]),
        volume: Number(item[5])
      }));

      if (import.meta.env.DEV) {
        console.log('[Dev Debug] Binance Feed Info:', {
          selectedSymbol: symbol,
          convertedSymbol: cleanSym,
          selectedTimeframe: timeframe,
          binanceInterval: binanceInterval,
          candleLimit: limit,
          returnedCandleCount: normalized.length,
          firstCandleDate: normalized.length > 0 ? new Date(normalized[0].time * 1000).toISOString() : null,
          lastCandleDate: normalized.length > 0 ? new Date(normalized[normalized.length - 1].time * 1000).toISOString() : null,
          feedSourceUsed: 'Binance Spot REST API'
        });
      }

      return {
        candles: normalized,
        mode: 'binance',
        message: 'Binance Spot Market Data',
        isLive: true,
        warning
      };
    } catch (e) {
      if (import.meta.env.DEV) {
        console.error("Binance fails: network error or blocked request", e);
      }
      return {
        candles: demoCandles,
        mode: 'demo_fallback',
        message: 'Demo Feed — Binance unavailable.',
        isLive: false,
        error: 'Binance data unavailable. Switched to demo feed.',
        warning
      };
    }
  }

  if (resolvedMode === 'twelvedata') {
    const key = import.meta.env.VITE_TWELVEDATA_API_KEY;
    if (!key || !key.trim()) {
      return {
        candles: demoCandles,
        mode: 'demo_fallback',
        message: 'API key not configured. Using demo educational feed.',
        isLive: false,
        error: 'API key not configured. Using demo educational feed.'
      };
    }
    
    return {
      candles: demoCandles,
      mode: 'demo_fallback',
      message: 'Live data unavailable. Switched to demo feed.',
      isLive: false,
      error: 'Live data unavailable. Switched to demo feed.'
    };
  }

  if (resolvedMode === 'alphavantage') {
    const key = import.meta.env.VITE_ALPHAVANTAGE_API_KEY;
    if (!key || !key.trim()) {
      return {
        candles: demoCandles,
        mode: 'demo_fallback',
        message: 'API key not configured. Using demo educational feed.',
        isLive: false,
        error: 'API key not configured. Using demo educational feed.'
      };
    }
    
    return {
      candles: demoCandles,
      mode: 'demo_fallback',
      message: 'Market data limit reached. Try again later or use demo feed.',
      isLive: false,
      error: 'Market data limit reached. Try again later or use demo feed.'
    };
  }

  return {
    candles: demoCandles,
    mode: 'demo',
    message: 'Demo Feed — connect API for live market data.',
    isLive: false
  };
}

/**
 * Check API Connection & Readiness status
 */
export function checkApiStatus() {
  const enableDemo = import.meta.env.VITE_ENABLE_DEMO_FEED !== 'false';
  const binancePublic = import.meta.env.VITE_BINANCE_PUBLIC_MODE === 'true';
  const twelvedataKey = import.meta.env.VITE_TWELVEDATA_API_KEY;
  const alphavantageKey = import.meta.env.VITE_ALPHAVANTAGE_API_KEY;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

  return {
    demo: enableDemo ? 'Ready' : 'Not connected',
    binance: binancePublic ? 'Ready' : 'Not connected',
    twelvedata: (twelvedataKey && twelvedataKey.trim()) ? 'Ready' : 'Not connected',
    alphavantage: (alphavantageKey && alphavantageKey.trim()) ? 'Ready' : 'Not connected',
    openai: 'Backend required',
    supabase: (supabaseUrl && supabaseAnon) ? 'Ready' : 'Not connected',
    razorpay: (razorpayKey && razorpayKey.trim()) ? 'Ready' : 'Not connected'
  };
}
