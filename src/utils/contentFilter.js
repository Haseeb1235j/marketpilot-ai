/**
 * MarketPilot AI - Content Safety Filter
 * Blocks forbidden financial advice phrases from scan analysis output.
 * All scan text must pass through filterScanText() before display.
 */

// Forbidden phrases that must NEVER appear in educational scan output
const FORBIDDEN_PHRASES = [
  // Buy/sell signals
  'buy now', 'sell now', 'buy signal', 'sell signal', 'buy here', 'sell here',
  'time to buy', 'time to sell', 'perfect buy', 'perfect sell',
  'entry signal', 'exit signal', 'entry point', 'exit point',
  'must buy', 'must sell', 'must enter', 'must exit',
  'go long', 'go short',

  // Profit guarantees
  'guaranteed profit', 'guaranteed return', 'guaranteed gain',
  '100% accurate', '100% sure', '100% certain',
  'sure trade', 'sure profit', 'sure win',
  'profit guaranteed', 'returns guaranteed',
  'risk-free', 'risk free',

  // Recommendations
  'financial advice', 'investment advice', 'trading advice',
  'trading call', 'trading recommendation',
  'profit chance', 'win probability', 'win rate',
  'recommended trade', 'trade recommendation',
  'i recommend', 'we recommend', 'you should buy', 'you should sell',

  // Price predictions as certainties
  'will go up', 'will go down', 'will reach', 'will hit',
  'is going to', 'definitely going',
  'target price', 'price target',
];

// Safe replacement phrases for common forbidden patterns
const REPLACEMENTS = {
  'buy now': 'watch this zone educationally',
  'sell now': 'watch this zone educationally',
  'buy signal': 'possible chart pattern',
  'sell signal': 'possible chart pattern',
  'entry signal': 'watch zone',
  'exit signal': 'observation zone',
  'entry point': 'watch area',
  'exit point': 'watch area',
  'go long': 'upside scenario',
  'go short': 'downside scenario',
  'target price': 'watch level',
  'price target': 'watch level',
  'will go up': 'may show upside structure',
  'will go down': 'may show downside structure',
  'will reach': 'has potential watch zone at',
  'will hit': 'has a watch level at',
};

/**
 * Scan text for forbidden phrases
 * @param {string} text
 * @returns {{ isSafe: boolean, violations: string[] }}
 */
export function checkContentSafety(text) {
  if (!text || typeof text !== 'string') return { isSafe: true, violations: [] };
  const lower = text.toLowerCase();
  const violations = FORBIDDEN_PHRASES.filter(phrase => lower.includes(phrase));
  return { isSafe: violations.length === 0, violations };
}

/**
 * Filter and sanitize scan text, replacing forbidden phrases with safe alternatives
 * @param {string} text
 * @returns {string}
 */
export function filterScanText(text) {
  if (!text || typeof text !== 'string') return text;
  let filtered = text;

  // Apply known replacements first
  for (const [forbidden, safe] of Object.entries(REPLACEMENTS)) {
    const regex = new RegExp(forbidden, 'gi');
    filtered = filtered.replace(regex, safe);
  }

  // Check for any remaining violations and log in dev
  const { violations } = checkContentSafety(filtered);
  if (violations.length > 0 && import.meta.env.DEV) {
    console.warn('[ContentFilter] Remaining violations after replacement:', violations);
  }

  return filtered;
}

/**
 * Filter an entire ScanResult object's text fields
 * @param {Object} scanResult
 * @returns {Object}
 */
export function filterScanResult(scanResult) {
  if (!scanResult) return scanResult;

  const textFields = [
    'mainObservation', 'marketStructure', 'selectedToolReading',
    'beginnerExplanation', 'riskNote', 'marketContext',
  ];

  const filtered = { ...scanResult };

  // Filter top-level text fields
  textFields.forEach(field => {
    if (filtered[field] && typeof filtered[field] === 'string') {
      filtered[field] = filterScanText(filtered[field]);
    }
  });

  // Filter scenario texts
  ['upsideCase', 'downsideCase', 'sidewaysCase'].forEach(key => {
    if (filtered[key]) {
      filtered[key] = {
        ...filtered[key],
        title: filterScanText(filtered[key].title || ''),
        description: filterScanText(filtered[key].description || ''),
        condition: filterScanText(filtered[key].condition || ''),
        invalidation: filterScanText(filtered[key].invalidation || ''),
      };
    }
  });

  // Filter whatToWatch array
  if (Array.isArray(filtered.whatToWatch)) {
    filtered.whatToWatch = filtered.whatToWatch.map(w => filterScanText(w));
  }

  // Filter limitations array
  if (Array.isArray(filtered.limitations)) {
    filtered.limitations = filtered.limitations.map(l => filterScanText(l));
  }

  return filtered;
}

export { FORBIDDEN_PHRASES };
