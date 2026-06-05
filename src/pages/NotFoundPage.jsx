import React, { useState, useEffect } from 'react';
import { Home, BarChart3, Compass, ArrowLeft, HelpCircle } from 'lucide-react';

// ─── Animated floating particle ───────────────────────────────────────────────
const FloatingParticle = ({ delay = 0, x = 0, size = 4, opacity = 0.4 }) => {
  return (
    <div
      className="absolute rounded-full bg-cyan-400 pointer-events-none"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        bottom: '-10px',
        opacity,
        animation: `floatUp ${6 + delay}s ease-in-out ${delay}s infinite`,
      }}
    />
  );
};

// ─── Animated SVG chart with question marks ────────────────────────────────────
const AnimatedChartGraphic = () => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => (t + 1) % 60), 100);
    return () => clearInterval(id);
  }, []);

  // Bar heights oscillate slightly to look "alive"
  const bars = [
    { x: 28,  baseH: 60,  amp: 6,  phase: 0,   color: '#06b6d4' },
    { x: 58,  baseH: 90,  amp: 8,  phase: 1.2, color: '#14b8a6' },
    { x: 88,  baseH: 45,  amp: 5,  phase: 2.4, color: '#06b6d4' },
    { x: 118, baseH: 110, amp: 10, phase: 0.6, color: '#0e7490' },
    { x: 148, baseH: 75,  amp: 7,  phase: 1.8, color: '#14b8a6' },
    { x: 178, baseH: 55,  amp: 6,  phase: 3.0, color: '#06b6d4' },
  ];

  const chartBottom = 160;

  return (
    <div className="relative flex items-center justify-center w-full" style={{ height: 200 }}>
      {/* Glow backdrop */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-32 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <svg
        viewBox="0 0 240 180"
        width="100%"
        height="100%"
        className="max-w-xs mx-auto"
        style={{ filter: 'drop-shadow(0 0 18px rgba(6,182,212,0.35))' }}
      >
        {/* Grid lines */}
        {[40, 80, 120, 160].map(y => (
          <line
            key={y}
            x1="18"
            y1={y}
            x2="210"
            y2={y}
            stroke="rgba(6,182,212,0.12)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}

        {/* Axes */}
        <line x1="18" y1="10" x2="18" y2={chartBottom} stroke="rgba(6,182,212,0.4)" strokeWidth="1.5" />
        <line x1="18" y1={chartBottom} x2="210" y2={chartBottom} stroke="rgba(6,182,212,0.4)" strokeWidth="1.5" />

        {/* Bars */}
        {bars.map((b, i) => {
          const h = b.baseH + Math.sin((tick / 10) * Math.PI + b.phase) * b.amp;
          const y = chartBottom - h;
          return (
            <g key={i}>
              {/* Bar glow */}
              <rect
                x={b.x - 2}
                y={y - 2}
                width={20}
                height={h + 4}
                rx="3"
                fill={b.color}
                opacity="0.15"
                filter="url(#barBlur)"
              />
              {/* Bar */}
              <rect
                x={b.x}
                y={y}
                width={16}
                height={h}
                rx="3"
                fill={`url(#barGrad${i})`}
                opacity="0.85"
              />
              {/* Top cap shine */}
              <rect
                x={b.x}
                y={y}
                width={16}
                height={4}
                rx="2"
                fill="rgba(255,255,255,0.25)"
              />
            </g>
          );
        })}

        {/* Question marks floating over bars */}
        {bars.map((b, i) => {
          const h = b.baseH + Math.sin((tick / 10) * Math.PI + b.phase) * b.amp;
          const floatY = chartBottom - h - 22 + Math.sin((tick / 8) * Math.PI + i) * 4;
          return (
            <text
              key={`q${i}`}
              x={b.x + 8}
              y={floatY}
              textAnchor="middle"
              fontSize="13"
              fontWeight="bold"
              fill="rgba(6,182,212,0.9)"
              style={{ fontFamily: 'monospace' }}
            >
              ?
            </text>
          );
        })}

        {/* Defs: gradients + blur */}
        <defs>
          <filter id="barBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          {bars.map((b, i) => (
            <linearGradient key={`g${i}`} id={`barGrad${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={b.color} stopOpacity="1" />
              <stop offset="100%" stopColor={b.color} stopOpacity="0.4" />
            </linearGradient>
          ))}
        </defs>
      </svg>
    </div>
  );
};

// ─── Main 404 Page ─────────────────────────────────────────────────────────────
const NotFoundPage = ({ onNavigate }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const quickLinks = [
    {
      id: 'ai-chart-scan',
      label: 'AI Chart Scan',
      icon: <BarChart3 size={16} />,
      description: 'Analyse charts with AI',
    },
    {
      id: 'tools',
      label: 'Tools Directory',
      icon: <Compass size={16} />,
      description: 'Browse all trading tools',
    },
    {
      id: 'pricing',
      label: 'Pricing',
      icon: <HelpCircle size={16} />,
      description: 'Plans & subscriptions',
    },
  ];

  const particles = [
    { delay: 0,   x: 10, size: 3,  opacity: 0.3 },
    { delay: 1.2, x: 25, size: 5,  opacity: 0.45 },
    { delay: 2.4, x: 42, size: 3,  opacity: 0.25 },
    { delay: 0.8, x: 58, size: 6,  opacity: 0.35 },
    { delay: 3.1, x: 71, size: 4,  opacity: 0.4 },
    { delay: 1.7, x: 85, size: 3,  opacity: 0.3 },
    { delay: 0.4, x: 93, size: 5,  opacity: 0.2 },
  ];

  return (
    <div className="relative min-h-screen bg-gray-950 overflow-hidden flex flex-col items-center justify-center px-4 py-16">

      {/* ── Global keyframe injection ── */}
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0)   scale(1);   opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.6; }
          100% { transform: translateY(-100vh) scale(0.6); opacity: 0; }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%       { opacity: 0.9; transform: scale(1.06); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      {/* ── Background radial glows ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
            animation: 'pulseGlow 5s ease-in-out infinite',
          }}
        />
        <div
          className="absolute bottom-10 right-1/4 w-72 h-72 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(20,184,166,0.06) 0%, transparent 70%)',
          }}
        />
        {/* grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(6,182,212,1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* ── Floating particles ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p, i) => (
          <FloatingParticle key={i} {...p} />
        ))}
      </div>

      {/* ── Main content card ── */}
      <div
        className="relative z-10 w-full max-w-2xl"
        style={{
          animation: mounted ? 'fadeSlideUp 0.7s ease forwards' : 'none',
          opacity: mounted ? 1 : 0,
        }}
      >
        {/* Glassmorphism card */}
        <div
          className="rounded-2xl border border-gray-800/60 backdrop-blur-md p-8 md:p-12 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(17,24,39,0.85) 0%, rgba(9,16,28,0.9) 100%)',
            boxShadow: '0 0 0 1px rgba(6,182,212,0.08), 0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          {/* ── 404 number ── */}
          <div className="relative inline-block mb-2">
            {/* Glow behind the number */}
            <span
              className="absolute inset-0 blur-2xl text-8xl md:text-9xl font-black select-none"
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #14b8a6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                opacity: 0.35,
              }}
              aria-hidden="true"
            >
              404
            </span>
            <h1
              className="relative text-8xl md:text-9xl font-black tracking-tight select-none"
              style={{
                background: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 40%, #14b8a6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: 'none',
              }}
            >
              404
            </h1>
          </div>

          {/* ── Animated chart graphic ── */}
          <div className="my-4">
            <AnimatedChartGraphic />
          </div>

          {/* ── Text content ── */}
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">
            Page Not Found
          </h2>
          <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-md mx-auto mb-8">
            The page you are looking for does not exist or has been moved.
          </p>

          {/* ── Primary CTA buttons ── */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            {/* Go to Dashboard — primary gradient */}
            <button
              onClick={() => onNavigate && onNavigate('dashboard')}
              className="group relative inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm text-white overflow-hidden transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
              style={{
                background: 'linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%)',
                boxShadow: '0 0 20px rgba(6,182,212,0.35), 0 4px 16px rgba(0,0,0,0.3)',
              }}
            >
              {/* Shine sweep on hover */}
              <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
              <Home size={17} />
              Go to Dashboard
            </button>

            {/* Back to Landing — secondary ghost */}
            <button
              onClick={() => onNavigate && onNavigate('landing')}
              className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm text-cyan-400 border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 hover:border-cyan-400/50 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
              style={{
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              }}
            >
              <ArrowLeft size={17} />
              Back to Landing
            </button>
          </div>

          {/* ── Divider ── */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
            <span className="text-xs text-gray-600 uppercase tracking-widest font-medium">
              Quick Links
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
          </div>

          {/* ── Quick links grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {quickLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => onNavigate && onNavigate(link.id)}
                className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-800/60 bg-gray-900/40 hover:bg-gray-800/50 hover:border-cyan-500/25 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 text-center"
                style={{
                  boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
                }}
              >
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-lg text-cyan-400 group-hover:text-cyan-300 transition-colors duration-200"
                  style={{
                    background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(20,184,166,0.10))',
                    boxShadow: '0 0 12px rgba(6,182,212,0.15)',
                  }}
                >
                  {link.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white group-hover:text-cyan-100 transition-colors duration-200">
                    {link.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 group-hover:text-gray-400 transition-colors duration-200">
                    {link.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Educational disclaimer ── */}
        <p className="mt-6 text-center text-xs text-gray-600 leading-relaxed px-4">
          MarketPilot AI is an educational platform. All tools and analyses are for learning
          purposes only and do not constitute financial advice.
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;
