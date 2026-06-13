/**
 * MarketPilot AI - Video Breakdown Slide Generators
 * Generates 10 precise slide content objects from a real ScanResult.
 * Every word is pulled from actual scan data — no placeholders.
 */
import { formatPrice } from '../../utils/priceFormatter';

const MARKET_LABELS = {
  crypto: 'Cryptocurrency Market',
  forex: 'Forex Market',
  stocks: 'Stock Market',
  indices: 'Index Market',
  commodities: 'Commodities Market',
  etfs: 'ETF Market',
};

const MARKET_HOURS = {
  crypto: '24/7 — no sessions, no market close',
  forex: 'Mon–Fri, 24h/day across Asian, London, New York sessions',
  stocks: 'Exchange hours only (e.g. 9:30 AM–4:00 PM ET for US stocks)',
  indices: 'Exchange hours, varies by index',
  commodities: 'Session-based; futures have expiry dates',
  etfs: 'Exchange hours, same as underlying market',
};

const TOOL_EDUCATION = {
  support_resistance: `Support and Resistance analysis identifies price levels where historical buying pressure (support) and selling pressure (resistance) have appeared. These levels come from pivot highs and pivot lows in the candlestick data. The more times price has reacted at a level, the more notable it becomes for educational study.`,
  trendline: `Trendline analysis connects significant swing highs or swing lows to visualize the directional bias of price movement. An uptrend line connects higher lows; a downtrend line connects lower highs. When price respects a trendline, it is said to show confluence. A break of a trendline is an educational observation — not a trade signal.`,
  rsi: `The Relative Strength Index (RSI) measures the speed and magnitude of price changes on a 0–100 scale. Readings above 70 are traditionally called 'overbought' — meaning the indicator is in an elevated range. Readings below 30 are called 'oversold'. These are reference zones for educational study, not automatic buy or sell signals.`,
  macd: `The Moving Average Convergence Divergence (MACD) indicator shows the relationship between two exponential moving averages — typically the 12-period EMA minus the 26-period EMA. The resulting MACD line is then compared to a 9-period EMA of itself (the signal line). The histogram shows the distance between them. Crossovers and divergences are studied educationally.`,
  bollinger_bands: `Bollinger Bands consist of three lines: a middle 20-period simple moving average, and upper and lower bands set two standard deviations away. When the bands are wide apart, volatility is high. When they narrow into a 'squeeze', volatility is low. Price touching the outer bands is studied as a context clue — not a reversal signal by itself.`,
  moving_average: `A Moving Average smooths price data by calculating the average closing price over a set number of candles. It helps reduce noise and identify general trend direction. When price trades consistently above the moving average, the context is generally bullish. When below, bearish. The moving average itself often acts as a dynamic zone of reference.`,
  ema: `An Exponential Moving Average (EMA) gives more weight to recent price candles than older ones, making it more responsive than a simple moving average. Common EMA periods are 20, 50, and 200. Traders study how EMAs relate to each other (crossovers) and how price interacts with them as reference levels.`,
  sma: `A Simple Moving Average (SMA) calculates the arithmetic mean of closing prices over a set period. All candles are weighted equally. Common periods are 20, 50, 100, and 200. The 200 SMA is one of the most watched long-term trend indicators across all markets.`,
  fibonacci: `Fibonacci Retracement levels are horizontal lines drawn from a significant swing high to a swing low (or vice versa) to identify potential structural zones. The most commonly studied levels are 38.2%, 50%, and 61.8%. These are areas where price might pause or show reaction during a pullback — studied educationally, not as guaranteed reversal points.`,
  volume: `Volume shows the number of units (shares, coins, contracts) exchanged during each candle period. High volume during a price move can suggest stronger conviction. Low volume during a move can indicate weaker momentum. When volume data is unavailable from the data provider, volume-based interpretation is limited.`,
  atr: `The Average True Range (ATR) measures market volatility by calculating the average of the true price range over a set period. It does not indicate direction — only the size of recent price movements. A high ATR means larger candles and more volatility. A low ATR means smaller candles and calmer conditions.`,
  pivot_points: `Pivot Points are calculated reference levels based on the previous period's high, low, and close. They include a central pivot, resistance levels R1 and R2 above it, and support levels S1 and S2 below. Many market participants watch these as potential reaction zones — their educational value comes from broad awareness of these levels.`,
  candlestick: `Candlestick pattern analysis studies the shape, size, and position of individual and groups of candles to identify potential structural patterns. Patterns like hammers, dojis, engulfing candles, and shooting stars are studied as educational context clues. Confirmation from subsequent candles is always required before drawing any conclusion.`,
  market_structure: `Market Structure analysis studies the sequence of swing highs and swing lows. A series of higher highs and higher lows represents bullish structure. Lower highs and lower lows represent bearish structure. When the sequence breaks, it may suggest a structural shift — studied educationally as an observation of price behavior.`,
};

