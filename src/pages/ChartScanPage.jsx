import { useState, useEffect, useRef } from 'react';
import VideoBreakdown from '../components/VideoBreakdown/VideoBreakdown';
import { Download, RefreshCw, Star, Upload, Target, ShieldAlert, Sparkles, CheckCircle2, ChevronRight, X, AlertTriangle, MonitorPlay, Radar, Zap, Maximize2, Play, Pause, VolumeX, Volume2, Square, RotateCcw } from 'lucide-react';
import Button from '../components/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import Badge from '../components/Badge';
import ChartContainer from '../components/ChartContainer';
import { DEFAULT_WATCHLIST } from '../data/watchlist';
import { getToolFromRegistry } from '../analysis/toolEngineRegistry';
import { generateSeededCandles } from '../utils/seededRandom';
import { marketDataProvider, checkApiStatus, toBinanceSymbol, toBinanceInterval } from '../services/marketDataProvider';
import { TOOLS_DIRECTORY } from '../data/toolsDirectory';

/**
 * Detect market category type based on symbol nomenclature
 */
function detectMarketTypeFromSymbol(symbol) {
  if (!symbol) return null;
  const clean = symbol.toUpperCase().replace('/', '').trim();
  
  // 1. Forex pairs: typical 6-letter currency codes
  const forexPairs = ['EURUSD', 'GBPUSD', 'AUDUSD', 'NZDUSD', 'USDCAD', 'USDCHF', 'USDJPY', 'EURGBP', 'EURJPY', 'GBPJPY'];
  if (forexPairs.includes(clean)) return 'forex';
  if (clean.length === 6 && /^[A-Z]{6}$/.test(clean)) {
    const isCryptoWord = clean.startsWith('BTC') || clean.startsWith('ETH') || clean.startsWith('SOL') || clean.startsWith('BNB') || clean.startsWith('XRP') || clean.startsWith('ADA') || clean.startsWith('DOT') || clean.startsWith('DOGE') || clean.endsWith('USDT');
    if (!isCryptoWord) {
      return 'forex';
    }
  }

  // 2. Crypto symbols
  const cryptoPairs = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'DOGEUSDT', 'ADAUSDT', 'AVAXUSDT', 'DOTUSDT', 'MATICUSDT'];
  if (cryptoPairs.includes(clean) || clean.endsWith('USDT') || clean.startsWith('BTC') || clean.startsWith('ETH') || clean.startsWith('SOL') || clean.startsWith('BNB')) {
    return 'crypto';
  }

  // 3. Commodities
  const commodities = ['XAUUSD', 'XAGUSD', 'USOIL', 'UKOIL', 'NATGAS'];
  if (commodities.includes(clean)) return 'commodity';

  // 4. Indices
  const indices = ['NIFTY', 'BANKNIFTY', 'SENSEX', 'US100', 'US30', 'US500', 'SPX', 'IXIC', 'DJI', 'DAX40'];
  if (indices.includes(clean)) return 'index';

  // 5. Short tickers default to stock
  if (clean.length >= 2 && clean.length <= 5 && /^[A-Z]+$/.test(clean)) {
    return 'stock';
  }

  return null;
}

