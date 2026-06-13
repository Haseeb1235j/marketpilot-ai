import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  PlayCircle, PauseCircle, SkipForward, SkipBack, X,
  Globe, Database, Wrench, Eye, MapPin, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle, ShieldAlert, Activity, BarChart3,
  ChevronRight, Volume2, VolumeX
} from 'lucide-react';
import { generateAllSlides, getTotalDuration, formatTime } from './slideGenerators';
import { formatPrice } from '../../utils/priceFormatter';

// ─── Icon Map ──────────────────────────────────────────────────────────────
const ICON_MAP = {
  PlayCircle, Globe, Database, Wrench, Eye, MapPin,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
};

// ─── Slide Visual Components ───────────────────────────────────────────────

function VisualIntro({ data }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-3 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, #00D8FF 0px, transparent 1px, transparent 20px), repeating-linear-gradient(90deg, #00D8FF 0px, transparent 1px, transparent 20px)',
        }}
      />
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className="text-[11px] uppercase tracking-widest font-bold text-slate-500 mb-1">MarketPilot AI Educational Scan</div>
        <h2 className="text-3xl md:text-4xl font-black text-cyan-400 tracking-tight">{data.symbol}</h2>
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <span className="px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-bold">{data.timeframe}</span>
          <span className="px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-bold">{data.toolName}</span>
          <span className={`px-3 py-1 rounded-full border text-xs font-bold ${data.feedMode === 'live' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-amber-500/30 bg-amber-500/10 text-amber-400'}`}>
            {data.feedMode === 'live' ? 'LIVE' : 'DEMO'}
          </span>
        </div>
        <div className="text-3xl font-black text-white mt-2">{data.price}</div>
        <div className="text-[11px] text-slate-500 font-mono mt-1">Price at scan time • {data.scannedAt}</div>
        <div className="mt-3 px-4 py-2 rounded-xl border border-red-500/20 bg-red-950/20 text-[10px] text-red-400/80 font-medium max-w-xs text-center">
          Educational analysis only — not financial advice
        </div>
      </div>
    </div>
  );
}