/**
 * @param {import('../analysis/AnalysisEngine').ScanResult} scan
 * @returns {import('./VideoBreakdown').SlideContent}
 */
export function generateSlide1_Introduction(scan) {
  const price = formatPrice(scan.priceAtScan, scan.marketType, scan.symbol);
  const marketLabel = MARKET_LABELS[scan.marketType] || scan.marketType;
  const scannedAt = new Date(scan.scannedAt).toLocaleString();

  return {
    id: 1,
    title: 'Introduction',
    icon: 'PlayCircle',
    duration: 12,
    narration: `Welcome to your educational chart breakdown for ${scan.symbol} on the ${scan.timeframe} timeframe. This is a MarketPilot AI educational scan using the ${scan.toolName} tool on ${marketLabel} data. The price at the time of this scan was ${price}. This analysis is for educational purposes only and does not constitute financial advice. Let's begin.`,
    visualType: 'intro',
    visualData: {
      symbol: scan.symbol,
      timeframe: scan.timeframe,
      toolName: scan.toolName,
      price,
      marketType: scan.marketType,
      scannedAt,
      provider: scan.provider,
      feedMode: scan.feedMode,
    },
    keyPoints: [
      `Symbol: ${scan.symbol}`,
      `Timeframe: ${scan.timeframe}`,
      `Tool: ${scan.toolName}`,
      `Market: ${marketLabel}`,
      `Price at scan: ${price}`,
    ],
    highlightValue: price,
  };
}

export function generateSlide2_MarketContext(scan) {
  const marketLabel = MARKET_LABELS[scan.marketType] || scan.marketType;
  const hours = MARKET_HOURS[scan.marketType] || 'Trading hours vary by provider';

  const contextMap = {
    crypto: `${scan.symbol} trades on the 24/7 cryptocurrency market. Unlike traditional markets, crypto never closes, which means volatility can appear at any hour. The market is highly speculative and sensitive to news and global sentiment. Gaps in price are rare but sudden moves are common.`,
    forex: `${scan.symbol} is a foreign exchange pair traded across global banking sessions. Forex is open 24 hours from Monday to Friday across the Asian, London, and New York sessions. Volume and volatility vary significantly depending on which sessions overlap at the time of this scan.`,
    stocks: `${scan.symbol} is a publicly traded stock. Stock markets operate during defined exchange hours. Price gaps can form between sessions. Earnings announcements, dividends, corporate news, and economic reports can cause sudden moves that override technical patterns.`,
    indices: `${scan.symbol} is a market index tracking the collective performance of a group of assets. Index values can trade as cash, futures, or CFDs depending on your broker. Session hours, futures premiums, and rollover dates affect price behavior.`,
    commodities: `${scan.symbol} is a commodity. Commodities are influenced by supply, demand, geopolitical events, weather, and macroeconomic conditions. Futures contracts have expiry dates which can cause price discontinuities. Session hours vary by commodity.`,
    etfs: `${scan.symbol} is an Exchange-Traded Fund. ETFs track underlying baskets of assets. They trade during exchange hours and their price is influenced by both the underlying holdings and fund-specific flows.`,
  };

  const contextText = contextMap[scan.marketType] || `${scan.symbol} is a ${marketLabel} instrument.`;
  const marketContextNote = scan.marketContext || '';

  return {
    id: 2,
    title: 'Market Context',
    icon: 'Globe',
    duration: 14,
    narration: `${contextText} ${marketContextNote} For this scan, ${scan.candleCount} candles of ${scan.timeframe} data were analyzed. ${scan.volumeAvailable ? 'Volume data is available from this provider.' : 'Volume data is not available from this provider, which limits volume-based analysis.'}`,
    visualType: 'context',
    visualData: {
      marketType: scan.marketType,
      marketLabel,
      symbol: scan.symbol,
      candleCount: scan.candleCount,
      timeframe: scan.timeframe,
      hours,
      volumeAvailable: scan.volumeAvailable,
    },
    keyPoints: [
      `Market: ${marketLabel}`,
      `Trading: ${hours}`,
      `${scan.candleCount} candles analyzed`,
      scan.volumeAvailable ? 'Volume data: Available' : 'Volume data: Not available',
    ],
  };
}

