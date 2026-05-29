import React from 'react';

export default function Input({
  label,
  error,
  icon: Icon,
  className = '',
  id,
  type = 'text',
  ...props
}) {
  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-400 select-none">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-slate-500 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          type={type}
          id={id}
          className={`w-full bg-slate-950 border text-slate-200 text-sm rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-200 ${
            Icon ? 'pl-10' : 'pl-3.5'
          } pr-3.5 py-2 ${error ? 'border-red-500/80 focus:border-red-500 focus:ring-red-500' : 'border-darkBorder/80'}`}
          {...props}
        />
      </div>
      {error && <span className="text-[11px] text-red-400 font-medium">{error}</span>}
    </div>
  );
}