function VisualContext({ data }) {
  return (
    <div className="grid grid-cols-1 gap-3 h-full">
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Globe className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">{data.marketLabel}</div>
            <div className="text-[10px] text-slate-500">{data.symbol} • {data.timeframe}</div>
          </div>
        </div>
        <div className="space-y-2">
          {[
            { label: 'Market Type', value: data.marketLabel, ok: true },
            { label: 'Trading Hours', value: data.hours, ok: true },
            { label: 'Candles Analyzed', value: `${data.candleCount} candles`, ok: true },
            { label: 'Volume Data', value: data.volumeAvailable ? 'Available' : 'Not available from provider', ok: data.volumeAvailable },
          ].map((row, i) => (
            <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/60 last:border-0">
              <span className="text-slate-500">{row.label}</span>
              <span className={`font-semibold ${row.ok ? 'text-emerald-400' : 'text-amber-400'}`}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VisualProvider({ data }) {
  const isLive = data.isLive;
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className={`px-6 py-3 rounded-2xl border text-2xl font-black tracking-widest ${isLive ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' : 'border-amber-500/40 bg-amber-500/10 text-amber-400'}`}>
        {isLive ? 'LIVE' : 'DEMO'}
      </div>
      <div className="text-center">
        <div className="text-lg font-bold text-white">{data.provider}</div>
        <div className="text-xs text-slate-400 mt-1">{isLive ? 'Live Market Data Feed' : 'Educational Demo Feed'}</div>
      </div>
      <div className="w-full glass-card rounded-xl p-4 space-y-2 text-xs">
        {[
          { label: 'Symbol', value: data.symbol },
          { label: 'Timeframe', value: data.timeframe },
          { label: 'Candles', value: data.candleCount },
          { label: 'Scanned at', value: data.scannedAt },
        ].map((r, i) => (
          <div key={i} className="flex justify-between border-b border-slate-800/40 pb-1.5 last:border-0 last:pb-0">
            <span className="text-slate-500">{r.label}</span>
            <span className="text-slate-200 font-mono">{r.value}</span>
          </div>
        ))}
      </div>
      <div className="text-[10px] text-slate-600 text-center max-w-xs">
        {isLive ? 'Real data used for educational study only' : 'Demo data — not real market prices'}
      </div>
    </div>
  );
}

function VisualToolReading({ data }) {
  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center gap-2 mb-1">
        <Wrench className="w-4 h-4 text-purple-400" />
        <span className="text-sm font-bold text-white">{data.toolName}</span>
      </div>
      {data.metrics.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {data.metrics.map((m, i) => (
            <div key={i} className="glass-card rounded-xl p-3">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{m.label}</div>
              <div className="text-lg font-black text-cyan-400">{m.value}</div>
              <div className="text-[10px] text-slate-400 mt-1 leading-tight">{m.context}</div>
            </div>
          ))}
          {Array.from({ length: Math.max(0, 4 - data.metrics.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="glass-card rounded-xl p-3 opacity-40">
              <div className="text-[10px] text-slate-600 uppercase tracking-wider mb-1">—</div>
              <div className="text-sm text-slate-600">Not available</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-xl p-4 text-center text-slate-500 text-xs">No metrics available for this tool</div>
      )}
      <div className="glass-card rounded-xl p-3 border-l-2 border-cyan-500/50">
        <p className="text-xs text-cyan-300/80 italic leading-relaxed">{data.reading}</p>
      </div>
    </div>
  );
}

function VisualObservation({ data }) {
  const getBarColor = (score) => score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="glass-card rounded-xl p-3 border-l-2 border-cyan-500/50">
        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Main Observation</div>
        <p className="text-xs text-slate-200 leading-relaxed">{data.observation}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Market Structure</span>
        <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold">{data.structure}</span>
      </div>
      {data.clarityScores?.length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Structure Clarity Scores</div>
          {data.clarityScores.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 w-28 shrink-0">{s.dimension}</span>
              <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${getBarColor(s.score)}`} style={{ width: `${s.score}%` }} />
              </div>
              <span className="text-[10px] font-bold text-slate-300 w-8 text-right">{s.score}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VisualZones({ data }) {
  const { zones, currentPrice, marketType, symbol } = data;
  const zonesAbove = zones.filter(z => z.price > currentPrice).sort((a, b) => a.price - b.price);
  const zonesBelow = zones.filter(z => z.price <= currentPrice).sort((a, b) => b.price - a.price);

  const strengthColor = { strong: 'text-red-400 border-red-500/30', moderate: 'text-orange-400 border-orange-500/30', weak: 'text-slate-400 border-slate-600/30' };
  const supportColor = { strong: 'text-emerald-400 border-emerald-500/30', moderate: 'text-teal-400 border-teal-500/30', weak: 'text-slate-400 border-slate-600/30' };

  return (
    <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1">
      {zonesAbove.map((z, i) => (
        <div key={`r-${i}`} className={`flex items-center justify-between glass-card rounded-xl px-3 py-2 border ${strengthColor[z.strength]}`}>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-red-400 uppercase">RES</span>
            <span className="text-xs text-slate-300">{z.label}</span>
            {z.touchCount > 1 && <span className="text-[9px] bg-red-500/10 border border-red-500/20 text-red-400 px-1.5 rounded-full">{z.touchCount}x</span>}
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-white font-mono">{formatPrice(z.price, marketType, symbol)}</div>
            <div className="text-[9px] text-slate-500 capitalize">{z.strength}</div>
          </div>
        </div>
      ))}
      <div className="flex items-center gap-2 py-1">
        <div className="flex-1 border-t border-dashed border-cyan-500/50" />
        <span className="text-[10px] text-cyan-400 font-mono font-bold shrink-0">{formatPrice(currentPrice, marketType, symbol)} ← Current</span>
        <div className="flex-1 border-t border-dashed border-cyan-500/50" />
      </div>
      {zonesBelow.map((z, i) => (
        <div key={`s-${i}`} className={`flex items-center justify-between glass-card rounded-xl px-3 py-2 border ${supportColor[z.strength]}`}>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-emerald-400 uppercase">SUP</span>
            <span className="text-xs text-slate-300">{z.label}</span>
            {z.touchCount > 1 && <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 rounded-full">{z.touchCount}x</span>}
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-white font-mono">{formatPrice(z.price, marketType, symbol)}</div>
            <div className="text-[9px] text-slate-500 capitalize">{z.strength}</div>
          </div>
        </div>
      ))}
      {zones.length === 0 && (
        <div className="text-center text-slate-500 text-xs py-6">No key zones identified for this scan</div>
      )}
    </div>
  );
}

function VisualScenario({ data, isUpside }) {
  const s = data.scenario;
  const color = isUpside ? { border: 'border-emerald-500/30', bg: 'bg-emerald-500/5', text: 'text-emerald-400', condBorder: 'border-cyan-500/30', condBg: 'bg-cyan-500/5' }
    : { border: 'border-red-500/30', bg: 'bg-red-500/5', text: 'text-red-400', condBorder: 'border-amber-500/30', condBg: 'bg-amber-500/5' };

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className={`glass-card rounded-xl p-3 border ${color.border} ${color.bg}`}>
        <div className="flex items-center gap-2 mb-2">
          {isUpside ? <TrendingUp className={`w-4 h-4 ${color.text}`} /> : <TrendingDown className={`w-4 h-4 ${color.text}`} />}
          <span className={`text-xs font-black uppercase tracking-wider ${color.text}`}>
            {isUpside ? '📈 Upside Scenario' : '📉 Downside Scenario'}
          </span>
        </div>
        <div className="text-sm font-bold text-white mb-1">{s?.title || (isUpside ? 'Upside Case' : 'Downside Case')}</div>
        <p className="text-xs text-slate-400 leading-relaxed">{s?.description || 'Educational scenario based on current chart structure.'}</p>
      </div>
      <div className={`glass-card rounded-xl p-3 border ${color.condBorder} ${color.condBg}`}>
        <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isUpside ? 'text-cyan-400' : 'text-amber-400'}`}>✓ Condition</div>
        <p className="text-xs text-slate-300">{s?.condition || 'Key structural levels hold'}</p>
      </div>
      <div className="glass-card rounded-xl p-3 border border-red-500/20 bg-red-500/5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-red-400 mb-1">✗ Invalidation</div>
        <p className="text-xs text-slate-300">{s?.invalidation || 'Structure breaks and reverses'}</p>
      </div>
      <div className="text-[10px] text-slate-600 text-center italic">Educational scenario only — not a prediction</div>
    </div>
  );
}

function VisualRisk({ data }) {
  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-bold text-white">Analysis Limitations</span>
      </div>
      <div className="space-y-2 flex-1">
        {(data.limitations || []).slice(0, 4).map((l, i) => (
          <div key={i} className="flex items-start gap-2 glass-card rounded-xl px-3 py-2">
            <AlertTriangle className="w-3 h-3 text-amber-400/70 mt-0.5 shrink-0" />
            <span className="text-xs text-slate-400 leading-relaxed">{l}</span>
          </div>
        ))}
      </div>
      <div className="glass-card rounded-xl p-3 border border-amber-500/20 bg-amber-500/5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1">Risk Note</div>
        <p className="text-xs text-slate-300 leading-relaxed">{data.riskNote || 'No single indicator can predict market movement. This is educational analysis only.'}</p>
      </div>
      {!data.volumeAvailable && (
        <div className="text-[10px] text-amber-400/70 text-center">⚠ Volume data unavailable from this provider</div>
      )}
    </div>
  );
}

function VisualSummary({ data, onDownloadReport }) {
  const clarityColor = data.overallClarity >= 70 ? 'text-emerald-400' : data.overallClarity >= 40 ? 'text-amber-400' : 'text-red-400';
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="text-2xl font-black text-white">{data.symbol}</div>
      <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
        {[
          { label: 'Timeframe', value: data.timeframe },
          { label: 'Tool', value: data.toolName },
          { label: 'Provider', value: data.provider },
          { label: 'Feed', value: data.feedMode === 'live' ? 'Live' : 'Demo' },
        ].map((item, i) => (
          <div key={i} className="glass-card rounded-xl p-3 text-center">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">{item.label}</div>
            <div className="text-xs font-bold text-slate-200 mt-1">{item.value}</div>
          </div>
        ))}
      </div>
      {data.overallClarity !== null && (
        <div className="flex flex-col items-center gap-1">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Structure Clarity</div>
          <div className={`text-4xl font-black ${clarityColor}`}>{data.overallClarity}<span className="text-lg">/100</span></div>
          <div className="text-[10px] text-slate-600 italic">Chart structure quality score — not a win probability</div>
        </div>
      )}
      <div className="text-[10px] text-slate-600 text-center max-w-xs italic leading-relaxed">
        MarketPilot AI educational scan. Not financial advice. No buy/sell signals.
      </div>
      {onDownloadReport && (
        <button onClick={onDownloadReport} className="text-[11px] font-bold text-cyan-400 border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 px-4 py-2 rounded-xl transition">
          Download Report
        </button>
      )}
    </div>
  );
}

// ─── Slide Visual Router ──────────────────────────────────────────────────
function SlideVisual({ slide, onDownloadReport }) {
  const { visualType, visualData } = slide;
  switch (visualType) {
    case 'intro': return <VisualIntro data={visualData} />;
    case 'context': return <VisualContext data={visualData} />;
    case 'provider': return <VisualProvider data={visualData} />;
    case 'tool_reading': return <VisualToolReading data={visualData} />;
    case 'observation': return <VisualObservation data={visualData} />;
    case 'zones': return <VisualZones data={visualData} />;
    case 'scenario_up': return <VisualScenario data={visualData} isUpside={true} />;
    case 'scenario_down': return <VisualScenario data={visualData} isUpside={false} />;
    case 'risk': return <VisualRisk data={visualData} />;
    case 'summary': return <VisualSummary data={visualData} onDownloadReport={onDownloadReport} />;
    default: return <div className="text-slate-500 text-xs text-center p-4">Visual not available</div>;
  }
}

// ─── Main VideoBreakdown Component ────────────────────────────────────────
const SPEED_PRESETS = [0.2, 0.5, 1, 1.5, 2, 2.5, 3];

export default function VideoBreakdown({ scan, isOpen, onClose, isStale = false, onDownloadReport }) {
  const [slides, setSlides] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(() => {
    const saved = localStorage.getItem('marketpilot_video_speed');
    const p = parseFloat(saved);
    return (p >= 0.2 && p <= 3) ? p : 1;
  });
  const [progress, setProgress] = useState(0);          // 0–1 within current slide
  const [wordProgress, setWordProgress] = useState(0);  // revealed word count
  const [elapsed, setElapsed] = useState(0);            // total seconds elapsed
  const [isMuted, setIsMuted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const rafRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedProgressRef = useRef(0);
  const synthRef = useRef(null);

  // Generate slides when scan changes
  useEffect(() => {
    if (scan) {
      const generated = generateAllSlides(scan);
      setSlides(generated);
    }
  }, [scan]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setCurrentIdx(0);
      setProgress(0);
      setWordProgress(0);
      setElapsed(0);
      setIsPlaying(false);
      setIsComplete(false);
      pausedProgressRef.current = 0;
      stopSpeech();
    } else {
      stopSpeech();
      cancelRaf();
    }
  }, [isOpen]);

  // Stop speech on close
  const stopSpeech = () => {
    if (synthRef.current && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const cancelRaf = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  // Start/stop RAF loop when play state changes
  useEffect(() => {
    if (!isPlaying || !slides.length || isComplete) {
      cancelRaf();
      stopSpeech();
      return;
    }

    const currentSlide = slides[currentIdx];
    if (!currentSlide) return;

    const slideDuration = currentSlide.duration / speed;
    const words = currentSlide.narration.trim().split(/\s+/);
    const totalWords = words.length;

    // Start speech
    if (!isMuted && window.speechSynthesis) {
      stopSpeech();
      const utterance = new SpeechSynthesisUtterance(currentSlide.narration);
      utterance.rate = speed;
      window.speechSynthesis.speak(utterance);
    }

    // RAF loop
    const startTime = performance.now() - pausedProgressRef.current * slideDuration * 1000;
    startTimeRef.current = startTime;

    const tick = (now) => {
      const elapsed = (now - startTime) / 1000;
      const p = Math.min(elapsed / slideDuration, 1);
      setProgress(p);
      setWordProgress(Math.floor(p * totalWords));

      // Update total elapsed (approximate)
      const prevSlidesDuration = slides.slice(0, currentIdx).reduce((sum, s) => sum + s.duration / speed, 0);
      setElapsed(prevSlidesDuration + elapsed);

      if (p >= 1) {
        pausedProgressRef.current = 0;
        advanceSlide();
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelRaf();
    };
  }, [isPlaying, currentIdx, speed, isMuted, slides]);

  const advanceSlide = useCallback(() => {
    setProgress(0);
    setWordProgress(0);
    pausedProgressRef.current = 0;
    stopSpeech();
    setCurrentIdx(prev => {
      if (prev < slides.length - 1) return prev + 1;
      setIsPlaying(false);
      setIsComplete(true);
      return prev;
    });
  }, [slides.length]);

  const handlePlayPause = () => {
    if (isComplete) {
      // Restart
      setCurrentIdx(0);
      setProgress(0);
      setWordProgress(0);
      setElapsed(0);
      pausedProgressRef.current = 0;
      setIsComplete(false);
      setIsPlaying(true);
      return;
    }
    if (isPlaying) {
      pausedProgressRef.current = progress;
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  };

  const handlePrev = () => {
    stopSpeech();
    cancelRaf();
    pausedProgressRef.current = 0;
    setProgress(0);
    setWordProgress(0);
    setIsComplete(false);
    setCurrentIdx(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    stopSpeech();
    cancelRaf();
    if (currentIdx >= slides.length - 1) {
      setIsPlaying(false);
      setIsComplete(true);
      return;
    }
    pausedProgressRef.current = 0;
    setProgress(0);
    setWordProgress(0);
    setCurrentIdx(prev => prev + 1);
  };

  const handleJumpToSlide = (idx) => {
    stopSpeech();
    cancelRaf();
    pausedProgressRef.current = 0;
    setProgress(0);
    setWordProgress(0);
    setIsComplete(false);
    setCurrentIdx(idx);
  };

  const handleSpeedChange = (s) => {
    setSpeed(s);
    localStorage.setItem('marketpilot_video_speed', s.toString());
    // Restart current slide timing
    pausedProgressRef.current = progress;
  };

  const handleClose = () => {
    stopSpeech();
    cancelRaf();
    setIsPlaying(false);
    onClose();
  };

  // ── Derived values ────────────────────────────────────────────────────
  const totalDuration = slides.reduce((sum, s) => sum + s.duration / speed, 0);
  const currentSlide = slides[currentIdx];

  // Word-by-word narration display
  const getNarrationDisplay = () => {
    if (!currentSlide) return null;
    const words = currentSlide.narration.trim().split(/\s+/);
    return words.map((word, i) => (
      <span key={i} className={`transition-all duration-150 ${i < wordProgress ? 'text-slate-200' : 'text-slate-700'}`}>
        {word}{' '}
      </span>
    ));
  };

  // ── Error states ──────────────────────────────────────────────────────
  if (!isOpen) return null;

  if (!scan) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="glass-panel rounded-2xl p-8 max-w-sm text-center">
          <Activity className="w-10 h-10 text-slate-500 mx-auto mb-4" />
          <h3 className="text-sm font-bold text-white mb-2">No Scan Available</h3>
          <p className="text-xs text-slate-400 mb-4">Run Scan Analysis first to view the educational breakdown.</p>
          <button onClick={handleClose} className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs hover:bg-slate-800 transition">Close</button>
        </div>
      </div>
    );
  }

  if (!slides.length) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="glass-panel rounded-2xl p-8 max-w-sm text-center">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-4" />
          <h3 className="text-sm font-bold text-white mb-2">Breakdown Unavailable</h3>
          <p className="text-xs text-slate-400 mb-4">This breakdown is incomplete due to missing scan data. Please re-run the analysis.</p>
          <button onClick={handleClose} className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs hover:bg-slate-800 transition">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 md:p-4">
      <div className="w-full max-w-4xl h-[95vh] md:h-[90vh] bg-[#08101e] border border-darkBorder/60 rounded-2xl flex flex-col overflow-hidden shadow-2xl">

        {/* ── Header ────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-darkBorder/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">AI Video Breakdown</h2>
              <p className="text-[10px] text-slate-500">{scan?.symbol} • {scan?.timeframe} • {scan?.toolName} — Educational Walkthrough</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isStale && (
              <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-semibold">Stale Snapshot</span>
            )}
            <button onClick={() => setIsMuted(m => !m)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <button onClick={handleClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Stale Warning ─────────────────────────── */}
        {isStale && (
          <div className="px-4 py-2 bg-amber-950/30 border-b border-amber-800/20 shrink-0">
            <p className="text-[11px] text-amber-400 font-medium text-center">
              ⚠ Chart data has changed since this scan. This breakdown reflects the scan snapshot — re-run scan to refresh.
            </p>
          </div>
        )}

        {/* ── Progress Dots ─────────────────────────── */}
        <div className="flex items-center justify-center gap-1.5 py-3 border-b border-darkBorder/20 shrink-0 flex-wrap px-4">
          {slides.map((s, i) => (
            <button
              key={i}
              onClick={() => handleJumpToSlide(i)}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                i === currentIdx
                  ? 'w-5 h-5 bg-cyan-500 ring-2 ring-cyan-500/30'
                  : i < currentIdx
                  ? 'w-3 h-3 bg-cyan-700'
                  : 'w-2.5 h-2.5 bg-slate-700 hover:bg-slate-500'
              }`}
              title={`Slide ${i + 1}: ${s.title}`}
            />
          ))}
          <span className="text-[10px] text-slate-500 ml-2 font-mono">{currentIdx + 1}/{slides.length}</span>
        </div>

        {/* ── Slide Title ───────────────────────────── */}
        <div className="px-4 py-2 border-b border-darkBorder/20 shrink-0">
          <div className="flex items-center gap-2">
            <ChevronRight className="w-3.5 h-3.5 text-cyan-500" />
            <h3 className="text-xs font-bold text-white">{currentSlide?.title}</h3>
          </div>
        </div>

        {/* ── Main Content Area ─────────────────────── */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Left: Slide Visual */}
          <div className="border-r border-darkBorder/20 p-4 overflow-y-auto">
            {currentSlide && <SlideVisual slide={currentSlide} onDownloadReport={onDownloadReport} />}
          </div>

          {/* Right: Narration + Key Points */}
          <div className="flex flex-col p-4 gap-3 overflow-y-auto">
            {/* Highlight value if present */}
            {currentSlide?.highlightValue && (
              <div className="text-center">
                <div className="inline-block px-4 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-lg font-black font-mono">
                  {currentSlide.highlightValue}
                </div>
              </div>
            )}

            {/* Narration text reveal */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="text-[13px] leading-7 text-slate-600 font-medium select-none">
                {getNarrationDisplay()}
              </div>
            </div>

            {/* Key points */}
            {currentSlide?.keyPoints?.length > 0 && (
              <div className="border-t border-darkBorder/30 pt-3 space-y-1.5">
                <div className="text-[10px] uppercase tracking-widest text-slate-600 font-bold mb-2">Key Points</div>
                {currentSlide.keyPoints.map((p, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                    <span className="text-cyan-600 mt-0.5 shrink-0">›</span>
                    <span className="leading-relaxed">{p}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Progress Bar ──────────────────────────── */}
        <div className="px-4 pt-2 shrink-0">
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden cursor-pointer">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full transition-all duration-100"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>

        {/* ── Playback Controls ─────────────────────── */}
        <div className="px-4 pb-4 pt-2 border-t border-darkBorder/20 shrink-0">
          <div className="flex items-center gap-3">
            {/* Prev */}
            <button onClick={handlePrev} disabled={currentIdx === 0} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition">
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Play/Pause */}
            <button onClick={handlePlayPause} className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition">
              {isComplete ? (
                <PlayCircle className="w-5 h-5" />
              ) : isPlaying ? (
                <PauseCircle className="w-5 h-5" />
              ) : (
                <PlayCircle className="w-5 h-5" />
              )}
            </button>

            {/* Next */}
            <button onClick={handleNext} disabled={isComplete} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition">
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Timer */}
            <span className="text-[11px] font-mono text-slate-500 mx-2">
              {formatTime(elapsed)} / {formatTime(totalDuration)}
            </span>

            {/* Speed selector */}
            <div className="flex items-center gap-1 ml-auto flex-wrap">
              {SPEED_PRESETS.map(s => (
                <button
                  key={s}
                  onClick={() => handleSpeedChange(s)}
                  className={`text-[10px] font-bold px-2 py-1 rounded-lg transition ${
                    speed === s ? 'bg-cyan-500 text-slate-950' : 'border border-slate-700 text-slate-400 hover:border-cyan-500/40 hover:text-slate-200'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Completion message */}
          {isComplete && (
            <div className="text-center mt-2 text-[11px] text-emerald-400 font-semibold animate-pulse">
              ✓ Breakdown complete — educational study finished
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