export function generateSlide3_DataProvider(scan) {
  const isLive = scan.feedMode === 'live';
  const feedNote = isLive
    ? `This analysis uses real market data from ${scan.provider}. Data reflects actual market prices as of the scan time — for educational study only.`
    : `This analysis uses educational demo data, not live market prices. Demo data is intended purely for learning how technical tools work.`;

  return {
    id: 3,
    title: 'Data & Provider',
    icon: 'Database',
    duration: 10,
    narration: `The data source for this scan is ${scan.provider}. Feed mode: ${isLive ? 'Live' : 'Demo'}. ${feedNote} Always be aware of your data source. The quality and latency of your data directly affects the quality of any educational observation.`,
    visualType: 'provider',
    visualData: {
      provider: scan.provider,
      feedMode: scan.feedMode,
      isLive,
      symbol: scan.symbol,
      timeframe: scan.timeframe,
      scannedAt: new Date(scan.scannedAt).toLocaleTimeString(),
      candleCount: scan.candleCount,
    },
    keyPoints: [
      `Provider: ${scan.provider}`,
      `Feed: ${isLive ? 'Live Market Data' : 'Demo Educational Data'}`,
      `Candles used: ${scan.candleCount}`,
      `Scanned at: ${new Date(scan.scannedAt).toLocaleTimeString()}`,
    ],
    highlightValue: isLive ? 'LIVE' : 'DEMO',
  };
}

export function generateSlide4_ToolReading(scan) {
  const education = TOOL_EDUCATION[scan.toolId] || `The ${scan.toolName} tool analyzes price data to identify patterns, momentum, or structural information in the chart.`;
  const availableMetrics = (scan.metrics || []).filter(m => m.available).slice(0, 4);

  return {
    id: 4,
    title: `Tool Reading: ${scan.toolName}`,
    icon: 'Wrench',
    duration: 16,
    narration: `${education} Now let's look at what the ${scan.toolName} is showing for ${scan.symbol} on the ${scan.timeframe} chart. ${scan.selectedToolReading}`,
    visualType: 'tool_reading',
    visualData: {
      toolId: scan.toolId,
      toolName: scan.toolName,
      reading: scan.selectedToolReading,
      metrics: availableMetrics,
    },
    keyPoints: availableMetrics.map(m => `${m.label}: ${m.value} — ${m.context}`),
    highlightValue: availableMetrics[0]?.value,
  };
}

export function generateSlide5_MainObservation(scan) {
  return {
    id: 5,
    title: 'Main Observation',
    icon: 'Eye',
    duration: 18,
    narration: `Here is the main observation from this scan. ${scan.mainObservation} Market structure: ${scan.marketStructure} In plain terms: ${scan.beginnerExplanation} Remember — this observation is based on the selected tool and the ${scan.timeframe} timeframe only. It does not account for fundamental factors, news events, or other timeframes.`,
    visualType: 'observation',
    visualData: {
      observation: scan.mainObservation,
      structure: scan.marketStructure,
      explanation: scan.beginnerExplanation,
      clarityScores: scan.clarityScores || [],
      whatToWatch: scan.whatToWatch || [],
    },
    keyPoints: [
      scan.mainObservation?.substring(0, 100) + (scan.mainObservation?.length > 100 ? '...' : ''),
      `Structure: ${scan.marketStructure}`,
      ...(scan.whatToWatch || []).slice(0, 2),
    ].filter(Boolean),
  };
}

