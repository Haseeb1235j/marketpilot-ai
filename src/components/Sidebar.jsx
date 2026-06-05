import React from 'react';
import {
  BarChart3, Sparkles, Compass, Calculator, ShieldAlert, X, Menu,
  Home, TrendingUp, DollarSign, MessageSquare, Settings, FileText
} from 'lucide-react';

export default function Sidebar({
  activeSection,
  setActiveSection,
  isOpen,
  setIsOpen,
  userBadge = null,
  className = ''
}) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, section: 'main' },
    { id: 'scan', label: 'AI Chart Scan', icon: BarChart3, section: 'main' },
    { id: 'chat', label: 'AI Chat Assistant', icon: Sparkles, section: 'main' },
    { id: 'directory', label: '50+ Tools Directory', icon: Compass, section: 'main' },
    { id: 'suite', label: 'Interactive Suite', icon: Calculator, section: 'main' },
    { id: 'reports', label: 'Reports', icon: FileText, section: 'more' },
    { id: 'pricing', label: 'Pricing', icon: DollarSign, section: 'more' },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare, section: 'more' },
    { id: 'compliance', label: 'Compliance', icon: ShieldAlert, section: 'more' },
    { id: 'settings', label: 'Settings', icon: Settings, section: 'more' },
  ];

  const mainItems = menuItems.filter(m => m.section === 'main');
  const moreItems = menuItems.filter(m => m.section === 'more');

  const handleNav = (id) => {
    setActiveSection(id);
    setIsOpen(false);
  };

  const NavItem = ({ item }) => {
    const Icon = item.icon;
    const isActive = activeSection === item.id;
    return (
      <button
        key={item.id}
        onClick={() => handleNav(item.id)}
        className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer text-left ${
          isActive
            ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-500 shadow-inner'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border-l-2 border-transparent'
        }`}
      >
        <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
        <span className="truncate">{item.label}</span>
        {item.id === 'pricing' && (
          <span className="ml-auto text-[8px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">Soon</span>
        )}
      </button>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0a0f1d] border-r border-darkBorder text-slate-300 select-none">
      {/* Brand */}
      <div className="p-5 border-b border-darkBorder/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center font-black text-white text-sm shadow-lg shadow-cyan-950/40">
            M
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-none tracking-tight">MarketPilot AI</h1>
            <span className="text-[9px] text-slate-500 font-semibold tracking-wider uppercase">Educational Suite</span>
          </div>
        </div>
        {isOpen && (
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* User badge */}
      {userBadge && (
        <div className="px-4 pt-3 pb-0">
          <div className="flex items-center gap-2 bg-slate-900/60 border border-darkBorder/40 rounded-xl px-3 py-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
              {userBadge.user ? userBadge.user[0].toUpperCase() : 'D'}
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-white truncate">{userBadge.user || 'Demo User'}</div>
              <div className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">
                {userBadge.mode === 'demo' ? 'Demo Mode' : 'Cloud Login'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="text-[9px] text-slate-600 font-bold uppercase tracking-widest px-4 pb-1.5">Main</div>
        {mainItems.map(item => <NavItem key={item.id} item={item} />)}

        <div className="text-[9px] text-slate-600 font-bold uppercase tracking-widest px-4 pt-4 pb-1.5">More</div>
        {moreItems.map(item => <NavItem key={item.id} item={item} />)}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-darkBorder/40">
        <div className="text-center">
          <p className="text-[10px] text-slate-500 font-medium">v1.0.0 (Stable)</p>
          <p className="text-[9px] text-slate-600 mt-0.5">Educational platform. Not financial advice.</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside className={`hidden md:block w-60 h-full shrink-0 ${className}`}>
        {sidebarContent}
      </aside>

      {/* Mobile Overlay Drawer */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          onClick={() => setIsOpen(false)}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />
        <div
          className={`absolute top-0 left-0 w-64 h-full transform transition-transform duration-300 ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          } shadow-2xl pointer-events-auto`}
        >
          {sidebarContent}
        </div>
      </div>
    </>
  );
}
