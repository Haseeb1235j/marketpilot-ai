import React from 'react';

export default function Badge({
  children,
  variant = 'cyan', // 'cyan' | 'emerald' | 'yellow' | 'red' | 'gray' | 'purple'
  className = '',
  ...props
}) {
  const variants = {
    cyan: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    yellow: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    red: "bg-red-500/10 text-red-400 border border-red-500/20",
    gray: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
    purple: "bg-purple-500/10 text-purple-400 border border-purple-500/20"
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
