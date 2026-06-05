import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  LogOut,
  Trash2,
  Database,
  Shield,
  Info,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ShieldAlert,
  RotateCcw,
} from 'lucide-react';

// ─── Helper: read env safely ────────────────────────────────────────────────
const env = (key, fallback = '') => {
  try {
    return import.meta.env?.[key] ?? fallback;
  } catch {
    return fallback;
  }
};

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Section wrapper with glass card */
const SectionCard = ({ icon: Icon, title, iconColor = 'text-cyan-400', children }) => (
  <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl overflow-hidden">
    {/* subtle top-edge highlight */}
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
    <div className="p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className={`p-2 rounded-lg bg-white/5 border border-white/10 ${iconColor}`}>
          <Icon size={18} />
        </div>
        <h2 className="text-base font-semibold text-white tracking-wide">{title}</h2>
      </div>
      {children}
    </div>
  </div>
);

/** Inline status row for API section */
const StatusRow = ({ label, status, color }) => {
  const colorMap = {
    green: 'text-emerald-400',
    gray: 'text-slate-400',
    purple: 'text-purple-400',
    yellow: 'text-amber-400',
    cyan: 'text-cyan-400',
  };
  const dotMap = {
    green: 'bg-emerald-400',
    gray: 'bg-slate-500',
    purple: 'bg-purple-400',
    yellow: 'bg-amber-400',
    cyan: 'bg-cyan-400',
  };
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
      <span className="text-sm text-slate-300">{label}</span>
      <span className={`flex items-center gap-1.5 text-xs font-medium ${colorMap[color]}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dotMap[color]} shrink-0`} />
        {status}
      </span>
    </div>
  );
};

/** Info row for App Info section */
const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
    <span className="text-sm text-slate-400">{label}</span>
    <span className="text-sm font-medium text-slate-200">{value}</span>
  </div>
);

