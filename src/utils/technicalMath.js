/**
 * Technical Math Helpers for MarketPilot AI
 * Calculates exact technical indicators from OHLCV candle arrays.
 */

export function calculateSMA(candles, period = 20) {
  const result = [];
  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) {
      result.push(null);
      continue;
    }
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += candles[i - j].close;
    }
    result.push(sum / period);
  }
  return result;
}

export function calculateEMA(candles, period = 20) {
  const result = [];
  if (candles.length === 0) return result;
  
  const k = 2 / (period + 1);
  let ema = candles[0].close;
  result.push(ema);
  
  for (let i = 1; i < candles.length; i++) {
    ema = candles[i].close * k + ema * (1 - k);
    result.push(ema);
  }
  return result;
}

export function calculateRSI(candles, period = 14) {
  const result = [];
  if (candles.length < period) return Array(candles.length).fill(null);
  
  let gains = [];
  let losses = [];
  
  for (let i = 1; i < candles.length; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    if (diff >= 0) {
      gains.push(diff);
      losses.push(0);
    } else {
      gains.push(0);
      losses.push(Math.abs(diff));
    }
  }
  
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
  
  for (let i = 0; i < period; i++) {
    result.push(null);
  }
  
  let firstRsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  result.push(firstRsi);
  
  for (let i = period + 1; i < candles.length; i++) {
    const gain = gains[i - 1];
    const loss = losses[i - 1];
    
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    
    const rsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
    result.push(rsi);
  }
  
  return result;
}

export function calculateMACD(candles) {
  const ema12 = calculateEMA(candles, 12);
  const ema26 = calculateEMA(candles, 26);
  
  const macdLine = [];
  for (let i = 0; i < candles.length; i++) {
    macdLine.push(ema12[i] - ema26[i]);
  }
  
  const signalLine = [];
  const k = 2 / (9 + 1);
  let emaSignal = macdLine[0] || 0;
  signalLine.push(emaSignal);
  
  for (let i = 1; i < macdLine.length; i++) {
    emaSignal = macdLine[i] * k + emaSignal * (1 - k);
    signalLine.push(emaSignal);
  }
  
  const histogram = [];
  for (let i = 0; i < candles.length; i++) {
    histogram.push(macdLine[i] - signalLine[i]);
  }
  
  return { macdLine, signalLine, histogram };
}

export function calculateBollingerBands(candles, period = 20, multiplier = 2) {
  const middle = calculateSMA(candles, period);
  const upper = [];
  const lower = [];
  
  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) {
      upper.push(null);
      lower.push(null);
      continue;
    }
    
    let sumSquares = 0;
    const mid = middle[i];
    for (let j = 0; j < period; j++) {
      const diff = candles[i - j].close - mid;
      sumSquares += diff * diff;
    }
    const stdDev = Math.sqrt(sumSquares / period);
    
    upper.push(mid + multiplier * stdDev);
    lower.push(mid - multiplier * stdDev);
  }
  
  return { upper, middle, lower };
}

export function detectSupportResistance(candles, lookback = 6) {
  const highs = [];
  const lows = [];
  
  for (let i = lookback; i < candles.length - lookback; i++) {
    let isHigh = true;
    let isLow = true;
    for (let j = 1; j <= lookback; j++) {
      if (candles[i].high < candles[i - j].high || candles[i].high < candles[i + j].high) {
        isHigh = false;
      }
      if (candles[i].low > candles[i - j].low || candles[i].low > candles[i + j].low) {
        isLow = false;
      }
    }
    if (isHigh) highs.push({ price: candles[i].high, index: i });
    if (isLow) lows.push({ price: candles[i].low, index: i });
  }
  
  const currentPrice = candles[candles.length - 1].close;
  const tolerance = currentPrice * 0.007; // 0.7% grouping range
  
  const allLevels = [
    ...highs.map(h => ({ type: 'resistance', price: h.price })),
    ...lows.map(l => ({ type: 'support', price: l.price }))
  ];
  allLevels.sort((a, b) => a.price - b.price);
  
  const groupedLevels = [];
  for (const lvl of allLevels) {
    if (groupedLevels.length === 0) {
      groupedLevels.push(lvl);
    } else {
      const last = groupedLevels[groupedLevels.length - 1];
      if (Math.abs(lvl.price - last.price) < tolerance) {
        last.price = (last.price + lvl.price) / 2;
        if (last.type !== lvl.type) {
          last.type = 'key_zone';
        }
      } else {
        groupedLevels.push(lvl);
      }
    }
  }
  
  const support = groupedLevels
    .filter(l => l.price < currentPrice)
    .map(l => l.price)
    .sort((a, b) => b - a); // Nearest support first
    
  const resistance = groupedLevels
    .filter(l => l.price > currentPrice)
    .map(l => l.price)
    .sort((a, b) => a - b); // Nearest resistance first
  
  return { support, resistance, allLevels: groupedLevels };
}

