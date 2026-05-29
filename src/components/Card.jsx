import React from 'react';

export function Card({ children, className = '', glow = false, ...props }) {
  return (
    <div
      className={`glass-card rounded-xl overflow-hidden p-5 flex flex-col ${glow ? 'glow-cyan' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`mb-4 flex items-center justify-between border-b border-darkBorder/40 pb-3 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3 className={`text-lg font-semibold text-white flex items-center gap-2 ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '', ...props }) {
  return (
    <p className={`text-xs text-slate-400 mt-1 ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`flex-1 text-sm text-slate-300 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={`mt-4 pt-3 border-t border-darkBorder/40 flex items-center justify-end ${className}`} {...props}>
      {children}
    </div>
  );
}
