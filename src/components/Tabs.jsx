import React from 'react';

export default function Tabs({
  tabs = [], // [{ value, label, icon }]
  activeTab,
  onChange,
  className = '',
  ...props
}) {
  return (
    <div className={`flex border-b border-darkBorder/40 overflow-x-auto ${className}`} {...props}>
      {tabs.map((tab) => {
        const val = tab.value;
        const isActive = val === activeTab;
        const Icon = tab.icon;
        
        return (
          <button
            key={val}
            onClick={() => onChange(val)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap ${
              isActive
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