// ─── Speed presets ────────────────────────────────────────────────────────────
const SPEED_PRESETS = [0.5, 1, 1.5, 2];
const SPEED_MIN = 0.2;
const SPEED_MAX = 3;
const SPEED_STEP = 0.1;
const LS_SPEED_KEY = 'marketpilot_video_speed';

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SettingsPage({ activeSession = {}, onLogout }) {
  const { mode = 'demo', user = 'Guest User', email = 'demo@marketpilot.ai' } = activeSession;

  // ── Video speed state ──
  const [speed, setSpeed] = useState(() => {
    const saved = localStorage.getItem(LS_SPEED_KEY);
    const parsed = parseFloat(saved);
    return !isNaN(parsed) && parsed >= SPEED_MIN && parsed <= SPEED_MAX ? parsed : 1;
  });

  useEffect(() => {
    localStorage.setItem(LS_SPEED_KEY, String(speed));
  }, [speed]);

  const handleSpeedChange = (e) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) setSpeed(val);
  };

  // ── Reset confirmation state ──
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  // ── Last scan time ──
  const [lastScanTime, setLastScanTime] = useState(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem('mp_active_analysis');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.timestamp) {
          setLastScanTime(new Date(parsed.timestamp).toLocaleString());
        } else {
          setLastScanTime('Unknown');
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const handleResetConfirmed = () => {
    setResetting(true);
    // Clear all mp_* and marketpilot_* keys
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('mp_') || key.startsWith('marketpilot_'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    setResetting(false);
    setShowConfirm(false);
    if (typeof onLogout === 'function') onLogout();
  };

  // ── API env values ──
  const marketDataMode = env('VITE_MARKET_DATA_MODE', 'demo');
  const binancePublic = env('VITE_BINANCE_PUBLIC_MODE', 'false') === 'true';

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* ── Page header ── */}
      <div className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Settings size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Settings</h1>
            <p className="text-xs text-slate-400 leading-tight">Manage your MarketPilot AI preferences</p>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ════════════════════════════════════════════
            1. ACCOUNT & SESSION
        ════════════════════════════════════════════ */}
        <SectionCard icon={User} title="Account & Session" iconColor="text-cyan-400">
          <div className="space-y-4">
            {/* Session mode badge */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Session Mode</span>
              {mode === 'cloud' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                  <Zap size={11} />
                  Cloud Mode
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                  <Shield size={11} />
                  Demo Mode
                </span>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-white/5" />

            {/* User info */}
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white font-bold text-base shrink-0 shadow-lg">
                {String(user).charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user}</p>
                <p className="text-xs text-slate-400 truncate mt-0.5">{email}</p>
              </div>
            </div>

            {/* Log out */}
            <button
              onClick={() => typeof onLogout === 'function' && onLogout()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-sm font-medium transition-all duration-200 active:scale-95"
            >
              <LogOut size={15} />
              Log Out
            </button>
          </div>
        </SectionCard>

        {/* ════════════════════════════════════════════
            2. VIDEO PLAYBACK
        ════════════════════════════════════════════ */}
        <SectionCard icon={Zap} title="Video Playback" iconColor="text-teal-400">
          <div className="space-y-5">
            {/* Speed label + value */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Playback Speed</span>
              <span className="px-3 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/25 text-cyan-300 text-sm font-bold tabular-nums">
                {speed.toFixed(1)}x
              </span>
            </div>

            {/* Slider */}
            <div className="relative">
              {/* Track fill indicator */}
              <div className="relative h-2 rounded-full bg-white/10">
                <div
                  className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-100"
                  style={{ width: `${((speed - SPEED_MIN) / (SPEED_MAX - SPEED_MIN)) * 100}%` }}
                />
              </div>
              <input
                type="range"
                min={SPEED_MIN}
                max={SPEED_MAX}
                step={SPEED_STEP}
                value={speed}
                onChange={handleSpeedChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                aria-label="Playback speed"
              />
            </div>

            {/* Min / Max labels */}
            <div className="flex justify-between text-xs text-slate-500">
              <span>{SPEED_MIN}x</span>
              <span>{SPEED_MAX}x</span>
            </div>

            {/* Preset buttons */}
            <div className="flex gap-2 flex-wrap">
              {SPEED_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setSpeed(preset)}
                  className={`flex-1 min-w-[3.5rem] py-2 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-95 border ${
                    speed === preset
                      ? 'bg-cyan-500/25 border-cyan-500/50 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {preset}x
                </button>
              ))}
            </div>

            <p className="text-xs text-slate-500">
              Preference is saved automatically and applied to all chart analysis videos.
            </p>
          </div>
        </SectionCard>

        {/* ════════════════════════════════════════════
            3. APP DATA
        ════════════════════════════════════════════ */}
        <SectionCard icon={Database} title="App Data" iconColor="text-rose-400">
          <div className="space-y-4">
            {/* Last scan time */}
            {lastScanTime && (
              <div className="flex items-center justify-between rounded-xl bg-white/5 border border-white/8 px-4 py-3">
                <span className="text-xs text-slate-400">Last Analysis Scan</span>
                <span className="text-xs font-medium text-slate-200">{lastScanTime}</span>
              </div>
            )}

            {/* Reset button */}
            {!showConfirm ? (
              <button
                onClick={() => setShowConfirm(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 text-sm font-medium transition-all duration-200 active:scale-95"
              >
                <Trash2 size={15} />
                Reset All Local Data
              </button>
            ) : (
              /* Inline confirmation dialog */
              <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 p-5 space-y-4 animate-fade-in">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={18} className="text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-rose-300 mb-1">Confirm Reset</p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      This will clear all saved scans, watchlist customizations, journal entries,
                      and session data. Are you sure?
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirm(false)}
                    disabled={resetting}
                    className="flex-1 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-all duration-200 active:scale-95 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResetConfirmed}
                    disabled={resetting}
                    className="flex-1 py-2 rounded-lg border border-rose-500/40 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {resetting ? (
                      <>
                        <RotateCcw size={12} className="animate-spin" />
                        Clearing…
                      </>
                    ) : (
                      <>
                        <Trash2 size={12} />
                        Yes, Reset
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            <p className="text-xs text-slate-500 leading-relaxed">
              Removes all locally cached data including scan history, watchlists, and journal
              entries. This action cannot be undone.
            </p>
          </div>
        </SectionCard>

        {/* ════════════════════════════════════════════
            4. API STATUS
        ════════════════════════════════════════════ */}
        <SectionCard icon={Shield} title="API Status" iconColor="text-violet-400">
          <div className="divide-y divide-white/5">
            <StatusRow
              label="Market Data Mode"
              status={marketDataMode.toUpperCase()}
              color={marketDataMode === 'binance' ? 'cyan' : 'yellow'}
            />
            <StatusRow label="Demo Feed" status="Ready" color="green" />
            <StatusRow
              label="Binance Public API"
              status={binancePublic ? 'Ready' : 'Disabled'}
              color={binancePublic ? 'green' : 'gray'}
            />
            <StatusRow label="Twelve Data" status="Not Configured" color="gray" />
            <StatusRow label="OpenAI Vision" status="Backend Required" color="purple" />
            <StatusRow label="Supabase" status="Not Configured" color="gray" />
            <StatusRow label="Razorpay" status="Coming Soon" color="gray" />
          </div>
        </SectionCard>

        {/* ════════════════════════════════════════════
            5. APP INFO
        ════════════════════════════════════════════ */}
        <SectionCard icon={Info} title="App Info" iconColor="text-sky-400">
          <div className="divide-y divide-white/5">
            <InfoRow label="Version" value="v1.0.0 (Stable)" />
            <InfoRow label="Build" value="Production" />
            <InfoRow label="Platform" value="Educational Chart Analysis" />
            <InfoRow label="Data" value="Binance Public API + Demo Feed" />
          </div>
        </SectionCard>

        {/* ════════════════════════════════════════════
            6. EDUCATIONAL DISCLAIMER
        ════════════════════════════════════════════ */}
        <SectionCard icon={ShieldAlert} title="Educational Disclaimer" iconColor="text-red-400">
          <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-4">
            <div className="flex items-start gap-3 mb-3">
              <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs font-semibold text-red-400 uppercase tracking-widest">
                Not Financial Advice
              </p>
            </div>
            <div className="space-y-3 text-xs text-slate-400 leading-relaxed">
              <p>
                MarketPilot AI is an <strong className="text-slate-300">educational platform</strong> designed
                solely to help users learn technical chart analysis concepts. All chart patterns,
                indicators, signals, and AI-generated analysis presented within this platform are
                for <strong className="text-slate-300">educational and informational purposes only</strong>.
              </p>
              <p>
                Nothing on this platform constitutes financial advice, investment advice, trading
                advice, or any other form of advice. You should not treat any of the platform's
                content as such.
              </p>
              <p>
                <strong className="text-slate-300">Past performance</strong> of any asset, strategy,
                or indicator does not guarantee or predict future results. Cryptocurrency and
                financial markets are highly volatile and involve substantial risk of loss.
              </p>
              <p>
                Always conduct your own research and consult a qualified financial professional
                before making any investment decisions. The creators of MarketPilot AI{' '}
                <strong className="text-slate-300">accept no liability</strong> for financial
                decisions made based on content from this platform.
              </p>
              <p>
                By using MarketPilot AI you acknowledge and agree that you understand the above
                disclaimer and that you use this platform entirely at your own risk.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* ── Footer ── */}
        <div className="flex flex-col items-center gap-1 py-4">
          <p className="text-xs text-slate-600">MarketPilot AI · v1.0.0</p>
          <p className="text-xs text-slate-700">© 2026 Educational Use Only</p>
        </div>

      </div>
    </div>
  );
}