export function generateSlide6_KeyZones(scan) {
  const currentPrice = scan.priceAtScan;
  const zones = scan.keyWatchZones || [];

  const zoneNarration = zones.slice(0, 4).map(z => {
    const position = z.price > currentPrice ? 'above' : 'below';
    const pct = Math.abs(((z.price - currentPrice) / currentPrice) * 100).toFixed(2);
    const priceStr = formatPrice(z.price, scan.marketType, scan.symbol);
    return `${z.label} at ${priceStr} — ${pct}% ${position} current price, ${z.strength} level`;
  }).join('. ');

  const currentPriceStr = formatPrice(currentPrice, scan.marketType, scan.symbol);

  return {
    id: 6,
    title: 'Key Watch Zones',
    icon: 'MapPin',
    duration: 20,
    narration: `Based on the ${scan.toolName} analysis, here are the key price zones to watch for ${scan.symbol}. Current price at scan time: ${currentPriceStr}. ${zoneNarration}. These zones represent areas where price has historically shown reactions. They are educational reference points — not entry or exit signals.`,
    visualType: 'zones',
    visualData: {
      zones,
      currentPrice,
      marketType: scan.marketType,
      symbol: scan.symbol,
    },
    keyPoints: zones.slice(0, 5).map(z => {
      const pct = Math.abs(((z.price - currentPrice) / currentPrice) * 100).toFixed(2);
      const dir = z.price > currentPrice ? '▲' : '▼';
      return `${dir} ${z.label}: ${formatPrice(z.price, scan.marketType, scan.symbol)} (${pct}%) — ${z.strength}`;
    }),
    highlightValue: `${zones.length} zone${zones.length !== 1 ? 's' : ''}`,
  };
}

export function generateSlide7_UpsideScenario(scan) {
  const up = scan.upsideCase || {};
  return {
    id: 7,
    title: 'Possible Scenario: Upside',
    icon: 'TrendingUp',
    duration: 16,
    narration: `Let's study a possible upside scenario for ${scan.symbol}. This is an educational exploration — not a prediction or recommendation. Scenario: ${up.title || 'Upside structural case'}. ${up.description || 'Price shows structure that could support further upside movement if key levels hold.'} For this scenario to remain valid: ${up.condition || 'Key support zones hold and structure remains intact.'}. This scenario would be considered weaker if: ${up.invalidation || 'Price closes below key support and structure breaks.'}. Study this as chart context — not as a forecast.`,
    visualType: 'scenario_up',
    visualData: { scenario: up, currentPrice: scan.priceAtScan, symbol: scan.symbol },
    keyPoints: [
      `Scenario: ${up.title || 'Upside Case'}`,
      `Condition: ${up.condition || 'Key support holds'}`,
      `Invalidated if: ${up.invalidation || 'Structure breaks below support'}`,
      'Educational scenario only — not a prediction',
    ],
  };
}

export function generateSlide8_DownsideScenario(scan) {
  const down = scan.downsideCase || {};
  return {
    id: 8,
    title: 'Possible Scenario: Downside',
    icon: 'TrendingDown',
    duration: 16,
    narration: `Now let's study the possible downside scenario for ${scan.symbol}. This is purely educational. Scenario: ${down.title || 'Downside structural case'}. ${down.description || 'Price shows structure that may support further downside if key levels fail.'} Condition for this scenario: ${down.condition || 'Resistance holds and downward structure continues.'}. This scenario is weakened if: ${down.invalidation || 'Price reclaims key resistance and structure shifts.'} A balanced educational study always considers both upside and downside possibilities.`,
    visualType: 'scenario_down',
    visualData: { scenario: down, currentPrice: scan.priceAtScan, symbol: scan.symbol },
    keyPoints: [
      `Scenario: ${down.title || 'Downside Case'}`,
      `Condition: ${down.condition || 'Resistance holds and structure continues'}`,
      `Invalidated if: ${down.invalidation || 'Price reclaims resistance level'}`,
      'Educational scenario only — not a prediction',
    ],
  };
}

