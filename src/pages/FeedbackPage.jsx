import React, { useState } from 'react';
import {
  Send,
  MessageSquare,
  Bug,
  Lightbulb,
  Database,
  AlertCircle,
  CheckCircle2,
  Mail,
  ExternalLink,
} from 'lucide-react';

// ─── Feedback types ───────────────────────────────────────────────────────────
const FEEDBACK_TYPES = [
  {
    id: 'Bug Report',
    label: 'Bug Report',
    icon: Bug,
    color: 'text-red-400',
    activeBg: 'bg-red-500/15 border-red-500/50',
    activeText: 'text-red-300',
  },
  {
    id: 'Feature Request',
    label: 'Feature Request',
    icon: Lightbulb,
    color: 'text-yellow-400',
    activeBg: 'bg-yellow-500/15 border-yellow-500/50',
    activeText: 'text-yellow-300',
  },
  {
    id: 'Data Issue',
    label: 'Data Issue',
    icon: Database,
    color: 'text-blue-400',
    activeBg: 'bg-blue-500/15 border-blue-500/50',
    activeText: 'text-blue-300',
  },
  {
    id: 'Analysis Issue',
    label: 'Analysis Issue',
    icon: AlertCircle,
    color: 'text-orange-400',
    activeBg: 'bg-orange-500/15 border-orange-500/50',
    activeText: 'text-orange-300',
  },
  {
    id: 'Suggestion',
    label: 'Suggestion',
    icon: MessageSquare,
    color: 'text-cyan-400',
    activeBg: 'bg-cyan-500/15 border-cyan-500/50',
    activeText: 'text-cyan-300',
  },
];

