import { useState, useEffect, useRef } from 'react';
import { Download, RefreshCw, Star, Upload, Target, ShieldAlert, Sparkles, CheckCircle2, ChevronRight, X, AlertTriangle, MonitorPlay, Radar, Zap, Maximize2 } from 'lucide-react';
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

    if (changed) {
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

  // Generate/fetch candles on symbol, timeframe, or feed mode shift
  useEffect(() => {
    let active = true;

    // Always seed local data instantly so the UI never flashes empty
    const localData = generateSeededCandles(selectedSymbol, selectedTimeframe);
    setCandles(localData.candles);

    if (chartSource === 'live') {
      const currentItem = watchlist.find(w => w.symbol === selectedSymbol);
      const currentMarketType = currentItem ? currentItem.marketType : 'crypto';

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
        const freshSnapshot = {
          ...result,
          symbol: selectedSymbol,
          timeframe: selectedTimeframe,
          toolId: selectedTool,
          toolName: activeTool.name,
          chartSource: chartSource,
          marketType: currentMarketType,
          timestamp: new Date().toLocaleString()
        };
        
        setAnalysisResult(result);
        setActiveAnalysisSnapshot(freshSnapshot);
        setActiveChartSnapshot(capturedCandles);
        setActiveSymbolSnapshot(selectedSymbol);
        setActiveTimeframeSnapshot(selectedTimeframe);
        setActiveToolSnapshot(selectedTool);
        setActiveMarketTypeSnapshot(currentMarketType);
        setIsStale(false);
        
        // Clear storage indicator
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
          // Fade/clear scroll message after 4 seconds
          setTimeout(() => {
            setScrollMessage('');
          }, 4000);
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

  // Helper to generate the 9 lesson steps from the active analysis snapshot
  const generateVideoSteps = (snap) => {
    if (!snap) return [];

    const symbol = snap.symbol || 'Asset';
    const timeframe = snap.timeframe || '1h';
    const toolName = snap.toolName || 'technical indicators';

    return [
      {
        title: "1. Asset & Study Setup",
        caption: `Welcome to this technical analysis session on ${symbol} (${timeframe}) analyzing the ${toolName} indicator.`,
        detailedExplanation: `We are initiating a technical study session. The parameters are locked: Symbol is ${symbol}, Timeframe is ${timeframe}, and the active analytical overlay is ${toolName}. All data is simulated for classroom review and does not constitute financial advice.`,
        narration: `Welcome to this technical analysis session on ${symbol} on the ${timeframe} chart. Today we are studying the ${toolName} indicator.`,
        target: { type: 'price', value: snap.candles ? snap.candles[snap.candles.length - 1]?.close : 50 }
      },
      {
        title: "2. Chart & Price Overview",
        caption: "The chart displays candles representing recent lookback activity.",
        detailedExplanation: "Observing the general layout of the chart, recent history shows price movements between established boundaries. The candlestick body sizes and wick extensions provide structural clues about market interest.",
        narration: "Looking at the general layout, recent history shows price movements between established boundaries. The body sizes and wick extensions provide clues about market interest.",
        target: { type: 'price', value: snap.candles ? snap.candles[Math.max(0, snap.candles.length - 15)]?.close : 50 }
      },
      {
        title: "3. Primary Observation",
        caption: snap.mainObservation || "Reviewing key price patterns.",
        detailedExplanation: `Our primary educational observation is: ${snap.mainObservation || 'The chart is interacting with established support and resistance vectors.'} This pattern highlights where buyers and sellers have historically balanced.`,
        narration: `Our primary observation is: ${snap.mainObservation || 'The chart is interacting with established support and resistance vectors.'}`,
        target: { type: 'price', value: snap.candles ? snap.candles[Math.max(0, snap.candles.length - 5)]?.close : 50 }
      },
      {
        title: "4. Analytical Tool Reading",
        caption: snap.selectedToolReading || "The active indicator is displaying neutral values.",
        detailedExplanation: `The active technical tool (${toolName}) is calculated as follows: ${snap.selectedToolReading || 'The reading is in a neutral, balanced zone.'} This shows the relative strength, momentum, or volatility of recent candles.`,
        narration: `The calculated reading for ${toolName} is: ${snap.selectedToolReading || 'The reading is in a neutral, balanced zone.'}`,
        target: { type: 'indicator', value: snap.toolId }
      },
      {
        title: "5. Key Watch Zones",
        caption: `Monitoring critical price zones: ${snap.keyWatchZones || 'Support and resistance limits.'}`,
        detailedExplanation: `We identify major watch levels: ${snap.keyWatchZones || 'Support and resistance boundaries.'} These support and resistance thresholds act as key levels to watch for potential rejection or expansion scenarios.`,
        narration: `We are monitoring key structural levels: ${snap.keyWatchZones || 'Support and resistance boundaries.'}`,
        target: { type: 'price', value: snap.candles ? snap.candles[snap.candles.length - 1]?.close : 50 }
      },
      {
        title: "6. Simulated Upside Case",
        caption: `Upside Scenario: ${snap.upsideCase?.explanation || 'Watch for potential consolidation above resistance.'}`,
        detailedExplanation: `Under a simulated upside continuation scenario: ${snap.upsideCase?.explanation || 'A price breakout above the resistance ceiling requires expanding volume confirmation.'} (Estimated Clarity: ${snap.upsideCase?.clarity || 'Medium'}, Risk Profile: ${snap.upsideCase?.risk || 'Medium'}, Confirmation required: ${snap.upsideCase?.confirmation || 'Yes'}).`,
        narration: `Under a simulated upside continuation scenario, ${snap.upsideCase?.explanation || 'watch for a potential push above resistance.'}`,
        target: { type: 'price', value: snap.candles ? snap.candles[snap.candles.length - 1]?.close * 1.03 : 55 }
      },
      {
        title: "7. Simulated Downside Case",
        caption: `Downside Scenario: ${snap.downsideCase?.explanation || 'Watch for potential stabilization near support levels.'}`,
        detailedExplanation: `Under a simulated downside pullback scenario: ${snap.downsideCase?.explanation || 'A price slip below the support floor points to potential corrective testing.'} (Estimated Clarity: ${snap.downsideCase?.clarity || 'Medium'}, Risk Profile: ${snap.downsideCase?.risk || 'Medium'}, Confirmation required: ${snap.downsideCase?.confirmation || 'Yes'}).`,
        narration: `Under a simulated downside pullback scenario, ${snap.downsideCase?.explanation || 'watch for a potential test of support.'}`,
        target: { type: 'price', value: snap.candles ? snap.candles[snap.candles.length - 1]?.close * 0.97 : 45 }
      },
      {
        title: "8. Sideways Consolidation Case",
        caption: `Sideways Scenario: ${snap.sidewaysCase?.explanation || 'Price fluctuates within a narrow channel.'}`,
        detailedExplanation: `Under a simulated sideways or rangebound consolidation case: ${snap.sidewaysCase?.explanation || 'Price is expected to bounce between support and resistance.'} (Estimated Clarity: ${snap.sidewaysCase?.clarity || 'High'}, Risk Profile: ${snap.sidewaysCase?.risk || 'Low'}, Confirmation required: ${snap.sidewaysCase?.confirmation || 'No'}).`,
        narration: `Under a simulated sideways case, ${snap.sidewaysCase?.explanation || 'price fluctuates within a narrow channel.'}`,
        target: { type: 'price', value: snap.candles ? snap.candles[snap.candles.length - 1]?.close : 50 }
      },
      {
        title: "9. Study Risk & Conclusion",
        caption: `Compliance: ${snap.riskNote || 'Relying on a single technical tool can lead to false readings.'}`,
        detailedExplanation: `Technical parameters and indicators have inherent limits. ${snap.riskNote || 'Relying on a single technical indicator without checking overall structure or volume can lead to false interpretations.'} Always apply prudent risk controls and study multiple indicators together.`,
        narration: `Remember, technical indicators have inherent limits. ${snap.riskNote || 'Relying on a single technical indicator without checking overall structure or volume can lead to false interpretations.'}`,
        target: { type: 'price', value: snap.candles ? snap.candles[snap.candles.length - 1]?.close : 50 }
      }
    ];
  };

  // Upgraded speech states
  const [isMuted, setIsMuted] = useState(false);
  const [isTextOnlyMode, setIsTextOnlyMode] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.9);
  const [selectedVoiceName, setSelectedVoiceName] = useState('');
  const [availableVoices, setAvailableVoices] = useState([]);

  const synthRef = useRef(null);
  const utteranceRef = useRef(null);
  const timerRef = useRef(null);

  // Initialize SpeechSynthesis and load voices
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;

      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        const engVoices = voices.filter(v => v.lang.includes('en'));
        setAvailableVoices(engVoices);
        
        if (engVoices.length > 0) {
          // Sort or find preferred voice names containing high-quality keywords
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
    if (!synthRef.current || isMuted || isTextOnlyMode) {
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
      
      utterance.rate = speechRate; // speech speed rate controller
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

    if (isVideoPlaying) {
      if (isMuted || isTextOnlyMode) {
        // Fallback timer: 7 seconds if muted or text-only
        timerRef.current = setTimeout(() => {
          advanceNextStep();
        }, 7000);
      } else {
        // Speak narration
        speakText(currentStep.narration, () => {
          advanceNextStep();
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
    }
  };

  // Step playback handlers
  const handleNextStep = () => {
    const steps = generateVideoSteps(activeAnalysisSnapshot);
    if (videoStepIdx < steps.length - 1) {
      setVideoStepIdx(prev => prev + 1);
    } else {
      setIsVideoPlaying(false);
    }
  };

  const handlePrevStep = () => {
    if (videoStepIdx > 0) {
      setVideoStepIdx(prev => prev - 1);
    }
  };

  const handleTogglePlayPause = () => {
    setIsVideoPlaying(prev => !prev);
  };

  const handleRestartLesson = () => {
    stopSpeaking();
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setVideoStepIdx(0);
    setIsVideoPlaying(true);
  };

  // Synced voice controller effect
  useEffect(() => {
    // Disabled speech and timers to satisfy static walkthrough requirements
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Load from snapshot (kept visible even if settings differ or live data updates)
  const displayResult = analysisResult || activeAnalysisSnapshot;

  return (
    <div className="flex flex-col lg:flex-row grow w-full gap-5 p-4 md:p-6 bg-[#070b14]">
      
      {/* 1. Left Sidebar: Market controls and Watchlist */}
      <div className="w-full lg:w-[260px] shrink-0 flex flex-col gap-4">
        {/* Custom Symbol Adder */}
        <Card className="shrink-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Custom Symbol Input</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddCustomSymbol} className="space-y-3">
              <Input
                placeholder="e.g. AMZN, INFY"
                value={customSymbol}
                onChange={(e) => setCustomSymbol(e.target.value)}
                size="sm"
              />
              <div className="flex gap-2">
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
                  className="flex-1"
                />
                <Button type="submit" variant="glass" size="sm">
                  Add
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Local Settings Panel */}
        <Card className="shrink-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Scan Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Chart Source Toggle */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Feed Mode</label>
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-lg border border-darkBorder/80">
                <button
                  onClick={() => setChartSource('live')}
                  className={`py-1 text-[11px] font-semibold rounded-md cursor-pointer transition ${
                    chartSource === 'live' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Chart Feed
                </button>
                <button
                  onClick={() => setChartSource('screenshot')}
                  className={`py-1 text-[11px] font-semibold rounded-md cursor-pointer transition ${
                    chartSource === 'screenshot' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Screenshot
                </button>
              </div>
            </div>

            {/* Screenshot file upload */}
            {chartSource === 'screenshot' && (
              <div className="space-y-2">
                <label className="flex flex-col items-center justify-center border border-dashed border-darkBorder rounded-lg p-3 hover:border-cyan-500/50 transition cursor-pointer bg-slate-950/60">
                  <Upload className="w-5 h-5 text-slate-400 mb-1" />
                  <span className="text-[10px] font-semibold text-slate-400 text-center">
                    {screenshotFile ? screenshotFile.name : 'Upload chart image'}
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleScreenshotUpload} />
                </label>
                {screenshotPreview && (
                  <div className="relative rounded overflow-hidden border border-darkBorder h-20 bg-slate-900 flex items-center justify-center">
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
          <CardHeader className="pb-2">
            <div>
              <CardTitle>Educational Watchlist</CardTitle>
              <CardDescription>Select asset to study</CardDescription>
            </div>
          </CardHeader>

          {/* Watchlist Category Filter Tabs */}
          <div className="px-3 pb-2.5 border-b border-darkBorder/30">
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 rounded-xl border border-darkBorder/60">
              {[
                { id: 'crypto', label: 'Crypto' },
                { id: 'forex', label: 'Forex' },
                { id: 'commodity', label: 'Commodities' },
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
                    className={`py-1.5 text-[10px] font-bold rounded-lg cursor-pointer transition-all text-center ${
                      isActive
                        ? 'bg-slate-800 text-cyan-400 border border-cyan-800/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <CardContent className="max-h-[360px] overflow-y-auto px-1">
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
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Warning Banner if settings differ from snapshot */}
        {isStale && activeAnalysisSnapshot && (
          <div className="bg-amber-950/40 border border-amber-500/20 text-amber-300 rounded-xl px-4 py-3 text-xs flex items-center justify-between gap-3 shadow-lg backdrop-blur-md shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
              <span>
                Chart changed. Run analysis again to update report.
              </span>
            </div>
            <Button variant="glass" size="sm" onClick={handleRunAnalysis} className="text-[11px] py-1 border-amber-500/20 hover:bg-amber-500/10 text-amber-200">
              Run Scan
            </Button>
          </div>
        )}

        {/* Timeframes Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950 border border-darkBorder rounded-2xl shrink-0">
          <div className="flex items-center gap-1 overflow-x-auto max-w-full">
            {['1m', '5m', '15m', '30m', '1h', '4h', '1D', '1W', '1M'].map((tf) => {
              const isActive = selectedTimeframe === tf;
              return (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
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
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold uppercase">Tool:</span>
            <select
              value={selectedTool}
              onChange={(e) => setSelectedTool(e.target.value)}
              className="bg-slate-900 border border-darkBorder rounded-lg text-xs font-semibold text-slate-300 px-3 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
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
        <div className="flex flex-col gap-3.5 p-3.5 bg-slate-950 border border-darkBorder rounded-2xl shrink-0 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Left Column: Hero Run Scan Button & Full View */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                disabled={scanState === 'scanning'}
                onClick={handleRunAnalysis}
                className={`relative overflow-hidden group px-6 py-3 rounded-2xl font-bold text-sm tracking-wide transition-all duration-300 transform active:scale-95 shadow-xl select-none cursor-pointer flex items-center justify-center gap-2.5 min-w-[210px]
                  ${scanState === 'scanning'
                    ? 'bg-slate-900 border border-darkBorder text-slate-500 cursor-not-allowed shadow-none'
                    : isStale && activeAnalysisSnapshot
                      ? 'bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 hover:from-teal-400 hover:via-cyan-400 hover:to-blue-400 text-white shadow-cyan-500/20 hover:shadow-cyan-400/40 border border-cyan-400/30 hover:-translate-y-0.5 animate-pulse'
                      : 'bg-gradient-to-r from-cyan-600 via-teal-500 to-cyan-500 hover:from-cyan-500 hover:via-teal-400 hover:to-cyan-400 text-white shadow-cyan-500/10 hover:shadow-cyan-400/30 border border-cyan-400/20 hover:-translate-y-0.5'
                  }
                `}
              >
                {/* Shine Overlay */}
                {scanState !== 'scanning' && (
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine pointer-events-none" />
                )}
                
                {/* Glow background */}
                {scanState !== 'scanning' && (
                  <span className={`absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 opacity-25 group-hover:opacity-45 transition duration-300 -z-10 ${
                    isStale && activeAnalysisSnapshot ? 'animate-pulse-glow' : 'blur-md'
                  }`} />
                )}

                {/* Icon */}
                {scanState === 'scanning' ? (
                  <Radar className="w-4 h-4 text-cyan-400 animate-spin" />
                ) : scanState === 'ready' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 animate-bounce" />
                ) : isStale && activeAnalysisSnapshot ? (
                  <Zap className="w-4 h-4 text-amber-300 animate-bounce" />
                ) : (
                  <Sparkles className="w-4 h-4 text-cyan-200 group-hover:rotate-12 transition-transform duration-300" />
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
                size="md"
                onClick={() => setIsFullViewOpen(true)}
                className="hover:bg-slate-800 text-slate-300 border border-slate-700/80 rounded-xl"
                icon={Maximize2}
              >
                Full View
              </Button>
            </div>

            {/* Right Column: Secondary Actions (Report, Video, Reset) */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative group">
                <Button
                  variant="glass"
                  size="md"
                  disabled={!activeAnalysisSnapshot}
                  onClick={handleOpenVideoBreakdown}
                  className={`rounded-xl transition ${
                    !activeAnalysisSnapshot
                      ? 'opacity-50 cursor-not-allowed border-slate-800 text-slate-500 bg-slate-950/60'
                      : 'border-purple-500/20 text-purple-400 hover:bg-purple-500/10'
                  }`}
                  icon={MonitorPlay}
                >
                  Video Breakdown
                </Button>
                {!activeAnalysisSnapshot && (
                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-slate-300 text-[10px] px-2.5 py-1 rounded-lg border border-darkBorder whitespace-nowrap shadow-xl z-20 font-sans">
                    Run scan analysis first
                  </span>
                )}
              </div>

              <div className="relative group">
                <Button
                  variant="secondary"
                  size="md"
                  disabled={!activeAnalysisSnapshot}
                  onClick={handleDownloadReport}
                  icon={Download}
                  className={`rounded-xl ${
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
                size="md"
                onClick={handleReset}
                className="hover:bg-slate-900 text-slate-500 hover:text-slate-300 border border-transparent hover:border-slate-800/40 rounded-xl"
                icon={RefreshCw}
              >
                Reset
              </Button>
            </div>
          </div>

          {/* Helper Feedback Message */}
          {!activeAnalysisSnapshot && (
            <div className="text-[10px] text-slate-500 text-right pr-2">
              * Run scan analysis first to enable technical report download.
            </div>
          )}
        </div>

        {/* Main Candlestick Chart */}
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
            <span>Binance data unavailable for this symbol/timeframe. Switched to demo feed.</span>
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
            <CardHeader className="pb-3 border-b border-darkBorder/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="text-base text-white">AI Scan Results</CardTitle>
                <CardDescription>Educational breakdown of indicator calculations and market context</CardDescription>
              </div>
              {displayResult && (
                <Badge variant="cyan" className="font-mono text-xs uppercase py-0.5 self-start sm:self-auto">
                  {displayResult.toolName} ({displayResult.timeframe})
                </Badge>
              )}
            </CardHeader>
            
            <CardContent className="pt-5">
              {!displayResult ? (
                /* Clean Empty State */
                <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-900 border border-darkBorder/60 flex items-center justify-center text-xl text-slate-500">
                    🔍
                  </div>
                  <p className="text-sm font-medium text-slate-400">
                    Run scan analysis to generate educational chart breakdown.
                  </p>
                </div>
              ) : (
                /* Filled State */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {displayResult.chartSource === 'screenshot' && (
                    <div className="lg:col-span-2 bg-yellow-950/20 border border-yellow-500/20 rounded-xl p-3 flex items-start gap-2.5">
                      <ShieldAlert className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-yellow-400">Requires Backend AI Vision Integration</h4>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          Automated visual scanning of uploaded chart images requires a secure backend connection to OpenAI Vision APIs. Currently showing simulated educational calibration coordinates.
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="space-y-4">
                    {/* Main Observation */}
                    <div className="bg-[#111726]/40 p-4 rounded-xl border border-darkBorder/40">
                      <h5 className="font-bold text-white flex items-center gap-1.5 text-xs uppercase tracking-wider text-cyan-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Main Observation
                      </h5>
                      <p className="text-slate-300 mt-2.5 leading-relaxed text-xs">
                        {displayResult.mainObservation}
                      </p>
                    </div>

                    {/* Technical Reading */}
                    <div className="bg-[#111726]/40 p-4 rounded-xl border border-darkBorder/40">
                      <h5 className="font-bold text-white flex items-center gap-1.5 text-xs uppercase tracking-wider text-cyan-400">
                        📊 Selected Tool Reading
                      </h5>
                      <p className="text-slate-300 mt-2.5 leading-relaxed text-xs">
                        {displayResult.selectedToolReading}
                      </p>
                    </div>

                    {/* Beginner Explanation */}
                    <div className="bg-cyan-950/10 p-4 rounded-xl border border-cyan-500/10">
                      <h5 className="font-bold text-white flex items-center gap-1.5 text-xs uppercase tracking-wider text-cyan-400">
                        💡 Beginner Explanation
                      </h5>
                      <p className="text-slate-300 mt-2.5 leading-relaxed text-xs">
                        {displayResult.beginnerExplanation}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Market Structure */}
                    <div className="bg-[#111726]/40 p-4 rounded-xl border border-darkBorder/40">
                      <h5 className="font-bold text-white flex items-center gap-1.5 text-xs uppercase tracking-wider text-cyan-400">
                        <Target className="w-3.5 h-3.5 animate-pulse" />
                        Market Structure
                      </h5>
                      <p className="text-slate-300 mt-2.5 leading-relaxed text-xs">
                        {displayResult.marketStructure}
                      </p>
                    </div>

                    {/* Key Watch Zones */}
                    <div className="bg-[#111726]/40 p-4 rounded-xl border border-darkBorder/40">
                      <h5 className="font-bold text-white flex items-center gap-1.5 text-xs uppercase tracking-wider text-cyan-400">
                        🔑 Key Watch Zones
                      </h5>
                      <p className="text-slate-300 mt-2.5 leading-relaxed text-xs font-mono">
                        {displayResult.keyWatchZones}
                      </p>
                    </div>

                    {/* What to Watch */}
                    <div className="bg-[#111726]/40 p-4 rounded-xl border border-darkBorder/40">
                      <h5 className="font-bold text-white flex items-center gap-1.5 text-xs uppercase tracking-wider text-cyan-400">
                        👁️ What to Watch
                      </h5>
                      <p className="text-slate-300 mt-2.5 leading-relaxed text-xs">
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
              <div className="bg-slate-950/80 p-4 rounded-2xl border-l-4 border-emerald-500 border border-darkBorder/40 flex flex-col justify-between min-h-[160px] hover:border-emerald-500/30 transition-all duration-300">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      📈 Upside Case
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {displayResult.upsideCase?.explanation}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-darkBorder/20">
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
              <div className="bg-slate-950/80 p-4 rounded-2xl border-l-4 border-red-500 border border-darkBorder/40 flex flex-col justify-between min-h-[160px] hover:border-red-500/30 transition-all duration-300">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      📉 Downside Case
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {displayResult.downsideCase?.explanation}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-darkBorder/20">
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
              <div className="bg-slate-950/80 p-4 rounded-2xl border-l-4 border-yellow-500 border border-darkBorder/40 flex flex-col justify-between min-h-[160px] hover:border-yellow-500/30 transition-all duration-300">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      ↕️ Sideways Case
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {displayResult.sidewaysCase?.explanation}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-darkBorder/20">
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
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Report & Export</CardTitle>
              <CardDescription>Export technical analysis calculations and study notes to standard offline format</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-darkBorder/30">
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
        <div className="p-4 bg-gradient-to-r from-slate-950 to-slate-900 border border-darkBorder/60 rounded-2xl flex items-center justify-between shrink-0 hover:border-cyan-500/20 transition-all duration-300">
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
      {/* 5. Narrated Video Walkthrough Lesson Modal */}
      <Modal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        title={`Video Breakdown: Technical Study on ${activeAnalysisSnapshot?.symbol}`}
        size="lg"
        showClose={true}
      >
        {(() => {
          if (!activeAnalysisSnapshot) return null;

          const steps = generateVideoSteps(activeAnalysisSnapshot);

          return (
            <div className="space-y-6 text-slate-300">
              <div className="flex items-center justify-between bg-[#111726]/80 border border-purple-500/25 px-4 py-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <MonitorPlay className="w-5 h-5 text-purple-400" />
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Lesson Walkthrough Notes</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Educational step-by-step breakdown for {activeAnalysisSnapshot.symbol} ({activeAnalysisSnapshot.timeframe})</p>
                  </div>
                </div>
                <Badge variant="cyan" className="font-mono text-xs uppercase py-0.5 px-2">
                  {activeAnalysisSnapshot.toolName}
                </Badge>
              </div>

              {/* Steps List */}
              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {steps.map((st, i) => (
                  <div key={i} className="bg-[#111726]/40 p-4 rounded-xl border border-darkBorder/30 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider border-b border-darkBorder/25 pb-1.5">
                      <span className="bg-cyan-950 border border-cyan-500/20 px-2 py-0.5 rounded text-[10px] text-cyan-300">Step {i + 1}</span>
                      <span>{st.title.replace(/^\d+\.\s*/, '')}</span>
                    </div>
                    <div className="space-y-1.5 mt-2">
                      <p className="text-xs font-semibold text-slate-200">
                        Summary: {st.caption}
                      </p>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {st.detailedExplanation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-darkBorder/30">
                <Button 
                  variant="secondary" 
                  size="md" 
                  onClick={() => setIsVideoOpen(false)} 
                  className="px-5 py-2 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Close Walkthrough
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>

    </div>
  );
}
