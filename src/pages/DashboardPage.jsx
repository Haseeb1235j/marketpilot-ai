import React, { useState, useEffect } from 'react';
import {
  Zap,
  BarChart2,
  TrendingUp,
  Clock,
  BookOpen,
  Cloud,
  AlertTriangle,
  CheckCircle2,
  Circle,
  ChevronRight,
  ScanLine,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Layers,
  LineChart,
  CandlestickChart,
  BarChart,
  Star,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Tiny design-system primitives
───────────────────────────────────────────── */
const GlassCard = ({ children, className = '' }) => (
  <div
    className={`
      rounded-2xl border border-white/10
      bg-white/5 backdrop-blur-md
      shadow-[0_8px_32px_rgba(0,0,0,0.4)]
      p-5 md:p-6
      ${className}
    `}
  >
    {children}
  </div>
);

const Badge = ({ children, variant = 'gray' }) => {
  const variants = {
    green:  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
    gray:   'bg-white/10 text-slate-400 border border-white/10',
    cyan:   'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40',
    red:    'bg-red-500/20 text-red-400 border border-red-500/40',
    yellow: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]}`}>
      {children}
    </span>
  );
};

const CyanButton = ({ children, onClick, className = '', size = 'md' }) => {
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-2 font-semibold rounded-xl
        bg-gradient-to-r from-cyan-500 to-teal-500
        hover:from-cyan-400 hover:to-teal-400
        text-slate-900 shadow-lg shadow-cyan-500/25
        transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]
        ${sizes[size]} ${className}
      `}
    >
      {children}
    </button>
  );
};

const OutlineButton = ({ children, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`
      inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg
      border border-cyan-500/50 text-cyan-400
      hover:bg-cyan-500/10 hover:border-cyan-400
      transition-all duration-150
      ${className}
    `}
  >
    {children}
  </button>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-xs text-slate-400 font-medium">{label}</label>}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="
        w-full bg-slate-800/80 border border-white/10 rounded-xl
        text-sm text-slate-200 px-3 py-2.5
        focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30
        transition-colors cursor-pointer
      "
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-slate-900">
          {o.label}
        </option>
      ))}
    </select>
  </div>
);

/* ─────────────────────────────────────────────
   Section-level card icons
───────────────────────────────────────────── */
const CardHeader = ({ icon: Icon, title, subtitle, accent = 'cyan' }) => {
  const accentMap = {
    cyan:   'text-cyan-400',
    teal:   'text-teal-400',
    red:    'text-red-400',
    green:  'text-emerald-400',
    purple: 'text-purple-400',
  };
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 shrink-0">
        <Icon size={18} className={accentMap[accent]} />
      </div>
      <div>
        <h3 className="text-base font-semibold text-slate-100 leading-tight">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   1. Welcome Card
───────────────────────────────────────────── */
const WelcomeCard = ({ name, onNavigate }) => (
  <GlassCard className="relative overflow-hidden col-span-full">
    {/* decorative glow */}
    <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
    <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-teal-500/8 blur-2xl pointer-events-none" />

    <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-teal-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
          <Zap size={26} className="text-cyan-400" />
        </div>
        <div>
          <p className="text-sm text-slate-400 font-medium mb-0.5">
            Welcome back, <span className="text-cyan-400 font-semibold">{name || 'Trader'}</span> 👋
          </p>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100 leading-snug">
            Welcome to MarketPilot AI
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Start by scanning a crypto chart to unlock AI-powered technical analysis.
          </p>
        </div>
      </div>

      <CyanButton onClick={() => onNavigate('scan')} size="lg" className="shrink-0">
        <ScanLine size={18} />
        Start AI Chart Scan
        <ChevronRight size={16} />
      </CyanButton>
    </div>

    {/* Stat pills */}
    <div className="relative mt-5 flex flex-wrap gap-3">
      {[
        { label: 'AI Tools', value: '9', icon: Activity },
        { label: 'Markets Tracked', value: '2', icon: BarChart2 },
        { label: 'Instant Analysis', value: '✓', icon: Zap },
      ].map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10"
        >
          <Icon size={13} className="text-cyan-400" />
          <span className="text-xs text-slate-400">{label}</span>
          <span className="text-xs font-bold text-slate-200">{value}</span>
        </div>
      ))}
    </div>
  </GlassCard>
);

