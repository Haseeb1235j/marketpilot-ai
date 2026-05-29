/**
 * MarketPilot AI - Advanced Educational Analysis Engine
 * Provides detailed, tool-specific technical calculations and safety-compliant interpretations.
 */
import {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
  detectSupportResistance,
  detectTrendline,
  detectCandlestickPatterns
} from '../utils/technicalMath';

/**
 * Main Chart Analysis Entry Point
 */
export function analyzeChart({
  candles,
  selectedTool = 'rsi',
  selectedTimeframe = '1h',
  selectedSymbol = 'BTC/USDT',
  marketType = 'crypto',
  chartSource = 'live'
}) {
  if (!candles || candles.length === 0) {
    return null;
  }

  const lastCandle = candles[candles.length - 1];
  const currentPrice = lastCandle.close;
  const prevPrice = candles[candles.length - 2]?.close || currentPrice;
  const isUpCandle = currentPrice >= lastCandle.open;
  
  // Calculate basic Support/Resistance zones for background context
  const srResult = detectSupportResistance(candles, 6);
  const nearestSupport = srResult.support[0] || (currentPrice * 0.95);
  const nearestResistance = srResult.resistance[0] || (currentPrice * 1.05);

  // Extract swing points over the last 40 candles for pattern and structural analysis
  const swingLows = [];
  const swingHighs = [];
  const lookbackPeriod = Math.min(candles.length, 40);
  for (let i = candles.length - lookbackPeriod; i < candles.length - 2; i++) {
    if (i < 2) continue;
    if (
      candles[i].low < candles[i - 1].low &&
      candles[i].low < candles[i - 2].low &&
      candles[i].low < candles[i + 1].low &&
      candles[i].low < candles[i + 2].low
    ) {
      swingLows.push({ index: i, price: candles[i].low, time: candles[i].time });
    }
    if (
      candles[i].high > candles[i - 1].high &&
      candles[i].high > candles[i - 2].high &&
      candles[i].high > candles[i + 1].high &&
      candles[i].high > candles[i + 2].high
    ) {
      swingHighs.push({ index: i, price: candles[i].high, time: candles[i].time });
    }
  }
  const recentHighs = swingHighs.map(s => s.price).reverse().slice(0, 3);
  const recentLows = swingLows.map(s => s.price).reverse().slice(0, 3);

  // Range Boundaries
  let highestHigh = currentPrice * 1.05;
  let lowestLow = currentPrice * 0.95;
  if (candles.length > 0) {
    const rangeCandles = candles.slice(-Math.min(candles.length, 50));
    highestHigh = Math.max(...rangeCandles.map(c => c.high));
    lowestLow = Math.min(...rangeCandles.map(c => c.low));
  }

  // Common MA 50 trend filter
  const sma50 = calculateSMA(candles, Math.min(candles.length, 50));
  const latestSma50 = sma50[sma50.length - 1];
  let structuralTrend = "neutral";
  if (latestSma50) {
    structuralTrend = currentPrice > latestSma50 ? "bullish structure" : "bearish structure";
  }

  // Initialize result fields
  let mainObservation = "";
  let marketStructure = "";
  let selectedToolReading = "";
  let keyWatchZones = "";
  let whatToWatch = "";
  let upsideCase = null;
  let downsideCase = null;
  let sidewaysCase = null;
  let riskNote = "";
  let beginnerExplanation = "";
  let overlays = [];
  let videoSteps = [];

  // Group selectors
  const isRiskTool = ['risk_reward', 'position_size', 'stop_distance', 'capital_risk'].includes(selectedTool);
  const isSentimentTool = ['news_sentiment', 'fear_greed', 'eco_calendar', 'earnings_calendar', 'fii_dii', 'open_interest'].includes(selectedTool);
  const isAdvancedSMCTool = ['order_blocks', 'order_blocks_smc', 'fair_value_gaps', 'liquidity_zones', 'bos_choch', 'choch_smc', 'smc_concepts', 'market_profile'].includes(selectedTool);

  // Helper to read localStorage inputs safely
  const getLocalStorageNumber = (key, fallback = null) => {
    if (typeof window === 'undefined' || !window.localStorage) return fallback;
    const value = window.localStorage.getItem(key);
    return value ? Number(value) : fallback;
  };

  marketStructure = `Based on the 50-period moving average filter, the market exhibits a ${structuralTrend} on the ${selectedTimeframe} timeframe. Price action shows a reaction near ${currentPrice.toFixed(2)}, with the nearest major support floor at ${nearestSupport.toFixed(2)} and the nearest resistance ceiling at ${nearestResistance.toFixed(2)}.`;

  // 1. SUPPORT & RESISTANCE (horizontal_sr)
  if (selectedTool === 'horizontal_sr') {
    const supportDistPct = ((currentPrice - nearestSupport) / currentPrice) * 100;
    const resistanceDistPct = ((nearestResistance - currentPrice) / currentPrice) * 100;
    const closerTo = supportDistPct < resistanceDistPct ? 'support zone' : 'resistance zone';
    
    // Average candle height for range context
    const avgCandleRange = candles.slice(-20).reduce((sum, c) => sum + (c.high - c.low), 0) / 20;
    const currentRangeWidth = highestHigh - lowestLow;
    const rangeRatio = currentRangeWidth / (avgCandleRange || 1);
    const rangeContext = rangeRatio > 15 ? 'widened swing range' : rangeRatio < 8 ? 'contracted consolidation range' : 'normal trading channel';

    selectedToolReading = `Horizontal S/R analysis indicates that price is trading closer to the ${closerTo}. Nearest support is $${nearestSupport.toFixed(2)} (${supportDistPct.toFixed(2)}% below current price) and nearest resistance is $${nearestResistance.toFixed(2)} (${resistanceDistPct.toFixed(2)}% above). The price action is bounded within a ${rangeContext} set between a high of $${highestHigh.toFixed(2)} and a low of $${lowestLow.toFixed(2)}. Recent swing highs: [${recentHighs.map(h => h.toFixed(2)).join(', ')}], swing lows: [${recentLows.map(l => l.toFixed(2)).join(', ')}].`;
    
    mainObservation = `Price is currently positioned at ${currentPrice.toFixed(2)}, which is ${supportDistPct.toFixed(2)}% above horizontal support. The structural range width is ${currentRangeWidth.toFixed(2)} points.`;
    
    keyWatchZones = `Support Floor: ${nearestSupport.toFixed(2)} | Resistance Ceiling: ${nearestResistance.toFixed(2)} | Range Midpoint: ${((nearestSupport + nearestResistance) / 2).toFixed(2)}`;
    
    whatToWatch = "Watch for potential stabilization or buying absorption near the support floor, or supply rejection near the resistance ceiling. A clean daily close outside these horizontal boundaries shifts the bias from rangebound to a breakout watch.";
    
    upsideCase = {
      clarity: "Medium",
      risk: "Medium",
      confirmation: "Yes",
      explanation: `For an upward breakout scenario, the price must exhibit buying absorption at resistance, followed by a daily candle close above $${nearestResistance.toFixed(2)} on expanding volume.`
    };
    
    downsideCase = {
      clarity: "Medium",
      risk: "Medium",
      confirmation: "Yes",
      explanation: `A downside corrective scenario is possible if price slips and closes below the horizontal support at $${nearestSupport.toFixed(2)}, suggesting a test of the lower swing low at $${(recentLows[1] || nearestSupport * 0.95).toFixed(2)}.`
    };
    
    sidewaysCase = {
      clarity: "High",
      risk: "Low",
      confirmation: "No",
      explanation: "If volume remains subdued, price is expected to oscillate within the range boundaries between support and resistance, consolidating without direction."
    };

    riskNote = "Horizontal zones represent historic price areas where buyers and sellers reached equilibrium. However, they are dynamic and can fail abruptly if macro news or market-wide volatility spikes.";
    
    beginnerExplanation = "Support acts like a trampoline that pushes falling prices back up because buyers step in. Resistance is like a ceiling that stops rising prices because sellers want to take profits. The space between is the trading range.";

    overlays = [
      { type: 'horizontal_line', price: nearestSupport, color: '#10b981', label: 'Support Zone' },
      { type: 'horizontal_line', price: nearestResistance, color: '#ef4444', label: 'Resistance Zone' }
    ];

    videoSteps = [
      {
        title: "Identify Range Boundaries",
        narration: `We start by mapping the horizontal range boundaries for ${selectedSymbol}. Price is currently trading at ${currentPrice.toFixed(2)}.`,
        target: { type: 'price', value: currentPrice }
      },
      {
        title: "Assess Proximity to Support",
        narration: `The nearest major demand floor is located below at ${nearestSupport.toFixed(2)}. Watch for buying pressure here.`,
        target: { type: 'price', value: nearestSupport }
      },
      {
        title: "Assess Proximity to Resistance",
        narration: `The nearest supply ceiling is situated above at ${nearestResistance.toFixed(2)}. Sellers historically defend this area.`,
        target: { type: 'price', value: nearestResistance }
      },
      {
        title: "Formulate Scenarios",
        narration: "A breakout above resistance opens upside potential, while a breakdown below support suggests downside extension. Otherwise, expect sideways consolidation.",
        target: { type: 'chart' }
      }
    ];

  // 2. TRENDLINES (trendline)
  } else if (selectedTool === 'trendline') {
    const trendlines = detectTrendline(candles, 8);
    const hasSupport = !!trendlines.supportLine;
    const hasResistance = !!trendlines.resistanceLine;
    
    let structureType = "flat trendline structure";
    let trendDirection = "neutral/sideways";
    
    if (hasSupport && trendlines.supportLine.slope > 0.0001) {
      structureType = "ascending trendline structure";
      trendDirection = "upward sloping";
    } else if (hasResistance && trendlines.resistanceLine.slope < -0.0001) {
      structureType = "descending trendline structure";
      trendDirection = "downward sloping";
    }

    // Check convergence (wedge/triangle shape)
    let convergence = "parallel channel layout";
    if (hasSupport && hasResistance) {
      const isConverging = trendlines.supportLine.slope > 0.0001 && trendlines.resistanceLine.slope < -0.0001;
      const isDiverging = trendlines.supportLine.slope < -0.0001 && trendlines.resistanceLine.slope > 0.0001;
      if (isConverging) {
        convergence = "converging wedge/triangle layout (volatility contraction)";
      } else if (isDiverging) {
        convergence = "diverging broadcast layout (expanding price volatility)";
      }
    }

    selectedToolReading = `Trendline detection shows a ${structureType} indicating a ${trendDirection} market vector. The lines exhibit a ${convergence}. ${
      hasSupport ? `Ascending support vector connects swing lows with slope ${trendlines.supportLine.slope.toFixed(4)}. ` : "No sloped support trendline detected. "
    }${
      hasResistance ? `Descending resistance vector connects swing highs with slope ${trendlines.resistanceLine.slope.toFixed(4)}.` : "No sloped resistance trendline detected."
    }`;
    
    mainObservation = `Price is currently testing structural lines at ${currentPrice.toFixed(2)}. We check if candles hold above the support line or are rejected by the resistance line.`;
    
    keyWatchZones = `Support Line Projected Level | Resistance Line Projected Level | Recent Pivot Low: ${recentLows[0] || currentPrice.toFixed(2)}`;
    
    whatToWatch = "Watch for price respecting the trendline boundary on a retest (wick rejections), which confirms trend strength. A close below a support trendline or above a resistance trendline indicates structural weakening and possible breakout.";

    upsideCase = {
      clarity: "Medium",
      risk: "High",
      confirmation: "Yes",
      explanation: `For an upward scenario, price must break and close above the sloped resistance trendline, accompanied by volume expansion to confirm trend validation.`
    };
    
    downsideCase = {
      clarity: "Medium",
      risk: "Medium",
      confirmation: "Yes",
      explanation: `A downside move is possible if price breaks below the sloped support trendline, indicating that buyers are no longer defending the ascending slope.`
    };
    
    sidewaysCase = {
      clarity: "High",
      risk: "Low",
      confirmation: "No",
      explanation: "If price remains locked inside the sloped support and resistance channels, trendlines remain respected as range bounds."
    };

    riskNote = "Trendlines are subjective and depend on drawing preferences (wicks vs. bodies). A single candle piercing a trendline does not always mean a reversal; look for follow-through candle closes.";
    
    beginnerExplanation = "Trendlines connect the tops or bottoms of price to show the slope of the trend. An ascending line acts as a moving diagonal floor. If price breaks through this floor, the uptrend is weakening.";

    overlays = [];
    if (hasSupport) {
      overlays.push({ type: 'line', p1: trendlines.supportLine.p1, p2: trendlines.supportLine.p2, color: '#10b981', label: 'Support Trendline' });
    }
    if (hasResistance) {
      overlays.push({ type: 'line', p1: trendlines.resistanceLine.p1, p2: trendlines.resistanceLine.p2, color: '#ef4444', label: 'Resistance Trendline' });
    }
    if (!hasSupport && !hasResistance) {
      overlays.push(
        { type: 'horizontal_line', price: nearestSupport, color: '#10b981', label: 'Support Floor' },
        { type: 'horizontal_line', price: nearestResistance, color: '#ef4444', label: 'Resistance Ceiling' }
      );
    }

    videoSteps = [
      {
        title: "Trendline Mapping",
        narration: `We analyze the slope of the trend for ${selectedSymbol}. Price is at ${currentPrice.toFixed(2)}.`,
        target: { type: 'price', value: currentPrice }
      },
      {
        title: "Assess Channel Structure",
        narration: `The trendline detection indicates a ${structureType} with a ${trendDirection} bias.`,
        target: { type: 'chart' }
      },
      {
        title: "Monitor Retests & Breakers",
        narration: "We watch if price holds above the support trendline or is capped by resistance, which indicates momentum direction.",
        target: { type: 'chart' }
      }
    ];

  // 3. RSI (rsi)
  } else if (selectedTool === 'rsi') {
    const rsiValues = calculateRSI(candles, 14);
    const latestRsi = rsiValues[rsiValues.length - 1] || 50;
    
    let momentumState = "neutral momentum";
    let detail = "";
    
    if (latestRsi > 70) {
      momentumState = "overbought zone";
      detail = "This suggests that buying pressure has been exceptionally intense and the price is extended, signaling potential exhaustion.";
    } else if (latestRsi < 30) {
      momentumState = "oversold zone";
      detail = "This suggests that selling pressure has been highly aggressive and the price is pushed low, pointing to seller exhaustion.";
    } else if (latestRsi >= 55 && latestRsi <= 70) {
      momentumState = "strong momentum";
      detail = "The RSI lies constructively above the 50 midline, demonstrating that buyers are currently in control of momentum.";
    } else if (latestRsi >= 30 && latestRsi <= 45) {
      momentumState = "weak momentum";
      detail = "The RSI lies below the 50 midline, confirming that sellers maintain short-term momentum control.";
    } else {
      momentumState = "neutral momentum";
      detail = "RSI is hovering near the 50 baseline, indicating a balance between buying and selling forces.";
    }

    // RSI Slope trend over last 3 candles
    const rsi3Ago = rsiValues[rsiValues.length - 3] || latestRsi;
    const rsiSlope = latestRsi - rsi3Ago;
    const slopeText = rsiSlope > 3 ? "accelerating upwards" : rsiSlope < -3 ? "decelerating momentum" : "flat/neutral speed";

    // Boundary cross checks in the last 5 candles
    let crossOversold = false;
    let crossOverbought = false;
    const recentRsi = rsiValues.slice(-5);
    for (let j = 1; j < recentRsi.length; j++) {
      if (recentRsi[j-1] < 30 && recentRsi[j] >= 30) crossOversold = true;
      if (recentRsi[j-1] > 70 && recentRsi[j] <= 70) crossOverbought = true;
    }
    const crossText = crossOversold ? "RSI recently crossed out of the oversold boundary, suggesting support." :
                      crossOverbought ? "RSI recently crossed back down below the overbought boundary, suggesting exhaustion." :
                      "RSI remains inside normal parameters without recent boundary breaches.";

    // Divergence detection
    let divergenceText = "No active RSI divergence detected on the current lookback.";
    if (swingLows.length >= 2) {
      const lastL = swingLows[swingLows.length - 1];
      const prevL = swingLows[swingLows.length - 2];
      const lastR = rsiValues[lastL.index];
      const prevR = rsiValues[prevL.index];
      if (lastL.price < prevL.price && lastR > prevR && lastR !== null && prevR !== null) {
        divergenceText = `Bullish Divergence detected: Price made a lower low (${lastL.price.toFixed(2)} vs ${prevL.price.toFixed(2)}), but RSI formed a higher low (${lastR.toFixed(1)} vs ${prevR.toFixed(1)}). This indicates downward momentum is weakening despite lower prices.`;
      }
    }
    if (swingHighs.length >= 2 && divergenceText.startsWith("No")) {
      const lastH = swingHighs[swingHighs.length - 1];
      const prevH = swingHighs[swingHighs.length - 2];
      const lastR = rsiValues[lastH.index];
      const prevR = rsiValues[prevH.index];
      if (lastH.price > prevH.price && lastR < prevR && lastR !== null && prevR !== null) {
        divergenceText = `Bearish Divergence detected: Price made a higher high (${lastH.price.toFixed(2)} vs ${prevH.price.toFixed(2)}), but RSI formed a lower high (${lastR.toFixed(1)} vs ${prevR.toFixed(1)}). This indicates upward buying momentum is slowing down.`;
      }
    }

    selectedToolReading = `RSI(14) is calculated at ${latestRsi.toFixed(2)}, placing momentum in the ${momentumState}. Over the last 3 candles, RSI is ${slopeText} (slope ${rsiSlope.toFixed(1)}). ${crossText} Divergence Check: ${divergenceText}`;
    
    mainObservation = `The RSI momentum reading is in a ${latestRsi > 50 ? 'bullish-leaning' : 'bearish-leaning'} zone. We are monitoring the market structure relative to the 50-level for momentum shifts.`;
    
    keyWatchZones = `Oversold Limit: 30.00 | Midline threshold: 50.00 | Overbought Limit: 70.00`;
    
    whatToWatch = "Watch for RSI crossing the 50 midline to confirm trend acceleration or deceleration. An RSI bounce off 30 or rejection off 70 provides structural study points for trend continuation or reversals.";

    upsideCase = {
      clarity: "Medium",
      risk: "Medium",
      confirmation: "Yes",
      explanation: `For an upward continuation scenario, the RSI should stay supported above the 50 median line, with price breaking above the near resistance at ${nearestResistance.toFixed(2)} on expanding volume.`
    };
    
    downsideCase = {
      clarity: "Medium",
      risk: "Low",
      confirmation: "Yes",
      explanation: `A downside corrective scenario becomes possible if the RSI rejects the 50 line or slips below 40, leading to a test of the support floor at ${nearestSupport.toFixed(2)}.`
    };
    
    sidewaysCase = {
      clarity: "High",
      risk: "Low",
      confirmation: "No",
      explanation: "If RSI continues to fluctuate between 45 and 55, it suggests price is rangebound, consolidating between support and resistance in a low-momentum squeeze."
    };

    riskNote = "RSI can remain in overbought or oversold conditions for extended periods during strong trends. Relying solely on RSI thresholds without checking underlying price structure or support/resistance can lead to premature conclusions.";
    
    beginnerExplanation = "The Relative Strength Index (RSI) is like a speed gun for price. It tells you if the market is running too fast (above 70, potentially tired) or falling too quickly (below 30, potentially exhausted). A reading of 50 is the speed limit; above is bullish momentum, below is bearish.";

    overlays = [
      { type: 'horizontal_line', price: nearestSupport, color: '#10b981', label: 'Support Floor' },
      { type: 'horizontal_line', price: nearestResistance, color: '#ef4444', label: 'Resistance Ceiling' }
    ];

    videoSteps = [
      {
        title: "Check Momentum Reading",
        narration: `We calculate RSI(14) for ${selectedSymbol}. The value is ${latestRsi.toFixed(2)}, which lies in the ${momentumState}.`,
        target: { type: 'indicator', value: 'rsi' }
      },
      {
        title: "Inspect Divergence",
        narration: divergenceText,
        target: { type: 'chart' }
      },
      {
        title: "Key Level Context",
        narration: `RSI behaves within boundaries. Support is at ${nearestSupport.toFixed(2)} and resistance is at ${nearestResistance.toFixed(2)}.`,
        target: { type: 'price', value: nearestSupport }
      }
    ];

  // 4. MACD (macd)
  } else if (selectedTool === 'macd') {
    const { macdLine, signalLine, histogram } = calculateMACD(candles);
    const latestMacd = macdLine[macdLine.length - 1] || 0;
    const latestSignal = signalLine[signalLine.length - 1] || 0;
    const latestHist = histogram[histogram.length - 1] || 0;
    
    const isAboveSignal = latestMacd > latestSignal;
    const histIncreasing = Math.abs(latestHist) > Math.abs(histogram[histogram.length - 2] || 0);
    const crossoverStatus = isAboveSignal ? "above the signal line (bullish alignment)" : "below the signal line (bearish alignment)";

    // Crossover of zero line check
    let crossedZeroAbove = false;
    let crossedZeroBelow = false;
    const recentMacd = macdLine.slice(-10);
    for (let k = 1; k < recentMacd.length; k++) {
      if (recentMacd[k-1] <= 0 && recentMacd[k] > 0) crossedZeroAbove = true;
      if (recentMacd[k-1] >= 0 && recentMacd[k] < 0) crossedZeroBelow = true;
    }
    const zeroCrossText = crossedZeroAbove ? "MACD line recently crossed above the zero midline, indicating positive structural shift." :
                          crossedZeroBelow ? "MACD line recently crossed below the zero midline, indicating negative structural shift." :
                          `MACD line resides at ${latestMacd.toFixed(4)}, holding ${latestMacd > 0 ? 'above' : 'below'} the zero baseline.`;

    // Histogram height peak ratio
    const maxHistVal = Math.max(...histogram.slice(-20).map(Math.abs)) || 1;
    const histPeakPct = (Math.abs(latestHist) / maxHistVal) * 100;
    const histTrend = histPeakPct > 75 ? "near peak momentum" : histPeakPct < 25 ? " momentum is highly subdued" : "moderate momentum pace";

    selectedToolReading = `MACD line is at ${latestMacd.toFixed(4)}, the Signal line is at ${latestSignal.toFixed(4)}, and the Histogram stands at ${latestHist.toFixed(4)} (${histTrend}). The MACD is currently ${crossoverStatus}. ${zeroCrossText}`;
    
    mainObservation = `MACD convergence/divergence indicators show a ${isAboveSignal ? 'positive' : 'negative'} crossover state. Momentum is ${latestHist > 0 ? 'improving' : 'slowing'}.`;
    
    keyWatchZones = `MACD Zero-Line | Signal Line Crossover Level | Nearest support floor: ${nearestSupport.toFixed(2)}`;
    
    whatToWatch = "Watch for histogram bars returning to the zero line, indicating momentum exhaustion. A crossover of the MACD and Signal lines, especially when far from the zero midline, suggests a possible pivot.";

    upsideCase = {
      clarity: "Medium",
      risk: "High",
      confirmation: "Yes",
      explanation: "For upward acceleration, the MACD line must hold above the signal line and push into positive territory above the zero line, confirming that shorter-term price velocity is expanding."
    };
    
    downsideCase = {
      clarity: "Medium",
      risk: "Medium",
      confirmation: "Yes",
      explanation: `A downside continuation scenario is supported if the MACD line remains capped below the signal line or crosses under, favoring a retest of the support at ${nearestSupport.toFixed(2)}.`
    };
    
    sidewaysCase = {
      clarity: "High",
      risk: "Low",
      confirmation: "No",
      explanation: "If MACD and signal lines flatten and hover close together near the zero line, it indicates rangebound price action with no clear momentum trend."
    };

    riskNote = "MACD is a lagging momentum indicator derived from moving averages. In sideways or choppy ranges, MACD crossover lines frequently cross back and forth, generating false momentum triggers.";
    
    beginnerExplanation = "MACD uses two moving averages to show trend changes. Think of it as a fast car and a slow truck. When the fast car (MACD line) crosses above the slow truck (Signal line), it means momentum is accelerating upwards.";

    videoSteps = [
      {
        title: "Calculate Convergence Lines",
        narration: `We calculate the MACD and Signal lines for ${selectedSymbol}. MACD is at ${latestMacd.toFixed(4)} and Signal is at ${latestSignal.toFixed(4)}.`,
        target: { type: 'indicator', value: 'macd' }
      },
      {
        title: "Inspect Histogram Spacing",
        narration: `The histogram is currently at ${latestHist.toFixed(4)}, which is ${histIncreasing ? 'expanding' : 'weakening'} in size.`,
        target: { type: 'indicator', value: 'macd' }
      },
      {
        title: "Lagging Trend Confirmation",
        narration: `We use horizontal support at ${nearestSupport.toFixed(2)} to confirm MACD crossover setups before anticipating structural transitions.`,
        target: { type: 'price', value: nearestSupport }
      }
    ];

  // 5. EMA / SMA / MOVING AVERAGE (ema, sma, moving_average)
  } else if (['ema', 'sma', 'moving_average'].includes(selectedTool)) {
    const isEma = selectedTool === 'ema';
    const periodShort = 20;
    const periodLong = 50;
    
    const maShort = isEma ? calculateEMA(candles, periodShort) : calculateSMA(candles, periodShort);
    const maLong = isEma ? calculateEMA(candles, periodLong) : calculateSMA(candles, periodLong);
    
    const latestShort = maShort[maShort.length - 1] || currentPrice;
    const latestLong = maLong[maLong.length - 1] || currentPrice;
    
    const isAboveShort = currentPrice > latestShort;
    const isShortAboveLong = latestShort > latestLong;
    
    // Slopes
    const prevShort = maShort[maShort.length - 2] || latestShort;
    const shortSlope = latestShort - prevShort;
    const slopeDirection = shortSlope > 0.0001 ? "sloping upward" : shortSlope < -0.0001 ? "sloping downward" : "flat";

    // MA spacing ratio
    const spacingRatio = (Math.abs(latestShort - latestLong) / latestLong) * 100;
    const spacingText = spacingRatio > 4 ? "extended trend corridor" : spacingRatio < 1 ? "converging average squeeze" : "stable trend channel";

    // Crossover in last 10 candles
    let hadGoldenCross = false;
    let hadDeathCross = false;
    const recentShort = maShort.slice(-10);
    const recentLong = maLong.slice(-10);
    for (let idx = 1; idx < recentShort.length; idx++) {
      if (recentShort[idx-1] <= recentLong[idx-1] && recentShort[idx] > recentLong[idx]) hadGoldenCross = true;
      if (recentShort[idx-1] >= recentLong[idx-1] && recentShort[idx] < recentLong[idx]) hadDeathCross = true;
    }
    const crossEvent = hadGoldenCross ? "A bullish crossover (Golden Cross) was detected in the recent window." :
                       hadDeathCross ? "A bearish crossover (Death Cross) was detected in the recent window." :
                       "No moving average crossovers detected in the last 10 candles.";

    selectedToolReading = `The 20-period ${selectedTool.toUpperCase()} is calculated at ${latestShort.toFixed(2)}, which is ${slopeDirection}. The 50-period average sits at ${latestLong.toFixed(2)}. Averages are in a ${spacingText} (spacing ${spacingRatio.toFixed(2)}%). Price is trading ${
      isAboveShort ? 'above' : 'below'
    } the 20-period MA. ${crossEvent}`;
    
    mainObservation = `Moving Averages suggest a structural ${isShortAboveLong ? 'uptrend' : 'downtrend'} pattern, with the 20-period line acting as dynamic ${isAboveShort ? 'support' : 'resistance'}.`;
    
    keyWatchZones = `Dynamic 20 MA: ${latestShort.toFixed(2)} | Dynamic 50 MA: ${latestLong.toFixed(2)} | Horizontal Floor: ${nearestSupport.toFixed(2)}`;
    
    whatToWatch = "Watch for price pulls back to the 20 MA line. If price bounces off the line, the trend direction remains sound. If price breaks through it on volume, expect a test of the 50 MA line.";

    upsideCase = {
      clarity: "High",
      risk: "Medium",
      confirmation: "Yes",
      explanation: `For a strong upside continuation, price must hold above the 20 MA at ${latestShort.toFixed(2)} and break horizontal resistance at ${nearestResistance.toFixed(2)}.`
    };
    
    downsideCase = {
      clarity: "Medium",
      risk: "Low",
      confirmation: "Yes",
      explanation: `A downside corrective shift is confirmed if price closes below the 20 MA at ${latestShort.toFixed(2)}, favoring a drop to test the 50 MA at ${latestLong.toFixed(2)}.`
    };
    
    sidewaysCase = {
      clarity: "Medium",
      risk: "Low",
      confirmation: "No",
      explanation: "If price repeatedly crosses back and forth over the MA lines while they remain flat, the trend has flattened into a rangebound consolidation."
    };

    riskNote = "Moving averages are lagging, trend-following indicators. They perform well in strong trending environments but produce multiple whipsaws (false breakouts) in flat, sideways markets.";
    
    beginnerExplanation = "A Moving Average smooths price data by creating a constantly updated average price. Think of it as a moving floor. When price stays above the average, buyers are driving the trend upward.";

    overlays = [
      { type: 'series', name: `${selectedTool.toUpperCase()} (20)`, data: maShort, color: '#06b6d4' },
      { type: 'series', name: `${selectedTool.toUpperCase()} (50)`, data: maLong, color: '#3b82f6' }
    ];

    videoSteps = [
      {
        title: "Plot Moving Averages",
        narration: `We plot the 20-period and 50-period moving averages for ${selectedSymbol}. Price is at ${currentPrice.toFixed(2)}.`,
        target: { type: 'indicator', value: selectedTool }
      },
      {
        title: "Analyze MA Spacing",
        narration: `The 20-period MA is at ${latestShort.toFixed(2)} and the 50-period MA is at ${latestLong.toFixed(2)}. The short MA is currently ${isShortAboveLong ? 'above' : 'below'} the long MA.`,
        target: { type: 'indicator', value: selectedTool }
      },
      {
        title: "Dynamic Retests",
        narration: `Watch how candles interact with the 20 MA as dynamic ${isAboveShort ? 'support' : 'resistance'}.`,
        target: { type: 'chart' }
      }
    ];

  // 6. VOLUME (volume)
  } else if (selectedTool === 'volume') {
    const volumes = candles.map(c => c.volume);
    const avgVol = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const latestVol = lastCandle.volume;
    const participationRatio = latestVol / avgVol;
    
    let participation = "average participation";
    if (participationRatio > 1.4) {
      participation = "strong volume participation";
    } else if (participationRatio < 0.7) {
      participation = "weak/exhausted volume participation";
    }
    
    // Volume Slope over last 5 candles
    const recentVols = volumes.slice(-5);
    let volSlope = 0;
    for (let v = 1; v < recentVols.length; v++) {
      volSlope += (recentVols[v] - recentVols[v-1]);
    }
    const volTrend = volSlope > 0 ? "expanding transactions flow" : "declining market interest";

    // Green vs Red Volume ratio over last 10 candles
    const recent10 = candles.slice(-10);
    const greenVol = recent10.filter(c => c.close >= c.open).reduce((sum, c) => sum + c.volume, 0);
    const redVol = recent10.filter(c => c.close < c.open).reduce((sum, c) => sum + c.volume, 0);
    const volRatio = greenVol / (redVol || 1);
    const buySellBalance = volRatio > 1.3 ? "buyers dominant on volume" : volRatio < 0.7 ? "sellers dominant on volume" : "balanced volume flow";

    selectedToolReading = `Latest volume is ${latestVol.toLocaleString()} units, compared to the 20-period average volume of ${Math.round(avgVol).toLocaleString()} units (representing ${(participationRatio * 100).toFixed(1)}% of the average). Volumetric trends display a ${volTrend} with a ${buySellBalance} (buy/sell ratio ${volRatio.toFixed(2)}).`;
    
    mainObservation = `Volume levels show ${participationRatio > 1 ? 'expanding' : 'contracting'} institutional interest. High volume is critical to validate breakout vectors.`;
    
    keyWatchZones = `Average Volume line: ${Math.round(avgVol).toLocaleString()} | Current Volume: ${latestVol.toLocaleString()}`;
    
    whatToWatch = "Watch for a spike in volume that exceeds 1.5x the average during a price breakout or support retest. A breakout without volume support has a higher probability of being a fakeout (failed breakout) that reverses back into the range.";

    upsideCase = {
      clarity: "Medium",
      risk: "Medium",
      confirmation: "Yes",
      explanation: "Upward progression requires price to break above resistance accompanied by a significant spike in green volume bars, demonstrating aggressive buying."
    };
    
    downsideCase = {
      clarity: "Medium",
      risk: "Low",
      confirmation: "Yes",
      explanation: `A downside sell-off expands if prices drop below support at ${nearestSupport.toFixed(2)} on high red volume, indicating institutional liquidations.`
    };
    
    sidewaysCase = {
      clarity: "High",
      risk: "Low",
      confirmation: "No",
      explanation: "If volume remains below average and continues to decline, price will likely consolidate sideways in a low-momentum squeeze."
    };

    riskNote = "Volume represents the quantity of transactions but not the direction. High volume can occur at major tops (churning/distribution) or major bottoms (absorption/climax). Combine it with candlestick price shapes.";
    
    beginnerExplanation = "Volume is the fuel of price. A price move on high volume shows that major funds are participating, whereas a price move on low volume is like a car running out of gas.";

    overlays = [
      { type: 'horizontal_line', price: nearestSupport, color: '#10b981', label: 'Support Floor' },
      { type: 'horizontal_line', price: nearestResistance, color: '#ef4444', label: 'Resistance Ceiling' }
    ];

    videoSteps = [
      {
        title: "Observe Trade Activity",
        narration: `We look at volume activity for ${selectedSymbol}. Latest candle volume is ${latestVol.toLocaleString()} units.`,
        target: { type: 'chart' }
      },
      {
        title: "Compare to Benchmark",
        narration: `The 20-period average volume is ${Math.round(avgVol).toLocaleString()}. Current participation is at ${(participationRatio * 100).toFixed(0)}% of average.`,
        target: { type: 'chart' }
      },
      {
        title: "Look for Institutional Confirmation",
        narration: "We evaluate whether the volume supports buying or selling pressure before anticipating key level breakouts.",
        target: { type: 'chart' }
      }
    ];

  // 7. BOLLINGER BANDS (bollinger_bands)
  } else if (selectedTool === 'bollinger_bands') {
    const { upper, middle, lower } = calculateBollingerBands(candles, 20, 2);
    const latestUpper = upper[upper.length - 1] || (currentPrice * 1.05);
    const latestMiddle = middle[middle.length - 1] || currentPrice;
    const latestLower = lower[lower.length - 1] || (currentPrice * 0.95);
    
    const bandWidth = (latestUpper - latestLower) / latestMiddle;
    
    // Volatility Squeeze Index over last 20 candles
    const widths = [];
    for (let w = Math.max(0, upper.length - 20); w < upper.length; w++) {
      if (upper[w] && lower[w] && middle[w]) {
        widths.push((upper[w] - lower[w]) / middle[w]);
      }
    }
    const minWidth = Math.min(...widths) || 0.01;
    const maxWidth = Math.max(...widths) || 0.1;
    const squeezeIndex = (bandWidth - minWidth) / ((maxWidth - minWidth) || 0.01);
    const squeezeStatus = squeezeIndex < 0.15 ? "extreme volatility squeeze (coiling for expansion)" :
                          squeezeIndex > 0.85 ? "volatility expansion climax (extreme price extension)" :
                          "normal volatility bandwidth";

    // Proximity state
    let priceState = "neutral band channel";
    if (currentPrice >= latestUpper * 0.985) {
      priceState = "touching/walking upper band (overextended)";
    } else if (currentPrice <= latestLower * 1.015) {
      priceState = "touching/walking lower band (oversold)";
    }

    selectedToolReading = `Bollinger Bands stand at Upper: ${latestUpper.toFixed(2)}, Middle (SMA 20): ${latestMiddle.toFixed(2)}, and Lower: ${latestLower.toFixed(2)}. The price is trading at ${currentPrice.toFixed(2)}, positioned in the ${priceState}. The bandwidth is at a ${squeezeStatus} (Squeeze Index: ${(squeezeIndex * 100).toFixed(1)}%).`;
    
    mainObservation = `Price is reacting inside a ${bandWidth > 0.08 ? 'highly volatile' : 'constricted'} volatility envelope. Bollinger Band Width indicates coiling energy.`;
    
    keyWatchZones = `Upper Band: ${latestUpper.toFixed(2)} | Middle Baseline (SMA 20): ${latestMiddle.toFixed(2)} | Lower Band: ${latestLower.toFixed(2)}`;
    
    whatToWatch = "Watch for a squeeze (bands narrowing) preceding explosive moves. Price touching the outer bands represents relative extremes; watch for mean reversion back to the middle SMA baseline, or a dynamic continuation.";

    upsideCase = {
      clarity: "Medium",
      risk: "Medium",
      confirmation: "Yes",
      explanation: `For an upside breakout, price must push the Upper Band at ${latestUpper.toFixed(2)} outward while holding the SMA 20 baseline at ${latestMiddle.toFixed(2)} as support.`
    };
    
    downsideCase = {
      clarity: "Medium",
      risk: "Low",
      confirmation: "Yes",
      explanation: `A downside move is expected if price rejects the middle line at ${latestMiddle.toFixed(2)} and declines to test the Lower Band limit near ${latestLower.toFixed(2)}.`
    };
    
    sidewaysCase = {
      clarity: "High",
      risk: "Low",
      confirmation: "No",
      explanation: "If the bands remain narrow and parallel, expect the price to bounce back and forth between the upper and lower bands, respecting them as dynamic ranges."
    };

    riskNote = "Bollinger Bands adjust to market volatility. Reaching the upper or lower band is not a standalone trade signal; price can walk the bands upward or downward during strong trends.";
    
    beginnerExplanation = "Bollinger Bands draw a dynamic channel around price. The middle is the 20-period average. The bands expand when price is volatile, and contract (squeeze) when price is quiet, which often precedes a big breakout.";

    overlays = [
      { type: 'series', name: 'BB Upper', data: upper, color: 'rgba(6, 182, 212, 0.4)' },
      { type: 'series', name: 'BB Middle', data: middle, color: 'rgba(255, 255, 255, 0.3)' },
      { type: 'series', name: 'BB Lower', data: lower, color: 'rgba(6, 182, 212, 0.4)' }
    ];

    videoSteps = [
      {
        title: "Measure Volatility Band Width",
        narration: `We calculate Bollinger Bands. Middle SMA is at ${latestMiddle.toFixed(2)} with Upper Band at ${latestUpper.toFixed(2)} and Lower Band at ${latestLower.toFixed(2)}.`,
        target: { type: 'indicator', value: 'bollinger_bands' }
      },
      {
        title: "Check Price Location",
        narration: `Price is currently trading at ${currentPrice.toFixed(2)}, which is in the ${priceState}.`,
        target: { type: 'price', value: currentPrice }
      },
      {
        title: "Volatility Expansion Watch",
        narration: `The bands are in a ${squeezeStatus} state. Watch for breakout rides or mean-reversion retests.`,
        target: { type: 'chart' }
      }
    ];

  // 8. CANDLESTICK PATTERNS (candlestick_patterns)
  } else if (selectedTool === 'candlestick_patterns') {
    const pattern = detectCandlestickPatterns(candles);
    const bodySize = Math.abs(lastCandle.close - lastCandle.open);
    const candleRange = lastCandle.high - lastCandle.low;
    const upperWick = lastCandle.high - Math.max(lastCandle.open, lastCandle.close);
    const lowerWick = Math.min(lastCandle.open, lastCandle.close) - lastCandle.low;
    
    let candleType = "indecision candle";
    const bodyPct = (bodySize / (candleRange || 1)) * 100;
    const upperWickPct = (upperWick / (candleRange || 1)) * 100;
    const lowerWickPct = (lowerWick / (candleRange || 1)) * 100;

    if (bodyPct > 70) {
      candleType = isUpCandle ? "strong bullish momentum expansion (marubozu profile)" : "strong bearish momentum expansion (marubozu profile)";
    } else if (lowerWickPct > 55 && upperWickPct < 15) {
      candleType = "demand-side wick rejection (hammer shape)";
    } else if (upperWickPct > 55 && lowerWickPct < 15) {
      candleType = "supply-side wick rejection (shooting star shape)";
    } else if (bodyPct < 15) {
      candleType = "market indecision profile (doji/spinning top)";
    }

    selectedToolReading = `Pattern recognition identifies a ${pattern}. The latest candle exhibits a ${candleType}, where the real body represents ${bodyPct.toFixed(1)}% of the total candle range. Upper wick accounts for ${upperWickPct.toFixed(1)}% and lower wick is ${lowerWickPct.toFixed(1)}% of the $${candleRange.toFixed(2)} swing distance.`;
    
    mainObservation = `Candles show a structural ${isUpCandle ? 'bullish-leaning' : 'bearish-leaning'} closing shape. We examine the follow-through characteristics.`;
    
    keyWatchZones = `High of pattern candle: ${lastCandle.high.toFixed(2)} | Low of pattern candle: ${lastCandle.low.toFixed(2)} | Close: ${currentPrice.toFixed(2)}`;
    
    whatToWatch = "Watch for a follow-through candle close above the high of the pattern candle to confirm buyer absorption, or below the low to confirm seller rejection. A single candle shape is not a reliable trend reversal trigger.";

    upsideCase = {
      clarity: "Medium",
      risk: "High",
      confirmation: "Yes",
      explanation: `For an upward follow-through, subsequent candles must break and close above the pattern candle high at ${lastCandle.high.toFixed(2)}.`
    };
    
    downsideCase = {
      clarity: "Medium",
      risk: "Medium",
      confirmation: "Yes",
      explanation: `A downside confirmation is triggered if subsequent price action falls and closes below the pattern candle low at ${lastCandle.low.toFixed(2)}.`
    };
    
    sidewaysCase = {
      clarity: "High",
      risk: "Low",
      confirmation: "No",
      explanation: "If price remains inside the high-low bounds of the pattern candle, it represents a period of rangebound consolidation and market indecision."
    };

    riskNote = "Candlestick pattern shapes have little significance in isolation. A hammer or rejection candle must form directly at a major historical horizontal support/resistance key zone to be valid.";
    
    beginnerExplanation = "Candlesticks tell a story of the battle between buyers and sellers. The body is the open-to-close range. Long wicks show that one side pushed price aggressively, but the other side pushed it back before the close.";

    overlays = [
      { type: 'horizontal_line', price: lastCandle.high, color: 'rgba(239, 68, 68, 0.4)', label: 'Pattern High' },
      { type: 'horizontal_line', price: lastCandle.low, color: 'rgba(16, 185, 129, 0.4)', label: 'Pattern Low' }
    ];

    videoSteps = [
      {
        title: "Analyze Candle Formations",
        narration: `We examine the candlestick shape for ${selectedSymbol}. Price closed at ${currentPrice.toFixed(2)}.`,
        target: { type: 'chart' }
      },
      {
        title: "Measure Wick Ratios",
        narration: `The latest candle is classified as a ${candleType}, with an upper wick of ${upperWick.toFixed(2)} and lower wick of ${lowerWick.toFixed(2)}.`,
        target: { type: 'chart' }
      },
      {
        title: "Wait for Follow-Through",
        narration: `We watch if subsequent candles break the high of ${lastCandle.high.toFixed(2)} or the low of ${lastCandle.low.toFixed(2)} to confirm the structure.`,
        target: { type: 'chart' }
      }
    ];

  // 9. MARKET STRUCTURE (market_structure)
  } else if (selectedTool === 'market_structure') {
    let structureState = "ranging sideways";
    let explanationDetail = "Price is fluctuating within historical boundaries without making consecutive higher highs or lower lows.";
    
    // Swing points verification
    if (recentHighs.length >= 2 && recentLows.length >= 2) {
      if (recentHighs[0] > recentHighs[1] && recentLows[0] > recentLows[1]) {
        structureState = "trending upwards (bullish structure)";
        explanationDetail = `Price action exhibits higher highs and higher lows. The uptrend remains structurally intact as long as the swing floor at $${recentLows[0].toFixed(2)} is defended.`;
      } else if (recentHighs[0] < recentHighs[1] && recentLows[0] < recentLows[1]) {
        structureState = "trending downwards (bearish structure)";
        explanationDetail = `Price action shows consecutive lower highs and lower lows. The downtrend continues to dominate as long as swing highs at $${recentHighs[0].toFixed(2)} hold as resistance ceilings.`;
      } else {
        structureState = "weakening/transitioning trend structure";
        explanationDetail = "Price swings are mixed or narrowing, pointing to compression, consolidation, or a potential trend change.";
      }
    }

    selectedToolReading = `Market structure analysis categorizes current price action as ${structureState}. ${explanationDetail} Recent swing highs stand at [${recentHighs.map(h => h.toFixed(2)).join(', ')}] and swing lows at [${recentLows.map(l => l.toFixed(2)).join(', ')}].`;
    
    mainObservation = `Market structure is in a ${structureState.includes('bullish') ? 'constructive markup' : structureState.includes('bearish') ? 'corrective markdown' : 'neutral range'} phase on the ${selectedTimeframe} timeframe.`;
    
    keyWatchZones = `Recent Swing High: ${recentHighs[0] || highestHigh.toFixed(2)} | Recent Swing Low: ${recentLows[0] || lowestLow.toFixed(2)} | Range Midpoint: ${((highestHigh + lowestLow) / 2).toFixed(2)}`;
    
    whatToWatch = "Watch for a break of structure (BOS), where price breaks and closes beyond the most recent swing high or low. A close above the recent high confirms bullish continuation, while a close below the low signals bearish weakness.";

    upsideCase = {
      clarity: "Medium",
      risk: "Medium",
      confirmation: "Yes",
      explanation: `To confirm structure continuation, price must print a higher high and close above the major swing high at ${recentHighs[0] || highestHigh.toFixed(2)}.`
    };
    
    downsideCase = {
      clarity: "Medium",
      risk: "Medium",
      confirmation: "Yes",
      explanation: `A structural breakdown is triggered if price prints a lower low and closes below the swing low at ${recentLows[0] || lowestLow.toFixed(2)}.`
    };
    
    sidewaysCase = {
      clarity: "High",
      risk: "Low",
      confirmation: "No",
      explanation: "If price remains locked between the swing boundaries, structure continues as rangebound consolidation."
    };

    riskNote = "Market structure trends are relative to the timeframe. A bullish structure on a 15-minute chart can be a minor pullback within a bearish structure on a daily chart. Always check multiple timeframes.";
    
    beginnerExplanation = "Market structure is the skeleton of trend analysis. In an uptrend, price climbs stairs (making higher highs and higher lows). In a downtrend, price slides down (lower highs and lower lows). Breaking a stair floor changes the structure.";

    overlays = [
      { type: 'horizontal_line', price: recentHighs[0] || highestHigh, color: '#ef4444', label: 'Swing High' },
      { type: 'horizontal_line', price: recentLows[0] || lowestLow, color: '#10b981', label: 'Swing Low' }
    ];

    videoSteps = [
      {
        title: "Assess Swing Points",
        narration: `We outline market swing points for ${selectedSymbol}. Price is at ${currentPrice.toFixed(2)}.`,
        target: { type: 'price', value: currentPrice }
      },
      {
        title: "Determine Trend Phase",
        narration: `Swings indicate a ${structureState} state, with swing boundaries at ${lowestLow.toFixed(2)} and ${highestHigh.toFixed(2)}.`,
        target: { type: 'chart' }
      },
      {
        title: "Break of Structure Watch",
        narration: "We watch for a close outside swing boundaries, which signals the continuation or reversal of the trend.",
        target: { type: 'chart' }
      }
    ];

  // 10. BREAKOUT / RETEST (breakout, retest)
  } else if (['breakout', 'retest'].includes(selectedTool)) {
    const rangeLength = 25;
    const sliceCandles = candles.slice(-rangeLength);
    const channelHigh = Math.max(...sliceCandles.map(c => c.high));
    const channelLow = Math.min(...sliceCandles.map(c => c.low));
    
    let isBreakoutAbove = currentPrice > channelHigh * 0.985;
    let isBreakoutBelow = currentPrice < channelLow * 1.015;
    
    let breakoutStatus = "consolidating within historical range boundaries";
    if (currentPrice > channelHigh) {
      breakoutStatus = "exhibiting an upside breakout above range ceiling";
    } else if (currentPrice < channelLow) {
      breakoutStatus = "exhibiting a downside breakdown below range floor";
    } else if (isBreakoutAbove) {
      breakoutStatus = "approaching upside breakout boundary";
    } else if (isBreakoutBelow) {
      breakoutStatus = "approaching downside breakdown boundary";
    }

    // Retest check
    let retestStatus = "Retest has not occurred yet.";
    const prev3Close = candles[candles.length - 3]?.close;
    const prev2Close = candles[candles.length - 2]?.close;
    if (prev3Close > channelHigh && prev2Close <= channelHigh && currentPrice >= channelHigh) {
      retestStatus = "Potential support retest of broken resistance is in progress.";
    }

    // Volume breakout validation check
    const lastVol = lastCandle.volume;
    const volumes = candles.map(c => c.volume);
    const avgVol = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const volumeMultiplier = lastVol / (avgVol || 1);
    const isVolumeConfirmed = volumeMultiplier >= 1.5;
    const volConfirmText = isVolumeConfirmed ? "Breakout attempts are backed by expanding volume, confirming strength." :
                            "Breakout attempts lack volume support, raising fakeout (failed breakout) warnings.";

    selectedToolReading = `Breakout and retest analysis indicates that price is ${breakoutStatus}. The local range boundaries are set at Ceiling: ${channelHigh.toFixed(2)} and Floor: ${channelLow.toFixed(2)}. ${volConfirmText} (latest volume ratio: ${volumeMultiplier.toFixed(2)}x average).`;
    
    mainObservation = `Price is currently hovering at ${currentPrice.toFixed(2)}, testing key range boundaries. Volume expansion is critical to prevent a fakeout.`;
    
    keyWatchZones = `Range Ceiling: ${channelHigh.toFixed(2)} | Range Floor: ${channelLow.toFixed(2)} | Retest Zone: ${channelHigh.toFixed(2)}`;
    
    whatToWatch = "Watch for high-volume follow-through on a breakout candle. A breakout accompanied by low volume represents a high risk of being a fakeout (failed breakout) that reverses back into the range.";

    upsideCase = {
      clarity: "Medium",
      risk: "High",
      confirmation: "Yes",
      explanation: `For a clean upside breakout, price must establish candle closes above ${channelHigh.toFixed(2)} with expanding volume, followed by a successful retest.`
    };
    
    downsideCase = {
      clarity: "Medium",
      risk: "Medium",
      confirmation: "Yes",
      explanation: `A downside breakdown is confirmed if price closes below the floor at ${channelLow.toFixed(2)} and holds below on subsequent pullbacks.`
    };
    
    sidewaysCase = {
      clarity: "High",
      risk: "Low",
      confirmation: "No",
      explanation: "If price fails to break either boundary, it will continue to consolidate sideways inside the range bounds."
    };

    riskNote = "Many breakouts fail. A breakout is only confirmed when a candle closes outside the boundary on the daily/weekly timeframe, and preferably respects the boundary as support/resistance on a retest.";
    
    beginnerExplanation = "A breakout is when price escapes from a tight trading box. If price breaks above the ceiling, it indicates buyers have taken control. A retest is when price pulls back to touch the box ceiling to verify it acts as support.";

    overlays = [
      { type: 'horizontal_line', price: channelHigh, color: '#ef4444', label: 'Range Ceiling' },
      { type: 'horizontal_line', price: channelLow, color: '#10b981', label: 'Range Floor' }
    ];

    videoSteps = [
      {
        title: "Outline Price Box",
        narration: `We plot local range boundaries for ${selectedSymbol}. Ceiling is at ${channelHigh.toFixed(2)} and Floor is at ${channelLow.toFixed(2)}.`,
        target: { type: 'chart' }
      },
      {
        title: "Check Breakout Status",
        narration: `Price is at ${currentPrice.toFixed(2)}, which is ${breakoutStatus}.`,
        target: { type: 'price', value: currentPrice }
      },
      {
        title: "Watch for Retests",
        narration: `We monitor if price breaks and pulls back to retest the broken level as new support or resistance.`,
        target: { type: 'chart' }
      }
    ];

  // 11. RISK CALCULATORS
  } else if (isRiskTool) {
    const capital = getLocalStorageNumber('mp_risk_capital');
    const riskPercent = getLocalStorageNumber('mp_risk_percent');
    const entryPriceInput = getLocalStorageNumber('mp_risk_entry');
    const stopPriceInput = getLocalStorageNumber('mp_risk_stop');
    const rrEntryVal = getLocalStorageNumber('mp_risk_rr_entry');
    const rrStopVal = getLocalStorageNumber('mp_risk_rr_stop');
    const rrTargetVal = getLocalStorageNumber('mp_risk_rr_target');

    // Validation checks
    let isInputsValid = false;
    if (selectedTool === 'position_size' || selectedTool === 'capital_risk') {
      isInputsValid = capital > 0 && riskPercent > 0 && entryPriceInput > 0 && stopPriceInput > 0 && entryPriceInput !== stopPriceInput;
    } else if (selectedTool === 'risk_reward') {
      isInputsValid = rrEntryVal > 0 && rrStopVal > 0 && rrTargetVal > 0 && rrEntryVal !== rrStopVal;
    } else if (selectedTool === 'stop_distance') {
      isInputsValid = (entryPriceInput > 0 && stopPriceInput > 0 && entryPriceInput !== stopPriceInput) || 
                      (rrEntryVal > 0 && rrStopVal > 0 && rrEntryVal !== rrStopVal);
    }

    if (!isInputsValid) {
      selectedToolReading = "This tool needs user inputs before calculation.";
      mainObservation = "Calculation pending: inputs are missing or invalid.";
      marketStructure = "This calculation operates independently of active chart patterns. Please enter valid risk parameters.";
      keyWatchZones = "Required inputs: Capital, Risk Percentage, Entry, Stop, and Target Prices.";
      whatToWatch = "Please visit the Position Sizing or Risk-Reward tabs in the Interactive Suite to input your parameters.";
      
      upsideCase = { clarity: "Low", risk: "Low", confirmation: "Yes", explanation: "Upward scenario calculation pending inputs." };
      downsideCase = { clarity: "Low", risk: "Low", confirmation: "Yes", explanation: "Downward scenario calculation pending inputs." };
      sidewaysCase = { clarity: "Low", risk: "Low", confirmation: "No", explanation: "Sideways consolidation study pending inputs." };
      
      riskNote = "Sizing and expectancy calculations require numerical parameters to outline capital boundaries. Keep risk planning as a priority.";
      beginnerExplanation = "Risk planning calculations are mathematical safeguards. They help you determine exactly how much you stand to lose or gain on a trade before you participate.";
      overlays = [];
      videoSteps = [
        {
          title: "Inputs Required",
          narration: "This risk calculator needs user inputs from the Interactive Suite before it can perform calculations.",
          target: { type: 'chart' }
        }
      ];
    } else {
      // Inputs are valid, compute actual risk details
      const activeCapital = capital || 10000;
      const activeRiskPercent = riskPercent || 1;
      const activeEntry = entryPriceInput || rrEntryVal || 100;
      const activeStop = stopPriceInput || rrStopVal || 95;
      const activeTarget = rrTargetVal || (activeEntry * 1.15);

      const riskAmt = activeCapital * (activeRiskPercent / 100);
      const stopDist = Math.abs(activeEntry - activeStop);
      const stopDistPercent = (stopDist / activeEntry) * 100;
      const rewardDist = Math.abs(activeTarget - activeEntry);
      const rewardDistPercent = (rewardDist / activeEntry) * 100;
      const rrRatio = stopDist > 0 ? rewardDist / stopDist : 2;
      const units = stopDist > 0 ? riskAmt / stopDist : 0;
      const nominalVal = units * activeEntry;
      const breakevenWinrate = (1 / (1 + rrRatio)) * 100;

      if (selectedTool === 'position_size') {
        selectedToolReading = `Position sizing calculations: Total capital is $${activeCapital.toLocaleString()}, risking ${activeRiskPercent}% per trade. Total risk amount is $${riskAmt.toFixed(2)}. Stop distance is $${stopDist.toFixed(2)} (${stopDistPercent.toFixed(2)}%). Recommended position size is ${units.toFixed(4)} units, representing a nominal trade value of $${nominalVal.toFixed(2)}.`;
        mainObservation = `With entry at $${activeEntry.toFixed(2)} and stop-loss at $${activeStop.toFixed(2)}, your capital is protected. If stop is hit, loss is strictly limited to $${riskAmt.toFixed(2)}.`;
      } else if (selectedTool === 'risk_reward') {
        selectedToolReading = `Risk-to-Reward calculations: Entry: $${activeEntry.toFixed(2)}, Stop-Loss: $${activeStop.toFixed(2)} (-${stopDistPercent.toFixed(2)}%), Take-Profit Target: $${activeTarget.toFixed(2)} (+${rewardDistPercent.toFixed(2)}%). Risk-to-Reward Ratio is 1:${rrRatio.toFixed(2)}. Mathematically, you need a win-rate of ${breakevenWinrate.toFixed(1)}% to break even.`;
        mainObservation = `Expectancy ratio is set to 1:${rrRatio.toFixed(2)}. Higher reward-to-risk structures require a lower win-rate to stay profitable over time.`;
      } else if (selectedTool === 'stop_distance') {
        selectedToolReading = `Stop distance calculations: Price entry is at $${activeEntry.toFixed(2)} with stop-loss set at $${activeStop.toFixed(2)}. Stop-loss distance is $${stopDist.toFixed(2)} points (${stopDistPercent.toFixed(2)}% distance from entry). Risk capital allocated is $${riskAmt.toFixed(2)}.`;
        mainObservation = `Your stop-loss distance is set to $${stopDist.toFixed(2)} points. This represents the structural boundary where your trade invalidation occurs.`;
      } else if (selectedTool === 'capital_risk') {
        const potentialDrawdown10 = riskAmt * 10;
        const potentialDrawdownPercent = activeRiskPercent * 10;
        selectedToolReading = `Capital risk simulation: Compounding drawdown risk over 10 consecutive losing trades results in a total loss of $${potentialDrawdown10.toFixed(2)} (${potentialDrawdownPercent.toFixed(1)}% of capital). Capital exposure is strictly locked at ${activeRiskPercent}% per trade.`;
        mainObservation = `By keeping risk at ${activeRiskPercent}%, you preserve capital resilience and avoid the risk of ruin.`;
      }

      marketStructure = "This risk study is independent of chart formations and is based entirely on user-defined inputs.";
      keyWatchZones = `Entry: $${activeEntry.toFixed(2)} | Stop-Loss: $${activeStop.toFixed(2)} | Target: $${activeTarget.toFixed(2)}`;
      whatToWatch = `Watch your capital allocation. Ensure that the total risk of $${riskAmt.toFixed(2)} matches your personal risk tolerance and that stop levels represent structural invalidation areas on your charts.`;

      upsideCase = {
        clarity: "High",
        risk: "Low",
        confirmation: "No",
        explanation: `Under an upside continuation, if target is hit at $${activeTarget.toFixed(2)}, the reward is $${rewardDist.toFixed(2)}, representing a profit of ${(rewardDistPercent).toFixed(1)}% on the position.`
      };
      
      downsideCase = {
        clarity: "High",
        risk: "Low",
        confirmation: "No",
        explanation: `Under a downside invalidation, if stop is hit at $${activeStop.toFixed(2)}, the loss is restricted to $${riskAmt.toFixed(2)}, leaving $${(activeCapital - riskAmt).toFixed(2)} in capital.`
      };
      
      sidewaysCase = {
        clarity: "Medium",
        risk: "Low",
        confirmation: "No",
        explanation: "If price consolidates and stays flat, the trade remains open. Time decay or carrying fees should be considered depending on the market instrument."
      };

      riskNote = "Position sizing is the most critical risk control. Even a strategy with a 90% win-rate can trigger capital ruin if position sizes are too large during a drawdown sequence.";
      
      beginnerExplanation = "Risk planning ensures that no single trade can ruin your account. By setting entry, stop-loss, and position size beforehand, you remove emotions and manage expectancy mathematically.";

      overlays = [
        { type: 'horizontal_line', price: activeEntry, color: '#3b82f6', label: 'Risk Entry' },
        { type: 'horizontal_line', price: activeStop, color: '#ef4444', label: 'Risk Stop' },
        { type: 'horizontal_line', price: activeTarget, color: '#10b981', label: 'Risk Target' }
      ];

      videoSteps = [
        {
          title: "Allocate Capital Base",
          narration: `We begin with your capital base of $${activeCapital.toLocaleString()} and risk setting of ${activeRiskPercent}%.`,
          target: { type: 'chart' }
        },
        {
          title: "Locate Trade Boundaries",
          narration: `Entry is planned at $${activeEntry.toFixed(2)} with stop-loss at $${activeStop.toFixed(2)} and target at $${activeTarget.toFixed(2)}.`,
          target: { type: 'price', value: activeEntry }
        },
        {
          title: "Calculate Size & Expectancy",
          narration: `This returns a recommended position size of ${units.toFixed(2)} units and a Risk-Reward ratio of 1 to ${rrRatio.toFixed(2)}.`,
          target: { type: 'chart' }
        }
      ];
    }

  // 12. SENTIMENT & MACRO TOOLS
  } else if (isSentimentTool) {
    selectedToolReading = "This tool requires external market/news data connection before accurate analysis.";
    mainObservation = "This tool requires external market/news data connection before accurate analysis.";
    marketStructure = "Sentiment indicators depend on live social media keyword indexing, derivatives flows, or macroeconomic calendar feeds.";
    keyWatchZones = "Required connections: API News Wire feeds, Fear & Greed indices, or regional Exchange Net Flow (FII/DII) data tables.";
    whatToWatch = "Check external calendar dates or news feeds for macro catalyst releases (such as CPI, interest rates, or earnings reports) before evaluating price direction.";
    
    upsideCase = { clarity: "Low", risk: "Low", confirmation: "Yes", explanation: "Upside scenario requires active news feed sentiment indexing." };
    downsideCase = { clarity: "Low", risk: "Low", confirmation: "Yes", explanation: "Downside scenario requires active news feed sentiment indexing." };
    sidewaysCase = { clarity: "Low", risk: "Low", confirmation: "No", explanation: "Sideways range sentiment requires active news feed indexing." };
    
    riskNote = "Sentiment is highly volatile and shifts rapidly during major news events. Technical charts reflect sentiment changes in retrospect, so caution is needed.";
    beginnerExplanation = "Sentiment tools measure the mood of the market. They check if traders are overly greedy (buying bubble tops) or overly fearful (selling bubble bottoms), which helps identify macro peaks and troughs.";
    overlays = [];
    videoSteps = [
      {
        title: "Connection Required",
        narration: "This sentiment tool requires active external API connections to read macro sentiment feeds.",
        target: { type: 'chart' }
      }
    ];

  // 13. ADVANCED SMART MONEY CONCEPTS
  } else if (isAdvancedSMCTool) {
    // Basic FVG/OB detection
    let basicDetection = "";
    let detectedPrice = null;
    let overlayType = "";
    
    if (selectedTool === 'fair_value_gaps' && candles.length >= 3) {
      for (let i = candles.length - 1; i >= 2; i--) {
        if (candles[i].low > candles[i - 2].high && (candles[i - 1].close > candles[i - 1].open * 1.01)) {
          detectedPrice = (candles[i].low + candles[i - 2].high) / 2;
          basicDetection = `A basic Bullish Fair Value Gap (FVG) is detected in the candle series between high ${candles[i - 2].high.toFixed(2)} and low ${candles[i].low.toFixed(2)}. `;
          overlayType = "fvg";
          break;
        }
      }
    } else if ((selectedTool === 'order_blocks' || selectedTool === 'order_blocks_smc') && candles.length >= 5) {
      for (let i = candles.length - 4; i >= 1; i--) {
        if (
          candles[i].close < candles[i].open &&
          candles[i + 1].close > candles[i + 1].open &&
          candles[i + 2].close > candles[i + 2].open &&
          candles[i + 3].close > candles[i + 3].open
        ) {
          detectedPrice = candles[i].low;
          basicDetection = `A basic Bullish Order Block (OB) demand zone is identified at the swing low of candle ${candles[i].low.toFixed(2)}. `;
          overlayType = "ob";
          break;
        }
      }
    }

    selectedToolReading = `${basicDetection}This advanced tool needs deeper market-structure logic before reliable analysis. Standard SMC algorithms require high-frequency tick data, orderbook depth mapping, and complex liquidity sweeping logic.`;
    mainObservation = `This advanced tool needs deeper market-structure logic before reliable analysis. Standard SMC readings are displayed in educational demo mode.`;
    marketStructure = `Under educational SMC rules, we identify key institutional supply and demand zones based on imbalance blocks. Current price is at ${currentPrice.toFixed(2)}.`;
    keyWatchZones = detectedPrice 
      ? `Detected Zone Midpoint: ${detectedPrice.toFixed(2)} | Nearest support floor: ${nearestSupport.toFixed(2)}`
      : `Nearest support floor: ${nearestSupport.toFixed(2)} | Nearest resistance ceiling: ${nearestResistance.toFixed(2)}`;
    whatToWatch = "Watch for price pulling back to fill the fair value gap or retesting the order block structure on expanding buying volume, which confirms institutional defense.";

    upsideCase = {
      clarity: "Low",
      risk: "Medium",
      confirmation: "Yes",
      explanation: "Upside continuation scenario is supported if price defends the detected block and breaks structure to make a higher high."
    };
    
    downsideCase = {
      clarity: "Low",
      risk: "High",
      confirmation: "Yes",
      explanation: `A downside invalidation is triggered if price breaches the order block or fair value gap zone, leading to a test of support floor at ${nearestSupport.toFixed(2)}.`
    };
    
    sidewaysCase = {
      clarity: "Low",
      risk: "Low",
      confirmation: "No",
      explanation: "Price remains consolidative, consolidating in front of the imbalance block before deciding structural direction."
    };

    riskNote = "Smart Money Concepts and order block zones are theoretical and prone to failure if orderbook liquidity sweeps occur. Do not trade them blindly without order flow tools.";
    
    beginnerExplanation = "Smart Money Concepts analyze where big institutions place their buy and sell orders. A Fair Value Gap is an imbalance where price moved so fast that it left orders unfilled, which acts like a magnet for price to return and fill.";

    overlays = [];
    if (detectedPrice) {
      overlays.push({
        type: 'horizontal_line',
        price: detectedPrice,
        color: overlayType === 'ob' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(168, 85, 247, 0.5)',
        label: overlayType === 'ob' ? 'SMC Order Block' : 'SMC Fair Value Gap'
      });
    }

    videoSteps = [
      {
        title: "Imbalance Block Check",
        narration: `We run an SMC sweep on ${selectedSymbol}. Price stands at ${currentPrice.toFixed(2)}.`,
        target: { type: 'chart' }
      },
      {
        title: "Analyze Zone Logic",
        narration: basicDetection || "We evaluate liquidity sweep points and structure pivots.",
        target: { type: 'chart' }
      },
      {
        title: "Advanced Calibration Warning",
        narration: "Standard institutional SMC mapping requires deep orderbook data connection.",
        target: { type: 'chart' }
      }
    ];

  // DEFAULT FALLBACK
  } else {
    selectedToolReading = "This indicator requires extended historical datasets and real-time market feeds before reliable analysis.";
    mainObservation = "This indicator requires extended historical datasets and real-time market feeds before reliable analysis.";
    marketStructure = `Standard Educational Theory Mode. The tool is analyzing the historical price points relative to the current price at ${currentPrice.toFixed(2)}.`;
    keyWatchZones = `Support Floor: ${nearestSupport.toFixed(2)} | Resistance Ceiling: ${nearestResistance.toFixed(2)}`;
    whatToWatch = "Watch for horizontal swing extremes. When price reaches these zones, combine the tool reading with RSI and volume markers to verify if the zone holds.";

    upsideCase = {
      clarity: "Low",
      risk: "Medium",
      confirmation: "Yes",
      explanation: `Upside scenario requires closing candles above the resistance ceiling at ${nearestResistance.toFixed(2)} on high volume.`
    };
    
    downsideCase = {
      clarity: "Low",
      risk: "Medium",
      confirmation: "Yes",
      explanation: `Downside continuation is expected if price breaches the support floor at ${nearestSupport.toFixed(2)}.`
    };
    
    sidewaysCase = {
      clarity: "High",
      risk: "Low",
      confirmation: "No",
      explanation: "Expect price to consolidate sideways inside the swing channel bounds if no macro catalyst is present."
    };

    riskNote = "This technical tool requires secondary validation and should not be used as a standalone indicator.";
    
    beginnerExplanation = "This technical tool is designed to highlight trend directions or volatility zones. Study how it reacts to horizontal swing floors and ceilings.";
    
    overlays = [
      { type: 'horizontal_line', price: nearestSupport, color: '#10b981', label: 'Support Floor' },
      { type: 'horizontal_line', price: nearestResistance, color: '#ef4444', label: 'Resistance Ceiling' }
    ];

    videoSteps = [
      {
        title: "Setup Context",
        narration: `Analyzing ${selectedSymbol} using the ${selectedTool.toUpperCase()} tool. Price stands at ${currentPrice.toFixed(2)}.`,
        target: { type: 'price', value: currentPrice }
      },
      {
        title: "S/R Framework",
        narration: `Nearest major support is at ${nearestSupport.toFixed(2)} and resistance is at ${nearestResistance.toFixed(2)}.`,
        target: { type: 'price', value: nearestSupport }
      },
      {
        title: "Extended Data Warning",
        narration: `This indicator requires extended historical datasets and live data feed connections.`,
        target: { type: 'chart' }
      }
    ];
  }

  // Common details for all tools
  return {
    mainObservation,
    marketStructure,
    selectedToolReading,
    keyWatchZones,
    whatToWatch,
    upsideCase,
    downsideCase,
    sidewaysCase,
    riskNote,
    beginnerExplanation,
    overlays,
    videoSteps
  };
}
