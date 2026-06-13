/**
 * MarketPilot AI - Provider Resolution Engine
 * Returns provider status, label, and capabilities for each market category.
 * Used throughout the app for consistent data source identification.
 */

/**
 * @typedef {'crypto'|'forex'|'stocks'|'indices'|'commodities'|'etfs'} MarketCategory
 * @typedef {'ready'|'demo'|'api_key_required'|'provider_required'|'backend_required'|'coming_soon'} ProviderStatus
 *
 * @typedef {Object} ProviderConfig
 * @property {MarketCategory} market
 * @property {ProviderStatus} status
 * @property {string} providerName
 * @property {string} feedLabel
 * @property {string|null} requiresKey
 * @property {boolean} isLive
 * @property {boolean} isDemoAllowed
 */

/**
 * Resolve the provider configuration for a given market category.
 * @param {MarketCategory} market
 * @returns {ProviderConfig}
 */
export function resolveProvider(market) {
  const binanceAvailable = import.meta.env.VITE_BINANCE_PUBLIC_MODE === 'true';
  const tdKey = import.meta.env.VITE_TWELVEDATA_API_KEY;
  const avKey = import.meta.env.VITE_ALPHAVANTAGE_API_KEY;
  const fhKey = import.meta.env.VITE_FINNHUB_API_KEY;
  const polyKey = import.meta.env.VITE_POLYGON_API_KEY;

  switch (market) {
    case 'crypto':
      return {
        market: 'crypto',
        status: binanceAvailable ? 'ready' : 'demo',
        providerName: binanceAvailable ? 'Binance' : 'Demo Feed',
        feedLabel: binanceAvailable
          ? 'Binance Spot Market Data \u2022 Live Updating'
          : 'Demo Feed \u2014 Binance unavailable',
        requiresKey: null,
        isLive: binanceAvailable,
        isDemoAllowed: true,
      };

    case 'forex': {
      if (tdKey && tdKey.trim()) {
        return { market: 'forex', status: 'ready', providerName: 'Twelve Data', feedLabel: 'Twelve Data Forex Feed \u2022 Live', requiresKey: null, isLive: true, isDemoAllowed: false };
      }
      if (avKey && avKey.trim()) {
        return { market: 'forex', status: 'ready', providerName: 'Alpha Vantage', feedLabel: 'Alpha Vantage Forex Feed', requiresKey: null, isLive: true, isDemoAllowed: false };
      }
      if (fhKey && fhKey.trim()) {
        return { market: 'forex', status: 'ready', providerName: 'Finnhub', feedLabel: 'Finnhub Forex Feed', requiresKey: null, isLive: true, isDemoAllowed: false };
      }
      return { market: 'forex', status: 'api_key_required', providerName: 'None', feedLabel: 'Forex Pro \u2014 API Key Required', requiresKey: 'VITE_TWELVEDATA_API_KEY', isLive: false, isDemoAllowed: false };
    }

    case 'stocks': {
      const stockKey = tdKey || avKey || polyKey;
      if (stockKey && stockKey.trim()) {
        return { market: 'stocks', status: 'ready', providerName: 'Market Data Provider', feedLabel: 'Stock Market Data Feed \u2022 Live', requiresKey: null, isLive: true, isDemoAllowed: false };
      }
      return { market: 'stocks', status: 'provider_required', providerName: 'None', feedLabel: 'Stocks \u2014 Provider Key Required', requiresKey: 'VITE_TWELVEDATA_API_KEY', isLive: false, isDemoAllowed: false };
    }

    case 'indices': {
      const idxKey = tdKey || avKey;
      if (idxKey && idxKey.trim()) {
        return { market: 'indices', status: 'ready', providerName: 'Market Data Provider', feedLabel: 'Index Data Feed', requiresKey: null, isLive: true, isDemoAllowed: false };
      }
      return { market: 'indices', status: 'provider_required', providerName: 'None', feedLabel: 'Indices \u2014 Provider Key Required', requiresKey: 'VITE_TWELVEDATA_API_KEY', isLive: false, isDemoAllowed: false };
    }

    case 'commodities': {
      const comKey = tdKey || avKey;
      if (comKey && comKey.trim()) {
        return { market: 'commodities', status: 'ready', providerName: 'Market Data Provider', feedLabel: 'Commodities Data Feed', requiresKey: null, isLive: true, isDemoAllowed: false };
      }
      return { market: 'commodities', status: 'provider_required', providerName: 'None', feedLabel: 'Commodities \u2014 Provider Key Required', requiresKey: 'VITE_TWELVEDATA_API_KEY', isLive: false, isDemoAllowed: false };
    }

    case 'etfs': {
      const etfKey = tdKey || avKey || polyKey;
      if (etfKey && etfKey.trim()) {
        return { market: 'etfs', status: 'ready', providerName: 'Market Data Provider', feedLabel: 'ETF Data Feed', requiresKey: null, isLive: true, isDemoAllowed: false };
      }
      return { market: 'etfs', status: 'provider_required', providerName: 'None', feedLabel: 'ETFs \u2014 Provider Key Required', requiresKey: 'VITE_TWELVEDATA_API_KEY', isLive: false, isDemoAllowed: false };
    }

    default:
      return { market, status: 'coming_soon', providerName: 'None', feedLabel: 'Coming Soon', requiresKey: null, isLive: false, isDemoAllowed: false };
  }
}

/**
 * Human-readable status label for UI badges
 * @param {ProviderStatus} status
 * @returns {{ text: string, color: string }}
 */
export function getProviderStatusBadge(status) {
  switch (status) {
    case 'ready': return { text: 'Ready', color: 'emerald' };
    case 'demo': return { text: 'Demo', color: 'amber' };
    case 'api_key_required': return { text: 'API Key Required', color: 'orange' };
    case 'provider_required': return { text: 'Provider Required', color: 'orange' };
    case 'backend_required': return { text: 'Backend Required', color: 'purple' };
    case 'coming_soon': return { text: 'Coming Soon', color: 'slate' };
    case 'unsupported_symbol': return { text: 'Unsupported', color: 'red' };
    default: return { text: 'Unknown', color: 'slate' };
  }
}

/**
 * Returns whether a market is available with current env configuration
 * @param {MarketCategory} market
 * @returns {boolean}
 */
export function isMarketAvailable(market) {
  const config = resolveProvider(market);
  return config.isLive || config.isDemoAllowed;
}

/**
 * All supported markets with their resolution
 * @returns {ProviderConfig[]}
 */
export function getAllProviders() {
  const markets = ['crypto', 'forex', 'stocks', 'indices', 'commodities', 'etfs'];
  return markets.map(m => resolveProvider(m));
}