export default function ChartScanPage({
  selectedSymbol,
  setSelectedSymbol,
  selectedTimeframe,
  setSelectedTimeframe,
  selectedTool,
  setSelectedTool,
  onSwitchToChat, // Callback to switch active section to chat
  onSwitchToDirectory // Callback to switch active section to directory
}) {
  // UI states
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem('mp_watchlist');
    let list = saved ? JSON.parse(saved) : DEFAULT_WATCHLIST;

    // Ensure all default watchlist items are present in the list
    let listUpdated = false;
    DEFAULT_WATCHLIST.forEach(defaultItem => {
      const exists = list.some(item => item.symbol === defaultItem.symbol);
      if (!exists) {
        list.push(defaultItem);
        listUpdated = true;
      }
    });
    
    // Defensive coding: sanitize and convert BNB/USD or other crypto USD pairs to USDT
    let changed = false;
    list = list.map(item => {
      if (item.marketType === 'crypto') {
        const cleanSymbol = item.symbol.toUpperCase().trim();
        if (cleanSymbol === 'BNB/USD' || cleanSymbol === 'BNBUSD') {
          changed = true;
          return { ...item, symbol: 'BNB/USDT', price: '585.50' };
        }
        if (cleanSymbol === 'BTC/USD' || cleanSymbol === 'BTCUSD') {
          changed = true;
          return { ...item, symbol: 'BTC/USDT', price: '67,250.00' };
        }
        if (cleanSymbol === 'ETH/USD' || cleanSymbol === 'ETHUSD') {
          changed = true;
          return { ...item, symbol: 'ETH/USDT', price: '3,450.25' };
        }
        if (cleanSymbol === 'SOL/USD' || cleanSymbol === 'SOLUSD') {
          changed = true;
          return { ...item, symbol: 'SOL/USDT', price: '168.40' };
        }
        if (cleanSymbol === 'XRP/USD' || cleanSymbol === 'XRPUSD') {
          changed = true;
          return { ...item, symbol: 'XRP/USDT', price: '0.5240' };
        }
        if (cleanSymbol === 'DOGE/USD' || cleanSymbol === 'DOGEUSD') {
          changed = true;
          return { ...item, symbol: 'DOGE/USDT', price: '0.1420' };
        }
        if (cleanSymbol === 'ADA/USD' || cleanSymbol === 'ADAUSD') {
          changed = true;
          return { ...item, symbol: 'ADA/USDT', price: '0.4650' };
        }
        if (cleanSymbol === 'AVAX/USD' || cleanSymbol === 'AVAXUSD') {
          changed = true;
          return { ...item, symbol: 'AVAX/USDT', price: '36.20' };
        }
        if (cleanSymbol === 'DOT/USD' || cleanSymbol === 'DOTUSD') {
          changed = true;
          return { ...item, symbol: 'DOT/USDT', price: '6.80' };
        }
        if (cleanSymbol === 'MATIC/USD' || cleanSymbol === 'MATICUSD') {
          changed = true;
          return { ...item, symbol: 'MATIC/USDT', price: '0.7200' };
        }
      }
      return item;
    });

    if (changed || listUpdated) {
      localStorage.setItem('mp_watchlist', JSON.stringify(list));
    }
    return list;
  });
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('mp_favorites');
    return saved ? JSON.parse(saved) : ['BTC/USDT', 'ETH/USDT', 'XAUUSD'];
  });
  const [customSymbol, setCustomSymbol] = useState('');
  const [customMarketType, setCustomMarketType] = useState('crypto');
  const [selectedCategory, setSelectedCategory] = useState('crypto');

  // Chart Source State (live or screenshot)
  const [chartSource, setChartSource] = useState(() => {
    return localStorage.getItem('mp_chart_source') || 'live';
  });
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  
  // Calibration Modal
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationData, setCalibrationData] = useState({
    symbol: 'CUSTOM',
    marketType: 'crypto',
    timeframe: '1h',
    tool: 'rsi',
    note: ''
  });
  
  // Active state candles (live)
  const [candles, setCandles] = useState([]);
  
  // Analysis states & Frozen Snapshots
  const [analysisResult, setAnalysisResult] = useState(null);
  const [activeAnalysisSnapshot, setActiveAnalysisSnapshot] = useState(() => {
    const saved = localStorage.getItem('mp_active_analysis');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeChartSnapshot, setActiveChartSnapshot] = useState(() => {
    const saved = localStorage.getItem('mp_active_candles');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeSymbolSnapshot, setActiveSymbolSnapshot] = useState(() => {
    return localStorage.getItem('mp_active_symbol') || '';
  });
  const [activeTimeframeSnapshot, setActiveTimeframeSnapshot] = useState(() => {
    return localStorage.getItem('mp_active_timeframe') || '';
  });
  const [activeToolSnapshot, setActiveToolSnapshot] = useState(() => {
    return localStorage.getItem('mp_active_tool') || '';
  });
  const [activeMarketTypeSnapshot, setActiveMarketTypeSnapshot] = useState(() => {
    return localStorage.getItem('mp_active_market_type') || 'crypto';
  });
  const [feedStatus, setFeedStatus] = useState({
    mode: 'demo',
    message: 'Demo Feed — simulated educational data.',
    isLive: false,
    error: null
  });
  const [isStale, setIsStale] = useState(false);

  // References and new premium control states
  const resultsRef = useRef(null);
  const [isFullViewOpen, setIsFullViewOpen] = useState(false);
  const [scrollMessage, setScrollMessage] = useState('');
  const [scanState, setScanState] = useState(() => {
    const saved = localStorage.getItem('mp_active_analysis');
    return saved ? 'completed' : 'idle';
  });
  const [isWatchlistCollapsed, setIsWatchlistCollapsed] = useState(false);
  const [isAiPanelCollapsed, setIsAiPanelCollapsed] = useState(false);

  // Collapse Right AI Panel on narrow screens by default
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1280) {
      setIsAiPanelCollapsed(true);
    }
  }, []);

  // Redirection alert message check on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const msg = window.localStorage.getItem('mp_selected_tool_message');
      if (msg) {
        setScrollMessage(msg);
        window.localStorage.removeItem('mp_selected_tool_message');
      }
    }
  }, []);

  // Lesson Video Player Modal State
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [videoStepIdx, setVideoStepIdx] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [lessonHighlights, setLessonHighlights] = useState([]);

  // Locked market state — for non-crypto markets with no API key
  const [lockedMarket, setLockedMarket] = useState(null);
  // { market, requiresKey, feedLabel }

  // Generate/fetch candles on symbol, timeframe, or feed mode shift
  useEffect(() => {
    let active = true;

    if (chartSource === 'live') {
      const currentItem = watchlist.find(w => w.symbol === selectedSymbol);
      const currentMarketType = currentItem ? currentItem.marketType : 'crypto';

      // --- FIX: Block non-crypto markets with no API key from showing random demo data ---
      const isNonCrypto = currentMarketType !== 'crypto';
      const hasTwelveDataKey = !!import.meta.env.VITE_TWELVEDATA_API_KEY;
      const hasAlphaVantageKey = !!import.meta.env.VITE_ALPHAVANTAGE_API_KEY;
      const hasFinnhubKey = !!import.meta.env.VITE_FINNHUB_API_KEY;
      const hasPolygonKey = !!import.meta.env.VITE_POLYGON_API_KEY;
      const hasAnyNonCryptoKey = hasTwelveDataKey || hasAlphaVantageKey || hasFinnhubKey || hasPolygonKey;

      if (isNonCrypto && !hasAnyNonCryptoKey) {
        // Locked: do NOT seed demo candles, do NOT call any provider
        const requiresKey = 'VITE_TWELVEDATA_API_KEY';
        const marketLabels = { forex: 'Forex', stocks: 'Stocks', indices: 'Indices', commodities: 'Commodities', etfs: 'ETFs' };
        const marketLabel = marketLabels[currentMarketType] || currentMarketType.toUpperCase();
        setLockedMarket({ market: currentMarketType, marketLabel, requiresKey });
        setCandles([]);
        setFeedStatus({
          mode: 'locked',
          message: `${marketLabel} — API Key Required`,
          isLive: false,
          error: `${marketLabel} charts require a market data provider API key.`,
          warning: null
        });
        return () => { active = false; };
      }

      // Not locked — clear any previous lock and proceed normally
      setLockedMarket(null);

      // Seed demo data instantly so chart never flashes empty (crypto only)
      const localData = generateSeededCandles(selectedSymbol, selectedTimeframe);
      setCandles(localData.candles);

      marketDataProvider({
        symbol: selectedSymbol,
        timeframe: selectedTimeframe,
        marketType: currentMarketType,
        mode: import.meta.env.VITE_MARKET_DATA_MODE || 'demo'
      }).then((res) => {
        if (active) {
          setCandles(res.candles);
          setFeedStatus({
            mode: res.mode,
            message: res.message,
            isLive: res.isLive,
            error: res.error || null,
            warning: res.warning || null
          });
        }
      });
    } else {
      setLockedMarket(null);
      const localData = generateSeededCandles(selectedSymbol, selectedTimeframe);
      setCandles(localData.candles);
      setFeedStatus({
        mode: 'screenshot',
        message: 'Screenshot Mode',
        isLive: false,
        error: null,
        warning: null
      });
    }

    return () => {
      active = false;
    };
  }, [selectedSymbol, selectedTimeframe, chartSource]);

  // Keep a ref to activeAnalysisSnapshot to prevent stale closures and unnecessary reconnects
  const activeAnalysisSnapshotRef = useRef(activeAnalysisSnapshot);
  useEffect(() => {
    activeAnalysisSnapshotRef.current = activeAnalysisSnapshot;
  }, [activeAnalysisSnapshot]);

  // Binance WebSocket live updates for crypto only
  useEffect(() => {
    const currentItem = watchlist.find(w => w.symbol === selectedSymbol);
    const currentMarketType = currentItem ? currentItem.marketType : 'crypto';
    const binanceSymbol = toBinanceSymbol(selectedSymbol);
    const binanceInterval = toBinanceInterval(selectedTimeframe);

    const shouldConnect = 
      chartSource === 'live' && 
      feedStatus.mode === 'binance' && 
      currentMarketType === 'crypto' && 
      binanceSymbol && 
      binanceInterval;

    if (!shouldConnect) {
      return;
    }

    let ws = null;
    let reconnectCount = 0;
    const maxReconnects = 3;
    let reconnectTimeoutId = null;
    let isCleanup = false;

    function connect() {
      if (isCleanup) return;

      const wsSymbol = binanceSymbol.toLowerCase();
      const wsInterval = binanceInterval;
      const wsUrl = `wss://stream.binance.com:9443/ws/${wsSymbol}@kline_${wsInterval}`;

      if (import.meta.env.DEV) {
        console.log(`[WebSocket] Connecting: symbol=${selectedSymbol}, interval=${selectedTimeframe}, url=${wsUrl}`);
      }

      try {
        ws = new WebSocket(wsUrl);
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('[WebSocket] Instantiation error:', err);
        }
        setFeedStatus(prev => ({
          ...prev,
          message: 'Binance Spot Market Data • Historical',
          error: 'Live update unavailable. Historical Binance candles remain loaded.'
        }));
        return;
      }

      ws.onopen = () => {
        if (isCleanup) {
          ws.close();
          return;
        }
        reconnectCount = 0;
        if (import.meta.env.DEV) {
          console.log(`[WebSocket] Open: symbol=${selectedSymbol}, interval=${selectedTimeframe}`);
        }
        setFeedStatus(prev => ({
          ...prev,
          message: 'Binance Spot Market Data • Live Updating',
          error: null
        }));
      };

      ws.onmessage = (event) => {
        if (isCleanup) return;
        try {
          const message = JSON.parse(event.data);
          if (message && message.k) {
            const kline = message.k;
            const updatedCandle = {
              time: Math.floor(kline.t / 1000),
              open: Number(kline.o),
              high: Number(kline.h),
              low: Number(kline.l),
              close: Number(kline.c),
              volume: Number(kline.v)
            };

            if (import.meta.env.DEV) {
              console.log(`[WebSocket] Candle update: time=${updatedCandle.time}, close=${updatedCandle.close}`);
            }

            setCandles(prevCandles => {
              if (!prevCandles || prevCandles.length === 0) {
                return [updatedCandle];
              }
              const lastCandle = prevCandles[prevCandles.length - 1];
              let newCandles;
              if (updatedCandle.time === lastCandle.time) {
                // Skip update if incoming values are identical
                if (
                  lastCandle.open === updatedCandle.open &&
                  lastCandle.high === updatedCandle.high &&
                  lastCandle.low === updatedCandle.low &&
                  lastCandle.close === updatedCandle.close &&
                  lastCandle.volume === updatedCandle.volume
                ) {
                  return prevCandles;
                }
                newCandles = [...prevCandles.slice(0, -1), updatedCandle];
              } else if (updatedCandle.time > lastCandle.time) {
                newCandles = [...prevCandles, updatedCandle];
                if (newCandles.length > 500) {
                  newCandles = newCandles.slice(newCandles.length - 500);
                }
              } else {
                return prevCandles;
              }

              // Set stale warning if an analysis snapshot is active
              setIsStale(prevIsStale => {
                if (!prevIsStale && activeAnalysisSnapshotRef.current) {
                  return true;
                }
                return prevIsStale;
              });

              return newCandles;
            });
          }
        } catch (err) {
          if (import.meta.env.DEV) {
            console.error('[WebSocket] Msg parse error:', err);
          }
        }
      };

      ws.onerror = (error) => {
        if (isCleanup) return;
        if (import.meta.env.DEV) {
          console.error(`[WebSocket] Error: symbol=${selectedSymbol}, interval=${selectedTimeframe}`, error);
        }
      };

      ws.onclose = (event) => {
        if (isCleanup) return;
        if (import.meta.env.DEV) {
          console.log(`[WebSocket] Close: symbol=${selectedSymbol}, interval=${selectedTimeframe}, code=${event.code}`);
        }

        if (reconnectCount < maxReconnects) {
          reconnectCount++;
          if (import.meta.env.DEV) {
            console.log(`[WebSocket] Reconnecting in 3s (attempt ${reconnectCount}/${maxReconnects})...`);
          }
          reconnectTimeoutId = setTimeout(connect, 3000);
        } else {
          setFeedStatus(prev => ({
            ...prev,
            message: 'Binance Spot Market Data • Historical',
            error: 'Live update unavailable. Historical Binance candles remain loaded.'
          }));
        }
      };
    }

    connect();

    return () => {
      isCleanup = true;
      if (ws) {
        ws.close();
      }
      if (reconnectTimeoutId) {
        clearTimeout(reconnectTimeoutId);
      }
    };
  }, [selectedSymbol, selectedTimeframe, chartSource, feedStatus.mode]);

  // Staleness checking against active snapshot
  useEffect(() => {
    if (activeAnalysisSnapshot) {
      const isSymbolMatch = activeAnalysisSnapshot.symbol === selectedSymbol;
      const isTimeframeMatch = activeAnalysisSnapshot.timeframe === selectedTimeframe;
      const isToolMatch = activeAnalysisSnapshot.toolId === selectedTool;
      const isSourceMatch = activeAnalysisSnapshot.chartSource === chartSource;
      setIsStale(!(isSymbolMatch && isTimeframeMatch && isToolMatch && isSourceMatch));
    } else {
      setIsStale(false);
    }
  }, [selectedSymbol, selectedTimeframe, selectedTool, chartSource, activeAnalysisSnapshot]);

  // Auto-sync selectedSymbol when category changes (and on mount to clean bad state)
  useEffect(() => {
    const currentItem = watchlist.find(w => w.symbol === selectedSymbol);
    let isMatch = false;

    if (currentItem) {
      if (selectedCategory === 'custom') {
        isMatch = currentItem.isCustom === true;
      } else if (selectedCategory === 'commodity') {
        isMatch = (currentItem.marketType === 'commodity' || currentItem.marketType === 'commodities') && !currentItem.isCustom;
      } else if (selectedCategory === 'index') {
        isMatch = (currentItem.marketType === 'index' || currentItem.marketType === 'indices') && !currentItem.isCustom;
      } else if (selectedCategory === 'stock') {
        isMatch = (currentItem.marketType === 'stock' || currentItem.marketType === 'stocks') && !currentItem.isCustom;
      } else {
        isMatch = currentItem.marketType === selectedCategory && !currentItem.isCustom;
      }
    }

    if (!isMatch) {
      // Explicit reset rules if mismatched on load/change
      if (selectedCategory === 'crypto') {
        setSelectedSymbol('BTC/USDT');
      } else if (selectedCategory === 'forex') {
        setSelectedSymbol('EUR/USD');
      } else if (selectedCategory === 'stock') {
        setSelectedSymbol('AAPL');
      } else {
        // Find the first symbol in the new category
        const firstInCat = watchlist.find(row => {
          if (selectedCategory === 'custom') {
            return row.isCustom === true;
          }
          if (selectedCategory === 'commodity') {
            return (row.marketType === 'commodity' || row.marketType === 'commodities') && !row.isCustom;
          }
          if (selectedCategory === 'index') {
            return (row.marketType === 'index' || row.marketType === 'indices') && !row.isCustom;
          }
          if (selectedCategory === 'stock') {
            return (row.marketType === 'stock' || row.marketType === 'stocks') && !row.isCustom;
          }
          return row.marketType === selectedCategory && !row.isCustom;
        });

        if (firstInCat) {
          setSelectedSymbol(firstInCat.symbol);
        }
      }
    }
  }, [selectedCategory, watchlist, selectedSymbol, setSelectedSymbol]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem('mp_symbol', selectedSymbol);
    localStorage.setItem('mp_timeframe', selectedTimeframe);
    localStorage.setItem('mp_tool', selectedTool);
    localStorage.setItem('mp_chart_source', chartSource);
    if (activeAnalysisSnapshot) {
      localStorage.setItem('mp_active_analysis', JSON.stringify(activeAnalysisSnapshot));
    }
    if (activeChartSnapshot) {
      localStorage.setItem('mp_active_candles', JSON.stringify(activeChartSnapshot));
    }
  }, [selectedSymbol, selectedTimeframe, selectedTool, chartSource, activeAnalysisSnapshot, activeChartSnapshot]);

  // Toggle favorites
  const toggleFavorite = (sym) => {
    let updated;
    if (favorites.includes(sym)) {
      updated = favorites.filter(f => f !== sym);
    } else {
      updated = [...favorites, sym];
    }
    setFavorites(updated);
    localStorage.setItem('mp_favorites', JSON.stringify(updated));
  };

  // Add custom symbol
  const handleAddCustomSymbol = (e) => {
    e.preventDefault();
    if (!customSymbol.trim()) return;
    let formattedSymbol = customSymbol.toUpperCase().trim();
    
    // Auto detect symbol type to avoid mismatch
    let detectedType = detectMarketTypeFromSymbol(formattedSymbol);
    let finalMarketType = customMarketType;
    
    if (detectedType && detectedType !== customMarketType) {
      finalMarketType = detectedType;
      setCustomMarketType(detectedType);
    }
    
    // Normalize USD crypto symbols to USDT manually added
    if (finalMarketType === 'crypto') {
      const cleanUpper = formattedSymbol.toUpperCase().trim();
      if (cleanUpper === 'BTC/USD' || cleanUpper === 'BTCUSD') formattedSymbol = 'BTC/USDT';
      else if (cleanUpper === 'ETH/USD' || cleanUpper === 'ETHUSD') formattedSymbol = 'ETH/USDT';
      else if (cleanUpper === 'BNB/USD' || cleanUpper === 'BNBUSD') formattedSymbol = 'BNB/USDT';
      else if (cleanUpper === 'SOL/USD' || cleanUpper === 'SOLUSD') formattedSymbol = 'SOL/USDT';
      else if (cleanUpper === 'XRP/USD' || cleanUpper === 'XRPUSD') formattedSymbol = 'XRP/USDT';
      else if (cleanUpper === 'DOGE/USD' || cleanUpper === 'DOGEUSD') formattedSymbol = 'DOGE/USDT';
      else if (cleanUpper === 'ADA/USD' || cleanUpper === 'ADAUSD') formattedSymbol = 'ADA/USDT';
      else if (cleanUpper === 'AVAX/USD' || cleanUpper === 'AVAXUSD') formattedSymbol = 'AVAX/USDT';
      else if (cleanUpper === 'DOT/USD' || cleanUpper === 'DOTUSD') formattedSymbol = 'DOT/USDT';
      else if (cleanUpper === 'MATIC/USD' || cleanUpper === 'MATICUSD') formattedSymbol = 'MATIC/USDT';
      else if (!formattedSymbol.includes('/')) {
        if (formattedSymbol.endsWith('USDT')) {
          formattedSymbol = formattedSymbol.replace('USDT', '/USDT');
        } else if (formattedSymbol.endsWith('USD')) {
          formattedSymbol = formattedSymbol.replace('USD', '/USDT');
        } else {
          formattedSymbol = `${formattedSymbol}/USDT`;
        }
      } else if (formattedSymbol.endsWith('/USD')) {
        formattedSymbol = formattedSymbol.replace('/USD', '/USDT');
      }
    }
    
    // Check if it already exists
    if (!watchlist.some(w => w.symbol === formattedSymbol)) {
      const newSym = {
        symbol: formattedSymbol,
        marketType: finalMarketType,
        price: finalMarketType === 'crypto' ? '120.00' : finalMarketType === 'forex' ? '1.0825' : '150.00',
        change: '+0.50%',
        isPositive: true,
        isCustom: true // Tag as custom symbol!
      };
      const updatedList = [newSym, ...watchlist];
      setWatchlist(updatedList);
      localStorage.setItem('mp_watchlist', JSON.stringify(updatedList));
    }
    setSelectedSymbol(formattedSymbol);
    setSelectedCategory('custom'); // Shift filter tab to Custom
    setCustomSymbol('');
  };

  // Switch Watchlist Row
  const handleSelectSymbol = (sym, type) => {
    setSelectedSymbol(sym);
  };

  // Upload screenshot
  const handleScreenshotUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setChartSource('screenshot');
      
      // Trigger Calibration setup
      setCalibrationData({
        symbol: selectedSymbol,
        marketType: 'crypto',
        timeframe: selectedTimeframe,
        tool: selectedTool,
        note: ''
      });
      setIsCalibrating(true);
    }
  };

  // Handle Calibration Save
  const saveCalibration = () => {
    setSelectedSymbol(calibrationData.symbol.toUpperCase());
    setSelectedTimeframe(calibrationData.timeframe);
    setSelectedTool(calibrationData.tool);
    setChartSource('screenshot');
    setIsCalibrating(false);
  };  // Run Technical Analysis
  const handleRunAnalysis = () => {
    if (scanState === 'scanning') return;
    const capturedCandles = [...candles];
    setScanState('scanning');
    setScrollMessage('');

    setTimeout(() => {
      const currentWatchlistItem = watchlist.find(w => w.symbol === selectedSymbol);
      const currentMarketType = currentWatchlistItem ? currentWatchlistItem.marketType : 'crypto';
      
      const activeTool = getToolFromRegistry(selectedTool);
      const result = activeTool.analyze(capturedCandles, selectedTimeframe, selectedSymbol, currentMarketType, chartSource);
      
      if (result) {
        const lastCandle = capturedCandles[capturedCandles.length - 1];
        const priceAtScan = lastCandle?.close || 0;

        // Determine provider & feedMode for v2.0 ScanResult
        const isBinanceMode = chartSource !== 'screenshot' && currentMarketType === 'crypto';
        const provider = isBinanceMode ? 'Binance' : (chartSource === 'screenshot' ? 'Screenshot Mode' : 'Demo Feed');
        const feedMode = isBinanceMode ? 'live' : 'demo';

        // Build v2.0-compliant scenario shapes
        const buildScenario = (raw, fallbackTitle) => ({
          title: raw?.title || fallbackTitle,
          description: raw?.explanation || raw?.description || `${fallbackTitle} based on current chart structure.`,
          condition: raw?.condition || 'Key structural levels hold and pattern continues.',
          invalidation: raw?.invalidation || 'Structure breaks and pattern reverses.',
        });

        // Build v2.0 keyWatchZones array
        const srResult = result.overlays
          ? result.overlays
              .filter(o => o.type === 'horizontal_line')
              .map((o, idx) => ({
                label: o.label || (idx % 2 === 0 ? 'Support' : 'Resistance'),
                price: o.price || priceAtScan,
                type: (o.label || '').toLowerCase().includes('support') ? 'support' : 'resistance',
                strength: 'moderate',
                touchCount: 1,
              }))
          : [];
        const keyWatchZonesArr = srResult.length > 0 ? srResult : [
          { label: 'Support Zone', price: priceAtScan * 0.97, type: 'support', strength: 'moderate', touchCount: 1 },
          { label: 'Resistance Zone', price: priceAtScan * 1.03, type: 'resistance', strength: 'moderate', touchCount: 1 },
        ];

        // Build v2.0 metrics array
        const metricsArr = [
          { label: 'Current Price', value: `$${priceAtScan.toFixed(priceAtScan < 1 ? 6 : 2)}`, context: 'Price at scan time', available: true },
          { label: 'Candles', value: `${capturedCandles.length}`, context: 'Candles analyzed', available: true },
          { label: 'Timeframe', value: selectedTimeframe, context: 'Chart timeframe', available: true },
          { label: 'Volume', value: capturedCandles.length > 0 ? (capturedCandles[capturedCandles.length - 1].volume > 0 ? 'Available' : 'N/A') : 'N/A', context: 'Volume data status', available: capturedCandles.length > 0 && capturedCandles[capturedCandles.length - 1].volume > 0 },
        ];

        // Build clarity scores
        const clarityScores = [
          { dimension: 'Trend Clarity', score: Math.floor(50 + Math.random() * 40), note: 'Trend direction confidence' },
          { dimension: 'Zone Clarity', score: Math.floor(45 + Math.random() * 45), note: 'Key zone definition quality' },
          { dimension: 'Tool Signal', score: Math.floor(40 + Math.random() * 50), note: 'Indicator signal quality' },
        ];

        const limitations = [
          'Single tool, single timeframe analysis only',
          'Does not account for fundamental factors or news events',
          currentMarketType !== 'crypto' ? 'Non-crypto data may use demo feed' : 'Crypto data from Binance public API',
          'Past price patterns do not guarantee future behavior',
        ];

        const freshSnapshot = {
          ...result,
          // Core identification
          symbol: selectedSymbol,
          timeframe: selectedTimeframe,
          toolId: selectedTool,
          toolName: activeTool.name,
          chartSource: chartSource,
          marketType: currentMarketType,
          timestamp: new Date().toLocaleString(),
          // v2.0 ScanResult fields
          scannedAt: Date.now(),
          priceAtScan,
          provider,
          feedMode,
          candleCount: capturedCandles.length,
          volumeAvailable: capturedCandles.length > 0 && capturedCandles[capturedCandles.length - 1].volume > 0,
          keyWatchZones: keyWatchZonesArr,
          metrics: metricsArr,
          clarityScores,
          limitations,
          marketContext: currentMarketType === 'crypto' ? '24/7 market — no sessions or forced closes' : 'Session-based market — check trading hours',
          // v2.0 scenario shape
          upsideCase: buildScenario(result.upsideCase, 'Bullish Structural Scenario'),
          downsideCase: buildScenario(result.downsideCase, 'Bearish Structural Scenario'),
          sidewaysCase: buildScenario(result.sidewaysCase, 'Consolidation Scenario'),
          // Ensure whatToWatch is an array
          whatToWatch: Array.isArray(result.whatToWatch)
            ? result.whatToWatch
            : (result.whatToWatch ? [result.whatToWatch] : [
                'Watch how price reacts near the identified key zones',
                'Monitor candlestick closes relative to the structural levels',
                'Observe volume alongside price movement for context',
              ]),
        };
        
        setAnalysisResult(result);
        setActiveAnalysisSnapshot(freshSnapshot);
        setActiveChartSnapshot(capturedCandles);
        setActiveSymbolSnapshot(selectedSymbol);
        setActiveTimeframeSnapshot(selectedTimeframe);
        setActiveToolSnapshot(selectedTool);
        setActiveMarketTypeSnapshot(currentMarketType);
        setIsStale(false);
        
        // Persist
        localStorage.setItem('mp_active_analysis', JSON.stringify(freshSnapshot));
        localStorage.setItem('mp_active_candles', JSON.stringify(capturedCandles));
        localStorage.setItem('mp_active_symbol', selectedSymbol);
        localStorage.setItem('mp_active_timeframe', selectedTimeframe);
        localStorage.setItem('mp_active_tool', selectedTool);
        localStorage.setItem('mp_active_market_type', currentMarketType);

        setScanState('ready');
        setScrollMessage('Analysis ready — scroll down to view full breakdown.');

        // Auto scroll to results section
        setTimeout(() => {
          if (resultsRef.current) {
            resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 200);

        // Transition from 'ready' to 'completed'
        setTimeout(() => {
          setScanState('completed');
          setTimeout(() => { setScrollMessage(''); }, 4000);
        }, 1500);
      } else {
        setScanState('idle');
      }
    }, 1800);
  };

  // Reset analysis
  const handleReset = () => {
    setAnalysisResult(null);
    setActiveAnalysisSnapshot(null);
    setActiveChartSnapshot(null);
    setActiveSymbolSnapshot('');
    setActiveTimeframeSnapshot('');
    setActiveToolSnapshot('');
    setActiveMarketTypeSnapshot('crypto');
    setIsStale(false);
    setScanState('idle');
    setScrollMessage('');
    localStorage.removeItem('mp_active_analysis');
    localStorage.removeItem('mp_active_candles');
    localStorage.removeItem('mp_active_symbol');
    localStorage.removeItem('mp_active_timeframe');
    localStorage.removeItem('mp_active_tool');
    localStorage.removeItem('mp_active_market_type');
  };

  // Download technical report in standard TXT format
  const handleDownloadReport = () => {
    if (!activeAnalysisSnapshot) {
      alert("Run analysis first");
      return;
    }
    
    const snap = activeAnalysisSnapshot;
    const marketType = snap.marketType || activeMarketTypeSnapshot || 'crypto';
    const feedMode = snap.chartSource === 'screenshot' ? 'Screenshot Mode (Simulated)' : 'Demo Feed (Calibrated)';
    
    const reportText = `================================================================================
                    MARKETPILOT AI - EDUCATIONAL SCAN REPORT                    
================================================================================

[REPORT METADATA]
--------------------------------------------------------------------------------
1. MarketPilot AI Title : MarketPilot AI Educational Analysis Report
2. Report Date/Time     : ${snap.timestamp}
3. Symbol               : ${snap.symbol}
4. Market Type          : ${marketType.toUpperCase()}
5. Timeframe            : ${snap.timeframe}
6. Selected Tool        : ${snap.toolName}
7. Feed Mode            : ${feedMode}
--------------------------------------------------------------------------------

[8. MAIN OBSERVATION]
--------------------------------------------------------------------------------
${snap.mainObservation}

[9. MARKET STRUCTURE]
--------------------------------------------------------------------------------
${snap.marketStructure}

[10. SELECTED TOOL READING]
--------------------------------------------------------------------------------
${snap.selectedToolReading}

[11. KEY WATCH ZONES]
--------------------------------------------------------------------------------
${snap.keyWatchZones}

[12. WHAT TO WATCH]
--------------------------------------------------------------------------------
${snap.whatToWatch}

================================================================================
                  SIMULATED STRUCTURAL SCENARIOS (STUDY ONLY)                   
================================================================================

[13. UPSIDE CASE]
- Confirmation Required : ${snap.upsideCase?.confirmation || 'Yes'}
- Clarity Level         : ${snap.upsideCase?.clarity || 'Medium'}
- Risk Profile          : ${snap.upsideCase?.risk || 'Medium'}
- Structural Scenario   : ${snap.upsideCase?.explanation || ''}

[14. DOWNSIDE CASE]
- Confirmation Required : ${snap.downsideCase?.confirmation || 'Yes'}
- Clarity Level         : ${snap.downsideCase?.clarity || 'Medium'}
- Risk Profile          : ${snap.downsideCase?.risk || 'Medium'}
- Structural Scenario   : ${snap.downsideCase?.explanation || ''}

[15. SIDEWAYS CASE]
- Confirmation Required : ${snap.sidewaysCase?.confirmation || 'No'}
- Clarity Level         : ${snap.sidewaysCase?.clarity || 'High'}
- Risk Profile          : ${snap.sidewaysCase?.risk || 'Low'}
- Structural Scenario   : ${snap.sidewaysCase?.explanation || ''}

================================================================================
                      EDUCATIONAL EXPLANATION & RISK STUDY                       
================================================================================

[16. BEGINNER EXPLANATION]
--------------------------------------------------------------------------------
${snap.beginnerExplanation}

[17. RISK NOTE]
--------------------------------------------------------------------------------
${snap.riskNote}

================================================================================
                          [18. EDUCATIONAL DISCLAIMER]                          
================================================================================
MarketPilot AI is an educational study simulator. Technical indicators and 
overlays are simulated calculations based on lookback coordinates for analysis 
purposes only. This report does not constitute financial advice, trading 
recommendations, or execution prompts. Users are solely responsible for their 
financial decisions, risk planning, and educational study results.
================================================================================`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MarketPilot_AI_${snap.symbol.replace('/', '_')}_${snap.timeframe}_Report.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to retrieve tool-specific educational explanations
  const getToolSpecificBreakdown = (toolId, snap) => {
    const price = snap?.candles ? snap.candles[snap.candles.length - 1]?.close : null;
    const tool = toolId?.toLowerCase() || '';

    const toolMap = {
      rsi: {
        toolText: "Relative Strength Index tracks price momentum by checking speed and change of price movements.",
        keyZonesText: "The current RSI value represents market momentum. We monitor the 30 oversold floor and the 70 overbought ceiling to determine if the trend is stretched."
      },
      macd: {
        toolText: "Moving Average Convergence Divergence checks the relation between trend averages to reveal momentum strength.",
        keyZonesText: "Observe the MACD line crossovers and watch signal line dynamics. The histogram thickness reflects the strength or weakness of the momentum."
      },
      bollinger_bands: {
        toolText: "Bollinger Bands measure volatility by setting standard deviation bands around a central average line.",
        keyZonesText: "Watch the bands. A squeeze indicates contraction and potential expansion, while price touching the outer bands indicates high volatility."
      },
      sma: {
        toolText: "Simple Moving Average calculates average price to smooth trends and identify support levels.",
        keyZonesText: "Staying above the average line confirms a steady upward trend. Crossing below suggest rising seller pressure."
      },
      ema: {
        toolText: "Exponential Moving Average smooths price trends by placing higher weight on recent price activity.",
        keyZonesText: "Staying above the average line confirms a steady upward trend. Crossing below suggest rising seller pressure."
      },
      trendline: {
        toolText: "Trendlines track swing highs or swing lows to identify support and resistance along a diagonal slope.",
        keyZonesText: "Observe how price reacts to the trendline. Respecting the line confirms the trend, whereas a breakout warns of a trend shift."
      },
      volume: {
        toolText: "Volume analysis measures absolute trading activity to validate price trend sustainability.",
        keyZonesText: "Expanding volume on price advances confirms participation. Diverging volume indicates weakening buyer interest."
      },
      horizontal_sr: {
        toolText: "Horizontal Support and Resistance zones track historic price coordinates where buyers and sellers previously balanced.",
        keyZonesText: `Support zones sit below the current price of ${price ? price.toFixed(2) : 'the asset'}. Resistance zones sit above, marking potential price ceilings.`
      },
      candlestick_patterns: {
        toolText: "Candlestick Patterns analyze single or multiple price candles to identify immediate shift signals in buyer-seller balance.",
        keyZonesText: "We check the body-to-wick ratio of the latest candles. Follow-through candle confirmation is required to validate the pattern."
      }
    };

    return toolMap[tool] || {
      toolText: "Technical indicators track historic price structures to calculate potential reaction levels.",
      keyZonesText: "We monitor historical swing points and indicators boundaries to gauge buyer and seller strength."
    };
  };

  // Helper to generate the 8 lesson steps from the active analysis snapshot
  const generateVideoSteps = (snap) => {
    if (!snap) return [];

    const symbol = snap.symbol || 'Asset';
    const timeframe = snap.timeframe || '1h';
    const toolName = snap.toolName || 'technical indicators';
    const provider = snap.mode === 'binance' ? 'Binance Spot' : (snap.mode === 'twelvedata' ? 'Twelve Data' : 'Demo Feed');
    const toolBreakdown = getToolSpecificBreakdown(snap.toolId, snap);

    return [
      {
        title: "1. Intro",
        caption: "Let’s break down this MarketPilot AI scan step by step.",
        detailedExplanation: "Welcome to this technical analysis guided lesson. We are starting a step-by-step educational walkthrough to review the calculations and patterns locked in your latest chart scan.",
        narration: "Let's break down this MarketPilot AI scan step by step."
      },
      {
        title: "2. Market Context",
        caption: `Symbol: ${symbol} (${timeframe}) | Feed: ${provider}`,
        detailedExplanation: `This technical study is configured for the asset symbol ${symbol} using the ${timeframe} timeframe. The active market data feed is sourced from ${provider}.`,
        narration: `This scan is for ${symbol} on the ${timeframe} timeframe, using ${provider} data.`
      },
      {
        title: "3. Selected Tool",
        caption: `Indicator: ${toolName}`,
        detailedExplanation: toolBreakdown.toolText,
        narration: `The selected tool is ${toolName}. ${toolBreakdown.toolText}`
      },
      {
        title: "4. Main Observation",
        caption: snap.mainObservation || "Reviewing key price patterns.",
        detailedExplanation: `Our primary educational observation is: ${snap.mainObservation || 'The chart is interacting with established support and resistance vectors.'} This pattern highlights where buyers and sellers have historically balanced.`,
        narration: `Our main observation is: ${snap.mainObservation || 'The chart is interacting with established support and resistance vectors.'}`
      },
      {
        title: "5. Key Zones",
        caption: "Analyzing price relative to indicator levels.",
        detailedExplanation: toolBreakdown.keyZonesText,
        narration: toolBreakdown.keyZonesText
      },
      {
        title: "6. Scenario Cases",
        caption: "Upside, downside, and sideways path structures.",
        detailedExplanation: `Upside Scenario: ${snap.upsideCase?.explanation || 'Watch resistance breakout.'} (Clarity: ${snap.upsideCase?.clarity || 'Medium'}, Risk: ${snap.upsideCase?.risk || 'Medium'}, Confirmation: ${snap.upsideCase?.confirmation || 'Yes'}).\nDownside Scenario: ${snap.downsideCase?.explanation || 'Watch support retest.'} (Clarity: ${snap.downsideCase?.clarity || 'Medium'}, Risk: ${snap.downsideCase?.risk || 'Medium'}, Confirmation: ${snap.downsideCase?.confirmation || 'Yes'}).\nSideways Scenario: ${snap.sidewaysCase?.explanation || 'Range bound fluctuate'}.`,
        narration: `We analyze three simulated scenario cases. The upside case is ${snap.upsideCase?.explanation || 'watch resistance ceiling'} with a clarity of ${snap.upsideCase?.clarity || 'medium'} percent and ${snap.upsideCase?.risk || 'medium'} risk. The downside case is ${snap.downsideCase?.explanation || 'watch support floor'} with a clarity of ${snap.downsideCase?.clarity || 'medium'} percent. The sideways case is ${snap.sidewaysCase?.explanation || 'price fluctuates in a range'}. Remember, clarity and risk levels are educational estimates.`
      },
      {
        title: "7. Risk Note",
        caption: "Educational only. Not financial advice. No buy/sell signal.",
        detailedExplanation: "MarketPilot AI is an educational study simulator. Technical indicators and overlays are simulated calculations based on lookback coordinates for analysis purposes only. This walkthrough does not constitute financial advice, trading recommendations, or buy or sell signals.",
        narration: "Important note. This guided lesson is educational only. It is not financial advice, and does not provide buy or sell signals."
      },
      {
        title: "8. Conclusion",
        caption: "What to watch next educationally.",
        detailedExplanation: "This concludes the guided breakdown. In your next studies, monitor candle closes relative to the support and resistance boundaries identified here before interpreting the next move.",
        narration: "In conclusion. What to watch next educationally is how price reacts near the marked zones before interpreting the next move."
      }
    ];
  };

  // Upgraded speech states
  const [isMuted, setIsMuted] = useState(false);
  const [isTextOnlyMode, setIsTextOnlyMode] = useState(false);
  const [speechRate, setSpeechRate] = useState(() => {
    const saved = localStorage.getItem('marketpilot_video_speed');
    const parsed = saved ? parseFloat(saved) : 1.0;
    return (parsed >= 0.2 && parsed <= 3.0) ? parsed : 1.0;
  });
  const [customSpeedVal, setCustomSpeedVal] = useState(() => {
    const saved = localStorage.getItem('marketpilot_video_speed');
    const parsed = saved ? parseFloat(saved) : 1.0;
    return (parsed >= 0.2 && parsed <= 3.0) ? parsed.toString() : '1.0';
  });
  
  const isPreset = (rate) => [0.2, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0].includes(rate);
  const [showCustomSpeedInput, setShowCustomSpeedInput] = useState(() => !isPreset(speechRate));
  const [isLessonCompleted, setIsLessonCompleted] = useState(false);
  const [voiceCompatibilitySupported, setVoiceCompatibilitySupported] = useState(true);
  const [selectedVoiceName, setSelectedVoiceName] = useState('');
  const [availableVoices, setAvailableVoices] = useState([]);

  const synthRef = useRef(null);
  const utteranceRef = useRef(null);
  const timerRef = useRef(null);
  const speechRateRef = useRef(1.0);

  // Sync speech rate ref
  useEffect(() => {
    speechRateRef.current = speechRate;
  }, [speechRate]);

  // Initialize SpeechSynthesis and load voices
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
      setVoiceCompatibilitySupported(true);

      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        const engVoices = voices.filter(v => v.lang.includes('en'));
        setAvailableVoices(engVoices);
        
        if (engVoices.length > 0) {
          const preferred = engVoices.find(v => 
            v.name.includes('Google') || 
            v.name.includes('Natural') || 
            v.name.includes('Microsoft') || 
            v.name.includes('Neural') || 
            v.name.includes('Online') || 
            v.name.includes('Female')
          ) || engVoices.find(v => v.lang.startsWith('en-US')) || engVoices[0];
          
          setSelectedVoiceName(preferred.name);
        }
      };

      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    } else {
      setVoiceCompatibilitySupported(false);
    }
  }, []);

  // Stop speaking helper
  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  };

  // Voice synthesis utterance launcher
  const speakText = (text, onEnd = null) => {
    stopSpeaking();
    if (!synthRef.current || isMuted || isTextOnlyMode || !voiceCompatibilitySupported) {
      if (onEnd) onEnd();
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;
      
      if (selectedVoiceName && availableVoices.length > 0) {
        const matchingVoice = availableVoices.find(v => v.name === selectedVoiceName);
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }
      }
      
      utterance.rate = speechRateRef.current; // speech speed rate controller
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      utterance.onend = () => {
        if (onEnd) onEnd();
      };
      
      utterance.onerror = (e) => {
        console.warn("Speech synthesis error:", e);
        if (onEnd) onEnd();
      };

      synthRef.current.speak(utterance);
    } catch (e) {
      console.warn("Speech Synthesis failed:", e);
      if (onEnd) onEnd();
    }
  };

  // Video Breakdown Action Trigger
  const handleOpenVideoBreakdown = () => {
    if (!activeAnalysisSnapshot) return;
    setVideoStepIdx(0);
    setIsVideoOpen(true);
    setIsVideoPlaying(false);
    setIsLessonCompleted(false);
    setShowCustomSpeedInput(!isPreset(speechRate));
  };

  // Function to execute current step audio/timeout
  const playCurrentStep = () => {
    stopSpeaking();
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const steps = generateVideoSteps(activeAnalysisSnapshot);
    if (steps.length === 0 || videoStepIdx >= steps.length) return;

    const currentStep = steps[videoStepIdx];

    // Scroll active step card into view
    const cardEl = document.getElementById(`video-step-${videoStepIdx}`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    if (isVideoPlaying) {
      const rate = speechRateRef.current;
      const useFallbackTiming = isMuted || isTextOnlyMode || !synthRef.current || !voiceCompatibilitySupported;
      
      if (useFallbackTiming) {
        // Fallback timer: word count / (2.5 words/sec * speedRate)
        const wordCount = currentStep.narration.split(/\s+/).length;
        const baseDuration = (wordCount / 2.5) * 1000;
        const adjustedDuration = Math.max(3000, Math.min(15000, baseDuration / rate));
        
        timerRef.current = setTimeout(() => {
          advanceNextStep();
        }, adjustedDuration);
      } else {
        // Speak narration
        speakText(currentStep.narration, () => {
          // Pause slightly before moving to next step
          timerRef.current = setTimeout(() => {
            advanceNextStep();
          }, 800 / rate);
        });
      }
    }
  };

  const advanceNextStep = () => {
    const steps = generateVideoSteps(activeAnalysisSnapshot);
    if (videoStepIdx < steps.length - 1) {
      setVideoStepIdx(prev => prev + 1);
    } else {
      setIsVideoPlaying(false);
      setIsLessonCompleted(true);
    }
  };

  // Step playback handlers
  const handleNextStep = () => {
    const steps = generateVideoSteps(activeAnalysisSnapshot);
    if (videoStepIdx < steps.length - 1) {
      setVideoStepIdx(prev => prev + 1);
    } else {
      setIsVideoPlaying(false);
      setIsLessonCompleted(true);
    }
  };

  const handlePrevStep = () => {
    setIsLessonCompleted(false);
    if (videoStepIdx > 0) {
      setVideoStepIdx(prev => prev - 1);
    }
  };

  const handleTogglePlayPause = () => {
    if (isLessonCompleted) {
      handleRestartLesson();
      return;
    }

    if (isVideoPlaying) {
      // Pause
      setIsVideoPlaying(false);
      if (synthRef.current && synthRef.current.speaking && !isMuted && !isTextOnlyMode) {
        synthRef.current.pause();
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    } else {
      // Play / Resume
      setIsVideoPlaying(true);
      if (synthRef.current && synthRef.current.paused && !isMuted && !isTextOnlyMode) {
        synthRef.current.resume();
      } else {
        playCurrentStep();
      }
    }
  };

  const handleRestartLesson = () => {
    stopSpeaking();
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setVideoStepIdx(0);
    setIsVideoPlaying(true);
    setIsLessonCompleted(false);
  };

  // Synced voice controller effect
  useEffect(() => {
    if (isVideoOpen && isVideoPlaying && !isStale) {
      playCurrentStep();
    } else {
      stopSpeaking();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    }
    return () => {
      stopSpeaking();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isVideoOpen, isVideoPlaying, videoStepIdx, isMuted, isTextOnlyMode, selectedVoiceName, isStale]);

  const handleCustomSpeedChange = (val) => {
    setCustomSpeedVal(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) {
      if (parsed >= 0.2 && parsed <= 3.0) {
        setSpeechRate(parsed);
        localStorage.setItem('marketpilot_video_speed', parsed.toString());
      }
    }
  };

  const handleCustomSpeedBlur = () => {
    const parsed = parseFloat(customSpeedVal);
    if (isNaN(parsed) || parsed < 0.2 || parsed > 3.0) {
      setCustomSpeedVal('1.0');
      setSpeechRate(1.0);
      localStorage.setItem('marketpilot_video_speed', '1.0');
    }
  };

  const handleSelectPresetSpeed = (rate) => {
    setSpeechRate(rate);
    setCustomSpeedVal(rate.toString());
    localStorage.setItem('marketpilot_video_speed', rate.toString());
  };

  const handleCloseVideoBreakdown = () => {
    setIsVideoOpen(false);
    setIsVideoPlaying(false);
    stopSpeaking();
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const renderMiniChartPreview = (snap) => {
    const candlesToUse = snap?.candles || [];
    const symbol = snap?.symbol || 'Asset';
    const timeframe = snap?.timeframe || '1h';
    const toolName = snap?.toolName || 'Technical Indicators';
    const provider = isStale ? 'Previous scan source' : (snap?.mode === 'binance' ? 'Binance Spot Market Data' : (snap?.mode === 'twelvedata' ? 'Twelve Data' : 'Demo Feed'));

    if (candlesToUse.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-6 text-center bg-slate-900/40 border border-slate-850 rounded-xl h-full w-full space-y-3 font-sans">
          <div className="p-2.5 rounded-full bg-slate-950/80 border border-slate-800/60 shadow-inner">
            <MonitorPlay className="w-6 h-6 text-purple-400/80" />
          </div>
          <div className="space-y-1">
            <h5 className="text-xs font-bold text-slate-200 tracking-wide uppercase">Chart preview unavailable</h5>
            <p className="text-[10px] text-slate-400 max-w-[85%] mx-auto leading-relaxed font-sans">
              This guided lesson uses the latest scan text and scenario data.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-left text-[10px] text-slate-400 w-full max-w-[240px] pt-2.5 border-t border-slate-800/30">
            <div>
              <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-semibold">Symbol</span>
              <span className="font-mono font-bold text-slate-300">{symbol}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-semibold">Timeframe</span>
              <span className="font-mono font-bold text-slate-300">{timeframe}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-semibold">Tool</span>
              <span className="font-semibold text-slate-300 truncate block">{toolName}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-semibold">Provider</span>
              <span className="font-semibold text-slate-300 truncate block">{provider}</span>
            </div>
          </div>
        </div>
      );
    }

    const sliceCandles = candlesToUse.slice(-20);
    const minPrice = Math.min(...sliceCandles.map(c => c.low));
    const maxPrice = Math.max(...sliceCandles.map(c => c.high));
    const priceDiff = maxPrice - minPrice || 1;

    const width = 400;
    const height = 200;
    const padding = 20;

    const getX = (index) => padding + (index * (width - padding * 2) / (sliceCandles.length - 1 || 1));
    const getY = (price) => height - padding - ((price - minPrice) * (height - padding * 2) / priceDiff);

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="w-full h-full select-none">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
          <line
            key={i}
            x1={padding}
            y1={padding + p * (height - padding * 2)}
            x2={width - padding}
            y2={padding + p * (height - padding * 2)}
            stroke="#1e293b"
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />
        ))}

        {/* Candles */}
        {sliceCandles.map((c, i) => {
          const x = getX(i);
          const yOpen = getY(c.open);
          const yClose = getY(c.close);
          const yHigh = getY(c.high);
          const yLow = getY(c.low);
          
          const isBull = c.close >= c.open;
          const stroke = isBull ? '#10b981' : '#ef4444';
          const fill = isBull ? '#10b981' : '#ef4444';
          
          const bodyW = 6;
          const bodyH = Math.max(1.5, Math.abs(yOpen - yClose));
          const bodyY = Math.min(yOpen, yClose);

          return (
            <g key={i}>
              <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={stroke} strokeWidth="1" />
              <rect x={x - bodyW/2} y={bodyY} width={bodyW} height={bodyH} fill={fill} stroke={stroke} strokeWidth="0.5" rx="0.5" />
            </g>
          );
        })}

        {/* Support and Resistance visualization */}
        <line x1={padding} y1={getY(minPrice * 1.01)} x2={width - padding} y2={getY(minPrice * 1.01)} stroke="#06b6d4" strokeWidth="1" strokeDasharray="3,3" />
        <text x={padding + 10} y={getY(minPrice * 1.01) - 4} fill="#06b6d4" fontSize="8" fontWeight="bold">Support Zone</text>

        <line x1={padding} y1={getY(maxPrice * 0.99)} x2={width - padding} y2={getY(maxPrice * 0.99)} stroke="#f59e0b" strokeWidth="1" strokeDasharray="3,3" />
        <text x={padding + 10} y={getY(maxPrice * 0.99) + 10} fill="#f59e0b" fontSize="8" fontWeight="bold">Resistance Zone</text>
      </svg>
    );
  };

  // Load from snapshot (kept visible even if settings differ or live data updates)
  const displayResult = analysisResult || activeAnalysisSnapshot;

  return (
    <div className="flex flex-col lg:flex-row w-full gap-6 p-4 md:p-6 bg-[#070b14] min-h-screen">
      
      {/* 1. Left Sidebar: Market controls and Watchlist */}
      <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-3 lg:sticky lg:top-6 lg:h-[calc(100vh-48px)] lg:overflow-y-auto pr-1">
        {/* Custom Symbol Adder */}
        <Card className="shrink-0">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs uppercase tracking-wider text-slate-400">Custom Symbol Input</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <form onSubmit={handleAddCustomSymbol} className="space-y-2">
              <Input
                placeholder="e.g. AMZN, INFY"
                value={customSymbol}
                onChange={(e) => setCustomSymbol(e.target.value)}
                size="sm"
                className="h-8 text-xs"
              />
              <div className="flex gap-1.5">
                <Select
                  options={[
                    { value: 'crypto', label: 'Crypto' },
                    { value: 'stock', label: 'Stocks' },
                    { value: 'forex', label: 'Forex' },
                    { value: 'index', label: 'Indices' },
                    { value: 'commodity', label: 'Commodities' }
                  ]}
                  value={customMarketType}
                  onChange={(e) => setCustomMarketType(e.target.value)}
                  className="flex-1 h-8 text-xs py-0 bg-slate-900"
                />
                <Button type="submit" variant="glass" size="sm" className="h-8 px-3 text-xs">
                  Add
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Local Settings Panel */}
        <Card className="shrink-0">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs uppercase tracking-wider text-slate-400">Scan Settings</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 space-y-2">
            {/* Chart Source Toggle */}
            <div className="flex flex-col gap-1">
              <div className="grid grid-cols-2 gap-1 bg-slate-950 p-0.5 rounded border border-darkBorder/60">
                <button
                  onClick={() => setChartSource('live')}
                  className={`py-1 text-[10px] font-bold rounded cursor-pointer transition ${
                    chartSource === 'live' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Chart Feed
                </button>
                <button
                  onClick={() => setChartSource('screenshot')}
                  className={`py-1 text-[10px] font-bold rounded cursor-pointer transition ${
                    chartSource === 'screenshot' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Screenshot
                </button>
              </div>
            </div>

            {/* Screenshot file upload */}
            {chartSource === 'screenshot' && (
              <div className="space-y-1.5">
                <label className="flex flex-col items-center justify-center border border-dashed border-darkBorder/60 rounded p-2 hover:border-cyan-500/30 transition cursor-pointer bg-slate-950/60">
                  <Upload className="w-4 h-4 text-slate-400 mb-0.5" />
                  <span className="text-[9px] text-slate-400 text-center">
                    {screenshotFile ? screenshotFile.name : 'Upload chart'}
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleScreenshotUpload} />
                </label>
                {screenshotPreview && (
                  <div className="relative rounded overflow-hidden border border-darkBorder h-14 bg-slate-900 flex items-center justify-center">
                    <img src={screenshotPreview} alt="Preview" className="h-full object-contain" />
                    <button
                      onClick={() => {
                        setScreenshotFile(null);
                        setScreenshotPreview(null);
                      }}
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-slate-300 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Watchlist */}
        <Card className="flex flex-col shrink-0">
          <CardHeader className="p-3 pb-1">
            <div>
              <CardTitle className="text-xs uppercase tracking-wider text-slate-400">Educational Watchlist</CardTitle>
            </div>
          </CardHeader>

          {/* Watchlist Category Filter Tabs */}
          <div className="px-3 pb-2 border-b border-darkBorder/25">
            <div className="grid grid-cols-3 gap-1 p-0.5 bg-slate-950 rounded border border-darkBorder/60">
              {[
                { id: 'crypto', label: 'Crypto' },
                { id: 'forex', label: 'Forex' },
                { id: 'commodity', label: 'Cmdty' },
                { id: 'index', label: 'Indices' },
                { id: 'stock', label: 'Stocks' },
                { id: 'custom', label: 'Custom' }
              ].map((tab) => {
                const isActive = selectedCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedCategory(tab.id)}
                    className={`py-1 text-[10px] font-bold rounded cursor-pointer transition-all text-center ${
                      isActive
                        ? 'bg-slate-800 text-cyan-400 border border-cyan-800/35 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <CardContent className="max-h-[220px] overflow-y-auto px-1">
            <div className="divide-y divide-darkBorder/40">
              {(() => {
                const filteredList = watchlist.filter((row) => {
                  if (selectedCategory === 'custom') {
                    return row.isCustom === true;
                  }
                  if (selectedCategory === 'commodity') {
                    return (row.marketType === 'commodity' || row.marketType === 'commodities') && !row.isCustom;
                  }
                  if (selectedCategory === 'index') {
                    return (row.marketType === 'index' || row.marketType === 'indices') && !row.isCustom;
                  }
                  if (selectedCategory === 'stock') {
                    return (row.marketType === 'stock' || row.marketType === 'stocks') && !row.isCustom;
                  }
                  return row.marketType === selectedCategory && !row.isCustom;
                });

                if (filteredList.length === 0) {
                  return (
                    <div className="py-8 text-center text-xs text-slate-500">
                      No symbols in this category.
                    </div>
                  );
                }

                return filteredList.map((row) => {
                  const isFav = favorites.includes(row.symbol);
                  const isSelected = selectedSymbol === row.symbol;
                  
                  return (
                    <div
                      key={row.symbol}
                      onClick={() => handleSelectSymbol(row.symbol, row.marketType)}
                      className={`flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-cyan-500/10 border-l-2 border-cyan-500 text-cyan-400 font-semibold'
                          : 'hover:bg-slate-900/80 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(row.symbol);
                          }}
                          className="text-slate-500 hover:text-yellow-400 transition"
                        >
                          <Star className={`w-3.5 h-3.5 ${isFav ? 'text-yellow-400 fill-yellow-400' : ''}`} />
                        </button>
                        <div>
                          <div className="text-xs font-bold font-mono tracking-tight">{row.symbol}</div>
                          <div className="text-[9px] text-slate-500 uppercase tracking-wider">{row.marketType}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-semibold font-mono">{row.price}</div>
                        <div className={`text-[10px] font-bold ${row.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                          {row.change}
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </CardContent>
        </Card>

        {/* API Readiness Status Card */}
        <Card className="shrink-0">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs uppercase tracking-wider text-slate-400">API Readiness Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-2 text-[10px] space-y-1.5 font-mono">
            {(() => {
              const status = checkApiStatus();
              return (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Demo Feed:</span>
                    <span className="text-emerald-400 font-bold">{status.demo}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Binance Public Market Data:</span>
                    <span className={status.binance === 'Ready' ? 'text-emerald-400 font-bold' : 'text-slate-500 font-semibold'}>{status.binance}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Twelve Data:</span>
                    <span className={status.twelvedata === 'Ready' ? 'text-emerald-400 font-bold' : 'text-slate-500 font-semibold'}>{status.twelvedata}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Alpha Vantage:</span>
                    <span className={status.alphavantage === 'Ready' ? 'text-emerald-400 font-bold' : 'text-slate-500 font-semibold'}>{status.alphavantage}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">OpenAI Vision:</span>
                    <span className="text-purple-400 font-semibold">{status.openai}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Supabase:</span>
                    <span className={status.supabase === 'Ready' ? 'text-emerald-400 font-bold' : 'text-slate-500 font-semibold'}>{status.supabase}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Razorpay:</span>
                    <span className={status.razorpay === 'Ready' ? 'text-emerald-400 font-bold' : 'text-slate-500 font-semibold'}>{status.razorpay}</span>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>

      {/* 2. Main Content Column: Chart & Interpretations */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        {/* Warning Banner if settings differ from snapshot */}
        {isStale && activeAnalysisSnapshot && (
          <div className="bg-amber-950/40 border border-amber-500/20 text-amber-300 rounded-xl px-4 py-2 text-xs flex items-center justify-between gap-3 shadow-lg backdrop-blur-md shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
              <span>
                Chart changed. Run analysis again to update report.
              </span>
            </div>
            <Button variant="glass" size="sm" onClick={handleRunAnalysis} className="text-[10px] py-0.5 h-7 border-amber-500/20 hover:bg-amber-500/10 text-amber-200">
              Run Scan
            </Button>
          </div>
        )}

        {/* Timeframes Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-950 border border-darkBorder rounded-xl shrink-0">
          <div className="flex items-center gap-1 overflow-x-auto max-w-full">
            {['1m', '5m', '15m', '30m', '1h', '4h', '1D', '1W', '1M'].map((tf) => {
              const isActive = selectedTimeframe === tf;
              return (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`px-2 py-1 text-[11px] font-semibold rounded cursor-pointer transition-all ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {tf}
                </button>
              );
            })}
          </div>
          
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tool:</span>
            <select
              value={selectedTool}
              onChange={(e) => setSelectedTool(e.target.value)}
              className="bg-slate-900 border border-darkBorder rounded text-xs font-semibold text-slate-300 px-2 py-1 focus:outline-none focus:border-cyan-500 cursor-pointer h-7"
            >
              {!['sma', 'ema', 'trendline', 'rsi', 'macd', 'bollinger_bands', 'volume', 'horizontal_sr', 'candlestick_patterns'].includes(selectedTool) && (
                <option value={selectedTool}>
                  {TOOLS_DIRECTORY.find(t => t.id === selectedTool)?.name || selectedTool}
                </option>
              )}
              <optgroup label="Trend Tools" className="bg-slate-950">
                <option value="sma">Simple Moving Average (SMA)</option>
                <option value="ema">Exponential Moving Average (EMA)</option>
                <option value="trendline">Trendlines</option>
              </optgroup>
              <optgroup label="Momentum Indicators" className="bg-slate-950">
                <option value="rsi">Relative Strength Index (RSI)</option>
                <option value="macd">MACD</option>
              </optgroup>
              <optgroup label="Volatility Indicators" className="bg-slate-950">
                <option value="bollinger_bands">Bollinger Bands (BB)</option>
              </optgroup>
              <optgroup label="Volume Indicators" className="bg-slate-950">
                <option value="volume">Volume Analysis</option>
              </optgroup>
              <optgroup label="Support & Resistance" className="bg-slate-950">
                <option value="horizontal_sr">Support & Resistance</option>
              </optgroup>
              <optgroup label="Price Action" className="bg-slate-950">
                <option value="candlestick_patterns">Candlestick Patterns</option>
              </optgroup>
            </select>
          </div>
        </div>

        {/* Run Controls Toolbar */}
        <div className="flex flex-col gap-2 p-2.5 bg-slate-950 border border-darkBorder rounded-xl shrink-0 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* Left Column: Hero Run Scan Button & Full View */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                disabled={scanState === 'scanning'}
                onClick={handleRunAnalysis}
                className={`relative overflow-hidden group px-4 py-2 rounded-xl font-bold text-xs tracking-wide transition-all duration-300 transform active:scale-95 shadow-md select-none cursor-pointer flex items-center justify-center gap-2 min-w-[180px] h-8
                  ${scanState === 'scanning'
                    ? 'bg-slate-900 border border-darkBorder text-slate-500 cursor-not-allowed shadow-none'
                    : isStale && activeAnalysisSnapshot
                      ? 'bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 hover:from-teal-400 hover:via-cyan-400 hover:to-blue-400 text-white border border-cyan-400/30 hover:-translate-y-0.5 animate-pulse'
                      : 'bg-gradient-to-r from-cyan-600 via-teal-500 to-cyan-500 hover:from-cyan-500 hover:via-teal-400 hover:to-cyan-400 text-white border border-cyan-400/20 hover:-translate-y-0.5'
                  }
                `}
              >
                {/* Shine Overlay */}
                {scanState !== 'scanning' && (
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine pointer-events-none" />
                )}
                
                {/* Glow background */}
                {scanState !== 'scanning' && (
                  <span className={`absolute -inset-1 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 opacity-25 group-hover:opacity-45 transition duration-300 -z-10 ${
                    isStale && activeAnalysisSnapshot ? 'animate-pulse-glow' : 'blur-sm'
                  }`} />
                )}

                {/* Icon */}
                {scanState === 'scanning' ? (
                  <Radar className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                ) : scanState === 'ready' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 animate-bounce" />
                ) : isStale && activeAnalysisSnapshot ? (
                  <Zap className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-cyan-200 group-hover:rotate-12 transition-transform duration-300" />
                )}

                {/* Text */}
                <span>
                  {scanState === 'scanning'
                    ? 'Analyzing Chart...'
                    : scanState === 'ready'
                      ? 'Analysis Ready'
                      : activeAnalysisSnapshot
                        ? isStale
                          ? 'Run Scan Again'
                          : 'Re-run Analysis'
                        : 'Run Scan Analysis'
                }
                </span>
              </button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsFullViewOpen(true)}
                className="hover:bg-slate-800 text-slate-300 border border-slate-700/80 rounded-xl h-8 text-xs px-3"
                icon={Maximize2}
              >
                Full View
              </Button>
            </div>

            {/* Right Column: Secondary Actions (Report, Video, Reset) */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative group">
                <Button
                  variant="glass"
                  size="sm"
                  disabled={!activeAnalysisSnapshot}
                  onClick={handleOpenVideoBreakdown}
                  className={`rounded-xl transition h-8 text-xs px-3 ${
                    !activeAnalysisSnapshot
                      ? 'opacity-50 cursor-not-allowed border-slate-800 text-slate-500 bg-slate-950/60'
                      : isStale
                        ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                        : 'border-purple-500/20 text-purple-400 hover:bg-purple-500/10'
                  }`}
                  icon={MonitorPlay}
                >
                  Video Breakdown
                </Button>
                {isStale && activeAnalysisSnapshot && (
                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-amber-400 text-[10px] px-2.5 py-1 rounded-lg border border-amber-500/25 whitespace-nowrap shadow-xl z-20 font-sans">
                    Run updated scan first.
                  </span>
                )}
                {!activeAnalysisSnapshot && (
                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-slate-300 text-[10px] px-2.5 py-1 rounded-lg border border-darkBorder whitespace-nowrap shadow-xl z-20 font-sans">
                    Run Scan Analysis first to generate a video breakdown.
                  </span>
                )}
              </div>

              <div className="relative group">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!activeAnalysisSnapshot}
                  onClick={handleDownloadReport}
                  icon={Download}
                  className={`rounded-xl h-8 text-xs px-3 ${
                    !activeAnalysisSnapshot 
                      ? 'opacity-50 cursor-not-allowed bg-slate-900 border-slate-800 text-slate-500' 
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-100'
                  }`}
                >
                  Download Report
                </Button>
                {!activeAnalysisSnapshot && (
                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-slate-300 text-[10px] px-2.5 py-1 rounded-lg border border-darkBorder whitespace-nowrap shadow-xl z-20 font-sans">
                    Run analysis first
                  </span>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="hover:bg-slate-900 text-slate-500 hover:text-slate-300 border border-transparent hover:border-slate-800/40 rounded-xl h-8 text-xs px-3"
                icon={RefreshCw}
              >
                Reset
              </Button>
            </div>
          </div>

          {/* Helper Feedback Message */}
          {!activeAnalysisSnapshot && (
            <div className="text-[10px] text-slate-600 text-right pr-2">
              * Run scan analysis first to enable technical report download.
            </div>
          )}
        </div>

        {/* Main Candlestick Chart — or Locked Market Panel */}
        {lockedMarket ? (
          <div className="flex flex-col items-center justify-center min-h-[320px] rounded-2xl border border-slate-800/60 bg-slate-950/80 p-8 text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700/50 flex items-center justify-center text-3xl shadow-inner">
              🔒
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1">
                {lockedMarket.marketLabel} Charts — Provider Key Required
              </h3>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-3">
                Live {lockedMarket.marketLabel} charts require a connected market data provider.
                Add <code className="text-cyan-400 bg-slate-900 px-1.5 py-0.5 rounded font-mono text-[11px]">{lockedMarket.requiresKey}</code> to
                your <code className="text-slate-300 bg-slate-900 px-1 py-0.5 rounded font-mono text-[11px]">.env</code> file and restart the app.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-amber-500/20 bg-amber-950/20">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-[11px] text-amber-300/80 font-medium">
                  Demo preview is not available for {lockedMarket.marketLabel}. Crypto (BTC, ETH, SOL…) works without any API key.
                </span>
              </div>
            </div>
          </div>
        ) : (
          <ChartContainer
            candles={candles}
            overlays={displayResult?.overlays || []}
            symbol={selectedSymbol}
            timeframe={selectedTimeframe}
            chartSource={chartSource}
            onScreenshotCalibration={() => setIsCalibrating(true)}
            isFullscreen={isFullViewOpen}
            onFullscreenToggle={() => setIsFullViewOpen(!isFullViewOpen)}
            selectedTool={selectedTool}
            feedStatus={feedStatus}
          />
        )}

        {/* Scroll status message notification */}
        {scrollMessage && (
          <div className="bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 rounded-xl px-4 py-2.5 text-xs flex items-center gap-2 animate-pulse shrink-0">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{scrollMessage}</span>
          </div>
        )}

        {feedStatus.error && feedStatus.mode === 'demo_fallback' && (
          <div className="bg-amber-950/40 border border-amber-500/20 text-amber-300 rounded-xl px-4 py-2.5 text-xs flex items-center gap-2 shrink-0 select-none">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{feedStatus.error}</span>
          </div>
        )}

        {feedStatus.error && feedStatus.mode === 'binance' && (
          <div className="bg-amber-950/40 border border-amber-500/20 text-amber-300 rounded-xl px-4 py-2.5 text-xs flex items-center gap-2 shrink-0 select-none">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{feedStatus.error}</span>
          </div>
        )}

        {/* 1. AI Scan Results Section */}
        <div ref={resultsRef} className="scroll-mt-6 shrink-0">
          <Card className="w-full bg-slate-950 border border-darkBorder/60">
            <CardHeader className="p-3 pb-2 border-b border-darkBorder/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="text-sm font-bold text-white">AI Scan Results</CardTitle>
                <CardDescription className="text-[10px]">Educational breakdown of indicator calculations and market context</CardDescription>
              </div>
              {displayResult && (
                <Badge variant="cyan" className="font-mono text-[10px] uppercase py-0.5 self-start sm:self-auto">
                  {displayResult.toolName} ({displayResult.timeframe})
                </Badge>
              )}
            </CardHeader>
            
            <CardContent className="p-3 pt-3">
              {!displayResult ? (
                /* Clean Empty State */
                <div className="py-8 flex flex-col items-center justify-center text-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-slate-900 border border-darkBorder/60 flex items-center justify-center text-lg text-slate-500">
                    🔍
                  </div>
                  <p className="text-xs font-medium text-slate-400">
                    Run scan analysis to generate educational chart breakdown.
                  </p>
                </div>
              ) : (
                /* Filled State */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {displayResult.chartSource === 'screenshot' && (
                    <div className="lg:col-span-2 bg-yellow-950/20 border border-yellow-500/20 rounded-lg p-2.5 flex items-start gap-2.5">
                      <ShieldAlert className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-[11px] font-bold text-yellow-400">Requires Backend AI Vision Integration</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                          Automated visual scanning of uploaded chart images requires a secure backend connection to OpenAI Vision APIs. Currently showing simulated educational calibration coordinates.
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="space-y-3">
                    {/* Main Observation */}
                    <div className="bg-[#111726]/40 p-3 rounded-lg border border-darkBorder/40">
                      <h5 className="font-bold text-white flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-cyan-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Main Observation
                      </h5>
                      <p className="text-slate-300 mt-1.5 leading-relaxed text-xs">
                        {displayResult.mainObservation}
                      </p>
                    </div>

                    {/* Technical Reading */}
                    <div className="bg-[#111726]/40 p-3 rounded-lg border border-darkBorder/40">
                      <h5 className="font-bold text-white flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-cyan-400">
                        📊 Selected Tool Reading
                      </h5>
                      <p className="text-slate-300 mt-1.5 leading-relaxed text-xs">
                        {displayResult.selectedToolReading}
                      </p>
                    </div>

                    {/* Beginner Explanation */}
                    <div className="bg-cyan-950/10 p-3 rounded-lg border border-cyan-500/10">
                      <h5 className="font-bold text-white flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-cyan-400">
                        💡 Beginner Explanation
                      </h5>
                      <p className="text-slate-300 mt-1.5 leading-relaxed text-xs">
                        {displayResult.beginnerExplanation}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Market Structure */}
                    <div className="bg-[#111726]/40 p-3 rounded-lg border border-darkBorder/40">
                      <h5 className="font-bold text-white flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-cyan-400">
                        <Target className="w-3.5 h-3.5 animate-pulse" />
                        Market Structure
                      </h5>
                      <p className="text-slate-300 mt-1.5 leading-relaxed text-xs">
                        {displayResult.marketStructure}
                      </p>
                    </div>

                    {/* Key Watch Zones */}
                    <div className="bg-[#111726]/40 p-3 rounded-lg border border-darkBorder/40">
                      <h5 className="font-bold text-white flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-cyan-400">
                        🔑 Key Watch Zones
                      </h5>
                      <p className="text-slate-300 mt-1.5 leading-relaxed text-xs font-mono">
                        {displayResult.keyWatchZones}
                      </p>
                    </div>

                    {/* What to Watch */}
                    <div className="bg-[#111726]/40 p-3 rounded-lg border border-darkBorder/40">
                      <h5 className="font-bold text-white flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-cyan-400">
                        👁️ What to Watch
                      </h5>
                      <p className="text-slate-300 mt-1.5 leading-relaxed text-xs">
                        {displayResult.whatToWatch}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 2. Simulated Structural Cases Section */}
        <div className="space-y-3.5 shrink-0">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Simulated Scenario Cases (Study Only)</h3>
          
          {!displayResult ? (
            /* Empty State for Scenario Cards */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['📈 Upside Case', '📉 Downside Case', '↕️ Sideways Case'].map((label, idx) => (
                <div key={idx} className="bg-slate-950/40 p-5 rounded-2xl border border-darkBorder/50 text-center py-8">
                  <span className="text-xs font-bold text-slate-500 block mb-2">{label}</span>
                  <span className="text-[10px] text-slate-600 block">Waiting for scan data...</span>
                </div>
              ))}
            </div>
          ) : (
            /* Filled State for Scenario Cards */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1. Upside Case */}
              {/* 1. Upside Case */}
              <div className="bg-slate-950/80 p-3 rounded-xl border-l-4 border-emerald-500 border border-darkBorder/40 flex flex-col justify-between min-h-[140px] hover:border-emerald-500/30 transition-all duration-300">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      📈 Upside Case
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-2">
                    {displayResult.upsideCase?.explanation}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1 pt-1.5 border-t border-darkBorder/20">
                  <Badge variant="emerald" className="text-[8px] px-2 py-0.5 uppercase tracking-wider font-semibold">
                    Clarity: {displayResult.upsideCase?.clarity || 'Medium'}
                  </Badge>
                  <Badge variant="emerald" className="text-[8px] px-2 py-0.5 uppercase tracking-wider font-semibold">
                    Risk: {displayResult.upsideCase?.risk || 'Medium'}
                  </Badge>
                  <Badge variant="gray" className="text-[8px] px-2 py-0.5 uppercase tracking-wider font-semibold text-slate-400">
                    Confirm: {displayResult.upsideCase?.confirmation || 'Yes'}
                  </Badge>
                </div>
              </div>

              {/* 2. Downside Case */}
              <div className="bg-slate-950/80 p-3 rounded-xl border-l-4 border-red-500 border border-darkBorder/40 flex flex-col justify-between min-h-[140px] hover:border-red-500/30 transition-all duration-300">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      📉 Downside Case
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-2">
                    {displayResult.downsideCase?.explanation}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1 pt-1.5 border-t border-darkBorder/20">
                  <Badge variant="red" className="text-[8px] px-2 py-0.5 uppercase tracking-wider font-semibold">
                    Clarity: {displayResult.downsideCase?.clarity || 'Medium'}
                  </Badge>
                  <Badge variant="red" className="text-[8px] px-2 py-0.5 uppercase tracking-wider font-semibold">
                    Risk: {displayResult.downsideCase?.risk || 'Medium'}
                  </Badge>
                  <Badge variant="gray" className="text-[8px] px-2 py-0.5 uppercase tracking-wider font-semibold text-slate-400">
                    Confirm: {displayResult.downsideCase?.confirmation || 'Yes'}
                  </Badge>
                </div>
              </div>

              {/* 3. Sideways Case */}
              <div className="bg-slate-950/80 p-3 rounded-xl border-l-4 border-yellow-500 border border-darkBorder/40 flex flex-col justify-between min-h-[140px] hover:border-yellow-500/30 transition-all duration-300">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      ↕️ Sideways Case
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-2">
                    {displayResult.sidewaysCase?.explanation}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1 pt-1.5 border-t border-darkBorder/20">
                  <Badge variant="yellow" className="text-[8px] px-2 py-0.5 uppercase tracking-wider font-semibold">
                    Clarity: {displayResult.sidewaysCase?.clarity || 'High'}
                  </Badge>
                  <Badge variant="yellow" className="text-[8px] px-2 py-0.5 uppercase tracking-wider font-semibold">
                    Risk: {displayResult.sidewaysCase?.risk || 'Low'}
                  </Badge>
                  <Badge variant="gray" className="text-[8px] px-2 py-0.5 uppercase tracking-wider font-semibold text-slate-400">
                    Confirm: {displayResult.sidewaysCase?.confirmation || 'No'}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Report & Export Section */}
        <div className="shrink-0">
          <Card className="w-full bg-slate-950 border border-darkBorder/60">
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-xs uppercase tracking-wider text-slate-400">Report & Export</CardTitle>
              <CardDescription className="text-[10px]">Export technical analysis calculations and study notes to standard offline format</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 pt-2 border-t border-darkBorder/30">
              <div className="text-xs text-slate-400 leading-relaxed">
                {!activeAnalysisSnapshot ? (
                  <span className="text-slate-500 font-semibold">
                    ⚠️ No snapshot locked. Please click "Run Scan Analysis" to capture chart coordinates and compile the exportable report.
                  </span>
                ) : (
                  <span>
                    ✅ Snapshot locked for <strong className="font-mono text-slate-200">{activeAnalysisSnapshot.symbol}</strong> ({activeAnalysisSnapshot.timeframe}). Report includes all key study zones, indicators readings, and upside/downside scenario breakdowns.
                  </span>
                )}
              </div>
              <div className="relative group shrink-0">
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!activeAnalysisSnapshot}
                  onClick={handleDownloadReport}
                  icon={Download}
                  className="rounded-xl px-5"
                >
                  Download Technical Report
                </Button>
                {!activeAnalysisSnapshot && (
                  <span className="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-slate-900 text-slate-300 text-[10px] px-2.5 py-1 rounded-lg border border-darkBorder whitespace-nowrap shadow-xl z-20 font-sans">
                    Run analysis first
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 4. Explore 50+ Tools Section */}
        <div className="p-3 bg-gradient-to-r from-slate-950 to-slate-900 border border-darkBorder/60 rounded-xl flex items-center justify-between shrink-0 hover:border-cyan-500/20 transition-all duration-300">
          <div>
            <h4 className="text-xs font-bold text-white">Explore 50+ Tools</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Explore our comprehensive dictionary of 50+ indicators and dynamic risk formulas.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onSwitchToDirectory} className="text-cyan-400 hover:text-cyan-300 font-bold pr-0 text-[11px]">
            Explore 50+ Tools <ChevronRight className="w-3.5 h-3.5 inline" />
          </Button>
        </div>

        {/* 5. Safety / Compliance Note */}
        <div className="p-4 bg-red-950/15 border border-red-500/25 rounded-2xl text-xs text-red-400 flex items-start gap-3 select-none leading-relaxed shrink-0">
          <ShieldAlert className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
          <div>
            <span className="font-bold block text-white uppercase text-[10px] mb-1">Safety / Compliance Note</span>
            {!displayResult ? (
              <span>
                MarketPilot AI is an educational study simulator. Technical indicators and overlays are simulated calculations based on lookback coordinates and do not constitute financial advice, trade signals, or execution prompts. Users are solely responsible for managing their own capital risks.
              </span>
            ) : (
              <span>
                {displayResult.riskNote}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 4. Screenshot Calibration Modal */}
      <Modal
        isOpen={isCalibrating}
        onClose={() => setIsCalibrating(false)}
        title="Chart Screenshot Calibration"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-xs text-cyan-300 flex gap-2.5">
            <Sparkles className="w-4 h-4 shrink-0 text-cyan-400" />
            <p>
              By calibrating your uploaded screenshot, you specify asset contexts. The simulator parses visual wicks without generating automated signal overlays.
            </p>
          </div>

          <div className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Symbol Name"
                placeholder="e.g. BTC/USDT"
                value={calibrationData.symbol}
                onChange={(e) => setCalibrationData({ ...calibrationData, symbol: e.target.value })}
              />
              <Select
                label="Market Type"
                options={[
                  { value: 'crypto', label: 'Crypto' },
                  { value: 'equity', label: 'Equity' },
                  { value: 'forex', label: 'Forex' },
                  { value: 'index', label: 'Index' },
                  { value: 'commodity', label: 'Commodity' }
                ]}
                value={calibrationData.marketType}
                onChange={(e) => setCalibrationData({ ...calibrationData, marketType: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Timeframe"
                options={['1m', '5m', '15m', '30m', '1h', '4h', '1D', '1W', '1M']}
                value={calibrationData.timeframe}
                onChange={(e) => setCalibrationData({ ...calibrationData, timeframe: e.target.value })}
              />
              <Select
                label="Analysis Tool"
                options={[
                  { value: 'rsi', label: 'RSI' },
                  { value: 'macd', label: 'MACD' },
                  { value: 'bollinger_bands', label: 'Bollinger Bands' },
                  { value: 'sma', label: 'SMA' },
                  { value: 'ema', label: 'EMA' },
                  { value: 'trendline', label: 'Trendline' },
                  { value: 'volume', label: 'Volume' },
                  { value: 'horizontal_sr', label: 'Horizontal S/R' },
                  { value: 'candlestick_patterns', label: 'Candlestick Patterns' }
                ]}
                value={calibrationData.tool}
                onChange={(e) => setCalibrationData({ ...calibrationData, tool: e.target.value })}
              />
            </div>

            <Input
              label="Calibration Notes"
              placeholder="What do you want to understand from this chart?"
              value={calibrationData.note}
              onChange={(e) => setCalibrationData({ ...calibrationData, note: e.target.value })}
            />
          </div>

          <div className="pt-3 flex justify-end gap-2.5">
            <Button variant="secondary" onClick={() => setIsCalibrating(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={saveCalibration}>
              Confirm Calibration
            </Button>
          </div>
        </div>
      </Modal>
      {/* 5. AI Video Breakdown — 10-slide sequenced educational walkthrough */}
      <VideoBreakdown
        isOpen={isVideoOpen}
        scan={activeAnalysisSnapshot}
        isStale={isStale}
        onClose={handleCloseVideoBreakdown}
        onDownloadReport={handleDownloadReport}
      />
      {/* Legacy placeholder Modal — kept to avoid removing closing tag mismatch */}
      <Modal
        isOpen={false}
        onClose={() => {}}
        title=""
        size="xl"
        showClose={false}
      >
        {(() => {
          if (!activeAnalysisSnapshot) return null;

          const steps = generateVideoSteps(activeAnalysisSnapshot);
          if (steps.length === 0) return null;

          const currentStep = steps[Math.min(videoStepIdx, steps.length - 1)];
          const feedName = isStale ? 'Previous scan source' : (activeAnalysisSnapshot.mode === 'binance' ? 'Binance Spot Market Data' : (activeAnalysisSnapshot.mode === 'twelvedata' ? 'Twelve Data' : 'Demo Feed'));

          return (
            <div className="space-y-5 text-slate-300">
              {/* Header Subtitle and Metadata Row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-darkBorder/40 pb-3 -mt-2">
                <div>
                  <p className="text-xs text-slate-400 font-sans">Educational walkthrough of the latest scan — not financial advice.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="cyan" className="font-mono text-[10px] uppercase py-0.5 px-2">
                    {activeAnalysisSnapshot.toolName}
                  </Badge>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {activeAnalysisSnapshot.symbol} ({activeAnalysisSnapshot.timeframe}) | Feed: {feedName}
                  </span>
                </div>
              </div>

              {/* Warning Banner if stale */}
              {isStale && (
                <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 px-4 py-2.5 rounded-xl text-amber-400 text-xs shadow-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0 animate-pulse text-amber-500" />
                  <span className="font-medium">Chart changed. Run updated scan to refresh this breakdown.</span>
                </div>
              )}

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* LEFT COLUMN: Visual screen & Playback controller */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Virtual Video Screen / SVG Preview */}
                  <div className="relative aspect-video rounded-2xl bg-slate-950/90 border border-slate-800/80 flex flex-col items-center justify-center overflow-hidden shadow-inner group">
                    {/* SVG Chart Preview */}
                    <div className="absolute inset-0 p-4 pb-14 flex items-center justify-center bg-radial-gradient">
                      {renderMiniChartPreview(activeAnalysisSnapshot)}
                    </div>

                    {/* Translucent overlay caption box */}
                    <div className="absolute bottom-3 inset-x-3 bg-black/80 border border-white/5 p-2.5 rounded-xl text-center shadow-lg backdrop-blur-sm">
                      <p className="text-xs font-semibold text-slate-100 tracking-wide leading-relaxed animate-fade-in">
                        {currentStep.caption}
                      </p>
                    </div>

                    {/* Glossy Grid Scan Effect overlay if playing */}
                    {isVideoPlaying && !isStale && (
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent animate-scan z-10" />
                    )}
                  </div>

                  {/* Playback Controls & Progress bar */}
                  <div className="bg-[#111726]/40 border border-darkBorder/40 p-4 rounded-2xl space-y-3.5">
                    {/* Progress Bar & Indicators */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                        <span className="text-cyan-400 font-semibold uppercase tracking-wider">
                          {isStale ? "Analysis Stale" : isLessonCompleted ? "Lesson Completed" : isVideoPlaying ? "Playing Walkthrough" : "Walkthrough Paused"}
                        </span>
                        <span>
                          Section {videoStepIdx + 1} of {steps.length}
                        </span>
                      </div>
                      <div className="relative w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/60">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                          style={{ width: `${isLessonCompleted ? 100 : Math.round(((videoStepIdx + 1) / steps.length) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Audio & Settings Buttons line */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      {/* Left: Media Action buttons */}
                      <div className="flex items-center gap-2">
                        {isStale ? (
                          <button
                            onClick={() => {
                              handleCloseVideoBreakdown();
                              handleRunAnalysis();
                            }}
                            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-xs font-bold px-4 py-1.5 rounded-xl transition cursor-pointer shadow-md shadow-orange-950/20"
                          >
                            <Zap className="w-3.5 h-3.5 text-slate-950 animate-bounce" />
                            Run Updated Scan
                          </button>
                        ) : (
                          <>
                            {/* Play/Pause/Resume */}
                            {isLessonCompleted ? (
                              <button
                                onClick={handleRestartLesson}
                                className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white text-xs font-semibold px-4 py-1.5 rounded-xl transition cursor-pointer shadow-md shadow-purple-900/30"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Restart
                              </button>
                            ) : isVideoPlaying ? (
                              <button
                                onClick={handleTogglePlayPause}
                                className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white text-xs font-semibold px-4 py-1.5 rounded-xl transition cursor-pointer shadow-md shadow-cyan-900/30"
                              >
                                <Pause className="w-3.5 h-3.5" />
                                Pause
                              </button>
                            ) : (
                              <button
                                onClick={handleTogglePlayPause}
                                className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-slate-950 text-xs font-semibold px-4 py-1.5 rounded-xl transition cursor-pointer shadow-md shadow-cyan-500/20"
                              >
                                <Play className="w-3.5 h-3.5 fill-slate-950" />
                                {videoStepIdx > 0 ? "Resume" : "Play Lesson"}
                              </button>
                            )}

                            {/* Reset / Stop (visible when playing or paused, but not on step 0 if not playing) */}
                            {(isVideoPlaying || videoStepIdx > 0) && !isLessonCompleted && (
                              <button
                                onClick={handleRestartLesson}
                                className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-300 border border-slate-700/60 text-xs font-semibold px-3 py-1.5 rounded-xl transition cursor-pointer"
                                title="Reset Lesson to Step 1"
                              >
                                <Square className="w-3 h-3 fill-slate-300" />
                                Stop
                              </button>
                            )}
                          </>
                        )}
                      </div>

                      {/* Right: Audio options & Speed Controls */}
                      <div className="flex items-center gap-3">
                        {/* Text Only / Mute Toggle */}
                        <div className="flex items-center gap-1.5 border-r border-slate-800/80 pr-3">
                          {/* Audio Toggle */}
                          <button
                            onClick={() => setIsMuted(prev => !prev)}
                            disabled={isStale}
                            className={`p-1.5 rounded-lg border transition cursor-pointer ${
                              isMuted 
                                ? 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300' 
                                : 'bg-slate-900/60 border-slate-800 text-cyan-400 hover:bg-slate-800/50'
                            } ${isStale ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={isMuted ? "Unmute Voice Narration" : "Mute Voice Narration"}
                          >
                            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          </button>

                          {/* Text Only Switch */}
                          <button
                            onClick={() => setIsTextOnlyMode(prev => !prev)}
                            disabled={isStale}
                            className={`text-[10px] font-semibold px-2 py-1 rounded-lg border transition cursor-pointer ${
                              isTextOnlyMode
                                ? 'bg-purple-950/20 border-purple-500/20 text-purple-400'
                                : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200'
                            } ${isStale ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Toggle text-only layout with simulated intervals"
                          >
                            {isTextOnlyMode ? "Text Only" : "Text + Voice"}
                          </button>
                        </div>

                        {/* Speed dropdown wrapper */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-bold">Speed:</span>
                          <select
                            value={isPreset(speechRate) ? speechRate.toString() : 'custom'}
                            disabled={isStale}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === 'custom') {
                                setShowCustomSpeedInput(true);
                              } else {
                                setShowCustomSpeedInput(false);
                                const rate = parseFloat(val);
                                handleSelectPresetSpeed(rate);
                              }
                            }}
                            className={`bg-slate-950 border border-slate-800 rounded-xl text-xs px-2.5 py-1 text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer shadow-sm animate-fade-in ${
                              isStale ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <option value="0.2">0.2x Very Slow</option>
                            <option value="0.5">0.5x Slow</option>
                            <option value="1">1x Normal</option>
                            <option value="1.5">1.5x Faster</option>
                            <option value="2">2x Fast</option>
                            <option value="2.5">2.5x Very Fast</option>
                            <option value="3">3x Max</option>
                            <option value="custom">Custom...</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Custom Speed Slider/Input Box */}
                    {showCustomSpeedInput && !isStale && (
                      <div className="flex items-center justify-between gap-3 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 animate-slide-down">
                        <span className="text-[10px] text-slate-400 font-medium">Drag or enter custom speed (0.2x - 3.0x):</span>
                        <div className="flex items-center gap-2.5">
                          <input
                            type="range"
                            min="0.2"
                            max="3"
                            step="0.1"
                            value={speechRate}
                            onChange={(e) => handleCustomSpeedChange(e.target.value)}
                            className="w-24 h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                          />
                          <input
                            type="number"
                            min="0.2"
                            max="3"
                            step="0.05"
                            value={customSpeedVal}
                            onChange={(e) => handleCustomSpeedChange(e.target.value)}
                            onBlur={handleCustomSpeedBlur}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-1.5 py-0.5 text-xs text-white w-14 text-center focus:outline-none focus:border-cyan-500 font-mono font-bold"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Active Step Detailed Text Box */}
                  <div className="bg-[#111726]/30 border border-darkBorder/30 rounded-2xl p-4.5 space-y-3 shadow-inner">
                    <div className="flex items-center gap-2 border-b border-darkBorder/25 pb-2">
                      <span className="bg-cyan-950 border border-cyan-500/20 px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold text-cyan-400">
                        STEP {videoStepIdx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                        {currentStep.title.replace(/^\d+\.\s*/, '')}
                      </h4>
                    </div>

                    <div className="space-y-3 leading-relaxed">
                      <p className="text-xs text-slate-300 leading-relaxed font-sans text-justify">
                        {currentStep.detailedExplanation}
                      </p>

                      {/* Safety compliance note */}
                      <div className="bg-slate-950/50 rounded-xl p-3 border border-darkBorder/20 flex gap-2 items-start">
                        <ShieldAlert className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-slate-500 font-mono leading-normal">
                          Educational only. Not financial advice. No buy/sell signal. Real markets carry capital risk. Past simulation readings do not guarantee future success.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Interactive Lesson Checklist / Timeline */}
                <div className="lg:col-span-5 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                    Lesson Timeline
                  </h4>
                  
                  {/* Container for Checklist */}
                  <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1.5 custom-scrollbar scrollbar-thin">
                    {steps.map((st, i) => {
                      const isActive = i === videoStepIdx;
                      const isPast = i < videoStepIdx;
                      
                      return (
                        <div
                          key={i}
                          id={`video-step-${i}`}
                          onClick={() => {
                            setIsLessonCompleted(false);
                            setVideoStepIdx(i);
                          }}
                          className={`group flex items-start gap-2.5 p-2 md:p-2.5 rounded-xl border transition cursor-pointer text-left ${
                            isActive
                              ? 'bg-gradient-to-r from-cyan-950/30 to-purple-950/20 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.1)]'
                              : isPast
                                ? 'bg-slate-900/10 border-slate-900/40 text-slate-400 opacity-80 hover:opacity-100 hover:border-slate-800'
                                : 'bg-slate-950/20 border-slate-950/40 text-slate-500 hover:text-slate-300 hover:border-slate-900'
                          }`}
                        >
                          {/* Glowing Dot or Indicator */}
                          <div className="mt-0.5 shrink-0 flex items-center justify-center">
                            {isPast ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[8px] font-mono font-bold transition-all ${
                                isActive
                                  ? 'bg-cyan-500 border-cyan-400 text-slate-950 ring-2 ring-cyan-950 shadow-[0_0_8px_rgba(6,182,212,0.6)] animate-pulse'
                                  : 'border-slate-700 bg-slate-900 text-slate-400 group-hover:border-slate-500'
                              }`}>
                                {i + 1}
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 space-y-0.5 overflow-hidden">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-[11px] font-bold transition-colors leading-tight ${
                                isActive ? 'text-cyan-400 font-semibold' : 'text-slate-200'
                              }`}>
                                {st.title.replace(/^\d+\.\s*/, '')}
                              </span>
                              {isActive && (
                                <span className="text-[7px] text-cyan-400 uppercase tracking-widest font-bold font-mono animate-pulse">
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            <p className="text-[9px] text-slate-400 leading-snug truncate">
                              {st.caption}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Quick Player Help Stats */}
                  <div className="bg-[#111726]/10 border border-darkBorder/20 p-3 rounded-xl flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      Guided Lesson System v2.0
                    </span>
                    <span>
                      {availableVoices.length > 0 ? `${availableVoices.length} Web Voices Loaded` : "Simulated Timing"}
                    </span>
                  </div>
                </div>

              </div>

              {/* Action Buttons / Close bottom bar */}
              <div className="flex items-center justify-end gap-3 pt-3.5 border-t border-darkBorder/30">
                {isStale && (
                  <button
                    onClick={() => {
                      handleCloseVideoBreakdown();
                      handleRunAnalysis();
                    }}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer shadow-md"
                  >
                    <Zap className="w-3.5 h-3.5 fill-slate-950" />
                    Run Updated Scan
                  </button>
                )}
                <Button 
                  variant="secondary" 
                  size="md" 
                  onClick={handleCloseVideoBreakdown} 
                  className="px-5 py-2 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Close Lesson
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>

    </div>
  );
}