export function detectTrendline(candles, lookback = 8) {
  const swingLows = [];
  const swingHighs = [];
  
  for (let i = lookback; i < candles.length - lookback; i++) {
    let isHigh = true;
    let isLow = true;
    for (let j = 1; j <= lookback; j++) {
      if (candles[i].high < candles[i - j].high || candles[i].high < candles[i + j].high) isHigh = false;
      if (candles[i].low > candles[i - j].low || candles[i].low > candles[i + j].low) isLow = false;
    }
    if (isLow) swingLows.push({ index: i, price: candles[i].low, time: candles[i].time });
    if (isHigh) swingHighs.push({ index: i, price: candles[i].high, time: candles[i].time });
  }
  
  let supportLine = null;
  if (swingLows.length >= 2) {
    const p2 = swingLows[swingLows.length - 1];
    const p1 = swingLows[swingLows.length - 2];
    const slope = (p2.price - p1.price) / (p2.index - p1.index);
    supportLine = {
      p1: { time: p1.time, price: p1.price },
      p2: { time: p2.time, price: p2.price },
      slope,
      type: slope > 0 ? 'ascending' : 'descending'
    };
  }
  
  let resistanceLine = null;
  if (swingHighs.length >= 2) {
    const p2 = swingHighs[swingHighs.length - 1];
    const p1 = swingHighs[swingHighs.length - 2];
    const slope = (p2.price - p1.price) / (p2.index - p1.index);
    resistanceLine = {
      p1: { time: p1.time, price: p1.price },
      p2: { time: p2.time, price: p2.price },
      slope,
      type: slope > 0 ? 'ascending' : 'descending'
    };
  }
  
  return { supportLine, resistanceLine };
}

export function detectCandlestickPatterns(candles) {
  if (candles.length < 3) return "Undetermined structure";
  
  const last = candles[candles.length - 1];
  const prev = candles[candles.length - 2];
  
  const body = Math.abs(last.close - last.open);
  const totalRange = last.high - last.low;
  const upperWick = last.high - Math.max(last.open, last.close);
  const lowerWick = Math.min(last.open, last.close) - last.low;
  
  // Hammer pattern detection
  if (lowerWick > body * 2 && upperWick < body * 0.5 && body > 0) {
    return "Potential Hammer Pattern (Simulated support reaction)";
  }
  
  // Shooting star pattern detection
  if (upperWick > body * 2 && lowerWick < body * 0.5 && body > 0) {
    return "Potential Shooting Star Pattern (Simulated resistance reaction)";
  }
  
  // Engulfing pattern
  const prevBody = Math.abs(prev.close - prev.open);
  if (body > prevBody) {
    if (last.close > last.open && prev.close < prev.open) {
      return "Bullish Engulfing Pattern (Upside momentum indicator)";
    }
    if (last.close < last.open && prev.close > prev.open) {
      return "Bearish Engulfing Pattern (Downside pressure indicator)";
    }
  }
  
  // Doji
  if (body <= totalRange * 0.1) {
    return "Doji Candlestick (Market indecision zone)";
  }
  
  return last.close > last.open ? "Bullish Candle Structure" : "Bearish Candle Structure";
}
