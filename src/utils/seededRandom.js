/**
 * Seeded pseudo-random number generator (Mulberry32)
 */
export function createSeededRandom(seedString) {
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    const char = seedString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  
  let seed = Math.abs(hash) || 123456789;
  
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Get base market parameters based on symbol
 */
function getMarketParams(symbol) {
  const s = symbol.toUpperCase();
  if (s.includes('BTC')) return { price: 67250, vol: 0.006, type: 'crypto', dec: 2 };
  if (s.includes('ETH')) return { price: 3450, vol: 0.008, type: 'crypto', dec: 2 };
  if (s.includes('SOL')) return { price: 168.4, vol: 0.015, type: 'crypto', dec: 2 };
  if (s.includes('XAU') || s.includes('GOLD')) return { price: 2342.6, vol: 0.003, type: 'commodity', dec: 2 };
  if (s.includes('EUR') || s.includes('USD')) return { price: 1.0845, vol: 0.0012, type: 'forex', dec: 5 };
  if (s.includes('NIFTY') && s.includes('BANK')) return { price: 47820, vol: 0.005, type: 'index', dec: 1 };
  if (s.includes('NIFTY')) return { price: 22450, vol: 0.004, type: 'index', dec: 1 };
  if (s.includes('US100') || s.includes('NAS')) return { price: 18640, vol: 0.005, type: 'index', dec: 1 };
  
  // Default fallback for custom symbol
  let charSum = 0;
  for (let i = 0; i < s.length; i++) charSum += s.charCodeAt(i);
  const price = (charSum % 850) + 50;
  return { price, vol: 0.008, type: 'equity', dec: 2 };
}

/**
 * Convert timeframe string to milliseconds/seconds representation for date stepping
 */
function getTimeframeStepSeconds(timeframe) {
  const num = parseInt(timeframe);
  const unitRaw = timeframe.replace(num, '');
  const unit = unitRaw.trim();
  
  if (unit === 'm') return num * 60;
  if (unit === 'M' || unit === 'mo' || unit === 'Mo') return num * 86400 * 30;
  
  const lowerUnit = unit.toLowerCase();
  if (lowerUnit === 'h') return num * 3600;
  if (lowerUnit === 'd') return num * 86400;
  if (lowerUnit === 'w') return num * 86400 * 7;
  return 86400; // default to 1 day
}

/**
 * Generate historical candle data deterministically
 */
export function generateSeededCandles(symbol, timeframe, count = 150) {
  const seedString = `${symbol.toUpperCase()}_${timeframe.toLowerCase()}`;
  const random = createSeededRandom(seedString);
  const params = getMarketParams(symbol);
  
  const stepSeconds = getTimeframeStepSeconds(timeframe);
  let currentPrice = params.price;
  let currentTime = Math.floor(Date.now() / 1000) - (count * stepSeconds);
  
  const candles = [];
  let maPeriod = 20; // tracking simulated trend
  let trendDirection = random() > 0.5 ? 1 : -1;
  let trendDuration = Math.floor(random() * 20) + 10;
  
  for (let i = 0; i < count; i++) {
    // Determine trend change
    if (trendDuration <= 0) {
      trendDirection = random() > 0.4 ? (trendDirection * -1) : trendDirection;
      trendDuration = Math.floor(random() * 25) + 8;
    }
    trendDuration--;
    
    // Seeded random walk
    const changePercent = (random() * params.vol * trendDirection) + ((random() - 0.5) * params.vol);
    const open = parseFloat(currentPrice.toFixed(params.dec));
    currentPrice = currentPrice * (1 + changePercent);
    const close = parseFloat(currentPrice.toFixed(params.dec));
    
    // High and low
    const maxVal = Math.max(open, close);
    const minVal = Math.min(open, close);
    
    const wickHighFactor = random() * params.vol * 0.8;
    const wickLowFactor = random() * params.vol * 0.8;
    
    const high = parseFloat((maxVal * (1 + wickHighFactor)).toFixed(params.dec));
    const low = parseFloat((minVal * (1 - wickLowFactor)).toFixed(params.dec));
    
    // Volume calculation
    const volumeMultiplier = (random() * 1.5) + (Math.abs(changePercent) / params.vol * 1.2);
    const baseVolume = params.type === 'crypto' ? 1200 : params.type === 'forex' ? 8500 : 145000;
    const volume = Math.floor(baseVolume * volumeMultiplier);
    
    candles.push({
      time: currentTime,
      open,
      high,
      low,
      close,
      volume
    });
    
    currentTime += stepSeconds;
  }
  
  return {
    candles,
    decimals: params.dec,
    type: params.type,
    volatility: params.vol
  };
}

/**
 * Fetch real-time crypto candles from Binance public API
 */
export async function fetchLiveCandles(symbol, timeframe, count = 150) {
  const marketMode = (import.meta.env.VITE_MARKET_DATA_MODE || 'demo').trim().toLowerCase();
  const binanceKey = import.meta.env.VITE_BINANCE_API_KEY;

  if (marketMode === 'demo' || !binanceKey || !binanceKey.trim()) {
    throw new Error('Running in demo feed mode');
  }

  const s = symbol.toUpperCase().replace('/', '');
  let tf = timeframe;
  if (timeframe === '1D') tf = '1d';
  if (timeframe === '1W') tf = '1w';
  if (timeframe === '1M') tf = '1M';
  
  const supportedCrypto = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];
  if (!supportedCrypto.includes(s)) {
    throw new Error('Asset is not supported on Binance public live feed');
  }
  
  const url = `https://api.binance.com/api/v3/klines?symbol=${s}&interval=${tf}&limit=${count}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Binance feed rate limit or network issue');
  }
  const data = await response.json();
  
  return data.map(item => ({
    time: Math.floor(item[0] / 1000),
    open: parseFloat(item[1]),
    high: parseFloat(item[2]),
    low: parseFloat(item[3]),
    close: parseFloat(item[4]),
    volume: parseFloat(item[5])
  }));
}
