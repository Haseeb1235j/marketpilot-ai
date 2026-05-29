import React from 'react';

export default function Select({
  label,
  options = [], // [{ value, label }] or [strings]
  error,
  className = '',
  id,
  ...props
}) {
  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-400 select-none">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`w-full bg-slate-950 border text-slate-200 text-sm rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 px-3 py-2 cursor-pointer transition-all duration-200 ${
          error ? 'border-red-500/80 focus:border-red-500 focus:ring-red-500' : 'border-darkBorder/80'
        }`}
        {...props}
      >
        {options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const lbl = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={val} value={val} className="bg-slate-900 text-slate-200">
              {lbl}
            </option>
          );
        })}
      </select>
      {error && <span className="text-[11px] text-red-400 font-medium">{error}</span>}
    </div>
  );
}
