import React from 'react';
import { Menu, X, ShieldAlert, Sparkles, Compass, HelpCircle, BarChart3, Calculator } from 'lucide-react';
import Button from './Button';

export default function Sidebar({
  activeSection,
  setActiveSection,
  isOpen,
  setIsOpen,
  className = ''
}) {
  const menuItems = [
    { id: 'scan', label: 'AI Chart Scan', icon: BarChart3 },
    { id: 'chat', label: 'AI Chat Assistant', icon: Sparkles },
    { id: 'directory', label: '50+ Tools Directory', icon: Compass },
    { id: 'suite', label: 'Interactive Suite', icon: Calculator },
    { id: 'compliance', label: 'Compliance Warnings', icon: ShieldAlert },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0a0f1d] border-r border-darkBorder text-slate-300">
      {/* Brand Header */}
      <div className="p-6 border-b border-darkBorder/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-950/40">
            M
          </div>
          <div>
            <h1 className="text-md font-bold text-white leading-none tracking-tight">MarketPilot AI</h1>
            <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Educational Suite</span>
          </div>
        </div>
        {isOpen && (
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="md:hidden p-1">
            <X className="w-5 h-5 text-slate-400" />
          </Button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                setIsOpen(false); // Close mobile drawer
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-500 shadow-inner'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 hover:border-l-2 hover:border-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-5 border-t border-darkBorder/40 text-center">
        <p className="text-[10px] text-slate-500 font-medium">v1.0.0 (Stable MVP)</p>
        <p className="text-[9px] text-slate-600 mt-1 select-none">Technical study platform. Simulated calculations.</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className={`hidden md:block w-60 h-full shrink-0 ${className}`}>
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <div className={`fixed inset-0 z-40 md:hidden pointer-events-none transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0'}`}>
        {/* Mobile Backdrop */}
        <div 
          onClick={() => setIsOpen(false)} 
          className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
        />
        {/* Drawer Panel */}
        <div className={`absolute top-0 left-0 w-60 h-full transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} pointer-events-auto shadow-2xl`}>
          {sidebarContent}
        </div>
      </div>
    </>
  );
}
