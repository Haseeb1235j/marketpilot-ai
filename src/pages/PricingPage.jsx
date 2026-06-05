import React, { useState } from 'react';
import {
  CheckCircle2,
  Star,
  Shield,
  Zap,
  ShieldAlert,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';

// ─── FAQ Data ────────────────────────────────────────────────────────────────
const faqs = [
  {
    id: 1,
    question: 'Is this financial advice?',
    answer:
      'No. MarketPilot AI is strictly an educational platform. All chart analyses, AI scan reports, and technical indicators are provided solely for learning purposes. Nothing on this platform constitutes financial advice, investment recommendations, or trading signals. Always do your own research and consult a qualified financial advisor before making any trading or investment decisions.',
  },
  {
    id: 2,
    question: 'What crypto pairs are supported?',
    answer:
      'The Pro plan gives you access to 15+ Binance USDT pairs including BTC/USDT, ETH/USDT, BNB/USDT, SOL/USDT, ADA/USDT, XRP/USDT, DOGE/USDT, MATIC/USDT, AVAX/USDT, DOT/USDT, LINK/USDT, LTC/USDT, ATOM/USDT, UNI/USDT, and NEAR/USDT. More pairs will be added based on community demand after launch.',
  },
  {
    id: 3,
    question: 'When will Pro launch?',
    answer:
      'We are currently in the final stages of development and testing. The Pro plan is coming very soon! You can keep an eye on this page or follow our updates to be notified the moment it goes live. Early supporters will get priority access.',
  },
  {
    id: 4,
    question: 'How does billing work?',
    answer:
      'Once the Pro plan launches, billing will be handled securely via Razorpay — a trusted Indian payment gateway supporting UPI, debit/credit cards, and net banking. Your subscription will be billed monthly at ₹49/month (approx. $0.52/month). No payment information is required or collected at this time.',
  },
];

// ─── Comparison Data ──────────────────────────────────────────────────────────
const comparisonRows = [
  { feature: 'Chart Mode', free: 'Demo / Static', pro: 'Live Binance Feed' },
  { feature: 'AI Scan Analysis', free: 'Limited (3/day)', pro: 'Unlimited Scans' },
  { feature: 'Technical Tools', free: 'Basic (5 tools)', pro: 'All 50+ Tools' },
  { feature: 'Scenario Clarity Score', free: '—', pro: '✓ Included' },
  { feature: 'Video Breakdown', free: '—', pro: '✓ Narration Included' },
  { feature: 'Download Report (.txt)', free: '—', pro: '✓ Full Report' },
  { feature: 'Full View Chart Mode', free: '—', pro: '✓ Included' },
  { feature: 'Screenshot Reference', free: '—', pro: '✓ Included' },
  { feature: 'Crypto Pairs', free: '1 Pair Demo', pro: '15+ USDT Pairs' },
  { feature: 'Support', free: 'Community', pro: 'Priority Support' },
];

// ─── Pro Features List ────────────────────────────────────────────────────────
const proFeatures = [
  'Binance live crypto charts',
  'AI Scan Analysis Reports',
  '50+ educational technical tools',
  'Scenario clarity score cards',
  'Video Breakdown narration',
  'Download educational report (.txt)',
  'Full View chart mode',
  'Screenshot reference mode',
  'Educational-only chart study',
];

// ─── FAQ Item Component ───────────────────────────────────────────────────────
function FAQItem({ faq }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`rounded-xl border transition-all duration-300 overflow-hidden ${
        open
          ? 'border-cyan-500/50 bg-cyan-500/5'
          : 'border-white/10 bg-white/5 hover:border-white/20'
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left focus:outline-none group"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 min-w-0">
          <HelpCircle
            size={18}
            className={`flex-shrink-0 transition-colors duration-300 ${
              open ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400'
            }`}
          />
          <span
            className={`font-semibold text-sm sm:text-base transition-colors duration-300 ${
              open ? 'text-cyan-300' : 'text-slate-200 group-hover:text-white'
            }`}
          >
            {faq.question}
          </span>
        </div>
        <ChevronDown
          size={18}
          className={`flex-shrink-0 text-slate-400 transition-transform duration-300 ${
            open ? 'rotate-180 text-cyan-400' : ''
          }`}
        />
      </button>

      <div
        className={`transition-all duration-300 ease-in-out ${
          open ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="px-6 pb-5 text-sm text-slate-400 leading-relaxed pl-[3.25rem]">
          {faq.answer}
        </p>
      </div>
    </div>
  );
}

// ─── Main PricingPage Component ───────────────────────────────────────────────
export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      {/* ── Background decorative glows ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-0 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-20">

        {/* ═══════════════════════════════════════════════════════════════════
            HEADER
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-semibold uppercase tracking-widest mb-2">
            <Zap size={12} />
            MarketPilot AI
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            <span className="text-white">Pricing</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Simple, affordable access to educational chart analysis
          </p>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            PRO PLAN CARD
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="flex justify-center">
          <div className="relative w-full max-w-md">
            {/* Glow effect */}
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-cyan-500/40 via-teal-500/20 to-transparent blur-sm" />
            <div className="absolute -inset-4 rounded-3xl bg-cyan-500/10 blur-2xl pointer-events-none" />

            {/* Card */}
            <div className="relative rounded-2xl border border-cyan-500/40 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-800/80 backdrop-blur-xl shadow-2xl shadow-cyan-500/10 overflow-hidden">

              {/* Subtle top shimmer */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

              {/* Card inner */}
              <div className="p-8 space-y-7">

                {/* Badge + Plan name */}
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold uppercase tracking-wider">
                    <Star size={11} fill="currentColor" />
                    Most Popular
                  </div>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">
                    Pro Plan
                  </h2>
                  <p className="text-slate-400 text-sm">
                    Everything you need to learn crypto chart analysis at an educational level.
                  </p>
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-black text-white tracking-tight">₹49</span>
                    <span className="text-slate-400 text-lg font-medium mb-1">/month</span>
                  </div>
                  <p className="text-slate-500 text-xs flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-400/60" />
                    Approx. $0.52/month · Billed monthly
                  </p>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* Features */}
                <ul className="space-y-3">
                  {proFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle2
                        size={17}
                        className="text-cyan-400 flex-shrink-0 mt-0.5"
                      />
                      <span className="text-slate-300 text-sm leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* Coming Soon Button */}
                <div className="space-y-3">
                  <button
                    disabled
                    className="w-full py-3.5 px-6 rounded-xl border-2 border-emerald-500/50 bg-emerald-500/5 text-emerald-400 font-bold text-sm tracking-wide cursor-not-allowed opacity-80 flex items-center justify-center gap-2 transition-all"
                  >
                    <Zap size={15} />
                    Coming Soon — Stay Tuned
                  </button>
                  <p className="text-center text-xs text-slate-500">
                    No payment info required now
                  </p>
                </div>

                {/* Razorpay note */}
                <div className="flex items-center justify-center gap-2 pt-1">
                  <Shield size={13} className="text-slate-500" />
                  <p className="text-xs text-slate-500 text-center">
                    Payments powered by{' '}
                    <span className="text-slate-400 font-semibold">Razorpay</span>{' '}
                    — Coming Soon
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            COMPARISON TABLE
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Free vs{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">
                Pro
              </span>
            </h2>
            <p className="text-slate-500 text-sm">
              See what's included in each plan
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-3 bg-white/5 border-b border-white/10">
              <div className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                Feature
              </div>
              <div className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center border-l border-white/10">
                Free
              </div>
              <div className="px-5 py-4 text-xs font-bold text-cyan-400 uppercase tracking-widest text-center border-l border-white/10 flex items-center justify-center gap-1.5">
                <Star size={11} fill="currentColor" className="text-amber-400" />
                Pro
              </div>
            </div>

            {/* Table rows */}
            {comparisonRows.map((row, idx) => (
              <div
                key={row.feature}
                className={`grid grid-cols-3 border-b border-white/5 transition-colors hover:bg-white/[0.02] ${
                  idx === comparisonRows.length - 1 ? 'border-b-0' : ''
                }`}
              >
                <div className="px-5 py-3.5 text-sm text-slate-300 font-medium">
                  {row.feature}
                </div>
                <div className="px-5 py-3.5 text-sm text-slate-500 text-center border-l border-white/5">
                  {row.free}
                </div>
                <div className="px-5 py-3.5 text-sm text-cyan-300 text-center border-l border-white/5 font-medium">
                  {row.pro}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            FAQ SECTION
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Frequently Asked{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">
                Questions
              </span>
            </h2>
            <p className="text-slate-500 text-sm">
              Everything you need to know about MarketPilot AI
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <FAQItem key={faq.id} faq={faq} />
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            EDUCATIONAL DISCLAIMER CARD
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 backdrop-blur p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center">
              <ShieldAlert size={18} className="text-red-400" />
            </div>
            <h3 className="text-red-300 font-bold text-base">
              Educational Disclaimer
            </h3>
          </div>
          <p className="text-red-200/70 text-sm leading-relaxed">
            <strong className="text-red-300 font-semibold">
              MarketPilot AI is an educational platform only.
            </strong>{' '}
            All content, analyses, AI-generated reports, technical indicators, and chart breakdowns
            are intended exclusively for learning and educational purposes. Nothing provided on this
            platform should be construed as financial advice, investment advice, or trading signals
            of any kind. Cryptocurrency trading involves substantial risk of loss. Past educational
            examples do not guarantee future results. Always consult a licensed financial advisor
            before making any financial decisions.
          </p>
          <div className="h-px bg-red-500/10" />
          <p className="text-red-300/50 text-xs">
            By using MarketPilot AI, you acknowledge that you are using this platform solely for
            educational purposes and that no financial advice is being provided.
          </p>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            FOOTER NOTE
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="text-center space-y-2 pb-4">
          <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
            <Shield size={12} />
            <span>
              Payments powered by{' '}
              <span className="text-slate-400 font-semibold">Razorpay</span> — Coming Soon.
              No payment info required now.
            </span>
          </div>
          <p className="text-slate-600 text-xs">
            © {new Date().getFullYear()} MarketPilot AI · Educational Platform
          </p>
        </div>

      </div>
    </div>
  );
}
