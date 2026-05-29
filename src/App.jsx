import React, { useState, useEffect } from 'react';
import { Menu, ShieldAlert } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ChartScanPage from './pages/ChartScanPage';
import ChatAssistantPage from './pages/ChatAssistantPage';
import ToolsDirectoryPage from './pages/ToolsDirectoryPage';
import InteractiveSuitePage from './pages/InteractiveSuitePage';
import ComplianceWarningsPage from './pages/ComplianceWarningsPage';
import Button from './components/Button';

export default function App() {
  // Page routing
  const [activeSection, setActiveSection] = useState(() => {
    return localStorage.getItem('mp_active_section') || 'scan';
  });

  // Mobile sidebar visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Shared application state persisted across reloads
  const [selectedSymbol, setSelectedSymbol] = useState(() => {
    const saved = localStorage.getItem('mp_symbol') || 'BTC/USDT';
    const upper = saved.toUpperCase().trim();
    if (upper === 'BTC/USD' || upper === 'BTCUSD') return 'BTC/USDT';
    if (upper === 'ETH/USD' || upper === 'ETHUSD') return 'ETH/USDT';
    if (upper === 'BNB/USD' || upper === 'BNBUSD') return 'BNB/USDT';
    if (upper === 'SOL/USD' || upper === 'SOLUSD') return 'SOL/USDT';
    if (upper === 'XRP/USD' || upper === 'XRPUSD') return 'XRP/USDT';
    if (upper === 'DOGE/USD' || upper === 'DOGEUSD') return 'DOGE/USDT';
    if (upper === 'ADA/USD' || upper === 'ADAUSD') return 'ADA/USDT';
    if (upper === 'AVAX/USD' || upper === 'AVAXUSD') return 'AVAX/USDT';
    if (upper === 'DOT/USD' || upper === 'DOTUSD') return 'DOT/USDT';
    if (upper === 'MATIC/USD' || upper === 'MATICUSD') return 'MATIC/USDT';
    return saved;
  });
  const [selectedTimeframe, setSelectedTimeframe] = useState(() => {
    return localStorage.getItem('mp_timeframe') || '1h';
  });
  const [selectedTool, setSelectedTool] = useState(() => {
    return localStorage.getItem('mp_tool') || 'rsi';
  });

  // Keep routing persisted
  useEffect(() => {
    localStorage.setItem('mp_active_section', activeSection);
  }, [activeSection]);

  // Page renderer router mapping
  const renderContent = () => {
    switch (activeSection) {
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
      case 'compliance':
        return <ComplianceWarningsPage />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            Educational module template.
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col w-screen h-screen bg-[#060911] text-slate-200 overflow-hidden font-sans">
      
      {/* 1. Sticky Safety Banner */}
      <header className="sticky top-0 z-50 w-full bg-[#080d19]/95 border-b border-darkBorder/60 backdrop-blur-md select-none">
        <div className="px-4 py-2 flex items-center justify-center gap-2 text-center text-[10px] md:text-xs font-semibold text-cyan-400">
          <ShieldAlert className="w-4 h-4 shrink-0 text-cyan-400" />
          <span>
            Educational Platform: Technical overlays and calculations are simulated for study. This is not financial advice or a trading signal.
          </span>
        </div>
      </header>

      {/* 2. Main Dashboard frame container */}
      <div className="flex flex-1 min-h-0 w-full relative">
        
        {/* Mobile Header Bar */}
        <div className="absolute md:hidden top-3 right-4 z-30 flex items-center gap-2.5">
          <Button
            variant="glass"
            size="sm"
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 border-darkBorder/60 text-slate-400 bg-slate-950/80 hover:text-white"
          >
            <Menu className="w-4 h-4" />
          </Button>
        </div>

        {/* Responsive Left Sidebar */}
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />

        {/* 3. Main content workspace area */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#070b14] h-full overflow-y-auto scroll-smooth relative">
          
          {/* Dashboard Section Title (Visible on mobile for navigation clarity) */}
          <div className="md:hidden px-4 pt-3 pb-1 border-b border-darkBorder/30 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {activeSection === 'scan' ? 'AI Chart Scan' :
               activeSection === 'chat' ? 'AI Chat Assistant' :
               activeSection === 'directory' ? '50+ Tools Directory' :
               activeSection === 'suite' ? 'Interactive Suite' :
               'Compliance Warnings'}
            </span>
          </div>

          <div className="flex-1 w-full flex flex-col">
            {renderContent()}
          </div>
        </main>

      </div>
    </div>
  );
}
