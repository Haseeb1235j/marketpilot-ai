import React, { useEffect, useRef, useState } from 'react';
import { createChart, CrosshairMode, LineStyle, CandlestickSeries, HistogramSeries, LineSeries } from 'lightweight-charts';
import { Maximize2, Minimize2, BarChart2, X } from 'lucide-react';
import Button from './Button';
import Badge from './Badge';
import Modal from './Modal';

function getVisibleCandlesCount(timeframe) {
  const tf = timeframe.trim();
  if (tf === '1D' || tf === '1d') return 120;
  if (tf === '1W' || tf === '1w') return 80;
  if (tf === '1M' || tf === '1mo' || tf === '1Mo') return 60;
  return 180; // default for intraday (between 150 and 220)
}

export default function ChartContainer({
  candles = [],
  overlays = [],
  symbol = 'BTC/USDT',
  timeframe = '1h',
  chartSource = 'live',
  onScreenshotCalibration = null, // callback for screenshot calibration triggers
  isFullscreen: isFullscreenProp,
  onFullscreenToggle = null,
  selectedTool = '',
  feedStatus = null
}) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const [ohlc, setOhlc] = useState(null);
  const [isFullscreenLocal, setIsFullscreenLocal] = useState(false);
  const isFullscreen = isFullscreenProp !== undefined ? isFullscreenProp : isFullscreenLocal;
  const containerRef = useRef(null);
  const extraSeriesRef = useRef([]);
  const priceLinesRef = useRef([]);
  const [lastUpdatedTime, setLastUpdatedTime] = useState('');

  // Keep latest candles in a ref to avoid stale closures in subscriptions
  const candlesRef = useRef(candles);
  useEffect(() => {
    candlesRef.current = candles;
  }, [candles]);

  const prevSymbolRef = useRef(symbol);
  const prevTimeframeRef = useRef(timeframe);
  const prevFeedModeRef = useRef(feedStatus?.mode);

  // Keep track of the last updated time of the candle feed
  useEffect(() => {
    if (candles && candles.length > 0) {
      const now = new Date();
      const HH = String(now.getHours()).padStart(2, '0');
      const MM = String(now.getMinutes()).padStart(2, '0');
      const SS = String(now.getSeconds()).padStart(2, '0');
      setLastUpdatedTime(`${HH}:${MM}:${SS}`);
    }
  }, [candles]);

  // Handle OHLC values on hover or when candles change
  useEffect(() => {
    if (candles.length > 0) {
      setOhlc(candles[candles.length - 1]);
    }
  }, [candles]);

  // Trigger chart resize/fitContent when entering fullscreen
  useEffect(() => {
    if (isFullscreen && chartRef.current && chartContainerRef.current) {
      const timer = setTimeout(() => {
        const width = chartContainerRef.current.clientWidth;
        const height = chartContainerRef.current.clientHeight;
        if (width > 0 && height > 0) {
          chartRef.current.resize(width, height);
          chartRef.current.timeScale().fitContent();
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isFullscreen]);

  // Set up chart instances (run once per chartSource / isFullscreen layout toggle)
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Reset container DOM
    chartContainerRef.current.innerHTML = '';
    extraSeriesRef.current = [];
    candleSeriesRef.current = null;
    volumeSeriesRef.current = null;
    chartRef.current = null;

    // Skip charting if in uploaded screenshot mode (non-calibrated)
    if (chartSource === 'screenshot') {
      return;
    }

    const chartWidth = chartContainerRef.current.clientWidth || 600;
    const chartHeight = chartContainerRef.current.clientHeight || (isFullscreen ? window.innerHeight - 80 : 480);

    const chart = createChart(chartContainerRef.current, {
      width: chartWidth,
      height: chartHeight,
      layout: {
        background: { color: '#070b14' },
        textColor: '#9ca3af',
        fontSize: 11,
        fontFamily: 'Inter, sans-serif'
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.04)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.04)' }
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: 'rgba(6, 182, 212, 0.35)',
          width: 1,
          style: LineStyle.Dashed,
        },
        horzLine: {
          color: 'rgba(6, 182, 212, 0.35)',
          width: 1,
          style: LineStyle.Dashed,
        }
      },
      rightPriceScale: {
        borderColor: 'rgba(34, 45, 66, 0.6)',
        textColor: '#9ca3af',
        autoScale: true,
        visible: true
      },
      timeScale: {
        borderColor: 'rgba(34, 45, 66, 0.6)',
        timeVisible: true,
        secondsVisible: false,
        barSpacing: 10,
        rightOffset: 8,
        fixLeftEdge: false,
        fixRightEdge: false,
        lockVisibleTimeRangeOnResize: false,
        visible: true
      }
    });

    chartRef.current = chart;

    // Set dynamic vertical margins for price candles
    chart.priceScale('right').applyOptions({
      scaleMargins: {
        top: 0.1, // 10% space at top
        bottom: 0.2, // 20% space at bottom (above volume)
      },
    });

    // Add candlesticks
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
      priceLineVisible: true,
      priceLineColor: '#06b6d4',
    });
    candleSeriesRef.current = candlestickSeries;

    // Add Volume pane (overlay)
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // set as overlay pane
    });
    volumeSeriesRef.current = volumeSeries;
    extraSeriesRef.current.push(volumeSeries); // keep at index 0 for overlays hook tracking

    chart.priceScale('').applyOptions({
      scaleMargins: {
        top: 0.82, // volumes on bottom 18%
        bottom: 0,
      },
    });

    // Load initial candles data if available
    if (candlesRef.current.length > 0) {
      candlestickSeries.setData(candlesRef.current);
      
      const volumeData = candlesRef.current.map(c => ({
        time: c.time,
        value: c.volume,
        color: c.close >= c.open ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'
      }));
      volumeSeries.setData(volumeData);
      
      const total = candlesRef.current.length;
      const visibleCount = getVisibleCandlesCount(timeframe);
      setTimeout(() => {
        if (chartRef.current && total > 0) {
          chartRef.current.timeScale().setVisibleLogicalRange({
            from: total - visibleCount,
            to: total + 3
          });
        }
      }, 50);
    }

    // Track crosshair move for OHLC panel
    chart.subscribeCrosshairMove((param) => {
      if (param.time) {
        const data = param.seriesData.get(candlestickSeries);
        if (data) {
          // find matching original candle for volume and detail
          const match = candlesRef.current.find(c => c.time === param.time);
          setOhlc({
            time: param.time,
            open: data.open,
            high: data.high,
            low: data.low,
            close: data.close,
            volume: match ? match.volume : 0
          });
        }
      } else if (candlesRef.current.length > 0) {
        setOhlc(candlesRef.current[candlesRef.current.length - 1]);
      }
    });

    // Set up ResizeObserver with 100ms debounced fitContent
    let prevWidth = 0;
    let prevHeight = 0;
    let resizeTimeout = null;
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      const roundedWidth = Math.round(width);
      const roundedHeight = Math.round(height);
      if (roundedWidth > 0 && roundedHeight > 0 && (roundedWidth !== prevWidth || roundedHeight !== prevHeight)) {
        prevWidth = roundedWidth;
        prevHeight = roundedHeight;
        chart.resize(roundedWidth, roundedHeight);
        
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          if (chartRef.current) {
            chartRef.current.timeScale().fitContent();
          }
        }, 100);
      }
    });
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [chartSource, isFullscreen]);

  // Load candle data dynamically on active chart instance when candles change
  useEffect(() => {
    if (!chartRef.current || !candleSeriesRef.current || chartSource === 'screenshot') return;

    candleSeriesRef.current.setData(candles);

    if (volumeSeriesRef.current) {
      const volumeData = candles.map(c => ({
        time: c.time,
        value: c.volume,
        color: c.close >= c.open ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'
      }));
      volumeSeriesRef.current.setData(volumeData);
    }

    const isFeedModeChange = feedStatus?.mode !== prevFeedModeRef.current;
    const isSymbolOrTimeframeChange = 
      symbol !== prevSymbolRef.current || 
      timeframe !== prevTimeframeRef.current ||
      isFeedModeChange;

    if (isSymbolOrTimeframeChange) {
      prevSymbolRef.current = symbol;
      prevTimeframeRef.current = timeframe;
      prevFeedModeRef.current = feedStatus?.mode;

      // Set visible range to show recent candles only after fresh data loads
      const total = candles.length;
      const visibleCount = getVisibleCandlesCount(timeframe);
      setTimeout(() => {
        if (chartRef.current && total > 0) {
          chartRef.current.timeScale().setVisibleLogicalRange({
            from: total - visibleCount,
            to: total + 3 // 3 bars offset on the right
          });
        }
      }, 50);
    }
  }, [candles, chartSource, timeframe, symbol, feedStatus?.mode]);

  // Handle overlay drawing (lines, EMAs, BBs)
  useEffect(() => {
    if (!chartRef.current || !candleSeriesRef.current || chartSource === 'screenshot') return;

    // Clear price lines
    priceLinesRef.current.forEach(line => {
      try {
        candleSeriesRef.current.removePriceLine(line);
      } catch (e) {
        // Safe check
      }
    });
    priceLinesRef.current = [];
    
    // Clear and remove older line series
    extraSeriesRef.current.forEach(series => {
      try {
        if (series && series !== extraSeriesRef.current[0]) { // Don't delete volume histogram
          chartRef.current.removeSeries(series);
        }
      } catch (e) {
        // Safe check
      }
    });
    
    // Re-keep volume
    const vol = extraSeriesRef.current[0];
    extraSeriesRef.current = [vol];

    if (!overlays || overlays.length === 0) return;

    overlays.forEach(overlay => {
      if (overlay.type === 'horizontal_line') {
        const line = candleSeriesRef.current.createPriceLine({
          price: overlay.price,
          color: overlay.color,
          lineWidth: 1.5,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: overlay.label,
        });
        priceLinesRef.current.push(line);
      } else if (overlay.type === 'line') {
        // Draw trendline as a line series containing points between p1 and p2 times
        const trendlineSeries = chartRef.current.addSeries(LineSeries, {
          color: overlay.color,
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
          title: overlay.label
        });
        
        // Generate interpolated points along the line
        const p1Time = typeof overlay.p1.time === 'number' ? overlay.p1.time : 0;
        const p2Time = typeof overlay.p2.time === 'number' ? overlay.p2.time : 0;
        
        const filteredCandles = candles.filter(c => c.time >= p1Time && c.time <= p2Time);
        if (filteredCandles.length >= 2) {
          const tdiff = p2Time - p1Time;
          const pdiff = overlay.p2.price - overlay.p1.price;
          
          const lineData = filteredCandles.map(c => {
            const ratio = tdiff === 0 ? 0 : (c.time - p1Time) / tdiff;
            const price = overlay.p1.price + ratio * pdiff;
            return { time: c.time, value: price };
          });
          trendlineSeries.setData(lineData);
          extraSeriesRef.current.push(trendlineSeries);
        }
      } else if (overlay.type === 'series') {
        const sSeries = chartRef.current.addSeries(LineSeries, {
          color: overlay.color,
          lineWidth: 1.5,
          title: overlay.name
        });
        
        const sData = candles.map((c, idx) => ({
          time: c.time,
          value: overlay.data[idx]
        })).filter(d => d.value !== null && d.value !== undefined);
        
        sSeries.setData(sData);
        extraSeriesRef.current.push(sSeries);
      }
    });

  }, [overlays, candles, chartSource]);

  // Fullscreen helper toggle
  const toggleFullscreen = () => {
    if (onFullscreenToggle) {
      onFullscreenToggle();
    } else {
      setIsFullscreenLocal(!isFullscreenLocal);
    }
  };

  const chartEl = (
    <div
      ref={containerRef}
      className={`relative flex flex-col bg-[#111726] border border-darkBorder rounded-2xl overflow-hidden shadow-2xl ${
        isFullscreen 
          ? 'w-full h-full rounded-none border-none p-0 bg-[#070b14] overflow-hidden flex flex-col' 
          : 'w-full'
      }`}
    >
      {/* Chart Info Header Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 border-b border-darkBorder/60 bg-[#070b14]/95 backdrop-blur-md gap-2 shrink-0">
        {/* Symbol / Timeframe */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white tracking-wide">{symbol}</span>
          </div>
          <Badge variant="cyan" className="text-[9px] tracking-wider font-bold uppercase py-0.5">
            {timeframe}
          </Badge>
          {selectedTool && (
            <Badge variant="purple" className="text-[9px] tracking-wider font-bold uppercase py-0.5">
              {selectedTool}
            </Badge>
          )}
          {(() => {
            if (chartSource === 'screenshot') {
              return (
                <Badge variant="gray" className="text-[9px] tracking-wider font-bold uppercase py-0.5">
                  Screenshot Mode
                </Badge>
              );
            }

            return (
              <Badge variant={feedStatus?.isLive ? 'emerald' : 'cyan'} className="text-[9px] tracking-wider font-bold uppercase py-0.5">
                {feedStatus?.message || 'Demo Feed — connect API for live market data.'}
              </Badge>
            );
          })()}
        </div>

        {/* OHLC Row */}
        {chartSource === 'live' && ohlc && (
          <div className="flex flex-wrap items-center gap-3">
            {/* Highlighted Price Panel */}
            <div className="flex items-center gap-1 bg-slate-950 border border-darkBorder/80 px-2 py-0.5 rounded shrink-0">
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Last</span>
              <span className={`text-[11px] font-bold font-mono ${ohlc.close >= ohlc.open ? 'text-emerald-400' : 'text-red-400'}`}>
                {ohlc.close?.toFixed(2)}
              </span>
            </div>
            
            <div className="flex items-center gap-2.5 text-[10px] font-mono tracking-tight text-slate-400">
              <div>O: <span className={ohlc.close >= ohlc.open ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>{ohlc.open?.toFixed(2)}</span></div>
              <div>H: <span className="text-slate-200">{ohlc.high?.toFixed(2)}</span></div>
              <div>L: <span className="text-slate-200">{ohlc.low?.toFixed(2)}</span></div>
              <div>C: <span className={ohlc.close >= ohlc.open ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>{ohlc.close?.toFixed(2)}</span></div>
              <div className="hidden sm:inline">V: <span className="text-slate-300">{ohlc.volume?.toLocaleString()}</span></div>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {isFullscreen && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="flex items-center gap-1.5 px-3 py-1 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-400 border border-cyan-800/80 rounded-md font-semibold text-xs transition-all cursor-pointer"
            >
              Back to Dashboard
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className={`p-1 rounded cursor-pointer transition-all ${
              isFullscreen
                ? 'text-red-400 hover:text-red-300 hover:bg-red-950/20 border border-red-500/25 px-2.5 py-1'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isFullscreen ? (
              <span className="flex items-center gap-1 font-semibold text-xs">
                <X className="w-4 h-4 text-red-400" /> Close Full View
              </span>
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Disclaimer banner for Binance Spot data / Demo Feed / Twelve Data */}
      {chartSource === 'live' && (() => {
        const isCryptoSymbol = symbol && (symbol.includes('/USDT') || symbol.endsWith('USDT'));
        return (
          <div className="bg-[#0c101d] border-b border-darkBorder/40 px-4 py-1.5 text-[10px] text-slate-400 flex flex-wrap items-center justify-between gap-2 shrink-0 select-none">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${feedStatus?.isLive ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'}`}></span>
              <span className="truncate">
                {feedStatus?.isLive ? (
                  <>
                    {feedStatus?.mode === 'twelvedata' ? (
                      <>
                        <strong>Twelve Data feed active.</strong> Twelve Data availability may depend on symbol, market hours, interval, and plan limits.
                      </>
                    ) : (
                      <>
                        <strong>Binance Spot feed active.</strong> {feedStatus?.warning ? feedStatus.warning : "Prices may differ from broker/CFD platforms due to exchange source, spread, liquidity provider, and symbol type."}
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {feedStatus?.warning ? feedStatus.warning : (feedStatus?.message || 'Demo Feed — connect API for live market data.')}
                    {!isCryptoSymbol && (
                      <span className="text-slate-500 ml-1">
                        — Twelve Data availability may depend on symbol, market hours, interval, and plan limits.
                      </span>
                    )}
                  </>
                )}
              </span>
            </div>
            {lastUpdatedTime && (
              <div className="text-[9px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-darkBorder/30">
                {symbol} | {feedStatus?.isLive ? (feedStatus?.mode === 'twelvedata' ? 'Twelve Data' : 'Binance Spot') : 'Demo Feed'} | {timeframe} | Last updated: {lastUpdatedTime}
              </div>
            )}
          </div>
        );
      })()}

      {/* Main Chart Area */}
      {chartSource === 'screenshot' ? (
        <div 
          className={`relative w-full flex items-center justify-center bg-slate-950 p-6 ${isFullscreen ? 'min-h-0 flex-1' : 'h-[480px]'}`}
        >
          <div className="absolute inset-0 opacity-15 flex flex-col justify-between p-4 pointer-events-none select-none">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-full border-t border-dashed border-slate-700" />
            ))}
          </div>
          <div className="text-center max-w-sm glass-card p-6 border border-darkBorder flex flex-col items-center z-10 gap-3">
            <div className="w-12 h-12 rounded-full bg-cyan-900/40 border border-cyan-500/20 flex items-center justify-center text-xl">
              🖼️
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Uploaded Screenshot View</h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Calibration required to project overlay calculations. Text-based educational scans and report exports remain fully enabled.
              </p>
            </div>
            <Button variant="glass" size="sm" onClick={onScreenshotCalibration} className="mt-2 w-full text-xs">
              Calibrate Screenshot Area
            </Button>
          </div>
        </div>
      ) : (
        <div
          ref={chartContainerRef}
          className={`w-full bg-[#070b14] relative ${isFullscreen ? 'h-[calc(100vh-80px)]' : 'h-[480px]'}`}
        />
      )}
    </div>
  );

  if (isFullscreen) {
    return (
      <Modal isOpen={true} onClose={toggleFullscreen} size="fullscreen" showClose={false}>
        {chartEl}
      </Modal>
    );
  }
  return chartEl;
}
