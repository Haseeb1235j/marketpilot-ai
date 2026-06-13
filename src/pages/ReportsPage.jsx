import React, { useState, useEffect } from 'react';
import {
  Download,
  FileText,
  Sparkles,
  Cloud,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatTimestamp(iso) {
  if (!iso) return 'Unknown time';
  try {
    return new Date(iso).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return iso;
  }
}

function buildTxtReport(scan) {
  const line = (label, value) =>
    `${label.padEnd(22, ' ')}: ${value ?? 'N/A'}`;

  const sep = '─'.repeat(60);
  const dbl = '═'.repeat(60);

  const upside   = scan.clarity?.upside   ?? scan.upside   ?? 'N/A';
  const downside = scan.clarity?.downside ?? scan.downside ?? 'N/A';
  const sideways = scan.clarity?.sideways ?? scan.sideways ?? 'N/A';

  return [
    dbl,
    '  MARKETPILOT AI — EDUCATIONAL SCAN REPORT',
    `  Generated: ${formatTimestamp(scan.timestamp)}`,
    dbl,
    '',
    '[ SCAN DETAILS ]',
    sep,
    line('Symbol',       scan.symbol),
    line('Timeframe',    scan.timeframe),
    line('Tool',         scan.tool),
    line('Timestamp',    formatTimestamp(scan.timestamp)),
    '',
    '[ ANALYSIS ]',
    sep,
    line('Main Observation', ''),
    scan.mainObservation ?? scan.observation ?? 'N/A',
    '',
    line('Market Structure', ''),
    scan.marketStructure ?? 'N/A',
    '',
    line('Tool Reading', ''),
    scan.toolReading ?? 'N/A',
    '',
    '[ KEY WATCH ZONES ]',
    sep,
    scan.keyWatchZones ?? scan.watchZones ?? 'N/A',
    '',
    '[ WHAT TO WATCH ]',
    sep,
    scan.whatToWatch ?? 'N/A',
    '',
    '[ SCENARIO CLARITY ]',
    sep,
    line('Upside Case',   typeof upside   === 'number' ? `${upside}%`   : upside),
    line('Downside Case', typeof downside === 'number' ? `${downside}%` : downside),
    line('Sideways Case', typeof sideways === 'number' ? `${sideways}%` : sideways),
    '',
    '[ UPSIDE CASE ]',
    sep,
    scan.upsideCase ?? scan.bullCase ?? 'N/A',
    '',
    '[ DOWNSIDE CASE ]',
    sep,
    scan.downsideCase ?? scan.bearCase ?? 'N/A',
    '',
    '[ SIDEWAYS CASE ]',
    sep,
    scan.sidewaysCase ?? scan.flatCase ?? 'N/A',
    '',
    '[ BEGINNER EXPLANATION ]',
    sep,
    scan.beginnerExplanation ?? scan.explanation ?? 'N/A',
    '',
    '[ RISK NOTE ]',
    sep,
    scan.riskNote ?? 'N/A',
    '',
    dbl,
    '  DISCLAIMER',
    sep,
    scan.disclaimer ??
      'This report is generated for EDUCATIONAL PURPOSES ONLY. It does not',
    'constitute financial advice. Past performance is not indicative of future',
    'results. Always do your own research before making any trading decisions.',
    dbl,
    '',
    '  MarketPilot AI — Empowering Learners, Not Traders.',
    dbl,
  ].join('\n');
}

function downloadTxt(scan) {
  const content = buildTxtReport(scan);
  const blob    = new Blob([content], { type: 'text/plain' });
  const url     = URL.createObjectURL(blob);
  const a       = document.createElement('a');
  a.href        = url;
  a.download    = `MarketPilot_Report_${scan.symbol ?? 'scan'}_${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ClarityBar({ label, value, color }) {
  const num = typeof value === 'number' ? value : parseInt(value, 10) || 0;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-full h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${Math.min(num, 100)}%` }}
        />
      </div>
      <span className="text-2xl font-bold text-white">{num}%</span>
      <span className="text-xs text-slate-400 uppercase tracking-wider">{label}</span>
    </div>
  );
}