/* ─────────────────────────────────────────────
   2. Market Data Status Card
───────────────────────────────────────────── */
const MarketStatusCard = () => {
  const sources = [
    {
      name: 'Binance Crypto',
      status: 'Ready',
      badge: 'green',
      desc: 'Live OHLCV • 500+ pairs',
      dot: 'bg-emerald-400',
      pulse: true,
    },
    {
      name: 'Demo Fallback',
      status: 'Ready',
      badge: 'green',
      desc: 'Offline / simulated data',
      dot: 'bg-emerald-400',
      pulse: false,
    },
    {
      name: 'Twelve Data',
      status: 'Future',
      badge: 'gray',
      desc: 'Stocks & Forex — planned',
      dot: 'bg-slate-600',
      pulse: false,
    },
    {
      name: 'Other Markets',
      status: 'Coming Later',
      badge: 'gray',
      desc: 'Commodities, indices…',
      dot: 'bg-slate-600',
      pulse: false,
    },
  ];

  return (
    <GlassCard>
      <CardHeader icon={Activity} title="Market Data Status" subtitle="Live feed availability" />
      <div className="space-y-3">
        {sources.map(({ name, status, badge, desc, dot, pulse }) => (
          <div
            key={name}
            className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                {pulse && (
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dot} opacity-60`} />
                )}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${dot}`} />
              </span>
              <div>
                <p className="text-sm font-medium text-slate-200">{name}</p>
                <p className="text-[11px] text-slate-500">{desc}</p>
              </div>
            </div>
            <Badge variant={badge}>{status}</Badge>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

/* ─────────────────────────────────────────────
   3. Quick Scan CTA Card
───────────────────────────────────────────── */
const SYMBOLS = [
  { value: 'BTCUSDT', label: 'BTC / USDT' },
  { value: 'ETHUSDT', label: 'ETH / USDT' },
  { value: 'BNBUSDT', label: 'BNB / USDT' },
  { value: 'SOLUSDT', label: 'SOL / USDT' },
  { value: 'XRPUSDT', label: 'XRP / USDT' },
  { value: 'DOGEUSDT', label: 'DOGE / USDT' },
];

const TIMEFRAMES = [
  { value: '1m', label: '1 Minute' },
  { value: '5m', label: '5 Minutes' },
  { value: '15m', label: '15 Minutes' },
  { value: '30m', label: '30 Minutes' },
  { value: '1h', label: '1 Hour' },
  { value: '4h', label: '4 Hours' },
  { value: '1D', label: '1 Day' },
  { value: '1W', label: '1 Week' },
  { value: '1M', label: '1 Month' },
];

const TOOLS = [
  { value: 'RSI', label: 'RSI' },
  { value: 'MACD', label: 'MACD' },
  { value: 'BollingerBands', label: 'Bollinger Bands' },
  { value: 'SR', label: 'Support & Resistance' },
  { value: 'EMA', label: 'EMA' },
  { value: 'SMA', label: 'SMA' },
  { value: 'Trendline', label: 'Trendline' },
  { value: 'Volume', label: 'Volume' },
  { value: 'Candlestick', label: 'Candlestick Patterns' },
];

const QuickScanCard = ({ onNavigate }) => {
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [timeframe, setTimeframe] = useState('1h');
  const [tool, setTool] = useState('RSI');

  const handleStartScan = () => {
    localStorage.setItem('mp_symbol', symbol);
    localStorage.setItem('mp_timeframe', timeframe);
    localStorage.setItem('mp_tool', tool);
    onNavigate('scan');
  };

  return (
    <GlassCard>
      <CardHeader
        icon={ScanLine}
        title="Quick Scan"
        subtitle="Configure and launch instantly"
        accent="teal"
      />
      <div className="space-y-4">
        <SelectField
          label="Asset Pair"
          value={symbol}
          onChange={setSymbol}
          options={SYMBOLS}
        />
        <SelectField
          label="Timeframe"
          value={timeframe}
          onChange={setTimeframe}
          options={TIMEFRAMES}
        />
        <SelectField
          label="Analysis Tool"
          value={tool}
          onChange={setTool}
          options={TOOLS}
        />
        <CyanButton onClick={handleStartScan} className="w-full justify-center mt-1" size="md">
          <ScanLine size={16} />
          Start Scan
        </CyanButton>
      </div>
    </GlassCard>
  );
};

/* ─────────────────────────────────────────────
   4. Latest Scan Summary Card
───────────────────────────────────────────── */
const ClarityIcon = ({ direction }) => {
  if (direction === 'upside')   return <ArrowUpRight size={16} className="text-emerald-400" />;
  if (direction === 'downside') return <ArrowDownRight size={16} className="text-red-400" />;
  return <Minus size={16} className="text-yellow-400" />;
};

const ClarityLabel = ({ direction, confidence }) => {
  const map = {
    upside:   { label: 'Bullish Clarity', color: 'text-emerald-400' },
    downside: { label: 'Bearish Clarity', color: 'text-red-400' },
    sideways: { label: 'Sideways / Ranging', color: 'text-yellow-400' },
  };
  const { label, color } = map[direction] || { label: 'Unknown', color: 'text-slate-400' };
  return (
    <span className={`font-semibold ${color}`}>
      {label}{confidence ? ` · ${confidence}%` : ''}
    </span>
  );
};

const LatestScanCard = () => {
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('mp_active_analysis');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          setAnalysis(parsed);
        } else {
          setAnalysis(null);
        }
      }
    } catch {
      setAnalysis(null);
    }
  }, []);

  const formatTs = (ts) => {
    if (!ts) return '—';
    try {
      return new Date(ts).toLocaleString(undefined, {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return ts; }
  };

  return (
    <GlassCard>
      <CardHeader
        icon={BarChart2}
        title="Latest Scan Summary"
        subtitle="Most recent AI analysis result"
      />

      {!analysis ? (
        <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-white/5 flex items-center justify-center">
            <BarChart2 size={24} className="text-slate-600" />
          </div>
          <p className="text-sm text-slate-400 max-w-xs">
            No scan yet. Run your first AI Chart Scan to see results here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Symbol + timeframe row */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="cyan">{analysis.symbol || '—'}</Badge>
            <Badge variant="gray">{analysis.timeframe || '—'}</Badge>
            <Badge variant="gray">{analysis.tool || '—'}</Badge>
          </div>

          {/* Clarity meters */}
          {['upside', 'downside', 'sideways'].map((dir) => {
            const val = analysis?.[dir] ?? analysis?.clarity?.[dir] ?? null;
            if (val == null) return null;
            const pct = typeof val === 'number' ? Math.min(100, Math.max(0, val)) : 0;
            const barColors = {
              upside:   'bg-emerald-500',
              downside: 'bg-red-500',
              sideways: 'bg-yellow-500',
            };
            return (
              <div key={dir} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-slate-400 capitalize">
                    <ClarityIcon direction={dir} />
                    {dir}
                  </span>
                  <span className="text-slate-300 font-semibold">{pct}%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColors[dir]} transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}

          {/* Timestamp */}
          {analysis.timestamp && (
            <p className="text-[11px] text-slate-500 flex items-center gap-1 pt-1">
              <Clock size={11} />
              Scanned {formatTs(analysis.timestamp)}
            </p>
          )}
        </div>
      )}
    </GlassCard>
  );
};

/* ─────────────────────────────────────────────
   5. Tool Library Preview Card
───────────────────────────────────────────── */
const TOOL_PREVIEW = [
  { name: 'Support & Resistance', icon: Layers, desc: 'Key price levels' },
  { name: 'Trendline', icon: TrendingUp, desc: 'Directional bias' },
  { name: 'RSI', icon: Activity, desc: 'Momentum oscillator' },
  { name: 'MACD', icon: BarChart, desc: 'Trend & momentum' },
  { name: 'EMA', icon: LineChart, desc: 'Exponential average' },
  { name: 'Bollinger Bands', icon: CandlestickChart, desc: 'Volatility bands' },
];

const ToolLibraryCard = ({ onNavigate }) => (
  <GlassCard>
    <CardHeader
      icon={BookOpen}
      title="Tool Library"
      subtitle="6 of 9 available tools"
      accent="purple"
    />
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {TOOL_PREVIEW.map(({ name, icon: Icon, desc }) => (
        <div
          key={name}
          className="
            flex items-center justify-between gap-2
            px-3 py-2.5 rounded-xl
            bg-white/5 border border-white/5
            hover:border-cyan-500/20 hover:bg-cyan-500/5
            transition-all group
          "
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Icon size={15} className="text-cyan-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{name}</p>
              <p className="text-[10px] text-slate-500">{desc}</p>
            </div>
          </div>
          <OutlineButton onClick={() => onNavigate('scan')}>
            Analyze
            <ChevronRight size={11} />
          </OutlineButton>
        </div>
      ))}
    </div>
    <button
      onClick={() => onNavigate('scan')}
      className="mt-4 w-full text-xs text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-1 transition-colors"
    >
      View all 9 tools
      <ChevronRight size={13} />
    </button>
  </GlassCard>
);

/* ─────────────────────────────────────────────
   6. Saved Reports Placeholder Card
───────────────────────────────────────────── */
const SavedReportsCard = () => (
  <GlassCard>
    <CardHeader icon={Cloud} title="Saved Reports" subtitle="Analysis history" accent="teal" />
    <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-white/5 flex items-center justify-center">
          <Cloud size={28} className="text-slate-600" />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
          <Star size={10} className="text-yellow-500" />
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-300">Account Storage Required</p>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
          Saved reports require account storage. This feature is coming soon — your analyses will sync across devices.
        </p>
      </div>
      <Badge variant="gray">Coming Soon</Badge>
    </div>
  </GlassCard>
);

/* ─────────────────────────────────────────────
   7. Safety / Disclaimer Note
───────────────────────────────────────────── */
const SafetyNote = () => (
  <div className="
    col-span-full
    rounded-2xl border border-red-500/30
    bg-red-500/5 backdrop-blur-md
    p-5 flex gap-3
  ">
    <div className="shrink-0 mt-0.5">
      <AlertTriangle size={18} className="text-red-400" />
    </div>
    <div>
      <p className="text-sm font-semibold text-red-400 mb-1">
        Educational Use Only — Not Financial Advice
      </p>
      <p className="text-xs text-slate-400 leading-relaxed">
        MarketPilot AI is a technical analysis learning platform. All chart scans, AI signals, and
        pattern identifications are purely educational and intended to help you <em>learn</em> how to
        read charts. Nothing on this platform constitutes financial, investment, or trading advice.
        Cryptocurrency markets are highly volatile. Always conduct your own due diligence and consult
        a qualified financial advisor before making any investment decisions. Past performance of any
        pattern or indicator does not guarantee future results.
      </p>
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   Main DashboardPage
───────────────────────────────────────────── */
const DashboardPage = ({ activeSession, onNavigate }) => {
  const userName =
    activeSession?.user ||
    activeSession?.name ||
    (activeSession?.email ? activeSession.email.split('@')[0] : null) ||
    'Trader';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Background texture */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-teal-500/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-slate-800/20 blur-3xl" />
      </div>

      {/* Page content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 md:px-6 md:py-10">

        {/* Page title */}
        <div className="mb-7">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <CheckCircle2 size={12} className="text-cyan-500" />
            MarketPilot AI — Dashboard
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100">
            Dashboard
            <span className="ml-3 text-sm font-normal text-slate-500">
              {new Date().toLocaleDateString(undefined, {
                weekday: 'long', month: 'long', day: 'numeric',
              })}
            </span>
          </h1>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Row 1: Full-width Welcome */}
          <WelcomeCard name={userName} onNavigate={onNavigate} />

          {/* Row 2: Market Status + Quick Scan */}
          <MarketStatusCard />
          <QuickScanCard onNavigate={onNavigate} />

          {/* Row 3: Latest Scan + Tool Library */}
          <LatestScanCard />
          <ToolLibraryCard onNavigate={onNavigate} />

          {/* Row 4: Saved Reports (half-width) */}
          <SavedReportsCard />

          {/* Row 5: Safety Note — full-width */}
          <SafetyNote />

        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
