/**
 * MarketPilot AI - Price Formatter Utilities
 * Market-aware decimal precision for all asset classes.
 */

/**
 * Format a price with market-appropriate decimal places
 * @param {number} price
 * @param {string} market - 'crypto'|'forex'|'stocks'|'indices'|'commodities'|'etfs'
 * @param {string} symbol
 * @returns {string}
 */
export function formatPrice(price, market, symbol) {
  if (!price || isNaN(price) || price === 0) return '—';
  const sym = (symbol || '').toUpperCase();

  if (market === 'forex') {
    const jpyPairs = ['USDJPY', 'EURJPY', 'GBPJPY', 'AUDJPY', 'CADJPY', 'CHFJPY', 'NZDJPY'];
    return jpyPairs.some(j => sym.includes('JPY')) ? price.toFixed(3) : price.toFixed(5);
  }

  if (market === 'crypto') {
    if (sym.startsWith('BTC') || sym.startsWith('ETH') || sym.startsWith('BNB') || sym.startsWith('SOL')) return price.toFixed(2);
    if (price < 0.001) return price.toFixed(8);
    if (price < 0.1) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    return price.toFixed(2);
  }

  if (market === 'commodities') {
    if (sym.includes('XAG') || sym.includes('SILVER')) return price.toFixed(3);
    if (sym.includes('NATGAS') || sym.includes('NG')) return price.toFixed(3);
    return price.toFixed(2);
  }

  return price.toFixed(2);
}

/**
 * Format volume — returns null if volume is 0 or unavailable (caller should hide volume UI)
 * @param {number} volume
 * @returns {string|null}
 */
export function formatVolume(volume) {
  if (!volume || volume === 0 || isNaN(volume)) return null;
  if (volume >= 1_000_000_000) return `${(volume / 1_000_000_000).toFixed(2)}B`;
  if (volume >= 1_000_000) return `${(volume / 1_000_000).toFixed(2)}M`;
  if (volume >= 1_000) return `${(volume / 1_000).toFixed(2)}K`;
  return volume.toFixed(2);
}

/**
 * Format a price change percentage with sign and color flag
 * @param {number} change
 * @returns {{ text: string, isPositive: boolean }}
 */
export function formatPriceChange(change) {
  if (change === null || change === undefined || isNaN(change)) return { text: '—', isPositive: false };
  const sign = change >= 0 ? '+' : '';
  return { text: `${sign}${change.toFixed(2)}%`, isPositive: change >= 0 };
}

/**
 * Format a compact price for watchlist display
 * @param {number} price
 * @param {string} market
 * @param {string} symbol
 * @returns {string}
 */
export function formatPriceCompact(price, market, symbol) {
  if (!price || isNaN(price)) return '—';
  const full = formatPrice(price, market, symbol);
  // For very long forex prices, keep as-is; for large numbers add commas
  if (price >= 10000) {
    return Number(price.toFixed(2)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return full;
}

/**
 * Get currency symbol prefix for a market/symbol combo
 * @param {string} market
 * @param {string} symbol
 * @returns {string}
 */
export function getCurrencySymbol(market, symbol) {
  const sym = (symbol || '').toUpperCase();
  if (market === 'crypto' && sym.endsWith('USDT')) return '$';
  if (market === 'forex') {
    if (sym.endsWith('USD') || sym.startsWith('USD')) return '$';
    if (sym.endsWith('EUR') || sym.startsWith('EUR')) return '€';
    if (sym.endsWith('GBP') || sym.startsWith('GBP')) return '£';
    if (sym.endsWith('JPY') || sym.startsWith('JPY')) return '¥';
  }
  if (market === 'stocks' || market === 'indices') return '$';
  if (market === 'commodities') {
    if (sym.includes('XAU') || sym.includes('GOLD')) return '$';
    if (sym.includes('XAG') || sym.includes('SILVER')) return '$';
    if (sym.includes('OIL') || sym.includes('WTI') || sym.includes('BRENT')) return '$';
  }
  return '';
}