function StaleWarning({ scan }) {
  const activeSymbol    = localStorage.getItem('mp_symbol')    ?? '';
  const activeTimeframe = localStorage.getItem('mp_timeframe') ?? '';
  const activeTool      = localStorage.getItem('mp_tool')      ?? '';

  const isStale =
    (scan.symbol    && activeSymbol    && scan.symbol    !== activeSymbol)    ||
    (scan.timeframe && activeTimeframe && scan.timeframe !== activeTimeframe) ||
    (scan.tool      && activeTool      && scan.tool      !== activeTool);

  if (!isStale) return null;

  return (
    <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
      <p className="text-sm text-amber-300">
        <span className="font-semibold">Stale report — </span>
        This report was generated for a different symbol, timeframe, or tool than
        your current selection. Run a new scan to get an up-to-date report.
      </p>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [scan, setScan] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('mp_active_analysis');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          setScan(parsed);
        } else {
          setScan(null);
        }
      }
    } catch {
      setScan(null);
    }
  }, []);

  const upside   = scan?.clarity?.upside   ?? scan?.upside   ?? 0;
  const downside = scan?.clarity?.downside ?? scan?.downside ?? 0;
  const sideways = scan?.clarity?.sideways ?? scan?.sideways ?? 0;

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white">
      {/* ── Page wrapper ── */}
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">

        {/* ── Page Header ── */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/30">
              <FileText className="h-5 w-5 text-cyan-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Reports &amp; Export
            </h1>
          </div>
          <p className="text-slate-400 text-sm ml-[52px]">
            View, download, and manage your AI-generated educational scan reports.
          </p>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 1 — Latest Scan Report
        ════════════════════════════════════════════════════════════════ */}
        <section className="mb-8">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Latest Scan Report
          </h2>

          {/* ── Empty State ── */}
          {!scan ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-10 flex flex-col items-center justify-center text-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/10 to-teal-500/10 border border-cyan-500/20">
                <Sparkles className="h-8 w-8 text-cyan-400/70" />
              </div>
              <div>
                <p className="text-base font-medium text-slate-300 mb-1">
                  No scan reports yet
                </p>
                <p className="text-sm text-slate-500 max-w-sm">
                  Run your first AI Chart Scan to generate an educational report.
                </p>
              </div>
            </div>
          ) : (
            /* ── Scan Summary Card ── */
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">

              {/* Card header strip */}
              <div className="border-b border-white/10 bg-gradient-to-r from-cyan-500/5 to-teal-500/5 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Symbol badge */}
                  <span className="inline-flex items-center rounded-lg bg-cyan-500/15 border border-cyan-500/30 px-3 py-1 text-sm font-bold text-cyan-300 tracking-wide">
                    {scan.symbol ?? '—'}
                  </span>
                  {/* Timeframe badge */}
                  {scan.timeframe && (
                    <span className="inline-flex items-center rounded-lg bg-teal-500/15 border border-teal-500/30 px-2.5 py-1 text-xs font-semibold text-teal-300">
                      {scan.timeframe}
                    </span>
                  )}
                  {/* Tool badge */}
                  {scan.tool && (
                    <span className="inline-flex items-center rounded-lg bg-violet-500/15 border border-violet-500/30 px-2.5 py-1 text-xs font-semibold text-violet-300">
                      {scan.tool}
                    </span>
                  )}
                </div>

                {/* Timestamp */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatTimestamp(scan.timestamp)}</span>
                </div>
              </div>

              {/* Card body */}
              <div className="px-6 py-5 space-y-5">

                {/* Main Observation */}
                {(scan.mainObservation ?? scan.observation) && (
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-slate-500">
                      Main Observation
                    </p>
                    <p className="text-sm leading-relaxed text-slate-300">
                      {scan.mainObservation ?? scan.observation}
                    </p>
                  </div>
                )}

                {/* Market Structure */}
                {scan.marketStructure && (
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-slate-500">
                      Market Structure
                    </p>
                    <p className="text-sm leading-relaxed text-slate-300">
                      {scan.marketStructure}
                    </p>
                  </div>
                )}

                {/* ── Clarity Percentages ── */}
                <div>
                  <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Scenario Clarity
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-4">
                      <ClarityBar label="Upside"   value={upside}   color="bg-emerald-400" />
                    </div>
                    <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-4">
                      <ClarityBar label="Downside" value={downside} color="bg-rose-400" />
                    </div>
                    <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-4">
                      <ClarityBar label="Sideways" value={sideways} color="bg-amber-400" />
                    </div>
                  </div>
                </div>

                {/* Stale warning */}
                <StaleWarning scan={scan} />

                {/* ── Download Button ── */}
                <div className="pt-1">
                  <button
                    onClick={() => downloadTxt(scan)}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-900/30 transition-all duration-200 active:scale-[0.98]"
                  >
                    <Download className="h-4 w-4" />
                    Download TXT Report
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 2 — Saved Reports
        ════════════════════════════════════════════════════════════════ */}
        <section className="mb-8">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Saved Reports
          </h2>

          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-6 py-8 flex flex-col sm:flex-row items-center gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20">
              <Cloud className="h-7 w-7 text-violet-400" />
            </div>
            <div className="text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                <p className="text-sm font-semibold text-slate-200">Saved Reports</p>
                <span className="inline-flex items-center gap-1 rounded-md bg-violet-500/15 border border-violet-500/30 px-2 py-0.5 text-xs font-semibold text-violet-300">
                  Backend Required
                </span>
              </div>
              <p className="text-sm text-slate-400">
                Saved reports require cloud account storage.{' '}
                <span className="text-cyan-400 font-medium">Coming soon</span> with Supabase integration.
              </p>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 3 — Report Format Info
        ════════════════════════════════════════════════════════════════ */}
        <section className="mb-8">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Report Format
          </h2>

          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm divide-y divide-white/5">
            {/* Row 1 */}
            <div className="flex items-center gap-3 px-6 py-4">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <p className="text-sm text-slate-300">
                <span className="font-medium text-white">Current format:</span>{' '}
                TXT educational report
              </p>
            </div>
            {/* Row 2 */}
            <div className="flex items-center gap-3 px-6 py-4">
              <Clock className="h-4 w-4 shrink-0 text-amber-400" />
              <p className="text-sm text-slate-300">
                <span className="font-medium text-white">PDF export:</span>{' '}
                <span className="text-amber-300">Coming soon</span>
              </p>
            </div>
            {/* Row 3 */}
            <div className="flex items-center gap-3 px-6 py-4">
              <Cloud className="h-4 w-4 shrink-0 text-violet-400" />
              <p className="text-sm text-slate-300">
                <span className="font-medium text-white">Cloud sync:</span>{' '}
                <span className="inline-flex items-center gap-1 rounded-md bg-violet-500/15 border border-violet-500/30 px-2 py-0.5 text-xs font-semibold text-violet-300">
                  Backend Required
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            SAFETY NOTE
        ════════════════════════════════════════════════════════════════ */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-6 py-5 flex items-start gap-4">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <p className="text-sm font-semibold text-amber-300 mb-1">
              Educational Use Only
            </p>
            <p className="text-xs text-amber-400/80 leading-relaxed">
              All reports generated by MarketPilot AI are strictly for educational and
              learning purposes. Nothing in these reports constitutes financial advice,
              investment recommendations, or trading signals. Always consult a qualified
              financial advisor before making any investment decisions.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
