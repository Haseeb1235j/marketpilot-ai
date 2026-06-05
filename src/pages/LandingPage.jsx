import React, { useState, useEffect } from 'react';
import {
  BarChart3, Sparkles, Shield, Download, Play, Zap, TrendingUp, Activity,
  CheckCircle2, ChevronRight, Star, ArrowRight, ShieldAlert, BookOpen,
  Gauge, Eye, MonitorPlay
} from 'lucide-react';

export default function LandingPage({ onEnterApp }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const features = [
    { icon: BarChart3, title: 'Live Binance Charts', desc: 'Real-time candlestick data for 15+ crypto pairs with WebSocket live updates.', color: 'text-cyan-400' },
    { icon: Sparkles, title: 'AI-Style Scan Reports', desc: 'Educational analysis of chart structure, momentum, and scenario cases.', color: 'text-purple-400' },
    { icon: BookOpen, title: '50+ Technical Tools', desc: 'Comprehensive library covering Trend, Momentum, Volume, Pattern tools and more.', color: 'text-emerald-400' },
    { icon: Eye, title: 'Scenario Clarity Cards', desc: 'Upside, Downside, and Sideways scenarios with educational clarity scores.', color: 'text-yellow-400' },
    { icon: MonitorPlay, title: 'Video Breakdown', desc: 'Turn every scan into a narrated step-by-step guided lesson.', color: 'text-pink-400' },
    { icon: Download, title: 'Download Reports', desc: 'Export structured educational scan reports as TXT files.', color: 'text-blue-400' },
    { icon: Gauge, title: 'Full View Chart Mode', desc: 'Expand charts to full screen for detailed candle analysis.', color: 'text-orange-400' },
    { icon: Shield, title: 'Screenshot Reference Mode', desc: 'Upload your own chart screenshots for visual reference study.', color: 'text-teal-400' },
  ];

  const steps = [
    { n: '01', title: 'Select Crypto Pair', desc: 'Choose from 15+ live Binance crypto pairs or add a custom symbol.' },
    { n: '02', title: 'Choose Timeframe', desc: 'From 1m scalp to 1M macro — any timeframe, any study depth.' },
    { n: '03', title: 'Choose Technical Tool', desc: 'Pick from RSI, MACD, Bollinger Bands, S&R, Trendlines and more.' },
    { n: '04', title: 'Run Scan Analysis', desc: 'One click generates the full educational chart breakdown.' },
    { n: '05', title: 'Review Scenario Cards', desc: 'Study upside, downside, and sideways educational cases.' },
    { n: '06', title: 'Watch Video Breakdown', desc: 'Follow along with a narrated guided lesson of the scan.' },
    { n: '07', title: 'Download Report', desc: 'Export your educational scan report for offline study.' },
  ];

  const toolCategories = [
    { name: 'Trend', tools: ['Moving Average', 'EMA', 'Trendline', 'ADX'], color: 'border-cyan-500/30 bg-cyan-500/5' },
    { name: 'Momentum', tools: ['RSI', 'MACD', 'Stochastic', 'CCI'], color: 'border-purple-500/30 bg-purple-500/5' },
    { name: 'Volume', tools: ['Volume', 'OBV', 'VWAP', 'MFI'], color: 'border-emerald-500/30 bg-emerald-500/5' },
    { name: 'Volatility', tools: ['Bollinger Bands', 'ATR', 'Keltner', 'Donchian'], color: 'border-yellow-500/30 bg-yellow-500/5' },
    { name: 'Support/Resistance', tools: ['Horizontal S/R', 'Pivot Points', 'Fibonacci', 'Supply/Demand'], color: 'border-orange-500/30 bg-orange-500/5' },
    { name: 'Price Action', tools: ['Candlesticks', 'Market Structure', 'Breakout', 'Retest'], color: 'border-pink-500/30 bg-pink-500/5' },
    { name: 'Pattern Tools', tools: ['Head & Shoulders', 'Double Top', 'Triangle', 'Wedge'], color: 'border-blue-500/30 bg-blue-500/5' },
    { name: 'Risk Tools', tools: ['R/R Calculator', 'Position Size', 'ATR Stop', 'Journal'], color: 'border-teal-500/30 bg-teal-500/5' },
  ];

  return (
    <div className="min-h-screen bg-[#060911] text-slate-200 overflow-x-hidden">
      {/* ============ HERO SECTION ============ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 text-center overflow-hidden">
        {/* Background glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

        {/* Disclaimer pill */}
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 text-xs text-amber-400 font-semibold mb-8">
          <ShieldAlert className="w-3.5 h-3.5" />
          Educational Platform — Not Financial Advice
        </div>

        {/* Main heading */}
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-cyan-950/50">
              M
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight">
              MarketPilot <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">AI</span>
            </h1>
          </div>

          <p className="text-xl md:text-2xl font-bold text-slate-200 mb-4 max-w-3xl mx-auto leading-tight">
            Educational Crypto Chart Analysis<br className="hidden md:block" />
            <span className="text-cyan-400"> with AI-Style Scan Reports</span>
          </p>

          <p className="text-sm md:text-base text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Study live crypto charts using technical tools, scenario cases, guided video breakdowns,
            and downloadable reports — all in one premium educational dashboard.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <button
              onClick={onEnterApp}
              className="group relative overflow-hidden px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-500 to-cyan-500 text-white font-bold text-sm shadow-lg shadow-cyan-900/30 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shine_1s_ease-in-out]" />
              <Sparkles className="w-4 h-4" />
              Start Free — Demo Mode
            </button>
            <button
              onClick={onEnterApp}
              className="px-8 py-3.5 rounded-2xl border border-slate-700 text-slate-300 font-bold text-sm hover:border-cyan-500/40 hover:text-white hover:bg-slate-900/60 transition-all duration-300 flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              View Demo
            </button>
            <button
              onClick={() => onEnterApp('pricing')}
              className="px-8 py-3.5 rounded-2xl border border-emerald-500/30 text-emerald-400 font-bold text-sm hover:bg-emerald-500/10 transition-all duration-300 flex items-center gap-2"
            >
              <Star className="w-4 h-4" />
              See Pricing
            </button>
          </div>

          {/* Hero Preview Card */}
          <div className="relative max-w-2xl mx-auto">
            {/* Glow behind card */}
            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/10 via-teal-500/10 to-emerald-500/10 rounded-3xl blur-xl" />

            <div className="relative bg-[#0a0f1d] border border-cyan-500/20 rounded-2xl p-5 shadow-2xl text-left">
              {/* Card top bar */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/60">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-slate-500 font-mono ml-2">BTC/USDT • 1h • RSI</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full font-semibold">Educational Only</span>
                  <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">Binance Data</span>
                </div>
              </div>

              {/* Fake chart bars */}
              <div className="flex items-end gap-1 h-20 mb-4 px-2">
                {[40, 55, 45, 62, 58, 70, 65, 75, 68, 80, 72, 85, 78, 90, 82, 88, 75, 92, 85, 95].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}%` }}
                    className={`flex-1 rounded-sm ${i % 3 === 0 ? 'bg-red-500/70' : 'bg-emerald-500/70'} transition-all duration-300`}
                  />
                ))}
              </div>

              {/* Scan result preview */}
              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                {[
                  { label: 'Upside Case', clarity: '72%', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5' },
                  { label: 'Downside Case', clarity: '58%', color: 'text-red-400 border-red-500/30 bg-red-500/5' },
                  { label: 'Sideways Case', clarity: '65%', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5' },
                ].map((c, i) => (
                  <div key={i} className={`border rounded-xl p-2 ${c.color}`}>
                    <div className="text-[8px] font-bold uppercase tracking-wider opacity-70">{c.label}</div>
                    <div className="text-sm font-black mt-0.5">CLARITY: {c.clarity}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={onEnterApp}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 text-white text-xs font-bold flex items-center justify-center gap-2 hover:from-cyan-500 hover:to-teal-400 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Run Scan Analysis
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">How It Works</span>
          <h2 className="text-3xl md:text-4xl font-black text-white mt-4 mb-3">From Chart to Educational Report<br />in 7 Simple Steps</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">No experience needed. Just select a crypto pair and let MarketPilot AI walk you through every step.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, i) => (
            <div key={i} className="relative group glass-card rounded-2xl p-5 hover:border-cyan-500/30 transition-all">
              <div className="text-4xl font-black text-slate-800 group-hover:text-cyan-900/60 transition mb-3">{step.n}</div>
              <h4 className="text-sm font-bold text-white mb-1.5">{step.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                  <ChevronRight className="w-4 h-4 text-slate-700" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ============ CORE FEATURES ============ */}
      <section className="py-20 px-4 bg-[#070b14]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">Core Features</span>
            <h2 className="text-3xl md:text-4xl font-black text-white mt-4 mb-3">Everything You Need to<br />Study Crypto Charts</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="glass-card rounded-2xl p-5 group hover:border-cyan-500/20 transition-all">
                  <div className={`w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${f.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1.5">{f.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ TOOL LIBRARY PREVIEW ============ */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">50+ Tool Library</span>
          <h2 className="text-3xl md:text-4xl font-black text-white mt-4 mb-3">Every Category of<br />Technical Analysis Covered</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {toolCategories.map((cat, i) => (
            <div key={i} className={`rounded-2xl border p-4 ${cat.color} group hover:scale-[1.02] transition-transform`}>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">{cat.name}</h4>
              <div className="space-y-1.5">
                {cat.tools.map((t, j) => (
                  <div key={j} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <CheckCircle2 className="w-3 h-3 text-slate-600 shrink-0" />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={onEnterApp}
            className="inline-flex items-center gap-2 text-sm font-bold text-cyan-400 hover:text-cyan-300 transition"
          >
            Explore Full 50+ Tool Library <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ============ VIDEO BREAKDOWN PREVIEW ============ */}
      <section className="py-20 px-4 bg-[#070b14]">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-pink-400 bg-pink-500/10 border border-pink-500/20 px-3 py-1 rounded-full">Video Breakdown</span>
          <h2 className="text-3xl md:text-4xl font-black text-white mt-4 mb-3">Turn Every Scan into a<br />Guided Lesson</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mb-10">
            MarketPilot AI's narrated video walkthrough breaks every scan into 8 educational steps with text and voice controls. Learn at your own pace with adjustable playback speed from 0.2x to 3x.
          </p>

          <div className="glass-card rounded-2xl p-6 border-pink-500/20 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">AI Video Breakdown</span>
              <span className="text-[10px] text-slate-500 font-mono">BTC/USDT • 1h • RSI</span>
            </div>
            <div className="space-y-2 mb-5">
              {['1. Intro', '2. Market Context', '3. Selected Tool', '4. Main Observation', '5. Key Zones', '6. Scenario Cases', '7. Risk Note', '8. Conclusion'].map((step, i) => (
                <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition ${i === 3 ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold' : 'text-slate-500'}`}>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[9px] font-bold shrink-0 ${i < 3 ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : i === 3 ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400' : 'border-slate-800 text-slate-600'}`}>
                    {i < 3 ? '✓' : i + 1}
                  </div>
                  {step}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl transition">
                <Play className="w-3 h-3 fill-slate-950" /> Play Lesson
              </button>
              <select className="bg-slate-950 border border-slate-800 rounded-xl text-xs px-2.5 py-2 text-slate-300 focus:outline-none cursor-pointer">
                <option>1x Normal</option>
                <option>1.5x Faster</option>
                <option>2x Fast</option>
              </select>
              <span className="text-[10px] text-slate-500 font-mono ml-auto">Step 4 of 8</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PRICING PREVIEW ============ */}
      <section className="py-20 px-4 max-w-4xl mx-auto text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">Pricing</span>
        <h2 className="text-3xl md:text-4xl font-black text-white mt-4 mb-3">Premium Access at<br />Accessible Pricing</h2>

        <div className="max-w-sm mx-auto mt-10">
          <div className="relative glass-card rounded-3xl p-8 border-emerald-500/30 text-center">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-emerald-500 text-white px-4 py-1 rounded-full">Pro Plan</span>
            </div>
            <div className="mt-4">
              <div className="text-5xl font-black text-white">₹49</div>
              <div className="text-slate-400 text-sm font-semibold">/month</div>
              <div className="text-xs text-slate-500 mt-1">Approx. $0.52/month</div>
            </div>
            <div className="mt-6 space-y-2.5 text-left text-xs text-slate-300">
              {[
                'Binance live crypto charts',
                'AI Scan Analysis',
                '50+ educational technical tools',
                'Scenario clarity score',
                'Video Breakdown narration',
                'Download Report (.txt)',
                'Full View chart mode',
                'Educational-only chart study',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <button
              onClick={() => onEnterApp('pricing')}
              className="mt-6 w-full py-3 rounded-2xl border border-emerald-500/30 text-emerald-400 font-bold text-sm hover:bg-emerald-500/10 transition"
            >
              Start Pro Soon
            </button>
            <p className="text-[10px] text-slate-600 mt-3">Coming Soon — Payments via Razorpay</p>
          </div>
        </div>
      </section>

      {/* ============ DISCLAIMER ============ */}
      <section className="py-16 px-4 bg-red-950/10 border-t border-red-500/10">
        <div className="max-w-3xl mx-auto text-center">
          <ShieldAlert className="w-8 h-8 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-3">Educational Disclaimer</h3>
          <p className="text-sm text-red-300/80 leading-relaxed">
            MarketPilot AI is an educational chart analysis tool. It does <strong>not</strong> provide financial advice,
            buy/sell signals, guaranteed predictions, or profit recommendations.
            All scan results, scenario cases, and clarity scores are for <strong>educational chart study only</strong>.
            Past chart patterns do not guarantee future market behavior.
            Always consult a qualified financial advisor before making investment decisions.
          </p>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="py-10 px-4 border-t border-slate-900 bg-[#060911]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center font-black text-white text-sm">M</div>
            <div>
              <div className="text-sm font-bold text-white">MarketPilot AI</div>
              <div className="text-[10px] text-slate-500">Educational Platform • v1.0.0</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-400">
            {[
              { label: 'Dashboard', section: 'dashboard' },
              { label: 'Pricing', section: 'pricing' },
              { label: 'Feedback', section: 'feedback' },
              { label: 'Disclaimer', section: 'compliance' },
              { label: 'Privacy', section: null },
              { label: 'Terms', section: null },
            ].map((link, i) => (
              <button
                key={i}
                onClick={() => link.section ? onEnterApp(link.section) : null}
                className="hover:text-cyan-400 transition cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="text-[10px] text-slate-600 text-center md:text-right">
            © 2025 MarketPilot AI<br />
            Educational use only. Not financial advice.
          </div>
        </div>
      </footer>
    </div>
  );
}
