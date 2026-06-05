import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Menu, ShieldAlert, X } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Button from './components/Button';

// Lazy-loaded pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ChartScanPage = lazy(() => import('./pages/ChartScanPage'));
const ChatAssistantPage = lazy(() => import('./pages/ChatAssistantPage'));
const ToolsDirectoryPage = lazy(() => import('./pages/ToolsDirectoryPage'));
const InteractiveSuitePage = lazy(() => import('./pages/InteractiveSuitePage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'));
const ComplianceWarningsPage = lazy(() => import('./pages/ComplianceWarningsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Loading fallback
function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4">
      <div className="w-10 h-10 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin" />
      <span className="text-xs text-slate-500 font-semibold">Loading...</span>
    </div>
  );
}

// Page title map
const PAGE_TITLES = {
  dashboard: 'Dashboard',
  scan: 'AI Chart Scan',
  chat: 'AI Chat Assistant',
  directory: '50+ Tools Directory',
  suite: 'Interactive Suite',
  reports: 'Reports & Export',
  pricing: 'Pricing',
  feedback: 'Feedback & Contact',
  compliance: 'Compliance & Disclaimer',
  settings: 'Settings',
};

export default function App() {
  // ─── Auth State ──────────────────────────────────────────────────────────
  const [appView, setAppView] = useState(() => {
    // 'landing' | 'login' | 'app'
    const session = localStorage.getItem('mp_session');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        if (parsed && parsed.mode) return 'app';
      } catch {
        localStorage.removeItem('mp_session');
      }
    }
    return 'landing';
  });

  const [activeSession, setActiveSession] = useState(() => {
    const session = localStorage.getItem('mp_session');
    if (session) {
      try { return JSON.parse(session); } catch { return null; }
    }
    return null;
  });

  // ─── Routing State ────────────────────────────────────────────────────────
  const [activeSection, setActiveSection] = useState(() => {
    return localStorage.getItem('mp_active_section') || 'dashboard';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ─── Shared Chart State ───────────────────────────────────────────────────
  const [selectedSymbol, setSelectedSymbol] = useState(() => {
    return localStorage.getItem('mp_symbol') || 'BTC/USDT';
  });
  const [selectedTimeframe, setSelectedTimeframe] = useState(() => {
    return localStorage.getItem('mp_timeframe') || '1h';
  });
  const [selectedTool, setSelectedTool] = useState(() => {
    return localStorage.getItem('mp_tool') || 'rsi';
  });

  // Persist section routing
  useEffect(() => {
    localStorage.setItem('mp_active_section', activeSection);
  }, [activeSection]);

  // ─── Auth Handlers ────────────────────────────────────────────────────────
  const handleLandingEnter = (targetSection = null) => {
    const session = localStorage.getItem('mp_session');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        if (parsed && parsed.mode) {
          setActiveSession(parsed);
          setAppView('app');
          if (targetSection) setActiveSection(targetSection);
          return;
        }
      } catch { /* fall through */ }
    }
    setAppView('login');
    if (targetSection) {
      localStorage.setItem('mp_pending_section', targetSection);
    }
  };

  const handleLoginSuccess = (session) => {
    setActiveSession(session);
    localStorage.setItem('mp_session', JSON.stringify(session));
    setAppView('app');
    const pending = localStorage.getItem('mp_pending_section');
    if (pending) {
      setActiveSection(pending);
      localStorage.removeItem('mp_pending_section');
    } else {
      setActiveSection('dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('mp_session');
    setActiveSession(null);
    setAppView('landing');
    setActiveSection('dashboard');
  };

  const handleNavigate = (sectionId) => {
    setActiveSection(sectionId);
  };

  // ─── Page Renderer ────────────────────────────────────────────────────────
  const renderPage = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <DashboardPage
            activeSession={activeSession}
            onNavigate={handleNavigate}
          />
        );
      case 'scan':
        return (
          <ChartScanPage
            selectedSymbol={selectedSymbol}
            setSelectedSymbol={setSelectedSymbol}
            selectedTimeframe={selectedTimeframe}
            setSelectedTimeframe={setSelectedTimeframe}
            selectedTool={selectedTool}
            setSelectedTool={setSelectedTool}
            onSwitchToChat={() => setActiveSection('chat')}
            onSwitchToDirectory={() => setActiveSection('directory')}
          />
        );
      case 'chat':
        return (
          <ChatAssistantPage
            selectedSymbol={selectedSymbol}
            selectedTimeframe={selectedTimeframe}
            selectedTool={selectedTool}
          />
        );
      case 'directory':
        return (
          <ToolsDirectoryPage
            setSelectedTool={setSelectedTool}
            setActiveSection={setActiveSection}
          />
        );
      case 'suite':
        return <InteractiveSuitePage />;
      case 'reports':
        return <ReportsPage />;
      case 'pricing':
        return <PricingPage />;
      case 'feedback':
        return <FeedbackPage />;
      case 'compliance':
        return <ComplianceWarningsPage />;
      case 'settings':
        return (
          <SettingsPage
            activeSession={activeSession}
            onLogout={handleLogout}
          />
        );
      default:
        return (
          <NotFoundPage
            onNavigate={handleNavigate}
          />
        );
    }
  };

  // ─── Landing View ─────────────────────────────────────────────────────────
  if (appView === 'landing') {
    return (
      <Suspense fallback={<PageLoader />}>
        <LandingPage onEnterApp={handleLandingEnter} />
      </Suspense>
    );
  }

  // ─── Login View ───────────────────────────────────────────────────────────
  if (appView === 'login') {
    return (
      <Suspense fallback={<PageLoader />}>
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      </Suspense>
    );
  }

  // ─── Main App View ────────────────────────────────────────────────────────
  const pageTitle = PAGE_TITLES[activeSection] || 'MarketPilot AI';
  const isDemo = activeSession?.mode === 'demo';

  return (
    <div className="flex flex-col w-screen h-screen bg-[#060911] text-slate-200 overflow-hidden font-sans">

      {/* ── Global Safety Banner ── */}
      <header className="sticky top-0 z-50 w-full bg-[#080d19]/95 border-b border-darkBorder/60 backdrop-blur-md select-none shrink-0">
        <div className="px-4 py-2 flex items-center justify-center gap-2 text-center text-[10px] md:text-xs font-semibold text-cyan-400">
          <ShieldAlert className="w-4 h-4 shrink-0 text-cyan-400" />
          <span>
            MarketPilot AI — Educational Chart Analysis Only. Not financial advice. No buy/sell signals.
          </span>
        </div>
      </header>

      {/* ── Main Shell ── */}
      <div className="flex flex-1 min-h-0 w-full relative">

        {/* Mobile hamburger */}
        <div className="absolute md:hidden top-3 left-4 z-30">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-xl bg-slate-950/80 border border-darkBorder/60 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Sidebar */}
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          userBadge={activeSession}
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#070b14] h-full overflow-y-auto scroll-smooth relative">

          {/* Top bar */}
          <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-2.5 bg-[#070b14]/95 border-b border-darkBorder/40 backdrop-blur-sm shrink-0">
            {/* Left: hamburger spacing + page title */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-6 md:w-0 shrink-0" /> {/* spacer for hamburger on mobile */}
              <h2 className="text-sm font-bold text-white truncate">{pageTitle}</h2>
            </div>

            {/* Right: badges */}
            <div className="flex items-center gap-2 shrink-0">
              {isDemo && (
                <span className="text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Demo Mode
                </span>
              )}
              <span className="text-[10px] font-bold bg-slate-900 border border-darkBorder/60 text-slate-500 px-2 py-0.5 rounded-full">
                v1.0.0
              </span>
              <button
                onClick={() => setActiveSection('settings')}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Page Content */}
          <div className="flex-1 w-full flex flex-col">
            <Suspense fallback={<PageLoader />}>
              {renderPage()}
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
