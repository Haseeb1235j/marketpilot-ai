import React, { useState, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Loader2,
} from 'lucide-react';

// ─── helpers ──────────────────────────────────────────────────────────────────

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const cloudConnected = Boolean(SUPABASE_URL && SUPABASE_URL.trim() !== '');

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── sub-components ───────────────────────────────────────────────────────────

function AnimatedBlobs() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      {/* large teal blob – top-left */}
      <div
        className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl
                   bg-gradient-to-br from-cyan-500 to-teal-600
                   animate-[pulse_6s_ease-in-out_infinite]"
      />
      {/* cyan blob – bottom-right */}
      <div
        className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full opacity-15 blur-3xl
                   bg-gradient-to-tl from-cyan-400 to-blue-600
                   animate-[pulse_8s_ease-in-out_infinite_1s]"
      />
      {/* small accent – center */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                   w-[300px] h-[300px] rounded-full opacity-10 blur-2xl
                   bg-gradient-to-r from-teal-400 to-cyan-500
                   animate-[pulse_10s_ease-in-out_infinite_2s]"
      />
      {/* subtle chart-line shimmer */}
      <svg
        className="absolute inset-0 w-full h-full opacity-5"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <polyline
          points="0,700 200,580 400,620 600,400 800,440 1000,280 1200,320 1440,180"
          fill="none"
          stroke="url(#chartGrad)"
          strokeWidth="2"
        />
        <defs>
          <linearGradient id="chartGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function Logo() {
  return (
    <div className="flex flex-col items-center gap-3 mb-8">
      {/* M icon */}
      <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl
                      bg-gradient-to-br from-cyan-400 to-teal-500 shadow-lg shadow-cyan-500/40">
        <span className="text-2xl font-black text-slate-900 tracking-tighter select-none">M</span>
        <Sparkles
          size={13}
          className="absolute -top-1.5 -right-1.5 text-cyan-200 drop-shadow-md"
        />
      </div>
      {/* title */}
      <div className="text-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400
                        bg-clip-text text-transparent leading-tight">
          MarketPilot AI
        </h1>
        <p className="text-xs text-slate-400 mt-0.5 tracking-wide">
          Your AI-powered trading education platform
        </p>
      </div>
    </div>
  );
}