// ─── What helps list ──────────────────────────────────────────────────────────
const HELPFUL_ITEMS = [
  'Chart accuracy issues',
  'Tool explanations & clarity',
  'UI improvements & usability',
  'Educational content quality',
  'Bug reports with steps to reproduce',
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FeedbackPage() {
  const [selectedType, setSelectedType] = useState('Bug Report');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [mailtoFailed, setMailtoFailed] = useState(false);
  const [errors, setErrors] = useState({});

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    if (!message.trim()) {
      newErrors.message = 'Message is required.';
    } else if (message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters.';
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit handler ──────────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const subject = encodeURIComponent(`MarketPilot AI [${selectedType}]`);
    const body = encodeURIComponent(
      email
        ? `${message}\n\n---\nReply to: ${email}`
        : message
    );
    const mailtoHref = `mailto:feedback@marketpilot.ai?subject=${subject}&body=${body}`;

    // Attempt to open mailto
    try {
      const link = document.createElement('a');
      link.href = mailtoHref;
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSubmitted(true);
      setMailtoFailed(false);
    } catch {
      setSubmitted(true);
      setMailtoFailed(true);
    }
  };

  // ── Copy to clipboard ───────────────────────────────────────────────────────
  const handleCopy = () => {
    const text = `Type: ${selectedType}\n\n${message}${email ? `\n\nReply to: ${email}` : ''}`;
    navigator.clipboard.writeText(text).catch(() => {});
  };

  const handleReset = () => {
    setSubmitted(false);
    setMailtoFailed(false);
    setMessage('');
    setEmail('');
    setSelectedType('Bug Report');
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* ── Background decorations ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-teal-500/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/3 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">

        {/* ── Page header ── */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-2xl bg-cyan-500/10 p-4 ring-1 ring-cyan-500/20">
            <MessageSquare className="h-8 w-8 text-cyan-400" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Feedback &amp;{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Contact
            </span>
          </h1>
          <p className="mt-3 text-lg text-gray-400">
            Help us improve MarketPilot AI
          </p>
        </div>

        {/* ── Two-column layout ── */}
        <div className="grid gap-8 lg:grid-cols-3">

          {/* ────────────────── LEFT: Form ────────────────── */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md sm:p-8">

              {!submitted ? (
                <form onSubmit={handleSubmit} noValidate>

                  {/* Feedback type selector */}
                  <div className="mb-7">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
                      Feedback Type
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
                      {FEEDBACK_TYPES.map((type) => {
                        const Icon = type.icon;
                        const isActive = selectedType === type.id;
                        return (
                          <button
                            type="button"
                            key={type.id}
                            onClick={() => setSelectedType(type.id)}
                            className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-3 text-xs font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/60 ${
                              isActive
                                ? `${type.activeBg} ${type.activeText} shadow-lg`
                                : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:bg-white/10 hover:text-gray-200'
                            }`}
                          >
                            <Icon
                              className={`h-5 w-5 ${isActive ? type.activeText : type.color}`}
                            />
                            <span className="text-center leading-tight">
                              {type.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Message textarea */}
                  <div className="mb-5">
                    <label
                      htmlFor="feedback-message"
                      className="mb-2 block text-sm font-semibold text-gray-300"
                    >
                      Message{' '}
                      <span className="text-cyan-400">*</span>
                    </label>
                    <textarea
                      id="feedback-message"
                      rows={6}
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        if (errors.message) setErrors((prev) => ({ ...prev, message: undefined }));
                      }}
                      placeholder={`Describe your ${selectedType.toLowerCase()}…`}
                      className={`w-full resize-none rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 backdrop-blur-sm transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
                        errors.message
                          ? 'border-red-500/60 focus:border-red-500/80'
                          : 'border-white/10 focus:border-cyan-500/40'
                      }`}
                    />
                    {errors.message && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
                        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                        {errors.message}
                      </p>
                    )}
                    <p className="mt-1.5 text-right text-xs text-gray-600">
                      {message.length} chars
                      {message.length > 0 && message.length < 10 && (
                        <span className="ml-1 text-orange-400">
                          (min 10)
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Email input */}
                  <div className="mb-7">
                    <label
                      htmlFor="feedback-email"
                      className="mb-2 block text-sm font-semibold text-gray-300"
                    >
                      Your email{' '}
                      <span className="font-normal text-gray-500">
                        (optional, for follow-up)
                      </span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <input
                        id="feedback-email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                        }}
                        placeholder="you@example.com"
                        className={`w-full rounded-xl border bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 backdrop-blur-sm transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
                          errors.email
                            ? 'border-red-500/60 focus:border-red-500/80'
                            : 'border-white/10 focus:border-cyan-500/40'
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
                        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all duration-200 hover:from-cyan-400 hover:to-teal-400 hover:shadow-cyan-500/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/60 active:scale-[0.98]"
                  >
                    <Send className="h-4 w-4" />
                    Send Feedback via Email
                  </button>

                  <p className="mt-3 text-center text-xs text-gray-600">
                    This will open your default email client to complete sending.
                  </p>
                </form>
              ) : (
                /* ── Success state ── */
                <div className="flex flex-col items-center py-6 text-center">
                  <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30">
                    <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                  </div>
                  <h2 className="mb-2 text-2xl font-bold text-white">Thanks!</h2>

                  {!mailtoFailed ? (
                    <>
                      <p className="mb-6 max-w-md text-gray-400">
                        Your feedback is ready to send. Your email client will open
                        to complete sending. If it didn&apos;t open, use the copy
                        option below.
                      </p>
                      <div className="mb-6 w-full rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-left">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                          Sending to
                        </p>
                        <p className="font-mono text-sm text-gray-300">
                          feedback@marketpilot.ai
                        </p>
                        <p className="mt-2 text-xs text-gray-500">
                          Subject: MarketPilot AI [{selectedType}]
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="mb-4 max-w-md text-gray-400">
                        It looks like your email client isn&apos;t available right now.
                        Copy your feedback below and send it manually.
                      </p>
                      <div className="mb-6 w-full rounded-xl border border-orange-500/20 bg-orange-500/10 p-4 text-left">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-orange-400">
                          Send this to
                        </p>
                        <p className="font-mono text-sm text-gray-300">
                          feedback@marketpilot.ai
                        </p>
                        <p className="mt-3 whitespace-pre-wrap text-sm text-gray-300">
                          {message}
                          {email ? `\n\nReply to: ${email}` : ''}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="mb-4 flex items-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-5 py-2.5 text-sm font-medium text-orange-300 transition-colors hover:bg-orange-500/20"
                      >
                        Copy Feedback Text
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-white/10 hover:text-gray-200"
                  >
                    Submit Another Feedback
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ────────────────── RIGHT: Info panel ────────────────── */}
          <div className="flex flex-col gap-5">

            {/* What helps card */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-cyan-400">
                <Lightbulb className="h-4 w-4" />
                What kind of feedback helps?
              </h3>
              <ul className="space-y-2.5">
                {HELPFUL_ITEMS.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-400">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Response time card */}
            <div className="rounded-2xl border border-teal-500/20 bg-teal-500/5 p-6 shadow-xl backdrop-blur-md">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/15">
                  <CheckCircle2 className="h-4 w-4 text-teal-400" />
                </div>
                <h3 className="text-sm font-bold text-teal-300">Response Time</h3>
              </div>
              <p className="text-sm leading-relaxed text-gray-400">
                We aim to review all feedback within{' '}
                <span className="font-semibold text-teal-300">48 hours</span>.
                High-impact bug reports may be addressed sooner.
              </p>
            </div>

            {/* Contact / Social card */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-400">
                <Mail className="h-4 w-4" />
                Direct Contact
              </h3>
              <div className="space-y-3">
                <a
                  href="mailto:feedback@marketpilot.ai"
                  className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-300 transition-colors hover:border-cyan-500/30 hover:bg-cyan-500/5 hover:text-cyan-300"
                >
                  <Mail className="h-4 w-4 text-cyan-400" />
                  feedback@marketpilot.ai
                  <ExternalLink className="ml-auto h-3.5 w-3.5 text-gray-600" />
                </a>
                <a
                  href="#"
                  className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-500 transition-colors hover:border-white/20 hover:text-gray-400"
                  aria-label="Twitter / X (coming soon)"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Twitter / X
                  <span className="ml-auto text-xs text-gray-600">soon</span>
                </a>
                <a
                  href="#"
                  className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-500 transition-colors hover:border-white/20 hover:text-gray-400"
                  aria-label="Discord community (coming soon)"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.004.048.027.094.057.12a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                  Discord Community
                  <span className="ml-auto text-xs text-gray-600">soon</span>
                </a>
              </div>
            </div>

          </div>
          {/* end right panel */}
        </div>
        {/* end grid */}

      </div>
    </div>
  );
}