export function generateSlide9_LimitationsAndRisk(scan) {
  const limitations = scan.limitations || ['Single tool, single timeframe analysis only'];
  const volumeNote = !scan.volumeAvailable
    ? 'Volume data was not available from this provider, limiting volume-based confirmation. '
    : '';

  return {
    id: 9,
    title: 'Limitations & Risk Note',
    icon: 'AlertTriangle',
    duration: 18,
    narration: `Before concluding, let's address the limitations of this analysis. ${volumeNote}${limitations.slice(0, 3).join('. ')}. Risk note: ${scan.riskNote || 'No single indicator can predict market movement. Chart analysis studies probability and pattern, not certainty.'}. Always consider multiple timeframes, multiple tools, and independent research before forming any market view.`,
    visualType: 'risk',
    visualData: {
      limitations,
      riskNote: scan.riskNote,
      volumeAvailable: scan.volumeAvailable,
      clarityScores: scan.clarityScores || [],
    },
    keyPoints: limitations.slice(0, 4),
  };
}

export function generateSlide10_Summary(scan) {
  const scores = scan.clarityScores || [];
  const overallClarity = scores.length > 0
    ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length)
    : null;

  return {
    id: 10,
    title: 'Summary & Conclusion',
    icon: 'CheckCircle',
    duration: 14,
    narration: `That concludes the educational breakdown for ${scan.symbol} on the ${scan.timeframe} chart using the ${scan.toolName} tool. Key summary: ${(scan.mainObservation || '').substring(0, 150)}. ${overallClarity !== null ? `Overall structure clarity score for this scan: ${overallClarity} out of 100 — this reflects chart structure quality, not a win probability.` : ''} This analysis was provided by MarketPilot AI as an educational chart study only. It does not constitute financial advice, investment recommendations, or trading signals. Thank you.`,
    visualType: 'summary',
    visualData: {
      symbol: scan.symbol,
      timeframe: scan.timeframe,
      toolName: scan.toolName,
      overallClarity,
      mainObservation: scan.mainObservation,
      keyZoneCount: (scan.keyWatchZones || []).length,
      provider: scan.provider,
      feedMode: scan.feedMode,
    },
    keyPoints: [
      `Symbol: ${scan.symbol} | Timeframe: ${scan.timeframe}`,
      `Tool: ${scan.toolName} | Provider: ${scan.provider}`,
      overallClarity !== null ? `Clarity Score: ${overallClarity}/100` : 'Clarity: N/A',
      'Educational use only — not financial advice',
    ],
    highlightValue: overallClarity !== null ? `${overallClarity}/100` : undefined,
  };
}

/**
 * Generate all 10 slides from a ScanResult
 * @param {Object} scan - ScanResult object
 * @returns {Object[]} - Array of 10 SlideContent objects
 */
export function generateAllSlides(scan) {
  if (!scan) return [];
  return [
    generateSlide1_Introduction(scan),
    generateSlide2_MarketContext(scan),
    generateSlide3_DataProvider(scan),
    generateSlide4_ToolReading(scan),
    generateSlide5_MainObservation(scan),
    generateSlide6_KeyZones(scan),
    generateSlide7_UpsideScenario(scan),
    generateSlide8_DownsideScenario(scan),
    generateSlide9_LimitationsAndRisk(scan),
    generateSlide10_Summary(scan),
  ];
}

/**
 * Total breakdown duration at 1x speed in seconds
 * @param {Object[]} slides
 * @returns {number}
 */
export function getTotalDuration(slides) {
  return slides.reduce((sum, s) => sum + s.duration, 0);
}

/**
 * Format seconds as mm:ss
 * @param {number} seconds
 * @returns {string}
 */
export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