function InputField({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  icon: Icon,
  error,
  rightElement,
  autoComplete,
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-slate-400 tracking-wide uppercase">
        {label}
      </label>
      <div className="relative">
        <Icon
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
        />
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full bg-slate-800/60 border ${
            error ? 'border-red-500/70' : 'border-slate-700/60'
          } rounded-xl pl-9 pr-${rightElement ? '10' : '4'} py-3 text-sm text-slate-100
            placeholder:text-slate-600 focus:outline-none focus:ring-2
            focus:ring-cyan-500/50 focus:border-cyan-500/70
            transition-all duration-200`}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
      {error && <p className="text-xs text-red-400 mt-0.5">{error}</p>}
    </div>
  );
}

function ErrorCard({ message }) {
  return (
    <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl
                    bg-red-500/10 border border-red-500/30">
      <ShieldAlert size={16} className="text-red-400 mt-0.5 shrink-0" />
      <p className="text-sm text-red-300 leading-snug">{message}</p>
    </div>
  );
}

function InfoNote({ message }) {
  return (
    <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl
                    bg-cyan-500/10 border border-cyan-500/25">
      <Sparkles size={15} className="text-cyan-400 mt-0.5 shrink-0" />
      <p className="text-sm text-cyan-300 leading-snug">{message}</p>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function LoginPage({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [globalError, setGlobalError] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // reset errors when switching modes
  useEffect(() => {
    setEmailError('');
    setPasswordError('');
    setConfirmError('');
    setGlobalError('');
    setShowForgot(false);
    setForgotSent(false);
  }, [mode]);

  // ── validation ───────────────────────────────────────────────────────────
  function validateForm() {
    let valid = true;

    if (!email.trim()) {
      setEmailError('Email is required.');
      valid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
      valid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Password is required.');
      valid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      valid = false;
    } else {
      setPasswordError('');
    }

    if (mode === 'register') {
      if (!confirmPassword) {
        setConfirmError('Please confirm your password.');
        valid = false;
      } else if (confirmPassword !== password) {
        setConfirmError('Passwords do not match.');
        valid = false;
      } else {
        setConfirmError('');
      }
    }

    return valid;
  }

  // ── demo mode ────────────────────────────────────────────────────────────
  function loginDemo() {
    const session = {
      mode: 'demo',
      user: 'Demo User',
      email: 'demo@marketpilot.ai',
      loginTime: Date.now(),
    };
    localStorage.setItem('mp_session', JSON.stringify(session));
    onLoginSuccess && onLoginSuccess(session);
  }

  // ── submit ───────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setGlobalError('');

    if (!validateForm()) return;

    if (!cloudConnected) {
      setGlobalError(
        'Cloud login is not connected yet. Please use Demo Mode to explore the platform.'
      );
      return;
    }

    setLoading(true);
    try {
      // Placeholder for real Supabase auth once env is wired up
      // const { error } = mode === 'login'
      //   ? await supabase.auth.signInWithPassword({ email, password })
      //   : await supabase.auth.signUp({ email, password });
      // if (error) throw error;

      // For now, simulate a brief async call then fall back to demo
      await new Promise((r) => setTimeout(r, 1200));
      setGlobalError('Auth provider not yet configured. Switching to Demo Mode…');
      setTimeout(loginDemo, 1000);
    } catch (err) {
      setGlobalError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ── forgot password ──────────────────────────────────────────────────────
  async function handleForgot(e) {
    e.preventDefault();
    if (!validateEmail(forgotEmail)) {
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setForgotSent(true);
  }

  // ─────────────────────────────────────────────────────────────────────────

  const isLogin = mode === 'login';

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center
                    bg-slate-950 px-4 py-10 overflow-hidden">
      <AnimatedBlobs />

      {/* glass card */}
      <div
        className="relative z-10 w-full max-w-md
                   bg-slate-900/70 backdrop-blur-xl
                   border border-slate-700/50
                   rounded-3xl shadow-2xl shadow-cyan-900/20
                   px-6 sm:px-8 py-8
                   ring-1 ring-inset ring-white/5"
      >
        {/* top cyan glow line */}
        <div className="absolute inset-x-12 -top-px h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />

        <Logo />

        {/* cloud not connected note */}
        {!cloudConnected && (
          <div className="mb-5">
            <InfoNote message="Cloud login is not connected yet. Continue in Demo Mode to explore all features." />
          </div>
        )}

        {/* mode tabs */}
        <div className="flex gap-1 p-1 mb-6 bg-slate-800/60 rounded-xl border border-slate-700/40">
          {['login', 'register'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200
                ${
                  mode === m
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-900 shadow-md shadow-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              {m === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* ── main form ── */}
        {!showForgot ? (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {globalError && <ErrorCard message={globalError} />}

            <InputField
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              icon={Mail}
              error={emailError}
              autoComplete="email"
            />

            <InputField
              id="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={Lock}
              error={passwordError}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            {/* confirm password – register only */}
            {!isLogin && (
              <InputField
                id="confirmPassword"
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                icon={Lock}
                error={confirmError}
                autoComplete="new-password"
              />
            )}

            {/* forgot password link */}
            {isLogin && (
              <div className="flex justify-end -mt-1">
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 flex items-center justify-center gap-2
                         w-full py-3 rounded-xl font-semibold text-sm text-slate-900
                         bg-gradient-to-r from-cyan-400 to-teal-400
                         hover:from-cyan-300 hover:to-teal-300
                         disabled:opacity-60 disabled:cursor-not-allowed
                         shadow-lg shadow-cyan-500/30
                         transition-all duration-200 active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        ) : (
          /* ── forgot password panel ── */
          <form onSubmit={handleForgot} noValidate className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-1">
              <button
                type="button"
                onClick={() => { setShowForgot(false); setForgotSent(false); }}
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                ← Back to Sign In
              </button>
            </div>

            <p className="text-sm text-slate-300">
              Enter your email and we'll send you a reset link.
            </p>

            {forgotSent ? (
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl
                              bg-teal-500/10 border border-teal-500/30">
                <Sparkles size={15} className="text-teal-400 mt-0.5 shrink-0" />
                <p className="text-sm text-teal-300">
                  Reset link sent! Check your inbox (and spam folder).
                </p>
              </div>
            ) : (
              <>
                <InputField
                  id="forgotEmail"
                  label="Email"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="you@example.com"
                  icon={Mail}
                  autoComplete="email"
                />
                <button
                  type="submit"
                  disabled={loading || !validateEmail(forgotEmail)}
                  className="flex items-center justify-center gap-2
                             w-full py-3 rounded-xl font-semibold text-sm text-slate-900
                             bg-gradient-to-r from-cyan-400 to-teal-400
                             hover:from-cyan-300 hover:to-teal-300
                             disabled:opacity-50 disabled:cursor-not-allowed
                             shadow-lg shadow-cyan-500/30
                             transition-all duration-200 active:scale-[0.98]"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Send Reset Link'}
                </button>
              </>
            )}
          </form>
        )}

        {/* divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-slate-700/60" />
          <span className="text-xs text-slate-600 select-none">or</span>
          <div className="flex-1 h-px bg-slate-700/60" />
        </div>

        {/* demo mode button */}
        <button
          type="button"
          onClick={loginDemo}
          className="w-full flex items-center justify-center gap-2
                     py-3 rounded-xl text-sm font-semibold
                     text-cyan-400 border border-cyan-500/30
                     bg-cyan-500/5 hover:bg-cyan-500/15 hover:border-cyan-400/50
                     transition-all duration-200 active:scale-[0.98]
                     shadow-sm"
        >
          <Sparkles size={15} />
          Continue in Demo Mode
        </button>

        {/* educational disclaimer */}
        <p className="mt-6 text-center text-xs text-slate-600 leading-relaxed px-2">
          MarketPilot AI is an{' '}
          <span className="text-slate-500 font-medium">educational platform only</span>. Nothing
          here constitutes financial advice. All data and simulations are for learning purposes.
          Trade at your own risk.
        </p>
      </div>

      {/* below-card tagline */}
      <p className="relative z-10 mt-5 text-xs text-slate-700 text-center">
        © {new Date().getFullYear()} MarketPilot AI · Built for learners, not traders
      </p>
    </div>
  );
}
